/* Stream Bandit V5.11 — Old Version Label Cleanup
   Visual/local label cleanup only. Replaces haunted old version text after render and in browser app data.
   No Supabase writes, Mux, player, storage, upload, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.11';
var LABEL='Stream Bandit V5.11 Stable';
var LOCAL_KEYS=['streambandit_v25_data'];
var oldPatterns=[
  [/V5\.4\.2 Details Tag Display Hotfix \+ Page Polish/g,'V5.11 Stable Manager + Tabs'],
  [/Details Tag Display Hotfix \+ Page Polish/g,'Stable Manager + Tabs'],
  [/V5\.6\.3 Stable Settings \+ Branding/g,'V5.11 Stable Settings + Tabs'],
  [/V5\.6\.3 stable checkpoint/gi,'V5.11 stable checkpoint'],
  [/V5\.7\.1 Stable checkpoint/g,'V5.11 Stable checkpoint'],
  [/V5\.8 Stable checkpoint/g,'V5.11 Stable checkpoint'],
  [/V5\.8\.2 Stable checkpoint/g,'V5.11 Stable checkpoint'],
  [/V5\.4\.2/g,'V5.11'],
  [/V5\.6\.1/g,'V5.11'],
  [/V5\.6\.3/g,'V5.11'],
  [/V5\.7\.1/g,'V5.11'],
  [/V5\.8\.2/g,'V5.11']
];
function replaceOld(s){
  var next=String(s||'');
  oldPatterns.forEach(function(pair){next=next.replace(pair[0],pair[1]);});
  return next;
}
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function cleanLocalStorage(){
  try{
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      if(!key)continue;
      var raw=localStorage.getItem(key);
      if(!raw)continue;
      if(!/(V5\.4\.2|V5\.6\.1|V5\.6\.3|V5\.7\.1|V5\.8\.2|Details Tag Display Hotfix)/.test(raw))continue;
      var next=replaceOld(raw);
      if(next!==raw)localStorage.setItem(key,next);
    }
  }catch(e){}
}
function cleanTextNodes(root){
  if(!root)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false);
  var nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(n){
    var old=n.nodeValue;
    var next=replaceOld(old);
    if(next!==old)n.nodeValue=next;
  });
}
function cleanBadges(){
  var side=document.querySelector('.side');
  if(side){
    Array.prototype.slice.call(side.querySelectorAll('.sb561StableBadge')).forEach(function(el){
      el.innerHTML='<span class="sb561StableDot"></span><span>'+VERSION+' Stable checkpoint</span>';
    });
  }
  Array.prototype.slice.call(document.querySelectorAll('.sb561Checkpoint h4')).forEach(function(h){
    h.textContent=VERSION+' stable checkpoint';
  });
  Array.prototype.slice.call(document.querySelectorAll('.sb58TabsNote')).forEach(function(n){
    n.textContent='V5.11 Settings Tabs: same Settings controls stay visible. Tabs jump to each area safely.';
  });
  Array.prototype.slice.call(document.querySelectorAll('.sb59TabsNote')).forEach(function(n){
    n.textContent='V5.11 Supabase Manager Tabs: same manager controls stay visible. Tabs jump to each area safely.';
  });
  Array.prototype.slice.call(document.querySelectorAll('.sb510ManagerIntro')).forEach(function(n){
    n.innerHTML='<b>V5.11 Manager polish:</b> the same Supabase manager controls are labelled and easier to navigate. Tabs scroll to sections; nothing is hidden or saved automatically.<div class="sb510Tiny">Safe visual layer only — movie rows, update buttons, Mux helper, image uploads and Cast & Crew saves are unchanged.</div>';
  });
}
function addStyle(){
  if(document.getElementById('sb511Style'))return;
  var st=document.createElement('style');
  st.id='sb511Style';
  st.textContent='\n.sb511CleanNote{display:none!important}\n';
  document.head.appendChild(st);
}
function run(){
  cleanLocalStorage();
  addStyle();
  cleanTextNodes(document.querySelector('.main'));
  cleanTextNodes(document.querySelector('.side'));
  cleanBadges();
  document.title=LABEL;
}
cleanLocalStorage();
var mo=new MutationObserver(function(){setTimeout(run,150);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1200);
setTimeout(function(){run();try{var t=document.createElement('div');t.className='toast';t.textContent=LABEL+' labels cleaned';document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}catch(e){}},1000);
})();
