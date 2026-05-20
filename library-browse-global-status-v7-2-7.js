(function(){
'use strict';
function byId(id){return document.getElementById(id)}
function card(title,text){return '<div class="card"><b>'+title+'</b><p>'+text+'</p></div>'}
function insert(){
  if(byId('sbLibraryGlobalStatus'))return;
  var target=document.querySelector('.hero')||document.querySelector('.box')||document.body;
  var sec=document.createElement('section');
  sec.id='sbLibraryGlobalStatus';
  sec.className='box';
  sec.innerHTML='<h2>Global helper status</h2><div class="grid" id="sbLibraryGlobalGrid">'+card('Account sync','Checking...')+card('Avatar helper','Checking...')+card('Shared style','Checking...')+card('Settings bridge','Checking...')+'</div><div class="note"><b>Known Supabase Library warning:</b> overlay/form save can fail when editing more than one field or entry at a time. This V7.2.7 pass does not touch that write logic. Separate Supabase Library Form Save Repair needed later.</div>';
  if(target&&target.parentNode)target.parentNode.insertBefore(sec,target.nextSibling);else document.body.prepend(sec);
}
function update(){
  insert();
  var grid=byId('sbLibraryGlobalGrid');
  if(!grid)return;
  var bridge='Not loaded';
  try{if(window.StreamBanditSettingsGlobal){var st=window.StreamBanditSettingsGlobal.getState&&window.StreamBanditSettingsGlobal.getState();bridge='Loaded safely: '+(st&&st.source?st.source:'ready')}}catch(e){bridge='Bridge error: '+(e.message||e)}
  grid.innerHTML=card('Account sync',window.StreamBanditAuthSync?'Loaded':'Not loaded')+card('Avatar helper',window.StreamBanditAuthAvatar?'Loaded':'Not loaded')+card('Shared style',window.StreamBanditSharedStyle?'Loaded':'Not loaded')+card('Settings bridge',bridge);
  try{if(window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh)window.StreamBanditShellAuth.refresh()}catch(e){}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(update,900);setTimeout(update,1800)});else{setTimeout(update,900);setTimeout(update,1800)}
})();