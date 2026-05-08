/* Stream Bandit V5.26.1 — Watch Page Tidy TEST
   Test route only. Live is untouched.
   Keeps the real player and working Sound Booster. Hides the older duplicate audio card.
   Places queue controls beside the Sound Booster where possible. */
(function(){
'use strict';
function t(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function root(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isWatch(){var s=t(root()).toLowerCase();return (s.indexOf('supabase watch')>-1||s.indexOf('watching')>-1)&&(s.indexOf('player sound booster')>-1||s.indexOf('supabase queue')>-1);}
function css(){
 if(document.getElementById('sb526Css'))return;
 var st=document.createElement('style');st.id='sb526Css';
 st.textContent='body.sb526Watch .sb526Hide{display:none!important}.sb526Row{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,.7fr);gap:14px;margin:14px 0;align-items:stretch}.sb526Row>*{margin:0!important;height:100%}.sb526Queue{border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:24px;padding:16px;box-shadow:0 22px 55px rgba(0,0,0,.26)}.sb526Queue h3{margin:0 0 8px;font-size:21px}.sb526Queue p{margin:0 0 12px;color:var(--muted,#a9afc3);line-height:1.45}.sb526Btns{display:flex;gap:10px;flex-wrap:wrap}.sb526Btns button{border-radius:16px!important;padding:13px 16px!important;font-weight:1000!important}.sb526Main{background:linear-gradient(135deg,var(--sb-brand-accent-1,#ff2d55),var(--sb-brand-accent-2,#7c3cff))!important;color:#fff!important}.sb526Note{margin-top:12px;border-radius:16px;padding:11px 13px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb526Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 12px;padding:10px;border-radius:22px;background:rgba(4,7,14,.76);border:1px solid rgba(255,255,255,.08)}.sb526Tab{border:0;border-radius:999px;padding:12px 17px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer}.sb526Tab.active{background:linear-gradient(135deg,var(--sb-brand-accent-1,#ff2d55),var(--sb-brand-accent-2,#7c3cff))!important}.sb526Panel{display:none;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:24px;padding:16px;margin:0 0 14px}.sb526Panel.active{display:block}@media(max-width:900px){.sb526Row{grid-template-columns:1fr}.sb526Btns button{width:100%}}';
 document.head.appendChild(st);
}
function card(re){return Array.from(root().querySelectorAll('.card,.panel,section,div')).filter(function(x){return !x.closest('#sb526Row')&&!x.closest('#sb526Tabs')&&re.test(t(x));}).sort(function(a,b){return a.getBoundingClientRect().height-b.getBoundingClientRect().height;})[0]||null;}
function btn(re,scope){return Array.from((scope||root()).querySelectorAll('button,a')).find(function(b){return re.test(t(b));});}
function proxy(old,label,main){var b=document.createElement('button');b.type='button';b.textContent=label;if(main)b.className='sb526Main';b.onclick=function(){if(old)old.click();};return b;}
function hideOldAudio(){Array.from(root().querySelectorAll('.card,.panel,section,div')).forEach(function(x){var s=t(x).toLowerCase();if(s.indexOf('player audio boost')>-1&&s.indexOf('boost 150%')>-1)x.classList.add('sb526Hide');});}
function makeRow(){
 if(document.getElementById('sb526Row'))return;
 var booster=card(/Player Sound Booster/i);var queue=card(/Supabase queue/i);if(!booster&&!queue)return;
 var anchor=booster||queue;var row=document.createElement('div');row.id='sb526Row';row.className='sb526Row';
 if(booster)row.appendChild(booster);
 var q=document.createElement('div');q.className='sb526Queue';q.innerHTML='<h3>Supabase queue</h3><p>Previous and Next sit beside Sound Booster under the player.</p><div class="sb526Btns"></div><div class="sb526Note">Old duplicate audio boost is hidden. The working Sound Booster stays.</div>';
 var holder=q.querySelector('.sb526Btns');var prev=btn(/^Previous$/i,queue)||btn(/^Previous$/i);var next=btn(/^Next$/i,queue)||btn(/^Next$/i);
 if(prev)holder.appendChild(proxy(prev,'Previous',false));if(next)holder.appendChild(proxy(next,'Next',true));if(!prev&&!next)holder.textContent='No queue controls visible for this title.';
 row.appendChild(q);anchor.parentElement.insertBefore(row,anchor);if(queue)queue.classList.add('sb526Hide');
}
function makeTabs(){
 if(document.getElementById('sb526Tabs'))return;
 var info=card(/HLS\/Mux stream loaded|Back to Supabase Library|resume loaded/i);if(!info)return;
 var details=btn(/^Details$/i,info)||btn(/^Details$/i);var back=btn(/Back to Supabase Library|Back to Library/i,info)||btn(/Back to Supabase Library|Back to Library/i);
 var wrap=document.createElement('div');wrap.id='sb526Tabs';wrap.innerHTML='<div class="sb526Tabs"><button class="sb526Tab active" data-p="info">Info</button><button class="sb526Tab" data-p="actions">Actions</button><button class="sb526Tab" data-p="safe">Safety</button></div><div class="sb526Panel active" data-panel="info"><b>Now watching</b><p>Player is protected. Sound Booster and queue controls are tidied below the player.</p></div><div class="sb526Panel" data-panel="actions"><div class="sb526Btns"></div></div><div class="sb526Panel" data-panel="safe"><p>No player, Sound Booster logic, progress, Supabase save, movie row, Mux/HLS or database logic changes.</p></div>';
 var h=wrap.querySelector('.sb526Btns');if(back)h.appendChild(proxy(back,'Back to Supabase Library',false));if(details)h.appendChild(proxy(details,'Details',true));
 info.parentElement.insertBefore(wrap,info.nextSibling);
 wrap.onclick=function(e){var b=e.target.closest('.sb526Tab');if(!b)return;Array.from(wrap.querySelectorAll('.sb526Tab')).forEach(function(x){x.classList.remove('active')});b.classList.add('active');Array.from(wrap.querySelectorAll('.sb526Panel')).forEach(function(p){p.classList.toggle('active',p.dataset.panel===b.dataset.p)});};
}
function run(){if(!isWatch()){document.body.classList.remove('sb526Watch');return;}document.body.classList.add('sb526Watch');css();hideOldAudio();makeRow();makeTabs();}
new MutationObserver(function(){setTimeout(run,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,900);});setInterval(run,1500);
})();
