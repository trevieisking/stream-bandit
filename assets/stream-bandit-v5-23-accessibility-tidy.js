/* Stream Bandit V5.23 — Accessibility Page Tidy TEST
   Test route only. Live is untouched.
   Goal: make Accessibility match the protected player setup, without changing player code.
   Player rule from V5.21.5/V5.21.12: custom overlay controls volume, Sound Booster supports up to 400% accessibility gain.
   This script only tidies Accessibility into neat tabs and wording. No player behaviour changes. */
(function(){
'use strict';

function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isAccess(){var s=txt(main()).toLowerCase();return s.indexOf('accessibility')>-1&&(s.indexOf('default audio boost')>-1||s.indexOf('sound booster default')>-1||s.indexOf('keyboard shortcuts')>-1||s.indexOf('save accessibility settings')>-1);}
function addCss(){
  if(document.getElementById('sb523AccessCss'))return;
  var st=document.createElement('style');
  st.id='sb523AccessCss';
  st.textContent='\nbody.sb523AccessTidy #sb523Hero{border:1px solid rgba(34,211,166,.22);background:linear-gradient(135deg,rgba(9,62,57,.72),rgba(28,22,65,.72));border-radius:26px;padding:22px;margin:0 0 14px;box-shadow:0 22px 60px rgba(0,0,0,.28);max-width:100%}body.sb523AccessTidy #sb523Hero h2{margin:0 0 10px;font-size:28px}body.sb523AccessTidy #sb523Hero p{margin:0;color:var(--muted,#a9afc3);line-height:1.45;font-size:16px}.sb523Grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.sb523Mini{border:1px solid rgba(255,255,255,.08);background:rgba(18,22,38,.72);border-radius:18px;padding:14px}.sb523Mini b{display:block;margin-bottom:6px}.sb523Mini span{display:block;color:var(--muted,#a9afc3);line-height:1.35}.sb523Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;padding:10px;border-radius:22px;background:rgba(4,7,14,.72);border:1px solid rgba(255,255,255,.08)}.sb523Tab{border:0;border-radius:999px;padding:11px 16px;background:rgba(68,72,107,.92);color:#fff;font-weight:1000;cursor:pointer}.sb523Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 12px 30px rgba(124,60,255,.28)}.sb523Panel{display:none!important}.sb523Panel.active{display:block!important}.sb523PanelGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sb523Note{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb523Warn{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}body.sb523AccessTidy .sb523LegacyTitle{display:inline-flex;gap:8px;align-items:center;flex-wrap:wrap}body.sb523AccessTidy .sb523LegacyTitle:after{content:"matches player max 400%";font-size:12px;border-radius:999px;padding:5px 8px;background:rgba(34,211,166,.14);color:#baf7df;border:1px solid rgba(34,211,166,.22)}body.sb523AccessTidy .sb523HideOriginalHero{display:none!important}@media(max-width:850px){.sb523Grid,.sb523PanelGrid{grid-template-columns:1fr}body.sb523AccessTidy #sb523Hero h2{font-size:24px}}\n';
  document.head.appendChild(st);
}
function findHeading(re){return Array.from(main().querySelectorAll('h1,h2,h3,h4')).find(function(h){return re.test(txt(h));});}
function cardFor(el){return el&&el.closest('.card,.panel,section,div');}
function hideOriginalHero(){
  Array.from(main().querySelectorAll('.card,.panel,section,div')).forEach(function(c){
    var s=txt(c);
    if(/Accessibility \+ Player Comfort/i.test(s)&&/Default boost|Jump 10 seconds|Large controls/i.test(s)&&!c.id){c.classList.add('sb523HideOriginalHero');}
  });
}
function insertHero(){
  if(document.getElementById('sb523Hero'))return;
  var h=findHeading(/^accessibility$/i)||findHeading(/accessibility/i);
  if(!h)return;
  var hero=document.createElement('div');
  hero.id='sb523Hero';
  hero.innerHTML='<h2>Accessibility + Player Comfort</h2><p>This page now matches the protected Watch player. The player itself is not changed here: use the custom Stream Bandit volume overlay for normal volume, and use Sound Booster for extra accessibility gain on quiet videos.</p><div class="sb523Grid"><div class="sb523Mini"><b>Volume control</b><span>Use the custom Stream Bandit volume overlay on the player. The native player volume bar can be ignored.</span></div><div class="sb523Mini"><b>Sound Booster</b><span>Boost supports up to 400% for accessibility/louder dialogue. This is separate from normal volume.</span></div><div class="sb523Mini"><b>Protected player</b><span>Do not change player behaviour here. This page only explains and saves accessibility preferences.</span></div></div>';
  var parent=h.parentElement;
  if(parent)parent.insertBefore(hero,h.nextSibling);
}
function relabel(){
  var h=findHeading(/default audio boost|sound booster default/i);
  if(h&&!h.dataset.sb523){h.dataset.sb523='1';h.innerHTML='<span class="sb523LegacyTitle">Sound Booster default</span>';}
  Array.from(main().querySelectorAll('*')).forEach(function(el){
    if(el.dataset&&el.dataset.sb523Text)return;
    var s=txt(el);
    if(s==='Default boost 100%'||s==='Default boost 250%'){el.dataset.sb523Text='1';el.textContent='Default boost up to 400%';}
    if(s==='This is the boost level the player remembers for quiet videos.'){el.dataset.sb523Text='1';el.textContent='This is the Sound Booster gain the protected player remembers for quiet videos. The Watch player supports up to 400% boost.';}
  });
  Array.from(main().querySelectorAll('select')).forEach(function(sel){
    if(sel.dataset.sb523BoostOptions)return;
    var card=cardFor(sel);
    if(card&&/sound booster default|default audio boost/i.test(txt(card))){
      sel.dataset.sb523BoostOptions='1';
      var has400=Array.from(sel.options).some(function(o){return /400|4/.test(o.value)||/400/.test(o.textContent);});
      if(!has400){var opt=document.createElement('option');opt.value='4';opt.textContent='Max 400%';sel.appendChild(opt);}
    }
  });
}
function makeTabs(){
  if(document.getElementById('sb523Tabs'))return;
  var boost=cardFor(findHeading(/default audio boost|sound booster default/i));
  var shortcuts=cardFor(findHeading(/keyboard shortcuts/i));
  var save=cardFor(findHeading(/save accessibility/i));
  if(!boost||!shortcuts||!save)return;
  var display=cardFor(findHeading(/display comfort/i));
  var jump=cardFor(findHeading(/skip\/jump/i));
  var tabs=document.createElement('div');
  tabs.id='sb523Tabs';tabs.className='sb523Tabs';
  tabs.innerHTML='<button class="sb523Tab active" data-panel="sb523Sound">🔊 Sound Booster</button><button class="sb523Tab" data-panel="sb523Display">👁 Display comfort</button><button class="sb523Tab" data-panel="sb523Keys">⌨️ Shortcuts</button><button class="sb523Tab" data-panel="sb523Save">✅ Save / checklist</button>';
  var sound=document.createElement('div');sound.className='sb523Panel active';sound.id='sb523Sound';
  var soundGrid=document.createElement('div');soundGrid.className='sb523PanelGrid';soundGrid.appendChild(boost);if(jump&&jump!==boost)soundGrid.appendChild(jump);sound.appendChild(soundGrid);
  var note=document.createElement('div');note.className='sb523Note';note.textContent='Sound Booster is accessibility gain only. Normal volume stays on the custom Stream Bandit player overlay. Player code is protected and not changed by this page.';sound.appendChild(note);
  var disp=document.createElement('div');disp.className='sb523Panel';disp.id='sb523Display';if(display)disp.appendChild(display);
  var warn=document.createElement('div');warn.className='sb523Warn';warn.textContent='Future polish note: the custom volume overlay works well. Later we can make it slightly smaller so it matches the UI better, but not during this Accessibility tidy.';disp.appendChild(warn);
  var keys=document.createElement('div');keys.className='sb523Panel';keys.id='sb523Keys';keys.appendChild(shortcuts);
  var saves=document.createElement('div');saves.className='sb523Panel';saves.id='sb523Save';saves.appendChild(save);
  var anchor=document.getElementById('sb523Hero')||findHeading(/^accessibility$/i);
  var parent=anchor&&anchor.parentElement;if(!parent)return;
  parent.insertBefore(tabs,anchor.nextSibling);
  parent.insertBefore(sound,tabs.nextSibling);parent.insertBefore(disp,sound.nextSibling);parent.insertBefore(keys,disp.nextSibling);parent.insertBefore(saves,keys.nextSibling);
  tabs.addEventListener('click',function(e){var b=e.target.closest('.sb523Tab');if(!b)return;Array.from(tabs.querySelectorAll('.sb523Tab')).forEach(function(x){x.classList.remove('active');});b.classList.add('active');[sound,disp,keys,saves].forEach(function(p){p.classList.toggle('active',p.id===b.dataset.panel);});});
}
function apply(){
  if(!isAccess()){document.body.classList.remove('sb523AccessTidy');return;}
  addCss();document.body.classList.add('sb523AccessTidy');
  hideOriginalHero();insertHero();relabel();makeTabs();
}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,900);});
setInterval(apply,1400);
})();
