/* Stream Bandit V5.27.4 — Admin Real Tabs Tidy TEST
   Test route only. Live is untouched.
   Fix: Final Boss Admin tabs are .sb59Tabs/.sb59Tab, not normal .tabs.
   This hides the old scroll-jump tabs and creates true tab panels.
   No writes. No player/Sound Booster changes. */
(function(){
'use strict';
var current='overview';
function tx(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function app(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isAdmin(){var r=app(),h=tx(r.querySelector('h1,h2')||'').toLowerCase(),s=tx(r).toLowerCase();return h==='admin'||s.indexOf('quick supabase movie add')>-1||s.indexOf('admin upload centre')>-1;}
function style(){
 if(document.getElementById('sb527Style'))return;
 var st=document.createElement('style');st.id='sb527Style';
 st.textContent='body.sb527Admin .sb527Off{display:none!important}body.sb527Admin #sb59ManagerTabsWrap{display:none!important}body.sb527Admin .tabs{display:none!important}.sb527RealTabs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 14px;padding:10px;border-radius:22px;background:rgba(4,7,14,.76);border:1px solid rgba(255,255,255,.08);position:sticky;top:0;z-index:50;backdrop-filter:blur(10px)}.sb527RealTabs button{border:0;border-radius:999px;padding:12px 17px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer}.sb527RealTabs button.active{background:linear-gradient(135deg,var(--sb-brand-accent-1,#ff2d55),var(--sb-brand-accent-2,#7c3cff))!important;box-shadow:0 14px 34px rgba(255,45,133,.24)}#sb527Note{margin:10px 0 14px;padding:12px 14px;border-radius:16px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.25);color:#baf7df;font-weight:800}.sb527Pill{display:inline-block;margin-left:8px;padding:3px 8px;border-radius:999px;background:rgba(255,255,255,.08)}.sb527Empty{border:1px dashed rgba(255,255,255,.15);border-radius:22px;padding:24px;color:var(--muted,#a9afc3);text-align:center;margin:12px 0}';
 document.head.appendChild(st);
}
function oldTabsWrap(){return app().querySelector('#sb59ManagerTabsWrap')||Array.from(app().querySelectorAll('.sb59Tabs,.tabs')).find(function(x){return /overview|rows|edit movie|media|mux|genres|tags|cast|crew|safety/i.test(tx(x));});}
function anchor(){var w=oldTabsWrap();return w||app().querySelector('.top')||app().firstElementChild;}
function makeTabs(){
 var a=anchor(); if(!a)return null;
 var tabs=document.getElementById('sb527RealTabs');
 if(!tabs){
   tabs=document.createElement('div');tabs.id='sb527RealTabs';tabs.className='sb527RealTabs';
   [['overview','Overview'],['rows','Rows'],['edit','Edit Movie'],['media','Media / Mux'],['genres','Genres / Tags'],['cast','Cast & Crew'],['safety','Safety']].forEach(function(x){var b=document.createElement('button');b.type='button';b.dataset.k=x[0];b.textContent=x[1];b.onclick=function(e){e.preventDefault();e.stopPropagation();show(x[0]);};tabs.appendChild(b);});
   a.parentNode.insertBefore(tabs,a.nextSibling);
 }
 return tabs;
}
function note(){var tabs=makeTabs();if(!tabs)return null;var n=document.getElementById('sb527Note');if(!n){n=document.createElement('div');n.id='sb527Note';tabs.parentNode.insertBefore(n,tabs.nextSibling);}return n;}
function keyText(s){s=s.toLowerCase();if(s.indexOf('rows')>-1)return'rows';if(s.indexOf('quick supabase movie add')>-1||s.indexOf('edit supabase movie')>-1||s.indexOf('save movie to supabase')>-1)return'edit';if(s.indexOf('admin upload centre')>-1||s.indexOf('image uploads polished')>-1||s.indexOf('poster image')>-1||s.indexOf('mux')>-1||s.indexOf('admin video route')>-1||s.indexOf('admin upload route')>-1)return'media';if(s.indexOf('genre')>-1||s.indexOf('tags comma')>-1||s.indexOf('choose genres')>-1)return'genres';if(s.indexOf('cast')>-1||s.indexOf('crew')>-1||s.indexOf('director')>-1)return'cast';if(s.indexOf('safety')>-1||s.indexOf('safe')>-1||s.indexOf('accessibility + player comfort')>-1||s.indexOf('sound booster')>-1)return'safety';return'overview';}
function topCards(){
 var a=anchor(); if(!a||!a.parentNode)return [];
 var parent=a.parentNode;
 return Array.from(parent.children).filter(function(el){
   if(el===a||el.id==='sb527RealTabs'||el.id==='sb527Note'||el.id==='sb59ManagerTabsWrap'||el.classList.contains('sb527RealTabs'))return false;
   if(el.tagName==='SCRIPT'||el.tagName==='STYLE')return false;
   var s=tx(el).toLowerCase(), r=el.getBoundingClientRect();
   if(s.length<25||r.width<250||r.height<30)return false;
   return /(checkpoint|admin|supabase|upload|movie|genre|cast|crew|safety|sound booster|accessibility|mux|image|poster|version badge|quick|manager)/i.test(s);
 });
}
function show(k){
 current=k; style(); var tabs=makeTabs(); if(!tabs)return;
 Array.from(tabs.querySelectorAll('button')).forEach(function(b){b.classList.toggle('active',b.dataset.k===k);});
 var all=topCards(),shown=0;
 all.forEach(function(c){var on=keyText(tx(c))===k;c.classList.toggle('sb527Off',!on);if(on)shown++;});
 var n=note(); if(n)n.innerHTML='✅ V5.27.4 Admin real tabs: showing <b>'+k+'</b> only.<span class="sb527Pill">'+shown+' shown</span><span class="sb527Pill">No writes</span>'+(shown?'':'<div class="sb527Empty">No sections found for this tab yet.</div>');
}
function run(){if(!isAdmin()){document.body.classList.remove('sb527Admin');return;}document.body.classList.add('sb527Admin');style();makeTabs();show(current);}
new MutationObserver(function(){setTimeout(run,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,800)});setInterval(run,1200);
})();
