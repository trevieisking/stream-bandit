/* Stream Bandit V5.23.1 — Watch Player Comfort Tidy TEST
   Test route only. Live is untouched.
   Goal: tidy Supabase Watch player/sound booster wording to match the current clean player setup.
   Current rule: custom Stream Bandit volume overlay is the main volume control; Sound Booster is accessibility gain.
   Visual/text polish only. No Supabase writes, no movie saves, no player source changes, no volume logic changes. */
(function(){
'use strict';
function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isWatch(){var s=txt(main()).toLowerCase();return s.indexOf('supabase watch')>-1&&s.indexOf('player sound booster')>-1;}
function addCss(){
 if(document.getElementById('sb5231Css'))return;
 var st=document.createElement('style');st.id='sb5231Css';
 st.textContent='\nbody.sb5231WatchTidy .sb5231ComfortCard{border:1px solid rgba(34,211,166,.25)!important;background:linear-gradient(135deg,rgba(8,54,50,.82),rgba(25,20,62,.88))!important;border-radius:26px!important;box-shadow:0 22px 60px rgba(0,0,0,.30)!important}body.sb5231WatchTidy .sb5231ComfortTitle{display:flex!important;align-items:center!important;gap:10px!important;flex-wrap:wrap!important}body.sb5231WatchTidy .sb5231ComfortTitle:after{content:"Clean player setup";font-size:12px;border-radius:999px;padding:6px 10px;background:rgba(34,211,166,.14);border:1px solid rgba(34,211,166,.24);color:#baf7df;font-weight:900}.sb5231ComfortNote{margin:12px 0;border-radius:16px;padding:12px 14px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb5231MiniGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}.sb5231Mini{border-radius:16px;padding:11px 12px;background:rgba(8,10,20,.52);border:1px solid rgba(255,255,255,.08)}.sb5231Mini b{display:block;margin-bottom:5px;color:#fff}.sb5231Mini span{display:block;color:var(--muted,#a9afc3);line-height:1.32;font-size:13px}.sb5231Future{margin-top:10px;border-radius:16px;padding:11px 13px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.4;font-size:13px}@media(max-width:850px){.sb5231MiniGrid{grid-template-columns:1fr}}\n';
 document.head.appendChild(st);
}
function findBoosterCard(){
 var h=Array.from(main().querySelectorAll('h2,h3,h4,b,strong')).find(function(x){return /player sound booster/i.test(txt(x));});
 if(!h)return null;
 return h.closest('.card,.panel,section,div')||h.parentElement;
}
function replaceFirstText(root,from,to){
 var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
 var n;
 while(n=walker.nextNode()){
   if(n.nodeValue&&n.nodeValue.indexOf(from)>-1){n.nodeValue=n.nodeValue.replace(from,to);return true;}
 }
 return false;
}
function apply(){
 if(!isWatch()){document.body.classList.remove('sb5231WatchTidy');return;}
 addCss();document.body.classList.add('sb5231WatchTidy');
 var card=findBoosterCard();if(!card||card.dataset.sb5231Done==='1')return;
 card.dataset.sb5231Done='1';card.classList.add('sb5231ComfortCard');
 var title=Array.from(card.querySelectorAll('h2,h3,h4,b,strong')).find(function(x){return /player sound booster/i.test(txt(x));});
 if(title){title.classList.add('sb5231ComfortTitle');title.textContent='🔊 Player Comfort + Sound Booster';}
 replaceFirstText(card,'Fixed test booster: keeps your normal player volume slider working while still adding accessibility gain.','Sound Booster adds accessibility gain for quiet videos. Use the custom Stream Bandit volume overlay for normal volume.');
 var note=document.createElement('div');note.className='sb5231ComfortNote';note.textContent='Current player rule: custom Stream Bandit volume overlay controls normal volume. Sound Booster controls extra gain for louder dialogue/accessibility.';
 var grid=document.createElement('div');grid.className='sb5231MiniGrid';
 grid.innerHTML='<div class="sb5231Mini"><b>Volume</b><span>Use the custom overlay on the player.</span></div><div class="sb5231Mini"><b>Boost</b><span>Use the boost selector for extra accessibility gain.</span></div><div class="sb5231Mini"><b>Fullscreen</b><span>Controls can auto-hide while playing.</span></div>';
 var future=document.createElement('div');future.className='sb5231Future';future.textContent='Future polish: the custom volume overlay works well. Later we can make it slightly smaller so it matches the rest of Stream Bandit better.';
 var existing=card.querySelector('.sb5231ComfortNote');
 if(!existing){
   var firstRow=Array.from(card.children).find(function(el){return /booster|boost|apply/i.test(txt(el));});
   card.insertBefore(note,firstRow||card.children[1]||null);
   card.insertBefore(grid,firstRow||card.children[2]||null);
   card.appendChild(future);
 }
}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,900);});
setInterval(apply,1400);
})();
