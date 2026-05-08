/* Stream Bandit V5.22.10 — Clean Generated Details Info Cards TEST
   Fixes V5.22.9 still stacking old info cards down the left.
   This version reads the existing values, then creates fresh clean display cards:
   Year | Runtime | Age rating | Source | Rating
   Because these are new clean cards, old app CSS should not force them into a vertical stack.
   Big Play / Resume and Back to Library buttons remain the real existing buttons.
   Visual-only overlay. No Supabase writes, no movie saves, no Mux/player source changes. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetails(){var t=txt(main()).toLowerCase();return t.indexOf('supabase details')>-1&&t.indexOf('overview')>-1&&t.indexOf('cast & crew')>-1&&t.indexOf('trailer')>-1;}
function isOverview(){var m=main();var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(txt(b))&&/active/i.test(String(b.className||''));});return !!active||txt(m).toLowerCase().indexOf('play / resume')>-1;}
function addStyle(){
 if(document.getElementById('sb52210Style'))return;
 var st=document.createElement('style');st.id='sb52210Style';
 st.textContent='\n.sb52210Card{position:relative!important;overflow:hidden!important;padding:18px 18px 104px!important;border-radius:26px!important;min-height:auto!important;width:100%!important;box-sizing:border-box!important}.sb52210Top{display:grid!important;grid-template-columns:minmax(260px,390px) minmax(320px,1fr)!important;gap:20px!important;align-items:center!important;width:100%!important}.sb52210Poster img{width:100%!important;max-height:300px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important;box-shadow:0 14px 34px rgba(0,0,0,.28)!important}.sb52210Text h2,.sb52210Text h3,.sb52210Text h4{margin:4px 0 12px!important}.sb52210Text p{line-height:1.45!important;margin:0 0 14px!important}.sb52210Tags{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important}.sb52210InfoRow{display:grid!important;grid-template-columns:minmax(115px,.75fr) minmax(140px,.85fr) minmax(130px,.8fr) minmax(140px,.85fr) minmax(270px,1.75fr)!important;gap:12px!important;width:100%!important;margin:16px 0 0!important;padding:16px 0 0!important;border-top:1px solid rgba(255,255,255,.08)!important;align-items:stretch!important}.sb52210InfoCard{display:block!important;margin:0!important;min-width:0!important;width:auto!important;min-height:76px!important;height:auto!important;border-radius:18px!important;padding:13px 14px!important;box-sizing:border-box!important;background:linear-gradient(180deg,rgba(24,28,43,.96),rgba(12,15,26,.96))!important;border:1px solid rgba(255,255,255,.08)!important;box-shadow:0 10px 24px rgba(0,0,0,.22)!important}.sb52210InfoCard b{display:block!important;margin-bottom:7px!important;font-size:13px!important;color:var(--muted,#a9afc3)!important}.sb52210InfoCard span{display:block!important;line-height:1.28!important;font-weight:1000!important;color:#f6f7ff!important}.sb52210Rating span{font-size:15px!important}.sb52210ActionBar{position:absolute!important;left:18px!important;right:18px!important;bottom:18px!important;display:grid!important;grid-template-columns:minmax(220px,1.35fr) minmax(160px,.75fr)!important;gap:12px!important;align-items:stretch!important;padding-top:12px!important;border-top:1px solid rgba(255,255,255,.08)!important;background:linear-gradient(180deg,rgba(10,12,21,0),rgba(10,12,21,.96) 32%,rgba(10,12,21,.98))!important}.sb52210ActionBar button,.sb52210ActionBar a{width:100%!important;min-height:58px!important;border-radius:18px!important;font-size:18px!important;font-weight:1000!important;margin:0!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;text-align:center!important;text-decoration:none!important}.sb52210Play{background:linear-gradient(135deg,#ff2d85,#7c3cff)!important;box-shadow:0 16px 34px rgba(124,60,255,.34)!important}.sb52210Back{background:rgba(53,57,86,.96)!important}.sb52210Tag{position:absolute;right:18px;bottom:88px;border-radius:999px;padding:7px 10px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-size:12px;font-weight:900;pointer-events:none}@media(max-width:980px){.sb52210InfoRow{grid-template-columns:repeat(2,minmax(150px,1fr))!important}.sb52210Rating{grid-column:1/-1!important}}@media(max-width:760px){.sb52210Card{padding-bottom:150px!important}.sb52210Top{grid-template-columns:1fr!important}.sb52210InfoRow{grid-template-columns:1fr!important}.sb52210ActionBar{grid-template-columns:1fr!important}.sb52210Tag{display:none}}\n';
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
function sectionValue(body,label){
 var re=new RegExp(label+'\\s+([^\\n]+?)(?=\\s+(Year|Rating|Runtime|Age rating|Source|Play / Resume|Back to Library)\\b|$)','i');
 var m=body.match(re);return m?m[1].trim():'';
}
function values(c){
 var body=txt(c);
 var year=(body.match(/\b(19|20)\d{2}\b/)||[])[0]||sectionValue(body,'Year')||'';
 var runtime=sectionValue(body,'Runtime')||(body.match(/\b\d+h[- ]?\d{1,2}m\b/i)||body.match(/\b\d+\s*min\b/i)||[])[0]||'';
 var age=sectionValue(body,'Age rating')||(body.match(/Age rating\s+([A-Za-z0-9+]+)/i)||[])[1]||'';
 var source=sectionValue(body,'Source')||(/playable/i.test(body)?'Playable':'');
 var rating='';
 var sb=body.match(/Stream Bandit Score:\s*([0-9]+\s*\/\s*100)/i);
 var good=body.match(/\((Good|Great|Excellent|Poor|Average|Okay)\)/i);
 if(sb)rating='Stream Bandit Score: '+sb[1]+(good?' ('+good[1]+')':'');
 else rating=sectionValue(body,'Rating');
 return {year:year||'—',runtime:runtime||'—',age:age||'—',source:source||'—',rating:rating||'—'};
}
function info(label,val,extra){var d=document.createElement('div');d.className='sb52210InfoCard '+(extra||'');d.innerHTML='<b>'+label+'</b><span>'+String(val||'—')+'</span>';return d;}
function apply(){
 if(!isDetails()||!isOverview())return;
 addStyle();
 var play=button(/play\s*\/\s*resume/i),back=button(/back\s+to\s+library/i),c=fullCard(play,back);
 if(!c||c.dataset.sb52210Done==='1')return;
 c.dataset.sb52210Done='1';c.classList.add('sb52210Card');
 var po=poster(c),ti=title(c),de=desc(c),tg=tags(c),v=values(c);
 var top=document.createElement('div');top.className='sb52210Top';
 var left=document.createElement('div');left.className='sb52210Poster';
 var right=document.createElement('div');right.className='sb52210Text';
 var tagRow=document.createElement('div');tagRow.className='sb52210Tags';
 var row=document.createElement('div');row.className='sb52210InfoRow';
 var bar=document.createElement('div');bar.className='sb52210ActionBar';
 if(po)left.appendChild(po); if(ti)right.appendChild(ti); if(de)right.appendChild(de); tg.forEach(function(x){tagRow.appendChild(x);}); if(tagRow.children.length)right.appendChild(tagRow);
 row.appendChild(info('Year',v.year)); row.appendChild(info('Runtime',v.runtime)); row.appendChild(info('Age rating',v.age)); row.appendChild(info('Source',v.source)); row.appendChild(info('Rating',v.rating,'sb52210Rating'));
 if(play){play.classList.add('sb52210Play');bar.appendChild(play);} if(back){back.classList.add('sb52210Back');bar.appendChild(back);}
 top.appendChild(left);top.appendChild(right);
 c.innerHTML='';c.appendChild(top);c.appendChild(row);c.appendChild(bar);
 var lab=document.createElement('div');lab.className='sb52210Tag';lab.textContent='V5.22.10 tidy test';c.appendChild(lab);
}
var mo=new MutationObserver(function(){setTimeout(apply,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,800);});
setInterval(apply,1200);
})();
