/* Stream Bandit V7.12.133 Tools avatar fix
   Page-level only. Applies profile avatar last on Tools pages.
   No shell edit. No Supabase writes. No payments. No index promotion. */
(function(){
'use strict';
const VERSION='V7.12.133 Tools Avatar Fix';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
let sb=null,avatarUrl='';
async function client(){try{if(sb)return sb;if(!window.supabase||!window.supabase.createClient)return null;sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);return sb;}catch(e){return null;}}
async function getAvatar(){try{if(avatarUrl)return avatarUrl;let c=await client();if(!c)return '';let s=await c.auth.getSession();let user=s.data&&s.data.session&&s.data.session.user;if(!user)return '';let r=await c.from('sb_profiles').select('avatar_url').eq('id',user.id).maybeSingle();avatarUrl=r.data&&r.data.avatar_url||'';return avatarUrl;}catch(e){return avatarUrl||'';}}
function apply(url){try{if(!url)return;document.querySelectorAll('.brand.sb-auth-host .logo,.brand .logo,.sb-shell-logo').forEach(el=>{if(!el)return;if(el.tagName&&el.tagName.toLowerCase()==='img'){el.src=url;el.alt='Profile avatar';el.style.objectFit='cover';return;}el.classList.add('sb-auth-avatar-logo');el.dataset.empty='false';el.style.backgroundImage='none';el.style.overflow='hidden';el.innerHTML='<img alt="Profile avatar" src="'+String(url).replace(/"/g,'')+'" style="width:100%;height:100%;object-fit:cover;display:block">';});document.documentElement.dataset.sbToolsAvatarFix='v7-12-133';}catch(e){}}
async function refresh(){try{if(window.StreamBanditAuthAvatar&&window.StreamBanditAuthAvatar.refresh)window.StreamBanditAuthAvatar.refresh();if(window.StreamBanditShellAuth&&window.StreamBanditShellAuth.refresh)window.StreamBanditShellAuth.refresh();}catch(e){}apply(await getAvatar());}
function boot(){refresh();[200,500,1000,1800,3200,6000,9000].forEach(t=>setTimeout(refresh,t));setInterval(refresh,3500);document.addEventListener('streambandit:auth-state',()=>setTimeout(refresh,150));document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#sbShellMenuToggle,[data-sb-open-menu]')){setTimeout(refresh,220);setTimeout(refresh,900);}},true);window.StreamBanditToolsAvatarFix={version:VERSION,refresh,state:()=>({version:VERSION,avatarApplied:document.documentElement.dataset.sbToolsAvatarFix==='v7-12-133',avatarCached:!!avatarUrl})};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
