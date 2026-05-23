(function(){
'use strict';
const VERSION='V7.12.12 Global Brand Logo Helper';
const PARTS=['https://xzxqfrvqdgkzwujbkdbk.supabase','.co/storage/v1/object/public/','stream-bandit-images/global/','logo-1779203548544.png'];
let currentUrl='';
function logoUrl(){return PARTS.join('');}
function apply(url){
  currentUrl=url||logoUrl();
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
  return currentUrl;
}
function refresh(){return apply(logoUrl());}
function init(){
  window.StreamBanditBrandLogo={version:VERSION,refresh,apply,getUrl:()=>currentUrl||logoUrl()};
  refresh();
  setTimeout(refresh,500);
  setTimeout(refresh,1600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
