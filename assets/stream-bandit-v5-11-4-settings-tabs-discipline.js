/* Stream Bandit V5.11.4 — Settings Tabs Discipline
   Settings page visual/click guard only.
   Forces current Settings tab note, repairs tab clicks, and removes old visible Settings version notes.
   No Supabase writes, Mux, player, storage, upload, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.11.4';
var NOTE='V5.11.4 Settings Tabs: same Settings controls stay visible. Tabs jump to each area safely.';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function isSettings(){var m=main();var t=text(m).toLowerCase();return t.indexOf('settings')>-1&&t.indexOf('branding')>-1&&t.indexOf('homepage')>-1;}
function addStyle(){
  if(document.getElementById('sb5114Style'))return;
  var st=document.createElement('style');
  st.id='sb5114Style';
  st.textContent='\n.sb58Tabs,.sb58Tab{pointer-events:auto!important}.sb58Tabs{position:relative!important;z-index:2500!important}.sb58Tab{position:relative!important;z-index:2600!important}.sb5114KilledNote{display:none!important}.sb5114Anchor{outline:2px solid rgba(255,45,133,.42)!important;box-shadow:0 0 0 7px rgba(124,60,255,.15),0 22px 60px rgba(124,60,255,.22)!important}\n';
  document.head.appendChild(st);
}
function normalizeText(s){
  return String(s||'')
    .replace(/V5\.8\.5 Settings Tabs:[^\n]*/g,NOTE)
    .replace(/V5\.8\.3 Settings Tabs:[^\n]*/g,NOTE)
    .replace(/V5\.11\.3 Settings Tabs:[^\n]*/g,NOTE)
    .replace(/V4\.4\.3 Home \+ Saves note/g,'V5.11.4 Home + Saves note')
    .replace(/V5\.4\.2/g,VERSION)
    .replace(/V5\.6\.3/g,VERSION)
    .replace(/V5\.8\.5/g,VERSION)
    .replace(/V5\.11\.3/g,VERSION);
}
function walk(root){
  if(!root)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false);
  var nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(n){var old=n.nodeValue;var next=normalizeText(old);if(next!==old)n.nodeValue=next;});
}
function getTop(){var m=main();return m&&(m.querySelector('.top')||m.firstElementChild);}
function ensureNote(){
  var m=main(); if(!m)return;
  var wrap=m.querySelector('#sb58SettingsTabsWrap');
  if(!wrap){
    var top=getTop(); if(!top)return;
    wrap=document.createElement('div');
    wrap.id='sb58SettingsTabsWrap';
    wrap.innerHTML='<div class="sb58TabsNote">'+NOTE+'</div><div class="sb58Tabs" id="sb58SettingsTabs"></div>';
    top.insertAdjacentElement('afterend',wrap);
  }
  var note=wrap.querySelector('.sb58TabsNote');
  if(note)note.textContent=NOTE;
  var tabs=wrap.querySelector('#sb58SettingsTabs')||wrap.querySelector('.sb58Tabs');
  if(!tabs){tabs=document.createElement('div');tabs.className='sb58Tabs';tabs.id='sb58SettingsTabs';wrap.appendChild(tabs);}
  if(!tabs.querySelector('.sb58Tab')){
    ['overview','branding','homepage','storage'].forEach(function(k){
      var a=document.createElement('a');
      a.href='#sb58-'+k;
      a.dataset.tab=k;
      a.className='sb58Tab'+(k==='overview'?' active':'');
      a.textContent={overview:'Overview',branding:'Branding',homepage:'Homepage',storage:'Storage'}[k];
      tabs.appendChild(a);
    });
  }
}
function sections(){
  var m=main(); if(!m)return [];
  return Array.prototype.slice.call(m.children).filter(function(el){
    if(!el||el.nodeType!==1)return false;
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return false;
    if(el.classList.contains('top')||el.classList.contains('toast'))return false;
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
function findTarget(k){assignAnchors();return document.getElementById('sb58-'+k)||sections()[0]||null;}
function setActive(k){
  Array.prototype.slice.call(document.querySelectorAll('.sb58Tab')).forEach(function(a){a.classList.toggle('active',a.dataset.tab===k);});
}
function jump(k){
  k=k||'overview';
  setActive(k);
  var target=findTarget(k);
  if(target){
    target.classList.add('sb5114Anchor');
    try{target.scrollIntoView({behavior:'smooth',block:'start'});}catch(e){location.hash='sb58-'+k;}
    setTimeout(function(){target.classList.remove('sb5114Anchor');},1700);
  }
}
function cleanOldNotes(){
  var m=main(); if(!m)return;
  Array.prototype.slice.call(m.querySelectorAll('*')).forEach(function(el){
    if(el.id==='sb58SettingsTabsWrap'||el.closest('#sb58SettingsTabsWrap'))return;
    var t=text(el);
    if(/^V5\.8\.5 Settings Tabs:/.test(t)||/^V5\.8\.3 Settings Tabs:/.test(t)){el.classList.add('sb5114KilledNote');}
  });
}
function run(){
  if(!isSettings())return;
  addStyle();
  walk(main());
  ensureNote();
  assignAnchors();
  cleanOldNotes();
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
var mo=new MutationObserver(function(){setTimeout(run,90);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,500);
setTimeout(run,900);
})();
