/* Stream Bandit V5.6.2 — Sidebar Logo From Settings
   Visual sync only. Reads the existing browser Settings logo/app name/tagline and applies it to the sidebar brand area.
   No Supabase, Mux, player, menu routing, storage upload, or database logic changes. */
(function(){
'use strict';

var VERSION='V5.6.2';
var KEY='streambandit_v25_data';
var lastSig='';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function readSettings(){
  try{
    var raw=localStorage.getItem(KEY);
    if(!raw)return null;
    var data=JSON.parse(raw);
    return data&&data.settings?data.settings:null;
  }catch(e){return null;}
}
function safeUrl(u){
  u=String(u||'').trim();
  if(!u)return '';
  if(u.indexOf('data:image/')===0)return u;
  if(/^https?:\/\//i.test(u))return u;
  if(/^blob:/i.test(u))return u;
  return '';
}
function addStyle(){
  if(document.getElementById('sb562Style'))return;
  var st=document.createElement('style');
  st.id='sb562Style';
  st.textContent='\n.side .brand .logo{background:linear-gradient(135deg,rgba(255,45,85,.22),rgba(124,60,255,.24));border:1px solid rgba(255,255,255,.12);box-shadow:0 12px 32px rgba(0,0,0,.32)}.side .brand .logo img{width:100%;height:100%;object-fit:cover;border-radius:inherit;display:block}.sb562LogoNote{font-size:11px;color:var(--muted,#a9afc3);line-height:1.3;margin:-2px 0 8px}\n';
  document.head.appendChild(st);
}
function applyLogo(){
  addStyle();
  var side=document.querySelector('.side');
  var brand=side&&side.querySelector('.brand');
  if(!side||!brand)return;
  var settings=readSettings()||{};
  var logoUrl=safeUrl(settings.logo||settings.logoUrl||settings.appLogo||'');
  var appName=String(settings.appName||'Stream Bandit').trim();
  var tagline=String(settings.tagline||'Chatterfriends Movies').trim();
  var sig=[logoUrl,appName,tagline].join('|');
  if(sig===lastSig&&brand.dataset.sb562Applied==='1')return;
  lastSig=sig;
  brand.dataset.sb562Applied='1';

  var logo=brand.querySelector('.logo');
  if(logo&&logoUrl){
    logo.innerHTML='<img alt="'+appName.replace(/[&<>\"]/g,'')+' logo" src="'+logoUrl.replace(/"/g,'%22')+'">';
    logo.dataset.sb562Source='settings';
  }

  var h=brand.querySelector('h1');
  if(h&&appName)h.textContent=appName;
  var p=brand.querySelector('p');
  if(p&&tagline)p.textContent=tagline;
}
function run(){applyLogo();}
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,500);});
window.addEventListener('storage',run);
setInterval(run,1300);
setTimeout(function(){run();try{var t=document.createElement('div');t.className='toast';t.textContent=VERSION+' logo sync loaded';document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}catch(e){}},900);
})();
