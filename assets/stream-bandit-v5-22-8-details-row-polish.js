/* Stream Bandit V5.22.8 — Supabase Details Row Polish TEST
   Builds on V5.22.7, which the user liked.
   Goal: keep the same layout, but make it neater:
   - Source stays on the same row where possible
   - Info cards are shorter and cleaner
   - Rating remains the wider final card
   - Big bottom action buttons stay unchanged
   Visual-only overlay. No Supabase writes, no movie saves, no Mux/player source changes. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetails(){var t=txt(main()).toLowerCase();return t.indexOf('supabase details')>-1&&t.indexOf('overview')>-1&&t.indexOf('cast & crew')>-1&&t.indexOf('trailer')>-1;}
function isOverview(){var m=main();var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(txt(b))&&/active/i.test(String(b.className||''));});return !!active||txt(m).toLowerCase().indexOf('play / resume')>-1;}
function addStyle(){
 if(document.getElementById('sb5228Style'))return;
 var st=document.createElement('style');st.id='sb5228Style';
 st.textContent='\nbody.sb5228RowPolish .sb5228Card{position:relative!important;overflow:hidden!important;padding:18px 18px 104px!important;border-radius:26px!important;min-height:auto!important}body.sb5228RowPolish .sb5228Top{display:grid!important;grid-template-columns:minmax(260px,390px) minmax(320px,1fr)!important;gap:20px!important;align-items:center!important;width:100%!important}body.sb5228RowPolish .sb5228Poster img{width:100%!important;max-height:300px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important;box-shadow:0 14px 34px rgba(0,0,0,.28)!important}body.sb5228RowPolish .sb5228Text{min-width:0!important}body.sb5228RowPolish .sb5228Text h2,body.sb5228RowPolish .sb5228Text h3,body.sb5228RowPolish .sb5228Text h4{margin:4px 0 12px!important}body.sb5228RowPolish .sb5228Text p{line-height:1.45!important;margin:0 0 14px!important}body.sb5228RowPolish .sb5228Tags{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important}.sb5228InfoRow{display:grid!important;grid-template-columns:minmax(110px,.75fr) minmax(130px,.85fr) minmax(120px,.8fr) minmax(130px,.85fr) minmax(260px,1.75fr)!important;gap:12px!important;width:100%!important;max-width:none!important;margin:16px 0 0!important;padding:16px 0 0!important;border-top:1px solid rgba(255,255,255,.08)!important;align-items:stretch!important;box-sizing:border-box!important}.sb5228InfoRow>*{min-width:0!important;width:auto!important;max-width:none!important;margin:0!important;min-height:76px!important;height:auto!important;border-radius:18px!important;box-sizing:border-box!important;padding:13px 14px!important;align-self:stretch!important}.sb5228InfoRow .sb5228Rating{min-height:76px!important}.sb5228InfoRow b{display:block!important;margin-bottom:6px!important;font-size:13px!important;color:var(--muted,#a9afc3)!important}.sb5228InfoRow span,.sb5228InfoRow strong{display:block!important;line-height:1.28!important}.sb5228InfoRow .sb5228Rating{font-size:14px!important;line-height:1.28!important}body.sb5228RowPolish .sb5228ActionBar{position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important}body.sb5228RowPolish .sb5228ActionBar button,body.sb5228RowPolish .sb5228ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}body.sb5228RowPolish .sb5228Play{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}body.sb5228RowPolish .sb5228Back{background:rgba(53,57,86,.96)!important}body.sb5228RowPolish .sb5228Tag{position:absolute;right:18px;bottom:88px;border-radius:999px;padding:7px 10px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-size:12px;font-weight:900;pointer-events:none}@media(max-width:930px){.sb5228InfoRow{grid-template-columns:repeat(2,minmax(150px,1fr))!important}.sb5228InfoRow .sb5228Rating{grid-column:1/-1!important}}@media(max-width:760px){body.sb5228RowPolish .sb5228Card{padding-bottom:150px!important}body.sb5228RowPolish .sb5228Top{grid-template-columns:1fr!important}.sb5228InfoRow{grid-template-columns:1fr!important}body.sb5228RowPolish .sb5228ActionBar{grid-template-columns:1fr!important}body.sb5228RowPolish .sb5228Tag{display:none}}\n';
 document.head.appendChild(st);
}
function button(re){return Array.prototype.slice.call(main().querySelectorAll('button,a')).find(function(b){return re.test(txt(b));})||null;}
function poster(root){var imgs=Array.prototype.slice.call(root.querySelectorAll('img'));return imgs.find(function(i){var r=i.getBoundingClientRect();return r.width>100&&r.height>70;})||imgs[0]||null;}
function card(play,back){
 var m=main(), start=play||back;if(!start)return null;
 var cs=Array.prototype.slice.call(m.querySelectorAll('.card,.panel,section,div')).filter(function(c){var s=txt(c).toLowerCase();return s.indexOf('play / resume')>-1&&s.indexOf('back to library')>-1&&s.indexOf('year')>-1&&poster(c);});
 cs.sort(function(a,b){var ar=a.getBoundingClientRect(), br=b.getBoundingClientRect();return (br.width*br.height)-(ar.width*ar.height);});
 return cs[0]||start.closest('.card,.panel,section,div');
}
function title(c){return Array.prototype.slice.call(c.querySelectorAll('h2,h3,h4')).find(function(h){return !/overview|cast|crew|trailer|supabase|stable|checkpoint/i.test(txt(h));})||null;}
function desc(c){return Array.prototype.slice.call(c.querySelectorAll('p')).find(function(p){var s=txt(p);return s.length>35&&!/supabase movie details|older browser|emergency fallback/i.test(s);})||null;}
function tags(c){return Array.prototype.slice.call(c.querySelectorAll('.pill')).filter(function(p){var s=txt(p);return s&&s.length<48&&!/stable|checkpoint|supabase-first/i.test(s);});}
function kind(s){s=s.toLowerCase();if(/\byear\b|^202\d$/.test(s))return 'year';if(/runtime|\d+h|\d+\s*min/.test(s))return 'runtime';if(/age rating|\bage\b/.test(s))return 'age';if(/source|playable/.test(s))return 'source';if(/rating|imdb|rotten|metacritic|letterboxd|stream bandit score/.test(s))return 'rating';return '';}
function isTile(el, keep){if(!el||el.id||String(el.className||'').indexOf('sb5228')>-1)return false;if(keep.some(function(k){return k&&(el===k||el.contains(k)||k.contains(el));}))return false;var s=txt(el);if(!s||s.length>340)return false;if(/crime 101|an elusive thief|play\s*\/\s*resume|back to library/i.test(s))return false;return !!kind(s);}
function simplifyRating(el){
 if(!el)return;
 el.classList.add('sb5228Rating');
 var s=txt(el);
 var sb=s.match(/Stream Bandit Score:\s*([0-9]+\s*\/\s*100)/i);
 var good=s.match(/\((Good|Great|Excellent|Poor|Average|Okay)\)/i);
 if(sb){el.innerHTML='<b>Rating</b><span>Stream Bandit Score:<br><strong>'+sb[1]+(good?' ('+good[1]+')':'')+'</strong></span>';}
}
function collect(c, keep){
 var all=Array.prototype.slice.call(c.querySelectorAll('div'));
 var picked=[], seen={};
 all.forEach(function(el){if(!isTile(el,keep))return;if(picked.some(function(p){return p.contains(el);}))return;picked=picked.filter(function(p){return !el.contains(p);});var s=txt(el);if(!seen[s]){seen[s]=1;picked.push(el);}});
 var buckets={year:null,runtime:null,age:null,source:null,rating:null};
 picked.forEach(function(el){var k=kind(txt(el));if(k&&!buckets[k])buckets[k]=el;});
 if(buckets.rating)simplifyRating(buckets.rating);
 return ['year','runtime','age','source','rating'].map(function(k){var el=buckets[k];if(el)el.classList.add('sb5228Tile');return el;}).filter(Boolean);
}
function apply(){
 if(!isDetails()||!isOverview()){document.body.classList.remove('sb5228RowPolish');return;}
 addStyle();document.body.classList.add('sb5228RowPolish');
 var play=button(/play\s*\/\s*resume/i), back=button(/back\s+to\s+library/i);
 var c=card(play,back); if(!c||c.dataset.sb5228Done==='1')return;
 c.dataset.sb5228Done='1'; c.classList.add('sb5228Card');
 var po=poster(c), ti=title(c), de=desc(c), tg=tags(c), keep=[po,ti,de,play,back].filter(Boolean).concat(tg);
 var tiles=collect(c,keep);
 var top=document.createElement('div');top.className='sb5228Top';
 var left=document.createElement('div');left.className='sb5228Poster';
 var right=document.createElement('div');right.className='sb5228Text';
 var tagRow=document.createElement('div');tagRow.className='sb5228Tags';
 var row=document.createElement('div');row.className='sb5228InfoRow';
 var bar=document.createElement('div');bar.className='sb5228ActionBar';
 if(po)left.appendChild(po); if(ti)right.appendChild(ti); if(de)right.appendChild(de); tg.forEach(function(x){tagRow.appendChild(x);}); if(tagRow.children.length)right.appendChild(tagRow);
 tiles.forEach(function(x){row.appendChild(x);});
 if(play){play.classList.add('sb5228Play');bar.appendChild(play);} if(back){back.classList.add('sb5228Back');bar.appendChild(back);}
 top.appendChild(left);top.appendChild(right);
 c.innerHTML='';c.appendChild(top);if(row.children.length)c.appendChild(row);c.appendChild(bar);
 var lab=document.createElement('div');lab.className='sb5228Tag';lab.textContent='V5.22.8 polish test';c.appendChild(lab);
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
