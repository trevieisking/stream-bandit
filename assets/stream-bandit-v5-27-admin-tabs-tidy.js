/* Stream Bandit V5.27 — Admin Tabs Tidy TEST
   Test route only. Live is untouched.
   Goal: keep Admin working but stop every section stacking down the page.
   Existing Admin tab buttons stay visible; matching sections are moved/hidden by tab.
   No Supabase writes, no movie row changes, no manager save changes, no player changes. */
(function(){
'use strict';
function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function root(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isAdmin(){var s=txt(root()).toLowerCase();return /^admin$/i.test(txt(root().querySelector('h1,h2')||''))||s.indexOf('quick supabase movie add')>-1&&s.indexOf('admin upload centre')>-1;}
function addCss(){
 if(document.getElementById('sb527Css'))return;
 var st=document.createElement('style');st.id='sb527Css';
 st.textContent='body.sb527Admin .sb527Hidden{display:none!important}.sb527PanelNote{margin:10px 0 14px;padding:12px 14px;border-radius:16px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.22);color:#baf7df;line-height:1.45}.sb527Empty{border:1px dashed rgba(255,255,255,.15);border-radius:22px;padding:24px;color:var(--muted,#a9afc3);text-align:center}.sb527Safety{margin:12px 0;padding:12px 14px;border-radius:16px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}body.sb527Admin .tabs{position:sticky;top:0;z-index:20;backdrop-filter:blur(10px)}';
 document.head.appendChild(st);
}
function tabButtons(){return Array.from(root().querySelectorAll('.tabs button,.tab')).filter(function(b){return /overview|rows|edit movie|media|mux|genres|tags|cast|crew|safety/i.test(txt(b));});}
function normalKey(s){s=s.toLowerCase();if(s.indexOf('overview')>-1)return'overview';if(s.indexOf('rows')>-1)return'rows';if(s.indexOf('edit')>-1)return'edit';if(s.indexOf('media')>-1||s.indexOf('mux')>-1)return'media';if(s.indexOf('genre')>-1||s.indexOf('tag')>-1)return'genres';if(s.indexOf('cast')>-1||s.indexOf('crew')>-1)return'cast';if(s.indexOf('safety')>-1)return'safety';return'overview';}
function sectionCards(){
 var tabs=tabButtons()[0]&&tabButtons()[0].closest('.tabs');
 return Array.from(root().querySelectorAll('.card,.panel,section')).filter(function(c){
   if(c.closest('#sb527Helper'))return false;
   if(tabs&&c===tabs)return false;
   var s=txt(c).toLowerCase();
   if(s.length<20)return false;
   if(s.indexOf('admin')>-1||s.indexOf('supabase')>-1||s.indexOf('upload')>-1||s.indexOf('movie')>-1||s.indexOf('genre')>-1||s.indexOf('cast')>-1||s.indexOf('safety')>-1||s.indexOf('mux')>-1||s.indexOf('row')>-1)return true;
   return false;
 });
}
function classify(card){
 var s=txt(card).toLowerCase();
 if(s.indexOf('v5.11.8 stable checkpoint')>-1||s.indexOf('admin video route')>-1||s.indexOf('admin upload route')>-1||s.indexOf('genre picker everywhere')>-1||s.indexOf('settings tabs')>-1||s.indexOf('manager layout hotfix')>-1)return'overview';
 if(s.indexOf('supabase rows')>-1||s.indexOf('movie rows')>-1||s.indexOf('rows loaded')>-1)return'rows';
 if(s.indexOf('quick supabase movie add')>-1||s.indexOf('edit supabase movie')>-1||s.indexOf('save movie to supabase')>-1||s.indexOf('title')>-1&&s.indexOf('description')>-1&&s.indexOf('video url')>-1)return'edit';
 if(s.indexOf('admin upload centre')>-1||s.indexOf('image uploads polished')>-1||s.indexOf('upload image')>-1||s.indexOf('poster image')>-1||s.indexOf('mux video route')>-1||s.indexOf('mux playback')>-1)return'media';
 if(s.indexOf('choose genres')>-1||s.indexOf('genres comma')>-1||s.indexOf('tags comma')>-1||s.indexOf('genre')>-1&&s.indexOf('selected')>-1)return'genres';
 if(s.indexOf('cast')>-1||s.indexOf('crew')>-1||s.indexOf('director')>-1)return'cast';
 if(s.indexOf('safety')>-1||s.indexOf('safe rule')>-1||s.indexOf('no database')>-1||s.indexOf('not touched')>-1)return'safety';
 return'overview';
}
function ensureHelper(){
 if(document.getElementById('sb527Helper'))return;
 var tabs=tabButtons()[0]&&tabButtons()[0].closest('.tabs');
 if(!tabs)return;
 var helper=document.createElement('div');helper.id='sb527Helper';helper.innerHTML='<div class="sb527PanelNote"><b>V5.27 Admin tidy test:</b> sections now show inside the selected Admin tab instead of stacking all the way down the page.</div>';
 tabs.parentElement.insertBefore(helper,tabs.nextSibling);
}
function organise(active){
 ensureHelper();
 var cards=sectionCards();
 var count=0;
 cards.forEach(function(c){var key=classify(c);var show=key===active||(active==='overview'&&key==='overview');c.classList.toggle('sb527Hidden',!show);if(show)count++;});
 var helper=document.getElementById('sb527Helper');
 if(helper){
   var note=helper.querySelector('.sb527PanelNote');
   if(note)note.innerHTML='<b>V5.27 Admin tidy test:</b> showing <b>'+active.replace(/^./,function(m){return m.toUpperCase();})+'</b> sections only. Other Admin sections are kept safe and hidden until their tab is opened.';
   if(!count&&!helper.querySelector('.sb527Empty')){var e=document.createElement('div');e.className='sb527Empty';e.textContent='No sections found for this tab yet.';helper.appendChild(e);}else{var old=helper.querySelector('.sb527Empty');if(old)old.remove();}
 }
}
function bind(){
 var buttons=tabButtons();if(!buttons.length)return;
 buttons.forEach(function(b){
   if(b.dataset.sb527Bound)return;b.dataset.sb527Bound='1';
   b.addEventListener('click',function(){setTimeout(function(){organise(normalKey(txt(b)));},80);});
 });
 var active=buttons.find(function(b){return b.classList.contains('active')||/overview/i.test(txt(b));});
 organise(normalKey(txt(active||buttons[0])));
}
function run(){if(!isAdmin()){document.body.classList.remove('sb527Admin');return;}document.body.classList.add('sb527Admin');addCss();bind();}
new MutationObserver(function(){setTimeout(run,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,900);});setInterval(run,1500);
})();
