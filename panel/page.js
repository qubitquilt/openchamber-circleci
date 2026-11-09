"use strict";(()=>{var pe=class extends Error{status;code;constructor(t,r,o){super(o),this.name="CircleCIError",this.status=t,this.code=r}},Fn="/api/v3",Ye=20,Rt=20,Kr=50,jn=50,He=4,pi=He*Ye,zr=[1e3,2500],g=e=>typeof e=="object"&&e!==null?e:{},Se=e=>Array.isArray(e)?e:[],f=e=>typeof e=="string"&&e.length>0?e:null,$e=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Yr(e){return Se(e).map(t=>{let r=g(t);return{type:f(r.type)??"unknown",message:f(r.message)??""}})}function Zr(e){return Se(e).map(t=>{let r=g(t);return{type:f(r.type)??"unknown",message:f(r.message)??"",description:f(r.description),url:f(r.url)}})}function Qe(e){let t=g(e),r=g(t.attributes),o=g(t.references),s=g(o.event),l=g(s.attributes),i=g(l.vcs),c=g(i.commit),d=g(o.pipeline),E=g(o.trigger),p=g(E.attributes);return{id:f(t.id)??"",number:$e(r.number)??0,phase:f(r.phase)??"unknown",outcome:f(r.current_outcome),createdAt:f(r.created_at)??"",branch:f(i.branch),tag:f(i.tag),revision:f(i.revision),commitSubject:f(c.subject),commitUrl:f(c.url),pipelineName:f(g(d.attributes).name),trigger:f(p.name)??f(g(p.event_source).type)??f(l.type),errors:Yr(r.errors),warnings:Zr(r.warnings)}}function Bn(e){let t=g(e),r=g(t.attributes),o=g(r.auto_rerun);return{id:f(t.id)??"",name:f(r.name)??"Workflow",phase:f(r.phase)??"unknown",outcome:f(r.current_outcome)??f(r.outcome),createdAt:f(r.created_at),endedAt:f(r.ended_at),tag:f(r.tag),autoRerunNumber:$e(o.number)}}function Ot(e){let t=g(e),r=g(t.attributes);return{id:f(t.id)??"",name:f(r.name)??"Job",number:$e(r.number)??0,type:f(r.type)??"build",phase:f(r.phase)??"unknown",outcome:f(r.outcome),startedAt:f(r.started_at),endedAt:f(r.ended_at)}}function Wn(e){let t=g(e);return{num:$e(t.num)??0,name:f(t.name)??"Step",type:f(t.type)??"run",phase:f(t.phase)??"unknown",outcome:f(t.outcome),exitCode:$e(t.exit_code),command:f(t.command),startedAt:f(t.started_at),endedAt:f(t.ended_at)}}function Kn(e){let t=Ot(e),r=g(g(e).attributes),o=Se(r.parallel_executions).map(g),s=o.length>0?Se(o[0]?.steps).map(Wn):[];return{...t,errors:Yr(r.errors),warnings:Zr(r.warnings),steps:s,parallelExecutions:o.length}}function Jr(e){let t=g(e),r=g(t.attributes),o=g(g(t.references).org);return{id:f(t.id)??"",name:f(r.name)??"Project",orgId:f(o.id)??"",orgName:f(g(o.attributes).name)??""}}function zn(e){let t=g(e),r=g(t.attributes);return{id:f(t.id)??"",name:f(r.name)??"Organization",vcsProvider:f(g(r.vcs).provider)}}function qr(e){let t=g(e),r=g(t.attributes),o=g(r.config);return{id:f(t.id)??"",name:f(r.name)??"Pipeline",configPath:f(o.file_path)??""}}function Jn(e){let t=g(e),r=g(t.attributes);return{id:f(t.id)??"",login:f(r.login)??"CircleCI account",name:f(r.name),avatarUrl:f(r.avatar_url)}}function qn(e){if(!e)return;let t={};for(let[r,o]of Object.entries(e))o==null||o===""||(t[r]=String(o));return Object.keys(t).length>0?t:void 0}function Qr(e){if(e)try{return JSON.parse(e)}catch{return}}function Qn(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Yn(e,t,r){let o=g(g(t).error),s=f(o.detail)??f(o.title)??f(o.type)??Qn(e);return new pe(e,f(o.type)??`HTTP_${e}`,s)}function Zn(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function es(e){return new Promise(t=>setTimeout(t,e))}function eo(e){async function t(i,c){let d=qn(i.query),E=0;for(;;){let p=await e({method:i.method,path:Fn+i.path,...d?{query:d}:{},...i.body===void 0?{}:{body:JSON.stringify(i.body)}});if(p.status>=400){if(Zn(p.status,i.method)&&E<zr.length){await es(zr[E]??2500),E+=1;continue}throw Yn(p.status,Qr(p.body),p.body)}return c(p.body)}}let r=i=>t(i,Qr),o=i=>t(i,c=>c);async function s(i,c,d,E,p){let _=p?{...c,"page[cursor]":p}:{...c,"page[limit]":d},h;try{h=await r({method:"GET",path:i,query:_})}catch(C){if(!p&&C instanceof pe&&C.status===400)h=await r({method:"GET",path:i,query:{...c}});else throw C}return{items:Se(g(h).data).map(E),next:f(g(g(h).page).next)}}async function l(i,c,d,E,p){let _=[],h,C=null;for(let X=0;X<p;X+=1){let P=await s(i,c,d,E,h);if(_.push(...P.items),C=P.next,!C)break;h=C}return{items:_,next:C}}return{currentUser:async()=>{let i=await r({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=Se(g(i).data)[0];if(!c)throw new pe(200,"EMPTY_USER","CircleCI returned no user.");return Jn(c)},listOrgs:async()=>(await l("/orgs",{},Kr,zn,He)).items,findProjectBySlug:async i=>{let c=await r({method:"GET",path:"/projects",query:{"filter[slug]":i}}),d=Se(g(c).data)[0];return d?Jr(d):null},listProjectsOfOrg:i=>l("/projects",{"filter[org_id]":i},Kr,Jr,He),listPipelines:async i=>{let c=await l("/pipelines",{"filter[project_id]":i},jn,qr,1),d=[];for(let E of c.items)if(E.id)try{let p=await r({method:"GET",path:`/pipelines/${encodeURIComponent(E.id)}`,query:{"filter[project_id]":i}});d.push(qr(g(p).data))}catch{d.push({...E,name:"Pipeline config"})}return d},listRuns:(i,c)=>s("/runs",{"filter[project_id]":i},Ye,Qe,c),listMyRuns:i=>s("/runs",{"filter[user_id]":"me"},Ye,Qe,i),getRun:async i=>{let c=await r({method:"GET",path:`/runs/${encodeURIComponent(i)}`});return Qe(g(c).data)},findRunByNumber:async(i,c)=>{let d;for(let E=0;E<He;E+=1){let p=await s("/runs",{"filter[project_id]":i},Ye,Qe,d),_=p.items.find(h=>h.number===c);if(_)return _;if(!p.next)return null;d=p.next}return null},fireRun:async i=>{let c=await r({method:"POST",path:"/runs",query:{"filter[project_id]":i.projectId},body:{data:{attributes:{checkout:{branch:i.branch}},references:{pipeline:{id:i.pipelineId}}}}}),d=f(g(g(c).data).id);if(!d)throw new pe(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return d},listWorkflows:(i,c)=>s("/workflows",{"filter[run_id]":i},Rt,Bn,c),listJobs:(i,c)=>c?s("/jobs",{"filter[workflow_id]":i},Rt,Ot,c):l("/jobs",{"filter[workflow_id]":i},Rt,Ot,He),getJob:async i=>{let c=await r({method:"GET",path:`/jobs/${encodeURIComponent(i)}`});return Kn(g(c).data)},condensedOutput:async(i,c,d=0)=>o({method:"GET",path:`/jobs/${encodeURIComponent(i)}/stdout/condensed`,query:{"filter[execution]":d,"filter[step_num]":c}}).then(E=>typeof E=="string"?E:""),rerunWorkflow:async(i,c)=>{let d=await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/rerun`,body:c?{is_from_failed:!0}:void 0});return f(g(g(d).data).id)??""},cancelWorkflow:async i=>{await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/cancel`})},approve:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/approve`})},reject:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/reject`})}}}var to=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),ts={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function ro(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function rs(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function te(e,t){let r=(t??"").toLowerCase(),o=(e??"").toLowerCase(),s=r||o,l=ro(r)??ro(o)??"neutral",i=r?!to.has(r):!to.has(o)&&o!=="ended";return{label:ts[s]??rs(s),tone:l,active:i}}function Te(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function xt(e,t,r=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let s=t?Date.parse(t):r;if(!Number.isFinite(s)||s<o)return"";let l=Math.round((s-o)/1e3);if(l<60)return`${l}s`;let i=Math.floor(l/60),c=l%60;if(i<60)return c>0?`${i}m ${c}s`:`${i}m`;let d=Math.floor(i/60),E=i%60;return E>0?`${d}h ${E}m`:`${d}h`}function bt(e,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let o=Math.round((t-r)/1e3);if(o<45)return"just now";let s=Math.round(o/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let i=Math.round(l/24);return i<7?`${i}d ago`:new Date(r).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function Ie(e){return e?e.slice(0,8):""}function he(e){return e.branch??e.tag??"detached"}var os={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function oo(e){let t=e.trim();if(!t)return null;let r=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);r&&!t.includes("://")&&(t=`https://${r[1]}/${r[2]}/${r[3]}`);let o;try{o=new URL(t)}catch{return null}let s=o.hostname.toLowerCase();if(!s)return null;let l=o.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let i=l[l.length-2]??"",c=l[l.length-1]??"";return!i||!c?null:{host:s,owner:i,repo:c}}function no(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function so(e,t,r){return{segment:e&&os[e.host]||"github",owner:e?.owner??t,repo:e?.repo??r}}function ns(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function Ve(e,t){return`${ns(e)}/${t}`}function Xe(e,t,r){return`${Ve(e,t)}/workflows/${r}`}function Ze(e,t,r,o){return`${Xe(e,t,r)}/jobs/${o}`}function io(e){let t=null,r=null,o="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let i=/^\[([^\]]+)\]$/.exec(l);if(i){o=(i[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let d=(c[1]??"").trim();d&&(r===null&&(r=d),(/remote\s+"origin"/i.test(o)||/remote\s+'origin'/i.test(o))&&(t=d))}return t??r}var ao="circleci",ss=16e3,is=200,At=2e3;function co(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function Ce(e){return te(e.phase,e.outcome).label.toLowerCase()}function lo(e){let{workspace:t,run:r,workflow:o,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:r.id,runNumber:r.number,branch:r.branch,workflowId:o?.id??null,workflowName:o?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function uo(e){let t=e.workflow?.id??"run",r=e.job?.id??"";return`${e.run.id}:${t}:${r}`}function po(e){let{run:t,workflow:r,job:o}=e,s=o?.name??r?.name??`run #${t.number}`,l=Ce(o?{phase:o.phase,outcome:o.outcome}:r||{phase:t.phase,outcome:t.outcome});return co(`${s} ${l} in CircleCI run #${t.number}`,is)}function kt(e){let{workspace:t,run:r,workflow:o,job:s}=e;return o&&s&&s.number>0?Ze(t.target,r.number,o.id,s.number).slice(0,At):o?Xe(t.target,r.number,o.id).slice(0,At):Ve(t.target,r.number).slice(0,At)}function Eo(e){let{workspace:t,run:r,workflow:o,job:s,jobs:l,detail:i,output:c}=e,d=[];d.push(`CircleCI run #${r.number} on ${t.link.orgName}/${t.link.projectName}`),d.push(`Status: ${Ce({phase:r.phase,outcome:r.outcome})}`),r.pipelineName&&d.push(`Pipeline: ${r.pipelineName}`),d.push(`Ref: ${he(r)}${r.revision?` at ${Ie(r.revision)}`:""}`),r.commitSubject&&d.push(`Commit: ${r.commitSubject}`),d.push(`URL: ${kt(e)}`);let E=l.filter(p=>Te(p.outcome));if(o){if(d.push(""),d.push(`Workflow ${o.name} (${Ce(o)})`),E.length>0){d.push("Failing jobs:");for(let _ of E)d.push(`- ${_.name} (#${_.number})`)}let p=l.filter(_=>!E.includes(_));if(p.length>0){d.push("Other jobs:");for(let _ of p)d.push(`- ${_.name}: ${Ce({phase:_.phase,outcome:_.outcome})}`)}}if(s&&i){if(d.push(""),d.push(`Job ${i.name} (#${i.number})`),i.errors.length>0){d.push("Errors:");for(let _ of i.errors)d.push(`- ${_.type}: ${_.message}`)}let p=i.steps.filter(_=>_.outcome==="failed");if(p.length>0){d.push("Failed steps:");for(let _ of p)d.push(`- step ${_.num} "${_.name}"${_.exitCode!==null?` (exit ${_.exitCode})`:""}`),_.command&&d.push(`  command: ${_.command}`)}}return c&&c.trim()&&(d.push(""),d.push("Condensed output:"),d.push(c.trim())),co(d.join(`
`),ss)}var y="openchamber.sdk";var et="data-oc-scrolling",yt=`
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
:hover, [${et}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${et}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${et}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${et}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function It(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",o=>{let s=o.target===e?t:o.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=r.get(s);l!==void 0&&clearTimeout(l),r.set(s,setTimeout(()=>{r.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var as=`(${It.toString()})(document);`;var So=/^[a-z][a-z0-9-]{0,39}$/;var fo=e=>Object(e)===e&&!Array.isArray(e),Ct=(e,t)=>Object.keys(e).every(r=>t.includes(r)),_o=e=>String(e)===e&&e.length>=1&&e.length<=60,mo=e=>String(e)===e&&e.length>=1&&e.length<=80,To=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let r of e){if(!fo(r)||!So.test(r.id)||!_o(r.label)||r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1||t.has(r.id))return!1;if(t.add(r.id),r.kind==="button"){if(!Ct(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!Ct(r,["kind","id","label","value","options","disabled"])||!mo(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let o=new Set;for(let s of r.options){if(!fo(s)||!Ct(s,["value","label"])||!mo(s.value)||!_o(s.label)||o.has(s.value))return!1;o.add(s.value)}if(!o.has(r.value))return!1}return!0};var ho=["{id}","{segment}","{segments+}"];var Ii=new Set(ho);var go=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var wi=new Set(go);var wt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Ro=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==t.bytes[r])return!1;return!0};var Oo=/^[A-Za-z0-9_-]{1,80}$/;var xo=["left","right","top","bottom"];var bo=(e,t=0,r={remaining:16e3})=>{if(--r.remaining<0||t>=32)return!1;if(e===null)return!0;let o=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of o)if(!bo(s,t+1,r))return!1;return!0},vt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(vt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(vt)}return String(e)===e||Number.isFinite(e)},Nt=e=>{try{return String(e.id)!==e.id||!Oo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!xo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!bo(e.data)||!vt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var Mt=2e3;var ko=["file","directory","other","missing"],Pt=e=>!!(e&&"sessionId"in e),Lt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var yo=/^[0-9a-f]{7,64}$/i,Dt=e=>yo.test(e),tt=500,rt=32e3,Io=16e3,Co=128,wo=200,vo=2e3,No=16e3,Uo=80,Mo=200,Po=16e3;var Lo=2e3;var Gt=2e4,ot=1024,nt=2e6;var st=64e3,it=8e3,Ht=4e3;var $t=96e4,ls=60*6e4;var Do=999,Go=1e4,Fe=500,Ho=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],$o=["stopped","starting","ready","failed"],ds=new Set(Ho),Vo=e=>ds.has(e),Xo=e=>e&&Vo(e)?e:"HOST_REJECTED",we=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(we):Object(e)===e?Object.values(e).every(we):!1,Fo=e=>we(e)&&JSON.stringify(e).length<=Po,Ao=e=>e?.trim().slice(0,Mo)??"",ve=e=>{let t=e.id.trim().slice(0,Co),r=e.title.trim().slice(0,wo),o=e.url.trim().slice(0,vo),s=e.text?.trim().slice(0,No),l=e.author?.trim().slice(0,Uo),i=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:i};if(s&&(c.text=s),l&&(c.author=l),i==="pull"){let d=Ao(e.branches?.head),E=Ao(e.branches?.base);d&&E&&(c.branches={head:d,base:E})}return Fo(e.data)&&(c.data=e.data),c},Vt=e=>{let t=ve(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Xt=e=>{let t={text:e.text.trim().slice(0,Io)};return e.send&&(t.send=!0),t},Ft=e=>e===null||!Number.isFinite(e)?null:Math.min(Do,Math.max(0,Math.round(e))),jt=e=>Number.isFinite(e)?Math.min(Go,Math.max(0,Math.ceil(e))):0;var Ne=e=>e.length>0&&e.length<=ot&&!e.includes("\0")&&!e.includes("\\");var at=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Lo?!1:!e.split("/").some(r=>r==="."||r===".."),us=new Set($o),Bt=e=>!!(e&&"status"in e&&us.has(String(e.status))&&!("body"in e)),ct=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Wt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Kt=e=>!!(e&&"written"in e&&e.written===!0),zt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),ps=new Set(ko),Jt=e=>!!(e&&"kind"in e&&"size"in e&&ps.has(String(e.kind))&&Number.isFinite(e.size)),qt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Es=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),fs=e=>Object(e)===e?e:null,Ut=e=>String(e)===e&&e.length>0,_s=e=>{if(!Ut(e.id))return null;if(e.ok===!0){let t={channel:y,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Ut(e.error)?{channel:y,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Xo(Ut(e.code)?e.code:void 0)}:null},Qt=e=>{let t=fs(e);return!t||t.channel!==y||t.v!==1?null:t.type==="result"?_s(t):!Es.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var jo=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,ms=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",S=class extends Error{code;constructor(t,r){super(r),this.name="HostRequestError",this.code=t}},Bo=()=>Promise.reject(new S("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),lt=()=>Promise.reject(new S("BAD_PATH",`File path must be 1 to ${ot} characters without NUL or backslash.`)),dt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new S("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},A=e=>(e.value+=1,`oc-${e.value}`),rr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new S("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(n=>n===t.parent),o=e.requestTimeoutMs??Gt,s=new Set,l=new Set,i=new Set,c=new Set,d=new Set,E=new Set,p=new Set,_=new Set,h=new Set,C=new Set,X=new Set,P=new Set,se=[],k=null,F=null,We=new Set,Ke=new Set,Pe=null,Le=null,St=!1,Ae=new Map,ke=new Map,ye=new Map,oe=!1,b={value:0},R=null,ie=null,De=!1,Ge=!1,Pr=null,Lr=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,K=n=>{t.parent.postMessage(n,"*")},Dr=()=>{oe||t.parent===t||P.size===0||R?.features?.lateGenerateResults!==!0||K({channel:y,v:1,type:"generate-late-listen"})},L=(n,a)=>{for(let m of n)try{m(a)}catch(T){console.error(T)}},Gr=n=>{if(!(n instanceof MessageEvent)||!r(n.source))return;let a=Qt(n.data);if(!a)return;if(a.type==="workspace"){let T=ke.get(a.payload.subscriptionId);T&&L([T],a.payload.snapshot);return}if(a.type==="shells"){let T=ye.get(a.payload.subscriptionId);T&&L([T],a.payload.snapshot);return}if(a.type==="ready"){R=a.payload,ie=Lr(a.payload.session),L(s,a.payload),L(l,a.payload.directory),L(i,a.payload.session),ie&&L(c,ie),L(d,a.payload.connection),L(E,a.payload.settings),L(p,a.payload.item),a.payload.block&&L(_,a.payload.block),Dr();return}if(a.type==="service-event"){L(h,a.payload);return}if(a.type==="generate-late"){P.size===0?se.push(a.payload):L(P,a.payload);return}if(a.type==="directory"){R&&(R={...R,directory:a.payload.directory}),L(l,a.payload.directory);return}if(a.type==="session"){R&&(R={...R,session:a.payload.session}),a.payload.session?ie?.sessionId!==a.payload.session.id&&(ie=Lr(a.payload.session)):ie=null,L(i,a.payload.session);return}if(a.type==="session-lifecycle"){ie=a.payload,L(c,a.payload);return}if(a.type==="connection"){R&&(R={...R,connection:a.payload.connection}),L(d,a.payload.connection);return}if(a.type==="settings"){R&&(R={...R,settings:a.payload.settings}),L(E,a.payload.settings);return}if(a.type==="item"){R&&(R={...R,item:a.payload.item}),L(p,a.payload.item);return}if(a.type==="status-control-event"){L(C,a.payload);return}if(a.type==="popover-closed"){L(X,a.payload);return}if(a.type==="action"){let T=w=>{oe||K({channel:y,v:1,type:"action-result",id:a.id,payload:w})},U=F;if(!U){T({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>U(a.payload)).then(()=>T({ok:!0}),w=>{let V=(w instanceof Error?w.message:String(w)).trim();T({ok:!1,error:(V||"Action failed.").slice(0,Fe)})});return}if(a.type==="file-open"){let T=a.payload;if(Le&&Ro(Le,T))return;Le=T,L(We,a.payload);return}if(a.type==="file-saved"){L(Ke,a.payload.version);return}if(a.type==="file-snapshot"){let T=V=>{oe||K({channel:y,v:1,type:"file-snapshot-result",id:a.id,payload:V})},U=V=>T({error:(V.trim()||"Could not read the edited file.").slice(0,Fe)}),w=Pe;if(!w){U("This extension does not edit files.");return}Promise.resolve().then(()=>w(a.payload.purpose)).then(V=>{if(wt(V)>2e7){U(`The file is over ${2e7} ${"bytes"in V?"bytes":"characters"}.`);return}if(V.version.length>256){U(`The snapshot version is over ${256} characters.`);return}T({snapshot:"bytes"in V?{bytes:V.bytes,version:V.version}:{content:V.content,version:V.version}})},V=>U(V instanceof Error?V.message:String(V)));return}if(a.type==="resolve"){let T=w=>{K({channel:y,v:1,type:"resolve-result",id:a.id,payload:w})},U=k;if(!U){T({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>U(a.payload)).then(w=>T({item:w?ve(w):null}),w=>{let V=(w instanceof Error?w.message:String(w)).trim();T({error:(V||"Command failed.").slice(0,Fe)})});return}let m=Ae.get(a.id);if(m){if(clearTimeout(m.timer),Ae.delete(a.id),a.ok){m.resolve(a.payload);return}m.reject(new S(a.code,a.error))}};t.addEventListener("message",Gr),K({channel:y,v:1,type:"hello"});let B=(n,a=o)=>oe||t.parent===t?Promise.reject(new S("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((m,T)=>{let U=setTimeout(()=>{Ae.delete(n.id),T(new S("HOST_TIMEOUT","Host did not answer in time."))},a);Ae.set(n.id,{resolve:m,reject:T,timer:U}),K(n)}),H=n=>B(n).then(()=>{}),$={channel:y,v:1},Tt=n=>{!oe&&t.parent!==t&&K(n)},Hr=()=>Tt({...$,type:"file-save"}),$r=n=>{!jo(n)||!ms(n)||(n.preventDefault(),Hr())},Vr=n=>{!jo(n)||n.key!=="Escape"||R?.surface!=="popover"||!R.popover||(n.preventDefault(),Br(R.popover.id,"escape").catch(()=>{}))},ze=()=>{let n=R?.surface==="popover"?R.popover:void 0;if(!n)return;let a=De||Ge;Pr!==a&&(Pr=a,Wr(n.id,a).catch(()=>{}))},Je=()=>{R?.surface!=="popover"||De||(De=!0,ze())},Xr=n=>{R?.surface!=="popover"||n.relatedTarget!==null||!De||(De=!1,ze())},Fr=()=>{R?.surface!=="popover"||Ge||(Ge=!0,ze())},jr=()=>{R?.surface!=="popover"||!Ge||(Ge=!1,ze())},ee=(n,a=1024)=>{if(!n.trim()||n.length>a)throw new S("HOST_REJECTED",`Identity must contain 1 to ${a} characters.`)},ht=async n=>{n.kind!=="projects"&&ee(n.projectId);let a=await B({...$,type:"workspace-read",id:A(b),payload:n});if(!a||!("kind"in a)||!("state"in a)||a.kind!==n.kind)throw new S("HOST_REJECTED","Host did not return workspace data.");return a},gt=async(n,a)=>{n.kind!=="projects"&&ee(n.projectId);let m=A(b);ke.set(m,a);try{await H({...$,type:"workspace-subscribe",id:A(b),payload:{subscriptionId:m,query:n}})}catch(T){throw ke.delete(m),oe||K({...$,type:"workspace-unsubscribe",id:A(b),payload:{subscriptionId:m}}),T}return()=>{!ke.delete(m)||oe||K({...$,type:"workspace-unsubscribe",id:A(b),payload:{subscriptionId:m}})}},Xn=async(n,a)=>{n.kind==="session"&&ee(n.sessionId),n.kind==="project"&&ee(n.projectId);let m=A(b);ye.set(m,a);try{await H({...$,type:"shells-subscribe",id:A(b),payload:{subscriptionId:m,scope:n}})}catch(T){throw ye.delete(m),oe||K({...$,type:"shells-unsubscribe",id:A(b),payload:{subscriptionId:m}}),T}return()=>{!ye.delete(m)||oe||K({...$,type:"shells-unsubscribe",id:A(b),payload:{subscriptionId:m}})}},qe=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new S("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!we(n.value))throw new S("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new S("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&R?.features?.deviceStorage!==!0)throw new S("UNSUPPORTED","This host does not support device storage.");let a=await B({...$,type:"storage",id:A(b),payload:n});if(!a||!("storage"in a)||a.op!==n.op)throw new S("HOST_REJECTED","Host did not return storage data.");return a},Br=(n,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===n)?Promise.reject(new S("UNSUPPORTED","This host does not support popovers.")):H({...$,type:"popover-close",id:A(b),payload:a?{id:n,reason:a}:{id:n}}),Wr=(n,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===n)?Promise.reject(new S("UNSUPPORTED","This host does not support popovers.")):H({...$,type:"popover-anchor",id:A(b),payload:{id:n,active:a}});return t.addEventListener("keydown",Vr,!0),t.addEventListener("pointerover",Je),t.addEventListener("pointermove",Je),t.addEventListener("pointerout",Xr),t.addEventListener("focus",Fr),t.addEventListener("blur",jr),{onAction:n=>(F=n,()=>{F===n&&(F=null)}),listProjects:async()=>{let n=await ht({kind:"projects"});if(n.kind!=="projects")throw new S("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let a=await ht({kind:"worktrees",projectId:n});if(a.kind!=="worktrees")throw new S("HOST_REJECTED","Expected worktrees.");return a},listSessions:async n=>{let a=await ht({kind:"sessions",projectId:n});if(a.kind!=="sessions")throw new S("HOST_REJECTED","Expected sessions.");return a},onProjects:n=>gt({kind:"projects"},a=>{a.kind==="projects"&&n(a)}),onWorktrees:(n,a)=>gt({kind:"worktrees",projectId:n},m=>{m.kind==="worktrees"&&a(m)}),onSessions:(n,a)=>gt({kind:"sessions",projectId:n},m=>{m.kind==="sessions"&&a(m)}),onRunningShells:(n,a)=>Xn(n,a),readShellOutput:async(n,a)=>{ee(n,128);let m=a?.cursor;if(m!==void 0&&(!Number.isInteger(m)||m<0))throw new S("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let T=a?.tailBytes;if(T!==void 0&&(!Number.isInteger(T)||T<1||T>65536))throw new S("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let w=await B({...$,type:"shell-output",id:A(b),payload:{shellId:n,cursor:m,tailBytes:T}});if(!w||typeof w.output!="string"||!Number.isFinite(w.cursor))throw new S("HOST_REJECTED","Host did not return shell output.");return w},stopShell:async n=>{if(ee(n,128),(await B({...$,type:"shell-stop",id:A(b),payload:{shellId:n}}))?.stopped!==!0)throw new S("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{ee(n),await H({...$,type:"open-session",id:A(b),payload:{sessionId:n}})},storage:{get:async(n,a)=>{let m=dt(a),T={op:"get",key:n};m&&(T.scope=m);let U=await qe(T);return U.op==="get"&&U.found?U.value:void 0},set:async(n,a,m)=>{let T=dt(m),U={op:"set",key:n,value:a};T&&(U.scope=T),await qe(U)},delete:async(n,a)=>{let m=dt(a),T={op:"delete",key:n};m&&(T.scope=m),await qe(T)},keys:async n=>{let a=dt(n),m={op:"keys"};a&&(m.scope=a);let T=await qe(m);if(T.op!=="keys")throw new S("HOST_REJECTED","Expected storage keys.");return T.keys}},onReady:n=>(s.add(n),R&&n(R),()=>{s.delete(n)}),onDirectory:n=>(l.add(n),R&&n(R.directory),()=>{l.delete(n)}),onSession:n=>(i.add(n),R&&n(R.session),()=>{i.delete(n)}),onSessionLifecycle:n=>(c.add(n),ie&&n(ie),()=>{c.delete(n)}),onConnection:n=>(d.add(n),R&&n(R.connection),()=>{d.delete(n)}),onSettings:n=>(E.add(n),R&&n(R.settings),()=>{E.delete(n)}),onItem:n=>(p.add(n),R&&n(R.item),()=>{p.delete(n)}),onBlock:n=>(_.add(n),R?.block&&n(R.block),()=>{_.delete(n)}),onServiceEvent:n=>(h.add(n),()=>{h.delete(n)}),onStatusControl:n=>(C.add(n),()=>{C.delete(n)}),onPopoverClosed:n=>(X.add(n),()=>{X.delete(n)}),setStatusControls:n=>R?.features?.statusControls!==!0?Promise.reject(new S("UNSUPPORTED","This host does not support status controls.")):To(n)?H({...$,type:"status-controls",id:A(b),payload:{controls:n}}):Promise.reject(new S("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>R?.features?.popovers!==!0?Promise.reject(new S("UNSUPPORTED","This host does not support popovers.")):Nt(n)?H({...$,type:"popover-open",id:A(b),payload:n}):Promise.reject(new S("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Br,setPopoverAnchorActive:Wr,onResolve:n=>(k=n,()=>{k===n&&(k=null)}),toast:n=>{let a=n.message.trim();return!a||a.length>tt?Promise.reject(new S("HOST_REJECTED",`Toast message must contain 1 to ${tt} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>rt)?Promise.reject(new S("HOST_REJECTED",`Toast copy text must contain 1 to ${rt} characters.`)):H({channel:y,v:1,type:"toast",id:A(b),payload:{...n,message:a}})},openUrl:n=>H({channel:y,v:1,type:"open-url",id:A(b),payload:{url:n}}),openCommit:n=>Dt(n)?H({channel:y,v:1,type:"open-commit",id:A(b),payload:{sha:n}}):Promise.reject(new S("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>H({channel:y,v:1,type:"block-answer",id:A(b),payload:{text:n.trim().slice(0,Mt)}}),openSurface:n=>H({channel:y,v:1,type:"open-surface",id:A(b),payload:{surfaceId:n}}),writeClipboard:n=>H({channel:y,v:1,type:"clipboard-write",id:A(b),payload:{text:n}}),compose:n=>H({channel:y,v:1,type:"compose",id:A(b),payload:n}),attach:n=>H({channel:y,v:1,type:"attach",id:A(b),payload:ve(n)}),startSession:async n=>{n.projectId!==void 0&&ee(n.projectId);let a=n.worktree;a&&a!==!0&&(a.kind==="existing"?ee(a.directory):(a.name!==void 0&&ee(a.name,200),a.baseBranch!==void 0&&ee(a.baseBranch,200)));let m=await B({channel:y,v:1,type:"start-session",id:A(b),payload:Vt(n)},e.requestTimeoutMs??18e4);if(!Pt(m))throw new S("HOST_REJECTED","Host did not return a session.");return m},prompt:n=>B({channel:y,v:1,type:"prompt",id:A(b),payload:Xt(n)}).then(a=>{if(!Lt(a))throw new S("HOST_REJECTED","Host did not return a prompt result.");return a}),sessionLink:n=>H({channel:y,v:1,type:"session-link",id:A(b),payload:ve(n)}),close:()=>H({channel:y,v:1,type:"close",id:A(b)}),oauthStart:()=>H({channel:y,v:1,type:"oauth-start",id:A(b)}),oauthDisconnect:()=>H({channel:y,v:1,type:"oauth-disconnect",id:A(b)}),request:n=>(at(n.path)?B({channel:y,v:1,type:"request",id:A(b),payload:n}):Bo()).then(a=>{if(!ct(a))throw new S("HOST_REJECTED","Host request result was empty.");return a}),serviceRequest:n=>(at(n.path)?B({channel:y,v:1,type:"service-request",id:A(b),payload:n}):Bo()).then(a=>{if(!ct(a))throw new S("HOST_REJECTED","Host service request result was empty.");return a}),serviceStatus:()=>B({channel:y,v:1,type:"service-status",id:A(b)}).then(n=>{if(!Bt(n))throw new S("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Ne(n)?B({channel:y,v:1,type:"file-read",id:A(b),payload:{path:n}}):lt()).then(a=>{if(!Wt(a))throw new S("HOST_REJECTED","Host did not return file content.");return a}),writeFile:(n,a)=>Ne(n)?a.length>nt?Promise.reject(new S("FILE_TOO_LARGE",`Content is over ${nt} characters.`)):B({channel:y,v:1,type:"file-write",id:A(b),payload:{path:n,content:a}}).then(m=>{if(!Kt(m))throw new S("HOST_REJECTED","Host did not confirm the write.");return m}):lt(),listDir:n=>(Ne(n)?B({channel:y,v:1,type:"file-list",id:A(b),payload:{path:n}}):lt()).then(a=>{if(!zt(a))throw new S("HOST_REJECTED","Host did not return directory entries.");return a}),stat:n=>(Ne(n)?B({channel:y,v:1,type:"file-stat",id:A(b),payload:{path:n}}):lt()).then(a=>{if(!Jt(a))throw new S("HOST_REJECTED","Host did not return file status.");return a}),generate:n=>{let a=n.prompt.trim(),m=n.system?.trim();if(a.length===0||a.length>st)return Promise.reject(new S("HOST_REJECTED",`Prompt must be 1 to ${st} characters.`));if(m!==void 0&&(m.length===0||m.length>it))return Promise.reject(new S("HOST_REJECTED",`System prompt must be 1 to ${it} characters.`));let T=n.maxOutputTokens===void 0?void 0:Math.min(Ht,Math.max(1,Math.floor(n.maxOutputTokens)));if(T!==void 0&&!Number.isFinite(T))return Promise.reject(new S("HOST_REJECTED","maxOutputTokens must be a number."));let U={prompt:a};return m!==void 0&&(U.system=m),T!==void 0&&(U.maxOutputTokens=T),B({channel:y,v:1,type:"generate",id:A(b),payload:U},e.requestTimeoutMs??$t).then(w=>{if(!qt(w))throw new S("HOST_REJECTED","Host did not return generated text.");return w})},onLateGenerateResult:n=>{P.add(n);for(let a of se.splice(0))L([n],a);return Dr(),()=>{P.delete(n)}},setBadge:n=>H({channel:y,v:1,type:"badge",id:A(b),payload:{count:Ft(n)}}),setHeight:n=>H({channel:y,v:1,type:"resize",id:A(b),payload:{height:jt(n)}}),onFileOpen:n=>(We.add(n),St||(St=!0,t.addEventListener("keydown",$r,!0)),Le&&n(Le),()=>{We.delete(n)}),onFileSnapshot:n=>(Pe=n,()=>{Pe===n&&(Pe=null)}),onFileSaved:n=>(Ke.add(n),()=>{Ke.delete(n)}),reportFileChange:n=>Tt({...$,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Hr,reportFileUnsupported:()=>Tt({...$,type:"file-unsupported"}),dispose:()=>{for(let n of ke.keys())K({...$,type:"workspace-unsubscribe",id:A(b),payload:{subscriptionId:n}});ke.clear();for(let n of ye.keys())K({...$,type:"shells-unsubscribe",id:A(b),payload:{subscriptionId:n}});ye.clear(),oe=!0,k=null,F=null,Pe=null,We.clear(),Ke.clear(),St&&t.removeEventListener("keydown",$r,!0),t.removeEventListener("message",Gr),t.removeEventListener("keydown",Vr,!0),t.removeEventListener("pointerover",Je),t.removeEventListener("pointermove",Je),t.removeEventListener("pointerout",Xr),t.removeEventListener("focus",Fr),t.removeEventListener("blur",jr);for(let n of Ae.values())clearTimeout(n.timer),n.reject(new S("HOST_UNAVAILABLE","Host client was disposed."));Ae.clear(),s.clear(),l.clear(),i.clear(),c.clear(),d.clear(),E.clear(),p.clear(),_.clear(),h.clear(),C.clear(),X.clear(),P.clear(),se.length=0}}};var zo=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Bi=new Set(zo);var Ss=10*6e4;var Ts=10*6e4;var hs=10*6e4;var gs=10*6e4;var Jo=["none","agent","user"];var Ki=new Set(Jo);var z=rr(),qo=async e=>z.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function ae(e,t){try{await z.toast({kind:e,message:t})}catch{}}function Qo(e){return z.readFile(e)}function Yo(e){return{providerId:ao,id:uo(e).slice(0,128),title:po(e),url:kt(e),kind:"issue",text:Eo(e),data:lo(e)}}async function Zo(e){await z.attach(Yo(e))}async function en(e,t={}){await z.startSession({...Yo(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}function x(e,t={},...r){let o=document.createElement(e);t.className&&(o.className=t.className),t.text!==void 0&&(o.textContent=t.text),t.title&&(o.title=t.title),t.style&&o.setAttribute("style",t.style),t.role&&o.setAttribute("role",t.role),t.ariaLabel&&o.setAttribute("aria-label",t.ariaLabel);for(let s of r)s==null||s===!1||o.append(typeof s=="string"?document.createTextNode(s):s);return o}function tn(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var Rs={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function Q(e){return e instanceof pe?e.message:e instanceof S?Rs[e.code]??e.message:e instanceof Error?e.message:String(e)}function Os(e){return e instanceof S?e.code:null}function or(e){let t=Os(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}function rn(e){let t=null,r=()=>{t!==null&&(window.clearTimeout(t),t=null)};return{arm:()=>{r(),!(!e.enabled()||!e.active())&&(t=window.setTimeout(()=>{t=null,e.onTick()},e.delayMs))},stop:r}}var xs=["all","failed","running"];function on(e){return xs.includes(e)?e:"all"}function bs(e){return[`#${e.number}`,he(e),Ie(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function As(e,t,r=""){if(t==="failed"&&!Te(e.outcome)||t==="running"&&!te(e.phase,e.outcome).active)return!1;let o=r.trim().toLowerCase();return o===""||bs(e).includes(o)}function nn(e,t,r=""){return e.filter(o=>As(o,t,r))}function nr(e){return e.some(t=>te(t.phase,t.outcome).active)}var ks=`
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
`,sn="circleci-shared-style";function an(){if(document.getElementById(sn))return;let e=document.createElement("style");e.id=sn,e.textContent=ks,document.head.append(e)}async function cn(e,t,r,o){try{return await e.rerunWorkflow(t.id,r),await o("success",`Rerun started for ${t.name}.`),!0}catch(s){return await o("error",Q(s)),!1}}async function ln(e,t,r){try{return await e.cancelWorkflow(t.id),await r("success",`Cancellation requested for ${t.name}.`),!0}catch(o){return await r("error",Q(o)),!1}}async function dn(e,t,r,o){try{return r?await e.approve(t.id):await e.reject(t.id),await o("success",r?`Approved ${t.name}.`:`Rejected ${t.name}.`),!0}catch(s){return await o("error",Q(s)),!1}}var un="prefs";function ys(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)}function pn(e){return`project:${ys(e)}`}function En(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function je(e){return typeof e=="string"&&e.length>0?e:null}function Is(e){if(!En(e))return null;let t=je(e.projectId),r=je(e.projectName),o=je(e.orgName),s=je(e.directory);if(!t||!r||!o||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:r,orgName:o,slug:je(e.slug),source:l,directory:s}}async function fn(e,t){let r=Is(await e.get(pn(t)));return!r||r.directory!==t?null:r}async function _n(e,t,r){await e.set(pn(t),{projectId:r.projectId,projectName:r.projectName,orgName:r.orgName,slug:r.slug,source:r.source,directory:t})}var Cs={autoRefresh:!0};function ws(e){return En(e)?{autoRefresh:e.autoRefresh!==!1}:{...Cs}}async function sr(e){return ws(await e.get(un))}async function mn(e,t){let o={...await sr(e),...t};return await e.set(un,{autoRefresh:o.autoRefresh}),o}var vs=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Ns=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Sn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of vs)t.style.setProperty(r,e.tokens[o]);for(let[r,o,s]of Ns){let l=e.tokens[s]??"";t.style.setProperty(r,l),t.style.setProperty(o,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},ir=(e,t)=>{Sn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Us={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},M=(e,t)=>`var(--${e}, var(--oc-${Us[e]}, ${t}))`,le=M("surface-background","transparent"),pt=M("surface-elevated","transparent"),Ue=M("surface-elevated-foreground","inherit"),J=M("surface-foreground","inherit"),D=M("surface-muted-foreground","gray"),Ms=M("surface-muted","transparent"),ge=M("interactive-border","currentColor"),W=M("interactive-hover","transparent"),Re=M("interactive-active","transparent"),ar=M("interactive-selection","transparent"),cr=M("interactive-selection-foreground","inherit"),ce=M("primary","currentColor"),lr=M("primary-text","inherit"),dr=M("error-text","inherit"),Ps=M("font-sans","inherit"),ur=M("font-mono","monospace"),Rn=M("radius","9px"),pr=`calc(${Rn} - 2px)`,Tn=`calc(${Rn} - 4px)`,G=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,hn=`background-image: linear-gradient(${W}, ${W});`,Er=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,fr="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",gn="box-shadow: var(--oc-sdk-lit);",_r=`inset 0 0.5px 0 0 ${G(J,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Ls=`
:root {
  --oc-sdk-edge: ${G(J,16)};
  --oc-sdk-field-bg: ${pt};
  --oc-sdk-raised-bg: ${le};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${G(J,14)};
  --oc-sdk-field-bg: ${G(le,50,pt)};
  --oc-sdk-raised-bg: ${pt};
  --oc-sdk-field-lift: ${_r};
  --oc-sdk-raised-lift: ${_r};
  --oc-sdk-lit: ${_r};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,ut=e=>{let t=M(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${M(`${e}-text`,"inherit")}; }`},Ds=`
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
`,On=`${Ls}
.oc-sdk { color: ${J}; font-family: ${Ps}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${hn} }
.oc-sdk-mono { font-family: ${ur}; }
.oc-sdk-muted { color: ${D}; }
${ut("success")}${ut("warning")}${ut("error")}${ut("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ce}; --oc-sdk-tone-text: ${lr}; }

.oc-sdk-btn { border-radius: ${pr}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Tn}; }
.oc-sdk-btn[data-variant="default"] { color: ${lr}; background: ${G(ce,10,le)}; border-color: ${G(ce,12)}; ${gn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${G(ce,16,le)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${G(ce,22,le)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Ms}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Ue}; ${fr} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Re}, ${Re}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${W}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Re}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${M("status-error","red")}; color: ${dr}; background: ${G("var(--oc-sdk-tone)",7,le)}; border-color: ${G("var(--oc-sdk-tone)",12)}; ${gn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${G("var(--oc-sdk-tone)",9,le)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${G("var(--oc-sdk-tone)",11,le)}; box-shadow: none; }

.oc-sdk-field-note { color: ${D}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${dr}; }
.oc-sdk-input { border-radius: ${pr}; background: var(--oc-sdk-field-bg); color: ${Ue}; ${Er("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${D}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Er(G(J,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Er(M("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${ur}; }

.oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ce}; }
.oc-sdk-search-clear { border-radius: ${Tn}; color: ${D}; }
.oc-sdk-search-clear:hover { background: ${W}; color: ${J}; }

.oc-sdk-trigger { border-radius: ${pr}; background: var(--oc-sdk-raised-bg); color: ${Ue}; ${fr} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${W}, ${W}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${D}; }
.oc-sdk-trigger-chevron { color: ${D}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Ue}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${pt}; background-clip: padding-box; color: ${Ue}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${W}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${ar}; color: ${cr}; }
.oc-sdk-option-check { color: ${J}; }
.oc-sdk-option[data-destructive="true"] { color: ${dr}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${G(M("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${D}; }
.oc-sdk-popup-empty { color: ${D}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${ge}; border-radius: 4px; color: ${J}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${G(J,60,ge)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${ge}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${le}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ce}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${hn} }
.oc-sdk-check-desc { color: ${D}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${G(J,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${D}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${J}; }
.oc-sdk-tab[aria-selected="true"] { color: ${cr}; background: ${ar}; border-color: ${ge}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Ue}; background: var(--oc-sdk-raised-bg); ${fr} }
.oc-sdk-tab-count { color: ${D}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${G(J,6)}; color: ${D}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${G("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${W}; }
.oc-sdk-row[aria-selected="true"] { background: ${ar}; color: ${cr}; }
.oc-sdk-row-lead { font-family: ${ur}; color: ${D}; }
.oc-sdk-row-sub { color: ${D}; }
.oc-sdk-row-meta { color: ${D}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${D}; }

.oc-sdk-empty-body { color: ${D}; }

.oc-sdk-spinner { color: ${D}; }
.oc-sdk-spinner-ring { border-color: ${ge}; border-top-color: ${ce}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${G("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${D}; }

.oc-sdk-separator { color: ${D}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${G(ge,40)}; }

.oc-sdk-progress-label { color: ${D}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${G(J,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ce}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${M("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${M("success-text","inherit")}; }

.oc-sdk-text a { color: ${lr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${G(ge,60)}; }
`,v=`
${yt}
${Ds}
${On}`;var xn="oc-sdk-ui-style",de=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},N=e=>{let t=document.getElementById(xn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}It(document);let r=document.createElement("style");r.id=xn,r.textContent=e,document.head.appendChild(r)},O=(e,t)=>{let r=document.createElement(e);return t&&(r.className=t),r},Y=e=>{let t=O("button",e);return t.type="button",t},j=(e,t)=>{let r=t??"";e.textContent!==r&&(e.textContent=r)},re=(e,t,r)=>{r==null||r===""?e.removeAttribute(t):e.getAttribute(t)!==r&&e.setAttribute(t,r)},bn=(e,t)=>{let r=o=>{o.target instanceof Node&&e.contains(o.target)||t()};return document.addEventListener("pointerdown",r,!0),()=>{document.removeEventListener("pointerdown",r,!0)}};var Gs=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},ue=(e,t)=>{N(v);let r=t,o=Y("oc-sdk oc-sdk-btn"),s=Gs(),l=document.createElement("span");o.append(l),e.append(o);let i=()=>{o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=!!r.disabled||!!r.loading,o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&s.parentNode!==o?o.prepend(s):!r.loading&&s.parentNode===o&&s.remove(),j(l,r.label)},c=()=>{r.disabled||r.loading||r.onClick()};return o.addEventListener("click",c),i(),{update:d=>{r={...r,...d},i()},dispose:()=>{o.removeEventListener("click",c),o.remove()}}};var An="http://www.w3.org/2000/svg",Hs={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Ee=(e,t,r)=>{let o=document.createElementNS(An,"svg");o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r&&o.setAttribute("class",r);let s=document.createElementNS(An,"path");return s.setAttribute("d",Hs[e]),o.append(s),o};var mr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-search"),s=O("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=Y("oc-sdk-search-clear");l.append(Ee("close",14)),l.tabIndex=-1,o.append(Ee("search",16,"oc-sdk-search-icon"),s,l),e.append(o);let i=()=>{let p=r.placeholder??"Search";re(s,"placeholder",p),s.setAttribute("aria-label",r.label??p),l.setAttribute("aria-label","Clear search"),s.value!==r.value&&(s.value=r.value),o.dataset.active=r.value.trim()===""?"false":"true"},c=()=>{r.value!==""&&r.onChange(""),s.focus()},d=()=>{r.onChange(s.value)},E=p=>{p.key==="Escape"&&s.value!==""&&(p.preventDefault(),c())};return s.addEventListener("input",d),s.addEventListener("keydown",E),l.addEventListener("click",c),i(),r.autofocus&&s.focus(),{update:p=>{r={...r,...p},i()},dispose:()=>{s.removeEventListener("input",d),s.removeEventListener("keydown",E),l.removeEventListener("click",c),o.remove()}}};var fe=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},_e=(e,t,r)=>{let o=e.filter(d=>!d.disabled);if(o.length===0)return null;let s=o[0],l=o[o.length-1];if(r==="first"||!s||!l)return s?.id??null;if(r==="last")return l.id;let i=o.findIndex(d=>d.id===t);return i===-1?r==="next"?s.id:l.id:o[Math.min(o.length-1,Math.max(0,i+(r==="next"?1:-1)))]?.id??null};var kn=(e,t)=>`${e}-${t??""}`,Sr=(e,t,r,o)=>{let s=Y("oc-sdk-option");s.id=kn(e,r.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!r.disabled,t==="option"&&s.setAttribute("aria-selected",r.selected?"true":"false"),s.dataset.destructive=r.destructive?"true":"false";let l=O("span","oc-sdk-option-label");if(l.textContent=r.label,s.append(l),r.hint){let i=O("span","oc-sdk-option-hint");i.textContent=r.hint,s.append(i)}if(t==="option"){s.dataset.mark="check";let i=O("span","oc-sdk-option-check");i.append(Ee("check",14)),s.append(i)}return s.addEventListener("pointerenter",o.hover),s.addEventListener("click",o.pick),s},Tr=(e,t,r,o)=>{let s=kn(r,o);for(let l of Array.from(e.children))l instanceof HTMLElement&&l.classList.contains("oc-sdk-option")&&(l.dataset.active=l.id===s?"true":"false");re(t,"aria-activedescendant",o?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var $s=(e,t)=>{let r=t.getBoundingClientRect();e.style.minWidth=`${Math.round(r.width)}px`,e.style.left=`${Math.round(r.left)}px`,e.style.top=`${Math.round(r.bottom+4)}px`;let o=e.offsetHeight,s=window.innerHeight-r.bottom-8;o>s&&r.top-8>s&&(e.style.top=`${Math.max(8,Math.round(r.top-4-o))}px`);let l=r.left+e.offsetWidth-window.innerWidth+8;l>0&&(e.style.left=`${Math.max(8,Math.round(r.left-l))}px`)},hr=(e,t,r,o)=>{e.append(r),$s(r,t);let s=bn(e,o),l=()=>{o()},i=c=>{c.target instanceof Node&&r.contains(c.target)||o()};return window.addEventListener("resize",l),window.addEventListener("scroll",i,!0),()=>{s(),window.removeEventListener("resize",l),window.removeEventListener("scroll",i,!0),r.remove()}};var gr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let s=()=>{de(o),o.dataset.track=r.trackBackground?"true":"false";for(let i of r.items){let c=Y("oc-sdk-tab");c.setAttribute("role","tab");let d=i.id===r.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=i.id;let E=O("span");if(E.textContent=i.label,c.append(E),i.count!==void 0){let p=O("span","oc-sdk-tab-count");p.textContent=String(i.count),c.append(p)}c.addEventListener("click",()=>{i.id!==r.activeId&&r.onChange(i.id)}),o.append(c)}},l=i=>{let c=fe(i,"horizontal");if(!c)return;let d=_e(r.items,r.activeId,c);if(d&&d!==r.activeId){i.preventDefault(),r.onChange(d);let E=o.querySelector(`[data-id="${CSS.escape(d)}"]`);E instanceof HTMLElement&&E.focus()}};return o.addEventListener("keydown",l),s(),{update:i=>{r={...r,...i},s()},dispose:()=>{o.removeEventListener("keydown",l),o.remove()}}};var Et=(e,t)=>{re(e,"data-tone",t&&t!=="neutral"?t:null)},Rr=(e,t)=>{N(v);let r=t,o=O("span","oc-sdk oc-sdk-badge");e.append(o);let s=()=>{j(o,r.label),Et(o,r.tone)};return s(),{update:l=>{r={...r,...l},s()},dispose:()=>{o.remove()}}};var Vs=0,Or=(e,t)=>{N(v);let r=t,o=`oc-sdk-list-${Vs+=1}`,s=O("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,i=_=>`${o}-${_}`,c=_=>{l=_;for(let h of Array.from(s.children))h instanceof HTMLElement&&(h.dataset.active=h.id===i(_??"")?"true":"false");re(s,"aria-activedescendant",_?i(_):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},d=(_,h)=>{let C=O("span",_);return C.textContent=h,C},E=()=>{if(de(s),re(s,"aria-label",r.ariaLabel),r.items.length===0){s.append(d("oc-sdk-list-empty",r.emptyText??"Nothing here")),c(null);return}for(let h of r.items){let C=Y("oc-sdk-row");C.id=i(h.id),C.setAttribute("role","option"),C.setAttribute("aria-selected",h.id===r.selectedId?"true":"false"),C.disabled=!!h.disabled,C.tabIndex=-1,h.leading&&C.append(d("oc-sdk-row-lead",h.leading));let X=O("span","oc-sdk-row-main");if(X.append(d("oc-sdk-row-title",h.title)),h.subtitle&&X.append(d("oc-sdk-row-sub",h.subtitle)),C.append(X),h.badge){let P=d("oc-sdk-badge",h.badge.label);Et(P,h.badge.tone),C.append(P)}h.meta&&C.append(d("oc-sdk-row-meta",h.meta)),C.addEventListener("click",()=>r.onSelect(h.id)),s.append(C)}let _=r.items.some(h=>h.id===l&&!h.disabled);c(_?l:r.selectedId??null)},p=_=>{let h=fe(_);if(h){_.preventDefault(),c(_e(r.items,l,h));return}(_.key==="Enter"||_.key===" ")&&l&&(_.preventDefault(),r.onSelect(l))};return s.addEventListener("keydown",p),E(),{update:_=>{r={...r,..._},E()},dispose:()=>{s.removeEventListener("keydown",p),s.remove()}}};var xr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-empty"),s=O("h2","oc-sdk-empty-title"),l=O("p","oc-sdk-empty-body"),i=O("div","oc-sdk-empty-action");o.append(s,l,i),e.append(o);let c=null,d=()=>{if(j(s,r.title),j(l,r.body),l.hidden=!r.body,i.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let E={label:r.action.label,onClick:r.action.onClick};c?c.update(E):c=ue(i,{...E,variant:"outline",size:"sm"})};return d(),{update:E=>{r={...r,...E},d()},dispose:()=>{c?.dispose(),c=null,o.remove()}}};var br=(e,t={})=>{N(v);let r=t,o=O("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let s=O("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=O("span");o.append(s,l),e.append(o);let i=()=>{o.dataset.size=r.size??"default",j(l,r.label),l.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return i(),{update:c=>{r={...r,...c},i()},dispose:()=>{o.remove()}}};var Ar=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-banner"),s=O("div","oc-sdk-banner-text"),l=O("div","oc-sdk-banner-title"),i=O("div","oc-sdk-banner-body"),c=O("div","oc-sdk-banner-action");s.append(l,i),o.append(s,c),e.append(o);let d=null,E=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),j(l,r.title),j(i,r.body),i.hidden=!r.body,c.hidden=!r.action,!r.action){d?.dispose(),d=null;return}let p={label:r.action.label,onClick:r.action.onClick};d?d.update(p):d=ue(c,{...p,variant:"outline",size:"xs"})};return E(),{update:p=>{r={...r,...p},E()},dispose:()=>{d?.dispose(),d=null,o.remove()}}};var yn=e=>e.filter(t=>!("separator"in t)),Xs=0,kr=(e,t)=>{N(v);let r=t,o=`oc-sdk-menu-${Xs+=1}`,s=O("div","oc-sdk oc-sdk-menu");e.append(s);let l=O("div","oc-sdk oc-sdk-popup");l.setAttribute("role","menu"),l.tabIndex=-1;let i=null,c=null,d=ue(s,{label:r.label,variant:r.variant,size:r.size,onClick:()=>{i?h():C()}}),E=s.querySelector("button");E?.setAttribute("aria-haspopup","menu");let p=k=>{c=k,Tr(l,l,o,k)},_=()=>{de(l);for(let k of r.items){if("separator"in k){let F=O("div","oc-sdk-separator");F.dataset.labeled="false",l.append(F);continue}l.append(Sr(o,"menuitem",k,{hover:()=>p(k.id),pick:()=>X(k.id)}))}p(yn(r.items).some(k=>k.id===c)?c:null)},h=()=>{let k=i;i=null,k?.(),c=null,E?.setAttribute("aria-expanded","false")},C=()=>{i||!E||(_(),i=hr(s,E,l,h),E.setAttribute("aria-expanded","true"),l.focus())},X=k=>{h(),E?.focus(),r.onSelect(k)},P=k=>{let F=fe(k);F?(k.preventDefault(),p(_e(yn(r.items),c,F))):k.key==="Enter"||k.key===" "?(k.preventDefault(),c&&X(c)):k.key==="Escape"&&(k.preventDefault(),h(),E?.focus())},se=k=>{i&&!(k.relatedTarget instanceof Node&&s.contains(k.relatedTarget))&&h()};return l.addEventListener("keydown",P),s.addEventListener("focusout",se),{update:k=>{r={...r,...k},d.update({label:r.label,variant:r.variant,size:r.size}),i&&_()},dispose:()=>{h(),l.removeEventListener("keydown",P),s.removeEventListener("focusout",se),d.dispose(),s.remove()}}};var Fs=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,js=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},In=e=>{let t=[],r=0;for(let o of e.matchAll(Fs)){let s=o.index??0;s>r&&t.push({kind:"text",text:e.slice(r,s)});let l=o[1]??"",i=(o[2]??"").trim(),c=o[3]??"";js(c)?l==="!"?t.push({kind:"image",src:c,alt:i}):t.push({kind:"link",href:c,label:i||c}):t.push({kind:"text",text:o[0]}),r=s+o[0].length}return r<e.length&&t.push({kind:"text",text:e.slice(r)}),t},yr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-text");e.append(o);let s=i=>{!(i.target instanceof HTMLAnchorElement)||!r.onOpenUrl||(i.preventDefault(),r.onOpenUrl(i.target.href))},l=()=>{de(o);for(let i of In(r.text))if(i.kind==="text")o.append(document.createTextNode(i.text));else if(i.kind==="link"){let c=O("a");c.href=i.href,c.rel="noopener noreferrer",c.target="_blank",c.textContent=i.label,o.append(c)}else{let c=O("img");c.src=i.src,c.alt=i.alt,c.loading="lazy",c.referrerPolicy="no-referrer",o.append(c)}};return o.addEventListener("click",s),l(),{update:i=>{r={...r,...i},l()},dispose:()=>{o.removeEventListener("click",s),o.remove()}}};var Cn=[];function ne(e){return Cn.push(e),e}function wn(){for(let e of Cn.splice(0))try{e.dispose()}catch{}}var q=(e,t)=>ne(ue(e,t));var vn=(e,t)=>ne(mr(e,t));var Nn=(e,t)=>ne(gr(e,t)),Js=(e,t)=>ne(Rr(e,t)),Un=(e,t)=>ne(Or(e,t)),Be=(e,t)=>ne(xr(e,t)),qs=(e,t)=>ne(br(e,t)),Mn=(e,t)=>ne(Ar(e,t)),Ir=(e,t)=>ne(kr(e,t)),Qs=(e,t)=>ne(yr(e,t));function Cr(e,t="notice"){let r=document.createElement("div");return r.className=t,Qs(r,{text:e,onOpenUrl:Oe}),r}function ft(e,t){let r=document.createElement("span"),o=te(e,t);return Js(r,{label:o.label,tone:o.tone}),r}function wr(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),qs(t,{label:e}),t}function Pn(e){ir(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Oe(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}z.openUrl(e).catch(()=>{})}}function Ln(e,t,r){return{directory:e,link:t,repo:r,target:so(r,t.orgName,t.projectName)}}async function Dn(e){try{let t=await e(".git/config"),r=io(t.content);return r?oo(r):null}catch{return null}}async function Gn(e,t,r,o){let s=await fn(t,r);if(s)return Ln(r,s,await Dn(o));let l=await Dn(o);if(!l)return null;for(let i of no(l))try{let c=await e.findProjectBySlug(i);if(!c||!c.id)continue;return await _n(t,r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected"}),Ln(r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected",directory:r},l)}catch{}return null}var be=document.querySelector("#root");if(!be)throw new Error("CircleCI page is missing its #root element.");var me=eo(qo),vr=z.storage,Ys=3e4,_t=null,u={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],runsNext:null,filter:"all",search:"",selectedRun:null,workflows:[],jobs:{},jobErrors:{},preferences:{autoRefresh:!0},loading:!0,loadingDetail:!1,error:null},xe=0;async function $n(){if(Z(),u.preferences=await sr(vr),u.directory=u.ready?.directory??null,!u.connected){u.loading=!1,Z();return}if(!u.directory){u.loading=!1,Z();return}try{if(u.workspace=await Gn(me,vr,u.directory,Qo),!u.workspace){u.loading=!1,Z();return}await Vn()}catch(e){u.loading=!1,u.error=Q(e),or(e)&&(u.connected=!1),Z()}}async function Vn(){let e=u.workspace;if(!e)return;let t=++xe;u.loading=!0,u.error=null,Z();try{let r=await me.listRuns(e.link.projectId);if(t!==xe)return;u.runs=r.items,u.runsNext=r.next,u.loading=!1;let o=u.runs.filter(s=>Te(s.outcome)).length;if(z.setBadge(o>0?o:null).catch(()=>{}),u.selectedRun){let s=u.runs.find(l=>l.id===u.selectedRun?.id);s&&(u.selectedRun=s)}if(!u.selectedRun&&r.items[0]){await Ur(r.items[0]);return}}catch(r){if(t!==xe)return;u.loading=!1,u.error=Q(r),or(r)&&(u.connected=!1)}Z(),Mr()}async function Ur(e){let t=++xe;u.selectedRun=e,u.workflows=[],u.jobs={},u.loadingDetail=!0,Z();try{let r=await me.listWorkflows(e.id);if(t!==xe)return;u.workflows=r.items,u.jobErrors={};let o=await Promise.allSettled(r.items.map(s=>me.listJobs(s.id)));if(t!==xe)return;for(let[s,l]of o.entries()){let i=r.items[s];i&&(l.status==="fulfilled"?u.jobs[i.id]=l.value.items:(u.jobs[i.id]=[],u.jobErrors[i.id]=Q(l.reason)))}u.loadingDetail=!1}catch(r){if(t!==xe)return;u.loadingDetail=!1,u.error=Q(r)}Z(),Mr()}async function Me(){return u.selectedRun?Ur(u.selectedRun):Vn()}function mt(e){let t=u.workspace,r=u.selectedRun;if(!t||!r)return null;let o=e.workflow??null;return{workspace:t,run:r,workflow:o,job:e.job??null,jobs:e.jobs??(o?u.jobs[o.id]??[]:[]),detail:null,output:null}}async function Nr(e){if(e)try{await Zo(e),await ae("success","Attached to the chat box.")}catch(t){await ae("error",Q(t))}}async function Zs(e){if(e)try{await en(e),await ae("success","Started a worktree chat for this build.")}catch(t){await ae("error",Q(t))}}async function ei(e,t){await cn(me,e,t,ae)&&await Me()}async function ti(e){await ln(me,e,ae)&&await Me()}async function Hn(e,t){await dn(me,e,t,ae)&&await Me()}function ri(){return u.selectedRun?nr(u.workflows):nr(u.runs)}var oi=rn({delayMs:Ys,enabled:()=>u.preferences.autoRefresh,active:ri,onTick:()=>void Me()});function Mr(){oi.arm()}function Z(){if(wn(),_t=null,tn(be),!u.connected){ni();return}if(!u.directory||!u.workspace){si();return}if(ii(),u.error){let t=x("div");be?.append(t),Mn(t,{tone:"error",title:"CircleCI",body:u.error,action:{label:"Retry",onClick:()=>void Me()}})}let e=x("div",{className:"page-columns"});e.append(ci()),e.append(di()),be?.append(e)}function ni(){let e=x("div");be?.append(e),Be(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. The token stays in OpenChamber.",action:{label:"Open CircleCI tokens",onClick:()=>Oe("https://app.circleci.com/settings/user/tokens")}})}function si(){let e=x("div");be?.append(e),Be(e,{title:u.directory&&!u.workspace?"No CircleCI project yet":"No project open",body:u.directory&&!u.workspace?"Open the CircleCI panel once to choose which CircleCI project this repository maps to.":"Open a project in OpenChamber, then open the CircleCI panel to map it."})}function ii(){let e=u.workspace,t=x("div",{className:"toolbar"}),r=x("div",{style:"flex:1; min-width:0;"});if(Ir(r,{label:e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",size:"sm",variant:"ghost",items:[{id:"refresh",label:"Refresh"},{separator:!0},u.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"}],onSelect:o=>{o==="refresh"&&Me(),(o==="pause"||o==="resume")&&mn(vr,{autoRefresh:o==="resume"}).then(s=>{u.preferences=s,Z(),Mr()})}}),t.append(r),e){let o=x("div");q(o,{label:"Project in CircleCI",size:"sm",variant:"outline",onClick:()=>Oe(`https://app.circleci.com/pipelines/${e.target.segment}/${e.target.owner}/${e.target.repo}`)}),t.append(o)}be?.append(t)}function ai(){return nn(u.runs,u.filter,u.search)}function ci(){let e=x("div",{className:"column"}),t=x("div"),r=Nn(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:u.filter,onChange:E=>{u.filter=on(E),r.update({activeId:u.filter}),_t?.paint()}});e.append(t);let o=x("div");e.append(o);let s=x("div",{className:"scroll"});e.append(s);let l=()=>ai().map(E=>{let p=te(E.phase,E.outcome);return{id:E.id,leading:`#${E.number}`,title:he(E),...E.commitSubject?{subtitle:E.commitSubject}:{},meta:bt(E.createdAt),badge:{label:p.label,tone:p.tone}}}),i=()=>u.runs.length===0?"No runs yet. Push a commit.":"No run matches this filter.";if(u.loading&&u.runs.length===0)return s.append(wr("Loading runs")),e;let c=Un(s,{items:l(),emptyText:i(),selectedId:u.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:E=>{let p=u.runs.find(_=>_.id===E);p&&Ur(p)}}),d=null;if(d=vn(o,{value:u.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:E=>{u.search=E,d?.update({value:E}),_t?.paint()}}),_t={tabs:r,paint:()=>c.update({items:l(),emptyText:i()})},u.runsNext){let E=x("div",{className:"load-more"});q(E,{label:"Load more",size:"sm",variant:"ghost",onClick:()=>void li()}),e.append(E)}return e}async function li(){let e=u.workspace;if(!(!e||!u.runsNext))try{let t=await me.listRuns(e.link.projectId,u.runsNext);u.runs=[...u.runs,...t.items],u.runsNext=t.next,Z()}catch(t){await ae("error",Q(t))}}function di(){let e=x("div",{className:"column"}),t=u.selectedRun;if(!t){let d=x("div");return e.append(d),Be(d,{title:"Pick a run",body:"Choose a run on the left to see its workflows and jobs."}),e}let r=x("div",{className:"detail-head"});r.append(x("div",{className:"badge-line"},ft(t.phase,t.outcome))),r.append(x("div",{className:"detail-title"},`#${t.number} ${he(t)}`));let o=[];t.revision&&o.push(Ie(t.revision)),t.commitSubject&&o.push(t.commitSubject),o.push(bt(t.createdAt)),r.append(x("div",{className:"detail-sub"},o.filter(Boolean).join(" \xB7 ")));let s=x("div",{className:"detail-actions"}),l=x("div");q(l,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>Oe(u.workspace?Ve(u.workspace.target,t.number):null)}),s.append(l);let i=x("div");q(i,{label:"Attach run",size:"sm",variant:"outline",onClick:()=>void Nr(mt({workflow:null,job:null,jobs:[]}))}),s.append(i),r.append(s),t.errors.length>0&&r.append(Cr(t.errors.map(d=>`${d.type}: ${d.message}`).join(" \xB7 "),"notice error-text")),e.append(r);let c=x("div",{className:"scroll"});if(e.append(c),u.loadingDetail)return c.append(wr("Loading workflows")),e;if(u.workflows.length===0){let d=x("div");return c.append(d),Be(d,{title:"No workflows",body:"This run produced no workflows."}),e}for(let d of u.workflows)c.append(ui(d,t));return e}function ui(e,t){let r=x("div",{className:"section"}),o=x("div",{className:"section-head"});o.append(x("span",{className:"section-title"},e.name)),o.append(x("span",{className:"spacer"})),o.append(x("span",{className:"muted"},xt(e.createdAt,e.endedAt))),o.append(ft(e.phase,e.outcome)),r.append(o);let s=x("div",{className:"job-row-actions"}),l=x("div");if(Ir(l,{label:"Rerun",size:"xs",variant:"ghost",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:p=>void ei(e,p==="failed")}),s.append(l),te(e.phase,e.outcome).active){let p=x("div");q(p,{label:"Cancel",size:"xs",variant:"ghost",onClick:()=>void ti(e)}),s.append(p)}let i=x("div");q(i,{label:"Attach",size:"xs",variant:"outline",onClick:()=>void Nr(mt({workflow:e}))}),s.append(i);let c=x("div");q(c,{label:"Open",size:"xs",variant:"ghost",onClick:()=>Oe(u.workspace?Xe(u.workspace.target,t.number,e.id):null)}),s.append(c),r.append(s);let d=u.jobErrors[e.id];if(d)return r.append(Cr(`Could not list this workflow's jobs: ${d}`,"notice error-text")),r;let E=u.jobs[e.id]??[];if(E.length===0)return r.append(x("p",{className:"notice"},"No jobs listed.")),r;for(let p of E){let _=p.type.toLowerCase()==="approval",h=te(p.phase,p.outcome),C=x("div",{className:"job-row"}),X=x("div",{className:"job-row-head"});X.append(x("span",{className:"job-row-name"},p.name)),X.append(x("span",{className:"job-row-meta"},[p.number>0?`#${p.number}`:"",xt(p.startedAt,p.endedAt)].filter(Boolean).join(" \xB7 "))),X.append(ft(p.phase,p.outcome)),C.append(X);let P=x("div",{className:"job-row-actions"});if(_&&h.active){let k=x("div");q(k,{label:"Approve",size:"xs",onClick:()=>void Hn(p,!0)}),P.append(k);let F=x("div");q(F,{label:"Reject",size:"xs",variant:"ghost",onClick:()=>void Hn(p,!1)}),P.append(F)}if(Te(p.outcome)){let k=x("div");q(k,{label:"Attach failure",size:"xs",variant:"outline",onClick:()=>void Nr(mt({workflow:e,job:p}))}),P.append(k);let F=x("div");q(F,{label:"Fix with agent",size:"xs",variant:"ghost",onClick:()=>void Zs(mt({workflow:e,job:p}))}),P.append(F)}let se=x("div");q(se,{label:"Open",size:"xs",variant:"ghost",onClick:()=>{u.workspace&&Oe(Ze(u.workspace.target,t.number,e.id,p.number))}}),P.append(se),P.childElementCount>0&&C.append(P),r.append(C)}return r}z.onReady(e=>{Pn(e),an(),u.ready=e,!u.booted&&(u.booted=!0,u.connected=e.connection.connected,$n())});z.onConnection(e=>{let t=u.connected;u.connected=e.connected,e.connected&&!t&&$n(),!e.connected&&t&&Z()});})();
