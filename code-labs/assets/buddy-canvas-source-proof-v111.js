/* Code Labs Buddy Canvas V113 - source proof helper + source control/proof tools loader */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return (r||document).querySelector(s);}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function source(){var s=read();return String((s.file||{}).currentCode||'');}
  function fixed(){var el=q('#fixedCode');return el?String(el.value||''):'';}
  function chars(t){return String(t||'').length;}
  function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
  function info(){var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');var path=g.path||f.path||f.filename||'Not set';return{file:f.filename||path,path:path,repo:(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:'trevieisking/stream-bandit'),branch:g.branch||'main',loadedAt:g.loadedAt||f.codeSearchSavedAt||'',savedFilename:f.filename||''};}
  function fullSourceOk(code,path){code=String(code||'');if(!code.trim())return false;if(/\.html?$/i.test(path||'')){return /<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code);}return true;}
  function ensureUi(){
    var grid=q('.miniGrid');
    if(grid&&!q('#statChars')){var d=document.createElement('div');d.className='stat';d.innerHTML='<b>Loaded characters</b><span id="statChars">0</span>';grid.appendChild(d);}
    var proof=q('#sourceProof');
    if(!proof){var panel=q('.miniGrid');if(panel&&panel.parentNode){proof=document.createElement('div');proof.id='sourceProof';proof.className='notice';proof.style.marginTop='10px';proof.innerHTML='<b>Source proof:</b> waiting for File Lab source.';panel.parentNode.appendChild(proof);}}
    var actions=q('.stickyApply .actions');
    if(actions&&!q('#copySource')){var btn=document.createElement('button');btn.className='btn ghost';btn.id='copySource';btn.type='button';btn.textContent='Copy Source';btn.onclick=function(){var code=(q('#loadedCode')&&q('#loadedCode').value)||source();navigator.clipboard.writeText(code).catch(function(){if(q('#loadedCode')){q('#loadedCode').focus();q('#loadedCode').select();document.execCommand('copy');}});};actions.appendChild(btn);}
  }
  function report(){var i=info(),orig=source(),out=fixed(),ok=fullSourceOk(orig,i.path);return{tool:'Code Labs Buddy Canvas',version:'V113 source proof helper + source control/proof tools loader',file:i.file,path:i.path,repo:i.repo,source_branch:i.branch,source_loaded:!!orig.trim(),source_full_loaded:ok,source_is_full_page:ok,source_characters:chars(orig),source_lines:lines(orig),source_loaded_at:i.loadedAt||null,source_saved_filename:i.savedFilename||null,fixed_characters:chars(out),fixed_lines:lines(out),full_replacement_ok:ok&&!!out.trim(),source_control_loaded:!!window.CodeLabsBuddyCanvasSourceControl,proof_tools_loaded:!!window.CodeLabsBuddyCanvasProofTools,safety:'Browser repair-state proof only.'};}
  function loadHelper(src,marker){
    if(q('script['+marker+']'))return;
    var sc=document.createElement('script');
    sc.src=src;
    sc.setAttribute(marker,'yes');
    document.head.appendChild(sc);
  }
  function loadHelpers(){
    if(!window.CodeLabsBuddyCanvasSourceControl)loadHelper('assets/buddy-canvas-source-control-v112.js?v=cl-v112-source-switch','data-cl-source-control-v112');
    if(!window.CodeLabsBuddyCanvasProofTools)loadHelper('assets/buddy-canvas-proof-tools-v113.js?v=cl-v113-proof-tools','data-cl-proof-tools-v113');
  }
  function update(){
    ensureUi();
    loadHelpers();
    var i=info(),orig=source(),ok=fullSourceOk(orig,i.path);
    var stat=q('#statChars');if(stat)stat.textContent=String(chars(orig));
    var proof=q('#sourceProof');if(proof){proof.className=ok?'notice good':'notice warn';proof.innerHTML=ok?('<b>Full source loaded:</b> '+i.path+' · '+chars(orig)+' chars · '+lines(orig)+' lines.'):('<b>Source proof waiting:</b> load a complete file in File Lab or use Buddy Canvas Source Control.');}
    var existingRead=null;try{existingRead=window.CodeLabsBuddyCanvas&&window.CodeLabsBuddyCanvas.read;}catch(e){}
    window.CodeLabsBuddyCanvas={
      read:function(){var base={};try{base=existingRead?existingRead():{};}catch(e){}return Object.assign({},base,report());},
      source:function(){return (q('#loadedCode')&&q('#loadedCode').value)||source();},
      fixed:function(){return fixed();},
      state:function(){return read();},
      proof:report
    };
  }
  function boot(){update();setInterval(update,1500);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
