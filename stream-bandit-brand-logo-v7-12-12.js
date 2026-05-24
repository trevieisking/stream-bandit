(function(){
'use strict';
const VERSION='V7.12.52 Global Brand Logo Helper Runtime Fix';
const PARTS=['https://xzxqfrvqdgkzwujbkdbk.supabase','.co/storage/v1/object/public/','stream-bandit-images/global/','logo-1779203548544.png'];
let currentUrl='';
function logoUrl(){return PARTS.join('');}
function safeApply(url){
  currentUrl=url||logoUrl();
  try{
    document.querySelectorAll('[data-sb-brand-logo]').forEach(el=>{
      if(el.tagName&&el.tagName.toLowerCase()==='img'){
        el.src=currentUrl;
        if(!el.alt)el.alt='Stream Bandit brand logo';
      }else{
        el.innerHTML='<img alt="Stream Bandit brand logo" src="'+currentUrl+'">';
      }
    });
    document.querySelectorAll('[data-sb-brand-logo-bg]').forEach(el=>{
      el.style.backgroundImage='url("'+currentUrl+'")';
      el.style.backgroundSize='cover';
      el.style.backgroundPosition='center';
      el.style.backgroundRepeat='no-repeat';
    });
    document.documentElement.dataset.streamBanditBrandLogo='loaded';
    document.dispatchEvent(new CustomEvent('streambandit:brand-logo-loaded',{detail:{version:VERSION,url:currentUrl}}));
  }catch(e){
    document.documentElement.dataset.streamBanditBrandLogo='waiting';
  }
  return currentUrl;
}
function refresh(){return safeApply(logoUrl());}
function install(){
  window.StreamBanditBrandLogo={version:VERSION,refresh,apply:safeApply,getUrl:()=>currentUrl||logoUrl()};
  refresh();
}
install();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
setTimeout(refresh,80);
setTimeout(refresh,500);
setTimeout(refresh,1600);
setTimeout(refresh,3000);
})();