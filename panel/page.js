"use strict";(()=>{var Ee=class extends Error{status;code;constructor(t,r,o){super(o),this.name="CircleCIError",this.status=t,this.code=r}},$n="/api/v3",Ze=20,Ot=20,Wr=50,Vn=50,He=4,ci=He*Ze,zr=[1e3,2500],g=e=>typeof e=="object"&&e!==null?e:{},Se=e=>Array.isArray(e)?e:[],f=e=>typeof e=="string"&&e.length>0?e:null,$e=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Yr(e){return Se(e).map(t=>{let r=g(t);return{type:f(r.type)??"unknown",message:f(r.message)??""}})}function Zr(e){return Se(e).map(t=>{let r=g(t);return{type:f(r.type)??"unknown",message:f(r.message)??"",description:f(r.description),url:f(r.url)}})}function Ye(e){let t=g(e),r=g(t.attributes),o=g(t.references),s=g(o.event),l=g(s.attributes),i=g(l.vcs),c=g(i.commit),d=g(o.pipeline),u=g(o.trigger),E=g(u.attributes);return{id:f(t.id)??"",number:$e(r.number)??0,phase:f(r.phase)??"unknown",outcome:f(r.current_outcome),createdAt:f(r.created_at)??"",branch:f(i.branch),tag:f(i.tag),revision:f(i.revision),commitSubject:f(c.subject),commitUrl:f(c.url),pipelineName:f(g(d.attributes).name),trigger:f(E.name)??f(g(E.event_source).type)??f(l.type),errors:Yr(r.errors),warnings:Zr(r.warnings)}}function Xn(e){let t=g(e),r=g(t.attributes),o=g(r.auto_rerun);return{id:f(t.id)??"",name:f(r.name)??"Workflow",phase:f(r.phase)??"unknown",outcome:f(r.current_outcome)??f(r.outcome),createdAt:f(r.created_at),endedAt:f(r.ended_at),tag:f(r.tag),autoRerunNumber:$e(o.number)}}function xt(e){let t=g(e),r=g(t.attributes);return{id:f(t.id)??"",name:f(r.name)??"Job",number:$e(r.number)??0,type:f(r.type)??"build",phase:f(r.phase)??"unknown",outcome:f(r.outcome),startedAt:f(r.started_at),endedAt:f(r.ended_at)}}function Fn(e){let t=g(e);return{num:$e(t.num)??0,name:f(t.name)??"Step",type:f(t.type)??"run",phase:f(t.phase)??"unknown",outcome:f(t.outcome),exitCode:$e(t.exit_code),command:f(t.command),startedAt:f(t.started_at),endedAt:f(t.ended_at)}}function jn(e){let t=xt(e),r=g(g(e).attributes),o=Se(r.parallel_executions).map(g),s=o.length>0?Se(o[0]?.steps).map(Fn):[];return{...t,errors:Yr(r.errors),warnings:Zr(r.warnings),steps:s,parallelExecutions:o.length}}function Jr(e){let t=g(e),r=g(t.attributes),o=g(g(t.references).org);return{id:f(t.id)??"",name:f(r.name)??"Project",orgId:f(o.id)??"",orgName:f(g(o.attributes).name)??""}}function Bn(e){let t=g(e),r=g(t.attributes);return{id:f(t.id)??"",name:f(r.name)??"Organization",vcsProvider:f(g(r.vcs).provider)}}function qr(e){let t=g(e),r=g(t.attributes),o=g(r.config);return{id:f(t.id)??"",name:f(r.name)??"Pipeline",configPath:f(o.file_path)??""}}function Kn(e){let t=g(e),r=g(t.attributes);return{id:f(t.id)??"",login:f(r.login)??"CircleCI account",name:f(r.name),avatarUrl:f(r.avatar_url)}}function Wn(e){if(!e)return;let t={};for(let[r,o]of Object.entries(e))o==null||o===""||(t[r]=String(o));return Object.keys(t).length>0?t:void 0}function Qr(e){if(e)try{return JSON.parse(e)}catch{return}}function zn(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Jn(e,t,r){let o=g(g(t).error),s=f(o.detail)??f(o.title)??f(o.type)??zn(e);return new Ee(e,f(o.type)??`HTTP_${e}`,s)}function qn(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function Qn(e){return new Promise(t=>setTimeout(t,e))}function eo(e){async function t(i,c){let d=Wn(i.query),u=0;for(;;){let E=await e({method:i.method,path:$n+i.path,...d?{query:d}:{},...i.body===void 0?{}:{body:JSON.stringify(i.body)}});if(E.status>=400){if(qn(E.status,i.method)&&u<zr.length){await Qn(zr[u]??2500),u+=1;continue}throw Jn(E.status,Qr(E.body),E.body)}return c(E.body)}}let r=i=>t(i,Qr),o=i=>t(i,c=>c);async function s(i,c,d,u,E){let _=E?{...c,"page[cursor]":E}:{...c,"page[limit]":d},S;try{S=await r({method:"GET",path:i,query:_})}catch(y){if(!E&&y instanceof Ee&&y.status===400)S=await r({method:"GET",path:i,query:{...c}});else throw y}return{items:Se(g(S).data).map(u),next:f(g(g(S).page).next)}}async function l(i,c,d,u,E){let _=[],S,y=null;for(let L=0;L<E;L+=1){let X=await s(i,c,d,u,S);if(_.push(...X.items),y=X.next,!y)break;S=y}return{items:_,next:y}}return{currentUser:async()=>{let i=await r({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=Se(g(i).data)[0];if(!c)throw new Ee(200,"EMPTY_USER","CircleCI returned no user.");return Kn(c)},listOrgs:async()=>(await l("/orgs",{},Wr,Bn,He)).items,findProjectBySlug:async i=>{let c=await r({method:"GET",path:"/projects",query:{"filter[slug]":i}}),d=Se(g(c).data)[0];return d?Jr(d):null},listProjectsOfOrg:i=>l("/projects",{"filter[org_id]":i},Wr,Jr,He),listPipelines:async i=>{let c=await l("/pipelines",{"filter[project_id]":i},Vn,qr,1),d=[];for(let u of c.items)if(u.id)try{let E=await r({method:"GET",path:`/pipelines/${encodeURIComponent(u.id)}`,query:{"filter[project_id]":i}});d.push(qr(g(E).data))}catch{d.push({...u,name:"Pipeline config"})}return d},listRuns:(i,c)=>s("/runs",{"filter[project_id]":i},Ze,Ye,c),listMyRuns:i=>s("/runs",{"filter[user_id]":"me"},Ze,Ye,i),getRun:async i=>{let c=await r({method:"GET",path:`/runs/${encodeURIComponent(i)}`});return Ye(g(c).data)},findRunByNumber:async(i,c)=>{let d;for(let u=0;u<He;u+=1){let E=await s("/runs",{"filter[project_id]":i},Ze,Ye,d),_=E.items.find(S=>S.number===c);if(_)return _;if(!E.next)return null;d=E.next}return null},fireRun:async i=>{let c=await r({method:"POST",path:"/runs",query:{"filter[project_id]":i.projectId},body:{data:{attributes:{checkout:{branch:i.branch}},references:{pipeline:{id:i.pipelineId}}}}}),d=f(g(g(c).data).id);if(!d)throw new Ee(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return d},listWorkflows:(i,c)=>s("/workflows",{"filter[run_id]":i},Ot,Xn,c),listJobs:(i,c)=>c?s("/jobs",{"filter[workflow_id]":i},Ot,xt,c):l("/jobs",{"filter[workflow_id]":i},Ot,xt,He),getJob:async i=>{let c=await r({method:"GET",path:`/jobs/${encodeURIComponent(i)}`});return jn(g(c).data)},condensedOutput:async(i,c,d=0)=>o({method:"GET",path:`/jobs/${encodeURIComponent(i)}/stdout/condensed`,query:{"filter[execution]":d,"filter[step_num]":c}}).then(u=>typeof u=="string"?u:""),rerunWorkflow:async(i,c)=>{let d=await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/rerun`,body:c?{is_from_failed:!0}:void 0});return f(g(g(d).data).id)??""},cancelWorkflow:async i=>{await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/cancel`})},approve:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/approve`})},reject:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/reject`})}}}var to=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Yn={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function ro(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Zn(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function re(e,t){let r=(t??"").toLowerCase(),o=(e??"").toLowerCase(),s=r||o,l=ro(r)??ro(o)??"neutral",i=r?!to.has(r):!to.has(o)&&o!=="ended";return{label:Yn[s]??Zn(s),tone:l,active:i}}function Te(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function At(e,t,r=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let s=t?Date.parse(t):r;if(!Number.isFinite(s)||s<o)return"";let l=Math.round((s-o)/1e3);if(l<60)return`${l}s`;let i=Math.floor(l/60),c=l%60;if(i<60)return c>0?`${i}m ${c}s`:`${i}m`;let d=Math.floor(i/60),u=i%60;return u>0?`${d}h ${u}m`:`${d}h`}function bt(e,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let o=Math.round((t-r)/1e3);if(o<45)return"just now";let s=Math.round(o/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let i=Math.round(l/24);return i<7?`${i}d ago`:new Date(r).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function ye(e){return e?e.slice(0,8):""}function he(e){return e.branch??e.tag??"detached"}var es={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function oo(e){let t=e.trim();if(!t)return null;let r=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);r&&!t.includes("://")&&(t=`https://${r[1]}/${r[2]}/${r[3]}`);let o;try{o=new URL(t)}catch{return null}let s=o.hostname.toLowerCase();if(!s)return null;let l=o.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let i=l[l.length-2]??"",c=l[l.length-1]??"";return!i||!c?null:{host:s,owner:i,repo:c}}function no(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function so(e,t,r){return{segment:e&&es[e.host]||"github",owner:e?.owner??t,repo:e?.repo??r}}function ts(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function Ve(e,t){return`${ts(e)}/${t}`}function Xe(e,t,r){return`${Ve(e,t)}/workflows/${r}`}function et(e,t,r,o){return`${Xe(e,t,r)}/jobs/${o}`}function io(e){let t=null,r=null,o="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let i=/^\[([^\]]+)\]$/.exec(l);if(i){o=(i[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let d=(c[1]??"").trim();d&&(r===null&&(r=d),(/remote\s+"origin"/i.test(o)||/remote\s+'origin'/i.test(o))&&(t=d))}return t??r}var ao="circleci",rs=16e3,os=200,kt=2e3;function co(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function Ce(e){return re(e.phase,e.outcome).label.toLowerCase()}function lo(e){let{workspace:t,run:r,workflow:o,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:r.id,runNumber:r.number,branch:r.branch,workflowId:o?.id??null,workflowName:o?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function uo(e){let t=e.workflow?.id??"run",r=e.job?.id??"";return`${e.run.id}:${t}:${r}`}function po(e){let{run:t,workflow:r,job:o}=e,s=o?.name??r?.name??`run #${t.number}`,l=Ce(o?{phase:o.phase,outcome:o.outcome}:r||{phase:t.phase,outcome:t.outcome});return co(`${s} ${l} in CircleCI run #${t.number}`,os)}function It(e){let{workspace:t,run:r,workflow:o,job:s}=e;return o&&s&&s.number>0?et(t.target,r.number,o.id,s.number).slice(0,kt):o?Xe(t.target,r.number,o.id).slice(0,kt):Ve(t.target,r.number).slice(0,kt)}function Eo(e){let{workspace:t,run:r,workflow:o,job:s,jobs:l,detail:i,output:c}=e,d=[];d.push(`CircleCI run #${r.number} on ${t.link.orgName}/${t.link.projectName}`),d.push(`Status: ${Ce({phase:r.phase,outcome:r.outcome})}`),r.pipelineName&&d.push(`Pipeline: ${r.pipelineName}`),d.push(`Ref: ${he(r)}${r.revision?` at ${ye(r.revision)}`:""}`),r.commitSubject&&d.push(`Commit: ${r.commitSubject}`),d.push(`URL: ${It(e)}`);let u=l.filter(E=>Te(E.outcome));if(o){if(d.push(""),d.push(`Workflow ${o.name} (${Ce(o)})`),u.length>0){d.push("Failing jobs:");for(let _ of u)d.push(`- ${_.name} (#${_.number})`)}let E=l.filter(_=>!u.includes(_));if(E.length>0){d.push("Other jobs:");for(let _ of E)d.push(`- ${_.name}: ${Ce({phase:_.phase,outcome:_.outcome})}`)}}if(s&&i){if(d.push(""),d.push(`Job ${i.name} (#${i.number})`),i.errors.length>0){d.push("Errors:");for(let _ of i.errors)d.push(`- ${_.type}: ${_.message}`)}let E=i.steps.filter(_=>_.outcome==="failed");if(E.length>0){d.push("Failed steps:");for(let _ of E)d.push(`- step ${_.num} "${_.name}"${_.exitCode!==null?` (exit ${_.exitCode})`:""}`),_.command&&d.push(`  command: ${_.command}`)}}return c&&c.trim()&&(d.push(""),d.push("Condensed output:"),d.push(c.trim())),co(d.join(`
`),rs)}var I="openchamber.sdk";var tt="data-oc-scrolling",yt=`
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
:hover, [${tt}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${tt}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${tt}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${tt}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Ct(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",o=>{let s=o.target===e?t:o.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=r.get(s);l!==void 0&&clearTimeout(l),r.set(s,setTimeout(()=>{r.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var ns=`(${Ct.toString()})(document);`;var So=/^[a-z][a-z0-9-]{0,39}$/;var fo=e=>Object(e)===e&&!Array.isArray(e),wt=(e,t)=>Object.keys(e).every(r=>t.includes(r)),_o=e=>String(e)===e&&e.length>=1&&e.length<=60,mo=e=>String(e)===e&&e.length>=1&&e.length<=80,To=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let r of e){if(!fo(r)||!So.test(r.id)||!_o(r.label)||r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1||t.has(r.id))return!1;if(t.add(r.id),r.kind==="button"){if(!wt(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!wt(r,["kind","id","label","value","options","disabled"])||!mo(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let o=new Set;for(let s of r.options){if(!fo(s)||!wt(s,["value","label"])||!mo(s.value)||!_o(s.label)||o.has(s.value))return!1;o.add(s.value)}if(!o.has(r.value))return!1}return!0};var ho=["{id}","{segment}","{segments+}"];var Ai=new Set(ho);var go=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var ki=new Set(go);var vt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Ro=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==t.bytes[r])return!1;return!0};var Oo=/^[A-Za-z0-9_-]{1,80}$/;var xo=["left","right","top","bottom"];var Ao=(e,t=0,r={remaining:16e3})=>{if(--r.remaining<0||t>=32)return!1;if(e===null)return!0;let o=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of o)if(!Ao(s,t+1,r))return!1;return!0},Nt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(Nt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(Nt)}return String(e)===e||Number.isFinite(e)},Ut=e=>{try{return String(e.id)!==e.id||!Oo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!xo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Ao(e.data)||!Nt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var Pt=2e3;var ko=["file","directory","other","missing"],Lt=e=>!!(e&&"sessionId"in e),Dt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Io=/^[0-9a-f]{7,64}$/i,Gt=e=>Io.test(e),rt=500,ot=32e3,yo=16e3,Co=128,wo=200,vo=2e3,No=16e3,Uo=80,Mo=200,Po=16e3;var Lo=2e3;var Ht=2e4,nt=1024,st=2e6;var it=64e3,at=8e3,$t=4e3;var Vt=96e4,is=60*6e4;var Do=999,Go=1e4,Fe=500,Ho=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],$o=["stopped","starting","ready","failed"],as=new Set(Ho),Vo=e=>as.has(e),Xo=e=>e&&Vo(e)?e:"HOST_REJECTED",we=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(we):Object(e)===e?Object.values(e).every(we):!1,Fo=e=>we(e)&&JSON.stringify(e).length<=Po,bo=e=>e?.trim().slice(0,Mo)??"",ve=e=>{let t=e.id.trim().slice(0,Co),r=e.title.trim().slice(0,wo),o=e.url.trim().slice(0,vo),s=e.text?.trim().slice(0,No),l=e.author?.trim().slice(0,Uo),i=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:i};if(s&&(c.text=s),l&&(c.author=l),i==="pull"){let d=bo(e.branches?.head),u=bo(e.branches?.base);d&&u&&(c.branches={head:d,base:u})}return Fo(e.data)&&(c.data=e.data),c},Xt=e=>{let t=ve(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Ft=e=>{let t={text:e.text.trim().slice(0,yo)};return e.send&&(t.send=!0),t},jt=e=>e===null||!Number.isFinite(e)?null:Math.min(Do,Math.max(0,Math.round(e))),Bt=e=>Number.isFinite(e)?Math.min(Go,Math.max(0,Math.ceil(e))):0;var Ne=e=>e.length>0&&e.length<=nt&&!e.includes("\0")&&!e.includes("\\");var ct=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Lo?!1:!e.split("/").some(r=>r==="."||r===".."),cs=new Set($o),Kt=e=>!!(e&&"status"in e&&cs.has(String(e.status))&&!("body"in e)),lt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Wt=e=>!!(e&&"content"in e&&String(e.content)===e.content),zt=e=>!!(e&&"written"in e&&e.written===!0),Jt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),ls=new Set(ko),qt=e=>!!(e&&"kind"in e&&"size"in e&&ls.has(String(e.kind))&&Number.isFinite(e.size)),Qt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),ds=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),us=e=>Object(e)===e?e:null,Mt=e=>String(e)===e&&e.length>0,ps=e=>{if(!Mt(e.id))return null;if(e.ok===!0){let t={channel:I,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Mt(e.error)?{channel:I,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Xo(Mt(e.code)?e.code:void 0)}:null},Yt=e=>{let t=us(e);return!t||t.channel!==I||t.v!==1?null:t.type==="result"?ps(t):!ds.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var jo=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Es=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",T=class extends Error{code;constructor(t,r){super(r),this.name="HostRequestError",this.code=t}},Bo=()=>Promise.reject(new T("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),dt=()=>Promise.reject(new T("BAD_PATH",`File path must be 1 to ${nt} characters without NUL or backslash.`)),ut=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new T("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},b=e=>(e.value+=1,`oc-${e.value}`),or=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new T("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(n=>n===t.parent),o=e.requestTimeoutMs??Ht,s=new Set,l=new Set,i=new Set,c=new Set,d=new Set,u=new Set,E=new Set,_=new Set,S=new Set,y=new Set,L=new Set,X=new Set,q=[],k=null,ee=null,We=new Set,ze=new Set,Pe=null,Le=null,Tt=!1,be=new Map,ke=new Map,Ie=new Map,ne=!1,A={value:0},R=null,ae=null,De=!1,Ge=!1,Pr=null,Lr=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,K=n=>{t.parent.postMessage(n,"*")},Dr=()=>{ne||t.parent===t||X.size===0||R?.features?.lateGenerateResults!==!0||K({channel:I,v:1,type:"generate-late-listen"})},P=(n,a)=>{for(let m of n)try{m(a)}catch(h){console.error(h)}},Gr=n=>{if(!(n instanceof MessageEvent)||!r(n.source))return;let a=Yt(n.data);if(!a)return;if(a.type==="workspace"){let h=ke.get(a.payload.subscriptionId);h&&P([h],a.payload.snapshot);return}if(a.type==="shells"){let h=Ie.get(a.payload.subscriptionId);h&&P([h],a.payload.snapshot);return}if(a.type==="ready"){R=a.payload,ae=Lr(a.payload.session),P(s,a.payload),P(l,a.payload.directory),P(i,a.payload.session),ae&&P(c,ae),P(d,a.payload.connection),P(u,a.payload.settings),P(E,a.payload.item),a.payload.block&&P(_,a.payload.block),Dr();return}if(a.type==="service-event"){P(S,a.payload);return}if(a.type==="generate-late"){X.size===0?q.push(a.payload):P(X,a.payload);return}if(a.type==="directory"){R&&(R={...R,directory:a.payload.directory}),P(l,a.payload.directory);return}if(a.type==="session"){R&&(R={...R,session:a.payload.session}),a.payload.session?ae?.sessionId!==a.payload.session.id&&(ae=Lr(a.payload.session)):ae=null,P(i,a.payload.session);return}if(a.type==="session-lifecycle"){ae=a.payload,P(c,a.payload);return}if(a.type==="connection"){R&&(R={...R,connection:a.payload.connection}),P(d,a.payload.connection);return}if(a.type==="settings"){R&&(R={...R,settings:a.payload.settings}),P(u,a.payload.settings);return}if(a.type==="item"){R&&(R={...R,item:a.payload.item}),P(E,a.payload.item);return}if(a.type==="status-control-event"){P(y,a.payload);return}if(a.type==="popover-closed"){P(L,a.payload);return}if(a.type==="action"){let h=w=>{ne||K({channel:I,v:1,type:"action-result",id:a.id,payload:w})},U=ee;if(!U){h({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>U(a.payload)).then(()=>h({ok:!0}),w=>{let V=(w instanceof Error?w.message:String(w)).trim();h({ok:!1,error:(V||"Action failed.").slice(0,Fe)})});return}if(a.type==="file-open"){let h=a.payload;if(Le&&Ro(Le,h))return;Le=h,P(We,a.payload);return}if(a.type==="file-saved"){P(ze,a.payload.version);return}if(a.type==="file-snapshot"){let h=V=>{ne||K({channel:I,v:1,type:"file-snapshot-result",id:a.id,payload:V})},U=V=>h({error:(V.trim()||"Could not read the edited file.").slice(0,Fe)}),w=Pe;if(!w){U("This extension does not edit files.");return}Promise.resolve().then(()=>w(a.payload.purpose)).then(V=>{if(vt(V)>2e7){U(`The file is over ${2e7} ${"bytes"in V?"bytes":"characters"}.`);return}if(V.version.length>256){U(`The snapshot version is over ${256} characters.`);return}h({snapshot:"bytes"in V?{bytes:V.bytes,version:V.version}:{content:V.content,version:V.version}})},V=>U(V instanceof Error?V.message:String(V)));return}if(a.type==="resolve"){let h=w=>{K({channel:I,v:1,type:"resolve-result",id:a.id,payload:w})},U=k;if(!U){h({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>U(a.payload)).then(w=>h({item:w?ve(w):null}),w=>{let V=(w instanceof Error?w.message:String(w)).trim();h({error:(V||"Command failed.").slice(0,Fe)})});return}let m=be.get(a.id);if(m){if(clearTimeout(m.timer),be.delete(a.id),a.ok){m.resolve(a.payload);return}m.reject(new T(a.code,a.error))}};t.addEventListener("message",Gr),K({channel:I,v:1,type:"hello"});let j=(n,a=o)=>ne||t.parent===t?Promise.reject(new T("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((m,h)=>{let U=setTimeout(()=>{be.delete(n.id),h(new T("HOST_TIMEOUT","Host did not answer in time."))},a);be.set(n.id,{resolve:m,reject:h,timer:U}),K(n)}),H=n=>j(n).then(()=>{}),$={channel:I,v:1},ht=n=>{!ne&&t.parent!==t&&K(n)},Hr=()=>ht({...$,type:"file-save"}),$r=n=>{!jo(n)||!Es(n)||(n.preventDefault(),Hr())},Vr=n=>{!jo(n)||n.key!=="Escape"||R?.surface!=="popover"||!R.popover||(n.preventDefault(),Br(R.popover.id,"escape").catch(()=>{}))},Je=()=>{let n=R?.surface==="popover"?R.popover:void 0;if(!n)return;let a=De||Ge;Pr!==a&&(Pr=a,Kr(n.id,a).catch(()=>{}))},qe=()=>{R?.surface!=="popover"||De||(De=!0,Je())},Xr=n=>{R?.surface!=="popover"||n.relatedTarget!==null||!De||(De=!1,Je())},Fr=()=>{R?.surface!=="popover"||Ge||(Ge=!0,Je())},jr=()=>{R?.surface!=="popover"||!Ge||(Ge=!1,Je())},te=(n,a=1024)=>{if(!n.trim()||n.length>a)throw new T("HOST_REJECTED",`Identity must contain 1 to ${a} characters.`)},gt=async n=>{n.kind!=="projects"&&te(n.projectId);let a=await j({...$,type:"workspace-read",id:b(A),payload:n});if(!a||!("kind"in a)||!("state"in a)||a.kind!==n.kind)throw new T("HOST_REJECTED","Host did not return workspace data.");return a},Rt=async(n,a)=>{n.kind!=="projects"&&te(n.projectId);let m=b(A);ke.set(m,a);try{await H({...$,type:"workspace-subscribe",id:b(A),payload:{subscriptionId:m,query:n}})}catch(h){throw ke.delete(m),ne||K({...$,type:"workspace-unsubscribe",id:b(A),payload:{subscriptionId:m}}),h}return()=>{!ke.delete(m)||ne||K({...$,type:"workspace-unsubscribe",id:b(A),payload:{subscriptionId:m}})}},Hn=async(n,a)=>{n.kind==="session"&&te(n.sessionId),n.kind==="project"&&te(n.projectId);let m=b(A);Ie.set(m,a);try{await H({...$,type:"shells-subscribe",id:b(A),payload:{subscriptionId:m,scope:n}})}catch(h){throw Ie.delete(m),ne||K({...$,type:"shells-unsubscribe",id:b(A),payload:{subscriptionId:m}}),h}return()=>{!Ie.delete(m)||ne||K({...$,type:"shells-unsubscribe",id:b(A),payload:{subscriptionId:m}})}},Qe=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new T("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!we(n.value))throw new T("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new T("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&R?.features?.deviceStorage!==!0)throw new T("UNSUPPORTED","This host does not support device storage.");let a=await j({...$,type:"storage",id:b(A),payload:n});if(!a||!("storage"in a)||a.op!==n.op)throw new T("HOST_REJECTED","Host did not return storage data.");return a},Br=(n,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===n)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):H({...$,type:"popover-close",id:b(A),payload:a?{id:n,reason:a}:{id:n}}),Kr=(n,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===n)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):H({...$,type:"popover-anchor",id:b(A),payload:{id:n,active:a}});return t.addEventListener("keydown",Vr,!0),t.addEventListener("pointerover",qe),t.addEventListener("pointermove",qe),t.addEventListener("pointerout",Xr),t.addEventListener("focus",Fr),t.addEventListener("blur",jr),{onAction:n=>(ee=n,()=>{ee===n&&(ee=null)}),listProjects:async()=>{let n=await gt({kind:"projects"});if(n.kind!=="projects")throw new T("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let a=await gt({kind:"worktrees",projectId:n});if(a.kind!=="worktrees")throw new T("HOST_REJECTED","Expected worktrees.");return a},listSessions:async n=>{let a=await gt({kind:"sessions",projectId:n});if(a.kind!=="sessions")throw new T("HOST_REJECTED","Expected sessions.");return a},onProjects:n=>Rt({kind:"projects"},a=>{a.kind==="projects"&&n(a)}),onWorktrees:(n,a)=>Rt({kind:"worktrees",projectId:n},m=>{m.kind==="worktrees"&&a(m)}),onSessions:(n,a)=>Rt({kind:"sessions",projectId:n},m=>{m.kind==="sessions"&&a(m)}),onRunningShells:(n,a)=>Hn(n,a),readShellOutput:async(n,a)=>{te(n,128);let m=a?.cursor;if(m!==void 0&&(!Number.isInteger(m)||m<0))throw new T("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let h=a?.tailBytes;if(h!==void 0&&(!Number.isInteger(h)||h<1||h>65536))throw new T("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let w=await j({...$,type:"shell-output",id:b(A),payload:{shellId:n,cursor:m,tailBytes:h}});if(!w||typeof w.output!="string"||!Number.isFinite(w.cursor))throw new T("HOST_REJECTED","Host did not return shell output.");return w},stopShell:async n=>{if(te(n,128),(await j({...$,type:"shell-stop",id:b(A),payload:{shellId:n}}))?.stopped!==!0)throw new T("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{te(n),await H({...$,type:"open-session",id:b(A),payload:{sessionId:n}})},storage:{get:async(n,a)=>{let m=ut(a),h={op:"get",key:n};m&&(h.scope=m);let U=await Qe(h);return U.op==="get"&&U.found?U.value:void 0},set:async(n,a,m)=>{let h=ut(m),U={op:"set",key:n,value:a};h&&(U.scope=h),await Qe(U)},delete:async(n,a)=>{let m=ut(a),h={op:"delete",key:n};m&&(h.scope=m),await Qe(h)},keys:async n=>{let a=ut(n),m={op:"keys"};a&&(m.scope=a);let h=await Qe(m);if(h.op!=="keys")throw new T("HOST_REJECTED","Expected storage keys.");return h.keys}},onReady:n=>(s.add(n),R&&n(R),()=>{s.delete(n)}),onDirectory:n=>(l.add(n),R&&n(R.directory),()=>{l.delete(n)}),onSession:n=>(i.add(n),R&&n(R.session),()=>{i.delete(n)}),onSessionLifecycle:n=>(c.add(n),ae&&n(ae),()=>{c.delete(n)}),onConnection:n=>(d.add(n),R&&n(R.connection),()=>{d.delete(n)}),onSettings:n=>(u.add(n),R&&n(R.settings),()=>{u.delete(n)}),onItem:n=>(E.add(n),R&&n(R.item),()=>{E.delete(n)}),onBlock:n=>(_.add(n),R?.block&&n(R.block),()=>{_.delete(n)}),onServiceEvent:n=>(S.add(n),()=>{S.delete(n)}),onStatusControl:n=>(y.add(n),()=>{y.delete(n)}),onPopoverClosed:n=>(L.add(n),()=>{L.delete(n)}),setStatusControls:n=>R?.features?.statusControls!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support status controls.")):To(n)?H({...$,type:"status-controls",id:b(A),payload:{controls:n}}):Promise.reject(new T("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>R?.features?.popovers!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):Ut(n)?H({...$,type:"popover-open",id:b(A),payload:n}):Promise.reject(new T("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Br,setPopoverAnchorActive:Kr,onResolve:n=>(k=n,()=>{k===n&&(k=null)}),toast:n=>{let a=n.message.trim();return!a||a.length>rt?Promise.reject(new T("HOST_REJECTED",`Toast message must contain 1 to ${rt} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>ot)?Promise.reject(new T("HOST_REJECTED",`Toast copy text must contain 1 to ${ot} characters.`)):H({channel:I,v:1,type:"toast",id:b(A),payload:{...n,message:a}})},openUrl:n=>H({channel:I,v:1,type:"open-url",id:b(A),payload:{url:n}}),openCommit:n=>Gt(n)?H({channel:I,v:1,type:"open-commit",id:b(A),payload:{sha:n}}):Promise.reject(new T("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>H({channel:I,v:1,type:"block-answer",id:b(A),payload:{text:n.trim().slice(0,Pt)}}),openSurface:n=>H({channel:I,v:1,type:"open-surface",id:b(A),payload:{surfaceId:n}}),writeClipboard:n=>H({channel:I,v:1,type:"clipboard-write",id:b(A),payload:{text:n}}),compose:n=>H({channel:I,v:1,type:"compose",id:b(A),payload:n}),attach:n=>H({channel:I,v:1,type:"attach",id:b(A),payload:ve(n)}),startSession:async n=>{n.projectId!==void 0&&te(n.projectId);let a=n.worktree;a&&a!==!0&&(a.kind==="existing"?te(a.directory):(a.name!==void 0&&te(a.name,200),a.baseBranch!==void 0&&te(a.baseBranch,200)));let m=await j({channel:I,v:1,type:"start-session",id:b(A),payload:Xt(n)},e.requestTimeoutMs??18e4);if(!Lt(m))throw new T("HOST_REJECTED","Host did not return a session.");return m},prompt:n=>j({channel:I,v:1,type:"prompt",id:b(A),payload:Ft(n)}).then(a=>{if(!Dt(a))throw new T("HOST_REJECTED","Host did not return a prompt result.");return a}),sessionLink:n=>H({channel:I,v:1,type:"session-link",id:b(A),payload:ve(n)}),close:()=>H({channel:I,v:1,type:"close",id:b(A)}),oauthStart:()=>H({channel:I,v:1,type:"oauth-start",id:b(A)}),oauthDisconnect:()=>H({channel:I,v:1,type:"oauth-disconnect",id:b(A)}),request:n=>(ct(n.path)?j({channel:I,v:1,type:"request",id:b(A),payload:n}):Bo()).then(a=>{if(!lt(a))throw new T("HOST_REJECTED","Host request result was empty.");return a}),serviceRequest:n=>(ct(n.path)?j({channel:I,v:1,type:"service-request",id:b(A),payload:n}):Bo()).then(a=>{if(!lt(a))throw new T("HOST_REJECTED","Host service request result was empty.");return a}),serviceStatus:()=>j({channel:I,v:1,type:"service-status",id:b(A)}).then(n=>{if(!Kt(n))throw new T("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Ne(n)?j({channel:I,v:1,type:"file-read",id:b(A),payload:{path:n}}):dt()).then(a=>{if(!Wt(a))throw new T("HOST_REJECTED","Host did not return file content.");return a}),writeFile:(n,a)=>Ne(n)?a.length>st?Promise.reject(new T("FILE_TOO_LARGE",`Content is over ${st} characters.`)):j({channel:I,v:1,type:"file-write",id:b(A),payload:{path:n,content:a}}).then(m=>{if(!zt(m))throw new T("HOST_REJECTED","Host did not confirm the write.");return m}):dt(),listDir:n=>(Ne(n)?j({channel:I,v:1,type:"file-list",id:b(A),payload:{path:n}}):dt()).then(a=>{if(!Jt(a))throw new T("HOST_REJECTED","Host did not return directory entries.");return a}),stat:n=>(Ne(n)?j({channel:I,v:1,type:"file-stat",id:b(A),payload:{path:n}}):dt()).then(a=>{if(!qt(a))throw new T("HOST_REJECTED","Host did not return file status.");return a}),generate:n=>{let a=n.prompt.trim(),m=n.system?.trim();if(a.length===0||a.length>it)return Promise.reject(new T("HOST_REJECTED",`Prompt must be 1 to ${it} characters.`));if(m!==void 0&&(m.length===0||m.length>at))return Promise.reject(new T("HOST_REJECTED",`System prompt must be 1 to ${at} characters.`));let h=n.maxOutputTokens===void 0?void 0:Math.min($t,Math.max(1,Math.floor(n.maxOutputTokens)));if(h!==void 0&&!Number.isFinite(h))return Promise.reject(new T("HOST_REJECTED","maxOutputTokens must be a number."));let U={prompt:a};return m!==void 0&&(U.system=m),h!==void 0&&(U.maxOutputTokens=h),j({channel:I,v:1,type:"generate",id:b(A),payload:U},e.requestTimeoutMs??Vt).then(w=>{if(!Qt(w))throw new T("HOST_REJECTED","Host did not return generated text.");return w})},onLateGenerateResult:n=>{X.add(n);for(let a of q.splice(0))P([n],a);return Dr(),()=>{X.delete(n)}},setBadge:n=>H({channel:I,v:1,type:"badge",id:b(A),payload:{count:jt(n)}}),setHeight:n=>H({channel:I,v:1,type:"resize",id:b(A),payload:{height:Bt(n)}}),onFileOpen:n=>(We.add(n),Tt||(Tt=!0,t.addEventListener("keydown",$r,!0)),Le&&n(Le),()=>{We.delete(n)}),onFileSnapshot:n=>(Pe=n,()=>{Pe===n&&(Pe=null)}),onFileSaved:n=>(ze.add(n),()=>{ze.delete(n)}),reportFileChange:n=>ht({...$,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Hr,reportFileUnsupported:()=>ht({...$,type:"file-unsupported"}),dispose:()=>{for(let n of ke.keys())K({...$,type:"workspace-unsubscribe",id:b(A),payload:{subscriptionId:n}});ke.clear();for(let n of Ie.keys())K({...$,type:"shells-unsubscribe",id:b(A),payload:{subscriptionId:n}});Ie.clear(),ne=!0,k=null,ee=null,Pe=null,We.clear(),ze.clear(),Tt&&t.removeEventListener("keydown",$r,!0),t.removeEventListener("message",Gr),t.removeEventListener("keydown",Vr,!0),t.removeEventListener("pointerover",qe),t.removeEventListener("pointermove",qe),t.removeEventListener("pointerout",Xr),t.removeEventListener("focus",Fr),t.removeEventListener("blur",jr);for(let n of be.values())clearTimeout(n.timer),n.reject(new T("HOST_UNAVAILABLE","Host client was disposed."));be.clear(),s.clear(),l.clear(),i.clear(),c.clear(),d.clear(),u.clear(),E.clear(),_.clear(),S.clear(),y.clear(),L.clear(),X.clear(),q.length=0}}};var zo=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Vi=new Set(zo);var fs=10*6e4;var _s=10*6e4;var ms=10*6e4;var Ss=10*6e4;var Jo=["none","agent","user"];var Fi=new Set(Jo);var W=or(),qo=async e=>W.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function Q(e,t){try{await W.toast({kind:e,message:t})}catch{}}function Qo(e){return W.readFile(e)}function Yo(e){return{providerId:ao,id:uo(e).slice(0,128),title:po(e),url:It(e),kind:"issue",text:Eo(e),data:lo(e)}}async function Zo(e){await W.attach(Yo(e))}async function en(e){await W.startSession({...Yo(e),worktree:!0,navigation:"open"})}function x(e,t={},...r){let o=document.createElement(e);t.className&&(o.className=t.className),t.text!==void 0&&(o.textContent=t.text),t.title&&(o.title=t.title),t.style&&o.setAttribute("style",t.style),t.role&&o.setAttribute("role",t.role),t.ariaLabel&&o.setAttribute("aria-label",t.ariaLabel);for(let s of r)s==null||s===!1||o.append(typeof s=="string"?document.createTextNode(s):s);return o}function tn(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var Ts={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function se(e){return e instanceof Ee?e.message:e instanceof T?Ts[e.code]??e.message:e instanceof Error?e.message:String(e)}function hs(e){return e instanceof T?e.code:null}function nr(e){let t=hs(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}var gs=["all","failed","running"];function rn(e){return gs.includes(e)?e:"all"}function Rs(e){return[`#${e.number}`,he(e),ye(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function Os(e,t,r=""){if(t==="failed"&&!Te(e.outcome)||t==="running"&&!re(e.phase,e.outcome).active)return!1;let o=r.trim().toLowerCase();return o===""||Rs(e).includes(o)}function on(e,t,r=""){return e.filter(o=>Os(o,t,r))}function sr(e){return e.some(t=>re(t.phase,t.outcome).active)}var xs=`
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
`,nn="circleci-shared-style";function sn(){if(document.getElementById(nn))return;let e=document.createElement("style");e.id=nn,e.textContent=xs,document.head.append(e)}var an="prefs";function As(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)}function cn(e){return`project:${As(e)}`}function ln(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function je(e){return typeof e=="string"&&e.length>0?e:null}function bs(e){if(!ln(e))return null;let t=je(e.projectId),r=je(e.projectName),o=je(e.orgName),s=je(e.directory);if(!t||!r||!o||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:r,orgName:o,slug:je(e.slug),source:l,directory:s}}async function dn(e,t){let r=bs(await e.get(cn(t)));return!r||r.directory!==t?null:r}async function un(e,t,r){await e.set(cn(t),{projectId:r.projectId,projectName:r.projectName,orgName:r.orgName,slug:r.slug,source:r.source,directory:t})}var ks={autoRefresh:!0};function Is(e){return ln(e)?{autoRefresh:e.autoRefresh!==!1}:{...ks}}async function ir(e){return Is(await e.get(an))}async function pn(e,t){let o={...await ir(e),...t};return await e.set(an,{autoRefresh:o.autoRefresh}),o}var ys=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Cs=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],En=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of ys)t.style.setProperty(r,e.tokens[o]);for(let[r,o,s]of Cs){let l=e.tokens[s]??"";t.style.setProperty(r,l),t.style.setProperty(o,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},ar=(e,t)=>{En(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var ws={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},M=(e,t)=>`var(--${e}, var(--oc-${ws[e]}, ${t}))`,le=M("surface-background","transparent"),Et=M("surface-elevated","transparent"),Ue=M("surface-elevated-foreground","inherit"),z=M("surface-foreground","inherit"),D=M("surface-muted-foreground","gray"),vs=M("surface-muted","transparent"),ge=M("interactive-border","currentColor"),B=M("interactive-hover","transparent"),Re=M("interactive-active","transparent"),cr=M("interactive-selection","transparent"),lr=M("interactive-selection-foreground","inherit"),ce=M("primary","currentColor"),dr=M("primary-text","inherit"),ur=M("error-text","inherit"),Ns=M("font-sans","inherit"),pr=M("font-mono","monospace"),Sn=M("radius","9px"),Er=`calc(${Sn} - 2px)`,fn=`calc(${Sn} - 4px)`,G=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,_n=`background-image: linear-gradient(${B}, ${B});`,fr=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,_r="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",mn="box-shadow: var(--oc-sdk-lit);",mr=`inset 0 0.5px 0 0 ${G(z,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Us=`
:root {
  --oc-sdk-edge: ${G(z,16)};
  --oc-sdk-field-bg: ${Et};
  --oc-sdk-raised-bg: ${le};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${G(z,14)};
  --oc-sdk-field-bg: ${G(le,50,Et)};
  --oc-sdk-raised-bg: ${Et};
  --oc-sdk-field-lift: ${mr};
  --oc-sdk-raised-lift: ${mr};
  --oc-sdk-lit: ${mr};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,pt=e=>{let t=M(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${M(`${e}-text`,"inherit")}; }`},Ms=`
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
`,Tn=`${Us}
.oc-sdk { color: ${z}; font-family: ${Ns}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${_n} }
.oc-sdk-mono { font-family: ${pr}; }
.oc-sdk-muted { color: ${D}; }
${pt("success")}${pt("warning")}${pt("error")}${pt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ce}; --oc-sdk-tone-text: ${dr}; }

.oc-sdk-btn { border-radius: ${Er}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${fn}; }
.oc-sdk-btn[data-variant="default"] { color: ${dr}; background: ${G(ce,10,le)}; border-color: ${G(ce,12)}; ${mn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${G(ce,16,le)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${G(ce,22,le)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${vs}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Ue}; ${_r} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Re}, ${Re}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${B}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Re}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${M("status-error","red")}; color: ${ur}; background: ${G("var(--oc-sdk-tone)",7,le)}; border-color: ${G("var(--oc-sdk-tone)",12)}; ${mn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${G("var(--oc-sdk-tone)",9,le)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${G("var(--oc-sdk-tone)",11,le)}; box-shadow: none; }

.oc-sdk-field-note { color: ${D}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${ur}; }
.oc-sdk-input { border-radius: ${Er}; background: var(--oc-sdk-field-bg); color: ${Ue}; ${fr("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${D}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${fr(G(z,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${fr(M("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${pr}; }

.oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ce}; }
.oc-sdk-search-clear { border-radius: ${fn}; color: ${D}; }
.oc-sdk-search-clear:hover { background: ${B}; color: ${z}; }

.oc-sdk-trigger { border-radius: ${Er}; background: var(--oc-sdk-raised-bg); color: ${Ue}; ${_r} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${B}, ${B}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Re}, ${Re}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${D}; }
.oc-sdk-trigger-chevron { color: ${D}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Ue}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${Et}; background-clip: padding-box; color: ${Ue}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${B}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${cr}; color: ${lr}; }
.oc-sdk-option-check { color: ${z}; }
.oc-sdk-option[data-destructive="true"] { color: ${ur}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${G(M("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${D}; }
.oc-sdk-popup-empty { color: ${D}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${ge}; border-radius: 4px; color: ${z}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${G(z,60,ge)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${ge}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${le}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ce}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${_n} }
.oc-sdk-check-desc { color: ${D}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${G(z,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${D}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${z}; }
.oc-sdk-tab[aria-selected="true"] { color: ${lr}; background: ${cr}; border-color: ${ge}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Ue}; background: var(--oc-sdk-raised-bg); ${_r} }
.oc-sdk-tab-count { color: ${D}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${G(z,6)}; color: ${D}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${G("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${B}; }
.oc-sdk-row[aria-selected="true"] { background: ${cr}; color: ${lr}; }
.oc-sdk-row-lead { font-family: ${pr}; color: ${D}; }
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
.oc-sdk-progress-track { border-radius: 9999px; background: ${G(z,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ce}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${M("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${M("success-text","inherit")}; }

.oc-sdk-text a { color: ${dr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${G(ge,60)}; }
`,v=`
${yt}
${Ms}
${Tn}`;var hn="oc-sdk-ui-style",de=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},N=e=>{let t=document.getElementById(hn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Ct(document);let r=document.createElement("style");r.id=hn,r.textContent=e,document.head.appendChild(r)},O=(e,t)=>{let r=document.createElement(e);return t&&(r.className=t),r},Y=e=>{let t=O("button",e);return t.type="button",t},F=(e,t)=>{let r=t??"";e.textContent!==r&&(e.textContent=r)},oe=(e,t,r)=>{r==null||r===""?e.removeAttribute(t):e.getAttribute(t)!==r&&e.setAttribute(t,r)},gn=(e,t)=>{let r=o=>{o.target instanceof Node&&e.contains(o.target)||t()};return document.addEventListener("pointerdown",r,!0),()=>{document.removeEventListener("pointerdown",r,!0)}};var Ps=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},ue=(e,t)=>{N(v);let r=t,o=Y("oc-sdk oc-sdk-btn"),s=Ps(),l=document.createElement("span");o.append(l),e.append(o);let i=()=>{o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=!!r.disabled||!!r.loading,o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&s.parentNode!==o?o.prepend(s):!r.loading&&s.parentNode===o&&s.remove(),F(l,r.label)},c=()=>{r.disabled||r.loading||r.onClick()};return o.addEventListener("click",c),i(),{update:d=>{r={...r,...d},i()},dispose:()=>{o.removeEventListener("click",c),o.remove()}}};var Rn="http://www.w3.org/2000/svg",Ls={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},fe=(e,t,r)=>{let o=document.createElementNS(Rn,"svg");o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r&&o.setAttribute("class",r);let s=document.createElementNS(Rn,"path");return s.setAttribute("d",Ls[e]),o.append(s),o};var Sr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-search"),s=O("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=Y("oc-sdk-search-clear");l.append(fe("close",14)),l.tabIndex=-1,o.append(fe("search",16,"oc-sdk-search-icon"),s,l),e.append(o);let i=()=>{let E=r.placeholder??"Search";oe(s,"placeholder",E),s.setAttribute("aria-label",r.label??E),l.setAttribute("aria-label","Clear search"),s.value!==r.value&&(s.value=r.value),o.dataset.active=r.value.trim()===""?"false":"true"},c=()=>{r.value!==""&&r.onChange(""),s.focus()},d=()=>{r.onChange(s.value)},u=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),c())};return s.addEventListener("input",d),s.addEventListener("keydown",u),l.addEventListener("click",c),i(),r.autofocus&&s.focus(),{update:E=>{r={...r,...E},i()},dispose:()=>{s.removeEventListener("input",d),s.removeEventListener("keydown",u),l.removeEventListener("click",c),o.remove()}}};var _e=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},me=(e,t,r)=>{let o=e.filter(d=>!d.disabled);if(o.length===0)return null;let s=o[0],l=o[o.length-1];if(r==="first"||!s||!l)return s?.id??null;if(r==="last")return l.id;let i=o.findIndex(d=>d.id===t);return i===-1?r==="next"?s.id:l.id:o[Math.min(o.length-1,Math.max(0,i+(r==="next"?1:-1)))]?.id??null};var On=(e,t)=>`${e}-${t??""}`,Tr=(e,t,r,o)=>{let s=Y("oc-sdk-option");s.id=On(e,r.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!r.disabled,t==="option"&&s.setAttribute("aria-selected",r.selected?"true":"false"),s.dataset.destructive=r.destructive?"true":"false";let l=O("span","oc-sdk-option-label");if(l.textContent=r.label,s.append(l),r.hint){let i=O("span","oc-sdk-option-hint");i.textContent=r.hint,s.append(i)}if(t==="option"){s.dataset.mark="check";let i=O("span","oc-sdk-option-check");i.append(fe("check",14)),s.append(i)}return s.addEventListener("pointerenter",o.hover),s.addEventListener("click",o.pick),s},hr=(e,t,r,o)=>{let s=On(r,o);for(let l of Array.from(e.children))l instanceof HTMLElement&&l.classList.contains("oc-sdk-option")&&(l.dataset.active=l.id===s?"true":"false");oe(t,"aria-activedescendant",o?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Ds=(e,t)=>{let r=t.getBoundingClientRect();e.style.minWidth=`${Math.round(r.width)}px`,e.style.left=`${Math.round(r.left)}px`,e.style.top=`${Math.round(r.bottom+4)}px`;let o=e.offsetHeight,s=window.innerHeight-r.bottom-8;o>s&&r.top-8>s&&(e.style.top=`${Math.max(8,Math.round(r.top-4-o))}px`);let l=r.left+e.offsetWidth-window.innerWidth+8;l>0&&(e.style.left=`${Math.max(8,Math.round(r.left-l))}px`)},gr=(e,t,r,o)=>{e.append(r),Ds(r,t);let s=gn(e,o),l=()=>{o()},i=c=>{c.target instanceof Node&&r.contains(c.target)||o()};return window.addEventListener("resize",l),window.addEventListener("scroll",i,!0),()=>{s(),window.removeEventListener("resize",l),window.removeEventListener("scroll",i,!0),r.remove()}};var Rr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let s=()=>{de(o),o.dataset.track=r.trackBackground?"true":"false";for(let i of r.items){let c=Y("oc-sdk-tab");c.setAttribute("role","tab");let d=i.id===r.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=i.id;let u=O("span");if(u.textContent=i.label,c.append(u),i.count!==void 0){let E=O("span","oc-sdk-tab-count");E.textContent=String(i.count),c.append(E)}c.addEventListener("click",()=>{i.id!==r.activeId&&r.onChange(i.id)}),o.append(c)}},l=i=>{let c=_e(i,"horizontal");if(!c)return;let d=me(r.items,r.activeId,c);if(d&&d!==r.activeId){i.preventDefault(),r.onChange(d);let u=o.querySelector(`[data-id="${CSS.escape(d)}"]`);u instanceof HTMLElement&&u.focus()}};return o.addEventListener("keydown",l),s(),{update:i=>{r={...r,...i},s()},dispose:()=>{o.removeEventListener("keydown",l),o.remove()}}};var ft=(e,t)=>{oe(e,"data-tone",t&&t!=="neutral"?t:null)},Or=(e,t)=>{N(v);let r=t,o=O("span","oc-sdk oc-sdk-badge");e.append(o);let s=()=>{F(o,r.label),ft(o,r.tone)};return s(),{update:l=>{r={...r,...l},s()},dispose:()=>{o.remove()}}};var Gs=0,xr=(e,t)=>{N(v);let r=t,o=`oc-sdk-list-${Gs+=1}`,s=O("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,i=_=>`${o}-${_}`,c=_=>{l=_;for(let S of Array.from(s.children))S instanceof HTMLElement&&(S.dataset.active=S.id===i(_??"")?"true":"false");oe(s,"aria-activedescendant",_?i(_):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},d=(_,S)=>{let y=O("span",_);return y.textContent=S,y},u=()=>{if(de(s),oe(s,"aria-label",r.ariaLabel),r.items.length===0){s.append(d("oc-sdk-list-empty",r.emptyText??"Nothing here")),c(null);return}for(let S of r.items){let y=Y("oc-sdk-row");y.id=i(S.id),y.setAttribute("role","option"),y.setAttribute("aria-selected",S.id===r.selectedId?"true":"false"),y.disabled=!!S.disabled,y.tabIndex=-1,S.leading&&y.append(d("oc-sdk-row-lead",S.leading));let L=O("span","oc-sdk-row-main");if(L.append(d("oc-sdk-row-title",S.title)),S.subtitle&&L.append(d("oc-sdk-row-sub",S.subtitle)),y.append(L),S.badge){let X=d("oc-sdk-badge",S.badge.label);ft(X,S.badge.tone),y.append(X)}S.meta&&y.append(d("oc-sdk-row-meta",S.meta)),y.addEventListener("click",()=>r.onSelect(S.id)),s.append(y)}let _=r.items.some(S=>S.id===l&&!S.disabled);c(_?l:r.selectedId??null)},E=_=>{let S=_e(_);if(S){_.preventDefault(),c(me(r.items,l,S));return}(_.key==="Enter"||_.key===" ")&&l&&(_.preventDefault(),r.onSelect(l))};return s.addEventListener("keydown",E),u(),{update:_=>{r={...r,..._},u()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var Ar=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-empty"),s=O("h2","oc-sdk-empty-title"),l=O("p","oc-sdk-empty-body"),i=O("div","oc-sdk-empty-action");o.append(s,l,i),e.append(o);let c=null,d=()=>{if(F(s,r.title),F(l,r.body),l.hidden=!r.body,i.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let u={label:r.action.label,onClick:r.action.onClick};c?c.update(u):c=ue(i,{...u,variant:"outline",size:"sm"})};return d(),{update:u=>{r={...r,...u},d()},dispose:()=>{c?.dispose(),c=null,o.remove()}}};var br=(e,t={})=>{N(v);let r=t,o=O("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let s=O("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=O("span");o.append(s,l),e.append(o);let i=()=>{o.dataset.size=r.size??"default",F(l,r.label),l.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return i(),{update:c=>{r={...r,...c},i()},dispose:()=>{o.remove()}}};var kr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-banner"),s=O("div","oc-sdk-banner-text"),l=O("div","oc-sdk-banner-title"),i=O("div","oc-sdk-banner-body"),c=O("div","oc-sdk-banner-action");s.append(l,i),o.append(s,c),e.append(o);let d=null,u=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),F(l,r.title),F(i,r.body),i.hidden=!r.body,c.hidden=!r.action,!r.action){d?.dispose(),d=null;return}let E={label:r.action.label,onClick:r.action.onClick};d?d.update(E):d=ue(c,{...E,variant:"outline",size:"xs"})};return u(),{update:E=>{r={...r,...E},u()},dispose:()=>{d?.dispose(),d=null,o.remove()}}};var xn=e=>e.filter(t=>!("separator"in t)),Hs=0,Ir=(e,t)=>{N(v);let r=t,o=`oc-sdk-menu-${Hs+=1}`,s=O("div","oc-sdk oc-sdk-menu");e.append(s);let l=O("div","oc-sdk oc-sdk-popup");l.setAttribute("role","menu"),l.tabIndex=-1;let i=null,c=null,d=ue(s,{label:r.label,variant:r.variant,size:r.size,onClick:()=>{i?S():y()}}),u=s.querySelector("button");u?.setAttribute("aria-haspopup","menu");let E=k=>{c=k,hr(l,l,o,k)},_=()=>{de(l);for(let k of r.items){if("separator"in k){let ee=O("div","oc-sdk-separator");ee.dataset.labeled="false",l.append(ee);continue}l.append(Tr(o,"menuitem",k,{hover:()=>E(k.id),pick:()=>L(k.id)}))}E(xn(r.items).some(k=>k.id===c)?c:null)},S=()=>{let k=i;i=null,k?.(),c=null,u?.setAttribute("aria-expanded","false")},y=()=>{i||!u||(_(),i=gr(s,u,l,S),u.setAttribute("aria-expanded","true"),l.focus())},L=k=>{S(),u?.focus(),r.onSelect(k)},X=k=>{let ee=_e(k);ee?(k.preventDefault(),E(me(xn(r.items),c,ee))):k.key==="Enter"||k.key===" "?(k.preventDefault(),c&&L(c)):k.key==="Escape"&&(k.preventDefault(),S(),u?.focus())},q=k=>{i&&!(k.relatedTarget instanceof Node&&s.contains(k.relatedTarget))&&S()};return l.addEventListener("keydown",X),s.addEventListener("focusout",q),{update:k=>{r={...r,...k},d.update({label:r.label,variant:r.variant,size:r.size}),i&&_()},dispose:()=>{S(),l.removeEventListener("keydown",X),s.removeEventListener("focusout",q),d.dispose(),s.remove()}}};var $s=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,Vs=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},An=e=>{let t=[],r=0;for(let o of e.matchAll($s)){let s=o.index??0;s>r&&t.push({kind:"text",text:e.slice(r,s)});let l=o[1]??"",i=(o[2]??"").trim(),c=o[3]??"";Vs(c)?l==="!"?t.push({kind:"image",src:c,alt:i}):t.push({kind:"link",href:c,label:i||c}):t.push({kind:"text",text:o[0]}),r=s+o[0].length}return r<e.length&&t.push({kind:"text",text:e.slice(r)}),t},yr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-text");e.append(o);let s=i=>{!(i.target instanceof HTMLAnchorElement)||!r.onOpenUrl||(i.preventDefault(),r.onOpenUrl(i.target.href))},l=()=>{de(o);for(let i of An(r.text))if(i.kind==="text")o.append(document.createTextNode(i.text));else if(i.kind==="link"){let c=O("a");c.href=i.href,c.rel="noopener noreferrer",c.target="_blank",c.textContent=i.label,o.append(c)}else{let c=O("img");c.src=i.src,c.alt=i.alt,c.loading="lazy",c.referrerPolicy="no-referrer",o.append(c)}};return o.addEventListener("click",s),l(),{update:i=>{r={...r,...i},l()},dispose:()=>{o.removeEventListener("click",s),o.remove()}}};var bn=[];function ie(e){return bn.push(e),e}function kn(){for(let e of bn.splice(0))try{e.dispose()}catch{}}var J=(e,t)=>ie(ue(e,t));var In=(e,t)=>ie(Sr(e,t));var yn=(e,t)=>ie(Rr(e,t)),Ks=(e,t)=>ie(Or(e,t)),Cn=(e,t)=>ie(xr(e,t)),Be=(e,t)=>ie(Ar(e,t)),Ws=(e,t)=>ie(br(e,t)),wn=(e,t)=>ie(kr(e,t)),Cr=(e,t)=>ie(Ir(e,t)),zs=(e,t)=>ie(yr(e,t));function vn(e,t="notice"){let r=document.createElement("div");return r.className=t,zs(r,{text:e,onOpenUrl:Oe}),r}function _t(e,t){let r=document.createElement("span"),o=re(e,t);return Ks(r,{label:o.label,tone:o.tone}),r}function wr(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Ws(t,{label:e}),t}function Nn(e){ar(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Oe(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}W.openUrl(e).catch(()=>{})}}function Un(e,t,r){return{directory:e,link:t,repo:r,target:so(r,t.orgName,t.projectName)}}async function Mn(e){try{let t=await e(".git/config"),r=io(t.content);return r?oo(r):null}catch{return null}}async function Pn(e,t,r,o){let s=await dn(t,r);if(s)return Un(r,s,await Mn(o));let l=await Mn(o);if(!l)return null;for(let i of no(l))try{let c=await e.findProjectBySlug(i);if(!c||!c.id)continue;return await un(t,r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected"}),Un(r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected",directory:r},l)}catch{}return null}var Ae=document.querySelector("#root");if(!Ae)throw new Error("CircleCI page is missing its #root element.");var pe=eo(qo),vr=W.storage,Js=3e4,mt=null,p={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],runsNext:null,filter:"all",search:"",selectedRun:null,workflows:[],jobs:{},preferences:{autoRefresh:!0},loading:!0,loadingDetail:!1,error:null},xe=0,Ke=null;async function Dn(){if(Z(),p.preferences=await ir(vr),p.directory=p.ready?.directory??null,!p.connected){p.loading=!1,Z();return}if(!p.directory){p.loading=!1,Z();return}try{if(p.workspace=await Pn(pe,vr,p.directory,Qo),!p.workspace){p.loading=!1,Z();return}await Gn()}catch(e){p.loading=!1,p.error=se(e),nr(e)&&(p.connected=!1),Z()}}async function Gn(){let e=p.workspace;if(!e)return;let t=++xe;p.loading=!0,p.error=null,Z();try{let r=await pe.listRuns(e.link.projectId);if(t!==xe)return;p.runs=r.items,p.runsNext=r.next,p.loading=!1;let o=p.runs.filter(s=>Te(s.outcome)).length;if(W.setBadge(o>0?o:null).catch(()=>{}),p.selectedRun){let s=p.runs.find(l=>l.id===p.selectedRun?.id);s&&(p.selectedRun=s)}if(!p.selectedRun&&r.items[0]){await Ur(r.items[0]);return}}catch(r){if(t!==xe)return;p.loading=!1,p.error=se(r),nr(r)&&(p.connected=!1)}Z(),Mr()}async function Ur(e){let t=++xe;p.selectedRun=e,p.workflows=[],p.jobs={},p.loadingDetail=!0,Z();try{let r=await pe.listWorkflows(e.id);if(t!==xe)return;p.workflows=r.items;let o=await Promise.allSettled(r.items.map(s=>pe.listJobs(s.id)));if(t!==xe)return;for(let[s,l]of o.entries()){let i=r.items[s];i&&(p.jobs[i.id]=l.status==="fulfilled"?l.value.items:[])}p.loadingDetail=!1}catch(r){if(t!==xe)return;p.loadingDetail=!1,p.error=se(r)}Z(),Mr()}async function Me(){return p.selectedRun?Ur(p.selectedRun):Gn()}function St(e){let t=p.workspace,r=p.selectedRun;if(!t||!r)return null;let o=e.workflow??null;return{workspace:t,run:r,workflow:o,job:e.job??null,jobs:e.jobs??(o?p.jobs[o.id]??[]:[]),detail:null,output:null}}async function Nr(e){if(e)try{await Zo(e),await Q("success","Attached to the chat box.")}catch(t){await Q("error",se(t))}}async function qs(e){if(e)try{await en(e),await Q("success","Started a worktree chat for this build.")}catch(t){await Q("error",se(t))}}async function Qs(e,t){try{await pe.rerunWorkflow(e.id,t),await Q("success",`Rerun started for ${e.name}.`),await Me()}catch(r){await Q("error",se(r))}}async function Ys(e){try{await pe.cancelWorkflow(e.id),await Q("success",`Cancellation requested for ${e.name}.`),await Me()}catch(t){await Q("error",se(t))}}async function Ln(e,t){try{t?await pe.approve(e.id):await pe.reject(e.id),await Q("success",t?`Approved ${e.name}.`:`Rejected ${e.name}.`),await Me()}catch(r){await Q("error",se(r))}}function Zs(){return p.selectedRun?sr(p.workflows):sr(p.runs)}function Mr(){Ke!==null&&(window.clearTimeout(Ke),Ke=null),!(!p.preferences.autoRefresh||!Zs())&&(Ke=window.setTimeout(()=>{Ke=null,Me()},Js))}function Z(){if(kn(),mt=null,tn(Ae),!p.connected){ei();return}if(!p.directory||!p.workspace){ti();return}if(ri(),p.error){let t=x("div");Ae?.append(t),wn(t,{tone:"error",title:"CircleCI",body:p.error,action:{label:"Retry",onClick:()=>void Me()}})}let e=x("div",{className:"page-columns"});e.append(ni()),e.append(ii()),Ae?.append(e)}function ei(){let e=x("div");Ae?.append(e),Be(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. The token stays in OpenChamber.",action:{label:"Open CircleCI tokens",onClick:()=>Oe("https://app.circleci.com/settings/user/tokens")}})}function ti(){let e=x("div");Ae?.append(e),Be(e,{title:p.directory&&!p.workspace?"No CircleCI project yet":"No project open",body:p.directory&&!p.workspace?"Open the CircleCI panel once to choose which CircleCI project this repository maps to.":"Open a project in OpenChamber, then open the CircleCI panel to map it."})}function ri(){let e=p.workspace,t=x("div",{className:"toolbar"}),r=x("div",{style:"flex:1; min-width:0;"});if(Cr(r,{label:e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",size:"sm",variant:"ghost",items:[{id:"refresh",label:"Refresh"},{separator:!0},p.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"}],onSelect:o=>{o==="refresh"&&Me(),(o==="pause"||o==="resume")&&pn(vr,{autoRefresh:o==="resume"}).then(s=>{p.preferences=s,Z(),Mr()})}}),t.append(r),e){let o=x("div");J(o,{label:"Project in CircleCI",size:"sm",variant:"outline",onClick:()=>Oe(`https://app.circleci.com/pipelines/${e.target.segment}/${e.target.owner}/${e.target.repo}`)}),t.append(o)}Ae?.append(t)}function oi(){return on(p.runs,p.filter,p.search)}function ni(){let e=x("div",{className:"column"}),t=x("div"),r=yn(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:p.filter,onChange:u=>{p.filter=rn(u),r.update({activeId:p.filter}),mt?.paint()}});e.append(t);let o=x("div");e.append(o);let s=x("div",{className:"scroll"});e.append(s);let l=()=>oi().map(u=>{let E=re(u.phase,u.outcome);return{id:u.id,leading:`#${u.number}`,title:he(u),...u.commitSubject?{subtitle:u.commitSubject}:{},meta:bt(u.createdAt),badge:{label:E.label,tone:E.tone}}}),i=()=>p.runs.length===0?"No runs yet. Push a commit.":"No run matches this filter.";if(p.loading&&p.runs.length===0)return s.append(wr("Loading runs")),e;let c=Cn(s,{items:l(),emptyText:i(),selectedId:p.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:u=>{let E=p.runs.find(_=>_.id===u);E&&Ur(E)}}),d=null;if(d=In(o,{value:p.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:u=>{p.search=u,d?.update({value:u}),mt?.paint()}}),mt={tabs:r,paint:()=>c.update({items:l(),emptyText:i()})},p.runsNext){let u=x("div",{className:"load-more"});J(u,{label:"Load more",size:"sm",variant:"ghost",onClick:()=>void si()}),e.append(u)}return e}async function si(){let e=p.workspace;if(!(!e||!p.runsNext))try{let t=await pe.listRuns(e.link.projectId,p.runsNext);p.runs=[...p.runs,...t.items],p.runsNext=t.next,Z()}catch(t){await Q("error",se(t))}}function ii(){let e=x("div",{className:"column"}),t=p.selectedRun;if(!t){let d=x("div");return e.append(d),Be(d,{title:"Pick a run",body:"Choose a run on the left to see its workflows and jobs."}),e}let r=x("div",{className:"detail-head"});r.append(x("div",{className:"badge-line"},_t(t.phase,t.outcome))),r.append(x("div",{className:"detail-title"},`#${t.number} ${he(t)}`));let o=[];t.revision&&o.push(ye(t.revision)),t.commitSubject&&o.push(t.commitSubject),o.push(bt(t.createdAt)),r.append(x("div",{className:"detail-sub"},o.filter(Boolean).join(" \xB7 ")));let s=x("div",{className:"detail-actions"}),l=x("div");J(l,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>Oe(p.workspace?Ve(p.workspace.target,t.number):null)}),s.append(l);let i=x("div");J(i,{label:"Attach run",size:"sm",variant:"outline",onClick:()=>void Nr(St({workflow:null,job:null,jobs:[]}))}),s.append(i),r.append(s),t.errors.length>0&&r.append(vn(t.errors.map(d=>`${d.type}: ${d.message}`).join(" \xB7 "),"notice error-text")),e.append(r);let c=x("div",{className:"scroll"});if(e.append(c),p.loadingDetail)return c.append(wr("Loading workflows")),e;if(p.workflows.length===0){let d=x("div");return c.append(d),Be(d,{title:"No workflows",body:"This run produced no workflows."}),e}for(let d of p.workflows)c.append(ai(d,t));return e}function ai(e,t){let r=x("div",{className:"section"}),o=x("div",{className:"section-head"});o.append(x("span",{className:"section-title"},e.name)),o.append(x("span",{className:"spacer"})),o.append(x("span",{className:"muted"},At(e.createdAt,e.endedAt))),o.append(_t(e.phase,e.outcome)),r.append(o);let s=x("div",{className:"job-row-actions"}),l=x("div");if(Cr(l,{label:"Rerun",size:"xs",variant:"ghost",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:u=>void Qs(e,u==="failed")}),s.append(l),re(e.phase,e.outcome).active){let u=x("div");J(u,{label:"Cancel",size:"xs",variant:"ghost",onClick:()=>void Ys(e)}),s.append(u)}let i=x("div");J(i,{label:"Attach",size:"xs",variant:"outline",onClick:()=>void Nr(St({workflow:e}))}),s.append(i);let c=x("div");J(c,{label:"Open",size:"xs",variant:"ghost",onClick:()=>Oe(p.workspace?Xe(p.workspace.target,t.number,e.id):null)}),s.append(c),r.append(s);let d=p.jobs[e.id]??[];if(d.length===0)return r.append(x("p",{className:"notice"},"No jobs listed.")),r;for(let u of d){let E=u.type.toLowerCase()==="approval",_=re(u.phase,u.outcome),S=x("div",{className:"job-row"}),y=x("div",{className:"job-row-head"});y.append(x("span",{className:"job-row-name"},u.name)),y.append(x("span",{className:"job-row-meta"},[u.number>0?`#${u.number}`:"",At(u.startedAt,u.endedAt)].filter(Boolean).join(" \xB7 "))),y.append(_t(u.phase,u.outcome)),S.append(y);let L=x("div",{className:"job-row-actions"});if(E&&_.active){let q=x("div");J(q,{label:"Approve",size:"xs",onClick:()=>void Ln(u,!0)}),L.append(q);let k=x("div");J(k,{label:"Reject",size:"xs",variant:"ghost",onClick:()=>void Ln(u,!1)}),L.append(k)}if(Te(u.outcome)){let q=x("div");J(q,{label:"Attach failure",size:"xs",variant:"outline",onClick:()=>void Nr(St({workflow:e,job:u}))}),L.append(q);let k=x("div");J(k,{label:"Fix with agent",size:"xs",variant:"ghost",onClick:()=>void qs(St({workflow:e,job:u}))}),L.append(k)}let X=x("div");J(X,{label:"Open",size:"xs",variant:"ghost",onClick:()=>{p.workspace&&Oe(et(p.workspace.target,t.number,e.id,u.number))}}),L.append(X),L.childElementCount>0&&S.append(L),r.append(S)}return r}W.onReady(e=>{Nn(e),sn(),p.ready=e,!p.booted&&(p.booted=!0,p.connected=e.connection.connected,Dn())});W.onConnection(e=>{let t=p.connected;p.connected=e.connected,e.connected&&!t&&Dn(),!e.connected&&t&&Z()});})();
