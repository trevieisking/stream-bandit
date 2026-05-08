/* Stream Bandit V5.22.9 — Forced Supabase Details Info Row TEST
   Fixes V5.22.8 still stacking info cards down the left.
   This version uses direct inline layout styles on the rebuilt containers/cards so old app CSS cannot force the info boxes into a vertical stack.
   Desired layout:
   - Top: poster left, title/description/tags right
   - Middle: Year | Runtime | Age rating | Source | Rating in one row where screen width allows
   - Bottom: large Play / Resume + Back to Library buttons
   Visual-only overlay. No Supabase writes, no movie saves, no Mux/player source changes. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetails(){var t=txt(main()).toLowerCase();return t.indexOf('supabase details')>-1&&t.indexOf('overview')>-1&&t.indexOf('cast & crew')>-1&&t.indexOf('trailer')>-1;}
function isOverview(){var m=main();var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(txt(b))&&/active/i.test(String(b.className||''));});return !!active||txt(m).toLowerCase().indexOf('play / resume')>-1;}
function addStyle(){
 if(document.getElementById('sb5229Style'))return;
 var st=document.createElement('style');st.id='sb5229Style';
 st.textContent='\n.sb5229ActionBar button,.sb5229ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}.sb5229Play{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}.sb5229Back{background:rgba(53,57,86,.96)!important}.sb5229InfoRow > * b{display:block!important;margin-bottom:6px!important;font-size:13px!important;color:var(--muted,#a9afc3)!important}.sb5229InfoRow > *{box-sizing:border-box!important}.sb5229InfoRow > * span,.sb5229InfoRow > * strong{display:block!important;line-height:1.28!important}@media(max-width:950px){.sb5229InfoRow{grid-template-columns:repeat(2,minmax(150px,1fr))!important}.sb5229Rating{grid-column:1/-1!important}}@media(max-width:760px){.sb5229Top{grid-template-columns:1fr!important}.sb5229InfoRow{grid-template-columns:1fr!important}.sb5229ActionBar{grid-template-columns:1fr!important}}\n';
 document.head.appendChild(st);
}
function button(re){return Array.prototype.slice.call(main().querySelectorAll('button,a')).find(function(b){return re.test(txt(b));})||null;}
function poster(root){var imgs=Array.prototype.slice.call(root.querySelectorAll('img'));return imgs.find(function(i){var r=i.getBoundingClientRect();return r.width>100&&r.height>70;})||imgs[0]||null;}
function fullCard(play,back){
 var m=main();
 var cs=Array.prototype.slice.call(m.querySelectorAll('.card,.panel,section,div')).filter(function(c){
   var s=txt(c).toLowerCase();
   return s.indexOf('play / resume')>-1&&s.indexOf('back to library')>-1&&s.indexOf('year')>-1&&poster(c);
 });
 cs.sort(function(a,b){var ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();return (br.width*br.height)-(ar.width*ar.height);});
 return cs[0]||(play||back||{}).closest&&((play||back).closest('.card,.panel,section,div'));
}
function title(c){return Array.prototype.slice.call(c.querySelectorAll('h2,h3,h4')).find(function(h){return !/overview|cast|crew|trailer|supabase|stable|checkpoint/i.test(txt(h));})||null;}
function desc(c){return Array.prototype.slice.call(c.querySelectorAll('p')).find(function(p){var s=txt(p);return s.length>35&&!/supabase movie details|older browser|emergency fallback/i.test(s);})||null;}
function tags(c){return Array.prototype.slice.call(c.querySelectorAll('.pill')).filter(function(p){var s=txt(p);return s&&s.length<48&&!/stable|checkpoint|supabase-first/i.test(s);});}
function kind(s){s=s.toLowerCase();if(/\byear\b|^202\d$/.test(s))return 'year';if(/runtime|\d+h|\d+\s*min/.test(s))return 'runtime';if(/age rating|\bage\b/.test(s))return 'age';if(/source|playable/.test(s))return 'source';if(/rating|imdb|rotten|metacritic|letterboxd|stream bandit score/.test(s))return 'rating';return '';}
function isTile(el, keep){
 if(!el||el.id||String(el.className||'').indexOf('sb5229')>-1)return false;
 if(keep.some(function(k){return k&&(el===k||el.contains(k)||k.contains(el));}))return false;
 var s=txt(el);if(!s||s.length>360)return false;
 if(/crime 101|an elusive thief|play\s*\/\s*resume|back to library/i.test(s))return false;
 return !!kind(s);
}
function normaliseTile(el,k){
 el.classList.add('sb5229Tile');
 el.style.cssText+=';display:block!important;width:auto!important;max-width:none!important;min-width:0!important;margin:0!important;min-height:76px!important;height:auto!important;border-radius:18px!important;padding:13px 14px!important;box-sizing:border-box!important;align-self:stretch!important;';
 if(k==='rating'){
   el.classList.add('sb5229Rating');
   var s=txt(el);var sb=s.match(/Stream Bandit Score:\s*([0-9]+\s*\/\s*100)/i);var good=s.match(/\((Good|Great|Excellent|Poor|Average|Okay)\)/i);
   if(sb)el.innerHTML='<b>Rating</b><span>Stream Bandit Score:<br><strong>'+sb[1]+(good?' ('+good[1]+')':'')+'</strong></span>';
 }
 return el;
}
function collect(c,keep){
 var picked=[],seen={};
 Array.prototype.slice.call(c.querySelectorAll('div')).forEach(function(el){
   if(!isTile(el,keep))return;
   if(picked.some(function(p){return p.contains(el);}))return;
   picked=picked.filter(function(p){return !el.contains(p);});
   var s=txt(el);if(!seen[s]){seen[s]=1;picked.push(el);}
 });
 var b={year:null,runtime:null,age:null,source:null,rating:null};
 picked.forEach(function(el){var k=kind(txt(el));if(k&&!b[k])b[k]=el;});
 return ['year','runtime','age','source','rating'].map(function(k){return b[k]?normaliseTile(b[k],k):null;}).filter(Boolean);
}
function apply(){
 if(!isDetails()||!isOverview())return;
 addStyle();
 var play=button(/play\s*\/\s*resume/i),back=button(/back\s+to\s+library/i),c=fullCard(play,back);
 if(!c||c.dataset.sb5229Done==='1')return;
 c.dataset.sb5229Done='1';
 c.style.cssText+=';position:relative!important;overflow:hidden!important;padding:18px 18px 104px!important;border-radius:26px!important;min-height:auto!important;width:100%!important;max-width:none!important;box-sizing:border-box!important;';
 var po=poster(c),ti=title(c),de=desc(c),tg=tags(c),keep=[po,ti,de,play,back].filter(Boolean).concat(tg);
 var tiles=collect(c,keep);
 var top=document.createElement('div');top.className='sb5229Top';top.style.cssText='display:grid!important;grid-template-columns:minmax(260px,390px) minmax(320px,1fr)!important;gap:20px!important;align-items:center!important;width:100%!important;box-sizing:border-box!important;';
 var left=document.createElement('div');left.className='sb5229Poster';left.style.cssText='min-width:0!important;width:100%!important;';
 var right=document.createElement('div');right.className='sb5229Text';right.style.cssText='min-width:0!important;width:100%!important;';
 var tagRow=document.createElement('div');tagRow.className='sb5229Tags';tagRow.style.cssText='display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important;';
 var row=document.createElement('div');row.className='sb5229InfoRow';row.style.cssText='display:grid!important;grid-template-columns:minmax(110px,.75fr) minmax(130px,.85fr) minmax(120px,.8fr) minmax(130px,.85fr) minmax(260px,1.75fr)!important;gap:12px!important;width:100%!important;max-width:none!important;margin:16px 0 0!important;padding:16px 0 0!important;border-top:1px solid rgba(255,255,255,.08)!important;align-items:stretch!important;box-sizing:border-box!important;';
 var bar=document.createElement('div');bar.className='sb5229ActionBar';bar.style.cssText='position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important;';
 if(po){po.style.cssText+=';width:100%!important;max-height:300px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important;box-shadow:0 14px 34px rgba(0,0,0,.28)!important;';left.appendChild(po);}
 if(ti){ti.style.cssText+=';margin:4px 0 12px!important;';right.appendChild(ti);} if(de){de.style.cssText+=';line-height:1.45!important;margin:0 0 14px!important;';right.appendChild(de);} tg.forEach(function(x){tagRow.appendChild(x);});if(tagRow.children.length)right.appendChild(tagRow);
 tiles.forEach(function(x){row.appendChild(x);});
 if(play){play.classList.add('sb5229Play');bar.appendChild(play);} if(back){back.classList.add('sb5229Back');bar.appendChild(back);}
 top.appendChild(left);top.appendChild(right);
 c.innerHTML='';c.appendChild(top);if(row.children.length)c.appendChild(row);c.appendChild(bar);
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
