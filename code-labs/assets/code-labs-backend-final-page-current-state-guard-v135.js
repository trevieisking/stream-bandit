/* Code Labs Backend Final Page Current-State Guard V135
   Protects final-page backend sends from stale GitHub Writer or lane payloads.
   Browser still does not write GitHub. This only validates/sanitizes local Code Labs state before queue send.
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
function repoFrom(st,f,g){var p=st.project||{};return(g.owner&&g.repo)?g.owner+'/'+g.repo:(p.repo||'trevieisking/stream-bandit')}
function current(){var st=read(KEY),f=st.file||{},g=f.githubSource||{};return{repo:repoFrom(st,f,g),path:clean(g.path||f.path||f.filename||''),fixed:String(f.fixedCode||''),state:st}}
function writer(){var gw=read(WRITER),lane=read(LANE),ctx=lane.context||{};return{gw:gw,lane:lane,ctx:ctx,path:clean(gw.path||ctx.path||''),fixed:String(gw.fixedCode||ctx.fixed||''),branch:String(gw.branch||ctx.branch||'')}}
function stale(cur,wr){return !!(cur.path&&wr.path&&cur.path!==wr.path)}
function warningText(cur,wr){return 'Stale GitHub Writer/lane payload blocked. Current file path is '+(cur.path||'missing')+' but saved writer path is '+(wr.path||'missing')+'. Refresh GitHub Writer or clear old writer state before sending.'}
function show(msg){var box=q('#clBackendQueueProofV135'),status=q('#clBackendQueueStatusV135'),out=q('#clBackendQueueOutV135');if(status){status.className='badge bad';status.textContent='Blocked stale writer'}if(box){box.innerHTML='<div class="notice"><p><b>Warnings:</b> '+msg.replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})+'</p></div>'}if(out){out.value=JSON.stringify({ok:false,blocked:true,reason:msg},null,2)}}
function sanitize(){var cur=current(),wr=writer();if(stale(cur,wr)){return{ok:false,reason:warningText(cur,wr),current:cur,writer:wr}}if(cur.path&&cur.fixed){var gw=wr.gw||{};gw.repo=cur.repo;gw.path=cur.path;gw.fixedCode=cur.fixed;if(!gw.branch)gw.branch='code-labs-backend-create-or-update-file-'+cur.path.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,44)+'-v135';write(WRITER,gw);var lane=wr.lane||{};lane.context=lane.context||{};lane.context.repo=cur.repo;lane.context.path=cur.path;lane.context.fixed=cur.fixed;write(LANE,lane)}return{ok:true,current:cur,writer:wr}}
function bind(){if(!PAGES[page()])return;var api=window.CodeLabsBackendWriteQueueV135;if(!api||!api.send){setTimeout(bind,300);return}if(api.__finalPageCurrentStateGuard)return;var originalSend=api.send;api.send=function(){var s=sanitize();if(!s.ok){show(s.reason);return Promise.resolve({ok:false,blocked:true,reason:s.reason})}return originalSend.apply(api,arguments)};api.__finalPageCurrentStateGuard=true;var btn=q('#clBackendQueueSendV135');if(btn){btn.onclick=api.send}var s=sanitize();if(!s.ok)show(s.reason)}
function boot(){bind();setTimeout(bind,700);setTimeout(bind,1600);setInterval(bind,4500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();