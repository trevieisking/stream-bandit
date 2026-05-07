/* Stream Bandit V5.22.5 — Supabase Details Info Strip TEST
   Fixes V5.22.4 losing most of the info boxes.
   Goal: keep ALL existing real text/info boxes, move them into a neat strip below poster/description,
   and keep the large bottom Play / Resume + Back to Library buttons.
   This script moves existing DOM nodes, not cloned fake content, so button handlers and info text are preserved.
   Visual-only overlay. No Supabase writes, no movie saves, no Mux changes, no player source changes. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetails(){var t=txt(main()).toLowerCase();return t.indexOf('supabase details')>-1&&t.indexOf('overview')>-1&&t.indexOf('cast & crew')>-1&&t.indexOf('trailer')>-1;}
function isOverview(){var m=main();var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(txt(b))&&/active/i.test(String(b.className||''));});return !!active||txt(m).toLowerCase().indexOf('play / resume')>-1;}
function addStyle(){
 if(document.getElementById('sb5225Style'))return;
 var st=document.createElement('style');st.id='sb5225Style';
 st.textContent='\nbody.sb5225DetailsInfoStrip .sb5225Card{position:relative!important;overflow:hidden!important;padding:18px 18px 98px!important;border-radius:26px!important}body.sb5225DetailsInfoStrip .sb5225Top{display:grid!important;grid-template-columns:minmax(260px,390px) 1fr!important;gap:18px!important;align-items:start!important}body.sb5225DetailsInfoStrip .sb5225Poster img{width:100%!important;max-height:300px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important}body.sb5225DetailsInfoStrip .sb5225Text{min-width:0!important}body.sb5225DetailsInfoStrip .sb5225Text h2,body.sb5225DetailsInfoStrip .sb5225Text h3,body.sb5225DetailsInfoStrip .sb5225Text h4{margin-top:4px!important;margin-bottom:12px!important}body.sb5225DetailsInfoStrip .sb5225Text p{margin-bottom:14px!important;line-height:1.45!important}body.sb5225DetailsInfoStrip .sb5225Tags{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important}body.sb5225DetailsInfoStrip .sb5225InfoStrip{display:grid!important;grid-template-columns:repeat(5,minmax(120px,1fr))!important;gap:12px!important;margin-top:16px!important;padding-top:16px!important;border-top:1px solid rgba(255,255,255,.08)!important}body.sb5225DetailsInfoStrip .sb5225InfoStrip>*{margin:0!important;min-height:86px!important;height:auto!important;border-radius:18px!important}body.sb5225DetailsInfoStrip .sb5225ActionBar{position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important}body.sb5225DetailsInfoStrip .sb5225ActionBar button,body.sb5225DetailsInfoStrip .sb5225ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}body.sb5225DetailsInfoStrip .sb5225Play{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}body.sb5225DetailsInfoStrip .sb5225Back{background:rgba(53,57,86,.96)!important}body.sb5225DetailsInfoStrip .sb5225Tag{position:absolute;right:18px;bottom:86px;border-radius:999px;padding:7px 10px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-size:12px;font-weight:900;pointer-events:none}@media(max-width:980px){body.sb5225DetailsInfoStrip .sb5225InfoStrip{grid-template-columns:repeat(2,minmax(150px,1fr))!important}}@media(max-width:760px){body.sb5225DetailsInfoStrip .sb5225Card{padding-bottom:150px!important}body.sb5225DetailsInfoStrip .sb5225Top{grid-template-columns:1fr!important}body.sb5225DetailsInfoStrip .sb5225ActionBar{grid-template-columns:1fr!important}body.sb5225DetailsInfoStrip .sb5225InfoStrip{grid-template-columns:1fr!important}body.sb5225DetailsInfoStrip .sb5225Tag{display:none}}\n';
 document.head.appendChild(st);
}
function button(re){return Array.prototype.slice.call(main().querySelectorAll('button,a')).find(function(b){return re.test(txt(b));})||null;}
function cardFrom(play,back){var a=play||back;if(!a)return null;var c=a.closest('.card,.panel,section');if(c)return c;var p=a.parentElement;while(p&&p!==document.body&&p!==main()){var s=txt(p).toLowerCase();if(s.indexOf('source')>-1&&s.indexOf('playable')>-1)return p;p=p.parentElement;}return a.closest('div');}
function poster(card){var imgs=Array.prototype.slice.call(card.querySelectorAll('img'));return imgs.find(function(i){var r=i.getBoundingClientRect();return r.width>100&&r.height>70;})||imgs[0]||null;}
function title(card){return Array.prototype.slice.call(card.querySelectorAll('h2,h3,h4')).find(function(h){return !/overview|cast|crew|trailer|supabase|stable|checkpoint/i.test(txt(h));})||null;}
function desc(card){return Array.prototype.slice.call(card.querySelectorAll('p')).find(function(p){var s=txt(p);return s.length>35&&!/supabase movie details|older browser|emergency fallback/i.test(s);})||null;}
function tags(card){return Array.prototype.slice.call(card.querySelectorAll('.pill')).filter(function(p){var s=txt(p);return s&&s.length<48&&!/stable|checkpoint|supabase-first/i.test(s);});}
function isInfo(el){
 if(!el||el.id||el.classList.contains('sb5225Top')||el.classList.contains('sb5225InfoStrip')||el.classList.contains('sb5225ActionBar'))return false;
 var s=txt(el); if(!s||s.length>260)return false;
 if(/crime 101|an elusive thief|play\s*\/\s*resume|back to library/i.test(s))return false;
 return /^(year|rating|runtime|age rating|source)\b/i.test(s)||/\b(year|rating|runtime|age rating|source|playable|imdb|rotten|metacritic|letterboxd)\b/i.test(s);
}
function collectInfo(card, keep){
 var out=[], seen={};
 Array.prototype.slice.call(card.querySelectorAll('div')).forEach(function(el){
   if(el===card)return;
   if(keep.some(function(k){return k&&(el===k||el.contains(k)||k.contains(el));}))return;
   if(isInfo(el)){
     // prefer larger parent tile, avoid collecting child duplicates already inside a collected tile
     if(out.some(function(o){return o.contains(el);}))return;
     out=out.filter(function(o){return !el.contains(o);});
     var s=txt(el); if(!seen[s]){seen[s]=1;out.push(el);}
   }
 });
 return out;
}
function apply(){
 if(!isDetails()||!isOverview()){document.body.classList.remove('sb5225DetailsInfoStrip');return;}
 addStyle();document.body.classList.add('sb5225DetailsInfoStrip');
 var play=button(/play\s*\/\s*resume/i), back=button(/back\s+to\s+library/i);
 var card=cardFrom(play,back); if(!card||card.dataset.sb5225Done==='1')return;
 card.dataset.sb5225Done='1'; card.classList.add('sb5225Card');
 var po=poster(card), ti=title(card), de=desc(card), tg=tags(card), btns=[play,back].filter(Boolean);
 var keep=[po,ti,de].filter(Boolean).concat(tg).concat(btns);
 var info=collectInfo(card,keep);
 var top=document.createElement('div');top.className='sb5225Top';
 var left=document.createElement('div');left.className='sb5225Poster';
 var right=document.createElement('div');right.className='sb5225Text';
 var tagRow=document.createElement('div');tagRow.className='sb5225Tags';
 var strip=document.createElement('div');strip.className='sb5225InfoStrip';
 var bar=document.createElement('div');bar.className='sb5225ActionBar';
 if(po)left.appendChild(po);
 if(ti)right.appendChild(ti);
 if(de)right.appendChild(de);
 tg.forEach(function(x){tagRow.appendChild(x);}); if(tagRow.children.length)right.appendChild(tagRow);
 info.forEach(function(x){strip.appendChild(x);});
 if(play){play.classList.add('sb5225Play');bar.appendChild(play);}
 if(back){back.classList.add('sb5225Back');bar.appendChild(back);}
 top.appendChild(left);top.appendChild(right);
 // Clear only after all real nodes have been moved into safe containers.
 card.innerHTML=''; card.appendChild(top); if(strip.children.length)card.appendChild(strip); card.appendChild(bar);
 var label=document.createElement('div');label.className='sb5225Tag';label.textContent='V5.22.5 tidy test';card.appendChild(label);
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
