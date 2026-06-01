/* Stream Bandit Group Play Route Truth V7.12.176
   Small safe route patcher for current Group Play pass.
   Owns route correction only. No writes, no payments, no player rewrite. */
(function(){
'use strict';
const VERSION='V7.12.176 Group Play Route Truth';
const ROUTES={
  collections:'collections-clean-machine-v7-12-51-test.html',
  player2:'player-2-clean-machine-v7-12-58-test.html',
  player1:'player-one-global-helpers-v7-3-3-test.html',
  details:'details-clean-machine-v7-12-38-test.html',
  playlists:'playlists-global-helpers-v7-5-2-test.html',
  channels:'channels-global-helpers-v7-5-3-test.html',
  myChannel:'my-channel-clean-machine-v7-12-47-test.html'
};
const FIX={
  'collections-clean-machine-v7-12-48-test.html':ROUTES.collections,
  'collections-clean-machine-v7-12-49-test.html':ROUTES.collections,
  'collections-clean-machine-v7-12-50-test.html':ROUTES.collections,
  'collections-global-helpers-v7-5-1-test.html':ROUTES.collections,
  'collections-browse-shell-v6-46-1-test.html':ROUTES.collections,
  'player-two-global-helpers-v7-3-4-test.html':ROUTES.player2,
  'player-2-progress-helper-v6-78-9-4-test.html':ROUTES.player2,
  'player-2-clean-machine-v7-12-57-test.html':ROUTES.player2,
  'my-channel-global-helpers-v7-5-0-test.html':ROUTES.myChannel
};
const LABEL={
  'Collections':ROUTES.collections,
  'Player 2':ROUTES.player2,
  'Playlists':ROUTES.playlists,
  'Channels':ROUTES.channels,
  'My Channel':ROUTES.myChannel
};
function file(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0];}
function clean(s){return String(s||'').replace(/\s+/g,' ').trim().replace(/ Current$/,'');}
function labelOf(a){let b=a&&a.querySelector&&a.querySelector('b,.sb-shell-title');return clean(b?b.textContent:a?a.textContent:'');}
function withTail(target,old){try{let u=new URL(String(old||''),location.href);return target+(u.search||'')+(u.hash||'');}catch(e){return target;}}
function patchUrl(raw){if(!raw||!String(raw).includes('.html'))return raw;let f=file(raw),target=FIX[f];return target?withTail(target,raw):raw;}
function patchLabel(a){let l=labelOf(a),target=LABEL[l];if(!target)return 0;let old=a.getAttribute('href')||'';let next=withTail(target,old);if(old!==next){a.setAttribute('href',next);a.dataset.sbGroupPlayRouteTruth='v7-12-176';return 1;}return 0;}
function patch(root){root=root||document;let count=0;try{root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(el=>{['href','action','data-href','data-target','data-route','data-url'].forEach(attr=>{let old=el.getAttribute(attr),next=patchUrl(old);if(old&&next&&old!==next){el.setAttribute(attr,next);el.dataset.sbGroupPlayRouteTruth='v7-12-176';count++;}});if(el.matches&&el.matches('a'))count+=patchLabel(el);});}catch(e){}try{document.documentElement.dataset.sbGroupPlayRouteTruth='v7-12-176';document.documentElement.dataset.sbGroupPlayRouteTruthCount=String((Number(document.documentElement.dataset.sbGroupPlayRouteTruthCount)||0)+count);}catch(e){}return count;}
function expose(){try{window.StreamBanditRoutes=Object.assign(window.StreamBanditRoutes||{},ROUTES,{groupPlayer:ROUTES.player2});}catch(e){}}
function boot(){expose();patch(document);setTimeout(()=>patch(document),200);setTimeout(()=>patch(document),800);setTimeout(()=>patch(document),1800);setInterval(()=>{expose();patch(document);},3000);try{let obs=new MutationObserver(()=>patch(document));obs.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href','action','data-href','data-target','data-route','data-url']});}catch(e){}window.StreamBanditGroupPlayRouteTruth={version:VERSION,routes:ROUTES,patch:()=>patch(document),state:()=>({version:VERSION,routes:ROUTES,count:document.documentElement.dataset.sbGroupPlayRouteTruthCount||'0'})};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();