/* Stream Bandit Account Authority V7.12.273
   Shared read-only account authority helper.
   Reads the live Supabase Auth user, then reads the matching public.sb_profiles row by id.
   This is the source for protected route decisions. No writes. No redirects.
*/
(function(){
'use strict';
const VERSION='V7.12.273 Account Authority';
let client=null;
let state=null;
let loading=null;
function loadScript(src){return new Promise(function(resolve,reject){try{let base=src.split('?')[0];if(Array.from(document.scripts||[]).some(function(s){return String(s.src||'').includes(base)}))return resolve();let s=document.createElement('script');s.src=src;s.defer=true;s.onload=function(){resolve()};s.onerror=function(){reject(new Error('Could not load '+src))};document.head.appendChild(s)}catch(e){reject(e)}})}
function config(){let cfg=window.StreamBanditSupabaseConfig||window.StreamBanditShellConfig||null;if(cfg&&cfg.url&&cfg.key)return cfg;if(window.StreamBanditShell&&typeof window.StreamBanditShell.config==='function'){let c=window.StreamBanditShell.config();if(c&&c.url&&c.key)return c}if(window.SUPABASE_URL&&window.SUPABASE_KEY)return{url:window.SUPABASE_URL,key:window.SUPABASE_KEY};return null}
async function sb(){if(client)return client;let cfg=config();if(!cfg)throw new Error('Supabase config missing');if(!window.supabase)await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');client=window.supabase.createClient(cfg.url,cfg.key);return client}
function mask(email){email=String(email||'');if(!email.includes('@'))return '';let p=email.split('@');return p[0].slice(0,2)+'***@'+p[1]}
function owner(profile){return !!profile&&(profile.admin_level==='owner'||profile.plan_key==='platform_owner')}
function admin(profile){return !!profile&&(profile.role==='admin'||profile.admin_level==='admin'||profile.admin_level==='owner'||profile.plan_key==='platform_owner')}
async function read(options){options=options||{};if(loading&&!options.force)return loading;loading=(async function(){let c=await sb();let user=null;let source='none';let gu=await c.auth.getUser();if(gu&&gu.data&&gu.data.user){user=gu.data.user;source='getUser'}if(!user){let gs=await c.auth.getSession();if(gs&&gs.data&&gs.data.session&&gs.data.session.user){user=gs.data.session.user;source='getSession'}}if(!user){state={version:VERSION,ready:true,signed_in:false,user:null,profile:null,source:source,profile_match:false,is_owner:false,is_admin:false,masked_email:''};loading=null;return state}let pr=await c.from('sb_profiles').select('*').eq('id',user.id).maybeSingle();if(pr.error)throw pr.error;let profile=pr.data||null;state={version:VERSION,ready:true,signed_in:true,user:{id:user.id,email:user.email||'',masked_email:mask(user.email)},profile:profile,source:source,profile_match:!!(profile&&profile.id===user.id),is_owner:owner(profile),is_admin:admin(profile),masked_email:mask(user.email)};loading=null;return state})();return loading}
function current(){return state}
window.StreamBanditAccountAuthority={version:VERSION,read:read,state:current,mask:mask,isOwnerProfile:owner,isAdminProfile:admin};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){read({force:true}).catch(function(){})});else read({force:true}).catch(function(){});
})();
