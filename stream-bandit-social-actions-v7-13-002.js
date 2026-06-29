/* Stream Bandit Social Actions V7.13.002
   Runtime repair for social post actions where large page files already contain safe edit/delete logic
   but fail to render owner buttons. Adds visible Share for public content and visible Edit/Remove for own posts.
   Uses anon Supabase client only. No schema, RLS or storage policy changes.
*/
(function(){
'use strict';

const VERSION='V7.13.002 Social Visible Actions Repair';
const SOCIAL_FILES=new Set([
  'news-feed-social-v7-13-001-test.html',
  'profile-social-v7-13-001-test.html',
  'groups-social-v7-13-001-test.html',
  'friends-social-v7-13-001-test.html'
]);
const SHARE_HELPER='stream-bandit-social-share-v7-13-001.js?v=social-actions-7-13-002';
let sb=null,user=null,cache=new Map(),running=false;

function file(){return String(location.pathname||'').split('/').pop()||'index.html';}
function isSocial(){return SOCIAL_FILES.has(file())||document.body&&document.body.dataset&&Object.keys(document.body.dataset).some(k=>/^sbSocial/.test(k));}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m));}
function clean(v,n){v=String(v||'').replace(/\s+/g,' ').trim();return n&&v.length>n?v.slice(0,n-1).trim()+'…':v;}
function toast(msg){let t=document.createElement('div');t.className='toast';t.textContent=msg;if(!t.className||!document.querySelector('.toast'))t.style.cssText='position:fixed;right:18px;bottom:18px;background:#12172a;color:#fff;border:1px solid #ffffff35;border-radius:16px;padding:13px 16px;box-shadow:0 16px 44px #0009;font-weight:900;z-index:100001';document.body.appendChild(t);setTimeout(()=>t.remove(),3200);}
function loadScript(src){try{let base=src.split('?')[0];if(Array.from(document.scripts||[]).some(s=>String(s.src||'').includes(base)))return;let s=document.createElement('script');s.src=src;s.defer=true;s.dataset.sbLoadedBy='social-actions-v7-13-002';document.head.appendChild(s);}catch(e){}}
function cfg(){try{let c=window.StreamBanditShell&&window.StreamBanditShell.config&&window.StreamBanditShell.config();if(c&&c.url&&c.key)return c;}catch(e){}try{let c=window.StreamBanditSupabaseConfig;if(c&&c.url&&c.key)return c;}catch(e){}return {url:'https://xzxqfrvqdgkzwujbkdbk.supabase.co',key:'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN'};}
function client(){if(sb)return sb;if(!window.supabase||!window.supabase.createClient)throw Error('Supabase SDK not loaded');let c=cfg();sb=window.supabase.createClient(c.url,c.key);return sb;}
async function auth(){if(user)return user;let r=await client().auth.getUser();user=r&&r.data&&r.data.user||null;return user;}
function postIds(){return [...new Set(Array.from(document.querySelectorAll('[data-react]')).map(b=>b.getAttribute('data-react')).filter(Boolean))];}
function articleFor(id){let btn=document.querySelector('[data-react="'+CSS.escape(id)+'"]');return btn&&btn.closest('article,.card')||null;}
function actionsFor(article){if(!article)return null;return article.querySelector('.actions,.miniActions')||article;}
function postText(article){let b=article&&article.querySelector('.postBody');return clean(b&&b.textContent||document.title,220);}
function visibilityFromArticle(article){let pills=Array.from(article.querySelectorAll('.pill,.infoPill')).map(x=>String(x.textContent||'').toLowerCase().trim());return pills.includes('friends')?'friends':pills.includes('private')?'private':pills.includes('group_members')?'group_members':'public';}
async function loadPosts(ids){if(!ids.length)return new Map();let missing=ids.filter(id=>!cache.has(id));if(missing.length){let r=await client().from('sb_social_posts').select('id,author_id,body_text,visibility,target_type,status,created_at').in('id',missing);if(!r.error)(r.data||[]).forEach(p=>cache.set(p.id,p));}
let out=new Map();ids.forEach(id=>{if(cache.has(id))out.set(id,cache.get(id));});return out;}
function actionBtn(label,cls,attr,id){let b=document.createElement('button');b.className='btn '+(cls||'');b.type='button';b.textContent=label;b.setAttribute(attr,id);b.dataset.sbSocialActionsRepair='true';return b;}
function ensureShare(article,id,p){if(!article||article.querySelector('[data-sb-share-target],.sbSocialShareBtn,[data-sb-share-open]'))return;let actions=actionsFor(article);let b=actionBtn('Share','cyan','data-sb-share-open',id);actions.appendChild(b);article.setAttribute('data-sb-social-share','true');article.setAttribute('data-sb-share-id',id);article.setAttribute('data-sb-share-type',p&&p.target_type?p.target_type:'post');article.setAttribute('data-sb-share-visibility',p&&p.visibility||visibilityFromArticle(article));article.setAttribute('data-sb-share-title','Stream Bandit post');article.setAttribute('data-sb-share-text',p&&p.body_text||postText(article));}
function ensureOwner(article,id,p,u){if(!article||!u||!p||String(p.author_id)!==String(u.id))return;let actions=actionsFor(article);if(!actions)return;if(!article.querySelector('[data-edit-post]'))actions.appendChild(actionBtn('Edit Post','warn','data-edit-post',id));if(!article.querySelector('[data-remove-post]'))actions.appendChild(actionBtn('Remove Post','dangerBtn','data-remove-post',id));}
async function copyFallback(id){let url=new URL(location.href);url.searchParams.set('sb_share_type','post');url.searchParams.set('sb_share_id',id);try{await navigator.clipboard.writeText(url.href);toast('Share link copied.');}catch(e){prompt('Copy this share link',url.href);}}
async function sharePost(id){let p=cache.get(id)||{};let data={id,type:p.target_type||'post',visibility:p.visibility||'public',title:'Stream Bandit post',text:p.body_text||'',url:location.href};if(window.StreamBanditSocialShare&&window.StreamBanditSocialShare.open)return window.StreamBanditSocialShare.open('native',data);return copyFallback(id);}
async function editPost(id){try{let u=await auth();if(!u)return toast('Sign in first.');let p=cache.get(id);if(!p||String(p.author_id)!==String(u.id))return toast('Only the author can edit this post.');let next=prompt('Edit your post',p.body_text||'');if(next==null)return;next=String(next).trim();if(!next)return toast('Post text cannot be empty.');let r=await client().from('sb_social_posts').update({body_text:next,updated_at:new Date().toISOString(),metadata_json:{source:'social_actions_v7_13_002_edit',version:VERSION}}).eq('id',id).eq('author_id',u.id).select('id,author_id,body_text,visibility,target_type,status').maybeSingle();if(r.error)throw r.error;if(!r.data)return toast('No matching author-owned post found.');cache.set(id,r.data);toast('Post saved.');setTimeout(()=>location.reload(),500);}catch(e){toast('Edit failed: '+(e.message||e));}}
async function removePost(id){try{let u=await auth();if(!u)return toast('Sign in first.');let p=cache.get(id);if(!p||String(p.author_id)!==String(u.id))return toast('Only the author can remove this post.');if(!confirm('Remove this post from the feed?'))return;let r=await client().from('sb_social_posts').update({status:'deleted',updated_at:new Date().toISOString(),metadata_json:{source:'social_actions_v7_13_002_remove',version:VERSION}}).eq('id',id).eq('author_id',u.id).select('id').maybeSingle();if(r.error)throw r.error;if(!r.data)return toast('No matching author-owned post found.');toast('Post removed.');setTimeout(()=>location.reload(),500);}catch(e){toast('Remove failed: '+(e.message||e));}}
async function mount(){if(!isSocial()||running)return;running=true;try{loadScript(SHARE_HELPER);let ids=postIds();if(!ids.length)return;let u=await auth();let map=await loadPosts(ids);ids.forEach(id=>{let article=articleFor(id),p=map.get(id);if(article){ensureShare(article,id,p);ensureOwner(article,id,p,u);}});if(window.StreamBanditSocialShare&&window.StreamBanditSocialShare.mount)window.StreamBanditSocialShare.mount();}catch(e){}finally{running=false;}}
function bind(){document.addEventListener('click',e=>{let edit=e.target&&e.target.closest&&e.target.closest('[data-edit-post]');if(edit){e.preventDefault();editPost(edit.getAttribute('data-edit-post'));return;}let del=e.target&&e.target.closest&&e.target.closest('[data-remove-post]');if(del){e.preventDefault();removePost(del.getAttribute('data-remove-post'));return;}let share=e.target&&e.target.closest&&e.target.closest('[data-sb-share-open]');if(share){e.preventDefault();sharePost(share.getAttribute('data-sb-share-open'));return;}});}
function boot(){if(!isSocial())return;bind();mount();setTimeout(mount,700);setTimeout(mount,1800);setInterval(mount,2500);try{new MutationObserver(()=>mount()).observe(document.body,{childList:true,subtree:true});}catch(e){}window.StreamBanditSocialActions={version:VERSION,mount,state:()=>({version:VERSION,page:file(),cached:cache.size})};document.documentElement.dataset.sbSocialActionsRepair='v7-13-002';}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
