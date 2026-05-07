/* Stream Bandit V5.22.4 — Supabase Details Compact Overview TEST
   Builds on V5.22.3 action bar style that the user liked.
   Goal: keep large bottom Play / Resume and Back to Library buttons,
   but compact the Overview card by moving the meta/info cards up into a neat row/grid,
   using the empty space below poster/description better.
   Visual-only overlay. No Supabase writes, no movie saves, no Mux changes, no player source changes. */
(function(){
'use strict';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isSupabaseDetails(){
  var m=main();
  var t=text(m).toLowerCase();
  return t.indexOf('supabase details')>-1 && t.indexOf('overview')>-1 && t.indexOf('cast & crew')>-1 && t.indexOf('trailer')>-1;
}
function isOverviewActive(){
  var m=main();
  var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(text(b)) && /active/i.test(String(b.className||''));});
  if(active)return true;
  return text(m).toLowerCase().indexOf('play / resume')>-1;
}
function addStyle(){
  if(document.getElementById('sb5224Style'))return;
  var st=document.createElement('style');
  st.id='sb5224Style';
  st.textContent='\nbody.sb5224CompactDetails .sb5224Card{position:relative!important;overflow:hidden!important;padding:18px 18px 98px!important;border-radius:26px!important}body.sb5224CompactDetails .sb5224TopGrid{display:grid!important;grid-template-columns:minmax(260px,390px) 1fr!important;gap:18px!important;align-items:start!important}body.sb5224CompactDetails .sb5224PosterSlot img{width:100%!important;max-height:300px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important}body.sb5224CompactDetails .sb5224TextSlot{min-width:0!important}body.sb5224CompactDetails .sb5224TextSlot h3{margin-top:4px!important;margin-bottom:12px!important}body.sb5224CompactDetails .sb5224TextSlot p{margin-bottom:14px!important;line-height:1.45!important}body.sb5224CompactDetails .sb5224TagRow{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important}body.sb5224CompactDetails .sb5224MetaStrip{display:grid!important;grid-template-columns:repeat(5,minmax(120px,1fr))!important;gap:12px!important;margin-top:16px!important;padding-top:16px!important;border-top:1px solid rgba(255,255,255,.08)!important}body.sb5224CompactDetails .sb5224MetaStrip>*{margin:0!important;min-height:86px!important;height:auto!important}body.sb5224CompactDetails .sb5224MetaStrip .infoTile,body.sb5224CompactDetails .sb5224MetaStrip .tile,body.sb5224CompactDetails .sb5224MetaStrip .stat,body.sb5224CompactDetails .sb5224MetaStrip>div{border-radius:18px!important}body.sb5224CompactDetails .sb5224ActionBar{position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important}body.sb5224CompactDetails .sb5224ActionBar button,body.sb5224CompactDetails .sb5224ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}body.sb5224CompactDetails .sb5224PlayBtn{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}body.sb5224CompactDetails .sb5224BackBtn{background:rgba(53,57,86,.96)!important}body.sb5224CompactDetails .sb5224TidyTag{position:absolute;right:18px;bottom:86px;border-radius:999px;padding:7px 10px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-size:12px;font-weight:900;pointer-events:none}body.sb5224CompactDetails .sb5224HiddenOriginal{display:none!important}@media(max-width:980px){body.sb5224CompactDetails .sb5224MetaStrip{grid-template-columns:repeat(2,minmax(150px,1fr))!important}}@media(max-width:760px){body.sb5224CompactDetails .sb5224Card{padding-bottom:150px!important}body.sb5224CompactDetails .sb5224TopGrid{grid-template-columns:1fr!important}body.sb5224CompactDetails .sb5224ActionBar{grid-template-columns:1fr!important}body.sb5224CompactDetails .sb5224MetaStrip{grid-template-columns:1fr!important}body.sb5224CompactDetails .sb5224TidyTag{display:none}}\n';
  document.head.appendChild(st);
}
function findButton(re){return Array.prototype.slice.call(main().querySelectorAll('button,a')).find(function(b){return re.test(text(b));})||null;}
function findCard(play,back){
  var a=play||back;if(!a)return null;
  var card=a.closest('.card,.panel,section');
  if(card)return card;
  var p=a.parentElement;
  while(p&&p!==document.body&&p!==main()){
    var s=text(p).toLowerCase();
    if(s.indexOf('source')>-1&&s.indexOf('playable')>-1)return p;
    p=p.parentElement;
  }
  return a.closest('div');
}
function findPoster(card){
  var imgs=Array.prototype.slice.call(card.querySelectorAll('img'));
  return imgs.find(function(img){var r=img.getBoundingClientRect();return r.width>100&&r.height>70;})||imgs[0]||null;
}
function findTitle(card){
  return Array.prototype.slice.call(card.querySelectorAll('h2,h3,h4')).find(function(h){return !/overview|cast|crew|trailer|supabase|stable|checkpoint/i.test(text(h));})||null;
}
function findDesc(card){
  return Array.prototype.slice.call(card.querySelectorAll('p')).find(function(p){var s=text(p);return s.length>35&&!/supabase movie details|older browser/i.test(s);})||null;
}
function findTags(card){return Array.prototype.slice.call(card.querySelectorAll('.pill')).filter(function(p){return text(p).length<45;});}
function isMetaTile(el){
  if(!el||el.id)return false;
  var s=text(el);
  if(!s||s.length>220)return false;
  if(/crime 101|an elusive thief|play\s*\/\s*resume|back to library/i.test(s))return false;
  return /year|rating|runtime|age rating|source|playable|published|mux|hls|\b202\d\b|\d+h|\d+\s*min|imdb|rotten|metacritic|letterboxd/i.test(s);
}
function findMeta(card, poster, title, desc, tags, buttons){
  var protectedNodes=[poster,title,desc].filter(Boolean).concat(tags||[]).concat(buttons||[]);
  var found=[];var seen={};
  Array.prototype.slice.call(card.children).forEach(function(ch){
    if(protectedNodes.some(function(n){return n===ch||ch.contains(n)||n.contains(ch);}))return;
    if(isMetaTile(ch)){var s=text(ch);if(!seen[s]){seen[s]=1;found.push(ch);}}
    Array.prototype.slice.call(ch.children||[]).forEach(function(g){
      if(protectedNodes.some(function(n){return n===g||g.contains(n)||n.contains(g);}))return;
      if(isMetaTile(g)){var sg=text(g);if(!seen[sg]){seen[sg]=1;found.push(g);}}
    });
  });
  return found.slice(0,8);
}
function apply(){
  if(!isSupabaseDetails()||!isOverviewActive()){
    document.body.classList.remove('sb5224CompactDetails');
    return;
  }
  addStyle();document.body.classList.add('sb5224CompactDetails');
  var play=findButton(/play\s*\/\s*resume/i);
  var back=findButton(/back\s+to\s+library/i);
  var card=findCard(play,back);
  if(!card||card.dataset.sb5224Done==='1')return;
  card.dataset.sb5224Done='1';
  card.classList.add('sb5224Card');
  var poster=findPoster(card);
  var title=findTitle(card);
  var desc=findDesc(card);
  var tags=findTags(card);
  var buttons=[play,back].filter(Boolean);
  var meta=findMeta(card,poster,title,desc,tags,buttons);

  var topGrid=document.createElement('div');topGrid.className='sb5224TopGrid';
  var posterSlot=document.createElement('div');posterSlot.className='sb5224PosterSlot';
  var textSlot=document.createElement('div');textSlot.className='sb5224TextSlot';
  var tagRow=document.createElement('div');tagRow.className='sb5224TagRow';
  var metaStrip=document.createElement('div');metaStrip.className='sb5224MetaStrip';
  var bar=document.createElement('div');bar.id='sb5224ActionBar';bar.className='sb5224ActionBar';

  if(poster)posterSlot.appendChild(poster);
  if(title)textSlot.appendChild(title);
  if(desc)textSlot.appendChild(desc);
  tags.forEach(function(t){tagRow.appendChild(t);});
  if(tagRow.children.length)textSlot.appendChild(tagRow);
  meta.forEach(function(m){metaStrip.appendChild(m);});
  if(play){play.classList.add('sb5224PlayBtn');bar.appendChild(play);}
  if(back){back.classList.add('sb5224BackBtn');bar.appendChild(back);}

  topGrid.appendChild(posterSlot);topGrid.appendChild(textSlot);
  card.innerHTML='';
  card.appendChild(topGrid);
  if(metaStrip.children.length)card.appendChild(metaStrip);
  card.appendChild(bar);
  var tag=document.createElement('div');tag.className='sb5224TidyTag';tag.textContent='V5.22.4 tidy test';card.appendChild(tag);
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
