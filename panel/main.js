"use strict";(()=>{var ve=class extends Error{status;code;constructor(t,r,o){super(o),this.name="CircleCIError",this.status=t,this.code=r}},js="/api/v3",rt=20,qt=20,Ro=50,$s=50,$e=4,Oa=$e*rt,Oo=[1e3,2500],k=e=>typeof e=="object"&&e!==null?e:{},Ne=e=>Array.isArray(e)?e:[],b=e=>typeof e=="string"&&e.length>0?e:null,Fe=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function yo(e){return Ne(e).map(t=>{let r=k(t);return{type:b(r.type)??"unknown",message:b(r.message)??""}})}function wo(e){return Ne(e).map(t=>{let r=k(t);return{type:b(r.type)??"unknown",message:b(r.message)??"",description:b(r.description),url:b(r.url)}})}function tt(e){let t=k(e),r=k(t.attributes),o=k(t.references),n=k(o.event),c=k(n.attributes),a=k(c.vcs),l=k(a.commit),f=k(o.pipeline),u=k(o.trigger),S=k(u.attributes);return{id:b(t.id)??"",number:Fe(r.number)??0,phase:b(r.phase)??"unknown",outcome:b(r.current_outcome),createdAt:b(r.created_at)??"",branch:b(a.branch),tag:b(a.tag),revision:b(a.revision),commitSubject:b(l.subject),commitUrl:b(l.url),pipelineName:b(k(f.attributes).name),trigger:b(S.name)??b(k(S.event_source).type)??b(c.type),pullRequests:Ne(a.pull_requests).map(_=>{let p=k(_),m=Fe(p.number);return m!==null&&m>0?{number:m,url:b(p.url)}:null}).filter(_=>_!==null),errors:yo(r.errors),warnings:wo(r.warnings)}}function Fs(e){let t=k(e),r=k(t.attributes),o=k(r.auto_rerun);return{id:b(t.id)??"",name:b(r.name)??"Workflow",phase:b(r.phase)??"unknown",outcome:b(r.current_outcome)??b(r.outcome),createdAt:b(r.created_at),endedAt:b(r.ended_at),tag:b(r.tag),autoRerunNumber:Fe(o.number)}}function Qt(e){let t=k(e),r=k(t.attributes);return{id:b(t.id)??"",name:b(r.name)??"Job",number:Fe(r.number)??0,type:b(r.type)??"build",phase:b(r.phase)??"unknown",outcome:b(r.outcome),startedAt:b(r.started_at),endedAt:b(r.ended_at)}}function Vs(e){let t=k(e);return{num:Fe(t.num)??0,name:b(t.name)??"Step",type:b(t.type)??"run",phase:b(t.phase)??"unknown",outcome:b(t.outcome),exitCode:Fe(t.exit_code),command:b(t.command),startedAt:b(t.started_at),endedAt:b(t.ended_at)}}function Xs(e){let t=Qt(e),r=k(k(e).attributes),o=Ne(r.parallel_executions).map(k),n=o.length>0?Ne(o[0]?.steps).map(Vs):[];return{...t,errors:yo(r.errors),warnings:wo(r.warnings),steps:n,parallelExecutions:o.length}}function xo(e){let t=k(e),r=k(t.attributes),o=k(k(t.references).org);return{id:b(t.id)??"",name:b(r.name)??"Project",orgId:b(o.id)??"",orgName:b(k(o.attributes).name)??""}}function Bs(e){let t=k(e),r=k(t.attributes);return{id:b(t.id)??"",name:b(r.name)??"Organization",vcsProvider:b(k(r.vcs).provider)}}function Ao(e){let t=k(e),r=k(t.attributes),o=k(r.config);return{id:b(t.id)??"",name:b(r.name)??"Pipeline",configPath:b(o.file_path)??""}}function Ws(e){let t=k(e),r=k(t.attributes);return{id:b(t.id)??"",login:b(r.login)??"CircleCI account",name:b(r.name),avatarUrl:b(r.avatar_url)}}function Ks(e){if(!e)return;let t={};for(let[r,o]of Object.entries(e))o==null||o===""||(t[r]=String(o));return Object.keys(t).length>0?t:void 0}function ko(e){if(e)try{return JSON.parse(e)}catch{return}}function zs(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Js(e,t,r){let o=k(k(t).error),n=b(o.detail)??b(o.title)??b(o.type)??zs(e);return new ve(e,b(o.type)??`HTTP_${e}`,n)}function qs(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function Qs(e){return new Promise(t=>setTimeout(t,e))}function Io(e){async function t(a,l){let f=Ks(a.query),u=0;for(;;){let S=await e({method:a.method,path:js+a.path,...f?{query:f}:{},...a.body===void 0?{}:{body:JSON.stringify(a.body)}});if(S.status>=400){if(qs(S.status,a.method)&&u<Oo.length){await Qs(Oo[u]??2500),u+=1;continue}throw Js(S.status,ko(S.body),S.body)}return l(S.body)}}let r=a=>t(a,ko),o=a=>t(a,l=>l);async function n(a,l,f,u,S){let _=S?{...l,"page[cursor]":S}:{...l,"page[limit]":f},p;try{p=await r({method:"GET",path:a,query:_})}catch(m){if(!S&&m instanceof ve&&m.status===400)p=await r({method:"GET",path:a,query:{...l}});else throw m}return{items:Ne(k(p).data).map(u),next:b(k(k(p).page).next)}}async function c(a,l,f,u,S,_){let p=[],m,y=null;for(let N=0;N<S;N+=1){let w=await n(a,l,f,u,m);if(p.push(...w.items),y=w.next,_?.(p)||!y)break;m=y}return{items:p,next:y}}return{currentUser:async()=>{let a=await r({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),l=Ne(k(a).data)[0];if(!l)throw new ve(200,"EMPTY_USER","CircleCI returned no user.");return Ws(l)},listOrgs:async()=>(await c("/orgs",{},Ro,Bs,$e)).items,findProjectBySlug:async a=>{let l=await r({method:"GET",path:"/projects",query:{"filter[slug]":a}}),f=Ne(k(l).data)[0];return f?xo(f):null},listProjectsOfOrg:a=>c("/projects",{"filter[org_id]":a},Ro,xo,$e),listPipelines:async a=>{let l=await c("/pipelines",{"filter[project_id]":a},$s,Ao,1),f=[];for(let u of l.items)if(u.id)try{let S=await r({method:"GET",path:`/pipelines/${encodeURIComponent(u.id)}`,query:{"filter[project_id]":a}});f.push(Ao(k(S).data))}catch{f.push({...u,name:"Pipeline config"})}return f},listRuns:(a,l)=>n("/runs",{"filter[project_id]":a},rt,tt,l),listRunsUntil:(a,l,f=$e)=>c("/runs",{"filter[project_id]":a},rt,tt,f,l),listMyRuns:a=>n("/runs",{"filter[user_id]":"me"},rt,tt,a),getRun:async a=>{let l=await r({method:"GET",path:`/runs/${encodeURIComponent(a)}`});return tt(k(l).data)},findRunByNumber:async(a,l)=>(await c("/runs",{"filter[project_id]":a},rt,tt,$e,u=>u.some(S=>S.number===l))).items.find(u=>u.number===l)??null,fireRun:async a=>{let l=await r({method:"POST",path:"/runs",query:{"filter[project_id]":a.projectId},body:{data:{attributes:{checkout:{branch:a.branch}},references:{pipeline:{id:a.pipelineId}}}}}),f=b(k(k(l).data).id);if(!f)throw new ve(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return f},listWorkflows:(a,l)=>n("/workflows",{"filter[run_id]":a},qt,Fs,l),listJobs:(a,l)=>l?n("/jobs",{"filter[workflow_id]":a},qt,Qt,l):c("/jobs",{"filter[workflow_id]":a},qt,Qt,$e),getJob:async a=>{let l=await r({method:"GET",path:`/jobs/${encodeURIComponent(a)}`});return Xs(k(l).data)},condensedOutput:async(a,l,f=0)=>o({method:"GET",path:`/jobs/${encodeURIComponent(a)}/stdout/condensed`,query:{"filter[execution]":f,"filter[step_num]":l}}).then(u=>typeof u=="string"?u:""),rerunWorkflow:async(a,l)=>{let f=await r({method:"POST",path:`/workflows/${encodeURIComponent(a)}/rerun`,body:l?{is_from_failed:!0}:void 0});return b(k(k(f).data).id)??""},cancelWorkflow:async a=>{await r({method:"POST",path:`/workflows/${encodeURIComponent(a)}/cancel`})},approve:async a=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(a)}/approve`})},reject:async a=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(a)}/reject`})}}}var Co=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Ys={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function vo(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Zs(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function le(e,t){let r=(t??"").toLowerCase(),o=(e??"").toLowerCase(),n=r||o,c=vo(r)??vo(o)??"neutral",a=r?!Co.has(r):!Co.has(o)&&o!=="ended";return{label:Ys[n]??Zs(n),tone:c,active:a}}function me(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function Ve(e,t,r=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let n=t?Date.parse(t):r;if(!Number.isFinite(n)||n<o)return"";let c=Math.round((n-o)/1e3);if(c<60)return`${c}s`;let a=Math.floor(c/60),l=c%60;if(a<60)return l>0?`${a}m ${l}s`:`${a}m`;let f=Math.floor(a/60),u=a%60;return u>0?`${f}h ${u}m`:`${f}h`}function mt(e,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let o=Math.round((t-r)/1e3);if(o<45)return"just now";let n=Math.round(o/60);if(n<60)return`${n}m ago`;let c=Math.round(n/60);if(c<24)return`${c}h ago`;let a=Math.round(c/24);return a<7?`${a}d ago`:new Date(r).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function Xe(e){return e?e.slice(0,8):""}function Ue(e){return e.branch??e.tag??"detached"}function No(e){let t=e.pullRequests?.[0];return t?`PR #${t.number}`:""}var ei={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function Po(e){let t=e.trim();if(!t)return null;let r=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);r&&!t.includes("://")&&(t=`https://${r[1]}/${r[2]}/${r[3]}`);let o;try{o=new URL(t)}catch{return null}let n=o.hostname.toLowerCase();if(!n)return null;let c=o.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(c.length<2)return null;let a=c[c.length-2]??"",l=c[c.length-1]??"";return!a||!l?null:{host:n,owner:a,repo:l}}function Yt(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function Uo(e,t,r){return{segment:e&&ei[e.host]||"github",owner:e?.owner??t,repo:e?.repo??r}}function ti(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function ot(e,t){return`${ti(e)}/${t}`}function nt(e,t,r){return`${ot(e,t)}/workflows/${r}`}function _t(e,t,r,o){return`${nt(e,t,r)}/jobs/${o}`}function Mo(e){let t=null,r=null,o="";for(let n of e.split(/\r?\n/)){let c=n.trim();if(!c||c.startsWith("#")||c.startsWith(";"))continue;let a=/^\[([^\]]+)\]$/.exec(c);if(a){o=(a[1]??"").trim().toLowerCase();continue}let l=/^url\s*=\s*(.*)$/i.exec(c);if(!l)continue;let f=(l[1]??"").trim();f&&(r===null&&(r=f),(/remote\s+"origin"/i.test(o)||/remote\s+'origin'/i.test(o))&&(t=f))}return t??r}function St(e){let t=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return t&&(t[1]??"").trim()||null}var Lo="circleci",Do=16e3,ri=200,Zt=2e3;function er(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function Be(e){return le(e.phase,e.outcome).label.toLowerCase()}function oi(e,t){return e?`${e}/${t}`:t}function Go(e){let{workspace:t,run:r,workflow:o,job:n}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:r.id,runNumber:r.number,branch:r.branch,workflowId:o?.id??null,workflowName:o?.name??null,jobId:n?.id??null,jobName:n?.name??null}}function Re(e){return typeof e=="string"&&e.length>0?e:null}function Ho(e){if(typeof e!="object"||e===null||Array.isArray(e))return null;let t=e,r=Re(t.projectId),o=Re(t.projectName),n=Re(t.orgName)??"",c=Re(t.runId),a=typeof t.runNumber=="number"&&Number.isFinite(t.runNumber)?t.runNumber:null;return!r||!o||!c||a===null?null:{projectId:r,projectName:o,orgName:n,runId:c,runNumber:a,branch:Re(t.branch),workflowId:Re(t.workflowId),workflowName:Re(t.workflowName),jobId:Re(t.jobId),jobName:Re(t.jobName)}}function jo(e){let t=e.workflow?.id??"run",r=e.job?.id??"";return`${e.run.id}:${t}:${r}`}function $o(e){let{run:t,workflow:r,job:o}=e,n=o?.name??r?.name??`run #${t.number}`,c=Be(o?{phase:o.phase,outcome:o.outcome}:r||{phase:t.phase,outcome:t.outcome});return er(`${n} ${c} in CircleCI run #${t.number}`,ri)}function tr(e){let{workspace:t,run:r,workflow:o,job:n}=e;return o&&n&&n.number>0?_t(t.target,r.number,o.id,n.number).slice(0,Zt):o?nt(t.target,r.number,o.id).slice(0,Zt):ot(t.target,r.number).slice(0,Zt)}function rr(e){let{workspace:t,run:r,workflow:o,job:n,jobs:c,jobsError:a,detail:l,output:f}=e,u=[];u.push(`CircleCI run #${r.number} on ${oi(t.link.orgName,t.link.projectName)}`),u.push(`Status: ${Be({phase:r.phase,outcome:r.outcome})}`),r.pipelineName&&u.push(`Pipeline: ${r.pipelineName}`),u.push(`Ref: ${Ue(r)}${r.revision?` at ${Xe(r.revision)}`:""}`),r.commitSubject&&u.push(`Commit: ${r.commitSubject}`),u.push(`URL: ${tr(e)}`);let S=c.filter(_=>me(_.outcome));if(o){if(u.push(""),u.push(`Workflow ${o.name} (${Be(o)})`),a&&u.push(`Job listing unavailable: ${a}`),S.length>0){u.push("Failing jobs:");for(let p of S)u.push(`- ${p.name} (#${p.number})`)}let _=c.filter(p=>!S.includes(p));if(_.length>0){u.push("Other jobs:");for(let p of _)u.push(`- ${p.name}: ${Be({phase:p.phase,outcome:p.outcome})}`)}}if(n&&l){if(u.push(""),u.push(`Job ${l.name} (#${l.number})`),l.errors.length>0){u.push("Errors:");for(let p of l.errors)u.push(`- ${p.type}: ${p.message}`)}let _=l.steps.filter(p=>p.outcome==="failed");if(_.length>0){u.push("Failed steps:");for(let p of _)u.push(`- step ${p.num} "${p.name}"${p.exitCode!==null?` (exit ${p.exitCode})`:""}`),p.command&&u.push(`  command: ${p.command}`)}}return f&&f.trim()&&(u.push(""),u.push("Condensed output:"),u.push(f.trim())),er(u.join(`
`),Do)}function Fo(e){return er(`Investigate and fix this CircleCI failure.

${rr(e)}`,Do)}var C="openchamber.sdk";var Tt="data-oc-scrolling",or=`
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
:hover, [${Tt}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Tt}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Tt}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Tt}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function nr(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",o=>{let n=o.target===e?t:o.target;if(!(n instanceof Element))return;n.hasAttribute("data-oc-scrolling")||n.setAttribute("data-oc-scrolling","");let c=r.get(n);c!==void 0&&clearTimeout(c),r.set(n,setTimeout(()=>{r.delete(n),n.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var ni=`(${nr.toString()})(document);`;var Wo=/^[a-z][a-z0-9-]{0,39}$/;var Vo=e=>Object(e)===e&&!Array.isArray(e),sr=(e,t)=>Object.keys(e).every(r=>t.includes(r)),Xo=e=>String(e)===e&&e.length>=1&&e.length<=60,Bo=e=>String(e)===e&&e.length>=1&&e.length<=80,Ko=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let r of e){if(!Vo(r)||!Wo.test(r.id)||!Xo(r.label)||r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1||t.has(r.id))return!1;if(t.add(r.id),r.kind==="button"){if(!sr(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!sr(r,["kind","id","label","value","options","disabled"])||!Bo(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let o=new Set;for(let n of r.options){if(!Vo(n)||!sr(n,["value","label"])||!Bo(n.value)||!Xo(n.label)||o.has(n.value))return!1;o.add(n.value)}if(!o.has(r.value))return!1}return!0};var zo=["{id}","{segment}","{segments+}"];var Ha=new Set(zo);var Jo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var $a=new Set(Jo);var ir=e=>"bytes"in e?e.bytes.byteLength:e.content.length,qo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==t.bytes[r])return!1;return!0};var Qo=/^[A-Za-z0-9_-]{1,80}$/;var Yo=["left","right","top","bottom"];var Zo=(e,t=0,r={remaining:16e3})=>{if(--r.remaining<0||t>=32)return!1;if(e===null)return!0;let o=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let n of o)if(!Zo(n,t+1,r))return!1;return!0},ar=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(ar);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(ar)}return String(e)===e||Number.isFinite(e)},cr=e=>{try{return String(e.id)!==e.id||!Qo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Yo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Zo(e.data)||!ar(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var dr=2e3;var tn=["file","directory","other","missing"],ur=e=>!!(e&&"sessionId"in e),pr=e=>!!(e&&"sent"in e&&!("sessionId"in e));var rn=/^[0-9a-f]{7,64}$/i,fr=e=>rn.test(e),ht=500,gt=32e3,on=16e3,nn=128,sn=200,an=2e3,cn=16e3,ln=80,dn=200,un=16e3;var pn=2e3;var Er=2e4,bt=1024,Rt=2e6;var Ot=64e3,xt=8e3,mr=4e3;var _r=96e4,ii=60*6e4;var fn=999,En=1e4,st=500,mn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],_n=["stopped","starting","ready","failed"],ai=new Set(mn),Sn=e=>ai.has(e),Tn=e=>e&&Sn(e)?e:"HOST_REJECTED",We=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(We):Object(e)===e?Object.values(e).every(We):!1,hn=e=>We(e)&&JSON.stringify(e).length<=un,en=e=>e?.trim().slice(0,dn)??"",Ke=e=>{let t=e.id.trim().slice(0,nn),r=e.title.trim().slice(0,sn),o=e.url.trim().slice(0,an),n=e.text?.trim().slice(0,cn),c=e.author?.trim().slice(0,ln),a=e.kind==="pull"?"pull":"issue",l={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:a};if(n&&(l.text=n),c&&(l.author=c),a==="pull"){let f=en(e.branches?.head),u=en(e.branches?.base);f&&u&&(l.branches={head:f,base:u})}return hn(e.data)&&(l.data=e.data),l},Sr=e=>{let t=Ke(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Tr=e=>{let t={text:e.text.trim().slice(0,on)};return e.send&&(t.send=!0),t},hr=e=>e===null||!Number.isFinite(e)?null:Math.min(fn,Math.max(0,Math.round(e))),gr=e=>Number.isFinite(e)?Math.min(En,Math.max(0,Math.ceil(e))):0;var ze=e=>e.length>0&&e.length<=bt&&!e.includes("\0")&&!e.includes("\\");var At=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>pn?!1:!e.split("/").some(r=>r==="."||r===".."),ci=new Set(_n),br=e=>!!(e&&"status"in e&&ci.has(String(e.status))&&!("body"in e)),kt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Rr=e=>!!(e&&"content"in e&&String(e.content)===e.content),Or=e=>!!(e&&"written"in e&&e.written===!0),xr=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),li=new Set(tn),Ar=e=>!!(e&&"kind"in e&&"size"in e&&li.has(String(e.kind))&&Number.isFinite(e.size)),kr=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),di=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),ui=e=>Object(e)===e?e:null,lr=e=>String(e)===e&&e.length>0,pi=e=>{if(!lr(e.id))return null;if(e.ok===!0){let t={channel:C,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&lr(e.error)?{channel:C,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Tn(lr(e.code)?e.code:void 0)}:null},yr=e=>{let t=ui(e);return!t||t.channel!==C||t.v!==1?null:t.type==="result"?pi(t):!di.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var gn=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,fi=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",x=class extends Error{code;constructor(t,r){super(r),this.name="HostRequestError",this.code=t}},bn=()=>Promise.reject(new x("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),yt=()=>Promise.reject(new x("BAD_PATH",`File path must be 1 to ${bt} characters without NUL or backslash.`)),wt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new x("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},I=e=>(e.value+=1,`oc-${e.value}`),Nr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new x("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(i=>i===t.parent),o=e.requestTimeoutMs??Er,n=new Set,c=new Set,a=new Set,l=new Set,f=new Set,u=new Set,S=new Set,_=new Set,p=new Set,m=new Set,y=new Set,N=new Set,w=[],h=null,D=null,W=new Set,Ee=new Set,te=null,pe=null,ne=!1,Te=new Map,he=new Map,ge=new Map,se=!1,T={value:0},g=null,be=null,Ze=!1,et=!1,lo=null,uo=i=>i?{sessionId:i.id,phase:i.busy?"started":"completed"}:null,ie=i=>{t.parent.postMessage(i,"*")},po=()=>{se||t.parent===t||N.size===0||g?.features?.lateGenerateResults!==!0||ie({channel:C,v:1,type:"generate-late-listen"})},$=(i,d)=>{for(let O of i)try{O(d)}catch(A){console.error(A)}},fo=i=>{if(!(i instanceof MessageEvent)||!r(i.source))return;let d=yr(i.data);if(!d)return;if(d.type==="workspace"){let A=he.get(d.payload.subscriptionId);A&&$([A],d.payload.snapshot);return}if(d.type==="shells"){let A=ge.get(d.payload.subscriptionId);A&&$([A],d.payload.snapshot);return}if(d.type==="ready"){g=d.payload,be=uo(d.payload.session),$(n,d.payload),$(c,d.payload.directory),$(a,d.payload.session),be&&$(l,be),$(f,d.payload.connection),$(u,d.payload.settings),$(S,d.payload.item),d.payload.block&&$(_,d.payload.block),po();return}if(d.type==="service-event"){$(p,d.payload);return}if(d.type==="generate-late"){N.size===0?w.push(d.payload):$(N,d.payload);return}if(d.type==="directory"){g&&(g={...g,directory:d.payload.directory}),$(c,d.payload.directory);return}if(d.type==="session"){g&&(g={...g,session:d.payload.session}),d.payload.session?be?.sessionId!==d.payload.session.id&&(be=uo(d.payload.session)):be=null,$(a,d.payload.session);return}if(d.type==="session-lifecycle"){be=d.payload,$(l,d.payload);return}if(d.type==="connection"){g&&(g={...g,connection:d.payload.connection}),$(f,d.payload.connection);return}if(d.type==="settings"){g&&(g={...g,settings:d.payload.settings}),$(u,d.payload.settings);return}if(d.type==="item"){g&&(g={...g,item:d.payload.item}),$(S,d.payload.item);return}if(d.type==="status-control-event"){$(m,d.payload);return}if(d.type==="popover-closed"){$(y,d.payload);return}if(d.type==="action"){let A=G=>{se||ie({channel:C,v:1,type:"action-result",id:d.id,payload:G})},H=D;if(!H){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>H(d.payload)).then(()=>A({ok:!0}),G=>{let q=(G instanceof Error?G.message:String(G)).trim();A({ok:!1,error:(q||"Action failed.").slice(0,st)})});return}if(d.type==="file-open"){let A=d.payload;if(pe&&qo(pe,A))return;pe=A,$(W,d.payload);return}if(d.type==="file-saved"){$(Ee,d.payload.version);return}if(d.type==="file-snapshot"){let A=q=>{se||ie({channel:C,v:1,type:"file-snapshot-result",id:d.id,payload:q})},H=q=>A({error:(q.trim()||"Could not read the edited file.").slice(0,st)}),G=te;if(!G){H("This extension does not edit files.");return}Promise.resolve().then(()=>G(d.payload.purpose)).then(q=>{if(ir(q)>2e7){H(`The file is over ${2e7} ${"bytes"in q?"bytes":"characters"}.`);return}if(q.version.length>256){H(`The snapshot version is over ${256} characters.`);return}A({snapshot:"bytes"in q?{bytes:q.bytes,version:q.version}:{content:q.content,version:q.version}})},q=>H(q instanceof Error?q.message:String(q)));return}if(d.type==="resolve"){let A=G=>{ie({channel:C,v:1,type:"resolve-result",id:d.id,payload:G})},H=h;if(!H){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>H(d.payload)).then(G=>A({item:G?Ke(G):null}),G=>{let q=(G instanceof Error?G.message:String(G)).trim();A({error:(q||"Command failed.").slice(0,st)})});return}let O=Te.get(d.id);if(O){if(clearTimeout(O.timer),Te.delete(d.id),d.ok){O.resolve(d.payload);return}O.reject(new x(d.code,d.error))}};t.addEventListener("message",fo),ie({channel:C,v:1,type:"hello"});let ee=(i,d=o)=>se||t.parent===t?Promise.reject(new x("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((O,A)=>{let H=setTimeout(()=>{Te.delete(i.id),A(new x("HOST_TIMEOUT","Host did not answer in time."))},d);Te.set(i.id,{resolve:O,reject:A,timer:H}),ie(i)}),K=i=>ee(i).then(()=>{}),J={channel:C,v:1},Kt=i=>{!se&&t.parent!==t&&ie(i)},Eo=()=>Kt({...J,type:"file-save"}),mo=i=>{!gn(i)||!fi(i)||(i.preventDefault(),Eo())},_o=i=>{!gn(i)||i.key!=="Escape"||g?.surface!=="popover"||!g.popover||(i.preventDefault(),go(g.popover.id,"escape").catch(()=>{}))},pt=()=>{let i=g?.surface==="popover"?g.popover:void 0;if(!i)return;let d=Ze||et;lo!==d&&(lo=d,bo(i.id,d).catch(()=>{}))},ft=()=>{g?.surface!=="popover"||Ze||(Ze=!0,pt())},So=i=>{g?.surface!=="popover"||i.relatedTarget!==null||!Ze||(Ze=!1,pt())},To=()=>{g?.surface!=="popover"||et||(et=!0,pt())},ho=()=>{g?.surface!=="popover"||!et||(et=!1,pt())},fe=(i,d=1024)=>{if(!i.trim()||i.length>d)throw new x("HOST_REJECTED",`Identity must contain 1 to ${d} characters.`)},zt=async i=>{i.kind!=="projects"&&fe(i.projectId);let d=await ee({...J,type:"workspace-read",id:I(T),payload:i});if(!d||!("kind"in d)||!("state"in d)||d.kind!==i.kind)throw new x("HOST_REJECTED","Host did not return workspace data.");return d},Jt=async(i,d)=>{i.kind!=="projects"&&fe(i.projectId);let O=I(T);he.set(O,d);try{await K({...J,type:"workspace-subscribe",id:I(T),payload:{subscriptionId:O,query:i}})}catch(A){throw he.delete(O),se||ie({...J,type:"workspace-unsubscribe",id:I(T),payload:{subscriptionId:O}}),A}return()=>{!he.delete(O)||se||ie({...J,type:"workspace-unsubscribe",id:I(T),payload:{subscriptionId:O}})}},Hs=async(i,d)=>{i.kind==="session"&&fe(i.sessionId),i.kind==="project"&&fe(i.projectId);let O=I(T);ge.set(O,d);try{await K({...J,type:"shells-subscribe",id:I(T),payload:{subscriptionId:O,scope:i}})}catch(A){throw ge.delete(O),se||ie({...J,type:"shells-unsubscribe",id:I(T),payload:{subscriptionId:O}}),A}return()=>{!ge.delete(O)||se||ie({...J,type:"shells-unsubscribe",id:I(T),payload:{subscriptionId:O}})}},Et=async i=>{if("key"in i&&(i.key.length===0||i.key.length>128))throw new x("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!We(i.value))throw new x("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>65536)throw new x("HOST_REJECTED","Storage value exceeds 64 KiB.");if(i.scope==="device"&&g?.features?.deviceStorage!==!0)throw new x("UNSUPPORTED","This host does not support device storage.");let d=await ee({...J,type:"storage",id:I(T),payload:i});if(!d||!("storage"in d)||d.op!==i.op)throw new x("HOST_REJECTED","Host did not return storage data.");return d},go=(i,d)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):K({...J,type:"popover-close",id:I(T),payload:d?{id:i,reason:d}:{id:i}}),bo=(i,d)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):K({...J,type:"popover-anchor",id:I(T),payload:{id:i,active:d}});return t.addEventListener("keydown",_o,!0),t.addEventListener("pointerover",ft),t.addEventListener("pointermove",ft),t.addEventListener("pointerout",So),t.addEventListener("focus",To),t.addEventListener("blur",ho),{onAction:i=>(D=i,()=>{D===i&&(D=null)}),listProjects:async()=>{let i=await zt({kind:"projects"});if(i.kind!=="projects")throw new x("HOST_REJECTED","Expected projects.");return i},listWorktrees:async i=>{let d=await zt({kind:"worktrees",projectId:i});if(d.kind!=="worktrees")throw new x("HOST_REJECTED","Expected worktrees.");return d},listSessions:async i=>{let d=await zt({kind:"sessions",projectId:i});if(d.kind!=="sessions")throw new x("HOST_REJECTED","Expected sessions.");return d},onProjects:i=>Jt({kind:"projects"},d=>{d.kind==="projects"&&i(d)}),onWorktrees:(i,d)=>Jt({kind:"worktrees",projectId:i},O=>{O.kind==="worktrees"&&d(O)}),onSessions:(i,d)=>Jt({kind:"sessions",projectId:i},O=>{O.kind==="sessions"&&d(O)}),onRunningShells:(i,d)=>Hs(i,d),readShellOutput:async(i,d)=>{fe(i,128);let O=d?.cursor;if(O!==void 0&&(!Number.isInteger(O)||O<0))throw new x("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=d?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>65536))throw new x("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let G=await ee({...J,type:"shell-output",id:I(T),payload:{shellId:i,cursor:O,tailBytes:A}});if(!G||typeof G.output!="string"||!Number.isFinite(G.cursor))throw new x("HOST_REJECTED","Host did not return shell output.");return G},stopShell:async i=>{if(fe(i,128),(await ee({...J,type:"shell-stop",id:I(T),payload:{shellId:i}}))?.stopped!==!0)throw new x("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async i=>{fe(i),await K({...J,type:"open-session",id:I(T),payload:{sessionId:i}})},storage:{get:async(i,d)=>{let O=wt(d),A={op:"get",key:i};O&&(A.scope=O);let H=await Et(A);return H.op==="get"&&H.found?H.value:void 0},set:async(i,d,O)=>{let A=wt(O),H={op:"set",key:i,value:d};A&&(H.scope=A),await Et(H)},delete:async(i,d)=>{let O=wt(d),A={op:"delete",key:i};O&&(A.scope=O),await Et(A)},keys:async i=>{let d=wt(i),O={op:"keys"};d&&(O.scope=d);let A=await Et(O);if(A.op!=="keys")throw new x("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:i=>(n.add(i),g&&i(g),()=>{n.delete(i)}),onDirectory:i=>(c.add(i),g&&i(g.directory),()=>{c.delete(i)}),onSession:i=>(a.add(i),g&&i(g.session),()=>{a.delete(i)}),onSessionLifecycle:i=>(l.add(i),be&&i(be),()=>{l.delete(i)}),onConnection:i=>(f.add(i),g&&i(g.connection),()=>{f.delete(i)}),onSettings:i=>(u.add(i),g&&i(g.settings),()=>{u.delete(i)}),onItem:i=>(S.add(i),g&&i(g.item),()=>{S.delete(i)}),onBlock:i=>(_.add(i),g?.block&&i(g.block),()=>{_.delete(i)}),onServiceEvent:i=>(p.add(i),()=>{p.delete(i)}),onStatusControl:i=>(m.add(i),()=>{m.delete(i)}),onPopoverClosed:i=>(y.add(i),()=>{y.delete(i)}),setStatusControls:i=>g?.features?.statusControls!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support status controls.")):Ko(i)?K({...J,type:"status-controls",id:I(T),payload:{controls:i}}):Promise.reject(new x("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:i=>g?.features?.popovers!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):cr(i)?K({...J,type:"popover-open",id:I(T),payload:i}):Promise.reject(new x("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:go,setPopoverAnchorActive:bo,onResolve:i=>(h=i,()=>{h===i&&(h=null)}),toast:i=>{let d=i.message.trim();return!d||d.length>ht?Promise.reject(new x("HOST_REJECTED",`Toast message must contain 1 to ${ht} characters.`)):i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>gt)?Promise.reject(new x("HOST_REJECTED",`Toast copy text must contain 1 to ${gt} characters.`)):K({channel:C,v:1,type:"toast",id:I(T),payload:{...i,message:d}})},openUrl:i=>K({channel:C,v:1,type:"open-url",id:I(T),payload:{url:i}}),openCommit:i=>fr(i)?K({channel:C,v:1,type:"open-commit",id:I(T),payload:{sha:i}}):Promise.reject(new x("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:i=>K({channel:C,v:1,type:"block-answer",id:I(T),payload:{text:i.trim().slice(0,dr)}}),openSurface:i=>K({channel:C,v:1,type:"open-surface",id:I(T),payload:{surfaceId:i}}),writeClipboard:i=>K({channel:C,v:1,type:"clipboard-write",id:I(T),payload:{text:i}}),compose:i=>K({channel:C,v:1,type:"compose",id:I(T),payload:i}),attach:i=>K({channel:C,v:1,type:"attach",id:I(T),payload:Ke(i)}),startSession:async i=>{i.projectId!==void 0&&fe(i.projectId);let d=i.worktree;d&&d!==!0&&(d.kind==="existing"?fe(d.directory):(d.name!==void 0&&fe(d.name,200),d.baseBranch!==void 0&&fe(d.baseBranch,200)));let O=await ee({channel:C,v:1,type:"start-session",id:I(T),payload:Sr(i)},e.requestTimeoutMs??18e4);if(!ur(O))throw new x("HOST_REJECTED","Host did not return a session.");return O},prompt:i=>ee({channel:C,v:1,type:"prompt",id:I(T),payload:Tr(i)}).then(d=>{if(!pr(d))throw new x("HOST_REJECTED","Host did not return a prompt result.");return d}),sessionLink:i=>K({channel:C,v:1,type:"session-link",id:I(T),payload:Ke(i)}),close:()=>K({channel:C,v:1,type:"close",id:I(T)}),oauthStart:()=>K({channel:C,v:1,type:"oauth-start",id:I(T)}),oauthDisconnect:()=>K({channel:C,v:1,type:"oauth-disconnect",id:I(T)}),request:i=>(At(i.path)?ee({channel:C,v:1,type:"request",id:I(T),payload:i}):bn()).then(d=>{if(!kt(d))throw new x("HOST_REJECTED","Host request result was empty.");return d}),serviceRequest:i=>(At(i.path)?ee({channel:C,v:1,type:"service-request",id:I(T),payload:i}):bn()).then(d=>{if(!kt(d))throw new x("HOST_REJECTED","Host service request result was empty.");return d}),serviceStatus:()=>ee({channel:C,v:1,type:"service-status",id:I(T)}).then(i=>{if(!br(i))throw new x("HOST_REJECTED","Host did not return service status.");return i}),readFile:i=>(ze(i)?ee({channel:C,v:1,type:"file-read",id:I(T),payload:{path:i}}):yt()).then(d=>{if(!Rr(d))throw new x("HOST_REJECTED","Host did not return file content.");return d}),writeFile:(i,d)=>ze(i)?d.length>Rt?Promise.reject(new x("FILE_TOO_LARGE",`Content is over ${Rt} characters.`)):ee({channel:C,v:1,type:"file-write",id:I(T),payload:{path:i,content:d}}).then(O=>{if(!Or(O))throw new x("HOST_REJECTED","Host did not confirm the write.");return O}):yt(),listDir:i=>(ze(i)?ee({channel:C,v:1,type:"file-list",id:I(T),payload:{path:i}}):yt()).then(d=>{if(!xr(d))throw new x("HOST_REJECTED","Host did not return directory entries.");return d}),stat:i=>(ze(i)?ee({channel:C,v:1,type:"file-stat",id:I(T),payload:{path:i}}):yt()).then(d=>{if(!Ar(d))throw new x("HOST_REJECTED","Host did not return file status.");return d}),generate:i=>{let d=i.prompt.trim(),O=i.system?.trim();if(d.length===0||d.length>Ot)return Promise.reject(new x("HOST_REJECTED",`Prompt must be 1 to ${Ot} characters.`));if(O!==void 0&&(O.length===0||O.length>xt))return Promise.reject(new x("HOST_REJECTED",`System prompt must be 1 to ${xt} characters.`));let A=i.maxOutputTokens===void 0?void 0:Math.min(mr,Math.max(1,Math.floor(i.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new x("HOST_REJECTED","maxOutputTokens must be a number."));let H={prompt:d};return O!==void 0&&(H.system=O),A!==void 0&&(H.maxOutputTokens=A),ee({channel:C,v:1,type:"generate",id:I(T),payload:H},e.requestTimeoutMs??_r).then(G=>{if(!kr(G))throw new x("HOST_REJECTED","Host did not return generated text.");return G})},onLateGenerateResult:i=>{N.add(i);for(let d of w.splice(0))$([i],d);return po(),()=>{N.delete(i)}},setBadge:i=>K({channel:C,v:1,type:"badge",id:I(T),payload:{count:hr(i)}}),setHeight:i=>K({channel:C,v:1,type:"resize",id:I(T),payload:{height:gr(i)}}),onFileOpen:i=>(W.add(i),ne||(ne=!0,t.addEventListener("keydown",mo,!0)),pe&&i(pe),()=>{W.delete(i)}),onFileSnapshot:i=>(te=i,()=>{te===i&&(te=null)}),onFileSaved:i=>(Ee.add(i),()=>{Ee.delete(i)}),reportFileChange:i=>Kt({...J,type:"file-change",payload:{dirty:i.dirty,edited:i.edited}}),requestFileSave:Eo,reportFileUnsupported:()=>Kt({...J,type:"file-unsupported"}),dispose:()=>{for(let i of he.keys())ie({...J,type:"workspace-unsubscribe",id:I(T),payload:{subscriptionId:i}});he.clear();for(let i of ge.keys())ie({...J,type:"shells-unsubscribe",id:I(T),payload:{subscriptionId:i}});ge.clear(),se=!0,h=null,D=null,te=null,W.clear(),Ee.clear(),ne&&t.removeEventListener("keydown",mo,!0),t.removeEventListener("message",fo),t.removeEventListener("keydown",_o,!0),t.removeEventListener("pointerover",ft),t.removeEventListener("pointermove",ft),t.removeEventListener("pointerout",So),t.removeEventListener("focus",To),t.removeEventListener("blur",ho);for(let i of Te.values())clearTimeout(i.timer),i.reject(new x("HOST_UNAVAILABLE","Host client was disposed."));Te.clear(),n.clear(),c.clear(),a.clear(),l.clear(),f.clear(),u.clear(),S.clear(),_.clear(),p.clear(),m.clear(),y.clear(),N.clear(),w.length=0}}};var xn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var rc=new Set(xn);var Ei=10*6e4;var mi=10*6e4;var _i=10*6e4;var Si=10*6e4;var An=["none","agent","user"];var nc=new Set(An);var Q=Nr(),kn=async e=>Q.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function re(e,t){try{await Q.toast({kind:e,message:t})}catch{}}function it(e){return Q.readFile(e)}function yn(e){return{providerId:Lo,id:jo(e).slice(0,128),title:$o(e),url:tr(e),kind:"issue",text:rr(e),data:Go(e)}}async function wn(e){await Q.attach(yn(e))}async function In(e,t={}){await Q.startSession({...yn(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}async function Cn(e,t={}){await Q.prompt({text:Fo(e),send:t.send??!0})}var Ti=["all","failed","running"];function vn(e){return Ti.includes(e)?e:"all"}function hi(e){return[`#${e.number}`,Ue(e),Xe(e.revision),e.commitSubject??"",e.pipelineName??"",...(e.pullRequests??[]).map(t=>`#${t.number}`)].filter(Boolean).join(" ").toLowerCase()}var Nn={branch:null,prNumbers:[]};function gi(e){return!e.branch&&e.prNumbers.length===0}function Pn(e,t){if(gi(t)||t.branch&&e.branch===t.branch)return!0;let r=e.pullRequests??[];return t.prNumbers.some(o=>r.some(n=>n.number===o))}function Pr(e,t){return e.filter(r=>Pn(r,t))}function bi(e,t,r="",o){if(t==="failed"&&!me(e.outcome)||t==="running"&&!le(e.phase,e.outcome).active||o&&!Pn(e,o))return!1;let n=r.trim().toLowerCase();return n===""||hi(e).includes(n)}function Un(e,t,r="",o){return e.filter(n=>bi(n,t,r,o))}function at(e){return e.some(t=>le(t.phase,t.outcome).active)}function Ri(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return null;let r=/\/(pull|pull-requests|merge_requests)\/(\d+)/.exec(t.pathname),o=r?Number.parseInt(r[2]??"",10):Number.NaN;return Number.isInteger(o)&&o>0?o:null}catch{return null}}function Oi(e,t){return e?t===e||t.startsWith(e.endsWith("/")?e:`${e}/`):!1}function xi(e,t){return e.find(r=>Oi(r.directory,t))?.id??null}function Ai(e,t){return e.find(o=>o.directory===t&&o.branch.length>0)?.branch??null}async function Mn(e){let t=null,r=null;try{let c=await e.readFile(".git/HEAD");t=St(c.content),t&&(r="head")}catch{}let o=null;if(e.session||!t)try{o=xi((await e.host.listProjects()).projects,e.directory)}catch{}if(o&&!t)try{t=Ai((await e.host.listWorktrees(o)).worktrees,e.directory),t&&(r="worktree")}catch{}let n=[];if(o&&e.session)try{n=((await e.host.listSessions(o)).sessions.find(l=>l.id===e.session?.id)?.links??[]).filter(l=>l.kind==="change").map(l=>Ri(l.url)).filter(l=>l!==null)}catch{}return!t&&n.length===0?null:{branch:t,via:r,prNumbers:n}}function It(e){return e?{branch:e.branch,prNumbers:e.prNumbers}:Nn}function E(e,t={},...r){let o=document.createElement(e);t.className&&(o.className=t.className),t.text!==void 0&&(o.textContent=t.text),t.title&&(o.title=t.title),t.style&&o.setAttribute("style",t.style),t.role&&o.setAttribute("role",t.role),t.ariaLabel&&o.setAttribute("aria-label",t.ariaLabel);for(let n of r)n==null||n===!1||o.append(typeof n=="string"?document.createTextNode(n):n);return o}function Ln(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function Je(e,t){return t?E("div",{className:"meta-row"},E("span",{className:"meta-label",text:e}),E("span",{className:"meta-value",text:t})):null}var ki={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function F(e){return e instanceof ve?e.message:e instanceof x?ki[e.code]??e.message:e instanceof Error?e.message:String(e)}function yi(e){return e instanceof x?e.code:null}function ct(e){let t=yi(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}function Dn(e){let t=null,r=()=>{t!==null&&(window.clearTimeout(t),t=null)};return{arm:()=>{r(),!(!e.enabled()||!e.active())&&(t=window.setTimeout(()=>{t=null,e.onTick()},e.delayMs))},stop:r}}var wi=`
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

/* Search field plus the current-work scope toggle, under the filter tabs. */
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.filter-row > * { min-width: 0; }

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
`,Gn="circleci-shared-style";function Hn(){if(document.getElementById(Gn))return;let e=document.createElement("style");e.id=Gn,e.textContent=wi,document.head.append(e)}async function jn(e,t,r,o){try{return await e.rerunWorkflow(t.id,r.fromFailed),await o("success",`Rerun started for ${t.name}.`),!0}catch(n){return await o("error",F(n)),!1}}async function $n(e,t,r,o){if(t.length===0)return await o("info",r.fromFailed?"No failed workflow to rerun.":"This run has no workflows to rerun."),{started:0,failed:0,reasons:[]};let n=0,c=0,a=[];for(let l of t)try{await e.rerunWorkflow(l.id,r.fromFailed),n+=1}catch(f){c+=1;let u=F(f);a.includes(u)||a.push(u)}if(n>0&&await o("success",`Started ${n} rerun${n===1?"":"s"}.`),c>0){let l=a[0],f=a.length-1;await o("error",`${c} rerun${c===1?"":"s"} could not be started${l?`: ${l}`:""}${f>0?` (+${f} more)`:""}.`)}return{started:n,failed:c,reasons:a}}async function Fn(e,t,r){try{return await e.cancelWorkflow(t.id),await r("success",`Cancellation requested for ${t.name}.`),!0}catch(o){return await r("error",F(o)),!1}}async function Vn(e,t,r){try{return await e.approve(t.id),await r("success",`Approved ${t.name}.`),!0}catch(o){return await r("error",F(o)),!1}}async function Xn(e,t,r){try{return await e.reject(t.id),await r("success",`Rejected ${t.name}.`),!0}catch(o){return await r("error",F(o)),!1}}var Bn="prefs";function Ii(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)}function Wn(e){return`project:${Ii(e)}`}function Kn(e){return`pipelines:${e}`}function Ur(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Pe(e){return typeof e=="string"&&e.length>0?e:null}function Ci(e){if(!Ur(e))return null;let t=Pe(e.projectId),r=Pe(e.projectName),o=Pe(e.orgName),n=Pe(e.directory);if(!t||!r||!o||!n)return null;let c=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:r,orgName:o,slug:Pe(e.slug),source:c,directory:n}}async function zn(e,t){let r=Ci(await e.get(Wn(t)));return!r||r.directory!==t?null:r}async function Mr(e,t,r){await e.set(Wn(t),{projectId:r.projectId,projectName:r.projectName,orgName:r.orgName,slug:r.slug,source:r.source,directory:t})}var vi={autoRefresh:!0};function Ni(e){return Ur(e)?{autoRefresh:e.autoRefresh!==!1}:{...vi}}async function Lr(e){return Ni(await e.get(Bn))}async function Jn(e,t){let o={...await Lr(e),...t};return await e.set(Bn,{autoRefresh:o.autoRefresh}),o}function Pi(e){if(!Array.isArray(e))return null;let t=[];for(let r of e){if(!Ur(r))continue;let o=Pe(r.id),n=Pe(r.name);!o||!n||t.push({id:o,name:n,configPath:Pe(r.configPath)??""})}return t.length>0?t:null}async function qn(e,t){return Pi(await e.get(Kn(t)))}async function Qn(e,t,r){await e.set(Kn(t),r.map(o=>({id:o.id,name:o.name,configPath:o.configPath})))}var Ui=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Mi=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Yn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of Ui)t.style.setProperty(r,e.tokens[o]);for(let[r,o,n]of Mi){let c=e.tokens[n]??"";t.style.setProperty(r,c),t.style.setProperty(o,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Dr=(e,t)=>{Yn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Li={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},j=(e,t)=>`var(--${e}, var(--oc-${Li[e]}, ${t}))`,xe=j("surface-background","transparent"),vt=j("surface-elevated","transparent"),qe=j("surface-elevated-foreground","inherit"),ae=j("surface-foreground","inherit"),V=j("surface-muted-foreground","gray"),Di=j("surface-muted","transparent"),Me=j("interactive-border","currentColor"),oe=j("interactive-hover","transparent"),Le=j("interactive-active","transparent"),Gr=j("interactive-selection","transparent"),Hr=j("interactive-selection-foreground","inherit"),Oe=j("primary","currentColor"),jr=j("primary-text","inherit"),$r=j("error-text","inherit"),Gi=j("font-sans","inherit"),Fr=j("font-mono","monospace"),rs=j("radius","9px"),Vr=`calc(${rs} - 2px)`,Zn=`calc(${rs} - 4px)`,X=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,es=`background-image: linear-gradient(${oe}, ${oe});`,Xr=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Br="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",ts="box-shadow: var(--oc-sdk-lit);",Wr=`inset 0 0.5px 0 0 ${X(ae,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Hi=`
:root {
  --oc-sdk-edge: ${X(ae,16)};
  --oc-sdk-field-bg: ${vt};
  --oc-sdk-raised-bg: ${xe};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${X(ae,14)};
  --oc-sdk-field-bg: ${X(xe,50,vt)};
  --oc-sdk-raised-bg: ${vt};
  --oc-sdk-field-lift: ${Wr};
  --oc-sdk-raised-lift: ${Wr};
  --oc-sdk-lit: ${Wr};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,Ct=e=>{let t=j(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${j(`${e}-text`,"inherit")}; }`},ji=`
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
`,os=`${Hi}
.oc-sdk { color: ${ae}; font-family: ${Gi}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${es} }
.oc-sdk-mono { font-family: ${Fr}; }
.oc-sdk-muted { color: ${V}; }
${Ct("success")}${Ct("warning")}${Ct("error")}${Ct("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${Oe}; --oc-sdk-tone-text: ${jr}; }

.oc-sdk-btn { border-radius: ${Vr}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Zn}; }
.oc-sdk-btn[data-variant="default"] { color: ${jr}; background: ${X(Oe,10,xe)}; border-color: ${X(Oe,12)}; ${ts} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${X(Oe,16,xe)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${X(Oe,22,xe)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Di}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Le}, ${Le}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${qe}; ${Br} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Le}, ${Le}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${oe}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Le}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${j("status-error","red")}; color: ${$r}; background: ${X("var(--oc-sdk-tone)",7,xe)}; border-color: ${X("var(--oc-sdk-tone)",12)}; ${ts} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${X("var(--oc-sdk-tone)",9,xe)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${X("var(--oc-sdk-tone)",11,xe)}; box-shadow: none; }

.oc-sdk-field-note { color: ${V}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${$r}; }
.oc-sdk-input { border-radius: ${Vr}; background: var(--oc-sdk-field-bg); color: ${qe}; ${Xr("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${V}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Xr(X(ae,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Xr(j("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Fr}; }

.oc-sdk-search-icon { color: ${V}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${Oe}; }
.oc-sdk-search-clear { border-radius: ${Zn}; color: ${V}; }
.oc-sdk-search-clear:hover { background: ${oe}; color: ${ae}; }

.oc-sdk-trigger { border-radius: ${Vr}; background: var(--oc-sdk-raised-bg); color: ${qe}; ${Br} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${oe}, ${oe}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Le}, ${Le}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${V}; }
.oc-sdk-trigger-chevron { color: ${V}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${qe}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${vt}; background-clip: padding-box; color: ${qe}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${oe}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Gr}; color: ${Hr}; }
.oc-sdk-option-check { color: ${ae}; }
.oc-sdk-option[data-destructive="true"] { color: ${$r}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${X(j("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${V}; }
.oc-sdk-popup-empty { color: ${V}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Me}; border-radius: 4px; color: ${ae}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${X(ae,60,Me)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Me}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${xe}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${Oe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${es} }
.oc-sdk-check-desc { color: ${V}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${X(ae,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${V}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ae}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Hr}; background: ${Gr}; border-color: ${Me}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${qe}; background: var(--oc-sdk-raised-bg); ${Br} }
.oc-sdk-tab-count { color: ${V}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${X(ae,6)}; color: ${V}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${X("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${oe}; }
.oc-sdk-row[aria-selected="true"] { background: ${Gr}; color: ${Hr}; }
.oc-sdk-row-lead { font-family: ${Fr}; color: ${V}; }
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
.oc-sdk-progress-track { border-radius: 9999px; background: ${X(ae,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${Oe}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${j("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${j("success-text","inherit")}; }

.oc-sdk-text a { color: ${jr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${X(Me,60)}; }
`,U=`
${or}
${ji}
${os}`;var ns="oc-sdk-ui-style",_e=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},M=e=>{let t=document.getElementById(ns);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}nr(document);let r=document.createElement("style");r.id=ns,r.textContent=e,document.head.appendChild(r)},R=(e,t)=>{let r=document.createElement(e);return t&&(r.className=t),r},ce=e=>{let t=R("button",e);return t.type="button",t},z=(e,t)=>{let r=t??"";e.textContent!==r&&(e.textContent=r)},de=(e,t,r)=>{r==null||r===""?e.removeAttribute(t):e.getAttribute(t)!==r&&e.setAttribute(t,r)},ss=(e,t)=>{let r=o=>{o.target instanceof Node&&e.contains(o.target)||t()};return document.addEventListener("pointerdown",r,!0),()=>{document.removeEventListener("pointerdown",r,!0)}};var $i=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Ae=(e,t)=>{M(U);let r=t,o=ce("oc-sdk oc-sdk-btn"),n=$i(),c=document.createElement("span");o.append(c),e.append(o);let a=()=>{o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=!!r.disabled||!!r.loading,o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&n.parentNode!==o?o.prepend(n):!r.loading&&n.parentNode===o&&n.remove(),z(c,r.label)},l=()=>{r.disabled||r.loading||r.onClick()};return o.addEventListener("click",l),a(),{update:f=>{r={...r,...f},a()},dispose:()=>{o.removeEventListener("click",l),o.remove()}}};var Kr=(e,t)=>{M(U);let r=t,o=R("label","oc-sdk oc-sdk-field"),n=R("span","oc-sdk-field-label"),c=r.multiline?R("textarea","oc-sdk-input"):R("input","oc-sdk-input"),a=R("span","oc-sdk-field-note");o.append(n,c,a),e.append(o);let l=()=>{z(n,r.label),n.hidden=!r.label,c instanceof HTMLInputElement?c.type=r.password?"password":"text":c.rows=r.rows??3,c.value!==r.value&&(c.value=r.value),c.disabled=!!r.disabled,de(c,"placeholder",r.placeholder),c.dataset.mono=r.mono?"true":"false";let u=!!r.error;o.dataset.invalid=u?"true":"false",c.setAttribute("aria-invalid",u?"true":"false");let S=r.error??r.helper??"";z(a,S),a.hidden=S===""},f=()=>{r.onChange(c.value)};return c.addEventListener("input",f),l(),{update:u=>{r={...r,...u},l()},dispose:()=>{c.removeEventListener("input",f),o.remove()}}};var is="http://www.w3.org/2000/svg",Fi={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},ke=(e,t,r)=>{let o=document.createElementNS(is,"svg");o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r&&o.setAttribute("class",r);let n=document.createElementNS(is,"path");return n.setAttribute("d",Fi[e]),o.append(n),o};var zr=(e,t)=>{M(U);let r=t,o=R("div","oc-sdk oc-sdk-search"),n=R("input","oc-sdk-input");n.type="text",n.spellcheck=!1,n.autocomplete="off",n.setAttribute("role","searchbox");let c=ce("oc-sdk-search-clear");c.append(ke("close",14)),c.tabIndex=-1,o.append(ke("search",16,"oc-sdk-search-icon"),n,c),e.append(o);let a=()=>{let S=r.placeholder??"Search";de(n,"placeholder",S),n.setAttribute("aria-label",r.label??S),c.setAttribute("aria-label","Clear search"),n.value!==r.value&&(n.value=r.value),o.dataset.active=r.value.trim()===""?"false":"true"},l=()=>{r.value!==""&&r.onChange(""),n.focus()},f=()=>{r.onChange(n.value)},u=S=>{S.key==="Escape"&&n.value!==""&&(S.preventDefault(),l())};return n.addEventListener("input",f),n.addEventListener("keydown",u),c.addEventListener("click",l),a(),r.autofocus&&n.focus(),{update:S=>{r={...r,...S},a()},dispose:()=>{n.removeEventListener("input",f),n.removeEventListener("keydown",u),c.removeEventListener("click",l),o.remove()}}};var Se=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},ye=(e,t,r)=>{let o=e.filter(f=>!f.disabled);if(o.length===0)return null;let n=o[0],c=o[o.length-1];if(r==="first"||!n||!c)return n?.id??null;if(r==="last")return c.id;let a=o.findIndex(f=>f.id===t);return a===-1?r==="next"?n.id:c.id:o[Math.min(o.length-1,Math.max(0,a+(r==="next"?1:-1)))]?.id??null};var as=(e,t)=>`${e}-${t??""}`,Nt=(e,t,r,o)=>{let n=ce("oc-sdk-option");n.id=as(e,r.id),n.setAttribute("role",t),n.tabIndex=-1,n.disabled=!!r.disabled,t==="option"&&n.setAttribute("aria-selected",r.selected?"true":"false"),n.dataset.destructive=r.destructive?"true":"false";let c=R("span","oc-sdk-option-label");if(c.textContent=r.label,n.append(c),r.hint){let a=R("span","oc-sdk-option-hint");a.textContent=r.hint,n.append(a)}if(t==="option"){n.dataset.mark="check";let a=R("span","oc-sdk-option-check");a.append(ke("check",14)),n.append(a)}return n.addEventListener("pointerenter",o.hover),n.addEventListener("click",o.pick),n},Pt=(e,t,r,o)=>{let n=as(r,o);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===n?"true":"false");de(t,"aria-activedescendant",o?n:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Vi=(e,t)=>{let r=t.getBoundingClientRect();e.style.minWidth=`${Math.round(r.width)}px`,e.style.left=`${Math.round(r.left)}px`,e.style.top=`${Math.round(r.bottom+4)}px`;let o=e.offsetHeight,n=window.innerHeight-r.bottom-8;o>n&&r.top-8>n&&(e.style.top=`${Math.max(8,Math.round(r.top-4-o))}px`);let c=r.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(r.left-c))}px`)},Ut=(e,t,r,o)=>{e.append(r),Vi(r,t);let n=ss(e,o),c=()=>{o()},a=l=>{l.target instanceof Node&&r.contains(l.target)||o()};return window.addEventListener("resize",c),window.addEventListener("scroll",a,!0),()=>{n(),window.removeEventListener("resize",c),window.removeEventListener("scroll",a,!0),r.remove()}};var cs=(e,t)=>{let r=t.trim().toLowerCase();return r?e.filter(o=>o.label.toLowerCase().includes(r)||o.id.toLowerCase().includes(r)):[...e]},Xi=0,Jr=(e,t)=>{M(U);let r=t,o=`oc-sdk-select-${Xi+=1}`,n=R("div","oc-sdk oc-sdk-select"),c=R("span","oc-sdk-field-label");c.id=`${o}-label`;let a=ce("oc-sdk-trigger");a.setAttribute("aria-haspopup","listbox"),a.setAttribute("aria-labelledby",c.id);let l=R("span","oc-sdk-trigger-value");a.append(l,ke("chevron",14,"oc-sdk-trigger-chevron")),n.append(c,a),e.append(n);let f="",u=null,S=null,_=R("div","oc-sdk oc-sdk-popup"),p=R("div","oc-sdk-popup-search"),m=R("input","oc-sdk-input");m.type="text",m.autocomplete="off",p.append(m);let y=R("div");y.setAttribute("role","listbox"),y.tabIndex=-1,_.append(y);let N=()=>cs(r.options,r.searchable?f:""),w=()=>r.searchable?m:y,h=T=>{u=T,Pt(y,w(),o,T)},D=()=>{_e(y);let T=N();if(T.length===0){let g=R("div","oc-sdk-popup-empty");g.textContent="No matches",y.append(g)}for(let g of T)y.append(Nt(o,"option",{...g,selected:g.id===r.value},{hover:()=>h(g.id),pick:()=>te(g.id)}));h(T.some(g=>g.id===u)?u:T[0]?.id??null)},W=()=>{let T=S;S=null,T?.(),f="",m.value="",a.setAttribute("aria-expanded","false")},Ee=()=>{S||r.disabled||(u=r.value,m.placeholder=r.searchPlaceholder??"Search",r.searchable?_.prepend(p):p.remove(),D(),S=Ut(n,a,_,W),a.setAttribute("aria-expanded","true"),w().focus())},te=T=>{W(),a.focus(),T!==r.value&&r.onChange(T)},pe=()=>{S?W():Ee()},ne=T=>{!S&&Se(T)&&(T.preventDefault(),Ee())},Te=T=>{let g=Se(T);g?(T.preventDefault(),h(ye(N(),u,g))):T.key==="Enter"?(T.preventDefault(),u&&te(u)):T.key==="Escape"?(T.preventDefault(),W(),a.focus()):r.searchable&&T.target!==m&&T.key.length===1&&!T.ctrlKey&&!T.metaKey&&m.focus()},he=()=>{f=m.value,D()},ge=T=>{S&&!(T.relatedTarget instanceof Node&&n.contains(T.relatedTarget))&&W()},se=()=>{z(c,r.label),c.hidden=!r.label;let T=r.options.find(g=>g.id===r.value);z(l,T?.label??r.placeholder??"Select"),l.dataset.empty=T?"false":"true",a.disabled=!!r.disabled,S&&D()};return a.addEventListener("click",pe),a.addEventListener("keydown",ne),_.addEventListener("keydown",Te),m.addEventListener("input",he),n.addEventListener("focusout",ge),se(),{update:T=>{r={...r,...T},se()},dispose:()=>{W(),a.removeEventListener("click",pe),a.removeEventListener("keydown",ne),_.removeEventListener("keydown",Te),m.removeEventListener("input",he),n.removeEventListener("focusout",ge),n.remove()}}};var qr=(e,t)=>{M(U);let r=t,o=R("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let n=()=>{_e(o),o.dataset.track=r.trackBackground?"true":"false";for(let a of r.items){let l=ce("oc-sdk-tab");l.setAttribute("role","tab");let f=a.id===r.activeId;l.setAttribute("aria-selected",f?"true":"false"),l.tabIndex=f?0:-1,l.dataset.id=a.id;let u=R("span");if(u.textContent=a.label,l.append(u),a.count!==void 0){let S=R("span","oc-sdk-tab-count");S.textContent=String(a.count),l.append(S)}l.addEventListener("click",()=>{a.id!==r.activeId&&r.onChange(a.id)}),o.append(l)}},c=a=>{let l=Se(a,"horizontal");if(!l)return;let f=ye(r.items,r.activeId,l);if(f&&f!==r.activeId){a.preventDefault(),r.onChange(f);let u=o.querySelector(`[data-id="${CSS.escape(f)}"]`);u instanceof HTMLElement&&u.focus()}};return o.addEventListener("keydown",c),n(),{update:a=>{r={...r,...a},n()},dispose:()=>{o.removeEventListener("keydown",c),o.remove()}}};var Mt=(e,t)=>{de(e,"data-tone",t&&t!=="neutral"?t:null)},Qr=(e,t)=>{M(U);let r=t,o=R("span","oc-sdk oc-sdk-badge");e.append(o);let n=()=>{z(o,r.label),Mt(o,r.tone)};return n(),{update:c=>{r={...r,...c},n()},dispose:()=>{o.remove()}}};var Bi=0,Yr=(e,t)=>{M(U);let r=t,o=`oc-sdk-list-${Bi+=1}`,n=R("div","oc-sdk oc-sdk-list");n.setAttribute("role","listbox"),n.tabIndex=0,e.append(n);let c=null,a=_=>`${o}-${_}`,l=_=>{c=_;for(let p of Array.from(n.children))p instanceof HTMLElement&&(p.dataset.active=p.id===a(_??"")?"true":"false");de(n,"aria-activedescendant",_?a(_):null),n.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},f=(_,p)=>{let m=R("span",_);return m.textContent=p,m},u=()=>{if(_e(n),de(n,"aria-label",r.ariaLabel),r.items.length===0){n.append(f("oc-sdk-list-empty",r.emptyText??"Nothing here")),l(null);return}for(let p of r.items){let m=ce("oc-sdk-row");m.id=a(p.id),m.setAttribute("role","option"),m.setAttribute("aria-selected",p.id===r.selectedId?"true":"false"),m.disabled=!!p.disabled,m.tabIndex=-1,p.leading&&m.append(f("oc-sdk-row-lead",p.leading));let y=R("span","oc-sdk-row-main");if(y.append(f("oc-sdk-row-title",p.title)),p.subtitle&&y.append(f("oc-sdk-row-sub",p.subtitle)),m.append(y),p.badge){let N=f("oc-sdk-badge",p.badge.label);Mt(N,p.badge.tone),m.append(N)}p.meta&&m.append(f("oc-sdk-row-meta",p.meta)),m.addEventListener("click",()=>r.onSelect(p.id)),n.append(m)}let _=r.items.some(p=>p.id===c&&!p.disabled);l(_?c:r.selectedId??null)},S=_=>{let p=Se(_);if(p){_.preventDefault(),l(ye(r.items,c,p));return}(_.key==="Enter"||_.key===" ")&&c&&(_.preventDefault(),r.onSelect(c))};return n.addEventListener("keydown",S),u(),{update:_=>{r={...r,..._},u()},dispose:()=>{n.removeEventListener("keydown",S),n.remove()}}};var Zr=(e,t)=>{M(U);let r=t,o=R("div","oc-sdk oc-sdk-empty"),n=R("h2","oc-sdk-empty-title"),c=R("p","oc-sdk-empty-body"),a=R("div","oc-sdk-empty-action");o.append(n,c,a),e.append(o);let l=null,f=()=>{if(z(n,r.title),z(c,r.body),c.hidden=!r.body,a.hidden=!r.action,!r.action){l?.dispose(),l=null;return}let u={label:r.action.label,onClick:r.action.onClick};l?l.update(u):l=Ae(a,{...u,variant:"outline",size:"sm"})};return f(),{update:u=>{r={...r,...u},f()},dispose:()=>{l?.dispose(),l=null,o.remove()}}};var eo=(e,t={})=>{M(U);let r=t,o=R("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let n=R("span","oc-sdk-spinner-ring");n.setAttribute("aria-hidden","true");let c=R("span");o.append(n,c),e.append(o);let a=()=>{o.dataset.size=r.size??"default",z(c,r.label),c.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return a(),{update:l=>{r={...r,...l},a()},dispose:()=>{o.remove()}}};var to=(e,t)=>{M(U);let r=t,o=R("div","oc-sdk oc-sdk-banner"),n=R("div","oc-sdk-banner-text"),c=R("div","oc-sdk-banner-title"),a=R("div","oc-sdk-banner-body"),l=R("div","oc-sdk-banner-action");n.append(c,a),o.append(n,l),e.append(o);let f=null,u=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),z(c,r.title),z(a,r.body),a.hidden=!r.body,l.hidden=!r.action,!r.action){f?.dispose(),f=null;return}let S={label:r.action.label,onClick:r.action.onClick};f?f.update(S):f=Ae(l,{...S,variant:"outline",size:"xs"})};return u(),{update:S=>{r={...r,...S},u()},dispose:()=>{f?.dispose(),f=null,o.remove()}}};var ls=e=>e.filter(t=>!("separator"in t)),Wi=0,ro=(e,t)=>{M(U);let r=t,o=`oc-sdk-menu-${Wi+=1}`,n=R("div","oc-sdk oc-sdk-menu");e.append(n);let c=R("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let a=null,l=null,f=Ae(n,{label:r.label,variant:r.variant,size:r.size,onClick:()=>{a?p():m()}}),u=n.querySelector("button");u?.setAttribute("aria-haspopup","menu");let S=h=>{l=h,Pt(c,c,o,h)},_=()=>{_e(c);for(let h of r.items){if("separator"in h){let D=R("div","oc-sdk-separator");D.dataset.labeled="false",c.append(D);continue}c.append(Nt(o,"menuitem",h,{hover:()=>S(h.id),pick:()=>y(h.id)}))}S(ls(r.items).some(h=>h.id===l)?l:null)},p=()=>{let h=a;a=null,h?.(),l=null,u?.setAttribute("aria-expanded","false")},m=()=>{a||!u||(_(),a=Ut(n,u,c,p),u.setAttribute("aria-expanded","true"),c.focus())},y=h=>{p(),u?.focus(),r.onSelect(h)},N=h=>{let D=Se(h);D?(h.preventDefault(),S(ye(ls(r.items),l,D))):h.key==="Enter"||h.key===" "?(h.preventDefault(),l&&y(l)):h.key==="Escape"&&(h.preventDefault(),p(),u?.focus())},w=h=>{a&&!(h.relatedTarget instanceof Node&&n.contains(h.relatedTarget))&&p()};return c.addEventListener("keydown",N),n.addEventListener("focusout",w),{update:h=>{r={...r,...h},f.update({label:r.label,variant:r.variant,size:r.size}),a&&_()},dispose:()=>{p(),c.removeEventListener("keydown",N),n.removeEventListener("focusout",w),f.dispose(),n.remove()}}};var Ki=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,zi=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},ds=e=>{let t=[],r=0;for(let o of e.matchAll(Ki)){let n=o.index??0;n>r&&t.push({kind:"text",text:e.slice(r,n)});let c=o[1]??"",a=(o[2]??"").trim(),l=o[3]??"";zi(l)?c==="!"?t.push({kind:"image",src:l,alt:a}):t.push({kind:"link",href:l,label:a||l}):t.push({kind:"text",text:o[0]}),r=n+o[0].length}return r<e.length&&t.push({kind:"text",text:e.slice(r)}),t},oo=(e,t)=>{M(U);let r=t,o=R("div","oc-sdk oc-sdk-text");e.append(o);let n=a=>{!(a.target instanceof HTMLAnchorElement)||!r.onOpenUrl||(a.preventDefault(),r.onOpenUrl(a.target.href))},c=()=>{_e(o);for(let a of ds(r.text))if(a.kind==="text")o.append(document.createTextNode(a.text));else if(a.kind==="link"){let l=R("a");l.href=a.href,l.rel="noopener noreferrer",l.target="_blank",l.textContent=a.label,o.append(l)}else{let l=R("img");l.src=a.src,l.alt=a.alt,l.loading="lazy",l.referrerPolicy="no-referrer",o.append(l)}};return o.addEventListener("click",n),c(),{update:a=>{r={...r,...a},c()},dispose:()=>{o.removeEventListener("click",n),o.remove()}}};var us=[];function ue(e){return us.push(e),e}function ps(){for(let e of us.splice(0))try{e.dispose()}catch{}}var B=(e,t)=>ue(Ae(e,t)),fs=(e,t)=>ue(Kr(e,t)),Lt=(e,t)=>ue(zr(e,t)),Es=(e,t)=>ue(Jr(e,t)),ms=(e,t)=>ue(qr(e,t)),Qi=(e,t)=>ue(Qr(e,t)),Dt=(e,t)=>ue(Yr(e,t)),De=(e,t)=>ue(Zr(e,t)),Yi=(e,t)=>ue(eo(e,t)),Gt=(e,t)=>ue(to(e,t)),Ht=(e,t)=>ue(ro(e,t)),Zi=(e,t)=>ue(oo(e,t));function jt(e,t="notice"){let r=document.createElement("div");return r.className=t,Zi(r,{text:e,onOpenUrl:Ge}),r}function Qe(e,t){let r=document.createElement("span"),o=le(e,t);return Qi(r,{label:o.label,tone:o.tone}),r}function we(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Yi(t,{label:e}),t}function _s(e){Dr(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Ge(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}Q.openUrl(e).catch(()=>{})}}function no(e,t,r){return{directory:e,link:t,repo:r,target:Uo(r,t.orgName,t.projectName)}}async function $t(e){try{let t=await e(".git/config"),r=Mo(t.content);return r?Po(r):null}catch{return null}}async function Ss(e){try{let t=await e(".git/HEAD");return St(t.content)}catch{return null}}async function Ts(e,t,r,o){let n=await zn(t,r);if(n)return no(r,n,await $t(o));let c=await $t(o);if(!c)return null;for(let a of Yt(c))try{let l=await e.findProjectBySlug(a);if(!l||!l.id)continue;return await Mr(t,r,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected"}),no(r,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected",directory:r},c)}catch{}return null}async function hs(e,t,r,o){let n=o?Yt(o)[0]??null:null;return await Mr(e,t,{projectId:r.id,projectName:r.name,orgName:r.orgName,slug:n,source:"picked"}),no(t,{projectId:r.id,projectName:r.name,orgName:r.orgName,slug:n,source:"picked",directory:t},o)}function gs(e){let t=!1,r=!1,o=null,n=[],c="";function a(){t=!1,r=!1,o=null,n=[],c=""}async function l(){r=!0,o=null,e.repaint();try{let _=await e.client.listOrgs(),p=await Promise.allSettled(_.map(y=>e.client.listProjectsOfOrg(y.id))),m=[];for(let y of p)y.status==="fulfilled"&&m.push(...y.value.items);m.sort((y,N)=>{let w=y.orgName.localeCompare(N.orgName);return w!==0?w:y.name.localeCompare(N.name)}),n=m}catch(_){o=F(_),ct(_)&&e.onDisconnected()}r=!1,e.repaint()}async function f(_){let p=e.directory();if(p)try{let m=await $t(e.readProjectFile),y=await hs(e.storage,p,_,m);a(),await e.onPicked(y)}catch(m){await e.notify("error",F(m))}}function u(){let _=c.trim().toLowerCase();return n.filter(p=>_?`${p.orgName}/${p.name}`.toLowerCase().includes(_):!0).map(p=>({id:p.id,leading:p.orgName?`${p.orgName}/`:"",title:p.name}))}function S(_){let p=E("div",{className:"detail-head"});if(p.append(E("div",{className:"detail-title"},"Choose a CircleCI project")),p.append(E("div",{className:"detail-sub"},"This extension remembers the choice per OpenChamber project.")),e.canCancel()){let h=E("div");B(h,{label:"Back",variant:"ghost",size:"sm",onClick:()=>{a(),e.onCancel()}}),p.append(h)}if(_.append(p),o){let h=E("div");_.append(h),Gt(h,{tone:"error",title:"CircleCI",body:o,action:{label:"Retry",onClick:()=>void l()}})}if(r){_.append(we("Loading projects"));return}if(n.length===0){if(o)return;let h=E("div");_.append(h),De(h,{title:"No projects",body:"This token is not a member of any CircleCI organization with projects, or the token cannot list them."});return}let m=E("div");_.append(m);let y=E("div",{className:"scroll"});_.append(y);let N=Dt(y,{items:u(),ariaLabel:"CircleCI projects",onSelect:h=>{let D=n.find(W=>W.id===h);D&&f(D)}}),w=null;w=Lt(m,{value:c,label:"Filter projects",placeholder:"Filter by organization or repository",onChange:h=>{c=h,w?.update({value:h}),N.update({items:u()})}})}return{isOpen:()=>t,reset:a,render:S,open:async()=>{t=!0,await l()}}}function bs(e){let t=!1,r=!1,o=[],n="",c="",a=null,l=!1;function f(){t=!1,r=!1,o=[],n="",c="",a=null,l=!1}async function u(p){o=await qn(e.storage,p.link.projectId)??[];try{let m=await e.client.listPipelines(p.link.projectId);o=m,await Qn(e.storage,p.link.projectId,m)}catch{}}async function S(){let p=e.workspace();if(!p||!t)return;let m=o.some(N=>N.id===n)?n:o[0]?.id??"";if(!m){a="This project has no pipeline to run.",e.repaint();return}let y=c.trim();if(!y){a="Name a branch or tag to build.",e.repaint();return}l=!0,a=null,e.repaint();try{await e.client.fireRun({projectId:p.link.projectId,pipelineId:m,branch:y}),f(),await e.notify("success",`Started a run on ${y}.`),await e.onStarted()}catch(N){l=!1,a=F(N),e.repaint()}}function _(p){let m=E("div",{className:"detail-head"}),y=E("div",{className:"row"}),N=E("div");if(B(N,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:()=>{f(),e.repaint()}}),y.append(N),y.append(E("span",{className:"spacer"})),m.append(y),m.append(E("div",{className:"detail-title"},"Run a pipeline")),m.append(E("div",{className:"detail-sub"},"Fire a new run on a branch or tag. The pipeline definition picks which config to build.")),p.append(m),r){p.append(we("Loading pipelines"));return}let w=E("div",{className:"section"});if(o.length>1){let te=E("div"),pe=null;pe=Es(te,{label:"Pipeline",value:n,options:o.map(ne=>({id:ne.id,label:ne.name,hint:ne.configPath})),onChange:ne=>{n=ne,pe?.update({value:ne})}}),w.append(te)}else o.length===1?w.append(E("p",{className:"notice"},`Pipeline: ${o[0]?.name??""}`)):w.append(E("p",{className:"notice error-text"},"This project lists no pipeline definition to run."));let h=E("div"),D=null;D=fs(h,{label:"Branch or tag",value:c,placeholder:"main",mono:!0,onChange:te=>{c=te,a=null,D?.update({value:te})}}),w.append(h),a&&w.append(E("p",{className:"notice error-text"},a));let W=E("div",{className:"detail-actions"}),Ee=E("div");B(Ee,{label:"Start run",loading:l,disabled:l||o.length===0,onClick:()=>void S()}),W.append(Ee),w.append(W),p.append(w)}return{isOpen:()=>t,reset:f,render:_,open:async()=>{let p=e.workspace();if(!p)return;let m=e.directory()?await Ss(e.readProjectFile):null;t=!0,r=!0,o=[],n="",c=m??"",a=null,l=!1,e.repaint(),await u(p),t&&(r=!1,n=o[0]?.id??"",e.repaint())}}}var L=document.querySelector("#root");if(!L)throw new Error("CircleCI panel is missing its #root element.");var Z=Io(kn),dt=Q.storage,ea=3e4,Ft=null,s={ready:null,connected:!1,account:"CircleCI",booted:!1,workspace:null,override:null,directory:null,runs:[],runsNext:null,filter:"all",search:"",currentWork:null,scopeOn:!1,selectedRun:null,workflows:[],selectedWorkflow:null,jobs:[],selectedJob:null,jobDetail:null,jobOutput:null,jobsError:null,preferences:{autoRefresh:!0},loading:!0,error:null,toast:null,disconnectNotice:null},Y=0;function Ce(){return s.override??s.workspace}var lt=gs({client:Z,storage:dt,readProjectFile:it,directory:()=>s.directory,notify:re,repaint:P,canCancel:()=>!!s.workspace,onCancel:async()=>{s.override=null,P(),await Ie({more:!1})},onPicked:async e=>{co(),s.workspace=e,s.currentWork=await ks(),P(),await Ie({more:!1})},onDisconnected:()=>{s.connected=!1}}),Ye=bs({client:Z,storage:dt,readProjectFile:it,directory:()=>s.directory,workspace:Ce,notify:re,repaint:P,onStarted:()=>Ie({more:!1})});async function ks(){let e=s.directory;if(!e)return null;try{return await Mn({directory:e,session:s.ready?.session??null,readFile:it,host:Q})}catch{return null}}async function ys(){if(P(),s.preferences=await Lr(dt),!s.connected){s.loading=!1,P();return}try{let e=await Z.currentUser();s.account=e.login}catch{}await ws()}async function ws(){let e=s.directory,t=++Y;if(!s.connected||!e){s.loading=!1,P();return}try{let r=await Ts(Z,dt,e,it);if(t!==Y)return;if(s.workspace=r,!r){s.loading=!1,P(),lt.open();return}if(s.currentWork=await ks(),t!==Y)return;await Ie()}catch(r){if(t!==Y)return;s.loading=!1,s.error=F(r),ct(r)&&(s.connected=!1),P()}}async function Ie(e={}){let t=Ce();if(!t)return;let r=++Y,o=s.scopeOn?It(s.currentWork):null;e.more||(s.loading=!0,s.error=null,P());try{let n=o&&!e.more?await Z.listRunsUntil(t.link.projectId,c=>Pr(c,o).length>0):await Z.listRuns(t.link.projectId,e.more?s.runsNext??void 0:void 0);if(r!==Y)return;s.runs=e.more?[...s.runs,...n.items]:n.items,s.runsNext=n.next,s.loading=!1,Us()}catch(n){if(r!==Y)return;s.loading=!1,s.error=F(n),ct(n)&&(s.connected=!1)}if(P(),ut(),e.openScoped&&o){let n=Pr(s.runs,o)[0];n&&!s.selectedRun&&await ao(n)}}async function Xt(){let e=s.selectedRun;if(!e)return;let t=++Y;s.loading=!0,s.error=null,P();try{let r=await Z.listWorkflows(e.id);if(t!==Y)return;s.workflows=r.items,s.loading=!1}catch(r){if(t!==Y)return;s.loading=!1,s.error=F(r)}P(),ut()}async function je(){let e=s.selectedWorkflow;if(!e)return;let t=++Y;s.loading=!0,s.error=null,P();try{let r=await Z.listJobs(e.id);if(t!==Y)return;s.jobs=r.items,s.jobsError=null,s.loading=!1}catch(r){if(t!==Y)return;s.loading=!1,s.jobs=[],s.jobsError=F(r),s.error=s.jobsError}P(),ut()}async function Is(){let e=s.selectedJob;if(!e)return;let t=++Y;s.loading=!0,s.error=null,P();try{let r=await Z.getJob(e.id);if(t!==Y)return;s.jobDetail=r;let o=r.steps.find(n=>me(n.outcome));if(s.jobOutput=null,o)try{let n=await Z.condensedOutput(e.id,o.num,0);t===Y&&n.trim()&&(s.jobOutput=n)}catch{}s.loading=!1}catch(r){if(t!==Y)return;s.loading=!1,s.error=F(r)}P(),ut()}async function Bt(e=!1){return e||(s.toast=null),s.selectedJob?Is():s.selectedWorkflow?je():s.selectedRun?Xt():Ie({more:!1})}async function ao(e){s.toast=null,s.selectedRun=e,s.workflows=[],s.selectedWorkflow=null,s.jobs=[],s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,P(),await Xt()}async function so(e){s.selectedWorkflow=e,s.jobs=[],s.jobsError=null,s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,P(),await je()}async function io(e){s.selectedJob=e,s.jobDetail=null,s.jobOutput=null,P(),await Is()}function Cs(){s.toast=null,s.selectedRun=null,s.workflows=[],s.selectedWorkflow=null,s.jobs=[],s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,P(),Ie({more:!1})}function ta(){s.selectedWorkflow=null,s.jobs=[],s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,P(),Xt()}function ra(){s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,P(),je()}async function oa(){if(s.scopeOn=!s.scopeOn,!s.scopeOn)return Cs();s.toast=null,s.selectedRun=null,s.workflows=[],s.selectedWorkflow=null,s.jobs=[],s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,await Ie({openScoped:!0})}function He(e){let t=Ce(),r=s.selectedRun;return!t||!r?null:{workspace:t,run:r,workflow:e.workflow??s.selectedWorkflow,job:e.job??s.selectedJob,jobs:s.jobs,jobsError:s.jobsError,detail:e.detail??s.jobDetail,output:e.output??s.jobOutput}}async function Vt(e){if(e)try{await wn(e),await re("success","Attached to the chat box.")}catch(t){await re("error",F(t))}}async function vs(e){if(e)try{await In(e),await re("success","Started a worktree chat for this build.")}catch(t){await re("error",F(t))}}async function na(e){if(e)try{await Cn(e),await re("success","Sent to the open chat.")}catch(t){await re("error",F(t))}}async function Ns(e,t){await jn(Z,e,{fromFailed:t},re)&&await je()}async function sa(e){let t=e?s.workflows.filter(o=>me(o.outcome)):s.workflows;(await $n(Z,t,{fromFailed:e},re)).started>0&&await Xt()}async function Ps(e){await Fn(Z,e,re)&&await je()}async function ia(e){await Vn(Z,e,re)&&await je()}async function aa(e){await Xn(Z,e,re)&&await je()}async function ca(e){switch(e){case"refresh":await Bt();return;case"trigger":await Ye.open();return;case"choose":s.override=null,await lt.open();return;case"revert":s.override=null,s.selectedRun=null,s.workflows=[],s.selectedWorkflow=null,s.jobs=[],s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,Ye.reset(),P(),await Ie({more:!1});return;case"pause":case"resume":s.preferences=await Jn(dt,{autoRefresh:e==="resume"}),P(),ut();return;case"disconnect":await ma();return;default:return}}function la(){return s.selectedJob?at([s.selectedJob]):s.selectedWorkflow?at(s.jobs):s.selectedRun?at(s.workflows):at(s.runs)}var da=Dn({delayMs:ea,enabled:()=>s.preferences.autoRefresh,active:la,onTick:()=>void Bt(!0)});function ut(){da.arm()}function Us(){let e=s.runs.filter(t=>me(t.outcome)).length;Q.setBadge(e>0?e:null).catch(()=>{})}function P(){if(ps(),Ft=null,Ln(L),!s.connected){ua();return}if(!s.directory){Rs();return}if(lt.isOpen()){lt.render(L);return}if(!Ce()){Rs();return}if(Ye.isOpen()){Ye.render(L);return}if(s.selectedJob){ha();return}if(s.selectedWorkflow){Gs();return}if(s.selectedRun){Ds();return}Ms()}function ua(){let e=E("div");L?.append(e),De(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. Tokens stay in OpenChamber; this extension never sees one.",action:{label:"Open CircleCI tokens",onClick:()=>Ge("https://app.circleci.com/settings/user/tokens")}})}function Rs(){let e=E("div");L?.append(e),De(e,{title:"No project open",body:"Open a project in OpenChamber. This extension maps that project to a CircleCI project the first time it runs."})}function pa(){let e=Ce(),t=E("div",{className:"row"}),r=E("div",{style:"flex:1; min-width:0;"}),o=e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",n=[{id:"refresh",label:"Refresh"},{id:"trigger",label:"Run a pipeline\u2026"},{id:"choose",label:"Change project\u2026"}];s.override&&n.push({id:"revert",label:"Back to this repository's project"}),n.push({separator:!0},s.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"},{separator:!0},{id:"disconnect",label:"Disconnect CircleCI",destructive:!0}),Ht(r,{label:o,size:"sm",variant:"ghost",items:n,onSelect:p=>void ca(p)}),t.append(r),s.account&&t.append(E("span",{className:"account muted",text:s.account})),L?.append(t);let c=E("div",{className:"toolbar"}),a=E("div"),l=ms(a,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:s.filter,onChange:p=>{s.filter=vn(p),l.update({activeId:s.filter}),Ft?.paint()}});c.append(a),c.append(E("span",{className:"spacer"}));let f=E("div");B(f,{label:"Refresh",size:"sm",variant:"ghost",loading:s.loading,onClick:()=>void Bt()}),c.append(f),L?.append(c);let u=E("div",{className:"filter-row"}),S=E("div",{style:"flex:1; min-width:0;"});if(u.append(S),s.currentWork){let p=E("div");p.append(fa()),u.append(p)}L?.append(u);let _=null;return _=Lt(S,{value:s.search,label:"Filter runs",placeholder:"Filter by branch, commit, PR or number",onChange:p=>{s.search=p,_?.update({value:p}),Ft?.paint()}}),{tabs:l}}function fa(){let e=E("div");return B(e,{label:s.currentWork?.branch?"This branch":"My pull requests",size:"sm",variant:s.scopeOn?"default":"outline",onClick:()=>void oa()}),e}function Ea(){if(!s.scopeOn||!s.currentWork)return null;let{branch:e,prNumbers:t}=s.currentWork,r=t.map(o=>`#${o}`).join(", ");return e&&t.length>0?`Runs on ${e} and PR ${r}`:e?`Runs on ${e}`:t.length>0?`Runs for PR ${r}`:null}var Os="To remove the token, open Settings \u2192 Integrations and clear the CircleCI card.";async function ma(){try{await Q.oauthDisconnect(),s.disconnectNotice=`Disconnect requested. ${Os}`}catch(e){s.disconnectNotice=`${F(e)} ${Os}`}P()}function co(){s.scopeOn=!1,s.search="",s.filter="all",s.currentWork=null,s.workspace=null,s.override=null,s.runs=[],s.runsNext=null,s.selectedRun=null,s.workflows=[],s.selectedWorkflow=null,s.jobs=[],s.selectedJob=null,s.jobDetail=null,s.jobOutput=null,s.jobsError=null,Ye.reset(),lt.reset(),s.toast=null,s.error=null,Us()}function _a(){co(),s.disconnectNotice=null}function Wt(){if(s.disconnectNotice&&L?.append(E("p",{className:"notice"},s.disconnectNotice)),s.error){let e=E("div");L?.append(e),Gt(e,{tone:"error",title:"CircleCI",body:s.error,action:{label:"Retry",onClick:()=>void Bt()}})}s.toast&&L?.append(E("p",{className:"notice"},s.toast))}function Sa(){return Un(s.runs,s.filter,s.search,s.scopeOn?It(s.currentWork):void 0)}function xs(){return Sa().map(e=>{let t=le(e.phase,e.outcome);return{id:e.id,leading:`#${e.number}`,title:Ue(e),...e.commitSubject?{subtitle:e.commitSubject}:{},meta:[mt(e.createdAt),No(e)].filter(Boolean).join(" \xB7 "),badge:{label:t.label,tone:t.tone}}})}function As(){if(s.runs.length===0)return"No runs yet. Push a commit, or start one from the project menu.";if(s.scopeOn){let e=It(s.currentWork),t=!!e.branch&&e.prNumbers.length>0;return`No ${e.branch?`runs on ${e.branch}${t?" or its pull requests":""}`:"runs for the linked pull requests"} in the loaded pages yet. Load more runs or turn the scope off.`}return"No run matches this filter."}function Ms(){let{tabs:e}=pa(),t=Ea();if(t&&L?.append(E("p",{className:"muted scope-note",text:t})),Wt(),s.loading&&s.runs.length===0){L?.append(we("Loading runs"));return}let r=E("div",{className:"scroll"});L?.append(r);let o=Dt(r,{items:xs(),emptyText:As(),ariaLabel:"CircleCI runs",onSelect:n=>{let c=s.runs.find(a=>a.id===n);c&&ao(c)}});if(Ft={tabs:e,list:o,paint:()=>o.update({items:xs(),emptyText:As()})},s.runsNext){let n=E("div",{className:"load-more"});B(n,{label:"Load more runs",size:"sm",variant:"ghost",onClick:()=>void Ie({more:!0})}),L?.append(n)}}function Ta(e){let t=Ce(),r=E("div",{className:"detail-head"}),o=E("div",{className:"row"}),n=E("div");B(n,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:Cs}),o.append(n),o.append(E("span",{className:"spacer"})),o.append(Qe(e.phase,e.outcome)),r.append(o),r.append(E("div",{className:"detail-title"},`#${e.number} ${Ue(e)}`));let c=[];e.revision&&c.push(Xe(e.revision)),e.commitSubject&&c.push(e.commitSubject),e.pipelineName&&c.push(e.pipelineName),c.push(mt(e.createdAt)),r.append(E("div",{className:"detail-sub"},c.filter(Boolean).join(" \xB7 "))),e.errors.length>0&&r.append(jt(e.errors.map(_=>`${_.type}: ${_.message}`).join(" \xB7 "),"notice error-text"));let a=E("div",{className:"detail-actions"}),l=E("div");Ht(l,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every workflow"}],onSelect:_=>void sa(_==="failed")}),a.append(l);let f=e.pullRequests?.[0];if(f?.url){let _=E("div");B(_,{label:`Open PR #${f.number}`,size:"sm",variant:"outline",onClick:()=>Ge(f.url)}),a.append(_)}let u=E("div");B(u,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>Ge(t?ot(t.target,e.number):null)}),a.append(u);let S=E("div");return B(S,{label:"Attach",size:"sm",variant:"outline",onClick:()=>void Vt(He({workflow:null,job:null}))}),a.append(S),r.append(a),r}function Ls(e){let t=E("div",{className:"job-row"}),r=E("div",{className:"job-row-head"}),o=E("button",{className:"job-row-name",text:e.name,title:e.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});if(o.addEventListener("click",e.onOpen),r.append(o),e.meta&&r.append(E("span",{className:"job-row-meta",text:e.meta})),r.append(Qe(e.phase,e.outcome)),t.append(r),e.actions.length>0){let n=E("div",{className:"job-row-actions"});for(let c of e.actions){let a=E("div");B(a,{label:c.label,size:c.size??"xs",variant:c.variant??"ghost",onClick:c.onClick}),n.append(a)}t.append(n)}return t}function Ds(){let e=s.selectedRun;if(!e)return Ms();if(L?.append(Ta(e)),Wt(),s.loading&&s.workflows.length===0){L?.append(we("Loading workflows"));return}if(s.workflows.length===0){let r=E("div");L?.append(r),De(r,{title:"No workflows",body:"This run produced no workflows. A configuration error is shown above when CircleCI reported one."});return}let t=E("div",{className:"scroll"});L?.append(t);for(let r of s.workflows){let o=le(r.phase,r.outcome),n=[{label:"Jobs",onClick:()=>void so(r),variant:"outline"},{label:"Rerun failed",onClick:()=>void Ns(r,!0)}];o.active&&n.push({label:"Cancel",onClick:()=>void Ps(r),variant:"ghost"}),n.push({label:"Open",onClick:()=>{let c=Ce();c&&Ge(nt(c.target,e.number,r.id))}}),t.append(Ls({name:r.name,meta:Ve(r.createdAt,r.endedAt),phase:r.phase,outcome:r.outcome,onOpen:()=>void so(r),actions:n}))}}function Gs(){let e=s.selectedWorkflow,t=s.selectedRun;if(!e||!t)return Ds();let r=E("div",{className:"detail-head"}),o=E("div",{className:"row"}),n=E("div");B(n,{label:"\u2190 Workflows",variant:"ghost",size:"sm",onClick:ta}),o.append(n),o.append(E("span",{className:"spacer"})),o.append(Qe(e.phase,e.outcome)),r.append(o),r.append(E("div",{className:"detail-title"},e.name)),r.append(E("div",{className:"detail-sub"},`Run #${t.number} \xB7 ${Ve(e.createdAt,e.endedAt)||"no duration"}`));let c=E("div",{className:"detail-actions"}),a=E("div");if(Ht(a,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:u=>void Ns(e,u==="failed")}),c.append(a),le(e.phase,e.outcome).active){let u=E("div");B(u,{label:"Cancel",size:"sm",variant:"ghost",onClick:()=>void Ps(e)}),c.append(u)}let l=E("div");if(B(l,{label:"Attach workflow",size:"sm",variant:"outline",onClick:()=>void Vt(He({workflow:e,job:null}))}),c.append(l),r.append(c),L?.append(r),Wt(),s.loading&&s.jobs.length===0){L?.append(we("Loading jobs"));return}if(s.jobs.length===0){let u=E("div");L?.append(u),De(u,{title:"No jobs",body:"This workflow lists no jobs yet."});return}let f=E("div",{className:"scroll"});L?.append(f);for(let u of s.jobs){let S=u.type.toLowerCase()==="approval",_=le(u.phase,u.outcome),p=[];S&&_.active&&(p.push({label:"Approve",onClick:()=>void ia(u),variant:"default"}),p.push({label:"Reject",onClick:()=>void aa(u),variant:"ghost"})),p.push({label:"Details",onClick:()=>void io(u),variant:"outline"}),me(u.outcome)&&(p.push({label:"Attach failure",onClick:()=>void Vt(He({workflow:e,job:u,detail:null,output:null}))}),p.push({label:"Fix with agent",onClick:()=>void vs(He({workflow:e,job:u,detail:null,output:null}))})),f.append(Ls({name:u.name,meta:[u.number>0?`#${u.number}`:"",Ve(u.startedAt,u.endedAt)].filter(Boolean).join(" \xB7 "),phase:u.phase,outcome:u.outcome,onOpen:()=>void io(u),actions:p}))}}function ha(){let e=s.selectedJob,t=s.selectedWorkflow,r=s.selectedRun;if(!e)return Gs();let o=E("div",{className:"detail-head"}),n=E("div",{className:"row"}),c=E("div");B(c,{label:"\u2190 Jobs",variant:"ghost",size:"sm",onClick:ra}),n.append(c),n.append(E("span",{className:"spacer"})),n.append(Qe(e.phase,e.outcome)),o.append(n),o.append(E("div",{className:"detail-title"},e.name)),o.append(E("div",{className:"detail-sub"},[`#${e.number}`,e.type,Ve(e.startedAt,e.endedAt)].filter(Boolean).join(" \xB7 ")));let a=E("div",{className:"detail-actions"}),l=E("div");B(l,{label:"Attach to chat",size:"sm",variant:"outline",onClick:()=>void Vt(He({workflow:t,job:e}))}),a.append(l);let f=E("div");B(f,{label:"Start a chat",size:"sm",onClick:()=>void vs(He({workflow:t,job:e}))}),a.append(f);let u=E("div");B(u,{label:"Send to current chat",size:"sm",variant:"ghost",onClick:()=>void na(He({workflow:t,job:e}))}),a.append(u);let S=Ce(),_=E("div");B(_,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>{S&&t&&Ge(_t(S.target,r?.number??0,t.id,e.number))}}),a.append(_),o.append(a),L?.append(o),Wt();let p=E("div",{className:"scroll"});if(L?.append(p),s.loading&&!s.jobDetail){p.append(we("Loading job"));return}let m=s.jobDetail;if(!m)return;let y=E("div",{className:"meta-grid"}),N=[Je("Job",`#${m.number}`),Je("Type",m.type),Je("Started",m.startedAt?mt(m.startedAt):null),Je("Duration",Ve(m.startedAt,m.endedAt)||null),Je("Executions",m.steps.length>0?`${m.parallelExecutions} parallel`:null)];for(let w of N)w&&y.append(w);if(y.childElementCount>0&&p.append(y),m.errors.length>0){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Errors"));for(let h of m.errors)w.append(jt(`${h.type}: ${h.message}`,"notice error-text"));p.append(w)}if(m.warnings.length>0){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Warnings"));for(let h of m.warnings)w.append(jt(`${h.type}: ${h.message}`,"notice"));p.append(w)}if(m.steps.length>0){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Steps"));for(let h of m.steps){let D=E("div",{className:"job-row"}),W=E("div",{className:"job-row-head"});W.append(E("span",{className:"job-row-name"},`${h.num}. ${h.name}`)),h.exitCode!==null&&h.exitCode!==0&&W.append(E("span",{className:"job-row-meta"},`exit ${h.exitCode}`)),W.append(Qe(h.phase,h.outcome)),D.append(W),h.command&&D.append(E("pre",{className:"output",style:"max-height:120px;"},h.command)),w.append(D)}p.append(w)}if(s.jobOutput){let w=E("div",{className:"section"});w.append(E("div",{className:"section-title"},"Condensed output")),w.append(E("pre",{className:"output"},s.jobOutput)),p.append(w)}else me(m.outcome)&&p.append(E("p",{className:"notice"},"CircleCI returned no condensed output for this job. The steps above and the errors are still attached with the chip."))}function ga(e){s.ready=e,s.booted=!0,s.connected=e.connection.connected,s.account=e.connection.account||"CircleCI",s.directory=e.directory,ys()}Q.onReady(e=>{_s(e),Hn(),s.ready=e,s.booted||ga(e)});Q.onConnection(e=>{let t=s.connected;if(s.connected=e.connected,e.account&&(s.account=e.account),e.connected&&!t){ys();return}!e.connected&&t&&(_a(),P())});async function ba(e){e!==s.directory&&(s.directory=e,s.ready&&(s.ready={...s.ready,directory:e}),co(),s.loading=!0,P(),await ws())}Q.onDirectory(e=>{s.booted&&ba(e)});Q.onItem(e=>{if(!e||!("providerId"in e))return;let t=Ho(e.data);t&&Ra(t)});async function Ra(e){let t=Ce();t&&t.link.projectId!==e.projectId&&(Ye.reset(),s.override={directory:s.directory??"",repo:null,target:{segment:"github",owner:e.orgName||"project",repo:e.projectName},link:{projectId:e.projectId,projectName:e.projectName,orgName:e.orgName,slug:null,source:"picked",directory:s.directory??""}},P());try{let r=await Z.getRun(e.runId);await ao(r);let o=e.workflowId?s.workflows.find(n=>n.id===e.workflowId):void 0;if(o){await so(o);let n=e.jobId?s.jobs.find(c=>c.id===e.jobId):void 0;n&&await io(n)}}catch(r){s.error=F(r),P()}}})();
