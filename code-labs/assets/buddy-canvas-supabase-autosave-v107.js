/* Code Labs Buddy Canvas V130 - Supabase repair-history autosave helper with Buddy markdown packet support */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var timer=null;
  var lastSaved='';
  function q(s){return document.querySelector(s);}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function write(s){localStorage.setItem(KEY,JSON.stringify(s||{}));}
  function fixed(){var el=q('#fixedCode');return el?String(el.value||''):'';}
  function source(){var s=state();return String((s.file||{}).currentCode||'');}
  function lines(t){return String(t||'').split(/\r?\n/).length;}
  function filePath(s){var f=s.file||{},g=f.githubSource||{};return g.path||f.path||f.filename||'';}
  function repoName(s){var f=s.file||{},g=f.githubSource||{},p=s.project||{};if(g.owner&&g.repo)return g.owner+'/'+g.repo;return p.repo||'trevieisking/stream-bandit';}
  function isBuddyMarkdown(path,code){path=String(path||'');code=String(code||'');return /STREAM-BANDIT-BUDDY-(MEMORY|WORKBENCH)-LATEST\.md$/i.test(path)&&/^CODE LABS BUDDY /i.test(code.trim())&&code.length>120&&lines(code)>=3;}
  function setBadge(msg,kind){var el=q('#buddyCanvasSupabaseBadge');if(!el){el=document.createElement('span');el.id='buddyCanvasSupabaseBadge';el.className='badge warn';var line=q('.statusLine');if(line)line.appendChild(el);}if(el){el.className='badge '+(kind||'warn');el.textContent=msg;}}
  function reportOk(path,code){try{if(isBuddyMarkdown(path,code))return true;if(window.CodeLabsBuddyCanvas&&window.CodeLabsBuddyCanvas.read){var r=window.CodeLabsBuddyCanvas.read();if(r&&r.full_replacement_ok===true)return true;if(r&&r.full_replacement_ok===false)return false;}}catch(e){}return null;}
  function fullOk(){
    var s=state(),path=filePath(s),code=fixed(),old=source();
    if(isBuddyMarkdown(path,code))return true;
    var fromReport=reportOk(path,code);
    if(fromReport===false)return false;
    if(!code.trim())return false;
    if(/BEGIN PATCH|Find:\s*\n|Replace with:|JSON START|CODE LABS SAFE WRITE REQUEST/i.test(code))return false;
    if(/\.html?$/i.test(path)&&!(/<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code)))return false;
    if(old.trim()&&code.length<Math.max(120,Math.floor(old.length*.65)))return false;
    if(lines(code)<3&&code.length<120)return false;
    return true;
  }
  function ensureHistoryHelper(){return new Promise(function(resolve){if(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll)return resolve(true);if(document.querySelector('script[data-buddy-history-helper]')){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll));},900);return;}var sc=document.createElement('script');sc.src='assets/code-labs-v1-2-history.js?v=buddy-canvas-v130';sc.setAttribute('data-buddy-history-helper','yes');sc.onload=function(){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll));},400);};sc.onerror=function(){resolve(false);};document.head.appendChild(sc);});}
  function syncLocal(){
    var s=state(),f=s.file||{},p=s.project||{},code=fixed(),path=filePath(s),repo=repoName(s);
    f.fixedCode=code;
    if(path){f.filename=path;f.path=path;}
    f.buddyCanvas=f.buddyCanvas||{};
    f.buddyCanvas.supabaseAutosave='V130';
    f.buddyCanvas.path=path;
    f.buddyCanvas.repo=repo;
    f.buddyCanvas.lastSupabaseAutosaveTry=new Date().toISOString();
    f.buddyCanvas.markdownPacket=isBuddyMarkdown(path,code);
    p.siteName=p.siteName||'stream-bandit';
    p.siteUrl=path||p.siteUrl||location.pathname;
    p.repo=repo;
    p.mode='buddy-canvas';
    s.file=f;
    s.project=p;
    write(s);
  }
  async function saveHistory(){var code=fixed();if(!code||code===lastSaved){setBadge('Supabase no changes','good');return;}if(!fullOk()){setBadge('Supabase blocked - full file needed','bad');return;}syncLocal();setBadge('Supabase helper loading','warn');var ok=await ensureHistoryHelper();if(!ok){setBadge('Supabase helper missing','bad');return;}setBadge('Supabase saving','warn');try{var result=await window.CodeLabsRepairHistory.saveAll();if(result&&result.ok){lastSaved=code;setBadge('Supabase saved','good');}else{setBadge('Supabase waiting','warn');}}
  catch(e){setBadge('Supabase failed','bad');}}
  function schedule(){clearTimeout(timer);setBadge('Supabase save in 5s','warn');timer=setTimeout(saveHistory,5000);}
  function boot(){var el=q('#fixedCode');if(!el){setTimeout(boot,300);return;}setBadge('Supabase ready','warn');el.addEventListener('input',schedule);var btn=q('#saveNow');if(btn){btn.addEventListener('click',function(){setTimeout(saveHistory,250);});}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();