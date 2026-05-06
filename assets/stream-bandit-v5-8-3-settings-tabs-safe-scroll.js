/* Stream Bandit V5.8.3 — Settings Tabs Safe Scroll
   Keeps all existing Settings content visible and uses tabs as jump buttons.
   No Supabase save logic, Mux, player, storage, form field, upload or database changes. */
(function(){
'use strict';

var VERSION='V5.8.3';
var active='overview';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isSettingsPage(){
  var m=main();
  var t=m?text(m).toLowerCase():'';
  return pageTitle()==='settings'||(t.indexOf('branding')>-1&&t.indexOf('homepage builder')>-1);
}
function addStyle(){
  var old=document.getElementById('sb58TabsStyle');
  if(old)old.remove();
  var st=document.createElement('style');
  st.id='sb583TabsStyle';
  st.textContent='\n.sb58Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 14px}.sb58Tab{border:0;border-radius:999px;padding:11px 16px;background:rgba(48,52,78,.92);color:#f6f7ff;font-weight:950;box-shadow:0 10px 28px rgba(0,0,0,.20);cursor:pointer;pointer-events:auto!important;position:relative;z-index:5}.sb58Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 14px 36px rgba(124,60,255,.35)}.sb58TabsNote{margin:0 0 12px;padding:10px 12px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.22);color:#baf7df;font-size:12px;line-height:1.45}.sb58Anchor{outline:2px solid rgba(255,45,133,.35);box-shadow:0 0 0 6px rgba(124,60,255,.12),0 20px 50px rgba(124,60,255,.18)!important}.sb58Recover{display:none!important}.sb58Hidden{display:block!important}\n';
  document.head.appendChild(st);
}
function clearBadOldState(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('.sb58Hidden')).forEach(function(el){el.classList.remove('sb58Hidden');el.style.display='';});
  Array.prototype.slice.call(m.querySelectorAll('.sb58Recover')).forEach(function(el){try{el.remove();}catch(e){}});
  Array.prototype.slice.call(m.children).forEach(function(el){if(el&&el.classList){el.classList.remove('sb58Hidden');el.style.display='';}});
}
function classify(el){
  var t=text(el).toLowerCase();
  if(t.indexOf('homepage builder')>-1||t.indexOf('homepage hero')>-1||t.indexOf('homepage sections')>-1)return 'homepage';
  if(t.indexOf('branding')>-1||t.indexOf('app name')>-1||t.indexOf('sidebar tagline')>-1||t.indexOf('logo image')>-1||t.indexOf('accent colour')>-1)return 'branding';
  if(t.indexOf('image uploads')>-1||t.indexOf('storage')>-1||t.indexOf('supabase storage')>-1||t.indexOf('mux video route')>-1)return 'storage';
  return 'overview';
}
function tabTitle(k){return {overview:'Overview',branding:'Branding',homepage:'Homepage',storage:'Storage'}[k]||k;}
function sections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return false;
    if(el.classList.contains('top'))return false;
    if(el.classList.contains('toast'))return false;
    if(!text(el))return false;
    return true;
  });
}
function findSection(kind){
  var list=sections();
  if(kind==='overview')return list[0]||null;
  return list.find(function(el){return classify(el)===kind;})||list[0]||null;
}
function updateActiveTabs(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('.sb58Tab')).forEach(function(b){b.classList.toggle('active',b.dataset.tab===active);});
}
function jump(kind){
  active=kind;
  clearBadOldState();
  updateActiveTabs();
  var target=findSection(kind);
  if(target){
    target.classList.add('sb58Anchor');
    target.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(function(){target.classList.remove('sb58Anchor');},1700);
  }
}
function ensureTabs(){
  if(!isSettingsPage())return;
  addStyle();
  clearBadOldState();
  var m=main(); if(!m)return;
  var top=m.querySelector('.top')||m.firstElementChild;
  if(!top)return;
  var oldWrap=m.querySelector('#sb58SettingsTabsWrap');
  if(oldWrap)oldWrap.remove();
  var wrap=document.createElement('div');
  wrap.id='sb58SettingsTabsWrap';
  wrap.innerHTML='<div class="sb58TabsNote">V5.8.3 Settings Tabs: same Settings controls stay visible. Tabs jump to each area safely.</div><div class="sb58Tabs" id="sb58SettingsTabs"></div>';
  top.insertAdjacentElement('afterend',wrap);
  var tabs=wrap.querySelector('#sb58SettingsTabs');
  ['overview','branding','homepage','storage'].forEach(function(k){
    var b=document.createElement('button');
    b.type='button';
    b.dataset.tab=k;
    b.className='sb58Tab'+(active===k?' active':'');
    b.textContent=tabTitle(k);
    b.onclick=function(e){e.preventDefault();e.stopPropagation();jump(k);};
    tabs.appendChild(b);
  });
}
function run(){if(!isSettingsPage())return;ensureTabs();clearBadOldState();}
var mo=new MutationObserver(function(){setTimeout(run,240);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(function(){if(isSettingsPage())clearBadOldState();},600);
setTimeout(run,900);
})();
