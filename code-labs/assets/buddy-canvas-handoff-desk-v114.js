/* Code Labs Buddy Canvas V114 - Handoff Desk
   Local-only request builder for ChatGPT/GitHub connector workflows.
   No browser GitHub write. No browser merge. No Supabase write/delete. No backend function.
*/
(function(){
'use strict';
var KEY='codeLabsV1State';
function q(s,r){return(r||document).querySelector(s);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}));return true;}catch(e){return false;}}
function val(sel){var el=q(sel);return el?String(el.value||''):'';}
function setVal(sel,v){var el=q(sel);if(el)el.value=String(v||'');}
function text(sel,v){var el=q(sel);if(el)el.textContent=String(v||'');}
function chars(t){return String(t||'').length;}
function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
function toast(msg){var t=q('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}else{console.log(msg);}}
function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
function slug(v){return String(v||'file').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,54)||'file';}
function info(){var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');var path=g.path||f.path||f.filename||'';var repo=(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:(p.repo||'trevieisking/stream-bandit'));return{state:s,file:f,path:path,repo:repo,branch:g.branch||'main'};}
function fixed(){return val('#fixedCode')||String((read().file||{}).fixedCode||'');}
function source(){return val('#loadedCode')||String((read().file||{}).currentCode||'');}
function defaultBranch(path){return 'code-labs-canvas-'+slug(path)+'-handoff';}
function defaultTitle(path){return 'Code Labs: update '+(path||'file');}
function fullOk(code,path){code=String(code||'');if(!code.trim())return false;if(/\.html?$/i.test(path||''))return /<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code);return true;}
function copy(v,msg){v=String(v||'');navigator.clipboard.writeText(v).then(function(){toast(msg||'Copied.');}).catch(function(){var out=q('#clHandoffOut');if(out){out.value=v;out.focus();out.select();document.execCommand('copy');toast(msg||'Selected/copied.');}});}
function ensureUi(){
 var main=q('.main');
 if(!main||q('#clHandoffDesk'))return;
 var panel=document.createElement('section');
 panel.id='clHandoffDesk';
 panel.className='panel';
 panel.style.border='3px solid rgba(124,60,255,.42)';
 panel.innerHTML='\
 <h2>Buddy Canvas Handoff Desk</h2>\
 <p class="muted">Build a safe handoff packet from this canvas. This panel does not write GitHub, does not merge, does not delete, and does not write Supabase. ChatGPT/GitHub tools still do the controlled branch/PR work.</p>\
 <div class="actions" style="align-items:center">\
   <label class="readonlyNote">Action <select id="clHandoffAction"><option value="update_file">edit existing file</option><option value="create_file">add new file</option><option value="create_or_update_file">create or update</option></select></label>\
   <input id="clHandoffPath" type="text" placeholder="repo path" style="min-width:260px;flex:1;border-radius:999px;border:1px solid #ffffff24;padding:10px 12px;background:#0005;color:inherit">\
   <input id="clHandoffBranch" type="text" placeholder="branch" style="min-width:220px;flex:1;border-radius:999px;border:1px solid #ffffff24;padding:10px 12px;background:#0005;color:inherit">\
 </div>\
 <div class="actions" style="align-items:center">\
   <input id="clHandoffCommit" type="text" placeholder="commit message" style="min-width:260px;flex:1;border-radius:999px;border:1px solid #ffffff24;padding:10px 12px;background:#0005;color:inherit">\
   <input id="clHandoffTitle" type="text" placeholder="PR title" style="min-width:260px;flex:1;border-radius:999px;border:1px solid #ffffff24;padding:10px 12px;background:#0005;color:inherit">\
 </div>\
 <textarea id="clHandoffBody" class="bigReport" placeholder="PR body / notes" style="min-height:130px"></textarea>\
 <div class="actions">\
   <button class="btn ghost" id="clHandoffBuild" type="button">Build Handoff Packet</button>\
   <button class="btn primary" id="clHandoffCopy" type="button">Copy Handoff Packet</button>\
   <button class="btn ghost" id="clHandoffCopyCode" type="button">Copy Fixed File Only</button>\
   <button class="btn ghost" id="clHandoffCheckpoint" type="button">Save Local Checkpoint</button>\
   <button class="btn ghost" id="clHandoffCopyCheckpoint" type="button">Copy Checkpoint Receipt</button>\
   <span id="clHandoffStatus" class="badge warn">Waiting</span>\
 </div>\
 <div id="clHandoffSummary" class="readonlyNote">No handoff built yet.</div>\
 <textarea id="clHandoffOut" class="bigReport" readonly placeholder="Handoff packet appears here"></textarea>';
 var after=q('#clProofPanel')||q('#clSourceControlPanel')||q('#sourceProof')||q('.stickyApply')||q('.hero');
 if(after&&after.parentNode)after.parentNode.insertBefore(panel,after.nextSibling);else main.insertBefore(panel,main.firstChild);
 seedFields();
 q('#clHandoffBuild').onclick=renderPacket;
 q('#clHandoffCopy').onclick=function(){var p=packet();setVal('#clHandoffOut',JSON.stringify(p,null,2));copy(JSON.stringify(p,null,2),'Handoff packet copied.');};
 q('#clHandoffCopyCode').onclick=function(){copy(fixed(),'Fixed file copied.');};
 q('#clHandoffCheckpoint').onclick=saveCheckpoint;
 q('#clHandoffCopyCheckpoint').onclick=function(){copy(JSON.stringify(checkpointObject(),null,2),'Checkpoint receipt copied.');};
}
function seedFields(){var i=info();var path=i.path||'';setVal('#clHandoffPath',path);setVal('#clHandoffBranch',defaultBranch(path));setVal('#clHandoffCommit','Code Labs handoff: update '+(path||'file'));setVal('#clHandoffTitle',defaultTitle(path));setVal('#clHandoffBody','## Summary\n- Handoff packet built from Buddy Canvas.\n\n## Safety\n- Branch/PR only.\n- Do not write main directly.\n- Preserve auth, routes, Supabase, accessibility, and working features unless this file explicitly owns them.\n\n## Test plan\n- Open the changed page/file.\n- Confirm source/fixed counts match the Buddy Canvas proof.\n- Run page-specific checks before promotion.');}
function packet(){var i=info(),path=val('#clHandoffPath')||i.path,code=fixed();return{tool:'Code Labs Buddy Canvas Handoff Desk',version:'V114',repo:i.repo,path:path,action:val('#clHandoffAction')||'update_file',branch:val('#clHandoffBranch')||defaultBranch(path),commit_message:val('#clHandoffCommit')||('Code Labs handoff: update '+path),pr_title:val('#clHandoffTitle')||defaultTitle(path),pr_body:val('#clHandoffBody')||'',content:code,content_characters:chars(code),content_lines:lines(code),content_hash:hash32(code),source_characters:chars(source()),source_lines:lines(source()),full_replacement_ok:fullOk(code,path),safety:{browser_github_write:false,browser_merge:false,browser_supabase_write:false,browser_delete:false,chatgpt_connector_required:true}};}
function renderPacket(){var p=packet();setVal('#clHandoffOut',JSON.stringify(p,null,2));text('#clHandoffStatus',p.full_replacement_ok?'Packet ready':'Check file');var st=q('#clHandoffStatus');if(st)st.className='badge '+(p.full_replacement_ok?'good':'warn');text('#clHandoffSummary','Path: '+(p.path||'not set')+' | action: '+p.action+' | content '+p.content_characters+' chars / '+p.content_lines+' lines | hash '+p.content_hash);}
function checkpointObject(){var i=info(),code=fixed(),path=val('#clHandoffPath')||i.path;return{tool:'Code Labs Buddy Canvas Local Checkpoint',version:'V114',path:path,repo:i.repo,created_at:new Date().toISOString(),characters:chars(code),lines:lines(code),hash:hash32(code),note:'Local checkpoint receipt only. Use Save Now Backup if you also want normal Code Labs history.'};}
function saveCheckpoint(){var s=read(),i=info(),code=fixed(),path=val('#clHandoffPath')||i.path;s.checkpoints=s.checkpoints||[];s.checkpoints.unshift({kind:'buddy-canvas-handoff',label:'Buddy Canvas handoff '+path,filename:path,code:code,note:'Local checkpoint from Buddy Canvas Handoff Desk V114',created_at:new Date().toISOString(),hash:hash32(code),characters:chars(code),lines:lines(code)});s.checkpoints=s.checkpoints.slice(0,20);if(write(s)){text('#clHandoffStatus','Checkpoint saved');var st=q('#clHandoffStatus');if(st)st.className='badge good';setVal('#clHandoffOut',JSON.stringify(checkpointObject(),null,2));toast('Local checkpoint saved.');}else{toast('Checkpoint save failed.');}}
function expose(){window.CodeLabsBuddyCanvasHandoffDesk={version:'V114',packet:packet,checkpoint:checkpointObject,render:renderPacket,safety:function(){return{browser_github_write:false,browser_merge:false,browser_supabase_write:false,browser_delete:false};}};}
function boot(){ensureUi();expose();renderPacket();setInterval(function(){if(q('#clHandoffDesk'))renderPacket();},4000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
