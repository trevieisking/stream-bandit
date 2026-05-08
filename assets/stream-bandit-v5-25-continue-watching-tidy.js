/* Stream Bandit V5.25.1 — Continue Watching Light Tidy TEST
   Test route only. Live is untouched.
   IMPORTANT: preserve the real live Continue Watching layout/cards.
   Do not rebuild saved progress cards. Do not hide real Supabase progress.
   No player changes, no progress changes, no Supabase writes, no movie saves. */
(function(){
'use strict';
function clean(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isContinue(){var s=clean(main()).toLowerCase();return s.includes('continue watching')&&!s.includes('supabase watch')&&!s.includes('stream bandit tools');}
function addCss(){
 if(document.getElementById('sb525Css'))return;
 var st=document.createElement('style');st.id='sb525Css';
 st.textContent='\nbody.sb525Continue #sb525Wrap{width:min(1120px,100%);margin:0 0 16px 0}body.sb525Continue .sb525Hero{border:1px solid rgba(34,211,166,.25);background:linear-gradient(135deg,rgba(9,62,57,.74),rgba(28,22,65,.78));border-radius:28px;padding:20px 22px;margin:10px 0 14px;box-shadow:0 22px 60px rgba(0,0,0,.30)}body.sb525Continue .sb525Hero h2{margin:0 0 8px;font-size:26px}body.sb525Continue .sb525Hero p{margin:0;color:var(--muted,#a9afc3);font-size:15px;line-height:1.45}.sb525Grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:14px}.sb525Mini{border:1px solid rgba(255,255,255,.08);background:rgba(18,22,38,.72);border-radius:18px;padding:13px}.sb525Mini b{display:block;margin-bottom:5px}.sb525Mini span{display:block;color:var(--muted,#a9afc3);line-height:1.35}.sb525Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;padding:9px;border-radius:22px;background:rgba(4,7,14,.74);border:1px solid rgba(255,255,255,.08)}.sb525Tab{border:0;border-radius:999px;padding:11px 16px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer}.sb525Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 12px 30px rgba(124,60,255,.28)}.sb525Info{display:none;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:22px;padding:15px;margin-bottom:14px;box-shadow:0 18px 44px rgba(0,0,0,.22)}.sb525Info.active{display:block}.sb525Info p{color:var(--muted,#a9afc3);line-height:1.45}.sb525Note{margin-top:10px;border-radius:16px;padding:11px 13px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb525Warn{margin-top:10px;border-radius:16px;padding:11px 13px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}@media(max-width:850px){.sb525Grid{grid-template-columns:1fr}.sb525Hero h2{font-size:23px}}\n';
 document.head.appendChild(st);
}
function findHeading(){return Array.from(main().querySelectorAll('h1,h2')).find(function(h){return /^continue watching$/i.test(clean(h));});}
function removeOldBadBuild(){
 var old=document.getElementById('sb525Wrap');
 if(old)old.remove();
 Array.from(document.querySelectorAll('.sb525Hide')).forEach(function(el){el.classList.remove('sb525Hide');});
}
function build(){
 if(document.getElementById('sb525Wrap'))return;
 addCss();
 var h=findHeading();
 if(!h)return;
 var wrap=document.createElement('div');wrap.id='sb525Wrap';
 wrap.innerHTML='<div class="sb525Hero"><h2>Continue Watching</h2><p>This light tidy keeps your real live Continue Watching cards exactly as they are. It only adds a neat guide area above them.</p><div class="sb525Grid"><div class="sb525Mini"><b>Real progress kept</b><span>The Supabase progress cards below are the original app cards.</span></div><div class="sb525Mini"><b>Resume protected</b><span>Resume buttons, saved time and player opening are not replaced.</span></div><div class="sb525Mini"><b>No rebuild</b><span>No fake cards, no cloned controls, no database writes.</span></div></div></div><div class="sb525Tabs"><button class="sb525Tab active" data-p="resume">⏯️ Resume view</button><button class="sb525Tab" data-p="help">ℹ️ How it works</button><button class="sb525Tab" data-p="safety">✅ Safety</button></div><div class="sb525Info active" data-panel="resume"><p><b>Resume view:</b> use the real Continue Watching cards below. Press Refresh Supabase progress if needed, then use Play / Resume or Details as normal.</p></div><div class="sb525Info" data-panel="help"><p>Continue Watching loads saved Supabase progress for your logged-in profile. The tidy layer does not change that logic.</p><div class="sb525Note">This page should look like the current live page, just with cleaner guidance above it.</div></div><div class="sb525Info" data-panel="safety"><p>This is a visual tidy test only.</p><div class="sb525Warn">Protected: player, Sound Booster, custom volume overlay, saved progress, movie rows, Mux and database logic are not changed.</div></div>';
 h.parentElement.insertBefore(wrap,h.nextSibling);
 wrap.querySelector('.sb525Tabs').onclick=function(e){var b=e.target.closest('.sb525Tab');if(!b)return;Array.from(wrap.querySelectorAll('.sb525Tab')).forEach(function(x){x.classList.remove('active')});b.classList.add('active');Array.from(wrap.querySelectorAll('.sb525Info')).forEach(function(p){p.classList.toggle('active',p.dataset.panel===b.dataset.p)});};
}
function apply(){
 if(!isContinue()){document.body.classList.remove('sb525Continue');return;}
 document.body.classList.add('sb525Continue');
 build();
}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(function(){removeOldBadBuild();apply();},900);});
setInterval(apply,1400);
})();
