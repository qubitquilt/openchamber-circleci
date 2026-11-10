"use strict";(()=>{var se=class extends Error{status;code;constructor(t,r,n){super(n),this.name="CircleCIError",this.status=t,this.code=r}},wn="/api/v3",De=20,ft=20,Lr=50,vn=50,Oe=4,si=Oe*De,Dr=[1e3,2500],g=e=>typeof e=="object"&&e!==null?e:{},ie=e=>Array.isArray(e)?e:[],_=e=>typeof e=="string"&&e.length>0?e:null,be=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Vr(e){return ie(e).map(t=>{let r=g(t);return{type:_(r.type)??"unknown",message:_(r.message)??""}})}function Xr(e){return ie(e).map(t=>{let r=g(t);return{type:_(r.type)??"unknown",message:_(r.message)??"",description:_(r.description),url:_(r.url)}})}function Le(e){let t=g(e),r=g(t.attributes),n=g(t.references),s=g(n.event),l=g(s.attributes),i=g(l.vcs),c=g(i.commit),u=g(n.pipeline),p=g(n.trigger),S=g(p.attributes);return{id:_(t.id)??"",number:be(r.number)??0,phase:_(r.phase)??"unknown",outcome:_(r.current_outcome),createdAt:_(r.created_at)??"",branch:_(i.branch),tag:_(i.tag),revision:_(i.revision),commitSubject:_(c.subject),commitUrl:_(c.url),pipelineName:_(g(u.attributes).name),trigger:_(S.name)??_(g(S.event_source).type)??_(l.type),pullRequests:ie(i.pull_requests).map(f=>{let E=g(f),y=be(E.number);return y!==null&&y>0?{number:y,url:_(E.url)}:null}).filter(f=>f!==null),errors:Vr(r.errors),warnings:Xr(r.warnings)}}function Nn(e){let t=g(e),r=g(t.attributes),n=g(r.auto_rerun);return{id:_(t.id)??"",name:_(r.name)??"Workflow",phase:_(r.phase)??"unknown",outcome:_(r.current_outcome)??_(r.outcome),createdAt:_(r.created_at),endedAt:_(r.ended_at),tag:_(r.tag),autoRerunNumber:be(n.number)}}function _t(e){let t=g(e),r=g(t.attributes);return{id:_(t.id)??"",name:_(r.name)??"Job",number:be(r.number)??0,type:_(r.type)??"build",phase:_(r.phase)??"unknown",outcome:_(r.outcome),startedAt:_(r.started_at),endedAt:_(r.ended_at)}}function Un(e){let t=g(e);return{num:be(t.num)??0,name:_(t.name)??"Step",type:_(t.type)??"run",phase:_(t.phase)??"unknown",outcome:_(t.outcome),exitCode:be(t.exit_code),command:_(t.command),startedAt:_(t.started_at),endedAt:_(t.ended_at)}}function Mn(e){let t=_t(e),r=g(g(e).attributes),n=ie(r.parallel_executions).map(g),s=n.length>0?ie(n[0]?.steps).map(Un):[];return{...t,errors:Vr(r.errors),warnings:Xr(r.warnings),steps:s,parallelExecutions:n.length}}function Gr(e){let t=g(e),r=g(t.attributes),n=g(g(t.references).org);return{id:_(t.id)??"",name:_(r.name)??"Project",orgId:_(n.id)??"",orgName:_(g(n.attributes).name)??""}}function Pn(e){let t=g(e),r=g(t.attributes);return{id:_(t.id)??"",name:_(r.name)??"Organization",vcsProvider:_(g(r.vcs).provider)}}function Hr(e){let t=g(e),r=g(t.attributes),n=g(r.config);return{id:_(t.id)??"",name:_(r.name)??"Pipeline",configPath:_(n.file_path)??""}}function Ln(e){let t=g(e),r=g(t.attributes);return{id:_(t.id)??"",login:_(r.login)??"CircleCI account",name:_(r.name),avatarUrl:_(r.avatar_url)}}function Dn(e){if(!e)return;let t={};for(let[r,n]of Object.entries(e))n==null||n===""||(t[r]=String(n));return Object.keys(t).length>0?t:void 0}function $r(e){if(e)try{return JSON.parse(e)}catch{return}}function Gn(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Hn(e,t,r){let n=g(g(t).error),s=_(n.detail)??_(n.title)??_(n.type)??Gn(e);return new se(e,_(n.type)??`HTTP_${e}`,s)}function $n(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function Vn(e){return new Promise(t=>setTimeout(t,e))}function Fr(e){async function t(i,c){let u=Dn(i.query),p=0;for(;;){let S=await e({method:i.method,path:wn+i.path,...u?{query:u}:{},...i.body===void 0?{}:{body:JSON.stringify(i.body)}});if(S.status>=400){if($n(S.status,i.method)&&p<Dr.length){await Vn(Dr[p]??2500),p+=1;continue}throw Hn(S.status,$r(S.body),S.body)}return c(S.body)}}let r=i=>t(i,$r),n=i=>t(i,c=>c);async function s(i,c,u,p,S){let f=S?{...c,"page[cursor]":S}:{...c,"page[limit]":u},E;try{E=await r({method:"GET",path:i,query:f})}catch(y){if(!S&&y instanceof se&&y.status===400)E=await r({method:"GET",path:i,query:{...c}});else throw y}return{items:ie(g(E).data).map(p),next:_(g(g(E).page).next)}}async function l(i,c,u,p,S,f){let E=[],y,B=null;for(let z=0;z<S;z+=1){let Te=await s(i,c,u,p,y);if(E.push(...Te.items),B=Te.next,f?.(E)||!B)break;y=B}return{items:E,next:B}}return{currentUser:async()=>{let i=await r({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=ie(g(i).data)[0];if(!c)throw new se(200,"EMPTY_USER","CircleCI returned no user.");return Ln(c)},listOrgs:async()=>(await l("/orgs",{},Lr,Pn,Oe)).items,findProjectBySlug:async i=>{let c=await r({method:"GET",path:"/projects",query:{"filter[slug]":i}}),u=ie(g(c).data)[0];return u?Gr(u):null},listProjectsOfOrg:i=>l("/projects",{"filter[org_id]":i},Lr,Gr,Oe),listPipelines:async i=>{let c=await l("/pipelines",{"filter[project_id]":i},vn,Hr,1),u=[];for(let p of c.items)if(p.id)try{let S=await r({method:"GET",path:`/pipelines/${encodeURIComponent(p.id)}`,query:{"filter[project_id]":i}});u.push(Hr(g(S).data))}catch{u.push({...p,name:"Pipeline config"})}return u},listRuns:(i,c)=>s("/runs",{"filter[project_id]":i},De,Le,c),listRunsUntil:(i,c,u=Oe)=>l("/runs",{"filter[project_id]":i},De,Le,u,c),listMyRuns:i=>s("/runs",{"filter[user_id]":"me"},De,Le,i),getRun:async i=>{let c=await r({method:"GET",path:`/runs/${encodeURIComponent(i)}`});return Le(g(c).data)},findRunByNumber:async(i,c)=>(await l("/runs",{"filter[project_id]":i},De,Le,Oe,p=>p.some(S=>S.number===c))).items.find(p=>p.number===c)??null,fireRun:async i=>{let c=await r({method:"POST",path:"/runs",query:{"filter[project_id]":i.projectId},body:{data:{attributes:{checkout:{branch:i.branch}},references:{pipeline:{id:i.pipelineId}}}}}),u=_(g(g(c).data).id);if(!u)throw new se(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return u},listWorkflows:(i,c)=>s("/workflows",{"filter[run_id]":i},ft,Nn,c),listJobs:(i,c)=>c?s("/jobs",{"filter[workflow_id]":i},ft,_t,c):l("/jobs",{"filter[workflow_id]":i},ft,_t,Oe),getJob:async i=>{let c=await r({method:"GET",path:`/jobs/${encodeURIComponent(i)}`});return Mn(g(c).data)},condensedOutput:async(i,c,u=0)=>n({method:"GET",path:`/jobs/${encodeURIComponent(i)}/stdout/condensed`,query:{"filter[execution]":u,"filter[step_num]":c}}).then(p=>typeof p=="string"?p:""),rerunWorkflow:async(i,c)=>{let u=await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/rerun`,body:c?{is_from_failed:!0}:void 0});return _(g(g(u).data).id)??""},cancelWorkflow:async i=>{await r({method:"POST",path:`/workflows/${encodeURIComponent(i)}/cancel`})},approve:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/approve`})},reject:async i=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(i)}/reject`})}}}var jr=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Xn={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function Br(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Fn(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function ee(e,t){let r=(t??"").toLowerCase(),n=(e??"").toLowerCase(),s=r||n,l=Br(r)??Br(n)??"neutral",i=r?!jr.has(r):!jr.has(n)&&n!=="ended";return{label:Xn[s]??Fn(s),tone:l,active:i}}function te(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function Wr(e,t,r=Date.now()){if(!e)return"";let n=Date.parse(e);if(!Number.isFinite(n))return"";let s=t?Date.parse(t):r;if(!Number.isFinite(s)||s<n)return"";let l=Math.round((s-n)/1e3);if(l<60)return`${l}s`;let i=Math.floor(l/60),c=l%60;if(i<60)return c>0?`${i}m ${c}s`:`${i}m`;let u=Math.floor(i/60),p=i%60;return p>0?`${u}h ${p}m`:`${u}h`}function mt(e,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let n=Math.round((t-r)/1e3);if(n<45)return"just now";let s=Math.round(n/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let i=Math.round(l/24);return i<7?`${i}d ago`:new Date(r).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function Ke(e){return e?e.slice(0,8):""}function de(e){return e.branch??e.tag??"detached"}function St(e){let t=e.pullRequests?.[0];return t?`PR #${t.number}`:""}var jn={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function Kr(e){let t=e.trim();if(!t)return null;let r=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);r&&!t.includes("://")&&(t=`https://${r[1]}/${r[2]}/${r[3]}`);let n;try{n=new URL(t)}catch{return null}let s=n.hostname.toLowerCase();if(!s)return null;let l=n.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let i=l[l.length-2]??"",c=l[l.length-1]??"";return!i||!c?null:{host:s,owner:i,repo:c}}function zr(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function Jr(e,t,r){return{segment:e&&jn[e.host]||"github",owner:e?.owner??t,repo:e?.repo??r}}function Bn(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function Tt(e,t){return`${Bn(e)}/${t}`}function ht(e,t,r){return`${Tt(e,t)}/workflows/${r}`}function qr(e,t,r,n){return`${ht(e,t,r)}/jobs/${n}`}function Qr(e){let t=null,r=null,n="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let i=/^\[([^\]]+)\]$/.exec(l);if(i){n=(i[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let u=(c[1]??"").trim();u&&(r===null&&(r=u),(/remote\s+"origin"/i.test(n)||/remote\s+'origin'/i.test(n))&&(t=u))}return t??r}function gt(e){let t=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return t&&(t[1]??"").trim()||null}var Yr="circleci",Wn=16e3,Kn=200,Rt=2e3;function Zr(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function xe(e){return ee(e.phase,e.outcome).label.toLowerCase()}function zn(e,t){return e?`${e}/${t}`:t}function eo(e){let{workspace:t,run:r,workflow:n,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:r.id,runNumber:r.number,branch:r.branch,workflowId:n?.id??null,workflowName:n?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function to(e){let t=e.workflow?.id??"run",r=e.job?.id??"";return`${e.run.id}:${t}:${r}`}function ro(e){let{run:t,workflow:r,job:n}=e,s=n?.name??r?.name??`run #${t.number}`,l=xe(n?{phase:n.phase,outcome:n.outcome}:r||{phase:t.phase,outcome:t.outcome});return Zr(`${s} ${l} in CircleCI run #${t.number}`,Kn)}function Ot(e){let{workspace:t,run:r,workflow:n,job:s}=e;return n&&s&&s.number>0?qr(t.target,r.number,n.id,s.number).slice(0,Rt):n?ht(t.target,r.number,n.id).slice(0,Rt):Tt(t.target,r.number).slice(0,Rt)}function oo(e){let{workspace:t,run:r,workflow:n,job:s,jobs:l,jobsError:i,detail:c,output:u}=e,p=[];p.push(`CircleCI run #${r.number} on ${zn(t.link.orgName,t.link.projectName)}`),p.push(`Status: ${xe({phase:r.phase,outcome:r.outcome})}`),r.pipelineName&&p.push(`Pipeline: ${r.pipelineName}`),p.push(`Ref: ${de(r)}${r.revision?` at ${Ke(r.revision)}`:""}`),r.commitSubject&&p.push(`Commit: ${r.commitSubject}`),p.push(`URL: ${Ot(e)}`);let S=l.filter(f=>te(f.outcome));if(n){if(p.push(""),p.push(`Workflow ${n.name} (${xe(n)})`),i&&p.push(`Job listing unavailable: ${i}`),S.length>0){p.push("Failing jobs:");for(let E of S)p.push(`- ${E.name} (#${E.number})`)}let f=l.filter(E=>!S.includes(E));if(f.length>0){p.push("Other jobs:");for(let E of f)p.push(`- ${E.name}: ${xe({phase:E.phase,outcome:E.outcome})}`)}}if(s&&c){if(p.push(""),p.push(`Job ${c.name} (#${c.number})`),c.errors.length>0){p.push("Errors:");for(let E of c.errors)p.push(`- ${E.type}: ${E.message}`)}let f=c.steps.filter(E=>E.outcome==="failed");if(f.length>0){p.push("Failed steps:");for(let E of f)p.push(`- step ${E.num} "${E.name}"${E.exitCode!==null?` (exit ${E.exitCode})`:""}`),E.command&&p.push(`  command: ${E.command}`)}}return u&&u.trim()&&(p.push(""),p.push("Condensed output:"),p.push(u.trim())),Zr(p.join(`
`),Wn)}var A="openchamber.sdk";var ze="data-oc-scrolling",bt=`
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
:hover, [${ze}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${ze}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${ze}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${ze}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function xt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",n=>{let s=n.target===e?t:n.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=r.get(s);l!==void 0&&clearTimeout(l),r.set(s,setTimeout(()=>{r.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Jn=`(${xt.toString()})(document);`;var ao=/^[a-z][a-z0-9-]{0,39}$/;var no=e=>Object(e)===e&&!Array.isArray(e),At=(e,t)=>Object.keys(e).every(r=>t.includes(r)),so=e=>String(e)===e&&e.length>=1&&e.length<=60,io=e=>String(e)===e&&e.length>=1&&e.length<=80,co=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let r of e){if(!no(r)||!ao.test(r.id)||!so(r.label)||r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1||t.has(r.id))return!1;if(t.add(r.id),r.kind==="button"){if(!At(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!At(r,["kind","id","label","value","options","disabled"])||!io(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let n=new Set;for(let s of r.options){if(!no(s)||!At(s,["value","label"])||!io(s.value)||!so(s.label)||n.has(s.value))return!1;n.add(s.value)}if(!n.has(r.value))return!1}return!0};var lo=["{id}","{segment}","{segments+}"];var Ri=new Set(lo);var uo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var bi=new Set(uo);var kt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,po=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==t.bytes[r])return!1;return!0};var Eo=/^[A-Za-z0-9_-]{1,80}$/;var fo=["left","right","top","bottom"];var _o=(e,t=0,r={remaining:16e3})=>{if(--r.remaining<0||t>=32)return!1;if(e===null)return!0;let n=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of n)if(!_o(s,t+1,r))return!1;return!0},yt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(yt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(yt)}return String(e)===e||Number.isFinite(e)},It=e=>{try{return String(e.id)!==e.id||!Eo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!fo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!_o(e.data)||!yt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var wt=2e3;var So=["file","directory","other","missing"],vt=e=>!!(e&&"sessionId"in e),Nt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var To=/^[0-9a-f]{7,64}$/i,Ut=e=>To.test(e),Je=500,qe=32e3,ho=16e3,go=128,Ro=200,Oo=2e3,bo=16e3,xo=80,Ao=200,ko=16e3;var yo=2e3;var Mt=2e4,Qe=1024,Ye=2e6;var Ze=64e3,et=8e3,Pt=4e3;var Lt=96e4,Qn=60*6e4;var Io=999,Co=1e4,Ge=500,wo=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],vo=["stopped","starting","ready","failed"],Yn=new Set(wo),No=e=>Yn.has(e),Uo=e=>e&&No(e)?e:"HOST_REJECTED",Ae=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(Ae):Object(e)===e?Object.values(e).every(Ae):!1,Mo=e=>Ae(e)&&JSON.stringify(e).length<=ko,mo=e=>e?.trim().slice(0,Ao)??"",ke=e=>{let t=e.id.trim().slice(0,go),r=e.title.trim().slice(0,Ro),n=e.url.trim().slice(0,Oo),s=e.text?.trim().slice(0,bo),l=e.author?.trim().slice(0,xo),i=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:r||t,url:n,kind:i};if(s&&(c.text=s),l&&(c.author=l),i==="pull"){let u=mo(e.branches?.head),p=mo(e.branches?.base);u&&p&&(c.branches={head:u,base:p})}return Mo(e.data)&&(c.data=e.data),c},Dt=e=>{let t=ke(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Gt=e=>{let t={text:e.text.trim().slice(0,ho)};return e.send&&(t.send=!0),t},Ht=e=>e===null||!Number.isFinite(e)?null:Math.min(Io,Math.max(0,Math.round(e))),$t=e=>Number.isFinite(e)?Math.min(Co,Math.max(0,Math.ceil(e))):0;var ye=e=>e.length>0&&e.length<=Qe&&!e.includes("\0")&&!e.includes("\\");var tt=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>yo?!1:!e.split("/").some(r=>r==="."||r===".."),Zn=new Set(vo),Vt=e=>!!(e&&"status"in e&&Zn.has(String(e.status))&&!("body"in e)),rt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Xt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Ft=e=>!!(e&&"written"in e&&e.written===!0),jt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),es=new Set(So),Bt=e=>!!(e&&"kind"in e&&"size"in e&&es.has(String(e.kind))&&Number.isFinite(e.size)),Wt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),ts=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),rs=e=>Object(e)===e?e:null,Ct=e=>String(e)===e&&e.length>0,os=e=>{if(!Ct(e.id))return null;if(e.ok===!0){let t={channel:A,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Ct(e.error)?{channel:A,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:Uo(Ct(e.code)?e.code:void 0)}:null},Kt=e=>{let t=rs(e);return!t||t.channel!==A||t.v!==1?null:t.type==="result"?os(t):!ts.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var Po=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,ns=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",T=class extends Error{code;constructor(t,r){super(r),this.name="HostRequestError",this.code=t}},Lo=()=>Promise.reject(new T("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ot=()=>Promise.reject(new T("BAD_PATH",`File path must be 1 to ${Qe} characters without NUL or backslash.`)),nt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new T("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},b=e=>(e.value+=1,`oc-${e.value}`),Yt=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new T("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(o=>o===t.parent),n=e.requestTimeoutMs??Mt,s=new Set,l=new Set,i=new Set,c=new Set,u=new Set,p=new Set,S=new Set,f=new Set,E=new Set,y=new Set,B=new Set,z=new Set,Te=[],we=null,ve=null,Xe=new Set,Fe=new Set,Ne=null,Ue=null,dt=!1,he=new Map,ge=new Map,Re=new Map,Q=!1,O={value:0},R=null,Z=null,Me=!1,Pe=!1,xr=null,Ar=o=>o?{sessionId:o.id,phase:o.busy?"started":"completed"}:null,W=o=>{t.parent.postMessage(o,"*")},kr=()=>{Q||t.parent===t||z.size===0||R?.features?.lateGenerateResults!==!0||W({channel:A,v:1,type:"generate-late-listen"})},M=(o,a)=>{for(let m of o)try{m(a)}catch(h){console.error(h)}},yr=o=>{if(!(o instanceof MessageEvent)||!r(o.source))return;let a=Kt(o.data);if(!a)return;if(a.type==="workspace"){let h=ge.get(a.payload.subscriptionId);h&&M([h],a.payload.snapshot);return}if(a.type==="shells"){let h=Re.get(a.payload.subscriptionId);h&&M([h],a.payload.snapshot);return}if(a.type==="ready"){R=a.payload,Z=Ar(a.payload.session),M(s,a.payload),M(l,a.payload.directory),M(i,a.payload.session),Z&&M(c,Z),M(u,a.payload.connection),M(p,a.payload.settings),M(S,a.payload.item),a.payload.block&&M(f,a.payload.block),kr();return}if(a.type==="service-event"){M(E,a.payload);return}if(a.type==="generate-late"){z.size===0?Te.push(a.payload):M(z,a.payload);return}if(a.type==="directory"){R&&(R={...R,directory:a.payload.directory}),M(l,a.payload.directory);return}if(a.type==="session"){R&&(R={...R,session:a.payload.session}),a.payload.session?Z?.sessionId!==a.payload.session.id&&(Z=Ar(a.payload.session)):Z=null,M(i,a.payload.session);return}if(a.type==="session-lifecycle"){Z=a.payload,M(c,a.payload);return}if(a.type==="connection"){R&&(R={...R,connection:a.payload.connection}),M(u,a.payload.connection);return}if(a.type==="settings"){R&&(R={...R,settings:a.payload.settings}),M(p,a.payload.settings);return}if(a.type==="item"){R&&(R={...R,item:a.payload.item}),M(S,a.payload.item);return}if(a.type==="status-control-event"){M(y,a.payload);return}if(a.type==="popover-closed"){M(B,a.payload);return}if(a.type==="action"){let h=C=>{Q||W({channel:A,v:1,type:"action-result",id:a.id,payload:C})},w=ve;if(!w){h({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>w(a.payload)).then(()=>h({ok:!0}),C=>{let H=(C instanceof Error?C.message:String(C)).trim();h({ok:!1,error:(H||"Action failed.").slice(0,Ge)})});return}if(a.type==="file-open"){let h=a.payload;if(Ue&&po(Ue,h))return;Ue=h,M(Xe,a.payload);return}if(a.type==="file-saved"){M(Fe,a.payload.version);return}if(a.type==="file-snapshot"){let h=H=>{Q||W({channel:A,v:1,type:"file-snapshot-result",id:a.id,payload:H})},w=H=>h({error:(H.trim()||"Could not read the edited file.").slice(0,Ge)}),C=Ne;if(!C){w("This extension does not edit files.");return}Promise.resolve().then(()=>C(a.payload.purpose)).then(H=>{if(kt(H)>2e7){w(`The file is over ${2e7} ${"bytes"in H?"bytes":"characters"}.`);return}if(H.version.length>256){w(`The snapshot version is over ${256} characters.`);return}h({snapshot:"bytes"in H?{bytes:H.bytes,version:H.version}:{content:H.content,version:H.version}})},H=>w(H instanceof Error?H.message:String(H)));return}if(a.type==="resolve"){let h=C=>{W({channel:A,v:1,type:"resolve-result",id:a.id,payload:C})},w=we;if(!w){h({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>w(a.payload)).then(C=>h({item:C?ke(C):null}),C=>{let H=(C instanceof Error?C.message:String(C)).trim();h({error:(H||"Command failed.").slice(0,Ge)})});return}let m=he.get(a.id);if(m){if(clearTimeout(m.timer),he.delete(a.id),a.ok){m.resolve(a.payload);return}m.reject(new T(a.code,a.error))}};t.addEventListener("message",yr),W({channel:A,v:1,type:"hello"});let F=(o,a=n)=>Q||t.parent===t?Promise.reject(new T("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((m,h)=>{let w=setTimeout(()=>{he.delete(o.id),h(new T("HOST_TIMEOUT","Host did not answer in time."))},a);he.set(o.id,{resolve:m,reject:h,timer:w}),W(o)}),D=o=>F(o).then(()=>{}),G={channel:A,v:1},ut=o=>{!Q&&t.parent!==t&&W(o)},Ir=()=>ut({...G,type:"file-save"}),Cr=o=>{!Po(o)||!ns(o)||(o.preventDefault(),Ir())},wr=o=>{!Po(o)||o.key!=="Escape"||R?.surface!=="popover"||!R.popover||(o.preventDefault(),Mr(R.popover.id,"escape").catch(()=>{}))},je=()=>{let o=R?.surface==="popover"?R.popover:void 0;if(!o)return;let a=Me||Pe;xr!==a&&(xr=a,Pr(o.id,a).catch(()=>{}))},Be=()=>{R?.surface!=="popover"||Me||(Me=!0,je())},vr=o=>{R?.surface!=="popover"||o.relatedTarget!==null||!Me||(Me=!1,je())},Nr=()=>{R?.surface!=="popover"||Pe||(Pe=!0,je())},Ur=()=>{R?.surface!=="popover"||!Pe||(Pe=!1,je())},J=(o,a=1024)=>{if(!o.trim()||o.length>a)throw new T("HOST_REJECTED",`Identity must contain 1 to ${a} characters.`)},pt=async o=>{o.kind!=="projects"&&J(o.projectId);let a=await F({...G,type:"workspace-read",id:b(O),payload:o});if(!a||!("kind"in a)||!("state"in a)||a.kind!==o.kind)throw new T("HOST_REJECTED","Host did not return workspace data.");return a},Et=async(o,a)=>{o.kind!=="projects"&&J(o.projectId);let m=b(O);ge.set(m,a);try{await D({...G,type:"workspace-subscribe",id:b(O),payload:{subscriptionId:m,query:o}})}catch(h){throw ge.delete(m),Q||W({...G,type:"workspace-unsubscribe",id:b(O),payload:{subscriptionId:m}}),h}return()=>{!ge.delete(m)||Q||W({...G,type:"workspace-unsubscribe",id:b(O),payload:{subscriptionId:m}})}},Cn=async(o,a)=>{o.kind==="session"&&J(o.sessionId),o.kind==="project"&&J(o.projectId);let m=b(O);Re.set(m,a);try{await D({...G,type:"shells-subscribe",id:b(O),payload:{subscriptionId:m,scope:o}})}catch(h){throw Re.delete(m),Q||W({...G,type:"shells-unsubscribe",id:b(O),payload:{subscriptionId:m}}),h}return()=>{!Re.delete(m)||Q||W({...G,type:"shells-unsubscribe",id:b(O),payload:{subscriptionId:m}})}},We=async o=>{if("key"in o&&(o.key.length===0||o.key.length>128))throw new T("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(o.op==="set"&&!Ae(o.value))throw new T("HOST_REJECTED","Storage values must be JSON.");if(o.op==="set"&&new TextEncoder().encode(JSON.stringify(o.value)).length>65536)throw new T("HOST_REJECTED","Storage value exceeds 64 KiB.");if(o.scope==="device"&&R?.features?.deviceStorage!==!0)throw new T("UNSUPPORTED","This host does not support device storage.");let a=await F({...G,type:"storage",id:b(O),payload:o});if(!a||!("storage"in a)||a.op!==o.op)throw new T("HOST_REJECTED","Host did not return storage data.");return a},Mr=(o,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===o)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):D({...G,type:"popover-close",id:b(O),payload:a?{id:o,reason:a}:{id:o}}),Pr=(o,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===o)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):D({...G,type:"popover-anchor",id:b(O),payload:{id:o,active:a}});return t.addEventListener("keydown",wr,!0),t.addEventListener("pointerover",Be),t.addEventListener("pointermove",Be),t.addEventListener("pointerout",vr),t.addEventListener("focus",Nr),t.addEventListener("blur",Ur),{onAction:o=>(ve=o,()=>{ve===o&&(ve=null)}),listProjects:async()=>{let o=await pt({kind:"projects"});if(o.kind!=="projects")throw new T("HOST_REJECTED","Expected projects.");return o},listWorktrees:async o=>{let a=await pt({kind:"worktrees",projectId:o});if(a.kind!=="worktrees")throw new T("HOST_REJECTED","Expected worktrees.");return a},listSessions:async o=>{let a=await pt({kind:"sessions",projectId:o});if(a.kind!=="sessions")throw new T("HOST_REJECTED","Expected sessions.");return a},onProjects:o=>Et({kind:"projects"},a=>{a.kind==="projects"&&o(a)}),onWorktrees:(o,a)=>Et({kind:"worktrees",projectId:o},m=>{m.kind==="worktrees"&&a(m)}),onSessions:(o,a)=>Et({kind:"sessions",projectId:o},m=>{m.kind==="sessions"&&a(m)}),onRunningShells:(o,a)=>Cn(o,a),readShellOutput:async(o,a)=>{J(o,128);let m=a?.cursor;if(m!==void 0&&(!Number.isInteger(m)||m<0))throw new T("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let h=a?.tailBytes;if(h!==void 0&&(!Number.isInteger(h)||h<1||h>65536))throw new T("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let C=await F({...G,type:"shell-output",id:b(O),payload:{shellId:o,cursor:m,tailBytes:h}});if(!C||typeof C.output!="string"||!Number.isFinite(C.cursor))throw new T("HOST_REJECTED","Host did not return shell output.");return C},stopShell:async o=>{if(J(o,128),(await F({...G,type:"shell-stop",id:b(O),payload:{shellId:o}}))?.stopped!==!0)throw new T("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async o=>{J(o),await D({...G,type:"open-session",id:b(O),payload:{sessionId:o}})},storage:{get:async(o,a)=>{let m=nt(a),h={op:"get",key:o};m&&(h.scope=m);let w=await We(h);return w.op==="get"&&w.found?w.value:void 0},set:async(o,a,m)=>{let h=nt(m),w={op:"set",key:o,value:a};h&&(w.scope=h),await We(w)},delete:async(o,a)=>{let m=nt(a),h={op:"delete",key:o};m&&(h.scope=m),await We(h)},keys:async o=>{let a=nt(o),m={op:"keys"};a&&(m.scope=a);let h=await We(m);if(h.op!=="keys")throw new T("HOST_REJECTED","Expected storage keys.");return h.keys}},onReady:o=>(s.add(o),R&&o(R),()=>{s.delete(o)}),onDirectory:o=>(l.add(o),R&&o(R.directory),()=>{l.delete(o)}),onSession:o=>(i.add(o),R&&o(R.session),()=>{i.delete(o)}),onSessionLifecycle:o=>(c.add(o),Z&&o(Z),()=>{c.delete(o)}),onConnection:o=>(u.add(o),R&&o(R.connection),()=>{u.delete(o)}),onSettings:o=>(p.add(o),R&&o(R.settings),()=>{p.delete(o)}),onItem:o=>(S.add(o),R&&o(R.item),()=>{S.delete(o)}),onBlock:o=>(f.add(o),R?.block&&o(R.block),()=>{f.delete(o)}),onServiceEvent:o=>(E.add(o),()=>{E.delete(o)}),onStatusControl:o=>(y.add(o),()=>{y.delete(o)}),onPopoverClosed:o=>(B.add(o),()=>{B.delete(o)}),setStatusControls:o=>R?.features?.statusControls!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support status controls.")):co(o)?D({...G,type:"status-controls",id:b(O),payload:{controls:o}}):Promise.reject(new T("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:o=>R?.features?.popovers!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):It(o)?D({...G,type:"popover-open",id:b(O),payload:o}):Promise.reject(new T("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Mr,setPopoverAnchorActive:Pr,onResolve:o=>(we=o,()=>{we===o&&(we=null)}),toast:o=>{let a=o.message.trim();return!a||a.length>Je?Promise.reject(new T("HOST_REJECTED",`Toast message must contain 1 to ${Je} characters.`)):o.copy&&o.copy!==!0&&(!o.copy.text.length||o.copy.text.length>qe)?Promise.reject(new T("HOST_REJECTED",`Toast copy text must contain 1 to ${qe} characters.`)):D({channel:A,v:1,type:"toast",id:b(O),payload:{...o,message:a}})},openUrl:o=>D({channel:A,v:1,type:"open-url",id:b(O),payload:{url:o}}),openCommit:o=>Ut(o)?D({channel:A,v:1,type:"open-commit",id:b(O),payload:{sha:o}}):Promise.reject(new T("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:o=>D({channel:A,v:1,type:"block-answer",id:b(O),payload:{text:o.trim().slice(0,wt)}}),openSurface:o=>D({channel:A,v:1,type:"open-surface",id:b(O),payload:{surfaceId:o}}),writeClipboard:o=>D({channel:A,v:1,type:"clipboard-write",id:b(O),payload:{text:o}}),compose:o=>D({channel:A,v:1,type:"compose",id:b(O),payload:o}),attach:o=>D({channel:A,v:1,type:"attach",id:b(O),payload:ke(o)}),startSession:async o=>{o.projectId!==void 0&&J(o.projectId);let a=o.worktree;a&&a!==!0&&(a.kind==="existing"?J(a.directory):(a.name!==void 0&&J(a.name,200),a.baseBranch!==void 0&&J(a.baseBranch,200)));let m=await F({channel:A,v:1,type:"start-session",id:b(O),payload:Dt(o)},e.requestTimeoutMs??18e4);if(!vt(m))throw new T("HOST_REJECTED","Host did not return a session.");return m},prompt:o=>F({channel:A,v:1,type:"prompt",id:b(O),payload:Gt(o)}).then(a=>{if(!Nt(a))throw new T("HOST_REJECTED","Host did not return a prompt result.");return a}),sessionLink:o=>D({channel:A,v:1,type:"session-link",id:b(O),payload:ke(o)}),close:()=>D({channel:A,v:1,type:"close",id:b(O)}),oauthStart:()=>D({channel:A,v:1,type:"oauth-start",id:b(O)}),oauthDisconnect:()=>D({channel:A,v:1,type:"oauth-disconnect",id:b(O)}),request:o=>(tt(o.path)?F({channel:A,v:1,type:"request",id:b(O),payload:o}):Lo()).then(a=>{if(!rt(a))throw new T("HOST_REJECTED","Host request result was empty.");return a}),serviceRequest:o=>(tt(o.path)?F({channel:A,v:1,type:"service-request",id:b(O),payload:o}):Lo()).then(a=>{if(!rt(a))throw new T("HOST_REJECTED","Host service request result was empty.");return a}),serviceStatus:()=>F({channel:A,v:1,type:"service-status",id:b(O)}).then(o=>{if(!Vt(o))throw new T("HOST_REJECTED","Host did not return service status.");return o}),readFile:o=>(ye(o)?F({channel:A,v:1,type:"file-read",id:b(O),payload:{path:o}}):ot()).then(a=>{if(!Xt(a))throw new T("HOST_REJECTED","Host did not return file content.");return a}),writeFile:(o,a)=>ye(o)?a.length>Ye?Promise.reject(new T("FILE_TOO_LARGE",`Content is over ${Ye} characters.`)):F({channel:A,v:1,type:"file-write",id:b(O),payload:{path:o,content:a}}).then(m=>{if(!Ft(m))throw new T("HOST_REJECTED","Host did not confirm the write.");return m}):ot(),listDir:o=>(ye(o)?F({channel:A,v:1,type:"file-list",id:b(O),payload:{path:o}}):ot()).then(a=>{if(!jt(a))throw new T("HOST_REJECTED","Host did not return directory entries.");return a}),stat:o=>(ye(o)?F({channel:A,v:1,type:"file-stat",id:b(O),payload:{path:o}}):ot()).then(a=>{if(!Bt(a))throw new T("HOST_REJECTED","Host did not return file status.");return a}),generate:o=>{let a=o.prompt.trim(),m=o.system?.trim();if(a.length===0||a.length>Ze)return Promise.reject(new T("HOST_REJECTED",`Prompt must be 1 to ${Ze} characters.`));if(m!==void 0&&(m.length===0||m.length>et))return Promise.reject(new T("HOST_REJECTED",`System prompt must be 1 to ${et} characters.`));let h=o.maxOutputTokens===void 0?void 0:Math.min(Pt,Math.max(1,Math.floor(o.maxOutputTokens)));if(h!==void 0&&!Number.isFinite(h))return Promise.reject(new T("HOST_REJECTED","maxOutputTokens must be a number."));let w={prompt:a};return m!==void 0&&(w.system=m),h!==void 0&&(w.maxOutputTokens=h),F({channel:A,v:1,type:"generate",id:b(O),payload:w},e.requestTimeoutMs??Lt).then(C=>{if(!Wt(C))throw new T("HOST_REJECTED","Host did not return generated text.");return C})},onLateGenerateResult:o=>{z.add(o);for(let a of Te.splice(0))M([o],a);return kr(),()=>{z.delete(o)}},setBadge:o=>D({channel:A,v:1,type:"badge",id:b(O),payload:{count:Ht(o)}}),setHeight:o=>D({channel:A,v:1,type:"resize",id:b(O),payload:{height:$t(o)}}),onFileOpen:o=>(Xe.add(o),dt||(dt=!0,t.addEventListener("keydown",Cr,!0)),Ue&&o(Ue),()=>{Xe.delete(o)}),onFileSnapshot:o=>(Ne=o,()=>{Ne===o&&(Ne=null)}),onFileSaved:o=>(Fe.add(o),()=>{Fe.delete(o)}),reportFileChange:o=>ut({...G,type:"file-change",payload:{dirty:o.dirty,edited:o.edited}}),requestFileSave:Ir,reportFileUnsupported:()=>ut({...G,type:"file-unsupported"}),dispose:()=>{for(let o of ge.keys())W({...G,type:"workspace-unsubscribe",id:b(O),payload:{subscriptionId:o}});ge.clear();for(let o of Re.keys())W({...G,type:"shells-unsubscribe",id:b(O),payload:{subscriptionId:o}});Re.clear(),Q=!0,we=null,ve=null,Ne=null,Xe.clear(),Fe.clear(),dt&&t.removeEventListener("keydown",Cr,!0),t.removeEventListener("message",yr),t.removeEventListener("keydown",wr,!0),t.removeEventListener("pointerover",Be),t.removeEventListener("pointermove",Be),t.removeEventListener("pointerout",vr),t.removeEventListener("focus",Nr),t.removeEventListener("blur",Ur);for(let o of he.values())clearTimeout(o.timer),o.reject(new T("HOST_UNAVAILABLE","Host client was disposed."));he.clear(),s.clear(),l.clear(),i.clear(),c.clear(),u.clear(),p.clear(),S.clear(),f.clear(),E.clear(),y.clear(),B.clear(),z.clear(),Te.length=0}}};var Ho=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Gi=new Set(Ho);var ss=10*6e4;var is=10*6e4;var as=10*6e4;var cs=10*6e4;var $o=["none","agent","user"];var $i=new Set($o);var $=Yt(),Vo=async e=>$.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});function Zt(e){return $.readFile(e)}function Xo(e){return{providerId:Yr,id:to(e).slice(0,128),title:ro(e),url:Ot(e),kind:"issue",text:oo(e),data:eo(e)}}async function Fo(e){await $.attach(Xo(e))}async function jo(e,t={}){await $.startSession({...Xo(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}var ls=["all","failed","running"];function Bo(e){return ls.includes(e)?e:"all"}function ds(e){return[`#${e.number}`,de(e),Ke(e.revision),e.commitSubject??"",e.pipelineName??"",...(e.pullRequests??[]).map(t=>`#${t.number}`)].filter(Boolean).join(" ").toLowerCase()}var Wo={branch:null,prNumbers:[]};function us(e){return!e.branch&&e.prNumbers.length===0}function Ko(e,t){if(us(t)||t.branch&&e.branch===t.branch)return!0;let r=e.pullRequests??[];return t.prNumbers.some(n=>r.some(s=>s.number===n))}function er(e,t){return e.filter(r=>Ko(r,t))}function zo(e){return t=>er(t,e).length>0}function ps(e,t,r="",n){if(t==="failed"&&!te(e.outcome)||t==="running"&&!ee(e.phase,e.outcome).active||n&&!Ko(e,n))return!1;let s=r.trim().toLowerCase();return s===""||ds(e).includes(s)}function Jo(e,t,r="",n){return e.filter(s=>ps(s,t,r,n))}function Es(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return null;let r=/\/(pull|pull-requests|merge_requests)\/(\d+)/.exec(t.pathname),n=r?Number.parseInt(r[2]??"",10):Number.NaN;return Number.isInteger(n)&&n>0?n:null}catch{return null}}function fs(e,t){return e?t===e||t.startsWith(e.endsWith("/")?e:`${e}/`):!1}function _s(e,t){return e.find(r=>fs(r.directory,t))?.id??null}function ms(e,t){return e.find(n=>n.directory===t&&n.branch.length>0)?.branch??null}async function Ss(e,t,r){try{return ms((await e.host.listWorktrees(t)).worktrees,r)}catch{return null}}async function Ts(e){let t=e.directory;if(!t)return null;let r=null,n=null;try{let c=await e.readFile(".git/HEAD");r=gt(c.content),r&&(n="head")}catch{}let s=null;if(e.session||!r)try{s=(await e.host.listProjects()).projects}catch{}let l=s?_s(s,t):null;if(!r&&s){let c=l?[l,...s.filter(u=>u.id!==l).map(u=>u.id)]:s.map(u=>u.id);for(let u of c){let p=await Ss(e,u,t);if(p){l=u,r=p,n="worktree";break}}}let i=[];if(l&&e.session)try{i=((await e.host.listSessions(l)).sessions.find(p=>p.id===e.session?.id)?.links??[]).filter(p=>p.kind==="change").map(p=>Es(p.url)).filter(p=>p!==null)}catch{}return!r&&i.length===0?null:{branch:r,via:n,prNumbers:i}}async function qo(e){try{return await Ts(e)}catch{return null}}function st(e){return e?{branch:e.branch,prNumbers:e.prNumbers}:Wo}function Qo(e){return e?.branch?"This branch":"My pull requests"}function Yo(e){if(!e)return null;let{branch:t,prNumbers:r}=e,n=r.map(s=>`#${s}`).join(", ");return t&&r.length>0?`Runs on ${t} and PR ${n}`:t?`Runs on ${t}`:r.length>0?`Runs for PR ${n}`:null}function I(e,t={},...r){let n=document.createElement(e);t.className&&(n.className=t.className),t.text!==void 0&&(n.textContent=t.text),t.title&&(n.title=t.title),t.style&&n.setAttribute("style",t.style),t.role&&n.setAttribute("role",t.role),t.ariaLabel&&n.setAttribute("aria-label",t.ariaLabel);for(let s of r)s==null||s===!1||n.append(typeof s=="string"?document.createTextNode(s):s);return n}function Zo(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var hs={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function ue(e){return e instanceof se?e.message:e instanceof T?hs[e.code]??e.message:e instanceof Error?e.message:String(e)}function gs(e){return e instanceof T?e.code:null}function tr(e){let t=gs(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}var Rs=`
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
`,en="circleci-shared-style";function tn(){if(document.getElementById(en))return;let e=document.createElement("style");e.id=en,e.textContent=Rs,document.head.append(e)}var Os=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],bs=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],rn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,n]of Os)t.style.setProperty(r,e.tokens[n]);for(let[r,n,s]of bs){let l=e.tokens[s]??"";t.style.setProperty(r,l),t.style.setProperty(n,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},rr=(e,t)=>{rn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var xs={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},v=(e,t)=>`var(--${e}, var(--oc-${xs[e]}, ${t}))`,oe=v("surface-background","transparent"),at=v("surface-elevated","transparent"),Ie=v("surface-elevated-foreground","inherit"),K=v("surface-foreground","inherit"),P=v("surface-muted-foreground","gray"),As=v("surface-muted","transparent"),pe=v("interactive-border","currentColor"),j=v("interactive-hover","transparent"),Ee=v("interactive-active","transparent"),or=v("interactive-selection","transparent"),nr=v("interactive-selection-foreground","inherit"),re=v("primary","currentColor"),sr=v("primary-text","inherit"),ir=v("error-text","inherit"),ks=v("font-sans","inherit"),ar=v("font-mono","monospace"),an=v("radius","9px"),cr=`calc(${an} - 2px)`,on=`calc(${an} - 4px)`,L=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,nn=`background-image: linear-gradient(${j}, ${j});`,lr=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,dr="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",sn="box-shadow: var(--oc-sdk-lit);",ur=`inset 0 0.5px 0 0 ${L(K,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,ys=`
:root {
  --oc-sdk-edge: ${L(K,16)};
  --oc-sdk-field-bg: ${at};
  --oc-sdk-raised-bg: ${oe};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${L(K,14)};
  --oc-sdk-field-bg: ${L(oe,50,at)};
  --oc-sdk-raised-bg: ${at};
  --oc-sdk-field-lift: ${ur};
  --oc-sdk-raised-lift: ${ur};
  --oc-sdk-lit: ${ur};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,it=e=>{let t=v(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${v(`${e}-text`,"inherit")}; }`},Is=`
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
`,cn=`${ys}
.oc-sdk { color: ${K}; font-family: ${ks}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${nn} }
.oc-sdk-mono { font-family: ${ar}; }
.oc-sdk-muted { color: ${P}; }
${it("success")}${it("warning")}${it("error")}${it("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${re}; --oc-sdk-tone-text: ${sr}; }

.oc-sdk-btn { border-radius: ${cr}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${on}; }
.oc-sdk-btn[data-variant="default"] { color: ${sr}; background: ${L(re,10,oe)}; border-color: ${L(re,12)}; ${sn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${L(re,16,oe)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${L(re,22,oe)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${As}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Ee}, ${Ee}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Ie}; ${dr} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Ee}, ${Ee}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${j}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Ee}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error","red")}; color: ${ir}; background: ${L("var(--oc-sdk-tone)",7,oe)}; border-color: ${L("var(--oc-sdk-tone)",12)}; ${sn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${L("var(--oc-sdk-tone)",9,oe)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${L("var(--oc-sdk-tone)",11,oe)}; box-shadow: none; }

.oc-sdk-field-note { color: ${P}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${ir}; }
.oc-sdk-input { border-radius: ${cr}; background: var(--oc-sdk-field-bg); color: ${Ie}; ${lr("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${P}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${lr(L(K,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${lr(v("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${ar}; }

.oc-sdk-search-icon { color: ${P}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${re}; }
.oc-sdk-search-clear { border-radius: ${on}; color: ${P}; }
.oc-sdk-search-clear:hover { background: ${j}; color: ${K}; }

.oc-sdk-trigger { border-radius: ${cr}; background: var(--oc-sdk-raised-bg); color: ${Ie}; ${dr} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${j}, ${j}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Ee}, ${Ee}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${P}; }
.oc-sdk-trigger-chevron { color: ${P}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Ie}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${at}; background-clip: padding-box; color: ${Ie}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${j}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${or}; color: ${nr}; }
.oc-sdk-option-check { color: ${K}; }
.oc-sdk-option[data-destructive="true"] { color: ${ir}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${L(v("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${P}; }
.oc-sdk-popup-empty { color: ${P}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${pe}; border-radius: 4px; color: ${K}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${L(K,60,pe)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${pe}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${oe}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${re}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${nn} }
.oc-sdk-check-desc { color: ${P}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${L(K,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${P}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${K}; }
.oc-sdk-tab[aria-selected="true"] { color: ${nr}; background: ${or}; border-color: ${pe}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Ie}; background: var(--oc-sdk-raised-bg); ${dr} }
.oc-sdk-tab-count { color: ${P}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${L(K,6)}; color: ${P}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${L("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${j}; }
.oc-sdk-row[aria-selected="true"] { background: ${or}; color: ${nr}; }
.oc-sdk-row-lead { font-family: ${ar}; color: ${P}; }
.oc-sdk-row-sub { color: ${P}; }
.oc-sdk-row-meta { color: ${P}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${P}; }

.oc-sdk-empty-body { color: ${P}; }

.oc-sdk-spinner { color: ${P}; }
.oc-sdk-spinner-ring { border-color: ${pe}; border-top-color: ${re}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${L("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${P}; }

.oc-sdk-separator { color: ${P}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${L(pe,40)}; }

.oc-sdk-progress-label { color: ${P}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${L(K,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${re}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${v("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${v("success-text","inherit")}; }

.oc-sdk-text a { color: ${sr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${L(pe,60)}; }
`,N=`
${bt}
${Is}
${cn}`;var ln="oc-sdk-ui-style",ae=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},U=e=>{let t=document.getElementById(ln);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}xt(document);let r=document.createElement("style");r.id=ln,r.textContent=e,document.head.appendChild(r)},x=(e,t)=>{let r=document.createElement(e);return t&&(r.className=t),r},q=e=>{let t=x("button",e);return t.type="button",t},V=(e,t)=>{let r=t??"";e.textContent!==r&&(e.textContent=r)},Y=(e,t,r)=>{r==null||r===""?e.removeAttribute(t):e.getAttribute(t)!==r&&e.setAttribute(t,r)};var Cs=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},ce=(e,t)=>{U(N);let r=t,n=q("oc-sdk oc-sdk-btn"),s=Cs(),l=document.createElement("span");n.append(l),e.append(n);let i=()=>{n.dataset.variant=r.variant??"default",n.dataset.size=r.size??"default",n.disabled=!!r.disabled||!!r.loading,n.dataset.loading=r.loading?"true":"false",n.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&s.parentNode!==n?n.prepend(s):!r.loading&&s.parentNode===n&&s.remove(),V(l,r.label)},c=()=>{r.disabled||r.loading||r.onClick()};return n.addEventListener("click",c),i(),{update:u=>{r={...r,...u},i()},dispose:()=>{n.removeEventListener("click",c),n.remove()}}};var dn="http://www.w3.org/2000/svg",ws={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},fe=(e,t,r)=>{let n=document.createElementNS(dn,"svg");n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("aria-hidden","true"),n.setAttribute("fill","currentColor"),r&&n.setAttribute("class",r);let s=document.createElementNS(dn,"path");return s.setAttribute("d",ws[e]),n.append(s),n};var pr=(e,t)=>{U(N);let r=t,n=x("div","oc-sdk oc-sdk-search"),s=x("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=q("oc-sdk-search-clear");l.append(fe("close",14)),l.tabIndex=-1,n.append(fe("search",16,"oc-sdk-search-icon"),s,l),e.append(n);let i=()=>{let S=r.placeholder??"Search";Y(s,"placeholder",S),s.setAttribute("aria-label",r.label??S),l.setAttribute("aria-label","Clear search"),s.value!==r.value&&(s.value=r.value),n.dataset.active=r.value.trim()===""?"false":"true"},c=()=>{r.value!==""&&r.onChange(""),s.focus()},u=()=>{r.onChange(s.value)},p=S=>{S.key==="Escape"&&s.value!==""&&(S.preventDefault(),c())};return s.addEventListener("input",u),s.addEventListener("keydown",p),l.addEventListener("click",c),i(),r.autofocus&&s.focus(),{update:S=>{r={...r,...S},i()},dispose:()=>{s.removeEventListener("input",u),s.removeEventListener("keydown",p),l.removeEventListener("click",c),n.remove()}}};var _e=(e,t="vertical")=>{let[r,n]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===n||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},me=(e,t,r)=>{let n=e.filter(u=>!u.disabled);if(n.length===0)return null;let s=n[0],l=n[n.length-1];if(r==="first"||!s||!l)return s?.id??null;if(r==="last")return l.id;let i=n.findIndex(u=>u.id===t);return i===-1?r==="next"?s.id:l.id:n[Math.min(n.length-1,Math.max(0,i+(r==="next"?1:-1)))]?.id??null};var Er=(e,t)=>{U(N);let r=t,n=x("div","oc-sdk oc-sdk-tabs");n.setAttribute("role","tablist"),e.append(n);let s=()=>{ae(n),n.dataset.track=r.trackBackground?"true":"false";for(let i of r.items){let c=q("oc-sdk-tab");c.setAttribute("role","tab");let u=i.id===r.activeId;c.setAttribute("aria-selected",u?"true":"false"),c.tabIndex=u?0:-1,c.dataset.id=i.id;let p=x("span");if(p.textContent=i.label,c.append(p),i.count!==void 0){let S=x("span","oc-sdk-tab-count");S.textContent=String(i.count),c.append(S)}c.addEventListener("click",()=>{i.id!==r.activeId&&r.onChange(i.id)}),n.append(c)}},l=i=>{let c=_e(i,"horizontal");if(!c)return;let u=me(r.items,r.activeId,c);if(u&&u!==r.activeId){i.preventDefault(),r.onChange(u);let p=n.querySelector(`[data-id="${CSS.escape(u)}"]`);p instanceof HTMLElement&&p.focus()}};return n.addEventListener("keydown",l),s(),{update:i=>{r={...r,...i},s()},dispose:()=>{n.removeEventListener("keydown",l),n.remove()}}};var ct=(e,t)=>{Y(e,"data-tone",t&&t!=="neutral"?t:null)},fr=(e,t)=>{U(N);let r=t,n=x("span","oc-sdk oc-sdk-badge");e.append(n);let s=()=>{V(n,r.label),ct(n,r.tone)};return s(),{update:l=>{r={...r,...l},s()},dispose:()=>{n.remove()}}};var Ms=0,_r=(e,t)=>{U(N);let r=t,n=`oc-sdk-list-${Ms+=1}`,s=x("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,i=f=>`${n}-${f}`,c=f=>{l=f;for(let E of Array.from(s.children))E instanceof HTMLElement&&(E.dataset.active=E.id===i(f??"")?"true":"false");Y(s,"aria-activedescendant",f?i(f):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},u=(f,E)=>{let y=x("span",f);return y.textContent=E,y},p=()=>{if(ae(s),Y(s,"aria-label",r.ariaLabel),r.items.length===0){s.append(u("oc-sdk-list-empty",r.emptyText??"Nothing here")),c(null);return}for(let E of r.items){let y=q("oc-sdk-row");y.id=i(E.id),y.setAttribute("role","option"),y.setAttribute("aria-selected",E.id===r.selectedId?"true":"false"),y.disabled=!!E.disabled,y.tabIndex=-1,E.leading&&y.append(u("oc-sdk-row-lead",E.leading));let B=x("span","oc-sdk-row-main");if(B.append(u("oc-sdk-row-title",E.title)),E.subtitle&&B.append(u("oc-sdk-row-sub",E.subtitle)),y.append(B),E.badge){let z=u("oc-sdk-badge",E.badge.label);ct(z,E.badge.tone),y.append(z)}E.meta&&y.append(u("oc-sdk-row-meta",E.meta)),y.addEventListener("click",()=>r.onSelect(E.id)),s.append(y)}let f=r.items.some(E=>E.id===l&&!E.disabled);c(f?l:r.selectedId??null)},S=f=>{let E=_e(f);if(E){f.preventDefault(),c(me(r.items,l,E));return}(f.key==="Enter"||f.key===" ")&&l&&(f.preventDefault(),r.onSelect(l))};return s.addEventListener("keydown",S),p(),{update:f=>{r={...r,...f},p()},dispose:()=>{s.removeEventListener("keydown",S),s.remove()}}};var mr=(e,t)=>{U(N);let r=t,n=x("div","oc-sdk oc-sdk-empty"),s=x("h2","oc-sdk-empty-title"),l=x("p","oc-sdk-empty-body"),i=x("div","oc-sdk-empty-action");n.append(s,l,i),e.append(n);let c=null,u=()=>{if(V(s,r.title),V(l,r.body),l.hidden=!r.body,i.hidden=!r.action,!r.action){c?.dispose(),c=null;return}let p={label:r.action.label,onClick:r.action.onClick};c?c.update(p):c=ce(i,{...p,variant:"outline",size:"sm"})};return u(),{update:p=>{r={...r,...p},u()},dispose:()=>{c?.dispose(),c=null,n.remove()}}};var Sr=(e,t={})=>{U(N);let r=t,n=x("span","oc-sdk oc-sdk-spinner");n.setAttribute("role","status");let s=x("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=x("span");n.append(s,l),e.append(n);let i=()=>{n.dataset.size=r.size??"default",V(l,r.label),l.hidden=!r.label,n.setAttribute("aria-label",r.label??"Loading")};return i(),{update:c=>{r={...r,...c},i()},dispose:()=>{n.remove()}}};var Tr=(e,t)=>{U(N);let r=t,n=x("div","oc-sdk oc-sdk-banner"),s=x("div","oc-sdk-banner-text"),l=x("div","oc-sdk-banner-title"),i=x("div","oc-sdk-banner-body"),c=x("div","oc-sdk-banner-action");s.append(l,i),n.append(s,c),e.append(n);let u=null,p=()=>{if(n.dataset.tone=r.tone,n.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),V(l,r.title),V(i,r.body),i.hidden=!r.body,c.hidden=!r.action,!r.action){u?.dispose(),u=null;return}let S={label:r.action.label,onClick:r.action.onClick};u?u.update(S):u=ce(c,{...S,variant:"outline",size:"xs"})};return p(),{update:S=>{r={...r,...S},p()},dispose:()=>{u?.dispose(),u=null,n.remove()}}};var Ps=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,Ls=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},un=e=>{let t=[],r=0;for(let n of e.matchAll(Ps)){let s=n.index??0;s>r&&t.push({kind:"text",text:e.slice(r,s)});let l=n[1]??"",i=(n[2]??"").trim(),c=n[3]??"";Ls(c)?l==="!"?t.push({kind:"image",src:c,alt:i}):t.push({kind:"link",href:c,label:i||c}):t.push({kind:"text",text:n[0]}),r=s+n[0].length}return r<e.length&&t.push({kind:"text",text:e.slice(r)}),t},hr=(e,t)=>{U(N);let r=t,n=x("div","oc-sdk oc-sdk-text");e.append(n);let s=i=>{!(i.target instanceof HTMLAnchorElement)||!r.onOpenUrl||(i.preventDefault(),r.onOpenUrl(i.target.href))},l=()=>{ae(n);for(let i of un(r.text))if(i.kind==="text")n.append(document.createTextNode(i.text));else if(i.kind==="link"){let c=x("a");c.href=i.href,c.rel="noopener noreferrer",c.target="_blank",c.textContent=i.label,n.append(c)}else{let c=x("img");c.src=i.src,c.alt=i.alt,c.loading="lazy",c.referrerPolicy="no-referrer",n.append(c)}};return n.addEventListener("click",s),l(),{update:i=>{r={...r,...i},l()},dispose:()=>{n.removeEventListener("click",s),n.remove()}}};var pn=[];function ne(e){return pn.push(e),e}function En(){for(let e of pn.splice(0))try{e.dispose()}catch{}}var He=(e,t)=>ne(ce(e,t));var fn=(e,t)=>ne(pr(e,t));var _n=(e,t)=>ne(Er(e,t)),Xs=(e,t)=>ne(fr(e,t)),mn=(e,t)=>ne(_r(e,t)),Ce=(e,t)=>ne(mr(e,t)),Fs=(e,t)=>ne(Sr(e,t)),Sn=(e,t)=>ne(Tr(e,t));var js=(e,t)=>ne(hr(e,t));function Tn(e,t="notice"){let r=document.createElement("div");return r.className=t,js(r,{text:e,onOpenUrl:Bs}),r}function gr(e,t){let r=document.createElement("span"),n=ee(e,t);return Xs(r,{label:n.label,tone:n.tone}),r}function Rr(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Fs(t,{label:e}),t}function hn(e){rr(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function Bs(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}$.openUrl(e).catch(()=>{})}}function Ws(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)}function gn(e){return`project:${Ws(e)}`}function Ks(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function $e(e){return typeof e=="string"&&e.length>0?e:null}function zs(e){if(!Ks(e))return null;let t=$e(e.projectId),r=$e(e.projectName),n=$e(e.orgName),s=$e(e.directory);if(!t||!r||!n||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:r,orgName:n,slug:$e(e.slug),source:l,directory:s}}async function Rn(e,t){let r=zs(await e.get(gn(t)));return!r||r.directory!==t?null:r}async function On(e,t,r){await e.set(gn(t),{projectId:r.projectId,projectName:r.projectName,orgName:r.orgName,slug:r.slug,source:r.source,directory:t})}function bn(e,t,r){return{directory:e,link:t,repo:r,target:Jr(r,t.orgName,t.projectName)}}async function xn(e){try{let t=await e(".git/config"),r=Qr(t.content);return r?Kr(r):null}catch{return null}}async function An(e,t,r,n){let s=await Rn(t,r);if(s)return bn(r,s,await xn(n));let l=await xn(n);if(!l)return null;for(let i of zr(l))try{let c=await e.findProjectBySlug(i);if(!c||!c.id)continue;return await On(t,r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected"}),bn(r,{projectId:c.id,projectName:c.name,orgName:c.orgName,slug:i,source:"detected",directory:r},l)}catch{}return null}var le=document.querySelector("#root");if(!le)throw new Error("CircleCI picker is missing its #root element.");var Ve=Fr(Vo),Js=$.storage,lt=null,d={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],filter:"all",search:"",currentWork:null,scopeOn:!1,selectedRun:null,workflows:[],jobs:{},jobErrors:{},selectedWorkflowId:null,loading:!0,loadingDetail:!1,error:null,busy:!1},Se=0;async function kn(){if(X(),d.directory=d.ready?.directory??null,!d.connected){d.loading=!1,X();return}if(!d.directory){d.loading=!1,X();return}try{if(d.workspace=await An(Ve,Js,d.directory,Zt),!d.workspace){d.loading=!1,X();return}d.currentWork=await qo({directory:d.directory,session:d.ready?.session??null,readFile:Zt,host:$}),await Or()}catch(e){d.loading=!1,d.error=ue(e),tr(e)&&(d.connected=!1),X()}}async function Or(){let e=d.workspace;if(!e)return;let t=++Se,r=d.scopeOn?st(d.currentWork):null;d.loading=!0,d.error=null,X();try{let n=r?await Ve.listRunsUntil(e.link.projectId,zo(r)):await Ve.listRuns(e.link.projectId);if(t!==Se)return;d.runs=n.items,d.loading=!1;let s=r?er(d.runs,r):d.runs,l=s.find(i=>te(i.outcome))??s.find(i=>ee(i.phase,i.outcome).active)??s[0];l?await yn(l):X()}catch(n){if(t!==Se)return;d.loading=!1,d.error=ue(n),tr(n)&&(d.connected=!1),X()}}async function yn(e){let t=++Se;d.selectedRun=e,d.workflows=[],d.jobs={},d.selectedWorkflowId=null,d.loadingDetail=!0,X();try{let r=await Ve.listWorkflows(e.id);if(t!==Se)return;d.workflows=r.items,d.jobErrors={};let n=await Promise.allSettled(r.items.map(l=>Ve.listJobs(l.id)));if(t!==Se)return;for(let[l,i]of n.entries()){let c=r.items[l];c&&(i.status==="fulfilled"?d.jobs[c.id]=i.value.items:(d.jobs[c.id]=[],d.jobErrors[c.id]=ue(i.reason)))}let s=r.items.find(l=>te(l.outcome));In(s??r.items[0]??null)}catch(r){if(t!==Se)return;d.error=ue(r)}d.loadingDetail=!1,X()}function In(e){d.selectedWorkflowId=e?.id??null}function br(){let e=d.workspace,t=d.selectedRun,r=d.workflows.find(i=>i.id===d.selectedWorkflowId)??null;if(!e||!t)return null;let n=r?d.jobs[r.id]??[]:[],s=r?d.jobErrors[r.id]??null:null,l=r?n.find(i=>te(i.outcome))??null:null;return{workspace:e,run:t,workflow:r,job:l,jobs:n,jobsError:s,detail:null,output:null}}async function qs(){let e=br();if(e){d.busy=!0,X();try{await Fo(e),await $.close()}catch(t){d.busy=!1,d.error=ue(t),X()}}}async function Qs(){let e=br();if(e){d.busy=!0,X();try{await jo(e),await $.close()}catch(t){d.busy=!1,d.error=ue(t),X()}}}function Ys(){return d.scopeOn?st(d.currentWork):void 0}function Zs(){return Jo(d.runs,d.filter,d.search,Ys())}function ei(){return d.scopeOn=!d.scopeOn,d.selectedRun=null,d.workflows=[],d.jobs={},d.jobErrors={},d.selectedWorkflowId=null,Or()}function ti(){let e=I("div");return He(e,{label:Qo(d.currentWork),size:"sm",variant:d.scopeOn?"default":"outline",onClick:()=>void ei()}),e}function X(){if(En(),lt=null,Zo(le),!d.connected){let t=I("div");le?.append(t),Ce(t,{title:"Connect CircleCI",body:"Add a personal API token on the CircleCI card in Settings \u2192 Integrations, then open this picker again.",action:{label:"Close",onClick:()=>void $.close()}});return}if(!d.directory){let t=I("div");le?.append(t),Ce(t,{title:"No project open",body:"Open a project in OpenChamber first.",action:{label:"Close",onClick:()=>void $.close()}});return}if(!d.workspace){let t=I("div");le?.append(t),Ce(t,{title:"Choose a CircleCI project",body:"Open the CircleCI panel once to choose which CircleCI project this repository maps to. This picker then shares that choice.",action:{label:"Close",onClick:()=>void $.close()}});return}if(d.error){let t=I("div");le?.append(t),Sn(t,{tone:"error",title:"CircleCI",body:d.error,action:{label:"Retry",onClick:()=>void Or()}})}let e=I("div",{className:"picker-columns"});e.append(ri()),e.append(oi()),le?.append(e),le?.append(ni())}function ri(){let e=I("div",{className:"column"}),t=I("div"),r=_n(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:d.filter,onChange:f=>{d.filter=Bo(f),r.update({activeId:d.filter}),lt?.paint()}});e.append(t);let n=I("div",{className:"filter-row"}),s=I("div",{style:"flex:1; min-width:0;"});if(n.append(s),d.currentWork){let f=I("div");f.append(ti()),n.append(f)}e.append(n);let l=d.scopeOn?Yo(d.currentWork):null;l&&e.append(I("p",{className:"muted scope-note",text:l}));let i=I("div",{className:"scroll"});e.append(i);let c=()=>Zs().map(f=>{let E=ee(f.phase,f.outcome);return{id:f.id,leading:`#${f.number}`,title:de(f),...f.commitSubject?{subtitle:f.commitSubject}:{},meta:[mt(f.createdAt),St(f)].filter(Boolean).join(" \xB7 "),badge:{label:E.label,tone:E.tone}}}),u=()=>{if(d.runs.length===0)return"No runs yet. Push a commit first.";if(d.scopeOn){let f=st(d.currentWork),E=!!f.branch&&f.prNumbers.length>0;return`No ${f.branch?`runs on ${f.branch}${E?" or its pull requests":""}`:"runs for the linked pull requests"} in the loaded pages.`}return"No run matches this filter."};if(d.loading&&d.runs.length===0)return i.append(Rr("Loading runs")),e;let p=mn(i,{items:c(),emptyText:u(),selectedId:d.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:f=>{let E=d.runs.find(y=>y.id===f);E&&yn(E)}}),S=null;return S=fn(s,{value:d.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:f=>{d.search=f,S?.update({value:f}),lt?.paint()}}),lt={tabs:r,paint:()=>p.update({items:c(),emptyText:u()})},e}function oi(){let e=I("div",{className:"column"}),t=d.selectedRun;if(!t){let s=I("div");return e.append(s),Ce(s,{title:"Pick a run",body:"Choose a run on the left."}),e}let r=I("div",{className:"detail-head"});r.append(I("div",{className:"badge-line"},gr(t.phase,t.outcome))),r.append(I("div",{className:"detail-title"},`#${t.number} ${de(t)}`)),r.append(I("div",{className:"detail-sub"},[t.commitSubject??"",t.branch??t.tag??"",St(t),mt(t.createdAt)].filter(Boolean).join(" \xB7 "))),e.append(r);let n=I("div",{className:"scroll"});if(e.append(n),d.loadingDetail)return n.append(Rr("Loading workflows")),e;if(d.workflows.length===0){let s=I("div");return n.append(s),Ce(s,{title:"No workflows",body:"This run produced no workflows."}),e}for(let s of d.workflows){let l=s.id===d.selectedWorkflowId,i=I("div",{className:l?"job-row job-row-active":"job-row"}),c=I("div",{className:"job-row-head"}),u=I("button",{className:"job-row-name",text:s.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});u.addEventListener("click",()=>{In(s),X()}),c.append(u),c.append(I("span",{className:"job-row-meta"},Wr(s.createdAt,s.endedAt))),c.append(gr(s.phase,s.outcome)),i.append(c);let p=d.jobs[s.id]??[],S=p.filter(E=>te(E.outcome)),f=d.jobErrors[s.id];f?i.append(Tn(`Could not list this workflow's jobs: ${f}`,"notice error-text")):S.length>0?i.append(I("p",{className:"notice"},`Failing: ${S.map(E=>E.name).join(", ")}`)):p.length>0&&i.append(I("p",{className:"notice"},`${p.length} jobs`)),n.append(i)}return e}function ni(){let e=I("div",{className:"footer"}),t=br(),r=d.workflows.find(i=>i.id===d.selectedWorkflowId)?.name;e.append(I("span",{className:"muted",style:"flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"},r?`Attaching ${r}`:"Pick a workflow"));let n=I("div");He(n,{label:"Close",size:"sm",variant:"ghost",onClick:()=>void $.close()}),e.append(n);let s=I("div");He(s,{label:"Start a chat",size:"sm",variant:"outline",disabled:!t||d.busy,onClick:()=>void Qs()}),e.append(s);let l=I("div");return He(l,{label:"Attach",size:"sm",disabled:!t||d.busy,loading:d.busy,onClick:()=>void qs()}),e.append(l),e}$.onReady(e=>{hn(e),tn(),d.ready=e,!d.booted&&(d.booted=!0,d.connected=e.connection.connected,kn())});$.onConnection(e=>{let t=d.connected;d.connected=e.connected,e.connected&&!t&&kn(),!e.connected&&t&&X()});})();
