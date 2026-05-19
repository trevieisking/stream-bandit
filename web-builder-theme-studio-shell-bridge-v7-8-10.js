/* Stream Bandit V7.8.12 Theme Studio Shell Bridge
   Adds the standard header/search host to the existing V7.8.9 Theme Studio page,
   then loads the shell/logo containment fix. */
(function(){
'use strict';
function loadLogoFix(){
  if(document.getElementById('sbThemeStudioLogoFixScript')) return;
  var sc=document.createElement('script');
  sc.id='sbThemeStudioLogoFixScript';
  sc.src='web-builder-shell-logo-fix-v7-8-12.js?v=1';
  document.body.appendChild(sc);
}
function start(){
  if(!document.querySelector('.head')){
    var wrap=document.querySelector('.wrap')||document.body;
    var header=document.createElement('header');
    header.className='head';
    header.innerHTML='<div class="brand"><div class="logo">🎨</div><span>Stream Bandit</span></div><div class="muted"><b>Theme Studio global controls. Shared shell, account state and search are active here.</b></div><div><div class="search"><span>🔎</span><input id="globalSearch" placeholder="Search Stream Bandit"><button id="globalSearchBtn" class="btn primary">Search</button></div></div>';
    var style=document.createElement('style');
    style.textContent='.head{display:grid;grid-template-columns:260px 1fr 360px;gap:14px;align-items:start;border:1px solid var(--line);border-radius:24px;background:linear-gradient(135deg,var(--card),var(--card2));padding:20px;margin:0 0 16px;box-shadow:0 18px 60px #0007;overflow:hidden}.brand{display:flex;gap:12px;align-items:center;font-size:22px;font-weight:950;position:relative;min-width:0;overflow:hidden}.brand>span{display:block;min-width:0;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.logo{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:grid;place-items:center;overflow:hidden;flex:0 0 auto}.logo img{width:100%;height:100%;object-fit:cover;border-radius:inherit}.search{display:flex;gap:8px;border:1px solid #ffffff24;border-radius:999px;background:#0004;padding:9px 10px 9px 14px}.search input{flex:1;background:transparent;border:0;color:#fff;outline:0}@media(max-width:900px){.head{grid-template-columns:1fr}}';
    document.head.appendChild(style);
    wrap.insertBefore(header,wrap.firstChild);
  }
  setTimeout(loadLogoFix,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
