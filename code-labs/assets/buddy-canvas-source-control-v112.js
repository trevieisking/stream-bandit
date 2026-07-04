/* Code Labs Buddy Canvas V112 - GitHub / Supabase / Code Labs read switch
   Purpose: preview and load a trusted source copy before a repair pass.
   Safety: read-only by default. Load writes local Code Labs browser state only.
*/
(function(){
'use strict';

var KEY='codeLabsV1State';
var selected=null;

function q(s,r){return(r||document).querySelector(s);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}));return true;}catch(e){return false;}}
function val(sel){var el=q(sel);return el?String(el.value||''):'';}
function setVal(sel,v){var el=q(sel);if(el)el.value=String(v||'');}
function text(sel,v){var el=q(sel);if(el)el.textContent=String(v||'');}
function toast(msg){var t=q('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2400);}else{console.log(msg);}}
function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
function chars(t){return String(t||'').length;}
function basename(path){var p=String(path||'').split(/[?#]/)[0].replace(/^\/+|\/+$/g,'');var a=p.split('/');return a[a.length-1]||p||'';}
function cleanPath(path){return String(path||'').trim().replace(/^https?:\/\/[^/]+\//,'').replace(/^\/+/, '');}
function encodePath(path){return cleanPath(path).split('/').map(function(x){return encodeURIComponent(x);}).join('/');}
function splitRepo(repo){var parts=String(repo||'trevieisking/stream-bandit').split('/');return{owner:parts[0]||'trevieisking',repo:parts[1]||'stream-bandit'};}
function stateInfo(){
  var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');
  var path=cleanPath(val('#clSourcePath')||g.path||f.path||f.filename||'');
  var repo=(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:(p.repo||'trevieisking/stream-bandit'));
  return{state:s,file:f,github:g,project:p,path:path,repo:repo,branch:g.branch||'main'};
}
function rawUrl(repo,branch,path){var r=splitRepo(repo);return 'https://raw.githubusercontent.com/'+encodeURIComponent(r.owner)+'/'+encodeURIComponent(r.repo)+'/'+encodeURIComponent(branch||'main')+'/'+encodePath(path);}
function sourceLooksFull(code,path){code=String(code||'');if(!code.trim())return false;if(/\.html?$/i.test(path||''))return /<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code);return true;}
function setStatus(msg,kind){var e=q('#clSourceControlStatus');if(e){e.className='badge '+(kind||'warn');e.textContent=msg;}}
function currentCanvasCode(){return val('#loadedCode')||String(((read().file||{}).currentCode)||'');}
function renderCompare(){
  var cur=currentCanvasCode(), code=selected?selected.code:'';
  var out=q('#clSourceCompare');
  if(!out)return;
  if(!selected){out.innerHTML='<b>Compare:</b> no selected source yet.';return;}
  var same=cur===code;
  out.innerHTML='<b>Compare:</b> '+esc(selected.label)+' · '+chars(code)+' chars · '+lines(code)+' lines · canvas '+chars(cur)+' chars · '+lines(cur)+' lines · '+(same?'same as canvas':'different from canvas');
}
function choose(kind,label,code,meta){
  meta=meta||{};
  selected={kind:kind,label:label,code:String(code||''),path:cleanPath(meta.path||stateInfo().path),repo:meta.repo||stateInfo().repo,branch:meta.branch||stateInfo().branch,loadedAt:new Date().toISOString(),meta:meta};
  setVal('#clSourcePreview',selected.code);
  text('#clSourceMeta',label+' · '+selected.path+' · '+chars(selected.code)+' chars · '+lines(selected.code)+' lines');
  setStatus(kind+' ready',sourceLooksFull(selected.code,selected.path)?'good':'warn');
  renderCompare();
  toast(label+' loaded into preview. Press Load Into Buddy Canvas Source to use it.');
}
function ensureUi(){
  var main=q('.main');
  if(!main||q('#clSourceControlPanel'))return;
  var panel=document.createElement('section');
  panel.id='clSourceControlPanel';
  panel.className='panel';
  panel.style.border='3px solid rgba(65,232,255,.35)';
  panel.innerHTML='\
    <h2>Buddy Canvas Source Control</h2>\
    <p class="muted"><b>Read switch:</b> choose GitHub Read, Supabase Read, or Code Labs Read, preview the result, then load it into the left source canvas when it is the right file. Reads do not save, delete, write GitHub, or change schema.</p>\
    <div class="actions" style="align-items:center">\
      <span id="clSourceControlStatus" class="badge warn">Source switch ready</span>\
      <input id="clSourcePath" type="text" placeholder="path or filename" style="min-width:280px;flex:1;border-radius:999px;border:1px solid #ffffff24;padding:10px 12px;background:#0005;color:inherit">\
      <button class="btn ghost" id="clReadGithub" type="button">GitHub Read</button>\
      <button class="btn ghost" id="clReadSupabase" type="button">Supabase Read</button>\
      <button class="btn ghost" id="clReadCodeLabs" type="button">Code Labs Read</button>\
      <button class="btn primary" id="clLoadSourcePreview" type="button">Load Into Buddy Canvas Source</button>\
      <button class="btn ghost" id="clCopySourcePreview" type="button">Copy Preview</button>\
    </div>\
    <p id="clSourceMeta" class="readonlyNote">No source preview yet.</p>\
    <p id="clSourceCompare" class="readonlyNote"><b>Compare:</b> no selected source yet.</p>\
    <textarea id="clSourcePreview" class="bigReport" readonly placeholder="Selected source preview appears here"></textarea>';
  var after=q('.stickyApply')||q('.hero')||q('.topbar');
  if(after&&after.parentNode)after.parentNode.insertBefore(panel,after.nextSibling);else main.insertBefore(panel,main.firstChild);
  var i=stateInfo();
  setVal('#clSourcePath',i.path);
  q('#clReadGithub').onclick=readGitHub;
  q('#clReadSupabase').onclick=readSupabase;
  q('#clReadCodeLabs').onclick=readCodeLabs;
  q('#clLoadSourcePreview').onclick=loadSelected;
  q('#clCopySourcePreview').onclick=function(){var code=val('#clSourcePreview');navigator.clipboard.writeText(code).then(function(){toast('Source preview copied.');}).catch(function(){var e=q('#clSourcePreview');if(e){e.focus();e.select();document.execCommand('copy');toast('Source preview selected/copied.');}});};
}
async function readGitHub(){
  try{
    var i=stateInfo();
    if(!i.path)throw new Error('No path set. Load File Lab first or type a path.');
    setStatus('Reading GitHub','warn');
    var url=rawUrl(i.repo,i.branch,i.path)+'?v='+Date.now();
    var r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw new Error('GitHub read failed '+r.status+' for '+i.path);
    var code=await r.text();
    choose('github','GitHub Read',code,{path:i.path,repo:i.repo,branch:i.branch,raw:url.replace(/\?v=.*/, '')});
  }catch(err){console.error(err);setStatus('GitHub read failed','bad');toast(err.message||String(err));}
}
function ensureHistoryHelper(){return new Promise(function(resolve){
  if(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser)return resolve(true);
  if(q('script[data-cl-source-history-helper]')){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser));},800);return;}
  var sc=document.createElement('script');
  sc.src='assets/code-labs-v1-2-history.js?v=source-control-v112';
  sc.setAttribute('data-cl-source-history-helper','yes');
  sc.onload=function(){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser));},400);};
  sc.onerror=function(){resolve(false);};
  document.head.appendChild(sc);
});}
async function readSupabase(){
  try{
    var i=stateInfo();
    if(!i.path)throw new Error('No path set. Load File Lab first or type a filename.');
    setStatus('Reading Supabase','warn');
    var ok=await ensureHistoryHelper();
    if(!ok)throw new Error('Code Labs Supabase helper unavailable.');
    var cu=await window.CodeLabsRepairHistory.currentUser();
    if(!cu||!cu.user||!cu.sb)throw new Error('Connect Code Labs Supabase first, then retry Supabase Read.');
    var fields='id,project_id,filename,current_code,current_hash,metadata,updated_at,created_at';
    var r=await cu.sb.from('code_labs_files').select(fields).eq('filename',i.path).order('updated_at',{ascending:false}).limit(1);
    if(r.error)throw r.error;
    if(!r.data||!r.data.length){
      r=await cu.sb.from('code_labs_files').select(fields).eq('filename',basename(i.path)).order('updated_at',{ascending:false}).limit(1);
      if(r.error)throw r.error;
    }
    if(!r.data||!r.data.length){
      r=await cu.sb.from('code_labs_files').select(fields).ilike('filename','%'+basename(i.path)+'%').order('updated_at',{ascending:false}).limit(1);
      if(r.error)throw r.error;
    }
    if(!r.data||!r.data.length)throw new Error('No Supabase Code Labs file row found for '+i.path);
    var row=r.data[0];
    choose('supabase','Supabase Read',row.current_code||'',{path:row.filename||i.path,repo:i.repo,branch:i.branch,row_id:row.id,project_id:row.project_id,updated_at:row.updated_at,hash:row.current_hash});
  }catch(err){console.error(err);setStatus('Supabase read failed','bad');toast(err.message||String(err));}
}
function readCodeLabs(){
  try{
    var i=stateInfo();
    var code=String((i.file&&i.file.currentCode)||val('#loadedCode')||'');
    if(!code.trim())code=String((i.file&&i.file.fixedCode)||val('#fixedCode')||'');
    if(!code.trim())throw new Error('No Code Labs local source found. Load File Lab or read GitHub/Supabase first.');
    choose('code_labs','Code Labs Read',code,{path:i.path||i.file.filename||'file.html',repo:i.repo,branch:i.branch,loaded_at:(i.github&&i.github.loadedAt)||i.file.codeSearchSavedAt||null});
  }catch(err){console.error(err);setStatus('Code Labs read failed','bad');toast(err.message||String(err));}
}
function loadSelected(){
  try{
    if(!selected||!selected.code)throw new Error('Read a source first.');
    var s=read();
    s.file=s.file||{};
    s.project=s.project||{};
    s.file.currentCode=selected.code;
    s.file.filename=selected.path||s.file.filename||'file.html';
    s.file.path=selected.path||s.file.path||s.file.filename;
    s.file.sourceSwitch={version:'V112',source:selected.kind,label:selected.label,loadedAt:selected.loadedAt,characters:chars(selected.code),lines:lines(selected.code),meta:selected.meta||{}};
    if(selected.kind==='github'){
      var r=splitRepo(selected.repo);
      s.file.githubSource={owner:r.owner,repo:r.repo,path:selected.path,branch:selected.branch||'main',raw:selected.meta&&selected.meta.raw||rawUrl(selected.repo,selected.branch,selected.path),loadedAt:selected.loadedAt,loadedBy:'buddy-canvas-source-control-v112'};
    }
    if(selected.kind==='supabase'){
      s.file.supabaseSource={rowId:selected.meta.row_id||'',projectId:selected.meta.project_id||'',updatedAt:selected.meta.updated_at||'',loadedAt:selected.loadedAt,loadedBy:'buddy-canvas-source-control-v112'};
    }
    s.project.repo=selected.repo||s.project.repo||'trevieisking/stream-bandit';
    s.project.siteName=s.project.siteName||'stream-bandit';
    s.project.siteUrl=selected.path||s.project.siteUrl||'';
    s.log=s.log||[];
    s.log.unshift({id:'cl_source_'+Date.now(),date:new Date().toLocaleString(),msg:'Buddy Canvas Source Control loaded '+selected.label+' for '+(selected.path||'file')});
    s.log=s.log.slice(0,80);
    if(!write(s))throw new Error('Could not write Code Labs local state.');
    setVal('#loadedCode',selected.code);
    text('#statFile',s.file.filename);
    text('#statPath',s.file.path);
    text('#statRepo',s.project.repo);
    text('#statBranch',(s.file.githubSource&&s.file.githubSource.branch)||selected.branch||'main');
    text('#statLines',String(lines(selected.code)));
    text('#statChars',String(chars(selected.code)));
    try{if(window.CodeLabsCurrentFileBridge&&window.CodeLabsCurrentFileBridge.hydrate)window.CodeLabsCurrentFileBridge.hydrate();}catch(e){}
    try{document.dispatchEvent(new CustomEvent('code-labs-source-control-loaded',{detail:{source:selected.kind,path:selected.path,characters:chars(selected.code),lines:lines(selected.code)}}));}catch(e){}
    setStatus('Loaded into canvas','good');
    renderCompare();
    toast('Loaded into Buddy Canvas source. Right fixed canvas was not overwritten.');
  }catch(err){console.error(err);setStatus('Load failed','bad');toast(err.message||String(err));}
}
function expose(){
  window.CodeLabsBuddyCanvasSourceControl={
    version:'V112',
    current:function(){return selected;},
    readGitHub:readGitHub,
    readSupabase:readSupabase,
    readCodeLabs:readCodeLabs,
    loadSelected:loadSelected,
    safety:function(){return{read_only_by_default:true,github_write:false,supabase_write:false,delete:false,local_write_only_on_load:true};}
  };
}
function boot(){ensureUi();expose();setInterval(function(){if(q('#clSourceControlPanel'))renderCompare();},2000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
