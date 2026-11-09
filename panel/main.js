"use strict";(()=>{var ye=class extends Error{status;code;constructor(o,t,r){super(r),this.name="CircleCIError",this.status=o,this.code=t}},Rs="/api/v3",ut=20,Xt=20,Sr=50,Os=50,Ze=4,ta=Ze*ut,Tr=[1e3,2500],k=e=>typeof e=="object"&&e!==null?e:{},ve=e=>Array.isArray(e)?e:[],h=e=>typeof e=="string"&&e.length>0?e:null,et=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Rr(e){return ve(e).map(o=>{let t=k(o);return{type:h(t.type)??"unknown",message:h(t.message)??""}})}function Or(e){return ve(e).map(o=>{let t=k(o);return{type:h(t.type)??"unknown",message:h(t.message)??"",description:h(t.description),url:h(t.url)}})}function dt(e){let o=k(e),t=k(o.attributes),r=k(o.references),s=k(r.event),c=k(s.attributes),a=k(c.vcs),l=k(a.commit),u=k(r.pipeline),p=k(r.trigger),E=k(p.attributes);return{id:h(o.id)??"",number:et(t.number)??0,phase:h(t.phase)??"unknown",outcome:h(t.current_outcome),createdAt:h(t.created_at)??"",branch:h(a.branch),tag:h(a.tag),revision:h(a.revision),commitSubject:h(l.subject),commitUrl:h(l.url),pipelineName:h(k(u.attributes).name),trigger:h(E.name)??h(k(E.event_source).type)??h(c.type),errors:Rr(t.errors),warnings:Or(t.warnings)}}function xs(e){let o=k(e),t=k(o.attributes),r=k(t.auto_rerun);return{id:h(o.id)??"",name:h(t.name)??"Workflow",phase:h(t.phase)??"unknown",outcome:h(t.current_outcome)??h(t.outcome),createdAt:h(t.created_at),endedAt:h(t.ended_at),tag:h(t.tag),autoRerunNumber:et(r.number)}}function Ft(e){let o=k(e),t=k(o.attributes);return{id:h(o.id)??"",name:h(t.name)??"Job",number:et(t.number)??0,type:h(t.type)??"build",phase:h(t.phase)??"unknown",outcome:h(t.outcome),startedAt:h(t.started_at),endedAt:h(t.ended_at)}}function As(e){let o=k(e);return{num:et(o.num)??0,name:h(o.name)??"Step",type:h(o.type)??"run",phase:h(o.phase)??"unknown",outcome:h(o.outcome),exitCode:et(o.exit_code),command:h(o.command),startedAt:h(o.started_at),endedAt:h(o.ended_at)}}function ks(e){let o=Ft(e),t=k(k(e).attributes),r=ve(t.parallel_executions).map(k),s=r.length>0?ve(r[0]?.steps).map(As):[];return{...o,errors:Rr(t.errors),warnings:Or(t.warnings),steps:s,parallelExecutions:r.length}}function hr(e){let o=k(e),t=k(o.attributes),r=k(k(o.references).org);return{id:h(o.id)??"",name:h(t.name)??"Project",orgId:h(r.id)??"",orgName:h(k(r.attributes).name)??""}}function ys(e){let o=k(e),t=k(o.attributes);return{id:h(o.id)??"",name:h(t.name)??"Organization",vcsProvider:h(k(t.vcs).provider)}}function gr(e){let o=k(e),t=k(o.attributes),r=k(t.config);return{id:h(o.id)??"",name:h(t.name)??"Pipeline",configPath:h(r.file_path)??""}}function Is(e){let o=k(e),t=k(o.attributes);return{id:h(o.id)??"",login:h(t.login)??"CircleCI account",name:h(t.name),avatarUrl:h(t.avatar_url)}}function ws(e){if(!e)return;let o={};for(let[t,r]of Object.entries(e))r==null||r===""||(o[t]=String(r));return Object.keys(o).length>0?o:void 0}function br(e){if(e)try{return JSON.parse(e)}catch{return}}function Cs(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function vs(e,o,t){let r=k(k(o).error),s=h(r.detail)??h(r.title)??h(r.type)??Cs(e);return new ye(e,h(r.type)??`HTTP_${e}`,s)}function Ns(e,o){return o!=="GET"?!1:e===429||e===502||e===503||e===504}function Us(e){return new Promise(o=>setTimeout(o,e))}function xr(e){async function o(a,l){let u=ws(a.query),p=0;for(;;){let E=await e({method:a.method,path:Rs+a.path,...u?{query:u}:{},...a.body===void 0?{}:{body:JSON.stringify(a.body)}});if(E.status>=400){if(Ns(E.status,a.method)&&p<Tr.length){await Us(Tr[p]??2500),p+=1;continue}throw vs(E.status,br(E.body),E.body)}return l(E.body)}}let t=a=>o(a,br),r=a=>o(a,l=>l);async function s(a,l,u,p,E){let m=E?{...l,"page[cursor]":E}:{...l,"page[limit]":u},S;try{S=await t({method:"GET",path:a,query:m})}catch(g){if(!E&&g instanceof ye&&g.status===400)S=await t({method:"GET",path:a,query:{...l}});else throw g}return{items:ve(k(S).data).map(p),next:h(k(k(S).page).next)}}async function c(a,l,u,p,E){let m=[],S,g=null;for(let U=0;U<E;U+=1){let F=await s(a,l,u,p,S);if(m.push(...F.items),g=F.next,!g)break;S=g}return{items:m,next:g}}return{currentUser:async()=>{let a=await t({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),l=ve(k(a).data)[0];if(!l)throw new ye(200,"EMPTY_USER","CircleCI returned no user.");return Is(l)},listOrgs:async()=>(await c("/orgs",{},Sr,ys,Ze)).items,findProjectBySlug:async a=>{let l=await t({method:"GET",path:"/projects",query:{"filter[slug]":a}}),u=ve(k(l).data)[0];return u?hr(u):null},listProjectsOfOrg:a=>c("/projects",{"filter[org_id]":a},Sr,hr,Ze),listPipelines:async a=>{let l=await c("/pipelines",{"filter[project_id]":a},Os,gr,1),u=[];for(let p of l.items)if(p.id)try{let E=await t({method:"GET",path:`/pipelines/${encodeURIComponent(p.id)}`,query:{"filter[project_id]":a}});u.push(gr(k(E).data))}catch{u.push({...p,name:"Pipeline config"})}return u},listRuns:(a,l)=>s("/runs",{"filter[project_id]":a},ut,dt,l),listMyRuns:a=>s("/runs",{"filter[user_id]":"me"},ut,dt,a),getRun:async a=>{let l=await t({method:"GET",path:`/runs/${encodeURIComponent(a)}`});return dt(k(l).data)},findRunByNumber:async(a,l)=>{let u;for(let p=0;p<Ze;p+=1){let E=await s("/runs",{"filter[project_id]":a},ut,dt,u),m=E.items.find(S=>S.number===l);if(m)return m;if(!E.next)return null;u=E.next}return null},fireRun:async a=>{let l=await t({method:"POST",path:"/runs",query:{"filter[project_id]":a.projectId},body:{data:{attributes:{checkout:{branch:a.branch}},references:{pipeline:{id:a.pipelineId}}}}}),u=h(k(k(l).data).id);if(!u)throw new ye(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return u},listWorkflows:(a,l)=>s("/workflows",{"filter[run_id]":a},Xt,xs,l),listJobs:(a,l)=>l?s("/jobs",{"filter[workflow_id]":a},Xt,Ft,l):c("/jobs",{"filter[workflow_id]":a},Xt,Ft,Ze),getJob:async a=>{let l=await t({method:"GET",path:`/jobs/${encodeURIComponent(a)}`});return ks(k(l).data)},condensedOutput:async(a,l,u=0)=>r({method:"GET",path:`/jobs/${encodeURIComponent(a)}/stdout/condensed`,query:{"filter[execution]":u,"filter[step_num]":l}}).then(p=>typeof p=="string"?p:""),rerunWorkflow:async(a,l)=>{let u=await t({method:"POST",path:`/workflows/${encodeURIComponent(a)}/rerun`,body:l?{is_from_failed:!0}:void 0});return h(k(k(u).data).id)??""},cancelWorkflow:async a=>{await t({method:"POST",path:`/workflows/${encodeURIComponent(a)}/cancel`})},approve:async a=>{await t({method:"POST",path:`/approvals/${encodeURIComponent(a)}/approve`})},reject:async a=>{await t({method:"POST",path:`/approvals/${encodeURIComponent(a)}/reject`})}}}var Ar=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),Ps={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function kr(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Ms(e){if(!e)return"Unknown";let o=e.replace(/_/g," ").trim();return o.charAt(0).toUpperCase()+o.slice(1)}function ae(e,o){let t=(o??"").toLowerCase(),r=(e??"").toLowerCase(),s=t||r,c=kr(t)??kr(r)??"neutral",a=t?!Ar.has(t):!Ar.has(r)&&r!=="ended";return{label:Ps[s]??Ms(s),tone:c,active:a}}function ue(e){let o=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(o)}function Ge(e,o,t=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let s=o?Date.parse(o):t;if(!Number.isFinite(s)||s<r)return"";let c=Math.round((s-r)/1e3);if(c<60)return`${c}s`;let a=Math.floor(c/60),l=c%60;if(a<60)return l>0?`${a}m ${l}s`:`${a}m`;let u=Math.floor(a/60),p=a%60;return p>0?`${u}h ${p}m`:`${u}h`}function pt(e,o=Date.now()){if(!e)return"";let t=Date.parse(e);if(!Number.isFinite(t))return"";let r=Math.round((o-t)/1e3);if(r<45)return"just now";let s=Math.round(r/60);if(s<60)return`${s}m ago`;let c=Math.round(s/60);if(c<24)return`${c}h ago`;let a=Math.round(c/24);return a<7?`${a}d ago`:new Date(t).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function He(e){return e?e.slice(0,8):""}function Ne(e){return e.branch??e.tag??"detached"}var Ls={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function yr(e){let o=e.trim();if(!o)return null;let t=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(o);t&&!o.includes("://")&&(o=`https://${t[1]}/${t[2]}/${t[3]}`);let r;try{r=new URL(o)}catch{return null}let s=r.hostname.toLowerCase();if(!s)return null;let c=r.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(c.length<2)return null;let a=c[c.length-2]??"",l=c[c.length-1]??"";return!a||!l?null:{host:s,owner:a,repo:l}}function Bt(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function Ir(e,o,t){return{segment:e&&Ls[e.host]||"github",owner:e?.owner??o,repo:e?.repo??t}}function Ds(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function tt(e,o){return`${Ds(e)}/${o}`}function ot(e,o,t){return`${tt(e,o)}/workflows/${t}`}function ft(e,o,t,r){return`${ot(e,o,t)}/jobs/${r}`}function wr(e){let o=null,t=null,r="";for(let s of e.split(/\r?\n/)){let c=s.trim();if(!c||c.startsWith("#")||c.startsWith(";"))continue;let a=/^\[([^\]]+)\]$/.exec(c);if(a){r=(a[1]??"").trim().toLowerCase();continue}let l=/^url\s*=\s*(.*)$/i.exec(c);if(!l)continue;let u=(l[1]??"").trim();u&&(t===null&&(t=u),(/remote\s+"origin"/i.test(r)||/remote\s+'origin'/i.test(r))&&(o=u))}return o??t}function Cr(e){let o=/^ref:\s*refs\/heads\/(.+)$/m.exec(e.trim());return o&&(o[1]??"").trim()||null}var vr="circleci",Nr=16e3,Gs=200,Wt=2e3;function Kt(e,o){return e.length<=o?e:`${e.slice(0,o-20)}
\u2026 (truncated)`}function je(e){return ae(e.phase,e.outcome).label.toLowerCase()}function Ur(e){let{workspace:o,run:t,workflow:r,job:s}=e;return{projectId:o.link.projectId,projectName:o.link.projectName,orgName:o.link.orgName,runId:t.id,runNumber:t.number,branch:t.branch,workflowId:r?.id??null,workflowName:r?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function he(e){return typeof e=="string"&&e.length>0?e:null}function Pr(e){if(typeof e!="object"||e===null||Array.isArray(e))return null;let o=e,t=he(o.projectId),r=he(o.projectName),s=he(o.orgName),c=he(o.runId),a=typeof o.runNumber=="number"&&Number.isFinite(o.runNumber)?o.runNumber:null;return!t||!r||!s||!c||a===null?null:{projectId:t,projectName:r,orgName:s,runId:c,runNumber:a,branch:he(o.branch),workflowId:he(o.workflowId),workflowName:he(o.workflowName),jobId:he(o.jobId),jobName:he(o.jobName)}}function Mr(e){let o=e.workflow?.id??"run",t=e.job?.id??"";return`${e.run.id}:${o}:${t}`}function Lr(e){let{run:o,workflow:t,job:r}=e,s=r?.name??t?.name??`run #${o.number}`,c=je(r?{phase:r.phase,outcome:r.outcome}:t||{phase:o.phase,outcome:o.outcome});return Kt(`${s} ${c} in CircleCI run #${o.number}`,Gs)}function zt(e){let{workspace:o,run:t,workflow:r,job:s}=e;return r&&s&&s.number>0?ft(o.target,t.number,r.id,s.number).slice(0,Wt):r?ot(o.target,t.number,r.id).slice(0,Wt):tt(o.target,t.number).slice(0,Wt)}function Jt(e){let{workspace:o,run:t,workflow:r,job:s,jobs:c,detail:a,output:l}=e,u=[];u.push(`CircleCI run #${t.number} on ${o.link.orgName}/${o.link.projectName}`),u.push(`Status: ${je({phase:t.phase,outcome:t.outcome})}`),t.pipelineName&&u.push(`Pipeline: ${t.pipelineName}`),u.push(`Ref: ${Ne(t)}${t.revision?` at ${He(t.revision)}`:""}`),t.commitSubject&&u.push(`Commit: ${t.commitSubject}`),u.push(`URL: ${zt(e)}`);let p=c.filter(E=>ue(E.outcome));if(r){if(u.push(""),u.push(`Workflow ${r.name} (${je(r)})`),p.length>0){u.push("Failing jobs:");for(let m of p)u.push(`- ${m.name} (#${m.number})`)}let E=c.filter(m=>!p.includes(m));if(E.length>0){u.push("Other jobs:");for(let m of E)u.push(`- ${m.name}: ${je({phase:m.phase,outcome:m.outcome})}`)}}if(s&&a){if(u.push(""),u.push(`Job ${a.name} (#${a.number})`),a.errors.length>0){u.push("Errors:");for(let m of a.errors)u.push(`- ${m.type}: ${m.message}`)}let E=a.steps.filter(m=>m.outcome==="failed");if(E.length>0){u.push("Failed steps:");for(let m of E)u.push(`- step ${m.num} "${m.name}"${m.exitCode!==null?` (exit ${m.exitCode})`:""}`),m.command&&u.push(`  command: ${m.command}`)}}return l&&l.trim()&&(u.push(""),u.push("Condensed output:"),u.push(l.trim())),Kt(u.join(`
`),Nr)}function Dr(e){return Kt(`Investigate and fix this CircleCI failure.

${Jt(e)}`,Nr)}var w="openchamber.sdk";var Et="data-oc-scrolling",qt=`
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
:hover, [${Et}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Et}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Et}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Et}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function Qt(e){let o=e.documentElement;if(o.hasAttribute("data-oc-scrollbar-activity"))return;o.setAttribute("data-oc-scrollbar-activity","");let t=new WeakMap;e.addEventListener("scroll",r=>{let s=r.target===e?o:r.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let c=t.get(s);c!==void 0&&clearTimeout(c),t.set(s,setTimeout(()=>{t.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Hs=`(${Qt.toString()})(document);`;var $r=/^[a-z][a-z0-9-]{0,39}$/;var Gr=e=>Object(e)===e&&!Array.isArray(e),Yt=(e,o)=>Object.keys(e).every(t=>o.includes(t)),Hr=e=>String(e)===e&&e.length>=1&&e.length<=60,jr=e=>String(e)===e&&e.length>=1&&e.length<=80,Vr=e=>{if(!Array.isArray(e)||e.length>4)return!1;let o=new Set;for(let t of e){if(!Gr(t)||!$r.test(t.id)||!Hr(t.label)||t.disabled!==void 0&&t.disabled!==!0&&t.disabled!==!1||o.has(t.id))return!1;if(o.add(t.id),t.kind==="button"){if(!Yt(t,["kind","id","label","disabled"]))return!1;continue}if(t.kind!=="select"||!Yt(t,["kind","id","label","value","options","disabled"])||!jr(t.value)||!Array.isArray(t.options)||t.options.length<1||t.options.length>16)return!1;let r=new Set;for(let s of t.options){if(!Gr(s)||!Yt(s,["value","label"])||!jr(s.value)||!Hr(s.label)||r.has(s.value))return!1;r.add(s.value)}if(!r.has(t.value))return!1}return!0};var Xr=["{id}","{segment}","{segments+}"];var Sa=new Set(Xr);var Fr=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var ha=new Set(Fr);var Zt=e=>"bytes"in e?e.bytes.byteLength:e.content.length,Br=(e,o)=>{if(e.path!==o.path||e.readOnly!==o.readOnly)return!1;if(e.encoding==="text"||o.encoding==="text")return e.encoding==="text"&&o.encoding==="text"&&e.content===o.content;if(e.bytes.byteLength!==o.bytes.byteLength)return!1;for(let t=0;t<e.bytes.byteLength;t+=1)if(e.bytes[t]!==o.bytes[t])return!1;return!0};var Wr=/^[A-Za-z0-9_-]{1,80}$/;var Kr=["left","right","top","bottom"];var zr=(e,o=0,t={remaining:16e3})=>{if(--t.remaining<0||o>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of r)if(!zr(s,o+1,t))return!1;return!0},eo=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(o=>/^(0|[1-9]\d*)$/.test(o)&&Number(o)<e.length)&&e.every(eo);if(Object(e)===e){let o=Object.getPrototypeOf(e);return(o===null||o===Object.prototype)&&Object.values(e).every(eo)}return String(e)===e||Number.isFinite(e)},to=e=>{try{return String(e.id)!==e.id||!Wr.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!Kr.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!zr(e.data)||!eo(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var ro=2e3;var qr=["file","directory","other","missing"],no=e=>!!(e&&"sessionId"in e),so=e=>!!(e&&"sent"in e&&!("sessionId"in e));var Qr=/^[0-9a-f]{7,64}$/i,io=e=>Qr.test(e),_t=500,mt=32e3,Yr=16e3,Zr=128,en=200,tn=2e3,on=16e3,rn=80,nn=200,sn=16e3;var an=2e3;var ao=2e4,St=1024,Tt=2e6;var ht=64e3,gt=8e3,co=4e3;var lo=96e4,$s=60*6e4;var cn=999,ln=1e4,rt=500,dn=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],un=["stopped","starting","ready","failed"],Vs=new Set(dn),pn=e=>Vs.has(e),fn=e=>e&&pn(e)?e:"HOST_REJECTED",$e=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every($e):Object(e)===e?Object.values(e).every($e):!1,En=e=>$e(e)&&JSON.stringify(e).length<=sn,Jr=e=>e?.trim().slice(0,nn)??"",Ve=e=>{let o=e.id.trim().slice(0,Zr),t=e.title.trim().slice(0,en),r=e.url.trim().slice(0,tn),s=e.text?.trim().slice(0,on),c=e.author?.trim().slice(0,rn),a=e.kind==="pull"?"pull":"issue",l={providerId:e.providerId.trim(),id:o,title:t||o,url:r,kind:a};if(s&&(l.text=s),c&&(l.author=c),a==="pull"){let u=Jr(e.branches?.head),p=Jr(e.branches?.base);u&&p&&(l.branches={head:u,base:p})}return En(e.data)&&(l.data=e.data),l},uo=e=>{let o=Ve(e);return e.projectId&&(o.projectId=e.projectId),e.navigation&&(o.navigation=e.navigation),e.worktree&&(o.worktree=e.worktree),o},po=e=>{let o={text:e.text.trim().slice(0,Yr)};return e.send&&(o.send=!0),o},fo=e=>e===null||!Number.isFinite(e)?null:Math.min(cn,Math.max(0,Math.round(e))),Eo=e=>Number.isFinite(e)?Math.min(ln,Math.max(0,Math.ceil(e))):0;var Xe=e=>e.length>0&&e.length<=St&&!e.includes("\0")&&!e.includes("\\");var bt=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>an?!1:!e.split("/").some(t=>t==="."||t===".."),Xs=new Set(un),_o=e=>!!(e&&"status"in e&&Xs.has(String(e.status))&&!("body"in e)),Rt=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),mo=e=>!!(e&&"content"in e&&String(e.content)===e.content),So=e=>!!(e&&"written"in e&&e.written===!0),To=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Fs=new Set(qr),ho=e=>!!(e&&"kind"in e&&"size"in e&&Fs.has(String(e.kind))&&Number.isFinite(e.size)),go=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Bs=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Ws=e=>Object(e)===e?e:null,oo=e=>String(e)===e&&e.length>0,Ks=e=>{if(!oo(e.id))return null;if(e.ok===!0){let o={channel:w,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(o.payload=e.payload),o}return e.ok===!1&&oo(e.error)?{channel:w,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:fn(oo(e.code)?e.code:void 0)}:null},bo=e=>{let o=Ws(e);return!o||o.channel!==w||o.v!==1?null:o.type==="result"?Ks(o):!Bs.has(String(o.type))||Object(o.payload)!==o.payload?null:o};var _n=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,zs=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",x=class extends Error{code;constructor(o,t){super(t),this.name="HostRequestError",this.code=o}},mn=()=>Promise.reject(new x("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),Ot=()=>Promise.reject(new x("BAD_PATH",`File path must be 1 to ${St} characters without NUL or backslash.`)),xt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new x("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},y=e=>(e.value+=1,`oc-${e.value}`),ko=(e={})=>{let o=e.target??("window"in globalThis?window:null);if(!o)throw new x("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let t=e.acceptSource??(i=>i===o.parent),r=e.requestTimeoutMs??ao,s=new Set,c=new Set,a=new Set,l=new Set,u=new Set,p=new Set,E=new Set,m=new Set,S=new Set,g=new Set,U=new Set,F=new Set,N=[],O=null,K=null,Y=new Set,Ce=new Set,Ae=null,ke=null,De=!1,_e=new Map,me=new Map,Se=new Map,oe=!1,_={value:0},T=null,Te=null,Qe=!1,Ye=!1,sr=null,ir=i=>i?{sessionId:i.id,phase:i.busy?"started":"completed"}:null,re=i=>{o.parent.postMessage(i,"*")},ar=()=>{oe||o.parent===o||F.size===0||T?.features?.lateGenerateResults!==!0||re({channel:w,v:1,type:"generate-late-listen"})},H=(i,d)=>{for(let R of i)try{R(d)}catch(A){console.error(A)}},cr=i=>{if(!(i instanceof MessageEvent)||!t(i.source))return;let d=bo(i.data);if(!d)return;if(d.type==="workspace"){let A=me.get(d.payload.subscriptionId);A&&H([A],d.payload.snapshot);return}if(d.type==="shells"){let A=Se.get(d.payload.subscriptionId);A&&H([A],d.payload.snapshot);return}if(d.type==="ready"){T=d.payload,Te=ir(d.payload.session),H(s,d.payload),H(c,d.payload.directory),H(a,d.payload.session),Te&&H(l,Te),H(u,d.payload.connection),H(p,d.payload.settings),H(E,d.payload.item),d.payload.block&&H(m,d.payload.block),ar();return}if(d.type==="service-event"){H(S,d.payload);return}if(d.type==="generate-late"){F.size===0?N.push(d.payload):H(F,d.payload);return}if(d.type==="directory"){T&&(T={...T,directory:d.payload.directory}),H(c,d.payload.directory);return}if(d.type==="session"){T&&(T={...T,session:d.payload.session}),d.payload.session?Te?.sessionId!==d.payload.session.id&&(Te=ir(d.payload.session)):Te=null,H(a,d.payload.session);return}if(d.type==="session-lifecycle"){Te=d.payload,H(l,d.payload);return}if(d.type==="connection"){T&&(T={...T,connection:d.payload.connection}),H(u,d.payload.connection);return}if(d.type==="settings"){T&&(T={...T,settings:d.payload.settings}),H(p,d.payload.settings);return}if(d.type==="item"){T&&(T={...T,item:d.payload.item}),H(E,d.payload.item);return}if(d.type==="status-control-event"){H(g,d.payload);return}if(d.type==="popover-closed"){H(U,d.payload);return}if(d.type==="action"){let A=L=>{oe||re({channel:w,v:1,type:"action-result",id:d.id,payload:L})},D=K;if(!D){A({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>D(d.payload)).then(()=>A({ok:!0}),L=>{let W=(L instanceof Error?L.message:String(L)).trim();A({ok:!1,error:(W||"Action failed.").slice(0,rt)})});return}if(d.type==="file-open"){let A=d.payload;if(ke&&Br(ke,A))return;ke=A,H(Y,d.payload);return}if(d.type==="file-saved"){H(Ce,d.payload.version);return}if(d.type==="file-snapshot"){let A=W=>{oe||re({channel:w,v:1,type:"file-snapshot-result",id:d.id,payload:W})},D=W=>A({error:(W.trim()||"Could not read the edited file.").slice(0,rt)}),L=Ae;if(!L){D("This extension does not edit files.");return}Promise.resolve().then(()=>L(d.payload.purpose)).then(W=>{if(Zt(W)>2e7){D(`The file is over ${2e7} ${"bytes"in W?"bytes":"characters"}.`);return}if(W.version.length>256){D(`The snapshot version is over ${256} characters.`);return}A({snapshot:"bytes"in W?{bytes:W.bytes,version:W.version}:{content:W.content,version:W.version}})},W=>D(W instanceof Error?W.message:String(W)));return}if(d.type==="resolve"){let A=L=>{re({channel:w,v:1,type:"resolve-result",id:d.id,payload:L})},D=O;if(!D){A({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>D(d.payload)).then(L=>A({item:L?Ve(L):null}),L=>{let W=(L instanceof Error?L.message:String(L)).trim();A({error:(W||"Command failed.").slice(0,rt)})});return}let R=_e.get(d.id);if(R){if(clearTimeout(R.timer),_e.delete(d.id),d.ok){R.resolve(d.payload);return}R.reject(new x(d.code,d.error))}};o.addEventListener("message",cr),re({channel:w,v:1,type:"hello"});let ee=(i,d=r)=>oe||o.parent===o?Promise.reject(new x("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((R,A)=>{let D=setTimeout(()=>{_e.delete(i.id),A(new x("HOST_TIMEOUT","Host did not answer in time."))},d);_e.set(i.id,{resolve:R,reject:A,timer:D}),re(i)}),V=i=>ee(i).then(()=>{}),B={channel:w,v:1},jt=i=>{!oe&&o.parent!==o&&re(i)},lr=()=>jt({...B,type:"file-save"}),dr=i=>{!_n(i)||!zs(i)||(i.preventDefault(),lr())},ur=i=>{!_n(i)||i.key!=="Escape"||T?.surface!=="popover"||!T.popover||(i.preventDefault(),_r(T.popover.id,"escape").catch(()=>{}))},at=()=>{let i=T?.surface==="popover"?T.popover:void 0;if(!i)return;let d=Qe||Ye;sr!==d&&(sr=d,mr(i.id,d).catch(()=>{}))},ct=()=>{T?.surface!=="popover"||Qe||(Qe=!0,at())},pr=i=>{T?.surface!=="popover"||i.relatedTarget!==null||!Qe||(Qe=!1,at())},fr=()=>{T?.surface!=="popover"||Ye||(Ye=!0,at())},Er=()=>{T?.surface!=="popover"||!Ye||(Ye=!1,at())},de=(i,d=1024)=>{if(!i.trim()||i.length>d)throw new x("HOST_REJECTED",`Identity must contain 1 to ${d} characters.`)},$t=async i=>{i.kind!=="projects"&&de(i.projectId);let d=await ee({...B,type:"workspace-read",id:y(_),payload:i});if(!d||!("kind"in d)||!("state"in d)||d.kind!==i.kind)throw new x("HOST_REJECTED","Host did not return workspace data.");return d},Vt=async(i,d)=>{i.kind!=="projects"&&de(i.projectId);let R=y(_);me.set(R,d);try{await V({...B,type:"workspace-subscribe",id:y(_),payload:{subscriptionId:R,query:i}})}catch(A){throw me.delete(R),oe||re({...B,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:R}}),A}return()=>{!me.delete(R)||oe||re({...B,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:R}})}},bs=async(i,d)=>{i.kind==="session"&&de(i.sessionId),i.kind==="project"&&de(i.projectId);let R=y(_);Se.set(R,d);try{await V({...B,type:"shells-subscribe",id:y(_),payload:{subscriptionId:R,scope:i}})}catch(A){throw Se.delete(R),oe||re({...B,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:R}}),A}return()=>{!Se.delete(R)||oe||re({...B,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:R}})}},lt=async i=>{if("key"in i&&(i.key.length===0||i.key.length>128))throw new x("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(i.op==="set"&&!$e(i.value))throw new x("HOST_REJECTED","Storage values must be JSON.");if(i.op==="set"&&new TextEncoder().encode(JSON.stringify(i.value)).length>65536)throw new x("HOST_REJECTED","Storage value exceeds 64 KiB.");if(i.scope==="device"&&T?.features?.deviceStorage!==!0)throw new x("UNSUPPORTED","This host does not support device storage.");let d=await ee({...B,type:"storage",id:y(_),payload:i});if(!d||!("storage"in d)||d.op!==i.op)throw new x("HOST_REJECTED","Host did not return storage data.");return d},_r=(i,d)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):V({...B,type:"popover-close",id:y(_),payload:d?{id:i,reason:d}:{id:i}}),mr=(i,d)=>T?.features?.popovers!==!0&&!(T?.surface==="popover"&&T.popover?.id===i)?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):V({...B,type:"popover-anchor",id:y(_),payload:{id:i,active:d}});return o.addEventListener("keydown",ur,!0),o.addEventListener("pointerover",ct),o.addEventListener("pointermove",ct),o.addEventListener("pointerout",pr),o.addEventListener("focus",fr),o.addEventListener("blur",Er),{onAction:i=>(K=i,()=>{K===i&&(K=null)}),listProjects:async()=>{let i=await $t({kind:"projects"});if(i.kind!=="projects")throw new x("HOST_REJECTED","Expected projects.");return i},listWorktrees:async i=>{let d=await $t({kind:"worktrees",projectId:i});if(d.kind!=="worktrees")throw new x("HOST_REJECTED","Expected worktrees.");return d},listSessions:async i=>{let d=await $t({kind:"sessions",projectId:i});if(d.kind!=="sessions")throw new x("HOST_REJECTED","Expected sessions.");return d},onProjects:i=>Vt({kind:"projects"},d=>{d.kind==="projects"&&i(d)}),onWorktrees:(i,d)=>Vt({kind:"worktrees",projectId:i},R=>{R.kind==="worktrees"&&d(R)}),onSessions:(i,d)=>Vt({kind:"sessions",projectId:i},R=>{R.kind==="sessions"&&d(R)}),onRunningShells:(i,d)=>bs(i,d),readShellOutput:async(i,d)=>{de(i,128);let R=d?.cursor;if(R!==void 0&&(!Number.isInteger(R)||R<0))throw new x("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let A=d?.tailBytes;if(A!==void 0&&(!Number.isInteger(A)||A<1||A>65536))throw new x("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let L=await ee({...B,type:"shell-output",id:y(_),payload:{shellId:i,cursor:R,tailBytes:A}});if(!L||typeof L.output!="string"||!Number.isFinite(L.cursor))throw new x("HOST_REJECTED","Host did not return shell output.");return L},stopShell:async i=>{if(de(i,128),(await ee({...B,type:"shell-stop",id:y(_),payload:{shellId:i}}))?.stopped!==!0)throw new x("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async i=>{de(i),await V({...B,type:"open-session",id:y(_),payload:{sessionId:i}})},storage:{get:async(i,d)=>{let R=xt(d),A={op:"get",key:i};R&&(A.scope=R);let D=await lt(A);return D.op==="get"&&D.found?D.value:void 0},set:async(i,d,R)=>{let A=xt(R),D={op:"set",key:i,value:d};A&&(D.scope=A),await lt(D)},delete:async(i,d)=>{let R=xt(d),A={op:"delete",key:i};R&&(A.scope=R),await lt(A)},keys:async i=>{let d=xt(i),R={op:"keys"};d&&(R.scope=d);let A=await lt(R);if(A.op!=="keys")throw new x("HOST_REJECTED","Expected storage keys.");return A.keys}},onReady:i=>(s.add(i),T&&i(T),()=>{s.delete(i)}),onDirectory:i=>(c.add(i),T&&i(T.directory),()=>{c.delete(i)}),onSession:i=>(a.add(i),T&&i(T.session),()=>{a.delete(i)}),onSessionLifecycle:i=>(l.add(i),Te&&i(Te),()=>{l.delete(i)}),onConnection:i=>(u.add(i),T&&i(T.connection),()=>{u.delete(i)}),onSettings:i=>(p.add(i),T&&i(T.settings),()=>{p.delete(i)}),onItem:i=>(E.add(i),T&&i(T.item),()=>{E.delete(i)}),onBlock:i=>(m.add(i),T?.block&&i(T.block),()=>{m.delete(i)}),onServiceEvent:i=>(S.add(i),()=>{S.delete(i)}),onStatusControl:i=>(g.add(i),()=>{g.delete(i)}),onPopoverClosed:i=>(U.add(i),()=>{U.delete(i)}),setStatusControls:i=>T?.features?.statusControls!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support status controls.")):Vr(i)?V({...B,type:"status-controls",id:y(_),payload:{controls:i}}):Promise.reject(new x("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:i=>T?.features?.popovers!==!0?Promise.reject(new x("UNSUPPORTED","This host does not support popovers.")):to(i)?V({...B,type:"popover-open",id:y(_),payload:i}):Promise.reject(new x("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:_r,setPopoverAnchorActive:mr,onResolve:i=>(O=i,()=>{O===i&&(O=null)}),toast:i=>{let d=i.message.trim();return!d||d.length>_t?Promise.reject(new x("HOST_REJECTED",`Toast message must contain 1 to ${_t} characters.`)):i.copy&&i.copy!==!0&&(!i.copy.text.length||i.copy.text.length>mt)?Promise.reject(new x("HOST_REJECTED",`Toast copy text must contain 1 to ${mt} characters.`)):V({channel:w,v:1,type:"toast",id:y(_),payload:{...i,message:d}})},openUrl:i=>V({channel:w,v:1,type:"open-url",id:y(_),payload:{url:i}}),openCommit:i=>io(i)?V({channel:w,v:1,type:"open-commit",id:y(_),payload:{sha:i}}):Promise.reject(new x("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:i=>V({channel:w,v:1,type:"block-answer",id:y(_),payload:{text:i.trim().slice(0,ro)}}),openSurface:i=>V({channel:w,v:1,type:"open-surface",id:y(_),payload:{surfaceId:i}}),writeClipboard:i=>V({channel:w,v:1,type:"clipboard-write",id:y(_),payload:{text:i}}),compose:i=>V({channel:w,v:1,type:"compose",id:y(_),payload:i}),attach:i=>V({channel:w,v:1,type:"attach",id:y(_),payload:Ve(i)}),startSession:async i=>{i.projectId!==void 0&&de(i.projectId);let d=i.worktree;d&&d!==!0&&(d.kind==="existing"?de(d.directory):(d.name!==void 0&&de(d.name,200),d.baseBranch!==void 0&&de(d.baseBranch,200)));let R=await ee({channel:w,v:1,type:"start-session",id:y(_),payload:uo(i)},e.requestTimeoutMs??18e4);if(!no(R))throw new x("HOST_REJECTED","Host did not return a session.");return R},prompt:i=>ee({channel:w,v:1,type:"prompt",id:y(_),payload:po(i)}).then(d=>{if(!so(d))throw new x("HOST_REJECTED","Host did not return a prompt result.");return d}),sessionLink:i=>V({channel:w,v:1,type:"session-link",id:y(_),payload:Ve(i)}),close:()=>V({channel:w,v:1,type:"close",id:y(_)}),oauthStart:()=>V({channel:w,v:1,type:"oauth-start",id:y(_)}),oauthDisconnect:()=>V({channel:w,v:1,type:"oauth-disconnect",id:y(_)}),request:i=>(bt(i.path)?ee({channel:w,v:1,type:"request",id:y(_),payload:i}):mn()).then(d=>{if(!Rt(d))throw new x("HOST_REJECTED","Host request result was empty.");return d}),serviceRequest:i=>(bt(i.path)?ee({channel:w,v:1,type:"service-request",id:y(_),payload:i}):mn()).then(d=>{if(!Rt(d))throw new x("HOST_REJECTED","Host service request result was empty.");return d}),serviceStatus:()=>ee({channel:w,v:1,type:"service-status",id:y(_)}).then(i=>{if(!_o(i))throw new x("HOST_REJECTED","Host did not return service status.");return i}),readFile:i=>(Xe(i)?ee({channel:w,v:1,type:"file-read",id:y(_),payload:{path:i}}):Ot()).then(d=>{if(!mo(d))throw new x("HOST_REJECTED","Host did not return file content.");return d}),writeFile:(i,d)=>Xe(i)?d.length>Tt?Promise.reject(new x("FILE_TOO_LARGE",`Content is over ${Tt} characters.`)):ee({channel:w,v:1,type:"file-write",id:y(_),payload:{path:i,content:d}}).then(R=>{if(!So(R))throw new x("HOST_REJECTED","Host did not confirm the write.");return R}):Ot(),listDir:i=>(Xe(i)?ee({channel:w,v:1,type:"file-list",id:y(_),payload:{path:i}}):Ot()).then(d=>{if(!To(d))throw new x("HOST_REJECTED","Host did not return directory entries.");return d}),stat:i=>(Xe(i)?ee({channel:w,v:1,type:"file-stat",id:y(_),payload:{path:i}}):Ot()).then(d=>{if(!ho(d))throw new x("HOST_REJECTED","Host did not return file status.");return d}),generate:i=>{let d=i.prompt.trim(),R=i.system?.trim();if(d.length===0||d.length>ht)return Promise.reject(new x("HOST_REJECTED",`Prompt must be 1 to ${ht} characters.`));if(R!==void 0&&(R.length===0||R.length>gt))return Promise.reject(new x("HOST_REJECTED",`System prompt must be 1 to ${gt} characters.`));let A=i.maxOutputTokens===void 0?void 0:Math.min(co,Math.max(1,Math.floor(i.maxOutputTokens)));if(A!==void 0&&!Number.isFinite(A))return Promise.reject(new x("HOST_REJECTED","maxOutputTokens must be a number."));let D={prompt:d};return R!==void 0&&(D.system=R),A!==void 0&&(D.maxOutputTokens=A),ee({channel:w,v:1,type:"generate",id:y(_),payload:D},e.requestTimeoutMs??lo).then(L=>{if(!go(L))throw new x("HOST_REJECTED","Host did not return generated text.");return L})},onLateGenerateResult:i=>{F.add(i);for(let d of N.splice(0))H([i],d);return ar(),()=>{F.delete(i)}},setBadge:i=>V({channel:w,v:1,type:"badge",id:y(_),payload:{count:fo(i)}}),setHeight:i=>V({channel:w,v:1,type:"resize",id:y(_),payload:{height:Eo(i)}}),onFileOpen:i=>(Y.add(i),De||(De=!0,o.addEventListener("keydown",dr,!0)),ke&&i(ke),()=>{Y.delete(i)}),onFileSnapshot:i=>(Ae=i,()=>{Ae===i&&(Ae=null)}),onFileSaved:i=>(Ce.add(i),()=>{Ce.delete(i)}),reportFileChange:i=>jt({...B,type:"file-change",payload:{dirty:i.dirty,edited:i.edited}}),requestFileSave:lr,reportFileUnsupported:()=>jt({...B,type:"file-unsupported"}),dispose:()=>{for(let i of me.keys())re({...B,type:"workspace-unsubscribe",id:y(_),payload:{subscriptionId:i}});me.clear();for(let i of Se.keys())re({...B,type:"shells-unsubscribe",id:y(_),payload:{subscriptionId:i}});Se.clear(),oe=!0,O=null,K=null,Ae=null,Y.clear(),Ce.clear(),De&&o.removeEventListener("keydown",dr,!0),o.removeEventListener("message",cr),o.removeEventListener("keydown",ur,!0),o.removeEventListener("pointerover",ct),o.removeEventListener("pointermove",ct),o.removeEventListener("pointerout",pr),o.removeEventListener("focus",fr),o.removeEventListener("blur",Er);for(let i of _e.values())clearTimeout(i.timer),i.reject(new x("HOST_UNAVAILABLE","Host client was disposed."));_e.clear(),s.clear(),c.clear(),a.clear(),l.clear(),u.clear(),p.clear(),E.clear(),m.clear(),S.clear(),g.clear(),U.clear(),F.clear(),N.length=0}}};var hn=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var Pa=new Set(hn);var Js=10*6e4;var qs=10*6e4;var Qs=10*6e4;var Ys=10*6e4;var gn=["none","agent","user"];var La=new Set(gn);var Z=ko(),bn=async e=>Z.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});async function z(e,o){try{await Z.toast({kind:e,message:o})}catch{}}function At(e){return Z.readFile(e)}function Rn(e){return{providerId:vr,id:Mr(e).slice(0,128),title:Lr(e),url:zt(e),kind:"issue",text:Jt(e),data:Ur(e)}}async function On(e){await Z.attach(Rn(e))}async function xn(e){await Z.startSession({...Rn(e),worktree:!0,navigation:"open"})}async function An(e){await Z.prompt({text:Dr(e),send:!0})}function f(e,o={},...t){let r=document.createElement(e);o.className&&(r.className=o.className),o.text!==void 0&&(r.textContent=o.text),o.title&&(r.title=o.title),o.style&&r.setAttribute("style",o.style),o.role&&r.setAttribute("role",o.role),o.ariaLabel&&r.setAttribute("aria-label",o.ariaLabel);for(let s of t)s==null||s===!1||r.append(typeof s=="string"?document.createTextNode(s):s);return r}function kn(e){for(;e.firstChild;)e.removeChild(e.firstChild)}function Fe(e,o){return o?f("div",{className:"meta-row"},f("span",{className:"meta-label",text:e}),f("span",{className:"meta-value",text:o})):null}var Zs={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function J(e){return e instanceof ye?e.message:e instanceof x?Zs[e.code]??e.message:e instanceof Error?e.message:String(e)}function ei(e){return e instanceof x?e.code:null}function kt(e){let o=ei(e);return o==="DISCONNECTED"||o==="NO_INTEGRATION"}var ti=["all","failed","running"];function yn(e){return ti.includes(e)?e:"all"}function oi(e){return[`#${e.number}`,Ne(e),He(e.revision),e.commitSubject??"",e.pipelineName??""].filter(Boolean).join(" ").toLowerCase()}function ri(e,o,t=""){if(o==="failed"&&!ue(e.outcome)||o==="running"&&!ae(e.phase,e.outcome).active)return!1;let r=t.trim().toLowerCase();return r===""||oi(e).includes(r)}function In(e,o,t=""){return e.filter(r=>ri(r,o,t))}function nt(e){return e.some(o=>ae(o.phase,o.outcome).active)}var ni=`
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
`,wn="circleci-shared-style";function Cn(){if(document.getElementById(wn))return;let e=document.createElement("style");e.id=wn,e.textContent=ni,document.head.append(e)}var vn="prefs";function si(e){let o=5381;for(let t=0;t<e.length;t+=1)o=(o<<5)+o+e.charCodeAt(t)>>>0;return o.toString(36)}function Nn(e){return`project:${si(e)}`}function Un(e){return`pipelines:${e}`}function yo(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ie(e){return typeof e=="string"&&e.length>0?e:null}function ii(e){if(!yo(e))return null;let o=Ie(e.projectId),t=Ie(e.projectName),r=Ie(e.orgName),s=Ie(e.directory);if(!o||!t||!r||!s)return null;let c=e.source==="detected"?"detected":"picked";return{projectId:o,projectName:t,orgName:r,slug:Ie(e.slug),source:c,directory:s}}async function Pn(e,o){let t=ii(await e.get(Nn(o)));return!t||t.directory!==o?null:t}async function Io(e,o,t){await e.set(Nn(o),{projectId:t.projectId,projectName:t.projectName,orgName:t.orgName,slug:t.slug,source:t.source,directory:o})}var ai={autoRefresh:!0};function ci(e){return yo(e)?{autoRefresh:e.autoRefresh!==!1}:{...ai}}async function wo(e){return ci(await e.get(vn))}async function Mn(e,o){let r={...await wo(e),...o};return await e.set(vn,{autoRefresh:r.autoRefresh}),r}function li(e){if(!Array.isArray(e))return null;let o=[];for(let t of e){if(!yo(t))continue;let r=Ie(t.id),s=Ie(t.name);!r||!s||o.push({id:r,name:s,configPath:Ie(t.configPath)??""})}return o.length>0?o:null}async function Ln(e,o){return li(await e.get(Un(o)))}async function Dn(e,o,t){await e.set(Un(o),t.map(r=>({id:r.id,name:r.name,configPath:r.configPath})))}var di=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],ui=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],Gn=(e,o)=>{o.style.colorScheme=e.mode;for(let[t,r]of di)o.style.setProperty(t,e.tokens[r]);for(let[t,r,s]of ui){let c=e.tokens[s]??"";o.style.setProperty(t,c),o.style.setProperty(r,c)}o.style.setProperty("font-family",e.tokens.font),o.style.setProperty("font-size","0.875rem"),o.style.setProperty("line-height","1.45"),o.style.setProperty("color",e.tokens.foreground)},Co=(e,o)=>{Gn(e.theme,o),o.dataset&&(o.dataset.ocSurface=e.surface,o.dataset.ocTheme=e.theme.mode)};var pi={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},G=(e,o)=>`var(--${e}, var(--oc-${pi[e]}, ${o}))`,be=G("surface-background","transparent"),It=G("surface-elevated","transparent"),Be=G("surface-elevated-foreground","inherit"),ne=G("surface-foreground","inherit"),j=G("surface-muted-foreground","gray"),fi=G("surface-muted","transparent"),Ue=G("interactive-border","currentColor"),te=G("interactive-hover","transparent"),Pe=G("interactive-active","transparent"),vo=G("interactive-selection","transparent"),No=G("interactive-selection-foreground","inherit"),ge=G("primary","currentColor"),Uo=G("primary-text","inherit"),Po=G("error-text","inherit"),Ei=G("font-sans","inherit"),Mo=G("font-mono","monospace"),Vn=G("radius","9px"),Lo=`calc(${Vn} - 2px)`,Hn=`calc(${Vn} - 4px)`,$=(e,o,t="transparent")=>`color-mix(in srgb, ${e} ${o}%, ${t})`,jn=`background-image: linear-gradient(${te}, ${te});`,Do=(e,o="0.5px")=>`box-shadow: inset 0 0 0 ${o} ${e}, var(--oc-sdk-field-lift);`,Go="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",$n="box-shadow: var(--oc-sdk-lit);",Ho=`inset 0 0.5px 0 0 ${$(ne,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,_i=`
:root {
  --oc-sdk-edge: ${$(ne,16)};
  --oc-sdk-field-bg: ${It};
  --oc-sdk-raised-bg: ${be};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${$(ne,14)};
  --oc-sdk-field-bg: ${$(be,50,It)};
  --oc-sdk-raised-bg: ${It};
  --oc-sdk-field-lift: ${Ho};
  --oc-sdk-raised-lift: ${Ho};
  --oc-sdk-lit: ${Ho};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,yt=e=>{let o=G(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${o}; --oc-sdk-tone-text: ${G(`${e}-text`,"inherit")}; }`},mi=`
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
`,Xn=`${_i}
.oc-sdk { color: ${ne}; font-family: ${Ei}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${jn} }
.oc-sdk-mono { font-family: ${Mo}; }
.oc-sdk-muted { color: ${j}; }
${yt("success")}${yt("warning")}${yt("error")}${yt("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ge}; --oc-sdk-tone-text: ${Uo}; }

.oc-sdk-btn { border-radius: ${Lo}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${Hn}; }
.oc-sdk-btn[data-variant="default"] { color: ${Uo}; background: ${$(ge,10,be)}; border-color: ${$(ge,12)}; ${$n} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${$(ge,16,be)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${$(ge,22,be)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${fi}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${Pe}, ${Pe}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Be}; ${Go} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${Pe}, ${Pe}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${te}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${Pe}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${G("status-error","red")}; color: ${Po}; background: ${$("var(--oc-sdk-tone)",7,be)}; border-color: ${$("var(--oc-sdk-tone)",12)}; ${$n} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${$("var(--oc-sdk-tone)",9,be)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${$("var(--oc-sdk-tone)",11,be)}; box-shadow: none; }

.oc-sdk-field-note { color: ${j}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${Po}; }
.oc-sdk-input { border-radius: ${Lo}; background: var(--oc-sdk-field-bg); color: ${Be}; ${Do("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${j}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Do($(ne,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Do(G("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${Mo}; }

.oc-sdk-search-icon { color: ${j}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ge}; }
.oc-sdk-search-clear { border-radius: ${Hn}; color: ${j}; }
.oc-sdk-search-clear:hover { background: ${te}; color: ${ne}; }

.oc-sdk-trigger { border-radius: ${Lo}; background: var(--oc-sdk-raised-bg); color: ${Be}; ${Go} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${te}, ${te}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${Pe}, ${Pe}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${j}; }
.oc-sdk-trigger-chevron { color: ${j}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Be}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${It}; background-clip: padding-box; color: ${Be}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${te}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${vo}; color: ${No}; }
.oc-sdk-option-check { color: ${ne}; }
.oc-sdk-option[data-destructive="true"] { color: ${Po}; }
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
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${jn} }
.oc-sdk-check-desc { color: ${j}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${$(ne,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${j}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${ne}; }
.oc-sdk-tab[aria-selected="true"] { color: ${No}; background: ${vo}; border-color: ${Ue}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Be}; background: var(--oc-sdk-raised-bg); ${Go} }
.oc-sdk-tab-count { color: ${j}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${$(ne,6)}; color: ${j}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${$("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${te}; }
.oc-sdk-row[aria-selected="true"] { background: ${vo}; color: ${No}; }
.oc-sdk-row-lead { font-family: ${Mo}; color: ${j}; }
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

.oc-sdk-text a { color: ${Uo}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${$(Ue,60)}; }
`,P=`
${qt}
${mi}
${Xn}`;var Fn="oc-sdk-ui-style",pe=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},M=e=>{let o=document.getElementById(Fn);if(o instanceof HTMLStyleElement){o.textContent!==e&&(o.textContent=e);return}Qt(document);let t=document.createElement("style");t.id=Fn,t.textContent=e,document.head.appendChild(t)},b=(e,o)=>{let t=document.createElement(e);return o&&(t.className=o),t},se=e=>{let o=b("button",e);return o.type="button",o},X=(e,o)=>{let t=o??"";e.textContent!==t&&(e.textContent=t)},ce=(e,o,t)=>{t==null||t===""?e.removeAttribute(o):e.getAttribute(o)!==t&&e.setAttribute(o,t)},Bn=(e,o)=>{let t=r=>{r.target instanceof Node&&e.contains(r.target)||o()};return document.addEventListener("pointerdown",t,!0),()=>{document.removeEventListener("pointerdown",t,!0)}};var Si=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},Re=(e,o)=>{M(P);let t=o,r=se("oc-sdk oc-sdk-btn"),s=Si(),c=document.createElement("span");r.append(c),e.append(r);let a=()=>{r.dataset.variant=t.variant??"default",r.dataset.size=t.size??"default",r.disabled=!!t.disabled||!!t.loading,r.dataset.loading=t.loading?"true":"false",r.setAttribute("aria-busy",t.loading?"true":"false"),t.loading&&s.parentNode!==r?r.prepend(s):!t.loading&&s.parentNode===r&&s.remove(),X(c,t.label)},l=()=>{t.disabled||t.loading||t.onClick()};return r.addEventListener("click",l),a(),{update:u=>{t={...t,...u},a()},dispose:()=>{r.removeEventListener("click",l),r.remove()}}};var jo=(e,o)=>{M(P);let t=o,r=b("label","oc-sdk oc-sdk-field"),s=b("span","oc-sdk-field-label"),c=t.multiline?b("textarea","oc-sdk-input"):b("input","oc-sdk-input"),a=b("span","oc-sdk-field-note");r.append(s,c,a),e.append(r);let l=()=>{X(s,t.label),s.hidden=!t.label,c instanceof HTMLInputElement?c.type=t.password?"password":"text":c.rows=t.rows??3,c.value!==t.value&&(c.value=t.value),c.disabled=!!t.disabled,ce(c,"placeholder",t.placeholder),c.dataset.mono=t.mono?"true":"false";let p=!!t.error;r.dataset.invalid=p?"true":"false",c.setAttribute("aria-invalid",p?"true":"false");let E=t.error??t.helper??"";X(a,E),a.hidden=E===""},u=()=>{t.onChange(c.value)};return c.addEventListener("input",u),l(),{update:p=>{t={...t,...p},l()},dispose:()=>{c.removeEventListener("input",u),r.remove()}}};var Wn="http://www.w3.org/2000/svg",Ti={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},Oe=(e,o,t)=>{let r=document.createElementNS(Wn,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(o)),r.setAttribute("height",String(o)),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),t&&r.setAttribute("class",t);let s=document.createElementNS(Wn,"path");return s.setAttribute("d",Ti[e]),r.append(s),r};var $o=(e,o)=>{M(P);let t=o,r=b("div","oc-sdk oc-sdk-search"),s=b("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let c=se("oc-sdk-search-clear");c.append(Oe("close",14)),c.tabIndex=-1,r.append(Oe("search",16,"oc-sdk-search-icon"),s,c),e.append(r);let a=()=>{let E=t.placeholder??"Search";ce(s,"placeholder",E),s.setAttribute("aria-label",t.label??E),c.setAttribute("aria-label","Clear search"),s.value!==t.value&&(s.value=t.value),r.dataset.active=t.value.trim()===""?"false":"true"},l=()=>{t.value!==""&&t.onChange(""),s.focus()},u=()=>{t.onChange(s.value)},p=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),l())};return s.addEventListener("input",u),s.addEventListener("keydown",p),c.addEventListener("click",l),a(),t.autofocus&&s.focus(),{update:E=>{t={...t,...E},a()},dispose:()=>{s.removeEventListener("input",u),s.removeEventListener("keydown",p),c.removeEventListener("click",l),r.remove()}}};var fe=(e,o="vertical")=>{let[t,r]=o==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===t||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},xe=(e,o,t)=>{let r=e.filter(u=>!u.disabled);if(r.length===0)return null;let s=r[0],c=r[r.length-1];if(t==="first"||!s||!c)return s?.id??null;if(t==="last")return c.id;let a=r.findIndex(u=>u.id===o);return a===-1?t==="next"?s.id:c.id:r[Math.min(r.length-1,Math.max(0,a+(t==="next"?1:-1)))]?.id??null};var Kn=(e,o)=>`${e}-${o??""}`,wt=(e,o,t,r)=>{let s=se("oc-sdk-option");s.id=Kn(e,t.id),s.setAttribute("role",o),s.tabIndex=-1,s.disabled=!!t.disabled,o==="option"&&s.setAttribute("aria-selected",t.selected?"true":"false"),s.dataset.destructive=t.destructive?"true":"false";let c=b("span","oc-sdk-option-label");if(c.textContent=t.label,s.append(c),t.hint){let a=b("span","oc-sdk-option-hint");a.textContent=t.hint,s.append(a)}if(o==="option"){s.dataset.mark="check";let a=b("span","oc-sdk-option-check");a.append(Oe("check",14)),s.append(a)}return s.addEventListener("pointerenter",r.hover),s.addEventListener("click",r.pick),s},Ct=(e,o,t,r)=>{let s=Kn(t,r);for(let c of Array.from(e.children))c instanceof HTMLElement&&c.classList.contains("oc-sdk-option")&&(c.dataset.active=c.id===s?"true":"false");ce(o,"aria-activedescendant",r?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var hi=(e,o)=>{let t=o.getBoundingClientRect();e.style.minWidth=`${Math.round(t.width)}px`,e.style.left=`${Math.round(t.left)}px`,e.style.top=`${Math.round(t.bottom+4)}px`;let r=e.offsetHeight,s=window.innerHeight-t.bottom-8;r>s&&t.top-8>s&&(e.style.top=`${Math.max(8,Math.round(t.top-4-r))}px`);let c=t.left+e.offsetWidth-window.innerWidth+8;c>0&&(e.style.left=`${Math.max(8,Math.round(t.left-c))}px`)},vt=(e,o,t,r)=>{e.append(t),hi(t,o);let s=Bn(e,r),c=()=>{r()},a=l=>{l.target instanceof Node&&t.contains(l.target)||r()};return window.addEventListener("resize",c),window.addEventListener("scroll",a,!0),()=>{s(),window.removeEventListener("resize",c),window.removeEventListener("scroll",a,!0),t.remove()}};var zn=(e,o)=>{let t=o.trim().toLowerCase();return t?e.filter(r=>r.label.toLowerCase().includes(t)||r.id.toLowerCase().includes(t)):[...e]},gi=0,Vo=(e,o)=>{M(P);let t=o,r=`oc-sdk-select-${gi+=1}`,s=b("div","oc-sdk oc-sdk-select"),c=b("span","oc-sdk-field-label");c.id=`${r}-label`;let a=se("oc-sdk-trigger");a.setAttribute("aria-haspopup","listbox"),a.setAttribute("aria-labelledby",c.id);let l=b("span","oc-sdk-trigger-value");a.append(l,Oe("chevron",14,"oc-sdk-trigger-chevron")),s.append(c,a),e.append(s);let u="",p=null,E=null,m=b("div","oc-sdk oc-sdk-popup"),S=b("div","oc-sdk-popup-search"),g=b("input","oc-sdk-input");g.type="text",g.autocomplete="off",S.append(g);let U=b("div");U.setAttribute("role","listbox"),U.tabIndex=-1,m.append(U);let F=()=>zn(t.options,t.searchable?u:""),N=()=>t.searchable?g:U,O=_=>{p=_,Ct(U,N(),r,_)},K=()=>{pe(U);let _=F();if(_.length===0){let T=b("div","oc-sdk-popup-empty");T.textContent="No matches",U.append(T)}for(let T of _)U.append(wt(r,"option",{...T,selected:T.id===t.value},{hover:()=>O(T.id),pick:()=>Ae(T.id)}));O(_.some(T=>T.id===p)?p:_[0]?.id??null)},Y=()=>{let _=E;E=null,_?.(),u="",g.value="",a.setAttribute("aria-expanded","false")},Ce=()=>{E||t.disabled||(p=t.value,g.placeholder=t.searchPlaceholder??"Search",t.searchable?m.prepend(S):S.remove(),K(),E=vt(s,a,m,Y),a.setAttribute("aria-expanded","true"),N().focus())},Ae=_=>{Y(),a.focus(),_!==t.value&&t.onChange(_)},ke=()=>{E?Y():Ce()},De=_=>{!E&&fe(_)&&(_.preventDefault(),Ce())},_e=_=>{let T=fe(_);T?(_.preventDefault(),O(xe(F(),p,T))):_.key==="Enter"?(_.preventDefault(),p&&Ae(p)):_.key==="Escape"?(_.preventDefault(),Y(),a.focus()):t.searchable&&_.target!==g&&_.key.length===1&&!_.ctrlKey&&!_.metaKey&&g.focus()},me=()=>{u=g.value,K()},Se=_=>{E&&!(_.relatedTarget instanceof Node&&s.contains(_.relatedTarget))&&Y()},oe=()=>{X(c,t.label),c.hidden=!t.label;let _=t.options.find(T=>T.id===t.value);X(l,_?.label??t.placeholder??"Select"),l.dataset.empty=_?"false":"true",a.disabled=!!t.disabled,E&&K()};return a.addEventListener("click",ke),a.addEventListener("keydown",De),m.addEventListener("keydown",_e),g.addEventListener("input",me),s.addEventListener("focusout",Se),oe(),{update:_=>{t={...t,..._},oe()},dispose:()=>{Y(),a.removeEventListener("click",ke),a.removeEventListener("keydown",De),m.removeEventListener("keydown",_e),g.removeEventListener("input",me),s.removeEventListener("focusout",Se),s.remove()}}};var Xo=(e,o)=>{M(P);let t=o,r=b("div","oc-sdk oc-sdk-tabs");r.setAttribute("role","tablist"),e.append(r);let s=()=>{pe(r),r.dataset.track=t.trackBackground?"true":"false";for(let a of t.items){let l=se("oc-sdk-tab");l.setAttribute("role","tab");let u=a.id===t.activeId;l.setAttribute("aria-selected",u?"true":"false"),l.tabIndex=u?0:-1,l.dataset.id=a.id;let p=b("span");if(p.textContent=a.label,l.append(p),a.count!==void 0){let E=b("span","oc-sdk-tab-count");E.textContent=String(a.count),l.append(E)}l.addEventListener("click",()=>{a.id!==t.activeId&&t.onChange(a.id)}),r.append(l)}},c=a=>{let l=fe(a,"horizontal");if(!l)return;let u=xe(t.items,t.activeId,l);if(u&&u!==t.activeId){a.preventDefault(),t.onChange(u);let p=r.querySelector(`[data-id="${CSS.escape(u)}"]`);p instanceof HTMLElement&&p.focus()}};return r.addEventListener("keydown",c),s(),{update:a=>{t={...t,...a},s()},dispose:()=>{r.removeEventListener("keydown",c),r.remove()}}};var Nt=(e,o)=>{ce(e,"data-tone",o&&o!=="neutral"?o:null)},Fo=(e,o)=>{M(P);let t=o,r=b("span","oc-sdk oc-sdk-badge");e.append(r);let s=()=>{X(r,t.label),Nt(r,t.tone)};return s(),{update:c=>{t={...t,...c},s()},dispose:()=>{r.remove()}}};var bi=0,Bo=(e,o)=>{M(P);let t=o,r=`oc-sdk-list-${bi+=1}`,s=b("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let c=null,a=m=>`${r}-${m}`,l=m=>{c=m;for(let S of Array.from(s.children))S instanceof HTMLElement&&(S.dataset.active=S.id===a(m??"")?"true":"false");ce(s,"aria-activedescendant",m?a(m):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},u=(m,S)=>{let g=b("span",m);return g.textContent=S,g},p=()=>{if(pe(s),ce(s,"aria-label",t.ariaLabel),t.items.length===0){s.append(u("oc-sdk-list-empty",t.emptyText??"Nothing here")),l(null);return}for(let S of t.items){let g=se("oc-sdk-row");g.id=a(S.id),g.setAttribute("role","option"),g.setAttribute("aria-selected",S.id===t.selectedId?"true":"false"),g.disabled=!!S.disabled,g.tabIndex=-1,S.leading&&g.append(u("oc-sdk-row-lead",S.leading));let U=b("span","oc-sdk-row-main");if(U.append(u("oc-sdk-row-title",S.title)),S.subtitle&&U.append(u("oc-sdk-row-sub",S.subtitle)),g.append(U),S.badge){let F=u("oc-sdk-badge",S.badge.label);Nt(F,S.badge.tone),g.append(F)}S.meta&&g.append(u("oc-sdk-row-meta",S.meta)),g.addEventListener("click",()=>t.onSelect(S.id)),s.append(g)}let m=t.items.some(S=>S.id===c&&!S.disabled);l(m?c:t.selectedId??null)},E=m=>{let S=fe(m);if(S){m.preventDefault(),l(xe(t.items,c,S));return}(m.key==="Enter"||m.key===" ")&&c&&(m.preventDefault(),t.onSelect(c))};return s.addEventListener("keydown",E),p(),{update:m=>{t={...t,...m},p()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var Wo=(e,o)=>{M(P);let t=o,r=b("div","oc-sdk oc-sdk-empty"),s=b("h2","oc-sdk-empty-title"),c=b("p","oc-sdk-empty-body"),a=b("div","oc-sdk-empty-action");r.append(s,c,a),e.append(r);let l=null,u=()=>{if(X(s,t.title),X(c,t.body),c.hidden=!t.body,a.hidden=!t.action,!t.action){l?.dispose(),l=null;return}let p={label:t.action.label,onClick:t.action.onClick};l?l.update(p):l=Re(a,{...p,variant:"outline",size:"sm"})};return u(),{update:p=>{t={...t,...p},u()},dispose:()=>{l?.dispose(),l=null,r.remove()}}};var Ko=(e,o={})=>{M(P);let t=o,r=b("span","oc-sdk oc-sdk-spinner");r.setAttribute("role","status");let s=b("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let c=b("span");r.append(s,c),e.append(r);let a=()=>{r.dataset.size=t.size??"default",X(c,t.label),c.hidden=!t.label,r.setAttribute("aria-label",t.label??"Loading")};return a(),{update:l=>{t={...t,...l},a()},dispose:()=>{r.remove()}}};var zo=(e,o)=>{M(P);let t=o,r=b("div","oc-sdk oc-sdk-banner"),s=b("div","oc-sdk-banner-text"),c=b("div","oc-sdk-banner-title"),a=b("div","oc-sdk-banner-body"),l=b("div","oc-sdk-banner-action");s.append(c,a),r.append(s,l),e.append(r);let u=null,p=()=>{if(r.dataset.tone=t.tone,r.setAttribute("role",t.tone==="error"||t.tone==="warning"?"alert":"status"),X(c,t.title),X(a,t.body),a.hidden=!t.body,l.hidden=!t.action,!t.action){u?.dispose(),u=null;return}let E={label:t.action.label,onClick:t.action.onClick};u?u.update(E):u=Re(l,{...E,variant:"outline",size:"xs"})};return p(),{update:E=>{t={...t,...E},p()},dispose:()=>{u?.dispose(),u=null,r.remove()}}};var Jn=e=>e.filter(o=>!("separator"in o)),Ri=0,Jo=(e,o)=>{M(P);let t=o,r=`oc-sdk-menu-${Ri+=1}`,s=b("div","oc-sdk oc-sdk-menu");e.append(s);let c=b("div","oc-sdk oc-sdk-popup");c.setAttribute("role","menu"),c.tabIndex=-1;let a=null,l=null,u=Re(s,{label:t.label,variant:t.variant,size:t.size,onClick:()=>{a?S():g()}}),p=s.querySelector("button");p?.setAttribute("aria-haspopup","menu");let E=O=>{l=O,Ct(c,c,r,O)},m=()=>{pe(c);for(let O of t.items){if("separator"in O){let K=b("div","oc-sdk-separator");K.dataset.labeled="false",c.append(K);continue}c.append(wt(r,"menuitem",O,{hover:()=>E(O.id),pick:()=>U(O.id)}))}E(Jn(t.items).some(O=>O.id===l)?l:null)},S=()=>{let O=a;a=null,O?.(),l=null,p?.setAttribute("aria-expanded","false")},g=()=>{a||!p||(m(),a=vt(s,p,c,S),p.setAttribute("aria-expanded","true"),c.focus())},U=O=>{S(),p?.focus(),t.onSelect(O)},F=O=>{let K=fe(O);K?(O.preventDefault(),E(xe(Jn(t.items),l,K))):O.key==="Enter"||O.key===" "?(O.preventDefault(),l&&U(l)):O.key==="Escape"&&(O.preventDefault(),S(),p?.focus())},N=O=>{a&&!(O.relatedTarget instanceof Node&&s.contains(O.relatedTarget))&&S()};return c.addEventListener("keydown",F),s.addEventListener("focusout",N),{update:O=>{t={...t,...O},u.update({label:t.label,variant:t.variant,size:t.size}),a&&m()},dispose:()=>{S(),c.removeEventListener("keydown",F),s.removeEventListener("focusout",N),u.dispose(),s.remove()}}};var Oi=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,xi=e=>{try{let o=new URL(e);return o.protocol==="http:"||o.protocol==="https:"}catch{return!1}},qn=e=>{let o=[],t=0;for(let r of e.matchAll(Oi)){let s=r.index??0;s>t&&o.push({kind:"text",text:e.slice(t,s)});let c=r[1]??"",a=(r[2]??"").trim(),l=r[3]??"";xi(l)?c==="!"?o.push({kind:"image",src:l,alt:a}):o.push({kind:"link",href:l,label:a||l}):o.push({kind:"text",text:r[0]}),t=s+r[0].length}return t<e.length&&o.push({kind:"text",text:e.slice(t)}),o},qo=(e,o)=>{M(P);let t=o,r=b("div","oc-sdk oc-sdk-text");e.append(r);let s=a=>{!(a.target instanceof HTMLAnchorElement)||!t.onOpenUrl||(a.preventDefault(),t.onOpenUrl(a.target.href))},c=()=>{pe(r);for(let a of qn(t.text))if(a.kind==="text")r.append(document.createTextNode(a.text));else if(a.kind==="link"){let l=b("a");l.href=a.href,l.rel="noopener noreferrer",l.target="_blank",l.textContent=a.label,r.append(l)}else{let l=b("img");l.src=a.src,l.alt=a.alt,l.loading="lazy",l.referrerPolicy="no-referrer",r.append(l)}};return r.addEventListener("click",s),c(),{update:a=>{t={...t,...a},c()},dispose:()=>{r.removeEventListener("click",s),r.remove()}}};var Qn=[];function le(e){return Qn.push(e),e}function Yn(){for(let e of Qn.splice(0))try{e.dispose()}catch{}}var q=(e,o)=>le(Re(e,o)),Zn=(e,o)=>le(jo(e,o)),es=(e,o)=>le($o(e,o)),ts=(e,o)=>le(Vo(e,o)),os=(e,o)=>le(Xo(e,o)),yi=(e,o)=>le(Fo(e,o)),Qo=(e,o)=>le(Bo(e,o)),We=(e,o)=>le(Wo(e,o)),Ii=(e,o)=>le(Ko(e,o)),Yo=(e,o)=>le(zo(e,o)),Ut=(e,o)=>le(Jo(e,o)),wi=(e,o)=>le(qo(e,o));function Pt(e,o="notice"){let t=document.createElement("div");return t.className=o,wi(t,{text:e,onOpenUrl:ze}),t}function Ke(e,o){let t=document.createElement("span"),r=ae(e,o);return yi(t,{label:r.label,tone:r.tone}),t}function Me(e){let o=document.createElement("div");return o.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Ii(o,{label:e}),o}function rs(e){Co(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function ze(e){if(e){try{let o=new URL(e);if(o.protocol!=="https:"&&o.protocol!=="http:")return}catch{return}Z.openUrl(e).catch(()=>{})}}function Zo(e,o,t){return{directory:e,link:o,repo:t,target:Ir(t,o.orgName,o.projectName)}}async function Mt(e){try{let o=await e(".git/config"),t=wr(o.content);return t?yr(t):null}catch{return null}}async function ns(e){try{let o=await e(".git/HEAD");return Cr(o.content)}catch{return null}}async function ss(e,o,t,r){let s=await Pn(o,t);if(s)return Zo(t,s,await Mt(r));let c=await Mt(r);if(!c)return null;for(let a of Bt(c))try{let l=await e.findProjectBySlug(a);if(!l||!l.id)continue;return await Io(o,t,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected"}),Zo(t,{projectId:l.id,projectName:l.name,orgName:l.orgName,slug:a,source:"detected",directory:t},c)}catch{}return null}async function is(e,o,t,r){let s=r?Bt(r)[0]??null:null;return await Io(e,o,{projectId:t.id,projectName:t.name,orgName:t.orgName,slug:s,source:"picked"}),Zo(o,{projectId:t.id,projectName:t.name,orgName:t.orgName,slug:s,source:"picked",directory:o},r)}var v=document.querySelector("#root");if(!v)throw new Error("CircleCI panel is missing its #root element.");var Q=xr(bn),Je=Z.storage,Ci=3e4,or=null,n={ready:null,connected:!1,account:"CircleCI",booted:!1,workspace:null,override:null,directory:null,runs:[],runsNext:null,filter:"all",selectedRun:null,workflows:[],selectedWorkflow:null,jobs:[],selectedJob:null,jobDetail:null,jobOutput:null,pipelines:[],preferences:{autoRefresh:!0},loading:!0,error:null,toast:null,disconnectNotice:null,trigger:null,picker:!1,pickerLoading:!1,pickerError:null,pickerProjects:[],pickerFilter:""},ie=0,st=null;function Ee(){return n.override??n.workspace}async function ps(){I(),n.preferences=await wo(Je);let e=n.ready?.directory??null;if(n.directory=e,!n.connected){n.loading=!1,I();return}try{let o=await Q.currentUser();n.account=o.login}catch{}if(!e){n.loading=!1,I();return}try{let o=await ss(Q,Je,e,At);if(n.workspace=o,!o){n.loading=!1,n.picker=!0,I(),rr();return}await we()}catch(o){n.loading=!1,n.error=J(o),kt(o)&&(n.connected=!1),I()}}async function we(e={}){let o=Ee();if(!o)return;let t=++ie;e.more||(n.loading=!0,n.error=null,I());try{let r=await Q.listRuns(o.link.projectId,e.more?n.runsNext??void 0:void 0);if(t!==ie)return;n.runs=e.more?[...n.runs,...r.items]:r.items,n.runsNext=r.next,n.loading=!1,Vi()}catch(r){if(t!==ie)return;n.loading=!1,n.error=J(r),kt(r)&&(n.connected=!1)}I(),it()}async function Dt(){let e=n.selectedRun;if(!e)return;let o=++ie;n.loading=!0,n.error=null,I();try{let t=await Q.listWorkflows(e.id);if(o!==ie)return;n.workflows=t.items,n.loading=!1}catch(t){if(o!==ie)return;n.loading=!1,n.error=J(t)}I(),it()}async function qe(){let e=n.selectedWorkflow;if(!e)return;let o=++ie;n.loading=!0,n.error=null,I();try{let t=await Q.listJobs(e.id);if(o!==ie)return;n.jobs=t.items,n.loading=!1}catch(t){if(o!==ie)return;n.loading=!1,n.error=J(t)}I(),it()}async function fs(){let e=n.selectedJob;if(!e)return;let o=++ie;n.loading=!0,n.error=null,I();try{let t=await Q.getJob(e.id);if(o!==ie)return;n.jobDetail=t;let r=t.steps.find(s=>ue(s.outcome));if(n.jobOutput=null,r)try{let s=await Q.condensedOutput(e.id,r.num,0);o===ie&&s.trim()&&(n.jobOutput=s)}catch{}n.loading=!1}catch(t){if(o!==ie)return;n.loading=!1,n.error=J(t)}I(),it()}async function Gt(e=!1){return e||(n.toast=null),n.selectedJob?fs():n.selectedWorkflow?qe():n.selectedRun?Dt():we({more:!1})}async function Es(e){n.toast=null,n.selectedRun=e,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),await Dt()}async function er(e){n.selectedWorkflow=e,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),await qe()}async function tr(e){n.selectedJob=e,n.jobDetail=null,n.jobOutput=null,I(),await fs()}function vi(){n.toast=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),we({more:!1})}function Ni(){n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),Dt()}function Ui(){n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,I(),qe()}function Le(e){let o=Ee(),t=n.selectedRun;return!o||!t?null:{workspace:o,run:t,workflow:e.workflow??n.selectedWorkflow,job:e.job??n.selectedJob,jobs:n.jobs,detail:e.detail??n.jobDetail,output:e.output??n.jobOutput}}async function Lt(e){if(e)try{await On(e),await z("success","Attached to the chat box.")}catch(o){await z("error",J(o))}}async function _s(e){if(e)try{await xn(e),await z("success","Started a worktree chat for this build.")}catch(o){await z("error",J(o))}}async function Pi(e){if(e)try{await An(e),await z("success","Sent to the open chat.")}catch(o){await z("error",J(o))}}async function ms(e,o){try{await Q.rerunWorkflow(e.id,o),await z("success",`Rerun started for ${e.name}.`),await qe()}catch(t){await z("error",J(t))}}async function Mi(e){let o=e?n.workflows.filter(r=>ue(r.outcome)):n.workflows;if(o.length===0){await z("info","No failed workflow to rerun.");return}let t=0;for(let r of o)try{await Q.rerunWorkflow(r.id,e),t+=1}catch(s){await z("error",J(s))}t>0&&await z("success",`Started ${t} rerun${t===1?"":"s"}.`),await Dt()}async function Ss(e){try{await Q.cancelWorkflow(e.id),await z("success",`Cancellation requested for ${e.name}.`),await qe()}catch(o){await z("error",J(o))}}async function as(e,o){try{o?await Q.approve(e.id):await Q.reject(e.id),await z("success",o?`Approved ${e.name}.`:`Rejected ${e.name}.`),await qe()}catch(t){await z("error",J(t))}}async function Li(e){let o=await Ln(Je,e.link.projectId);n.pipelines=o??[];try{let t=await Q.listPipelines(e.link.projectId);return n.pipelines=t,await Dn(Je,e.link.projectId,t),t}catch{return n.pipelines}}async function Di(){let e=Ee();if(!e)return;let o=n.directory?await ns(At):null;n.pipelines=[],n.trigger={loading:!0,pipelineId:"",branch:o??"",error:null,running:!1},I(),await Li(e),n.trigger&&(n.trigger={...n.trigger,loading:!1,pipelineId:n.trigger.pipelineId||n.pipelines[0]?.id||""},I())}async function Gi(){let e=Ee(),o=n.trigger;if(!e||!o)return;let r=n.pipelines.some(c=>c.id===o.pipelineId)?o.pipelineId:n.pipelines[0]?.id??"";if(!r){n.trigger={...o,error:"This project has no pipeline to run."},I();return}let s=o.branch.trim();if(!s){n.trigger={...o,error:"Name a branch or tag to build."},I();return}n.trigger={...o,running:!0,error:null},I();try{await Q.fireRun({projectId:e.link.projectId,pipelineId:r,branch:s}),n.trigger=null,await z("success",`Started a run on ${s}.`),await we({more:!1})}catch(c){n.trigger={...o,running:!1,error:J(c)},I()}}async function Hi(e){switch(e){case"refresh":await Gt();return;case"trigger":await Di();return;case"choose":n.override=null,n.picker=!0,I(),await rr();return;case"revert":n.override=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,n.pipelines=[],I(),await we({more:!1});return;case"pause":case"resume":n.preferences=await Mn(Je,{autoRefresh:e==="resume"}),I(),it();return;case"disconnect":await zi();return;default:return}}async function rr(){n.pickerLoading=!0,n.pickerError=null,I();try{let e=await Q.listOrgs(),o=await Promise.allSettled(e.map(r=>Q.listProjectsOfOrg(r.id))),t=[];for(let r of o)r.status==="fulfilled"&&t.push(...r.value.items);t.sort((r,s)=>{let c=r.orgName.localeCompare(s.orgName);return c!==0?c:r.name.localeCompare(s.name)}),n.pickerProjects=t}catch(e){n.pickerError=J(e),kt(e)&&(n.connected=!1)}n.pickerLoading=!1,I()}async function ji(e){let o=n.directory;if(o)try{let t=await Mt(At),r=await is(Je,o,e,t);n.workspace=r,n.override=null,n.picker=!1,n.pickerProjects=[],n.pickerFilter="",n.selectedRun=null,n.pipelines=[],I(),await we({more:!1})}catch(t){await z("error",J(t))}}function $i(){return n.selectedJob?nt([n.selectedJob]):n.selectedWorkflow?nt(n.jobs):n.selectedRun?nt(n.workflows):nt(n.runs)}function it(){st!==null&&(window.clearTimeout(st),st=null),n.preferences.autoRefresh&&$i()&&(st=window.setTimeout(()=>{st=null,Gt(!0)},Ci))}function Vi(){let e=n.runs.filter(o=>ue(o.outcome)).length;Z.setBadge(e>0?e:null).catch(()=>{})}function I(){if(Yn(),or=null,kn(v),!n.connected){Xi();return}if(!n.directory){cs();return}if(n.picker){Bi();return}if(!Ee()){cs();return}if(n.trigger){Fi();return}if(n.selectedJob){Yi();return}if(n.selectedWorkflow){gs();return}if(n.selectedRun){hs();return}nr()}function Xi(){let e=f("div");v?.append(e),We(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. Tokens stay in OpenChamber; this extension never sees one.",action:{label:"Open CircleCI tokens",onClick:()=>ze("https://app.circleci.com/settings/user/tokens")}})}function Fi(){let e=n.trigger;if(!e)return nr();let o=f("div",{className:"detail-head"}),t=f("div",{className:"row"}),r=f("div");if(q(r,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:()=>{n.trigger=null,I()}}),t.append(r),t.append(f("span",{className:"spacer"})),o.append(t),o.append(f("div",{className:"detail-title"},"Run a pipeline")),o.append(f("div",{className:"detail-sub"},"Fire a new run on a branch or tag. The pipeline definition picks which config to build.")),v?.append(o),e.loading){v?.append(Me("Loading pipelines"));return}let s=f("div",{className:"section"});if(n.pipelines.length>1){let p=f("div"),E=null;E=ts(p,{label:"Pipeline",value:e.pipelineId,options:n.pipelines.map(m=>({id:m.id,label:m.name,hint:m.configPath})),onChange:m=>{n.trigger&&(n.trigger={...n.trigger,pipelineId:m},E?.update({value:m}))}}),s.append(p)}else n.pipelines.length===1?s.append(f("p",{className:"notice"},`Pipeline: ${n.pipelines[0]?.name??""}`)):s.append(f("p",{className:"notice error-text"},"This project lists no pipeline definition to run."));let c=f("div"),a=null;a=Zn(c,{label:"Branch or tag",value:e.branch,placeholder:"main",mono:!0,onChange:p=>{n.trigger&&(n.trigger={...n.trigger,branch:p,error:null},a?.update({value:p}))}}),s.append(c),e.error&&s.append(f("p",{className:"notice error-text"},e.error));let l=f("div",{className:"detail-actions"}),u=f("div");q(u,{label:"Start run",loading:e.running,disabled:e.running||n.pipelines.length===0,onClick:()=>void Gi()}),l.append(u),s.append(l),v?.append(s)}function cs(){let e=f("div");v?.append(e),We(e,{title:"No project open",body:"Open a project in OpenChamber. This extension maps that project to a CircleCI project the first time it runs."})}function Bi(){let e=f("div",{className:"detail-head"}),o=f("div",{className:"detail-title"},"Choose a CircleCI project");if(e.append(o),e.append(f("div",{className:"detail-sub"},"This extension remembers the choice per OpenChamber project.")),n.workspace){let l=f("div");q(l,{label:"Back",variant:"ghost",size:"sm",onClick:()=>{n.picker=!1,n.override=null,I(),we({more:!1})}}),e.append(l)}if(v?.append(e),n.pickerError){let l=f("div");v?.append(l),Yo(l,{tone:"error",title:"CircleCI",body:n.pickerError,action:{label:"Retry",onClick:()=>void rr()}})}if(n.pickerLoading){v?.append(Me("Loading projects"));return}if(n.pickerProjects.length===0){if(n.pickerError)return;let l=f("div");v?.append(l),We(l,{title:"No projects",body:"This token is not a member of any CircleCI organization with projects, or the token cannot list them."});return}let t=f("div");v?.append(t);let r=f("div",{className:"scroll"});v?.append(r);let s=()=>Wi(),c=Qo(r,{items:s(),ariaLabel:"CircleCI projects",onSelect:l=>{let u=n.pickerProjects.find(p=>p.id===l);u&&ji(u)}}),a=null;a=es(t,{value:n.pickerFilter,label:"Filter projects",placeholder:"Filter by organization or repository",onChange:l=>{n.pickerFilter=l,a?.update({value:l}),c.update({items:s()})}})}function Wi(){let e=n.pickerFilter.trim().toLowerCase();return n.pickerProjects.filter(o=>e?`${o.orgName}/${o.name}`.toLowerCase().includes(e):!0).map(o=>({id:o.id,leading:o.orgName?`${o.orgName}/`:"",title:o.name}))}function Ki(){let e=Ee(),o=f("div",{className:"row"}),t=f("div",{style:"flex:1; min-width:0;"}),r=e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",s=[{id:"refresh",label:"Refresh"},{id:"trigger",label:"Run a pipeline\u2026"},{id:"choose",label:"Change project\u2026"}];n.override&&s.push({id:"revert",label:"Back to this repository's project"}),s.push({separator:!0},n.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"},{separator:!0},{id:"disconnect",label:"Disconnect CircleCI",destructive:!0}),Ut(t,{label:r,size:"sm",variant:"ghost",items:s,onSelect:p=>void Hi(p)}),o.append(t),n.account&&o.append(f("span",{className:"account muted",text:n.account})),v?.append(o);let c=f("div",{className:"toolbar"}),a=f("div"),l=os(a,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:n.filter,onChange:p=>{n.filter=yn(p),l.update({activeId:n.filter}),or?.paint()}});c.append(a),c.append(f("span",{className:"spacer"}));let u=f("div");return q(u,{label:"Refresh",size:"sm",variant:"ghost",loading:n.loading,onClick:()=>void Gt()}),c.append(u),v?.append(c),{bar:c,tabs:l}}var ls="To remove the token, open Settings \u2192 Integrations and clear the CircleCI card.";async function zi(){try{await Z.oauthDisconnect(),n.disconnectNotice=`Disconnect requested. ${ls}`}catch(e){n.disconnectNotice=`${J(e)} ${ls}`}I()}function Ji(){n.workspace=null,n.override=null,n.runs=[],n.runsNext=null,n.selectedRun=null,n.workflows=[],n.selectedWorkflow=null,n.jobs=[],n.selectedJob=null,n.jobDetail=null,n.jobOutput=null,n.pipelines=[],n.trigger=null,n.picker=!1,n.pickerProjects=[],n.pickerFilter="",n.toast=null,n.error=null,n.disconnectNotice=null}function Ht(){if(n.disconnectNotice&&v?.append(f("p",{className:"notice"},n.disconnectNotice)),n.error){let e=f("div");v?.append(e),Yo(e,{tone:"error",title:"CircleCI",body:n.error,action:{label:"Retry",onClick:()=>void Gt()}})}n.toast&&v?.append(f("p",{className:"notice"},n.toast))}function qi(){return In(n.runs,n.filter)}function ds(){return qi().map(e=>{let o=ae(e.phase,e.outcome);return{id:e.id,leading:`#${e.number}`,title:Ne(e),...e.commitSubject?{subtitle:e.commitSubject}:{},meta:pt(e.createdAt),badge:{label:o.label,tone:o.tone}}})}function us(){return n.runs.length===0?"No runs yet. Push a commit, or start one from the project menu.":"No run matches this filter."}function nr(){let{tabs:e}=Ki();if(Ht(),n.loading&&n.runs.length===0){v?.append(Me("Loading runs"));return}let o=f("div",{className:"scroll"});v?.append(o);let t=Qo(o,{items:ds(),emptyText:us(),ariaLabel:"CircleCI runs",onSelect:r=>{let s=n.runs.find(c=>c.id===r);s&&Es(s)}});if(or={tabs:e,list:t,paint:()=>t.update({items:ds(),emptyText:us()})},n.runsNext){let r=f("div",{className:"load-more"});q(r,{label:"Load more runs",size:"sm",variant:"ghost",onClick:()=>void we({more:!0})}),v?.append(r)}}function Qi(e){let o=Ee(),t=f("div",{className:"detail-head"}),r=f("div",{className:"row"}),s=f("div");q(s,{label:"\u2190 Runs",variant:"ghost",size:"sm",onClick:vi}),r.append(s),r.append(f("span",{className:"spacer"})),r.append(Ke(e.phase,e.outcome)),t.append(r),t.append(f("div",{className:"detail-title"},`#${e.number} ${Ne(e)}`));let c=[];e.revision&&c.push(He(e.revision)),e.commitSubject&&c.push(e.commitSubject),e.pipelineName&&c.push(e.pipelineName),c.push(pt(e.createdAt)),t.append(f("div",{className:"detail-sub"},c.filter(Boolean).join(" \xB7 "))),e.errors.length>0&&t.append(Pt(e.errors.map(E=>`${E.type}: ${E.message}`).join(" \xB7 "),"notice error-text"));let a=f("div",{className:"detail-actions"}),l=f("div");Ut(l,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every workflow"}],onSelect:E=>void Mi(E==="failed")}),a.append(l);let u=f("div");q(u,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>ze(o?tt(o.target,e.number):null)}),a.append(u);let p=f("div");return q(p,{label:"Attach",size:"sm",variant:"outline",onClick:()=>void Lt(Le({workflow:null,job:null}))}),a.append(p),t.append(a),t}function Ts(e){let o=f("div",{className:"job-row"}),t=f("div",{className:"job-row-head"}),r=f("button",{className:"job-row-name",text:e.name,title:e.name,style:"background:none;border:0;padding:0;color:inherit;font:inherit;text-align:left;cursor:pointer;"});if(r.addEventListener("click",e.onOpen),t.append(r),e.meta&&t.append(f("span",{className:"job-row-meta",text:e.meta})),t.append(Ke(e.phase,e.outcome)),o.append(t),e.actions.length>0){let s=f("div",{className:"job-row-actions"});for(let c of e.actions){let a=f("div");q(a,{label:c.label,size:c.size??"xs",variant:c.variant??"ghost",onClick:c.onClick}),s.append(a)}o.append(s)}return o}function hs(){let e=n.selectedRun;if(!e)return nr();if(v?.append(Qi(e)),Ht(),n.loading&&n.workflows.length===0){v?.append(Me("Loading workflows"));return}if(n.workflows.length===0){let t=f("div");v?.append(t),We(t,{title:"No workflows",body:"This run produced no workflows. A configuration error is shown above when CircleCI reported one."});return}let o=f("div",{className:"scroll"});v?.append(o);for(let t of n.workflows){let r=ae(t.phase,t.outcome),s=[{label:"Jobs",onClick:()=>void er(t),variant:"outline"},{label:"Rerun failed",onClick:()=>void ms(t,!0)}];r.active&&s.push({label:"Cancel",onClick:()=>void Ss(t),variant:"ghost"}),s.push({label:"Open",onClick:()=>{let c=Ee();c&&ze(ot(c.target,e.number,t.id))}}),o.append(Ts({name:t.name,meta:Ge(t.createdAt,t.endedAt),phase:t.phase,outcome:t.outcome,onOpen:()=>void er(t),actions:s}))}}function gs(){let e=n.selectedWorkflow,o=n.selectedRun;if(!e||!o)return hs();let t=f("div",{className:"detail-head"}),r=f("div",{className:"row"}),s=f("div");q(s,{label:"\u2190 Workflows",variant:"ghost",size:"sm",onClick:Ni}),r.append(s),r.append(f("span",{className:"spacer"})),r.append(Ke(e.phase,e.outcome)),t.append(r),t.append(f("div",{className:"detail-title"},e.name)),t.append(f("div",{className:"detail-sub"},`Run #${o.number} \xB7 ${Ge(e.createdAt,e.endedAt)||"no duration"}`));let c=f("div",{className:"detail-actions"}),a=f("div");if(Ut(a,{label:"Rerun",size:"sm",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:p=>void ms(e,p==="failed")}),c.append(a),ae(e.phase,e.outcome).active){let p=f("div");q(p,{label:"Cancel",size:"sm",variant:"ghost",onClick:()=>void Ss(e)}),c.append(p)}let l=f("div");if(q(l,{label:"Attach workflow",size:"sm",variant:"outline",onClick:()=>void Lt(Le({workflow:e,job:null}))}),c.append(l),t.append(c),v?.append(t),Ht(),n.loading&&n.jobs.length===0){v?.append(Me("Loading jobs"));return}if(n.jobs.length===0){let p=f("div");v?.append(p),We(p,{title:"No jobs",body:"This workflow lists no jobs yet."});return}let u=f("div",{className:"scroll"});v?.append(u);for(let p of n.jobs){let E=p.type.toLowerCase()==="approval",m=ae(p.phase,p.outcome),S=[];E&&m.active&&(S.push({label:"Approve",onClick:()=>void as(p,!0),variant:"default"}),S.push({label:"Reject",onClick:()=>void as(p,!1),variant:"ghost"})),S.push({label:"Details",onClick:()=>void tr(p),variant:"outline"}),ue(p.outcome)&&(S.push({label:"Attach failure",onClick:()=>void Lt(Le({workflow:e,job:p,detail:null,output:null}))}),S.push({label:"Fix with agent",onClick:()=>void _s(Le({workflow:e,job:p,detail:null,output:null}))})),u.append(Ts({name:p.name,meta:[p.number>0?`#${p.number}`:"",Ge(p.startedAt,p.endedAt)].filter(Boolean).join(" \xB7 "),phase:p.phase,outcome:p.outcome,onOpen:()=>void tr(p),actions:S}))}}function Yi(){let e=n.selectedJob,o=n.selectedWorkflow,t=n.selectedRun;if(!e)return gs();let r=f("div",{className:"detail-head"}),s=f("div",{className:"row"}),c=f("div");q(c,{label:"\u2190 Jobs",variant:"ghost",size:"sm",onClick:Ui}),s.append(c),s.append(f("span",{className:"spacer"})),s.append(Ke(e.phase,e.outcome)),r.append(s),r.append(f("div",{className:"detail-title"},e.name)),r.append(f("div",{className:"detail-sub"},[`#${e.number}`,e.type,Ge(e.startedAt,e.endedAt)].filter(Boolean).join(" \xB7 ")));let a=f("div",{className:"detail-actions"}),l=f("div");q(l,{label:"Attach to chat",size:"sm",variant:"outline",onClick:()=>void Lt(Le({workflow:o,job:e}))}),a.append(l);let u=f("div");q(u,{label:"Start a chat",size:"sm",onClick:()=>void _s(Le({workflow:o,job:e}))}),a.append(u);let p=f("div");q(p,{label:"Send to current chat",size:"sm",variant:"ghost",onClick:()=>void Pi(Le({workflow:o,job:e}))}),a.append(p);let E=Ee(),m=f("div");q(m,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>{E&&o&&ze(ft(E.target,t?.number??0,o.id,e.number))}}),a.append(m),r.append(a),v?.append(r),Ht();let S=f("div",{className:"scroll"});if(v?.append(S),n.loading&&!n.jobDetail){S.append(Me("Loading job"));return}let g=n.jobDetail;if(!g)return;let U=f("div",{className:"meta-grid"}),F=[Fe("Job",`#${g.number}`),Fe("Type",g.type),Fe("Started",g.startedAt?pt(g.startedAt):null),Fe("Duration",Ge(g.startedAt,g.endedAt)||null),Fe("Executions",g.steps.length>0?`${g.parallelExecutions} parallel`:null)];for(let N of F)N&&U.append(N);if(U.childElementCount>0&&S.append(U),g.errors.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Errors"));for(let O of g.errors)N.append(Pt(`${O.type}: ${O.message}`,"notice error-text"));S.append(N)}if(g.warnings.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Warnings"));for(let O of g.warnings)N.append(Pt(`${O.type}: ${O.message}`,"notice"));S.append(N)}if(g.steps.length>0){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Steps"));for(let O of g.steps){let K=f("div",{className:"job-row"}),Y=f("div",{className:"job-row-head"});Y.append(f("span",{className:"job-row-name"},`${O.num}. ${O.name}`)),O.exitCode!==null&&O.exitCode!==0&&Y.append(f("span",{className:"job-row-meta"},`exit ${O.exitCode}`)),Y.append(Ke(O.phase,O.outcome)),K.append(Y),O.command&&K.append(f("pre",{className:"output",style:"max-height:120px;"},O.command)),N.append(K)}S.append(N)}if(n.jobOutput){let N=f("div",{className:"section"});N.append(f("div",{className:"section-title"},"Condensed output")),N.append(f("pre",{className:"output"},n.jobOutput)),S.append(N)}else ue(g.outcome)&&S.append(f("p",{className:"notice"},"CircleCI returned no condensed output for this job. The steps above and the errors are still attached with the chip."))}function Zi(e){n.ready=e,n.booted=!0,n.connected=e.connection.connected,n.account=e.connection.account||"CircleCI",ps()}Z.onReady(e=>{rs(e),Cn(),n.ready=e,n.booted||Zi(e)});Z.onConnection(e=>{let o=n.connected;if(n.connected=e.connected,e.account&&(n.account=e.account),e.connected&&!o){ps();return}!e.connected&&o&&(Ji(),I())});Z.onItem(e=>{if(!e||!("providerId"in e))return;let o=Pr(e.data);o&&ea(o)});async function ea(e){let o=Ee();o&&o.link.projectId!==e.projectId&&(n.pipelines=[],n.override={directory:n.directory??"",repo:null,target:{segment:"github",owner:e.orgName||"project",repo:e.projectName},link:{projectId:e.projectId,projectName:e.projectName,orgName:e.orgName,slug:null,source:"picked",directory:n.directory??""}},I());try{let t=await Q.getRun(e.runId);await Es(t);let r=e.workflowId?n.workflows.find(s=>s.id===e.workflowId):void 0;if(r){await er(r);let s=e.jobId?n.jobs.find(c=>c.id===e.jobId):void 0;s&&await tr(s)}}catch(t){n.error=J(t),I()}}})();
