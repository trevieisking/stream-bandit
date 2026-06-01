/* Stream Bandit Group Play Polish V7.12.177
   Visual-only cleanup for passed Group Play pages.
   Hides old page-owned footers and stale micro-footers so the global footer shell is the only footer.
   Does not change Player 1, Player 2 engine, queue keys, Supabase writes or playback logic. */
(function(){
'use strict';
const VERSION='V7.12.177 Group Play Polish';
const CURRENT={
  collections:'collections-clean-machine-v7-12-51-test.html',
  player2:'player-2-clean-machine-v7-12-58-test.html',
  player1:'player-one-global-helpers-v7-3-3-test.html',
  details:'details-clean-machine-v7-12-38-test.html',
  playlists:'playlists-global-helpers-v7-5-2-test.html',
  channels:'channels-global-helpers-v7-5-3-test.html',
  myChannel:'my-channel-clean-machine-v7-12-47-test.html'
};
const OLD={
  'collections-clean-machine-v7-12-48-test.html':CURRENT.collections,
  'collections-clean-machine-v7-12-49-test.html':CURRENT.collections,
  'collections-clean-machine-v7-12-50-test.html':CURRENT.collections,
  'player-2-progress-helper-v6-78-9-4-test.html':CURRENT.player2,
  'player-two-global-helpers-v7-3-4-test.html':CURRENT.player2,
  'about-clean-machine-v7-12-46-test.html':'about-global-helpers-v7-4-7-test.html',
  'policy-agreements-centre-v7-11-6-test.html':'policy-documents-centre-v7-12-119-test.html'
};
function file(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0];}
function withTail(next,old){try{let u=new URL(String(old||''),location.href);return next+(u.search||'')+(u.hash||'');}catch(e){return next;}}
function patchRoutes(root){root=root||document;let count=0;try{root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(el=>{['href','action','data-href','data-target','data-route','data-url'].forEach(attr=>{let old=el.getAttribute(attr);if(!old)return;let fix=OLD[file(old)];if(fix){el.setAttribute(attr,withTail(fix,old));el.dataset.sbGroupPlayPolish='route';count++;}});});}catch(e){}return count;}
function addCss(){
  if(document.getElementById('sbGroupPlayPolishCss'))return;
  let s=document.createElement('style');
  s.id='sbGroupPlayPolishCss';
  s.textContent=`
  /* Hide only old page-owned Group Play footers. Global footer shell stays visible. */
  #sbCollectionsFooter,
  #sbPlayer2Footer,
  body[data-sb-playlists-menu-url] .wrap > section.footer,
  body[data-sb-channels-menu-url] .wrap > section.footer,
  body[data-sb-playlists-menu-url] .wrap > .footer,
  body[data-sb-channels-menu-url] .wrap > .footer,
  .microFooter{
    display:none!important;
    visibility:hidden!important;
    opacity:0!important;
    height:0!important;
    min-height:0!important;
    max-height:0!important;
    overflow:hidden!important;
    margin:0!important;
    padding:0!important;
    border:0!important;
  }
  body[data-sb-playlists-menu-url] .hero .badge,
  body[data-sb-channels-menu-url] .hero .badge{letter-spacing:.01em}
  body[data-sb-playlists-menu-url] .hero,
  body[data-sb-channels-menu-url] .hero,
  body[data-sb-my-channel-menu-url] .hero{margin-top:0}
  `;
  document.head.appendChild(s);
}
function textPolish(){
  try{
    document.querySelectorAll('.muted,b,.badge,p,li,.note,.status').forEach(el=>{
      let t=el.textContent||'';
      if(t.includes('Same old Playlists URL'))el.innerHTML=el.innerHTML.replace('Same old Playlists URL. Current browse route with Live Readiness helper stack.','Current Group Play route. Global shell, search and footer carried cleanly.');
      if(t.includes('Same old Channels URL'))el.innerHTML=el.innerHTML.replace('Same old Channels URL. Current browse route with Live Readiness helper stack.','Current Group Play route. Global shell, search and footer carried cleanly.');
      if(t.includes('V7.12.156 Playlists.'))el.innerHTML=el.innerHTML.replace('V7.12.156 Playlists.','V7.12.177 Playlists Polish.');
      if(t.includes('V7.12.156 Channels.'))el.innerHTML=el.innerHTML.replace('V7.12.156 Channels.','V7.12.177 Channels Polish.');
      if(t.includes('V7.12.156 Playlists Match'))el.textContent='V7.12.177 Playlists Polish';
      if(t.includes('V7.12.156 Channels Match'))el.textContent='V7.12.177 Channels Polish';
      if(t.includes('player-2-progress-helper-v6-78-9-4-test.html'))el.innerHTML=el.innerHTML.replaceAll('player-2-progress-helper-v6-78-9-4-test.html','player-2-clean-machine-v7-12-58-test.html');
      if(t.includes('collections-clean-machine-v7-12-48-test.html'))el.innerHTML=el.innerHTML.replaceAll('collections-clean-machine-v7-12-48-test.html','collections-clean-machine-v7-12-51-test.html');
    });
  }catch(e){}
}
function expose(){try{window.StreamBanditRoutes=Object.assign(window.StreamBanditRoutes||{},CURRENT,{groupPlayer:CURRENT.player2});}catch(e){}}
function refresh(){addCss();expose();let changed=patchRoutes(document);textPolish();try{document.documentElement.dataset.sbGroupPlayPolish='v7-12-177';document.documentElement.dataset.sbGroupPlayPolishRoutes=String((Number(document.documentElement.dataset.sbGroupPlayPolishRoutes)||0)+changed);}catch(e){}return state();}
function state(){return{version:VERSION,routes:CURRENT,visualOnly:true,footerOwner:'global-footer-shell'};}
function boot(){refresh();setTimeout(refresh,200);setTimeout(refresh,900);setTimeout(refresh,1800);setInterval(refresh,3500);try{let obs=new MutationObserver(refresh);obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href','action','data-href','data-target','data-route','data-url']});}catch(e){}window.StreamBanditGroupPlayPolish={version:VERSION,refresh,state,routes:CURRENT};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();