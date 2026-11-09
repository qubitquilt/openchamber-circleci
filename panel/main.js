"use strict";(()=>{var Ce=class extends Error{status;code;constructor(o,t,r){super(r),this.name="CircleCIError",this.status=o,this.code=t}},ws="/api/v3",ft=20,Wt=20,_r=50,Cs=50,Ze=4,sa=Ze*ft,Sr=[1e3,2500],k=e=>typeof e=="object"&&e!==null?e:{},Ue=e=>Array.isArray(e)?e:[],b=e=>typeof e=="string"&&e.length>0?e:null,et=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function br(e){return Ue(e).map(o=>{let t=k(o);return{type:b(t.type)??"unknown",message:b(t.message)??""}})}function Rr(e){return Ue(e).map(o=>{let t=k(o);return{type:b(t.type)??"unknown",message:b(t.message)??"",description:b(t.description),url:b(t.url)}})}function pt(e){let o=k(e),t=k(o.attributes),r=k(o.references),n=k(r.event),c=k(n.attributes),i=k(c.vcs),l=k(i.commit),f=k(r.pipeline),u=k(r.trigger),_=k(u.attributes);return{id:b(o.id)??"",number:et(t.number)??0,phase:b(t.phase)??"unknown",outcome:b(t.current_outcome),createdAt:b(t.created_at)??"",branch:b(i.branch),tag:b(i.tag),revision:b(i.revision),commitSubject:b(l.subject),commitUrl:b(l.url),pipelineName:b(k(f.attributes).name),trigger:b(_.name)??b(k(_.event_source).type)??b(c.type),errors:br(t.errors),warnings:Rr(t.warnings)}}function vs(e){let o=k(e),t=k(o.attributes),r=k(t.auto_rerun);return{id:b(o.id)??"",name:b(t.name)??"Workflow",phase:b(t.phase)??"unknown",outcome:b(t.current_outcome)??b(t.outcome),createdAt:b(t.created_at),endedAt:b(t.ended_at),tag:b(t.tag),autoRerunNumber:et(r.number)}}function Kt(e){let o=k(e),t=k(o.attributes);return{id:b(o.id)??"",name:b(t.name)??"Job",number:et(t.number)??0,type:b(t.type)??"build",phase:b(t.phase)??"unknown",outcome:b(t.outcome),startedAt:b(t.started_at),endedAt:b(t.ended_at)}}function Ns(e){let o=k(e);return{num:et(o.num)??0,name:b(o.name)??"Step",type:b(o.type)??"run",phase:b(o.phase)??"unknown",outcome:b(o.outcome),exitCode:et(o.exit_code),command:b(o.command),startedAt:b(o.started_at),endedAt:b(o.ended_at)}}function Us(e){let o=Kt(e),t=k(k(e).attributes),r=Ue(t.parallel_executions).map(k),n=r.length>0?Ue(r[0]?.steps).map(Ns):[];return{...o,errors:br(t.errors),warnings:Rr(t.warnings),steps:n,parallelExecutions:r.length}}function Tr(e){let o=k(e),t=k(o.attributes),r=k(k(o.references).org);return{id:b(o.id)??"",name:b(t.name)??"Project",orgId:b(r.id)??"",orgName:b(k(r.attributes).name)??""}}function Ps(e){let o=k(e),t=k(o.attributes);return{id:b(o.id)??"",name:b(t.name)??"Organization",vcsProvider:b(k(t.vcs).provider)}}function hr(e){let o=k(e),t=k(o.attributes),r=k(t.config);return{id:b(o.id)??"",name:b(t.name)??"Pipeline",configPath:b(r.file_path)??""}}function Ms(e){let o=k(e),t=k(o.attributes);return{id:b(o.id)??"",login:b(t.login)??"CircleCI account",name:b(t.name),avatarUrl:b(t.avatar_url)}}function Ls(e){if(!e)return;let o={};for(let[t,r]of Object.entries(e))r==null||r===""||(o[t]=String(r));return Object.keys(o).length>0?o:void 0}function gr(e){if(e)try{return JSON.parse(e)}catch{return}}function Ds(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Gs(e,o,t){let r=k(k(o).error),n=b(r.detail)??b(r.title)??b(r.type)??Ds(e);return new Ce(e,b(r.type)??`HTTP_${e}`,n)}function Hs(e,o){return o!=="GET"?!1:e===429||e===502||e===503||e===504}function js(e){return new Promise(o=>setTimeout(o,e))}function Or(e){async function o(i,l){let f=Ls(i.query),u=0;for(;;){let _=await e({method:i.method,path:ws+i.path,...f?{query:f}:{},...i.body===void 0?{}:{body:JSON.stringify(i.body)}});if(_.status>=400){if(Hs(_.status,i.method)&&u<Sr.length){await js(Sr[u]??2500),u+=1;continue}throw Gs(_.status,gr(_.body),_.body)}return l(_.body)}}let t=i=>o(i,gr),r=i=>o(i,l=>l);async function n(i,l,f,u,_){let T=_?{...l,"page[cursor]":_}:{...l,"page[limit]":f},p;try{p=await t({method:"GET",path:i,query:T})}catch(m){if(!_&&m instanceof Ce&&m.status===400)p=await t({method:"GET",path:i,query:{...l}});else throw m}return{items:Ue(k(p).data).map(u),next:b(k(k(p).page).next)}}async function c(i,l,f,u,_){let T=[],p,m=null;for(let y=0;y<_;y+=1){let N=await n(i,l,f,u,p);if(T.push(...N.items),m=N.next,!m)break;p=m}return{items:T,next:m}}return{currentUser:async()=>{let i=await t({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),l=Ue(k(i).data)[0];if(!l)throw new Ce(200,"EMPTY_USER","CircleCI returned no user.");return Ms(l)},listOrgs:async()=>(await c("/orgs",{},_r,Ps,Ze)).items,findProjectBySlug:async i=>{let l=await t({method:"GET",path:"/projects",query:{"filter[slug]":i}}),f=Ue(k(l).data)[0];return f?Tr(f):null},listProjectsOfOrg:i=>c("/projects",{"filter[org_id]":i},_r,Tr,Ze),listPipelines:async i=>{let l=await c("/pipelines",{"filter[project_id]":i},Cs,hr,1),f=[];for(let u of l.items)if(u.id)try{let _=await t({method:"GET",path:`/pipelines/${encodeURIComponent(u.id)}`,query:{"filter[project_id]":i}});f.push(hr(k(_).data))}catch{f.push({...u,name:"Pipeline config"})}return f},listRuns:(i,l)=>n("/runs",{"filter[project_id]":i},ft,pt,l),listMyRuns:i=>n("/runs",{"filter[user_id]":"me"},ft,pt,i),getRun:async i=>{let l=await t({method:"GET",path:`/runs/${encodeURIComponent(i)}`});return pt(k(l).data)},findRunByNumber:async(i,l)=>{let f;for(let u=0;u<Ze;u+=1){let _=await n("/runs",{"filter[project_id]":i},ft,pt,f),T=_.items.find(p=>p.number===l);if(T)return T;if(!_.next)return null;f=_.next}return null},fireRun:async i=>{let l=await t({method:"POST",path:"/runs",query:{"filter[project_id]":i.projectId},body:{data:{attributes:{checkout:{branch:i.branch}},references:{pipeline:{id:i.pipelineId}}}}}),f=b(k(k(l).data).id);if(!f)throw new Ce(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return f},listWorkflows:(i,l)=>n("/workflows",{"filter[run_id]":i},Wt,vs,l),listJobs:(i,l)=>l?n("/jobs",{"filter[workflow_id]":i},Wt,Kt,l):c("/jobs",{"filter[workflow_id]":i},Wt,Kt,Ze),getJob:async i=>{let l=await t({method:"GET",path:`/jobs/${encodeURIComponent(i)}`});return Us(k(l).data)},condensedOutput:async(i,l,f=0)=>r({method:"GET",path:`/jobs/${encodeURIComponent(i)}/stdout/condensed`,query:{"filter[execution]":f,"filter[step_num]":l}}).then(u=>typeof u=="string"?u:""),rerunWorkflow:async(i,l)=>{let f=await t({method:"POST",path:`/workflows/${encodeURIComponent(i)}/rerun`,body:l?{is_from_failed:!0}:void 0});return b(k(k(f).data).id)??""},cancelWorkflow:async i=>{await t({method:"POST",path:`/workflows/${encodeURIComponent(i)}/cancel`})},approve:async i=>{await t({method:"POST",path:`/approvals/${encodeURIComponent(i)}/approve`})},reject:async i=>{await t({method:"POST",path:`/approvals/${encodeURIComponent(i)}/reject`})}}}var xr=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),$s={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function Ar(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Fs(e){if(!e)return"Unknown";let o=e.replace(/_/g," ").trim();return o.charAt(0).toUpperCase()+o.slice(1)}function le(e,o){let t=(o??"").toLowerCase(),r=(e??"").toLowerCase(),n=t||r,c=Ar(t)??Ar(r)??"neutral",i=t?!xr.has(t):!xr.has(r)&&r!=="ended";return{label:$s[n]??Fs(n),tone:c,active:i}}function me(e){let o=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(o)}function $e(e,o,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let n=o?Date.parse(o):t;if(!Number.isFinite(n)||n<r)return"";let c=Math.round((n-r)/1e3);if(c<60)return`${c}s`;let i=Math.floor(c/60),l=c%60;if(i<60)return l>0?`${i}m ${l}s`:`${i}m`;let f=Math.floor(i/60),u=i%60;return u>0?`${f}h ${u}m`:`${f}h`}function Et(e,o=Date.now()){if(!e)return"";let t=Date.parse(e);if(!Number.isFinite(t))return"";let r=Math.round((o-t)/1e3);if(r<45)return"just now";let n=Math.round(r/60);if(n<60)return`${n}m ago`;let c=Math.round(n/60);if(c<24)return`${c}h ago`;let i=Math.round(c/24);return i<7?`${i}d ago`:new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function Fe(e){return e?e.slice(0,8):""}function Pe(e){return e.branch??e.tag??"detached"}var Vs={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function kr(e){let o=e.trim();if(!o)return null;let t=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(o);t&&!o.includes("://")&&(o=`https://${t[1]}/${t[2]}/${t[3]}`);let r;try{r=new URL(o)}catch{return null}let n=r.hostname.toLowerCase();if(!n)return null;let c=r.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(c.length<2)return null;let i=c[c.length-2]??"",l=c[c.length-1]??"";return!i||!l?null:{host:n,owner:i,repo:l}}function zt(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function yr(e,o,t){return{segment:e&&Vs[e.host]||"github",owner:e?.owner??o,repo:e?.repo??t}}function Xs(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function tt(e,o){return`${Xs(e)}/${o}`}function ot(e,o,t){return`${tt(e,o)}/workflows/${t}`}function mt(e,o,t,r){return`${ot(e,o,t)}/jobs/${r}`}function Ir(e){let o=null,t=null,r="";for(let n of e.split(/\r?\n/)){let c=n.trim();if(!c||c.startsWith("#")||c.startsWith(";"))continue;let i=/^\[([^\]]+)\]$/.exec(c);if(i){r=(i[1]??"").trim().toLowerCase();continue}let l=/^url\s*=\s*(.*)$/i.exec(c);if(!l)continue;let f=(l[1]??"").trim();f&&(t===null&&(t=f),(/remote\s+"origin"/i.test(r)||/remote\s+'origin'/i.test(r))&&(o=f))}return o??t}function wr(e){let o=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return o&&(o[1]??"").trim()||null}var Cr="circleci",vr=16e3,Bs=200,Jt=2e3;function qt(e,o){return e.length<=o?e:`${e.slice(0,o-20)}
\u2026 (truncated)`}function Ve(e){return le(e.phase,e.outcome).label.toLowerCase()}function Ws(e,o){return e?`${e}/${o}`:o}function Nr(e){let{workspace:o,run:t,workflow:r,job:n}=e;return{projectId:o.link.projectId,projectName:o.link.projectName,orgName:o.link.orgName,runId:t.id,runNumber:t.number,branch:t.branch,workflowId:r?.id??null,workflowName:r?.name??null,jobId:n?.id??null,jobName:n?.name??null}}function Re(e){return typeof e=="string"&&e.length>0?e:null}function Ur(e){if(typeof e!="object"||e===null||Array.isArray(e))return null;let o=e,t=Re(o.projectId),r=Re(o.projectName),n=Re(o.orgName)??"",c=Re(o.runId),i=typeof o.runNumber=="number"&&Number.isFinite(o.runNumber)?o.runNumber:null;return!t||!r||!c||i===null?null:{projectId:t,projectName:r,orgName:n,runId:c,runNumber:i,branch:Re(o.branch),workflowId:Re(o.workflowId),workflowName:Re(o.workflowName),jobId:Re(o.jobId),jobName:Re(o.jobName)}}function Pr(e){let o=e.workflow?.id??"run",t=e.job?.id??"";return`${e.run.id}:${o}:${t}`}function Mr(e){let{run:o,workflow:t,job:r}=e,n=r?.name??t?.name??`run #${o.number}`,c=Ve(r?{phase:r.phase,outcome:r.outcome}:t||{phase:o.phase,outcome:o.outcome});return qt(`${n} ${c} in CircleCI run #${o.number}`,Bs)}function Qt(e){let{workspace:o,run:t,workflow:r,job:n}=e;return r&&n&&n.number>0?mt(o.target,t.number,r.id,n.number).slice(0,Jt):r?ot(o.target,t.number,r.id).slice(0,Jt):tt(o.target,t.number).slice(0,Jt)}function Yt(e){let{workspace:o,run:t,workflow:r,job:n,jobs:c,jobsError:i,detail:l,output:f}=e,u=[];u.push(`CircleCI run #${t.number} on ${Ws(o.link.orgName,o.link.projectName)}`),u.push(`Status: ${Ve({phase:t.phase,outcome:t.outcome})}`),t.pipelineName&&u.push(`Pipeline: ${t.pipelineName}`),u.push(`Ref: ${Pe(t)}${t.revision?` at ${Fe(t.revision)}`:""}`),t.commitSubject&&u.push(`Commit: ${t.commitSubject}`),u.push(`URL: ${Qt(e)}`);let _=c.filter(T=>me(T.outcome));if(r){if(u.push(""),u.push(`Workflow ${r.name} (${Ve(r)})`),i&&u.push(`Job listing unavailable: ${i}`),_.length>0){u.push("Failing jobs:");for(let p of _)u.push(`- ${p.name} (#${p.number})`)}let T=c.filter(p=>!_.includes(p));if(T.length>0){u.push("Other jobs:");for(let p of T)u.push(`- ${p.name}: ${Ve({phase:p.phase,outcome:p.outcome})}`)}}if(n&&l){if(u.push(""),u.push(`Job ${l.name} (#${l.number})`),l.errors.length>0){u.push("Errors:");for(let p of l.errors)u.push(`- ${p.type}: ${p.message}`)}let T=l.steps.filter(p=>p.outcome==="failed");if(T.length>0){u.push("Failed steps:");for(let p of T)u.push(`- step ${p.num} "${p.name}"${p.exitCode!==null?` (exit ${p.exitCode})`:""}`),p.command&&u.push(`  command: ${p.command}`)}}return f&&f.trim()&&(u.push(""),u.push("Condensed output:"),u.push(f.trim())),qt(u.join(`
`),vr)}function Lr(e){return qt(`Investigate and fix this CircleCI failure.

${Yt(e)}`,vr)}var C="openchamber.sdk";var _t="data-oc-scrolling",Zt=`
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${_t}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${_t}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${_t}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${_t}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function eo(e){let o=e.documentElement;if(o.hasAttribute("data-oc-scrollbar-activity"))return;o.setAttribute("data-oc-scrollbar-activity","");let t=new WeakMap;e.addEventListener("scroll",r=>{let n=r.target===e?o:r.target;if(!(n instanceof Element))return;n.hasAttribute("data-oc-scrolling")||n.setAttribute("data-oc-scrolling","");let c=t.get(n);c!==void 0&&clearTimeout(c),t.set(n,setTimeout(()=>{t.delete(n),n.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Ks=`(${eo.toString()})(document);`;var jr=/^[a-z][a-z0-9-]{0,39}$/;var Dr=e=>Object(e)===e&&!Array.isArray(e),to=(e,o)=>Object.keys(e).every(t=>o.includes(t)),Gr=e=>String(e)===e&&e.length>=1&&e.length<=60,Hr=e=>String(e)===e&&e.length>=1&&e.length<=80,$r=e=>{if(!Array.isArray(e)||e.length>4)return!1;let o=new Set;for(let t of e){if(!Dr(t)||!jr.test(t.id)||!Gr(t.label)||t.disabled!==void 0&&t.disabled!==!0&&t.disabled!==!1||o.has(t.id))return!1;if(o.add(t.id),t.kind==="button"){if(!to(t,["kind","id","label","disabled"]))return!1;continue}if(t.kind!=="select"||!to(t,["kind","id","label","value","options","disabled"])||!Hr(t.value)||!Array.isArray(t.options)||t.options.length<1||t.options.length>16)return!1;let r=new Set;for(let n of t.options){if(!Dr(n)||!to(n,["value","label"])||!Hr(n.value)||!Gr(n.label)||r.has(n.value))return!1;r.add(n.value)}if(!r.has(t.value))return!1}return!0};var Fr=["{id}","{segment}","{segments+}"];var ba=new Set(Fr);var Vr=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Oa=new Set(Vr);var oo=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Xr=(e,o)=>{if(e.path!==o.path||e.readOnly!==o.readOnly)return!1;if(e.encoding==="text"||o.encoding==="text")return e.encoding==="text"&&o.encoding==="text"&&e.content===o.content;if(e.bytes.byteLength!==o.bytes.byteLength)return!1;for(let t=0;t<e.bytes.byteLength;t+=1)if(e.bytes[t]!==o.bytes[t])return!1;return!0};var Br=/^[A-Za-z0-9_-]{1,80}$/;var Wr=["left","right","top","bottom"];var Kr=(e,o=0,t={remaining:16e3})=>{if(--t.remaining<0||o>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let n of r)if(!Kr(n,o+1,t))return!1;return!0},ro=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(o=>/^(0|[1-9]\d*)$/.test(o)&&Number(o)<e.length)&&e.every(ro);if(Object(e)===e){let o=Object.getPrototypeOf(e);return(o===null||o===Object.prototype)&&Object.values(e).every(ro)}return String(e)===e||Number.isFinite(e)},no=e=>{try{return String(e.id)!==e.id||!Br.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Wr.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Kr(e.data)||!ro(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var io=2e3;var Jr=["file","directory","other","missing"],ao=e=>!!(e&&"sessionId"in e),co=e=>!!(e&&"sent"in e&&!("sessionId"in e));var qr=/^[0-9a-f]{7,64}$/i,lo=e=>qr.test(e),St=500,Tt=32e3,Qr=16e3,Yr=128,Zr=200,en=2e3,tn=16e3,on=80,rn=200,nn=16e3;var sn=2e3;var uo=2e4,ht=1024,gt=2e6;var bt=64e3,Rt=8e3,po=4e3;var fo=96e4,Js=60*6e4;var an=999,cn=1e4,rt=500,ln=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],dn=["stopped","starting","ready","failed"],qs=new Set(ln),un=e=>qs.has(e),pn=e=>e&&un(e)?e:"HOST_REJECTED",Xe=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Xe):Object(e)===e?Object.values(e).every(Xe):!1,fn=e=>Xe(e)&&JSON.stringify(e).length<=nn,zr=e=>e?.trim().slice(0,rn)??"",Be=e=>{let o=e.id.trim().slice(0,Yr),t=e.title.trim().slice(0,Zr),r=e.url.trim().slice(0,en),n=e.text?.trim().slice(0,tn),c=e.author?.trim().slice(0,on),i=e.kind==="pull"?"pull":"issue",l={providerId:e.providerId.trim(),id:o,title:t||o,url:r,kind:i};if(n&&(l.text=n),c&&(l.author=c),i==="pull"){let f=zr(e.branches?.head),u=zr(e.branches?.base);f&&u&&(l.branches={head:f,base:u})}return fn(e.data)&&(l.data=e.data),l},Eo=e=>{let o=Be(e);return e.projectId&&(o.projectId=e.projectId),e.navigation&&(o.navigation=e.navigation),e.worktree&&(o.worktree=e.worktree),o},mo=e=>{let o={text:e.text.trim().slice(0,Qr)};return e.send&&(o.send=!0),o},_o=e=>e===null||!Number.isFinite(e)?null:Math.min(an,Math.max(0,Math.round(e))),So=e=>Number.isFinite(e)?Math.min(cn,Math.max(0,Math.ceil(e))):0;var We=e=>e.length>0&&e.length<=ht&&!e.includes("\0")&&!e.includes("\\");var Ot=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>sn?!1:!e.split("/").some(t=>t==="."||t===".."),Qs=new Set(dn),To=e=>!!(e&&"status"in e&&Qs.has(String(e.status))&&!("body"in e)),xt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),ho=e=>!!(e&&"content"in e&&String(e.content)===e.content),go=e=>!!(e&&"written"in e&&e.written===!0),bo=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Ys=new Set(Jr),Ro=e=>!!(e&&"kind"in e&&"size"in e&&Ys.has(String(e.kind))&&Number.isFinite(e.size)),Oo=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Zs=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),ei=e=>Object(e)===e?e:null,so=e=>String(e)===e&&e.length>0,ti=e=>{if(!so(e.id))return null;if(e.ok===!0){let o={channel:C,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(o.payload=e.payload),o}return e.ok===!1&&so(e.error)?{channel:C,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:pn(so(e.code)?e.code:void 0)}:null},xo=e=>{let o=ei(e);return!o||o.channel!==C||o.v!==1?null:o.type==="result"?ti(o):!Zs.has(String(o.type))||Object(o.payload)!==o.payload?null:o};var En=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,oi=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",x=class extends Error{code;constructor(o,t){super(t),this.name="HostRequestError",this.code=o}},mn=()=>Promise.reject(new x("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),At=()=>Promise.reject(new x("BAD_PATH",`File path must be 1 to ${ht} characters without NUL or backslash.`)),kt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new x("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},I=e=>(e.value+=1,`oc-${e.value}`),wo=(e={})=>{let o=e.target??("window"in globalThis?window:null);if(!o)throw new x("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let t=e.acceptSource??(s=>s===o.parent),r=e.requestTimeoutMs??uo,n=new Set,c=new Set,i=new Set,l=new Set,f=new Set,u=new Set,_=new Set,T=new Set,p=new Set,m=new Set,y=new Set,N=new Set,w=[],h=null,L=null,B=new Set,Ee=new Set,ee=null,pe=null,re=!1,Te=new Map,he=new Map,ge=new Map,ne=!1,S={value:0},g=null,be=null,Qe=!1,Ye=!1,nr=null,sr=s=>s?{sessionId:s.id,phase:s.busy?"started":"completed"}:null,se=s=>{o.parent.postMessage(s,"*")},ir=()=>{ne||o.parent===o||N.size===0||g?.features?.lateGenerateResults!==!0||se({channel:C,v:1,type:"generate-late-listen"})},$=(s,d)=>{for(let O of s)try{O(d)}catch(A){console.error(A)}},ar=s=>{if(!(s instanceof MessageEvent)||!t(s.source))return;let d=xo(s.data);if(!d)return;if(d.type==="workspace"){let A=he.get(d.payload.subscriptionId);A&&$([A],d.payload.snapshot);return}if(d.type==="shells"){let A=ge.get(d.payload.subscriptionId);A&&$([A],d.payload.snapshot);return}if(d.type==="ready"){g=d.payload,be=sr(d.payload.session),$(n,d.payload),$(c,d.payload.directory),$(i,d.payload.session),be&&$(l,be),$(f,d.payload.connection),$(u,d.payload.settings),$(_,d.payload.item),d.payload.block&&$(T,d.payload.block),ir();return}if(d.type==="service-event"){$(p,d.payload);return}if(d.type==="generate-late"){N.size===0?w.push(d.payload):$(N,d.payload);return}if(d.type==="directory"){g&&(g={...g,directory:d.payload.directory}),$(c,d.payload.directory);return}if(d.type==="session"){g&&(g={...g,session:d.payload.session}),d.payload.session?be?.sessionId!==d.payload.session.id&&(be=sr(d.payload.session)):be=null,$(i,d.payload.session);return}if(d.type==="session-lifecycle"){be=d.payload,$(l,d.payload);return}if(d.type==="connection"){g&&(g={...g,connection:d.payload.connection}),$(f,d.payload.connection);return}if(d.type==="settings"){g&&(g={...g,settings:d.payload.settings}),$(u,d.payload.settings);return}if(d.type==="item"){g&&(g={...g,item:d.payload.item}),$(_,d.payload.item);return}if(d.type==="status-control-event"){$(m,d.payload);return}if(d.type==="popover-closed"){$(y,d.payload);return}if(d.type==="action"){let A=D=>{ne||se({channel:C,v:1,type:"action-result",id:d.id,payload:D})},G=L;if(!G){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>G(d.payload)).then(()=>A({ok:!0}),D=>{let J=(D instanceof Error?D.message:String(D)).trim();A({ok:!1,error:(J||"Action failed.").slice(0,rt)})});return}if(d.type==="file-open"){let A=d.payload;if(pe&&Xr(pe,A))return;pe=A,$(B,d.payload);return}if(d.type==="file-saved"){$(Ee,d.payload.version);return}if(d.type==="file-snapshot"){let A=J=>{ne||se({channel:C,v:1,type:"file-snapshot-result",id:d.id,payload:J})},G=J=>A({error:(J.trim()||"Could not read the edited file.").slice(0,rt)}),D=ee;if(!D){G("This extension does not edit files.");return}Promise.resolve().then(()=>D(d.payload.purpose)).then(J=>{if(oo(J)>2e7){G(`The file is over ${2e7} ${"bytes"in J?"bytes":"characters"}.`);return}if(J.version.length>256){G(`The snapshot version is over ${256} characters.`);return}A({snapshot:"bytes"in J?{bytes:J.bytes,version:J.version}:{content:J.content,version:J.version}})},J=>G(J instanceof Error?J.message:String(J)));return}if(d.type==="resolve"){let A=D=>{se({channel:C,v:1,type:"resolve-result",id:d.id,payload:D})},G=h;if(!G){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>G(d.payload)).then(D=>A({item:D?Be(D):null}),D=>{let J=(D instanceof Error?D.message:String(D)).trim();A({error:(J||"Command failed.").slice(0,rt)})});return}let O=Te.get(d.id);if(O){if(clearTimeout(O.timer),Te.delete(d.id),d.ok){O.resolve(d.payload);return}O.reject(new x(d.code,d.error))}};o.addEventListener("message",ar),se({channel:C,v:1,type:"hello"});let Y=(s,d=r)=>ne||o.parent===o?Promise.reject(new x("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((O,A)=>{let G=setTimeout(()=>{Te.delete(s.id),A(new x("HOST_TIMEOUT","Host did not answer in time."))},d);Te.set(s.id,{resolve:O,reject:A,timer:G}),se(s)}),W=s=>Y(s).then(()=>{}),z={channel:C,v:1},Vt=s=>{!ne&&o.parent!==o&&se(s)},cr=()=>Vt({...z,type:"file-save"}),lr=s=>{!En(s)||!oi(s)||(s.preventDefault(),cr())},dr=s=>{!En(s)||s.key!=="Escape"||g?.surface!=="popover"||!g.popover||(s.preventDefault(),Er(g.popover.id,"escape").catch(()=>{}))},lt=()=>{let s=g?.surface==="popover"?g.popover:void 0;if(!s)return;let d=Qe||Ye;nr!==d&&(nr=d,mr(s.id,d).catch(()=>{}))},dt=()=>{g?.surface!=="popover"||Qe||(Qe=!0,lt())},ur=s=>{g?.surface!=="popover"||s.relatedTarget!==null||!Qe||(Qe=!1,lt())},pr=()=>{g?.surface!=="popover"||Ye||(Ye=!0,lt())},fr=()=>{g?.surface!=="popover"||!Ye||(Ye=!1,lt())},fe=(s,d=1024)=>{if(!s.trim()||s.length>d)throw new x("HOST_REJECTED",`Identity must contain 1 to ${d} characters.`)},Xt=async s=>{s.kind!=="projects"&&fe(s.projectId);let d=await Y({...z,type:"workspace-read",id:I(S),payload:s});if(!d||!("kind"in d)||!("state"in d)||d.kind!==s.kind)throw new x("HOST_REJECTED","Host did not return workspace data.");return d},Bt=async(s,d)=>{s.kind!=="projects"&&fe(s.projectId);let O=I(S);he.set(O,d);try{await W({...z,type:"workspace-subscribe",id:I(S),payload:{subscriptionId:O,query:s}})}catch(A){throw he.delete(O),ne||se({...z,type:"workspace-unsubscribe",id:I(S),payload:{subscriptionId:O}}),A}return()=>{!he.delete(O)||ne||se({...z,type:"workspace-unsubscribe",id:I(S),payload:{subscriptionId:O}})}},Is=async(s,d)=>{s.kind==="session"&&fe(s.sessionId),s.kind==="project"&&fe(s.projectId);let O=I(S);ge.set(O,d);try{await W({...z,type:"shells-subscribe",id:I(S),payload:{subscriptionId:O,scope:s}})}catch(A){throw ge.delete(O),ne||se({...z,type:"shells-unsubscribe",id:I(S),payload:{subscriptionId:O}}),A}return()=>{!ge.delete(O)||ne||se({...z,type:"shells-unsubscribe",id:I(S),payload:{subscriptionId:O}})}},ut=async s=>{if("key"in s&&(s.key.length===0||s.key.length>128))throw new x("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(s.op==="set"&&!Xe(s.value))throw new x("HOST_REJECTED","Storage values must be JSON.");if(s.op==="set"&&new TextEncoder().encode(JSON.stringify(s.value)).length>65536)throw new x("HOST_REJECTED","Storage value exceeds 64 KiB.");if(s.scope==="device"&&g?.features?.deviceStorage!==!0)throw new x("UNSUPPORTED","This host does not support device storage.");let d=await Y({...z,type:"storage",id:I(S),payload:s});if(!d||!("storage"in d)||d.op!==s.op)throw new x("HOST_REJECTED","Host did not return storage data.");return d},Er=(s,d)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===s)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):W({...z,type:"popover-close",id:I(S),payload:d?{id:s,reason:d}:{id:s}}),mr=(s,d)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===s)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):W({...z,type:"popover-anchor",id:I(S),payload:{id:s,active:d}});return o.addEventListener("keydown",dr,!0),o.addEventListener("pointerover",dt),o.addEventListener("pointermove",dt),o.addEventListener("pointerout",ur),o.addEventListener("focus",pr),o.addEventListener("blur",fr),{onAction:s=>(L=s,()=>{L===s&&(L=null)}),listProjects:async()=>{let s=await Xt({kind:"projects"});if(s.kind!=="projects")throw new x("HOST_REJECTED","Expected projects.");return s},listWorktrees:async s=>{let d=await Xt({kind:"worktrees",projectId:s});if(d.kind!=="worktrees")throw new x("HOST_REJECTED","Expected worktrees.");return d},listSessions:async s=>{let d=await Xt({kind:"sessions",projectId:s});if(d.kind!=="sessions")throw new x("HOST_REJECTED","Expected sessions.");return d},onProjects:s=>Bt({kind:"projects"},d=>{d.kind==="projects"&&s(d)}),onWorktrees:(s,d)=>Bt({kind:"worktrees",projectId:s},O=>{O.kind==="worktrees"&&d(O)}),onSessions:(s,d)=>Bt({kind:"sessions",projectId:s},O=>{O.kind==="sessions"&&d(O)}),onRunningShells:(s,d)=>Is(s,d),readShellOutput:async(s,d)=>{fe(s,128);let O=d?.cursor;if(O!==void 0&&(!Number.isInteger(O)||O<0))throw new x("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=d?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>65536))throw new x("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let D=await Y({...z,type:"shell-output",id:I(S),payload:{shellId:s,cursor:O,tailBytes:A}});if(!D||typeof D.output!="string"||!Number.isFinite(D.cursor))throw new x("HOST_REJECTED","Host did not return shell output.");return D},stopShell:async s=>{if(fe(s,128),(await Y({...z,type:"shell-stop",id:I(S),payload:{shellId:s}}))?.stopped!==!0)throw new x("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async s=>{fe(s),await W({...z,type:"open-session",id:I(S),payload:{sessionId:s}})},storage:{get:async(s,d)=>{let O=kt(d),A={op:"get",key:s};O&&(A.scope=O);let G=await ut(A);return G.op==="get"&&G.found?G.value:void 0},set:async(s,d,O)=>{let A=kt(O),G={op:"set",key:s,value:d};A&&(G.scope=A),await ut(G)},delete:async(s,d)=>{let O=kt(d),A={op:"delete",key:s};O&&(A.scope=O),await ut(A)},keys:async s=>{let d=kt(s),O={op:"keys"};d&&(O.scope=d);let A=await ut(O);if(A.op!=="keys")throw new x("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:s=>(n.add(s),g&&s(g),()=>{n.delete(s)}),onDirectory:s=>(c.add(s),g&&s(g.directory),()=>{c.delete(s)}),onSession:s=>(i.add(s),g&&s(g.session),()=>{i.delete(s)}),onSessionLifecycle:s=>(l.add(s),be&&s(be),()=>{l.delete(s)}),onConnection:s=>(f.add(s),g&&s(g.connection),()=>{f.delete(s)}),onSettings:s=>(u.add(s),g&&s(g.settings),()=>{u.delete(s)}),onItem:s=>(_.add(s),g&&s(g.item),()=>{_.delete(s)}),onBlock:s=>(T.add(s),g?.block&&s(g.block),()=>{T.delete(s)}),onServiceEvent:s=>(p.add(s),()=>{p.delete(s)}),onStatusControl:s=>(m.add(s),()=>{m.delete(s)}),onPopoverClosed:s=>(y.add(s),()=>{y.delete(s)}),setStatusControls:s=>g?.features?.statusControls!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support status controls.")):$r(s)?W({...z,type:"status-controls",id:I(S),payload:{controls:s}}):Promise.reject(new x("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:s=>g?.features?.popovers!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):no(s)?W({...z,type:"popover-open",id:I(S),payload:s}):Promise.reject(new x("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Er,setPopoverAnchorActive:mr,onResolve:s=>(h=s,()=>{h===s&&(h=null)}),toast:s=>{let d=s.message.trim();return!d||d.length>St?Promise.reject(new x("HOST_REJECTED",`Toast message must contain 1 to ${St} characters.`)):s.copy&&s.copy!==!0&&(!s.copy.text.length||s.copy.text.length>Tt)?Promise.reject(new x("HOST_REJECTED",`Toast copy text must contain 1 to ${Tt} characters.`)):W({channel:C,v:1,type:"toast",id:I(S),payload:{...s,message:d}})},openUrl:s=>W({channel:C,v:1,type:"open-url",id:I(S),payload:{url:s}}),openCommit:s=>lo(s)?W({channel:C,v:1,type:"open-commit",id:I(S),payload:{sha:s}}):Promise.reject(new x("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:s=>W({channel:C,v:1,type:"block-answer",id:I(S),payload:{text:s.trim().slice(0,io)}}),openSurface:s=>W({channel:C,v:1,type:"open-surface",id:I(S),payload:{surfaceId:s}}),writeClipboard:s=>W({channel:C,v:1,type:"clipboard-write",id:I(S),payload:{text:s}}),compose:s=>W({channel:C,v:1,type:"compose",id:I(S),payload:s}),attach:s=>W({channel:C,v:1,type:"attach",id:I(S),payload:Be(s)}),startSession:async s=>{s.projectId!==void 0&&fe(s.projectId);let d=s.worktree;d&&d!==!0&&(d.kind==="existing"?fe(d.directory):(d.name!==void 0&&fe(d.name,200),d.baseBranch!==void 0&&fe(d.baseBranch,200)));let O=await Y({channel:C,v:1,type:"start-session",id:I(S),payload:Eo(s)},e.requestTimeoutMs??18e4);if(!ao(O))throw new x("HOST_REJECTED","Host did not return a session.");return O},prompt:s=>Y({channel:C,v:1,type:"prompt",id:I(S),payload:mo(s)}).then(d=>{if(!co(d))throw new x("HOST_REJECTED","Host did not return a prompt result.");return d}),sessionLink:s=>W({channel:C,v:1,type:"session-link",id:I(S),payload:Be(s)}),close:()=>W({channel:C,v:1,type:"close",id:I(S)}),oauthStart:()=>W({channel:C,v:1,type:"oauth-start",id:I(S)}),oauthDisconnect:()=>W({channel:C,v:1,type:"oauth-disconnect",id:I(S)}),request:s=>(Ot(s.path)?Y({channel:C,v:1,type:"request",id:I(S),payload:s}):mn()).then(d=>{if(!xt(d))throw new x("HOST_REJECTED","Host request result was empty.");return d}),serviceRequest:s=>(Ot(s.path)?Y({channel:C,v:1,type:"service-request",id:I(S),payload:s}):mn()).then(d=>{if(!xt(d))throw new x("HOST_REJECTED","Host service request result was empty.");return d}),serviceStatus:()=>Y({channel:C,v:1,type:"service-status",id:I(S)}).then(s=>{if(!To(s))throw new x("HOST_REJECTED","Host did not return service status.");return s}),readFile:s=>(We(s)?Y({channel:C,v:1,type:"file-read",id:I(S),payload:{path:s}}):At()).then(d=>{if(!ho(d))throw new x("HOST_REJECTED","Host did not return file content.");return d}),writeFile:(s,d)=>We(s)?d.length>gt?Promise.reject(new x("FILE_TOO_LARGE",`Content is over ${gt} characters.`)):Y({channel:C,v:1,type:"file-write",id:I(S),payload:{path:s,content:d}}).then(O=>{if(!go(O))throw new x("HOST_REJECTED","Host did not confirm the write.");return O}):At(),listDir:s=>(We(s)?Y({channel:C,v:1,type:"file-list",id:I(S),payload:{path:s}}):At()).then(d=>{if(!bo(d))throw new x("HOST_REJECTED","Host did not return directory entries.");return d}),stat:s=>(We(s)?Y({channel:C,v:1,type:"file-stat",id:I(S),payload:{path:s}}):At()).then(d=>{if(!Ro(d))throw new x("HOST_REJECTED","Host did not return file status.");return d}),generate:s=>{let d=s.prompt.trim(),O=s.system?.trim();if(d.length===0||d.length>bt)return Promise.reject(new x("HOST_REJECTED",`Prompt must be 1 to ${bt} characters.`));if(O!==void 0&&(O.length===0||O.length>Rt))return Promise.reject(new x("HOST_REJECTED",`System prompt must be 1 to ${Rt} characters.`));let A=s.maxOutputTokens===void 0?void 0:Math.min(po,Math.max(1,Math.floor(s.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new x("HOST_REJECTED","maxOutputTokens must be a number."));let G={prompt:d};return O!==void 0&&(G.system=O),A!==void 0&&(G.maxOutputTokens=A),Y({channel:C,v:1,type:"generate",id:I(S),payload:G},e.requestTimeoutMs??fo).then(D=>{if(!Oo(D))throw new x("HOST_REJECTED","Host did not return generated text.");return D})},onLateGenerateResult:s=>{N.add(s);for(let d of w.splice(0))$([s],d);return ir(),()=>{N.delete(s)}},setBadge:s=>W({channel:C,v:1,type:"badge",id:I(S),payload:{count:_o(s)}}),setHeight:s=>W({channel:C,v:1,type:"resize",id:I(S),payload:{height:So(s)}}),onFileOpen:s=>(B.add(s),re||(re=!0,o.addEventListener("keydown",lr,!0)),pe&&s(pe),()=>{B.delete(s)}),onFileSnapshot:s=>(ee=s,()=>{ee===s&&(ee=null)}),onFileSaved:s=>(Ee.add(s),()=>{Ee.delete(s)}),reportFileChange:s=>Vt({...z,type:"file-change",payload:{dirty:s.dirty,edited:s.edited}}),requestFileSave:cr,reportFileUnsupported:()=>Vt({...z,type:"file-unsupported"}),dispose:()=>{for(let s of he.keys())se({...z,type:"workspace-unsubscribe",id:I(S),payload:{subscriptionId:s}});he.clear();for(let s of ge.keys())se({...z,type:"shells-unsubscribe",id:I(S),payload:{subscriptionId:s}});ge.clear(),ne=!0,h=null,L=null,ee=null,B.clear(),Ee.clear(),re&&o.removeEventListener("keydown",lr,!0),o.removeEventListener("message",ar),o.removeEventListener("keydown",dr,!0),o.removeEventListener("pointerover",dt),o.removeEventListener("pointermove",dt),o.removeEventListener("pointerout",ur),o.removeEventListener("focus",pr),o.removeEventListener("blur",fr);for(let s of Te.values())clearTimeout(s.timer),s.reject(new x("HOST_UNAVAILABLE","Host client was disposed."));Te.clear(),n.clear(),c.clear(),i.clear(),l.clear(),f.clear(),u.clear(),_.clear(),T.clear(),p.clear(),m.clear(),y.clear(),N.clear(),w.length=0}}};var Tn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Ga=new Set(Tn);var ri=10*6e4;var ni=10*6e4;var si=10*6e4;var ii=10*6e4;var hn=["none","agent","user"];var ja=new Set(hn);var Q=wo(),gn=async e=>Q.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function te(e,o){try{await Q.toast({kind:e,message:o})}catch{}}function yt(e){return Q.readFile(e)}function bn(e){return{providerId:Cr,id:Pr(e).slice(0,128),title:Mr(e),url:Qt(e),kind:"issue",text:Yt(e),data:Nr(e)}}async function Rn(e){await Q.attach(bn(e))}async function On(e,o={}){await Q.startSession({...bn(e),worktree:o.worktree??!0,navigation:o.navigation??"open"})}async function xn(e,o={}){await Q.prompt({text:Lr(e),send:o.send??!0})}function E(e,o={},...t){let r=document.createElement(e);o.className&&(r.className=o.className),o.text!==void 0&&(r.textContent=o.text),o.title&&(r.title=o.title),o.style&&r.setAttribute("style",o.style),o.role&&r.setAttribute("role",o.role),o.ariaLabel&&r.setAttribute("aria-label",o.ariaLabel);for(let n of t)n==null||n===!1||r.append(typeof n=="string"?document.createTextNode(n):n);return r}function An(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function Ke(e,o){return o?E("div",{className:"meta-row"},E("span",{className:"meta-label",text:e}),E("span",{className:"meta-value",text:o})):null}var ai={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function F(e){return e instanceof Ce?e.message:e instanceof x?ai[e.code]??e.message:e instanceof Error?e.message:String(e)}function ci(e){return e instanceof x?e.code:null}function nt(e){let o=ci(e);return o==="DISCONNECTED"||o==="NO_INTEGRATION"}function kn(e){let o=null,t=()=>{o!==null&&(window.clearTimeout(o),o=null)};return{arm:()=>{t(),!(!e.enabled()||!e.active())&&(o=window.setTimeout(()=>{o=null,e.onTick()},e.delayMs))},stop:t}}var li=["all","failed","running"];function yn(e){return li.includes(e)?e:"all"}function di(e){return[`#${e.number}`,Pe(e),Fe(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function ui(e,o,t=""){if(o==="failed"&&!me(e.outcome)||o==="running"&&!le(e.phase,e.outcome).active)return!1;let r=t.trim().toLowerCase();return r===""||di(e).includes(r)}function In(e,o,t=""){return e.filter(r=>ui(r,o,t))}function st(e){return e.some(o=>le(o.phase,o.outcome).active)}var pi=`
:root {
  --k-bg: var(--surface-background, var(--oc-bg, transparent));
  --k-fg: var(--surface-foreground, var(--oc-fg, inherit));
  --k-muted: var(--surface-muted-foreground, var(--oc-muted, #71717a));
  --k-muted-surface: var(--surface-muted, var(--oc-muted-surface, #ececef));
  --k-elevated: var(--surface-elevated, var(--oc-elevated, var(--k-muted-surface)));
  --k-border: var(--interactive-border, var(--oc-border, #e4e4e7));
  --k-border-soft: color-mix(in srgb, var(--k-border) 60%, transparent);
  --k-hover: var(--interactive-hover, var(--oc-hover, color-mix(in srgb, var(--k-fg) 6%, transparent)));
  --k-primary: var(--primary, var(--oc-primary, currentColor));
  --k-primary-text: var(--primary-text, var(--oc-primary-text, var(--k-primary)));
  --k-error-text: var(--error-text, var(--oc-error-text, #b91c1c));
  --k-radius: var(--radius, var(--oc-radius, 8px));
  --k-font: var(--font-sans, var(--oc-font, system-ui, -apple-system, sans-serif));
  --k-mono: var(--font-mono, var(--oc-mono, ui-monospace, SFMono-Regular, Menlo, monospace));
  --k-text-ui: var(--text-ui-header, 0.875rem);
  --k-text-meta: var(--text-meta, 0.8125rem);
  --k-text-code: var(--text-code, 0.75rem);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  height: 100%;
  font-family: var(--k-font);
  font-size: var(--k-text-ui);
  line-height: 1.45;
  color: var(--k-fg);
  background: var(--k-bg);
}

#root {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 2px;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.toolbar > * { min-width: 0; }

.row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.spacer { flex: 1; }

.muted {
  color: var(--k-muted);
  font-size: var(--k-text-meta);
}

.eyebrow {
  font-size: var(--k-text-meta);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--k-muted);
  white-space: nowrap;
}

.mono { font-family: var(--k-mono); }

.panel-title {
  font-size: var(--k-text-ui);
  font-weight: 600;
}

.account {
  color: var(--k-muted);
  font-size: var(--k-text-meta);
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Detail header: back button, title, status, actions. */
.detail-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-bottom: 1px solid var(--k-border-soft);
  padding-bottom: 8px;
}

.detail-title {
  font-size: var(--k-text-ui);
  font-weight: 600;
  overflow-wrap: anywhere;
}

.detail-sub {
  color: var(--k-muted);
  font-size: var(--k-text-meta);
  overflow-wrap: anywhere;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

/* Key/value pairs for run metadata. */
.meta-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2px 10px;
  font-size: var(--k-text-meta);
}

.meta-row { display: contents; }

.meta-label {
  color: var(--k-muted);
  white-space: nowrap;
}

.meta-value {
  overflow-wrap: anywhere;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title {
  font-size: var(--k-text-meta);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--k-muted);
}

/* A job row: the list row plus its own buttons. */
.job-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--k-border-soft);
  border-radius: var(--k-radius);
  padding: 6px 8px;
}

.job-row-active {
  border-color: var(--k-border);
  background: var(--k-hover);
}

.job-row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.job-row-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.job-row-meta {
  color: var(--k-muted);
  font-size: var(--k-text-meta);
  white-space: nowrap;
}

.job-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.output {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: var(--k-mono);
  font-size: var(--k-text-code);
  background: var(--k-muted-surface);
  border: 1px solid var(--k-border-soft);
  border-radius: var(--k-radius);
  padding: 8px;
  max-height: 320px;
  overflow: auto;
}

.notice {
  margin: 0;
  color: var(--k-muted);
  font-size: var(--k-text-meta);
  overflow-wrap: anywhere;
}

.error-text { color: var(--k-error-text); }

/* Two-column layouts: the full-screen page and the attach dialog. */
.page-columns,
.picker-columns {
  display: grid;
  grid-template-columns: minmax(240px, 5fr) minmax(0, 7fr);
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.page-columns > .column,
.picker-columns > .column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  min-width: 0;
}

.page-columns > .column > .scroll,
.picker-columns > .column > .scroll {
  flex: 1;
  min-height: 0;
}

@media (max-width: 640px) {
  .page-columns,
  .picker-columns {
    grid-template-columns: minmax(0, 1fr);
    overflow-y: auto;
  }
}

/* The attach dialog's footer. */
.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  border-top: 1px solid var(--k-border-soft);
  padding-top: 8px;
}

.footer > * { min-width: 0; }

/* A preview block: workflow summary inside the picker. */
.preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--k-border-soft);
  border-radius: var(--k-radius);
  padding: 10px;
}

.badge-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.load-more {
  display: flex;
  justify-content: center;
  padding-top: 4px;
}
`,wn="circleci-shared-style";function Cn(){if(document.getElementById(wn))return;let e=document.createElement("style");e.id=wn,e.textContent=pi,document.head.append(e)}async function vn(e,o,t,r){try{return await e.rerunWorkflow(o.id,t.fromFailed),await r("success",`Rerun started for ${o.name}.`),!0}catch(n){return await r("error",F(n)),!1}}async function Nn(e,o,t,r){if(o.length===0)return await r("info",t.fromFailed?"No failed workflow to rerun.":"This run has no workflows to rerun."),{started:0,failed:0,reasons:[]};let n=0,c=0,i=[];for(let l of o)try{await e.rerunWorkflow(l.id,t.fromFailed),n+=1}catch(f){c+=1;let u=F(f);i.includes(u)||i.push(u)}if(n>0&&await r("success",`Started ${n} rerun${n===1?"":"s"}.`),c>0){let l=i[0],f=i.length-1;await r("error",`${c} rerun${c===1?"":"s"} could not be started${l?`: ${l}`:""}${f>0?` (+${f} more)`:""}.`)}return{started:n,failed:c,reasons:i}}async function Un(e,o,t){try{return await e.cancelWorkflow(o.id),await t("success",`Cancellation requested for ${o.name}.`),!0}catch(r){return await t("error",F(r)),!1}}async function Pn(e,o,t){try{return await e.approve(o.id),await t("success",`Approved ${o.name}.`),!0}catch(r){return await t("error",F(r)),!1}}async function Mn(e,o,t){try{return await e.reject(o.id),await t("success",`Rejected ${o.name}.`),!0}catch(r){return await t("error",F(r)),!1}}var Ln="prefs";function fi(e){let o=5381;for(let t=0;t<e.length;t+=1)o=(o<<5)+o+e.charCodeAt(t)>>>0;return o.toString(36)}function Dn(e){return`project:${fi(e)}`}function Gn(e){return`pipelines:${e}`}function Co(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ve(e){return typeof e=="string"&&e.length>0?e:null}function Ei(e){if(!Co(e))return null;let o=ve(e.projectId),t=ve(e.projectName),r=ve(e.orgName),n=ve(e.directory);if(!o||!t||!r||!n)return null;let c=e.source==="detected"?"detected":"picked";return{projectId:o,projectName:t,orgName:r,slug:ve(e.slug),source:c,directory:n}}async function Hn(e,o){let t=Ei(await e.get(Dn(o)));return!t||t.directory!==o?null:t}async function vo(e,o,t){await e.set(Dn(o),{projectId:t.projectId,projectName:t.projectName,orgName:t.orgName,slug:t.slug,source:t.source,directory:o})}var mi={autoRefresh:!0};function _i(e){return Co(e)?{autoRefresh:e.autoRefresh!==!1}:{...mi}}async function No(e){return _i(await e.get(Ln))}async function jn(e,o){let r={...await No(e),...o};return await e.set(Ln,{autoRefresh:r.autoRefresh}),r}function Si(e){if(!Array.isArray(e))return null;let o=[];for(let t of e){if(!Co(t))continue;let r=ve(t.id),n=ve(t.name);!r||!n||o.push({id:r,name:n,configPath:ve(t.configPath)??""})}return o.length>0?o:null}async function $n(e,o){return Si(await e.get(Gn(o)))}async function Fn(e,o,t){await e.set(Gn(o),t.map(r=>({id:r.id,name:r.name,configPath:r.configPath})))}var Ti=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],hi=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Vn=(e,o)=>{o.style.colorScheme=e.mode;for(let[t,r]of Ti)o.style.setProperty(t,e.tokens[r]);for(let[t,r,n]of hi){let c=e.tokens[n]??"";o.style.setProperty(t,c),o.style.setProperty(r,c)}o.style.setProperty("font-family",e.tokens.font),o.style.setProperty("font-size","0.875rem"),o.style.setProperty("line-height","1.45"),o.style.setProperty("color",e.tokens.foreground)},Uo=(e,o)=>{Vn(e.theme,o),o.dataset&&(o.dataset.ocSurface=e.surface,o.dataset.ocTheme=e.theme.mode)};var gi={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},H=(e,o)=>`var(--${e}, var(--oc-${gi[e]}, ${o}))`,xe=H("surface-background","transparent"),wt=H("surface-elevated","transparent"),ze=H("surface-elevated-foreground","inherit"),ie=H("surface-foreground","inherit"),V=H("surface-muted-foreground","gray"),bi=H("surface-muted","transparent"),Me=H("interactive-border","currentColor"),oe=H("interactive-hover","transparent"),Le=H("interactive-active","transparent"),Po=H("interactive-selection","transparent"),Mo=H("interactive-selection-foreground","inherit"),Oe=H("primary","currentColor"),Lo=H("primary-text","inherit"),Do=H("error-text","inherit"),Ri=H("font-sans","inherit"),Go=H("font-mono","monospace"),Kn=H("radius","9px"),Ho=`calc(${Kn} - 2px)`,Xn=`calc(${Kn} - 4px)`,X=(e,o,t="transparent")=>`color-mix(in srgb, ${e} ${o}%, ${t})`,Bn=`background-image: linear-gradient(${oe}, ${oe});`,jo=(e,o="0.5px")=>`box-shadow: inset 0 0 0 ${o} ${e}, var(--oc-sdk-field-lift);`,$o="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Wn="box-shadow: var(--oc-sdk-lit);",Fo=`inset 0 0.5px 0 0 ${X(ie,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Oi=`
:root {
  --oc-sdk-edge: ${X(ie,16)};
  --oc-sdk-field-bg: ${wt};
  --oc-sdk-raised-bg: ${xe};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(ie,14)};
  --oc-sdk-field-bg: ${X(xe,50,wt)};
  --oc-sdk-raised-bg: ${wt};
  --oc-sdk-field-lift: ${Fo};
  --oc-sdk-raised-lift: ${Fo};
  --oc-sdk-lit: ${Fo};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,It=e=>{let o=H(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${o}; --oc-sdk-tone-text: ${H(`${e}-text`,"inherit")}; }`},xi=`
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: 2px; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`,zn=`${Oi}
.oc-sdk { color: ${ie}; font-family: ${Ri}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Bn} }
.oc-sdk-mono { font-family: ${Go}; }
.oc-sdk-muted { color: ${V}; }
${It("success")}${It("warning")}${It("error")}${It("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Oe}; --oc-sdk-tone-text: ${Lo}; }

.oc-sdk-btn { border-radius: ${Ho}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Xn}; }
.oc-sdk-btn[data-variant="default"] { color: ${Lo}; background: ${X(Oe,10,xe)}; border-color: ${X(Oe,12)}; ${Wn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(Oe,16,xe)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(Oe,22,xe)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${bi}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Le}, ${Le}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${ze}; ${$o} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Le}, ${Le}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${oe}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Le}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${H("status-error","red")}; color: ${Do}; background: ${X("var(--oc-sdk-tone)",7,xe)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${Wn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,xe)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,xe)}; box-shadow: none; }

.oc-sdk-field-note { color: ${V}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Do}; }
.oc-sdk-input { border-radius: ${Ho}; background: var(--oc-sdk-field-bg); color: ${ze}; ${jo("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${V}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${jo(X(ie,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${jo(H("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Go}; }

.oc-sdk-search-icon { color: ${V}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Oe}; }
.oc-sdk-search-clear { border-radius: ${Xn}; color: ${V}; }
.oc-sdk-search-clear:hover { background: ${oe}; color: ${ie}; }

.oc-sdk-trigger { border-radius: ${Ho}; background: var(--oc-sdk-raised-bg); color: ${ze}; ${$o} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Le}, ${Le}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${V}; }
.oc-sdk-trigger-chevron { color: ${V}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${ze}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${wt}; background-clip: padding-box; color: ${ze}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${oe}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Po}; color: ${Mo}; }
.oc-sdk-option-check { color: ${ie}; }
.oc-sdk-option[data-destructive="true"] { color: ${Do}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(H("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${V}; }
.oc-sdk-popup-empty { color: ${V}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Me}; border-radius: 4px; color: ${ie}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(ie,60,Me)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Me}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${xe}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Oe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Bn} }
.oc-sdk-check-desc { color: ${V}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(ie,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${V}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ie}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Mo}; background: ${Po}; border-color: ${Me}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${ze}; background: var(--oc-sdk-raised-bg); ${$o} }
.oc-sdk-tab-count { color: ${V}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(ie,6)}; color: ${V}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${oe}; }
.oc-sdk-row[aria-selected="true"] { background: ${Po}; color: ${Mo}; }
.oc-sdk-row-lead { font-family: ${Go}; color: ${V}; }
.oc-sdk-row-sub { color: ${V}; }
.oc-sdk-row-meta { color: ${V}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${V}; }

.oc-sdk-empty-body { color: ${V}; }

.oc-sdk-spinner { color: ${V}; }
.oc-sdk-spinner-ring { border-color: ${Me}; border-top-color: ${Oe}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${X("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${V}; }

.oc-sdk-separator { color: ${V}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${X(Me,40)}; }

.oc-sdk-progress-label { color: ${V}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(ie,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${Oe}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${H("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${H("success-text","inherit")}; }

.oc-sdk-text a { color: ${Lo}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(Me,60)}; }
`,P=`
${Zt}
${xi}
${zn}`;var Jn="oc-sdk-ui-style",_e=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},M=e=>{let o=document.getElementById(Jn);if(o instanceof HTMLStyleElement){o.textContent!==e&&(o.textContent=e);return}eo(document);let t=document.createElement("style");t.id=Jn,t.textContent=e,document.head.appendChild(t)},R=(e,o)=>{let t=document.createElement(e);return o&&(t.className=o),t},ae=e=>{let o=R("button",e);return o.type="button",o},K=(e,o)=>{let t=o??"";e.textContent!==t&&(e.textContent=t)},de=(e,o,t)=>{t==null||t===""?e.removeAttribute(o):e.getAttribute(o)!==t&&e.setAttribute(o,t)},qn=(e,o)=>{let t=r=>{r.target instanceof Node&&e.contains(r.target)||o()};return document.addEventListener("pointerdown",t,!0),()=>{document.removeEventListener("pointerdown",t,!0)}};var Ai=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ae=(e,o)=>{M(P);let t=o,r=ae("oc-sdk oc-sdk-btn"),n=Ai(),c=document.createElement("span");r.append(c),e.append(r);let i=()=>{r.dataset.variant=t.variant??"default",r.dataset.size=t.size??"default",r.disabled=!!t.disabled||!!t.loading,r.dataset.loading=t.loading?"true":"false",r.setAttribute("aria-busy",t.loading?"true":"false"),t.loading&&n.parentNode!==r?r.prepend(n):!t.loading&&n.parentNode===r&&n.remove(),K(c,t.label)},l=()=>{t.disabled||t.loading||t.onClick()};return r.addEventListener("click",l),i(),{update:f=>{t={...t,...f},i()},dispose:()=>{r.removeEventListener("click",l),r.remove()}}};var Vo=(e,o)=>{M(P);let t=o,r=R("label","oc-sdk oc-sdk-field"),n=R("span","oc-sdk-field-label"),c=t.multiline?R("textarea","oc-sdk-input"):R("input","oc-sdk-input"),i=R("span","oc-sdk-field-note");r.append(n,c,i),e.append(r);let l=()=>{K(n,t.label),n.hidden=!t.label,c instanceof HTMLInputElement?c.type=t.password?"password":"text":c.rows=t.rows??3,c.value!==t.value&&(c.value=t.value),c.disabled=!!t.disabled,de(c,"placeholder",t.placeholder),c.dataset.mono=t.mono?"true":"false";let u=!!t.error;r.dataset.invalid=u?"true":"false",c.setAttribute("aria-invalid",u?"true":"false");let _=t.error??t.helper??"";K(i,_),i.hidden=_===""},f=()=>{t.onChange(c.value)};return c.addEventListener("input",f),l(),{update:u=>{t={...t,...u},l()},dispose:()=>{c.removeEventListener("input",f),r.remove()}}};var Qn="http://www.w3.org/2000/svg",ki={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},ke=(e,o,t)=>{let r=document.createElementNS(Qn,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(o)),r.setAttribute("height",String(o)),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),t&&r.setAttribute("class",t);let n=document.createElementNS(Qn,"path");return n.setAttribute("d",ki[e]),r.append(n),r};var Xo=(e,o)=>{M(P);let t=o,r=R("div","oc-sdk oc-sdk-search"),n=R("input","oc-sdk-input");n.type="text",n.spellcheck=!1,n.autocomplete="off",n.setAttribute("role","searchbox");let c=ae("oc-sdk-search-clear");c.append(ke("close",14)),c.tabIndex=-1,r.append(ke("search",16,"oc-sdk-search-icon"),n,c),e.append(r);let i=()=>{let _=t.placeholder??"Search";de(n,"placeholder",_),n.setAttribute("aria-label",t.label??_),c.setAttribute("aria-label","Clear search"),n.value!==t.value&&(n.value=t.value),r.dataset.active=t.value.trim()===""?"false":"true"},l=()=>{t.value!==""&&t.onChange(""),n.focus()},f=()=>{t.onChange(n.value)},u=_=>{_.key==="Escape"&&n.value!==""&&(_.preventDefault(),l())};return n.addEventListener("input",f),n.addEventListener("keydown",u),c.addEventListener("click",l),i(),t.autofocus&&n.focus(),{update:_=>{t={...t,..._},i()},dispose:()=>{n.removeEventListener("input",f),n.removeEventListener("keydown",u),c.removeEventListener("click",l),r.remove()}}};var Se=(e,o="vertical")=>{let[t,r]=o==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===t||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},ye=(e,o,t)=>{let r=e.filter(f=>!f.disabled);if(r.length===0)return null;let n=r[0],c=r[r.length-1];if(t==="first"||!n||!c)return n?.id??null;if(t==="last")return c.id;let i=r.findIndex(f=>f.id===o);return i===-1?t==="next"?n.id:c.id:r[Math.min(r.length-1,Math.max(0,i+(t==="next"?1:-1)))]?.id??null};var Yn=(e,o)=>`${e}-${o??""}`,Ct=(e,o,t,r)=>{let n=ae("oc-sdk-option");n.id=Yn(e,t.id),n.setAttribute("role",o),n.tabIndex=-1,n.disabled=!!t.disabled,o==="option"&&n.setAttribute("aria-selected",t.selected?"true":"false"),n.dataset.destructive=t.destructive?"true":"false";let c=R("span","oc-sdk-option-label");if(c.textContent=t.label,n.append(c),t.hint){let i=R("span","oc-sdk-option-hint");i.textContent=t.hint,n.append(i)}if(o==="option"){n.dataset.mark="check";let i=R("span","oc-sdk-option-check");i.append(ke("check",14)),n.append(i)}return n.addEventListener("pointerenter",r.hover),n.addEventListener("click",r.pick),n},vt=(e,o,t,r)=>{let n=Yn(t,r);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===n?"true":"false");de(o,"aria-activedescendant",r?n:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var yi=(e,o)=>{let t=o.getBoundingClientRect();e.style.minWidth=`${Math.round(t.width)}px`,e.style.left=`${Math.round(t.left)}px`,e.style.top=`${Math.round(t.bottom+4)}px`;let r=e.offsetHeight,n=window.innerHeight-t.bottom-8;r>n&&t.top-8>n&&(e.style.top=`${Math.max(8,Math.round(t.top-4-r))}px`);let c=t.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(t.left-c))}px`)},Nt=(e,o,t,r)=>{e.append(t),yi(t,o);let n=qn(e,r),c=()=>{r()},i=l=>{l.target instanceof Node&&t.contains(l.target)||r()};return window.addEventListener("resize",c),window.addEventListener("scroll",i,!0),()=>{n(),window.removeEventListener("resize",c),window.removeEventListener("scroll",i,!0),t.remove()}};var Zn=(e,o)=>{let t=o.trim().toLowerCase();return t?e.filter(r=>r.label.toLowerCase().includes(t)||r.id.toLowerCase().includes(t)):[...e]},Ii=0,Bo=(e,o)=>{M(P);let t=o,r=`oc-sdk-select-${Ii+=1}`,n=R("div","oc-sdk oc-sdk-select"),c=R("span","oc-sdk-field-label");c.id=`${r}-label`;let i=ae("oc-sdk-trigger");i.setAttribute("aria-haspopup","listbox"),i.setAttribute("aria-labelledby",c.id);let l=R("span","oc-sdk-trigger-value");i.append(l,ke("chevron",14,"oc-sdk-trigger-chevron")),n.append(c,i),e.append(n);let f="",u=null,_=null,T=R("div","oc-sdk oc-sdk-popup"),p=R("div","oc-sdk-popup-search"),m=R("input","oc-sdk-input");m.type="text",m.autocomplete="off",p.append(m);let y=R("div");y.setAttribute("role","listbox"),y.tabIndex=-1,T.append(y);let N=()=>Zn(t.options,t.searchable?f:""),w=()=>t.searchable?m:y,h=S=>{u=S,vt(y,w(),r,S)},L=()=>{_e(y);let S=N();if(S.length===0){let g=R("div","oc-sdk-popup-empty");g.textContent="No matches",y.append(g)}for(let g of S)y.append(Ct(r,"option",{...g,selected:g.id===t.value},{hover:()=>h(g.id),pick:()=>ee(g.id)}));h(S.some(g=>g.id===u)?u:S[0]?.id??null)},B=()=>{let S=_;_=null,S?.(),f="",m.value="",i.setAttribute("aria-expanded","false")},Ee=()=>{_||t.disabled||(u=t.value,m.placeholder=t.searchPlaceholder??"Search",t.searchable?T.prepend(p):p.remove(),L(),_=Nt(n,i,T,B),i.setAttribute("aria-expanded","true"),w().focus())},ee=S=>{B(),i.focus(),S!==t.value&&t.onChange(S)},pe=()=>{_?B():Ee()},re=S=>{!_&&Se(S)&&(S.preventDefault(),Ee())},Te=S=>{let g=Se(S);g?(S.preventDefault(),h(ye(N(),u,g))):S.key==="Enter"?(S.preventDefault(),u&&ee(u)):S.key==="Escape"?(S.preventDefault(),B(),i.focus()):t.searchable&&S.target!==m&&S.key.length===1&&!S.ctrlKey&&!S.metaKey&&m.focus()},he=()=>{f=m.value,L()},ge=S=>{_&&!(S.relatedTarget instanceof Node&&n.contains(S.relatedTarget))&&B()},ne=()=>{K(c,t.label),c.hidden=!t.label;let S=t.options.find(g=>g.id===t.value);K(l,S?.label??t.placeholder??"Select"),l.dataset.empty=S?"false":"true",i.disabled=!!t.disabled,_&&L()};return i.addEventListener("click",pe),i.addEventListener("keydown",re),T.addEventListener("keydown",Te),m.addEventListener("input",he),n.addEventListener("focusout",ge),ne(),{update:S=>{t={...t,...S},ne()},dispose:()=>{B(),i.removeEventListener("click",pe),i.removeEventListener("keydown",re),T.removeEventListener("keydown",Te),m.removeEventListener("input",he),n.removeEventListener("focusout",ge),n.remove()}}};var Wo=(e,o)=>{M(P);let t=o,r=R("div","oc-sdk oc-sdk-tabs");r.setAttribute("role","tablist"),e.append(r);let n=()=>{_e(r),r.dataset.track=t.trackBackground?"true":"false";for(let i of t.items){let l=ae("oc-sdk-tab");l.setAttribute("role","tab");let f=i.id===t.activeId;l.setAttribute("aria-selected",f?"true":"false"),l.tabIndex=f?0:-1,l.dataset.id=i.id;let u=R("span");if(u.textContent=i.label,l.append(u),i.count!==void 0){let _=R("span","oc-sdk-tab-count");_.textContent=String(i.count),l.append(_)}l.addEventListener("click",()=>{i.id!==t.activeId&&t.onChange(i.id)}),r.append(l)}},c=i=>{let l=Se(i,"horizontal");if(!l)return;let f=ye(t.items,t.activeId,l);if(f&&f!==t.activeId){i.preventDefault(),t.onChange(f);let u=r.querySelector(`[data-id="${CSS.escape(f)}"]`);u instanceof HTMLElement&&u.focus()}};return r.addEventListener("keydown",c),n(),{update:i=>{t={...t,...i},n()},dispose:()=>{r.removeEventListener("keydown",c),r.remove()}}};var Ut=(e,o)=>{de(e,"data-tone",o&&o!=="neutral"?o:null)},Ko=(e,o)=>{M(P);let t=o,r=R("span","oc-sdk oc-sdk-badge");e.append(r);let n=()=>{K(r,t.label),Ut(r,t.tone)};return n(),{update:c=>{t={...t,...c},n()},dispose:()=>{r.remove()}}};var wi=0,zo=(e,o)=>{M(P);let t=o,r=`oc-sdk-list-${wi+=1}`,n=R("div","oc-sdk oc-sdk-list");n.setAttribute("role","listbox"),n.tabIndex=0,e.append(n);let c=null,i=T=>`${r}-${T}`,l=T=>{c=T;for(let p of Array.from(n.children))p instanceof HTMLElement&&(p.dataset.active=p.id===i(T??"")?"true":"false");de(n,"aria-activedescendant",T?i(T):null),n.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},f=(T,p)=>{let m=R("span",T);return m.textContent=p,m},u=()=>{if(_e(n),de(n,"aria-label",t.ariaLabel),t.items.length===0){n.append(f("oc-sdk-list-empty",t.emptyText??"Nothing here")),l(null);return}for(let p of t.items){let m=ae("oc-sdk-row");m.id=i(p.id),m.setAttribute("role","option"),m.setAttribute("aria-selected",p.id===t.selectedId?"true":"false"),m.disabled=!!p.disabled,m.tabIndex=-1,p.leading&&m.append(f("oc-sdk-row-lead",p.leading));let y=R("span","oc-sdk-row-main");if(y.append(f("oc-sdk-row-title",p.title)),p.subtitle&&y.append(f("oc-sdk-row-sub",p.subtitle)),m.append(y),p.badge){let N=f("oc-sdk-badge",p.badge.label);Ut(N,p.badge.tone),m.append(N)}p.meta&&m.append(f("oc-sdk-row-meta",p.meta)),m.addEventListener("click",()=>t.onSelect(p.id)),n.append(m)}let T=t.items.some(p=>p.id===c&&!p.disabled);l(T?c:t.selectedId??null)},_=T=>{let p=Se(T);if(p){T.preventDefault(),l(ye(t.items,c,p));return}(T.key==="Enter"||T.key===" ")&&c&&(T.preventDefault(),t.onSelect(c))};return n.addEventListener("keydown",_),u(),{update:T=>{t={...t,...T},u()},dispose:()=>{n.removeEventListener("keydown",_),n.remove()}}};var Jo=(e,o)=>{M(P);let t=o,r=R("div","oc-sdk oc-sdk-empty"),n=R("h2","oc-sdk-empty-title"),c=R("p","oc-sdk-empty-body"),i=R("div","oc-sdk-empty-action");r.append(n,c,i),e.append(r);let l=null,f=()=>{if(K(n,t.title),K(c,t.body),c.hidden=!t.body,i.hidden=!t.action,!t.action){l?.dispose(),l=null;return}let u={label:t.action.label,onClick:t.action.onClick};l?l.update(u):l=Ae(i,{...u,variant:"outline",size:"sm"})};return f(),{update:u=>{t={...t,...u},f()},dispose:()=>{l?.dispose(),l=null,r.remove()}}};var qo=(e,o={})=>{M(P);let t=o,r=R("span","oc-sdk oc-sdk-spinner");r.setAttribute("role","status");let n=R("span","oc-sdk-spinner-ring");n.setAttribute("aria-hidden","true");let c=R("span");r.append(n,c),e.append(r);let i=()=>{r.dataset.size=t.size??"default",K(c,t.label),c.hidden=!t.label,r.setAttribute("aria-label",t.label??"Loading")};return i(),{update:l=>{t={...t,...l},i()},dispose:()=>{r.remove()}}};var Qo=(e,o)=>{M(P);let t=o,r=R("div","oc-sdk oc-sdk-banner"),n=R("div","oc-sdk-banner-text"),c=R("div","oc-sdk-banner-title"),i=R("div","oc-sdk-banner-body"),l=R("div","oc-sdk-banner-action");n.append(c,i),r.append(n,l),e.append(r);let f=null,u=()=>{if(r.dataset.tone=t.tone,r.setAttribute("role",t.tone==="error"||t.tone==="warning"?"alert":"status"),K(c,t.title),K(i,t.body),i.hidden=!t.body,l.hidden=!t.action,!t.action){f?.dispose(),f=null;return}let _={label:t.action.label,onClick:t.action.onClick};f?f.update(_):f=Ae(l,{..._,variant:"outline",size:"xs"})};return u(),{update:_=>{t={...t,..._},u()},dispose:()=>{f?.dispose(),f=null,r.remove()}}};var es=e=>e.filter(o=>!("separator"in o)),Ci=0,Yo=(e,o)=>{M(P);let t=o,r=`oc-sdk-menu-${Ci+=1}`,n=R("div","oc-sdk oc-sdk-menu");e.append(n);let c=R("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let i=null,l=null,f=Ae(n,{label:t.label,variant:t.variant,size:t.size,onClick:()=>{i?p():m()}}),u=n.querySelector("button");u?.setAttribute("aria-haspopup","menu");let _=h=>{l=h,vt(c,c,r,h)},T=()=>{_e(c);for(let h of t.items){if("separator"in h){let L=R("div","oc-sdk-separator");L.dataset.labeled="false",c.append(L);continue}c.append(Ct(r,"menuitem",h,{hover:()=>_(h.id),pick:()=>y(h.id)}))}_(es(t.items).some(h=>h.id===l)?l:null)},p=()=>{let h=i;i=null,h?.(),l=null,u?.setAttribute("aria-expanded","false")},m=()=>{i||!u||(T(),i=Nt(n,u,c,p),u.setAttribute("aria-expanded","true"),c.focus())},y=h=>{p(),u?.focus(),t.onSelect(h)},N=h=>{let L=Se(h);L?(h.preventDefault(),_(ye(es(t.items),l,L))):h.key==="Enter"||h.key===" "?(h.preventDefault(),l&&y(l)):h.key==="Escape"&&(h.preventDefault(),p(),u?.focus())},w=h=>{i&&!(h.relatedTarget instanceof Node&&n.contains(h.relatedTarget))&&p()};return c.addEventListener("keydown",N),n.addEventListener("focusout",w),{update:h=>{t={...t,...h},f.update({label:t.label,variant:t.variant,size:t.size}),i&&T()},dispose:()=>{p(),c.removeEventListener("keydown",N),n.removeEventListener("focusout",w),f.dispose(),n.remove()}}};var vi=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,Ni=e=>{try{let o=new URL(e);return o.protocol==="http:"||o.protocol==="https:"}catch{return!1}},ts=e=>{let o=[],t=0;for(let r of e.matchAll(vi)){let n=r.index??0;n>t&&o.push({kind:"text",text:e.slice(t,n)});let c=r[1]??"",i=(r[2]??"").trim(),l=r[3]??"";Ni(l)?c==="!"?o.push({kind:"image",src:l,alt:i}):o.push({kind:"link",href:l,label:i||l}):o.push({kind:"text",text:r[0]}),t=n+r[0].length}return t<e.length&&o.push({kind:"text",text:e.slice(t)}),o},Zo=(e,o)=>{M(P);let t=o,r=R("div","oc-sdk oc-sdk-text");e.append(r);let n=i=>{!(i.target instanceof HTMLAnchorElement)||!t.onOpenUrl||(i.preventDefault(),t.onOpenUrl(i.target.href))},c=()=>{_e(r);for(let i of ts(t.text))if(i.kind==="text")r.append(document.createTextNode(i.text));else if(i.kind==="link"){let l=R("a");l.href=i.href,l.rel="noopener noreferrer",l.target="_blank",l.textContent=i.label,r.append(l)}else{let l=R("img");l.src=i.src,l.alt=i.alt,l.loading="lazy",l.referrerPolicy="no-referrer",r.append(l)}};return r.addEventListener("click",n),c(),{update:i=>{t={...t,...i},c()},dispose:()=>{r.removeEventListener("click",n),r.remove()}}};var os=[];function ue(e){return os.push(e),e}function rs(){for(let e of os.splice(0))try{e.dispose()}catch{}}var q=(e,o)=>ue(Ae(e,o)),ns=(e,o)=>ue(Vo(e,o)),ss=(e,o)=>ue(Xo(e,o)),is=(e,o)=>ue(Bo(e,o)),as=(e,o)=>ue(Wo(e,o)),Mi=(e,o)=>ue(Ko(e,o)),Pt=(e,o)=>ue(zo(e,o)),De=(e,o)=>ue(Jo(e,o)),Li=(e,o)=>ue(qo(e,o)),Mt=(e,o)=>ue(Qo(e,o)),Lt=(e,o)=>ue(Yo(e,o)),Di=(e,o)=>ue(Zo(e,o));function Dt(e,o="notice"){let t=document.createElement("div");return t.className=o,Di(t,{text:e,onOpenUrl:qe}),t}function Je(e,o){let t=document.createElement("span"),r=le(e,o);return Mi(t,{label:r.label,tone:r.tone}),t}function Ie(e){let o=document.createElement("div");return o.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Li(o,{label:e}),o}function cs(e){Uo(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function qe(e){if(e){try{let o=new URL(e);if(o.protocol!=="https:"&&o.protocol!=="http:")return}catch{return}Q.openUrl(e).catch(()=>{})}}function er(e,o,t){return{directory:e,link:o,repo:t,target:yr(t,o.orgName,o.projectName)}}async function Gt(e){try{let o=await e(".git/config"),t=Ir(o.content);return t?kr(t):null}catch{return null}}async function ls(e){try{let o=await e(".git/HEAD");return wr(o.content)}catch{return null}}async function ds(e,o,t,r){let n=await Hn(o,t);if(n)return er(t,n,await Gt(r));let c=await Gt(r);if(!c)return null;for(let i of zt(c))try{let l=await e.findProjectBySlug(i);if(!l||!l.id)continue;return await vo(o,t,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:i,source:"detected"}),er(t,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:i,source:"detected",directory:t},c)}catch{}return null}async function us(e,o,t,r){let n=r?zt(r)[0]??null:null;return await vo(e,o,{projectId:t.id,projectName:t.name,orgName:t.orgName,slug:n,source:"picked"}),er(o,{projectId:t.id,projectName:t.name,orgName:t.orgName,slug:n,source:"picked",directory:o},r)}function ps(e){let o=!1,t=!1,r=null,n=[],c="";function i(){o=!1,t=!1,r=null,n=[],c=""}async function l(){t=!0,r=null,e.repaint();try{let T=await e.client.listOrgs(),p=await Promise.allSettled(T.map(y=>e.client.listProjectsOfOrg(y.id))),m=[];for(let y of p)y.status==="fulfilled"&&m.push(...y.value.items);m.sort((y,N)=>{let w=y.orgName.localeCompare(N.orgName);return w!==0?w:y.name.localeCompare(N.name)}),n=m}catch(T){r=F(T),nt(T)&&e.onDisconnected()}t=!1,e.repaint()}async function f(T){let p=e.directory();if(p)try{let m=await Gt(e.readProjectFile),y=await us(e.storage,p,T,m);i(),await e.onPicked(y)}catch(m){await e.notify("error",F(m))}}function u(){let T=c.trim().toLowerCase();return n.filter(p=>T?`${p.orgName}/${p.name}`.toLowerCase().includes(T):!0).map(p=>({id:p.id,leading:p.orgName?`${p.orgName}/`:"",title:p.name}))}function _(T){let p=E("div",{className:"detail-head"});if(p.append(E("div",{className:"detail-title"},"Choose a CircleCI project")),p.append(E("div",{className:"detail-sub"},"This extension remembers the choice per OpenChamber project.")),e.canCancel()){let h=E("div");q(h,{label:"Back",variant:"ghost",size:"sm",onClick:()=>{i(),e.onCancel()}}),p.append(h)}if(T.append(p),r){let h=E("div");T.append(h),Mt(h,{tone:"error",title:"CircleCI",body:r,action:{label:"Retry",onClick:()=>void l()}})}if(t){T.append(Ie("Loading projects"));return}if(n.length===0){if(r)return;let h=E("div");T.append(h),De(h,{title:"No projects",body:"This token is not a member of any CircleCI organization with projects, or the token cannot list them."});return}let m=E("div");T.append(m);let y=E("div",{className:"scroll"});T.append(y);let N=Pt(y,{items:u(),ariaLabel:"CircleCI projects",onSelect:h=>{let L=n.find(B=>B.id===h);L&&f(L)}}),w=null;w=ss(m,{value:c,label:"Filter projects",placeholder:"Filter by organization or repository",onChange:h=>{c=h,w?.update({value:h}),N.update({items:u()})}})}return{isOpen:()=>o,reset:i,render:_,open:async()=>{o=!0,await l()}}}function fs(e){let o=!1,t=!1,r=[],n="",c="",i=null,l=!1;function f(){o=!1,t=!1,r=[],n="",c="",i=null,l=!1}async function u(p){r=await $n(e.storage,p.link.projectId)??[];try{let m=await e.client.listPipelines(p.link.projectId);r=m,await Fn(e.storage,p.link.projectId,m)}catch{}}async function _(){let p=e.workspace();if(!p||!o)return;let m=r.some(N=>N.id===n)?n:r[0]?.id??"";if(!m){i="This project has no pipeline to run.",e.repaint();return}let y=c.trim();if(!y){i="Name a branch or tag to build.",e.repaint();return}l=!0,i=null,e.repaint();try{await e.client.fireRun({projectId:p.link.projectId,pipelineId:m,branch:y}),f(),await e.notify("success",`Started a run on ${y}.`),await e.onStarted()}catch(N){l=!1,i=F(N),e.repaint()}}function T(p){let m=E("div",{className:"detail-head"}),y=E("div",{className:"row"}),N=E("div");if(q(N,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:()=>{f(),e.repaint()}}),y.append(N),y.append(E("span",{className:"spacer"})),m.append(y),m.append(E("div",{className:"detail-title"},"Run a pipeline")),m.append(E("div",{className:"detail-sub"},"Fire a new run on a branch or tag. The pipeline definition picks which config to build.")),p.append(m),t){p.append(Ie("Loading pipelines"));return}let w=E("div",{className:"section"});if(r.length>1){let ee=E("div"),pe=null;pe=is(ee,{label:"Pipeline",value:n,options:r.map(re=>({id:re.id,label:re.name,hint:re.configPath})),onChange:re=>{n=re,pe?.update({value:re})}}),w.append(ee)}else r.length===1?w.append(E("p",{className:"notice"},`Pipeline: ${r[0]?.name??""}`)):w.append(E("p",{className:"notice error-text"},"This project lists no pipeline definition to run."));let h=E("div"),L=null;L=ns(h,{label:"Branch or tag",value:c,placeholder:"main",mono:!0,onChange:ee=>{c=ee,i=null,L?.update({value:ee})}}),w.append(h),i&&w.append(E("p",{className:"notice error-text"},i));let B=E("div",{className:"detail-actions"}),Ee=E("div");q(Ee,{label:"Start run",loading:l,disabled:l||r.length===0,onClick:()=>void _()}),B.append(Ee),w.append(B),p.append(w)}return{isOpen:()=>o,reset:f,render:T,open:async()=>{let p=e.workspace();if(!p)return;let m=e.directory()?await ls(e.readProjectFile):null;o=!0,t=!0,r=[],n="",c=m??"",i=null,l=!1,e.repaint(),await u(p),o&&(t=!1,n=r[0]?.id??"",e.repaint())}}}var j=document.querySelector("#root");if(!j)throw new Error("CircleCI panel is missing its #root element.");var Z=Or(gn),it=Q.storage,Gi=3e4,rr=null,a={ready:null,connected:!1,account:"CircleCI",booted:!1,workspace:null,override:null,directory:null,runs:[],runsNext:null,filter:"all",selectedRun:null,workflows:[],selectedWorkflow:null,jobs:[],selectedJob:null,jobDetail:null,jobOutput:null,jobsError:null,preferences:{autoRefresh:!0},loading:!0,error:null,toast:null,disconnectNotice:null},ce=0;function we(){return a.override??a.workspace}var at=ps({client:Z,storage:it,readProjectFile:yt,directory:()=>a.directory,notify:te,repaint:U,canCancel:()=>!!a.workspace,onCancel:async()=>{a.override=null,U(),await Ne({more:!1})},onPicked:async e=>{a.workspace=e,a.override=null,a.selectedRun=null,He.reset(),U(),await Ne({more:!1})},onDisconnected:()=>{a.connected=!1}}),He=fs({client:Z,storage:it,readProjectFile:yt,directory:()=>a.directory,workspace:we,notify:te,repaint:U,onStarted:()=>Ne({more:!1})});async function Ts(){U(),a.preferences=await No(it);let e=a.ready?.directory??null;if(a.directory=e,!a.connected){a.loading=!1,U();return}try{let o=await Z.currentUser();a.account=o.login}catch{}if(!e){a.loading=!1,U();return}try{let o=await ds(Z,it,e,yt);if(a.workspace=o,!o){a.loading=!1,U(),at.open();return}await Ne()}catch(o){a.loading=!1,a.error=F(o),nt(o)&&(a.connected=!1),U()}}async function Ne(e={}){let o=we();if(!o)return;let t=++ce;e.more||(a.loading=!0,a.error=null,U());try{let r=await Z.listRuns(o.link.projectId,e.more?a.runsNext??void 0:void 0);if(t!==ce)return;a.runs=e.more?[...a.runs,...r.items]:r.items,a.runsNext=r.next,a.loading=!1,Ji()}catch(r){if(t!==ce)return;a.loading=!1,a.error=F(r),nt(r)&&(a.connected=!1)}U(),ct()}async function jt(){let e=a.selectedRun;if(!e)return;let o=++ce;a.loading=!0,a.error=null,U();try{let t=await Z.listWorkflows(e.id);if(o!==ce)return;a.workflows=t.items,a.loading=!1}catch(t){if(o!==ce)return;a.loading=!1,a.error=F(t)}U(),ct()}async function je(){let e=a.selectedWorkflow;if(!e)return;let o=++ce;a.loading=!0,a.error=null,U();try{let t=await Z.listJobs(e.id);if(o!==ce)return;a.jobs=t.items,a.jobsError=null,a.loading=!1}catch(t){if(o!==ce)return;a.loading=!1,a.jobs=[],a.jobsError=F(t),a.error=a.jobsError}U(),ct()}async function hs(){let e=a.selectedJob;if(!e)return;let o=++ce;a.loading=!0,a.error=null,U();try{let t=await Z.getJob(e.id);if(o!==ce)return;a.jobDetail=t;let r=t.steps.find(n=>me(n.outcome));if(a.jobOutput=null,r)try{let n=await Z.condensedOutput(e.id,r.num,0);o===ce&&n.trim()&&(a.jobOutput=n)}catch{}a.loading=!1}catch(t){if(o!==ce)return;a.loading=!1,a.error=F(t)}U(),ct()}async function $t(e=!1){return e||(a.toast=null),a.selectedJob?hs():a.selectedWorkflow?je():a.selectedRun?jt():Ne({more:!1})}async function gs(e){a.toast=null,a.selectedRun=e,a.workflows=[],a.selectedWorkflow=null,a.jobs=[],a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,U(),await jt()}async function tr(e){a.selectedWorkflow=e,a.jobs=[],a.jobsError=null,a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,U(),await je()}async function or(e){a.selectedJob=e,a.jobDetail=null,a.jobOutput=null,U(),await hs()}function Hi(){a.toast=null,a.selectedRun=null,a.workflows=[],a.selectedWorkflow=null,a.jobs=[],a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,U(),Ne({more:!1})}function ji(){a.selectedWorkflow=null,a.jobs=[],a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,U(),jt()}function $i(){a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,U(),je()}function Ge(e){let o=we(),t=a.selectedRun;return!o||!t?null:{workspace:o,run:t,workflow:e.workflow??a.selectedWorkflow,job:e.job??a.selectedJob,jobs:a.jobs,jobsError:a.jobsError,detail:e.detail??a.jobDetail,output:e.output??a.jobOutput}}async function Ht(e){if(e)try{await Rn(e),await te("success","Attached to the chat box.")}catch(o){await te("error",F(o))}}async function bs(e){if(e)try{await On(e),await te("success","Started a worktree chat for this build.")}catch(o){await te("error",F(o))}}async function Fi(e){if(e)try{await xn(e),await te("success","Sent to the open chat.")}catch(o){await te("error",F(o))}}async function Rs(e,o){await vn(Z,e,{fromFailed:o},te)&&await je()}async function Vi(e){let o=e?a.workflows.filter(r=>me(r.outcome)):a.workflows;(await Nn(Z,o,{fromFailed:e},te)).started>0&&await jt()}async function Os(e){await Un(Z,e,te)&&await je()}async function Xi(e){await Pn(Z,e,te)&&await je()}async function Bi(e){await Mn(Z,e,te)&&await je()}async function Wi(e){switch(e){case"refresh":await $t();return;case"trigger":await He.open();return;case"choose":a.override=null,await at.open();return;case"revert":a.override=null,a.selectedRun=null,a.workflows=[],a.selectedWorkflow=null,a.jobs=[],a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,He.reset(),U(),await Ne({more:!1});return;case"pause":case"resume":a.preferences=await jn(it,{autoRefresh:e==="resume"}),U(),ct();return;case"disconnect":await Yi();return;default:return}}function Ki(){return a.selectedJob?st([a.selectedJob]):a.selectedWorkflow?st(a.jobs):a.selectedRun?st(a.workflows):st(a.runs)}var zi=kn({delayMs:Gi,enabled:()=>a.preferences.autoRefresh,active:Ki,onTick:()=>void $t(!0)});function ct(){zi.arm()}function Ji(){let e=a.runs.filter(o=>me(o.outcome)).length;Q.setBadge(e>0?e:null).catch(()=>{})}function U(){if(rs(),rr=null,An(j),!a.connected){qi();return}if(!a.directory){Es();return}if(at.isOpen()){at.render(j);return}if(!we()){Es();return}if(He.isOpen()){He.render(j);return}if(a.selectedJob){oa();return}if(a.selectedWorkflow){ys();return}if(a.selectedRun){ks();return}xs()}function qi(){let e=E("div");j?.append(e),De(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. Tokens stay in OpenChamber; this extension never sees one.",action:{label:"Open CircleCI tokens",onClick:()=>qe("https://app.circleci.com/settings/user/tokens")}})}function Es(){let e=E("div");j?.append(e),De(e,{title:"No project open",body:"Open a project in OpenChamber. This extension maps that project to a CircleCI project the first time it runs."})}function Qi(){let e=we(),o=E("div",{className:"row"}),t=E("div",{style:"flex:1; min-width:0;"}),r=e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",n=[{id:"refresh",label:"Refresh"},{id:"trigger",label:"Run a pipeline\u2026"},{id:"choose",label:"Change project\u2026"}];a.override&&n.push({id:"revert",label:"Back to this repository's project"}),n.push({separator:!0},a.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"},{separator:!0},{id:"disconnect",label:"Disconnect CircleCI",destructive:!0}),Lt(t,{label:r,size:"sm",variant:"ghost",items:n,onSelect:u=>void Wi(u)}),o.append(t),a.account&&o.append(E("span",{className:"account muted",text:a.account})),j?.append(o);let c=E("div",{className:"toolbar"}),i=E("div"),l=as(i,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:a.filter,onChange:u=>{a.filter=yn(u),l.update({activeId:a.filter}),rr?.paint()}});c.append(i),c.append(E("span",{className:"spacer"}));let f=E("div");return q(f,{label:"Refresh",size:"sm",variant:"ghost",loading:a.loading,onClick:()=>void $t()}),c.append(f),j?.append(c),{bar:c,tabs:l}}var ms="To remove the token, open Settings \u2192 Integrations and clear the CircleCI card.";async function Yi(){try{await Q.oauthDisconnect(),a.disconnectNotice=`Disconnect requested. ${ms}`}catch(e){a.disconnectNotice=`${F(e)} ${ms}`}U()}function Zi(){a.workspace=null,a.override=null,a.runs=[],a.runsNext=null,a.selectedRun=null,a.workflows=[],a.selectedWorkflow=null,a.jobs=[],a.selectedJob=null,a.jobDetail=null,a.jobOutput=null,He.reset(),at.reset(),a.toast=null,a.error=null,a.disconnectNotice=null}function Ft(){if(a.disconnectNotice&&j?.append(E("p",{className:"notice"},a.disconnectNotice)),a.error){let e=E("div");j?.append(e),Mt(e,{tone:"error",title:"CircleCI",body:a.error,action:{label:"Retry",onClick:()=>void $t()}})}a.toast&&j?.append(E("p",{className:"notice"},a.toast))}function ea(){return In(a.runs,a.filter)}function _s(){return ea().map(e=>{let o=le(e.phase,e.outcome);return{id:e.id,leading:`#${e.number}`,title:Pe(e),...e.commitSubject?{subtitle:e.commitSubject}:{},meta:Et(e.createdAt),badge:{label:o.label,tone:o.tone}}})}function Ss(){return a.runs.length===0?"No runs yet. Push a commit, or start one from the project menu.":"No run matches this filter."}function xs(){let{tabs:e}=Qi();if(Ft(),a.loading&&a.runs.length===0){j?.append(Ie("Loading runs"));return}let o=E("div",{className:"scroll"});j?.append(o);let t=Pt(o,{items:_s(),emptyText:Ss(),ariaLabel:"CircleCI runs",onSelect:r=>{let n=a.runs.find(c=>c.id===r);n&&gs(n)}});if(rr={tabs:e,list:t,paint:()=>t.update({items:_s(),emptyText:Ss()})},a.runsNext){let r=E("div",{className:"load-more"});q(r,{label:"Load more runs",size:"sm",variant:"ghost",onClick:()=>void Ne({more:!0})}),j?.append(r)}}function ta(e){let o=we(),t=E("div",{className:"detail-head"}),r=E("div",{className:"row"}),n=E("div");q(n,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:Hi}),r.append(n),r.append(E("span",{className:"spacer"})),r.append(Je(e.phase,e.outcome)),t.append(r),t.append(E("div",{className:"detail-title"},`#${e.number} ${Pe(e)}`));let c=[];e.revision&&c.push(Fe(e.revision)),e.commitSubject&&c.push(e.commitSubject),e.pipelineName&&c.push(e.pipelineName),c.push(Et(e.createdAt)),t.append(E("div",{className:"detail-sub"},c.filter(Boolean).join(" \xB7 "))),e.errors.length>0&&t.append(Dt(e.errors.map(_=>`${_.type}: ${_.message}`).join(" \xB7 "),"notice error-text"));let i=E("div",{className:"detail-actions"}),l=E("div");Lt(l,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every workflow"}],onSelect:_=>void Vi(_==="failed")}),i.append(l);let f=E("div");q(f,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>qe(o?tt(o.target,e.number):null)}),i.append(f);let u=E("div");return q(u,{label:"Attach",size:"sm",variant:"outline",onClick:()=>void Ht(Ge({workflow:null,job:null}))}),i.append(u),t.append(i),t}function As(e){let o=E("div",{className:"job-row"}),t=E("div",{className:"job-row-head"}),r=E("button",{className:"job-row-name",text:e.name,title:e.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});if(r.addEventListener("click",e.onOpen),t.append(r),e.meta&&t.append(E("span",{className:"job-row-meta",text:e.meta})),t.append(Je(e.phase,e.outcome)),o.append(t),e.actions.length>0){let n=E("div",{className:"job-row-actions"});for(let c of e.actions){let i=E("div");q(i,{label:c.label,size:c.size??"xs",variant:c.variant??"ghost",onClick:c.onClick}),n.append(i)}o.append(n)}return o}function ks(){let e=a.selectedRun;if(!e)return xs();if(j?.append(ta(e)),Ft(),a.loading&&a.workflows.length===0){j?.append(Ie("Loading workflows"));return}if(a.workflows.length===0){let t=E("div");j?.append(t),De(t,{title:"No workflows",body:"This run produced no workflows. A configuration error is shown above when CircleCI reported one."});return}let o=E("div",{className:"scroll"});j?.append(o);for(let t of a.workflows){let r=le(t.phase,t.outcome),n=[{label:"Jobs",onClick:()=>void tr(t),variant:"outline"},{label:"Rerun failed",onClick:()=>void Rs(t,!0)}];r.active&&n.push({label:"Cancel",onClick:()=>void Os(t),variant:"ghost"}),n.push({label:"Open",onClick:()=>{let c=we();c&&qe(ot(c.target,e.number,t.id))}}),o.append(As({name:t.name,meta:$e(t.createdAt,t.endedAt),phase:t.phase,outcome:t.outcome,onOpen:()=>void tr(t),actions:n}))}}function ys(){let e=a.selectedWorkflow,o=a.selectedRun;if(!e||!o)return ks();let t=E("div",{className:"detail-head"}),r=E("div",{className:"row"}),n=E("div");q(n,{label:"\u2190 Workflows",variant:"ghost",size:"sm",onClick:ji}),r.append(n),r.append(E("span",{className:"spacer"})),r.append(Je(e.phase,e.outcome)),t.append(r),t.append(E("div",{className:"detail-title"},e.name)),t.append(E("div",{className:"detail-sub"},`Run #${o.number} \xB7 ${$e(e.createdAt,e.endedAt)||"no duration"}`));let c=E("div",{className:"detail-actions"}),i=E("div");if(Lt(i,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:u=>void Rs(e,u==="failed")}),c.append(i),le(e.phase,e.outcome).active){let u=E("div");q(u,{label:"Cancel",size:"sm",variant:"ghost",onClick:()=>void Os(e)}),c.append(u)}let l=E("div");if(q(l,{label:"Attach workflow",size:"sm",variant:"outline",onClick:()=>void Ht(Ge({workflow:e,job:null}))}),c.append(l),t.append(c),j?.append(t),Ft(),a.loading&&a.jobs.length===0){j?.append(Ie("Loading jobs"));return}if(a.jobs.length===0){let u=E("div");j?.append(u),De(u,{title:"No jobs",body:"This workflow lists no jobs yet."});return}let f=E("div",{className:"scroll"});j?.append(f);for(let u of a.jobs){let _=u.type.toLowerCase()==="approval",T=le(u.phase,u.outcome),p=[];_&&T.active&&(p.push({label:"Approve",onClick:()=>void Xi(u),variant:"default"}),p.push({label:"Reject",onClick:()=>void Bi(u),variant:"ghost"})),p.push({label:"Details",onClick:()=>void or(u),variant:"outline"}),me(u.outcome)&&(p.push({label:"Attach failure",onClick:()=>void Ht(Ge({workflow:e,job:u,detail:null,output:null}))}),p.push({label:"Fix with agent",onClick:()=>void bs(Ge({workflow:e,job:u,detail:null,output:null}))})),f.append(As({name:u.name,meta:[u.number>0?`#${u.number}`:"",$e(u.startedAt,u.endedAt)].filter(Boolean).join(" \xB7 "),phase:u.phase,outcome:u.outcome,onOpen:()=>void or(u),actions:p}))}}function oa(){let e=a.selectedJob,o=a.selectedWorkflow,t=a.selectedRun;if(!e)return ys();let r=E("div",{className:"detail-head"}),n=E("div",{className:"row"}),c=E("div");q(c,{label:"\u2190 Jobs",variant:"ghost",size:"sm",onClick:$i}),n.append(c),n.append(E("span",{className:"spacer"})),n.append(Je(e.phase,e.outcome)),r.append(n),r.append(E("div",{className:"detail-title"},e.name)),r.append(E("div",{className:"detail-sub"},[`#${e.number}`,e.type,$e(e.startedAt,e.endedAt)].filter(Boolean).join(" \xB7 ")));let i=E("div",{className:"detail-actions"}),l=E("div");q(l,{label:"Attach to chat",size:"sm",variant:"outline",onClick:()=>void Ht(Ge({workflow:o,job:e}))}),i.append(l);let f=E("div");q(f,{label:"Start a chat",size:"sm",onClick:()=>void bs(Ge({workflow:o,job:e}))}),i.append(f);let u=E("div");q(u,{label:"Send to current chat",size:"sm",variant:"ghost",onClick:()=>void Fi(Ge({workflow:o,job:e}))}),i.append(u);let _=we(),T=E("div");q(T,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>{_&&o&&qe(mt(_.target,t?.number??0,o.id,e.number))}}),i.append(T),r.append(i),j?.append(r),Ft();let p=E("div",{className:"scroll"});if(j?.append(p),a.loading&&!a.jobDetail){p.append(Ie("Loading job"));return}let m=a.jobDetail;if(!m)return;let y=E("div",{className:"meta-grid"}),N=[Ke("Job",`#${m.number}`),Ke("Type",m.type),Ke("Started",m.startedAt?Et(m.startedAt):null),Ke("Duration",$e(m.startedAt,m.endedAt)||null),Ke("Executions",m.steps.length>0?`${m.parallelExecutions} parallel`:null)];for(let w of N)w&&y.append(w);if(y.childElementCount>0&&p.append(y),m.errors.length>0){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Errors"));for(let h of m.errors)w.append(Dt(`${h.type}: ${h.message}`,"notice error-text"));p.append(w)}if(m.warnings.length>0){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Warnings"));for(let h of m.warnings)w.append(Dt(`${h.type}: ${h.message}`,"notice"));p.append(w)}if(m.steps.length>0){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Steps"));for(let h of m.steps){let L=E("div",{className:"job-row"}),B=E("div",{className:"job-row-head"});B.append(E("span",{className:"job-row-name"},`${h.num}. ${h.name}`)),h.exitCode!==null&&h.exitCode!==0&&B.append(E("span",{className:"job-row-meta"},`exit ${h.exitCode}`)),B.append(Je(h.phase,h.outcome)),L.append(B),h.command&&L.append(E("pre",{className:"output",style:"max-height:120px;"},h.command)),w.append(L)}p.append(w)}if(a.jobOutput){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Condensed output")),w.append(E("pre",{className:"output"},a.jobOutput)),p.append(w)}else me(m.outcome)&&p.append(E("p",{className:"notice"},"CircleCI returned no condensed output for this job. The steps above and the errors are still attached with the chip."))}function ra(e){a.ready=e,a.booted=!0,a.connected=e.connection.connected,a.account=e.connection.account||"CircleCI",Ts()}Q.onReady(e=>{cs(e),Cn(),a.ready=e,a.booted||ra(e)});Q.onConnection(e=>{let o=a.connected;if(a.connected=e.connected,e.account&&(a.account=e.account),e.connected&&!o){Ts();return}!e.connected&&o&&(Zi(),U())});Q.onItem(e=>{if(!e||!("providerId"in e))return;let o=Ur(e.data);o&&na(o)});async function na(e){let o=we();o&&o.link.projectId!==e.projectId&&(He.reset(),a.override={directory:a.directory??"",repo:null,target:{segment:"github",owner:e.orgName||"project",repo:e.projectName},link:{projectId:e.projectId,projectName:e.projectName,orgName:e.orgName,slug:null,source:"picked",directory:a.directory??""}},U());try{let t=await Z.getRun(e.runId);await gs(t);let r=e.workflowId?a.workflows.find(n=>n.id===e.workflowId):void 0;if(r){await tr(r);let n=e.jobId?a.jobs.find(c=>c.id===e.jobId):void 0;n&&await or(n)}}catch(t){a.error=F(t),U()}}})();
