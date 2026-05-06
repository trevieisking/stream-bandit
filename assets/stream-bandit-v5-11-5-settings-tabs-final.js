/* Stream Bandit V5.11.5 — Settings Tabs Final Controller
   One Settings tabs controller only. Tabs jump/scroll and keep all content visible.
   No Supabase writes, Mux, player, storage, upload, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.11.5';
var NOTE='V5.11.5 Settings Tabs: same Settings controls stay visible. Tabs jump to each area safely.';
var active='overview';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function isSettings(){
  var m=main();
  var t=text(m).toLowerCase();
  var title=text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();
  return title==='settings'||(t.indexOf('settings')>-1&&t.indexOf('branding')>-1&&t.indexOf('homepage')>-1);
}
function addStyle(){
  if(document.getElementById('sb5115SettingsTabsStyle'))return;
  var st=document.createElement('style');
  st.id='sb5115SettingsTabsStyle';
  st.textContent='\n.sb58Tabs{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 14px;position:relative!important;z-index:3000!important;pointer-events:auto!important}.sb58Tab{display:inline-flex;text-decoration:none!important;border:0;border-radius:999px;padding:11px 16px;background:rgba(48,52,78,.92);color:#f6f7ff!important;font-weight:950;box-shadow:0 10px 28px rgba(0,0,0,.20);cursor:pointer;pointer-events:auto!important;position:relative!important;z-index:3100!important}.sb58Tab.active{background:linear-gradient(135deg,#ff2d85,#7c3cff);box-shadow:0 14px 36px rgba(124,60,255,.35)}.sb58TabsNote{margin:0 0 12px;padding:10px 12px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.22);color:#baf7df;font-size:12px;line-height:1.45}.sb5115Anchor{outline:2px solid rgba(255,45,133,.42)!important;box-shadow:0 0 0 7px rgba(124,60,255,.15),0 22px 60px rgba(124,60,255,.22)!important}.sb5115OldSettingsNote{display:none!important}\n';
  document.head.appendChild(st);
}
function cleanOldSettingsNotes(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('*')).forEach(function(el){
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return;
    var t=text(el);
    if(/^V5\.[0-9.]+ Settings Tabs:/.test(t))el.classList.add('sb5115OldSettingsNote');
  });
}
function sections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return false;
    if(el.classList.contains('top')||el.classList.contains('toast'))return false;
    if(el.classList.contains('sb5115OldSettingsNote'))return false;
    return !!text(el);
  });
}
function classify(el){
  var t=text(el).toLowerCase();
  if(t.indexOf('homepage builder')>-1||t.indexOf('homepage hero')>-1||t.indexOf('homepage sections')>-1)return 'homepage';
  if(t.indexOf('branding')>-1||t.indexOf('app name')>-1||t.indexOf('sidebar tagline')>-1||t.indexOf('logo image')>-1||t.indexOf('accent colour')>-1)return 'branding';
  if(t.indexOf('image uploads')>-1||t.indexOf('storage')>-1||t.indexOf('supabase storage')>-1||t.indexOf('mux video route')>-1)return 'storage';
  return 'overview';
}
function assignAnchors(){
  var found={};
  sections().forEach(function(el){
    var k=classify(el);
    if(!found[k]){found[k]=el;el.id='sb58-'+k;el.style.scrollMarginTop='24px';}
  });
  var first=sections()[0];
  if(first){first.id='sb58-overview';first.style.scrollMarginTop='24px';}
}
function buildTabs(){
  var m=main(); if(!m)return;
  var top=m.querySelector('.top')||m.firstElementChild; if(!top)return;
  var wrap=m.querySelector('#sb58SettingsTabsWrap');
  if(!wrap){
    wrap=document.createElement('div');
    wrap.id='sb58SettingsTabsWrap';
    top.insertAdjacentElement('afterend',wrap);
  }
  wrap.innerHTML='<div class="sb58TabsNote">'+NOTE+'</div><div class="sb58Tabs" id="sb58SettingsTabs"></div>';
  var tabs=wrap.querySelector('#sb58SettingsTabs');
  [
    ['overview','Overview'],
    ['branding','Branding'],
    ['homepage','Homepage'],
    ['storage','Storage']
  ].forEach(function(pair){
    var a=document.createElement('a');
    a.href='#sb58-'+pair[0];
    a.dataset.tab=pair[0];
    a.className='sb58Tab'+(active===pair[0]?' active':'');
    a.textContent=pair[1];
    tabs.appendChild(a);
  });
}
function target(k){assignAnchors();return document.getElementById('sb58-'+k)||sections()[0]||null;}
function setActive(k){active=k;Array.prototype.slice.call(document.querySelectorAll('.sb58Tab')).forEach(function(a){a.classList.toggle('active',a.dataset.tab===k);});}
function jump(k){
  k=k||'overview';
  setActive(k);
  var el=target(k);
  if(el){
    el.classList.add('sb5115Anchor');
    try{el.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){location.hash='sb58-'+k;}
    setTimeout(function(){el.classList.remove('sb5115Anchor');},1600);
  }
}
function run(){
  if(!isSettings())return;
  addStyle();
  cleanOldSettingsNotes();
  buildTabs();
  assignAnchors();
}
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest&&e.target.closest('.sb58Tab');
  if(a&&isSettings()){
    e.preventDefault();
    e.stopImmediatePropagation();
    jump(a.dataset.tab||'overview');
    return false;
  }
},true);
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,700);
setTimeout(run,900);
})();
