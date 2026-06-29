(function(){
'use strict';

const VERSION='V7.12.229 Global Brand Logo Helper / Soft Remove Social Actions Loader';
const DEFAULT_PARTS=['https://xzxqfrvqdgkzwujbkdbk.supabase','.co/storage/v1/object/public/','stream-bandit-images/global/','logo-1779203548544.png'];
const DEFAULT_LOGO=DEFAULT_PARTS.join('');
const SOCIAL_ACTIONS_SRC='stream-bandit-social-actions-v7-13-002.js?v=brand-loader-7-12-229-social-actions-7-13-007';
const SOCIAL_PAGES={
  'news-feed-social-v7-13-001-test.html':true,
  'profile-social-v7-13-001-test.html':true,
  'groups-social-v7-13-001-test.html':true,
  'friends-social-v7-13-001-test.html':true
};
let currentUrl='';
let lastReadState={source:'default',ok:false,error:'not read yet',at:null};
let sbClient=null;
let reading=false;

function defaultLogo(){return DEFAULT_LOGO;}
function currentFile(){return String(location.pathname||'').split('/').pop()||'index.html';}
function isSocialPage(){return !!SOCIAL_PAGES[currentFile()]||!!(document.body&&document.body.dataset&&(document.body.dataset.sbSocialFeedUrl||document.body.dataset.sbSocialProfileUrl||document.body.dataset.sbFriendsMenuUrl||document.body.dataset.sbGroupsUrl));}
function loadSocialActionsIfNeeded(){try{if(!isSocialPage())return;let base=SOCIAL_ACTIONS_SRC.split('?')[0];let wanted=SOCIAL_ACTIONS_SRC.split('?')[1]||'';if(Array.from(document.scripts||[]).some(s=>String(s.src||'').includes(base)&&String(s.src||'').includes(wanted)))return;let s=document.createElement('script');s.src=SOCIAL_ACTIONS_SRC;s.defer=true;s.dataset.sbLoadedBy='brand-logo-helper-v7-12-229';document.head.appendChild(s);document.documentElement.dataset.sbSocialActionsLoader='brand-logo-v7-12-229';}catch(e){}}
function cleanupLegacyFooter(){try{document.querySelectorAll('#sbGlobalFooter,#sbGlobalFooterStyle').forEach(el=>el.remove());document.documentElement.removeAttribute('data-stream-bandit-global-footer');document.documentElement.removeAttribute('data-streambanditglobalfooter');}catch(e){}}
function safeApply(url,source){currentUrl=String(url||DEFAULT_LOGO).trim()||DEFAULT_LOGO;try{document.querySelectorAll('[data-sb-brand-logo]').forEach(el=>{if(el.tagName&&el.tagName.toLowerCase()==='img'){el.src=currentUrl;if(!el.alt)el.alt='Stream Bandit brand logo';}else{el.innerHTML='<img alt="Stream Bandit brand logo" src="'+currentUrl+'">';}});document.querySelectorAll('[data-sb-brand-logo-bg]').forEach(el=>{el.style.backgroundImage='url("'+currentUrl.replace(/"/g,'%22')+'")';el.style.backgroundSize=el.dataset.sbBrandLogoFit||'cover';el.style.backgroundPosition=el.dataset.sbBrandLogoPosition||'center';el.style.backgroundRepeat='no-repeat';});cleanupLegacyFooter();loadSocialActionsIfNeeded();document.documentElement.dataset.streamBanditBrandLogo='loaded';document.dispatchEvent(new CustomEvent('streambandit:brand-logo-loaded',{detail:{version:VERSION,url:currentUrl,source:source||lastReadState.source,legacyFooters:false,socialActionsLoader:isSocialPage()}}));}catch(e){document.documentElement.dataset.streamBanditBrandLogo='waiting';}
return currentUrl;}
function cfg(){try{let c=window.StreamBanditSupabaseConfig||(window.StreamBanditShell&&window.StreamBanditShell.config&&window.StreamBanditShell.config());if(c&&c.url&&c.key)return c;}catch(e){}return null;}
function loadSdk(){return new Promise((resolve,reject)=>{if(window.supabase)return resolve(window.supabase);let old=document.querySelector('script[src*="@supabase/supabase-js"]');if(old){let tries=0,t=setInterval(()=>{tries++;if(window.supabase){clearInterval(t);resolve(window.supabase);}else if(tries>40){clearInterval(t);reject(new Error('Supabase SDK not ready'));}},100);return;}let s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=()=>resolve(window.supabase);s.onerror=()=>reject(new Error('Supabase SDK failed'));document.head.appendChild(s);});}
async function client(){if(sbClient)return sbClient;await loadSdk();let c=cfg();if(!c||!c.url||!c.key)throw new Error('Supabase config unavailable from shell');sbClient=window.supabase.createClient(c.url,c.key);return sbClient;}
function pickLogo(settings){settings=settings||{};return settings.logoUrl||settings.logo_url||settings.globalLogoUrl||settings.global_logo_url||settings.logo||settings.appLogo||settings.app_logo||'';}
async function readSavedLogo(){if(reading)return currentUrl||DEFAULT_LOGO;reading=true;try{let c=await client();let res=await c.from('sb_app_settings').select('settings,updated_at').eq('id','stream_bandit').maybeSingle();if(res.error)throw res.error;let url=pickLogo(res.data&&res.data.settings);if(url){lastReadState={source:'sb_app_settings.logoUrl',ok:true,error:'',at:new Date().toISOString(),updated_at:res.data&&res.data.updated_at||null};safeApply(url,'sb_app_settings.logoUrl');return url;}lastReadState={source:'sb_app_settings',ok:false,error:'no logo field found',at:new Date().toISOString()};return safeApply(DEFAULT_LOGO,'default');}catch(e){lastReadState={source:'default',ok:false,error:e&&e.message?e.message:String(e),at:new Date().toISOString()};return safeApply(currentUrl||DEFAULT_LOGO,'default');}finally{reading=false;}}
function refresh(){cleanupLegacyFooter();loadSocialActionsIfNeeded();safeApply(currentUrl||DEFAULT_LOGO,'initial');readSavedLogo();return currentUrl||DEFAULT_LOGO;}
function install(){window.StreamBanditBrandLogo={version:VERSION,refresh,readSavedLogo,apply:safeApply,cleanupLegacyFooter,getUrl:()=>currentUrl||DEFAULT_LOGO,defaultUrl:()=>DEFAULT_LOGO,state:()=>({version:VERSION,url:currentUrl||DEFAULT_LOGO,defaultUrl:DEFAULT_LOGO,lastRead:lastReadState,legacyFooters:false,socialActionsLoader:isSocialPage()}),legacyFooters:false};refresh();}
install();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refresh);else refresh();
setTimeout(refresh,80);setTimeout(refresh,500);setTimeout(refresh,1600);setTimeout(refresh,3000);setInterval(refresh,12000);
})();
