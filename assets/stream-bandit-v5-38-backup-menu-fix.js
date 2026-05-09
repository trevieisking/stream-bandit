/* Stream Bandit V5.39.2 — Emergency Menu Restore
   Emergency rollback for V5.39.1 Storage Menu Simplifier.
   Restores any menu elements hidden by the bad storage simplifier.
   Adds no menu-hiding logic. No player, HLS, Final Boss, Supabase write, volume or playbar changes. */
(function(){
'use strict';
var VERSION='V5.39.2 Emergency Menu Restore';
function restoreHidden(){
  try{
    var nodes=[].slice.call(document.querySelectorAll('[data-sb539-hidden], [data-sb539Hidden], [data-sb539hidden]'));
    nodes.forEach(function(el){
      el.style.display='';
      el.style.visibility='';
      el.style.pointerEvents='';
      delete el.dataset.sb539Hidden;
      el.removeAttribute('data-sb539-hidden');
      el.removeAttribute('data-sb539Hidden');
      el.removeAttribute('data-sb539hidden');
    });
    var bad=document.getElementById('sb539StorageCentreLink');
    if(bad)bad.remove();
    var corner=document.getElementById('sb538CornerBackup');
    if(corner)corner.remove();
    var lite=document.getElementById('sb538LiteBackupShortcut');
    if(lite)lite.remove();
  }catch(e){}
}
function addSafeCornerStorage(){
  try{
    if(document.getElementById('sb539SafeStorageCorner'))return;
    var raw=localStorage.getItem('streambandit_v25_session')||'';
    if(raw.toLowerCase().indexOf('admin')<0)return;
    var a=document.createElement('a');
    a.id='sb539SafeStorageCorner';
    a.href='storage-v5-39.html';
    a.target='_blank';
    a.rel='noopener';
    a.textContent='💾 Storage';
    a.style.cssText='position:fixed;left:14px;bottom:58px;z-index:2147483646;border-radius:999px;padding:9px 12px;background:rgba(7,12,24,.96);border:1px solid rgba(34,211,166,.42);color:#dfffee;font-weight:950;text-decoration:none;box-shadow:0 16px 48px rgba(0,0,0,.48)';
    document.body.appendChild(a);
  }catch(e){}
}
function tick(){restoreHidden();addSafeCornerStorage();}
setInterval(tick,500);
new MutationObserver(function(){setTimeout(tick,50);setTimeout(tick,200)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','data-sb539-hidden','data-sb539Hidden','data-sb539hidden']});
setTimeout(tick,200);setTimeout(tick,900);setTimeout(tick,1800);
console.log('[Stream Bandit]',VERSION+' loaded. Menu hiding disabled and hidden menu items restored.');
})();