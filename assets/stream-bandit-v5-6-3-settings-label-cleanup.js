/* Stream Bandit V5.6.3 — Settings Label Cleanup
   Visual text cleanup for the Settings page only.
   No Supabase saves, Mux, player, storage upload, logo upload, database or menu routing changes. */
(function(){
'use strict';

var VERSION='V5.6.3';
var CLEAN_TITLE='V5.6.3 Stable Settings + Branding';
var CLEAN_SHORT='V5.6.3 Stable';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function isSettingsPage(){
  var h=text(document.querySelector('.top h2,.main h1,.main h2,h1,h2')).toLowerCase();
  return h.indexOf('settings')>-1;
}
function replaceTextNode(node){
  if(!node||node.nodeType!==3)return;
  var old=node.nodeValue;
  if(!old)return;
  var next=old
    .replace(/V5\.4\.2 Details Tag Display Hotfix \+ Page Polish/g,CLEAN_TITLE)
    .replace(/StreamBanditPrototypev5\.4\.2-details-tag-display-hotfix-page-polish/g,'StreamBanditPrototypev5.6.3-stable-settings-branding')
    .replace(/V5\.4\.2 Details Tag Display Hotfix/g,CLEAN_SHORT)
    .replace(/V5\.4\.2/g,'V5.6.3');
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
  var main=document.querySelector('.main');
  if(!main||main.querySelector('.sb563SettingsBadge'))return;
  var top=main.querySelector('.top')||main.firstElementChild;
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
function cleanSettingsLocalLabel(){
  try{
    var key='streambandit_v25_data';
    var raw=localStorage.getItem(key);
    if(!raw)return;
    var next=raw
      .replace(/V5\.4\.2 Details Tag Display Hotfix \+ Page Polish/g,CLEAN_TITLE)
      .replace(/StreamBanditPrototypev5\.4\.2-details-tag-display-hotfix-page-polish/g,'StreamBanditPrototypev5.6.3-stable-settings-branding')
      .replace(/V5\.4\.2/g,'V5.6.3');
    if(next!==raw)localStorage.setItem(key,next);
  }catch(e){}
}
function run(){
  addStyle();
  cleanSettingsLocalLabel();
  if(!isSettingsPage())return;
  var main=document.querySelector('.main');
  walkText(main);
  addSettingsBadge();
  document.title='Stream Bandit '+VERSION+' Settings';
}
cleanSettingsLocalLabel();
var mo=new MutationObserver(function(){setTimeout(run,160);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1300);
setTimeout(function(){run();try{var t=document.createElement('div');t.className='toast';t.textContent=VERSION+' settings labels cleaned';document.body.appendChild(t);setTimeout(function(){t.remove()},2400)}catch(e){}},900);
})();
