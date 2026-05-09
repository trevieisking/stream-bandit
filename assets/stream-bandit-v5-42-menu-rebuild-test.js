/* Stream Bandit V5.42 Menu Rebuild TEST
   Adds a safe Plan 2 Centres block to the test-page sidebar.
   No live app route rewrites. No Supabase writes. No player/HLS changes. */
(function(){
'use strict';
var VERSION='V5.42 Menu Rebuild TEST';
var inserted=false;
function side(){return document.querySelector('.side')||document.querySelector('aside')}
function css(){
  if(document.getElementById('sb542MenuCss'))return;
  var s=document.createElement('style');
  s.id='sb542MenuCss';
  s.textContent='\n.sb542-centres{margin:12px 12px 14px;padding:12px;border-radius:22px;background:linear-gradient(135deg,rgba(34,211,166,.14),rgba(124,60,255,.16));border:1px solid rgba(34,211,166,.28);box-shadow:0 14px 38px rgba(0,0,0,.22)}\n.sb542-centres-title{font-weight:950;color:#baf7df;font-size:12px;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px}\n.sb542-centres-note{font-size:11px;color:#b9c0d8;line-height:1.3;margin:8px 2px 0}\n.sb542-centres a{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;width:100%!important;min-height:0!important;margin:7px 0!important;padding:10px 12px!important;border-radius:16px!important;text-decoration:none!important;color:#fff!important;font-weight:950!important;background:rgba(5,7,17,.76)!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:0 8px 22px rgba(0,0,0,.18)!important}\n.sb542-centres a.sb542-main{background:linear-gradient(135deg,#22d3a6,#7c3cff)!important}\n.sb542-live-note{margin:8px 12px 10px;padding:8px 10px;border-radius:14px;background:rgba(255,177,66,.12);border:1px solid rgba(255,177,66,.24);color:#ffe7ad;font-size:11px;line-height:1.3}\n';
  document.head.appendChild(s);
}
function makeBlock(){
  var box=document.createElement('div');
  box.className='sb542-centres';
  box.innerHTML='<div class="sb542-centres-title">Plan 2 Centres</div>'+
    '<a class="sb542-main" href="control-centre-v5-41-1-test.html">🎛 Control Centre</a>'+
    '<a href="admin-centre-v5-40-3-test.html">🛠 Admin Centre</a>'+
    '<a href="storage-centre-v5-39-1-test.html">💾 Storage Centre</a>'+
    '<a href="tools-centre-v5-24-2-test.html">🧰 Tools Centre</a>'+
    '<div class="sb542-centres-note">Standalone centre links. These avoid the old in-app scroll route bug.</div>';
  return box;
}
function insert(){
  if(inserted)return;
  var el=side();
  if(!el)return;
  if(el.querySelector('.sb542-centres')){inserted=true;return;}
  css();
  var block=makeBlock();
  var afterLogo=el.querySelector('.brand,.logo,.profile-card,.stable-card');
  if(afterLogo&&afterLogo.parentNode===el&&afterLogo.nextSibling){el.insertBefore(block,afterLogo.nextSibling)}
  else{el.insertBefore(block,el.firstChild)}
  inserted=true;
  var note=document.createElement('div');
  note.className='sb542-live-note';
  note.textContent=VERSION+' active on this test page only. Live menu unchanged.';
  block.insertAdjacentElement('afterend',note);
}
function boot(){insert();setTimeout(insert,500);setTimeout(insert,1200);setTimeout(insert,2400)}
new MutationObserver(function(){if(!inserted)insert()}).observe(document.documentElement,{childList:true,subtree:true});
boot();
console.log('[Stream Bandit]',VERSION+' loaded');
})();