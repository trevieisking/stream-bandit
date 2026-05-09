/* Stream Bandit V5.39.1 — Storage Menu Simplifier
   Replaces the crowded in-app Storage group items with one clean standalone Storage Centre link.
   Hides Local Storage, Storage Prep, Backup / Safety and old Lite Backup shortcut/corner shortcut.
   Opens storage-v5-39.html.
   No player, HLS, Final Boss, Supabase write, volume or playbar changes. */
(function(){
'use strict';
var VERSION='V5.39.1 Storage Menu Simplifier';
var SCROLL_KEY='sb539_storage_sidebar_scroll';
var URL='storage-v5-39.html';
function isAdmin(){try{return (localStorage.getItem('streambandit_v25_session')||'').toLowerCase().indexOf('admin')>-1}catch(e){return false}}
function side(){return document.querySelector('.side')||document.querySelector('aside')}
function saveScroll(){var s=side();if(s)try{sessionStorage.setItem(SCROLL_KEY,String(s.scrollTop||0))}catch(e){}}
function restoreScroll(){var s=side();if(!s)return;var y=0;try{y=Number(sessionStorage.getItem(SCROLL_KEY)||0)}catch(e){}if(y>0){try{s.scrollTop=y}catch(e){}setTimeout(function(){try{s.scrollTop=y}catch(e){}},90);setTimeout(function(){try{s.scrollTop=y}catch(e){}},260)}}
function txt(el){return String(el&&el.textContent||'').toLowerCase().replace(/\s+/g,' ').trim()}
function isOldStorageItem(el){var t=txt(el);var dv=el&&el.getAttribute&&String(el.getAttribute('data-view')||'').toLowerCase();return dv==='storage'||dv==='backup'||t==='local storage'||t.indexOf('storage prep')>-1||t.indexOf('backup / safety')>-1||t.indexOf('open lite backup')>-1||t==='lite backup'||t==='backup'}
function storageHeader(){var s=side();if(!s)return null;return [].slice.call(s.querySelectorAll('button,a,div,span')).find(function(el){var t=txt(el);return t.indexOf('storage')>-1&&/\(\s*3\s*\)/.test(t)})||[].slice.call(s.querySelectorAll('button,a,div,span')).find(function(el){return txt(el)==='storage'})}
function openStorage(){saveScroll();try{window.open(URL,'_blank','noopener')}catch(e){location.href=URL}setTimeout(restoreScroll,150)}
function hideOldItems(){var s=side();if(!s)return;[].slice.call(s.querySelectorAll('button,a,div,span')).forEach(function(el){if(el.id==='sb539StorageCentreLink')return;if(isOldStorageItem(el)){el.dataset.sb539Hidden='1';el.style.display='none';el.style.visibility='hidden';el.style.pointerEvents='none'}});var corner=document.getElementById('sb538CornerBackup');if(corner)corner.remove();var old=document.getElementById('sb538LiteBackupShortcut');if(old)old.remove()}
function addStorageLink(){if(!isAdmin())return;var s=side();if(!s)return;var existing=document.getElementById('sb539StorageCentreLink');if(existing)return;var a=document.createElement('a');a.id='sb539StorageCentreLink';a.href=URL;a.target='_blank';a.rel='noopener';a.textContent='💾 Storage Centre';a.style.cssText='display:block;margin:10px 14px 12px;padding:13px 15px;border-radius:20px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-weight:950;text-decoration:none;text-align:center;box-shadow:0 14px 40px rgba(0,0,0,.38);position:relative;z-index:10';a.onclick=function(ev){ev.preventDefault();ev.stopPropagation();openStorage();return false};var h=storageHeader();if(h&&h.parentNode){h.parentNode.insertBefore(a,h.nextSibling)}else{s.appendChild(a)}}
function hardClick(e){if(!isAdmin())return;var target=e.target&&e.target.closest?e.target.closest('button,a,[data-view],div,span'):e.target;if(!target)return;var hit=false;if(target.id==='sb539StorageCentreLink')hit=true;if(isOldStorageItem(target))hit=true;var path=[];try{path=e.composedPath?e.composedPath():[]}catch(x){}if(!hit&&path.length){hit=path.some(function(n){return n&&n.nodeType===1&&(n.id==='sb539StorageCentreLink'||isOldStorageItem(n))})}if(hit){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();openStorage();return false}}
function patchStorageHeader(){var h=storageHeader();if(!h)return;h.title='Open standalone Storage Centre';h.style.cursor='pointer';h.onclick=function(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();openStorage();return false}}
function tick(){if(!isAdmin())return;hideOldItems();addStorageLink();patchStorageHeader();restoreScroll()}
function boot(){document.addEventListener('pointerdown',hardClick,true);document.addEventListener('mousedown',hardClick,true);document.addEventListener('click',hardClick,true);document.addEventListener('scroll',function(e){if(e.target===side())saveScroll()},true);setInterval(tick,700);new MutationObserver(function(){setTimeout(tick,70);setTimeout(tick,260)}).observe(document.documentElement,{childList:true,subtree:true});setTimeout(tick,500);setTimeout(tick,1300);console.log('[Stream Bandit]',VERSION+' loaded. Storage group simplified to standalone Storage Centre.');}
boot();
})();