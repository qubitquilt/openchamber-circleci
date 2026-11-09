"use strict";(()=>{var se=class extends Error{status;code;constructor(t,o,n){super(n),this.name="CircleCIError",this.status=t,this.code=o}},gn="/api/v3",Fe=20,Et=20,vo=50,Rn=50,Ne=4,Gs=Ne*Fe,Uo=[1e3,2500],h=e=>typeof e=="object"&&e!==null?e:{},le=e=>Array.isArray(e)?e:[],f=e=>typeof e=="string"&&e.length>0?e:null,Me=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Lo(e){return le(e).map(t=>{let o=h(t);return{type:f(o.type)??"unknown",message:f(o.message)??""}})}function Do(e){return le(e).map(t=>{let o=h(t);return{type:f(o.type)??"unknown",message:f(o.message)??"",description:f(o.description),url:f(o.url)}})}function Xe(e){let t=h(e),o=h(t.attributes),n=h(t.references),s=h(n.event),l=h(s.attributes),a=h(l.vcs),c=h(a.commit),d=h(n.pipeline),p=h(n.trigger),E=h(p.attributes);return{id:f(t.id)??"",number:Me(o.number)??0,phase:f(o.phase)??"unknown",outcome:f(o.current_outcome),createdAt:f(o.created_at)??"",branch:f(a.branch),tag:f(a.tag),revision:f(a.revision),commitSubject:f(c.subject),commitUrl:f(c.url),pipelineName:f(h(d.attributes).name),trigger:f(E.name)??f(h(E.event_source).type)??f(l.type),errors:Lo(o.errors),warnings:Do(o.warnings)}}function On(e){let t=h(e),o=h(t.attributes),n=h(o.auto_rerun);return{id:f(t.id)??"",name:f(o.name)??"Workflow",phase:f(o.phase)??"unknown",outcome:f(o.current_outcome)??f(o.outcome),createdAt:f(o.created_at),endedAt:f(o.ended_at),tag:f(o.tag),autoRerunNumber:Me(n.number)}}function ft(e){let t=h(e),o=h(t.attributes);return{id:f(t.id)??"",name:f(o.name)??"Job",number:Me(o.number)??0,type:f(o.type)??"build",phase:f(o.phase)??"unknown",outcome:f(o.outcome),startedAt:f(o.started_at),endedAt:f(o.ended_at)}}function xn(e){let t=h(e);return{num:Me(t.num)??0,name:f(t.name)??"Step",type:f(t.type)??"run",phase:f(t.phase)??"unknown",outcome:f(t.outcome),exitCode:Me(t.exit_code),command:f(t.command),startedAt:f(t.started_at),endedAt:f(t.ended_at)}}function An(e){let t=ft(e),o=h(h(e).attributes),n=le(o.parallel_executions).map(h),s=n.length>0?le(n[0]?.steps).map(xn):[];return{...t,errors:Lo(o.errors),warnings:Do(o.warnings),steps:s,parallelExecutions:n.length}}function No(e){let t=h(e),o=h(t.attributes),n=h(h(t.references).org);return{id:f(t.id)??"",name:f(o.name)??"Project",orgId:f(n.id)??"",orgName:f(h(n.attributes).name)??""}}function bn(e){let t=h(e),o=h(t.attributes);return{id:f(t.id)??"",name:f(o.name)??"Organization",vcsProvider:f(h(o.vcs).provider)}}function Mo(e){let t=h(e),o=h(t.attributes),n=h(o.config);return{id:f(t.id)??"",name:f(o.name)??"Pipeline",configPath:f(n.file_path)??""}}function kn(e){let t=h(e),o=h(t.attributes);return{id:f(t.id)??"",login:f(o.login)??"CircleCI account",name:f(o.name),avatarUrl:f(o.avatar_url)}}function In(e){if(!e)return;let t={};for(let[o,n]of Object.entries(e))n==null||n===""||(t[o]=String(n));return Object.keys(t).length>0?t:void 0}function Po(e){if(e)try{return JSON.parse(e)}catch{return}}function yn(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Cn(e,t,o){let n=h(h(t).error),s=f(n.detail)??f(n.title)??f(n.type)??yn(e);return new se(e,f(n.type)??`HTTP_${e}`,s)}function wn(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function vn(e){return new Promise(t=>setTimeout(t,e))}function Go(e){async function t(a,c){let d=In(a.query),p=0;for(;;){let E=await e({method:a.method,path:gn+a.path,...d?{query:d}:{},...a.body===void 0?{}:{body:JSON.stringify(a.body)}});if(E.status>=400){if(wn(E.status,a.method)&&p<Uo.length){await vn(Uo[p]??2500),p+=1;continue}throw Cn(E.status,Po(E.body),E.body)}return c(E.body)}}let o=a=>t(a,Po),n=a=>t(a,c=>c);async function s(a,c,d,p,E){let _=E?{...c,"page[cursor]":E}:{...c,"page[limit]":d},R;try{R=await o({method:"GET",path:a,query:_})}catch(y){if(!E&&y instanceof se&&y.status===400)R=await o({method:"GET",path:a,query:{...c}});else throw y}return{items:le(h(R).data).map(p),next:f(h(h(R).page).next)}}async function l(a,c,d,p,E){let _=[],R,y=null;for(let z=0;z<E;z+=1){let W=await s(a,c,d,p,R);if(_.push(...W.items),y=W.next,!y)break;R=y}return{items:_,next:y}}return{currentUser:async()=>{let a=await o({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=le(h(a).data)[0];if(!c)throw new se(200,"EMPTY_USER","CircleCI returned no user.");return kn(c)},listOrgs:async()=>(await l("/orgs",{},vo,bn,Ne)).items,findProjectBySlug:async a=>{let c=await o({method:"GET",path:"/projects",query:{"filter[slug]":a}}),d=le(h(c).data)[0];return d?No(d):null},listProjectsOfOrg:a=>l("/projects",{"filter[org_id]":a},vo,No,Ne),listPipelines:async a=>{let c=await l("/pipelines",{"filter[project_id]":a},Rn,Mo,1),d=[];for(let p of c.items)if(p.id)try{let E=await o({method:"GET",path:`/pipelines/${encodeURIComponent(p.id)}`,query:{"filter[project_id]":a}});d.push(Mo(h(E).data))}catch{d.push({...p,name:"Pipeline config"})}return d},listRuns:(a,c)=>s("/runs",{"filter[project_id]":a},Fe,Xe,c),listMyRuns:a=>s("/runs",{"filter[user_id]":"me"},Fe,Xe,a),getRun:async a=>{let c=await o({method:"GET",path:`/runs/${encodeURIComponent(a)}`});return Xe(h(c).data)},findRunByNumber:async(a,c)=>{let d;for(let p=0;p<Ne;p+=1){let E=await s("/runs",{"filter[project_id]":a},Fe,Xe,d),_=E.items.find(R=>R.number===c);if(_)return _;if(!E.next)return null;d=E.next}return null},fireRun:async a=>{let c=await o({method:"POST",path:"/runs",query:{"filter[project_id]":a.projectId},body:{data:{attributes:{checkout:{branch:a.branch}},references:{pipeline:{id:a.pipelineId}}}}}),d=f(h(h(c).data).id);if(!d)throw new se(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return d},listWorkflows:(a,c)=>s("/workflows",{"filter[run_id]":a},Et,On,c),listJobs:(a,c)=>c?s("/jobs",{"filter[workflow_id]":a},Et,ft,c):l("/jobs",{"filter[workflow_id]":a},Et,ft,Ne),getJob:async a=>{let c=await o({method:"GET",path:`/jobs/${encodeURIComponent(a)}`});return An(h(c).data)},condensedOutput:async(a,c,d=0)=>n({method:"GET",path:`/jobs/${encodeURIComponent(a)}/stdout/condensed`,query:{"filter[execution]":d,"filter[step_num]":c}}).then(p=>typeof p=="string"?p:""),rerunWorkflow:async(a,c)=>{let d=await o({method:"POST",path:`/workflows/${encodeURIComponent(a)}/rerun`,body:c?{is_from_failed:!0}:void 0});return f(h(h(d).data).id)??""},cancelWorkflow:async a=>{await o({method:"POST",path:`/workflows/${encodeURIComponent(a)}/cancel`})},approve:async a=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(a)}/approve`})},reject:async a=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(a)}/reject`})}}}var Ho=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Un={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function $o(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Nn(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function ee(e,t){let o=(t??"").toLowerCase(),n=(e??"").toLowerCase(),s=o||n,l=$o(o)??$o(n)??"neutral",a=o?!Ho.has(o):!Ho.has(n)&&n!=="ended";return{label:Un[s]??Nn(s),tone:l,active:a}}function te(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function Vo(e,t,o=Date.now()){if(!e)return"";let n=Date.parse(e);if(!Number.isFinite(n))return"";let s=t?Date.parse(t):o;if(!Number.isFinite(s)||s<n)return"";let l=Math.round((s-n)/1e3);if(l<60)return`${l}s`;let a=Math.floor(l/60),c=l%60;if(a<60)return c>0?`${a}m ${c}s`:`${a}m`;let d=Math.floor(a/60),p=a%60;return p>0?`${d}h ${p}m`:`${d}h`}function _t(e,t=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let n=Math.round((t-o)/1e3);if(n<45)return"just now";let s=Math.round(n/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let a=Math.round(l/24);return a<7?`${a}d ago`:new Date(o).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function je(e){return e?e.slice(0,8):""}function de(e){return e.branch??e.tag??"detached"}var Mn={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function Xo(e){let t=e.trim();if(!t)return null;let o=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);o&&!t.includes("://")&&(t=`https://${o[1]}/${o[2]}/${o[3]}`);let n;try{n=new URL(t)}catch{return null}let s=n.hostname.toLowerCase();if(!s)return null;let l=n.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let a=l[l.length-2]??"",c=l[l.length-1]??"";return!a||!c?null:{host:s,owner:a,repo:c}}function Fo(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function jo(e,t,o){return{segment:e&&Mn[e.host]||"github",owner:e?.owner??t,repo:e?.repo??o}}function Pn(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function St(e,t){return`${Pn(e)}/${t}`}function mt(e,t,o){return`${St(e,t)}/workflows/${o}`}function Bo(e,t,o,n){return`${mt(e,t,o)}/jobs/${n}`}function Ko(e){let t=null,o=null,n="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let a=/^\[([^\]]+)\]$/.exec(l);if(a){n=(a[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let d=(c[1]??"").trim();d&&(o===null&&(o=d),(/remote\s+"origin"/i.test(n)||/remote\s+'origin'/i.test(n))&&(t=d))}return t??o}var Wo="circleci",Ln=16e3,Dn=200,Tt=2e3;function zo(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function Re(e){return ee(e.phase,e.outcome).label.toLowerCase()}function Jo(e){let{workspace:t,run:o,workflow:n,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:o.id,runNumber:o.number,branch:o.branch,workflowId:n?.id??null,workflowName:n?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function qo(e){let t=e.workflow?.id??"run",o=e.job?.id??"";return`${e.run.id}:${t}:${o}`}function Qo(e){let{run:t,workflow:o,job:n}=e,s=n?.name??o?.name??`run #${t.number}`,l=Re(n?{phase:n.phase,outcome:n.outcome}:o||{phase:t.phase,outcome:t.outcome});return zo(`${s} ${l} in CircleCI run #${t.number}`,Dn)}function ht(e){let{workspace:t,run:o,workflow:n,job:s}=e;return n&&s&&s.number>0?Bo(t.target,o.number,n.id,s.number).slice(0,Tt):n?mt(t.target,o.number,n.id).slice(0,Tt):St(t.target,o.number).slice(0,Tt)}function Yo(e){let{workspace:t,run:o,workflow:n,job:s,jobs:l,detail:a,output:c}=e,d=[];d.push(`CircleCI run #${o.number} on ${t.link.orgName}/${t.link.projectName}`),d.push(`Status: ${Re({phase:o.phase,outcome:o.outcome})}`),o.pipelineName&&d.push(`Pipeline: ${o.pipelineName}`),d.push(`Ref: ${de(o)}${o.revision?` at ${je(o.revision)}`:""}`),o.commitSubject&&d.push(`Commit: ${o.commitSubject}`),d.push(`URL: ${ht(e)}`);let p=l.filter(E=>te(E.outcome));if(n){if(d.push(""),d.push(`Workflow ${n.name} (${Re(n)})`),p.length>0){d.push("Failing jobs:");for(let _ of p)d.push(`- ${_.name} (#${_.number})`)}let E=l.filter(_=>!p.includes(_));if(E.length>0){d.push("Other jobs:");for(let _ of E)d.push(`- ${_.name}: ${Re({phase:_.phase,outcome:_.outcome})}`)}}if(s&&a){if(d.push(""),d.push(`Job ${a.name} (#${a.number})`),a.errors.length>0){d.push("Errors:");for(let _ of a.errors)d.push(`- ${_.type}: ${_.message}`)}let E=a.steps.filter(_=>_.outcome==="failed");if(E.length>0){d.push("Failed steps:");for(let _ of E)d.push(`- step ${_.num} "${_.name}"${_.exitCode!==null?` (exit ${_.exitCode})`:""}`),_.command&&d.push(`  command: ${_.command}`)}}return c&&c.trim()&&(d.push(""),d.push("Condensed output:"),d.push(c.trim())),zo(d.join(`
`),Ln)}var b="openchamber.sdk";var Be="data-oc-scrolling",gt=`
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
`;function Rt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",n=>{let s=n.target===e?t:n.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=o.get(s);l!==void 0&&clearTimeout(l),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Gn=`(${Rt.toString()})(document);`;var or=/^[a-z][a-z0-9-]{0,39}$/;var Zo=e=>Object(e)===e&&!Array.isArray(e),Ot=(e,t)=>Object.keys(e).every(o=>t.includes(o)),er=e=>String(e)===e&&e.length>=1&&e.length<=60,tr=e=>String(e)===e&&e.length>=1&&e.length<=80,rr=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Zo(o)||!or.test(o.id)||!er(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!Ot(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!Ot(o,["kind","id","label","value","options","disabled"])||!tr(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let n=new Set;for(let s of o.options){if(!Zo(s)||!Ot(s,["value","label"])||!tr(s.value)||!er(s.label)||n.has(s.value))return!1;n.add(s.value)}if(!n.has(o.value))return!1}return!0};var nr=["{id}","{segment}","{segments+}"];var ei=new Set(nr);var sr=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var oi=new Set(sr);var xt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,ir=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var ar=/^[A-Za-z0-9_-]{1,80}$/;var cr=["left","right","top","bottom"];var lr=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let n=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of n)if(!lr(s,t+1,o))return!1;return!0},At=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(At);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(At)}return String(e)===e||Number.isFinite(e)},bt=e=>{try{return String(e.id)!==e.id||!ar.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!cr.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!lr(e.data)||!At(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var It=2e3;var ur=["file","directory","other","missing"],yt=e=>!!(e&&"sessionId"in e),Ct=e=>!!(e&&"sent"in e&&!("sessionId"in e));var pr=/^[0-9a-f]{7,64}$/i,wt=e=>pr.test(e),Ke=500,We=32e3,Er=16e3,fr=128,_r=200,Sr=2e3,mr=16e3,Tr=80,hr=200,gr=16e3;var Rr=2e3;var vt=2e4,ze=1024,Je=2e6;var qe=64e3,Qe=8e3,Ut=4e3;var Nt=96e4,$n=60*6e4;var Or=999,xr=1e4,Pe=500,Ar=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],br=["stopped","starting","ready","failed"],Vn=new Set(Ar),kr=e=>Vn.has(e),Ir=e=>e&&kr(e)?e:"HOST_REJECTED",Oe=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Oe):Object(e)===e?Object.values(e).every(Oe):!1,yr=e=>Oe(e)&&JSON.stringify(e).length<=gr,dr=e=>e?.trim().slice(0,hr)??"",xe=e=>{let t=e.id.trim().slice(0,fr),o=e.title.trim().slice(0,_r),n=e.url.trim().slice(0,Sr),s=e.text?.trim().slice(0,mr),l=e.author?.trim().slice(0,Tr),a=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:o||t,url:n,kind:a};if(s&&(c.text=s),l&&(c.author=l),a==="pull"){let d=dr(e.branches?.head),p=dr(e.branches?.base);d&&p&&(c.branches={head:d,base:p})}return yr(e.data)&&(c.data=e.data),c},Mt=e=>{let t=xe(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Pt=e=>{let t={text:e.text.trim().slice(0,Er)};return e.send&&(t.send=!0),t},Lt=e=>e===null||!Number.isFinite(e)?null:Math.min(Or,Math.max(0,Math.round(e))),Dt=e=>Number.isFinite(e)?Math.min(xr,Math.max(0,Math.ceil(e))):0;var Ae=e=>e.length>0&&e.length<=ze&&!e.includes("\0")&&!e.includes("\\");var Ye=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>Rr?!1:!e.split("/").some(o=>o==="."||o===".."),Xn=new Set(br),Gt=e=>!!(e&&"status"in e&&Xn.has(String(e.status))&&!("body"in e)),Ze=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Ht=e=>!!(e&&"content"in e&&String(e.content)===e.content),$t=e=>!!(e&&"written"in e&&e.written===!0),Vt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Fn=new Set(ur),Xt=e=>!!(e&&"kind"in e&&"size"in e&&Fn.has(String(e.kind))&&Number.isFinite(e.size)),Ft=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),jn=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Bn=e=>Object(e)===e?e:null,kt=e=>String(e)===e&&e.length>0,Kn=e=>{if(!kt(e.id))return null;if(e.ok===!0){let t={channel:b,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&kt(e.error)?{channel:b,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Ir(kt(e.code)?e.code:void 0)}:null},jt=e=>{let t=Bn(e);return!t||t.channel!==b||t.v!==1?null:t.type==="result"?Kn(t):!jn.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var Cr=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Wn=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",m=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},wr=()=>Promise.reject(new m("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),et=()=>Promise.reject(new m("BAD_PATH",`File path must be 1 to ${ze} characters without NUL or backslash.`)),tt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new m("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},x=e=>(e.value+=1,`oc-${e.value}`),Jt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new m("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(r=>r===t.parent),n=e.requestTimeoutMs??vt,s=new Set,l=new Set,a=new Set,c=new Set,d=new Set,p=new Set,E=new Set,_=new Set,R=new Set,y=new Set,z=new Set,W=new Set,ct=[],Ie=null,ye=null,De=new Set,Ge=new Set,Ce=null,we=null,lt=!1,Te=new Map,he=new Map,ge=new Map,Q=!1,O={value:0},g=null,Z=null,ve=!1,Ue=!1,ho=null,go=r=>r?{sessionId:r.id,phase:r.busy?"started":"completed"}:null,B=r=>{t.parent.postMessage(r,"*")},Ro=()=>{Q||t.parent===t||W.size===0||g?.features?.lateGenerateResults!==!0||B({channel:b,v:1,type:"generate-late-listen"})},M=(r,i)=>{for(let S of r)try{S(i)}catch(T){console.error(T)}},Oo=r=>{if(!(r instanceof MessageEvent)||!o(r.source))return;let i=jt(r.data);if(!i)return;if(i.type==="workspace"){let T=he.get(i.payload.subscriptionId);T&&M([T],i.payload.snapshot);return}if(i.type==="shells"){let T=ge.get(i.payload.subscriptionId);T&&M([T],i.payload.snapshot);return}if(i.type==="ready"){g=i.payload,Z=go(i.payload.session),M(s,i.payload),M(l,i.payload.directory),M(a,i.payload.session),Z&&M(c,Z),M(d,i.payload.connection),M(p,i.payload.settings),M(E,i.payload.item),i.payload.block&&M(_,i.payload.block),Ro();return}if(i.type==="service-event"){M(R,i.payload);return}if(i.type==="generate-late"){W.size===0?ct.push(i.payload):M(W,i.payload);return}if(i.type==="directory"){g&&(g={...g,directory:i.payload.directory}),M(l,i.payload.directory);return}if(i.type==="session"){g&&(g={...g,session:i.payload.session}),i.payload.session?Z?.sessionId!==i.payload.session.id&&(Z=go(i.payload.session)):Z=null,M(a,i.payload.session);return}if(i.type==="session-lifecycle"){Z=i.payload,M(c,i.payload);return}if(i.type==="connection"){g&&(g={...g,connection:i.payload.connection}),M(d,i.payload.connection);return}if(i.type==="settings"){g&&(g={...g,settings:i.payload.settings}),M(p,i.payload.settings);return}if(i.type==="item"){g&&(g={...g,item:i.payload.item}),M(E,i.payload.item);return}if(i.type==="status-control-event"){M(y,i.payload);return}if(i.type==="popover-closed"){M(z,i.payload);return}if(i.type==="action"){let T=C=>{Q||B({channel:b,v:1,type:"action-result",id:i.id,payload:C})},w=ye;if(!w){T({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>w(i.payload)).then(()=>T({ok:!0}),C=>{let H=(C instanceof Error?C.message:String(C)).trim();T({ok:!1,error:(H||"Action failed.").slice(0,Pe)})});return}if(i.type==="file-open"){let T=i.payload;if(we&&ir(we,T))return;we=T,M(De,i.payload);return}if(i.type==="file-saved"){M(Ge,i.payload.version);return}if(i.type==="file-snapshot"){let T=H=>{Q||B({channel:b,v:1,type:"file-snapshot-result",id:i.id,payload:H})},w=H=>T({error:(H.trim()||"Could not read the edited file.").slice(0,Pe)}),C=Ce;if(!C){w("This extension does not edit files.");return}Promise.resolve().then(()=>C(i.payload.purpose)).then(H=>{if(xt(H)>2e7){w(`The file is over ${2e7} ${"bytes"in H?"bytes":"characters"}.`);return}if(H.version.length>256){w(`The snapshot version is over ${256} characters.`);return}T({snapshot:"bytes"in H?{bytes:H.bytes,version:H.version}:{content:H.content,version:H.version}})},H=>w(H instanceof Error?H.message:String(H)));return}if(i.type==="resolve"){let T=C=>{B({channel:b,v:1,type:"resolve-result",id:i.id,payload:C})},w=Ie;if(!w){T({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>w(i.payload)).then(C=>T({item:C?xe(C):null}),C=>{let H=(C instanceof Error?C.message:String(C)).trim();T({error:(H||"Command failed.").slice(0,Pe)})});return}let S=Te.get(i.id);if(S){if(clearTimeout(S.timer),Te.delete(i.id),i.ok){S.resolve(i.payload);return}S.reject(new m(i.code,i.error))}};t.addEventListener("message",Oo),B({channel:b,v:1,type:"hello"});let F=(r,i=n)=>Q||t.parent===t?Promise.reject(new m("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((S,T)=>{let w=setTimeout(()=>{Te.delete(r.id),T(new m("HOST_TIMEOUT","Host did not answer in time."))},i);Te.set(r.id,{resolve:S,reject:T,timer:w}),B(r)}),D=r=>F(r).then(()=>{}),G={channel:b,v:1},dt=r=>{!Q&&t.parent!==t&&B(r)},xo=()=>dt({...G,type:"file-save"}),Ao=r=>{!Cr(r)||!Wn(r)||(r.preventDefault(),xo())},bo=r=>{!Cr(r)||r.key!=="Escape"||g?.surface!=="popover"||!g.popover||(r.preventDefault(),Co(g.popover.id,"escape").catch(()=>{}))},He=()=>{let r=g?.surface==="popover"?g.popover:void 0;if(!r)return;let i=ve||Ue;ho!==i&&(ho=i,wo(r.id,i).catch(()=>{}))},$e=()=>{g?.surface!=="popover"||ve||(ve=!0,He())},ko=r=>{g?.surface!=="popover"||r.relatedTarget!==null||!ve||(ve=!1,He())},Io=()=>{g?.surface!=="popover"||Ue||(Ue=!0,He())},yo=()=>{g?.surface!=="popover"||!Ue||(Ue=!1,He())},J=(r,i=1024)=>{if(!r.trim()||r.length>i)throw new m("HOST_REJECTED",`Identity must contain 1 to ${i} characters.`)},ut=async r=>{r.kind!=="projects"&&J(r.projectId);let i=await F({...G,type:"workspace-read",id:x(O),payload:r});if(!i||!("kind"in i)||!("state"in i)||i.kind!==r.kind)throw new m("HOST_REJECTED","Host did not return workspace data.");return i},pt=async(r,i)=>{r.kind!=="projects"&&J(r.projectId);let S=x(O);he.set(S,i);try{await D({...G,type:"workspace-subscribe",id:x(O),payload:{subscriptionId:S,query:r}})}catch(T){throw he.delete(S),Q||B({...G,type:"workspace-unsubscribe",id:x(O),payload:{subscriptionId:S}}),T}return()=>{!he.delete(S)||Q||B({...G,type:"workspace-unsubscribe",id:x(O),payload:{subscriptionId:S}})}},hn=async(r,i)=>{r.kind==="session"&&J(r.sessionId),r.kind==="project"&&J(r.projectId);let S=x(O);ge.set(S,i);try{await D({...G,type:"shells-subscribe",id:x(O),payload:{subscriptionId:S,scope:r}})}catch(T){throw ge.delete(S),Q||B({...G,type:"shells-unsubscribe",id:x(O),payload:{subscriptionId:S}}),T}return()=>{!ge.delete(S)||Q||B({...G,type:"shells-unsubscribe",id:x(O),payload:{subscriptionId:S}})}},Ve=async r=>{if("key"in r&&(r.key.length===0||r.key.length>128))throw new m("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(r.op==="set"&&!Oe(r.value))throw new m("HOST_REJECTED","Storage values must be JSON.");if(r.op==="set"&&new TextEncoder().encode(JSON.stringify(r.value)).length>65536)throw new m("HOST_REJECTED","Storage value exceeds 64 KiB.");if(r.scope==="device"&&g?.features?.deviceStorage!==!0)throw new m("UNSUPPORTED","This host does not support device storage.");let i=await F({...G,type:"storage",id:x(O),payload:r});if(!i||!("storage"in i)||i.op!==r.op)throw new m("HOST_REJECTED","Host did not return storage data.");return i},Co=(r,i)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===r)?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):D({...G,type:"popover-close",id:x(O),payload:i?{id:r,reason:i}:{id:r}}),wo=(r,i)=>g?.features?.popovers!==!0&&!(g?.surface==="popover"&&g.popover?.id===r)?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):D({...G,type:"popover-anchor",id:x(O),payload:{id:r,active:i}});return t.addEventListener("keydown",bo,!0),t.addEventListener("pointerover",$e),t.addEventListener("pointermove",$e),t.addEventListener("pointerout",ko),t.addEventListener("focus",Io),t.addEventListener("blur",yo),{onAction:r=>(ye=r,()=>{ye===r&&(ye=null)}),listProjects:async()=>{let r=await ut({kind:"projects"});if(r.kind!=="projects")throw new m("HOST_REJECTED","Expected projects.");return r},listWorktrees:async r=>{let i=await ut({kind:"worktrees",projectId:r});if(i.kind!=="worktrees")throw new m("HOST_REJECTED","Expected worktrees.");return i},listSessions:async r=>{let i=await ut({kind:"sessions",projectId:r});if(i.kind!=="sessions")throw new m("HOST_REJECTED","Expected sessions.");return i},onProjects:r=>pt({kind:"projects"},i=>{i.kind==="projects"&&r(i)}),onWorktrees:(r,i)=>pt({kind:"worktrees",projectId:r},S=>{S.kind==="worktrees"&&i(S)}),onSessions:(r,i)=>pt({kind:"sessions",projectId:r},S=>{S.kind==="sessions"&&i(S)}),onRunningShells:(r,i)=>hn(r,i),readShellOutput:async(r,i)=>{J(r,128);let S=i?.cursor;if(S!==void 0&&(!Number.isInteger(S)||S<0))throw new m("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let T=i?.tailBytes;if(T!==void 0&&(!Number.isInteger(T)||T<1||T>65536))throw new m("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let C=await F({...G,type:"shell-output",id:x(O),payload:{shellId:r,cursor:S,tailBytes:T}});if(!C||typeof C.output!="string"||!Number.isFinite(C.cursor))throw new m("HOST_REJECTED","Host did not return shell output.");return C},stopShell:async r=>{if(J(r,128),(await F({...G,type:"shell-stop",id:x(O),payload:{shellId:r}}))?.stopped!==!0)throw new m("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async r=>{J(r),await D({...G,type:"open-session",id:x(O),payload:{sessionId:r}})},storage:{get:async(r,i)=>{let S=tt(i),T={op:"get",key:r};S&&(T.scope=S);let w=await Ve(T);return w.op==="get"&&w.found?w.value:void 0},set:async(r,i,S)=>{let T=tt(S),w={op:"set",key:r,value:i};T&&(w.scope=T),await Ve(w)},delete:async(r,i)=>{let S=tt(i),T={op:"delete",key:r};S&&(T.scope=S),await Ve(T)},keys:async r=>{let i=tt(r),S={op:"keys"};i&&(S.scope=i);let T=await Ve(S);if(T.op!=="keys")throw new m("HOST_REJECTED","Expected storage keys.");return T.keys}},onReady:r=>(s.add(r),g&&r(g),()=>{s.delete(r)}),onDirectory:r=>(l.add(r),g&&r(g.directory),()=>{l.delete(r)}),onSession:r=>(a.add(r),g&&r(g.session),()=>{a.delete(r)}),onSessionLifecycle:r=>(c.add(r),Z&&r(Z),()=>{c.delete(r)}),onConnection:r=>(d.add(r),g&&r(g.connection),()=>{d.delete(r)}),onSettings:r=>(p.add(r),g&&r(g.settings),()=>{p.delete(r)}),onItem:r=>(E.add(r),g&&r(g.item),()=>{E.delete(r)}),onBlock:r=>(_.add(r),g?.block&&r(g.block),()=>{_.delete(r)}),onServiceEvent:r=>(R.add(r),()=>{R.delete(r)}),onStatusControl:r=>(y.add(r),()=>{y.delete(r)}),onPopoverClosed:r=>(z.add(r),()=>{z.delete(r)}),setStatusControls:r=>g?.features?.statusControls!==!0?Promise.reject(new m("UNSUPPORTED","This host does not support status controls.")):rr(r)?D({...G,type:"status-controls",id:x(O),payload:{controls:r}}):Promise.reject(new m("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:r=>g?.features?.popovers!==!0?Promise.reject(new m("UNSUPPORTED","This host does not support popovers.")):bt(r)?D({...G,type:"popover-open",id:x(O),payload:r}):Promise.reject(new m("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Co,setPopoverAnchorActive:wo,onResolve:r=>(Ie=r,()=>{Ie===r&&(Ie=null)}),toast:r=>{let i=r.message.trim();return!i||i.length>Ke?Promise.reject(new m("HOST_REJECTED",`Toast message must contain 1 to ${Ke} characters.`)):r.copy&&r.copy!==!0&&(!r.copy.text.length||r.copy.text.length>We)?Promise.reject(new m("HOST_REJECTED",`Toast copy text must contain 1 to ${We} characters.`)):D({channel:b,v:1,type:"toast",id:x(O),payload:{...r,message:i}})},openUrl:r=>D({channel:b,v:1,type:"open-url",id:x(O),payload:{url:r}}),openCommit:r=>wt(r)?D({channel:b,v:1,type:"open-commit",id:x(O),payload:{sha:r}}):Promise.reject(new m("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:r=>D({channel:b,v:1,type:"block-answer",id:x(O),payload:{text:r.trim().slice(0,It)}}),openSurface:r=>D({channel:b,v:1,type:"open-surface",id:x(O),payload:{surfaceId:r}}),writeClipboard:r=>D({channel:b,v:1,type:"clipboard-write",id:x(O),payload:{text:r}}),compose:r=>D({channel:b,v:1,type:"compose",id:x(O),payload:r}),attach:r=>D({channel:b,v:1,type:"attach",id:x(O),payload:xe(r)}),startSession:async r=>{r.projectId!==void 0&&J(r.projectId);let i=r.worktree;i&&i!==!0&&(i.kind==="existing"?J(i.directory):(i.name!==void 0&&J(i.name,200),i.baseBranch!==void 0&&J(i.baseBranch,200)));let S=await F({channel:b,v:1,type:"start-session",id:x(O),payload:Mt(r)},e.requestTimeoutMs??18e4);if(!yt(S))throw new m("HOST_REJECTED","Host did not return a session.");return S},prompt:r=>F({channel:b,v:1,type:"prompt",id:x(O),payload:Pt(r)}).then(i=>{if(!Ct(i))throw new m("HOST_REJECTED","Host did not return a prompt result.");return i}),sessionLink:r=>D({channel:b,v:1,type:"session-link",id:x(O),payload:xe(r)}),close:()=>D({channel:b,v:1,type:"close",id:x(O)}),oauthStart:()=>D({channel:b,v:1,type:"oauth-start",id:x(O)}),oauthDisconnect:()=>D({channel:b,v:1,type:"oauth-disconnect",id:x(O)}),request:r=>(Ye(r.path)?F({channel:b,v:1,type:"request",id:x(O),payload:r}):wr()).then(i=>{if(!Ze(i))throw new m("HOST_REJECTED","Host request result was empty.");return i}),serviceRequest:r=>(Ye(r.path)?F({channel:b,v:1,type:"service-request",id:x(O),payload:r}):wr()).then(i=>{if(!Ze(i))throw new m("HOST_REJECTED","Host service request result was empty.");return i}),serviceStatus:()=>F({channel:b,v:1,type:"service-status",id:x(O)}).then(r=>{if(!Gt(r))throw new m("HOST_REJECTED","Host did not return service status.");return r}),readFile:r=>(Ae(r)?F({channel:b,v:1,type:"file-read",id:x(O),payload:{path:r}}):et()).then(i=>{if(!Ht(i))throw new m("HOST_REJECTED","Host did not return file content.");return i}),writeFile:(r,i)=>Ae(r)?i.length>Je?Promise.reject(new m("FILE_TOO_LARGE",`Content is over ${Je} characters.`)):F({channel:b,v:1,type:"file-write",id:x(O),payload:{path:r,content:i}}).then(S=>{if(!$t(S))throw new m("HOST_REJECTED","Host did not confirm the write.");return S}):et(),listDir:r=>(Ae(r)?F({channel:b,v:1,type:"file-list",id:x(O),payload:{path:r}}):et()).then(i=>{if(!Vt(i))throw new m("HOST_REJECTED","Host did not return directory entries.");return i}),stat:r=>(Ae(r)?F({channel:b,v:1,type:"file-stat",id:x(O),payload:{path:r}}):et()).then(i=>{if(!Xt(i))throw new m("HOST_REJECTED","Host did not return file status.");return i}),generate:r=>{let i=r.prompt.trim(),S=r.system?.trim();if(i.length===0||i.length>qe)return Promise.reject(new m("HOST_REJECTED",`Prompt must be 1 to ${qe} characters.`));if(S!==void 0&&(S.length===0||S.length>Qe))return Promise.reject(new m("HOST_REJECTED",`System prompt must be 1 to ${Qe} characters.`));let T=r.maxOutputTokens===void 0?void 0:Math.min(Ut,Math.max(1,Math.floor(r.maxOutputTokens)));if(T!==void 0&&!Number.isFinite(T))return Promise.reject(new m("HOST_REJECTED","maxOutputTokens must be a number."));let w={prompt:i};return S!==void 0&&(w.system=S),T!==void 0&&(w.maxOutputTokens=T),F({channel:b,v:1,type:"generate",id:x(O),payload:w},e.requestTimeoutMs??Nt).then(C=>{if(!Ft(C))throw new m("HOST_REJECTED","Host did not return generated text.");return C})},onLateGenerateResult:r=>{W.add(r);for(let i of ct.splice(0))M([r],i);return Ro(),()=>{W.delete(r)}},setBadge:r=>D({channel:b,v:1,type:"badge",id:x(O),payload:{count:Lt(r)}}),setHeight:r=>D({channel:b,v:1,type:"resize",id:x(O),payload:{height:Dt(r)}}),onFileOpen:r=>(De.add(r),lt||(lt=!0,t.addEventListener("keydown",Ao,!0)),we&&r(we),()=>{De.delete(r)}),onFileSnapshot:r=>(Ce=r,()=>{Ce===r&&(Ce=null)}),onFileSaved:r=>(Ge.add(r),()=>{Ge.delete(r)}),reportFileChange:r=>dt({...G,type:"file-change",payload:{dirty:r.dirty,edited:r.edited}}),requestFileSave:xo,reportFileUnsupported:()=>dt({...G,type:"file-unsupported"}),dispose:()=>{for(let r of he.keys())B({...G,type:"workspace-unsubscribe",id:x(O),payload:{subscriptionId:r}});he.clear();for(let r of ge.keys())B({...G,type:"shells-unsubscribe",id:x(O),payload:{subscriptionId:r}});ge.clear(),Q=!0,Ie=null,ye=null,Ce=null,De.clear(),Ge.clear(),lt&&t.removeEventListener("keydown",Ao,!0),t.removeEventListener("message",Oo),t.removeEventListener("keydown",bo,!0),t.removeEventListener("pointerover",$e),t.removeEventListener("pointermove",$e),t.removeEventListener("pointerout",ko),t.removeEventListener("focus",Io),t.removeEventListener("blur",yo);for(let r of Te.values())clearTimeout(r.timer),r.reject(new m("HOST_UNAVAILABLE","Host client was disposed."));Te.clear(),s.clear(),l.clear(),a.clear(),c.clear(),d.clear(),p.clear(),E.clear(),_.clear(),R.clear(),y.clear(),z.clear(),W.clear(),ct.length=0}}};var Nr=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var mi=new Set(Nr);var zn=10*6e4;var Jn=10*6e4;var qn=10*6e4;var Qn=10*6e4;var Mr=["none","agent","user"];var hi=new Set(Mr);var $=Jt(),Pr=async e=>$.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});function Lr(e){return $.readFile(e)}function Dr(e){return{providerId:Wo,id:qo(e).slice(0,128),title:Qo(e),url:ht(e),kind:"issue",text:Yo(e),data:Jo(e)}}async function Gr(e){await $.attach(Dr(e))}async function Hr(e,t={}){await $.startSession({...Dr(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}function I(e,t={},...o){let n=document.createElement(e);t.className&&(n.className=t.className),t.text!==void 0&&(n.textContent=t.text),t.title&&(n.title=t.title),t.style&&n.setAttribute("style",t.style),t.role&&n.setAttribute("role",t.role),t.ariaLabel&&n.setAttribute("aria-label",t.ariaLabel);for(let s of o)s==null||s===!1||n.append(typeof s=="string"?document.createTextNode(s):s);return n}function $r(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var Yn={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function ue(e){return e instanceof se?e.message:e instanceof m?Yn[e.code]??e.message:e instanceof Error?e.message:String(e)}function Zn(e){return e instanceof m?e.code:null}function qt(e){let t=Zn(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}var es=["all","failed","running"];function Vr(e){return es.includes(e)?e:"all"}function ts(e){return[`#${e.number}`,de(e),je(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function os(e,t,o=""){if(t==="failed"&&!te(e.outcome)||t==="running"&&!ee(e.phase,e.outcome).active)return!1;let n=o.trim().toLowerCase();return n===""||ts(e).includes(n)}function Xr(e,t,o=""){return e.filter(n=>os(n,t,o))}var rs=`
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
`,Fr="circleci-shared-style";function jr(){if(document.getElementById(Fr))return;let e=document.createElement("style");e.id=Fr,e.textContent=rs,document.head.append(e)}var ns=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],ss=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Br=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,n]of ns)t.style.setProperty(o,e.tokens[n]);for(let[o,n,s]of ss){let l=e.tokens[s]??"";t.style.setProperty(o,l),t.style.setProperty(n,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Qt=(e,t)=>{Br(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var is={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},v=(e,t)=>`var(--${e}, var(--oc-${is[e]}, ${t}))`,re=v("surface-background","transparent"),rt=v("surface-elevated","transparent"),be=v("surface-elevated-foreground","inherit"),K=v("surface-foreground","inherit"),P=v("surface-muted-foreground","gray"),as=v("surface-muted","transparent"),pe=v("interactive-border","currentColor"),j=v("interactive-hover","transparent"),Ee=v("interactive-active","transparent"),Yt=v("interactive-selection","transparent"),Zt=v("interactive-selection-foreground","inherit"),oe=v("primary","currentColor"),eo=v("primary-text","inherit"),to=v("error-text","inherit"),cs=v("font-sans","inherit"),oo=v("font-mono","monospace"),Jr=v("radius","9px"),ro=`calc(${Jr} - 2px)`,Kr=`calc(${Jr} - 4px)`,L=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Wr=`background-image: linear-gradient(${j}, ${j});`,no=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,so="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",zr="box-shadow: var(--oc-sdk-lit);",io=`inset 0 0.5px 0 0 ${L(K,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,ls=`
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
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${v(`${e}-text`,"inherit")}; }`},ds=`
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
`,qr=`${ls}
.oc-sdk { color: ${K}; font-family: ${cs}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Wr} }
.oc-sdk-mono { font-family: ${oo}; }
.oc-sdk-muted { color: ${P}; }
${ot("success")}${ot("warning")}${ot("error")}${ot("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${oe}; --oc-sdk-tone-text: ${eo}; }

.oc-sdk-btn { border-radius: ${ro}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Kr}; }
.oc-sdk-btn[data-variant="default"] { color: ${eo}; background: ${L(oe,10,re)}; border-color: ${L(oe,12)}; ${zr} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${L(oe,16,re)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${L(oe,22,re)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${as}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Ee}, ${Ee}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${be}; ${so} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Ee}, ${Ee}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${j}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Ee}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error","red")}; color: ${to}; background: ${L("var(--oc-sdk-tone)",7,re)}; border-color: ${L("var(--oc-sdk-tone)",12)}; ${zr} }
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
.oc-sdk-search-clear { border-radius: ${Kr}; color: ${P}; }
.oc-sdk-search-clear:hover { background: ${j}; color: ${K}; }

.oc-sdk-trigger { border-radius: ${ro}; background: var(--oc-sdk-raised-bg); color: ${be}; ${so} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Ee}, ${Ee}); }
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
.oc-sdk-check-box { border-color: ${pe}; border-radius: 4px; color: ${K}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${L(K,60,pe)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${pe}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${re}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${oe}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Wr} }
.oc-sdk-check-desc { color: ${P}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${L(K,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${P}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${K}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Zt}; background: ${Yt}; border-color: ${pe}; }
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
.oc-sdk-spinner-ring { border-color: ${pe}; border-top-color: ${oe}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${L("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${P}; }

.oc-sdk-separator { color: ${P}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${L(pe,40)}; }

.oc-sdk-progress-label { color: ${P}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${L(K,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${oe}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${v("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${v("success-text","inherit")}; }

.oc-sdk-text a { color: ${eo}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${L(pe,60)}; }
`,U=`
${gt}
${ds}
${qr}`;var Qr="oc-sdk-ui-style",ie=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},N=e=>{let t=document.getElementById(Qr);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}Rt(document);let o=document.createElement("style");o.id=Qr,o.textContent=e,document.head.appendChild(o)},A=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},q=e=>{let t=A("button",e);return t.type="button",t},V=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},Y=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)};var us=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},ae=(e,t)=>{N(U);let o=t,n=q("oc-sdk oc-sdk-btn"),s=us(),l=document.createElement("span");n.append(l),e.append(n);let a=()=>{n.dataset.variant=o.variant??"default",n.dataset.size=o.size??"default",n.disabled=!!o.disabled||!!o.loading,n.dataset.loading=o.loading?"true":"false",n.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==n?n.prepend(s):!o.loading&&s.parentNode===n&&s.remove(),V(l,o.label)},c=()=>{o.disabled||o.loading||o.onClick()};return n.addEventListener("click",c),a(),{update:d=>{o={...o,...d},a()},dispose:()=>{n.removeEventListener("click",c),n.remove()}}};var Yr="http://www.w3.org/2000/svg",ps={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},fe=(e,t,o)=>{let n=document.createElementNS(Yr,"svg");n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("aria-hidden","true"),n.setAttribute("fill","currentColor"),o&&n.setAttribute("class",o);let s=document.createElementNS(Yr,"path");return s.setAttribute("d",ps[e]),n.append(s),n};var ao=(e,t)=>{N(U);let o=t,n=A("div","oc-sdk oc-sdk-search"),s=A("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=q("oc-sdk-search-clear");l.append(fe("close",14)),l.tabIndex=-1,n.append(fe("search",16,"oc-sdk-search-icon"),s,l),e.append(n);let a=()=>{let E=o.placeholder??"Search";Y(s,"placeholder",E),s.setAttribute("aria-label",o.label??E),l.setAttribute("aria-label","Clear search"),s.value!==o.value&&(s.value=o.value),n.dataset.active=o.value.trim()===""?"false":"true"},c=()=>{o.value!==""&&o.onChange(""),s.focus()},d=()=>{o.onChange(s.value)},p=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),c())};return s.addEventListener("input",d),s.addEventListener("keydown",p),l.addEventListener("click",c),a(),o.autofocus&&s.focus(),{update:E=>{o={...o,...E},a()},dispose:()=>{s.removeEventListener("input",d),s.removeEventListener("keydown",p),l.removeEventListener("click",c),n.remove()}}};var _e=(e,t="vertical")=>{let[o,n]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===n||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},Se=(e,t,o)=>{let n=e.filter(d=>!d.disabled);if(n.length===0)return null;let s=n[0],l=n[n.length-1];if(o==="first"||!s||!l)return s?.id??null;if(o==="last")return l.id;let a=n.findIndex(d=>d.id===t);return a===-1?o==="next"?s.id:l.id:n[Math.min(n.length-1,Math.max(0,a+(o==="next"?1:-1)))]?.id??null};var co=(e,t)=>{N(U);let o=t,n=A("div","oc-sdk oc-sdk-tabs");n.setAttribute("role","tablist"),e.append(n);let s=()=>{ie(n),n.dataset.track=o.trackBackground?"true":"false";for(let a of o.items){let c=q("oc-sdk-tab");c.setAttribute("role","tab");let d=a.id===o.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=a.id;let p=A("span");if(p.textContent=a.label,c.append(p),a.count!==void 0){let E=A("span","oc-sdk-tab-count");E.textContent=String(a.count),c.append(E)}c.addEventListener("click",()=>{a.id!==o.activeId&&o.onChange(a.id)}),n.append(c)}},l=a=>{let c=_e(a,"horizontal");if(!c)return;let d=Se(o.items,o.activeId,c);if(d&&d!==o.activeId){a.preventDefault(),o.onChange(d);let p=n.querySelector(`[data-id="${CSS.escape(d)}"]`);p instanceof HTMLElement&&p.focus()}};return n.addEventListener("keydown",l),s(),{update:a=>{o={...o,...a},s()},dispose:()=>{n.removeEventListener("keydown",l),n.remove()}}};var nt=(e,t)=>{Y(e,"data-tone",t&&t!=="neutral"?t:null)},lo=(e,t)=>{N(U);let o=t,n=A("span","oc-sdk oc-sdk-badge");e.append(n);let s=()=>{V(n,o.label),nt(n,o.tone)};return s(),{update:l=>{o={...o,...l},s()},dispose:()=>{n.remove()}}};var Ss=0,uo=(e,t)=>{N(U);let o=t,n=`oc-sdk-list-${Ss+=1}`,s=A("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,a=_=>`${n}-${_}`,c=_=>{l=_;for(let R of Array.from(s.children))R instanceof HTMLElement&&(R.dataset.active=R.id===a(_??"")?"true":"false");Y(s,"aria-activedescendant",_?a(_):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},d=(_,R)=>{let y=A("span",_);return y.textContent=R,y},p=()=>{if(ie(s),Y(s,"aria-label",o.ariaLabel),o.items.length===0){s.append(d("oc-sdk-list-empty",o.emptyText??"Nothing here")),c(null);return}for(let R of o.items){let y=q("oc-sdk-row");y.id=a(R.id),y.setAttribute("role","option"),y.setAttribute("aria-selected",R.id===o.selectedId?"true":"false"),y.disabled=!!R.disabled,y.tabIndex=-1,R.leading&&y.append(d("oc-sdk-row-lead",R.leading));let z=A("span","oc-sdk-row-main");if(z.append(d("oc-sdk-row-title",R.title)),R.subtitle&&z.append(d("oc-sdk-row-sub",R.subtitle)),y.append(z),R.badge){let W=d("oc-sdk-badge",R.badge.label);nt(W,R.badge.tone),y.append(W)}R.meta&&y.append(d("oc-sdk-row-meta",R.meta)),y.addEventListener("click",()=>o.onSelect(R.id)),s.append(y)}let _=o.items.some(R=>R.id===l&&!R.disabled);c(_?l:o.selectedId??null)},E=_=>{let R=_e(_);if(R){_.preventDefault(),c(Se(o.items,l,R));return}(_.key==="Enter"||_.key===" ")&&l&&(_.preventDefault(),o.onSelect(l))};return s.addEventListener("keydown",E),p(),{update:_=>{o={...o,..._},p()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var po=(e,t)=>{N(U);let o=t,n=A("div","oc-sdk oc-sdk-empty"),s=A("h2","oc-sdk-empty-title"),l=A("p","oc-sdk-empty-body"),a=A("div","oc-sdk-empty-action");n.append(s,l,a),e.append(n);let c=null,d=()=>{if(V(s,o.title),V(l,o.body),l.hidden=!o.body,a.hidden=!o.action,!o.action){c?.dispose(),c=null;return}let p={label:o.action.label,onClick:o.action.onClick};c?c.update(p):c=ae(a,{...p,variant:"outline",size:"sm"})};return d(),{update:p=>{o={...o,...p},d()},dispose:()=>{c?.dispose(),c=null,n.remove()}}};var Eo=(e,t={})=>{N(U);let o=t,n=A("span","oc-sdk oc-sdk-spinner");n.setAttribute("role","status");let s=A("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=A("span");n.append(s,l),e.append(n);let a=()=>{n.dataset.size=o.size??"default",V(l,o.label),l.hidden=!o.label,n.setAttribute("aria-label",o.label??"Loading")};return a(),{update:c=>{o={...o,...c},a()},dispose:()=>{n.remove()}}};var fo=(e,t)=>{N(U);let o=t,n=A("div","oc-sdk oc-sdk-banner"),s=A("div","oc-sdk-banner-text"),l=A("div","oc-sdk-banner-title"),a=A("div","oc-sdk-banner-body"),c=A("div","oc-sdk-banner-action");s.append(l,a),n.append(s,c),e.append(n);let d=null,p=()=>{if(n.dataset.tone=o.tone,n.setAttribute("role",o.tone==="error"||o.tone==="warning"?"alert":"status"),V(l,o.title),V(a,o.body),a.hidden=!o.body,c.hidden=!o.action,!o.action){d?.dispose(),d=null;return}let E={label:o.action.label,onClick:o.action.onClick};d?d.update(E):d=ae(c,{...E,variant:"outline",size:"xs"})};return p(),{update:E=>{o={...o,...E},p()},dispose:()=>{d?.dispose(),d=null,n.remove()}}};var ms=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,Ts=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},Zr=e=>{let t=[],o=0;for(let n of e.matchAll(ms)){let s=n.index??0;s>o&&t.push({kind:"text",text:e.slice(o,s)});let l=n[1]??"",a=(n[2]??"").trim(),c=n[3]??"";Ts(c)?l==="!"?t.push({kind:"image",src:c,alt:a}):t.push({kind:"link",href:c,label:a||c}):t.push({kind:"text",text:n[0]}),o=s+n[0].length}return o<e.length&&t.push({kind:"text",text:e.slice(o)}),t},_o=(e,t)=>{N(U);let o=t,n=A("div","oc-sdk oc-sdk-text");e.append(n);let s=a=>{!(a.target instanceof HTMLAnchorElement)||!o.onOpenUrl||(a.preventDefault(),o.onOpenUrl(a.target.href))},l=()=>{ie(n);for(let a of Zr(o.text))if(a.kind==="text")n.append(document.createTextNode(a.text));else if(a.kind==="link"){let c=A("a");c.href=a.href,c.rel="noopener noreferrer",c.target="_blank",c.textContent=a.label,n.append(c)}else{let c=A("img");c.src=a.src,c.alt=a.alt,c.loading="lazy",c.referrerPolicy="no-referrer",n.append(c)}};return n.addEventListener("click",s),l(),{update:a=>{o={...o,...a},l()},dispose:()=>{n.removeEventListener("click",s),n.remove()}}};var en=[];function ne(e){return en.push(e),e}function tn(){for(let e of en.splice(0))try{e.dispose()}catch{}}var st=(e,t)=>ne(ae(e,t));var on=(e,t)=>ne(ao(e,t));var rn=(e,t)=>ne(co(e,t)),As=(e,t)=>ne(lo(e,t)),nn=(e,t)=>ne(uo(e,t)),ke=(e,t)=>ne(po(e,t)),bs=(e,t)=>ne(Eo(e,t)),sn=(e,t)=>ne(fo(e,t));var ks=(e,t)=>ne(_o(e,t));function an(e,t="notice"){let o=document.createElement("div");return o.className=t,ks(o,{text:e,onOpenUrl:Is}),o}function So(e,t){let o=document.createElement("span"),n=ee(e,t);return As(o,{label:n.label,tone:n.tone}),o}function mo(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),bs(t,{label:e}),t}function cn(e){Qt(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Is(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}$.openUrl(e).catch(()=>{})}}function ys(e){let t=5381;for(let o=0;o<e.length;o+=1)t=(t<<5)+t+e.charCodeAt(o)>>>0;return t.toString(36)}function ln(e){return`project:${ys(e)}`}function Cs(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Le(e){return typeof e=="string"&&e.length>0?e:null}function ws(e){if(!Cs(e))return null;let t=Le(e.projectId),o=Le(e.projectName),n=Le(e.orgName),s=Le(e.directory);if(!t||!o||!n||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:o,orgName:n,slug:Le(e.slug),source:l,directory:s}}async function dn(e,t){let o=ws(await e.get(ln(t)));return!o||o.directory!==t?null:o}async function un(e,t,o){await e.set(ln(t),{projectId:o.projectId,projectName:o.projectName,orgName:o.orgName,slug:o.slug,source:o.source,directory:t})}function pn(e,t,o){return{directory:e,link:t,repo:o,target:jo(o,t.orgName,t.projectName)}}async function En(e){try{let t=await e(".git/config"),o=Ko(t.content);return o?Xo(o):null}catch{return null}}async function fn(e,t,o,n){let s=await dn(t,o);if(s)return pn(o,s,await En(n));let l=await En(n);if(!l)return null;for(let a of Fo(l))try{let c=await e.findProjectBySlug(a);if(!c||!c.id)continue;return await un(t,o,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:a,source:"detected"}),pn(o,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:a,source:"detected",directory:o},l)}catch{}return null}var ce=document.querySelector("#root");if(!ce)throw new Error("CircleCI picker is missing its #root element.");var at=Go(Pr),vs=$.storage,it=null,u={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],filter:"all",search:"",selectedRun:null,workflows:[],jobs:{},jobErrors:{},selectedWorkflowId:null,loading:!0,loadingDetail:!1,error:null,busy:!1},me=0;async function _n(){if(X(),u.directory=u.ready?.directory??null,!u.connected){u.loading=!1,X();return}if(!u.directory){u.loading=!1,X();return}try{if(u.workspace=await fn(at,vs,u.directory,Lr),!u.workspace){u.loading=!1,X();return}await Sn()}catch(e){u.loading=!1,u.error=ue(e),qt(e)&&(u.connected=!1),X()}}async function Sn(){let e=u.workspace;if(!e)return;let t=++me;u.loading=!0,u.error=null,X();try{let o=await at.listRuns(e.link.projectId);if(t!==me)return;u.runs=o.items,u.loading=!1;let n=o.items.find(s=>te(s.outcome))??o.items.find(s=>ee(s.phase,s.outcome).active)??o.items[0];n?await mn(n):X()}catch(o){if(t!==me)return;u.loading=!1,u.error=ue(o),qt(o)&&(u.connected=!1),X()}}async function mn(e){let t=++me;u.selectedRun=e,u.workflows=[],u.jobs={},u.selectedWorkflowId=null,u.loadingDetail=!0,X();try{let o=await at.listWorkflows(e.id);if(t!==me)return;u.workflows=o.items,u.jobErrors={};let n=await Promise.allSettled(o.items.map(l=>at.listJobs(l.id)));if(t!==me)return;for(let[l,a]of n.entries()){let c=o.items[l];c&&(a.status==="fulfilled"?u.jobs[c.id]=a.value.items:(u.jobs[c.id]=[],u.jobErrors[c.id]=ue(a.reason)))}let s=o.items.find(l=>te(l.outcome));Tn(s??o.items[0]??null)}catch(o){if(t!==me)return;u.error=ue(o)}u.loadingDetail=!1,X()}function Tn(e){u.selectedWorkflowId=e?.id??null}function To(){let e=u.workspace,t=u.selectedRun,o=u.workflows.find(l=>l.id===u.selectedWorkflowId)??null;if(!e||!t)return null;let n=o?u.jobs[o.id]??[]:[],s=o?n.find(l=>te(l.outcome))??null:null;return{workspace:e,run:t,workflow:o,job:s,jobs:n,detail:null,output:null}}async function Us(){let e=To();if(e){u.busy=!0,X();try{await Gr(e),await $.close()}catch(t){u.busy=!1,u.error=ue(t),X()}}}async function Ns(){let e=To();if(e){u.busy=!0,X();try{await Hr(e),await $.close()}catch(t){u.busy=!1,u.error=ue(t),X()}}}function Ms(){return Xr(u.runs,u.filter,u.search)}function X(){if(tn(),it=null,$r(ce),!u.connected){let t=I("div");ce?.append(t),ke(t,{title:"Connect CircleCI",body:"Add a personal API token on the CircleCI card in Settings \u2192 Integrations, then open this picker again.",action:{label:"Close",onClick:()=>void $.close()}});return}if(!u.directory){let t=I("div");ce?.append(t),ke(t,{title:"No project open",body:"Open a project in OpenChamber first.",action:{label:"Close",onClick:()=>void $.close()}});return}if(!u.workspace){let t=I("div");ce?.append(t),ke(t,{title:"Choose a CircleCI project",body:"Open the CircleCI panel once to choose which CircleCI project this repository maps to. This picker then shares that choice.",action:{label:"Close",onClick:()=>void $.close()}});return}if(u.error){let t=I("div");ce?.append(t),sn(t,{tone:"error",title:"CircleCI",body:u.error,action:{label:"Retry",onClick:()=>void Sn()}})}let e=I("div",{className:"picker-columns"});e.append(Ps()),e.append(Ls()),ce?.append(e),ce?.append(Ds())}function Ps(){let e=I("div",{className:"column"}),t=I("div"),o=rn(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:u.filter,onChange:p=>{u.filter=Vr(p),o.update({activeId:u.filter}),it?.paint()}});e.append(t);let n=I("div");e.append(n);let s=I("div",{className:"scroll"});e.append(s);let l=()=>Ms().map(p=>{let E=ee(p.phase,p.outcome);return{id:p.id,leading:`#${p.number}`,title:de(p),...p.commitSubject?{subtitle:p.commitSubject}:{},meta:_t(p.createdAt),badge:{label:E.label,tone:E.tone}}}),a=()=>u.runs.length===0?"No runs yet. Push a commit first.":"No run matches this filter.";if(u.loading&&u.runs.length===0)return s.append(mo("Loading runs")),e;let c=nn(s,{items:l(),emptyText:a(),selectedId:u.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:p=>{let E=u.runs.find(_=>_.id===p);E&&mn(E)}}),d=null;return d=on(n,{value:u.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:p=>{u.search=p,d?.update({value:p}),it?.paint()}}),it={tabs:o,paint:()=>c.update({items:l(),emptyText:a()})},e}function Ls(){let e=I("div",{className:"column"}),t=u.selectedRun;if(!t){let s=I("div");return e.append(s),ke(s,{title:"Pick a run",body:"Choose a run on the left."}),e}let o=I("div",{className:"detail-head"});o.append(I("div",{className:"badge-line"},So(t.phase,t.outcome))),o.append(I("div",{className:"detail-title"},`#${t.number} ${de(t)}`)),o.append(I("div",{className:"detail-sub"},[t.commitSubject??"",t.branch??t.tag??"",_t(t.createdAt)].filter(Boolean).join(" \xB7 "))),e.append(o);let n=I("div",{className:"scroll"});if(e.append(n),u.loadingDetail)return n.append(mo("Loading workflows")),e;if(u.workflows.length===0){let s=I("div");return n.append(s),ke(s,{title:"No workflows",body:"This run produced no workflows."}),e}for(let s of u.workflows){let l=s.id===u.selectedWorkflowId,a=I("div",{className:l?"job-row job-row-active":"job-row"}),c=I("div",{className:"job-row-head"}),d=I("button",{className:"job-row-name",text:s.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});d.addEventListener("click",()=>{Tn(s),X()}),c.append(d),c.append(I("span",{className:"job-row-meta"},Vo(s.createdAt,s.endedAt))),c.append(So(s.phase,s.outcome)),a.append(c);let p=u.jobs[s.id]??[],E=p.filter(R=>te(R.outcome)),_=u.jobErrors[s.id];_?a.append(an(`Could not list this workflow's jobs: ${_}`,"notice error-text")):E.length>0?a.append(I("p",{className:"notice"},`Failing: ${E.map(R=>R.name).join(", ")}`)):p.length>0&&a.append(I("p",{className:"notice"},`${p.length} jobs`)),n.append(a)}return e}function Ds(){let e=I("div",{className:"footer"}),t=To(),o=u.workflows.find(a=>a.id===u.selectedWorkflowId)?.name;e.append(I("span",{className:"muted",style:"flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"},o?`Attaching ${o}`:"Pick a workflow"));let n=I("div");st(n,{label:"Close",size:"sm",variant:"ghost",onClick:()=>void $.close()}),e.append(n);let s=I("div");st(s,{label:"Start a chat",size:"sm",variant:"outline",disabled:!t||u.busy,onClick:()=>void Ns()}),e.append(s);let l=I("div");return st(l,{label:"Attach",size:"sm",disabled:!t||u.busy,loading:u.busy,onClick:()=>void Us()}),e.append(l),e}$.onReady(e=>{cn(e),jr(),u.ready=e,!u.booted&&(u.booted=!0,u.connected=e.connection.connected,_n())});$.onConnection(e=>{let t=u.connected;u.connected=e.connected,e.connected&&!t&&_n(),!e.connected&&t&&X()});})();
