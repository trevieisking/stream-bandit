/* Stream Bandit V6.72.1 Menu Saves Count Add-on
   V7.12.274 owner visibility fix: owner-only menu/header links stay hidden unless the live profile is platform owner.
   Keeps save counts working without touching the passed header/footer/theme shells. */
(function(){
'use strict';
const VERSION='V6.72.1 Menu Saves Count / V7.12.274 Owner Menu Visibility Fix';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const TARGETS=[
  {key:'watchlist',label:'Watchlist',href:'watchlist-watch-shell-v6-37-test.html',table:'sb_watchlist'},
  {key:'favourites',label:'Favourites',href:'favourites-watch-shell-v6-38-test.html',table:'sb_favourites'},
  {key:'likes',legacyKey:'liked',label:'Likes',href:'liked-watch-shell-v6-39-test.html',table:'sb_likes'}
];
const OWNER_LINKS=[
  'all-pages-version-registry-v7-12-122-current-routes-test.html',
  'web-builder-form-submissions-v7-12-94-test.html',
  'web-builder-form-save-v7-12-94-test.html',
  'stream-bandit-one-machine-v7-12-73-test.html',
  'stream-bandit-global-helper-shell-v7-12-126-test.html',
  'settings-brand-icons-promoted-v7-12-21-test.html',
  'brand-logo-helper-responsive-v7-12-20-test.html',
  'favicon-app-icon-builder-v7-12-15-test.html',
  'web-builder-pages-manager-v7-12-111-test.html',
  'web-builder-shared-style-preview-v7-12-117-test.html',
  'user-management-dashboard-v7-11-2-test.html',
  'permissions-matrix-user-management-v7-11-4-test.html'
];
let sb=null,user=null,profile=null,isOwner=false,lastCounts={watchlist:0,favourites:0,likes:0,liked:0};
function ensureStyle(){if(document.getElementById('sbMenuSavesCountStyle'))return;const s=document.createElement('style');s.id='sbMenuSavesCountStyle';let ownerRules=OWNER_LINKS.map(h=>'html:not(.sb-owner-menu-visible) a[href*="'+h+'"]{display:none!important}').join('');s.textContent='.sb-menu-save-count{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:#22d3a62b;border:1px solid #22d3a66b;color:#dfffee;font-size:12px;font-weight:950}.sb-menu-save-count.signed-out{background:#ffffff16;border-color:#ffffff24;color:#b9c0d8}.sb-menu-save-count.error{background:#ff4d6d22;border-color:#ff4d6d66;color:#ffc4cf}.sb-menu-count-note{font-size:11px;color:#b9c0d8;margin:8px 2px 0}'+ownerRules;document.head.appendChild(s)}
function findDrawer(){return document.getElementById('sbShellDrawer')||document.getElementById('sbMenuDrawer')}
function fileOf(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0]}
function isOwnerHref(href){return OWNER_LINKS.indexOf(fileOf(href))>-1}
function ownerSection(section){if(!section)return false;let h=(section.querySelector('h3')||{}).textContent||'';if(/\bOwner\b/i.test(h))return true;return !!section.querySelector('a[href*="stream-bandit-one-machine-v7-12-73-test.html"],a[href*="web-builder-form-submissions-v7-12-94-test.html"],a[href*="user-management-dashboard-v7-11-2-test.html"],a[href*="permissions-matrix-user-management-v7-11-4-test.html"]')}
function applyOwnerVisibility(){ensureStyle();document.documentElement.classList.toggle('sb-owner-menu-visible',!!isOwner);document.documentElement.dataset.sbOwnerMenuVisibility=isOwner?'owner-visible':'owner-hidden';document.querySelectorAll('a[href]').forEach(a=>{if(isOwnerHref(a.getAttribute('href')))a.style.display=isOwner?'':'none'});document.querySelectorAll('#sbShellDrawer .sb-shell-group,#sbMenuDrawer .sb-menu-group').forEach(section=>{if(ownerSection(section))section.style.display=isOwner?'':'none'});}
function findLink(href){const drawer=findDrawer();if(!drawer)return null;return Array.from(drawer.querySelectorAll('a.sb-shell-link,a.sb-menu-link,a[href]')).find(a=>(a.getAttribute('href')||'').includes(href))||null}
function setBadge(target,value,mode){const a=findLink(target.href);if(!a)return false;let badge=a.querySelector('[data-save-count="'+target.key+'"],[data-save-count="'+(target.legacyKey||target.key)+'"]');if(!badge){badge=document.createElement('span');badge.dataset.saveCount=target.key;badge.className='sb-menu-save-count';a.appendChild(badge)}badge.dataset.saveCount=target.key;badge.className='sb-menu-save-count '+(mode||'');badge.textContent=String(value);badge.title=VERSION+' - '+target.label+' count';return true}
function setHeaderBadge(key,value){const names=key==='likes'?['likes','liked']:[key];names.forEach(name=>{document.querySelectorAll('[data-sb-count="'+name+'"]').forEach(el=>{el.textContent=String(value);let a=el.closest&&el.closest('.sb-h-ico');if(a)a.classList.toggle('has-count',Number(value)>0);});});}
function setAll(value,mode){TARGETS.forEach(t=>{setBadge(t,value,mode);lastCounts[t.key]=Number(value)||0;if(t.legacyKey)lastCounts[t.legacyKey]=Number(value)||0;setHeaderBadge(t.key,Number(value)||0);})}
function addDrawerNote(){const drawer=findDrawer();if(!drawer||drawer.querySelector('#sbMenuCountNote'))return;const filter=drawer.querySelector('.sb-shell-filter,.sb-menu-filter');if(!filter)return;const n=document.createElement('div');n.id='sbMenuCountNote';n.className='sb-menu-count-note';n.textContent='Save counts: Watchlist / Favourites / Likes read-only.';filter.insertAdjacentElement('afterend',n)}
async function initClient(){if(!window.supabase)throw new Error('Supabase SDK unavailable');if(!sb)sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await sb.auth.getUser();user=r&&r.data&&r.data.user?r.data.user:null;return user}
async function readOwnerProfile(){try{if(!sb)await initClient();if(!user){profile=null;isOwner=false;applyOwnerVisibility();return false}let r=await sb.from('sb_profiles').select('id,role,admin_level,plan_key,account_status').eq('id',user.id).maybeSingle();profile=r&&r.data?r.data:null;isOwner=!!(profile&&(profile.admin_level==='owner'||profile.plan_key==='platform_owner'));applyOwnerVisibility();return isOwner}catch(e){profile=null;isOwner=false;applyOwnerVisibility();return false}}
async function readCount(t){const r=await sb.from(t.table).select('movie_id',{count:'exact',head:true}).eq('user_id',user.id);if(r.error)throw r.error;return r.count||0}
async function refreshCounts(){try{ensureStyle();addDrawerNote();applyOwnerVisibility();if(!sb)await initClient();await readOwnerProfile();if(!user){setAll(0,'signed-out');window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts',{detail:{signedIn:false,owner:isOwner,counts:Object.assign({},lastCounts)}}));return}for(const t of TARGETS){const count=await readCount(t);lastCounts[t.key]=count;if(t.legacyKey)lastCounts[t.legacyKey]=count;setBadge(t,count,'');setHeaderBadge(t.key,count)}window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts',{detail:{signedIn:true,owner:isOwner,counts:Object.assign({},lastCounts)}}));}catch(e){applyOwnerVisibility();TARGETS.forEach(t=>setBadge(t,'!','error'));window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts-error',{detail:{message:e&&e.message?e.message:String(e)}}));}}
function waitForDrawerThenRefresh(){let tries=0;const timer=setInterval(()=>{tries++;applyOwnerVisibility();if(findDrawer()){clearInterval(timer);refreshCounts()}else if(tries>40){clearInterval(timer)}},150)}
function observeMenus(){try{new MutationObserver(()=>applyOwnerVisibility()).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}}
function init(){ensureStyle();applyOwnerVisibility();observeMenus();waitForDrawerThenRefresh();window.StreamBanditMenuSavesCount={version:VERSION,refresh:refreshCounts,refreshOwner:readOwnerProfile,getCounts:()=>Object.assign({},lastCounts),counts:()=>Object.assign({},lastCounts),ownerState:()=>({owner:isOwner,profile:profile})};window.addEventListener('stream-bandit-core-saves-changed',refreshCounts);window.addEventListener('stream-bandit-core-saves-v6-75-changed',refreshCounts);document.addEventListener('click',e=>{if(e.target.closest('#sbShellMenuToggle,#sbHeaderMenuBtn'))setTimeout(refreshCounts,350)});setTimeout(refreshCounts,300);setTimeout(refreshCounts,900);setTimeout(refreshCounts,1800);setInterval(refreshCounts,9000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();