(function(){
'use strict';
function byId(id){return document.getElementById(id)}
function card(title,text){return '<div class="card"><b>'+title+'</b><p>'+text+'</p></div>'}
function update(){
  var grid=byId('sbLibraryGlobalGrid');
  if(!grid)return;
  var bridge='Not loaded';
  try{
    if(window.StreamBanditSettingsGlobal){
      var st=window.StreamBanditSettingsGlobal.getState&&window.StreamBanditSettingsGlobal.getState();
      bridge='Loaded safely: '+(st&&st.source?st.source:'ready');
    }
  }catch(e){bridge='Bridge error: '+(e.message||e)}
  grid.innerHTML=card('Account sync',window.StreamBanditAuthSync?'Loaded':'Not loaded')+card('Avatar helper',window.StreamBanditAuthAvatar?'Loaded':'Not loaded')+card('Shared style',window.StreamBanditSharedStyle?'Loaded':'Not loaded')+card('Settings bridge',bridge);
  try{
    if(window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh)window.StreamBanditShellAuth.refresh();
  }catch(e){}
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',function(){setTimeout(update,900);setTimeout(update,1800);setTimeout(update,3000)});
}else{
  setTimeout(update,900);setTimeout(update,1800);setTimeout(update,3000);
}
})();