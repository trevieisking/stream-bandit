/* Stream Bandit V5.27.1 — Admin Tabs Tidy TEST
   Test route only. Live is untouched.
   Stronger version: catches the real Admin cards/divs after the Admin tab bar.
   Shows only the selected tab section instead of stacking the whole Admin page.
   No Supabase writes, no movie row changes, no manager save changes, no player changes. */
(function(){
'use strict';
function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isAdmin(){var r=main(),s=txt(r).toLowerCase(),h=txt(r.querySelector('h1,h2')||'').toLowerCase();return h==='admin'||(s.indexOf('quick supabase movie add')>-1&&s.indexOf('admin upload centre')>-1);}
function addCss(){
 if(document.getElementById('sb527Css'))return;
 var st=document.createElement('style');st.id='sb527Css';
 st.textContent='body.sb527Admin .sb527Hidden{display:none!important}.sb527Note{margin:10px 0 14px;padding:12px 14px;border-radius:16px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.22);color:#baf7df;line-height:1.45}body.sb527Admin .tabs{position:sticky;top:0;z-index:20;backdrop-filter:blur(10px)}.sb527Count{display:inline-flex;margin-left:8px;padding:4px 8px;border-radius:999px;background:rgba(34,211,166,.13);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-weight:950;font-size:12px}.sb527Empty{border:1px dashed rgba(255,255,255,.15);border-radius:22px;padding:24px;color:var(--muted,#a9afc3);text-align:center;margin:12px 0}';
 document.head.appendChild(st);
}
function tabsEl(){return Array.from(main().querySelectorAll('.tabs')).find(function(x){return /overview|rows|edit movie|media|mux|genres|tags|cast|crew|safety/i.test(txt(x));});}
function tabButtons(){var t=tabsEl();return t?Array.from(t.querySelectorAll('button,.tab')):[];}
function keyFrom(s){s=s.toLowerCase();if(s.indexOf('overview')>-1)return'overview';if(s.indexOf('rows')>-1)return'rows';if(s.indexOf('edit')>-1)return'edit';if(s.indexOf('media')>-1||s.indexOf('mux')>-1)return'media';if(s.indexOf('genre')>-1||s.indexOf('tag')>-1)return'genres';if(s.indexOf('cast')>-1||s.indexOf('crew')>-1)return'cast';if(s.indexOf('safety')>-1)return'safety';return'overview';}
function adminCards(){
 var r=main(), tabs=tabsEl(); if(!tabs)return [];
 var all=Array.from(r.querySelectorAll('div,section,article'));
 return all.filter(function(el){
   if(el.id==='sb527Helper'||el.closest('#sb527Helper'))return false;
   if(el===tabs||el.closest('.tabs'))return false;
   var rect=el.getBoundingClientRect();
   var s=txt(el).toLowerCase();
   if(s.length<35)return false;
   if(rect.width<280||rect.height<55)return false;
   if(el.querySelector('div,section,article')&&rect.height>900)return false;
   if(s.indexOf('stream bandit')>-1&&s.indexOf('watch')>-1&&s.indexOf('admin')===-1)return false;
   var adminish=/(stable checkpoint|manager polish|manager layout|admin video route|admin upload route|genre picker|image uploads polished|quick supabase movie add|admin upload centre|supabase write|version badge|supabase rows|edit supabase movie|cast & crew|safety|safe rule|mux|poster image|save movie to supabase|accessibility \+ player comfort|sound booster)/i.test(s);
   if(!adminish)return false;
   var parent=el.parentElement;
   while(parent&&parent!==r&&parent!==document.body){
     var ps=txt(parent).toLowerCase(), pr=parent.getBoundingClientRect();
     if(pr.width>=rect.width&&pr.height<900&&/(stable checkpoint|admin video route|quick supabase movie add|admin upload centre|accessibility \+ player comfort|sound booster|image uploads polished|version badge)/i.test(ps)){
       if(ps!==s&&ps.indexOf(s)>-1)return false;
     }
     parent=parent.parentElement;
   }
   return true;
 });
}
function classify(el){
 var s=txt(el).toLowerCase();
 if(s.indexOf('supabase rows')>-1||s.indexOf('movie rows')>-1||s.indexOf('rows loaded')>-1)return'rows';
 if(s.indexOf('quick supabase movie add')>-1||s.indexOf('edit supabase movie')>-1||s.indexOf('save movie to supabase')>-1)return'edit';
 if(s.indexOf('admin upload centre')>-1||s.indexOf('image uploads polished')>-1||s.indexOf('poster image')>-1||s.indexOf('upload image')>-1||s.indexOf('mux video route')>-1||s.indexOf('mux playback')>-1||s.indexOf('admin video route')>-1||s.indexOf('admin upload route')>-1)return'media';
 if(s.indexOf('choose genres')>-1||s.indexOf('genres comma')>-1||s.indexOf('tags comma')>-1||s.indexOf('genre picker')>-1||s.indexOf('selected:')>-1)return'genres';
 if(s.indexOf('cast')>-1||s.indexOf('crew')>-1||s.indexOf('director')>-1)return'cast';
 if(s.indexOf('safety')>-1||s.indexOf('safe rule')>-1||s.indexOf('no database')>-1||s.indexOf('not touched')>-1||s.indexOf('accessibility + player comfort')>-1||s.indexOf('sound booster')>-1)return'safety';
 return'overview';
}
function helper(){
 var t=tabsEl(); if(!t)return null;
 var h=document.getElementById('sb527Helper');
 if(!h){h=document.createElement('div');h.id='sb527Helper';h.innerHTML='<div class="sb527Note">V5.27.1 Admin tidy test is active.</div>';t.parentElement.insertBefore(h,t.nextSibling);}
 return h;
}
function organise(active){
 addCss();
 var cards=adminCards(), shown=0;
 cards.forEach(function(c){var k=classify(c), show=k===active;c.classList.toggle('sb527Hidden',!show);if(show)shown++;});
 var h=helper();
 if(h){h.innerHTML='<div class="sb527Note"><b>V5.27.1 Admin tidy:</b> showing <b>'+active+'</b> only. Hidden sections are still present and return when their tab is opened. <span class="sb527Count">'+shown+' section(s)</span></div>'+(shown?'':'<div class="sb527Empty">No sections found for this tab yet.</div>');}
}
function bind(){
 var buttons=tabButtons(); if(!buttons.length)return;
 buttons.forEach(function(b){if(b.dataset.sb527Bound)return;b.dataset.sb527Bound='1';b.addEventListener('click',function(){var k=keyFrom(txt(b));setTimeout(function(){organise(k);},120);});});
 var active=buttons.find(function(b){return b.classList.contains('active');})||buttons[0];
 organise(keyFrom(txt(active)));
}
function run(){if(!isAdmin()){document.body.classList.remove('sb527Admin');return;}document.body.classList.add('sb527Admin');bind();}
new MutationObserver(function(){setTimeout(run,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,900);});setInterval(run,1400);
})();
