"use strict";(()=>{var ne=class extends Error{status;code;constructor(t,o,n){super(n),this.name="CircleCIError",this.status=t,this.code=o}},mn="/api/v3",Fe=20,Et=20,wo=50,Tn=50,Ne=4,Us=Ne*Fe,vo=[1e3,2500],h=e=>typeof e=="object"&&e!==null?e:{},ce=e=>Array.isArray(e)?e:[],_=e=>typeof e=="string"&&e.length>0?e:null,Me=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Po(e){return ce(e).map(t=>{let o=h(t);return{type:_(o.type)??"unknown",message:_(o.message)??""}})}function Lo(e){return ce(e).map(t=>{let o=h(t);return{type:_(o.type)??"unknown",message:_(o.message)??"",description:_(o.description),url:_(o.url)}})}function Xe(e){let t=h(e),o=h(t.attributes),n=h(t.references),s=h(n.event),l=h(s.attributes),a=h(l.vcs),c=h(a.commit),d=h(n.pipeline),p=h(n.trigger),E=h(p.attributes);return{id:_(t.id)??"",number:Me(o.number)??0,phase:_(o.phase)??"unknown",outcome:_(o.current_outcome),createdAt:_(o.created_at)??"",branch:_(a.branch),tag:_(a.tag),revision:_(a.revision),commitSubject:_(c.subject),commitUrl:_(c.url),pipelineName:_(h(d.attributes).name),trigger:_(E.name)??_(h(E.event_source).type)??_(l.type),errors:Po(o.errors),warnings:Lo(o.warnings)}}function hn(e){let t=h(e),o=h(t.attributes),n=h(o.auto_rerun);return{id:_(t.id)??"",name:_(o.name)??"Workflow",phase:_(o.phase)??"unknown",outcome:_(o.current_outcome)??_(o.outcome),createdAt:_(o.created_at),endedAt:_(o.ended_at),tag:_(o.tag),autoRerunNumber:Me(n.number)}}function _t(e){let t=h(e),o=h(t.attributes);return{id:_(t.id)??"",name:_(o.name)??"Job",number:Me(o.number)??0,type:_(o.type)??"build",phase:_(o.phase)??"unknown",outcome:_(o.outcome),startedAt:_(o.started_at),endedAt:_(o.ended_at)}}function gn(e){let t=h(e);return{num:Me(t.num)??0,name:_(t.name)??"Step",type:_(t.type)??"run",phase:_(t.phase)??"unknown",outcome:_(t.outcome),exitCode:Me(t.exit_code),command:_(t.command),startedAt:_(t.started_at),endedAt:_(t.ended_at)}}function Rn(e){let t=_t(e),o=h(h(e).attributes),n=ce(o.parallel_executions).map(h),s=n.length>0?ce(n[0]?.steps).map(gn):[];return{...t,errors:Po(o.errors),warnings:Lo(o.warnings),steps:s,parallelExecutions:n.length}}function Uo(e){let t=h(e),o=h(t.attributes),n=h(h(t.references).org);return{id:_(t.id)??"",name:_(o.name)??"Project",orgId:_(n.id)??"",orgName:_(h(n.attributes).name)??""}}function On(e){let t=h(e),o=h(t.attributes);return{id:_(t.id)??"",name:_(o.name)??"Organization",vcsProvider:_(h(o.vcs).provider)}}function No(e){let t=h(e),o=h(t.attributes),n=h(o.config);return{id:_(t.id)??"",name:_(o.name)??"Pipeline",configPath:_(n.file_path)??""}}function xn(e){let t=h(e),o=h(t.attributes);return{id:_(t.id)??"",login:_(o.login)??"CircleCI account",name:_(o.name),avatarUrl:_(o.avatar_url)}}function An(e){if(!e)return;let t={};for(let[o,n]of Object.entries(e))n==null||n===""||(t[o]=String(n));return Object.keys(t).length>0?t:void 0}function Mo(e){if(e)try{return JSON.parse(e)}catch{return}}function bn(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function kn(e,t,o){let n=h(h(t).error),s=_(n.detail)??_(n.title)??_(n.type)??bn(e);return new ne(e,_(n.type)??`HTTP_${e}`,s)}function In(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function yn(e){return new Promise(t=>setTimeout(t,e))}function Do(e){async function t(a,c){let d=An(a.query),p=0;for(;;){let E=await e({method:a.method,path:mn+a.path,...d?{query:d}:{},...a.body===void 0?{}:{body:JSON.stringify(a.body)}});if(E.status>=400){if(In(E.status,a.method)&&p<vo.length){await yn(vo[p]??2500),p+=1;continue}throw kn(E.status,Mo(E.body),E.body)}return c(E.body)}}let o=a=>t(a,Mo),n=a=>t(a,c=>c);async function s(a,c,d,p,E){let f=E?{...c,"page[cursor]":E}:{...c,"page[limit]":d},x;try{x=await o({method:"GET",path:a,query:f})}catch(y){if(!E&&y instanceof ne&&y.status===400)x=await o({method:"GET",path:a,query:{...c}});else throw y}return{items:ce(h(x).data).map(p),next:_(h(h(x).page).next)}}async function l(a,c,d,p,E){let f=[],x,y=null;for(let z=0;z<E;z+=1){let W=await s(a,c,d,p,x);if(f.push(...W.items),y=W.next,!y)break;x=y}return{items:f,next:y}}return{currentUser:async()=>{let a=await o({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=ce(h(a).data)[0];if(!c)throw new ne(200,"EMPTY_USER","CircleCI returned no user.");return xn(c)},listOrgs:async()=>(await l("/orgs",{},wo,On,Ne)).items,findProjectBySlug:async a=>{let c=await o({method:"GET",path:"/projects",query:{"filter[slug]":a}}),d=ce(h(c).data)[0];return d?Uo(d):null},listProjectsOfOrg:a=>l("/projects",{"filter[org_id]":a},wo,Uo,Ne),listPipelines:async a=>{let c=await l("/pipelines",{"filter[project_id]":a},Tn,No,1),d=[];for(let p of c.items)if(p.id)try{let E=await o({method:"GET",path:`/pipelines/${encodeURIComponent(p.id)}`,query:{"filter[project_id]":a}});d.push(No(h(E).data))}catch{d.push({...p,name:"Pipeline config"})}return d},listRuns:(a,c)=>s("/runs",{"filter[project_id]":a},Fe,Xe,c),listMyRuns:a=>s("/runs",{"filter[user_id]":"me"},Fe,Xe,a),getRun:async a=>{let c=await o({method:"GET",path:`/runs/${encodeURIComponent(a)}`});return Xe(h(c).data)},findRunByNumber:async(a,c)=>{let d;for(let p=0;p<Ne;p+=1){let E=await s("/runs",{"filter[project_id]":a},Fe,Xe,d),f=E.items.find(x=>x.number===c);if(f)return f;if(!E.next)return null;d=E.next}return null},fireRun:async a=>{let c=await o({method:"POST",path:"/runs",query:{"filter[project_id]":a.projectId},body:{data:{attributes:{checkout:{branch:a.branch}},references:{pipeline:{id:a.pipelineId}}}}}),d=_(h(h(c).data).id);if(!d)throw new ne(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return d},listWorkflows:(a,c)=>s("/workflows",{"filter[run_id]":a},Et,hn,c),listJobs:(a,c)=>c?s("/jobs",{"filter[workflow_id]":a},Et,_t,c):l("/jobs",{"filter[workflow_id]":a},Et,_t,Ne),getJob:async a=>{let c=await o({method:"GET",path:`/jobs/${encodeURIComponent(a)}`});return Rn(h(c).data)},condensedOutput:async(a,c,d=0)=>n({method:"GET",path:`/jobs/${encodeURIComponent(a)}/stdout/condensed`,query:{"filter[execution]":d,"filter[step_num]":c}}).then(p=>typeof p=="string"?p:""),rerunWorkflow:async(a,c)=>{let d=await o({method:"POST",path:`/workflows/${encodeURIComponent(a)}/rerun`,body:c?{is_from_failed:!0}:void 0});return _(h(h(d).data).id)??""},cancelWorkflow:async a=>{await o({method:"POST",path:`/workflows/${encodeURIComponent(a)}/cancel`})},approve:async a=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(a)}/approve`})},reject:async a=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(a)}/reject`})}}}var Go=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Cn={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function Ho(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function wn(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function ee(e,t){let o=(t??"").toLowerCase(),n=(e??"").toLowerCase(),s=o||n,l=Ho(o)??Ho(n)??"neutral",a=o?!Go.has(o):!Go.has(n)&&n!=="ended";return{label:Cn[s]??wn(s),tone:l,active:a}}function te(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function $o(e,t,o=Date.now()){if(!e)return"";let n=Date.parse(e);if(!Number.isFinite(n))return"";let s=t?Date.parse(t):o;if(!Number.isFinite(s)||s<n)return"";let l=Math.round((s-n)/1e3);if(l<60)return`${l}s`;let a=Math.floor(l/60),c=l%60;if(a<60)return c>0?`${a}m ${c}s`:`${a}m`;let d=Math.floor(a/60),p=a%60;return p>0?`${d}h ${p}m`:`${d}h`}function ft(e,t=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let n=Math.round((t-o)/1e3);if(n<45)return"just now";let s=Math.round(n/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let a=Math.round(l/24);return a<7?`${a}d ago`:new Date(o).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function je(e){return e?e.slice(0,8):""}function le(e){return e.branch??e.tag??"detached"}var vn={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function Vo(e){let t=e.trim();if(!t)return null;let o=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);o&&!t.includes("://")&&(t=`https://${o[1]}/${o[2]}/${o[3]}`);let n;try{n=new URL(t)}catch{return null}let s=n.hostname.toLowerCase();if(!s)return null;let l=n.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let a=l[l.length-2]??"",c=l[l.length-1]??"";return!a||!c?null:{host:s,owner:a,repo:c}}function Xo(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function Fo(e,t,o){return{segment:e&&vn[e.host]||"github",owner:e?.owner??t,repo:e?.repo??o}}function Un(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function St(e,t){return`${Un(e)}/${t}`}function mt(e,t,o){return`${St(e,t)}/workflows/${o}`}function jo(e,t,o,n){return`${mt(e,t,o)}/jobs/${n}`}function Bo(e){let t=null,o=null,n="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let a=/^\[([^\]]+)\]$/.exec(l);if(a){n=(a[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let d=(c[1]??"").trim();d&&(o===null&&(o=d),(/remote\s+"origin"/i.test(n)||/remote\s+'origin'/i.test(n))&&(t=d))}return t??o}var Ko="circleci",Nn=16e3,Mn=200,Tt=2e3;function Wo(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function ge(e){return ee(e.phase,e.outcome).label.toLowerCase()}function zo(e){let{workspace:t,run:o,workflow:n,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:o.id,runNumber:o.number,branch:o.branch,workflowId:n?.id??null,workflowName:n?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function Jo(e){let t=e.workflow?.id??"run",o=e.job?.id??"";return`${e.run.id}:${t}:${o}`}function qo(e){let{run:t,workflow:o,job:n}=e,s=n?.name??o?.name??`run #${t.number}`,l=ge(n?{phase:n.phase,outcome:n.outcome}:o||{phase:t.phase,outcome:t.outcome});return Wo(`${s} ${l} in CircleCI run #${t.number}`,Mn)}function ht(e){let{workspace:t,run:o,workflow:n,job:s}=e;return n&&s&&s.number>0?jo(t.target,o.number,n.id,s.number).slice(0,Tt):n?mt(t.target,o.number,n.id).slice(0,Tt):St(t.target,o.number).slice(0,Tt)}function Qo(e){let{workspace:t,run:o,workflow:n,job:s,jobs:l,detail:a,output:c}=e,d=[];d.push(`CircleCI run #${o.number} on ${t.link.orgName}/${t.link.projectName}`),d.push(`Status: ${ge({phase:o.phase,outcome:o.outcome})}`),o.pipelineName&&d.push(`Pipeline: ${o.pipelineName}`),d.push(`Ref: ${le(o)}${o.revision?` at ${je(o.revision)}`:""}`),o.commitSubject&&d.push(`Commit: ${o.commitSubject}`),d.push(`URL: ${ht(e)}`);let p=l.filter(E=>te(E.outcome));if(n){if(d.push(""),d.push(`Workflow ${n.name} (${ge(n)})`),p.length>0){d.push("Failing jobs:");for(let f of p)d.push(`- ${f.name} (#${f.number})`)}let E=l.filter(f=>!p.includes(f));if(E.length>0){d.push("Other jobs:");for(let f of E)d.push(`- ${f.name}: ${ge({phase:f.phase,outcome:f.outcome})}`)}}if(s&&a){if(d.push(""),d.push(`Job ${a.name} (#${a.number})`),a.errors.length>0){d.push("Errors:");for(let f of a.errors)d.push(`- ${f.type}: ${f.message}`)}let E=a.steps.filter(f=>f.outcome==="failed");if(E.length>0){d.push("Failed steps:");for(let f of E)d.push(`- step ${f.num} "${f.name}"${f.exitCode!==null?` (exit ${f.exitCode})`:""}`),f.command&&d.push(`  command: ${f.command}`)}}return c&&c.trim()&&(d.push(""),d.push("Condensed output:"),d.push(c.trim())),Wo(d.join(`
`),Nn)}var b="openchamber.sdk";var Be="data-oc-scrolling",gt=`
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
:hover, [${Be}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Be}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Be}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Be}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Rt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",n=>{let s=n.target===e?t:n.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=o.get(s);l!==void 0&&clearTimeout(l),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Pn=`(${Rt.toString()})(document);`;var tr=/^[a-z][a-z0-9-]{0,39}$/;var Yo=e=>Object(e)===e&&!Array.isArray(e),Ot=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Zo=e=>String(e)===e&&e.length>=1&&e.length<=60,er=e=>String(e)===e&&e.length>=1&&e.length<=80,or=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Yo(o)||!tr.test(o.id)||!Zo(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!Ot(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!Ot(o,["kind","id","label","value","options","disabled"])||!er(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let n=new Set;for(let s of o.options){if(!Yo(s)||!Ot(s,["value","label"])||!er(s.value)||!Zo(s.label)||n.has(s.value))return!1;n.add(s.value)}if(!n.has(o.value))return!1}return!0};var rr=["{id}","{segment}","{segments+}"];var zs=new Set(rr);var nr=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var qs=new Set(nr);var xt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,sr=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var ir=/^[A-Za-z0-9_-]{1,80}$/;var ar=["left","right","top","bottom"];var cr=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let n=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of n)if(!cr(s,t+1,o))return!1;return!0},At=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(At);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(At)}return String(e)===e||Number.isFinite(e)},bt=e=>{try{return String(e.id)!==e.id||!ir.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!ar.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!cr(e.data)||!At(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var It=2e3;var dr=["file","directory","other","missing"],yt=e=>!!(e&&"sessionId"in e),Ct=e=>!!(e&&"sent"in e&&!("sessionId"in e));var ur=/^[0-9a-f]{7,64}$/i,wt=e=>ur.test(e),Ke=500,We=32e3,pr=16e3,Er=128,_r=200,fr=2e3,Sr=16e3,mr=80,Tr=200,hr=16e3;var gr=2e3;var vt=2e4,ze=1024,Je=2e6;var qe=64e3,Qe=8e3,Ut=4e3;var Nt=96e4,Dn=60*6e4;var Rr=999,Or=1e4,Pe=500,xr=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Ar=["stopped","starting","ready","failed"],Gn=new Set(xr),br=e=>Gn.has(e),kr=e=>e&&br(e)?e:"HOST_REJECTED",Re=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Re):Object(e)===e?Object.values(e).every(Re):!1,Ir=e=>Re(e)&&JSON.stringify(e).length<=hr,lr=e=>e?.trim().slice(0,Tr)??"",Oe=e=>{let t=e.id.trim().slice(0,Er),o=e.title.trim().slice(0,_r),n=e.url.trim().slice(0,fr),s=e.text?.trim().slice(0,Sr),l=e.author?.trim().slice(0,mr),a=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:o||t,url:n,kind:a};if(s&&(c.text=s),l&&(c.author=l),a==="pull"){let d=lr(e.branches?.head),p=lr(e.branches?.base);d&&p&&(c.branches={head:d,base:p})}return Ir(e.data)&&(c.data=e.data),c},Mt=e=>{let t=Oe(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Pt=e=>{let t={text:e.text.trim().slice(0,pr)};return e.send&&(t.send=!0),t},Lt=e=>e===null||!Number.isFinite(e)?null:Math.min(Rr,Math.max(0,Math.round(e))),Dt=e=>Number.isFinite(e)?Math.min(Or,Math.max(0,Math.ceil(e))):0;var xe=e=>e.length>0&&e.length<=ze&&!e.includes("\0")&&!e.includes("\\");var Ye=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>gr?!1:!e.split("/").some(o=>o==="."||o===".."),Hn=new Set(Ar),Gt=e=>!!(e&&"status"in e&&Hn.has(String(e.status))&&!("body"in e)),Ze=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Ht=e=>!!(e&&"content"in e&&String(e.content)===e.content),$t=e=>!!(e&&"written"in e&&e.written===!0),Vt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),$n=new Set(dr),Xt=e=>!!(e&&"kind"in e&&"size"in e&&$n.has(String(e.kind))&&Number.isFinite(e.size)),Ft=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Vn=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Xn=e=>Object(e)===e?e:null,kt=e=>String(e)===e&&e.length>0,Fn=e=>{if(!kt(e.id))return null;if(e.ok===!0){let t={channel:b,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&kt(e.error)?{channel:b,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:kr(kt(e.code)?e.code:void 0)}:null},jt=e=>{let t=Xn(e);return!t||t.channel!==b||t.v!==1?null:t.type==="result"?Fn(t):!Vn.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var yr=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,jn=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",m=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},Cr=()=>Promise.reject(new m("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),et=()=>Promise.reject(new m("BAD_PATH",`File path must be 1 to ${ze} characters without NUL or backslash.`)),tt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new m("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},O=e=>(e.value+=1,`oc-${e.value}`),Jt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new m("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(r=>r===t.parent),n=e.requestTimeoutMs??vt,s=new Set,l=new Set,a=new Set,c=new Set,d=new Set,p=new Set,E=new Set,f=new Set,x=new Set,y=new Set,z=new Set,W=new Set,ct=[],Ie=null,ye=null,De=new Set,Ge=new Set,Ce=null,we=null,lt=!1,me=new Map,Te=new Map,he=new Map,Q=!1,R={value:0},g=null,Z=null,ve=!1,Ue=!1,To=null,ho=r=>r?{sessionId:r.id,phase:r.busy?"started":"completed"}:null,B=r=>{t.parent.postMessage(r,"*")},go=()=>{Q||t.parent===t||W.size===0||g?.features?.lateGenerateResults!==!0||B({channel:b,v:1,type:"generate-late-listen"})},U=(r,i)=>{for(let S of r)try{S(i)}catch(T){console.error(T)}},Ro=r=>{if(!(r instanceof MessageEvent)||!o(r.source))return;let i=jt(r.data);if(!i)return;if(i.type==="workspace"){let T=Te.get(i.payload.subscriptionId);T&&U([T],i.payload.snapshot);return}if(i.type==="shells"){let T=he.get(i.payload.subscriptionId);T&&U([T],i.payload.snapshot);return}if(i.type==="ready"){g=i.payload,Z=ho(i.payload.session),U(s,i.payload),U(l,i.payload.directory),U(a,i.payload.session),Z&&U(c,Z),U(d,i.payload.connection),U(p,i.payload.settings),U(E,i.payload.item),i.payload.block&&U(f,i.payload.block),go();return}if(i.type==="service-event"){U(x,i.payload);return}if(i.type==="generate-late"){W.size===0?ct.push(i.payload):U(W,i.payload);return}if(i.type==="directory"){g&&(g={...g,directory:i.payload.directory}),U(l,i.payload.directory);return}if(i.type==="session"){g&&(g={...g,session:i.payload.session}),i.payload.session?Z?.sessionId!==i.payload.session.id&&(Z=ho(i.payload.session)):Z=null,U(a,i.payload.session);return}if(i.type==="session-lifecycle"){Z=i.payload,U(c,i.payload);return}if(i.type==="connection"){g&&(g={...g,connection:i.payload.connection}),U(d,i.payload.connection);return}if(i.type==="settings"){g&&(g={...g,settings:i.payload.settings}),U(p,i.payload.settings);return}if(i.type==="item"){g&&(g={...g,item:i.payload.item}),U(E,i.payload.item);return}if(i.type==="status-control-event"){U(y,i.payload);return}if(i.type==="popover-closed"){U(z,i.payload);return}if(i.type==="action"){let T=C=>{Q||B({channel:b,v:1,type:"action-result",id:i.id,payload:C})},w=ye;if(!w){T({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>w(i.payload)).then(()=>T({ok:!0}),C=>{let H=(C instanceof Error?C.message:String(C)).trim();T({ok:!1,error:(H||"Action failed.").slice(0,Pe)})});return}if(i.type==="file-open"){let T=i.payload;if(we&&sr(we,T))return;we=T,U(De,i.payload);return}if(i.type==="file-saved"){U(Ge,i.payload.version);return}if(i.type==="file-snapshot"){let T=H=>{Q||B({channel:b,v:1,type:"file-snapshot-result",id:i.id,payload:H})},w=H=>T({error:(H.trim()||"Could not read the edited file.").slice(0,Pe)}),C=Ce;if(!C){w("This extension does not edit files.");return}Promise.resolve().then(()=>C(i.payload.purpose)).then(H=>{if(xt(H)>2e7){w(`The file is over ${2e7} ${"bytes"in H?"bytes":"characters"}.`);return}if(H.version.length>256){w(`The snapshot version is over ${256} characters.`);return}T({snapshot:"bytes"in H?{bytes:H.bytes,version:H.version}:{content:H.content,version:H.version}})},H=>w(H instanceof Error?H.message:String(H)));return}if(i.type==="resolve"){let T=C=>{B({channel:b,v:1,type:"resolve-result",id:i.id,payload:C})},w=Ie;if(!w){T({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>w(i.payload)).then(C=>T({item:C?Oe(C):null}),C=>{let H=(C instanceof Error?C.message:String(C)).trim();T({error:(H||"Command failed.").slice(0,Pe)})});return}let S=me.get(i.id);if(S){if(clearTimeout(S.timer),me.delete(i.id),i.ok){S.resolve(i.payload);return}S.reject(new m(i.code,i.error))}};t.addEventListener("message",Ro),B({channel:b,v:1,type:"hello"});let F=(r,i=n)=>Q||t.parent===t?Promise.reject(new m("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((S,T)=>{let w=setTimeout(()=>{me.delete(r.id),T(new m("HOST_TIMEOUT","Host did not answer in time."))},i);me.set(r.id,{resolve:S,reject:T,timer:w}),B(r)}),D=r=>F(r).then(()=>{}),G={channel:b,v:1},dt=r=>{!Q&&t.parent!==t&&B(r)},Oo=()=>dt({...G,type:"file-save"}),xo=r=>{!yr(r)||!jn(r)||(r.preventDefault(),Oo())},Ao=r=>{!yr(r)||r.key!=="Escape"||g?.surface!=="popover"||!g.popover||(r.preventDefault(),yo(g.popover.id,"escape").catch(()=>{}))},He=()=>{let r=g?.surface==="popover"?g.popover:void 0;if(!r)return;let i=ve||Ue;To!==i&&(To=i,Co(r.id,i).catch(()=>{}))},$e=()=>{g?.surface!=="popover"||ve||(ve=!0,He())},bo=r=>{g?.surface!=="popover"||r.relatedTarget!==null||!ve||(ve=!1,He())},ko=()=>{g?.surface!=="popover"||Ue||(Ue=!0,He())},Io=()=>{g?.surface!=="popover"||!Ue||(Ue=!1,He())},J=(r,i=1024)=>{if(!r.trim()||r.length>i)throw new m("HOST_REJECTED",`Identity must contain 1 to ${i} characters.`)},ut=async r=>{r.kind!=="projects"&&J(r.projectId);let i=await F({...G,type:"workspace-read",id:O(R),payload:r});if(!i||!("kind"in i)||!("state"in i)||i.kind!==r.kind)throw new m("HOST_REJECTED","Host did not return workspace data.");return i},pt=async(r,i)=>{r.kind!=="projects"&&J(r.projectId);let S=O(R);Te.set(S,i);try{await D({...G,type:"workspace-subscribe",id:O(R),payload:{subscriptionId:S,query:r}})}catch(T){throw Te.delete(S),Q||B({...G,type:"workspace-unsubscribe",id:O(R),payload:{subscriptionId:S}}),T}return()=>{!Te.delete(S)||Q||B({...G,type:"workspace-unsubscribe",id:O(R),payload:{subscriptionId:S}})}},Sn=async(r,i)=>{r.kind==="session"&&J(r.sessionId),r.kind==="project"&&J(r.projectId);let S=O(R);he.set(S,i);try{await D({...G,type:"shells-subscribe",id:O(R),payload:{subscriptionId:S,scope:r}})}catch(T){throw he.delete(S),Q||B({...G,type:"shells-unsubscribe",id:O(R),payload:{subscriptionId:S}}),T}return()=>{!he.delete(S)||Q||B({...G,type:"shells-unsubscribe",id:O(R),payload:{subscriptionId:S}})}},Ve=async r=>{if("key"in r&&(r.key.length===0||r.key.length>128))throw new m("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(r.op==="set"&&!Re(r.value))throw new m("HOST_REJECTED","Storage values must be JSON.");if(r.op==="set"&&new TextEncoder().encode(JSON.stringify(r.value)).length>65536)throw new m("HOST_REJECTED","Storage value exceeds 64 KiB.");if(r.scope==="device"&&g?.features?.deviceStorage!==!0)throw new m("UNSUPPORTED","This host does not support device storage.");let i=await F({...G,type:"storage",id:O(R),payload:r});if(!i||!("storage"in i)||i.op!==r.op)throw new m("HOST_REJECTED","Host did not return storage data.");return i},yo=(r,i)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===r)?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):D({...G,type:"popover-close",id:O(R),payload:i?{id:r,reason:i}:{id:r}}),Co=(r,i)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===r)?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):D({...G,type:"popover-anchor",id:O(R),payload:{id:r,active:i}});return t.addEventListener("keydown",Ao,!0),t.addEventListener("pointerover",$e),t.addEventListener("pointermove",$e),t.addEventListener("pointerout",bo),t.addEventListener("focus",ko),t.addEventListener("blur",Io),{onAction:r=>(ye=r,()=>{ye===r&&(ye=null)}),listProjects:async()=>{let r=await ut({kind:"projects"});if(r.kind!=="projects")throw new m("HOST_REJECTED","Expected projects.");return r},listWorktrees:async r=>{let i=await ut({kind:"worktrees",projectId:r});if(i.kind!=="worktrees")throw new m("HOST_REJECTED","Expected worktrees.");return i},listSessions:async r=>{let i=await ut({kind:"sessions",projectId:r});if(i.kind!=="sessions")throw new m("HOST_REJECTED","Expected sessions.");return i},onProjects:r=>pt({kind:"projects"},i=>{i.kind==="projects"&&r(i)}),onWorktrees:(r,i)=>pt({kind:"worktrees",projectId:r},S=>{S.kind==="worktrees"&&i(S)}),onSessions:(r,i)=>pt({kind:"sessions",projectId:r},S=>{S.kind==="sessions"&&i(S)}),onRunningShells:(r,i)=>Sn(r,i),readShellOutput:async(r,i)=>{J(r,128);let S=i?.cursor;if(S!==void 0&&(!Number.isInteger(S)||S<0))throw new m("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let T=i?.tailBytes;if(T!==void 0&&(!Number.isInteger(T)||T<1||T>65536))throw new m("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let C=await F({...G,type:"shell-output",id:O(R),payload:{shellId:r,cursor:S,tailBytes:T}});if(!C||typeof C.output!="string"||!Number.isFinite(C.cursor))throw new m("HOST_REJECTED","Host did not return shell output.");return C},stopShell:async r=>{if(J(r,128),(await F({...G,type:"shell-stop",id:O(R),payload:{shellId:r}}))?.stopped!==!0)throw new m("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async r=>{J(r),await D({...G,type:"open-session",id:O(R),payload:{sessionId:r}})},storage:{get:async(r,i)=>{let S=tt(i),T={op:"get",key:r};S&&(T.scope=S);let w=await Ve(T);return w.op==="get"&&w.found?w.value:void 0},set:async(r,i,S)=>{let T=tt(S),w={op:"set",key:r,value:i};T&&(w.scope=T),await Ve(w)},delete:async(r,i)=>{let S=tt(i),T={op:"delete",key:r};S&&(T.scope=S),await Ve(T)},keys:async r=>{let i=tt(r),S={op:"keys"};i&&(S.scope=i);let T=await Ve(S);if(T.op!=="keys")throw new m("HOST_REJECTED","Expected storage keys.");return T.keys}},onReady:r=>(s.add(r),g&&r(g),()=>{s.delete(r)}),onDirectory:r=>(l.add(r),g&&r(g.directory),()=>{l.delete(r)}),onSession:r=>(a.add(r),g&&r(g.session),()=>{a.delete(r)}),onSessionLifecycle:r=>(c.add(r),Z&&r(Z),()=>{c.delete(r)}),onConnection:r=>(d.add(r),g&&r(g.connection),()=>{d.delete(r)}),onSettings:r=>(p.add(r),g&&r(g.settings),()=>{p.delete(r)}),onItem:r=>(E.add(r),g&&r(g.item),()=>{E.delete(r)}),onBlock:r=>(f.add(r),g?.block&&r(g.block),()=>{f.delete(r)}),onServiceEvent:r=>(x.add(r),()=>{x.delete(r)}),onStatusControl:r=>(y.add(r),()=>{y.delete(r)}),onPopoverClosed:r=>(z.add(r),()=>{z.delete(r)}),setStatusControls:r=>g?.features?.statusControls!==!0?Promise.reject(new m("UNSUPPORTED","This host does not support status controls.")):or(r)?D({...G,type:"status-controls",id:O(R),payload:{controls:r}}):Promise.reject(new m("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:r=>g?.features?.popovers!==!0?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):bt(r)?D({...G,type:"popover-open",id:O(R),payload:r}):Promise.reject(new m("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:yo,setPopoverAnchorActive:Co,onResolve:r=>(Ie=r,()=>{Ie===r&&(Ie=null)}),toast:r=>{let i=r.message.trim();return!i||i.length>Ke?Promise.reject(new m("HOST_REJECTED",`Toast message must contain 1 to ${Ke} characters.`)):r.copy&&r.copy!==!0&&(!r.copy.text.length||r.copy.text.length>We)?Promise.reject(new m("HOST_REJECTED",`Toast copy text must contain 1 to ${We} characters.`)):D({channel:b,v:1,type:"toast",id:O(R),payload:{...r,message:i}})},openUrl:r=>D({channel:b,v:1,type:"open-url",id:O(R),payload:{url:r}}),openCommit:r=>wt(r)?D({channel:b,v:1,type:"open-commit",id:O(R),payload:{sha:r}}):Promise.reject(new m("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:r=>D({channel:b,v:1,type:"block-answer",id:O(R),payload:{text:r.trim().slice(0,It)}}),openSurface:r=>D({channel:b,v:1,type:"open-surface",id:O(R),payload:{surfaceId:r}}),writeClipboard:r=>D({channel:b,v:1,type:"clipboard-write",id:O(R),payload:{text:r}}),compose:r=>D({channel:b,v:1,type:"compose",id:O(R),payload:r}),attach:r=>D({channel:b,v:1,type:"attach",id:O(R),payload:Oe(r)}),startSession:async r=>{r.projectId!==void 0&&J(r.projectId);let i=r.worktree;i&&i!==!0&&(i.kind==="existing"?J(i.directory):(i.name!==void 0&&J(i.name,200),i.baseBranch!==void 0&&J(i.baseBranch,200)));let S=await F({channel:b,v:1,type:"start-session",id:O(R),payload:Mt(r)},e.requestTimeoutMs??18e4);if(!yt(S))throw new m("HOST_REJECTED","Host did not return a session.");return S},prompt:r=>F({channel:b,v:1,type:"prompt",id:O(R),payload:Pt(r)}).then(i=>{if(!Ct(i))throw new m("HOST_REJECTED","Host did not return a prompt result.");return i}),sessionLink:r=>D({channel:b,v:1,type:"session-link",id:O(R),payload:Oe(r)}),close:()=>D({channel:b,v:1,type:"close",id:O(R)}),oauthStart:()=>D({channel:b,v:1,type:"oauth-start",id:O(R)}),oauthDisconnect:()=>D({channel:b,v:1,type:"oauth-disconnect",id:O(R)}),request:r=>(Ye(r.path)?F({channel:b,v:1,type:"request",id:O(R),payload:r}):Cr()).then(i=>{if(!Ze(i))throw new m("HOST_REJECTED","Host request result was empty.");return i}),serviceRequest:r=>(Ye(r.path)?F({channel:b,v:1,type:"service-request",id:O(R),payload:r}):Cr()).then(i=>{if(!Ze(i))throw new m("HOST_REJECTED","Host service request result was empty.");return i}),serviceStatus:()=>F({channel:b,v:1,type:"service-status",id:O(R)}).then(r=>{if(!Gt(r))throw new m("HOST_REJECTED","Host did not return service status.");return r}),readFile:r=>(xe(r)?F({channel:b,v:1,type:"file-read",id:O(R),payload:{path:r}}):et()).then(i=>{if(!Ht(i))throw new m("HOST_REJECTED","Host did not return file content.");return i}),writeFile:(r,i)=>xe(r)?i.length>Je?Promise.reject(new m("FILE_TOO_LARGE",`Content is over ${Je} characters.`)):F({channel:b,v:1,type:"file-write",id:O(R),payload:{path:r,content:i}}).then(S=>{if(!$t(S))throw new m("HOST_REJECTED","Host did not confirm the write.");return S}):et(),listDir:r=>(xe(r)?F({channel:b,v:1,type:"file-list",id:O(R),payload:{path:r}}):et()).then(i=>{if(!Vt(i))throw new m("HOST_REJECTED","Host did not return directory entries.");return i}),stat:r=>(xe(r)?F({channel:b,v:1,type:"file-stat",id:O(R),payload:{path:r}}):et()).then(i=>{if(!Xt(i))throw new m("HOST_REJECTED","Host did not return file status.");return i}),generate:r=>{let i=r.prompt.trim(),S=r.system?.trim();if(i.length===0||i.length>qe)return Promise.reject(new m("HOST_REJECTED",`Prompt must be 1 to ${qe} characters.`));if(S!==void 0&&(S.length===0||S.length>Qe))return Promise.reject(new m("HOST_REJECTED",`System prompt must be 1 to ${Qe} characters.`));let T=r.maxOutputTokens===void 0?void 0:Math.min(Ut,Math.max(1,Math.floor(r.maxOutputTokens)));if(T!==void 0&&!Number.isFinite(T))return Promise.reject(new m("HOST_REJECTED","maxOutputTokens must be a number."));let w={prompt:i};return S!==void 0&&(w.system=S),T!==void 0&&(w.maxOutputTokens=T),F({channel:b,v:1,type:"generate",id:O(R),payload:w},e.requestTimeoutMs??Nt).then(C=>{if(!Ft(C))throw new m("HOST_REJECTED","Host did not return generated text.");return C})},onLateGenerateResult:r=>{W.add(r);for(let i of ct.splice(0))U([r],i);return go(),()=>{W.delete(r)}},setBadge:r=>D({channel:b,v:1,type:"badge",id:O(R),payload:{count:Lt(r)}}),setHeight:r=>D({channel:b,v:1,type:"resize",id:O(R),payload:{height:Dt(r)}}),onFileOpen:r=>(De.add(r),lt||(lt=!0,t.addEventListener("keydown",xo,!0)),we&&r(we),()=>{De.delete(r)}),onFileSnapshot:r=>(Ce=r,()=>{Ce===r&&(Ce=null)}),onFileSaved:r=>(Ge.add(r),()=>{Ge.delete(r)}),reportFileChange:r=>dt({...G,type:"file-change",payload:{dirty:r.dirty,edited:r.edited}}),requestFileSave:Oo,reportFileUnsupported:()=>dt({...G,type:"file-unsupported"}),dispose:()=>{for(let r of Te.keys())B({...G,type:"workspace-unsubscribe",id:O(R),payload:{subscriptionId:r}});Te.clear();for(let r of he.keys())B({...G,type:"shells-unsubscribe",id:O(R),payload:{subscriptionId:r}});he.clear(),Q=!0,Ie=null,ye=null,Ce=null,De.clear(),Ge.clear(),lt&&t.removeEventListener("keydown",xo,!0),t.removeEventListener("message",Ro),t.removeEventListener("keydown",Ao,!0),t.removeEventListener("pointerover",$e),t.removeEventListener("pointermove",$e),t.removeEventListener("pointerout",bo),t.removeEventListener("focus",ko),t.removeEventListener("blur",Io);for(let r of me.values())clearTimeout(r.timer),r.reject(new m("HOST_UNAVAILABLE","Host client was disposed."));me.clear(),s.clear(),l.clear(),a.clear(),c.clear(),d.clear(),p.clear(),E.clear(),f.clear(),x.clear(),y.clear(),z.clear(),W.clear(),ct.length=0}}};var Ur=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var ui=new Set(Ur);var Bn=10*6e4;var Kn=10*6e4;var Wn=10*6e4;var zn=10*6e4;var Nr=["none","agent","user"];var Ei=new Set(Nr);var V=Jt(),Mr=async e=>V.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});function Pr(e){return V.readFile(e)}function Lr(e){return{providerId:Ko,id:Jo(e).slice(0,128),title:qo(e),url:ht(e),kind:"issue",text:Qo(e),data:zo(e)}}async function Dr(e){await V.attach(Lr(e))}async function Gr(e){await V.startSession({...Lr(e),worktree:!0,navigation:"open"})}function I(e,t={},...o){let n=document.createElement(e);t.className&&(n.className=t.className),t.text!==void 0&&(n.textContent=t.text),t.title&&(n.title=t.title),t.style&&n.setAttribute("style",t.style),t.role&&n.setAttribute("role",t.role),t.ariaLabel&&n.setAttribute("aria-label",t.ariaLabel);for(let s of o)s==null||s===!1||n.append(typeof s=="string"?document.createTextNode(s):s);return n}function Hr(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var Jn={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function Ae(e){return e instanceof ne?e.message:e instanceof m?Jn[e.code]??e.message:e instanceof Error?e.message:String(e)}function qn(e){return e instanceof m?e.code:null}function qt(e){let t=qn(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}var Qn=["all","failed","running"];function $r(e){return Qn.includes(e)?e:"all"}function Yn(e){return[`#${e.number}`,le(e),je(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function Zn(e,t,o=""){if(t==="failed"&&!te(e.outcome)||t==="running"&&!ee(e.phase,e.outcome).active)return!1;let n=o.trim().toLowerCase();return n===""||Yn(e).includes(n)}function Vr(e,t,o=""){return e.filter(n=>Zn(n,t,o))}var es=`
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
`,Xr="circleci-shared-style";function Fr(){if(document.getElementById(Xr))return;let e=document.createElement("style");e.id=Xr,e.textContent=es,document.head.append(e)}var ts=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],os=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],jr=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,n]of ts)t.style.setProperty(o,e.tokens[n]);for(let[o,n,s]of os){let l=e.tokens[s]??"";t.style.setProperty(o,l),t.style.setProperty(n,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Qt=(e,t)=>{jr(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var rs={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},v=(e,t)=>`var(--${e}, var(--oc-${rs[e]}, ${t}))`,re=v("surface-background","transparent"),rt=v("surface-elevated","transparent"),be=v("surface-elevated-foreground","inherit"),K=v("surface-foreground","inherit"),P=v("surface-muted-foreground","gray"),ns=v("surface-muted","transparent"),de=v("interactive-border","currentColor"),j=v("interactive-hover","transparent"),ue=v("interactive-active","transparent"),Yt=v("interactive-selection","transparent"),Zt=v("interactive-selection-foreground","inherit"),oe=v("primary","currentColor"),eo=v("primary-text","inherit"),to=v("error-text","inherit"),ss=v("font-sans","inherit"),oo=v("font-mono","monospace"),zr=v("radius","9px"),ro=`calc(${zr} - 2px)`,Br=`calc(${zr} - 4px)`,L=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Kr=`background-image: linear-gradient(${j}, ${j});`,no=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,so="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Wr="box-shadow: var(--oc-sdk-lit);",io=`inset 0 0.5px 0 0 ${L(K,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,is=`
:root {
  --oc-sdk-edge: ${L(K,16)};
  --oc-sdk-field-bg: ${rt};
  --oc-sdk-raised-bg: ${re};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${L(K,14)};
  --oc-sdk-field-bg: ${L(re,50,rt)};
  --oc-sdk-raised-bg: ${rt};
  --oc-sdk-field-lift: ${io};
  --oc-sdk-raised-lift: ${io};
  --oc-sdk-lit: ${io};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,ot=e=>{let t=v(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${v(`${e}-text`,"inherit")}; }`},as=`
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
`,Jr=`${is}
.oc-sdk { color: ${K}; font-family: ${ss}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Kr} }
.oc-sdk-mono { font-family: ${oo}; }
.oc-sdk-muted { color: ${P}; }
${ot("success")}${ot("warning")}${ot("error")}${ot("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${oe}; --oc-sdk-tone-text: ${eo}; }

.oc-sdk-btn { border-radius: ${ro}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Br}; }
.oc-sdk-btn[data-variant="default"] { color: ${eo}; background: ${L(oe,10,re)}; border-color: ${L(oe,12)}; ${Wr} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${L(oe,16,re)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${L(oe,22,re)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${ns}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${ue}, ${ue}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${be}; ${so} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${ue}, ${ue}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${j}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${ue}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error","red")}; color: ${to}; background: ${L("var(--oc-sdk-tone)",7,re)}; border-color: ${L("var(--oc-sdk-tone)",12)}; ${Wr} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${L("var(--oc-sdk-tone)",9,re)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${L("var(--oc-sdk-tone)",11,re)}; box-shadow: none; }

.oc-sdk-field-note { color: ${P}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${to}; }
.oc-sdk-input { border-radius: ${ro}; background: var(--oc-sdk-field-bg); color: ${be}; ${no("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${P}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${no(L(K,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${no(v("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${oo}; }

.oc-sdk-search-icon { color: ${P}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${oe}; }
.oc-sdk-search-clear { border-radius: ${Br}; color: ${P}; }
.oc-sdk-search-clear:hover { background: ${j}; color: ${K}; }

.oc-sdk-trigger { border-radius: ${ro}; background: var(--oc-sdk-raised-bg); color: ${be}; ${so} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${ue}, ${ue}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${P}; }
.oc-sdk-trigger-chevron { color: ${P}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${be}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${rt}; background-clip: padding-box; color: ${be}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${j}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Yt}; color: ${Zt}; }
.oc-sdk-option-check { color: ${K}; }
.oc-sdk-option[data-destructive="true"] { color: ${to}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${L(v("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${P}; }
.oc-sdk-popup-empty { color: ${P}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${de}; border-radius: 4px; color: ${K}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${L(K,60,de)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${de}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${re}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${oe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Kr} }
.oc-sdk-check-desc { color: ${P}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${L(K,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${P}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${K}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Zt}; background: ${Yt}; border-color: ${de}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${be}; background: var(--oc-sdk-raised-bg); ${so} }
.oc-sdk-tab-count { color: ${P}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${L(K,6)}; color: ${P}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${L("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${j}; }
.oc-sdk-row[aria-selected="true"] { background: ${Yt}; color: ${Zt}; }
.oc-sdk-row-lead { font-family: ${oo}; color: ${P}; }
.oc-sdk-row-sub { color: ${P}; }
.oc-sdk-row-meta { color: ${P}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${P}; }

.oc-sdk-empty-body { color: ${P}; }

.oc-sdk-spinner { color: ${P}; }
.oc-sdk-spinner-ring { border-color: ${de}; border-top-color: ${oe}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${L("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${P}; }

.oc-sdk-separator { color: ${P}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${L(de,40)}; }

.oc-sdk-progress-label { color: ${P}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${L(K,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${oe}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${v("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${v("success-text","inherit")}; }

.oc-sdk-text a { color: ${eo}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${L(de,60)}; }
`,N=`
${gt}
${as}
${Jr}`;var qr="oc-sdk-ui-style",pe=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},M=e=>{let t=document.getElementById(qr);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Rt(document);let o=document.createElement("style");o.id=qr,o.textContent=e,document.head.appendChild(o)},A=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},q=e=>{let t=A("button",e);return t.type="button",t},$=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},Y=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)};var cs=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},se=(e,t)=>{M(N);let o=t,n=q("oc-sdk oc-sdk-btn"),s=cs(),l=document.createElement("span");n.append(l),e.append(n);let a=()=>{n.dataset.variant=o.variant??"default",n.dataset.size=o.size??"default",n.disabled=!!o.disabled||!!o.loading,n.dataset.loading=o.loading?"true":"false",n.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==n?n.prepend(s):!o.loading&&s.parentNode===n&&s.remove(),$(l,o.label)},c=()=>{o.disabled||o.loading||o.onClick()};return n.addEventListener("click",c),a(),{update:d=>{o={...o,...d},a()},dispose:()=>{n.removeEventListener("click",c),n.remove()}}};var Qr="http://www.w3.org/2000/svg",ls={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Ee=(e,t,o)=>{let n=document.createElementNS(Qr,"svg");n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("aria-hidden","true"),n.setAttribute("fill","currentColor"),o&&n.setAttribute("class",o);let s=document.createElementNS(Qr,"path");return s.setAttribute("d",ls[e]),n.append(s),n};var ao=(e,t)=>{M(N);let o=t,n=A("div","oc-sdk oc-sdk-search"),s=A("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=q("oc-sdk-search-clear");l.append(Ee("close",14)),l.tabIndex=-1,n.append(Ee("search",16,"oc-sdk-search-icon"),s,l),e.append(n);let a=()=>{let E=o.placeholder??"Search";Y(s,"placeholder",E),s.setAttribute("aria-label",o.label??E),l.setAttribute("aria-label","Clear search"),s.value!==o.value&&(s.value=o.value),n.dataset.active=o.value.trim()===""?"false":"true"},c=()=>{o.value!==""&&o.onChange(""),s.focus()},d=()=>{o.onChange(s.value)},p=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),c())};return s.addEventListener("input",d),s.addEventListener("keydown",p),l.addEventListener("click",c),a(),o.autofocus&&s.focus(),{update:E=>{o={...o,...E},a()},dispose:()=>{s.removeEventListener("input",d),s.removeEventListener("keydown",p),l.removeEventListener("click",c),n.remove()}}};var _e=(e,t="vertical")=>{let[o,n]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===n||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},fe=(e,t,o)=>{let n=e.filter(d=>!d.disabled);if(n.length===0)return null;let s=n[0],l=n[n.length-1];if(o==="first"||!s||!l)return s?.id??null;if(o==="last")return l.id;let a=n.findIndex(d=>d.id===t);return a===-1?o==="next"?s.id:l.id:n[Math.min(n.length-1,Math.max(0,a+(o==="next"?1:-1)))]?.id??null};var co=(e,t)=>{M(N);let o=t,n=A("div","oc-sdk oc-sdk-tabs");n.setAttribute("role","tablist"),e.append(n);let s=()=>{pe(n),n.dataset.track=o.trackBackground?"true":"false";for(let a of o.items){let c=q("oc-sdk-tab");c.setAttribute("role","tab");let d=a.id===o.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=a.id;let p=A("span");if(p.textContent=a.label,c.append(p),a.count!==void 0){let E=A("span","oc-sdk-tab-count");E.textContent=String(a.count),c.append(E)}c.addEventListener("click",()=>{a.id!==o.activeId&&o.onChange(a.id)}),n.append(c)}},l=a=>{let c=_e(a,"horizontal");if(!c)return;let d=fe(o.items,o.activeId,c);if(d&&d!==o.activeId){a.preventDefault(),o.onChange(d);let p=n.querySelector(`[data-id="${CSS.escape(d)}"]`);p instanceof HTMLElement&&p.focus()}};return n.addEventListener("keydown",l),s(),{update:a=>{o={...o,...a},s()},dispose:()=>{n.removeEventListener("keydown",l),n.remove()}}};var nt=(e,t)=>{Y(e,"data-tone",t&&t!=="neutral"?t:null)},lo=(e,t)=>{M(N);let o=t,n=A("span","oc-sdk oc-sdk-badge");e.append(n);let s=()=>{$(n,o.label),nt(n,o.tone)};return s(),{update:l=>{o={...o,...l},s()},dispose:()=>{n.remove()}}};var Es=0,uo=(e,t)=>{M(N);let o=t,n=`oc-sdk-list-${Es+=1}`,s=A("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,a=f=>`${n}-${f}`,c=f=>{l=f;for(let x of Array.from(s.children))x instanceof HTMLElement&&(x.dataset.active=x.id===a(f??"")?"true":"false");Y(s,"aria-activedescendant",f?a(f):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},d=(f,x)=>{let y=A("span",f);return y.textContent=x,y},p=()=>{if(pe(s),Y(s,"aria-label",o.ariaLabel),o.items.length===0){s.append(d("oc-sdk-list-empty",o.emptyText??"Nothing here")),c(null);return}for(let x of o.items){let y=q("oc-sdk-row");y.id=a(x.id),y.setAttribute("role","option"),y.setAttribute("aria-selected",x.id===o.selectedId?"true":"false"),y.disabled=!!x.disabled,y.tabIndex=-1,x.leading&&y.append(d("oc-sdk-row-lead",x.leading));let z=A("span","oc-sdk-row-main");if(z.append(d("oc-sdk-row-title",x.title)),x.subtitle&&z.append(d("oc-sdk-row-sub",x.subtitle)),y.append(z),x.badge){let W=d("oc-sdk-badge",x.badge.label);nt(W,x.badge.tone),y.append(W)}x.meta&&y.append(d("oc-sdk-row-meta",x.meta)),y.addEventListener("click",()=>o.onSelect(x.id)),s.append(y)}let f=o.items.some(x=>x.id===l&&!x.disabled);c(f?l:o.selectedId??null)},E=f=>{let x=_e(f);if(x){f.preventDefault(),c(fe(o.items,l,x));return}(f.key==="Enter"||f.key===" ")&&l&&(f.preventDefault(),o.onSelect(l))};return s.addEventListener("keydown",E),p(),{update:f=>{o={...o,...f},p()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var po=(e,t)=>{M(N);let o=t,n=A("div","oc-sdk oc-sdk-empty"),s=A("h2","oc-sdk-empty-title"),l=A("p","oc-sdk-empty-body"),a=A("div","oc-sdk-empty-action");n.append(s,l,a),e.append(n);let c=null,d=()=>{if($(s,o.title),$(l,o.body),l.hidden=!o.body,a.hidden=!o.action,!o.action){c?.dispose(),c=null;return}let p={label:o.action.label,onClick:o.action.onClick};c?c.update(p):c=se(a,{...p,variant:"outline",size:"sm"})};return d(),{update:p=>{o={...o,...p},d()},dispose:()=>{c?.dispose(),c=null,n.remove()}}};var Eo=(e,t={})=>{M(N);let o=t,n=A("span","oc-sdk oc-sdk-spinner");n.setAttribute("role","status");let s=A("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=A("span");n.append(s,l),e.append(n);let a=()=>{n.dataset.size=o.size??"default",$(l,o.label),l.hidden=!o.label,n.setAttribute("aria-label",o.label??"Loading")};return a(),{update:c=>{o={...o,...c},a()},dispose:()=>{n.remove()}}};var _o=(e,t)=>{M(N);let o=t,n=A("div","oc-sdk oc-sdk-banner"),s=A("div","oc-sdk-banner-text"),l=A("div","oc-sdk-banner-title"),a=A("div","oc-sdk-banner-body"),c=A("div","oc-sdk-banner-action");s.append(l,a),n.append(s,c),e.append(n);let d=null,p=()=>{if(n.dataset.tone=o.tone,n.setAttribute("role",o.tone==="error"||o.tone==="warning"?"alert":"status"),$(l,o.title),$(a,o.body),a.hidden=!o.body,c.hidden=!o.action,!o.action){d?.dispose(),d=null;return}let E={label:o.action.label,onClick:o.action.onClick};d?d.update(E):d=se(c,{...E,variant:"outline",size:"xs"})};return p(),{update:E=>{o={...o,...E},p()},dispose:()=>{d?.dispose(),d=null,n.remove()}}};var Yr=[];function ie(e){return Yr.push(e),e}function Zr(){for(let e of Yr.splice(0))try{e.dispose()}catch{}}var st=(e,t)=>ie(se(e,t));var en=(e,t)=>ie(ao(e,t));var tn=(e,t)=>ie(co(e,t)),gs=(e,t)=>ie(lo(e,t)),on=(e,t)=>ie(uo(e,t)),ke=(e,t)=>ie(po(e,t)),Rs=(e,t)=>ie(Eo(e,t)),rn=(e,t)=>ie(_o(e,t));function fo(e,t){let o=document.createElement("span"),n=ee(e,t);return gs(o,{label:n.label,tone:n.tone}),o}function So(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Rs(t,{label:e}),t}function nn(e){Qt(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Os(e){let t=5381;for(let o=0;o<e.length;o+=1)t=(t<<5)+t+e.charCodeAt(o)>>>0;return t.toString(36)}function sn(e){return`project:${Os(e)}`}function xs(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Le(e){return typeof e=="string"&&e.length>0?e:null}function As(e){if(!xs(e))return null;let t=Le(e.projectId),o=Le(e.projectName),n=Le(e.orgName),s=Le(e.directory);if(!t||!o||!n||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:o,orgName:n,slug:Le(e.slug),source:l,directory:s}}async function an(e,t){let o=As(await e.get(sn(t)));return!o||o.directory!==t?null:o}async function cn(e,t,o){await e.set(sn(t),{projectId:o.projectId,projectName:o.projectName,orgName:o.orgName,slug:o.slug,source:o.source,directory:t})}function ln(e,t,o){return{directory:e,link:t,repo:o,target:Fo(o,t.orgName,t.projectName)}}async function dn(e){try{let t=await e(".git/config"),o=Bo(t.content);return o?Vo(o):null}catch{return null}}async function un(e,t,o,n){let s=await an(t,o);if(s)return ln(o,s,await dn(n));let l=await dn(n);if(!l)return null;for(let a of Xo(l))try{let c=await e.findProjectBySlug(a);if(!c||!c.id)continue;return await cn(t,o,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:a,source:"detected"}),ln(o,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:a,source:"detected",directory:o},l)}catch{}return null}var ae=document.querySelector("#root");if(!ae)throw new Error("CircleCI picker is missing its #root element.");var at=Do(Mr),bs=V.storage,it=null,u={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],filter:"all",search:"",selectedRun:null,workflows:[],jobs:{},selectedWorkflowId:null,loading:!0,loadingDetail:!1,error:null,busy:!1},Se=0;async function pn(){if(X(),u.directory=u.ready?.directory??null,!u.connected){u.loading=!1,X();return}if(!u.directory){u.loading=!1,X();return}try{if(u.workspace=await un(at,bs,u.directory,Pr),!u.workspace){u.loading=!1,X();return}await En()}catch(e){u.loading=!1,u.error=Ae(e),qt(e)&&(u.connected=!1),X()}}async function En(){let e=u.workspace;if(!e)return;let t=++Se;u.loading=!0,u.error=null,X();try{let o=await at.listRuns(e.link.projectId);if(t!==Se)return;u.runs=o.items,u.loading=!1;let n=o.items.find(s=>te(s.outcome))??o.items.find(s=>ee(s.phase,s.outcome).active)??o.items[0];n?await _n(n):X()}catch(o){if(t!==Se)return;u.loading=!1,u.error=Ae(o),qt(o)&&(u.connected=!1),X()}}async function _n(e){let t=++Se;u.selectedRun=e,u.workflows=[],u.jobs={},u.selectedWorkflowId=null,u.loadingDetail=!0,X();try{let o=await at.listWorkflows(e.id);if(t!==Se)return;u.workflows=o.items;let n=await Promise.allSettled(o.items.map(l=>at.listJobs(l.id)));if(t!==Se)return;for(let[l,a]of n.entries()){let c=o.items[l];c&&(u.jobs[c.id]=a.status==="fulfilled"?a.value.items:[])}let s=o.items.find(l=>te(l.outcome));fn(s??o.items[0]??null)}catch(o){if(t!==Se)return;u.error=Ae(o)}u.loadingDetail=!1,X()}function fn(e){u.selectedWorkflowId=e?.id??null}function mo(){let e=u.workspace,t=u.selectedRun,o=u.workflows.find(l=>l.id===u.selectedWorkflowId)??null;if(!e||!t)return null;let n=o?u.jobs[o.id]??[]:[],s=o?n.find(l=>te(l.outcome))??null:null;return{workspace:e,run:t,workflow:o,job:s,jobs:n,detail:null,output:null}}async function ks(){let e=mo();if(e){u.busy=!0,X();try{await Dr(e),await V.close()}catch(t){u.busy=!1,u.error=Ae(t),X()}}}async function Is(){let e=mo();if(e){u.busy=!0,X();try{await Gr(e),await V.close()}catch(t){u.busy=!1,u.error=Ae(t),X()}}}function ys(){return Vr(u.runs,u.filter,u.search)}function X(){if(Zr(),it=null,Hr(ae),!u.connected){let t=I("div");ae?.append(t),ke(t,{title:"Connect CircleCI",body:"Add a personal API token on the CircleCI card in Settings \u2192 Integrations, then open this picker again.",action:{label:"Close",onClick:()=>void V.close()}});return}if(!u.directory){let t=I("div");ae?.append(t),ke(t,{title:"No project open",body:"Open a project in OpenChamber first.",action:{label:"Close",onClick:()=>void V.close()}});return}if(!u.workspace){let t=I("div");ae?.append(t),ke(t,{title:"Choose a CircleCI project",body:"Open the CircleCI panel once to choose which CircleCI project this repository maps to. This picker then shares that choice.",action:{label:"Close",onClick:()=>void V.close()}});return}if(u.error){let t=I("div");ae?.append(t),rn(t,{tone:"error",title:"CircleCI",body:u.error,action:{label:"Retry",onClick:()=>void En()}})}let e=I("div",{className:"picker-columns"});e.append(Cs()),e.append(ws()),ae?.append(e),ae?.append(vs())}function Cs(){let e=I("div",{className:"column"}),t=I("div"),o=tn(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:u.filter,onChange:p=>{u.filter=$r(p),o.update({activeId:u.filter}),it?.paint()}});e.append(t);let n=I("div");e.append(n);let s=I("div",{className:"scroll"});e.append(s);let l=()=>ys().map(p=>{let E=ee(p.phase,p.outcome);return{id:p.id,leading:`#${p.number}`,title:le(p),...p.commitSubject?{subtitle:p.commitSubject}:{},meta:ft(p.createdAt),badge:{label:E.label,tone:E.tone}}}),a=()=>u.runs.length===0?"No runs yet. Push a commit first.":"No run matches this filter.";if(u.loading&&u.runs.length===0)return s.append(So("Loading runs")),e;let c=on(s,{items:l(),emptyText:a(),selectedId:u.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:p=>{let E=u.runs.find(f=>f.id===p);E&&_n(E)}}),d=null;return d=en(n,{value:u.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:p=>{u.search=p,d?.update({value:p}),it?.paint()}}),it={tabs:o,paint:()=>c.update({items:l(),emptyText:a()})},e}function ws(){let e=I("div",{className:"column"}),t=u.selectedRun;if(!t){let s=I("div");return e.append(s),ke(s,{title:"Pick a run",body:"Choose a run on the left."}),e}let o=I("div",{className:"detail-head"});o.append(I("div",{className:"badge-line"},fo(t.phase,t.outcome))),o.append(I("div",{className:"detail-title"},`#${t.number} ${le(t)}`)),o.append(I("div",{className:"detail-sub"},[t.commitSubject??"",t.branch??t.tag??"",ft(t.createdAt)].filter(Boolean).join(" \xB7 "))),e.append(o);let n=I("div",{className:"scroll"});if(e.append(n),u.loadingDetail)return n.append(So("Loading workflows")),e;if(u.workflows.length===0){let s=I("div");return n.append(s),ke(s,{title:"No workflows",body:"This run produced no workflows."}),e}for(let s of u.workflows){let l=s.id===u.selectedWorkflowId,a=I("div",{className:l?"job-row job-row-active":"job-row"}),c=I("div",{className:"job-row-head"}),d=I("button",{className:"job-row-name",text:s.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});d.addEventListener("click",()=>{fn(s),X()}),c.append(d),c.append(I("span",{className:"job-row-meta"},$o(s.createdAt,s.endedAt))),c.append(fo(s.phase,s.outcome)),a.append(c);let p=u.jobs[s.id]??[],E=p.filter(f=>te(f.outcome));E.length>0?a.append(I("p",{className:"notice"},`Failing: ${E.map(f=>f.name).join(", ")}`)):p.length>0&&a.append(I("p",{className:"notice"},`${p.length} jobs`)),n.append(a)}return e}function vs(){let e=I("div",{className:"footer"}),t=mo(),o=u.workflows.find(a=>a.id===u.selectedWorkflowId)?.name;e.append(I("span",{className:"muted",style:"flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"},o?`Attaching ${o}`:"Pick a workflow"));let n=I("div");st(n,{label:"Close",size:"sm",variant:"ghost",onClick:()=>void V.close()}),e.append(n);let s=I("div");st(s,{label:"Start a chat",size:"sm",variant:"outline",disabled:!t||u.busy,onClick:()=>void Is()}),e.append(s);let l=I("div");return st(l,{label:"Attach",size:"sm",disabled:!t||u.busy,loading:u.busy,onClick:()=>void ks()}),e.append(l),e}V.onReady(e=>{nn(e),Fr(),u.ready=e,!u.booted&&(u.booted=!0,u.connected=e.connection.connected,pn())});V.onConnection(e=>{let t=u.connected;u.connected=e.connected,e.connected&&!t&&pn(),!e.connected&&t&&X()});})();
