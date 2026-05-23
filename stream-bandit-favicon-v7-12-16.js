(function(){
'use strict';
const VERSION='V7.12.16 Favicon Tab Icon Helper';
const PARTS=['https://xzxqfrvqdgkzwujbkdbk.supabase','.co/storage/v1/object/public/','stream-bandit-images/global/','logo-1779203548544.png'];
let appliedUrl='';
function logoUrl(){return PARTS.join('');}
function ensureLink(rel,sizes,url){
  let link=document.querySelector('link[rel="'+rel+'"][data-sb-favicon="true"]')||document.querySelector('link[rel="'+rel+'"]');
  if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link)}
  link.dataset.sbFavicon='true';
  if(sizes)link.sizes=sizes;
  link.href=url;
  return link;
}
function apply(url){
  appliedUrl=url||logoUrl();
  const busted=appliedUrl+(appliedUrl.includes('?')?'&':'?')+'sbFav='+Date.now();
  ensureLink('icon','32x32',busted);
  ensureLink('shortcut icon','32x32',busted);
  ensureLink('apple-touch-icon','180x180',busted);
  document.documentElement.dataset.streamBanditFavicon='loaded';
  document.dispatchEvent(new CustomEvent('streambandit:favicon-loaded',{detail:{version:VERSION,url:appliedUrl}}));
  return appliedUrl;
}
function refresh(){return apply(logoUrl());}
function init(){
  window.StreamBanditFavicon={version:VERSION,refresh,apply,getUrl:()=>appliedUrl||logoUrl()};
  refresh();
  setTimeout(refresh,600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
