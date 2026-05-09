/* Stream Bandit V5.42.2 Plan 2 Mini Launcher TEST
   Smaller floating launcher outside the old sidebar.
   Test page only unless manually promoted later. */
(function(){
'use strict';
var KEY='sb5422_launcher_closed';
function css(){
  if(document.getElementById('sb5422Css'))return;
  var s=document.createElement('style');
  s.id='sb5422Css';
  s.textContent='\n#sb5422Launcher{position:fixed;right:16px;bottom:88px;z-index:2147483000;width:78px;min-height:58px;border-radius:22px;padding:9px;background:linear-gradient(135deg,rgba(5,7,17,.95),rgba(34,23,72,.95));border:1px solid rgba(34,211,166,.36);box-shadow:0 18px 60px rgba(0,0,0,.52);color:#fff;font-family:Inter,system-ui,Arial,sans-serif;transition:width .18s ease}\n#sb5422Launcher.sb5422Open{width:min(300px,calc(100vw - 28px));padding:12px}\n.sb5422Top{display:flex;align-items:center;justify-content:space-between;gap:8px}\n.sb5422Title{font-weight:950;color:#baf7df;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n#sb5422Launcher:not(.sb5422Open) .sb5422Title{display:none}\n.sb5422Toggle{border:0;border-radius:999px;padding:9px 12px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-weight:950;cursor:pointer;box-shadow:0 8px 22px rgba(0,0,0,.25)}\n.sb5422Body{display:none;margin-top:10px;gap:8px}\n#sb5422Launcher.sb5422Open .sb5422Body{display:grid}\n.sb5422Body a{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;text-decoration:none!important;color:#fff!important;font-weight:950!important;border-radius:15px!important;padding:10px 12px!important;background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.09)!important}\n.sb5422Body a.main{background:linear-gradient(135deg,#22d3a6,#7c3cff)!important}\n.sb5422Note{font-size:11px;color:#b9c0d8;line-height:1.35;margin-top:4px}\n@media(max-width:800px){#sb5422Launcher{right:12px;bottom:72px}}\n';
  document.head.appendChild(s);
}
function isClosed(){try{return localStorage.getItem(KEY)==='1'}catch(e){return false}}
function setClosed(v){try{localStorage.setItem(KEY,v?'1':'0')}catch(e){}}
function make(){
  if(document.getElementById('sb5422Launcher'))return;
  css();
  var box=document.createElement('div');
  box.id='sb5422Launcher';
  if(!isClosed())box.classList.add('sb5422Open');
  box.innerHTML='<div class="sb5422Top"><div class="sb5422Title">🎛 Plan 2 Centres</div><button class="sb5422Toggle" type="button">'+(box.classList.contains('sb5422Open')?'Hide':'Plan 2')+'</button></div>'+
    '<div class="sb5422Body">'+
    '<a class="main" href="control-centre-v5-41-1-test.html">🎛 Control Centre</a>'+
    '<a href="admin-centre-v5-40-3-test.html">🛠 Admin Centre</a>'+
    '<a href="storage-centre-v5-39-1-test.html">💾 Storage Centre</a>'+
    '<a href="tools-centre-v5-24-2-test.html">🧰 Tools Centre</a>'+
    '<a href="tools-v5-24-1.html#mux">🎞 Mux / HLS Helper</a>'+
    '<div class="sb5422Note">Mini test launcher. Old sidebar untouched. Not permanent unless promoted later.</div>'+
    '</div>';
  document.body.appendChild(box);
  var btn=box.querySelector('.sb5422Toggle');
  btn.onclick=function(){
    box.classList.toggle('sb5422Open');
    var open=box.classList.contains('sb5422Open');
    btn.textContent=open?'Hide':'Plan 2';
    setClosed(!open);
  };
}
setTimeout(make,500);setTimeout(make,1200);setTimeout(make,2400);
console.log('[Stream Bandit] V5.42.2 Plan 2 Mini Launcher TEST loaded');
})();