/* Code Labs Buddy Canvas V132 - compatibility guard. V104 owns live writes; no background Supabase repair-history saves. */
(function(){
  'use strict';

  var KEY='codeLabsV1State';

  function q(selector){return document.querySelector(selector);}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(error){return{};}}
  function fixed(){var element=q('#fixedCode');return element?String(element.value||''):'';}
  function source(){
    var visible=q('#loadedCode');
    var value=visible?String(visible.value||''):'';
    if(value&&value!=='No File Lab code loaded yet.')return value;
    return String((state().file||{}).currentCode||'');
  }
  function lines(value){var text=String(value||'');return text?text.split(/\r?\n/).length:0;}
  function filePath(){
    var current=state(),file=current.file||{},github=file.githubSource||{};
    return github.path||file.path||file.filename||'';
  }
  function isBuddyMarkdown(path,code){
    path=String(path||'');
    code=String(code||'');
    return /STREAM-BANDIT-BUDDY-(MEMORY|WORKBENCH)-LATEST\.md$/i.test(path)&&/^CODE LABS BUDDY /i.test(code.trim())&&code.length>120&&lines(code)>=3;
  }
  function validateFullFile(){
    var path=filePath();
    var code=fixed();
    var old=source();
    if(isBuddyMarkdown(path,code))return{ok:true,reason:'buddy_markdown'};
    if(!path)return{ok:false,reason:'target path is missing'};
    if(!code.trim())return{ok:false,reason:'fixed canvas is empty'};
    if(/BEGIN PATCH|Find:\s*\n|Replace with:|JSON START|CODE LABS SAFE WRITE REQUEST/i.test(code))return{ok:false,reason:'fixed canvas contains a patch or request, not a full file'};
    if(/\.html?$/i.test(path)&&!(/<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code)))return{ok:false,reason:'HTML target is not a complete HTML document'};
    if(old.trim()&&code.length<Math.max(120,Math.floor(old.length*.65)))return{ok:false,reason:'fixed canvas is much smaller than the visible source'};
    if(lines(code)<3&&code.length<120)return{ok:false,reason:'fixed canvas looks like a snippet'};
    return{ok:true,reason:'complete_file'};
  }
  function setBadge(){
    var element=q('#buddyCanvasSupabaseBadge');
    if(!element){
      element=document.createElement('span');
      element.id='buddyCanvasSupabaseBadge';
      element.className='badge good';
      var line=q('.statusLine');
      if(line)line.appendChild(element);
    }
    element.className='badge good';
    element.textContent='V104 connector writes';
    element.title='Background Supabase repair-history saving is disabled. Live changes use the V104 connector and receipts.';
  }
  function noBackgroundSave(){
    setBadge();
    return Promise.resolve({ok:true,skipped:true,reason:'background_supabase_autosave_disabled',owner:'code-labs-v104'});
  }
  function boot(){setBadge();}

  window.CodeLabsBuddyCanvasSupabaseAutosaveV132={
    version:'V132',
    backgroundSupabaseAutosave:false,
    owner:'code-labs-v104',
    validate:validateFullFile,
    save:noBackgroundSave
  };
  window.CodeLabsBuddyCanvasSupabaseAutosaveV131=window.CodeLabsBuddyCanvasSupabaseAutosaveV132;

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
