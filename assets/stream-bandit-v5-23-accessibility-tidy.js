/* Stream Bandit V5.23 — Accessibility Page Tidy TEST
   Test route only. Live is untouched.
   Goal: tidy Accessibility wording so it matches current V5.21.12/V5.22.13 player setup.
   Current rule: custom Stream Bandit volume overlay controls volume; Sound Booster controls accessibility gain.
   No Supabase writes, no movie saves, no player source changes, no Settings save changes. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isAccess(){var s=txt(main()).toLowerCase();return s.indexOf('accessibility')>-1&&(s.indexOf('default audio boost')>-1||s.indexOf('keyboard shortcuts')>-1||s.indexOf('save accessibility settings')>-1);}
function addCss(){
  if(document.getElementById('sb523AccessCss'))return;
  var st=document.createElement('style');
  st.id='sb523AccessCss';
  st.textContent='\nbody.sb523AccessTidy .sb523Hero{border:1px solid rgba(34,211,166,.22);background:linear-gradient(135deg,rgba(9,62,57,.72),rgba(28,22,65,.72));border-radius:26px;padding:22px;margin:0 0 16px;box-shadow:0 22px 60px rgba(0,0,0,.28)}body.sb523AccessTidy .sb523Hero h2{margin:0 0 10px;font-size:28px}body.sb523AccessTidy .sb523Hero p{margin:0;color:var(--muted,#a9afc3);line-height:1.45;font-size:16px}.sb523Grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.sb523Mini{border:1px solid rgba(255,255,255,.08);background:rgba(18,22,38,.72);border-radius:18px;padding:14px}.sb523Mini b{display:block;margin-bottom:6px}.sb523Mini span{display:block;color:var(--muted,#a9afc3);line-height:1.35}.sb523Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;padding:10px;border-radius:22px;background:rgba(4,7,14,.72);border:1px solid rgba(255,255,255,.08)}.sb523Tab{border:0;border-radius:999px;padding:11px 16px;background:rgba(68,72,107,.92);color:#fff;font-weight:1000;cursor:pointer}.sb523Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 12px 30px rgba(124,60,255,.28)}.sb523Panel{display:none}.sb523Panel.active{display:block}.sb523Note{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb523Warn{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}body.sb523AccessTidy .sb523LegacyTitle{display:inline-flex;gap:8px;align-items:center}body.sb523AccessTidy .sb523LegacyTitle:after{content:"Sound Booster setting";font-size:12px;border-radius:999px;padding:5px 8px;background:rgba(34,211,166,.14);color:#baf7df;border:1px solid rgba(34,211,166,.22)}@media(max-width:850px){.sb523Grid{grid-template-columns:1fr}.sb523Hero h2{font-size:24px}}\n';
  document.head.appendChild(st);
}
function findHeading(re){return Array.from(main().querySelectorAll('h1,h2,h3,h4')).find(function(h){return re.test(txt(h));});}
function cardFor(el){return el&&el.closest('.card,.panel,section,div');}
function insertHero(){
  if(document.getElementById('sb523Hero'))return;
  var h=findHeading(/^accessibility$/i)||findHeading(/accessibility/i);
  if(!h)return;
  var hero=document.createElement('div');
  hero.id='sb523Hero';
  hero.className='sb523Hero';
  hero.innerHTML='<h2>Accessibility + Player Comfort</h2><p>Stream Bandit keeps the player easier to use with clearer controls, louder-audio support and keyboard shortcuts. Current setup: the custom Stream Bandit volume overlay controls volume, while Sound Booster controls extra accessibility gain for quiet videos.</p><div class="sb523Grid"><div class="sb523Mini"><b>Volume control</b><span>Use the custom Stream Bandit volume overlay. The native player volume bar can be ignored.</span></div><div class="sb523Mini"><b>Sound Booster</b><span>Use boost for louder dialogue/accessibility gain. This is separate from normal volume.</span></div><div class="sb523Mini"><b>Player comfort</b><span>Fullscreen controls can hide after idle. Bigger controls can be polished later.</span></div></div>';
  var parent=h.parentElement;
  if(parent)parent.insertBefore(hero,h.nextSibling);
}
function makeTabs(){
  if(document.getElementById('sb523Tabs'))return;
  var boost=cardFor(findHeading(/default audio boost/i));
  var shortcuts=cardFor(findHeading(/keyboard shortcuts/i));
  var save=cardFor(findHeading(/save accessibility/i));
  if(!boost||!shortcuts||!save)return;
  var display=cardFor(findHeading(/display comfort/i));
  var jump=cardFor(findHeading(/skip\/jump/i));
  var panels=[];
  var sound=document.createElement('div');sound.className='sb523Panel active';sound.id='sb523Sound';
  sound.appendChild(boost);
  if(jump&&jump!==boost)sound.appendChild(jump);
  var note=document.createElement('div');note.className='sb523Note';note.textContent='Sound Booster is for accessibility gain. Normal volume is controlled by the custom Stream Bandit overlay on the Watch player.';sound.appendChild(note);
  panels.push(sound);
  var disp=document.createElement('div');disp.className='sb523Panel';disp.id='sb523Display';
  if(display)disp.appendChild(display);
  var warn=document.createElement('div');warn.className='sb523Warn';warn.textContent='Future polish note: custom player volume overlay works well but can be made slightly smaller later to better match the app UI.';disp.appendChild(warn);
  panels.push(disp);
  var keys=document.createElement('div');keys.className='sb523Panel';keys.id='sb523Keys';keys.appendChild(shortcuts);panels.push(keys);
  var saves=document.createElement('div');saves.className='sb523Panel';saves.id='sb523Save';saves.appendChild(save);panels.push(saves);
  var tabs=document.createElement('div');tabs.id='sb523Tabs';tabs.className='sb523Tabs';
  tabs.innerHTML='<button class="sb523Tab active" data-panel="sb523Sound">🔊 Sound</button><button class="sb523Tab" data-panel="sb523Display">👁 Display</button><button class="sb523Tab" data-panel="sb523Keys">⌨️ Shortcuts</button><button class="sb523Tab" data-panel="sb523Save">✅ Save / checklist</button>';
  var anchor=document.getElementById('sb523Hero')||findHeading(/^accessibility$/i);
  var parent=anchor&&anchor.parentElement;
  if(!parent)return;
  parent.insertBefore(tabs,anchor.nextSibling);
  panels.forEach(function(p){parent.insertBefore(p,tabs.nextSibling);});
  tabs.addEventListener('click',function(e){
    var b=e.target.closest('.sb523Tab');if(!b)return;
    Array.from(tabs.querySelectorAll('.sb523Tab')).forEach(function(x){x.classList.remove('active');});
    b.classList.add('active');
    panels.forEach(function(p){p.classList.toggle('active',p.id===b.dataset.panel);});
  });
}
function relabel(){
  var h=findHeading(/default audio boost/i);
  if(h&&!h.dataset.sb523){h.dataset.sb523='1';h.innerHTML='<span class="sb523LegacyTitle">Sound Booster default</span>';}
  Array.from(main().querySelectorAll('*')).forEach(function(el){
    if(el.dataset&&el.dataset.sb523Text)return;
    var s=txt(el);
    if(s==='Default boost 100%'){el.dataset.sb523Text='1';el.textContent='Sound boost 100%';}
    if(s==='Large controls off'){el.dataset.sb523Text='1';el.textContent='Large controls off';}
  });
}
function apply(){
  if(!isAccess()){document.body.classList.remove('sb523AccessTidy');return;}
  addCss();
  document.body.classList.add('sb523AccessTidy');
  insertHero();
  relabel();
  makeTabs();
}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,900);});
setInterval(apply,1400);
})();
