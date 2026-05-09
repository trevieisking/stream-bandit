/* Stream Bandit V5.38 — Backup Menu Fix + Sidebar Scroll Keep
   Fixes Backup / Safety menu click by opening the standalone Lite Backup page directly.
   Preserves sidebar scroll position after menu clicks/renders.
   No player, HLS, Final Boss, Supabase write, volume or playbar changes. */
(function(){
'use strict';
var VERSION='V5.38 Backup Menu Fix';
var SCROLL_KEY='sb538_sidebar_scroll';
function isAdmin(){try{return (localStorage.getItem('streambandit_v25_session')||'').toLowerCase().indexOf('admin')>-1}catch(e){return false}}
function side(){return document.querySelector('.side')||document.querySelector('aside')}
function saveScroll(){var s=side();if(s)try{sessionStorage.setItem(SCROLL_KEY,String(s.scrollTop||0))}catch(e){}}
function restoreScroll(){var s=side();if(!s)return;var y=0;try{y=Number(sessionStorage.getItem(SCROLL_KEY)||0)}catch(e){}if(y>0)setTimeout(function(){try{s.scrollTop=y}catch(e){}},40)}
function isBackupButton(el){if(!el)return false;var t=String(el.textContent||'').toLowerCase().replace(/\s+/g,' ');var dv=el.getAttribute&&String(el.getAttribute('data-view')||'').toLowerCase();return dv==='backup'||(t.indexOf('backup')>-1&&t.indexOf('safety')>-1)}
function openLiteBackup(){try{window.open('backup-v5-37-8-lite.html','_blank','noopener')}catch(e){location.href='backup-v5-37-8-lite.html'}}
function intercept(e){if(!isAdmin())return;var target=e.target&&e.target.closest?e.target.closest('button,a,[data-view]'):null;if(!target)return;if(isBackupButton(target)){saveScroll();e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openLiteBackup();setTimeout(restoreScroll,120);}}
function addVisualShortcut(){if(!isAdmin())return;var s=side();if(!s||document.getElementById('sb538LiteBackupShortcut'))return;var btn=document.createElement('a');btn.id='sb538LiteBackupShortcut';btn.href='backup-v5-37-8-lite.html';btn.target='_blank';btn.rel='noopener';btn.textContent='💾 Lite Backup';btn.style.cssText='display:block;margin:10px 14px;padding:12px 14px;border-radius:18px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-weight:950;text-decoration:none;text-align:center;box-shadow:0 12px 34px rgba(0,0,0,.35)';btn.onclick=function(){saveScroll()};var storageLabel=[].slice.call(s.querySelectorAll('button,a,div')).find(function(el){return String(el.textContent||'').toLowerCase().indexOf('backup / safety')>-1});if(storageLabel&&storageLabel.parentNode)storageLabel.parentNode.insertBefore(btn,storageLabel.nextSibling);else s.appendChild(btn)}
function boot(){document.addEventListener('click',intercept,true);document.addEventListener('scroll',function(e){if(e.target===side())saveScroll()},true);setInterval(function(){addVisualShortcut();restoreScroll()},1000);new MutationObserver(function(){setTimeout(addVisualShortcut,80);setTimeout(restoreScroll,120)}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(addVisualShortcut,900);setTimeout(restoreScroll,1000);console.log('[Stream Bandit]',VERSION+' loaded. Backup/Safety opens Lite Backup and sidebar scroll is preserved.');}
boot();
})();