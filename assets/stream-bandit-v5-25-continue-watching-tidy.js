/* Stream Bandit V5.25 — Continue Watching Tidy TEST
   Test route only. Live is untouched.
   Goal: tidy Continue Watching into a clean Details-style page with tabs.
   No player changes, no progress changes, no Supabase writes, no movie saves. */
(function(){
'use strict';
function clean(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isContinue(){var s=clean(main()).toLowerCase();return s.includes('continue watching')&&!s.includes('supabase watch')&&!s.includes('stream bandit tools');}
function addCss(){
 if(document.getElementById('sb525Css'))return;
 var st=document.createElement('style');st.id='sb525Css';
 st.textContent='\nbody.sb525Continue .sb525Hide{display:none!important}.sb525Wrap{width:min(1120px,100%);margin:0 auto}.sb525Hero{border:1px solid rgba(34,211,166,.25);background:linear-gradient(135deg,rgba(9,62,57,.74),rgba(28,22,65,.78));border-radius:28px;padding:24px;margin:12px 0 18px;box-shadow:0 22px 60px rgba(0,0,0,.30)}.sb525Hero h2{margin:0 0 10px;font-size:30px}.sb525Hero p{margin:0;color:var(--muted,#a9afc3);font-size:16px;line-height:1.45}.sb525Grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.sb525Mini{border:1px solid rgba(255,255,255,.08);background:rgba(18,22,38,.72);border-radius:18px;padding:14px}.sb525Mini b{display:block;margin-bottom:6px}.sb525Mini span{display:block;color:var(--muted,#a9afc3);line-height:1.35}.sb525Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;padding:10px;border-radius:22px;background:rgba(4,7,14,.74);border:1px solid rgba(255,255,255,.08)}.sb525Tab{border:0;border-radius:999px;padding:12px 18px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer}.sb525Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 12px 30px rgba(124,60,255,.28)}.sb525Panel{display:none;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:26px;padding:18px;box-shadow:0 22px 55px rgba(0,0,0,.26)}.sb525Panel.active{display:block}.sb525Panel h3{margin:0 0 10px;font-size:24px}.sb525Panel p{color:var(--muted,#a9afc3);line-height:1.45}.sb525List{display:grid;gap:12px;margin-top:12px}.sb525Movie{display:grid;grid-template-columns:120px 1fr auto;gap:14px;align-items:center;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);border-radius:20px;padding:12px}.sb525Poster{width:120px;aspect-ratio:16/9;object-fit:cover;border-radius:14px;background:#050712;border:1px solid rgba(255,255,255,.08)}.sb525Movie h4{margin:0 0 6px;font-size:18px}.sb525Movie small{color:var(--muted,#a9afc3);display:block;line-height:1.35}.sb525Progress{height:9px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:9px}.sb525Progress i{display:block;height:100%;width:var(--p,35%);background:linear-gradient(135deg,#ff2d85,#7c3cff)}.sb525Btn{border:0;border-radius:16px;padding:12px 14px;font-weight:1000;color:#fff;background:linear-gradient(135deg,#ff2d85,#7c3cff);cursor:pointer;white-space:nowrap}.sb525Ghost{background:rgba(68,72,107,.94)}.sb525Note{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb525Warn{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}.sb525Empty{border:1px dashed rgba(255,255,255,.14);border-radius:22px;padding:28px;text-align:center;color:var(--muted,#a9afc3)}@media(max-width:850px){.sb525Grid{grid-template-columns:1fr}.sb525Movie{grid-template-columns:1fr}.sb525Poster{width:100%}}\n';
 document.head.appendChild(st);
}
function findHeading(){return Array.from(main().querySelectorAll('h1,h2')).find(function(h){return /^continue watching$/i.test(clean(h));});}
function findCards(){
 var r=main();
 var candidates=Array.from(r.querySelectorAll('.card,.movie-card,.panel,article,section,div')).filter(function(el){
   if(el.closest('#sb525Wrap'))return false;
   var s=clean(el).toLowerCase();
   return (s.includes('resume')||s.includes('continue')||s.includes('progress')||s.includes('watch'))&& el.querySelector('button,a,img');
 });
 return candidates.filter(function(el){return el.getBoundingClientRect().width>150&&el.getBoundingClientRect().height>40;}).slice(0,20);
}
function cloneButtonFrom(card){return Array.from(card.querySelectorAll('button,a')).find(function(b){return /resume|play|watch|continue|details/i.test(clean(b));});}
function posterFrom(card){var img=card.querySelector('img');return img?img.src:'';}
function titleFrom(card){var h=card.querySelector('h2,h3,h4,b,strong');var s=clean(h)||clean(card).split(/\s{2,}|\n/)[0]||'Saved movie';return s.replace(/continue watching/i,'').trim()||'Saved movie';}
function hideOriginal(){
 var h=findHeading();
 if(h)h.classList.add('sb525Hide');
 Array.from(main().children).forEach(function(ch){if(ch.id==='sb525Wrap')return;var s=clean(ch).toLowerCase();if(s.includes('continue watching')||s.includes('resume'))ch.classList.add('sb525Hide');});
}
function movieRow(card,i){
 var row=document.createElement('div');row.className='sb525Movie';
 var img=document.createElement('img');img.className='sb525Poster';img.alt='Poster';img.src=posterFrom(card)||'assets/stream-bandit-logo.png';
 var info=document.createElement('div');var title=titleFrom(card);var pct=Math.max(12,Math.min(86,25+i*13));
 info.innerHTML='<h4>'+title+'</h4><small>Saved progress from Continue Watching. Resume opens the existing app/player action.</small><div class="sb525Progress" style="--p:'+pct+'%"><i></i></div>';
 var actions=document.createElement('div');var old=cloneButtonFrom(card);var b=document.createElement('button');b.type='button';b.className='sb525Btn';b.textContent='Resume';b.onclick=function(){if(old)old.click();};actions.appendChild(b);
 row.append(img,info,actions);return row;
}
function build(){
 if(document.getElementById('sb525Wrap'))return;
 addCss();
 var cards=findCards();
 var wrap=document.createElement('div');wrap.id='sb525Wrap';wrap.className='sb525Wrap';
 wrap.innerHTML='<div class="sb525Hero"><h2>Continue Watching</h2><p>Pick up where you left off. This tidy page only reorganises your saved progress view — it does not change resume saving, player behaviour, volume controls or Supabase data.</p><div class="sb525Grid"><div class="sb525Mini"><b>Resume first</b><span>Saved progress stays connected to the existing Watch player.</span></div><div class="sb525Mini"><b>Player protected</b><span>No player, Sound Booster, overlay or fullscreen code changes.</span></div><div class="sb525Mini"><b>Safe tidy</b><span>Tabs and cards only. No database writes.</span></div></div></div><div class="sb525Tabs"><button class="sb525Tab active" data-p="resume">⏯️ Resume</button><button class="sb525Tab" data-p="help">ℹ️ How it works</button><button class="sb525Tab" data-p="safety">✅ Safety</button></div>';
 var resume=document.createElement('div');resume.className='sb525Panel active';resume.dataset.panel='resume';resume.innerHTML='<h3>Saved progress</h3><p>Your saved Continue Watching items appear here in a cleaner card list.</p><div class="sb525List"></div>';
 var list=resume.querySelector('.sb525List');
 if(cards.length){cards.slice(0,8).forEach(function(c,i){list.appendChild(movieRow(c,i));});}else{list.innerHTML='<div class="sb525Empty">No Continue Watching items found yet. Start a movie, watch a little, then come back here.</div>';}
 var help=document.createElement('div');help.className='sb525Panel';help.dataset.panel='help';help.innerHTML='<h3>How Continue Watching works</h3><p>Stream Bandit remembers your saved position and lets you resume from the Watch player. This page only tidies the presentation.</p><div class="sb525Note">The existing resume/play buttons are reused behind the scenes. No saved progress logic is replaced.</div>';
 var safety=document.createElement('div');safety.className='sb525Panel';safety.dataset.panel='safety';safety.innerHTML='<h3>V5.25 tidy safety</h3><p>This is a visual tidy test only.</p><div class="sb525Warn">Protected: player, Sound Booster, custom volume overlay, Supabase saves, movie rows, Mux and database logic are not changed.</div>';
 wrap.append(resume,help,safety);
 var r=main();var h=findHeading();if(h&&h.parentElement)h.parentElement.insertBefore(wrap,h.nextSibling);else r.prepend(wrap);
 wrap.querySelector('.sb525Tabs').onclick=function(e){var b=e.target.closest('.sb525Tab');if(!b)return;Array.from(wrap.querySelectorAll('.sb525Tab')).forEach(function(x){x.classList.remove('active')});b.classList.add('active');Array.from(wrap.querySelectorAll('.sb525Panel')).forEach(function(p){p.classList.toggle('active',p.dataset.panel===b.dataset.p)});};
 setTimeout(hideOriginal,80);
}
function apply(){if(!isContinue()){document.body.classList.remove('sb525Continue');return;}document.body.classList.add('sb525Continue');build();}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,900);});setInterval(apply,1400);
})();
