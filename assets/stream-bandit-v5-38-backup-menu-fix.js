/* Stream Bandit V5.38.1 — Hard Backup Menu Fix + Sidebar Scroll Keep
   Forces Backup / Safety to open the standalone Lite Backup page.
   Adds a real Lite Backup button in the Storage group and patches the visible Backup/Safety item after every menu render.
   Preserves sidebar scroll position after menu clicks/renders.
   No player, HLS, Final Boss, Supabase write, volume or playbar changes. */
(function(){
'use strict';
var VERSION='V5.38.1 Hard Backup Menu Fix';
var SCROLL_KEY='sb538_sidebar_scroll';
var URL='backup-v5-37-8-lite.html';
function isAdmin(){try{return (localStorage.getItem('streambandit_v25_session')||'').toLowerCase().indexOf('admin')>-1}catch(e){return false}}
function side(){return document.querySelector('.side')||document.querySelector('aside')}
function saveScroll(){var s=side();if(s)try{sessionStorage.setItem(SCROLL_KEY,String(s.scrollTop||0))}catch(e){}}
function restoreScroll(){var s=side();if(!s)return;var y=0;try{y=Number(sessionStorage.getItem(SCROLL_KEY)||0)}catch(e){}if(y>0){try{s.scrollTop=y}catch(e){}setTimeout(function(){try{s.scrollTop=y}catch(e){}},80);setTimeout(function(){try{s.scrollTop=y}catch(e){}},260)}}
function txt(el){return String(el&&el.textContent||'').toLowerCase().replace(/\s+/g,' ').trim()}
function isBackupText(t){return t.indexOf('backup')>-1&&t.indexOf('safety')>-1}
function isBackupEl(el){if(!el)return false;var dv=el.getAttribute&&String(el.getAttribute('data-view')||'').toLowerCase();return dv==='backup'||isBackupText(txt(el))}
function openLite(){saveScroll();try{window.open(URL,'_blank','noopener')}catch(e){location.href=URL}setTimeout(restoreScroll,120)}
function hardClick(e){if(!isAdmin())return;var path=[];try{path=e.composedPath?e.composedPath():[]}catch(x){}var target=e.target&&e.target.closest?e.target.closest('button,a,[data-view],div,span'):e.target;var hit=false;if(target&&isBackupEl(target))hit=true;if(!hit&&path.length){hit=path.some(function(n){return n&&n.nodeType===1&&isBackupEl(n)})}
if(hit){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openLite();return false}}
function patchBackupItems(){if(!isAdmin())return;var s=side();if(!s)return;var all=[].slice.call(s.querySelectorAll('button,a,div,span'));
all.forEach(function(el){if(!isBackupEl(el))return;el.dataset.sb538BackupPatched='1';el.style.cursor='pointer';el.title='Open Lite Backup in a safe standalone page';if(el.tagName==='A'){el.href=URL;el.target='_blank';el.rel='noopener'}el.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();openLite();return false};});}
function addVisualShortcut(){if(!isAdmin())return;var s=side();if(!s)return;var old=document.getElementById('sb538LiteBackupShortcut');if(old)return;var btn=document.createElement('a');btn.id='sb538LiteBackupShortcut';btn.href=URL;btn.target='_blank';btn.rel='noopener';btn.textContent='💾 Open Lite Backup';btn.style.cssText='display:block;margin:8px 14px 12px;padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-weight:950;text-decoration:none;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.35);position:relative;z-index:5';btn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();openLite();return false};var backupItem=[].slice.call(s.querySelectorAll('button,a,div,span')).find(function(el){return isBackupText(txt(el))});if(backupItem&&backupItem.parentNode){backupItem.parentNode.insertBefore(btn,backupItem.nextSibling)}else{s.appendChild(btn)}}
function addCornerShortcut(){if(!isAdmin()||document.getElementById('sb538CornerBackup'))return;var a=document.createElement('a');a.id='sb538CornerBackup';a.href=URL;a.target='_blank';a.rel='noopener';a.textContent='💾 Backup';a.style.cssText='position:fixed;left:14px;bottom:58px;z-index:2147483646;border-radius:999px;padding:9px 12px;background:rgba(7,12,24,.96);border:1px solid rgba(34,211,166,.42);color:#dfffee;font-weight:950;text-decoration:none;box-shadow:0 16px 48px rgba(0,0,0,.48)';a.onclick=function(ev){saveScroll()};document.body.appendChild(a)}
function tick(){patchBackupItems();addVisualShortcut();addCornerShortcut();restoreScroll()}
function boot(){document.addEventListener('pointerdown',hardClick,true);document.addEventListener('mousedown',hardClick,true);document.addEventListener('click',hardClick,true);document.addEventListener('scroll',function(e){if(e.target===side())saveScroll()},true);setInterval(tick,700);new MutationObserver(function(){setTimeout(tick,60);setTimeout(tick,240)}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(tick,500);setTimeout(tick,1200);console.log('[Stream Bandit]',VERSION+' loaded. Backup/Safety hard-patched to Lite Backup.');}
boot();
})();