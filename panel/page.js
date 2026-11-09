"use strict";(()=>{var Ee=class extends Error{status;code;constructor(t,o,r){super(r),this.name="CircleCIError",this.status=t,this.code=o}},Un="/api/v3",Rt=20,Ot=20,Wo=50,Nn=50,qe=4,zo=[1e3,2500],g=e=>typeof e=="object"&&e!==null?e:{},Se=e=>Array.isArray(e)?e:[],f=e=>typeof e=="string"&&e.length>0?e:null,Ge=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function Yo(e){return Se(e).map(t=>{let o=g(t);return{type:f(o.type)??"unknown",message:f(o.message)??""}})}function Zo(e){return Se(e).map(t=>{let o=g(t);return{type:f(o.type)??"unknown",message:f(o.message)??"",description:f(o.description),url:f(o.url)}})}function Qe(e){let t=g(e),o=g(t.attributes),r=g(t.references),s=g(r.event),l=g(s.attributes),i=g(l.vcs),c=g(i.commit),d=g(r.pipeline),u=g(r.trigger),E=g(u.attributes);return{id:f(t.id)??"",number:Ge(o.number)??0,phase:f(o.phase)??"unknown",outcome:f(o.current_outcome),createdAt:f(o.created_at)??"",branch:f(i.branch),tag:f(i.tag),revision:f(i.revision),commitSubject:f(c.subject),commitUrl:f(c.url),pipelineName:f(g(d.attributes).name),trigger:f(E.name)??f(g(E.event_source).type)??f(l.type),errors:Yo(o.errors),warnings:Zo(o.warnings)}}function Mn(e){let t=g(e),o=g(t.attributes),r=g(o.auto_rerun);return{id:f(t.id)??"",name:f(o.name)??"Workflow",phase:f(o.phase)??"unknown",outcome:f(o.current_outcome)??f(o.outcome),createdAt:f(o.created_at),endedAt:f(o.ended_at),tag:f(o.tag),autoRerunNumber:Ge(r.number)}}function xt(e){let t=g(e),o=g(t.attributes);return{id:f(t.id)??"",name:f(o.name)??"Job",number:Ge(o.number)??0,type:f(o.type)??"build",phase:f(o.phase)??"unknown",outcome:f(o.outcome),startedAt:f(o.started_at),endedAt:f(o.ended_at)}}function Pn(e){let t=g(e);return{num:Ge(t.num)??0,name:f(t.name)??"Step",type:f(t.type)??"run",phase:f(t.phase)??"unknown",outcome:f(t.outcome),exitCode:Ge(t.exit_code),command:f(t.command),startedAt:f(t.started_at),endedAt:f(t.ended_at)}}function Ln(e){let t=xt(e),o=g(g(e).attributes),r=Se(o.parallel_executions).map(g),s=r.length>0?Se(r[0]?.steps).map(Pn):[];return{...t,errors:Yo(o.errors),warnings:Zo(o.warnings),steps:s,parallelExecutions:r.length}}function Jo(e){let t=g(e),o=g(t.attributes),r=g(g(t.references).org);return{id:f(t.id)??"",name:f(o.name)??"Project",orgId:f(r.id)??"",orgName:f(g(r.attributes).name)??""}}function Dn(e){let t=g(e),o=g(t.attributes);return{id:f(t.id)??"",name:f(o.name)??"Organization",vcsProvider:f(g(o.vcs).provider)}}function qo(e){let t=g(e),o=g(t.attributes),r=g(o.config);return{id:f(t.id)??"",name:f(o.name)??"Pipeline",configPath:f(r.file_path)??""}}function Gn(e){let t=g(e),o=g(t.attributes);return{id:f(t.id)??"",login:f(o.login)??"CircleCI account",name:f(o.name),avatarUrl:f(o.avatar_url)}}function Hn(e){if(!e)return;let t={};for(let[o,r]of Object.entries(e))r==null||r===""||(t[o]=String(r));return Object.keys(t).length>0?t:void 0}function Qo(e){if(e)try{return JSON.parse(e)}catch{return}}function $n(e){return e===401?"CircleCI refused the token. Replace it in Settings \u2192 Integrations.":e===403?"This token cannot see that resource.":e===404?"CircleCI could not find that resource.":e===429?"CircleCI is rate limiting this token. Try again shortly.":e>=500?"CircleCI answered with a server error.":`CircleCI answered ${e}.`}function Vn(e,t,o){let r=g(g(t).error),s=f(r.detail)??f(r.title)??f(r.type)??$n(e);return new Ee(e,f(r.type)??`HTTP_${e}`,s)}function Xn(e,t){return t!=="GET"?!1:e===429||e===502||e===503||e===504}function Fn(e){return new Promise(t=>setTimeout(t,e))}function er(e){async function t(i,c){let d=Hn(i.query),u=0;for(;;){let E=await e({method:i.method,path:Un+i.path,...d?{query:d}:{},...i.body===void 0?{}:{body:JSON.stringify(i.body)}});if(E.status>=400){if(Xn(E.status,i.method)&&u<zo.length){await Fn(zo[u]??2500),u+=1;continue}throw Vn(E.status,Qo(E.body),E.body)}return c(E.body)}}let o=i=>t(i,Qo),r=i=>t(i,c=>c);async function s(i,c,d,u,E){let _=E?{...c,"page[cursor]":E}:{...c,"page[limit]":d},S;try{S=await o({method:"GET",path:i,query:_})}catch(y){if(!E&&y instanceof Ee&&y.status===400)S=await o({method:"GET",path:i,query:{...c}});else throw y}return{items:Se(g(S).data).map(u),next:f(g(g(S).page).next)}}async function l(i,c,d,u,E){let _=[],S,y=null;for(let L=0;L<E;L+=1){let X=await s(i,c,d,u,S);if(_.push(...X.items),y=X.next,!y)break;S=y}return{items:_,next:y}}return{currentUser:async()=>{let i=await o({method:"GET",path:"/users",query:{"filter[user_id]":"me"}}),c=Se(g(i).data)[0];if(!c)throw new Ee(200,"EMPTY_USER","CircleCI returned no user.");return Gn(c)},listOrgs:async()=>(await l("/orgs",{},Wo,Dn,qe)).items,findProjectBySlug:async i=>{let c=await o({method:"GET",path:"/projects",query:{"filter[slug]":i}}),d=Se(g(c).data)[0];return d?Jo(d):null},listProjectsOfOrg:i=>l("/projects",{"filter[org_id]":i},Wo,Jo,qe),listPipelines:async i=>{let c=await l("/pipelines",{"filter[project_id]":i},Nn,qo,1),d=[];for(let u of c.items)if(u.id)try{let E=await o({method:"GET",path:`/pipelines/${encodeURIComponent(u.id)}`,query:{"filter[project_id]":i}});d.push(qo(g(E).data))}catch{d.push({...u,name:"Pipeline config"})}return d},listRuns:(i,c)=>s("/runs",{"filter[project_id]":i},Rt,Qe,c),listMyRuns:i=>s("/runs",{"filter[user_id]":"me"},Rt,Qe,i),getRun:async i=>{let c=await o({method:"GET",path:`/runs/${encodeURIComponent(i)}`});return Qe(g(c).data)},findRunByNumber:async(i,c)=>{let d;for(let u=0;u<qe;u+=1){let E=await s("/runs",{"filter[project_id]":i},Rt,Qe,d),_=E.items.find(S=>S.number===c);if(_)return _;if(!E.next)return null;d=E.next}return null},fireRun:async i=>{let c=await o({method:"POST",path:"/runs",query:{"filter[project_id]":i.projectId},body:{data:{attributes:{checkout:{branch:i.branch}},references:{pipeline:{id:i.pipelineId}}}}}),d=f(g(g(c).data).id);if(!d)throw new Ee(201,"NO_RUN_ID","CircleCI accepted the run but returned no id.");return d},listWorkflows:(i,c)=>s("/workflows",{"filter[run_id]":i},Ot,Mn,c),listJobs:(i,c)=>c?s("/jobs",{"filter[workflow_id]":i},Ot,xt,c):l("/jobs",{"filter[workflow_id]":i},Ot,xt,qe),getJob:async i=>{let c=await o({method:"GET",path:`/jobs/${encodeURIComponent(i)}`});return Ln(g(c).data)},condensedOutput:async(i,c,d=0)=>r({method:"GET",path:`/jobs/${encodeURIComponent(i)}/stdout/condensed`,query:{"filter[execution]":d,"filter[step_num]":c}}).then(u=>typeof u=="string"?u:""),rerunWorkflow:async(i,c)=>{let d=await o({method:"POST",path:`/workflows/${encodeURIComponent(i)}/rerun`,body:c?{is_from_failed:!0}:void 0});return f(g(g(d).data).id)??""},cancelWorkflow:async i=>{await o({method:"POST",path:`/workflows/${encodeURIComponent(i)}/cancel`})},approve:async i=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(i)}/approve`})},reject:async i=>{await o({method:"POST",path:`/approvals/${encodeURIComponent(i)}/reject`})}}}var tr=new Set(["succeeded","success","failed","failing","errored","error","canceled","cancelled","not_run","not_running","unauthorized","timedout","timed_out","infrastructure_fail","retried"]),jn={succeeded:"Success",success:"Success",failed:"Failed",failing:"Failing",errored:"Errored",error:"Errored",canceled:"Canceled",cancelled:"Canceled",not_run:"Not run",not_running:"Not running",unauthorized:"Unauthorized",on_hold:"On hold",blocked:"Blocked",waiting:"Waiting",timedout:"Timed out",timed_out:"Timed out",infrastructure_fail:"Infrastructure fail",retried:"Retried",queued:"Queued",running:"Running",started:"Running",pending:"Pending",ended:"Finished"};function or(e){return["succeeded","success"].includes(e)?"success":["failed","failing","errored","error","timedout","timed_out","infrastructure_fail","unauthorized"].includes(e)?"error":["queued","running","started","pending"].includes(e)?"info":["on_hold","blocked","waiting"].includes(e)?"warning":["canceled","cancelled","not_run","not_running","retried","ended"].includes(e)?"neutral":null}function Bn(e){if(!e)return"Unknown";let t=e.replace(/_/g," ").trim();return t.charAt(0).toUpperCase()+t.slice(1)}function te(e,t){let o=(t??"").toLowerCase(),r=(e??"").toLowerCase(),s=o||r,l=or(o)??or(r)??"neutral",i=o?!tr.has(o):!tr.has(r)&&r!=="ended";return{label:jn[s]??Bn(s),tone:l,active:i}}function ke(e){let t=(e??"").toLowerCase();return["failed","failing","errored","error","timedout","timed_out","infrastructure_fail"].includes(t)}function At(e,t,o=Date.now()){if(!e)return"";let r=Date.parse(e);if(!Number.isFinite(r))return"";let s=t?Date.parse(t):o;if(!Number.isFinite(s)||s<r)return"";let l=Math.round((s-r)/1e3);if(l<60)return`${l}s`;let i=Math.floor(l/60),c=l%60;if(i<60)return c>0?`${i}m ${c}s`:`${i}m`;let d=Math.floor(i/60),u=i%60;return u>0?`${d}h ${u}m`:`${d}h`}function bt(e,t=Date.now()){if(!e)return"";let o=Date.parse(e);if(!Number.isFinite(o))return"";let r=Math.round((t-o)/1e3);if(r<45)return"just now";let s=Math.round(r/60);if(s<60)return`${s}m ago`;let l=Math.round(s/60);if(l<24)return`${l}h ago`;let i=Math.round(l/24);return i<7?`${i}d ago`:new Date(o).toLocaleDateString(void 0,{month:"short",day:"numeric"})}function Ye(e){return e?e.slice(0,8):""}function Ie(e){return e.branch??e.tag??"detached"}var I="openchamber.sdk";var Ze="data-oc-scrolling",kt=`
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
:hover, [${Ze}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${Ze}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${Ze}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${Ze}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;function It(e){let t=e.documentElement;if(t.hasAttribute("data-oc-scrollbar-activity"))return;t.setAttribute("data-oc-scrollbar-activity","");let o=new WeakMap;e.addEventListener("scroll",r=>{let s=r.target===e?t:r.target;if(!(s instanceof Element))return;s.hasAttribute("data-oc-scrolling")||s.setAttribute("data-oc-scrolling","");let l=o.get(s);l!==void 0&&clearTimeout(l),o.set(s,setTimeout(()=>{o.delete(s),s.removeAttribute("data-oc-scrolling")},1e3))},{capture:!0,passive:!0})}var Kn=`(${It.toString()})(document);`;var ir=/^[a-z][a-z0-9-]{0,39}$/;var rr=e=>Object(e)===e&&!Array.isArray(e),yt=(e,t)=>Object.keys(e).every(o=>t.includes(o)),nr=e=>String(e)===e&&e.length>=1&&e.length<=60,sr=e=>String(e)===e&&e.length>=1&&e.length<=80,ar=e=>{if(!Array.isArray(e)||e.length>4)return!1;let t=new Set;for(let o of e){if(!rr(o)||!ir.test(o.id)||!nr(o.label)||o.disabled!==void 0&&o.disabled!==!0&&o.disabled!==!1||t.has(o.id))return!1;if(t.add(o.id),o.kind==="button"){if(!yt(o,["kind","id","label","disabled"]))return!1;continue}if(o.kind!=="select"||!yt(o,["kind","id","label","value","options","disabled"])||!sr(o.value)||!Array.isArray(o.options)||o.options.length<1||o.options.length>16)return!1;let r=new Set;for(let s of o.options){if(!rr(s)||!yt(s,["value","label"])||!sr(s.value)||!nr(s.label)||r.has(s.value))return!1;r.add(s.value)}if(!r.has(o.value))return!1}return!0};var cr=["{id}","{segment}","{segments+}"];var Ei=new Set(cr);var lr=["turn-finished","turn-failed","permission-asked","question-asked","turn-started","session-created","session-archived","session-deleted"];var _i=new Set(lr);var Ct=e=>"bytes"in e?e.bytes.byteLength:e.content.length,dr=(e,t)=>{if(e.path!==t.path||e.readOnly!==t.readOnly)return!1;if(e.encoding==="text"||t.encoding==="text")return e.encoding==="text"&&t.encoding==="text"&&e.content===t.content;if(e.bytes.byteLength!==t.bytes.byteLength)return!1;for(let o=0;o<e.bytes.byteLength;o+=1)if(e.bytes[o]!==t.bytes[o])return!1;return!0};var ur=/^[A-Za-z0-9_-]{1,80}$/;var pr=["left","right","top","bottom"];var Er=(e,t=0,o={remaining:16e3})=>{if(--o.remaining<0||t>=32)return!1;if(e===null)return!0;let r=Array.isArray(e)?e:Object(e)===e?Object.values(e):[];for(let s of r)if(!Er(s,t+1,o))return!1;return!0},wt=e=>{if(e===null||e===!0||e===!1)return!0;if(Array.isArray(e))return Object.keys(e).every(t=>/^(0|[1-9]\d*)$/.test(t)&&Number(t)<e.length)&&e.every(wt);if(Object(e)===e){let t=Object.getPrototypeOf(e);return(t===null||t===Object.prototype)&&Object.values(e).every(wt)}return String(e)===e||Number.isFinite(e)},vt=e=>{try{return String(e.id)!==e.id||!ur.test(e.id)||!Number.isFinite(e.anchor.x)||Math.abs(e.anchor.x)>1e5||!Number.isFinite(e.anchor.y)||Math.abs(e.anchor.y)>1e5||!Number.isFinite(e.anchor.width)||!Number.isFinite(e.anchor.height)||e.anchor.width<=0||e.anchor.height<=0||e.anchor.width>1e5||e.anchor.height>1e5||!Number.isInteger(e.width)||e.width<160||e.width>640||!Number.isInteger(e.height)||e.height<48||e.height>480||e.side!==void 0&&!pr.includes(e.side)||e.focus!==void 0&&e.focus!==!0&&e.focus!==!1||!Er(e.data)||!wt(e.data)?!1:JSON.stringify(e.data).length<=16e3}catch{return!1}};var Nt=2e3;var _r=["file","directory","other","missing"],Mt=e=>!!(e&&"sessionId"in e),Pt=e=>!!(e&&"sent"in e&&!("sessionId"in e));var mr=/^[0-9a-f]{7,64}$/i,Lt=e=>mr.test(e),et=500,tt=32e3,Sr=16e3,Tr=128,hr=200,gr=2e3,Rr=16e3,Or=80,xr=200,Ar=16e3;var br=2e3;var Dt=2e4,ot=1024,rt=2e6;var nt=64e3,st=8e3,Gt=4e3;var Ht=96e4,zn=60*6e4;var kr=999,Ir=1e4,He=500,yr=["HOST_UNAVAILABLE","HOST_TIMEOUT","HOST_REJECTED","DISCONNECTED","DISABLED","BAD_PATH","NO_INTEGRATION","NO_SERVICE","SERVICE_FAILED","REQUEST_FAILED","RESPONSE_TOO_LARGE","NO_SESSION","SESSION_BUSY","NOT_GRANTED","NO_DIRECTORY","NOT_FOUND","FILE_TOO_LARGE","DENIED","NO_MODEL","MODEL_FAILED","UNSUPPORTED"],Cr=["stopped","starting","ready","failed"],Jn=new Set(yr),wr=e=>Jn.has(e),vr=e=>e&&wr(e)?e:"HOST_REJECTED",ye=e=>e===void 0?!1:e===null||e===!0||e===!1||String(e)===e?!0:Number(e)===e?Number.isFinite(e):Array.isArray(e)?e.every(ye):Object(e)===e?Object.values(e).every(ye):!1,Ur=e=>ye(e)&&JSON.stringify(e).length<=Ar,fr=e=>e?.trim().slice(0,xr)??"",Ce=e=>{let t=e.id.trim().slice(0,Tr),o=e.title.trim().slice(0,hr),r=e.url.trim().slice(0,gr),s=e.text?.trim().slice(0,Rr),l=e.author?.trim().slice(0,Or),i=e.kind==="pull"?"pull":"issue",c={providerId:e.providerId.trim(),id:t,title:o||t,url:r,kind:i};if(s&&(c.text=s),l&&(c.author=l),i==="pull"){let d=fr(e.branches?.head),u=fr(e.branches?.base);d&&u&&(c.branches={head:d,base:u})}return Ur(e.data)&&(c.data=e.data),c},$t=e=>{let t=Ce(e);return e.projectId&&(t.projectId=e.projectId),e.navigation&&(t.navigation=e.navigation),e.worktree&&(t.worktree=e.worktree),t},Vt=e=>{let t={text:e.text.trim().slice(0,Sr)};return e.send&&(t.send=!0),t},Xt=e=>e===null||!Number.isFinite(e)?null:Math.min(kr,Math.max(0,Math.round(e))),Ft=e=>Number.isFinite(e)?Math.min(Ir,Math.max(0,Math.ceil(e))):0;var we=e=>e.length>0&&e.length<=ot&&!e.includes("\0")&&!e.includes("\\");var it=e=>!e.startsWith("/")||e.includes("\0")||e.includes("\\")||e.includes("://")||e.length>br?!1:!e.split("/").some(o=>o==="."||o===".."),qn=new Set(Cr),jt=e=>!!(e&&"status"in e&&qn.has(String(e.status))&&!("body"in e)),at=e=>!!(e&&"status"in e&&"body"in e&&Number.isInteger(e.status)),Bt=e=>!!(e&&"content"in e&&String(e.content)===e.content),Kt=e=>!!(e&&"written"in e&&e.written===!0),Wt=e=>!!(e&&"entries"in e&&Array.isArray(e.entries)),Qn=new Set(_r),zt=e=>!!(e&&"kind"in e&&"size"in e&&Qn.has(String(e.kind))&&Number.isFinite(e.size)),Jt=e=>!!(e&&"text"in e&&String(e.text)===e.text&&!("status"in e)),Yn=new Set(["workspace","shells","ready","directory","session","connection","settings","session-lifecycle","item","resolve","action","service-event","status-control-event","popover-closed","file-open","file-snapshot","file-saved","generate-late"]),Zn=e=>Object(e)===e?e:null,Ut=e=>String(e)===e&&e.length>0,es=e=>{if(!Ut(e.id))return null;if(e.ok===!0){let t={channel:I,v:1,type:"result",id:e.id,ok:!0};return Object(e.payload)===e.payload&&(t.payload=e.payload),t}return e.ok===!1&&Ut(e.error)?{channel:I,v:1,type:"result",id:e.id,ok:!1,error:e.error,code:vr(Ut(e.code)?e.code:void 0)}:null},qt=e=>{let t=Zn(e);return!t||t.channel!==I||t.v!==1?null:t.type==="result"?es(t):!Yn.has(String(t.type))||Object(t.payload)!==t.payload?null:t};var Nr=e=>"key"in e&&"metaKey"in e&&"ctrlKey"in e,ts=e=>(e.metaKey||e.ctrlKey)&&!e.altKey&&!e.shiftKey&&e.key.toLowerCase()==="s",T=class extends Error{code;constructor(t,o){super(o),this.name="HostRequestError",this.code=t}},Mr=()=>Promise.reject(new T("BAD_PATH",'Request path must start with "/" and stay on the declared origin.')),ct=()=>Promise.reject(new T("BAD_PATH",`File path must be 1 to ${ot} characters without NUL or backslash.`)),lt=e=>{if(e!==void 0){if(Object(e)!==e||Array.isArray(e)||e.scope!==void 0&&e.scope!=="instance"&&e.scope!=="device")throw new T("HOST_REJECTED",'Storage scope must be "instance" or "device".');return e.scope==="device"?"device":void 0}},b=e=>(e.value+=1,`oc-${e.value}`),to=(e={})=>{let t=e.target??("window"in globalThis?window:null);if(!t)throw new T("HOST_UNAVAILABLE","No window. connectHost runs in a browser frame.");let o=e.acceptSource??(n=>n===t.parent),r=e.requestTimeoutMs??Dt,s=new Set,l=new Set,i=new Set,c=new Set,d=new Set,u=new Set,E=new Set,_=new Set,S=new Set,y=new Set,L=new Set,X=new Set,q=[],k=null,Z=null,Be=new Set,Ke=new Set,Me=null,Pe=null,St=!1,xe=new Map,Ae=new Map,be=new Map,ne=!1,A={value:0},R=null,ae=null,Le=!1,De=!1,Po=null,Lo=n=>n?{sessionId:n.id,phase:n.busy?"started":"completed"}:null,W=n=>{t.parent.postMessage(n,"*")},Do=()=>{ne||t.parent===t||X.size===0||R?.features?.lateGenerateResults!==!0||W({channel:I,v:1,type:"generate-late-listen"})},P=(n,a)=>{for(let m of n)try{m(a)}catch(h){console.error(h)}},Go=n=>{if(!(n instanceof MessageEvent)||!o(n.source))return;let a=qt(n.data);if(!a)return;if(a.type==="workspace"){let h=Ae.get(a.payload.subscriptionId);h&&P([h],a.payload.snapshot);return}if(a.type==="shells"){let h=be.get(a.payload.subscriptionId);h&&P([h],a.payload.snapshot);return}if(a.type==="ready"){R=a.payload,ae=Lo(a.payload.session),P(s,a.payload),P(l,a.payload.directory),P(i,a.payload.session),ae&&P(c,ae),P(d,a.payload.connection),P(u,a.payload.settings),P(E,a.payload.item),a.payload.block&&P(_,a.payload.block),Do();return}if(a.type==="service-event"){P(S,a.payload);return}if(a.type==="generate-late"){X.size===0?q.push(a.payload):P(X,a.payload);return}if(a.type==="directory"){R&&(R={...R,directory:a.payload.directory}),P(l,a.payload.directory);return}if(a.type==="session"){R&&(R={...R,session:a.payload.session}),a.payload.session?ae?.sessionId!==a.payload.session.id&&(ae=Lo(a.payload.session)):ae=null,P(i,a.payload.session);return}if(a.type==="session-lifecycle"){ae=a.payload,P(c,a.payload);return}if(a.type==="connection"){R&&(R={...R,connection:a.payload.connection}),P(d,a.payload.connection);return}if(a.type==="settings"){R&&(R={...R,settings:a.payload.settings}),P(u,a.payload.settings);return}if(a.type==="item"){R&&(R={...R,item:a.payload.item}),P(E,a.payload.item);return}if(a.type==="status-control-event"){P(y,a.payload);return}if(a.type==="popover-closed"){P(L,a.payload);return}if(a.type==="action"){let h=w=>{ne||W({channel:I,v:1,type:"action-result",id:a.id,payload:w})},N=Z;if(!N){h({ok:!1,error:"This extension does not handle background actions."});return}Promise.resolve().then(()=>N(a.payload)).then(()=>h({ok:!0}),w=>{let V=(w instanceof Error?w.message:String(w)).trim();h({ok:!1,error:(V||"Action failed.").slice(0,He)})});return}if(a.type==="file-open"){let h=a.payload;if(Pe&&dr(Pe,h))return;Pe=h,P(Be,a.payload);return}if(a.type==="file-saved"){P(Ke,a.payload.version);return}if(a.type==="file-snapshot"){let h=V=>{ne||W({channel:I,v:1,type:"file-snapshot-result",id:a.id,payload:V})},N=V=>h({error:(V.trim()||"Could not read the edited file.").slice(0,He)}),w=Me;if(!w){N("This extension does not edit files.");return}Promise.resolve().then(()=>w(a.payload.purpose)).then(V=>{if(Ct(V)>2e7){N(`The file is over ${2e7} ${"bytes"in V?"bytes":"characters"}.`);return}if(V.version.length>256){N(`The snapshot version is over ${256} characters.`);return}h({snapshot:"bytes"in V?{bytes:V.bytes,version:V.version}:{content:V.content,version:V.version}})},V=>N(V instanceof Error?V.message:String(V)));return}if(a.type==="resolve"){let h=w=>{W({channel:I,v:1,type:"resolve-result",id:a.id,payload:w})},N=k;if(!N){h({error:"This extension does not resolve commands."});return}Promise.resolve().then(()=>N(a.payload)).then(w=>h({item:w?Ce(w):null}),w=>{let V=(w instanceof Error?w.message:String(w)).trim();h({error:(V||"Command failed.").slice(0,He)})});return}let m=xe.get(a.id);if(m){if(clearTimeout(m.timer),xe.delete(a.id),a.ok){m.resolve(a.payload);return}m.reject(new T(a.code,a.error))}};t.addEventListener("message",Go),W({channel:I,v:1,type:"hello"});let j=(n,a=r)=>ne||t.parent===t?Promise.reject(new T("HOST_UNAVAILABLE","No host frame. This page is not in an iframe.")):new Promise((m,h)=>{let N=setTimeout(()=>{xe.delete(n.id),h(new T("HOST_TIMEOUT","Host did not answer in time."))},a);xe.set(n.id,{resolve:m,reject:h,timer:N}),W(n)}),H=n=>j(n).then(()=>{}),$={channel:I,v:1},Tt=n=>{!ne&&t.parent!==t&&W(n)},Ho=()=>Tt({...$,type:"file-save"}),$o=n=>{!Nr(n)||!ts(n)||(n.preventDefault(),Ho())},Vo=n=>{!Nr(n)||n.key!=="Escape"||R?.surface!=="popover"||!R.popover||(n.preventDefault(),Bo(R.popover.id,"escape").catch(()=>{}))},We=()=>{let n=R?.surface==="popover"?R.popover:void 0;if(!n)return;let a=Le||De;Po!==a&&(Po=a,Ko(n.id,a).catch(()=>{}))},ze=()=>{R?.surface!=="popover"||Le||(Le=!0,We())},Xo=n=>{R?.surface!=="popover"||n.relatedTarget!==null||!Le||(Le=!1,We())},Fo=()=>{R?.surface!=="popover"||De||(De=!0,We())},jo=()=>{R?.surface!=="popover"||!De||(De=!1,We())},ee=(n,a=1024)=>{if(!n.trim()||n.length>a)throw new T("HOST_REJECTED",`Identity must contain 1 to ${a} characters.`)},ht=async n=>{n.kind!=="projects"&&ee(n.projectId);let a=await j({...$,type:"workspace-read",id:b(A),payload:n});if(!a||!("kind"in a)||!("state"in a)||a.kind!==n.kind)throw new T("HOST_REJECTED","Host did not return workspace data.");return a},gt=async(n,a)=>{n.kind!=="projects"&&ee(n.projectId);let m=b(A);Ae.set(m,a);try{await H({...$,type:"workspace-subscribe",id:b(A),payload:{subscriptionId:m,query:n}})}catch(h){throw Ae.delete(m),ne||W({...$,type:"workspace-unsubscribe",id:b(A),payload:{subscriptionId:m}}),h}return()=>{!Ae.delete(m)||ne||W({...$,type:"workspace-unsubscribe",id:b(A),payload:{subscriptionId:m}})}},vn=async(n,a)=>{n.kind==="session"&&ee(n.sessionId),n.kind==="project"&&ee(n.projectId);let m=b(A);be.set(m,a);try{await H({...$,type:"shells-subscribe",id:b(A),payload:{subscriptionId:m,scope:n}})}catch(h){throw be.delete(m),ne||W({...$,type:"shells-unsubscribe",id:b(A),payload:{subscriptionId:m}}),h}return()=>{!be.delete(m)||ne||W({...$,type:"shells-unsubscribe",id:b(A),payload:{subscriptionId:m}})}},Je=async n=>{if("key"in n&&(n.key.length===0||n.key.length>128))throw new T("HOST_REJECTED","Storage key must contain 1 to 128 characters.");if(n.op==="set"&&!ye(n.value))throw new T("HOST_REJECTED","Storage values must be JSON.");if(n.op==="set"&&new TextEncoder().encode(JSON.stringify(n.value)).length>65536)throw new T("HOST_REJECTED","Storage value exceeds 64 KiB.");if(n.scope==="device"&&R?.features?.deviceStorage!==!0)throw new T("UNSUPPORTED","This host does not support device storage.");let a=await j({...$,type:"storage",id:b(A),payload:n});if(!a||!("storage"in a)||a.op!==n.op)throw new T("HOST_REJECTED","Host did not return storage data.");return a},Bo=(n,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===n)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):H({...$,type:"popover-close",id:b(A),payload:a?{id:n,reason:a}:{id:n}}),Ko=(n,a)=>R?.features?.popovers!==!0&&!(R?.surface==="popover"&&R.popover?.id===n)?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):H({...$,type:"popover-anchor",id:b(A),payload:{id:n,active:a}});return t.addEventListener("keydown",Vo,!0),t.addEventListener("pointerover",ze),t.addEventListener("pointermove",ze),t.addEventListener("pointerout",Xo),t.addEventListener("focus",Fo),t.addEventListener("blur",jo),{onAction:n=>(Z=n,()=>{Z===n&&(Z=null)}),listProjects:async()=>{let n=await ht({kind:"projects"});if(n.kind!=="projects")throw new T("HOST_REJECTED","Expected projects.");return n},listWorktrees:async n=>{let a=await ht({kind:"worktrees",projectId:n});if(a.kind!=="worktrees")throw new T("HOST_REJECTED","Expected worktrees.");return a},listSessions:async n=>{let a=await ht({kind:"sessions",projectId:n});if(a.kind!=="sessions")throw new T("HOST_REJECTED","Expected sessions.");return a},onProjects:n=>gt({kind:"projects"},a=>{a.kind==="projects"&&n(a)}),onWorktrees:(n,a)=>gt({kind:"worktrees",projectId:n},m=>{m.kind==="worktrees"&&a(m)}),onSessions:(n,a)=>gt({kind:"sessions",projectId:n},m=>{m.kind==="sessions"&&a(m)}),onRunningShells:(n,a)=>vn(n,a),readShellOutput:async(n,a)=>{ee(n,128);let m=a?.cursor;if(m!==void 0&&(!Number.isInteger(m)||m<0))throw new T("HOST_REJECTED","Shell output cursor must be a non-negative integer.");let h=a?.tailBytes;if(h!==void 0&&(!Number.isInteger(h)||h<1||h>65536))throw new T("HOST_REJECTED",`Shell output tailBytes must be an integer between 1 and ${65536}.`);let w=await j({...$,type:"shell-output",id:b(A),payload:{shellId:n,cursor:m,tailBytes:h}});if(!w||typeof w.output!="string"||!Number.isFinite(w.cursor))throw new T("HOST_REJECTED","Host did not return shell output.");return w},stopShell:async n=>{if(ee(n,128),(await j({...$,type:"shell-stop",id:b(A),payload:{shellId:n}}))?.stopped!==!0)throw new T("HOST_REJECTED","Host did not stop the shell.");return{stopped:!0}},openSession:async n=>{ee(n),await H({...$,type:"open-session",id:b(A),payload:{sessionId:n}})},storage:{get:async(n,a)=>{let m=lt(a),h={op:"get",key:n};m&&(h.scope=m);let N=await Je(h);return N.op==="get"&&N.found?N.value:void 0},set:async(n,a,m)=>{let h=lt(m),N={op:"set",key:n,value:a};h&&(N.scope=h),await Je(N)},delete:async(n,a)=>{let m=lt(a),h={op:"delete",key:n};m&&(h.scope=m),await Je(h)},keys:async n=>{let a=lt(n),m={op:"keys"};a&&(m.scope=a);let h=await Je(m);if(h.op!=="keys")throw new T("HOST_REJECTED","Expected storage keys.");return h.keys}},onReady:n=>(s.add(n),R&&n(R),()=>{s.delete(n)}),onDirectory:n=>(l.add(n),R&&n(R.directory),()=>{l.delete(n)}),onSession:n=>(i.add(n),R&&n(R.session),()=>{i.delete(n)}),onSessionLifecycle:n=>(c.add(n),ae&&n(ae),()=>{c.delete(n)}),onConnection:n=>(d.add(n),R&&n(R.connection),()=>{d.delete(n)}),onSettings:n=>(u.add(n),R&&n(R.settings),()=>{u.delete(n)}),onItem:n=>(E.add(n),R&&n(R.item),()=>{E.delete(n)}),onBlock:n=>(_.add(n),R?.block&&n(R.block),()=>{_.delete(n)}),onServiceEvent:n=>(S.add(n),()=>{S.delete(n)}),onStatusControl:n=>(y.add(n),()=>{y.delete(n)}),onPopoverClosed:n=>(L.add(n),()=>{L.delete(n)}),setStatusControls:n=>R?.features?.statusControls!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support status controls.")):ar(n)?H({...$,type:"status-controls",id:b(A),payload:{controls:n}}):Promise.reject(new T("HOST_REJECTED","Status controls must have unique bounded ids and valid selected options.")),openPopover:n=>R?.features?.popovers!==!0?Promise.reject(new T("UNSUPPORTED","This host does not support popovers.")):vt(n)?H({...$,type:"popover-open",id:b(A),payload:n}):Promise.reject(new T("HOST_REJECTED","Popover requests need bounded geometry and JSON data.")),closePopover:Bo,setPopoverAnchorActive:Ko,onResolve:n=>(k=n,()=>{k===n&&(k=null)}),toast:n=>{let a=n.message.trim();return!a||a.length>et?Promise.reject(new T("HOST_REJECTED",`Toast message must contain 1 to ${et} characters.`)):n.copy&&n.copy!==!0&&(!n.copy.text.length||n.copy.text.length>tt)?Promise.reject(new T("HOST_REJECTED",`Toast copy text must contain 1 to ${tt} characters.`)):H({channel:I,v:1,type:"toast",id:b(A),payload:{...n,message:a}})},openUrl:n=>H({channel:I,v:1,type:"open-url",id:b(A),payload:{url:n}}),openCommit:n=>Lt(n)?H({channel:I,v:1,type:"open-commit",id:b(A),payload:{sha:n}}):Promise.reject(new T("HOST_REJECTED","Commit id must be 7 to 64 hex characters.")),answerBlock:n=>H({channel:I,v:1,type:"block-answer",id:b(A),payload:{text:n.trim().slice(0,Nt)}}),openSurface:n=>H({channel:I,v:1,type:"open-surface",id:b(A),payload:{surfaceId:n}}),writeClipboard:n=>H({channel:I,v:1,type:"clipboard-write",id:b(A),payload:{text:n}}),compose:n=>H({channel:I,v:1,type:"compose",id:b(A),payload:n}),attach:n=>H({channel:I,v:1,type:"attach",id:b(A),payload:Ce(n)}),startSession:async n=>{n.projectId!==void 0&&ee(n.projectId);let a=n.worktree;a&&a!==!0&&(a.kind==="existing"?ee(a.directory):(a.name!==void 0&&ee(a.name,200),a.baseBranch!==void 0&&ee(a.baseBranch,200)));let m=await j({channel:I,v:1,type:"start-session",id:b(A),payload:$t(n)},e.requestTimeoutMs??18e4);if(!Mt(m))throw new T("HOST_REJECTED","Host did not return a session.");return m},prompt:n=>j({channel:I,v:1,type:"prompt",id:b(A),payload:Vt(n)}).then(a=>{if(!Pt(a))throw new T("HOST_REJECTED","Host did not return a prompt result.");return a}),sessionLink:n=>H({channel:I,v:1,type:"session-link",id:b(A),payload:Ce(n)}),close:()=>H({channel:I,v:1,type:"close",id:b(A)}),oauthStart:()=>H({channel:I,v:1,type:"oauth-start",id:b(A)}),oauthDisconnect:()=>H({channel:I,v:1,type:"oauth-disconnect",id:b(A)}),request:n=>(it(n.path)?j({channel:I,v:1,type:"request",id:b(A),payload:n}):Mr()).then(a=>{if(!at(a))throw new T("HOST_REJECTED","Host request result was empty.");return a}),serviceRequest:n=>(it(n.path)?j({channel:I,v:1,type:"service-request",id:b(A),payload:n}):Mr()).then(a=>{if(!at(a))throw new T("HOST_REJECTED","Host service request result was empty.");return a}),serviceStatus:()=>j({channel:I,v:1,type:"service-status",id:b(A)}).then(n=>{if(!jt(n))throw new T("HOST_REJECTED","Host did not return service status.");return n}),readFile:n=>(we(n)?j({channel:I,v:1,type:"file-read",id:b(A),payload:{path:n}}):ct()).then(a=>{if(!Bt(a))throw new T("HOST_REJECTED","Host did not return file content.");return a}),writeFile:(n,a)=>we(n)?a.length>rt?Promise.reject(new T("FILE_TOO_LARGE",`Content is over ${rt} characters.`)):j({channel:I,v:1,type:"file-write",id:b(A),payload:{path:n,content:a}}).then(m=>{if(!Kt(m))throw new T("HOST_REJECTED","Host did not confirm the write.");return m}):ct(),listDir:n=>(we(n)?j({channel:I,v:1,type:"file-list",id:b(A),payload:{path:n}}):ct()).then(a=>{if(!Wt(a))throw new T("HOST_REJECTED","Host did not return directory entries.");return a}),stat:n=>(we(n)?j({channel:I,v:1,type:"file-stat",id:b(A),payload:{path:n}}):ct()).then(a=>{if(!zt(a))throw new T("HOST_REJECTED","Host did not return file status.");return a}),generate:n=>{let a=n.prompt.trim(),m=n.system?.trim();if(a.length===0||a.length>nt)return Promise.reject(new T("HOST_REJECTED",`Prompt must be 1 to ${nt} characters.`));if(m!==void 0&&(m.length===0||m.length>st))return Promise.reject(new T("HOST_REJECTED",`System prompt must be 1 to ${st} characters.`));let h=n.maxOutputTokens===void 0?void 0:Math.min(Gt,Math.max(1,Math.floor(n.maxOutputTokens)));if(h!==void 0&&!Number.isFinite(h))return Promise.reject(new T("HOST_REJECTED","maxOutputTokens must be a number."));let N={prompt:a};return m!==void 0&&(N.system=m),h!==void 0&&(N.maxOutputTokens=h),j({channel:I,v:1,type:"generate",id:b(A),payload:N},e.requestTimeoutMs??Ht).then(w=>{if(!Jt(w))throw new T("HOST_REJECTED","Host did not return generated text.");return w})},onLateGenerateResult:n=>{X.add(n);for(let a of q.splice(0))P([n],a);return Do(),()=>{X.delete(n)}},setBadge:n=>H({channel:I,v:1,type:"badge",id:b(A),payload:{count:Xt(n)}}),setHeight:n=>H({channel:I,v:1,type:"resize",id:b(A),payload:{height:Ft(n)}}),onFileOpen:n=>(Be.add(n),St||(St=!0,t.addEventListener("keydown",$o,!0)),Pe&&n(Pe),()=>{Be.delete(n)}),onFileSnapshot:n=>(Me=n,()=>{Me===n&&(Me=null)}),onFileSaved:n=>(Ke.add(n),()=>{Ke.delete(n)}),reportFileChange:n=>Tt({...$,type:"file-change",payload:{dirty:n.dirty,edited:n.edited}}),requestFileSave:Ho,reportFileUnsupported:()=>Tt({...$,type:"file-unsupported"}),dispose:()=>{for(let n of Ae.keys())W({...$,type:"workspace-unsubscribe",id:b(A),payload:{subscriptionId:n}});Ae.clear();for(let n of be.keys())W({...$,type:"shells-unsubscribe",id:b(A),payload:{subscriptionId:n}});be.clear(),ne=!0,k=null,Z=null,Me=null,Be.clear(),Ke.clear(),St&&t.removeEventListener("keydown",$o,!0),t.removeEventListener("message",Go),t.removeEventListener("keydown",Vo,!0),t.removeEventListener("pointerover",ze),t.removeEventListener("pointermove",ze),t.removeEventListener("pointerout",Xo),t.removeEventListener("focus",Fo),t.removeEventListener("blur",jo);for(let n of xe.values())clearTimeout(n.timer),n.reject(new T("HOST_UNAVAILABLE","Host client was disposed."));xe.clear(),s.clear(),l.clear(),i.clear(),c.clear(),d.clear(),u.clear(),E.clear(),_.clear(),S.clear(),y.clear(),L.clear(),X.clear(),q.length=0}}};var Dr=["browser.open","browser.snapshot","browser.click","browser.type","browser.select","browser.scroll","browser.back","browser.forward","browser.inspect","browser.capture","browser.resize","browser.close"];var wi=new Set(Dr);var os=10*6e4;var rs=10*6e4;var ns=10*6e4;var ss=10*6e4;var Gr=["none","agent","user"];var Ui=new Set(Gr);var B=to(),Hr=async e=>B.request({method:e.method,path:e.path,...e.query?{query:e.query}:{},...e.body===void 0?{}:{body:e.body}});var is={"github.com":"github","www.github.com":"github","bitbucket.org":"bitbucket","www.bitbucket.org":"bitbucket","gitlab.com":"gitlab","www.gitlab.com":"gitlab"};function $r(e){let t=e.trim();if(!t)return null;let o=/^(?:[A-Za-z0-9_.-]+@)?([A-Za-z0-9.-]+):([^/]+)\/([^/]+)$/.exec(t);o&&!t.includes("://")&&(t=`https://${o[1]}/${o[2]}/${o[3]}`);let r;try{r=new URL(t)}catch{return null}let s=r.hostname.toLowerCase();if(!s)return null;let l=r.pathname.replace(/^\/+/,"").replace(/\/+$/,"").replace(/\.git$/i,"").split("/").filter(Boolean);if(l.length<2)return null;let i=l[l.length-2]??"",c=l[l.length-1]??"";return!i||!c?null:{host:s,owner:i,repo:c}}function Vr(e){return e.host==="github.com"||e.host==="www.github.com"?[`gh/${e.owner}/${e.repo}`]:e.host==="bitbucket.org"||e.host==="www.bitbucket.org"?[`bb/${e.owner}/${e.repo}`]:[]}function Xr(e,t,o){return{segment:e&&is[e.host]||"github",owner:e?.owner??t,repo:e?.repo??o}}function as(e){return`https://app.circleci.com/pipelines/${e.segment}/${e.owner}/${e.repo}`}function $e(e,t){return`${as(e)}/${t}`}function Ve(e,t,o){return`${$e(e,t)}/workflows/${o}`}function dt(e,t,o,r){return`${Ve(e,t,o)}/jobs/${r}`}function Fr(e){let t=null,o=null,r="";for(let s of e.split(/\r?\n/)){let l=s.trim();if(!l||l.startsWith("#")||l.startsWith(";"))continue;let i=/^\[([^\]]+)\]$/.exec(l);if(i){r=(i[1]??"").trim().toLowerCase();continue}let c=/^url\s*=\s*(.*)$/i.exec(l);if(!c)continue;let d=(c[1]??"").trim();d&&(o===null&&(o=d),(/remote\s+"origin"/i.test(r)||/remote\s+'origin'/i.test(r))&&(t=d))}return t??o}var cs="circleci",ls=16e3,ds=200,oo=2e3;function jr(e,t){return e.length<=t?e:`${e.slice(0,t-20)}
\u2026 (truncated)`}function ve(e){return te(e.phase,e.outcome).label.toLowerCase()}function us(e){let{workspace:t,run:o,workflow:r,job:s}=e;return{projectId:t.link.projectId,projectName:t.link.projectName,orgName:t.link.orgName,runId:o.id,runNumber:o.number,branch:o.branch,workflowId:r?.id??null,workflowName:r?.name??null,jobId:s?.id??null,jobName:s?.name??null}}function ps(e){let t=e.workflow?.id??"run",o=e.job?.id??"";return`${e.run.id}:${t}:${o}`}function Es(e){let{run:t,workflow:o,job:r}=e,s=r?.name??o?.name??`run #${t.number}`,l=ve(r?{phase:r.phase,outcome:r.outcome}:o||{phase:t.phase,outcome:t.outcome});return jr(`${s} ${l} in CircleCI run #${t.number}`,ds)}function Br(e){let{workspace:t,run:o,workflow:r,job:s}=e;return r&&s&&s.number>0?dt(t.target,o.number,r.id,s.number).slice(0,oo):r?Ve(t.target,o.number,r.id).slice(0,oo):$e(t.target,o.number).slice(0,oo)}function fs(e){let{workspace:t,run:o,workflow:r,job:s,jobs:l,detail:i,output:c}=e,d=[];d.push(`CircleCI run #${o.number} on ${t.link.orgName}/${t.link.projectName}`),d.push(`Status: ${ve({phase:o.phase,outcome:o.outcome})}`),o.pipelineName&&d.push(`Pipeline: ${o.pipelineName}`),d.push(`Ref: ${Ie(o)}${o.revision?` at ${Ye(o.revision)}`:""}`),o.commitSubject&&d.push(`Commit: ${o.commitSubject}`),d.push(`URL: ${Br(e)}`);let u=l.filter(E=>ke(E.outcome));if(r){if(d.push(""),d.push(`Workflow ${r.name} (${ve(r)})`),u.length>0){d.push("Failing jobs:");for(let _ of u)d.push(`- ${_.name} (#${_.number})`)}let E=l.filter(_=>!u.includes(_));if(E.length>0){d.push("Other jobs:");for(let _ of E)d.push(`- ${_.name}: ${ve({phase:_.phase,outcome:_.outcome})}`)}}if(s&&i){if(d.push(""),d.push(`Job ${i.name} (#${i.number})`),i.errors.length>0){d.push("Errors:");for(let _ of i.errors)d.push(`- ${_.type}: ${_.message}`)}let E=i.steps.filter(_=>_.outcome==="failed");if(E.length>0){d.push("Failed steps:");for(let _ of E)d.push(`- step ${_.num} "${_.name}"${_.exitCode!==null?` (exit ${_.exitCode})`:""}`),_.command&&d.push(`  command: ${_.command}`)}}return c&&c.trim()&&(d.push(""),d.push("Condensed output:"),d.push(c.trim())),jr(d.join(`
`),ls)}function Kr(e){return{providerId:cs,id:ps(e).slice(0,128),title:Es(e),url:Br(e),kind:"issue",text:fs(e),data:us(e)}}async function Wr(e){await B.attach(Kr(e))}async function zr(e){await B.startSession({...Kr(e),worktree:!0,navigation:"open"})}function x(e,t={},...o){let r=document.createElement(e);t.className&&(r.className=t.className),t.text!==void 0&&(r.textContent=t.text),t.title&&(r.title=t.title),t.style&&r.setAttribute("style",t.style),t.role&&r.setAttribute("role",t.role),t.ariaLabel&&r.setAttribute("aria-label",t.ariaLabel);for(let s of o)s==null||s===!1||r.append(typeof s=="string"?document.createTextNode(s):s);return r}function Jr(e){for(;e.firstChild;)e.removeChild(e.firstChild)}var _s={DISCONNECTED:"CircleCI is not connected. Add a personal API token in Settings \u2192 Integrations.",NO_INTEGRATION:"This extension is not connected to CircleCI. Add a token in Settings \u2192 Integrations.",NOT_GRANTED:"OpenChamber has not granted this extension that permission.",HOST_TIMEOUT:"OpenChamber did not hear back from CircleCI in time.",HOST_UNAVAILABLE:"This page is not running inside OpenChamber.",NO_DIRECTORY:"Open a project in OpenChamber first.",NO_SESSION:"Open or create a chat first.",SESSION_BUSY:"That chat is still working. Try again when it is idle.",DISABLED:"This extension is paused in Settings \u2192 Extensions.",BAD_PATH:"OpenChamber refused that API path."};function se(e){return e instanceof Ee?e.message:e instanceof T?_s[e.code]??e.message:e instanceof Error?e.message:String(e)}function ms(e){return e instanceof T?e.code:null}function ro(e){let t=ms(e);return t==="DISCONNECTED"||t==="NO_INTEGRATION"}var Ss=`
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
`,qr="circleci-shared-style";function Qr(){if(document.getElementById(qr))return;let e=document.createElement("style");e.id=qr,e.textContent=Ss,document.head.append(e)}var Yr="prefs";function Ts(e){let t=5381;for(let o=0;o<e.length;o+=1)t=(t<<5)+t+e.charCodeAt(o)>>>0;return t.toString(36)}function Zr(e){return`project:${Ts(e)}`}function en(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Xe(e){return typeof e=="string"&&e.length>0?e:null}function hs(e){if(!en(e))return null;let t=Xe(e.projectId),o=Xe(e.projectName),r=Xe(e.orgName),s=Xe(e.directory);if(!t||!o||!r||!s)return null;let l=e.source==="detected"?"detected":"picked";return{projectId:t,projectName:o,orgName:r,slug:Xe(e.slug),source:l,directory:s}}async function tn(e,t){let o=hs(await e.get(Zr(t)));return!o||o.directory!==t?null:o}async function on(e,t,o){await e.set(Zr(t),{projectId:o.projectId,projectName:o.projectName,orgName:o.orgName,slug:o.slug,source:o.source,directory:t})}var gs={autoRefresh:!0};function Rs(e){return en(e)?{autoRefresh:e.autoRefresh!==!1}:{...gs}}async function no(e){return Rs(await e.get(Yr))}async function rn(e,t){let r={...await no(e),...t};return await e.set(Yr,{autoRefresh:r.autoRefresh}),r}var Os=[["--oc-bg","background"],["--oc-elevated","elevated"],["--oc-fg","foreground"],["--oc-muted","muted"],["--oc-subtle","subtle"],["--oc-border","border"],["--oc-hover","hover"],["--oc-selection","selection"],["--oc-focus","focus"],["--oc-primary","primary"],["--oc-muted-surface","mutedSurface"],["--oc-elevated-fg","elevatedForeground"],["--oc-active","active"],["--oc-selection-fg","selectionForeground"],["--oc-primary-fg","primaryForeground"],["--oc-primary-text","primaryText"],["--oc-success-text","successText"],["--oc-warning-text","warningText"],["--oc-error-text","errorText"],["--oc-info-text","infoText"],["--oc-success","success"],["--oc-warning","warning"],["--oc-error","error"],["--oc-info","info"],["--oc-font","font"],["--oc-mono","mono"],["--oc-radius","radius"],["--surface-background","background"],["--surface-elevated","elevated"],["--surface-foreground","foreground"],["--surface-muted-foreground","muted"],["--surface-subtle","subtle"],["--interactive-border","border"],["--interactive-hover","hover"],["--interactive-selection","selection"],["--interactive-focus-ring","focus"],["--primary","primary"],["--surface-muted","mutedSurface"],["--surface-elevated-foreground","elevatedForeground"],["--interactive-active","active"],["--interactive-selection-foreground","selectionForeground"],["--primary-foreground","primaryForeground"],["--primary-text","primaryText"],["--success-text","successText"],["--warning-text","warningText"],["--error-text","errorText"],["--info-text","infoText"],["--status-success","success"],["--status-warning","warning"],["--status-error","error"],["--status-info","info"],["--font-sans","font"],["--font-mono","mono"],["--radius","radius"]],xs=[["--oc-syntax-keyword","--syntax-keyword","syntaxKeyword"],["--oc-syntax-string","--syntax-string","syntaxString"],["--oc-syntax-number","--syntax-number","syntaxNumber"],["--oc-syntax-function","--syntax-function","syntaxFunction"],["--oc-syntax-type","--syntax-type","syntaxType"],["--oc-syntax-comment","--syntax-comment","syntaxComment"],["--oc-syntax-variable","--syntax-variable","syntaxVariable"],["--oc-syntax-operator","--syntax-operator","syntaxOperator"]],nn=(e,t)=>{t.style.colorScheme=e.mode;for(let[o,r]of Os)t.style.setProperty(o,e.tokens[r]);for(let[o,r,s]of xs){let l=e.tokens[s]??"";t.style.setProperty(o,l),t.style.setProperty(r,l)}t.style.setProperty("font-family",e.tokens.font),t.style.setProperty("font-size","0.875rem"),t.style.setProperty("line-height","1.45"),t.style.setProperty("color",e.tokens.foreground)},so=(e,t)=>{nn(e.theme,t),t.dataset&&(t.dataset.ocSurface=e.surface,t.dataset.ocTheme=e.theme.mode)};var As={"surface-background":"bg","surface-elevated":"elevated","surface-elevated-foreground":"elevated-fg","surface-foreground":"fg","surface-muted-foreground":"muted","surface-muted":"muted-surface","surface-subtle":"subtle","interactive-border":"border","interactive-hover":"hover","interactive-active":"active","interactive-selection":"selection","interactive-selection-foreground":"selection-fg","interactive-focus-ring":"focus",primary:"primary","primary-foreground":"primary-fg","primary-text":"primary-text","success-text":"success-text","warning-text":"warning-text","error-text":"error-text","info-text":"info-text","status-success":"success","status-warning":"warning","status-error":"error","status-info":"info","font-sans":"font","font-mono":"mono",radius:"radius"},M=(e,t)=>`var(--${e}, var(--oc-${As[e]}, ${t}))`,le=M("surface-background","transparent"),pt=M("surface-elevated","transparent"),Ue=M("surface-elevated-foreground","inherit"),z=M("surface-foreground","inherit"),D=M("surface-muted-foreground","gray"),bs=M("surface-muted","transparent"),Te=M("interactive-border","currentColor"),K=M("interactive-hover","transparent"),he=M("interactive-active","transparent"),io=M("interactive-selection","transparent"),ao=M("interactive-selection-foreground","inherit"),ce=M("primary","currentColor"),co=M("primary-text","inherit"),lo=M("error-text","inherit"),ks=M("font-sans","inherit"),uo=M("font-mono","monospace"),ln=M("radius","9px"),po=`calc(${ln} - 2px)`,sn=`calc(${ln} - 4px)`,G=(e,t,o="transparent")=>`color-mix(in srgb, ${e} ${t}%, ${o})`,an=`background-image: linear-gradient(${K}, ${K});`,Eo=(e,t="0.5px")=>`box-shadow: inset 0 0 0 ${t} ${e}, var(--oc-sdk-field-lift);`,fo="border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);",cn="box-shadow: var(--oc-sdk-lit);",_o=`inset 0 0.5px 0 0 ${G(z,8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`,Is=`
:root {
  --oc-sdk-edge: ${G(z,16)};
  --oc-sdk-field-bg: ${pt};
  --oc-sdk-raised-bg: ${le};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${G(z,14)};
  --oc-sdk-field-bg: ${G(le,50,pt)};
  --oc-sdk-raised-bg: ${pt};
  --oc-sdk-field-lift: ${_o};
  --oc-sdk-raised-lift: ${_o};
  --oc-sdk-lit: ${_o};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`,ut=e=>{let t=M(`status-${e}`,"currentColor");return`
.oc-sdk[data-tone="${e}"], .oc-sdk [data-tone="${e}"] { --oc-sdk-tone: ${t}; --oc-sdk-tone-text: ${M(`${e}-text`,"inherit")}; }`},ys=`
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
`,dn=`${Is}
.oc-sdk { color: ${z}; font-family: ${ks}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${an} }
.oc-sdk-mono { font-family: ${uo}; }
.oc-sdk-muted { color: ${D}; }
${ut("success")}${ut("warning")}${ut("error")}${ut("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${ce}; --oc-sdk-tone-text: ${co}; }

.oc-sdk-btn { border-radius: ${po}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${sn}; }
.oc-sdk-btn[data-variant="default"] { color: ${co}; background: ${G(ce,10,le)}; border-color: ${G(ce,12)}; ${cn} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${G(ce,16,le)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${G(ce,22,le)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${bs}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${K}, ${K}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${he}, ${he}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${Ue}; ${fo} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${K}, ${K}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${he}, ${he}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${K}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${he}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${M("status-error","red")}; color: ${lo}; background: ${G("var(--oc-sdk-tone)",7,le)}; border-color: ${G("var(--oc-sdk-tone)",12)}; ${cn} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${G("var(--oc-sdk-tone)",9,le)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${G("var(--oc-sdk-tone)",11,le)}; box-shadow: none; }

.oc-sdk-field-note { color: ${D}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${lo}; }
.oc-sdk-input { border-radius: ${po}; background: var(--oc-sdk-field-bg); color: ${Ue}; ${Eo("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${D}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${K}, ${K}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${Eo(G(z,26),"1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${Eo(M("status-error","red"),"1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${uo}; }

.oc-sdk-search-icon { color: ${D}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${ce}; }
.oc-sdk-search-clear { border-radius: ${sn}; color: ${D}; }
.oc-sdk-search-clear:hover { background: ${K}; color: ${z}; }

.oc-sdk-trigger { border-radius: ${po}; background: var(--oc-sdk-raised-bg); color: ${Ue}; ${fo} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${K}, ${K}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${he}, ${he}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${D}; }
.oc-sdk-trigger-chevron { color: ${D}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${Ue}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${pt}; background-clip: padding-box; color: ${Ue}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${K}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${io}; color: ${ao}; }
.oc-sdk-option-check { color: ${z}; }
.oc-sdk-option[data-destructive="true"] { color: ${lo}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${G(M("status-error","red"),10)}; }
.oc-sdk-option-hint { color: ${D}; }
.oc-sdk-popup-empty { color: ${D}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${Te}; border-radius: 4px; color: ${z}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${G(z,60,Te)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${Te}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${le}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${ce}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${an} }
.oc-sdk-check-desc { color: ${D}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${G(z,4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${D}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${z}; }
.oc-sdk-tab[aria-selected="true"] { color: ${ao}; background: ${io}; border-color: ${Te}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${Ue}; background: var(--oc-sdk-raised-bg); ${fo} }
.oc-sdk-tab-count { color: ${D}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${G(z,6)}; color: ${D}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${G("var(--oc-sdk-tone)",15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${K}; }
.oc-sdk-row[aria-selected="true"] { background: ${io}; color: ${ao}; }
.oc-sdk-row-lead { font-family: ${uo}; color: ${D}; }
.oc-sdk-row-sub { color: ${D}; }
.oc-sdk-row-meta { color: ${D}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${D}; }

.oc-sdk-empty-body { color: ${D}; }

.oc-sdk-spinner { color: ${D}; }
.oc-sdk-spinner-ring { border-color: ${Te}; border-top-color: ${ce}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${G("var(--oc-sdk-tone)",10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${D}; }

.oc-sdk-separator { color: ${D}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${G(Te,40)}; }

.oc-sdk-progress-label { color: ${D}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${G(z,6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${ce}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${M("status-success","currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${M("success-text","inherit")}; }

.oc-sdk-text a { color: ${co}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${G(Te,60)}; }
`,v=`
${kt}
${ys}
${dn}`;var un="oc-sdk-ui-style",de=e=>{for(;e.firstChild;)e.removeChild(e.firstChild)},U=e=>{let t=document.getElementById(un);if(t instanceof HTMLStyleElement){t.textContent!==e&&(t.textContent=e);return}It(document);let o=document.createElement("style");o.id=un,o.textContent=e,document.head.appendChild(o)},O=(e,t)=>{let o=document.createElement(e);return t&&(o.className=t),o},Q=e=>{let t=O("button",e);return t.type="button",t},F=(e,t)=>{let o=t??"";e.textContent!==o&&(e.textContent=o)},oe=(e,t,o)=>{o==null||o===""?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)},pn=(e,t)=>{let o=r=>{r.target instanceof Node&&e.contains(r.target)||t()};return document.addEventListener("pointerdown",o,!0),()=>{document.removeEventListener("pointerdown",o,!0)}};var Cs=()=>{let e=document.createElement("span");return e.className="oc-sdk-spinner-ring",e.setAttribute("aria-hidden","true"),e},ue=(e,t)=>{U(v);let o=t,r=Q("oc-sdk oc-sdk-btn"),s=Cs(),l=document.createElement("span");r.append(l),e.append(r);let i=()=>{r.dataset.variant=o.variant??"default",r.dataset.size=o.size??"default",r.disabled=!!o.disabled||!!o.loading,r.dataset.loading=o.loading?"true":"false",r.setAttribute("aria-busy",o.loading?"true":"false"),o.loading&&s.parentNode!==r?r.prepend(s):!o.loading&&s.parentNode===r&&s.remove(),F(l,o.label)},c=()=>{o.disabled||o.loading||o.onClick()};return r.addEventListener("click",c),i(),{update:d=>{o={...o,...d},i()},dispose:()=>{r.removeEventListener("click",c),r.remove()}}};var En="http://www.w3.org/2000/svg",ws={search:"M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z",chevron:"M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z",check:"M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z",close:"M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"},fe=(e,t,o)=>{let r=document.createElementNS(En,"svg");r.setAttribute("viewBox","0 0 24 24"),r.setAttribute("width",String(t)),r.setAttribute("height",String(t)),r.setAttribute("aria-hidden","true"),r.setAttribute("fill","currentColor"),o&&r.setAttribute("class",o);let s=document.createElementNS(En,"path");return s.setAttribute("d",ws[e]),r.append(s),r};var mo=(e,t)=>{U(v);let o=t,r=O("div","oc-sdk oc-sdk-search"),s=O("input","oc-sdk-input");s.type="text",s.spellcheck=!1,s.autocomplete="off",s.setAttribute("role","searchbox");let l=Q("oc-sdk-search-clear");l.append(fe("close",14)),l.tabIndex=-1,r.append(fe("search",16,"oc-sdk-search-icon"),s,l),e.append(r);let i=()=>{let E=o.placeholder??"Search";oe(s,"placeholder",E),s.setAttribute("aria-label",o.label??E),l.setAttribute("aria-label","Clear search"),s.value!==o.value&&(s.value=o.value),r.dataset.active=o.value.trim()===""?"false":"true"},c=()=>{o.value!==""&&o.onChange(""),s.focus()},d=()=>{o.onChange(s.value)},u=E=>{E.key==="Escape"&&s.value!==""&&(E.preventDefault(),c())};return s.addEventListener("input",d),s.addEventListener("keydown",u),l.addEventListener("click",c),i(),o.autofocus&&s.focus(),{update:E=>{o={...o,...E},i()},dispose:()=>{s.removeEventListener("input",d),s.removeEventListener("keydown",u),l.removeEventListener("click",c),r.remove()}}};var _e=(e,t="vertical")=>{let[o,r]=t==="vertical"?["ArrowDown","ArrowUp"]:["ArrowRight","ArrowLeft"];return e.key===o||e.ctrlKey&&e.key.toLowerCase()==="n"?"next":e.key===r||e.ctrlKey&&e.key.toLowerCase()==="p"?"previous":e.key==="Home"?"first":e.key==="End"?"last":null},me=(e,t,o)=>{let r=e.filter(d=>!d.disabled);if(r.length===0)return null;let s=r[0],l=r[r.length-1];if(o==="first"||!s||!l)return s?.id??null;if(o==="last")return l.id;let i=r.findIndex(d=>d.id===t);return i===-1?o==="next"?s.id:l.id:r[Math.min(r.length-1,Math.max(0,i+(o==="next"?1:-1)))]?.id??null};var fn=(e,t)=>`${e}-${t??""}`,So=(e,t,o,r)=>{let s=Q("oc-sdk-option");s.id=fn(e,o.id),s.setAttribute("role",t),s.tabIndex=-1,s.disabled=!!o.disabled,t==="option"&&s.setAttribute("aria-selected",o.selected?"true":"false"),s.dataset.destructive=o.destructive?"true":"false";let l=O("span","oc-sdk-option-label");if(l.textContent=o.label,s.append(l),o.hint){let i=O("span","oc-sdk-option-hint");i.textContent=o.hint,s.append(i)}if(t==="option"){s.dataset.mark="check";let i=O("span","oc-sdk-option-check");i.append(fe("check",14)),s.append(i)}return s.addEventListener("pointerenter",r.hover),s.addEventListener("click",r.pick),s},To=(e,t,o,r)=>{let s=fn(o,r);for(let l of Array.from(e.children))l instanceof HTMLElement&&l.classList.contains("oc-sdk-option")&&(l.dataset.active=l.id===s?"true":"false");oe(t,"aria-activedescendant",r?s:null),e.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})};var vs=(e,t)=>{let o=t.getBoundingClientRect();e.style.minWidth=`${Math.round(o.width)}px`,e.style.left=`${Math.round(o.left)}px`,e.style.top=`${Math.round(o.bottom+4)}px`;let r=e.offsetHeight,s=window.innerHeight-o.bottom-8;r>s&&o.top-8>s&&(e.style.top=`${Math.max(8,Math.round(o.top-4-r))}px`);let l=o.left+e.offsetWidth-window.innerWidth+8;l>0&&(e.style.left=`${Math.max(8,Math.round(o.left-l))}px`)},ho=(e,t,o,r)=>{e.append(o),vs(o,t);let s=pn(e,r),l=()=>{r()},i=c=>{c.target instanceof Node&&o.contains(c.target)||r()};return window.addEventListener("resize",l),window.addEventListener("scroll",i,!0),()=>{s(),window.removeEventListener("resize",l),window.removeEventListener("scroll",i,!0),o.remove()}};var go=(e,t)=>{U(v);let o=t,r=O("div","oc-sdk oc-sdk-tabs");r.setAttribute("role","tablist"),e.append(r);let s=()=>{de(r),r.dataset.track=o.trackBackground?"true":"false";for(let i of o.items){let c=Q("oc-sdk-tab");c.setAttribute("role","tab");let d=i.id===o.activeId;c.setAttribute("aria-selected",d?"true":"false"),c.tabIndex=d?0:-1,c.dataset.id=i.id;let u=O("span");if(u.textContent=i.label,c.append(u),i.count!==void 0){let E=O("span","oc-sdk-tab-count");E.textContent=String(i.count),c.append(E)}c.addEventListener("click",()=>{i.id!==o.activeId&&o.onChange(i.id)}),r.append(c)}},l=i=>{let c=_e(i,"horizontal");if(!c)return;let d=me(o.items,o.activeId,c);if(d&&d!==o.activeId){i.preventDefault(),o.onChange(d);let u=r.querySelector(`[data-id="${CSS.escape(d)}"]`);u instanceof HTMLElement&&u.focus()}};return r.addEventListener("keydown",l),s(),{update:i=>{o={...o,...i},s()},dispose:()=>{r.removeEventListener("keydown",l),r.remove()}}};var Et=(e,t)=>{oe(e,"data-tone",t&&t!=="neutral"?t:null)},Ro=(e,t)=>{U(v);let o=t,r=O("span","oc-sdk oc-sdk-badge");e.append(r);let s=()=>{F(r,o.label),Et(r,o.tone)};return s(),{update:l=>{o={...o,...l},s()},dispose:()=>{r.remove()}}};var Us=0,Oo=(e,t)=>{U(v);let o=t,r=`oc-sdk-list-${Us+=1}`,s=O("div","oc-sdk oc-sdk-list");s.setAttribute("role","listbox"),s.tabIndex=0,e.append(s);let l=null,i=_=>`${r}-${_}`,c=_=>{l=_;for(let S of Array.from(s.children))S instanceof HTMLElement&&(S.dataset.active=S.id===i(_??"")?"true":"false");oe(s,"aria-activedescendant",_?i(_):null),s.querySelector('[data-active="true"]')?.scrollIntoView({block:"nearest"})},d=(_,S)=>{let y=O("span",_);return y.textContent=S,y},u=()=>{if(de(s),oe(s,"aria-label",o.ariaLabel),o.items.length===0){s.append(d("oc-sdk-list-empty",o.emptyText??"Nothing here")),c(null);return}for(let S of o.items){let y=Q("oc-sdk-row");y.id=i(S.id),y.setAttribute("role","option"),y.setAttribute("aria-selected",S.id===o.selectedId?"true":"false"),y.disabled=!!S.disabled,y.tabIndex=-1,S.leading&&y.append(d("oc-sdk-row-lead",S.leading));let L=O("span","oc-sdk-row-main");if(L.append(d("oc-sdk-row-title",S.title)),S.subtitle&&L.append(d("oc-sdk-row-sub",S.subtitle)),y.append(L),S.badge){let X=d("oc-sdk-badge",S.badge.label);Et(X,S.badge.tone),y.append(X)}S.meta&&y.append(d("oc-sdk-row-meta",S.meta)),y.addEventListener("click",()=>o.onSelect(S.id)),s.append(y)}let _=o.items.some(S=>S.id===l&&!S.disabled);c(_?l:o.selectedId??null)},E=_=>{let S=_e(_);if(S){_.preventDefault(),c(me(o.items,l,S));return}(_.key==="Enter"||_.key===" ")&&l&&(_.preventDefault(),o.onSelect(l))};return s.addEventListener("keydown",E),u(),{update:_=>{o={...o,..._},u()},dispose:()=>{s.removeEventListener("keydown",E),s.remove()}}};var xo=(e,t)=>{U(v);let o=t,r=O("div","oc-sdk oc-sdk-empty"),s=O("h2","oc-sdk-empty-title"),l=O("p","oc-sdk-empty-body"),i=O("div","oc-sdk-empty-action");r.append(s,l,i),e.append(r);let c=null,d=()=>{if(F(s,o.title),F(l,o.body),l.hidden=!o.body,i.hidden=!o.action,!o.action){c?.dispose(),c=null;return}let u={label:o.action.label,onClick:o.action.onClick};c?c.update(u):c=ue(i,{...u,variant:"outline",size:"sm"})};return d(),{update:u=>{o={...o,...u},d()},dispose:()=>{c?.dispose(),c=null,r.remove()}}};var Ao=(e,t={})=>{U(v);let o=t,r=O("span","oc-sdk oc-sdk-spinner");r.setAttribute("role","status");let s=O("span","oc-sdk-spinner-ring");s.setAttribute("aria-hidden","true");let l=O("span");r.append(s,l),e.append(r);let i=()=>{r.dataset.size=o.size??"default",F(l,o.label),l.hidden=!o.label,r.setAttribute("aria-label",o.label??"Loading")};return i(),{update:c=>{o={...o,...c},i()},dispose:()=>{r.remove()}}};var bo=(e,t)=>{U(v);let o=t,r=O("div","oc-sdk oc-sdk-banner"),s=O("div","oc-sdk-banner-text"),l=O("div","oc-sdk-banner-title"),i=O("div","oc-sdk-banner-body"),c=O("div","oc-sdk-banner-action");s.append(l,i),r.append(s,c),e.append(r);let d=null,u=()=>{if(r.dataset.tone=o.tone,r.setAttribute("role",o.tone==="error"||o.tone==="warning"?"alert":"status"),F(l,o.title),F(i,o.body),i.hidden=!o.body,c.hidden=!o.action,!o.action){d?.dispose(),d=null;return}let E={label:o.action.label,onClick:o.action.onClick};d?d.update(E):d=ue(c,{...E,variant:"outline",size:"xs"})};return u(),{update:E=>{o={...o,...E},u()},dispose:()=>{d?.dispose(),d=null,r.remove()}}};var _n=e=>e.filter(t=>!("separator"in t)),Ns=0,ko=(e,t)=>{U(v);let o=t,r=`oc-sdk-menu-${Ns+=1}`,s=O("div","oc-sdk oc-sdk-menu");e.append(s);let l=O("div","oc-sdk oc-sdk-popup");l.setAttribute("role","menu"),l.tabIndex=-1;let i=null,c=null,d=ue(s,{label:o.label,variant:o.variant,size:o.size,onClick:()=>{i?S():y()}}),u=s.querySelector("button");u?.setAttribute("aria-haspopup","menu");let E=k=>{c=k,To(l,l,r,k)},_=()=>{de(l);for(let k of o.items){if("separator"in k){let Z=O("div","oc-sdk-separator");Z.dataset.labeled="false",l.append(Z);continue}l.append(So(r,"menuitem",k,{hover:()=>E(k.id),pick:()=>L(k.id)}))}E(_n(o.items).some(k=>k.id===c)?c:null)},S=()=>{let k=i;i=null,k?.(),c=null,u?.setAttribute("aria-expanded","false")},y=()=>{i||!u||(_(),i=ho(s,u,l,S),u.setAttribute("aria-expanded","true"),l.focus())},L=k=>{S(),u?.focus(),o.onSelect(k)},X=k=>{let Z=_e(k);Z?(k.preventDefault(),E(me(_n(o.items),c,Z))):k.key==="Enter"||k.key===" "?(k.preventDefault(),c&&L(c)):k.key==="Escape"&&(k.preventDefault(),S(),u?.focus())},q=k=>{i&&!(k.relatedTarget instanceof Node&&s.contains(k.relatedTarget))&&S()};return l.addEventListener("keydown",X),s.addEventListener("focusout",q),{update:k=>{o={...o,...k},d.update({label:o.label,variant:o.variant,size:o.size}),i&&_()},dispose:()=>{S(),l.removeEventListener("keydown",X),s.removeEventListener("focusout",q),d.dispose(),s.remove()}}};var Ms=/(!?)\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,Ps=e=>{try{let t=new URL(e);return t.protocol==="http:"||t.protocol==="https:"}catch{return!1}},mn=e=>{let t=[],o=0;for(let r of e.matchAll(Ms)){let s=r.index??0;s>o&&t.push({kind:"text",text:e.slice(o,s)});let l=r[1]??"",i=(r[2]??"").trim(),c=r[3]??"";Ps(c)?l==="!"?t.push({kind:"image",src:c,alt:i}):t.push({kind:"link",href:c,label:i||c}):t.push({kind:"text",text:r[0]}),o=s+r[0].length}return o<e.length&&t.push({kind:"text",text:e.slice(o)}),t},Io=(e,t)=>{U(v);let o=t,r=O("div","oc-sdk oc-sdk-text");e.append(r);let s=i=>{!(i.target instanceof HTMLAnchorElement)||!o.onOpenUrl||(i.preventDefault(),o.onOpenUrl(i.target.href))},l=()=>{de(r);for(let i of mn(o.text))if(i.kind==="text")r.append(document.createTextNode(i.text));else if(i.kind==="link"){let c=O("a");c.href=i.href,c.rel="noopener noreferrer",c.target="_blank",c.textContent=i.label,r.append(c)}else{let c=O("img");c.src=i.src,c.alt=i.alt,c.loading="lazy",c.referrerPolicy="no-referrer",r.append(c)}};return r.addEventListener("click",s),l(),{update:i=>{o={...o,...i},l()},dispose:()=>{r.removeEventListener("click",s),r.remove()}}};var Sn=[];function ie(e){return Sn.push(e),e}function Tn(){for(let e of Sn.splice(0))try{e.dispose()}catch{}}var J=(e,t)=>ie(ue(e,t));var hn=(e,t)=>ie(mo(e,t));var gn=(e,t)=>ie(go(e,t)),$s=(e,t)=>ie(Ro(e,t)),Rn=(e,t)=>ie(Oo(e,t)),Fe=(e,t)=>ie(xo(e,t)),Vs=(e,t)=>ie(Ao(e,t)),On=(e,t)=>ie(bo(e,t)),yo=(e,t)=>ie(ko(e,t)),Xs=(e,t)=>ie(Io(e,t));function xn(e,t="notice"){let o=document.createElement("div");return o.className=t,Xs(o,{text:e,onOpenUrl:ge}),o}function ft(e,t){let o=document.createElement("span"),r=te(e,t);return $s(o,{label:r.label,tone:r.tone}),o}function Co(e){let t=document.createElement("div");return t.setAttribute("style","flex:1; display:flex; align-items:center; justify-content:center;"),Vs(t,{label:e}),t}function An(e){so(e,document.documentElement),document.body.dataset.theme=e.theme.mode,document.body.dataset.surface=e.surface}function ge(e){if(e){try{let t=new URL(e);if(t.protocol!=="https:"&&t.protocol!=="http:")return}catch{return}B.openUrl(e).catch(()=>{})}}var wo=new Map;function bn(e,t,o){return{directory:e,link:t,repo:o,target:Xr(o,t.orgName,t.projectName)}}async function kn(e){if(wo.has(e))return wo.get(e)??null;let t=null;try{let o=await B.readFile(".git/config"),r=Fr(o.content);t=r?$r(r):null}catch{t=null}return wo.set(e,t),t}async function In(e,t,o){let r=await tn(t,o);if(r)return bn(o,r,await kn(o));let s=await kn(o);if(!s)return null;for(let l of Vr(s))try{let i=await e.findProjectBySlug(l);if(!i||!i.id)continue;await on(t,o,{projectId:i.id,projectName:i.name,orgName:i.orgName,slug:l,source:"detected"});let c={projectId:i.id,projectName:i.name,orgName:i.orgName,slug:l,source:"detected",directory:o};return bn(o,c,s)}catch{}return null}var Oe=document.querySelector("#root");if(!Oe)throw new Error("CircleCI page is missing its #root element.");var pe=er(Hr),vo=B.storage,Fs=3e4,_t=null,p={ready:null,connected:!1,booted:!1,workspace:null,directory:null,runs:[],runsNext:null,filter:"all",search:"",selectedRun:null,workflows:[],jobs:{},preferences:{autoRefresh:!0},loading:!0,loadingDetail:!1,error:null},Re=0,je=null;async function re(e,t){try{await B.toast({kind:e,message:t})}catch{}}async function Cn(){if(Y(),p.preferences=await no(vo),p.directory=p.ready?.directory??null,!p.connected){p.loading=!1,Y();return}if(!p.directory){p.loading=!1,Y();return}try{if(p.workspace=await In(pe,vo,p.directory),!p.workspace){p.loading=!1,Y();return}await wn()}catch(e){p.loading=!1,p.error=se(e),ro(e)&&(p.connected=!1),Y()}}async function wn(){let e=p.workspace;if(!e)return;let t=++Re;p.loading=!0,p.error=null,Y();try{let o=await pe.listRuns(e.link.projectId);if(t!==Re)return;p.runs=o.items,p.runsNext=o.next,p.loading=!1;let r=p.runs.filter(s=>ke(s.outcome)).length;if(B.setBadge(r>0?r:null).catch(()=>{}),p.selectedRun){let s=p.runs.find(l=>l.id===p.selectedRun?.id);s&&(p.selectedRun=s)}if(!p.selectedRun&&o.items[0]){await No(o.items[0]);return}}catch(o){if(t!==Re)return;p.loading=!1,p.error=se(o),ro(o)&&(p.connected=!1)}Y(),Mo()}async function No(e){let t=++Re;p.selectedRun=e,p.workflows=[],p.jobs={},p.loadingDetail=!0,Y();try{let o=await pe.listWorkflows(e.id);if(t!==Re)return;p.workflows=o.items;let r=await Promise.allSettled(o.items.map(s=>pe.listJobs(s.id)));if(t!==Re)return;for(let[s,l]of r.entries()){let i=o.items[s];i&&(p.jobs[i.id]=l.status==="fulfilled"?l.value.items:[])}p.loadingDetail=!1}catch(o){if(t!==Re)return;p.loadingDetail=!1,p.error=se(o)}Y(),Mo()}async function Ne(){return p.selectedRun?No(p.selectedRun):wn()}function mt(e){let t=p.workspace,o=p.selectedRun;if(!t||!o)return null;let r=e.workflow??null;return{workspace:t,run:o,workflow:r,job:e.job??null,jobs:e.jobs??(r?p.jobs[r.id]??[]:[]),detail:null,output:null}}async function Uo(e){if(e)try{await Wr(e),await re("success","Attached to the chat box.")}catch(t){await re("error",se(t))}}async function js(e){if(e)try{await zr(e),await re("success","Started a worktree chat for this build.")}catch(t){await re("error",se(t))}}async function Bs(e,t){try{await pe.rerunWorkflow(e.id,t),await re("success",`Rerun started for ${e.name}.`),await Ne()}catch(o){await re("error",se(o))}}async function Ks(e){try{await pe.cancelWorkflow(e.id),await re("success",`Cancellation requested for ${e.name}.`),await Ne()}catch(t){await re("error",se(t))}}async function yn(e,t){try{t?await pe.approve(e.id):await pe.reject(e.id),await re("success",t?`Approved ${e.name}.`:`Rejected ${e.name}.`),await Ne()}catch(o){await re("error",se(o))}}function Ws(){return p.selectedRun?p.workflows.some(e=>te(e.phase,e.outcome).active):p.runs.some(e=>te(e.phase,e.outcome).active)}function Mo(){je!==null&&(window.clearTimeout(je),je=null),!(!p.preferences.autoRefresh||!Ws())&&(je=window.setTimeout(()=>{je=null,Ne()},Fs))}function Y(){if(Tn(),_t=null,Jr(Oe),!p.connected){zs();return}if(!p.directory||!p.workspace){Js();return}if(qs(),p.error){let t=x("div");Oe?.append(t),On(t,{tone:"error",title:"CircleCI",body:p.error,action:{label:"Retry",onClick:()=>void Ne()}})}let e=x("div",{className:"page-columns"});e.append(Ys()),e.append(ei()),Oe?.append(e)}function zs(){let e=x("div");Oe?.append(e),Fe(e,{title:"Connect CircleCI",body:"Create a personal API token in CircleCI, then paste it on the CircleCI card in Settings \u2192 Integrations. The token stays in OpenChamber.",action:{label:"Open CircleCI tokens",onClick:()=>ge("https://app.circleci.com/settings/user/tokens")}})}function Js(){let e=x("div");Oe?.append(e),Fe(e,{title:p.directory&&!p.workspace?"No CircleCI project yet":"No project open",body:p.directory&&!p.workspace?"Open the CircleCI panel once to choose which CircleCI project this repository maps to.":"Open a project in OpenChamber, then open the CircleCI panel to map it."})}function qs(){let e=p.workspace,t=x("div",{className:"toolbar"}),o=x("div",{style:"flex:1; min-width:0;"});if(yo(o,{label:e?`${e.link.orgName}/${e.link.projectName}`:"CircleCI",size:"sm",variant:"ghost",items:[{id:"refresh",label:"Refresh"},{separator:!0},p.preferences.autoRefresh?{id:"pause",label:"Pause auto-refresh"}:{id:"resume",label:"Resume auto-refresh"}],onSelect:r=>{r==="refresh"&&Ne(),(r==="pause"||r==="resume")&&rn(vo,{autoRefresh:r==="resume"}).then(s=>{p.preferences=s,Y(),Mo()})}}),t.append(o),e){let r=x("div");J(r,{label:"Project in CircleCI",size:"sm",variant:"outline",onClick:()=>ge(`https://app.circleci.com/pipelines/${e.target.segment}/${e.target.owner}/${e.target.repo}`)}),t.append(r)}Oe?.append(t)}function Qs(){let e=p.search.trim().toLowerCase();return p.runs.filter(t=>p.filter==="failed"&&!ke(t.outcome)||p.filter==="running"&&!te(t.phase,t.outcome).active?!1:e?`#${t.number} ${Ie(t)} ${t.commitSubject??""}`.toLowerCase().includes(e):!0)}function Ys(){let e=x("div",{className:"column"}),t=x("div"),o=gn(t,{items:[{id:"all",label:"All"},{id:"failed",label:"Failed"},{id:"running",label:"Running"}],activeId:p.filter,onChange:u=>{p.filter=u,o.update({activeId:p.filter}),_t?.paint()}});e.append(t);let r=x("div");e.append(r);let s=x("div",{className:"scroll"});e.append(s);let l=()=>Qs().map(u=>{let E=te(u.phase,u.outcome);return{id:u.id,leading:`#${u.number}`,title:Ie(u),...u.commitSubject?{subtitle:u.commitSubject}:{},meta:bt(u.createdAt),badge:{label:E.label,tone:E.tone}}}),i=()=>p.runs.length===0?"No runs yet. Push a commit.":"No run matches this filter.";if(p.loading&&p.runs.length===0)return s.append(Co("Loading runs")),e;let c=Rn(s,{items:l(),emptyText:i(),selectedId:p.selectedRun?.id??null,ariaLabel:"CircleCI runs",onSelect:u=>{let E=p.runs.find(_=>_.id===u);E&&No(E)}}),d=null;if(d=hn(r,{value:p.search,label:"Filter runs",placeholder:"Filter by branch, commit or number",onChange:u=>{p.search=u,d?.update({value:u}),_t?.paint()}}),_t={tabs:o,paint:()=>c.update({items:l(),emptyText:i()})},p.runsNext){let u=x("div",{className:"load-more"});J(u,{label:"Load more",size:"sm",variant:"ghost",onClick:()=>void Zs()}),e.append(u)}return e}async function Zs(){let e=p.workspace;if(!(!e||!p.runsNext))try{let t=await pe.listRuns(e.link.projectId,p.runsNext);p.runs=[...p.runs,...t.items],p.runsNext=t.next,Y()}catch(t){await re("error",se(t))}}function ei(){let e=x("div",{className:"column"}),t=p.selectedRun;if(!t){let d=x("div");return e.append(d),Fe(d,{title:"Pick a run",body:"Choose a run on the left to see its workflows and jobs."}),e}let o=x("div",{className:"detail-head"});o.append(x("div",{className:"badge-line"},ft(t.phase,t.outcome))),o.append(x("div",{className:"detail-title"},`#${t.number} ${Ie(t)}`));let r=[];t.revision&&r.push(Ye(t.revision)),t.commitSubject&&r.push(t.commitSubject),r.push(bt(t.createdAt)),o.append(x("div",{className:"detail-sub"},r.filter(Boolean).join(" \xB7 ")));let s=x("div",{className:"detail-actions"}),l=x("div");J(l,{label:"Open in CircleCI",size:"sm",variant:"ghost",onClick:()=>ge(p.workspace?$e(p.workspace.target,t.number):null)}),s.append(l);let i=x("div");J(i,{label:"Attach run",size:"sm",variant:"outline",onClick:()=>void Uo(mt({workflow:null,job:null,jobs:[]}))}),s.append(i),o.append(s),t.errors.length>0&&o.append(xn(t.errors.map(d=>`${d.type}: ${d.message}`).join(" \xB7 "),"notice error-text")),e.append(o);let c=x("div",{className:"scroll"});if(e.append(c),p.loadingDetail)return c.append(Co("Loading workflows")),e;if(p.workflows.length===0){let d=x("div");return c.append(d),Fe(d,{title:"No workflows",body:"This run produced no workflows."}),e}for(let d of p.workflows)c.append(ti(d,t));return e}function ti(e,t){let o=x("div",{className:"section"}),r=x("div",{className:"section-head"});r.append(x("span",{className:"section-title"},e.name)),r.append(x("span",{className:"spacer"})),r.append(x("span",{className:"muted"},At(e.createdAt,e.endedAt))),r.append(ft(e.phase,e.outcome)),o.append(r);let s=x("div",{className:"job-row-actions"}),l=x("div");if(yo(l,{label:"Rerun",size:"xs",variant:"ghost",items:[{id:"failed",label:"Rerun from failed"},{id:"all",label:"Rerun every job"}],onSelect:u=>void Bs(e,u==="failed")}),s.append(l),te(e.phase,e.outcome).active){let u=x("div");J(u,{label:"Cancel",size:"xs",variant:"ghost",onClick:()=>void Ks(e)}),s.append(u)}let i=x("div");J(i,{label:"Attach",size:"xs",variant:"outline",onClick:()=>void Uo(mt({workflow:e}))}),s.append(i);let c=x("div");J(c,{label:"Open",size:"xs",variant:"ghost",onClick:()=>ge(p.workspace?Ve(p.workspace.target,t.number,e.id):null)}),s.append(c),o.append(s);let d=p.jobs[e.id]??[];if(d.length===0)return o.append(x("p",{className:"notice"},"No jobs listed.")),o;for(let u of d){let E=u.type.toLowerCase()==="approval",_=te(u.phase,u.outcome),S=x("div",{className:"job-row"}),y=x("div",{className:"job-row-head"});y.append(x("span",{className:"job-row-name"},u.name)),y.append(x("span",{className:"job-row-meta"},[u.number>0?`#${u.number}`:"",At(u.startedAt,u.endedAt)].filter(Boolean).join(" \xB7 "))),y.append(ft(u.phase,u.outcome)),S.append(y);let L=x("div",{className:"job-row-actions"});if(E&&_.active){let q=x("div");J(q,{label:"Approve",size:"xs",onClick:()=>void yn(u,!0)}),L.append(q);let k=x("div");J(k,{label:"Reject",size:"xs",variant:"ghost",onClick:()=>void yn(u,!1)}),L.append(k)}if(ke(u.outcome)){let q=x("div");J(q,{label:"Attach failure",size:"xs",variant:"outline",onClick:()=>void Uo(mt({workflow:e,job:u}))}),L.append(q);let k=x("div");J(k,{label:"Fix with agent",size:"xs",variant:"ghost",onClick:()=>void js(mt({workflow:e,job:u}))}),L.append(k)}let X=x("div");J(X,{label:"Open",size:"xs",variant:"ghost",onClick:()=>{p.workspace&&ge(dt(p.workspace.target,t.number,e.id,u.number))}}),L.append(X),L.childElementCount>0&&S.append(L),o.append(S)}return o}B.onReady(e=>{An(e),Qr(),p.ready=e,!p.booted&&(p.booted=!0,p.connected=e.connection.connected,Cn())});B.onConnection(e=>{let t=p.connected;p.connected=e.connected,e.connected&&!t&&Cn(),!e.connected&&t&&Y()});})();
