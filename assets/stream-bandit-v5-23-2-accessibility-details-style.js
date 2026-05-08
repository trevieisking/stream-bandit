/* Stream Bandit V5.23.2 — Accessibility Details-Style TEST
   Test route only. Live is untouched.
   Goal: make Accessibility look like Supabase Details: wide hero, tabs, one neat panel.
   Player is protected: this does not change player code, volume logic, boost logic, video source, Supabase, or saves.
*/
(function(){
'use strict';
function clean(x){return String(x&&x.textContent||'').replace(/\s+/g,' ').trim();}
function root(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isAccess(){var s=clean(root()).toLowerCase();return s.includes('accessibility')&&(s.includes('default audio boost')||s.includes('sound booster default')||s.includes('save accessibility settings')||s.includes('keyboard shortcuts'));}
function addCss(){
 if(document.getElementById('sb5232css'))return;
 var st=document.createElement('style');st.id='sb5232css';
 st.textContent='\nbody.sb5232Access .sb5232Hide{display:none!important}body.sb5232Access .sb5232Wrap{width:min(1120px,100%)!important;margin:0 auto!important}body.sb5232Access .sb5232Hero{border:1px solid rgba(34,211,166,.25);background:linear-gradient(135deg,rgba(9,62,57,.74),rgba(28,22,65,.78));border-radius:28px;padding:24px;margin:12px 0 18px;box-shadow:0 22px 60px rgba(0,0,0,.30)}body.sb5232Access .sb5232Hero h2{margin:0 0 10px;font-size:30px}body.sb5232Access .sb5232Hero p{margin:0;color:var(--muted,#a9afc3);font-size:16px;line-height:1.45}.sb5232HeroGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:16px}.sb5232Mini{border:1px solid rgba(255,255,255,.08);background:rgba(18,22,38,.72);border-radius:18px;padding:14px}.sb5232Mini b{display:block;margin-bottom:6px}.sb5232Mini span{display:block;color:var(--muted,#a9afc3);line-height:1.35}.sb5232Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:0 0 14px;padding:10px;border-radius:22px;background:rgba(4,7,14,.74);border:1px solid rgba(255,255,255,.08)}.sb5232Tab{border:0;border-radius:999px;padding:12px 18px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer}.sb5232Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 12px 30px rgba(124,60,255,.28)}.sb5232Panel{display:none;border:1px solid rgba(255,255,255,.09);background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.96));border-radius:26px;padding:18px;box-shadow:0 22px 55px rgba(0,0,0,.26)}.sb5232Panel.active{display:block}.sb5232Panel h3{margin:0 0 10px;font-size:24px}.sb5232Panel p{color:var(--muted,#a9afc3);line-height:1.45}.sb5232Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.sb5232Card{border:1px solid rgba(255,255,255,.08);background:rgba(18,22,38,.72);border-radius:20px;padding:15px}.sb5232Card h4{margin:0 0 8px}.sb5232Card select,.sb5232Card input[type=checkbox]{margin-top:8px}.sb5232Buttons{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.sb5232Buttons button,.sb5232Buttons a{border:0;border-radius:16px;padding:13px 16px;background:rgba(68,72,107,.94);color:#fff;font-weight:1000;cursor:pointer;text-decoration:none}.sb5232Buttons .primary{background:linear-gradient(135deg,#12c99b,#0fae82)}.sb5232Note{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb5232Warn{margin-top:12px;border-radius:16px;padding:12px 14px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.22);color:#ffe8a3;line-height:1.45}@media(max-width:850px){.sb5232HeroGrid,.sb5232Grid{grid-template-columns:1fr}.sb5232Hero h2{font-size:25px}}\n';
 document.head.appendChild(st);
}
function q(re,scope){return Array.from((scope||root()).querySelectorAll('h1,h2,h3,h4,button,a,label,p,div')).find(function(x){return re.test(clean(x));});}
function nearestCard(el){return el&&el.closest('.card,.panel,section,div');}
function findBtn(re){return Array.from(root().querySelectorAll('button,a')).find(function(b){return re.test(clean(b));});}
function findSelectInCard(re){var h=q(re);var c=nearestCard(h);return c&&c.querySelector('select');}
function findCheckboxByLabel(re){var labels=Array.from(root().querySelectorAll('label,div'));var l=labels.find(function(x){return re.test(clean(x))&&x.querySelector('input[type=checkbox]');});return l&&l.querySelector('input[type=checkbox]');}
function hideOriginal(){
 var r=root();
 Array.from(r.children).forEach(function(ch){
   var s=clean(ch).toLowerCase();
   if(ch.id==='sb5232Wrap')return;
   if(s.includes('accessibility')||s.includes('default audio boost')||s.includes('keyboard shortcuts')||s.includes('save accessibility settings')) ch.classList.add('sb5232Hide');
 });
 Array.from(r.querySelectorAll('.card,.panel,section')).forEach(function(ch){
   var s=clean(ch).toLowerCase();
   if(s.includes('default audio boost')||s.includes('keyboard shortcuts')||s.includes('save accessibility settings')||s.includes('display comfort')||s.includes('skip/jump size')) ch.classList.add('sb5232Hide');
 });
}
function makeSelectClone(sel){
 var c=document.createElement('select');
 if(sel){Array.from(sel.options).forEach(function(o){var n=document.createElement('option');n.value=o.value;n.textContent=o.textContent;c.appendChild(n);});c.value=sel.value;c.onchange=function(){sel.value=c.value;sel.dispatchEvent(new Event('change',{bubbles:true}));};}
 else{['100%','150%','200%','250%','300%','400%'].forEach(function(v){var o=document.createElement('option');o.value=v;o.textContent=v;c.appendChild(o);});c.value='400%';}
 if(!Array.from(c.options).some(function(o){return /400/.test(o.textContent)||o.value==='4';})){var opt=document.createElement('option');opt.value='4';opt.textContent='400%';c.appendChild(opt);}
 return c;
}
function checkboxClone(cb,label){
 var wrap=document.createElement('label');wrap.style.display='flex';wrap.style.alignItems='center';wrap.style.gap='8px';wrap.style.fontWeight='900';
 var x=document.createElement('input');x.type='checkbox';x.checked=cb?cb.checked:false;x.onchange=function(){if(cb){cb.checked=x.checked;cb.dispatchEvent(new Event('change',{bubbles:true}));}};
 wrap.appendChild(x);wrap.appendChild(document.createTextNode(label));return wrap;
}
function build(){
 if(document.getElementById('sb5232Wrap'))return;
 addCss();hideOriginal();
 var r=root();var wrap=document.createElement('div');wrap.id='sb5232Wrap';wrap.className='sb5232Wrap';
 var boostSel=findSelectInCard(/default audio boost|sound booster default/i);
 var jumpSel=findSelectInCard(/skip\/jump size/i);
 var largeCb=findCheckboxByLabel(/larger player panels\/buttons/i);
 var contrastCb=findCheckboxByLabel(/clearer high-contrast text/i);
 var saveBtn=findBtn(/save accessibility settings/i);
 var backBtn=findBtn(/back to player/i);
 var checkBtn=findBtn(/open test checklist/i);
 wrap.innerHTML='<div class="sb5232Hero"><h2>Accessibility + Player Comfort</h2><p>This page matches the protected Watch player. The player itself is not changed here: the custom Stream Bandit volume overlay controls normal volume, and Sound Booster controls extra accessibility gain for quiet videos.</p><div class="sb5232HeroGrid"><div class="sb5232Mini"><b>Volume overlay</b><span>Main volume control on the Watch player. Leave the player code alone.</span></div><div class="sb5232Mini"><b>Sound Booster</b><span>Accessibility gain for quiet videos. Current player supports up to 400% boost.</span></div><div class="sb5232Mini"><b>Display comfort</b><span>Bigger panels, high contrast and shortcuts are page preferences.</span></div></div></div><div class="sb5232Tabs"><button class="sb5232Tab active" data-p="sound">🔊 Sound Booster</button><button class="sb5232Tab" data-p="display">👁 Display</button><button class="sb5232Tab" data-p="keys">⌨️ Shortcuts</button><button class="sb5232Tab" data-p="save">✅ Save / checklist</button></div>';
 var sound=document.createElement('div');sound.className='sb5232Panel active';sound.dataset.panel='sound';sound.innerHTML='<h3>Sound Booster</h3><p>Use this for louder dialogue/accessibility gain. Normal volume stays on the custom Stream Bandit overlay.</p><div class="sb5232Grid"><div class="sb5232Card"><h4>Default boost</h4><p>Protected player supports up to 400%.</p></div><div class="sb5232Card"><h4>Skip / jump size</h4><p>Used by keyboard arrows on the Watch player.</p></div></div><div class="sb5232Note">Player is protected. This page only explains and saves accessibility preferences.</div>';
 sound.querySelector('.sb5232Card:nth-child(1)').appendChild(makeSelectClone(boostSel));
 sound.querySelector('.sb5232Card:nth-child(2)').appendChild(makeSelectClone(jumpSel));
 var display=document.createElement('div');display.className='sb5232Panel';display.dataset.panel='display';display.innerHTML='<h3>Display comfort</h3><p>These options make Stream Bandit easier to use without changing playback logic.</p><div class="sb5232Grid"><div class="sb5232Card"><h4>Larger controls</h4></div><div class="sb5232Card"><h4>High contrast</h4></div></div><div class="sb5232Warn">Future polish note: the custom volume overlay works well. Later we can make it slightly smaller, but not during this page tidy.</div>';
 display.querySelector('.sb5232Card:nth-child(1)').appendChild(checkboxClone(largeCb,'Larger player panels/buttons'));
 display.querySelector('.sb5232Card:nth-child(2)').appendChild(checkboxClone(contrastCb,'Clearer high-contrast text'));
 var keys=document.createElement('div');keys.className='sb5232Panel';keys.dataset.panel='keys';keys.innerHTML='<h3>Keyboard shortcuts on Watch page</h3><div class="sb5232Grid"><div class="sb5232Card"><h4>Space</h4><p>Play / pause</p></div><div class="sb5232Card"><h4>← / →</h4><p>Back / forward jump</p></div><div class="sb5232Card"><h4>F</h4><p>Fullscreen</p></div><div class="sb5232Card"><h4>M</h4><p>Mute / unmute</p></div><div class="sb5232Card"><h4>+ / -</h4><p>Audio boost up / down</p></div></div>';
 var save=document.createElement('div');save.className='sb5232Panel';save.dataset.panel='save';save.innerHTML='<h3>Save accessibility settings</h3><p>Save preferences after changing boost/display options.</p><div class="sb5232Buttons"></div>';
 var bwrap=save.querySelector('.sb5232Buttons');
 function proxyButton(old,label,cls){var b=document.createElement('button');b.type='button';b.textContent=label;b.className=cls||'';b.onclick=function(){if(old)old.click();};bwrap.appendChild(b);}
 proxyButton(saveBtn,'Save accessibility settings','primary');proxyButton(backBtn,'Back to player','');proxyButton(checkBtn,'Open Test Checklist','');
 wrap.append(sound,display,keys,save);
 var h=Array.from(r.querySelectorAll('h1,h2')).find(function(x){return /^accessibility$/i.test(clean(x));});
 if(h&&h.parentElement===r)r.insertBefore(wrap,h.nextSibling);else r.appendChild(wrap);
 wrap.querySelector('.sb5232Tabs').onclick=function(e){var b=e.target.closest('.sb5232Tab');if(!b)return;Array.from(wrap.querySelectorAll('.sb5232Tab')).forEach(function(x){x.classList.remove('active');});b.classList.add('active');Array.from(wrap.querySelectorAll('.sb5232Panel')).forEach(function(p){p.classList.toggle('active',p.dataset.panel===b.dataset.p);});};
}
function apply(){if(!isAccess()){document.body.classList.remove('sb5232Access');return;}document.body.classList.add('sb5232Access');build();}
new MutationObserver(function(){setTimeout(apply,250);}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',function(){setTimeout(apply,900);});setInterval(apply,1400);
})();
