/* Code Labs V3.8 - sync current page fields before Supabase history save */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(sel,root){return(root||document).querySelector(sel)}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}))}catch(e){}}
  function page(){return document.body&&document.body.getAttribute('data-page')||''}
  function val(sel){var el=q(sel);return el?String(el.value==null?'':el.value):null}
  function take(sel,fn){var v=val(sel);if(v!==null){fn(v);return true}return false}
  function syncNow(){
    var s=read();s.project=s.project||{};s.file=s.file||{};var f=s.file,changed=false,id=page();
    if(q('#filename')||q('#currentCode')){
      changed=take('#filename',function(v){f.filename=v||f.filename||'file.html'})||changed;
      changed=take('#currentCode',function(v){f.currentCode=v})||changed;
    }
    if(q('#problem')||q('#dontTouch')||q('#errors')||q('#packetPreview')){
      changed=take('#problem',function(v){f.problem=v})||changed;
      changed=take('#dontTouch',function(v){f.dontTouch=v})||changed;
      changed=take('#errors',function(v){f.errors=v})||changed;
      changed=take('#packetPreview',function(v){if(v)f.packet=v})||changed;
    }
    if(q('#packetFile')||q('#packetType')||q('#packetOut')){
      changed=take('#packetFile',function(v){f.filename=v||f.filename||'file.html'})||changed;
      changed=take('#packetType',function(v){f.packetType=v||f.packetType||'full-file-repair'})||changed;
      changed=take('#packetOut',function(v){f.packet=v})||changed;
    }
    if(q('#originalCode')||q('#fixedCode')){
      changed=take('#originalCode',function(v){if(v)f.currentCode=v})||changed;
      changed=take('#fixedCode',function(v){f.fixedCode=v})||changed;
    }
    if(q('#plIn')||q('#plOut')){
      changed=take('#plIn',function(v){if(v)f.currentCode=v})||changed;
      changed=take('#plOut',function(v){f.fixedCode=v})||changed;
    }
    if(q('#gwPath')||q('#gwFixed')){
      changed=take('#gwPath',function(v){if(v){f.path=v;f.filename=String(v).split('/').pop()||f.filename||'file.html';f.githubSource=f.githubSource||{};f.githubSource.path=v}})||changed;
      changed=take('#gwFixed',function(v){f.fixedCode=v})||changed;
    }
    if(changed){f.lastHistorySavePage=id;f.liveSyncedAt=new Date().toISOString();save(s)}
    return s;
  }
  function hook(){
    var api=window.CodeLabsRepairHistory;
    if(!api||!api.saveAll){setTimeout(hook,160);return}
    if(!api.__v38CurrentPageSaveSync){
      var original=api.saveAll;
      api.saveAll=function(){syncNow();return original.apply(api,arguments)};
      api.syncCurrentPageBeforeHistorySave=syncNow;
      api.__v38CurrentPageSaveSync=true;
    }
    var btn=q('#clSaveHistory');
    if(btn&&!btn.getAttribute('data-cl-v38-save-sync')){
      btn.setAttribute('data-cl-v38-save-sync','yes');
      btn.onclick=api.saveAll;
    }
  }
  function start(){hook();setTimeout(hook,400);setTimeout(hook,1000);setTimeout(hook,2200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();