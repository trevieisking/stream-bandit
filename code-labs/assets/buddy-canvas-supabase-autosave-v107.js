/* Code Labs Buddy Canvas V107 - Supabase repair-history autosave helper */
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
  function setBadge(msg,kind){var el=q('#buddyCanvasSupabaseBadge');if(!el){el=document.createElement('span');el.id='buddyCanvasSupabaseBadge';el.className='badge warn';var line=q('.statusLine');if(line)line.appendChild(el);}if(el){el.className='badge '+(kind||'warn');el.textContent=msg;}}
  function fullOk(){var s=state(),f=s.file||{},path=((f.githubSource||{}).path||f.path||f.filename||''),code=fixed(),old=source();if(!code.trim())return false;if(/\.html?$/i.test(path)&&!(/<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code)))return false;if(old.trim()&&code.length<Math.max(120,Math.floor(old.length*.65)))return false;return true;}
  function ensureHistoryHelper(){return new Promise(function(resolve){if(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll)return resolve(true);if(document.querySelector('script[data-buddy-history-helper]')){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll));},900);return;}var sc=document.createElement('script');sc.src='assets/code-labs-v1-2-history.js?v=buddy-canvas-v107';sc.setAttribute('data-buddy-history-helper','yes');sc.onload=function(){setTimeout(function(){resolve(!!(window.CodeLabsRepairHistory&&window.CodeLabsRepairHistory.saveAll));},400);};sc.onerror=function(){resolve(false);};document.head.appendChild(sc);});}
  function syncLocal(){var s=state(),f=s.file||{},code=fixed();f.fixedCode=code;f.buddyCanvas=f.buddyCanvas||{};f.buddyCanvas.supabaseAutosave='V107';f.buddyCanvas.lastSupabaseAutosaveTry=new Date().toISOString();s.file=f;write(s);}
  async function saveHistory(){var code=fixed();if(!code||code===lastSaved){setBadge('Supabase no changes','good');return;}if(!fullOk()){setBadge('Supabase blocked','bad');return;}syncLocal();setBadge('Supabase helper loading','warn');var ok=await ensureHistoryHelper();if(!ok){setBadge('Supabase helper missing','bad');return;}setBadge('Supabase saving','warn');try{var result=await window.CodeLabsRepairHistory.saveAll();if(result&&result.ok){lastSaved=code;setBadge('Supabase saved','good');}else{setBadge('Supabase waiting','warn');}}
  catch(e){setBadge('Supabase failed','bad');}}
  function schedule(){clearTimeout(timer);setBadge('Supabase save in 5s','warn');timer=setTimeout(saveHistory,5000);}
  function boot(){var el=q('#fixedCode');if(!el){setTimeout(boot,300);return;}setBadge('Supabase ready','warn');el.addEventListener('input',schedule);var btn=q('#saveNow');if(btn){btn.addEventListener('click',function(){setTimeout(saveHistory,250);});}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();