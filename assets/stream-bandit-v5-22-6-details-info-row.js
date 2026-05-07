/* Stream Bandit V5.22.6 — Supabase Details Info Row TEST
   Based on user drawing: keep poster/title/description/tags at top, then arrange info boxes as:
   Year | Runtime | Age rating | Source/Playable | Rating
   Keep the large bottom Play / Resume and Back to Library buttons.
   This version tries harder to select the full wide Details card, not a narrow inner card.
   It moves existing DOM nodes where possible and does not write to Supabase or movie data. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetails(){var t=txt(main()).toLowerCase();return t.indexOf('supabase details')>-1&&t.indexOf('overview')>-1&&t.indexOf('cast & crew')>-1&&t.indexOf('trailer')>-1;}
function isOverview(){var m=main();var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(txt(b))&&/active/i.test(String(b.className||''));});return !!active||txt(m).toLowerCase().indexOf('play / resume')>-1;}
function addStyle(){
 if(document.getElementById('sb5226Style'))return;
 var st=document.createElement('style');st.id='sb5226Style';
 st.textContent='\nbody.sb5226InfoRow .sb5226Card{position:relative!important;overflow:hidden!important;padding:18px 18px 104px!important;border-radius:26px!important;min-height:auto!important}body.sb5226InfoRow .sb5226Top{display:grid!important;grid-template-columns:minmax(260px,390px) 1fr!important;gap:18px!important;align-items:start!important}body.sb5226InfoRow .sb5226Poster img{width:100%!important;max-height:300px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important}body.sb5226InfoRow .sb5226Text{min-width:0!important}body.sb5226InfoRow .sb5226Text h2,body.sb5226InfoRow .sb5226Text h3,body.sb5226InfoRow .sb5226Text h4{margin:4px 0 12px!important}body.sb5226InfoRow .sb5226Text p{line-height:1.45!important;margin:0 0 14px!important}body.sb5226InfoRow .sb5226Tags{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important}body.sb5226InfoRow .sb5226InfoRowGrid{display:grid!important;grid-template-columns:1fr 1fr 1fr 1fr 2fr!important;gap:12px!important;margin-top:16px!important;padding-top:16px!important;border-top:1px solid rgba(255,255,255,.08)!important;align-items:stretch!important}body.sb5226InfoRow .sb5226InfoRowGrid>*{margin:0!important;min-height:88px!important;height:auto!important;border-radius:18px!important;align-self:stretch!important}body.sb5226InfoRow .sb5226InfoRating{grid-column:auto!important}body.sb5226InfoRow .sb5226ActionBar{position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important}body.sb5226InfoRow .sb5226ActionBar button,body.sb5226InfoRow .sb5226ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}body.sb5226InfoRow .sb5226Play{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}body.sb5226InfoRow .sb5226Back{background:rgba(53,57,86,.96)!important}body.sb5226InfoRow .sb5226Tag{position:absolute;right:18px;bottom:88px;border-radius:999px;padding:7px 10px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-size:12px;font-weight:900;pointer-events:none}@media(max-width:1100px){body.sb5226InfoRow .sb5226InfoRowGrid{grid-template-columns:repeat(2,minmax(150px,1fr))!important}body.sb5226InfoRow .sb5226InfoRating{grid-column:1/-1!important}}@media(max-width:760px){body.sb5226InfoRow .sb5226Card{padding-bottom:150px!important}body.sb5226InfoRow .sb5226Top{grid-template-columns:1fr!important}body.sb5226InfoRow .sb5226InfoRowGrid{grid-template-columns:1fr!important}body.sb5226InfoRow .sb5226ActionBar{grid-template-columns:1fr!important}body.sb5226InfoRow .sb5226Tag{display:none}}\n';
 document.head.appendChild(st);
}
function button(re){return Array.prototype.slice.call(main().querySelectorAll('button,a')).find(function(b){return re.test(txt(b));})||null;}
function poster(root){var imgs=Array.prototype.slice.call(root.querySelectorAll('img'));return imgs.find(function(i){var r=i.getBoundingClientRect();return r.width>100&&r.height>70;})||imgs[0]||null;}
function fullCard(play,back){
 var m=main(); var start=play||back; if(!start)return null;
 var best=null; var p=start.parentElement;
 while(p&&p!==document.body&&p!==m.parentElement){
   var s=txt(p).toLowerCase();
   if(s.indexOf('crime 101')>-1&&s.indexOf('play / resume')>-1&&s.indexOf('back to library')>-1&&s.indexOf('year')>-1){best=p;}
   if(p===m)break;
   p=p.parentElement;
 }
 if(best&&best!==m)return best;
 var cards=Array.prototype.slice.call(m.querySelectorAll('.card,.panel,section,div')).filter(function(c){
   var s=txt(c).toLowerCase();
   return s.indexOf('play / resume')>-1&&s.indexOf('back to library')>-1&&s.indexOf('year')>-1&&poster(c);
 });
 cards.sort(function(a,b){return b.getBoundingClientRect().width-a.getBoundingClientRect().width;});
 return cards[0]||start.closest('.card,.panel,section,div');
}
function title(card){return Array.prototype.slice.call(card.querySelectorAll('h2,h3,h4')).find(function(h){return !/overview|cast|crew|trailer|supabase|stable|checkpoint/i.test(txt(h));})||null;}
function desc(card){return Array.prototype.slice.call(card.querySelectorAll('p')).find(function(p){var s=txt(p);return s.length>35&&!/supabase movie details|older browser|emergency fallback/i.test(s);})||null;}
function tags(card){return Array.prototype.slice.call(card.querySelectorAll('.pill')).filter(function(p){var s=txt(p);return s&&s.length<48&&!/stable|checkpoint|supabase-first/i.test(s);});}
function tileKind(s){s=s.toLowerCase();if(/\byear\b|^202\d$/.test(s))return 'year';if(/runtime|\d+h|\d+\s*min/.test(s))return 'runtime';if(/age rating|\bage\b/.test(s))return 'age';if(/source|playable/.test(s))return 'source';if(/rating|imdb|rotten|metacritic|letterboxd|stream bandit score/.test(s))return 'rating';return '';}
function isTile(el, keep){
 if(!el||el.id||el.className&&String(el.className).indexOf('sb5226')>-1)return false;
 if(keep.some(function(k){return k&&(el===k||el.contains(k)||k.contains(el));}))return false;
 var s=txt(el); if(!s||s.length>320)return false;
 if(/crime 101|an elusive thief|play\s*\/\s*resume|back to library/i.test(s))return false;
 return !!tileKind(s);
}
function collectTiles(card, keep){
 var all=Array.prototype.slice.call(card.querySelectorAll('div'));
 var picked=[], seen={};
 all.forEach(function(el){
   if(!isTile(el,keep))return;
   if(picked.some(function(p){return p.contains(el);}))return;
   picked=picked.filter(function(p){return !el.contains(p);});
   var s=txt(el); if(!seen[s]){seen[s]=1;picked.push(el);}
 });
 var buckets={year:null,runtime:null,age:null,source:null,rating:null};
 picked.forEach(function(el){var k=tileKind(txt(el));if(k&&!buckets[k])buckets[k]=el;});
 return ['year','runtime','age','source','rating'].map(function(k){var el=buckets[k];if(el&&k==='rating')el.classList.add('sb5226InfoRating');return el;}).filter(Boolean);
}
function makeMissing(label,value){var d=document.createElement('div');d.className='infoTile';d.innerHTML='<b>'+label+'</b><span>'+value+'</span>';return d;}
function apply(){
 if(!isDetails()||!isOverview()){document.body.classList.remove('sb5226InfoRow');return;}
 addStyle();document.body.classList.add('sb5226InfoRow');
 var play=button(/play\s*\/\s*resume/i), back=button(/back\s+to\s+library/i);
 var card=fullCard(play,back); if(!card||card.dataset.sb5226Done==='1')return;
 card.dataset.sb5226Done='1'; card.classList.add('sb5226Card');
 var po=poster(card), ti=title(card), de=desc(card), tg=tags(card), keep=[po,ti,de,play,back].filter(Boolean).concat(tg);
 var tiles=collectTiles(card,keep);
 var top=document.createElement('div');top.className='sb5226Top';
 var left=document.createElement('div');left.className='sb5226Poster';
 var right=document.createElement('div');right.className='sb5226Text';
 var tagRow=document.createElement('div');tagRow.className='sb5226Tags';
 var info=document.createElement('div');info.className='sb5226InfoRowGrid';
 var bar=document.createElement('div');bar.className='sb5226ActionBar';
 if(po)left.appendChild(po);
 if(ti)right.appendChild(ti);
 if(de)right.appendChild(de);
 tg.forEach(function(x){tagRow.appendChild(x);}); if(tagRow.children.length)right.appendChild(tagRow);
 tiles.forEach(function(x){info.appendChild(x);});
 if(play){play.classList.add('sb5226Play');bar.appendChild(play);}
 if(back){back.classList.add('sb5226Back');bar.appendChild(back);}
 top.appendChild(left);top.appendChild(right);
 card.innerHTML='';card.appendChild(top);if(info.children.length)card.appendChild(info);card.appendChild(bar);
 var lab=document.createElement('div');lab.className='sb5226Tag';lab.textContent='V5.22.6 tidy test';card.appendChild(lab);
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
