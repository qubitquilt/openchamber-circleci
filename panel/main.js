"use strict";(()=>{var ye=class extends Error{status;code;constructor(t,o,r){super(r),this.name="CircleCIError",this.status=t,this.code=o}},As="/api/v3",dt=20,Vt=20,mr=50,ks=50,Ze=4,sa=Ze*dt,Sr=[1e3,2500],k=e=>typeof e=="object"&&e!==null?e:{},ve=e=>Array.isArray(e)?e:[],h=e=>typeof e=="string"&&e.length>0?e:null,et=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function br(e){return ve(e).map(t=>{let o=k(t);return{type:h(o.type)??"unknown",message:h(o.message)??""}})}function Rr(e){return ve(e).map(t=>{let o=k(t);return{type:h(o.type)??"unknown",message:h(o.message)??"",description:h(o.description),url:h(o.url)}})}function lt(e){let t=k(e),o=k(t.attributes),r=k(t.references),s=k(r.event),c=k(s.attributes),a=k(c.vcs),l=k(a.commit),u=k(r.pipeline),p=k(r.trigger),E=k(p.attributes);return{id:h(t.id)??"",number:et(o.number)??0,phase:h(o.phase)??"unknown",outcome:h(o.current_outcome),createdAt:h(o.created_at)??"",branch:h(a.branch),tag:h(a.tag),revision:h(a.revision),commitSubject:h(l.subject),commitUrl:h(l.url),pipelineName:h(k(u.attributes).name),trigger:h(E.name)??h(k(E.event_source).type)??h(c.type),errors:br(o.errors),warnings:Rr(o.warnings)}}function ys(e){let t=k(e),o=k(t.attributes),r=k(o.auto_rerun);return{id:h(t.id)??"",name:h(o.name)??"Workflow",phase:h(o.phase)??"unknown",outcome:h(o.current_outcome)??h(o.outcome),createdAt:h(o.created_at),endedAt:h(o.ended_at),tag:h(o.tag),autoRerunNumber:et(r.number)}}function Xt(e){let t=k(e),o=k(t.attributes);return{id:h(t.id)??"",name:h(o.name)??"Job",number:et(o.number)??0,type:h(o.type)??"build",phase:h(o.phase)??"unknown",outcome:h(o.outcome),startedAt:h(o.started_at),endedAt:h(o.ended_at)}}function Is(e){let t=k(e);return{num:et(t.num)??0,name:h(t.name)??"Step",type:h(t.type)??"run",phase:h(t.phase)??"unknown",outcome:h(t.outcome),exitCode:et(t.exit_code),command:h(t.command),startedAt:h(t.started_at),endedAt:h(t.ended_at)}}function ws(e){let t=Xt(e),o=k(k(e).attributes),r=ve(o.parallel_executions).map(k),s=r.length>0?ve(r[0]?.steps).map(Is):[];return{...t,errors:br(o.errors),warnings:Rr(o.warnings),steps:s,parallelExecutions:r.length}}function Tr(e){let t=k(e),o=k(t.attributes),r=k(k(t.references).org);return{id:h(t.id)??"",name:h(o.name)??"Project",orgId:h(r.id)??"",orgName:h(k(r.attributes).name)??""}}function Cs(e){let t=k(e),o=k(t.attributes);return{id:h(t.id)??"",name:h(o.name)??"Organization",vcsProvider:h(k(o.vcs).provider)}}function hr(e){let t=k(e),o=k(t.attributes),r=k(o.config);return{id:h(t.id)??"",name:h(o.name)??"Pipeline",configPath:h(r.file_path)??""}}function vs(e){let t=k(e),o=k(t.attributes);return{id:h(t.id)??"",login:h(o.login)??"CircleCI account",name:h(o.name),avatarUrl:h(o.avatar_url)}}function Ns(e){if(!e)return;let t={};for(let[o,r]of Object.entries(e))r==null||r===""||(t[o]=String(r));return Object.keys(t).length>0?t:void 0}function gr(e){if(e)try{return JSON.parse(e)}catch{return}}function Us(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Ps(e,t,o){let r=k(k(t).error),s=h(r.detail)??h(r.title)??h(r.type)??Us(e);return new ye(e,h(r.type)??`HTTP_${e}`,s)}function Ms(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function Ls(e){return new Promise(t=>setTimeout(t,e))}function Or(e){async function t(a,l){let u=Ns(a.query),p=0;for(;;){let E=await e({method:a.method,path:As+a.path,...u?{query:u}:{},...a.body===void 0?{}:{body:JSON.stringify(a.body)}});if(E.status>=400){if(Ms(E.status,a.method)&&p<Sr.length){await Ls(Sr[p]??2500),p+=1;continue}throw Ps(E.status,gr(E.body),E.body)}return l(E.body)}}let o=a=>t(a,gr),r=a=>t(a,l=>l);async function s(a,l,u,p,E){let m=E?{...l,"page[cursor]":E}:{...l,"page[limit]":u},S;try{S=await o({method:"GET",path:a,query:m})}catch(g){if(!E&&g instanceof ye&&g.status===400)S=await o({method:"GET",path:a,query:{...l}});else throw g}return{items:ve(k(S).data).map(p),next:h(k(k(S).page).next)}}async function c(a,l,u,p,E){let m=[],S,g=null;for(let U=0;U<E;U+=1){let F=await s(a,l,u,p,S);if(m.push(...F.items),g=F.next,!g)break;S=g}return{items:m,next:g}}return{currentUser:async()=>{let a=await o({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),l=ve(k(a).data)[0];if(!l)throw new ye(200,"EMPTY_USER","CircleCI returned no user.");return vs(l)},listOrgs:async()=>(await c("/orgs",{},mr,Cs,Ze)).items,findProjectBySlug:async a=>{let l=await o({method:"GET",path:"/projects",query:{"filter[slug]":a}}),u=ve(k(l).data)[0];return u?Tr(u):null},listProjectsOfOrg:a=>c("/projects",{"filter[org_id]":a},mr,Tr,Ze),listPipelines:async a=>{let l=await c("/pipelines",{"filter[project_id]":a},ks,hr,1),u=[];for(let p of l.items)if(p.id)try{let E=await o({method:"GET",path:`/pipelines/${encodeURIComponent(p.id)}`,query:{"filter[project_id]":a}});u.push(hr(k(E).data))}catch{u.push({...p,name:"Pipeline config"})}return u},listRuns:(a,l)=>s("/runs",{"filter[project_id]":a},dt,lt,l),listMyRuns:a=>s("/runs",{"filter[user_id]":"me"},dt,lt,a),getRun:async a=>{let l=await o({method:"GET",path:`/runs/${encodeURIComponent(a)}`});return lt(k(l).data)},findRunByNumber:async(a,l)=>{let u;for(let p=0;p<Ze;p+=1){let E=await s("/runs",{"filter[project_id]":a},dt,lt,u),m=E.items.find(S=>S.number===l);if(m)return m;if(!E.next)return null;u=E.next}return null},fireRun:async a=>{let l=await o({method:"POST",path:"/runs",query:{"filter[project_id]":a.projectId},body:{data:{attributes:{checkout:{branch:a.branch}},references:{pipeline:{id:a.pipelineId}}}}}),u=h(k(k(l).data).id);if(!u)throw new ye(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return u},listWorkflows:(a,l)=>s("/workflows",{"filter[run_id]":a},Vt,ys,l),listJobs:(a,l)=>l?s("/jobs",{"filter[workflow_id]":a},Vt,Xt,l):c("/jobs",{"filter[workflow_id]":a},Vt,Xt,Ze),getJob:async a=>{let l=await o({method:"GET",path:`/jobs/${encodeURIComponent(a)}`});return ws(k(l).data)},condensedOutput:async(a,l,u=0)=>r({method:"GET",path:`/jobs/${encodeURIComponent(a)}/stdout/condensed`,query:{"filter[execution]":u,"filter[step_num]":l}}).then(p=>typeof p=="string"?p:""),rerunWorkflow:async(a,l)=>{let u=await o({method:"POST",path:`/workflows/${encodeURIComponent(a)}/rerun`,body:l?{is_from_failed:!0}:void 0});return h(k(k(u).data).id)??""},cancelWorkflow:async a=>{await o({method:"POST",path:`/workflows/${encodeURIComponent(a)}/cancel`})},approve:async a=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(a)}/approve`})},reject:async a=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(a)}/reject`})}}}var xr=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Ds={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function Ar(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Gs(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function ae(e,t){let o=(t??"").toLowerCase(),r=(e??"").toLowerCase(),s=o||r,c=Ar(o)??Ar(r)??"neutral",a=o?!xr.has(o):!xr.has(r)&&r!=="ended";return{label:Ds[s]??Gs(s),tone:c,active:a}}function ue(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function Ge(e,t,o=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let s=t?Date.parse(t):o;if(!Number.isFinite(s)||s<r)return"";let c=Math.round((s-r)/1e3);if(c<60)return`${c}s`;let a=Math.floor(c/60),l=c%60;if(a<60)return l>0?`${a}m ${l}s`:`${a}m`;let u=Math.floor(a/60),p=a%60;return p>0?`${u}h ${p}m`:`${u}h`}function ut(e,t=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let r=Math.round((t-o)/1e3);if(r<45)return"just now";let s=Math.round(r/60);if(s<60)return`${s}m ago`;let c=Math.round(s/60);if(c<24)return`${c}h ago`;let a=Math.round(c/24);return a<7?`${a}d ago`:new Date(o).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function He(e){return e?e.slice(0,8):""}function Ne(e){return e.branch??e.tag??"detached"}var Hs={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function kr(e){let t=e.trim();if(!t)return null;let o=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);o&&!t.includes("://")&&(t=`https://${o[1]}/${o[2]}/${o[3]}`);let r;try{r=new URL(t)}catch{return null}let s=r.hostname.toLowerCase();if(!s)return null;let c=r.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(c.length<2)return null;let a=c[c.length-2]??"",l=c[c.length-1]??"";return!a||!l?null:{host:s,owner:a,repo:l}}function Ft(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function yr(e,t,o){return{segment:e&&Hs[e.host]||"github",owner:e?.owner??t,repo:e?.repo??o}}function js(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function tt(e,t){return`${js(e)}/${t}`}function ot(e,t,o){return`${tt(e,t)}/workflows/${o}`}function pt(e,t,o,r){return`${ot(e,t,o)}/jobs/${r}`}function Ir(e){let t=null,o=null,r="";for(let s of e.split(/\r?\n/)){let c=s.trim();if(!c||c.startsWith("#")||c.startsWith(";"))continue;let a=/^\[([^\]]+)\]$/.exec(c);if(a){r=(a[1]??"").trim().toLowerCase();continue}let l=/^url\s*=\s*(.*)$/i.exec(c);if(!l)continue;let u=(l[1]??"").trim();u&&(o===null&&(o=u),(/remote\s+"origin"/i.test(r)||/remote\s+'origin'/i.test(r))&&(t=u))}return t??o}function wr(e){let t=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return t&&(t[1]??"").trim()||null}var Cr="circleci",vr=16e3,$s=200,Bt=2e3;function Wt(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function je(e){return ae(e.phase,e.outcome).label.toLowerCase()}function Nr(e){let{workspace:t,run:o,workflow:r,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:o.id,runNumber:o.number,branch:o.branch,workflowId:r?.id??null,workflowName:r?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function he(e){return typeof e=="string"&&e.length>0?e:null}function Ur(e){if(typeof e!="object"||e===null||Array.isArray(e))return null;let t=e,o=he(t.projectId),r=he(t.projectName),s=he(t.orgName)??"",c=he(t.runId),a=typeof t.runNumber=="number"&&Number.isFinite(t.runNumber)?t.runNumber:null;return!o||!r||!c||a===null?null:{projectId:o,projectName:r,orgName:s,runId:c,runNumber:a,branch:he(t.branch),workflowId:he(t.workflowId),workflowName:he(t.workflowName),jobId:he(t.jobId),jobName:he(t.jobName)}}function Pr(e){let t=e.workflow?.id??"run",o=e.job?.id??"";return`${e.run.id}:${t}:${o}`}function Mr(e){let{run:t,workflow:o,job:r}=e,s=r?.name??o?.name??`run #${t.number}`,c=je(r?{phase:r.phase,outcome:r.outcome}:o||{phase:t.phase,outcome:t.outcome});return Wt(`${s} ${c} in CircleCI run #${t.number}`,$s)}function Kt(e){let{workspace:t,run:o,workflow:r,job:s}=e;return r&&s&&s.number>0?pt(t.target,o.number,r.id,s.number).slice(0,Bt):r?ot(t.target,o.number,r.id).slice(0,Bt):tt(t.target,o.number).slice(0,Bt)}function zt(e){let{workspace:t,run:o,workflow:r,job:s,jobs:c,detail:a,output:l}=e,u=[];u.push(`CircleCI run #${o.number} on ${t.link.orgName}/${t.link.projectName}`),u.push(`Status: ${je({phase:o.phase,outcome:o.outcome})}`),o.pipelineName&&u.push(`Pipeline: ${o.pipelineName}`),u.push(`Ref: ${Ne(o)}${o.revision?` at ${He(o.revision)}`:""}`),o.commitSubject&&u.push(`Commit: ${o.commitSubject}`),u.push(`URL: ${Kt(e)}`);let p=c.filter(E=>ue(E.outcome));if(r){if(u.push(""),u.push(`Workflow ${r.name} (${je(r)})`),p.length>0){u.push("Failing jobs:");for(let m of p)u.push(`- ${m.name} (#${m.number})`)}let E=c.filter(m=>!p.includes(m));if(E.length>0){u.push("Other jobs:");for(let m of E)u.push(`- ${m.name}: ${je({phase:m.phase,outcome:m.outcome})}`)}}if(s&&a){if(u.push(""),u.push(`Job ${a.name} (#${a.number})`),a.errors.length>0){u.push("Errors:");for(let m of a.errors)u.push(`- ${m.type}: ${m.message}`)}let E=a.steps.filter(m=>m.outcome==="failed");if(E.length>0){u.push("Failed steps:");for(let m of E)u.push(`- step ${m.num} "${m.name}"${m.exitCode!==null?` (exit ${m.exitCode})`:""}`),m.command&&u.push(`  command: ${m.command}`)}}return l&&l.trim()&&(u.push(""),u.push("Condensed output:"),u.push(l.trim())),Wt(u.join(`
`),vr)}function Lr(e){return Wt(`Investigate and fix this CircleCI failure.

${zt(e)}`,vr)}var w="openchamber.sdk";var ft="data-oc-scrolling",Jt=`
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
`;function qt(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let s=r.target===e?t:r.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let c=o.get(s);c!==void 0&&clearTimeout(c),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Vs=`(${qt.toString()})(document);`;var jr=/^[a-z][a-z0-9-]{0,39}$/;var Dr=e=>Object(e)===e&&!Array.isArray(e),Qt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),Gr=e=>String(e)===e&&e.length>=1&&e.length<=60,Hr=e=>String(e)===e&&e.length>=1&&e.length<=80,$r=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!Dr(o)||!jr.test(o.id)||!Gr(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!Qt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!Qt(o,["kind","id","label","value","options","disabled"])||!Hr(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let s of o.options){if(!Dr(s)||!Qt(s,["value","label"])||!Hr(s.value)||!Gr(s.label)||r.has(s.value))return!1;r.add(s.value)}if(!r.has(o.value))return!1}return!0};var Vr=["{id}","{segment}","{segments+}"];var ba=new Set(Vr);var Xr=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var Oa=new Set(Xr);var Yt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Fr=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var Br=/^[A-Za-z0-9_-]{1,80}$/;var Wr=["left","right","top","bottom"];var Kr=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of r)if(!Kr(s,t+1,o))return!1;return!0},Zt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(Zt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(Zt)}return String(e)===e||Number.isFinite(e)},eo=e=>{try{return String(e.id)!==e.id||!Br.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Wr.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Kr(e.data)||!Zt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var oo=2e3;var Jr=["file","directory","other","missing"],ro=e=>!!(e&&"sessionId"in e),no=e=>!!(e&&"sent"in e&&!("sessionId"in e));var qr=/^[0-9a-f]{7,64}$/i,so=e=>qr.test(e),Et=500,_t=32e3,Qr=16e3,Yr=128,Zr=200,en=2e3,tn=16e3,on=80,rn=200,nn=16e3;var sn=2e3;var io=2e4,mt=1024,St=2e6;var Tt=64e3,ht=8e3,ao=4e3;var co=96e4,Fs=60*6e4;var an=999,cn=1e4,rt=500,ln=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],dn=["stopped","starting","ready","failed"],Bs=new Set(ln),un=e=>Bs.has(e),pn=e=>e&&un(e)?e:"HOST_REJECTED",$e=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every($e):Object(e)===e?Object.values(e).every($e):!1,fn=e=>$e(e)&&JSON.stringify(e).length<=nn,zr=e=>e?.trim().slice(0,rn)??"",Ve=e=>{let t=e.id.trim().slice(0,Yr),o=e.title.trim().slice(0,Zr),r=e.url.trim().slice(0,en),s=e.text?.trim().slice(0,tn),c=e.author?.trim().slice(0,on),a=e.kind==="pull"?"pull":"issue",l={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:a};if(s&&(l.text=s),c&&(l.author=c),a==="pull"){let u=zr(e.branches?.head),p=zr(e.branches?.base);u&&p&&(l.branches={head:u,base:p})}return fn(e.data)&&(l.data=e.data),l},lo=e=>{let t=Ve(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},uo=e=>{let t={text:e.text.trim().slice(0,Qr)};return e.send&&(t.send=!0),t},po=e=>e===null||!Number.isFinite(e)?null:Math.min(an,Math.max(0,Math.round(e))),fo=e=>Number.isFinite(e)?Math.min(cn,Math.max(0,Math.ceil(e))):0;var Xe=e=>e.length>0&&e.length<=mt&&!e.includes("\0")&&!e.includes("\\");var gt=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>sn?!1:!e.split("/").some(o=>o==="."||o===".."),Ws=new Set(dn),Eo=e=>!!(e&&"status"in e&&Ws.has(String(e.status))&&!("body"in e)),bt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),_o=e=>!!(e&&"content"in e&&String(e.content)===e.content),mo=e=>!!(e&&"written"in e&&e.written===!0),So=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Ks=new Set(Jr),To=e=>!!(e&&"kind"in e&&"size"in e&&Ks.has(String(e.kind))&&Number.isFinite(e.size)),ho=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),zs=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Js=e=>Object(e)===e?e:null,to=e=>String(e)===e&&e.length>0,qs=e=>{if(!to(e.id))return null;if(e.ok===!0){let t={channel:w,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&to(e.error)?{channel:w,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:pn(to(e.code)?e.code:void 0)}:null},go=e=>{let t=Js(e);return!t||t.channel!==w||t.v!==1?null:t.type==="result"?qs(t):!zs.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var En=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,Qs=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",x=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},_n=()=>Promise.reject(new x("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Rt=()=>Promise.reject(new x("BAD_PATH",`File path must be 1 to ${mt} characters without NUL or backslash.`)),Ot=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new x("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},y=e=>(e.value+=1,`oc-${e.value}`),Ao=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new x("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(i=>i===t.parent),r=e.requestTimeoutMs??io,s=new Set,c=new Set,a=new Set,l=new Set,u=new Set,p=new Set,E=new Set,m=new Set,S=new Set,g=new Set,U=new Set,F=new Set,N=[],O=null,K=null,q=new Set,Ce=new Set,Ae=null,ke=null,De=!1,_e=new Map,me=new Map,Se=new Map,oe=!1,_={value:0},T=null,Te=null,Qe=!1,Ye=!1,nr=null,sr=i=>i?{sessionId:i.id,phase:i.busy?"started":"completed"}:null,re=i=>{t.parent.postMessage(i,"*")},ir=()=>{oe||t.parent===t||F.size===0||T?.features?.lateGenerateResults!==!0||re({channel:w,v:1,type:"generate-late-listen"})},H=(i,d)=>{for(let R of i)try{R(d)}catch(A){console.error(A)}},ar=i=>{if(!(i instanceof MessageEvent)||!o(i.source))return;let d=go(i.data);if(!d)return;if(d.type==="workspace"){let A=me.get(d.payload.subscriptionId);A&&H([A],d.payload.snapshot);return}if(d.type==="shells"){let A=Se.get(d.payload.subscriptionId);A&&H([A],d.payload.snapshot);return}if(d.type==="ready"){T=d.payload,Te=sr(d.payload.session),H(s,d.payload),H(c,d.payload.directory),H(a,d.payload.session),Te&&H(l,Te),H(u,d.payload.connection),H(p,d.payload.settings),H(E,d.payload.item),d.payload.block&&H(m,d.payload.block),ir();return}if(d.type==="service-event"){H(S,d.payload);return}if(d.type==="generate-late"){F.size===0?N.push(d.payload):H(F,d.payload);return}if(d.type==="directory"){T&&(T={...T,directory:d.payload.directory}),H(c,d.payload.directory);return}if(d.type==="session"){T&&(T={...T,session:d.payload.session}),d.payload.session?Te?.sessionId!==d.payload.session.id&&(Te=sr(d.payload.session)):Te=null,H(a,d.payload.session);return}if(d.type==="session-lifecycle"){Te=d.payload,H(l,d.payload);return}if(d.type==="connection"){T&&(T={...T,connection:d.payload.connection}),H(u,d.payload.connection);return}if(d.type==="settings"){T&&(T={...T,settings:d.payload.settings}),H(p,d.payload.settings);return}if(d.type==="item"){T&&(T={...T,item:d.payload.item}),H(E,d.payload.item);return}if(d.type==="status-control-event"){H(g,d.payload);return}if(d.type==="popover-closed"){H(U,d.payload);return}if(d.type==="action"){let A=L=>{oe||re({channel:w,v:1,type:"action-result",id:d.id,payload:L})},D=K;if(!D){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>D(d.payload)).then(()=>A({ok:!0}),L=>{let W=(L instanceof Error?L.message:String(L)).trim();A({ok:!1,error:(W||"Action failed.").slice(0,rt)})});return}if(d.type==="file-open"){let A=d.payload;if(ke&&Fr(ke,A))return;ke=A,H(q,d.payload);return}if(d.type==="file-saved"){H(Ce,d.payload.version);return}if(d.type==="file-snapshot"){let A=W=>{oe||re({channel:w,v:1,type:"file-snapshot-result",id:d.id,payload:W})},D=W=>A({error:(W.trim()||"Could not read the edited file.").slice(0,rt)}),L=Ae;if(!L){D("This extension does not edit files.");return}Promise.resolve().then(()=>L(d.payload.purpose)).then(W=>{if(Yt(W)>2e7){D(`The file is over ${2e7} ${"bytes"in W?"bytes":"characters"}.`);return}if(W.version.length>256){D(`The snapshot version is over ${256} characters.`);return}A({snapshot:"bytes"in W?{bytes:W.bytes,version:W.version}:{content:W.content,version:W.version}})},W=>D(W instanceof Error?W.message:String(W)));return}if(d.type==="resolve"){let A=L=>{re({channel:w,v:1,type:"resolve-result",id:d.id,payload:L})},D=O;if(!D){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>D(d.payload)).then(L=>A({item:L?Ve(L):null}),L=>{let W=(L instanceof Error?L.message:String(L)).trim();A({error:(W||"Command failed.").slice(0,rt)})});return}let R=_e.get(d.id);if(R){if(clearTimeout(R.timer),_e.delete(d.id),d.ok){R.resolve(d.payload);return}R.reject(new x(d.code,d.error))}};t.addEventListener("message",ar),re({channel:w,v:1,type:"hello"});let Z=(i,d=r)=>oe||t.parent===t?Promise.reject(new x("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((R,A)=>{let D=setTimeout(()=>{_e.delete(i.id),A(new x("HOST_TIMEOUT","Host did not answer in time."))},d);_e.set(i.id,{resolve:R,reject:A,timer:D}),re(i)}),V=i=>Z(i).then(()=>{}),B={channel:w,v:1},Ht=i=>{!oe&&t.parent!==t&&re(i)},cr=()=>Ht({...B,type:"file-save"}),lr=i=>{!En(i)||!Qs(i)||(i.preventDefault(),cr())},dr=i=>{!En(i)||i.key!=="Escape"||T?.surface!=="popover"||!T.popover||(i.preventDefault(),Er(T.popover.id,"escape").catch(()=>{}))},it=()=>{let i=T?.surface==="popover"?T.popover:void 0;if(!i)return;let d=Qe||Ye;nr!==d&&(nr=d,_r(i.id,d).catch(()=>{}))},at=()=>{T?.surface!=="popover"||Qe||(Qe=!0,it())},ur=i=>{T?.surface!=="popover"||i.relatedTarget!==null||!Qe||(Qe=!1,it())},pr=()=>{T?.surface!=="popover"||Ye||(Ye=!0,it())},fr=()=>{T?.surface!=="popover"||!Ye||(Ye=!1,it())},de=(i,d=1024)=>{if(!i.trim()||i.length>d)throw new x("HOST_REJECTED",`Identity must contain 1 to ${d} characters.`)},jt=async i=>{i.kind!=="projects"&&de(i.projectId);let d=await Z({...B,type:"workspace-read",id:y(_),payload:i});if(!d||!("kind"in d)||!("state"in d)||d.kind!==i.kind)throw new x("HOST_REJECTED","Host did not return workspace data.");return d},$t=async(i,d)=>{i.kind!=="projects"&&de(i.projectId);let R=y(_);me.set(R,d);try{await V({...B,type:"workspace-subscribe",id:y(_),payload:{subscriptionId:R,query:i}})}catch(A){throw me.delete(R),oe||re({...B,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:R}}),A}return()=>{!me.delete(R)||oe||re({...B,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:R}})}},xs=async(i,d)=>{i.kind==="session"&&de(i.sessionId),i.kind==="project"&&de(i.projectId);let R=y(_);Se.set(R,d);try{await V({...B,type:"shells-subscribe",id:y(_),payload:{subscriptionId:R,scope:i}})}catch(A){throw Se.delete(R),oe||re({...B,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:R}}),A}return()=>{!Se.delete(R)||oe||re({...B,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:R}})}},ct=async i=>{if("key"in i&&(i.key.length===0||i.key.length>128))throw new x("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!$e(i.value))throw new x("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>65536)throw new x("HOST_REJECTED","Storage value exceeds 64 KiB.");if(i.scope==="device"&&T?.features?.deviceStorage!==!0)throw new x("UNSUPPORTED","This host does not support device storage.");let d=await Z({...B,type:"storage",id:y(_),payload:i});if(!d||!("storage"in d)||d.op!==i.op)throw new x("HOST_REJECTED","Host did not return storage data.");return d},Er=(i,d)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):V({...B,type:"popover-close",id:y(_),payload:d?{id:i,reason:d}:{id:i}}),_r=(i,d)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):V({...B,type:"popover-anchor",id:y(_),payload:{id:i,active:d}});return t.addEventListener("keydown",dr,!0),t.addEventListener("pointerover",at),t.addEventListener("pointermove",at),t.addEventListener("pointerout",ur),t.addEventListener("focus",pr),t.addEventListener("blur",fr),{onAction:i=>(K=i,()=>{K===i&&(K=null)}),listProjects:async()=>{let i=await jt({kind:"projects"});if(i.kind!=="projects")throw new x("HOST_REJECTED","Expected projects.");return i},listWorktrees:async i=>{let d=await jt({kind:"worktrees",projectId:i});if(d.kind!=="worktrees")throw new x("HOST_REJECTED","Expected worktrees.");return d},listSessions:async i=>{let d=await jt({kind:"sessions",projectId:i});if(d.kind!=="sessions")throw new x("HOST_REJECTED","Expected sessions.");return d},onProjects:i=>$t({kind:"projects"},d=>{d.kind==="projects"&&i(d)}),onWorktrees:(i,d)=>$t({kind:"worktrees",projectId:i},R=>{R.kind==="worktrees"&&d(R)}),onSessions:(i,d)=>$t({kind:"sessions",projectId:i},R=>{R.kind==="sessions"&&d(R)}),onRunningShells:(i,d)=>xs(i,d),readShellOutput:async(i,d)=>{de(i,128);let R=d?.cursor;if(R!==void 0&&(!Number.isInteger(R)||R<0))throw new x("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=d?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>65536))throw new x("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let L=await Z({...B,type:"shell-output",id:y(_),payload:{shellId:i,cursor:R,tailBytes:A}});if(!L||typeof L.output!="string"||!Number.isFinite(L.cursor))throw new x("HOST_REJECTED","Host did not return shell output.");return L},stopShell:async i=>{if(de(i,128),(await Z({...B,type:"shell-stop",id:y(_),payload:{shellId:i}}))?.stopped!==!0)throw new x("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async i=>{de(i),await V({...B,type:"open-session",id:y(_),payload:{sessionId:i}})},storage:{get:async(i,d)=>{let R=Ot(d),A={op:"get",key:i};R&&(A.scope=R);let D=await ct(A);return D.op==="get"&&D.found?D.value:void 0},set:async(i,d,R)=>{let A=Ot(R),D={op:"set",key:i,value:d};A&&(D.scope=A),await ct(D)},delete:async(i,d)=>{let R=Ot(d),A={op:"delete",key:i};R&&(A.scope=R),await ct(A)},keys:async i=>{let d=Ot(i),R={op:"keys"};d&&(R.scope=d);let A=await ct(R);if(A.op!=="keys")throw new x("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:i=>(s.add(i),T&&i(T),()=>{s.delete(i)}),onDirectory:i=>(c.add(i),T&&i(T.directory),()=>{c.delete(i)}),onSession:i=>(a.add(i),T&&i(T.session),()=>{a.delete(i)}),onSessionLifecycle:i=>(l.add(i),Te&&i(Te),()=>{l.delete(i)}),onConnection:i=>(u.add(i),T&&i(T.connection),()=>{u.delete(i)}),onSettings:i=>(p.add(i),T&&i(T.settings),()=>{p.delete(i)}),onItem:i=>(E.add(i),T&&i(T.item),()=>{E.delete(i)}),onBlock:i=>(m.add(i),T?.block&&i(T.block),()=>{m.delete(i)}),onServiceEvent:i=>(S.add(i),()=>{S.delete(i)}),onStatusControl:i=>(g.add(i),()=>{g.delete(i)}),onPopoverClosed:i=>(U.add(i),()=>{U.delete(i)}),setStatusControls:i=>T?.features?.statusControls!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support status controls.")):$r(i)?V({...B,type:"status-controls",id:y(_),payload:{controls:i}}):Promise.reject(new x("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:i=>T?.features?.popovers!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):eo(i)?V({...B,type:"popover-open",id:y(_),payload:i}):Promise.reject(new x("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Er,setPopoverAnchorActive:_r,onResolve:i=>(O=i,()=>{O===i&&(O=null)}),toast:i=>{let d=i.message.trim();return!d||d.length>Et?Promise.reject(new x("HOST_REJECTED",`Toast message must contain 1 to ${Et} characters.`)):i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>_t)?Promise.reject(new x("HOST_REJECTED",`Toast copy text must contain 1 to ${_t} characters.`)):V({channel:w,v:1,type:"toast",id:y(_),payload:{...i,message:d}})},openUrl:i=>V({channel:w,v:1,type:"open-url",id:y(_),payload:{url:i}}),openCommit:i=>so(i)?V({channel:w,v:1,type:"open-commit",id:y(_),payload:{sha:i}}):Promise.reject(new x("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:i=>V({channel:w,v:1,type:"block-answer",id:y(_),payload:{text:i.trim().slice(0,oo)}}),openSurface:i=>V({channel:w,v:1,type:"open-surface",id:y(_),payload:{surfaceId:i}}),writeClipboard:i=>V({channel:w,v:1,type:"clipboard-write",id:y(_),payload:{text:i}}),compose:i=>V({channel:w,v:1,type:"compose",id:y(_),payload:i}),attach:i=>V({channel:w,v:1,type:"attach",id:y(_),payload:Ve(i)}),startSession:async i=>{i.projectId!==void 0&&de(i.projectId);let d=i.worktree;d&&d!==!0&&(d.kind==="existing"?de(d.directory):(d.name!==void 0&&de(d.name,200),d.baseBranch!==void 0&&de(d.baseBranch,200)));let R=await Z({channel:w,v:1,type:"start-session",id:y(_),payload:lo(i)},e.requestTimeoutMs??18e4);if(!ro(R))throw new x("HOST_REJECTED","Host did not return a session.");return R},prompt:i=>Z({channel:w,v:1,type:"prompt",id:y(_),payload:uo(i)}).then(d=>{if(!no(d))throw new x("HOST_REJECTED","Host did not return a prompt result.");return d}),sessionLink:i=>V({channel:w,v:1,type:"session-link",id:y(_),payload:Ve(i)}),close:()=>V({channel:w,v:1,type:"close",id:y(_)}),oauthStart:()=>V({channel:w,v:1,type:"oauth-start",id:y(_)}),oauthDisconnect:()=>V({channel:w,v:1,type:"oauth-disconnect",id:y(_)}),request:i=>(gt(i.path)?Z({channel:w,v:1,type:"request",id:y(_),payload:i}):_n()).then(d=>{if(!bt(d))throw new x("HOST_REJECTED","Host request result was empty.");return d}),serviceRequest:i=>(gt(i.path)?Z({channel:w,v:1,type:"service-request",id:y(_),payload:i}):_n()).then(d=>{if(!bt(d))throw new x("HOST_REJECTED","Host service request result was empty.");return d}),serviceStatus:()=>Z({channel:w,v:1,type:"service-status",id:y(_)}).then(i=>{if(!Eo(i))throw new x("HOST_REJECTED","Host did not return service status.");return i}),readFile:i=>(Xe(i)?Z({channel:w,v:1,type:"file-read",id:y(_),payload:{path:i}}):Rt()).then(d=>{if(!_o(d))throw new x("HOST_REJECTED","Host did not return file content.");return d}),writeFile:(i,d)=>Xe(i)?d.length>St?Promise.reject(new x("FILE_TOO_LARGE",`Content is over ${St} characters.`)):Z({channel:w,v:1,type:"file-write",id:y(_),payload:{path:i,content:d}}).then(R=>{if(!mo(R))throw new x("HOST_REJECTED","Host did not confirm the write.");return R}):Rt(),listDir:i=>(Xe(i)?Z({channel:w,v:1,type:"file-list",id:y(_),payload:{path:i}}):Rt()).then(d=>{if(!So(d))throw new x("HOST_REJECTED","Host did not return directory entries.");return d}),stat:i=>(Xe(i)?Z({channel:w,v:1,type:"file-stat",id:y(_),payload:{path:i}}):Rt()).then(d=>{if(!To(d))throw new x("HOST_REJECTED","Host did not return file status.");return d}),generate:i=>{let d=i.prompt.trim(),R=i.system?.trim();if(d.length===0||d.length>Tt)return Promise.reject(new x("HOST_REJECTED",`Prompt must be 1 to ${Tt} characters.`));if(R!==void 0&&(R.length===0||R.length>ht))return Promise.reject(new x("HOST_REJECTED",`System prompt must be 1 to ${ht} characters.`));let A=i.maxOutputTokens===void 0?void 0:Math.min(ao,Math.max(1,Math.floor(i.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new x("HOST_REJECTED","maxOutputTokens must be a number."));let D={prompt:d};return R!==void 0&&(D.system=R),A!==void 0&&(D.maxOutputTokens=A),Z({channel:w,v:1,type:"generate",id:y(_),payload:D},e.requestTimeoutMs??co).then(L=>{if(!ho(L))throw new x("HOST_REJECTED","Host did not return generated text.");return L})},onLateGenerateResult:i=>{F.add(i);for(let d of N.splice(0))H([i],d);return ir(),()=>{F.delete(i)}},setBadge:i=>V({channel:w,v:1,type:"badge",id:y(_),payload:{count:po(i)}}),setHeight:i=>V({channel:w,v:1,type:"resize",id:y(_),payload:{height:fo(i)}}),onFileOpen:i=>(q.add(i),De||(De=!0,t.addEventListener("keydown",lr,!0)),ke&&i(ke),()=>{q.delete(i)}),onFileSnapshot:i=>(Ae=i,()=>{Ae===i&&(Ae=null)}),onFileSaved:i=>(Ce.add(i),()=>{Ce.delete(i)}),reportFileChange:i=>Ht({...B,type:"file-change",payload:{dirty:i.dirty,edited:i.edited}}),requestFileSave:cr,reportFileUnsupported:()=>Ht({...B,type:"file-unsupported"}),dispose:()=>{for(let i of me.keys())re({...B,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:i}});me.clear();for(let i of Se.keys())re({...B,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:i}});Se.clear(),oe=!0,O=null,K=null,Ae=null,q.clear(),Ce.clear(),De&&t.removeEventListener("keydown",lr,!0),t.removeEventListener("message",ar),t.removeEventListener("keydown",dr,!0),t.removeEventListener("pointerover",at),t.removeEventListener("pointermove",at),t.removeEventListener("pointerout",ur),t.removeEventListener("focus",pr),t.removeEventListener("blur",fr);for(let i of _e.values())clearTimeout(i.timer),i.reject(new x("HOST_UNAVAILABLE","Host client was disposed."));_e.clear(),s.clear(),c.clear(),a.clear(),l.clear(),u.clear(),p.clear(),E.clear(),m.clear(),S.clear(),g.clear(),U.clear(),F.clear(),N.length=0}}};var Tn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Ga=new Set(Tn);var Ys=10*6e4;var Zs=10*6e4;var ei=10*6e4;var ti=10*6e4;var hn=["none","agent","user"];var ja=new Set(hn);var Q=Ao(),gn=async e=>Q.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function ee(e,t){try{await Q.toast({kind:e,message:t})}catch{}}function xt(e){return Q.readFile(e)}function bn(e){return{providerId:Cr,id:Pr(e).slice(0,128),title:Mr(e),url:Kt(e),kind:"issue",text:zt(e),data:Nr(e)}}async function Rn(e){await Q.attach(bn(e))}async function On(e,t={}){await Q.startSession({...bn(e),worktree:t.worktree??!0,navigation:t.navigation??"open"})}async function xn(e,t={}){await Q.prompt({text:Lr(e),send:t.send??!0})}function f(e,t={},...o){let r=document.createElement(e);t.className&&(r.className=t.className),t.text!==void 0&&(r.textContent=t.text),t.title&&(r.title=t.title),t.style&&r.setAttribute("style",t.style),t.role&&r.setAttribute("role",t.role),t.ariaLabel&&r.setAttribute("aria-label",t.ariaLabel);for(let s of o)s==null||s===!1||r.append(typeof s=="string"?document.createTextNode(s):s);return r}function An(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function Fe(e,t){return t?f("div",{className:"meta-row"},f("span",{className:"meta-label",text:e}),f("span",{className:"meta-value",text:t})):null}var oi={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function z(e){return e instanceof ye?e.message:e instanceof x?oi[e.code]??e.message:e instanceof Error?e.message:String(e)}function ri(e){return e instanceof x?e.code:null}function At(e){let t=ri(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}function kn(e){let t=null,o=()=>{t!==null&&(window.clearTimeout(t),t=null)};return{arm:()=>{o(),!(!e.enabled()||!e.active())&&(t=window.setTimeout(()=>{t=null,e.onTick()},e.delayMs))},stop:o}}var ni=["all","failed","running"];function yn(e){return ni.includes(e)?e:"all"}function si(e){return[`#${e.number}`,Ne(e),He(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function ii(e,t,o=""){if(t==="failed"&&!ue(e.outcome)||t==="running"&&!ae(e.phase,e.outcome).active)return!1;let r=o.trim().toLowerCase();return r===""||si(e).includes(r)}function In(e,t,o=""){return e.filter(r=>ii(r,t,o))}function nt(e){return e.some(t=>ae(t.phase,t.outcome).active)}var ai=`
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
`,wn="circleci-shared-style";function Cn(){if(document.getElementById(wn))return;let e=document.createElement("style");e.id=wn,e.textContent=ai,document.head.append(e)}async function vn(e,t,o,r){try{return await e.rerunWorkflow(t.id,o),await r("success",`Rerun started for ${t.name}.`),!0}catch(s){return await r("error",z(s)),!1}}async function Nn(e,t,o){try{return await e.cancelWorkflow(t.id),await o("success",`Cancellation requested for ${t.name}.`),!0}catch(r){return await o("error",z(r)),!1}}async function Un(e,t,o,r){try{return o?await e.approve(t.id):await e.reject(t.id),await r("success",o?`Approved ${t.name}.`:`Rejected ${t.name}.`),!0}catch(s){return await r("error",z(s)),!1}}var Pn="prefs";function ci(e){let t=5381;for(let o=0;o<e.length;o+=1)t=(t<<5)+t+e.charCodeAt(o)>>>0;return t.toString(36)}function Mn(e){return`project:${ci(e)}`}function Ln(e){return`pipelines:${e}`}function ko(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ie(e){return typeof e=="string"&&e.length>0?e:null}function li(e){if(!ko(e))return null;let t=Ie(e.projectId),o=Ie(e.projectName),r=Ie(e.orgName),s=Ie(e.directory);if(!t||!o||!r||!s)return null;let c=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:o,orgName:r,slug:Ie(e.slug),source:c,directory:s}}async function Dn(e,t){let o=li(await e.get(Mn(t)));return!o||o.directory!==t?null:o}async function yo(e,t,o){await e.set(Mn(t),{projectId:o.projectId,projectName:o.projectName,orgName:o.orgName,slug:o.slug,source:o.source,directory:t})}var di={autoRefresh:!0};function ui(e){return ko(e)?{autoRefresh:e.autoRefresh!==!1}:{...di}}async function Io(e){return ui(await e.get(Pn))}async function Gn(e,t){let r={...await Io(e),...t};return await e.set(Pn,{autoRefresh:r.autoRefresh}),r}function pi(e){if(!Array.isArray(e))return null;let t=[];for(let o of e){if(!ko(o))continue;let r=Ie(o.id),s=Ie(o.name);!r||!s||t.push({id:r,name:s,configPath:Ie(o.configPath)??""})}return t.length>0?t:null}async function Hn(e,t){return pi(await e.get(Ln(t)))}async function jn(e,t,o){await e.set(Ln(t),o.map(r=>({id:r.id,name:r.name,configPath:r.configPath})))}var fi=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],Ei=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],$n=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of fi)t.style.setProperty(o,e.tokens[r]);for(let[o,r,s]of Ei){let c=e.tokens[s]??"";t.style.setProperty(o,c),t.style.setProperty(r,c)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},wo=(e,t)=>{$n(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var _i={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},G=(e,t)=>`var(--${e}, var(--oc-${_i[e]}, ${t}))`,be=G("surface-background","transparent"),yt=G("surface-elevated","transparent"),Be=G("surface-elevated-foreground","inherit"),ne=G("surface-foreground","inherit"),j=G("surface-muted-foreground","gray"),mi=G("surface-muted","transparent"),Ue=G("interactive-border","currentColor"),te=G("interactive-hover","transparent"),Pe=G("interactive-active","transparent"),Co=G("interactive-selection","transparent"),vo=G("interactive-selection-foreground","inherit"),ge=G("primary","currentColor"),No=G("primary-text","inherit"),Uo=G("error-text","inherit"),Si=G("font-sans","inherit"),Po=G("font-mono","monospace"),Bn=G("radius","9px"),Mo=`calc(${Bn} - 2px)`,Vn=`calc(${Bn} - 4px)`,$=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,Xn=`background-image: linear-gradient(${te}, ${te});`,Lo=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,Do="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",Fn="box-shadow: var(--oc-sdk-lit);",Go=`inset 0 0.5px 0 0 ${$(ne,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Ti=`
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
  --oc-sdk-field-lift: ${Go};
  --oc-sdk-raised-lift: ${Go};
  --oc-sdk-lit: ${Go};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,kt=e=>{let t=G(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${G(`${e}-text`,"inherit")}; }`},hi=`
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
`,Wn=`${Ti}
.oc-sdk { color: ${ne}; font-family: ${Si}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${Xn} }
.oc-sdk-mono { font-family: ${Po}; }
.oc-sdk-muted { color: ${j}; }
${kt("success")}${kt("warning")}${kt("error")}${kt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ge}; --oc-sdk-tone-text: ${No}; }

.oc-sdk-btn { border-radius: ${Mo}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Vn}; }
.oc-sdk-btn[data-variant="default"] { color: ${No}; background: ${$(ge,10,be)}; border-color: ${$(ge,12)}; ${Fn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${$(ge,16,be)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${$(ge,22,be)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${mi}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Pe}, ${Pe}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Be}; ${Do} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Pe}, ${Pe}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${te}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Pe}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${G("status-error","red")}; color: ${Uo}; background: ${$("var(--oc-sdk-tone)",7,be)}; border-color: ${$("var(--oc-sdk-tone)",12)}; ${Fn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${$("var(--oc-sdk-tone)",9,be)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${$("var(--oc-sdk-tone)",11,be)}; box-shadow: none; }

.oc-sdk-field-note { color: ${j}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Uo}; }
.oc-sdk-input { border-radius: ${Mo}; background: var(--oc-sdk-field-bg); color: ${Be}; ${Lo("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${j}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Lo($(ne,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Lo(G("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Po}; }

.oc-sdk-search-icon { color: ${j}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ge}; }
.oc-sdk-search-clear { border-radius: ${Vn}; color: ${j}; }
.oc-sdk-search-clear:hover { background: ${te}; color: ${ne}; }

.oc-sdk-trigger { border-radius: ${Mo}; background: var(--oc-sdk-raised-bg); color: ${Be}; ${Do} transition: background 150ms ease-out; }
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
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${Co}; color: ${vo}; }
.oc-sdk-option-check { color: ${ne}; }
.oc-sdk-option[data-destructive="true"] { color: ${Uo}; }
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
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${Xn} }
.oc-sdk-check-desc { color: ${j}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${$(ne,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${j}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ne}; }
.oc-sdk-tab[aria-selected="true"] { color: ${vo}; background: ${Co}; border-color: ${Ue}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Be}; background: var(--oc-sdk-raised-bg); ${Do} }
.oc-sdk-tab-count { color: ${j}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${$(ne,6)}; color: ${j}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${$("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${te}; }
.oc-sdk-row[aria-selected="true"] { background: ${Co}; color: ${vo}; }
.oc-sdk-row-lead { font-family: ${Po}; color: ${j}; }
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

.oc-sdk-text a { color: ${No}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${$(Ue,60)}; }
`,P=`
${Jt}
${hi}
${Wn}`;var Kn="oc-sdk-ui-style",pe=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},M=e=>{let t=document.getElementById(Kn);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}qt(document);let o=document.createElement("style");o.id=Kn,o.textContent=e,document.head.appendChild(o)},b=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},se=e=>{let t=b("button",e);return t.type="button",t},X=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},ce=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},zn=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var gi=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Re=(e,t)=>{M(P);let o=t,r=se("oc-sdk oc-sdk-btn"),s=gi(),c=document.createElement("span");r.append(c),e.append(r);let a=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==r?r.prepend(s):!o.loading&&s.parentNode===r&&s.remove(),X(c,o.label)},l=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",l),a(),{update:u=>{o={...o,...u},a()},dispose:()=>{r.removeEventListener("click",l),r.remove()}}};var Ho=(e,t)=>{M(P);let o=t,r=b("label","oc-sdk oc-sdk-field"),s=b("span","oc-sdk-field-label"),c=o.multiline?b("textarea","oc-sdk-input"):b("input","oc-sdk-input"),a=b("span","oc-sdk-field-note");r.append(s,c,a),e.append(r);let l=()=>{X(s,o.label),s.hidden=!o.label,c instanceof HTMLInputElement?c.type=o.password?"password":"text":c.rows=o.rows??3,c.value!==o.value&&(c.value=o.value),c.disabled=!!o.disabled,ce(c,"placeholder",o.placeholder),c.dataset.mono=o.mono?"true":"false";let p=!!o.error;r.dataset.invalid=p?"true":"false",c.setAttribute("aria-invalid",p?"true":"false");let E=o.error??o.helper??"";X(a,E),a.hidden=E===""},u=()=>{o.onChange(c.value)};return c.addEventListener("input",u),l(),{update:p=>{o={...o,...p},l()},dispose:()=>{c.removeEventListener("input",u),r.remove()}}};var Jn="http://www.w3.org/2000/svg",bi={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Oe=(e,t,o)=>{let r=document.createElementNS(Jn,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let s=document.createElementNS(Jn,"path");return s.setAttribute("d",bi[e]),r.append(s),r};var jo=(e,t)=>{M(P);let o=t,r=b("div","oc-sdk oc-sdk-search"),s=b("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let c=se("oc-sdk-search-clear");c.append(Oe("close",14)),c.tabIndex=-1,r.append(Oe("search",16,"oc-sdk-search-icon"),s,c),e.append(r);let a=()=>{let E=o.placeholder??"Search";ce(s,"placeholder",E),s.setAttribute("aria-label",o.label??E),c.setAttribute("aria-label","Clear search"),s.value!==o.value&&(s.value=o.value),r.dataset.active=o.value.trim()===""?"false":"true"},l=()=>{o.value!==""&&o.onChange(""),s.focus()},u=()=>{o.onChange(s.value)},p=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),l())};return s.addEventListener("input",u),s.addEventListener("keydown",p),c.addEventListener("click",l),a(),o.autofocus&&s.focus(),{update:E=>{o={...o,...E},a()},dispose:()=>{s.removeEventListener("input",u),s.removeEventListener("keydown",p),c.removeEventListener("click",l),r.remove()}}};var fe=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},xe=(e,t,o)=>{let r=e.filter(u=>!u.disabled);if(r.length===0)return null;let s=r[0],c=r[r.length-1];if(o==="first"||!s||!c)return s?.id??null;if(o==="last")return c.id;let a=r.findIndex(u=>u.id===t);return a===-1?o==="next"?s.id:c.id:r[Math.min(r.length-1,Math.max(0,a+(o==="next"?1:-1)))]?.id??null};var qn=(e,t)=>`${e}-${t??""}`,It=(e,t,o,r)=>{let s=se("oc-sdk-option");s.id=qn(e,o.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!o.disabled,t==="option"&&s.setAttribute("aria-selected",o.selected?"true":"false"),s.dataset.destructive=o.destructive?"true":"false";let c=b("span","oc-sdk-option-label");if(c.textContent=o.label,s.append(c),o.hint){let a=b("span","oc-sdk-option-hint");a.textContent=o.hint,s.append(a)}if(t==="option"){s.dataset.mark="check";let a=b("span","oc-sdk-option-check");a.append(Oe("check",14)),s.append(a)}return s.addEventListener("pointerenter",r.hover),s.addEventListener("click",r.pick),s},wt=(e,t,o,r)=>{let s=qn(o,r);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===s?"true":"false");ce(t,"aria-activedescendant",r?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var Ri=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,s=window.innerHeight-o.bottom-8;r>s&&o.top-8>s&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let c=o.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(o.left-c))}px`)},Ct=(e,t,o,r)=>{e.append(o),Ri(o,t);let s=zn(e,r),c=()=>{r()},a=l=>{l.target instanceof Node&&o.contains(l.target)||r()};return window.addEventListener("resize",c),window.addEventListener("scroll",a,!0),()=>{s(),window.removeEventListener("resize",c),window.removeEventListener("scroll",a,!0),o.remove()}};var Qn=(e,t)=>{let o=t.trim().toLowerCase();return o?e.filter(r=>r.label.toLowerCase().includes(o)||r.id.toLowerCase().includes(o)):[...e]},Oi=0,$o=(e,t)=>{M(P);let o=t,r=`oc-sdk-select-${Oi+=1}`,s=b("div","oc-sdk oc-sdk-select"),c=b("span","oc-sdk-field-label");c.id=`${r}-label`;let a=se("oc-sdk-trigger");a.setAttribute("aria-haspopup","listbox"),a.setAttribute("aria-labelledby",c.id);let l=b("span","oc-sdk-trigger-value");a.append(l,Oe("chevron",14,"oc-sdk-trigger-chevron")),s.append(c,a),e.append(s);let u="",p=null,E=null,m=b("div","oc-sdk oc-sdk-popup"),S=b("div","oc-sdk-popup-search"),g=b("input","oc-sdk-input");g.type="text",g.autocomplete="off",S.append(g);let U=b("div");U.setAttribute("role","listbox"),U.tabIndex=-1,m.append(U);let F=()=>Qn(o.options,o.searchable?u:""),N=()=>o.searchable?g:U,O=_=>{p=_,wt(U,N(),r,_)},K=()=>{pe(U);let _=F();if(_.length===0){let T=b("div","oc-sdk-popup-empty");T.textContent="No matches",U.append(T)}for(let T of _)U.append(It(r,"option",{...T,selected:T.id===o.value},{hover:()=>O(T.id),pick:()=>Ae(T.id)}));O(_.some(T=>T.id===p)?p:_[0]?.id??null)},q=()=>{let _=E;E=null,_?.(),u="",g.value="",a.setAttribute("aria-expanded","false")},Ce=()=>{E||o.disabled||(p=o.value,g.placeholder=o.searchPlaceholder??"Search",o.searchable?m.prepend(S):S.remove(),K(),E=Ct(s,a,m,q),a.setAttribute("aria-expanded","true"),N().focus())},Ae=_=>{q(),a.focus(),_!==o.value&&o.onChange(_)},ke=()=>{E?q():Ce()},De=_=>{!E&&fe(_)&&(_.preventDefault(),Ce())},_e=_=>{let T=fe(_);T?(_.preventDefault(),O(xe(F(),p,T))):_.key==="Enter"?(_.preventDefault(),p&&Ae(p)):_.key==="Escape"?(_.preventDefault(),q(),a.focus()):o.searchable&&_.target!==g&&_.key.length===1&&!_.ctrlKey&&!_.metaKey&&g.focus()},me=()=>{u=g.value,K()},Se=_=>{E&&!(_.relatedTarget instanceof Node&&s.contains(_.relatedTarget))&&q()},oe=()=>{X(c,o.label),c.hidden=!o.label;let _=o.options.find(T=>T.id===o.value);X(l,_?.label??o.placeholder??"Select"),l.dataset.empty=_?"false":"true",a.disabled=!!o.disabled,E&&K()};return a.addEventListener("click",ke),a.addEventListener("keydown",De),m.addEventListener("keydown",_e),g.addEventListener("input",me),s.addEventListener("focusout",Se),oe(),{update:_=>{o={...o,..._},oe()},dispose:()=>{q(),a.removeEventListener("click",ke),a.removeEventListener("keydown",De),m.removeEventListener("keydown",_e),g.removeEventListener("input",me),s.removeEventListener("focusout",Se),s.remove()}}};var Vo=(e,t)=>{M(P);let o=t,r=b("div","oc-sdk oc-sdk-tabs");r.setAttribute("role","tablist"),e.append(r);let s=()=>{pe(r),r.dataset.track=o.trackBackground?"true":"false";for(let a of o.items){let l=se("oc-sdk-tab");l.setAttribute("role","tab");let u=a.id===o.activeId;l.setAttribute("aria-selected",u?"true":"false"),l.tabIndex=u?0:-1,l.dataset.id=a.id;let p=b("span");if(p.textContent=a.label,l.append(p),a.count!==void 0){let E=b("span","oc-sdk-tab-count");E.textContent=String(a.count),l.append(E)}l.addEventListener("click",()=>{a.id!==o.activeId&&o.onChange(a.id)}),r.append(l)}},c=a=>{let l=fe(a,"horizontal");if(!l)return;let u=xe(o.items,o.activeId,l);if(u&&u!==o.activeId){a.preventDefault(),o.onChange(u);let p=r.querySelector(`[data-id="${CSS.escape(u)}"]`);p instanceof HTMLElement&&p.focus()}};return r.addEventListener("keydown",c),s(),{update:a=>{o={...o,...a},s()},dispose:()=>{r.removeEventListener("keydown",c),r.remove()}}};var vt=(e,t)=>{ce(e,"data-tone",t&&t!=="neutral"?t:null)},Xo=(e,t)=>{M(P);let o=t,r=b("span","oc-sdk oc-sdk-badge");e.append(r);let s=()=>{X(r,o.label),vt(r,o.tone)};return s(),{update:c=>{o={...o,...c},s()},dispose:()=>{r.remove()}}};var xi=0,Fo=(e,t)=>{M(P);let o=t,r=`oc-sdk-list-${xi+=1}`,s=b("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let c=null,a=m=>`${r}-${m}`,l=m=>{c=m;for(let S of Array.from(s.children))S instanceof HTMLElement&&(S.dataset.active=S.id===a(m??"")?"true":"false");ce(s,"aria-activedescendant",m?a(m):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},u=(m,S)=>{let g=b("span",m);return g.textContent=S,g},p=()=>{if(pe(s),ce(s,"aria-label",o.ariaLabel),o.items.length===0){s.append(u("oc-sdk-list-empty",o.emptyText??"Nothing here")),l(null);return}for(let S of o.items){let g=se("oc-sdk-row");g.id=a(S.id),g.setAttribute("role","option"),g.setAttribute("aria-selected",S.id===o.selectedId?"true":"false"),g.disabled=!!S.disabled,g.tabIndex=-1,S.leading&&g.append(u("oc-sdk-row-lead",S.leading));let U=b("span","oc-sdk-row-main");if(U.append(u("oc-sdk-row-title",S.title)),S.subtitle&&U.append(u("oc-sdk-row-sub",S.subtitle)),g.append(U),S.badge){let F=u("oc-sdk-badge",S.badge.label);vt(F,S.badge.tone),g.append(F)}S.meta&&g.append(u("oc-sdk-row-meta",S.meta)),g.addEventListener("click",()=>o.onSelect(S.id)),s.append(g)}let m=o.items.some(S=>S.id===c&&!S.disabled);l(m?c:o.selectedId??null)},E=m=>{let S=fe(m);if(S){m.preventDefault(),l(xe(o.items,c,S));return}(m.key==="Enter"||m.key===" ")&&c&&(m.preventDefault(),o.onSelect(c))};return s.addEventListener("keydown",E),p(),{update:m=>{o={...o,...m},p()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var Bo=(e,t)=>{M(P);let o=t,r=b("div","oc-sdk oc-sdk-empty"),s=b("h2","oc-sdk-empty-title"),c=b("p","oc-sdk-empty-body"),a=b("div","oc-sdk-empty-action");r.append(s,c,a),e.append(r);let l=null,u=()=>{if(X(s,o.title),X(c,o.body),c.hidden=!o.body,a.hidden=!o.action,!o.action){l?.dispose(),l=null;return}let p={label:o.action.label,onClick:o.action.onClick};l?l.update(p):l=Re(a,{...p,variant:"outline",size:"sm"})};return u(),{update:p=>{o={...o,...p},u()},dispose:()=>{l?.dispose(),l=null,r.remove()}}};var Wo=(e,t={})=>{M(P);let o=t,r=b("span","oc-sdk oc-sdk-spinner");r.setAttribute("role","status");let s=b("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let c=b("span");r.append(s,c),e.append(r);let a=()=>{r.dataset.size=o.size??"default",X(c,o.label),c.hidden=!o.label,r.setAttribute("aria-label",o.label??"Loading")};return a(),{update:l=>{o={...o,...l},a()},dispose:()=>{r.remove()}}};var Ko=(e,t)=>{M(P);let o=t,r=b("div","oc-sdk oc-sdk-banner"),s=b("div","oc-sdk-banner-text"),c=b("div","oc-sdk-banner-title"),a=b("div","oc-sdk-banner-body"),l=b("div","oc-sdk-banner-action");s.append(c,a),r.append(s,l),e.append(r);let u=null,p=()=>{if(r.dataset.tone=o.tone,r.setAttribute("role",o.tone==="error"||o.tone==="warning"?"alert":"status"),X(c,o.title),X(a,o.body),a.hidden=!o.body,l.hidden=!o.action,!o.action){u?.dispose(),u=null;return}let E={label:o.action.label,onClick:o.action.onClick};u?u.update(E):u=Re(l,{...E,variant:"outline",size:"xs"})};return p(),{update:E=>{o={...o,...E},p()},dispose:()=>{u?.dispose(),u=null,r.remove()}}};var Yn=e=>e.filter(t=>!("separator"in t)),Ai=0,zo=(e,t)=>{M(P);let o=t,r=`oc-sdk-menu-${Ai+=1}`,s=b("div","oc-sdk oc-sdk-menu");e.append(s);let c=b("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let a=null,l=null,u=Re(s,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{a?S():g()}}),p=s.querySelector("button");p?.setAttribute("aria-haspopup","menu");let E=O=>{l=O,wt(c,c,r,O)},m=()=>{pe(c);for(let O of o.items){if("separator"in O){let K=b("div","oc-sdk-separator");K.dataset.labeled="false",c.append(K);continue}c.append(It(r,"menuitem",O,{hover:()=>E(O.id),pick:()=>U(O.id)}))}E(Yn(o.items).some(O=>O.id===l)?l:null)},S=()=>{let O=a;a=null,O?.(),l=null,p?.setAttribute("aria-expanded","false")},g=()=>{a||!p||(m(),a=Ct(s,p,c,S),p.setAttribute("aria-expanded","true"),c.focus())},U=O=>{S(),p?.focus(),o.onSelect(O)},F=O=>{let K=fe(O);K?(O.preventDefault(),E(xe(Yn(o.items),l,K))):O.key==="Enter"||O.key===" "?(O.preventDefault(),l&&U(l)):O.key==="Escape"&&(O.preventDefault(),S(),p?.focus())},N=O=>{a&&!(O.relatedTarget instanceof Node&&s.contains(O.relatedTarget))&&S()};return c.addEventListener("keydown",F),s.addEventListener("focusout",N),{update:O=>{o={...o,...O},u.update({label:o.label,variant:o.variant,size:o.size}),a&&m()},dispose:()=>{S(),c.removeEventListener("keydown",F),s.removeEventListener("focusout",N),u.dispose(),s.remove()}}};var ki=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,yi=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},Zn=e=>{let t=[],o=0;for(let r of e.matchAll(ki)){let s=r.index??0;s>o&&t.push({kind:"text",text:e.slice(o,s)});let c=r[1]??"",a=(r[2]??"").trim(),l=r[3]??"";yi(l)?c==="!"?t.push({kind:"image",src:l,alt:a}):t.push({kind:"link",href:l,label:a||l}):t.push({kind:"text",text:r[0]}),o=s+r[0].length}return o<e.length&&t.push({kind:"text",text:e.slice(o)}),t},Jo=(e,t)=>{M(P);let o=t,r=b("div","oc-sdk oc-sdk-text");e.append(r);let s=a=>{!(a.target instanceof HTMLAnchorElement)||!o.onOpenUrl||(a.preventDefault(),o.onOpenUrl(a.target.href))},c=()=>{pe(r);for(let a of Zn(o.text))if(a.kind==="text")r.append(document.createTextNode(a.text));else if(a.kind==="link"){let l=b("a");l.href=a.href,l.rel="noopener noreferrer",l.target="_blank",l.textContent=a.label,r.append(l)}else{let l=b("img");l.src=a.src,l.alt=a.alt,l.loading="lazy",l.referrerPolicy="no-referrer",r.append(l)}};return r.addEventListener("click",s),c(),{update:a=>{o={...o,...a},c()},dispose:()=>{r.removeEventListener("click",s),r.remove()}}};var es=[];function le(e){return es.push(e),e}function ts(){for(let e of es.splice(0))try{e.dispose()}catch{}}var J=(e,t)=>le(Re(e,t)),os=(e,t)=>le(Ho(e,t)),rs=(e,t)=>le(jo(e,t)),ns=(e,t)=>le($o(e,t)),ss=(e,t)=>le(Vo(e,t)),Ci=(e,t)=>le(Xo(e,t)),qo=(e,t)=>le(Fo(e,t)),We=(e,t)=>le(Bo(e,t)),vi=(e,t)=>le(Wo(e,t)),Qo=(e,t)=>le(Ko(e,t)),Nt=(e,t)=>le(zo(e,t)),Ni=(e,t)=>le(Jo(e,t));function Ut(e,t="notice"){let o=document.createElement("div");return o.className=t,Ni(o,{text:e,onOpenUrl:ze}),o}function Ke(e,t){let o=document.createElement("span"),r=ae(e,t);return Ci(o,{label:r.label,tone:r.tone}),o}function Me(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),vi(t,{label:e}),t}function is(e){wo(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function ze(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}Q.openUrl(e).catch(()=>{})}}function Yo(e,t,o){return{directory:e,link:t,repo:o,target:yr(o,t.orgName,t.projectName)}}async function Pt(e){try{let t=await e(".git/config"),o=Ir(t.content);return o?kr(o):null}catch{return null}}async function as(e){try{let t=await e(".git/HEAD");return wr(t.content)}catch{return null}}async function cs(e,t,o,r){let s=await Dn(t,o);if(s)return Yo(o,s,await Pt(r));let c=await Pt(r);if(!c)return null;for(let a of Ft(c))try{let l=await e.findProjectBySlug(a);if(!l||!l.id)continue;return await yo(t,o,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected"}),Yo(o,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected",directory:o},c)}catch{}return null}async function ls(e,t,o,r){let s=r?Ft(r)[0]??null:null;return await yo(e,t,{projectId:o.id,projectName:o.name,orgName:o.orgName,slug:s,source:"picked"}),Yo(t,{projectId:o.id,projectName:o.name,orgName:o.orgName,slug:s,source:"picked",directory:t},r)}var v=document.querySelector("#root");if(!v)throw new Error("CircleCI panel is missing its #root element.");var Y=Or(gn),Je=Q.storage,Ui=3e4,tr=null,n={ready:null,connected:!1,account:"CircleCI",booted:!1,workspace:null,override:null,directory:null,runs:[],runsNext:null,filter:"all",selectedRun:null,workflows:[],selectedWorkflow:null,jobs:[],selectedJob:null,jobDetail:null,jobOutput:null,pipelines:[],preferences:{autoRefresh:!0},loading:!0,error:null,toast:null,disconnectNotice:null,trigger:null,picker:!1,pickerLoading:!1,pickerError:null,pickerProjects:[],pickerFilter:""},ie=0;function Ee(){return n.override??n.workspace}async function _s(){I(),n.preferences=await Io(Je);let e=n.ready?.directory??null;if(n.directory=e,!n.connected){n.loading=!1,I();return}try{let t=await Y.currentUser();n.account=t.login}catch{}if(!e){n.loading=!1,I();return}try{let t=await cs(Y,Je,e,xt);if(n.workspace=t,!t){n.loading=!1,n.picker=!0,I(),or();return}await we()}catch(t){n.loading=!1,n.error=z(t),At(t)&&(n.connected=!1),I()}}async function we(e={}){let t=Ee();if(!t)return;let o=++ie;e.more||(n.loading=!0,n.error=null,I());try{let r=await Y.listRuns(t.link.projectId,e.more?n.runsNext??void 0:void 0);if(o!==ie)return;n.runs=e.more?[...n.runs,...r.items]:r.items,n.runsNext=r.next,n.loading=!1,Wi()}catch(r){if(o!==ie)return;n.loading=!1,n.error=z(r),At(r)&&(n.connected=!1)}I(),st()}async function Lt(){let e=n.selectedRun;if(!e)return;let t=++ie;n.loading=!0,n.error=null,I();try{let o=await Y.listWorkflows(e.id);if(t!==ie)return;n.workflows=o.items,n.loading=!1}catch(o){if(t!==ie)return;n.loading=!1,n.error=z(o)}I(),st()}async function qe(){let e=n.selectedWorkflow;if(!e)return;let t=++ie;n.loading=!0,n.error=null,I();try{let o=await Y.listJobs(e.id);if(t!==ie)return;n.jobs=o.items,n.loading=!1}catch(o){if(t!==ie)return;n.loading=!1,n.error=z(o)}I(),st()}async function ms(){let e=n.selectedJob;if(!e)return;let t=++ie;n.loading=!0,n.error=null,I();try{let o=await Y.getJob(e.id);if(t!==ie)return;n.jobDetail=o;let r=o.steps.find(s=>ue(s.outcome));if(n.jobOutput=null,r)try{let s=await Y.condensedOutput(e.id,r.num,0);t===ie&&s.trim()&&(n.jobOutput=s)}catch{}n.loading=!1}catch(o){if(t!==ie)return;n.loading=!1,n.error=z(o)}I(),st()}async function Dt(e=!1){return e||(n.toast=null),n.selectedJob?ms():n.selectedWorkflow?qe():n.selectedRun?Lt():we({more:!1})}async function Ss(e){n.toast=null,n.selectedRun=e,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),await Lt()}async function Zo(e){n.selectedWorkflow=e,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),await qe()}async function er(e){n.selectedJob=e,n.jobDetail=null,n.jobOutput=null,I(),await ms()}function Pi(){n.toast=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),we({more:!1})}function Mi(){n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),Lt()}function Li(){n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),qe()}function Le(e){let t=Ee(),o=n.selectedRun;return!t||!o?null:{workspace:t,run:o,workflow:e.workflow??n.selectedWorkflow,job:e.job??n.selectedJob,jobs:n.jobs,detail:e.detail??n.jobDetail,output:e.output??n.jobOutput}}async function Mt(e){if(e)try{await Rn(e),await ee("success","Attached to the chat box.")}catch(t){await ee("error",z(t))}}async function Ts(e){if(e)try{await On(e),await ee("success","Started a worktree chat for this build.")}catch(t){await ee("error",z(t))}}async function Di(e){if(e)try{await xn(e),await ee("success","Sent to the open chat.")}catch(t){await ee("error",z(t))}}async function hs(e,t){await vn(Y,e,t,ee)&&await qe()}async function Gi(e){let t=e?n.workflows.filter(r=>ue(r.outcome)):n.workflows;if(t.length===0){await ee("info","No failed workflow to rerun.");return}let o=0;for(let r of t)try{await Y.rerunWorkflow(r.id,e),o+=1}catch(s){await ee("error",z(s))}o>0&&await ee("success",`Started ${o} rerun${o===1?"":"s"}.`),await Lt()}async function gs(e){await Nn(Y,e,ee)&&await qe()}async function ds(e,t){await Un(Y,e,t,ee)&&await qe()}async function Hi(e){let t=await Hn(Je,e.link.projectId);n.pipelines=t??[];try{let o=await Y.listPipelines(e.link.projectId);return n.pipelines=o,await jn(Je,e.link.projectId,o),o}catch{return n.pipelines}}async function ji(){let e=Ee();if(!e)return;let t=n.directory?await as(xt):null;n.pipelines=[],n.trigger={loading:!0,pipelineId:"",branch:t??"",error:null,running:!1},I(),await Hi(e),n.trigger&&(n.trigger={...n.trigger,loading:!1,pipelineId:n.trigger.pipelineId||n.pipelines[0]?.id||""},I())}async function $i(){let e=Ee(),t=n.trigger;if(!e||!t)return;let r=n.pipelines.some(c=>c.id===t.pipelineId)?t.pipelineId:n.pipelines[0]?.id??"";if(!r){n.trigger={...t,error:"This project has no pipeline to run."},I();return}let s=t.branch.trim();if(!s){n.trigger={...t,error:"Name a branch or tag to build."},I();return}n.trigger={...t,running:!0,error:null},I();try{await Y.fireRun({projectId:e.link.projectId,pipelineId:r,branch:s}),n.trigger=null,await ee("success",`Started a run on ${s}.`),await we({more:!1})}catch(c){n.trigger={...t,running:!1,error:z(c)},I()}}async function Vi(e){switch(e){case"refresh":await Dt();return;case"trigger":await ji();return;case"choose":n.override=null,n.picker=!0,I(),await or();return;case"revert":n.override=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,n.pipelines=[],I(),await we({more:!1});return;case"pause":case"resume":n.preferences=await Gn(Je,{autoRefresh:e==="resume"}),I(),st();return;case"disconnect":await Yi();return;default:return}}async function or(){n.pickerLoading=!0,n.pickerError=null,I();try{let e=await Y.listOrgs(),t=await Promise.allSettled(e.map(r=>Y.listProjectsOfOrg(r.id))),o=[];for(let r of t)r.status==="fulfilled"&&o.push(...r.value.items);o.sort((r,s)=>{let c=r.orgName.localeCompare(s.orgName);return c!==0?c:r.name.localeCompare(s.name)}),n.pickerProjects=o}catch(e){n.pickerError=z(e),At(e)&&(n.connected=!1)}n.pickerLoading=!1,I()}async function Xi(e){let t=n.directory;if(t)try{let o=await Pt(xt),r=await ls(Je,t,e,o);n.workspace=r,n.override=null,n.picker=!1,n.pickerProjects=[],n.pickerFilter="",n.selectedRun=null,n.pipelines=[],I(),await we({more:!1})}catch(o){await ee("error",z(o))}}function Fi(){return n.selectedJob?nt([n.selectedJob]):n.selectedWorkflow?nt(n.jobs):n.selectedRun?nt(n.workflows):nt(n.runs)}var Bi=kn({delayMs:Ui,enabled:()=>n.preferences.autoRefresh,active:Fi,onTick:()=>void Dt(!0)});function st(){Bi.arm()}function Wi(){let e=n.runs.filter(t=>ue(t.outcome)).length;Q.setBadge(e>0?e:null).catch(()=>{})}function I(){if(ts(),tr=null,An(v),!n.connected){Ki();return}if(!n.directory){us();return}if(n.picker){Ji();return}if(!Ee()){us();return}if(n.trigger){zi();return}if(n.selectedJob){oa();return}if(n.selectedWorkflow){Os();return}if(n.selectedRun){Rs();return}rr()}function Ki(){let e=f("div");v?.append(e),We(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. Tokens stay in OpenChamber; this extension never sees one.",action:{label:"Open CircleCI tokens",onClick:()=>ze("https://app.circleci.com/settings/user/tokens")}})}function zi(){let e=n.trigger;if(!e)return rr();let t=f("div",{className:"detail-head"}),o=f("div",{className:"row"}),r=f("div");if(J(r,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:()=>{n.trigger=null,I()}}),o.append(r),o.append(f("span",{className:"spacer"})),t.append(o),t.append(f("div",{className:"detail-title"},"Run a pipeline")),t.append(f("div",{className:"detail-sub"},"Fire a new run on a branch or tag. The pipeline definition picks which config to build.")),v?.append(t),e.loading){v?.append(Me("Loading pipelines"));return}let s=f("div",{className:"section"});if(n.pipelines.length>1){let p=f("div"),E=null;E=ns(p,{label:"Pipeline",value:e.pipelineId,options:n.pipelines.map(m=>({id:m.id,label:m.name,hint:m.configPath})),onChange:m=>{n.trigger&&(n.trigger={...n.trigger,pipelineId:m},E?.update({value:m}))}}),s.append(p)}else n.pipelines.length===1?s.append(f("p",{className:"notice"},`Pipeline: ${n.pipelines[0]?.name??""}`)):s.append(f("p",{className:"notice error-text"},"This project lists no pipeline definition to run."));let c=f("div"),a=null;a=os(c,{label:"Branch or tag",value:e.branch,placeholder:"main",mono:!0,onChange:p=>{n.trigger&&(n.trigger={...n.trigger,branch:p,error:null},a?.update({value:p}))}}),s.append(c),e.error&&s.append(f("p",{className:"notice error-text"},e.error));let l=f("div",{className:"detail-actions"}),u=f("div");J(u,{label:"Start run",loading:e.running,disabled:e.running||n.pipelines.length===0,onClick:()=>void $i()}),l.append(u),s.append(l),v?.append(s)}function us(){let e=f("div");v?.append(e),We(e,{title:"No project open",body:"Open a project in OpenChamber. This extension maps that project to a CircleCI project the first time it runs."})}function Ji(){let e=f("div",{className:"detail-head"}),t=f("div",{className:"detail-title"},"Choose a CircleCI project");if(e.append(t),e.append(f("div",{className:"detail-sub"},"This extension remembers the choice per OpenChamber project.")),n.workspace){let l=f("div");J(l,{label:"Back",variant:"ghost",size:"sm",onClick:()=>{n.picker=!1,n.override=null,I(),we({more:!1})}}),e.append(l)}if(v?.append(e),n.pickerError){let l=f("div");v?.append(l),Qo(l,{tone:"error",title:"CircleCI",body:n.pickerError,action:{label:"Retry",onClick:()=>void or()}})}if(n.pickerLoading){v?.append(Me("Loading projects"));return}if(n.pickerProjects.length===0){if(n.pickerError)return;let l=f("div");v?.append(l),We(l,{title:"No projects",body:"This token is not a member of any CircleCI organization with projects, or the token cannot list them."});return}let o=f("div");v?.append(o);let r=f("div",{className:"scroll"});v?.append(r);let s=()=>qi(),c=qo(r,{items:s(),ariaLabel:"CircleCI projects",onSelect:l=>{let u=n.pickerProjects.find(p=>p.id===l);u&&Xi(u)}}),a=null;a=rs(o,{value:n.pickerFilter,label:"Filter projects",placeholder:"Filter by organization or repository",onChange:l=>{n.pickerFilter=l,a?.update({value:l}),c.update({items:s()})}})}function qi(){let e=n.pickerFilter.trim().toLowerCase();return n.pickerProjects.filter(t=>e?`${t.orgName}/${t.name}`.toLowerCase().includes(e):!0).map(t=>({id:t.id,leading:t.orgName?`${t.orgName}/`:"",title:t.name}))}function Qi(){let e=Ee(),t=f("div",{className:"row"}),o=f("div",{style:"flex:1; min-width:0;"}),r=e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",s=[{id:"refresh",label:"Refresh"},{id:"trigger",label:"Run a pipeline\u2026"},{id:"choose",label:"Change project\u2026"}];n.override&&s.push({id:"revert",label:"Back to this repository's project"}),s.push({separator:!0},n.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"},{separator:!0},{id:"disconnect",label:"Disconnect CircleCI",destructive:!0}),Nt(o,{label:r,size:"sm",variant:"ghost",items:s,onSelect:p=>void Vi(p)}),t.append(o),n.account&&t.append(f("span",{className:"account muted",text:n.account})),v?.append(t);let c=f("div",{className:"toolbar"}),a=f("div"),l=ss(a,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:n.filter,onChange:p=>{n.filter=yn(p),l.update({activeId:n.filter}),tr?.paint()}});c.append(a),c.append(f("span",{className:"spacer"}));let u=f("div");return J(u,{label:"Refresh",size:"sm",variant:"ghost",loading:n.loading,onClick:()=>void Dt()}),c.append(u),v?.append(c),{bar:c,tabs:l}}var ps="To remove the token, open Settings \u2192 Integrations and clear the CircleCI card.";async function Yi(){try{await Q.oauthDisconnect(),n.disconnectNotice=`Disconnect requested. ${ps}`}catch(e){n.disconnectNotice=`${z(e)} ${ps}`}I()}function Zi(){n.workspace=null,n.override=null,n.runs=[],n.runsNext=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,n.pipelines=[],n.trigger=null,n.picker=!1,n.pickerProjects=[],n.pickerFilter="",n.toast=null,n.error=null,n.disconnectNotice=null}function Gt(){if(n.disconnectNotice&&v?.append(f("p",{className:"notice"},n.disconnectNotice)),n.error){let e=f("div");v?.append(e),Qo(e,{tone:"error",title:"CircleCI",body:n.error,action:{label:"Retry",onClick:()=>void Dt()}})}n.toast&&v?.append(f("p",{className:"notice"},n.toast))}function ea(){return In(n.runs,n.filter)}function fs(){return ea().map(e=>{let t=ae(e.phase,e.outcome);return{id:e.id,leading:`#${e.number}`,title:Ne(e),...e.commitSubject?{subtitle:e.commitSubject}:{},meta:ut(e.createdAt),badge:{label:t.label,tone:t.tone}}})}function Es(){return n.runs.length===0?"No runs yet. Push a commit, or start one from the project menu.":"No run matches this filter."}function rr(){let{tabs:e}=Qi();if(Gt(),n.loading&&n.runs.length===0){v?.append(Me("Loading runs"));return}let t=f("div",{className:"scroll"});v?.append(t);let o=qo(t,{items:fs(),emptyText:Es(),ariaLabel:"CircleCI runs",onSelect:r=>{let s=n.runs.find(c=>c.id===r);s&&Ss(s)}});if(tr={tabs:e,list:o,paint:()=>o.update({items:fs(),emptyText:Es()})},n.runsNext){let r=f("div",{className:"load-more"});J(r,{label:"Load more runs",size:"sm",variant:"ghost",onClick:()=>void we({more:!0})}),v?.append(r)}}function ta(e){let t=Ee(),o=f("div",{className:"detail-head"}),r=f("div",{className:"row"}),s=f("div");J(s,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:Pi}),r.append(s),r.append(f("span",{className:"spacer"})),r.append(Ke(e.phase,e.outcome)),o.append(r),o.append(f("div",{className:"detail-title"},`#${e.number} ${Ne(e)}`));let c=[];e.revision&&c.push(He(e.revision)),e.commitSubject&&c.push(e.commitSubject),e.pipelineName&&c.push(e.pipelineName),c.push(ut(e.createdAt)),o.append(f("div",{className:"detail-sub"},c.filter(Boolean).join(" \xB7 "))),e.errors.length>0&&o.append(Ut(e.errors.map(E=>`${E.type}: ${E.message}`).join(" \xB7 "),"notice error-text"));let a=f("div",{className:"detail-actions"}),l=f("div");Nt(l,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every workflow"}],onSelect:E=>void Gi(E==="failed")}),a.append(l);let u=f("div");J(u,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>ze(t?tt(t.target,e.number):null)}),a.append(u);let p=f("div");return J(p,{label:"Attach",size:"sm",variant:"outline",onClick:()=>void Mt(Le({workflow:null,job:null}))}),a.append(p),o.append(a),o}function bs(e){let t=f("div",{className:"job-row"}),o=f("div",{className:"job-row-head"}),r=f("button",{className:"job-row-name",text:e.name,title:e.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});if(r.addEventListener("click",e.onOpen),o.append(r),e.meta&&o.append(f("span",{className:"job-row-meta",text:e.meta})),o.append(Ke(e.phase,e.outcome)),t.append(o),e.actions.length>0){let s=f("div",{className:"job-row-actions"});for(let c of e.actions){let a=f("div");J(a,{label:c.label,size:c.size??"xs",variant:c.variant??"ghost",onClick:c.onClick}),s.append(a)}t.append(s)}return t}function Rs(){let e=n.selectedRun;if(!e)return rr();if(v?.append(ta(e)),Gt(),n.loading&&n.workflows.length===0){v?.append(Me("Loading workflows"));return}if(n.workflows.length===0){let o=f("div");v?.append(o),We(o,{title:"No workflows",body:"This run produced no workflows. A configuration error is shown above when CircleCI reported one."});return}let t=f("div",{className:"scroll"});v?.append(t);for(let o of n.workflows){let r=ae(o.phase,o.outcome),s=[{label:"Jobs",onClick:()=>void Zo(o),variant:"outline"},{label:"Rerun failed",onClick:()=>void hs(o,!0)}];r.active&&s.push({label:"Cancel",onClick:()=>void gs(o),variant:"ghost"}),s.push({label:"Open",onClick:()=>{let c=Ee();c&&ze(ot(c.target,e.number,o.id))}}),t.append(bs({name:o.name,meta:Ge(o.createdAt,o.endedAt),phase:o.phase,outcome:o.outcome,onOpen:()=>void Zo(o),actions:s}))}}function Os(){let e=n.selectedWorkflow,t=n.selectedRun;if(!e||!t)return Rs();let o=f("div",{className:"detail-head"}),r=f("div",{className:"row"}),s=f("div");J(s,{label:"\u2190 Workflows",variant:"ghost",size:"sm",onClick:Mi}),r.append(s),r.append(f("span",{className:"spacer"})),r.append(Ke(e.phase,e.outcome)),o.append(r),o.append(f("div",{className:"detail-title"},e.name)),o.append(f("div",{className:"detail-sub"},`Run #${t.number} \xB7 ${Ge(e.createdAt,e.endedAt)||"no duration"}`));let c=f("div",{className:"detail-actions"}),a=f("div");if(Nt(a,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:p=>void hs(e,p==="failed")}),c.append(a),ae(e.phase,e.outcome).active){let p=f("div");J(p,{label:"Cancel",size:"sm",variant:"ghost",onClick:()=>void gs(e)}),c.append(p)}let l=f("div");if(J(l,{label:"Attach workflow",size:"sm",variant:"outline",onClick:()=>void Mt(Le({workflow:e,job:null}))}),c.append(l),o.append(c),v?.append(o),Gt(),n.loading&&n.jobs.length===0){v?.append(Me("Loading jobs"));return}if(n.jobs.length===0){let p=f("div");v?.append(p),We(p,{title:"No jobs",body:"This workflow lists no jobs yet."});return}let u=f("div",{className:"scroll"});v?.append(u);for(let p of n.jobs){let E=p.type.toLowerCase()==="approval",m=ae(p.phase,p.outcome),S=[];E&&m.active&&(S.push({label:"Approve",onClick:()=>void ds(p,!0),variant:"default"}),S.push({label:"Reject",onClick:()=>void ds(p,!1),variant:"ghost"})),S.push({label:"Details",onClick:()=>void er(p),variant:"outline"}),ue(p.outcome)&&(S.push({label:"Attach failure",onClick:()=>void Mt(Le({workflow:e,job:p,detail:null,output:null}))}),S.push({label:"Fix with agent",onClick:()=>void Ts(Le({workflow:e,job:p,detail:null,output:null}))})),u.append(bs({name:p.name,meta:[p.number>0?`#${p.number}`:"",Ge(p.startedAt,p.endedAt)].filter(Boolean).join(" \xB7 "),phase:p.phase,outcome:p.outcome,onOpen:()=>void er(p),actions:S}))}}function oa(){let e=n.selectedJob,t=n.selectedWorkflow,o=n.selectedRun;if(!e)return Os();let r=f("div",{className:"detail-head"}),s=f("div",{className:"row"}),c=f("div");J(c,{label:"\u2190 Jobs",variant:"ghost",size:"sm",onClick:Li}),s.append(c),s.append(f("span",{className:"spacer"})),s.append(Ke(e.phase,e.outcome)),r.append(s),r.append(f("div",{className:"detail-title"},e.name)),r.append(f("div",{className:"detail-sub"},[`#${e.number}`,e.type,Ge(e.startedAt,e.endedAt)].filter(Boolean).join(" \xB7 ")));let a=f("div",{className:"detail-actions"}),l=f("div");J(l,{label:"Attach to chat",size:"sm",variant:"outline",onClick:()=>void Mt(Le({workflow:t,job:e}))}),a.append(l);let u=f("div");J(u,{label:"Start a chat",size:"sm",onClick:()=>void Ts(Le({workflow:t,job:e}))}),a.append(u);let p=f("div");J(p,{label:"Send to current chat",size:"sm",variant:"ghost",onClick:()=>void Di(Le({workflow:t,job:e}))}),a.append(p);let E=Ee(),m=f("div");J(m,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>{E&&t&&ze(pt(E.target,o?.number??0,t.id,e.number))}}),a.append(m),r.append(a),v?.append(r),Gt();let S=f("div",{className:"scroll"});if(v?.append(S),n.loading&&!n.jobDetail){S.append(Me("Loading job"));return}let g=n.jobDetail;if(!g)return;let U=f("div",{className:"meta-grid"}),F=[Fe("Job",`#${g.number}`),Fe("Type",g.type),Fe("Started",g.startedAt?ut(g.startedAt):null),Fe("Duration",Ge(g.startedAt,g.endedAt)||null),Fe("Executions",g.steps.length>0?`${g.parallelExecutions} parallel`:null)];for(let N of F)N&&U.append(N);if(U.childElementCount>0&&S.append(U),g.errors.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Errors"));for(let O of g.errors)N.append(Ut(`${O.type}: ${O.message}`,"notice error-text"));S.append(N)}if(g.warnings.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Warnings"));for(let O of g.warnings)N.append(Ut(`${O.type}: ${O.message}`,"notice"));S.append(N)}if(g.steps.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Steps"));for(let O of g.steps){let K=f("div",{className:"job-row"}),q=f("div",{className:"job-row-head"});q.append(f("span",{className:"job-row-name"},`${O.num}. ${O.name}`)),O.exitCode!==null&&O.exitCode!==0&&q.append(f("span",{className:"job-row-meta"},`exit ${O.exitCode}`)),q.append(Ke(O.phase,O.outcome)),K.append(q),O.command&&K.append(f("pre",{className:"output",style:"max-height:120px;"},O.command)),N.append(K)}S.append(N)}if(n.jobOutput){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Condensed output")),N.append(f("pre",{className:"output"},n.jobOutput)),S.append(N)}else ue(g.outcome)&&S.append(f("p",{className:"notice"},"CircleCI returned no condensed output for this job. The steps above and the errors are still attached with the chip."))}function ra(e){n.ready=e,n.booted=!0,n.connected=e.connection.connected,n.account=e.connection.account||"CircleCI",_s()}Q.onReady(e=>{is(e),Cn(),n.ready=e,n.booted||ra(e)});Q.onConnection(e=>{let t=n.connected;if(n.connected=e.connected,e.account&&(n.account=e.account),e.connected&&!t){_s();return}!e.connected&&t&&(Zi(),I())});Q.onItem(e=>{if(!e||!("providerId"in e))return;let t=Ur(e.data);t&&na(t)});async function na(e){let t=Ee();t&&t.link.projectId!==e.projectId&&(n.pipelines=[],n.override={directory:n.directory??"",repo:null,target:{segment:"github",owner:e.orgName||"project",repo:e.projectName},link:{projectId:e.projectId,projectName:e.projectName,orgName:e.orgName,slug:null,source:"picked",directory:n.directory??""}},I());try{let o=await Y.getRun(e.runId);await Ss(o);let r=e.workflowId?n.workflows.find(s=>s.id===e.workflowId):void 0;if(r){await Zo(r);let s=e.jobId?n.jobs.find(c=>c.id===e.jobId):void 0;s&&await er(s)}}catch(o){n.error=z(o),I()}}})();
