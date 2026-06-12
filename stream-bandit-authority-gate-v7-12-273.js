/* Stream Bandit Authority Gate V7.12.273
   Reusable read-only route gate helper.
   Authority source: Supabase Auth user matched to public.sb_profiles id.
   Uses StreamBanditAccountAuthority + StreamBanditRouteAccessMap.
   No writes. No redirects. No billing.
*/
(function(){
'use strict';
const VERSION='V7.12.273 Authority Gate';
const RANK={free_viewer:0,viewer_plus:1,creator_starter:2,creator_growth:3,creator_pro:4,studio_business:5,platform_owner:6};
function fileOf(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0]||'index.html'}
function load(src){return new Promise(function(resolve,reject){try{let base=src.split('?')[0];if(Array.from(document.scripts||[]).some(function(s){return String(s.src||'').includes(base)}))return resolve();let s=document.createElement('script');s.src=src;s.defer=true;s.onload=function(){resolve()};s.onerror=function(){reject(new Error('Could not load '+src))};document.head.appendChild(s)}catch(e){reject(e)}})}
async function ensure(){if(!window.StreamBanditAccountAuthority)await load('stream-bandit-account-authority-v7-12-273.js?v=authority-gate-273');if(!window.StreamBanditRouteAccessMapV712271)await load('stream-bandit-route-access-map-v7-12-271.js?v=authority-gate-273');}
function perms(profile){try{let raw=profile&&profile.permissions_json;if(!raw)return{};return typeof raw==='string'?JSON.parse(raw):raw}catch(e){return{}}}
function truth(v){if(v===true||v===1)return true;if(typeof v==='string')return['true','1','yes','on'].includes(v.toLowerCase());return false}
function rank(plan){return RANK[String(plan||'free_viewer')]||0}
function minPlan(profile,need){return rank(profile&&profile.plan_key)>=rank(need)}
function active(profile){return !!profile&&String(profile.account_status||'active')==='active'}
function hasPerm(profile,key){let p=perms(profile);return truth(p[key])||truth(p[key+'_enabled'])||truth(p[key+'_access'])}
function allowedFor(info,a){info=info||{};a=a||{};let profile=a.profile||{};let rule=info.routeClass||info.access||'public';if(rule==='public'||rule==='public_reference')return true;if(rule==='account_optional')return true;if(rule==='account_required')return !!a.signed_in&&active(profile);if(rule==='owner_only'||rule==='owner_reference')return !!a.is_owner;if(rule==='owner_admin'||rule==='admin_owner'||rule==='editor_admin_owner')return !!(a.is_owner||a.is_admin);if(rule==='web_builder')return !!a.signed_in&&active(profile)&&(a.is_owner||a.is_admin||minPlan(profile,info.minPlan||'creator_growth')||hasPerm(profile,'web_builder')||hasPerm(profile,'web_builder_starter'));if(rule==='web_builder_or_owner')return !!a.is_owner||(!!a.signed_in&&active(profile)&&(a.is_admin||minPlan(profile,info.minPlan||'creator_growth')||hasPerm(profile,info.feature)||hasPerm(profile,'web_builder')));if(rule==='creator_plan'||rule==='creator_submit'||rule==='group_play')return !!a.signed_in&&active(profile)&&(a.is_owner||a.is_admin||minPlan(profile,info.minPlan||'creator_starter')||hasPerm(profile,info.feature));if(rule==='feature_addon')return !!a.signed_in&&active(profile)&&(a.is_owner||a.is_admin||hasPerm(profile,info.feature));return false}
async function decide(route){await ensure();let authority=await window.StreamBanditAccountAuthority.read({force:true});let map=window.StreamBanditRouteAccessMapV712271;let info=map&&map.lookup?map.lookup(route||location.pathname):null;let allowed=allowedFor(info,authority);return{version:VERSION,route:fileOf(route||location.pathname),info:info,rule:info&&(info.routeClass||info.access)||'public',feature:info&&info.feature||'',allowed:allowed,authority:authority}}
window.StreamBanditAuthorityGate={version:VERSION,decide:decide,allowedFor:allowedFor};
})();
