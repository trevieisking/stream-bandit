/* Code Labs Buddy Canvas Assistant Sync V243 - reuse one assistant current-file tree per repo/branch/path */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var LAST='codeLabsAssistantSyncV124Last';
  var SOURCE='buddy-canvas-assistant-sync-v243';
  var LEGACY_SOURCE='buddy-canvas-assistant-sync-v124';
  var timer=null;
  function q(s){return document.querySelector(s);}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function writeLast(v){try{localStorage.setItem(LAST,JSON.stringify(v||{}));}catch(e){}}
  function readLast(){try{return JSON.parse(localStorage.getItem(LAST)||'{}')||{};}catch(e){return{};}}
  function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
  function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
  function badge(msg,kind){var el=q('#assistantSyncBadge');if(!el){el=document.createElement('span');el.id='assistantSyncBadge';el.className='badge warn';var line=q('.statusLine');if(line)line.appendChild(el);}if(el){el.className='badge '+(kind||'warn');el.textContent=msg;}}
  function info(){var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');var path=g.path||f.path||f.filename||'';var repo=(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:(p.repo||'trevieisking/stream-bandit'));return{state:s,file:f,project:p,path:path,repo:repo,branch:g.branch||'main',source:String(f.currentCode||''),loadedAt:g.loadedAt||f.codeSearchSavedAt||''};}
  function ensureHistoryHelper(){return new Promise(function(resolve){if(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser)return resolve(true);if(document.querySelector('script[data-assistant-sync-history-helper]')){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser));},900);return;}var sc=document.createElement('script');sc.src='assets/code-labs-v1-2-history.js?v=assistant-sync-v243';sc.setAttribute('data-assistant-sync-history-helper','yes');sc.onload=function(){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.currentUser));},450);};sc.onerror=function(){resolve(false);};document.head.appendChild(sc);});}
  function signature(i){return [i.repo,i.branch,i.path,String(i.source.length),hash32(i.source)].join('|');}
  function identityMatches(row,i){var m=row&&row.metadata||{};return (m.source===SOURCE||m.source===LEGACY_SOURCE)&&String(m.path||row.site_url||'')===i.path&&String(m.branch||'main')===i.branch;}
  async function findTree(sb,i){
    var result=await sb.from('code_labs_projects').select('id,metadata,created_at').eq('mode','assistant-current-file').eq('repo',i.repo).eq('site_url',i.path).order('created_at',{ascending:false}).limit(20);
    if(result.error)throw result.error;
    var project=(result.data||[]).filter(function(row){return identityMatches(row,i);})[0]||null;
    if(!project)return null;
    var files=await sb.from('code_labs_files').select('id,created_at').eq('project_id',project.id).order('created_at',{ascending:false}).limit(1);
    if(files.error)throw files.error;
    var jobs=await sb.from('code_labs_jobs').select('id,created_at').eq('project_id',project.id).order('created_at',{ascending:false}).limit(1);
    if(jobs.error)throw jobs.error;
    return{project_id:project.id,file_id:files.data&&files.data[0]?files.data[0].id:'',job_id:jobs.data&&jobs.data[0]?jobs.data[0].id:''};
  }
  async function createTree(sb,i,sig,reason,now){
    var projectPayload={workspace:'assistant-current-file',site_name:'stream-bandit',site_url:i.path,repo:i.repo,mode:'assistant-current-file',notes:'Assistant-readable current source pointer for ChatGPT connector tools.',metadata:{source:SOURCE,path:i.path,branch:i.branch,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),reason:reason||'auto',reuses_current_tree:true}};
    var pr=await sb.from('code_labs_projects').insert(projectPayload).select('id').single();
    if(pr.error)throw pr.error;
    var projectId=pr.data.id;
    var fr=await sb.from('code_labs_files').insert({project_id:projectId,filename:i.path,file_type:(i.path.split('.').pop()||'html'),current_code:i.source,current_hash:String(i.source.length),metadata:{source:SOURCE,repo:i.repo,branch:i.branch,path:i.path,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),loadedAt:i.loadedAt||null,reuses_current_tree:true}}).select('id').single();
    if(fr.error)throw fr.error;
    var jr=await sb.from('code_labs_jobs').insert({project_id:projectId,file_id:fr.data.id,title:('Assistant current file: '+i.path).slice(0,120),problem:'Assistant-readable current source pointer. No fixed candidate and no GitHub write.',dont_touch:'Do not treat this as a repair request. It is current source truth for ChatGPT tools.',errors:'',status:'saved',started_at:now,completed_at:now,metadata:{source:SOURCE,signature:sig,reuses_current_tree:true}}).select('id').single();
    if(jr.error)throw jr.error;
    return{project_id:projectId,file_id:fr.data.id,job_id:jr.data.id,created:true};
  }
  async function updateTree(sb,tree,i,sig,reason,now){
    var projectMeta={source:SOURCE,path:i.path,branch:i.branch,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),reason:reason||'auto',reuses_current_tree:true,last_synced_at:now};
    var pr=await sb.from('code_labs_projects').update({workspace:'assistant-current-file',site_name:'stream-bandit',site_url:i.path,repo:i.repo,mode:'assistant-current-file',notes:'Assistant-readable current source pointer for ChatGPT connector tools.',metadata:projectMeta,updated_at:now}).eq('id',tree.project_id).select('id').maybeSingle();
    if(pr.error)throw pr.error;
    if(!pr.data)throw new Error('Assistant current-file project was not available.');
    var filePayload={filename:i.path,file_type:(i.path.split('.').pop()||'html'),current_code:i.source,current_hash:String(i.source.length),metadata:{source:SOURCE,repo:i.repo,branch:i.branch,path:i.path,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),loadedAt:i.loadedAt||null,reuses_current_tree:true,last_synced_at:now},updated_at:now};
    if(tree.file_id){var fr=await sb.from('code_labs_files').update(filePayload).eq('id',tree.file_id).select('id').maybeSingle();if(fr.error)throw fr.error;if(!fr.data)throw new Error('Assistant current-file row was not available.');}
    else{var fi=await sb.from('code_labs_files').insert(Object.assign({project_id:tree.project_id},filePayload)).select('id').single();if(fi.error)throw fi.error;tree.file_id=fi.data.id;}
    var jobPayload={file_id:tree.file_id,title:('Assistant current file: '+i.path).slice(0,120),problem:'Assistant-readable current source pointer. No fixed candidate and no GitHub write.',dont_touch:'Do not treat this as a repair request. It is current source truth for ChatGPT tools.',errors:'',status:'saved',completed_at:now,metadata:{source:SOURCE,signature:sig,reuses_current_tree:true,last_synced_at:now},updated_at:now};
    if(tree.job_id){var jr=await sb.from('code_labs_jobs').update(jobPayload).eq('id',tree.job_id).select('id').maybeSingle();if(jr.error)throw jr.error;if(!jr.data)throw new Error('Assistant current-file job was not available.');}
    else{var ji=await sb.from('code_labs_jobs').insert(Object.assign({project_id:tree.project_id,started_at:now},jobPayload)).select('id').single();if(ji.error)throw ji.error;tree.job_id=ji.data.id;}
    tree.created=false;
    return tree;
  }
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
      var now=new Date().toISOString();
      var tree=await findTree(cu.sb,i);
      tree=tree?await updateTree(cu.sb,tree,i,sig,reason,now):await createTree(cu.sb,i,sig,reason,now);
      await cu.sb.from('code_labs_audit_log').insert({project_id:tree.project_id,job_id:tree.job_id,action:tree.created?'assistant_current_file_created':'assistant_current_file_updated',details:{filename:i.path,repo:i.repo,branch:i.branch,hash32:hash32(i.source),characters:i.source.length,lines:lines(i.source),source:SOURCE}});
      writeLast({signature:sig,ok:true,project_id:tree.project_id,file_id:tree.file_id,job_id:tree.job_id,synced_at:now,reused:!tree.created});
      badge(tree.created?'Assistant source created':'Assistant source updated','good');
      return{ok:true,project_id:tree.project_id,file_id:tree.file_id,job_id:tree.job_id,reused:!tree.created};
    }catch(e){
      console.error(e);
      writeLast({signature:sig,ok:false,error:String(e&&e.message?e.message:e),synced_at:new Date().toISOString()});
      badge('Assistant sync failed','bad');
      return{ok:false,error:String(e&&e.message?e.message:e)};
    }
  }
  function schedule(reason){clearTimeout(timer);badge('Assistant sync in 6s','warn');timer=setTimeout(function(){syncNow(reason||'scheduled');},6000);}
  function watch(){var lastSig='';setInterval(function(){var i=info();var sig=i.source&&i.path?signature(i):'';if(sig&&sig!==lastSig){lastSig=sig;schedule('source_changed');}},2500);}
  function boot(){badge('Assistant sync ready','warn');schedule('boot');watch();window.CodeLabsAssistantSyncV124={version:'V243',syncNow:syncNow,info:info};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();