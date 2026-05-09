/* Stream Bandit V5.41.4 — Sidebar Preserve
   Preserves sidebar scroll after sidebar navigation clicks.
   No page notes, no main window scroll, no player, HLS, Supabase write, save, upload or delete changes. */
(function(){
'use strict';
var KEY='sb5414_sidebar_y';
var saved=0;
var armed=false;
var lastRestore=0;
function side(){return document.querySelector('.side')||document.querySelector('aside')}
function read(){try{saved=Number(sessionStorage.getItem(KEY)||saved||0)}catch(e){}}
function write(){var s=side();if(!s)return;saved=s.scrollTop||0;try{sessionStorage.setItem(KEY,String(saved))}catch(e){}}
function restore(){if(!armed)return;read();var s=side();if(!s||saved<1)return;try{s.scrollTop=saved}catch(e){}lastRestore=Date.now()}
function restoreBurst(){restore();setTimeout(restore,40);setTimeout(restore,100);setTimeout(restore,180);setTimeout(restore,300);setTimeout(restore,520);setTimeout(restore,850);setTimeout(function(){armed=false},1600)}
function isSideClick(e){return !!(e.target&&e.target.closest&&e.target.closest('.side,aside'))}
document.addEventListener('scroll',function(e){if(e.target===side())write()},true);
document.addEventListener('pointerdown',function(e){if(isSideClick(e)){write();armed=true;restoreBurst()}},true);
document.addEventListener('click',function(e){if(isSideClick(e)){write();armed=true;restoreBurst()}},true);
new MutationObserver(function(){if(armed)restoreBurst()}).observe(document.documentElement,{childList:true,subtree:true});
setInterval(function(){if(armed||Date.now()-lastRestore<1800)restore()},200);
setTimeout(function(){read();armed=true;restoreBurst()},900);
console.log('[Stream Bandit] V5.41.4 Sidebar Preserve loaded');
})();