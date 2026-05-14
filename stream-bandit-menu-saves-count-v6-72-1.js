/* Stream Bandit V6.72.1 Menu Saves Count Add-on
   Read-only overlay menu counts for Watchlist, Favourites and Likes.
   Reads sb_watchlist, sb_favourites and sb_likes for the signed-in Supabase user.
   No inserts, updates, deletes, admin writes, billing, storage or live promotion. */
(function(){
'use strict';
const VERSION='V6.72.1 Menu Saves Count';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const TARGETS=[
  {key:'watchlist',label:'Watchlist',href:'watchlist-watch-shell-v6-37-test.html',table:'sb_watchlist'},
  {key:'favourites',label:'Favourites',href:'favourites-watch-shell-v6-38-test.html',table:'sb_favourites'},
  {key:'liked',label:'Liked',href:'liked-watch-shell-v6-39-test.html',table:'sb_likes'}
];
let sb=null,user=null,lastCounts={watchlist:0,favourites:0,liked:0};
function ensureStyle(){if(document.getElementById('sbMenuSavesCountStyle'))return;const s=document.createElement('style');s.id='sbMenuSavesCountStyle';s.textContent='.sb-menu-save-count{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:#22d3a62b;border:1px solid #22d3a66b;color:#dfffee;font-size:12px;font-weight:950}.sb-menu-save-count.signed-out{background:#ffffff16;border-color:#ffffff24;color:#b9c0d8}.sb-menu-save-count.error{background:#ff4d6d22;border-color:#ff4d6d66;color:#ffc4cf}.sb-menu-count-note{font-size:11px;color:#b9c0d8;margin:8px 2px 0}';document.head.appendChild(s)}
function findDrawer(){return document.getElementById('sbShellDrawer')}
function findLink(href){const drawer=findDrawer();if(!drawer)return null;return Array.from(drawer.querySelectorAll('a.sb-shell-link,a[href]')).find(a=>(a.getAttribute('href')||'').includes(href))||null}
function setBadge(target,value,mode){const a=findLink(target.href);if(!a)return false;let badge=a.querySelector('[data-save-count="'+target.key+'"]');if(!badge){badge=document.createElement('span');badge.dataset.saveCount=target.key;badge.className='sb-menu-save-count';a.appendChild(badge)}badge.className='sb-menu-save-count '+(mode||'');badge.textContent=String(value);badge.title=VERSION+' — '+target.label+' count';return true}
function setAll(value,mode){TARGETS.forEach(t=>setBadge(t,value,mode))}
function addDrawerNote(){const drawer=findDrawer();if(!drawer||drawer.querySelector('#sbMenuCountNote'))return;const filter=drawer.querySelector('.sb-shell-filter');if(!filter)return;const n=document.createElement('div');n.id='sbMenuCountNote';n.className='sb-menu-count-note';n.textContent='Save counts: Watchlist / Favourites / Liked read-only.';filter.insertAdjacentElement('afterend',n)}
async function initClient(){if(!window.supabase)throw new Error('Supabase SDK unavailable');sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await sb.auth.getUser();user=r&&r.data&&r.data.user?r.data.user:null;return user}
async function readCount(t){const r=await sb.from(t.table).select('movie_id',{count:'exact',head:true}).eq('user_id',user.id);if(r.error)throw r.error;return r.count||0}
async function refreshCounts(){try{ensureStyle();addDrawerNote();if(!sb)await initClient();if(!user){setAll(0,'signed-out');window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts',{detail:{signedIn:false,counts:lastCounts}}));return}for(const t of TARGETS){lastCounts[t.key]=await readCount(t);setBadge(t,lastCounts[t.key],'')}window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts',{detail:{signedIn:true,counts:lastCounts}}));}catch(e){TARGETS.forEach(t=>setBadge(t,'!','error'));window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts-error',{detail:{message:e&&e.message?e.message:String(e)}}));}}
function waitForDrawerThenRefresh(){let tries=0;const timer=setInterval(()=>{tries++;if(findDrawer()){clearInterval(timer);refreshCounts()}else if(tries>40){clearInterval(timer)}},150)}
function init(){ensureStyle();waitForDrawerThenRefresh();window.StreamBanditMenuSavesCount={version:VERSION,refresh:refreshCounts,getCounts:()=>Object.assign({},lastCounts)};window.addEventListener('stream-bandit-core-saves-changed',refreshCounts);document.addEventListener('click',e=>{if(e.target.closest('#sbShellMenuToggle'))setTimeout(refreshCounts,350)});setTimeout(refreshCounts,1200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
