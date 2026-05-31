/* Stream Bandit V6.72.1 Menu Saves Count Add-on
   V7.12.157 tiny fix: expose sb_likes as BOTH likes and liked.
   This fixes the header 👍 counter without touching the passed header/footer/theme shells. */
(function(){
'use strict';
const VERSION='V6.72.1 Menu Saves Count / V7.12.157 Likes Alias Fix';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const TARGETS=[
  {key:'watchlist',label:'Watchlist',href:'watchlist-watch-shell-v6-37-test.html',table:'sb_watchlist'},
  {key:'favourites',label:'Favourites',href:'favourites-watch-shell-v6-38-test.html',table:'sb_favourites'},
  {key:'likes',legacyKey:'liked',label:'Likes',href:'liked-watch-shell-v6-39-test.html',table:'sb_likes'}
];
let sb=null,user=null,lastCounts={watchlist:0,favourites:0,likes:0,liked:0};
function ensureStyle(){if(document.getElementById('sbMenuSavesCountStyle'))return;const s=document.createElement('style');s.id='sbMenuSavesCountStyle';s.textContent='.sb-menu-save-count{margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:#22d3a62b;border:1px solid #22d3a66b;color:#dfffee;font-size:12px;font-weight:950}.sb-menu-save-count.signed-out{background:#ffffff16;border-color:#ffffff24;color:#b9c0d8}.sb-menu-save-count.error{background:#ff4d6d22;border-color:#ff4d6d66;color:#ffc4cf}.sb-menu-count-note{font-size:11px;color:#b9c0d8;margin:8px 2px 0}';document.head.appendChild(s)}
function findDrawer(){return document.getElementById('sbShellDrawer')||document.getElementById('sbMenuDrawer')}
function findLink(href){const drawer=findDrawer();if(!drawer)return null;return Array.from(drawer.querySelectorAll('a.sb-shell-link,a.sb-menu-link,a[href]')).find(a=>(a.getAttribute('href')||'').includes(href))||null}
function setBadge(target,value,mode){const a=findLink(target.href);if(!a)return false;let badge=a.querySelector('[data-save-count="'+target.key+'"],[data-save-count="'+(target.legacyKey||target.key)+'"]');if(!badge){badge=document.createElement('span');badge.dataset.saveCount=target.key;badge.className='sb-menu-save-count';a.appendChild(badge)}badge.dataset.saveCount=target.key;badge.className='sb-menu-save-count '+(mode||'');badge.textContent=String(value);badge.title=VERSION+' - '+target.label+' count';return true}
function setHeaderBadge(key,value){const names=key==='likes'?['likes','liked']:[key];names.forEach(name=>{document.querySelectorAll('[data-sb-count="'+name+'"]').forEach(el=>{el.textContent=String(value);let a=el.closest&&el.closest('.sb-h-ico');if(a)a.classList.toggle('has-count',Number(value)>0);});});}
function setAll(value,mode){TARGETS.forEach(t=>{setBadge(t,value,mode);lastCounts[t.key]=Number(value)||0;if(t.legacyKey)lastCounts[t.legacyKey]=Number(value)||0;setHeaderBadge(t.key,Number(value)||0);})}
function addDrawerNote(){const drawer=findDrawer();if(!drawer||drawer.querySelector('#sbMenuCountNote'))return;const filter=drawer.querySelector('.sb-shell-filter,.sb-menu-filter');if(!filter)return;const n=document.createElement('div');n.id='sbMenuCountNote';n.className='sb-menu-count-note';n.textContent='Save counts: Watchlist / Favourites / Likes read-only.';filter.insertAdjacentElement('afterend',n)}
async function initClient(){if(!window.supabase)throw new Error('Supabase SDK unavailable');sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await sb.auth.getUser();user=r&&r.data&&r.data.user?r.data.user:null;return user}
async function readCount(t){const r=await sb.from(t.table).select('movie_id',{count:'exact',head:true}).eq('user_id',user.id);if(r.error)throw r.error;return r.count||0}
async function refreshCounts(){try{ensureStyle();addDrawerNote();if(!sb)await initClient();if(!user){setAll(0,'signed-out');window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts',{detail:{signedIn:false,counts:Object.assign({},lastCounts)}}));return}for(const t of TARGETS){const count=await readCount(t);lastCounts[t.key]=count;if(t.legacyKey)lastCounts[t.legacyKey]=count;setBadge(t,count,'');setHeaderBadge(t.key,count)}window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts',{detail:{signedIn:true,counts:Object.assign({},lastCounts)}}));}catch(e){TARGETS.forEach(t=>setBadge(t,'!','error'));window.dispatchEvent(new CustomEvent('stream-bandit-menu-save-counts-error',{detail:{message:e&&e.message?e.message:String(e)}}));}}
function waitForDrawerThenRefresh(){let tries=0;const timer=setInterval(()=>{tries++;if(findDrawer()){clearInterval(timer);refreshCounts()}else if(tries>40){clearInterval(timer)}},150)}
function init(){ensureStyle();waitForDrawerThenRefresh();window.StreamBanditMenuSavesCount={version:VERSION,refresh:refreshCounts,getCounts:()=>Object.assign({},lastCounts),counts:()=>Object.assign({},lastCounts)};window.addEventListener('stream-bandit-core-saves-changed',refreshCounts);window.addEventListener('stream-bandit-core-saves-v6-75-changed',refreshCounts);document.addEventListener('click',e=>{if(e.target.closest('#sbShellMenuToggle,#sbHeaderMenuBtn'))setTimeout(refreshCounts,350)});setTimeout(refreshCounts,600);setTimeout(refreshCounts,1400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
