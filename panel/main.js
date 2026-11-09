"use strict";(()=>{var ye=class extends Error{status;code;constructor(t,r,o){super(o),this.name="CircleCIError",this.status=t,this.code=r}},ys="/api/v3",dt=20,Vt=20,mo=50,Is=50,Ze=4,ca=Ze*dt,So=[1e3,2500],k=e=>typeof e=="object"&&e!==null?e:{},ve=e=>Array.isArray(e)?e:[],T=e=>typeof e=="string"&&e.length>0?e:null,et=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function bo(e){return ve(e).map(t=>{let r=k(t);return{type:T(r.type)??"unknown",message:T(r.message)??""}})}function Ro(e){return ve(e).map(t=>{let r=k(t);return{type:T(r.type)??"unknown",message:T(r.message)??"",description:T(r.description),url:T(r.url)}})}function lt(e){let t=k(e),r=k(t.attributes),o=k(t.references),s=k(o.event),c=k(s.attributes),a=k(c.vcs),l=k(a.commit),p=k(o.pipeline),u=k(o.trigger),_=k(u.attributes);return{id:T(t.id)??"",number:et(r.number)??0,phase:T(r.phase)??"unknown",outcome:T(r.current_outcome),createdAt:T(r.created_at)??"",branch:T(a.branch),tag:T(a.tag),revision:T(a.revision),commitSubject:T(l.subject),commitUrl:T(l.url),pipelineName:T(k(p.attributes).name),trigger:T(_.name)??T(k(_.event_source).type)??T(c.type),errors:bo(r.errors),warnings:Ro(r.warnings)}}function ws(e){let t=k(e),r=k(t.attributes),o=k(r.auto_rerun);return{id:T(t.id)??"",name:T(r.name)??"Workflow",phase:T(r.phase)??"unknown",outcome:T(r.current_outcome)??T(r.outcome),createdAt:T(r.created_at),endedAt:T(r.ended_at),tag:T(r.tag),autoRerunNumber:et(o.number)}}function Ft(e){let t=k(e),r=k(t.attributes);return{id:T(t.id)??"",name:T(r.name)??"Job",number:et(r.number)??0,type:T(r.type)??"build",phase:T(r.phase)??"unknown",outcome:T(r.outcome),startedAt:T(r.started_at),endedAt:T(r.ended_at)}}function Cs(e){let t=k(e);return{num:et(t.num)??0,name:T(t.name)??"Step",type:T(t.type)??"run",phase:T(t.phase)??"unknown",outcome:T(t.outcome),exitCode:et(t.exit_code),command:T(t.command),startedAt:T(t.started_at),endedAt:T(t.ended_at)}}function vs(e){let t=Ft(e),r=k(k(e).attributes),o=ve(r.parallel_executions).map(k),s=o.length>0?ve(o[0]?.steps).map(Cs):[];return{...t,errors:bo(r.errors),warnings:Ro(r.warnings),steps:s,parallelExecutions:o.length}}function To(e){let t=k(e),r=k(t.attributes),o=k(k(t.references).org);return{id:T(t.id)??"",name:T(r.name)??"Project",orgId:T(o.id)??"",orgName:T(k(o.attributes).name)??""}}function Ns(e){let t=k(e),r=k(t.attributes);return{id:T(t.id)??"",name:T(r.name)??"Organization",vcsProvider:T(k(r.vcs).provider)}}function ho(e){let t=k(e),r=k(t.attributes),o=k(r.config);return{id:T(t.id)??"",name:T(r.name)??"Pipeline",configPath:T(o.file_path)??""}}function Us(e){let t=k(e),r=k(t.attributes);return{id:T(t.id)??"",login:T(r.login)??"CircleCI account",name:T(r.name),avatarUrl:T(r.avatar_url)}}function Ps(e){if(!e)return;let t={};for(let[r,o]of Object.entries(e))o==null||o===""||(t[r]=String(o));return Object.keys(t).length>0?t:void 0}function go(e){if(e)try{return JSON.parse(e)}catch{return}}function Ms(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Ls(e,t,r){let o=k(k(t).error),s=T(o.detail)??T(o.title)??T(o.type)??Ms(e);return new ye(e,T(o.type)??`HTTP_${e}`,s)}function Ds(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function Gs(e){return new Promise(t=>setTimeout(t,e))}function Oo(e){async function t(a,l){let p=Ps(a.query),u=0;for(;;){let _=await e({method:a.method,path:ys+a.path,...p?{query:p}:{},...a.body===void 0?{}:{body:JSON.stringify(a.body)}});if(_.status>=400){if(Ds(_.status,a.method)&&u<So.length){await Gs(So[u]??2500),u+=1;continue}throw Ls(_.status,go(_.body),_.body)}return l(_.body)}}let r=a=>t(a,go),o=a=>t(a,l=>l);async function s(a,l,p,u,_){let h=_?{...l,"page[cursor]":_}:{...l,"page[limit]":p},E;try{E=await r({method:"GET",path:a,query:h})}catch(g){if(!_&&g instanceof ye&&g.status===400)E=await r({method:"GET",path:a,query:{...l}});else throw g}return{items:ve(k(E).data).map(u),next:T(k(k(E).page).next)}}async function c(a,l,p,u,_){let h=[],E,g=null;for(let U=0;U<_;U+=1){let X=await s(a,l,p,u,E);if(h.push(...X.items),g=X.next,!g)break;E=g}return{items:h,next:g}}return{currentUser:async()=>{let a=await r({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),l=ve(k(a).data)[0];if(!l)throw new ye(200,"EMPTY_USER","CircleCI returned no user.");return Us(l)},listOrgs:async()=>(await c("/orgs",{},mo,Ns,Ze)).items,findProjectBySlug:async a=>{let l=await r({method:"GET",path:"/projects",query:{"filter[slug]":a}}),p=ve(k(l).data)[0];return p?To(p):null},listProjectsOfOrg:a=>c("/projects",{"filter[org_id]":a},mo,To,Ze),listPipelines:async a=>{let l=await c("/pipelines",{"filter[project_id]":a},Is,ho,1),p=[];for(let u of l.items)if(u.id)try{let _=await r({method:"GET",path:`/pipelines/${encodeURIComponent(u.id)}`,query:{"filter[project_id]":a}});p.push(ho(k(_).data))}catch{p.push({...u,name:"Pipeline config"})}return p},listRuns:(a,l)=>s("/runs",{"filter[project_id]":a},dt,lt,l),listMyRuns:a=>s("/runs",{"filter[user_id]":"me"},dt,lt,a),getRun:async a=>{let l=await r({method:"GET",path:`/runs/${encodeURIComponent(a)}`});return lt(k(l).data)},findRunByNumber:async(a,l)=>{let p;for(let u=0;u<Ze;u+=1){let _=await s("/runs",{"filter[project_id]":a},dt,lt,p),h=_.items.find(E=>E.number===l);if(h)return h;if(!_.next)return null;p=_.next}return null},fireRun:async a=>{let l=await r({method:"POST",path:"/runs",query:{"filter[project_id]":a.projectId},body:{data:{attributes:{checkout:{branch:a.branch}},references:{pipeline:{id:a.pipelineId}}}}}),p=T(k(k(l).data).id);if(!p)throw new ye(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return p},listWorkflows:(a,l)=>s("/workflows",{"filter[run_id]":a},Vt,ws,l),listJobs:(a,l)=>l?s("/jobs",{"filter[workflow_id]":a},Vt,Ft,l):c("/jobs",{"filter[workflow_id]":a},Vt,Ft,Ze),getJob:async a=>{let l=await r({method:"GET",path:`/jobs/${encodeURIComponent(a)}`});return vs(k(l).data)},condensedOutput:async(a,l,p=0)=>o({method:"GET",path:`/jobs/${encodeURIComponent(a)}/stdout/condensed`,query:{"filter[execution]":p,"filter[step_num]":l}}).then(u=>typeof u=="string"?u:""),rerunWorkflow:async(a,l)=>{let p=await r({method:"POST",path:`/workflows/${encodeURIComponent(a)}/rerun`,body:l?{is_from_failed:!0}:void 0});return T(k(k(p).data).id)??""},cancelWorkflow:async a=>{await r({method:"POST",path:`/workflows/${encodeURIComponent(a)}/cancel`})},approve:async a=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(a)}/approve`})},reject:async a=>{await r({method:"POST",path:`/approvals/${encodeURIComponent(a)}/reject`})}}}var xo=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Hs={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function Ao(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function js(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function ae(e,t){let r=(t??"").toLowerCase(),o=(e??"").toLowerCase(),s=r||o,c=Ao(r)??Ao(o)??"neutral",a=r?!xo.has(r):!xo.has(o)&&o!=="ended";return{label:Hs[s]??js(s),tone:c,active:a}}function ue(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function Ge(e,t,r=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let s=t?Date.parse(t):r;if(!Number.isFinite(s)||s<o)return"";let c=Math.round((s-o)/1e3);if(c<60)return`${c}s`;let a=Math.floor(c/60),l=c%60;if(a<60)return l>0?`${a}m ${l}s`:`${a}m`;let p=Math.floor(a/60),u=a%60;return u>0?`${p}h ${u}m`:`${p}h`}function ut(e,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let o=Math.round((t-r)/1e3);if(o<45)return"just now";let s=Math.round(o/60);if(s<60)return`${s}m ago`;let c=Math.round(s/60);if(c<24)return`${c}h ago`;let a=Math.round(c/24);return a<7?`${a}d ago`:new Date(r).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function He(e){return e?e.slice(0,8):""}function Ne(e){return e.branch??e.tag??"detached"}var $s={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function ko(e){let t=e.trim();if(!t)return null;let r=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);r&&!t.includes("://")&&(t=`https://${r[1]}/${r[2]}/${r[3]}`);let o;try{o=new URL(t)}catch{return null}let s=o.hostname.toLowerCase();if(!s)return null;let c=o.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(c.length<2)return null;let a=c[c.length-2]??"",l=c[c.length-1]??"";return!a||!l?null:{host:s,owner:a,repo:l}}function Xt(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function yo(e,t,r){return{segment:e&&$s[e.host]||"github",owner:e?.owner??t,repo:e?.repo??r}}function Vs(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function tt(e,t){return`${Vs(e)}/${t}`}function rt(e,t,r){return`${tt(e,t)}/workflows/${r}`}function pt(e,t,r,o){return`${rt(e,t,r)}/jobs/${o}`}function Io(e){let t=null,r=null,o="";for(let s of e.split(/\r?\n/)){let c=s.trim();if(!c||c.startsWith("#")||c.startsWith(";"))continue;let a=/^\[([^\]]+)\]$/.exec(c);if(a){o=(a[1]??"").trim().toLowerCase();continue}let l=/^url\s*=\s*(.*)$/i.exec(c);if(!l)continue;let p=(l[1]??"").trim();p&&(r===null&&(r=p),(/remote\s+"origin"/i.test(o)||/remote\s+'origin'/i.test(o))&&(t=p))}return t??r}function wo(e){let t=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return t&&(t[1]??"").trim()||null}var Co="circleci",vo=16e3,Fs=200,Bt=2e3;function Wt(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function je(e){return ae(e.phase,e.outcome).label.toLowerCase()}function Xs(e,t){return e?`${e}/${t}`:t}function No(e){let{workspace:t,run:r,workflow:o,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:r.id,runNumber:r.number,branch:r.branch,workflowId:o?.id??null,workflowName:o?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function he(e){return typeof e=="string"&&e.length>0?e:null}function Uo(e){if(typeof e!="object"||e===null||Array.isArray(e))return null;let t=e,r=he(t.projectId),o=he(t.projectName),s=he(t.orgName)??"",c=he(t.runId),a=typeof t.runNumber=="number"&&Number.isFinite(t.runNumber)?t.runNumber:null;return!r||!o||!c||a===null?null:{projectId:r,projectName:o,orgName:s,runId:c,runNumber:a,branch:he(t.branch),workflowId:he(t.workflowId),workflowName:he(t.workflowName),jobId:he(t.jobId),jobName:he(t.jobName)}}function Po(e){let t=e.workflow?.id??"run",r=e.job?.id??"";return`${e.run.id}:${t}:${r}`}function Mo(e){let{run:t,workflow:r,job:o}=e,s=o?.name??r?.name??`run #${t.number}`,c=je(o?{phase:o.phase,outcome:o.outcome}:r||{phase:t.phase,outcome:t.outcome});return Wt(`${s} ${c} in CircleCI run #${t.number}`,Fs)}function Kt(e){let{workspace:t,run:r,workflow:o,job:s}=e;return o&&s&&s.number>0?pt(t.target,r.number,o.id,s.number).slice(0,Bt):o?rt(t.target,r.number,o.id).slice(0,Bt):tt(t.target,r.number).slice(0,Bt)}function zt(e){let{workspace:t,run:r,workflow:o,job:s,jobs:c,jobsError:a,detail:l,output:p}=e,u=[];u.push(`CircleCI run #${r.number} on ${Xs(t.link.orgName,t.link.projectName)}`),u.push(`Status: ${je({phase:r.phase,outcome:r.outcome})}`),r.pipelineName&&u.push(`Pipeline: ${r.pipelineName}`),u.push(`Ref: ${Ne(r)}${r.revision?` at ${He(r.revision)}`:""}`),r.commitSubject&&u.push(`Commit: ${r.commitSubject}`),u.push(`URL: ${Kt(e)}`);let _=c.filter(h=>ue(h.outcome));if(o){if(u.push(""),u.push(`Workflow ${o.name} (${je(o)})`),a&&u.push(`Job listing unavailable: ${a}`),_.length>0){u.push("Failing jobs:");for(let E of _)u.push(`- ${E.name} (#${E.number})`)}let h=c.filter(E=>!_.includes(E));if(h.length>0){u.push("Other jobs:");for(let E of h)u.push(`- ${E.name}: ${je({phase:E.phase,outcome:E.outcome})}`)}}if(s&&l){if(u.push(""),u.push(`Job ${l.name} (#${l.number})`),l.errors.length>0){u.push("Errors:");for(let E of l.errors)u.push(`- ${E.type}: ${E.message}`)}let h=l.steps.filter(E=>E.outcome==="failed");if(h.length>0){u.push("Failed steps:");for(let E of h)u.push(`- step ${E.num} "${E.name}"${E.exitCode!==null?` (exit ${E.exitCode})`:""}`),E.command&&u.push(`  command: ${E.command}`)}}return p&&p.trim()&&(u.push(""),u.push("Condensed output:"),u.push(p.trim())),Wt(u.join(`
`),vo)}function Lo(e){return Wt(`Investigate and fix this CircleCI failure.

${zt(e)}`,vo)}var w="openchamber.sdk";var ft="data-oc-scrolling",Jt=`
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
:hover, [${ft}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${ft}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${ft}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${ft}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function qt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let r=new WeakMap;e.addEventListener("scroll",o=>{let s=o.target===e?t:o.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let c=r.get(s);c!==void 0&&clearTimeout(c),r.set(s,setTimeout(()=>{r.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Bs=`(${qt.toString()})(document);`;var jo=/^[a-z][a-z0-9-]{0,39}$/;var Do=e=>Object(e)===e&&!Array.isArray(e),Qt=(e,t)=>Object.keys(e).every(r=>t.includes(r)),Go=e=>String(e)===e&&e.length>=1&&e.length<=60,Ho=e=>String(e)===e&&e.length>=1&&e.length<=80,$o=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let r of e){if(!Do(r)||!jo.test(r.id)||!Go(r.label)||r.disabled!==void 0&&r.disabled!==!0&&r.disabled!==!1||t.has(r.id))return!1;if(t.add(r.id),r.kind==="button"){if(!Qt(r,["kind","id","label","disabled"]))return!1;continue}if(r.kind!=="select"||!Qt(r,["kind","id","label","value","options","disabled"])||!Ho(r.value)||!Array.isArray(r.options)||r.options.length<1||r.options.length>16)return!1;let o=new Set;for(let s of r.options){if(!Do(s)||!Qt(s,["value","label"])||!Ho(s.value)||!Go(s.label)||o.has(s.value))return!1;o.add(s.value)}if(!o.has(r.value))return!1}return!0};var Vo=["{id}","{segment}","{segments+}"];var xa=new Set(Vo);var Fo=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var ka=new Set(Fo);var Yt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Xo=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let r=0;r<e.bytes.byteLength;r+=1)if(e.bytes[r]!==t.bytes[r])return!1;return!0};var Bo=/^[A-Za-z0-9_-]{1,80}$/;var Wo=["left","right","top","bottom"];var Ko=(e,t=0,r={remaining:16e3})=>{if(--r.remaining<0||t>=32)return!1;if(e===null)return!0;let o=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of o)if(!Ko(s,t+1,r))return!1;return!0},Zt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(Zt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(Zt)}return String(e)===e||Number.isFinite(e)},er=e=>{try{return String(e.id)!==e.id||!Bo.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Wo.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Ko(e.data)||!Zt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var rr=2e3;var Jo=["file","directory","other","missing"],or=e=>!!(e&&"sessionId"in e),nr=e=>!!(e&&"sent"in e&&!("sessionId"in e));var qo=/^[0-9a-f]{7,64}$/i,sr=e=>qo.test(e),Et=500,_t=32e3,Qo=16e3,Yo=128,Zo=200,en=2e3,tn=16e3,rn=80,on=200,nn=16e3;var sn=2e3;var ir=2e4,mt=1024,St=2e6;var Tt=64e3,ht=8e3,ar=4e3;var cr=96e4,Ks=60*6e4;var an=999,cn=1e4,ot=500,ln=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],dn=["stopped","starting","ready","failed"],zs=new Set(ln),un=e=>zs.has(e),pn=e=>e&&un(e)?e:"HOST_REJECTED",$e=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every($e):Object(e)===e?Object.values(e).every($e):!1,fn=e=>$e(e)&&JSON.stringify(e).length<=nn,zo=e=>e?.trim().slice(0,on)??"",Ve=e=>{let t=e.id.trim().slice(0,Yo),r=e.title.trim().slice(0,Zo),o=e.url.trim().slice(0,en),s=e.text?.trim().slice(0,tn),c=e.author?.trim().slice(0,rn),a=e.kind==="pull"?"pull":"issue",l={providerId:e.providerId.trim(),id:t,title:r||t,url:o,kind:a};if(s&&(l.text=s),c&&(l.author=c),a==="pull"){let p=zo(e.branches?.head),u=zo(e.branches?.base);p&&u&&(l.branches={head:p,base:u})}return fn(e.data)&&(l.data=e.data),l},lr=e=>{let t=Ve(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},dr=e=>{let t={text:e.text.trim().slice(0,Qo)};return e.send&&(t.send=!0),t},ur=e=>e===null||!Number.isFinite(e)?null:Math.min(an,Math.max(0,Math.round(e))),pr=e=>Number.isFinite(e)?Math.min(cn,Math.max(0,Math.ceil(e))):0;var Fe=e=>e.length>0&&e.length<=mt&&!e.includes("\0")&&!e.includes("\\");var gt=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>sn?!1:!e.split("/").some(r=>r==="."||r===".."),Js=new Set(dn),fr=e=>!!(e&&"status"in e&&Js.has(String(e.status))&&!("body"in e)),bt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Er=e=>!!(e&&"content"in e&&String(e.content)===e.content),_r=e=>!!(e&&"written"in e&&e.written===!0),mr=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),qs=new Set(Jo),Sr=e=>!!(e&&"kind"in e&&"size"in e&&qs.has(String(e.kind))&&Number.isFinite(e.size)),Tr=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Qs=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Ys=e=>Object(e)===e?e:null,tr=e=>String(e)===e&&e.length>0,Zs=e=>{if(!tr(e.id))return null;if(e.ok===!0){let t={channel:w,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&tr(e.error)?{channel:w,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:pn(tr(e.code)?e.code:void 0)}:null},hr=e=>{let t=Ys(e);return!t||t.channel!==w||t.v!==1?null:t.type==="result"?Zs(t):!Qs.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var En=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,ei=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",x=class extends Error{code;constructor(t,r){super(r),this.name="HostRequestError",this.code=t}},_n=()=>Promise.reject(new x("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Rt=()=>Promise.reject(new x("BAD_PATH",`File path must be 1 to ${mt} characters without NUL or backslash.`)),Ot=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new x("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},y=e=>(e.value+=1,`oc-${e.value}`),xr=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new x("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let r=e.acceptSource??(i=>i===t.parent),o=e.requestTimeoutMs??ir,s=new Set,c=new Set,a=new Set,l=new Set,p=new Set,u=new Set,_=new Set,h=new Set,E=new Set,g=new Set,U=new Set,X=new Set,N=[],O=null,K=null,Q=new Set,Ce=new Set,Ae=null,ke=null,De=!1,_e=new Map,me=new Map,Se=new Map,re=!1,m={value:0},S=null,Te=null,Qe=!1,Ye=!1,oo=null,no=i=>i?{sessionId:i.id,phase:i.busy?"started":"completed"}:null,oe=i=>{t.parent.postMessage(i,"*")},so=()=>{re||t.parent===t||X.size===0||S?.features?.lateGenerateResults!==!0||oe({channel:w,v:1,type:"generate-late-listen"})},H=(i,d)=>{for(let R of i)try{R(d)}catch(A){console.error(A)}},io=i=>{if(!(i instanceof MessageEvent)||!r(i.source))return;let d=hr(i.data);if(!d)return;if(d.type==="workspace"){let A=me.get(d.payload.subscriptionId);A&&H([A],d.payload.snapshot);return}if(d.type==="shells"){let A=Se.get(d.payload.subscriptionId);A&&H([A],d.payload.snapshot);return}if(d.type==="ready"){S=d.payload,Te=no(d.payload.session),H(s,d.payload),H(c,d.payload.directory),H(a,d.payload.session),Te&&H(l,Te),H(p,d.payload.connection),H(u,d.payload.settings),H(_,d.payload.item),d.payload.block&&H(h,d.payload.block),so();return}if(d.type==="service-event"){H(E,d.payload);return}if(d.type==="generate-late"){X.size===0?N.push(d.payload):H(X,d.payload);return}if(d.type==="directory"){S&&(S={...S,directory:d.payload.directory}),H(c,d.payload.directory);return}if(d.type==="session"){S&&(S={...S,session:d.payload.session}),d.payload.session?Te?.sessionId!==d.payload.session.id&&(Te=no(d.payload.session)):Te=null,H(a,d.payload.session);return}if(d.type==="session-lifecycle"){Te=d.payload,H(l,d.payload);return}if(d.type==="connection"){S&&(S={...S,connection:d.payload.connection}),H(p,d.payload.connection);return}if(d.type==="settings"){S&&(S={...S,settings:d.payload.settings}),H(u,d.payload.settings);return}if(d.type==="item"){S&&(S={...S,item:d.payload.item}),H(_,d.payload.item);return}if(d.type==="status-control-event"){H(g,d.payload);return}if(d.type==="popover-closed"){H(U,d.payload);return}if(d.type==="action"){let A=L=>{re||oe({channel:w,v:1,type:"action-result",id:d.id,payload:L})},D=K;if(!D){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>D(d.payload)).then(()=>A({ok:!0}),L=>{let W=(L instanceof Error?L.message:String(L)).trim();A({ok:!1,error:(W||"Action failed.").slice(0,ot)})});return}if(d.type==="file-open"){let A=d.payload;if(ke&&Xo(ke,A))return;ke=A,H(Q,d.payload);return}if(d.type==="file-saved"){H(Ce,d.payload.version);return}if(d.type==="file-snapshot"){let A=W=>{re||oe({channel:w,v:1,type:"file-snapshot-result",id:d.id,payload:W})},D=W=>A({error:(W.trim()||"Could not read the edited file.").slice(0,ot)}),L=Ae;if(!L){D("This extension does not edit files.");return}Promise.resolve().then(()=>L(d.payload.purpose)).then(W=>{if(Yt(W)>2e7){D(`The file is over ${2e7} ${"bytes"in W?"bytes":"characters"}.`);return}if(W.version.length>256){D(`The snapshot version is over ${256} characters.`);return}A({snapshot:"bytes"in W?{bytes:W.bytes,version:W.version}:{content:W.content,version:W.version}})},W=>D(W instanceof Error?W.message:String(W)));return}if(d.type==="resolve"){let A=L=>{oe({channel:w,v:1,type:"resolve-result",id:d.id,payload:L})},D=O;if(!D){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>D(d.payload)).then(L=>A({item:L?Ve(L):null}),L=>{let W=(L instanceof Error?L.message:String(L)).trim();A({error:(W||"Command failed.").slice(0,ot)})});return}let R=_e.get(d.id);if(R){if(clearTimeout(R.timer),_e.delete(d.id),d.ok){R.resolve(d.payload);return}R.reject(new x(d.code,d.error))}};t.addEventListener("message",io),oe({channel:w,v:1,type:"hello"});let Z=(i,d=o)=>re||t.parent===t?Promise.reject(new x("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((R,A)=>{let D=setTimeout(()=>{_e.delete(i.id),A(new x("HOST_TIMEOUT","Host did not answer in time."))},d);_e.set(i.id,{resolve:R,reject:A,timer:D}),oe(i)}),V=i=>Z(i).then(()=>{}),B={channel:w,v:1},Ht=i=>{!re&&t.parent!==t&&oe(i)},ao=()=>Ht({...B,type:"file-save"}),co=i=>{!En(i)||!ei(i)||(i.preventDefault(),ao())},lo=i=>{!En(i)||i.key!=="Escape"||S?.surface!=="popover"||!S.popover||(i.preventDefault(),Eo(S.popover.id,"escape").catch(()=>{}))},it=()=>{let i=S?.surface==="popover"?S.popover:void 0;if(!i)return;let d=Qe||Ye;oo!==d&&(oo=d,_o(i.id,d).catch(()=>{}))},at=()=>{S?.surface!=="popover"||Qe||(Qe=!0,it())},uo=i=>{S?.surface!=="popover"||i.relatedTarget!==null||!Qe||(Qe=!1,it())},po=()=>{S?.surface!=="popover"||Ye||(Ye=!0,it())},fo=()=>{S?.surface!=="popover"||!Ye||(Ye=!1,it())},de=(i,d=1024)=>{if(!i.trim()||i.length>d)throw new x("HOST_REJECTED",`Identity must contain 1 to ${d} characters.`)},jt=async i=>{i.kind!=="projects"&&de(i.projectId);let d=await Z({...B,type:"workspace-read",id:y(m),payload:i});if(!d||!("kind"in d)||!("state"in d)||d.kind!==i.kind)throw new x("HOST_REJECTED","Host did not return workspace data.");return d},$t=async(i,d)=>{i.kind!=="projects"&&de(i.projectId);let R=y(m);me.set(R,d);try{await V({...B,type:"workspace-subscribe",id:y(m),payload:{subscriptionId:R,query:i}})}catch(A){throw me.delete(R),re||oe({...B,type:"workspace-unsubscribe",id:y(m),payload:{subscriptionId:R}}),A}return()=>{!me.delete(R)||re||oe({...B,type:"workspace-unsubscribe",id:y(m),payload:{subscriptionId:R}})}},ks=async(i,d)=>{i.kind==="session"&&de(i.sessionId),i.kind==="project"&&de(i.projectId);let R=y(m);Se.set(R,d);try{await V({...B,type:"shells-subscribe",id:y(m),payload:{subscriptionId:R,scope:i}})}catch(A){throw Se.delete(R),re||oe({...B,type:"shells-unsubscribe",id:y(m),payload:{subscriptionId:R}}),A}return()=>{!Se.delete(R)||re||oe({...B,type:"shells-unsubscribe",id:y(m),payload:{subscriptionId:R}})}},ct=async i=>{if("key"in i&&(i.key.length===0||i.key.length>128))throw new x("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!$e(i.value))throw new x("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>65536)throw new x("HOST_REJECTED","Storage value exceeds 64 KiB.");if(i.scope==="device"&&S?.features?.deviceStorage!==!0)throw new x("UNSUPPORTED","This host does not support device storage.");let d=await Z({...B,type:"storage",id:y(m),payload:i});if(!d||!("storage"in d)||d.op!==i.op)throw new x("HOST_REJECTED","Host did not return storage data.");return d},Eo=(i,d)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):V({...B,type:"popover-close",id:y(m),payload:d?{id:i,reason:d}:{id:i}}),_o=(i,d)=>S?.features?.popovers!==!0&&!(S?.surface==="popover"&&S.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):V({...B,type:"popover-anchor",id:y(m),payload:{id:i,active:d}});return t.addEventListener("keydown",lo,!0),t.addEventListener("pointerover",at),t.addEventListener("pointermove",at),t.addEventListener("pointerout",uo),t.addEventListener("focus",po),t.addEventListener("blur",fo),{onAction:i=>(K=i,()=>{K===i&&(K=null)}),listProjects:async()=>{let i=await jt({kind:"projects"});if(i.kind!=="projects")throw new x("HOST_REJECTED","Expected projects.");return i},listWorktrees:async i=>{let d=await jt({kind:"worktrees",projectId:i});if(d.kind!=="worktrees")throw new x("HOST_REJECTED","Expected worktrees.");return d},listSessions:async i=>{let d=await jt({kind:"sessions",projectId:i});if(d.kind!=="sessions")throw new x("HOST_REJECTED","Expected sessions.");return d},onProjects:i=>$t({kind:"projects"},d=>{d.kind==="projects"&&i(d)}),onWorktrees:(i,d)=>$t({kind:"worktrees",projectId:i},R=>{R.kind==="worktrees"&&d(R)}),onSessions:(i,d)=>$t({kind:"sessions",projectId:i},R=>{R.kind==="sessions"&&d(R)}),onRunningShells:(i,d)=>ks(i,d),readShellOutput:async(i,d)=>{de(i,128);let R=d?.cursor;if(R!==void 0&&(!Number.isInteger(R)||R<0))throw new x("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=d?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>65536))throw new x("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let L=await Z({...B,type:"shell-output",id:y(m),payload:{shellId:i,cursor:R,tailBytes:A}});if(!L||typeof L.output!="string"||!Number.isFinite(L.cursor))throw new x("HOST_REJECTED","Host did not return shell output.");return L},stopShell:async i=>{if(de(i,128),(await Z({...B,type:"shell-stop",id:y(m),payload:{shellId:i}}))?.stopped!==!0)throw new x("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async i=>{de(i),await V({...B,type:"open-session",id:y(m),payload:{sessionId:i}})},storage:{get:async(i,d)=>{let R=Ot(d),A={op:"get",key:i};R&&(A.scope=R);let D=await ct(A);return D.op==="get"&&D.found?D.value:void 0},set:async(i,d,R)=>{let A=Ot(R),D={op:"set",key:i,value:d};A&&(D.scope=A),await ct(D)},delete:async(i,d)=>{let R=Ot(d),A={op:"delete",key:i};R&&(A.scope=R),await ct(A)},keys:async i=>{let d=Ot(i),R={op:"keys"};d&&(R.scope=d);let A=await ct(R);if(A.op!=="keys")throw new x("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:i=>(s.add(i),S&&i(S),()=>{s.delete(i)}),onDirectory:i=>(c.add(i),S&&i(S.directory),()=>{c.delete(i)}),onSession:i=>(a.add(i),S&&i(S.session),()=>{a.delete(i)}),onSessionLifecycle:i=>(l.add(i),Te&&i(Te),()=>{l.delete(i)}),onConnection:i=>(p.add(i),S&&i(S.connection),()=>{p.delete(i)}),onSettings:i=>(u.add(i),S&&i(S.settings),()=>{u.delete(i)}),onItem:i=>(_.add(i),S&&i(S.item),()=>{_.delete(i)}),onBlock:i=>(h.add(i),S?.block&&i(S.block),()=>{h.delete(i)}),onServiceEvent:i=>(E.add(i),()=>{E.delete(i)}),onStatusControl:i=>(g.add(i),()=>{g.delete(i)}),onPopoverClosed:i=>(U.add(i),()=>{U.delete(i)}),setStatusControls:i=>S?.features?.statusControls!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support status controls.")):$o(i)?V({...B,type:"status-controls",id:y(m),payload:{controls:i}}):Promise.reject(new x("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:i=>S?.features?.popovers!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):er(i)?V({...B,type:"popover-open",id:y(m),payload:i}):Promise.reject(new x("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Eo,setPopoverAnchorActive:_o,onResolve:i=>(O=i,()=>{O===i&&(O=null)}),toast:i=>{let d=i.message.trim();return!d||d.length>Et?Promise.reject(new x("HOST_REJECTED",`Toast message must contain 1 to ${Et} characters.`)):i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>_t)?Promise.reject(new x("HOST_REJECTED",`Toast copy text must contain 1 to ${_t} characters.`)):V({channel:w,v:1,type:"toast",id:y(m),payload:{...i,message:d}})},openUrl:i=>V({channel:w,v:1,type:"open-url",id:y(m),payload:{url:i}}),openCommit:i=>sr(i)?V({channel:w,v:1,type:"open-commit",id:y(m),payload:{sha:i}}):Promise.reject(new x("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:i=>V({channel:w,v:1,type:"block-answer",id:y(m),payload:{text:i.trim().slice(0,rr)}}),openSurface:i=>V({channel:w,v:1,type:"open-surface",id:y(m),payload:{surfaceId:i}}),writeClipboard:i=>V({channel:w,v:1,type:"clipboard-write",id:y(m),payload:{text:i}}),compose:i=>V({channel:w,v:1,type:"compose",id:y(m),payload:i}),attach:i=>V({channel:w,v:1,type:"attach",id:y(m),payload:Ve(i)}),startSession:async i=>{i.projectId!==void 0&&de(i.projectId);let d=i.worktree;d&&d!==!0&&(d.kind==="existing"?de(d.directory):(d.name!==void 0&&de(d.name,200),d.baseBranch!==void 0&&de(d.baseBranch,200)));let R=await Z({channel:w,v:1,type:"start-session",id:y(m),payload:lr(i)},e.requestTimeoutMs??18e4);if(!or(R))throw new x("HOST_REJECTED","Host did not return a session.");return R},prompt:i=>Z({channel:w,v:1,type:"prompt",id:y(m),payload:dr(i)}).then(d=>{if(!nr(d))throw new x("HOST_REJECTED","Host did not return a prompt result.");return d}),sessionLink:i=>V({channel:w,v:1,type:"session-link",id:y(m),payload:Ve(i)}),close:()=>V({channel:w,v:1,type:"close",id:y(m)}),oauthStart:()=>V({channel:w,v:1,type:"oauth-start",id:y(m)}),oauthDisconnect:()=>V({channel:w,v:1,type:"oauth-disconnect",id:y(m)}),request:i=>(gt(i.path)?Z({channel:w,v:1,type:"request",id:y(m),payload:i}):_n()).then(d=>{if(!bt(d))throw new x("HOST_REJECTED","Host request result was empty.");return d}),serviceRequest:i=>(gt(i.path)?Z({channel:w,v:1,type:"service-request",id:y(m),payload:i}):_n()).then(d=>{if(!bt(d))throw new x("HOST_REJECTED","Host service request result was empty.");return d}),serviceStatus:()=>Z({channel:w,v:1,type:"service-status",id:y(m)}).then(i=>{if(!fr(i))throw new x("HOST_REJECTED","Host did not return service status.");return i}),readFile:i=>(Fe(i)?Z({channel:w,v:1,type:"file-read",id:y(m),payload:{path:i}}):Rt()).then(d=>{if(!Er(d))throw new x("HOST_REJECTED","Host did not return file content.");return d}),writeFile:(i,d)=>Fe(i)?d.length>St?Promise.reject(new x("FILE_TOO_LARGE",`Content is over ${St} characters.`)):Z({channel:w,v:1,type:"file-write",id:y(m),payload:{path:i,content:d}}).then(R=>{if(!_r(R))throw new x("HOST_REJECTED","Host did not confirm the write.");return R}):Rt(),listDir:i=>(Fe(i)?Z({channel:w,v:1,type:"file-list",id:y(m),payload:{path:i}}):Rt()).then(d=>{if(!mr(d))throw new x("HOST_REJECTED","Host did not return directory entries.");return d}),stat:i=>(Fe(i)?Z({channel:w,v:1,type:"file-stat",id:y(m),payload:{path:i}}):Rt()).then(d=>{if(!Sr(d))throw new x("HOST_REJECTED","Host did not return file status.");return d}),generate:i=>{let d=i.prompt.trim(),R=i.system?.trim();if(d.length===0||d.length>Tt)return Promise.reject(new x("HOST_REJECTED",`Prompt must be 1 to ${Tt} characters.`));if(R!==void 0&&(R.length===0||R.length>ht))return Promise.reject(new x("HOST_REJECTED",`System prompt must be 1 to ${ht} characters.`));let A=i.maxOutputTokens===void 0?void 0:Math.min(ar,Math.max(1,Math.floor(i.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new x("HOST_REJECTED","maxOutputTokens must be a number."));let D={prompt:d};return R!==void 0&&(D.system=R),A!==void 0&&(D.maxOutputTokens=A),Z({channel:w,v:1,type:"generate",id:y(m),payload:D},e.requestTimeoutMs??cr).then(L=>{if(!Tr(L))throw new x("HOST_REJECTED","Host did not return generated text.");return L})},onLateGenerateResult:i=>{X.add(i);for(let d of N.splice(0))H([i],d);return so(),()=>{X.delete(i)}},setBadge:i=>V({channel:w,v:1,type:"badge",id:y(m),payload:{count:ur(i)}}),setHeight:i=>V({channel:w,v:1,type:"resize",id:y(m),payload:{height:pr(i)}}),onFileOpen:i=>(Q.add(i),De||(De=!0,t.addEventListener("keydown",co,!0)),ke&&i(ke),()=>{Q.delete(i)}),onFileSnapshot:i=>(Ae=i,()=>{Ae===i&&(Ae=null)}),onFileSaved:i=>(Ce.add(i),()=>{Ce.delete(i)}),reportFileChange:i=>Ht({...B,type:"file-change",payload:{dirty:i.dirty,edited:i.edited}}),requestFileSave:ao,reportFileUnsupported:()=>Ht({...B,type:"file-unsupported"}),dispose:()=>{for(let i of me.keys())oe({...B,type:"workspace-unsubscribe",id:y(m),payload:{subscriptionId:i}});me.clear();for(let i of Se.keys())oe({...B,type:"shells-unsubscribe",id:y(m),payload:{subscriptionId:i}});Se.clear(),re=!0,O=null,K=null,Ae=null,Q.clear(),Ce.clear(),De&&t.removeEventListener("keydown",co,!0),t.removeEventListener("message",io),t.removeEventListener("keydown",lo,!0),t.removeEventListener("pointerover",at),t.removeEventListener("pointermove",at),t.removeEventListener("pointerout",uo),t.removeEventListener("focus",po),t.removeEventListener("blur",fo);for(let i of _e.values())clearTimeout(i.timer),i.reject(new x("HOST_UNAVAILABLE","Host client was disposed."));_e.clear(),s.clear(),c.clear(),a.clear(),l.clear(),p.clear(),u.clear(),_.clear(),h.clear(),E.clear(),g.clear(),U.clear(),X.clear(),N.length=0}}};var Tn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var $a=new Set(Tn);var ti=10*6e4;var ri=10*6e4;var oi=10*6e4;var ni=10*6e4;var hn=["none","agent","user"];var Fa=new Set(hn);var Y=xr(),gn=async e=>Y.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function ee(e,t){try{await Y.toast({kind:e,message:t})}catch{}}function xt(e){return Y.readFile(e)}function bn(e){return{providerId:Co,id:Po(e).slice(0,128),title:Mo(e),url:Kt(e),kind:"issue",text:zt(e),data:No(e)}}async function Rn(e){await Y.attach(bn(e))}async function On(e,t={}){await Y.startSession({...bn(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}async function xn(e,t={}){await Y.prompt({text:Lo(e),send:t.send??!0})}function f(e,t={},...r){let o=document.createElement(e);t.className&&(o.className=t.className),t.text!==void 0&&(o.textContent=t.text),t.title&&(o.title=t.title),t.style&&o.setAttribute("style",t.style),t.role&&o.setAttribute("role",t.role),t.ariaLabel&&o.setAttribute("aria-label",t.ariaLabel);for(let s of r)s==null||s===!1||o.append(typeof s=="string"?document.createTextNode(s):s);return o}function An(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function Xe(e,t){return t?f("div",{className:"meta-row"},f("span",{className:"meta-label",text:e}),f("span",{className:"meta-value",text:t})):null}var si={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function z(e){return e instanceof ye?e.message:e instanceof x?si[e.code]??e.message:e instanceof Error?e.message:String(e)}function ii(e){return e instanceof x?e.code:null}function At(e){let t=ii(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}function kn(e){let t=null,r=()=>{t!==null&&(window.clearTimeout(t),t=null)};return{arm:()=>{r(),!(!e.enabled()||!e.active())&&(t=window.setTimeout(()=>{t=null,e.onTick()},e.delayMs))},stop:r}}var ai=["all","failed","running"];function yn(e){return ai.includes(e)?e:"all"}function ci(e){return[`#${e.number}`,Ne(e),He(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function li(e,t,r=""){if(t==="failed"&&!ue(e.outcome)||t==="running"&&!ae(e.phase,e.outcome).active)return!1;let o=r.trim().toLowerCase();return o===""||ci(e).includes(o)}function In(e,t,r=""){return e.filter(o=>li(o,t,r))}function nt(e){return e.some(t=>ae(t.phase,t.outcome).active)}var di=`
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
`,wn="circleci-shared-style";function Cn(){if(document.getElementById(wn))return;let e=document.createElement("style");e.id=wn,e.textContent=di,document.head.append(e)}async function vn(e,t,r,o){try{return await e.rerunWorkflow(t.id,r.fromFailed),await o("success",`Rerun started for ${t.name}.`),!0}catch(s){return await o("error",z(s)),!1}}async function Nn(e,t,r,o){if(t.length===0)return await o("info",r.fromFailed?"No failed workflow to rerun.":"This run has no workflows to rerun."),{started:0,failed:0};let s=0,c=0;for(let a of t)try{await e.rerunWorkflow(a.id,r.fromFailed),s+=1}catch{c+=1}return s>0&&await o("success",`Started ${s} rerun${s===1?"":"s"}.`),c>0&&await o("error",`${c} rerun${c===1?"":"s"} could not be started.`),{started:s,failed:c}}async function Un(e,t,r){try{return await e.cancelWorkflow(t.id),await r("success",`Cancellation requested for ${t.name}.`),!0}catch(o){return await r("error",z(o)),!1}}async function Pn(e,t,r){try{return await e.approve(t.id),await r("success",`Approved ${t.name}.`),!0}catch(o){return await r("error",z(o)),!1}}async function Mn(e,t,r){try{return await e.reject(t.id),await r("success",`Rejected ${t.name}.`),!0}catch(o){return await r("error",z(o)),!1}}var Ln="prefs";function ui(e){let t=5381;for(let r=0;r<e.length;r+=1)t=(t<<5)+t+e.charCodeAt(r)>>>0;return t.toString(36)}function Dn(e){return`project:${ui(e)}`}function Gn(e){return`pipelines:${e}`}function Ar(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ie(e){return typeof e=="string"&&e.length>0?e:null}function pi(e){if(!Ar(e))return null;let t=Ie(e.projectId),r=Ie(e.projectName),o=Ie(e.orgName),s=Ie(e.directory);if(!t||!r||!o||!s)return null;let c=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:r,orgName:o,slug:Ie(e.slug),source:c,directory:s}}async function Hn(e,t){let r=pi(await e.get(Dn(t)));return!r||r.directory!==t?null:r}async function kr(e,t,r){await e.set(Dn(t),{projectId:r.projectId,projectName:r.projectName,orgName:r.orgName,slug:r.slug,source:r.source,directory:t})}var fi={autoRefresh:!0};function Ei(e){return Ar(e)?{autoRefresh:e.autoRefresh!==!1}:{...fi}}async function yr(e){return Ei(await e.get(Ln))}async function jn(e,t){let o={...await yr(e),...t};return await e.set(Ln,{autoRefresh:o.autoRefresh}),o}function _i(e){if(!Array.isArray(e))return null;let t=[];for(let r of e){if(!Ar(r))continue;let o=Ie(r.id),s=Ie(r.name);!o||!s||t.push({id:o,name:s,configPath:Ie(r.configPath)??""})}return t.length>0?t:null}async function $n(e,t){return _i(await e.get(Gn(t)))}async function Vn(e,t,r){await e.set(Gn(t),r.map(o=>({id:o.id,name:o.name,configPath:o.configPath})))}var mi=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Si=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Fn=(e,t)=>{t.style.colorScheme=e.mode;for(let[r,o]of mi)t.style.setProperty(r,e.tokens[o]);for(let[r,o,s]of Si){let c=e.tokens[s]??"";t.style.setProperty(r,c),t.style.setProperty(o,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},Ir=(e,t)=>{Fn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var Ti={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},G=(e,t)=>`var(--${e}, var(--oc-${Ti[e]}, ${t}))`,be=G("surface-background","transparent"),yt=G("surface-elevated","transparent"),Be=G("surface-elevated-foreground","inherit"),ne=G("surface-foreground","inherit"),j=G("surface-muted-foreground","gray"),hi=G("surface-muted","transparent"),Ue=G("interactive-border","currentColor"),te=G("interactive-hover","transparent"),Pe=G("interactive-active","transparent"),wr=G("interactive-selection","transparent"),Cr=G("interactive-selection-foreground","inherit"),ge=G("primary","currentColor"),vr=G("primary-text","inherit"),Nr=G("error-text","inherit"),gi=G("font-sans","inherit"),Ur=G("font-mono","monospace"),Kn=G("radius","9px"),Pr=`calc(${Kn} - 2px)`,Xn=`calc(${Kn} - 4px)`,$=(e,t,r="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${r})`,Bn=`background-image: linear-gradient(${te}, ${te});`,Mr=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Lr="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Wn="box-shadow: var(--oc-sdk-lit);",Dr=`inset 0 0.5px 0 0 ${$(ne,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,bi=`
:root {
  --oc-sdk-edge: ${$(ne,16)};
  --oc-sdk-field-bg: ${yt};
  --oc-sdk-raised-bg: ${be};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${$(ne,14)};
  --oc-sdk-field-bg: ${$(be,50,yt)};
  --oc-sdk-raised-bg: ${yt};
  --oc-sdk-field-lift: ${Dr};
  --oc-sdk-raised-lift: ${Dr};
  --oc-sdk-lit: ${Dr};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,kt=e=>{let t=G(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${G(`${e}-text`,"inherit")}; }`},Ri=`
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
`,zn=`${bi}
.oc-sdk { color: ${ne}; font-family: ${gi}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Bn} }
.oc-sdk-mono { font-family: ${Ur}; }
.oc-sdk-muted { color: ${j}; }
${kt("success")}${kt("warning")}${kt("error")}${kt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ge}; --oc-sdk-tone-text: ${vr}; }

.oc-sdk-btn { border-radius: ${Pr}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Xn}; }
.oc-sdk-btn[data-variant="default"] { color: ${vr}; background: ${$(ge,10,be)}; border-color: ${$(ge,12)}; ${Wn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${$(ge,16,be)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${$(ge,22,be)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${hi}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Pe}, ${Pe}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Be}; ${Lr} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Pe}, ${Pe}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${te}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Pe}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${G("status-error","red")}; color: ${Nr}; background: ${$("var(--oc-sdk-tone)",7,be)}; border-color: ${$("var(--oc-sdk-tone)",12)}; ${Wn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${$("var(--oc-sdk-tone)",9,be)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${$("var(--oc-sdk-tone)",11,be)}; box-shadow: none; }

.oc-sdk-field-note { color: ${j}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Nr}; }
.oc-sdk-input { border-radius: ${Pr}; background: var(--oc-sdk-field-bg); color: ${Be}; ${Mr("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${j}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Mr($(ne,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Mr(G("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Ur}; }

.oc-sdk-search-icon { color: ${j}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ge}; }
.oc-sdk-search-clear { border-radius: ${Xn}; color: ${j}; }
.oc-sdk-search-clear:hover { background: ${te}; color: ${ne}; }

.oc-sdk-trigger { border-radius: ${Pr}; background: var(--oc-sdk-raised-bg); color: ${Be}; ${Lr} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Pe}, ${Pe}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${j}; }
.oc-sdk-trigger-chevron { color: ${j}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Be}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${yt}; background-clip: padding-box; color: ${Be}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${te}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${wr}; color: ${Cr}; }
.oc-sdk-option-check { color: ${ne}; }
.oc-sdk-option[data-destructive="true"] { color: ${Nr}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${$(G("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${j}; }
.oc-sdk-popup-empty { color: ${j}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Ue}; border-radius: 4px; color: ${ne}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${$(ne,60,Ue)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Ue}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${be}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ge}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Bn} }
.oc-sdk-check-desc { color: ${j}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${$(ne,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${j}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ne}; }
.oc-sdk-tab[aria-selected="true"] { color: ${Cr}; background: ${wr}; border-color: ${Ue}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Be}; background: var(--oc-sdk-raised-bg); ${Lr} }
.oc-sdk-tab-count { color: ${j}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${$(ne,6)}; color: ${j}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${$("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${te}; }
.oc-sdk-row[aria-selected="true"] { background: ${wr}; color: ${Cr}; }
.oc-sdk-row-lead { font-family: ${Ur}; color: ${j}; }
.oc-sdk-row-sub { color: ${j}; }
.oc-sdk-row-meta { color: ${j}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${j}; }

.oc-sdk-empty-body { color: ${j}; }

.oc-sdk-spinner { color: ${j}; }
.oc-sdk-spinner-ring { border-color: ${Ue}; border-top-color: ${ge}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${$("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${j}; }

.oc-sdk-separator { color: ${j}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${$(Ue,40)}; }

.oc-sdk-progress-label { color: ${j}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${$(ne,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ge}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${G("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${G("success-text","inherit")}; }

.oc-sdk-text a { color: ${vr}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${$(Ue,60)}; }
`,P=`
${Jt}
${Ri}
${zn}`;var Jn="oc-sdk-ui-style",pe=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},M=e=>{let t=document.getElementById(Jn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}qt(document);let r=document.createElement("style");r.id=Jn,r.textContent=e,document.head.appendChild(r)},b=(e,t)=>{let r=document.createElement(e);return t&&(r.className=t),r},se=e=>{let t=b("button",e);return t.type="button",t},F=(e,t)=>{let r=t??"";e.textContent!==r&&(e.textContent=r)},ce=(e,t,r)=>{r==null||r===""?e.removeAttribute(t):e.getAttribute(t)!==r&&e.setAttribute(t,r)},qn=(e,t)=>{let r=o=>{o.target instanceof Node&&e.contains(o.target)||t()};return document.addEventListener("pointerdown",r,!0),()=>{document.removeEventListener("pointerdown",r,!0)}};var Oi=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Re=(e,t)=>{M(P);let r=t,o=se("oc-sdk oc-sdk-btn"),s=Oi(),c=document.createElement("span");o.append(c),e.append(o);let a=()=>{o.dataset.variant=r.variant??"default",o.dataset.size=r.size??"default",o.disabled=!!r.disabled||!!r.loading,o.dataset.loading=r.loading?"true":"false",o.setAttribute("aria-busy",r.loading?"true":"false"),r.loading&&s.parentNode!==o?o.prepend(s):!r.loading&&s.parentNode===o&&s.remove(),F(c,r.label)},l=()=>{r.disabled||r.loading||r.onClick()};return o.addEventListener("click",l),a(),{update:p=>{r={...r,...p},a()},dispose:()=>{o.removeEventListener("click",l),o.remove()}}};var Gr=(e,t)=>{M(P);let r=t,o=b("label","oc-sdk oc-sdk-field"),s=b("span","oc-sdk-field-label"),c=r.multiline?b("textarea","oc-sdk-input"):b("input","oc-sdk-input"),a=b("span","oc-sdk-field-note");o.append(s,c,a),e.append(o);let l=()=>{F(s,r.label),s.hidden=!r.label,c instanceof HTMLInputElement?c.type=r.password?"password":"text":c.rows=r.rows??3,c.value!==r.value&&(c.value=r.value),c.disabled=!!r.disabled,ce(c,"placeholder",r.placeholder),c.dataset.mono=r.mono?"true":"false";let u=!!r.error;o.dataset.invalid=u?"true":"false",c.setAttribute("aria-invalid",u?"true":"false");let _=r.error??r.helper??"";F(a,_),a.hidden=_===""},p=()=>{r.onChange(c.value)};return c.addEventListener("input",p),l(),{update:u=>{r={...r,...u},l()},dispose:()=>{c.removeEventListener("input",p),o.remove()}}};var Qn="http://www.w3.org/2000/svg",xi={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Oe=(e,t,r)=>{let o=document.createElementNS(Qn,"svg");o.setAttribute("viewBox","0 0 24 24"),o.setAttribute("width",String(t)),o.setAttribute("height",String(t)),o.setAttribute("aria-hidden","true"),o.setAttribute("fill","currentColor"),r&&o.setAttribute("class",r);let s=document.createElementNS(Qn,"path");return s.setAttribute("d",xi[e]),o.append(s),o};var Hr=(e,t)=>{M(P);let r=t,o=b("div","oc-sdk oc-sdk-search"),s=b("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let c=se("oc-sdk-search-clear");c.append(Oe("close",14)),c.tabIndex=-1,o.append(Oe("search",16,"oc-sdk-search-icon"),s,c),e.append(o);let a=()=>{let _=r.placeholder??"Search";ce(s,"placeholder",_),s.setAttribute("aria-label",r.label??_),c.setAttribute("aria-label","Clear search"),s.value!==r.value&&(s.value=r.value),o.dataset.active=r.value.trim()===""?"false":"true"},l=()=>{r.value!==""&&r.onChange(""),s.focus()},p=()=>{r.onChange(s.value)},u=_=>{_.key==="Escape"&&s.value!==""&&(_.preventDefault(),l())};return s.addEventListener("input",p),s.addEventListener("keydown",u),c.addEventListener("click",l),a(),r.autofocus&&s.focus(),{update:_=>{r={...r,..._},a()},dispose:()=>{s.removeEventListener("input",p),s.removeEventListener("keydown",u),c.removeEventListener("click",l),o.remove()}}};var fe=(e,t="vertical")=>{let[r,o]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===r||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===o||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},xe=(e,t,r)=>{let o=e.filter(p=>!p.disabled);if(o.length===0)return null;let s=o[0],c=o[o.length-1];if(r==="first"||!s||!c)return s?.id??null;if(r==="last")return c.id;let a=o.findIndex(p=>p.id===t);return a===-1?r==="next"?s.id:c.id:o[Math.min(o.length-1,Math.max(0,a+(r==="next"?1:-1)))]?.id??null};var Yn=(e,t)=>`${e}-${t??""}`,It=(e,t,r,o)=>{let s=se("oc-sdk-option");s.id=Yn(e,r.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!r.disabled,t==="option"&&s.setAttribute("aria-selected",r.selected?"true":"false"),s.dataset.destructive=r.destructive?"true":"false";let c=b("span","oc-sdk-option-label");if(c.textContent=r.label,s.append(c),r.hint){let a=b("span","oc-sdk-option-hint");a.textContent=r.hint,s.append(a)}if(t==="option"){s.dataset.mark="check";let a=b("span","oc-sdk-option-check");a.append(Oe("check",14)),s.append(a)}return s.addEventListener("pointerenter",o.hover),s.addEventListener("click",o.pick),s},wt=(e,t,r,o)=>{let s=Yn(r,o);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===s?"true":"false");ce(t,"aria-activedescendant",o?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Ai=(e,t)=>{let r=t.getBoundingClientRect();e.style.minWidth=`${Math.round(r.width)}px`,e.style.left=`${Math.round(r.left)}px`,e.style.top=`${Math.round(r.bottom+4)}px`;let o=e.offsetHeight,s=window.innerHeight-r.bottom-8;o>s&&r.top-8>s&&(e.style.top=`${Math.max(8,Math.round(r.top-4-o))}px`);let c=r.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(r.left-c))}px`)},Ct=(e,t,r,o)=>{e.append(r),Ai(r,t);let s=qn(e,o),c=()=>{o()},a=l=>{l.target instanceof Node&&r.contains(l.target)||o()};return window.addEventListener("resize",c),window.addEventListener("scroll",a,!0),()=>{s(),window.removeEventListener("resize",c),window.removeEventListener("scroll",a,!0),r.remove()}};var Zn=(e,t)=>{let r=t.trim().toLowerCase();return r?e.filter(o=>o.label.toLowerCase().includes(r)||o.id.toLowerCase().includes(r)):[...e]},ki=0,jr=(e,t)=>{M(P);let r=t,o=`oc-sdk-select-${ki+=1}`,s=b("div","oc-sdk oc-sdk-select"),c=b("span","oc-sdk-field-label");c.id=`${o}-label`;let a=se("oc-sdk-trigger");a.setAttribute("aria-haspopup","listbox"),a.setAttribute("aria-labelledby",c.id);let l=b("span","oc-sdk-trigger-value");a.append(l,Oe("chevron",14,"oc-sdk-trigger-chevron")),s.append(c,a),e.append(s);let p="",u=null,_=null,h=b("div","oc-sdk oc-sdk-popup"),E=b("div","oc-sdk-popup-search"),g=b("input","oc-sdk-input");g.type="text",g.autocomplete="off",E.append(g);let U=b("div");U.setAttribute("role","listbox"),U.tabIndex=-1,h.append(U);let X=()=>Zn(r.options,r.searchable?p:""),N=()=>r.searchable?g:U,O=m=>{u=m,wt(U,N(),o,m)},K=()=>{pe(U);let m=X();if(m.length===0){let S=b("div","oc-sdk-popup-empty");S.textContent="No matches",U.append(S)}for(let S of m)U.append(It(o,"option",{...S,selected:S.id===r.value},{hover:()=>O(S.id),pick:()=>Ae(S.id)}));O(m.some(S=>S.id===u)?u:m[0]?.id??null)},Q=()=>{let m=_;_=null,m?.(),p="",g.value="",a.setAttribute("aria-expanded","false")},Ce=()=>{_||r.disabled||(u=r.value,g.placeholder=r.searchPlaceholder??"Search",r.searchable?h.prepend(E):E.remove(),K(),_=Ct(s,a,h,Q),a.setAttribute("aria-expanded","true"),N().focus())},Ae=m=>{Q(),a.focus(),m!==r.value&&r.onChange(m)},ke=()=>{_?Q():Ce()},De=m=>{!_&&fe(m)&&(m.preventDefault(),Ce())},_e=m=>{let S=fe(m);S?(m.preventDefault(),O(xe(X(),u,S))):m.key==="Enter"?(m.preventDefault(),u&&Ae(u)):m.key==="Escape"?(m.preventDefault(),Q(),a.focus()):r.searchable&&m.target!==g&&m.key.length===1&&!m.ctrlKey&&!m.metaKey&&g.focus()},me=()=>{p=g.value,K()},Se=m=>{_&&!(m.relatedTarget instanceof Node&&s.contains(m.relatedTarget))&&Q()},re=()=>{F(c,r.label),c.hidden=!r.label;let m=r.options.find(S=>S.id===r.value);F(l,m?.label??r.placeholder??"Select"),l.dataset.empty=m?"false":"true",a.disabled=!!r.disabled,_&&K()};return a.addEventListener("click",ke),a.addEventListener("keydown",De),h.addEventListener("keydown",_e),g.addEventListener("input",me),s.addEventListener("focusout",Se),re(),{update:m=>{r={...r,...m},re()},dispose:()=>{Q(),a.removeEventListener("click",ke),a.removeEventListener("keydown",De),h.removeEventListener("keydown",_e),g.removeEventListener("input",me),s.removeEventListener("focusout",Se),s.remove()}}};var $r=(e,t)=>{M(P);let r=t,o=b("div","oc-sdk oc-sdk-tabs");o.setAttribute("role","tablist"),e.append(o);let s=()=>{pe(o),o.dataset.track=r.trackBackground?"true":"false";for(let a of r.items){let l=se("oc-sdk-tab");l.setAttribute("role","tab");let p=a.id===r.activeId;l.setAttribute("aria-selected",p?"true":"false"),l.tabIndex=p?0:-1,l.dataset.id=a.id;let u=b("span");if(u.textContent=a.label,l.append(u),a.count!==void 0){let _=b("span","oc-sdk-tab-count");_.textContent=String(a.count),l.append(_)}l.addEventListener("click",()=>{a.id!==r.activeId&&r.onChange(a.id)}),o.append(l)}},c=a=>{let l=fe(a,"horizontal");if(!l)return;let p=xe(r.items,r.activeId,l);if(p&&p!==r.activeId){a.preventDefault(),r.onChange(p);let u=o.querySelector(`[data-id="${CSS.escape(p)}"]`);u instanceof HTMLElement&&u.focus()}};return o.addEventListener("keydown",c),s(),{update:a=>{r={...r,...a},s()},dispose:()=>{o.removeEventListener("keydown",c),o.remove()}}};var vt=(e,t)=>{ce(e,"data-tone",t&&t!=="neutral"?t:null)},Vr=(e,t)=>{M(P);let r=t,o=b("span","oc-sdk oc-sdk-badge");e.append(o);let s=()=>{F(o,r.label),vt(o,r.tone)};return s(),{update:c=>{r={...r,...c},s()},dispose:()=>{o.remove()}}};var yi=0,Fr=(e,t)=>{M(P);let r=t,o=`oc-sdk-list-${yi+=1}`,s=b("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let c=null,a=h=>`${o}-${h}`,l=h=>{c=h;for(let E of Array.from(s.children))E instanceof HTMLElement&&(E.dataset.active=E.id===a(h??"")?"true":"false");ce(s,"aria-activedescendant",h?a(h):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},p=(h,E)=>{let g=b("span",h);return g.textContent=E,g},u=()=>{if(pe(s),ce(s,"aria-label",r.ariaLabel),r.items.length===0){s.append(p("oc-sdk-list-empty",r.emptyText??"Nothing here")),l(null);return}for(let E of r.items){let g=se("oc-sdk-row");g.id=a(E.id),g.setAttribute("role","option"),g.setAttribute("aria-selected",E.id===r.selectedId?"true":"false"),g.disabled=!!E.disabled,g.tabIndex=-1,E.leading&&g.append(p("oc-sdk-row-lead",E.leading));let U=b("span","oc-sdk-row-main");if(U.append(p("oc-sdk-row-title",E.title)),E.subtitle&&U.append(p("oc-sdk-row-sub",E.subtitle)),g.append(U),E.badge){let X=p("oc-sdk-badge",E.badge.label);vt(X,E.badge.tone),g.append(X)}E.meta&&g.append(p("oc-sdk-row-meta",E.meta)),g.addEventListener("click",()=>r.onSelect(E.id)),s.append(g)}let h=r.items.some(E=>E.id===c&&!E.disabled);l(h?c:r.selectedId??null)},_=h=>{let E=fe(h);if(E){h.preventDefault(),l(xe(r.items,c,E));return}(h.key==="Enter"||h.key===" ")&&c&&(h.preventDefault(),r.onSelect(c))};return s.addEventListener("keydown",_),u(),{update:h=>{r={...r,...h},u()},dispose:()=>{s.removeEventListener("keydown",_),s.remove()}}};var Xr=(e,t)=>{M(P);let r=t,o=b("div","oc-sdk oc-sdk-empty"),s=b("h2","oc-sdk-empty-title"),c=b("p","oc-sdk-empty-body"),a=b("div","oc-sdk-empty-action");o.append(s,c,a),e.append(o);let l=null,p=()=>{if(F(s,r.title),F(c,r.body),c.hidden=!r.body,a.hidden=!r.action,!r.action){l?.dispose(),l=null;return}let u={label:r.action.label,onClick:r.action.onClick};l?l.update(u):l=Re(a,{...u,variant:"outline",size:"sm"})};return p(),{update:u=>{r={...r,...u},p()},dispose:()=>{l?.dispose(),l=null,o.remove()}}};var Br=(e,t={})=>{M(P);let r=t,o=b("span","oc-sdk oc-sdk-spinner");o.setAttribute("role","status");let s=b("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let c=b("span");o.append(s,c),e.append(o);let a=()=>{o.dataset.size=r.size??"default",F(c,r.label),c.hidden=!r.label,o.setAttribute("aria-label",r.label??"Loading")};return a(),{update:l=>{r={...r,...l},a()},dispose:()=>{o.remove()}}};var Wr=(e,t)=>{M(P);let r=t,o=b("div","oc-sdk oc-sdk-banner"),s=b("div","oc-sdk-banner-text"),c=b("div","oc-sdk-banner-title"),a=b("div","oc-sdk-banner-body"),l=b("div","oc-sdk-banner-action");s.append(c,a),o.append(s,l),e.append(o);let p=null,u=()=>{if(o.dataset.tone=r.tone,o.setAttribute("role",r.tone==="error"||r.tone==="warning"?"alert":"status"),F(c,r.title),F(a,r.body),a.hidden=!r.body,l.hidden=!r.action,!r.action){p?.dispose(),p=null;return}let _={label:r.action.label,onClick:r.action.onClick};p?p.update(_):p=Re(l,{..._,variant:"outline",size:"xs"})};return u(),{update:_=>{r={...r,..._},u()},dispose:()=>{p?.dispose(),p=null,o.remove()}}};var es=e=>e.filter(t=>!("separator"in t)),Ii=0,Kr=(e,t)=>{M(P);let r=t,o=`oc-sdk-menu-${Ii+=1}`,s=b("div","oc-sdk oc-sdk-menu");e.append(s);let c=b("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let a=null,l=null,p=Re(s,{label:r.label,variant:r.variant,size:r.size,onClick:()=>{a?E():g()}}),u=s.querySelector("button");u?.setAttribute("aria-haspopup","menu");let _=O=>{l=O,wt(c,c,o,O)},h=()=>{pe(c);for(let O of r.items){if("separator"in O){let K=b("div","oc-sdk-separator");K.dataset.labeled="false",c.append(K);continue}c.append(It(o,"menuitem",O,{hover:()=>_(O.id),pick:()=>U(O.id)}))}_(es(r.items).some(O=>O.id===l)?l:null)},E=()=>{let O=a;a=null,O?.(),l=null,u?.setAttribute("aria-expanded","false")},g=()=>{a||!u||(h(),a=Ct(s,u,c,E),u.setAttribute("aria-expanded","true"),c.focus())},U=O=>{E(),u?.focus(),r.onSelect(O)},X=O=>{let K=fe(O);K?(O.preventDefault(),_(xe(es(r.items),l,K))):O.key==="Enter"||O.key===" "?(O.preventDefault(),l&&U(l)):O.key==="Escape"&&(O.preventDefault(),E(),u?.focus())},N=O=>{a&&!(O.relatedTarget instanceof Node&&s.contains(O.relatedTarget))&&E()};return c.addEventListener("keydown",X),s.addEventListener("focusout",N),{update:O=>{r={...r,...O},p.update({label:r.label,variant:r.variant,size:r.size}),a&&h()},dispose:()=>{E(),c.removeEventListener("keydown",X),s.removeEventListener("focusout",N),p.dispose(),s.remove()}}};var wi=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,Ci=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},ts=e=>{let t=[],r=0;for(let o of e.matchAll(wi)){let s=o.index??0;s>r&&t.push({kind:"text",text:e.slice(r,s)});let c=o[1]??"",a=(o[2]??"").trim(),l=o[3]??"";Ci(l)?c==="!"?t.push({kind:"image",src:l,alt:a}):t.push({kind:"link",href:l,label:a||l}):t.push({kind:"text",text:o[0]}),r=s+o[0].length}return r<e.length&&t.push({kind:"text",text:e.slice(r)}),t},zr=(e,t)=>{M(P);let r=t,o=b("div","oc-sdk oc-sdk-text");e.append(o);let s=a=>{!(a.target instanceof HTMLAnchorElement)||!r.onOpenUrl||(a.preventDefault(),r.onOpenUrl(a.target.href))},c=()=>{pe(o);for(let a of ts(r.text))if(a.kind==="text")o.append(document.createTextNode(a.text));else if(a.kind==="link"){let l=b("a");l.href=a.href,l.rel="noopener noreferrer",l.target="_blank",l.textContent=a.label,o.append(l)}else{let l=b("img");l.src=a.src,l.alt=a.alt,l.loading="lazy",l.referrerPolicy="no-referrer",o.append(l)}};return o.addEventListener("click",s),c(),{update:a=>{r={...r,...a},c()},dispose:()=>{o.removeEventListener("click",s),o.remove()}}};var rs=[];function le(e){return rs.push(e),e}function os(){for(let e of rs.splice(0))try{e.dispose()}catch{}}var J=(e,t)=>le(Re(e,t)),ns=(e,t)=>le(Gr(e,t)),ss=(e,t)=>le(Hr(e,t)),is=(e,t)=>le(jr(e,t)),as=(e,t)=>le($r(e,t)),Ui=(e,t)=>le(Vr(e,t)),Jr=(e,t)=>le(Fr(e,t)),We=(e,t)=>le(Xr(e,t)),Pi=(e,t)=>le(Br(e,t)),qr=(e,t)=>le(Wr(e,t)),Nt=(e,t)=>le(Kr(e,t)),Mi=(e,t)=>le(zr(e,t));function Ut(e,t="notice"){let r=document.createElement("div");return r.className=t,Mi(r,{text:e,onOpenUrl:ze}),r}function Ke(e,t){let r=document.createElement("span"),o=ae(e,t);return Ui(r,{label:o.label,tone:o.tone}),r}function Me(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Pi(t,{label:e}),t}function cs(e){Ir(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function ze(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}Y.openUrl(e).catch(()=>{})}}function Qr(e,t,r){return{directory:e,link:t,repo:r,target:yo(r,t.orgName,t.projectName)}}async function Pt(e){try{let t=await e(".git/config"),r=Io(t.content);return r?ko(r):null}catch{return null}}async function ls(e){try{let t=await e(".git/HEAD");return wo(t.content)}catch{return null}}async function ds(e,t,r,o){let s=await Hn(t,r);if(s)return Qr(r,s,await Pt(o));let c=await Pt(o);if(!c)return null;for(let a of Xt(c))try{let l=await e.findProjectBySlug(a);if(!l||!l.id)continue;return await kr(t,r,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected"}),Qr(r,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected",directory:r},c)}catch{}return null}async function us(e,t,r,o){let s=o?Xt(o)[0]??null:null;return await kr(e,t,{projectId:r.id,projectName:r.name,orgName:r.orgName,slug:s,source:"picked"}),Qr(t,{projectId:r.id,projectName:r.name,orgName:r.orgName,slug:s,source:"picked",directory:t},o)}var v=document.querySelector("#root");if(!v)throw new Error("CircleCI panel is missing its #root element.");var q=Oo(gn),Je=Y.storage,Li=3e4,eo=null,n={ready:null,connected:!1,account:"CircleCI",booted:!1,workspace:null,override:null,directory:null,runs:[],runsNext:null,filter:"all",selectedRun:null,workflows:[],selectedWorkflow:null,jobs:[],selectedJob:null,jobDetail:null,jobOutput:null,jobsError:null,pipelines:[],preferences:{autoRefresh:!0},loading:!0,error:null,toast:null,disconnectNotice:null,trigger:null,picker:!1,pickerLoading:!1,pickerError:null,pickerProjects:[],pickerFilter:""},ie=0;function Ee(){return n.override??n.workspace}async function Ss(){I(),n.preferences=await yr(Je);let e=n.ready?.directory??null;if(n.directory=e,!n.connected){n.loading=!1,I();return}try{let t=await q.currentUser();n.account=t.login}catch{}if(!e){n.loading=!1,I();return}try{let t=await ds(q,Je,e,xt);if(n.workspace=t,!t){n.loading=!1,n.picker=!0,I(),to();return}await we()}catch(t){n.loading=!1,n.error=z(t),At(t)&&(n.connected=!1),I()}}async function we(e={}){let t=Ee();if(!t)return;let r=++ie;e.more||(n.loading=!0,n.error=null,I());try{let o=await q.listRuns(t.link.projectId,e.more?n.runsNext??void 0:void 0);if(r!==ie)return;n.runs=e.more?[...n.runs,...o.items]:o.items,n.runsNext=o.next,n.loading=!1,Ji()}catch(o){if(r!==ie)return;n.loading=!1,n.error=z(o),At(o)&&(n.connected=!1)}I(),st()}async function Lt(){let e=n.selectedRun;if(!e)return;let t=++ie;n.loading=!0,n.error=null,I();try{let r=await q.listWorkflows(e.id);if(t!==ie)return;n.workflows=r.items,n.loading=!1}catch(r){if(t!==ie)return;n.loading=!1,n.error=z(r)}I(),st()}async function qe(){let e=n.selectedWorkflow;if(!e)return;let t=++ie;n.loading=!0,n.error=null,I();try{let r=await q.listJobs(e.id);if(t!==ie)return;n.jobs=r.items,n.jobsError=null,n.loading=!1}catch(r){if(t!==ie)return;n.loading=!1,n.jobsError=z(r),n.error=n.jobsError}I(),st()}async function Ts(){let e=n.selectedJob;if(!e)return;let t=++ie;n.loading=!0,n.error=null,I();try{let r=await q.getJob(e.id);if(t!==ie)return;n.jobDetail=r;let o=r.steps.find(s=>ue(s.outcome));if(n.jobOutput=null,o)try{let s=await q.condensedOutput(e.id,o.num,0);t===ie&&s.trim()&&(n.jobOutput=s)}catch{}n.loading=!1}catch(r){if(t!==ie)return;n.loading=!1,n.error=z(r)}I(),st()}async function Dt(e=!1){return e||(n.toast=null),n.selectedJob?Ts():n.selectedWorkflow?qe():n.selectedRun?Lt():we({more:!1})}async function hs(e){n.toast=null,n.selectedRun=e,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),await Lt()}async function Yr(e){n.selectedWorkflow=e,n.jobs=[],n.jobsError=null,n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),await qe()}async function Zr(e){n.selectedJob=e,n.jobDetail=null,n.jobOutput=null,I(),await Ts()}function Di(){n.toast=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),we({more:!1})}function Gi(){n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),Lt()}function Hi(){n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),qe()}function Le(e){let t=Ee(),r=n.selectedRun;return!t||!r?null:{workspace:t,run:r,workflow:e.workflow??n.selectedWorkflow,job:e.job??n.selectedJob,jobs:n.jobs,jobsError:n.jobsError,detail:e.detail??n.jobDetail,output:e.output??n.jobOutput}}async function Mt(e){if(e)try{await Rn(e),await ee("success","Attached to the chat box.")}catch(t){await ee("error",z(t))}}async function gs(e){if(e)try{await On(e),await ee("success","Started a worktree chat for this build.")}catch(t){await ee("error",z(t))}}async function ji(e){if(e)try{await xn(e),await ee("success","Sent to the open chat.")}catch(t){await ee("error",z(t))}}async function bs(e,t){await vn(q,e,{fromFailed:t},ee)&&await qe()}async function $i(e){let t=e?n.workflows.filter(o=>ue(o.outcome)):n.workflows;(await Nn(q,t,{fromFailed:e},ee)).started>0&&await Lt()}async function Rs(e){await Un(q,e,ee)&&await qe()}async function ps(e,t){(t?await Pn(q,e,ee):await Mn(q,e,ee))&&await qe()}async function Vi(e){let t=await $n(Je,e.link.projectId);n.pipelines=t??[];try{let r=await q.listPipelines(e.link.projectId);return n.pipelines=r,await Vn(Je,e.link.projectId,r),r}catch{return n.pipelines}}async function Fi(){let e=Ee();if(!e)return;let t=n.directory?await ls(xt):null;n.pipelines=[],n.trigger={loading:!0,pipelineId:"",branch:t??"",error:null,running:!1},I(),await Vi(e),n.trigger&&(n.trigger={...n.trigger,loading:!1,pipelineId:n.trigger.pipelineId||n.pipelines[0]?.id||""},I())}async function Xi(){let e=Ee(),t=n.trigger;if(!e||!t)return;let o=n.pipelines.some(c=>c.id===t.pipelineId)?t.pipelineId:n.pipelines[0]?.id??"";if(!o){n.trigger={...t,error:"This project has no pipeline to run."},I();return}let s=t.branch.trim();if(!s){n.trigger={...t,error:"Name a branch or tag to build."},I();return}n.trigger={...t,running:!0,error:null},I();try{await q.fireRun({projectId:e.link.projectId,pipelineId:o,branch:s}),n.trigger=null,await ee("success",`Started a run on ${s}.`),await we({more:!1})}catch(c){n.trigger={...t,running:!1,error:z(c)},I()}}async function Bi(e){switch(e){case"refresh":await Dt();return;case"trigger":await Fi();return;case"choose":n.override=null,n.picker=!0,I(),await to();return;case"revert":n.override=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,n.pipelines=[],I(),await we({more:!1});return;case"pause":case"resume":n.preferences=await jn(Je,{autoRefresh:e==="resume"}),I(),st();return;case"disconnect":await ta();return;default:return}}async function to(){n.pickerLoading=!0,n.pickerError=null,I();try{let e=await q.listOrgs(),t=await Promise.allSettled(e.map(o=>q.listProjectsOfOrg(o.id))),r=[];for(let o of t)o.status==="fulfilled"&&r.push(...o.value.items);r.sort((o,s)=>{let c=o.orgName.localeCompare(s.orgName);return c!==0?c:o.name.localeCompare(s.name)}),n.pickerProjects=r}catch(e){n.pickerError=z(e),At(e)&&(n.connected=!1)}n.pickerLoading=!1,I()}async function Wi(e){let t=n.directory;if(t)try{let r=await Pt(xt),o=await us(Je,t,e,r);n.workspace=o,n.override=null,n.picker=!1,n.pickerProjects=[],n.pickerFilter="",n.selectedRun=null,n.pipelines=[],I(),await we({more:!1})}catch(r){await ee("error",z(r))}}function Ki(){return n.selectedJob?nt([n.selectedJob]):n.selectedWorkflow?nt(n.jobs):n.selectedRun?nt(n.workflows):nt(n.runs)}var zi=kn({delayMs:Li,enabled:()=>n.preferences.autoRefresh,active:Ki,onTick:()=>void Dt(!0)});function st(){zi.arm()}function Ji(){let e=n.runs.filter(t=>ue(t.outcome)).length;Y.setBadge(e>0?e:null).catch(()=>{})}function I(){if(os(),eo=null,An(v),!n.connected){qi();return}if(!n.directory){fs();return}if(n.picker){Yi();return}if(!Ee()){fs();return}if(n.trigger){Qi();return}if(n.selectedJob){sa();return}if(n.selectedWorkflow){As();return}if(n.selectedRun){xs();return}ro()}function qi(){let e=f("div");v?.append(e),We(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. Tokens stay in OpenChamber; this extension never sees one.",action:{label:"Open CircleCI tokens",onClick:()=>ze("https://app.circleci.com/settings/user/tokens")}})}function Qi(){let e=n.trigger;if(!e)return ro();let t=f("div",{className:"detail-head"}),r=f("div",{className:"row"}),o=f("div");if(J(o,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:()=>{n.trigger=null,I()}}),r.append(o),r.append(f("span",{className:"spacer"})),t.append(r),t.append(f("div",{className:"detail-title"},"Run a pipeline")),t.append(f("div",{className:"detail-sub"},"Fire a new run on a branch or tag. The pipeline definition picks which config to build.")),v?.append(t),e.loading){v?.append(Me("Loading pipelines"));return}let s=f("div",{className:"section"});if(n.pipelines.length>1){let u=f("div"),_=null;_=is(u,{label:"Pipeline",value:e.pipelineId,options:n.pipelines.map(h=>({id:h.id,label:h.name,hint:h.configPath})),onChange:h=>{n.trigger&&(n.trigger={...n.trigger,pipelineId:h},_?.update({value:h}))}}),s.append(u)}else n.pipelines.length===1?s.append(f("p",{className:"notice"},`Pipeline: ${n.pipelines[0]?.name??""}`)):s.append(f("p",{className:"notice error-text"},"This project lists no pipeline definition to run."));let c=f("div"),a=null;a=ns(c,{label:"Branch or tag",value:e.branch,placeholder:"main",mono:!0,onChange:u=>{n.trigger&&(n.trigger={...n.trigger,branch:u,error:null},a?.update({value:u}))}}),s.append(c),e.error&&s.append(f("p",{className:"notice error-text"},e.error));let l=f("div",{className:"detail-actions"}),p=f("div");J(p,{label:"Start run",loading:e.running,disabled:e.running||n.pipelines.length===0,onClick:()=>void Xi()}),l.append(p),s.append(l),v?.append(s)}function fs(){let e=f("div");v?.append(e),We(e,{title:"No project open",body:"Open a project in OpenChamber. This extension maps that project to a CircleCI project the first time it runs."})}function Yi(){let e=f("div",{className:"detail-head"}),t=f("div",{className:"detail-title"},"Choose a CircleCI project");if(e.append(t),e.append(f("div",{className:"detail-sub"},"This extension remembers the choice per OpenChamber project.")),n.workspace){let l=f("div");J(l,{label:"Back",variant:"ghost",size:"sm",onClick:()=>{n.picker=!1,n.override=null,I(),we({more:!1})}}),e.append(l)}if(v?.append(e),n.pickerError){let l=f("div");v?.append(l),qr(l,{tone:"error",title:"CircleCI",body:n.pickerError,action:{label:"Retry",onClick:()=>void to()}})}if(n.pickerLoading){v?.append(Me("Loading projects"));return}if(n.pickerProjects.length===0){if(n.pickerError)return;let l=f("div");v?.append(l),We(l,{title:"No projects",body:"This token is not a member of any CircleCI organization with projects, or the token cannot list them."});return}let r=f("div");v?.append(r);let o=f("div",{className:"scroll"});v?.append(o);let s=()=>Zi(),c=Jr(o,{items:s(),ariaLabel:"CircleCI projects",onSelect:l=>{let p=n.pickerProjects.find(u=>u.id===l);p&&Wi(p)}}),a=null;a=ss(r,{value:n.pickerFilter,label:"Filter projects",placeholder:"Filter by organization or repository",onChange:l=>{n.pickerFilter=l,a?.update({value:l}),c.update({items:s()})}})}function Zi(){let e=n.pickerFilter.trim().toLowerCase();return n.pickerProjects.filter(t=>e?`${t.orgName}/${t.name}`.toLowerCase().includes(e):!0).map(t=>({id:t.id,leading:t.orgName?`${t.orgName}/`:"",title:t.name}))}function ea(){let e=Ee(),t=f("div",{className:"row"}),r=f("div",{style:"flex:1; min-width:0;"}),o=e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",s=[{id:"refresh",label:"Refresh"},{id:"trigger",label:"Run a pipeline\u2026"},{id:"choose",label:"Change project\u2026"}];n.override&&s.push({id:"revert",label:"Back to this repository's project"}),s.push({separator:!0},n.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"},{separator:!0},{id:"disconnect",label:"Disconnect CircleCI",destructive:!0}),Nt(r,{label:o,size:"sm",variant:"ghost",items:s,onSelect:u=>void Bi(u)}),t.append(r),n.account&&t.append(f("span",{className:"account muted",text:n.account})),v?.append(t);let c=f("div",{className:"toolbar"}),a=f("div"),l=as(a,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:n.filter,onChange:u=>{n.filter=yn(u),l.update({activeId:n.filter}),eo?.paint()}});c.append(a),c.append(f("span",{className:"spacer"}));let p=f("div");return J(p,{label:"Refresh",size:"sm",variant:"ghost",loading:n.loading,onClick:()=>void Dt()}),c.append(p),v?.append(c),{bar:c,tabs:l}}var Es="To remove the token, open Settings \u2192 Integrations and clear the CircleCI card.";async function ta(){try{await Y.oauthDisconnect(),n.disconnectNotice=`Disconnect requested. ${Es}`}catch(e){n.disconnectNotice=`${z(e)} ${Es}`}I()}function ra(){n.workspace=null,n.override=null,n.runs=[],n.runsNext=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,n.pipelines=[],n.trigger=null,n.picker=!1,n.pickerProjects=[],n.pickerFilter="",n.toast=null,n.error=null,n.disconnectNotice=null}function Gt(){if(n.disconnectNotice&&v?.append(f("p",{className:"notice"},n.disconnectNotice)),n.error){let e=f("div");v?.append(e),qr(e,{tone:"error",title:"CircleCI",body:n.error,action:{label:"Retry",onClick:()=>void Dt()}})}n.toast&&v?.append(f("p",{className:"notice"},n.toast))}function oa(){return In(n.runs,n.filter)}function _s(){return oa().map(e=>{let t=ae(e.phase,e.outcome);return{id:e.id,leading:`#${e.number}`,title:Ne(e),...e.commitSubject?{subtitle:e.commitSubject}:{},meta:ut(e.createdAt),badge:{label:t.label,tone:t.tone}}})}function ms(){return n.runs.length===0?"No runs yet. Push a commit, or start one from the project menu.":"No run matches this filter."}function ro(){let{tabs:e}=ea();if(Gt(),n.loading&&n.runs.length===0){v?.append(Me("Loading runs"));return}let t=f("div",{className:"scroll"});v?.append(t);let r=Jr(t,{items:_s(),emptyText:ms(),ariaLabel:"CircleCI runs",onSelect:o=>{let s=n.runs.find(c=>c.id===o);s&&hs(s)}});if(eo={tabs:e,list:r,paint:()=>r.update({items:_s(),emptyText:ms()})},n.runsNext){let o=f("div",{className:"load-more"});J(o,{label:"Load more runs",size:"sm",variant:"ghost",onClick:()=>void we({more:!0})}),v?.append(o)}}function na(e){let t=Ee(),r=f("div",{className:"detail-head"}),o=f("div",{className:"row"}),s=f("div");J(s,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:Di}),o.append(s),o.append(f("span",{className:"spacer"})),o.append(Ke(e.phase,e.outcome)),r.append(o),r.append(f("div",{className:"detail-title"},`#${e.number} ${Ne(e)}`));let c=[];e.revision&&c.push(He(e.revision)),e.commitSubject&&c.push(e.commitSubject),e.pipelineName&&c.push(e.pipelineName),c.push(ut(e.createdAt)),r.append(f("div",{className:"detail-sub"},c.filter(Boolean).join(" \xB7 "))),e.errors.length>0&&r.append(Ut(e.errors.map(_=>`${_.type}: ${_.message}`).join(" \xB7 "),"notice error-text"));let a=f("div",{className:"detail-actions"}),l=f("div");Nt(l,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every workflow"}],onSelect:_=>void $i(_==="failed")}),a.append(l);let p=f("div");J(p,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>ze(t?tt(t.target,e.number):null)}),a.append(p);let u=f("div");return J(u,{label:"Attach",size:"sm",variant:"outline",onClick:()=>void Mt(Le({workflow:null,job:null}))}),a.append(u),r.append(a),r}function Os(e){let t=f("div",{className:"job-row"}),r=f("div",{className:"job-row-head"}),o=f("button",{className:"job-row-name",text:e.name,title:e.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});if(o.addEventListener("click",e.onOpen),r.append(o),e.meta&&r.append(f("span",{className:"job-row-meta",text:e.meta})),r.append(Ke(e.phase,e.outcome)),t.append(r),e.actions.length>0){let s=f("div",{className:"job-row-actions"});for(let c of e.actions){let a=f("div");J(a,{label:c.label,size:c.size??"xs",variant:c.variant??"ghost",onClick:c.onClick}),s.append(a)}t.append(s)}return t}function xs(){let e=n.selectedRun;if(!e)return ro();if(v?.append(na(e)),Gt(),n.loading&&n.workflows.length===0){v?.append(Me("Loading workflows"));return}if(n.workflows.length===0){let r=f("div");v?.append(r),We(r,{title:"No workflows",body:"This run produced no workflows. A configuration error is shown above when CircleCI reported one."});return}let t=f("div",{className:"scroll"});v?.append(t);for(let r of n.workflows){let o=ae(r.phase,r.outcome),s=[{label:"Jobs",onClick:()=>void Yr(r),variant:"outline"},{label:"Rerun failed",onClick:()=>void bs(r,!0)}];o.active&&s.push({label:"Cancel",onClick:()=>void Rs(r),variant:"ghost"}),s.push({label:"Open",onClick:()=>{let c=Ee();c&&ze(rt(c.target,e.number,r.id))}}),t.append(Os({name:r.name,meta:Ge(r.createdAt,r.endedAt),phase:r.phase,outcome:r.outcome,onOpen:()=>void Yr(r),actions:s}))}}function As(){let e=n.selectedWorkflow,t=n.selectedRun;if(!e||!t)return xs();let r=f("div",{className:"detail-head"}),o=f("div",{className:"row"}),s=f("div");J(s,{label:"\u2190 Workflows",variant:"ghost",size:"sm",onClick:Gi}),o.append(s),o.append(f("span",{className:"spacer"})),o.append(Ke(e.phase,e.outcome)),r.append(o),r.append(f("div",{className:"detail-title"},e.name)),r.append(f("div",{className:"detail-sub"},`Run #${t.number} \xB7 ${Ge(e.createdAt,e.endedAt)||"no duration"}`));let c=f("div",{className:"detail-actions"}),a=f("div");if(Nt(a,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:u=>void bs(e,u==="failed")}),c.append(a),ae(e.phase,e.outcome).active){let u=f("div");J(u,{label:"Cancel",size:"sm",variant:"ghost",onClick:()=>void Rs(e)}),c.append(u)}let l=f("div");if(J(l,{label:"Attach workflow",size:"sm",variant:"outline",onClick:()=>void Mt(Le({workflow:e,job:null}))}),c.append(l),r.append(c),v?.append(r),Gt(),n.loading&&n.jobs.length===0){v?.append(Me("Loading jobs"));return}if(n.jobs.length===0){let u=f("div");v?.append(u),We(u,{title:"No jobs",body:"This workflow lists no jobs yet."});return}let p=f("div",{className:"scroll"});v?.append(p);for(let u of n.jobs){let _=u.type.toLowerCase()==="approval",h=ae(u.phase,u.outcome),E=[];_&&h.active&&(E.push({label:"Approve",onClick:()=>void ps(u,!0),variant:"default"}),E.push({label:"Reject",onClick:()=>void ps(u,!1),variant:"ghost"})),E.push({label:"Details",onClick:()=>void Zr(u),variant:"outline"}),ue(u.outcome)&&(E.push({label:"Attach failure",onClick:()=>void Mt(Le({workflow:e,job:u,detail:null,output:null}))}),E.push({label:"Fix with agent",onClick:()=>void gs(Le({workflow:e,job:u,detail:null,output:null}))})),p.append(Os({name:u.name,meta:[u.number>0?`#${u.number}`:"",Ge(u.startedAt,u.endedAt)].filter(Boolean).join(" \xB7 "),phase:u.phase,outcome:u.outcome,onOpen:()=>void Zr(u),actions:E}))}}function sa(){let e=n.selectedJob,t=n.selectedWorkflow,r=n.selectedRun;if(!e)return As();let o=f("div",{className:"detail-head"}),s=f("div",{className:"row"}),c=f("div");J(c,{label:"\u2190 Jobs",variant:"ghost",size:"sm",onClick:Hi}),s.append(c),s.append(f("span",{className:"spacer"})),s.append(Ke(e.phase,e.outcome)),o.append(s),o.append(f("div",{className:"detail-title"},e.name)),o.append(f("div",{className:"detail-sub"},[`#${e.number}`,e.type,Ge(e.startedAt,e.endedAt)].filter(Boolean).join(" \xB7 ")));let a=f("div",{className:"detail-actions"}),l=f("div");J(l,{label:"Attach to chat",size:"sm",variant:"outline",onClick:()=>void Mt(Le({workflow:t,job:e}))}),a.append(l);let p=f("div");J(p,{label:"Start a chat",size:"sm",onClick:()=>void gs(Le({workflow:t,job:e}))}),a.append(p);let u=f("div");J(u,{label:"Send to current chat",size:"sm",variant:"ghost",onClick:()=>void ji(Le({workflow:t,job:e}))}),a.append(u);let _=Ee(),h=f("div");J(h,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>{_&&t&&ze(pt(_.target,r?.number??0,t.id,e.number))}}),a.append(h),o.append(a),v?.append(o),Gt();let E=f("div",{className:"scroll"});if(v?.append(E),n.loading&&!n.jobDetail){E.append(Me("Loading job"));return}let g=n.jobDetail;if(!g)return;let U=f("div",{className:"meta-grid"}),X=[Xe("Job",`#${g.number}`),Xe("Type",g.type),Xe("Started",g.startedAt?ut(g.startedAt):null),Xe("Duration",Ge(g.startedAt,g.endedAt)||null),Xe("Executions",g.steps.length>0?`${g.parallelExecutions} parallel`:null)];for(let N of X)N&&U.append(N);if(U.childElementCount>0&&E.append(U),g.errors.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Errors"));for(let O of g.errors)N.append(Ut(`${O.type}: ${O.message}`,"notice error-text"));E.append(N)}if(g.warnings.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Warnings"));for(let O of g.warnings)N.append(Ut(`${O.type}: ${O.message}`,"notice"));E.append(N)}if(g.steps.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Steps"));for(let O of g.steps){let K=f("div",{className:"job-row"}),Q=f("div",{className:"job-row-head"});Q.append(f("span",{className:"job-row-name"},`${O.num}. ${O.name}`)),O.exitCode!==null&&O.exitCode!==0&&Q.append(f("span",{className:"job-row-meta"},`exit ${O.exitCode}`)),Q.append(Ke(O.phase,O.outcome)),K.append(Q),O.command&&K.append(f("pre",{className:"output",style:"max-height:120px;"},O.command)),N.append(K)}E.append(N)}if(n.jobOutput){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Condensed output")),N.append(f("pre",{className:"output"},n.jobOutput)),E.append(N)}else ue(g.outcome)&&E.append(f("p",{className:"notice"},"CircleCI returned no condensed output for this job. The steps above and the errors are still attached with the chip."))}function ia(e){n.ready=e,n.booted=!0,n.connected=e.connection.connected,n.account=e.connection.account||"CircleCI",Ss()}Y.onReady(e=>{cs(e),Cn(),n.ready=e,n.booted||ia(e)});Y.onConnection(e=>{let t=n.connected;if(n.connected=e.connected,e.account&&(n.account=e.account),e.connected&&!t){Ss();return}!e.connected&&t&&(ra(),I())});Y.onItem(e=>{if(!e||!("providerId"in e))return;let t=Uo(e.data);t&&aa(t)});async function aa(e){let t=Ee();t&&t.link.projectId!==e.projectId&&(n.pipelines=[],n.override={directory:n.directory??"",repo:null,target:{segment:"github",owner:e.orgName||"project",repo:e.projectName},link:{projectId:e.projectId,projectName:e.projectName,orgName:e.orgName,slug:null,source:"picked",directory:n.directory??""}},I());try{let r=await q.getRun(e.runId);await hs(r);let o=e.workflowId?n.workflows.find(s=>s.id===e.workflowId):void 0;if(o){await Yr(o);let s=e.jobId?n.jobs.find(c=>c.id===e.jobId):void 0;s&&await Zr(s)}}catch(r){n.error=z(r),I()}}})();
