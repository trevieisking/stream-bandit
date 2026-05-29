/* Stream Bandit V7.12.129 Live Readiness page bridge
   Page-level only. Keeps avatar winning and loads V7.12.130 Supabase search fallback.
   Menu scrolling is now left to the base shell only. No page helper scroll grip.
   No shell edit. No Supabase writes. No payments. No index promotion. */
(function(){
'use strict';
const VERSION='V7.12.129 Live Readiness Page Bridge / No Scroll Grip';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
let sb=null,avatarUrl='';
function load(src){return new Promise(resolve=>{try{if(document.querySelector('script[src^="'+src+'"]'))return resolve();let s=document.createElement('script');s.src=src+(src.includes('?')?'&':'?')+'v=7-12-130-live-search';s.onload=resolve;s.onerror=resolve;document.head.appendChild(s);}catch(e){resolve();}});}
async function client(){try{if(sb)return sb;if(!window.supabase||!window.supabase.createClient)return null;sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return sb;}catch(e){return null;}}
async function getAvatar(){try{if(avatarUrl)return avatarUrl;let c=await client();if(!c)return '';let session=await c.auth.getSession();let user=session.data&&session.data.session&&session.data.session.user;if(!user)return '';let r=await c.from('sb_profiles').select('avatar_url').eq('id',user.id).maybeSingle();avatarUrl=r.data&&r.data.avatar_url||'';return avatarUrl;}catch(e){return avatarUrl||'';}}
function setAvatar(url){try{if(!url)return;document.querySelectorAll('.brand.sb-auth-host .logo,.brand .logo,.sb-shell-logo').forEach(el=>{if(!el)return;if(el.tagName&&el.tagName.toLowerCase()==='img'){el.src=url;el.alt='Profile avatar';el.style.objectFit='cover';return;}el.classList.add('sb-auth-avatar-logo');el.dataset.empty='false';el.style.backgroundImage='none';el.style.overflow='hidden';el.innerHTML='<img alt="Profile avatar" src="'+String(url).replace(/"/g,'')+'" style="width:100%;height:100%;object-fit:cover;display:block">';});document.documentElement.dataset.sb129AvatarApplied='true';}catch(e){}}
async function avatarWins(){try{window.StreamBanditAuthAvatar&&window.StreamBanditAuthAvatar.refresh&&window.StreamBanditAuthAvatar.refresh();window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh&&window.StreamBanditShellAuth.refresh();}catch(e){}setAvatar(await getAvatar());}
function markOnly(){try{let links=Array.from(document.querySelectorAll('#sbShellDrawer .sb-shell-link'));let link=links.find(a=>a.classList.contains('current'))||links.find(a=>/Live Readiness/i.test(a.textContent||''));if(!link)return;link.classList.add('current');let group=link.closest('.sb-shell-group');if(group)group.classList.add('current');link.dataset.sbLiveReadinessMark='no-scroll';document.documentElement.dataset.sbLiveReadinessMenuScroll='disabled-page-helper';}catch(e){}}
function wireMarkOnly(){document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#sbShellMenuToggle,[data-sb-open-menu]')){setTimeout(markOnly,220);setTimeout(avatarWins,220);setTimeout(avatarWins,800);}},true);}
async function boot(){await load('live-readiness-search-supabase-fallback-v7-12-130.js');avatarWins();wireMarkOnly();[200,500,1000,1800,3200,6000].forEach(t=>setTimeout(avatarWins,t));setInterval(avatarWins,2200);document.addEventListener('streambandit:auth-state',()=>setTimeout(avatarWins,150));window.StreamBanditLiveReadinessPageFix={version:VERSION,refresh:function(){avatarWins();markOnly();if(window.StreamBanditLiveReadinessSearchFallback&&window.StreamBanditLiveReadinessSearchFallback.refresh)window.StreamBanditLiveReadinessSearchFallback.refresh();},state:function(){return {version:VERSION,avatarApplied:!!avatarUrl,searchFallback:!!window.StreamBanditLiveReadinessSearchFallback,menuScroll:'disabled-page-helper'};}};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
