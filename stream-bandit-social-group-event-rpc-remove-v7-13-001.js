/* Stream Bandit Social Group/Event RPC Remove V7.13.006
   Small override helper for Groups page removal actions.
   It catches Remove Group / Remove Event before the older direct browser update handler
   and calls the new SECURITY DEFINER RPC helpers instead.
   Also applies the Groups registry/Auth Gate polish while the full page file remains preserved.
   No service role, no storage policy change, no RLS rewrite.
*/
(function(){
'use strict';
const VERSION='V7.13.006 Group Event RPC Remove + Registry Auth Polish Helper';
const PAGE='groups-social-v7-13-001-test.html';
const AUTH_GATE_SRC='stream-bandit-auth-gate-v7-13-001.js?v=groups-social-auth-gate-7-13-005';
let sb=null,user=null;
function file(){return String(location.pathname||'').split('/').pop()||'';}
function active(){return file()===PAGE;}
function toast(msg){let t=document.createElement('div');t.className='toast';t.textContent=msg;t.style.cssText='position:fixed;right:18px;bottom:18px;background:#12172a;color:#fff;border:1px solid #ffffff35;border-radius:16px;padding:13px 16px;box-shadow:0 16px 44px #0009;font-weight:900;z-index:100001;max-width:min(420px,calc(100vw - 36px))';document.body.appendChild(t);setTimeout(()=>t.remove(),3200);}
function cfg(){try{let c=window.StreamBanditShell&&window.StreamBanditShell.config&&window.StreamBanditShell.config();if(c&&c.url&&c.key)return c;}catch(e){}try{let c=window.StreamBanditSupabaseConfig;if(c&&c.url&&c.key)return c;}catch(e){}return null;}
function client(){if(sb)return sb;if(!window.supabase||!window.supabase.createClient)throw Error('Supabase SDK not loaded');let c=cfg();if(!c||!c.url||!c.key)throw Error('Supabase config missing');sb=window.supabase.createClient(c.url,c.key);return sb;}
async function auth(){if(user)return user;let r=await client().auth.getUser();user=r&&r.data&&r.data.user||null;return user;}
async function removeGroup(id){try{let u=await auth();if(!u)return toast('Sign in first.');if(!confirm('Remove this group? This hides it with status deleted.'))return;let res=await client().rpc('sb_social_remove_own_group',{p_group_id:id});if(res.error)throw res.error;if(res.data!==true)return toast('Group was not removed. Only the owner can remove an active group.');toast('Group removed.');setTimeout(()=>location.reload(),500);}catch(e){toast('Group remove failed: '+(e.message||e));}}
async function removeEvent(id){try{let u=await auth();if(!u)return toast('Sign in first.');if(!confirm('Remove this event? This hides it with status deleted.'))return;let res=await client().rpc('sb_social_remove_own_event',{p_event_id:id});if(res.error)throw res.error;if(res.data!==true)return toast('Event was not removed. Only the event owner or group manager can remove it.');toast('Event removed.');setTimeout(()=>location.reload(),500);}catch(e){toast('Event remove failed: '+(e.message||e));}}
function ensureAuthGate(){if(!active())return;if(document.querySelector('script[src*="stream-bandit-auth-gate-v7-13-001.js"]'))return;let s=document.createElement('script');s.src=AUTH_GATE_SRC;s.defer=true;s.dataset.sbGroupsRegistryAuthGate='v7-13-006';document.head.appendChild(s);}
function polishRegistryCopy(){if(!active())return;let cards=document.querySelectorAll('#rulesSec .card');cards.forEach(function(card){let b=card.querySelector('b');if(b&&String(b.textContent||'').trim()==='No index promotion'){card.innerHTML='<b>Registry polish pass</b><p>Groups is preserved on the old URL with shared login, logout and password reset aligned. Social Media Group continues page-by-page.</p>';}});let micro=document.querySelector('p.micro');if(micro&&/Groups Social V7\.13\.002/.test(micro.textContent||'')){micro.textContent='Groups Social V7.13.002 - groups/events registry polish, shared Auth Gate aligned, old URL preserved. No schema change. No RLS change. No storage policy change.';}document.documentElement.dataset.sbGroupsRegistryPolish='v7-13-006';}
function bind(){if(!active())return;ensureAuthGate();polishRegistryCopy();setTimeout(polishRegistryCopy,300);setTimeout(polishRegistryCopy,1200);document.addEventListener('click',function(e){let g=e.target&&e.target.closest&&e.target.closest('[data-remove-group]');if(g){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();removeGroup(g.getAttribute('data-remove-group'));return;}let ev=e.target&&e.target.closest&&e.target.closest('[data-remove-event]');if(ev){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();removeEvent(ev.getAttribute('data-remove-event'));return;}},true);window.StreamBanditSocialGroupEventRpcRemove={version:VERSION,removeGroup,removeEvent,ensureAuthGate,polishRegistryCopy};document.documentElement.dataset.sbGroupEventRpcRemove='v7-13-006';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();