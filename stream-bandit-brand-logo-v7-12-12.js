(function(){
'use strict';

const VERSION='V7.12.160 Global Brand Logo Helper / Logo Only';
const PARTS=['https://xzxqfrvqdgkzwujbkdbk.supabase','.co/storage/v1/object/public/','stream-bandit-images/global/','logo-1779203548544.png'];
let currentUrl='';

function logoUrl(){
  return PARTS.join('');
}

function cleanupLegacyFooter(){
  try{
    document.querySelectorAll('#sbGlobalFooter,#sbGlobalFooterStyle').forEach(el=>el.remove());
    document.documentElement.removeAttribute('data-stream-bandit-global-footer');
    document.documentElement.removeAttribute('data-streambanditglobalfooter');
  }catch(e){}
}

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

    cleanupLegacyFooter();

    document.documentElement.dataset.streamBanditBrandLogo='loaded';
    document.dispatchEvent(new CustomEvent('streambandit:brand-logo-loaded',{detail:{version:VERSION,url:currentUrl,legacyFooters:false}}));
  }catch(e){
    document.documentElement.dataset.streamBanditBrandLogo='waiting';
  }

  return currentUrl;
}

function refresh(){
  cleanupLegacyFooter();
  return safeApply(logoUrl());
}

function install(){
  window.StreamBanditBrandLogo={
    version:VERSION,
    refresh,
    apply:safeApply,
    cleanupLegacyFooter,
    getUrl:()=>currentUrl||logoUrl(),
    legacyFooters:false
  };
  refresh();
}

install();

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);
else refresh();

setTimeout(refresh,80);
setTimeout(refresh,500);
setTimeout(refresh,1600);
setTimeout(refresh,3000);

})();