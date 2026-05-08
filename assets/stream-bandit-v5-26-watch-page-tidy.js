/* Stream Bandit V5.26.2 — Watch Page Tidy TEST
   Test route only. Live is untouched.
   Simple reliable tidy:
   - keep real player untouched,
   - keep the working Player Sound Booster card,
   - add Previous / Next queue buttons inside that Sound Booster card,
   - hide the old duplicate Player Audio Boost card,
   - hide the old separate Supabase queue box once controls are copied.
   No volume logic, player logic, progress, Supabase save, movie row or database changes. */
(function(){
'use strict';
function t(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function root(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isWatch(){var s=t(root()).toLowerCase();return (s.indexOf('supabase watch')>-1||s.indexOf('watching')>-1)&&(s.indexOf('player sound booster')>-1||s.indexOf('supabase queue')>-1);}
function css(){
 if(document.getElementById('sb526Css'))return;
 var st=document.createElement('style');st.id='sb526Css';
 st.textContent='body.sb526Watch .sb526Hide{display:none!important}.sb526QueueInline{margin-top:14px;padding-top:14px;border-top:1px solid rgba(255,255,255,.10);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.sb526QueueInline b{font-size:18px}.sb526QueueInline small{display:block;color:var(--muted,#a9afc3);margin-top:3px}.sb526Btns{display:flex;gap:10px;flex-wrap:wrap}.sb526Btns button{border-radius:16px!important;padding:12px 16px!important;font-weight:1000!important}.sb526Main{background:linear-gradient(135deg,var(--sb-brand-accent-1,#ff2d55),var(--sb-brand-accent-2,#7c3cff))!important;color:#fff!important}.sb526Note{margin-top:10px;border-radius:14px;padding:10px 12px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb526CleanInfo{margin-top:14px;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:20px;padding:13px 14px;color:var(--muted,#a9afc3)}@media(max-width:780px){.sb526QueueInline{align-items:flex-start}.sb526Btns button{width:100%}}';
 document.head.appendChild(st);
}
function bestCard(re){
 var found=Array.from(root().querySelectorAll('.card,.panel,section,div')).filter(function(x){return re.test(t(x));});
 if(!found.length)return null;
 found.sort(function(a,b){return b.getBoundingClientRect().width*b.getBoundingClientRect().height-a.getBoundingClientRect().width*a.getBoundingClientRect().height;});
 return found[0];
}
function btn(re,scope){return Array.from((scope||root()).querySelectorAll('button,a')).find(function(b){return re.test(t(b));});}
function proxy(old,label,main){var b=document.createElement('button');b.type='button';b.textContent=label;if(main)b.className='sb526Main';b.onclick=function(){if(old)old.click();};return b;}
function hideOldAudio(){
 Array.from(root().querySelectorAll('.card,.panel,section,div')).forEach(function(x){var s=t(x).toLowerCase();if(s.indexOf('player audio boost')>-1&&s.indexOf('boost 150%')>-1)x.classList.add('sb526Hide');});
}
function findQueueCard(){return bestCard(/Supabase queue/i);}
function findBooster(){return bestCard(/Player Sound Booster/i);}
function injectQueue(){
 if(document.getElementById('sb526QueueInline'))return;
 var booster=findBooster();var queue=findQueueCard();if(!booster||!queue)return;
 var prev=btn(/^Previous$/i,queue)||btn(/^Previous$/i);var next=btn(/^Next$/i,queue)||btn(/^Next$/i);
 var box=document.createElement('div');box.id='sb526QueueInline';box.className='sb526QueueInline';
 box.innerHTML='<div><b>Supabase queue</b><small>Previous / Next now live beside Sound Booster.</small></div><div class="sb526Btns"></div>';
 var holder=box.querySelector('.sb526Btns');
 if(prev)holder.appendChild(proxy(prev,'Previous',false));
 if(next)holder.appendChild(proxy(next,'Next',true));
 if(!prev&&!next)holder.innerHTML='<small>No queue buttons visible for this title.</small>';
 booster.appendChild(box);
 var note=document.createElement('div');note.className='sb526Note';note.textContent='One audio booster only: the older duplicate audio boost card and separate queue box are hidden on this test page.';
 booster.appendChild(note);
 queue.classList.add('sb526Hide');
}
function addInfo(){
 if(document.getElementById('sb526CleanInfo'))return;
 var info=bestCard(/HLS\/Mux stream loaded|Back to Supabase Library|resume loaded/i);
 if(!info)return;
 var box=document.createElement('div');box.id='sb526CleanInfo';box.className='sb526CleanInfo';
 box.innerHTML='<b>V5.26.2 tidy safety:</b> player, custom volume overlay, Sound Booster behaviour, saved progress, Supabase saves, movie rows, Mux/HLS and database logic are unchanged.';
 info.appendChild(box);
}
function run(){if(!isWatch()){document.body.classList.remove('sb526Watch');return;}document.body.classList.add('sb526Watch');css();hideOldAudio();injectQueue();addInfo();}
new MutationObserver(function(){setTimeout(run,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,900);});setInterval(run,1500);
})();
