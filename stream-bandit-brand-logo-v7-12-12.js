(function(){
'use strict';
const VERSION='V7.12.88 Global Brand Logo Helper + Browse Footers';
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
function isSupabaseLibraryPage(){
  return /supabase-library-home-header-form-fix-v7-12-34-test\.html$/i.test(location.pathname) || document.title.includes('Supabase Library Form Fix');
}
function isGenresPage(){
  return /genres-clean-machine-v7-12-45-test\.html$/i.test(location.pathname) || document.title.includes('Clean Genres');
}
function installFooter(config){
  if(!config || !config.enabled)return;
  if(document.getElementById('sbGlobalFooter'))return;
  const wrap=document.querySelector('.wrap')||document.body;
  document.querySelectorAll('p.footer').forEach(el=>{el.style.display='none';});
  if(!document.getElementById('sbGlobalFooterStyle')){
    const style=document.createElement('style');
    style.id='sbGlobalFooterStyle';
    style.textContent='#sbGlobalFooter{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:5!important;border:1px solid var(--line,#ffffff22);border-radius:28px;background:linear-gradient(135deg,var(--p,#101529),var(--p2,#17122d));box-shadow:0 20px 70px #0007;padding:22px;margin:18px 0 28px;color:#fff}.sb-global-footer-grid{display:grid;grid-template-columns:1.3fr repeat(3,minmax(180px,1fr));gap:12px}.sb-global-footer-col{border:1px solid #ffffff1a;border-radius:18px;background:#ffffff0f;padding:14px;overflow-wrap:anywhere}.sb-global-footer-col b{display:block;color:#baf7df;margin-bottom:8px}.sb-global-footer-col a{display:block;color:#baf7df;text-decoration:none;margin:7px 0;font-weight:850}.sb-global-footer-col small{color:#8f98b8}@media(max-width:980px){.sb-global-footer-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }
  const footer=document.createElement('section');
  footer.id='sbGlobalFooter';
  footer.setAttribute('aria-label','Stream Bandit Global Footer');
  footer.innerHTML='<div class="sb-global-footer-grid"><div class="sb-global-footer-col"><b>Stream Bandit</b><small>'+config.note+'</small></div><div class="sb-global-footer-col"><b>Watch</b><a href="home-global-helpers-v7-4-4-test.html">Home</a><a href="details-clean-machine-v7-12-38-test.html">Details</a><a href="player-one-global-helpers-v7-3-3-test.html">Player 1</a></div><div class="sb-global-footer-col"><b>Browse</b><a href="library-global-helpers-v7-4-8-test.html">Library</a><a href="global-search-global-helpers-v7-4-9-test.html">Search</a><a href="genres-clean-machine-v7-12-45-test.html">Genres</a></div><div class="sb-global-footer-col"><b>'+config.lastTitle+'</b>'+config.lastLinks+'</div></div>';
  wrap.appendChild(footer);
  document.documentElement.dataset.streamBanditGlobalFooter=config.key;
}
function currentFooterConfig(){
  if(isSupabaseLibraryPage()){
    return {enabled:true,key:'supabase-library-v7-12-87',note:'Supabase Library live-polish pass V7.12.87. Payments disabled until billing is designed.',lastTitle:'Admin',lastLinks:'<a href="supabase-library-home-header-form-fix-v7-12-34-test.html">Supabase Library</a><a href="review-queue-clean-machine-v7-12-55-test.html">Review Queue</a><a href="storage-prep-global-helpers-v7-10-8-test.html">Storage Prep</a>'};
  }
  if(isGenresPage()){
    return {enabled:true,key:'genres-v7-12-88',note:'Genres live-polish pass V7.12.88. Read-only genre browsing. Payments disabled until billing is designed.',lastTitle:'Browse More',lastLinks:'<a href="supabase-library-home-header-form-fix-v7-12-34-test.html">Supabase Library</a><a href="about-global-helpers-v7-4-7-test.html">About</a><a href="global-search-global-helpers-v7-4-9-test.html">Global Search</a>'};
  }
  return {enabled:false};
}
function refresh(){
  const url=safeApply(logoUrl());
  installFooter(currentFooterConfig());
  return url;
}
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