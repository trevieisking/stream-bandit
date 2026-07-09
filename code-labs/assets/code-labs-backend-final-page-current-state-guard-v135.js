/* Code Labs Backend Final Page Current-State Guard V135.3
   Protects final-page backend sends from stale GitHub Writer or lane payloads.
   Browser still does not write GitHub. This validates/sanitizes local Code Labs state only when Send is clicked.
   It must not repaint the backend panel on a timer.
*/
(function(){
'use strict';
var KEY='codeLabsV1State';
var WRITER='codeLabsGithubWriterV2';
var LANE='codeLabsGithubLaneAutopilotV131';
var PAGES={'preview-test':1,checkpoints:1,help:1,faq:1,about:1};
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body&&document.body.getAttribute('data-page')||''}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return{}}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v||{}));return true}catch(e){return false}}
function clean(v){return String(v||'').replace(/^\/+/, '').replace(/\.\.\//g,'')}
function slug(v){return String(v||'file').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,44)||'file'}
function repoFrom(st,f,g){var p=st.project||{};return(g.owner&&g.repo)?g.owner+'/'+g.repo:(p.repo||'trevieisking/stream-bandit')}
function current(){var st=read(KEY),f=st.file||{},g=f.githubSource||{};return{repo:repoFrom(st,f,g),path:clean(g.path||f.path||f.filename||''),fixed:String(f.fixedCode||''),state:st}}
function saved(){var gw=read(WRITER),lane=read(LANE),ctx=lane.context||{};return{gw:gw,lane:lane,ctx:ctx,gwPath:clean(gw.path||''),ctxPath:clean(ctx.path||''),gwFixed:String(gw.fixedCode||''),ctxFixed:String(ctx.fixed||''),gwBranch:String(gw.branch||''),ctxBranch:String(ctx.branch||'')}}
function staleReason(cur,sv){if(!cur.path)return'';if(sv.gwPath&&sv.gwPath!==cur.path)return 'Stale GitHub Writer path blocked. Current file path is '+cur.path+' but saved writer path is '+sv.gwPath+'. Refresh GitHub Writer or clear old writer state before sending.';if(sv.ctxPath&&sv.ctxPath!==cur.path)return 'Stale GitHub lane context blocked. Current file path is '+cur.path+' but saved lane path is '+sv.ctxPath+'. Refresh GitHub Writer or clear old lane state before sending.';if(!cur.fixed&&sv.ctxFixed&&!sv.ctxPath)return 'GitHub lane fixed output has no matching path. Refresh GitHub Writer or clear old lane state before sending.';return''}
function escMsg(msg){return String(msg||'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function show(msg){var box=q('#clBackendQueueProofV135'),status=q('#clBackendQueueStatusV135'),out=q('#clBackendQueueOutV135');if(status){status.className='badge bad';status.textContent='Blocked stale writer'}if(box){box.innerHTML='<div class="notice"><p><b>Warnings:</b> '+escMsg(msg)+'</p></div>'}if(out){out.value=JSON.stringify({ok:false,blocked:true,reason:msg},null,2)}}
function sanitize(){var cur=current(),sv=saved(),bad=staleReason(cur,sv);if(bad)return{ok:false,reason:bad,current:cur,saved:sv};var fixed=cur.fixed||sv.gwFixed||sv.ctxFixed||'';if(cur.path&&fixed){var branch=sv.gwBranch||sv.ctxBranch||('code-labs-backend-create-or-update-file-'+slug(cur.path)+'-v135');var gw=sv.gw||{};gw.repo=cur.repo;gw.path=cur.path;gw.fixedCode=fixed;gw.branch=branch;write(WRITER,gw);var lane=sv.lane||{};lane.context=lane.context||{};lane.context.repo=cur.repo;lane.context.path=cur.path;lane.context.fixed=fixed;lane.context.branch=branch;write(LANE,lane)}return{ok:true,current:cur,saved:sv}}
function rebindButton(api){var btn=q('#clBackendQueueSendV135');if(btn&&btn.__clGuardedSend!==api.send){btn.onclick=api.send;btn.__clGuardedSend=api.send}}
function bind(){if(!PAGES[page()])return;var api=window.CodeLabsBackendWriteQueueV135;if(!api||!api.send){setTimeout(bind,300);return}if(!api.__finalPageCurrentStateGuard){var originalSend=api.send;api.send=function(){var s=sanitize();if(!s.ok){show(s.reason);return Promise.resolve({ok:false,blocked:true,reason:s.reason})}return originalSend.apply(api,arguments)};api.__finalPageCurrentStateGuard=true;api.__finalPageCurrentStateGuardVersion='V135.3'}rebindButton(api)}
function boot(){bind();setTimeout(bind,500);setTimeout(bind,1000);setTimeout(bind,1800);setTimeout(bind,3200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
