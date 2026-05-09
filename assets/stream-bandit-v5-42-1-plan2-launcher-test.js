/* Stream Bandit V5.42.1 Plan 2 Launcher TEST
   Floating launcher outside old sidebar. No old menu injection. */
(function(){
'use strict';
var VERSION='V5.42.1 Plan 2 Launcher TEST';
function css(){
  if(document.getElementById('sb5421Css'))return;
  var s=document.createElement('style');
  s.id='sb5421Css';
  s.textContent='\n#sb5421Launcher{position:fixed;right:18px;top:78px;z-index:2147483000;width:min(320px,calc(100vw - 36px));border-radius:24px;padding:14px;background:linear-gradient(135deg,rgba(5,7,17,.94),rgba(35,23,72,.94));border:1px solid rgba(34,211,166,.34);box-shadow:0 22px 70px rgba(0,0,0,.55);color:#fff;font-family:Inter,system-ui,Arial,sans-serif}\n#sb5421Launcher.sb5421Closed .sb5421Body{display:none}\n#sb5421Launcher h3{margin:0;font-size:16px;line-height:1.2;color:#baf7df}\n.sb5421Top{display:flex;align-items:center;justify-content:space-between;gap:10px}\n.sb5421Toggle{border:0;border-radius:999px;padding:7px 10px;background:rgba(255,255,255,.12);color:#fff;font-weight:950;cursor:pointer}\n.sb5421Body{margin-top:12px;display:grid;gap:8px}\n.sb5421Body a{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;text-decoration:none!important;color:#fff!important;font-weight:950!important;border-radius:16px!important;padding:11px 12px!important;background:rgba(255,255,255,.10)!important;border:1px solid rgba(255,255,255,.09)!important}\n.sb5421Body a.main{background:linear-gradient(135deg,#22d3a6,#7c3cff)!important}\n.sb5421Note{font-size:11px;color:#b9c0d8;line-height:1.35;margin-top:8px}\n@media(max-width:800px){#sb5421Launcher{left:12px;right:12px;top:auto;bottom:12px;width:auto}}\n';
  document.head.appendChild(s);
}
function make(){
  if(document.getElementById('sb5421Launcher'))return;
  css();
  var box=document.createElement('div');
  box.id='sb5421Launcher';
  box.innerHTML='<div class="sb5421Top"><h3>🎛 Plan 2 Centres</h3><button class="sb5421Toggle" type="button">Hide</button></div>'+
    '<div class="sb5421Body">'+
    '<a class="main" href="control-centre-v5-41-1-test.html">🎛 Control Centre</a>'+
    '<a href="admin-centre-v5-40-3-test.html">🛠 Admin Centre</a>'+
    '<a href="storage-centre-v5-39-1-test.html">💾 Storage Centre</a>'+
    '<a href="tools-centre-v5-24-2-test.html">🧰 Tools Centre</a>'+
    '<a href="tools-v5-24-1.html#mux">🎞 Mux / HLS Helper</a>'+
    '<div class="sb5421Note">Floating test launcher only. Old sidebar untouched. Live unchanged.</div>'+
    '</div>';
  document.body.appendChild(box);
  var btn=box.querySelector('.sb5421Toggle');
  btn.onclick=function(){box.classList.toggle('sb5421Closed');btn.textContent=box.classList.contains('sb5421Closed')?'Show':'Hide'};
}
setTimeout(make,500);setTimeout(make,1200);setTimeout(make,2400);
console.log('[Stream Bandit]',VERSION+' loaded');
})();