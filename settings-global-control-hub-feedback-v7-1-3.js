(function(){
'use strict';
function $(id){return document.getElementById(id)}
function say(text){const s=$('statusBox');if(s)s.textContent=text}
function patch(){
  const oldChecks=window.settingsHubRunChecks;
  function runChecks(note){
    const debug=$('debugOut');
    const rows=$('helperRows');
    const d=document.documentElement.dataset;
    const st={
      authShell:d.streamBanditAuthShell||'',auth:d.streamBanditAuth||'',role:d.streamBanditRole||'',
      sharedStyle:!!window.StreamBanditSharedStyle,authSync:!!window.StreamBanditAuthSync,avatar:!!window.StreamBanditAuthAvatar,
      profileShell:!!window.StreamBanditShellAuth,menuCount:!!window.StreamBanditMenuSavesCount,
      searchInput:!!$('globalSearch'),searchButton:!!$('globalSearchBtn'),brandAvatar:!!document.querySelector('.brand img,.logo img'),
      lastAction:note||'Global checks refreshed.'
    };
    function row(n,ok,t){return '<div class="row"><b>'+n+'</b><span>'+t+'</span><span class="pill '+(ok?'':'warn')+'">'+(ok?'Active':'Check')+'</span></div>'}
    if(rows)rows.innerHTML=row('Shared style helper',st.sharedStyle,'Loads shared style from sb_app_settings.')+row('Auth/profile shell',st.profileShell,'Reads Supabase Auth and sb_profiles.')+row('Auth sync helper',st.authSync,'Keeps page/header account state in sync.')+row('Avatar helper',st.avatar,'Updates the top-left account/avatar image.')+row('Menu saves/count helper',st.menuCount,'Shared count/helper script is loaded.')+row('Search shell',st.searchInput&&st.searchButton,'Search input and button are present.')+row('Brand avatar visible',st.brandAvatar,'Profile image is visible where available.');
    if(debug)debug.textContent=JSON.stringify(st,null,2);
    say(note||'Global checks complete. Settings is a hub, not a duplicate editor.');
  }
  async function reloadTheme(){
    try{
      say('Reloading shared theme...');
      if(window.StreamBanditSharedStyle&&window.StreamBanditSharedStyle.load){await window.StreamBanditSharedStyle.load();runChecks('Shared theme reloaded, then global checks refreshed.');}
      else runChecks('Shared style helper not found. Checks refreshed.');
    }catch(e){say('Theme reload failed: '+(e.message||e));}
  }
  async function syncHeader(){
    try{
      say('Syncing account/header...');
      if(window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh){await window.StreamBanditShellAuth.refresh();runChecks('Account/header sync refreshed, then global checks refreshed.');}
      else if(window.StreamBanditAuthAvatar&&window.StreamBanditAuthAvatar.load){await window.StreamBanditAuthAvatar.load();runChecks('Avatar helper refreshed, then global checks refreshed.');}
      else runChecks('No account sync helper found. Checks refreshed.');
    }catch(e){say('Sync failed: '+(e.message||e));}
  }
  ['runChecks','runChecks2'].forEach(id=>{if($(id))$(id).onclick=()=>runChecks('Global checks complete. Settings is a hub, not a duplicate editor.')});
  ['reloadTheme','reloadTheme2'].forEach(id=>{if($(id))$(id).onclick=reloadTheme});
  ['syncHeader','syncHeader2'].forEach(id=>{if($(id))$(id).onclick=syncHeader});
  setTimeout(()=>runChecks('V7.1.3 ready. Global helper checks refreshed.'),450);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch);else setTimeout(patch,300);
})();