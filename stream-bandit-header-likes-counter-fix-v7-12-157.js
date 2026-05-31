/* Stream Bandit V7.12.157 Header Likes Counter Fix
   Tiny bridge only: makes likes/liked read the same sb_likes count.
   No layout, route, footer, theme, movie, admin, storage or billing changes. */
(function(){
'use strict';
const VERSION='V7.12.157 Header Likes Counter Fix';
const KEYS={
  watchlist:['watchlist','watchlistCount','watchlist_count','sb_watchlist','streamBanditWatchlist','stream-bandit-watchlist'],
  favourites:['favourites','favorites','favouritesCount','favoritesCount','favourites_count','favorites_count','sb_favourites','streamBanditFavourites','stream-bandit-favourites'],
  likes:['likes','liked','likesCount','likedCount','likes_count','liked_count','sb_likes','streamBanditLikes','stream-bandit-likes']
};
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
function finalCount(key){
  const h=helperCount(key);
  return h===null?localCount(key):h;
}
function paint(){
  ['watchlist','favourites','likes'].forEach(function(key){
    const v=Number(finalCount(key))||0;
    const names=key==='likes'?['likes','liked']:[key];
    names.forEach(function(name){
      document.querySelectorAll('[data-sb-count="'+name+'"]').forEach(function(el){
        el.textContent=String(v);
        const a=el.closest&&el.closest('.sb-h-ico');
        if(a) a.classList.toggle('has-count',v>0);
      });
    });
  });
  document.documentElement.dataset.sbHeaderLikesCounterFix='v7-12-157';
  return {version:VERSION,likes:finalCount('likes')};
}
function patchHeader(){
  const h=window.StreamBanditHeaderShell;
  if(!h||h.__likesCounterFixV712157) return;
  const oldUpdate=h.updateCounts;
  const oldRefresh=h.refresh;
  h.updateCounts=function(){try{if(oldUpdate)oldUpdate.apply(h,arguments);}catch(e){}return paint();};
  h.refresh=function(){try{if(oldRefresh)oldRefresh.apply(h,arguments);}catch(e){}return paint();};
  h.__likesCounterFixV712157=VERSION;
}
function run(){patchHeader();return paint();}
['stream-bandit-core-saves-changed','stream-bandit-core-saves-v6-75-changed','streambandit:page-saves-changed','streambandit:details-saves-changed'].forEach(function(ev){window.addEventListener(ev,run);});
window.StreamBanditHeaderLikesCounterFix={version:VERSION,refresh:run,state:run};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
setTimeout(run,200);setTimeout(run,700);setTimeout(run,1500);setTimeout(run,3000);setInterval(run,2500);
})();
