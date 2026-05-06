/* Stream Bandit V5.6.3C — Settings Label Cleanup
   Visual text cleanup for the Settings page only.
   Version title/badge is controlled by the main cleanup script as one source of truth.
   No Supabase saves, Mux, player, storage upload, logo upload, database or menu routing changes. */
(function(){
'use strict';

var VERSION='V5.6.3';
var CLEAN_TITLE='V5.6.3 Stable Settings + Branding';
var CLEAN_SHORT='V5.6.3 Stable';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function isSettingsPage(){
  var m=main();
  var mt=text(m).toLowerCase();
  return mt.indexOf('settings')>-1&&mt.indexOf('branding')>-1;
}
function replaceOldText(s){
  return String(s||'')
    .replace(/V5\.4\.2 Details Tag Display Hotfix \+ Page Polish/g,CLEAN_TITLE)
    .replace(/StreamBanditPrototypev5\.4\.2-details-tag-display-hotfix-page-polish/g,'StreamBanditPrototypev5.6.3-stable-settings-branding')
    .replace(/V5\.4\.2 Details Tag Display Hotfix/g,CLEAN_SHORT)
    .replace(/V5\.6\.1 Stable checkpoint/g,'V5.6.3 Stable checkpoint')
    .replace(/V5\.4\.2/g,'V5.6.3');
}
function replaceTextNode(node){
  if(!node||node.nodeType!==3)return;
  var old=node.nodeValue;
  var next=replaceOldText(old);
  if(next!==old)node.nodeValue=next;
}
function walkText(root){
  if(!root)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false);
  var nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(replaceTextNode);
}
function addSettingsBadge(){
  if(!isSettingsPage())return;
  var m=main();
  if(!m)return;
  var existing=m.querySelector('.sb563SettingsBadge');
  if(existing){
    var b=existing.querySelector('b');
    if(b)b.textContent=CLEAN_TITLE;
    return;
  }
  var top=m.querySelector('.top')||m.firstElementChild;
  if(!top)return;
  var badge=document.createElement('div');
  badge.className='sb563SettingsBadge';
  badge.innerHTML='<b>'+CLEAN_TITLE+'</b><span>Settings labels cleaned. Existing branding, logo upload and save buttons are unchanged.</span>';
  top.insertAdjacentElement('afterend',badge);
}
function addStyle(){
  if(document.getElementById('sb563Style'))return;
  var st=document.createElement('style');
  st.id='sb563Style';
  st.textContent='\n.sb563SettingsBadge{background:linear-gradient(180deg,rgba(18,59,43,.35),rgba(13,14,21,.88));border:1px solid rgba(61,220,151,.28);border-radius:22px;padding:13px;margin:12px 0;box-shadow:0 14px 36px rgba(0,0,0,.28)}.sb563SettingsBadge b{display:block;color:#f6f7ff;font-size:16px;margin-bottom:5px}.sb563SettingsBadge span{display:block;color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}\n';
  document.head.appendChild(st);
}
function cleanLocalLabels(){
  try{
    for(var i=0;i<localStorage.length;i++){
      var key=localStorage.key(i);
      var raw=localStorage.getItem(key);
      if(!raw)continue;
      if(raw.indexOf('V5.4.2')<0&&raw.indexOf('details-tag-display-hotfix')<0&&raw.indexOf('V5.6.1 Stable checkpoint')<0)continue;
      var next=replaceOldText(raw);
      if(next!==raw)localStorage.setItem(key,next);
    }
  }catch(e){}
}
function run(){
  addStyle();
  cleanLocalLabels();
  if(!isSettingsPage())return;
  walkText(main());
  addSettingsBadge();
}
cleanLocalLabels();
var mo=new MutationObserver(function(){setTimeout(run,160);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1000);
setTimeout(function(){run();try{var t=document.createElement('div');t.className='toast';t.textContent=VERSION+' settings labels cleaned';document.body.appendChild(t);setTimeout(function(){t.remove()},2400)}catch(e){}},900);
})();
