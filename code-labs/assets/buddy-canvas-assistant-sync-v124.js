/* Code Labs Buddy Canvas Assistant Sync V124 - source/path/hash autosync for ChatGPT connector reads */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var LAST='codeLabsAssistantSyncV124Last';
  var timer=null;
  function q(s){return document.querySelector(s);}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function writeLast(v){try{localStorage.setItem(LAST,JSON.stringify(v||{}));}catch(e){}}
  function readLast(){try{return JSON.parse(localStorage.getItem(LAST)||'{}')||{};}catch(e){return{};}}
  function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
  function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
  function badge(msg,kind){var el=q('#assistantSyncBadge');if(!el){el=document.createElement('span');el.id='assistantSyncBadge';el.className='badge warn';var line=q('.statusLine');if(line)line.appendChild(el);}if(el){el.className='badge '+(kind||'warn');el.textContent=msg;}}
  function info(){var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');var path=g.path||f.path||f.filename||'';var repo=(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:(p.repo||'trevieisking/stream-bandit'));return{state:s,file:f,project:p,path:path,repo:repo,branch:g.branch||'main',source:String(f.currentCode||''),loadedAt:g.loadedAt||f.codeSearchSavedAt||''};}
  function ensureHistoryHelper(){return new Promise(function(resolve){if(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser)return resolve(true);if(document.querySelector('script[data-assistant-sync-history-helper]')){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser));},900);return;}var sc=document.createElement('script');sc.src='assets/code-labs-v1-2-history.js?v=assistant-sync-v124';sc.setAttribute('data-assistant-sync-history-helper','yes');sc.onload=function(){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser));},450);};sc.onerror=function(){resolve(false);};document.head.appendChild(sc);});}
  function signature(i){return [i.repo,i.branch,i.path,String(i.source.length),hash32(i.source)].join('|');}
  async function syncNow(reason){
    var i=info();
    if(!i.path||!i.source.trim()){badge('Assistant sync waiting','warn');return {ok:false,reason:'no_source'};}
    var sig=signature(i),last=readLast();
    if(last.signature===sig&&last.ok){badge('Assistant source current','good');return {ok:true,skipped:true,reason:'already_synced'};}
    badge('Assistant sync loading','warn');
    var helper=await ensureHistoryHelper();
    if(!helper){badge('Assistant sync helper missing','bad');return {ok:false,reason:'helper_missing'};}
    var cu=await window.CodeLabsRepairHistory.currentUser();
    if(!cu||!cu.user||!cu.sb){badge('Assistant sync needs Supabase','warn');return {ok:false,reason:'no_supabase_session'};}
    try{
      badge('Assistant source syncing','warn');
      var projectPayload={workspace:'assistant-current-file',site_name:'stream-bandit',site_url:i.path,repo:i.repo,mode:'assistant-current-file',notes:'Assistant-readable current source snapshot for ChatGPT connector tools.',metadata:{source:'buddy-canvas-assistant-sync-v124',path:i.path,branch:i.branch,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),reason:reason||'auto'}};
      var pr=await cu.sb.from('code_labs_projects').insert(projectPayload).select('id').single();
      if(pr.error)throw pr.error;
      var projectId=pr.data.id;
      var fr=await cu.sb.from('code_labs_files').insert({project_id:projectId,filename:i.path,file_type:(i.path.split('.').pop()||'html'),current_code:i.source,current_hash:String(i.source.length),metadata:{source:'buddy-canvas-assistant-sync-v124',repo:i.repo,branch:i.branch,path:i.path,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),loadedAt:i.loadedAt||null}}).select('id').single();
      if(fr.error)throw fr.error;
      var jr=await cu.sb.from('code_labs_jobs').insert({project_id:projectId,file_id:fr.data.id,title:('Assistant current file: '+i.path).slice(0,120),problem:'Assistant-readable current source snapshot. No fixed candidate and no GitHub write.',dont_touch:'Do not treat this as a repair request. It is source truth sync for ChatGPT tools.',errors:'',status:'saved',started_at:new Date().toISOString(),completed_at:new Date().toISOString(),metadata:{source:'buddy-canvas-assistant-sync-v124',signature:sig}}).select('id').single();
      if(jr.error)throw jr.error;
      await cu.sb.from('code_labs_audit_log').insert({project_id:projectId,job_id:jr.data.id,action:'assistant_current_file_sync',details:{filename:i.path,repo:i.repo,branch:i.branch,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source)}});
      writeLast({signature:sig,ok:true,project_id:projectId,file_id:fr.data.id,job_id:jr.data.id,synced_at:new Date().toISOString()});
      badge('Assistant source synced','good');
      return {ok:true,project_id:projectId,file_id:fr.data.id,job_id:jr.data.id};
    }catch(e){
      console.error(e);
      writeLast({signature:sig,ok:false,error:String(e&&e.message?e.message:e),synced_at:new Date().toISOString()});
      badge('Assistant sync failed','bad');
      return {ok:false,error:String(e&&e.message?e.message:e)};
    }
  }
  function schedule(reason){clearTimeout(timer);badge('Assistant sync in 6s','warn');timer=setTimeout(function(){syncNow(reason||'scheduled');},6000);}
  function watch(){var lastSig='';setInterval(function(){var i=info();var sig=i.source&&i.path?signature(i):'';if(sig&&sig!==lastSig){lastSig=sig;schedule('source_changed');}},2500);}
  function boot(){badge('Assistant sync ready','warn');schedule('boot');watch();window.CodeLabsAssistantSyncV124={syncNow:syncNow,info:info};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
