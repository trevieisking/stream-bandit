/* Stream Bandit V5.26 — Watch Page Tidy TEST
   Test route only. Live is untouched.
   Goal: tidy the Watch page beneath the player.
   - Keep protected video/player logic intact.
   - Keep the working Player Sound Booster card.
   - Hide the older duplicate Player Audio Boost card.
   - Group resume/actions/details into neat tabs below the player.
   No Supabase writes, no movie saves, no player source changes, no volume logic changes. */
(function(){
'use strict';
function clean(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isWatch(){var s=clean(main()).toLowerCase();return (s.includes('watching')||s.includes('supabase watch'))&&s.includes('resume choice')&&s.includes('mark finished');}
function addCss(){
 if(document.getElementById('sb526Css'))return;
 var st=document.createElement('style');st.id='sb526Css';
 st.textContent='\nbody.sb526Watch .sb526Hide{display:none!important}.sb526Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 12px;padding:10px;border-radius:22px;background:rgba(4,7,14,.76);border:1px solid rgba(255,255,255,.08);box-shadow:0 16px 40px rgba(0,0,0,.24)}.sb526Tab{border:0;border-radius:999px;padding:12px 17px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer}.sb526Tab.active{background:linear-gradient(135deg,var(--sb-brand-accent-1,#ff2d55),var(--sb-brand-accent-2,#7c3cff))!important;box-shadow:0 14px 34px rgba(255,45,133,.22)}.sb526Panel{display:none;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:24px;padding:16px;margin:0 0 14px;box-shadow:0 22px 55px rgba(0,0,0,.26)}.sb526Panel.active{display:block}.sb526Panel h3{margin:0 0 10px;font-size:22px}.sb526Panel p{color:var(--muted,#a9afc3);line-height:1.45}.sb526ButtonRow{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-top:12px}.sb526ButtonRow button,.sb526ButtonRow a{border-radius:16px!important;padding:13px 16px!important;font-weight:1000!important}.sb526Primary{background:linear-gradient(135deg,var(--sb-brand-accent-1,#ff2d55),var(--sb-brand-accent-2,#7c3cff))!important;color:#fff!important}.sb526Note{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb526Warn{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}.sb526Meta{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.sb526Meta span{border-radius:999px;padding:8px 10px;background:rgba(68,72,107,.72);font-weight:900;color:#fff}@media(max-width:780px){.sb526ButtonRow button,.sb526ButtonRow a{width:100%}}\n';
 document.head.appendChild(st);
}
function cardContaining(re){
 return Array.from(main().querySelectorAll('.card,.panel,section,div')).filter(function(el){return !el.closest('#sb526Wrap')&&re.test(clean(el));}).sort(function(a,b){return a.getBoundingClientRect().height-b.getBoundingClientRect().height;})[0]||null;
}
function findButton(re,scope){return Array.from((scope||main()).querySelectorAll('button,a')).find(function(b){return re.test(clean(b));});}
function buttons(re,scope){return Array.from((scope||main()).querySelectorAll('button,a')).filter(function(b){return re.test(clean(b));});}
function hideDuplicateAudioBoost(){
 Array.from(main().querySelectorAll('.card,.panel,section,div')).forEach(function(el){
   var s=clean(el).toLowerCase();
   if(s.includes('player audio boost')&&s.includes('normal 100%')&&s.includes('boost 150%')) el.classList.add('sb526Hide');
 });
}
function build(){
 if(document.getElementById('sb526Wrap'))return;
 addCss();
 hideDuplicateAudioBoost();
 var resumeCard=cardContaining(/Resume choice/i);
 if(!resumeCard)return;
 var statusCard=resumeCard;
 var restart=findButton(/^restart$/i,statusCard)||findButton(/^restart$/i);
 var prev=findButton(/^previous$/i,statusCard)||findButton(/^previous$/i);
 var next=findButton(/^next$/i,statusCard)||findButton(/^next$/i);
 var full=findButton(/^fullscreen$/i,statusCard)||findButton(/^fullscreen$/i);
 var finished=findButton(/^mark finished$/i,statusCard)||findButton(/^mark finished$/i);
 var reset=findButton(/^reset progress$/i,statusCard)||findButton(/^reset progress$/i);
 var details=findButton(/^details$/i,statusCard)||findButton(/^details$/i);
 var resume=findButton(/resume saved time/i,statusCard)||findButton(/resume saved time/i);
 var start=findButton(/start from beginning/i,statusCard)||findButton(/start from beginning/i);
 var wrap=document.createElement('div');wrap.id='sb526Wrap';
 wrap.innerHTML='<div class="sb526Tabs"><button class="sb526Tab active" data-p="resume">⏯️ Resume</button><button class="sb526Tab" data-p="actions">🎮 Controls</button><button class="sb526Tab" data-p="info">ℹ️ Info</button><button class="sb526Tab" data-p="safety">✅ Safety</button></div>';
 function proxy(old,label,cls){var b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls||'';b.onclick=function(){if(old)old.click();};return b;}
 var pResume=document.createElement('div');pResume.className='sb526Panel active';pResume.dataset.panel='resume';pResume.innerHTML='<h3>Resume choice</h3><p>Choose how to start this title. These buttons reuse the existing working player actions.</p><div class="sb526ButtonRow"></div>';
 pResume.querySelector('.sb526ButtonRow').append(proxy(resume,'Resume saved time','sb526Primary'),proxy(start,'Start from beginning',''));
 var pActions=document.createElement('div');pActions.className='sb526Panel';pActions.dataset.panel='actions';pActions.innerHTML='<h3>Player controls</h3><p>Clean control area. The protected video player and fullscreen logic are not changed.</p><div class="sb526ButtonRow"></div>';
 var ar=pActions.querySelector('.sb526ButtonRow');
 [[restart,'Restart'],[prev,'Previous'],[next,'Next'],[full,'Fullscreen'],[finished,'Mark finished'],[reset,'Reset progress'],[details,'Details']].forEach(function(x){if(x[0])ar.append(proxy(x[0],x[1],x[1]==='Fullscreen'?'sb526Primary':''));});
 var pInfo=document.createElement('div');pInfo.className='sb526Panel';pInfo.dataset.panel='info';
 var title=clean(main().querySelector('h1,h2'))||'Watching';
 pInfo.innerHTML='<h3>Now watching</h3><div class="sb526Meta"><span>'+title+'</span><span>Player protected</span><span>Sound Booster kept</span></div><p>The duplicate older Player Audio Boost card is hidden. The working Sound Booster card stays as the active audio boost control.</p><div class="sb526Note">Use the custom volume overlay for normal volume and Sound Booster for accessibility gain.</div>';
 var pSafety=document.createElement('div');pSafety.className='sb526Panel';pSafety.dataset.panel='safety';pSafety.innerHTML='<h3>V5.26 tidy safety</h3><p>This is a layout tidy test only.</p><div class="sb526Warn">Protected: video player, volume overlay, Sound Booster behaviour, saved progress, Supabase saves, movie rows, Mux/HLS and database logic are not changed.</div>';
 wrap.append(pResume,pActions,pInfo,pSafety);
 resumeCard.parentElement.insertBefore(wrap,resumeCard);
 resumeCard.classList.add('sb526Hide');
 wrap.querySelector('.sb526Tabs').onclick=function(e){var b=e.target.closest('.sb526Tab');if(!b)return;Array.from(wrap.querySelectorAll('.sb526Tab')).forEach(function(x){x.classList.remove('active')});b.classList.add('active');Array.from(wrap.querySelectorAll('.sb526Panel')).forEach(function(p){p.classList.toggle('active',p.dataset.panel===b.dataset.p)});};
}
function apply(){if(!isWatch()){document.body.classList.remove('sb526Watch');return;}document.body.classList.add('sb526Watch');hideDuplicateAudioBoost();build();}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,900);});setInterval(apply,1500);
})();
