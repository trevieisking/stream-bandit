/* Stream Bandit V7.12.157 Header Likes Counter Fix
   Tiny bridge only: makes likes/liked read the same sb_likes count.
   Prevents old header refresh from briefly repainting Likes as zero.
   No layout, route, footer, theme, movie, admin, storage or billing changes. */
(function(){
'use strict';
const VERSION='V7.12.157 Header Likes Counter Fix / No Flash';
const KEYS={
  watchlist:['watchlist','watchlistCount','watchlist_count','sb_watchlist','streamBanditWatchlist','stream-bandit-watchlist'],
  favourites:['favourites','favorites','favouritesCount','favoritesCount','favourites_count','favorites_count','sb_favourites','streamBanditFavourites','stream-bandit-favourites'],
  likes:['likes','liked','likesCount','likedCount','likes_count','liked_count','sb_likes','streamBanditLikes','stream-bandit-likes']
};
let raf=0,observing=false;
function size(v){
  if(v===null||v===undefined) return null;
  if(typeof v==='number') return isFinite(v)?v:null;
  if(typeof v==='string'){
    if(/^\d+$/.test(v.trim())) return Number(v.trim());
    try{return size(JSON.parse(v));}catch(e){return null;}
  }
  if(Array.isArray(v)) return v.length;
  if(v instanceof Set||v instanceof Map) return v.size;
  if(typeof v==='object') return Object.keys(v).length;
  return null;
}
function inspect(obj,key){
  if(!obj||typeof obj!=='object') return null;
  const bags=[obj];
  if(obj.counts&&typeof obj.counts==='object') bags.push(obj.counts);
  if(obj.state&&typeof obj.state==='object') bags.push(obj.state);
  if(obj.saved&&typeof obj.saved==='object') bags.push(obj.saved);
  for(const bag of bags){
    for(const k of KEYS[key]){
      const n=size(bag[k]);
      if(n!==null) return n;
    }
  }
  return null;
}
function helperCount(key){
  const candidates=[];
  try{
    const m=window.StreamBanditMenuSavesCount;
    if(m){
      if(typeof m.getCounts==='function') candidates.push(m.getCounts());
      if(typeof m.counts==='function') candidates.push(m.counts());
      else if(m.counts) candidates.push(m.counts);
      if(typeof m.state==='function') candidates.push(m.state());
      else if(m.state) candidates.push(m.state);
    }
  }catch(e){}
  try{
    const c=window.StreamBanditCoreSavesV675||window.StreamBanditCoreSaves;
    if(c){
      if(typeof c.counts==='function') candidates.push(c.counts());
      else if(c.counts) candidates.push(c.counts);
      if(typeof c.state==='function') candidates.push(c.state());
      else if(c.state) candidates.push(c.state);
    }
  }catch(e){}
  for(const obj of candidates){
    const n=inspect(obj,key);
    if(n!==null) return n;
  }
  return null;
}
function localCount(key){
  let best=0;
  for(const k of KEYS[key]){
    try{
      const raw=localStorage.getItem(k);
      const n=size(raw);
      if(n!==null) best=Math.max(best,n);
    }catch(e){}
  }
  return best;
}
function displayed(name){
  let best=null;
  document.querySelectorAll('[data-sb-count="'+name+'"]').forEach(function(el){
    const n=Number(String(el.textContent||'').trim());
    if(isFinite(n)) best=Math.max(best===null?0:best,n);
  });
  return best;
}
function finalCount(key){
  const h=helperCount(key);
  if(h!==null) return Number(h)||0;
  const l=localCount(key);
  if(l>0) return l;
  if(key==='likes'){
    const shown=Math.max(displayed('likes')||0,displayed('liked')||0);
    if(shown>0) return shown;
  }
  return l;
}
function setBadge(name,v){
  document.querySelectorAll('[data-sb-count="'+name+'"]').forEach(function(el){
    const text=String(v);
    if(el.textContent!==text) el.textContent=text;
    const a=el.closest&&el.closest('.sb-h-ico');
    if(a&&a.classList.contains('has-count')!==(v>0)) a.classList.toggle('has-count',v>0);
  });
}
function paint(){
  const watchlist=Number(finalCount('watchlist'))||0;
  const favourites=Number(finalCount('favourites'))||0;
  const likes=Number(finalCount('likes'))||0;
  setBadge('watchlist',watchlist);
  setBadge('favourites',favourites);
  setBadge('likes',likes);
  setBadge('liked',likes);
  document.documentElement.dataset.sbHeaderLikesCounterFix='v7-12-157-no-flash';
  return {version:VERSION,watchlist,favourites,likes};
}
function patchHeader(){
  const h=window.StreamBanditHeaderShell;
  if(!h||h.__likesCounterFixV712157NoFlash) return;
  const oldUpdate=h.updateCounts;
  const oldRefresh=h.refresh;
  h.updateCounts=function(){try{if(oldUpdate)oldUpdate.apply(h,arguments);}catch(e){}return paint();};
  h.refresh=function(){try{if(oldRefresh)oldRefresh.apply(h,arguments);}catch(e){}return paint();};
  h.__likesCounterFixV712157NoFlash=VERSION;
}
function schedule(){
  if(raf) return;
  raf=requestAnimationFrame(function(){raf=0;run();});
}
function observeBadges(){
  if(observing) return;
  const root=document.getElementById('sbHeaderShell')||document.body;
  if(!root) return;
  observing=true;
  try{
    const obs=new MutationObserver(function(muts){
      for(const m of muts){
        if(m.target&&m.target.closest&&m.target.closest('[data-sb-count="likes"],[data-sb-count="liked"]')){schedule();return;}
        if(m.addedNodes&&m.addedNodes.length){schedule();return;}
      }
    });
    obs.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
  }catch(e){}
}
function run(){patchHeader();observeBadges();return paint();}
['stream-bandit-core-saves-changed','stream-bandit-core-saves-v6-75-changed','streambandit:page-saves-changed','streambandit:details-saves-changed'].forEach(function(ev){window.addEventListener(ev,run);});
window.StreamBanditHeaderLikesCounterFix={version:VERSION,refresh:run,state:run};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
setTimeout(run,100);setTimeout(run,300);setTimeout(run,700);setTimeout(run,1500);setTimeout(run,3000);setInterval(run,500);
})();
