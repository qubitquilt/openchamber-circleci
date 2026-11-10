"use strict";(()=>{var fe=class extends Error{status;code;constructor(t,r,o){super(o),this.name="CircleCIError",this.status=t,this.code=r}},Zn="/api/v3",Xe=20,bt=20,Yr=50,es=50,Ce=4,Pi=Ce*Xe,Zr=[1e3,2500],g=e=>typeof e=="object"&&e!==null?e:{},Ee=e=>Array.isArray(e)?e:[],m=e=>typeof e=="string"&&e.length>0?e:null,we=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function oo(e){return Ee(e).map(t=>{let r=g(t);return{type:m(r.type)??"unknown",message:m(r.message)??""}})}function no(e){return Ee(e).map(t=>{let r=g(t);return{type:m(r.type)??"unknown",message:m(r.message)??"",description:m(r.description),url:m(r.url)}})}function Ve(e){let t=g(e),r=g(t.attributes),o=g(t.references),s=g(o.event),l=g(s.attributes),i=g(l.vcs),c=g(i.commit),p=g(o.pipeline),d=g(o.trigger),E=g(d.attributes);return{id:m(t.id)??"",number:we(r.number)??0,phase:m(r.phase)??"unknown",outcome:m(r.current_outcome),createdAt:m(r.created_at)??"",branch:m(i.branch),tag:m(i.tag),revision:m(i.revision),commitSubject:m(c.subject),commitUrl:m(c.url),pipelineName:m(g(p.attributes).name),trigger:m(E.name)??m(g(E.event_source).type)??m(l.type),pullRequests:Ee(i.pull_requests).map(_=>{let f=g(_),k=we(f.number);return k!==null&&k>0?{number:k,url:m(f.url)}:null}).filter(_=>_!==null),errors:oo(r.errors),warnings:no(r.warnings)}}function ts(e){let t=g(e),r=g(t.attributes),o=g(r.auto_rerun);return{id:m(t.id)??"",name:m(r.name)??"Workflow",phase:m(r.phase)??"unknown",outcome:m(r.current_outcome)??m(r.outcome),createdAt:m(r.created_at),endedAt:m(r.ended_at),tag:m(r.tag),autoRerunNumber:we(o.number)}}function Ot(e){let t=g(e),r=g(t.attributes);return{id:m(t.id)??"",name:m(r.name)??"Job",number:we(r.number)??0,type:m(r.type)??"build",phase:m(r.phase)??"unknown",outcome:m(r.outcome),startedAt:m(r.started_at),endedAt:m(r.ended_at)}}function rs(e){let t=g(e);return{num:we(t.num)??0,name:m(t.name)??"Step",type:m(t.type)??"run",phase:m(t.phase)??"unknown",outcome:m(t.outcome),exitCode:we(t.exit_code),command:m(t.command),startedAt:m(t.started_at),endedAt:m(t.ended_at)}}function os(e){let t=Ot(e),r=g(g(e).attributes),o=Ee(r.parallel_executions).map(g),s=o.length>0?Ee(o[0]?.steps).map(rs):[];return{...t,errors:oo(r.errors),warnings:no(r.warnings),steps:s,parallelExecutions:o.length}}function eo(e){let t=g(e),r=g(t.attributes),o=g(g(t.references).org);return{id:m(t.id)??"",name:m(r.name)??"Project",orgId:m(o.id)??"",orgName:m(g(o.attributes).name)??""}}function ns(e){let t=g(e),r=g(t.attributes);return{id:m(t.id)??"",name:m(r.name)??"Organization",vcsProvider:m(g(r.vcs).provider)}}function to(e){let t=g(e),r=g(t.attributes),o=g(r.config);return{id:m(t.id)??"",name:m(r.name)??"Pipeline",configPath:m(o.file_path)??""}}function ss(e){let t=g(e),r=g(t.attributes);return{id:m(t.id)??"",login:m(r.login)??"CircleCI account",name:m(r.name),avatarUrl:m(r.avatar_url)}}function is(e){if(!e)return;let t={};for(let[r,o]of Object.entries(e))o==null||o===""||(t[r]=String(o));return Object.keys(t).length>0?t:void 0}function ro(e){if(e)try{return JSON.parse(e)}catch{return}}function as(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function cs(e,t,r){let o=g(g(t).error),s=m(o.detail)??m(o.title)??m(o.type)??as(e);return new fe(e,m(o.type)??`HTTP_${e}`,s)}function ls(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function us(e){return new Promise(t=>setTimeout(t,e))}function so(e){async function t(i,c){let p=is(i.query),d=0;for(;;){let E=await e({method:i.method,path:Zn+i.path,...p?{query:p}:{},...i.body===void 0?{}:{body:JSON.stringify(i.body)}});if(E.status>=400){if(ls(E.status,i.method)&&d<Zr.length){await us(Zr[d]??2500),d+=1;continue}throw cs(E.status,ro(E.body),E.body)}return c(E.body)}}let r=i=>t(i,ro),o=i=>t(i,c=>c);async function s(i,c,p,d,E){let _=E?{...c,"page[cursor]":E}:{...c,"page[limit]":p},f;try{f=await r({method:"GET",path:i,query:_})}catch(k){if(!E&&k instanceof fe&&k.status===400)f=await r({method:"GET",path:i,query:{...c}});else throw k}return{items:Ee(g(f).data).map(d),next:m(g(g(f).page).next)}}async function l(i,c,p,d,E,_){let f=[],k,H=null;for(let M=0;M<E;M+=1){let Y=await s(i,c,p,d,k);if(f.push(...Y.items),H=Y.next,_?.(f)||!H)break;k=H}return{items:f,next:H}}return{currentUser:async()=>{let i=await r({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=Ee(g(i).data)[0];if(!c)throw new fe(200,"EMPTY_USER","CircleCI returned no user.");return ss(c)},listOrgs:async()=>(await l("/orgs",{},Yr,ns,Ce)).items,findProjectBySlug:async i=>{let c=await r({method:"GET",path:"/projects",query:{"filter[slug]":i}}),p=Ee(g(c).data)[0];return p?eo(p):null},listProjectsOfOrg:i=>l("/projects",{"filter[org_id]":i},Yr,eo,Ce),listPipelines:async i=>{let c=await l("/pipelines",{"filter[project_id]":i},es,to,1),p=[];for(let d of c.items)if(d.id)try{let E=await r({method:"GET",path:`/pipelines/${encodeURIComponent(d.id)}`,query:{"filter[project_id]":i}});p.push(to(g(E).data))}catch{p.push({...d,name:"Pipeline config"})}return p},listRuns:(i,c)=>s("/runs",{"filter[project_id]":i},Xe,Ve,c),listRunsUntil:(i,c,p=Ce)=>l("/runs",{"filter[project_id]":i},Xe,Ve,p,c),listMyRuns:i=>s("/runs",{"filter[user_id]":"me"},Xe,Ve,i),getRun:async i=>{let c=await r({method:"GET",path:`/runs/${encodeURIComponent(i)}`});return Ve(g(c).data)},findRunByNumber:async(i,c)=>(await l("/runs",{"filter[project_id]":i},Xe,Ve,Ce,d=>d.some(E=>E.number===c))).items.find(d=>d.number===c)??null,fireRun:async i=>{let c=await r({method:"POST",path:"/runs",query:{"filter[project_id]":i.projectId},body:{data:{attributes:{checkout:{branch:i.branch}},references:{pipeline:{id:i.pipelineId}}}}}),p=m(g(g(c).data).id);if(!p)throw new fe(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return p},listWorkflows:(i,c)=>s("/workflows",{"filter[run_id]":i},bt,ts,c),listJobs:(i,c)=>c?s("/jobs",{"filter[workflow_id]":i},bt,Ot,c):l("/jobs",{"filter[workflow_id]":i},bt,Ot,Ce),getJob:async i=>{let c=await r({method:"GET",path:`/jobs/${encodeURIComponent(i)}`});return os(g(c).data)},condensedOutput:async(i,c,p=0)=>o({method:"GET",path:`/jobs/${encodeURIComponent(i)}/stdout/condensed`,query:{"filter[execution]":p,"filter[step_num]":c}}).then(d=>typeof d=="string"?d:""),rerunWorkflow:async(i,c)=>{let p=await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/rerun`,body:c?{is_from_failed:!0}:void 0});return m(g(g(p).data).id)??""},cancelWorkflow:async i=>{await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/cancel`})},approve:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/approve`})},reject:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/reject`})}}}var io=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),ds={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function ao(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function ps(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function re(e,t){let r=(t??"").toLowerCase(),o=(e??"").toLowerCase(),s=r||o,l=ao(r)??ao(o)??"neutral",i=r?!io.has(r):!io.has(o)&&o!=="ended";return{label:ds[s]??ps(s),tone:l,active:i}}function he(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function xt(e,t,r=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let s=t?Date.parse(t):r;if(!Number.isFinite(s)||s<o)return"";let l=Math.round((s-o)/1e3);if(l<60)return`${l}s`;let i=Math.floor(l/60),c=l%60;if(i<60)return c>0?`${i}m ${c}s`:`${i}m`;let p=Math.floor(i/60),d=i%60;return d>0?`${p}h ${d}m`:`${p}h`}function At(e,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let o=Math.round((t-r)/1e3);if(o<45)return"just now";let s=Math.round(o/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let i=Math.round(l/24);return i<7?`${i}d ago`:new Date(r).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function ve(e){return e?e.slice(0,8):""}function ge(e){return e.branch??e.tag??"detached"}function co(e){let t=e.pullRequests?.[0];return t?`PR #${t.number}`:""}var fs={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function lo(e){let t=e.trim();if(!t)return null;let r=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);r&&!t.includes("://")&&(t=`https://${r[1]}/${r[2]}/${r[3]}`);let o;try{o=new URL(t)}catch{return null}let s=o.hostname.toLowerCase();if(!s)return null;let l=o.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let i=l[l.length-2]??"",c=l[l.length-1]??"";return!i||!c?null:{host:s,owner:i,repo:c}}function uo(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function po(e,t,r){return{segment:e&&fs[e.host]||"github",owner:e?.owner??t,repo:e?.repo??r}}function Es(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function Fe(e,t){return`${Es(e)}/${t}`}function je(e,t,r){return`${Fe(e,t)}/workflows/${r}`}function Ze(e,t,r,o){return`${je(e,t,r)}/jobs/${o}`}function fo(e){let t=null,r=null,o="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let i=/^\[([^\]]+)\]$/.exec(l);if(i){o=(i[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let p=(c[1]??"").trim();p&&(r===null&&(r=p),(/remote\s+"origin"/i.test(o)||/remote\s+'origin'/i.test(o))&&(t=p))}return t??r}function kt(e){let t=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return t&&(t[1]??"").trim()||null}var Eo="circleci",_s=16e3,ms=200,yt=2e3;function _o(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function Ne(e){return re(e.phase,e.outcome).label.toLowerCase()}function Ss(e,t){return e?`${e}/${t}`:t}function mo(e){let{workspace:t,run:r,workflow:o,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:r.id,runNumber:r.number,branch:r.branch,workflowId:o?.id??null,workflowName:o?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function So(e){let t=e.workflow?.id??"run",r=e.job?.id??"";return`${e.run.id}:${t}:${r}`}function To(e){let{run:t,workflow:r,job:o}=e,s=o?.name??r?.name??`run #${t.number}`,l=Ne(o?{phase:o.phase,outcome:o.outcome}:r||{phase:t.phase,outcome:t.outcome});return _o(`${s} ${l} in CircleCI run #${t.number}`,ms)}function It(e){let{workspace:t,run:r,workflow:o,job:s}=e;return o&&s&&s.number>0?Ze(t.target,r.number,o.id,s.number).slice(0,yt):o?je(t.target,r.number,o.id).slice(0,yt):Fe(t.target,r.number).slice(0,yt)}function ho(e){let{workspace:t,run:r,workflow:o,job:s,jobs:l,jobsError:i,detail:c,output:p}=e,d=[];d.push(`CircleCI run #${r.number} on ${Ss(t.link.orgName,t.link.projectName)}`),d.push(`Status: ${Ne({phase:r.phase,outcome:r.outcome})}`),r.pipelineName&&d.push(`Pipeline: ${r.pipelineName}`),d.push(`Ref: ${ge(r)}${r.revision?` at ${ve(r.revision)}`:""}`),r.commitSubject&&d.push(`Commit: ${r.commitSubject}`),d.push(`URL: ${It(e)}`);let E=l.filter(_=>he(_.outcome));if(o){if(d.push(""),d.push(`Workflow ${o.name} (${Ne(o)})`),i&&d.push(`Job listing unavailable: ${i}`),E.length>0){d.push("Failing jobs:");for(let f of E)d.push(`- ${f.name} (#${f.number})`)}let _=l.filter(f=>!E.includes(f));if(_.length>0){d.push("Other jobs:");for(let f of _)d.push(`- ${f.name}: ${Ne({phase:f.phase,outcome:f.outcome})}`)}}if(s&&c){if(d.push(""),d.push(`Job ${c.name} (#${c.number})`),c.errors.length>0){d.push("Errors:");for(let f of c.errors)d.push(`- ${f.type}: ${f.message}`)}let _=c.steps.filter(f=>f.outcome==="failed");if(_.length>0){d.push("Failed steps:");for(let f of _)d.push(`- step ${f.num} "${f.name}"${f.exitCode!==null?` (exit ${f.exitCode})`:""}`),f.command&&d.push(`  command: ${f.command}`)}}return p&&p.trim()&&(d.push(""),d.push("Condensed output:"),d.push(p.trim())),_o(d.join(`
`),_s)}var I="openchamber.sdk";var et="data-oc-scrolling",Ct=`
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
`;function wt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",o=>{let s=o.target===e?t:o.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=r.get(s);l!==void 0&&clearTimeout(l),r.set(s,setTimeout(()=>{r.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Ts=`(${wt.toString()})(document);`;var Oo=/^[a-z][a-z0-9-]{0,39}$/;var go=e=>Object(e)===e&&!Array.isArray(e),vt=(e,t)=>Object.keys(e).every(r=>t.includes(r)),Ro=e=>String(e)===e&&e.length>=1&&e.length<=60,bo=e=>String(e)===e&&e.length>=1&&e.length<=80,xo=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let r of e){if(!go(r)||!Oo.test(r.id)||!Ro(r.label)||r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1||t.has(r.id))return!1;if(t.add(r.id),r.kind==="button"){if(!vt(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!vt(r,["kind","id","label","value","options","disabled"])||!bo(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let o=new Set;for(let s of r.options){if(!go(s)||!vt(s,["value","label"])||!bo(s.value)||!Ro(s.label)||o.has(s.value))return!1;o.add(s.value)}if(!o.has(r.value))return!1}return!0};var Ao=["{id}","{segment}","{segments+}"];var qi=new Set(Ao);var ko=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Yi=new Set(ko);var Nt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,yo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==t.bytes[r])return!1;return!0};var Io=/^[A-Za-z0-9_-]{1,80}$/;var Co=["left","right","top","bottom"];var wo=(e,t=0,r={remaining:16e3})=>{if(--r.remaining<0||t>=32)return!1;if(e===null)return!0;let o=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of o)if(!wo(s,t+1,r))return!1;return!0},Ut=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(Ut);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(Ut)}return String(e)===e||Number.isFinite(e)},Pt=e=>{try{return String(e.id)!==e.id||!Io.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Co.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!wo(e.data)||!Ut(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var Lt=2e3;var No=["file","directory","other","missing"],Dt=e=>!!(e&&"sessionId"in e),Gt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Uo=/^[0-9a-f]{7,64}$/i,Ht=e=>Uo.test(e),tt=500,rt=32e3,Po=16e3,Mo=128,Lo=200,Do=2e3,Go=16e3,Ho=80,$o=200,Vo=16e3;var Xo=2e3;var $t=2e4,ot=1024,nt=2e6;var st=64e3,it=8e3,Vt=4e3;var Xt=96e4,gs=60*6e4;var Fo=999,jo=1e4,Be=500,Bo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Wo=["stopped","starting","ready","failed"],Rs=new Set(Bo),Ko=e=>Rs.has(e),zo=e=>e&&Ko(e)?e:"HOST_REJECTED",Ue=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ue):Object(e)===e?Object.values(e).every(Ue):!1,Jo=e=>Ue(e)&&JSON.stringify(e).length<=Vo,vo=e=>e?.trim().slice(0,$o)??"",Pe=e=>{let t=e.id.trim().slice(0,Mo),r=e.title.trim().slice(0,Lo),o=e.url.trim().slice(0,Do),s=e.text?.trim().slice(0,Go),l=e.author?.trim().slice(0,Ho),i=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:i};if(s&&(c.text=s),l&&(c.author=l),i==="pull"){let p=vo(e.branches?.head),d=vo(e.branches?.base);p&&d&&(c.branches={head:p,base:d})}return Jo(e.data)&&(c.data=e.data),c},Ft=e=>{let t=Pe(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},jt=e=>{let t={text:e.text.trim().slice(0,Po)};return e.send&&(t.send=!0),t},Bt=e=>e===null||!Number.isFinite(e)?null:Math.min(Fo,Math.max(0,Math.round(e))),Wt=e=>Number.isFinite(e)?Math.min(jo,Math.max(0,Math.ceil(e))):0;var Me=e=>e.length>0&&e.length<=ot&&!e.includes("\0")&&!e.includes("\\");var at=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Xo?!1:!e.split("/").some(r=>r==="."||r===".."),bs=new Set(Wo),Kt=e=>!!(e&&"status"in e&&bs.has(String(e.status))&&!("body"in e)),ct=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),zt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Jt=e=>!!(e&&"written"in e&&e.written===!0),qt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Os=new Set(No),Qt=e=>!!(e&&"kind"in e&&"size"in e&&Os.has(String(e.kind))&&Number.isFinite(e.size)),Yt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),xs=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),As=e=>Object(e)===e?e:null,Mt=e=>String(e)===e&&e.length>0,ks=e=>{if(!Mt(e.id))return null;if(e.ok===!0){let t={channel:I,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Mt(e.error)?{channel:I,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:zo(Mt(e.code)?e.code:void 0)}:null},Zt=e=>{let t=As(e);return!t||t.channel!==I||t.v!==1?null:t.type==="result"?ks(t):!xs.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var qo=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,ys=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",T=class extends Error{code;constructor(t,r){super(r),this.name="HostRequestError",this.code=t}},Qo=()=>Promise.reject(new T("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),lt=()=>Promise.reject(new T("BAD_PATH",`File path must be 1 to ${ot} characters without NUL or backslash.`)),ut=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new T("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},A=e=>(e.value+=1,`oc-${e.value}`),nr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new T("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(n=>n===t.parent),o=e.requestTimeoutMs??$t,s=new Set,l=new Set,i=new Set,c=new Set,p=new Set,d=new Set,E=new Set,_=new Set,f=new Set,k=new Set,H=new Set,M=new Set,Y=[],y=null,F=null,ze=new Set,Je=new Set,De=null,Ge=null,Tt=!1,ke=new Map,ye=new Map,Ie=new Map,ne=!1,x={value:0},b=null,ce=null,He=!1,$e=!1,$r=null,Vr=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,J=n=>{t.parent.postMessage(n,"*")},Xr=()=>{ne||t.parent===t||M.size===0||b?.features?.lateGenerateResults!==!0||J({channel:I,v:1,type:"generate-late-listen"})},L=(n,a)=>{for(let S of n)try{S(a)}catch(h){console.error(h)}},Fr=n=>{if(!(n instanceof MessageEvent)||!r(n.source))return;let a=Zt(n.data);if(!a)return;if(a.type==="workspace"){let h=ye.get(a.payload.subscriptionId);h&&L([h],a.payload.snapshot);return}if(a.type==="shells"){let h=Ie.get(a.payload.subscriptionId);h&&L([h],a.payload.snapshot);return}if(a.type==="ready"){b=a.payload,ce=Vr(a.payload.session),L(s,a.payload),L(l,a.payload.directory),L(i,a.payload.session),ce&&L(c,ce),L(p,a.payload.connection),L(d,a.payload.settings),L(E,a.payload.item),a.payload.block&&L(_,a.payload.block),Xr();return}if(a.type==="service-event"){L(f,a.payload);return}if(a.type==="generate-late"){M.size===0?Y.push(a.payload):L(M,a.payload);return}if(a.type==="directory"){b&&(b={...b,directory:a.payload.directory}),L(l,a.payload.directory);return}if(a.type==="session"){b&&(b={...b,session:a.payload.session}),a.payload.session?ce?.sessionId!==a.payload.session.id&&(ce=Vr(a.payload.session)):ce=null,L(i,a.payload.session);return}if(a.type==="session-lifecycle"){ce=a.payload,L(c,a.payload);return}if(a.type==="connection"){b&&(b={...b,connection:a.payload.connection}),L(p,a.payload.connection);return}if(a.type==="settings"){b&&(b={...b,settings:a.payload.settings}),L(d,a.payload.settings);return}if(a.type==="item"){b&&(b={...b,item:a.payload.item}),L(E,a.payload.item);return}if(a.type==="status-control-event"){L(k,a.payload);return}if(a.type==="popover-closed"){L(H,a.payload);return}if(a.type==="action"){let h=w=>{ne||J({channel:I,v:1,type:"action-result",id:a.id,payload:w})},U=F;if(!U){h({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>U(a.payload)).then(()=>h({ok:!0}),w=>{let X=(w instanceof Error?w.message:String(w)).trim();h({ok:!1,error:(X||"Action failed.").slice(0,Be)})});return}if(a.type==="file-open"){let h=a.payload;if(Ge&&yo(Ge,h))return;Ge=h,L(ze,a.payload);return}if(a.type==="file-saved"){L(Je,a.payload.version);return}if(a.type==="file-snapshot"){let h=X=>{ne||J({channel:I,v:1,type:"file-snapshot-result",id:a.id,payload:X})},U=X=>h({error:(X.trim()||"Could not read the edited file.").slice(0,Be)}),w=De;if(!w){U("This extension does not edit files.");return}Promise.resolve().then(()=>w(a.payload.purpose)).then(X=>{if(Nt(X)>2e7){U(`The file is over ${2e7} ${"bytes"in X?"bytes":"characters"}.`);return}if(X.version.length>256){U(`The snapshot version is over ${256} characters.`);return}h({snapshot:"bytes"in X?{bytes:X.bytes,version:X.version}:{content:X.content,version:X.version}})},X=>U(X instanceof Error?X.message:String(X)));return}if(a.type==="resolve"){let h=w=>{J({channel:I,v:1,type:"resolve-result",id:a.id,payload:w})},U=y;if(!U){h({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>U(a.payload)).then(w=>h({item:w?Pe(w):null}),w=>{let X=(w instanceof Error?w.message:String(w)).trim();h({error:(X||"Command failed.").slice(0,Be)})});return}let S=ke.get(a.id);if(S){if(clearTimeout(S.timer),ke.delete(a.id),a.ok){S.resolve(a.payload);return}S.reject(new T(a.code,a.error))}};t.addEventListener("message",Fr),J({channel:I,v:1,type:"hello"});let B=(n,a=o)=>ne||t.parent===t?Promise.reject(new T("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((S,h)=>{let U=setTimeout(()=>{ke.delete(n.id),h(new T("HOST_TIMEOUT","Host did not answer in time."))},a);ke.set(n.id,{resolve:S,reject:h,timer:U}),J(n)}),$=n=>B(n).then(()=>{}),V={channel:I,v:1},ht=n=>{!ne&&t.parent!==t&&J(n)},jr=()=>ht({...V,type:"file-save"}),Br=n=>{!qo(n)||!ys(n)||(n.preventDefault(),jr())},Wr=n=>{!qo(n)||n.key!=="Escape"||b?.surface!=="popover"||!b.popover||(n.preventDefault(),qr(b.popover.id,"escape").catch(()=>{}))},qe=()=>{let n=b?.surface==="popover"?b.popover:void 0;if(!n)return;let a=He||$e;$r!==a&&($r=a,Qr(n.id,a).catch(()=>{}))},Qe=()=>{b?.surface!=="popover"||He||(He=!0,qe())},Kr=n=>{b?.surface!=="popover"||n.relatedTarget!==null||!He||(He=!1,qe())},zr=()=>{b?.surface!=="popover"||$e||($e=!0,qe())},Jr=()=>{b?.surface!=="popover"||!$e||($e=!1,qe())},te=(n,a=1024)=>{if(!n.trim()||n.length>a)throw new T("HOST_REJECTED",`Identity must contain 1 to ${a} characters.`)},gt=async n=>{n.kind!=="projects"&&te(n.projectId);let a=await B({...V,type:"workspace-read",id:A(x),payload:n});if(!a||!("kind"in a)||!("state"in a)||a.kind!==n.kind)throw new T("HOST_REJECTED","Host did not return workspace data.");return a},Rt=async(n,a)=>{n.kind!=="projects"&&te(n.projectId);let S=A(x);ye.set(S,a);try{await $({...V,type:"workspace-subscribe",id:A(x),payload:{subscriptionId:S,query:n}})}catch(h){throw ye.delete(S),ne||J({...V,type:"workspace-unsubscribe",id:A(x),payload:{subscriptionId:S}}),h}return()=>{!ye.delete(S)||ne||J({...V,type:"workspace-unsubscribe",id:A(x),payload:{subscriptionId:S}})}},Yn=async(n,a)=>{n.kind==="session"&&te(n.sessionId),n.kind==="project"&&te(n.projectId);let S=A(x);Ie.set(S,a);try{await $({...V,type:"shells-subscribe",id:A(x),payload:{subscriptionId:S,scope:n}})}catch(h){throw Ie.delete(S),ne||J({...V,type:"shells-unsubscribe",id:A(x),payload:{subscriptionId:S}}),h}return()=>{!Ie.delete(S)||ne||J({...V,type:"shells-unsubscribe",id:A(x),payload:{subscriptionId:S}})}},Ye=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new T("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!Ue(n.value))throw new T("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new T("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&b?.features?.deviceStorage!==!0)throw new T("UNSUPPORTED","This host does not support device storage.");let a=await B({...V,type:"storage",id:A(x),payload:n});if(!a||!("storage"in a)||a.op!==n.op)throw new T("HOST_REJECTED","Host did not return storage data.");return a},qr=(n,a)=>b?.features?.popovers!==!0&&!(b?.surface==="popover"&&b.popover?.id===n)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):$({...V,type:"popover-close",id:A(x),payload:a?{id:n,reason:a}:{id:n}}),Qr=(n,a)=>b?.features?.popovers!==!0&&!(b?.surface==="popover"&&b.popover?.id===n)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):$({...V,type:"popover-anchor",id:A(x),payload:{id:n,active:a}});return t.addEventListener("keydown",Wr,!0),t.addEventListener("pointerover",Qe),t.addEventListener("pointermove",Qe),t.addEventListener("pointerout",Kr),t.addEventListener("focus",zr),t.addEventListener("blur",Jr),{onAction:n=>(F=n,()=>{F===n&&(F=null)}),listProjects:async()=>{let n=await gt({kind:"projects"});if(n.kind!=="projects")throw new T("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let a=await gt({kind:"worktrees",projectId:n});if(a.kind!=="worktrees")throw new T("HOST_REJECTED","Expected worktrees.");return a},listSessions:async n=>{let a=await gt({kind:"sessions",projectId:n});if(a.kind!=="sessions")throw new T("HOST_REJECTED","Expected sessions.");return a},onProjects:n=>Rt({kind:"projects"},a=>{a.kind==="projects"&&n(a)}),onWorktrees:(n,a)=>Rt({kind:"worktrees",projectId:n},S=>{S.kind==="worktrees"&&a(S)}),onSessions:(n,a)=>Rt({kind:"sessions",projectId:n},S=>{S.kind==="sessions"&&a(S)}),onRunningShells:(n,a)=>Yn(n,a),readShellOutput:async(n,a)=>{te(n,128);let S=a?.cursor;if(S!==void 0&&(!Number.isInteger(S)||S<0))throw new T("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let h=a?.tailBytes;if(h!==void 0&&(!Number.isInteger(h)||h<1||h>65536))throw new T("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let w=await B({...V,type:"shell-output",id:A(x),payload:{shellId:n,cursor:S,tailBytes:h}});if(!w||typeof w.output!="string"||!Number.isFinite(w.cursor))throw new T("HOST_REJECTED","Host did not return shell output.");return w},stopShell:async n=>{if(te(n,128),(await B({...V,type:"shell-stop",id:A(x),payload:{shellId:n}}))?.stopped!==!0)throw new T("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{te(n),await $({...V,type:"open-session",id:A(x),payload:{sessionId:n}})},storage:{get:async(n,a)=>{let S=ut(a),h={op:"get",key:n};S&&(h.scope=S);let U=await Ye(h);return U.op==="get"&&U.found?U.value:void 0},set:async(n,a,S)=>{let h=ut(S),U={op:"set",key:n,value:a};h&&(U.scope=h),await Ye(U)},delete:async(n,a)=>{let S=ut(a),h={op:"delete",key:n};S&&(h.scope=S),await Ye(h)},keys:async n=>{let a=ut(n),S={op:"keys"};a&&(S.scope=a);let h=await Ye(S);if(h.op!=="keys")throw new T("HOST_REJECTED","Expected storage keys.");return h.keys}},onReady:n=>(s.add(n),b&&n(b),()=>{s.delete(n)}),onDirectory:n=>(l.add(n),b&&n(b.directory),()=>{l.delete(n)}),onSession:n=>(i.add(n),b&&n(b.session),()=>{i.delete(n)}),onSessionLifecycle:n=>(c.add(n),ce&&n(ce),()=>{c.delete(n)}),onConnection:n=>(p.add(n),b&&n(b.connection),()=>{p.delete(n)}),onSettings:n=>(d.add(n),b&&n(b.settings),()=>{d.delete(n)}),onItem:n=>(E.add(n),b&&n(b.item),()=>{E.delete(n)}),onBlock:n=>(_.add(n),b?.block&&n(b.block),()=>{_.delete(n)}),onServiceEvent:n=>(f.add(n),()=>{f.delete(n)}),onStatusControl:n=>(k.add(n),()=>{k.delete(n)}),onPopoverClosed:n=>(H.add(n),()=>{H.delete(n)}),setStatusControls:n=>b?.features?.statusControls!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support status controls.")):xo(n)?$({...V,type:"status-controls",id:A(x),payload:{controls:n}}):Promise.reject(new T("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>b?.features?.popovers!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):Pt(n)?$({...V,type:"popover-open",id:A(x),payload:n}):Promise.reject(new T("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:qr,setPopoverAnchorActive:Qr,onResolve:n=>(y=n,()=>{y===n&&(y=null)}),toast:n=>{let a=n.message.trim();return!a||a.length>tt?Promise.reject(new T("HOST_REJECTED",`Toast message must contain 1 to ${tt} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>rt)?Promise.reject(new T("HOST_REJECTED",`Toast copy text must contain 1 to ${rt} characters.`)):$({channel:I,v:1,type:"toast",id:A(x),payload:{...n,message:a}})},openUrl:n=>$({channel:I,v:1,type:"open-url",id:A(x),payload:{url:n}}),openCommit:n=>Ht(n)?$({channel:I,v:1,type:"open-commit",id:A(x),payload:{sha:n}}):Promise.reject(new T("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>$({channel:I,v:1,type:"block-answer",id:A(x),payload:{text:n.trim().slice(0,Lt)}}),openSurface:n=>$({channel:I,v:1,type:"open-surface",id:A(x),payload:{surfaceId:n}}),writeClipboard:n=>$({channel:I,v:1,type:"clipboard-write",id:A(x),payload:{text:n}}),compose:n=>$({channel:I,v:1,type:"compose",id:A(x),payload:n}),attach:n=>$({channel:I,v:1,type:"attach",id:A(x),payload:Pe(n)}),startSession:async n=>{n.projectId!==void 0&&te(n.projectId);let a=n.worktree;a&&a!==!0&&(a.kind==="existing"?te(a.directory):(a.name!==void 0&&te(a.name,200),a.baseBranch!==void 0&&te(a.baseBranch,200)));let S=await B({channel:I,v:1,type:"start-session",id:A(x),payload:Ft(n)},e.requestTimeoutMs??18e4);if(!Dt(S))throw new T("HOST_REJECTED","Host did not return a session.");return S},prompt:n=>B({channel:I,v:1,type:"prompt",id:A(x),payload:jt(n)}).then(a=>{if(!Gt(a))throw new T("HOST_REJECTED","Host did not return a prompt result.");return a}),sessionLink:n=>$({channel:I,v:1,type:"session-link",id:A(x),payload:Pe(n)}),close:()=>$({channel:I,v:1,type:"close",id:A(x)}),oauthStart:()=>$({channel:I,v:1,type:"oauth-start",id:A(x)}),oauthDisconnect:()=>$({channel:I,v:1,type:"oauth-disconnect",id:A(x)}),request:n=>(at(n.path)?B({channel:I,v:1,type:"request",id:A(x),payload:n}):Qo()).then(a=>{if(!ct(a))throw new T("HOST_REJECTED","Host request result was empty.");return a}),serviceRequest:n=>(at(n.path)?B({channel:I,v:1,type:"service-request",id:A(x),payload:n}):Qo()).then(a=>{if(!ct(a))throw new T("HOST_REJECTED","Host service request result was empty.");return a}),serviceStatus:()=>B({channel:I,v:1,type:"service-status",id:A(x)}).then(n=>{if(!Kt(n))throw new T("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(Me(n)?B({channel:I,v:1,type:"file-read",id:A(x),payload:{path:n}}):lt()).then(a=>{if(!zt(a))throw new T("HOST_REJECTED","Host did not return file content.");return a}),writeFile:(n,a)=>Me(n)?a.length>nt?Promise.reject(new T("FILE_TOO_LARGE",`Content is over ${nt} characters.`)):B({channel:I,v:1,type:"file-write",id:A(x),payload:{path:n,content:a}}).then(S=>{if(!Jt(S))throw new T("HOST_REJECTED","Host did not confirm the write.");return S}):lt(),listDir:n=>(Me(n)?B({channel:I,v:1,type:"file-list",id:A(x),payload:{path:n}}):lt()).then(a=>{if(!qt(a))throw new T("HOST_REJECTED","Host did not return directory entries.");return a}),stat:n=>(Me(n)?B({channel:I,v:1,type:"file-stat",id:A(x),payload:{path:n}}):lt()).then(a=>{if(!Qt(a))throw new T("HOST_REJECTED","Host did not return file status.");return a}),generate:n=>{let a=n.prompt.trim(),S=n.system?.trim();if(a.length===0||a.length>st)return Promise.reject(new T("HOST_REJECTED",`Prompt must be 1 to ${st} characters.`));if(S!==void 0&&(S.length===0||S.length>it))return Promise.reject(new T("HOST_REJECTED",`System prompt must be 1 to ${it} characters.`));let h=n.maxOutputTokens===void 0?void 0:Math.min(Vt,Math.max(1,Math.floor(n.maxOutputTokens)));if(h!==void 0&&!Number.isFinite(h))return Promise.reject(new T("HOST_REJECTED","maxOutputTokens must be a number."));let U={prompt:a};return S!==void 0&&(U.system=S),h!==void 0&&(U.maxOutputTokens=h),B({channel:I,v:1,type:"generate",id:A(x),payload:U},e.requestTimeoutMs??Xt).then(w=>{if(!Yt(w))throw new T("HOST_REJECTED","Host did not return generated text.");return w})},onLateGenerateResult:n=>{M.add(n);for(let a of Y.splice(0))L([n],a);return Xr(),()=>{M.delete(n)}},setBadge:n=>$({channel:I,v:1,type:"badge",id:A(x),payload:{count:Bt(n)}}),setHeight:n=>$({channel:I,v:1,type:"resize",id:A(x),payload:{height:Wt(n)}}),onFileOpen:n=>(ze.add(n),Tt||(Tt=!0,t.addEventListener("keydown",Br,!0)),Ge&&n(Ge),()=>{ze.delete(n)}),onFileSnapshot:n=>(De=n,()=>{De===n&&(De=null)}),onFileSaved:n=>(Je.add(n),()=>{Je.delete(n)}),reportFileChange:n=>ht({...V,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:jr,reportFileUnsupported:()=>ht({...V,type:"file-unsupported"}),dispose:()=>{for(let n of ye.keys())J({...V,type:"workspace-unsubscribe",id:A(x),payload:{subscriptionId:n}});ye.clear();for(let n of Ie.keys())J({...V,type:"shells-unsubscribe",id:A(x),payload:{subscriptionId:n}});Ie.clear(),ne=!0,y=null,F=null,De=null,ze.clear(),Je.clear(),Tt&&t.removeEventListener("keydown",Br,!0),t.removeEventListener("message",Fr),t.removeEventListener("keydown",Wr,!0),t.removeEventListener("pointerover",Qe),t.removeEventListener("pointermove",Qe),t.removeEventListener("pointerout",Kr),t.removeEventListener("focus",zr),t.removeEventListener("blur",Jr);for(let n of ke.values())clearTimeout(n.timer),n.reject(new T("HOST_UNAVAILABLE","Host client was disposed."));ke.clear(),s.clear(),l.clear(),i.clear(),c.clear(),p.clear(),d.clear(),E.clear(),_.clear(),f.clear(),k.clear(),H.clear(),M.clear(),Y.length=0}}};var en=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var fa=new Set(en);var Is=10*6e4;var Cs=10*6e4;var ws=10*6e4;var vs=10*6e4;var tn=["none","agent","user"];var _a=new Set(tn);var K=nr(),rn=async e=>K.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function se(e,t){try{await K.toast({kind:e,message:t})}catch{}}function sr(e){return K.readFile(e)}function on(e){return{providerId:Eo,id:So(e).slice(0,128),title:To(e),url:It(e),kind:"issue",text:ho(e),data:mo(e)}}async function nn(e){await K.attach(on(e))}async function sn(e,t={}){await K.startSession({...on(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}var Ns=["all","failed","running"];function an(e){return Ns.includes(e)?e:"all"}function Us(e){return[`#${e.number}`,ge(e),ve(e.revision),e.commitSubject??"",e.pipelineName??"",...(e.pullRequests??[]).map(t=>`#${t.number}`)].filter(Boolean).join(" ").toLowerCase()}var cn={branch:null,prNumbers:[]};function Ps(e){return!e.branch&&e.prNumbers.length===0}function ln(e,t){if(Ps(t)||t.branch&&e.branch===t.branch)return!0;let r=e.pullRequests??[];return t.prNumbers.some(o=>r.some(s=>s.number===o))}function ir(e,t){return e.filter(r=>ln(r,t))}function un(e){return t=>ir(t,e).length>0}function Ms(e,t,r="",o){if(t==="failed"&&!he(e.outcome)||t==="running"&&!re(e.phase,e.outcome).active||o&&!ln(e,o))return!1;let s=r.trim().toLowerCase();return s===""||Us(e).includes(s)}function dn(e,t,r="",o){return e.filter(s=>Ms(s,t,r,o))}function ar(e){return e.some(t=>re(t.phase,t.outcome).active)}function Ls(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return null;let r=/\/(pull|pull-requests|merge_requests)\/(\d+)/.exec(t.pathname),o=r?Number.parseInt(r[2]??"",10):Number.NaN;return Number.isInteger(o)&&o>0?o:null}catch{return null}}function Ds(e,t){return e?t===e||t.startsWith(e.endsWith("/")?e:`${e}/`):!1}function Gs(e,t){return e.find(r=>Ds(r.directory,t))?.id??null}function Hs(e,t){return e.find(o=>o.directory===t&&o.branch.length>0)?.branch??null}async function $s(e,t,r){try{return Hs((await e.host.listWorktrees(t)).worktrees,r)}catch{return null}}async function Vs(e){let t=e.directory;if(!t)return null;let r=null,o=null;try{let c=await e.readFile(".git/HEAD");r=kt(c.content),r&&(o="head")}catch{}let s=null;if(e.session||!r)try{s=(await e.host.listProjects()).projects}catch{}let l=s?Gs(s,t):null;if(!r&&s){let c=l?[l,...s.filter(p=>p.id!==l).map(p=>p.id)]:s.map(p=>p.id);for(let p of c){let d=await $s(e,p,t);if(d){l=p,r=d,o="worktree";break}}}let i=[];if(l&&e.session)try{i=((await e.host.listSessions(l)).sessions.find(d=>d.id===e.session?.id)?.links??[]).filter(d=>d.kind==="change").map(d=>Ls(d.url)).filter(d=>d!==null)}catch{}return!r&&i.length===0?null:{branch:r,via:o,prNumbers:i}}async function pn(e){try{return await Vs(e)}catch{return null}}function dt(e){return e?{branch:e.branch,prNumbers:e.prNumbers}:cn}function fn(e){return e?.branch?"This branch":"My pull requests"}function En(e){if(!e)return null;let{branch:t,prNumbers:r}=e,o=r.map(s=>`#${s}`).join(", ");return t&&r.length>0?`Runs on ${t} and PR ${o}`:t?`Runs on ${t}`:r.length>0?`Runs for PR ${o}`:null}function R(e,t={},...r){let o=document.createElement(e);t.className&&(o.className=t.className),t.text!==void 0&&(o.textContent=t.text),t.title&&(o.title=t.title),t.style&&o.setAttribute("style",t.style),t.role&&o.setAttribute("role",t.role),t.ariaLabel&&o.setAttribute("aria-label",t.ariaLabel);for(let s of r)s==null||s===!1||o.append(typeof s=="string"?document.createTextNode(s):s);return o}function _n(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var Xs={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function q(e){return e instanceof fe?e.message:e instanceof T?Xs[e.code]??e.message:e instanceof Error?e.message:String(e)}function Fs(e){return e instanceof T?e.code:null}function cr(e){let t=Fs(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}function mn(e){let t=null,r=()=>{t!==null&&(window.clearTimeout(t),t=null)};return{arm:()=>{r(),!(!e.enabled()||!e.active())&&(t=window.setTimeout(()=>{t=null,e.onTick()},e.delayMs))},stop:r}}var js=`
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
`,Sn="circleci-shared-style";function Tn(){if(document.getElementById(Sn))return;let e=document.createElement("style");e.id=Sn,e.textContent=js,document.head.append(e)}async function hn(e,t,r,o){try{return await e.rerunWorkflow(t.id,r.fromFailed),await o("success",`Rerun started for ${t.name}.`),!0}catch(s){return await o("error",q(s)),!1}}async function gn(e,t,r){try{return await e.cancelWorkflow(t.id),await r("success",`Cancellation requested for ${t.name}.`),!0}catch(o){return await r("error",q(o)),!1}}async function Rn(e,t,r){try{return await e.approve(t.id),await r("success",`Approved ${t.name}.`),!0}catch(o){return await r("error",q(o)),!1}}async function bn(e,t,r){try{return await e.reject(t.id),await r("success",`Rejected ${t.name}.`),!0}catch(o){return await r("error",q(o)),!1}}var On="prefs";function Bs(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)}function xn(e){return`project:${Bs(e)}`}function An(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function We(e){return typeof e=="string"&&e.length>0?e:null}function Ws(e){if(!An(e))return null;let t=We(e.projectId),r=We(e.projectName),o=We(e.orgName),s=We(e.directory);if(!t||!r||!o||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:r,orgName:o,slug:We(e.slug),source:l,directory:s}}async function kn(e,t){let r=Ws(await e.get(xn(t)));return!r||r.directory!==t?null:r}async function yn(e,t,r){await e.set(xn(t),{projectId:r.projectId,projectName:r.projectName,orgName:r.orgName,slug:r.slug,source:r.source,directory:t})}var Ks={autoRefresh:!0};function zs(e){return An(e)?{autoRefresh:e.autoRefresh!==!1}:{...Ks}}async function lr(e){return zs(await e.get(On))}async function In(e,t){let o={...await lr(e),...t};return await e.set(On,{autoRefresh:o.autoRefresh}),o}var Js=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],qs=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Cn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of Js)t.style.setProperty(r,e.tokens[o]);for(let[r,o,s]of qs){let l=e.tokens[s]??"";t.style.setProperty(r,l),t.style.setProperty(o,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},ur=(e,t)=>{Cn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Qs={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},P=(e,t)=>`var(--${e}, var(--oc-${Qs[e]}, ${t}))`,ue=P("surface-background","transparent"),ft=P("surface-elevated","transparent"),Le=P("surface-elevated-foreground","inherit"),Q=P("surface-foreground","inherit"),D=P("surface-muted-foreground","gray"),Ys=P("surface-muted","transparent"),Re=P("interactive-border","currentColor"),z=P("interactive-hover","transparent"),be=P("interactive-active","transparent"),dr=P("interactive-selection","transparent"),pr=P("interactive-selection-foreground","inherit"),le=P("primary","currentColor"),fr=P("primary-text","inherit"),Er=P("error-text","inherit"),Zs=P("font-sans","inherit"),_r=P("font-mono","monospace"),Un=P("radius","9px"),mr=`calc(${Un} - 2px)`,wn=`calc(${Un} - 4px)`,G=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,vn=`background-image: linear-gradient(${z}, ${z});`,Sr=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Tr="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Nn="box-shadow: var(--oc-sdk-lit);",hr=`inset 0 0.5px 0 0 ${G(Q,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,ei=`
:root {
  --oc-sdk-edge: ${G(Q,16)};
  --oc-sdk-field-bg: ${ft};
  --oc-sdk-raised-bg: ${ue};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${G(Q,14)};
  --oc-sdk-field-bg: ${G(ue,50,ft)};
  --oc-sdk-raised-bg: ${ft};
  --oc-sdk-field-lift: ${hr};
  --oc-sdk-raised-lift: ${hr};
  --oc-sdk-lit: ${hr};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,pt=e=>{let t=P(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${P(`${e}-text`,"inherit")}; }`},ti=`
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
`,Pn=`${ei}
.oc-sdk { color: ${Q}; font-family: ${Zs}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${vn} }
.oc-sdk-mono { font-family: ${_r}; }
.oc-sdk-muted { color: ${D}; }
${pt("success")}${pt("warning")}${pt("error")}${pt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${le}; --oc-sdk-tone-text: ${fr}; }

.oc-sdk-btn { border-radius: ${mr}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${wn}; }
.oc-sdk-btn[data-variant="default"] { color: ${fr}; background: ${G(le,10,ue)}; border-color: ${G(le,12)}; ${Nn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${G(le,16,ue)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${G(le,22,ue)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${Ys}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${z}, ${z}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${be}, ${be}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Le}; ${Tr} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${z}, ${z}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${be}, ${be}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${z}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${be}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${P("status-error","red")}; color: ${Er}; background: ${G("var(--oc-sdk-tone)",7,ue)}; border-color: ${G("var(--oc-sdk-tone)",12)}; ${Nn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${G("var(--oc-sdk-tone)",9,ue)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${G("var(--oc-sdk-tone)",11,ue)}; box-shadow: none; }

.oc-sdk-field-note { color: ${D}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Er}; }
.oc-sdk-input { border-radius: ${mr}; background: var(--oc-sdk-field-bg); color: ${Le}; ${Sr("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${D}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${z}, ${z}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Sr(G(Q,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Sr(P("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${_r}; }

.oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${le}; }
.oc-sdk-search-clear { border-radius: ${wn}; color: ${D}; }
.oc-sdk-search-clear:hover { background: ${z}; color: ${Q}; }

.oc-sdk-trigger { border-radius: ${mr}; background: var(--oc-sdk-raised-bg); color: ${Le}; ${Tr} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${z}, ${z}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${be}, ${be}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${D}; }
.oc-sdk-trigger-chevron { color: ${D}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Le}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${ft}; background-clip: padding-box; color: ${Le}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${z}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${dr}; color: ${pr}; }
.oc-sdk-option-check { color: ${Q}; }
.oc-sdk-option[data-destructive="true"] { color: ${Er}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${G(P("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${D}; }
.oc-sdk-popup-empty { color: ${D}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Re}; border-radius: 4px; color: ${Q}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${G(Q,60,Re)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Re}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${ue}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${le}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${vn} }
.oc-sdk-check-desc { color: ${D}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${G(Q,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${D}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${Q}; }
.oc-sdk-tab[aria-selected="true"] { color: ${pr}; background: ${dr}; border-color: ${Re}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Le}; background: var(--oc-sdk-raised-bg); ${Tr} }
.oc-sdk-tab-count { color: ${D}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${G(Q,6)}; color: ${D}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${G("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${z}; }
.oc-sdk-row[aria-selected="true"] { background: ${dr}; color: ${pr}; }
.oc-sdk-row-lead { font-family: ${_r}; color: ${D}; }
.oc-sdk-row-sub { color: ${D}; }
.oc-sdk-row-meta { color: ${D}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${D}; }

.oc-sdk-empty-body { color: ${D}; }

.oc-sdk-spinner { color: ${D}; }
.oc-sdk-spinner-ring { border-color: ${Re}; border-top-color: ${le}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${G("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${D}; }

.oc-sdk-separator { color: ${D}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${G(Re,40)}; }

.oc-sdk-progress-label { color: ${D}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${G(Q,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${le}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${P("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${P("success-text","inherit")}; }

.oc-sdk-text a { color: ${fr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${G(Re,60)}; }
`,v=`
${Ct}
${ti}
${Pn}`;var Mn="oc-sdk-ui-style",de=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},N=e=>{let t=document.getElementById(Mn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}wt(document);let r=document.createElement("style");r.id=Mn,r.textContent=e,document.head.appendChild(r)},O=(e,t)=>{let r=document.createElement(e);return t&&(r.className=t),r},Z=e=>{let t=O("button",e);return t.type="button",t},j=(e,t)=>{let r=t??"";e.textContent!==r&&(e.textContent=r)},oe=(e,t,r)=>{r==null||r===""?e.removeAttribute(t):e.getAttribute(t)!==r&&e.setAttribute(t,r)},Ln=(e,t)=>{let r=o=>{o.target instanceof Node&&e.contains(o.target)||t()};return document.addEventListener("pointerdown",r,!0),()=>{document.removeEventListener("pointerdown",r,!0)}};var ri=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},pe=(e,t)=>{N(v);let r=t,o=Z("oc-sdk oc-sdk-btn"),s=ri(),l=document.createElement("span");o.append(l),e.append(o);let i=()=>{o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=!!r.disabled||!!r.loading,o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&s.parentNode!==o?o.prepend(s):!r.loading&&s.parentNode===o&&s.remove(),j(l,r.label)},c=()=>{r.disabled||r.loading||r.onClick()};return o.addEventListener("click",c),i(),{update:p=>{r={...r,...p},i()},dispose:()=>{o.removeEventListener("click",c),o.remove()}}};var Dn="http://www.w3.org/2000/svg",oi={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},_e=(e,t,r)=>{let o=document.createElementNS(Dn,"svg");o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r&&o.setAttribute("class",r);let s=document.createElementNS(Dn,"path");return s.setAttribute("d",oi[e]),o.append(s),o};var gr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-search"),s=O("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=Z("oc-sdk-search-clear");l.append(_e("close",14)),l.tabIndex=-1,o.append(_e("search",16,"oc-sdk-search-icon"),s,l),e.append(o);let i=()=>{let E=r.placeholder??"Search";oe(s,"placeholder",E),s.setAttribute("aria-label",r.label??E),l.setAttribute("aria-label","Clear search"),s.value!==r.value&&(s.value=r.value),o.dataset.active=r.value.trim()===""?"false":"true"},c=()=>{r.value!==""&&r.onChange(""),s.focus()},p=()=>{r.onChange(s.value)},d=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),c())};return s.addEventListener("input",p),s.addEventListener("keydown",d),l.addEventListener("click",c),i(),r.autofocus&&s.focus(),{update:E=>{r={...r,...E},i()},dispose:()=>{s.removeEventListener("input",p),s.removeEventListener("keydown",d),l.removeEventListener("click",c),o.remove()}}};var me=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Se=(e,t,r)=>{let o=e.filter(p=>!p.disabled);if(o.length===0)return null;let s=o[0],l=o[o.length-1];if(r==="first"||!s||!l)return s?.id??null;if(r==="last")return l.id;let i=o.findIndex(p=>p.id===t);return i===-1?r==="next"?s.id:l.id:o[Math.min(o.length-1,Math.max(0,i+(r==="next"?1:-1)))]?.id??null};var Gn=(e,t)=>`${e}-${t??""}`,Rr=(e,t,r,o)=>{let s=Z("oc-sdk-option");s.id=Gn(e,r.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!r.disabled,t==="option"&&s.setAttribute("aria-selected",r.selected?"true":"false"),s.dataset.destructive=r.destructive?"true":"false";let l=O("span","oc-sdk-option-label");if(l.textContent=r.label,s.append(l),r.hint){let i=O("span","oc-sdk-option-hint");i.textContent=r.hint,s.append(i)}if(t==="option"){s.dataset.mark="check";let i=O("span","oc-sdk-option-check");i.append(_e("check",14)),s.append(i)}return s.addEventListener("pointerenter",o.hover),s.addEventListener("click",o.pick),s},br=(e,t,r,o)=>{let s=Gn(r,o);for(let l of Array.from(e.children))l instanceof HTMLElement&&l.classList.contains("oc-sdk-option")&&(l.dataset.active=l.id===s?"true":"false");oe(t,"aria-activedescendant",o?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var ni=(e,t)=>{let r=t.getBoundingClientRect();e.style.minWidth=`${Math.round(r.width)}px`,e.style.left=`${Math.round(r.left)}px`,e.style.top=`${Math.round(r.bottom+4)}px`;let o=e.offsetHeight,s=window.innerHeight-r.bottom-8;o>s&&r.top-8>s&&(e.style.top=`${Math.max(8,Math.round(r.top-4-o))}px`);let l=r.left+e.offsetWidth-window.innerWidth+8;l>0&&(e.style.left=`${Math.max(8,Math.round(r.left-l))}px`)},Or=(e,t,r,o)=>{e.append(r),ni(r,t);let s=Ln(e,o),l=()=>{o()},i=c=>{c.target instanceof Node&&r.contains(c.target)||o()};return window.addEventListener("resize",l),window.addEventListener("scroll",i,!0),()=>{s(),window.removeEventListener("resize",l),window.removeEventListener("scroll",i,!0),r.remove()}};var xr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let s=()=>{de(o),o.dataset.track=r.trackBackground?"true":"false";for(let i of r.items){let c=Z("oc-sdk-tab");c.setAttribute("role","tab");let p=i.id===r.activeId;c.setAttribute("aria-selected",p?"true":"false"),c.tabIndex=p?0:-1,c.dataset.id=i.id;let d=O("span");if(d.textContent=i.label,c.append(d),i.count!==void 0){let E=O("span","oc-sdk-tab-count");E.textContent=String(i.count),c.append(E)}c.addEventListener("click",()=>{i.id!==r.activeId&&r.onChange(i.id)}),o.append(c)}},l=i=>{let c=me(i,"horizontal");if(!c)return;let p=Se(r.items,r.activeId,c);if(p&&p!==r.activeId){i.preventDefault(),r.onChange(p);let d=o.querySelector(`[data-id="${CSS.escape(p)}"]`);d instanceof HTMLElement&&d.focus()}};return o.addEventListener("keydown",l),s(),{update:i=>{r={...r,...i},s()},dispose:()=>{o.removeEventListener("keydown",l),o.remove()}}};var Et=(e,t)=>{oe(e,"data-tone",t&&t!=="neutral"?t:null)},Ar=(e,t)=>{N(v);let r=t,o=O("span","oc-sdk oc-sdk-badge");e.append(o);let s=()=>{j(o,r.label),Et(o,r.tone)};return s(),{update:l=>{r={...r,...l},s()},dispose:()=>{o.remove()}}};var si=0,kr=(e,t)=>{N(v);let r=t,o=`oc-sdk-list-${si+=1}`,s=O("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,i=_=>`${o}-${_}`,c=_=>{l=_;for(let f of Array.from(s.children))f instanceof HTMLElement&&(f.dataset.active=f.id===i(_??"")?"true":"false");oe(s,"aria-activedescendant",_?i(_):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},p=(_,f)=>{let k=O("span",_);return k.textContent=f,k},d=()=>{if(de(s),oe(s,"aria-label",r.ariaLabel),r.items.length===0){s.append(p("oc-sdk-list-empty",r.emptyText??"Nothing here")),c(null);return}for(let f of r.items){let k=Z("oc-sdk-row");k.id=i(f.id),k.setAttribute("role","option"),k.setAttribute("aria-selected",f.id===r.selectedId?"true":"false"),k.disabled=!!f.disabled,k.tabIndex=-1,f.leading&&k.append(p("oc-sdk-row-lead",f.leading));let H=O("span","oc-sdk-row-main");if(H.append(p("oc-sdk-row-title",f.title)),f.subtitle&&H.append(p("oc-sdk-row-sub",f.subtitle)),k.append(H),f.badge){let M=p("oc-sdk-badge",f.badge.label);Et(M,f.badge.tone),k.append(M)}f.meta&&k.append(p("oc-sdk-row-meta",f.meta)),k.addEventListener("click",()=>r.onSelect(f.id)),s.append(k)}let _=r.items.some(f=>f.id===l&&!f.disabled);c(_?l:r.selectedId??null)},E=_=>{let f=me(_);if(f){_.preventDefault(),c(Se(r.items,l,f));return}(_.key==="Enter"||_.key===" ")&&l&&(_.preventDefault(),r.onSelect(l))};return s.addEventListener("keydown",E),d(),{update:_=>{r={...r,..._},d()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var yr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-empty"),s=O("h2","oc-sdk-empty-title"),l=O("p","oc-sdk-empty-body"),i=O("div","oc-sdk-empty-action");o.append(s,l,i),e.append(o);let c=null,p=()=>{if(j(s,r.title),j(l,r.body),l.hidden=!r.body,i.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let d={label:r.action.label,onClick:r.action.onClick};c?c.update(d):c=pe(i,{...d,variant:"outline",size:"sm"})};return p(),{update:d=>{r={...r,...d},p()},dispose:()=>{c?.dispose(),c=null,o.remove()}}};var Ir=(e,t={})=>{N(v);let r=t,o=O("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let s=O("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=O("span");o.append(s,l),e.append(o);let i=()=>{o.dataset.size=r.size??"default",j(l,r.label),l.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return i(),{update:c=>{r={...r,...c},i()},dispose:()=>{o.remove()}}};var Cr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-banner"),s=O("div","oc-sdk-banner-text"),l=O("div","oc-sdk-banner-title"),i=O("div","oc-sdk-banner-body"),c=O("div","oc-sdk-banner-action");s.append(l,i),o.append(s,c),e.append(o);let p=null,d=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),j(l,r.title),j(i,r.body),i.hidden=!r.body,c.hidden=!r.action,!r.action){p?.dispose(),p=null;return}let E={label:r.action.label,onClick:r.action.onClick};p?p.update(E):p=pe(c,{...E,variant:"outline",size:"xs"})};return d(),{update:E=>{r={...r,...E},d()},dispose:()=>{p?.dispose(),p=null,o.remove()}}};var Hn=e=>e.filter(t=>!("separator"in t)),ii=0,wr=(e,t)=>{N(v);let r=t,o=`oc-sdk-menu-${ii+=1}`,s=O("div","oc-sdk oc-sdk-menu");e.append(s);let l=O("div","oc-sdk oc-sdk-popup");l.setAttribute("role","menu"),l.tabIndex=-1;let i=null,c=null,p=pe(s,{label:r.label,variant:r.variant,size:r.size,onClick:()=>{i?f():k()}}),d=s.querySelector("button");d?.setAttribute("aria-haspopup","menu");let E=y=>{c=y,br(l,l,o,y)},_=()=>{de(l);for(let y of r.items){if("separator"in y){let F=O("div","oc-sdk-separator");F.dataset.labeled="false",l.append(F);continue}l.append(Rr(o,"menuitem",y,{hover:()=>E(y.id),pick:()=>H(y.id)}))}E(Hn(r.items).some(y=>y.id===c)?c:null)},f=()=>{let y=i;i=null,y?.(),c=null,d?.setAttribute("aria-expanded","false")},k=()=>{i||!d||(_(),i=Or(s,d,l,f),d.setAttribute("aria-expanded","true"),l.focus())},H=y=>{f(),d?.focus(),r.onSelect(y)},M=y=>{let F=me(y);F?(y.preventDefault(),E(Se(Hn(r.items),c,F))):y.key==="Enter"||y.key===" "?(y.preventDefault(),c&&H(c)):y.key==="Escape"&&(y.preventDefault(),f(),d?.focus())},Y=y=>{i&&!(y.relatedTarget instanceof Node&&s.contains(y.relatedTarget))&&f()};return l.addEventListener("keydown",M),s.addEventListener("focusout",Y),{update:y=>{r={...r,...y},p.update({label:r.label,variant:r.variant,size:r.size}),i&&_()},dispose:()=>{f(),l.removeEventListener("keydown",M),s.removeEventListener("focusout",Y),p.dispose(),s.remove()}}};var ai=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,ci=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},$n=e=>{let t=[],r=0;for(let o of e.matchAll(ai)){let s=o.index??0;s>r&&t.push({kind:"text",text:e.slice(r,s)});let l=o[1]??"",i=(o[2]??"").trim(),c=o[3]??"";ci(c)?l==="!"?t.push({kind:"image",src:c,alt:i}):t.push({kind:"link",href:c,label:i||c}):t.push({kind:"text",text:o[0]}),r=s+o[0].length}return r<e.length&&t.push({kind:"text",text:e.slice(r)}),t},vr=(e,t)=>{N(v);let r=t,o=O("div","oc-sdk oc-sdk-text");e.append(o);let s=i=>{!(i.target instanceof HTMLAnchorElement)||!r.onOpenUrl||(i.preventDefault(),r.onOpenUrl(i.target.href))},l=()=>{de(o);for(let i of $n(r.text))if(i.kind==="text")o.append(document.createTextNode(i.text));else if(i.kind==="link"){let c=O("a");c.href=i.href,c.rel="noopener noreferrer",c.target="_blank",c.textContent=i.label,o.append(c)}else{let c=O("img");c.src=i.src,c.alt=i.alt,c.loading="lazy",c.referrerPolicy="no-referrer",o.append(c)}};return o.addEventListener("click",s),l(),{update:i=>{r={...r,...i},l()},dispose:()=>{o.removeEventListener("click",s),o.remove()}}};var Vn=[];function ie(e){return Vn.push(e),e}function Xn(){for(let e of Vn.splice(0))try{e.dispose()}catch{}}var W=(e,t)=>ie(pe(e,t));var Fn=(e,t)=>ie(gr(e,t));var jn=(e,t)=>ie(xr(e,t)),fi=(e,t)=>ie(Ar(e,t)),Bn=(e,t)=>ie(kr(e,t)),Ke=(e,t)=>ie(yr(e,t)),Ei=(e,t)=>ie(Ir(e,t)),Wn=(e,t)=>ie(Cr(e,t)),Nr=(e,t)=>ie(wr(e,t)),_i=(e,t)=>ie(vr(e,t));function Ur(e,t="notice"){let r=document.createElement("div");return r.className=t,_i(r,{text:e,onOpenUrl:Te}),r}function _t(e,t){let r=document.createElement("span"),o=re(e,t);return fi(r,{label:o.label,tone:o.tone}),r}function Pr(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Ei(t,{label:e}),t}function Kn(e){ur(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Te(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}K.openUrl(e).catch(()=>{})}}function zn(e,t,r){return{directory:e,link:t,repo:r,target:po(r,t.orgName,t.projectName)}}async function Jn(e){try{let t=await e(".git/config"),r=fo(t.content);return r?lo(r):null}catch{return null}}async function qn(e,t,r,o){let s=await kn(t,r);if(s)return zn(r,s,await Jn(o));let l=await Jn(o);if(!l)return null;for(let i of uo(l))try{let c=await e.findProjectBySlug(i);if(!c||!c.id)continue;return await yn(t,r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected"}),zn(r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected",directory:r},l)}catch{}return null}var xe=document.querySelector("#root");if(!xe)throw new Error("CircleCI page is missing its #root element.");var ae=so(rn),Mr=K.storage,mi=3e4,mt=null,u={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],runsNext:null,filter:"all",search:"",currentWork:null,scopeOn:!1,selectedRun:null,workflows:[],jobs:{},jobErrors:{},preferences:{autoRefresh:!0},loading:!0,loadingDetail:!1,error:null},Oe=0;async function Qn(){if(ee(),u.preferences=await lr(Mr),u.directory=u.ready?.directory??null,!u.connected){u.loading=!1,ee();return}if(!u.directory){u.loading=!1,ee();return}try{if(u.workspace=await qn(ae,Mr,u.directory,sr),!u.workspace){u.loading=!1,ee();return}u.currentWork=await pn({directory:u.directory,session:u.ready?.session??null,readFile:sr,host:K}),await Dr()}catch(e){u.loading=!1,u.error=q(e),cr(e)&&(u.connected=!1),ee()}}async function Dr(){let e=u.workspace;if(!e)return;let t=++Oe,r=u.scopeOn?dt(u.currentWork):null;u.loading=!0,u.error=null,ee();try{let o=r?await ae.listRunsUntil(e.link.projectId,un(r)):await ae.listRuns(e.link.projectId);if(t!==Oe)return;u.runs=o.items,u.runsNext=o.next,u.loading=!1;let s=u.runs.filter(l=>he(l.outcome)).length;if(K.setBadge(s>0?s:null).catch(()=>{}),u.selectedRun){let l=u.runs.find(i=>i.id===u.selectedRun?.id);l&&(u.selectedRun=l)}if(!u.selectedRun){let l=r?ir(u.runs,r)[0]:o.items[0];if(l){await Gr(l);return}}}catch(o){if(t!==Oe)return;u.loading=!1,u.error=q(o),cr(o)&&(u.connected=!1)}ee(),Hr()}async function Gr(e){let t=++Oe;u.selectedRun=e,u.workflows=[],u.jobs={},u.loadingDetail=!0,ee();try{let r=await ae.listWorkflows(e.id);if(t!==Oe)return;u.workflows=r.items,u.jobErrors={};let o=await Promise.allSettled(r.items.map(s=>ae.listJobs(s.id)));if(t!==Oe)return;for(let[s,l]of o.entries()){let i=r.items[s];i&&(l.status==="fulfilled"?u.jobs[i.id]=l.value.items:(u.jobs[i.id]=[],u.jobErrors[i.id]=q(l.reason)))}u.loadingDetail=!1}catch(r){if(t!==Oe)return;u.loadingDetail=!1,u.error=q(r)}ee(),Hr()}async function Ae(){return u.selectedRun?Gr(u.selectedRun):Dr()}async function Si(){u.scopeOn=!u.scopeOn,u.selectedRun=null,u.workflows=[],u.jobs={},u.jobErrors={},await Dr()}function Ti(){let e=R("div");return W(e,{label:fn(u.currentWork),size:"sm",variant:u.scopeOn?"default":"outline",onClick:()=>void Si()}),e}function St(e){let t=u.workspace,r=u.selectedRun;if(!t||!r)return null;let o=e.workflow??null;return{workspace:t,run:r,workflow:o,job:e.job??null,jobs:e.jobs??(o?u.jobs[o.id]??[]:[]),jobsError:o?u.jobErrors[o.id]??null:null,detail:null,output:null}}async function Lr(e){if(e)try{await nn(e),await se("success","Attached to the chat box.")}catch(t){await se("error",q(t))}}async function hi(e){if(e)try{await sn(e),await se("success","Started a worktree chat for this build.")}catch(t){await se("error",q(t))}}async function gi(e,t){await hn(ae,e,{fromFailed:t},se)&&await Ae()}async function Ri(e){await gn(ae,e,se)&&await Ae()}async function bi(e){await Rn(ae,e,se)&&await Ae()}async function Oi(e){await bn(ae,e,se)&&await Ae()}function xi(){return u.selectedRun?ar(u.workflows):ar(u.runs)}var Ai=mn({delayMs:mi,enabled:()=>u.preferences.autoRefresh,active:xi,onTick:()=>void Ae()});function Hr(){Ai.arm()}function ee(){if(Xn(),mt=null,_n(xe),!u.connected){ki();return}if(!u.directory||!u.workspace){yi();return}if(Ii(),u.error){let t=R("div");xe?.append(t),Wn(t,{tone:"error",title:"CircleCI",body:u.error,action:{label:"Retry",onClick:()=>void Ae()}})}let e=R("div",{className:"page-columns"});e.append(wi()),e.append(Ni()),xe?.append(e)}function ki(){let e=R("div");xe?.append(e),Ke(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. The token stays in OpenChamber.",action:{label:"Open CircleCI tokens",onClick:()=>Te("https://app.circleci.com/settings/user/tokens")}})}function yi(){let e=R("div");xe?.append(e),Ke(e,{title:u.directory&&!u.workspace?"No CircleCI project yet":"No project open",body:u.directory&&!u.workspace?"Open the CircleCI panel once to choose which CircleCI project this repository maps to.":"Open a project in OpenChamber, then open the CircleCI panel to map it."})}function Ii(){let e=u.workspace,t=R("div",{className:"toolbar"}),r=R("div",{style:"flex:1; min-width:0;"});if(Nr(r,{label:e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",size:"sm",variant:"ghost",items:[{id:"refresh",label:"Refresh"},{separator:!0},u.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"}],onSelect:o=>{o==="refresh"&&Ae(),(o==="pause"||o==="resume")&&In(Mr,{autoRefresh:o==="resume"}).then(s=>{u.preferences=s,ee(),Hr()})}}),t.append(r),e){let o=R("div");W(o,{label:"Project in CircleCI",size:"sm",variant:"outline",onClick:()=>Te(`https://app.circleci.com/pipelines/${e.target.segment}/${e.target.owner}/${e.target.repo}`)}),t.append(o)}xe?.append(t)}function Ci(){return dn(u.runs,u.filter,u.search,u.scopeOn?dt(u.currentWork):void 0)}function wi(){let e=R("div",{className:"column"}),t=R("div"),r=jn(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:u.filter,onChange:_=>{u.filter=an(_),r.update({activeId:u.filter}),mt?.paint()}});e.append(t);let o=R("div",{className:"filter-row"}),s=R("div",{style:"flex:1; min-width:0;"});if(o.append(s),u.currentWork){let _=R("div");_.append(Ti()),o.append(_)}e.append(o);let l=u.scopeOn?En(u.currentWork):null;l&&e.append(R("p",{className:"muted scope-note",text:l}));let i=R("div",{className:"scroll"});e.append(i);let c=()=>Ci().map(_=>{let f=re(_.phase,_.outcome);return{id:_.id,leading:`#${_.number}`,title:ge(_),..._.commitSubject?{subtitle:_.commitSubject}:{},meta:[At(_.createdAt),co(_)].filter(Boolean).join(" \xB7 "),badge:{label:f.label,tone:f.tone}}}),p=()=>{if(u.runs.length===0)return"No runs yet. Push a commit.";if(u.scopeOn){let _=dt(u.currentWork),f=!!_.branch&&_.prNumbers.length>0;return`No ${_.branch?`runs on ${_.branch}${f?" or its pull requests":""}`:"runs for the linked pull requests"} in the loaded pages yet. Load more or turn the scope off.`}return"No run matches this filter."};if(u.loading&&u.runs.length===0)return i.append(Pr("Loading runs")),e;let d=Bn(i,{items:c(),emptyText:p(),selectedId:u.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:_=>{let f=u.runs.find(k=>k.id===_);f&&Gr(f)}}),E=null;if(E=Fn(s,{value:u.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:_=>{u.search=_,E?.update({value:_}),mt?.paint()}}),mt={tabs:r,paint:()=>d.update({items:c(),emptyText:p()})},u.runsNext){let _=R("div",{className:"load-more"});W(_,{label:"Load more",size:"sm",variant:"ghost",onClick:()=>void vi()}),e.append(_)}return e}async function vi(){let e=u.workspace;if(!(!e||!u.runsNext))try{let t=await ae.listRuns(e.link.projectId,u.runsNext);u.runs=[...u.runs,...t.items],u.runsNext=t.next,ee()}catch(t){await se("error",q(t))}}function Ni(){let e=R("div",{className:"column"}),t=u.selectedRun;if(!t){let d=R("div");return e.append(d),Ke(d,{title:"Pick a run",body:"Choose a run on the left to see its workflows and jobs."}),e}let r=R("div",{className:"detail-head"});r.append(R("div",{className:"badge-line"},_t(t.phase,t.outcome))),r.append(R("div",{className:"detail-title"},`#${t.number} ${ge(t)}`));let o=[];t.revision&&o.push(ve(t.revision)),t.commitSubject&&o.push(t.commitSubject),o.push(At(t.createdAt)),r.append(R("div",{className:"detail-sub"},o.filter(Boolean).join(" \xB7 ")));let s=R("div",{className:"detail-actions"}),l=R("div");W(l,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>Te(u.workspace?Fe(u.workspace.target,t.number):null)}),s.append(l);let i=t.pullRequests?.[0];if(i?.url){let d=R("div");W(d,{label:`Open PR #${i.number}`,size:"sm",variant:"outline",onClick:()=>Te(i.url)}),s.append(d)}let c=R("div");W(c,{label:"Attach run",size:"sm",variant:"outline",onClick:()=>void Lr(St({workflow:null,job:null,jobs:[]}))}),s.append(c),r.append(s),t.errors.length>0&&r.append(Ur(t.errors.map(d=>`${d.type}: ${d.message}`).join(" \xB7 "),"notice error-text")),e.append(r);let p=R("div",{className:"scroll"});if(e.append(p),u.loadingDetail)return p.append(Pr("Loading workflows")),e;if(u.workflows.length===0){let d=R("div");return p.append(d),Ke(d,{title:"No workflows",body:"This run produced no workflows."}),e}for(let d of u.workflows)p.append(Ui(d,t));return e}function Ui(e,t){let r=R("div",{className:"section"}),o=R("div",{className:"section-head"});o.append(R("span",{className:"section-title"},e.name)),o.append(R("span",{className:"spacer"})),o.append(R("span",{className:"muted"},xt(e.createdAt,e.endedAt))),o.append(_t(e.phase,e.outcome)),r.append(o);let s=R("div",{className:"job-row-actions"}),l=R("div");if(Nr(l,{label:"Rerun",size:"xs",variant:"ghost",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:E=>void gi(e,E==="failed")}),s.append(l),re(e.phase,e.outcome).active){let E=R("div");W(E,{label:"Cancel",size:"xs",variant:"ghost",onClick:()=>void Ri(e)}),s.append(E)}let i=R("div");W(i,{label:"Attach",size:"xs",variant:"outline",onClick:()=>void Lr(St({workflow:e}))}),s.append(i);let c=R("div");W(c,{label:"Open",size:"xs",variant:"ghost",onClick:()=>Te(u.workspace?je(u.workspace.target,t.number,e.id):null)}),s.append(c),r.append(s);let p=u.jobErrors[e.id];if(p)return r.append(Ur(`Could not list this workflow's jobs: ${p}`,"notice error-text")),r;let d=u.jobs[e.id]??[];if(d.length===0)return r.append(R("p",{className:"notice"},"No jobs listed.")),r;for(let E of d){let _=E.type.toLowerCase()==="approval",f=re(E.phase,E.outcome),k=R("div",{className:"job-row"}),H=R("div",{className:"job-row-head"});H.append(R("span",{className:"job-row-name"},E.name)),H.append(R("span",{className:"job-row-meta"},[E.number>0?`#${E.number}`:"",xt(E.startedAt,E.endedAt)].filter(Boolean).join(" \xB7 "))),H.append(_t(E.phase,E.outcome)),k.append(H);let M=R("div",{className:"job-row-actions"});if(_&&f.active){let y=R("div");W(y,{label:"Approve",size:"xs",onClick:()=>void bi(E)}),M.append(y);let F=R("div");W(F,{label:"Reject",size:"xs",variant:"ghost",onClick:()=>void Oi(E)}),M.append(F)}if(he(E.outcome)){let y=R("div");W(y,{label:"Attach failure",size:"xs",variant:"outline",onClick:()=>void Lr(St({workflow:e,job:E}))}),M.append(y);let F=R("div");W(F,{label:"Fix with agent",size:"xs",variant:"ghost",onClick:()=>void hi(St({workflow:e,job:E}))}),M.append(F)}let Y=R("div");W(Y,{label:"Open",size:"xs",variant:"ghost",onClick:()=>{u.workspace&&Te(Ze(u.workspace.target,t.number,e.id,E.number))}}),M.append(Y),M.childElementCount>0&&k.append(M),r.append(k)}return r}K.onReady(e=>{Kn(e),Tn(),u.ready=e,!u.booted&&(u.booted=!0,u.connected=e.connection.connected,Qn())});K.onConnection(e=>{let t=u.connected;u.connected=e.connected,e.connected&&!t&&Qn(),!e.connected&&t&&ee()});})();
