/* Stream Bandit V7.12.41 Shared Shell Clean Machine Menu
   Safe overlay/menu route pass only: grouped drawer, global search, favicon and route guard.
   Promotes passed clean machines into the overlay menu. No saves, uploads, deletes,
   billing, permission writes, database writes or live/index promotion. */
(function(){
'use strict';

const VERSION='V7.12.41 Shared Shell Clean Machine Menu';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const GLOBAL_SEARCH='global-search-global-helpers-v7-4-9-test.html';
const CURRENT_DETAILS='details-clean-machine-v7-12-38-test.html';
const CURRENT_PLAYER='player-one-global-helpers-v7-3-3-test.html';
const CLEAN_MENU='stream-bandit-clean-machine-menu-v7-12-40-test.html';
const ROUTE_GUARD='platform-control-tower-route-guard-proof-v7-12-33-test.html';
const ROUTE_POINTER='stream-bandit-route-pointer-machine-v7-12-36-test.html';

const ROUTE_FIXES={
 'global-search-admin-shell-v6-52-test.html':'global-search-global-helpers-v7-4-9-test.html',
 'global-search-v5-90-test.html':'global-search-global-helpers-v7-4-9-test.html',
 'home-watch-shell-v6-32-test.html':'home-global-helpers-v7-4-4-test.html',
 'details-global-helpers-v7-3-0-test.html':'details-clean-machine-v7-12-38-test.html',
 'details-global-helpers-v7-3-1-test.html':'details-clean-machine-v7-12-38-test.html',
 'player-watch-shell-v6-34-test.html':'player-one-global-helpers-v7-3-3-test.html',
 'continue-watching-watch-shell-v6-35-test.html':'continue-watching-global-helpers-v7-3-9-test.html',
 'watch-history-watch-shell-v6-36-test.html':'watch-history-global-helpers-v7-4-0-test.html',
 'watchlist-watch-shell-v6-37-test.html':'watchlist-global-helpers-v7-3-5-test.html',
 'favourites-watch-shell-v6-38-test.html':'favourites-clean-machine-v7-12-41-test.html',
 'favourites-global-helpers-v7-3-6-test.html':'favourites-clean-machine-v7-12-41-test.html',
 'liked-watch-shell-v6-39-test.html':'likes-global-helpers-v7-3-7-test.html',
 'accessibility-watch-shell-v6-40-test.html':'accessibility-global-helpers-v7-4-2-test.html',
 'library-browse-shell-v6-41-test.html':'library-global-helpers-v7-4-8-test.html',
 'library-browse-global-helpers-v7-2-9-test.html':'library-global-helpers-v7-4-8-test.html',
 'supabase-library-browse-shell-v6-43-test.html':'supabase-library-home-header-form-fix-v7-12-34-test.html',
 'supabase-library-clean-editor-v6-93-3-test.html':'supabase-library-home-header-form-fix-v7-12-34-test.html',
 'genres-browse-shell-v6-44-test.html':'genres-global-helpers-v7-5-4-test.html',
 'genres-direct-canonical-v6-90-12-test.html':'genres-global-helpers-v7-5-4-test.html',
 'about-browse-shell-v6-42-test.html':'about-global-helpers-v7-4-7-test.html',
 'playlists-browse-shell-v6-47-test.html':'playlists-global-helpers-v7-5-2-test.html',
 'channels-browse-shell-v6-45-test.html':'channels-global-helpers-v7-5-3-test.html',
 'my-channel-creator-shell-v6-48-test.html':'my-channel-global-helpers-v7-5-0-test.html',
 'collections-browse-shell-v6-46-1-test.html':'collections-global-helpers-v7-5-1-test.html',
 'collections-remove-fix-v6-95-2-test.html':'collections-global-helpers-v7-5-1-test.html',
 'player-two-global-helpers-v7-3-4-test.html':'player-2-progress-helper-v6-78-9-4-test.html',
 'submit-video-creator-shell-v6-49-test.html':'submit-video-global-helpers-v7-5-6-test.html',
 'rules-creator-shell-v6-50-test.html':'rules-global-helpers-v7-5-5-test.html',
 'review-queue-creator-shell-v6-51-test.html':'review-queue-global-helpers-v7-5-7-test.html',
 'review-queue-status-delete-v6-99-0-test.html':'review-queue-global-helpers-v7-5-7-test.html',
 'review-queue-approved-to-movies-v7-0-0-test.html':'review-queue-global-helpers-v7-5-7-test.html',
 'channels-image-column-fix-v6-94-2-test.html':'channels-global-helpers-v7-5-3-test.html',
 'settings-admin-shell-v6-54-test.html':'settings-brand-icons-promoted-v7-12-21-test.html',
 'settings-platform-control-hub-v7-1-6-test.html':'settings-platform-control-hub-v7-1-8-test.html',
 'profile-settings-admin-shell-v6-56-test.html':'profile-settings-global-helpers-v7-5-8-test.html',
 'web-builder-admin-shell-v6-57-test.html':'web-builder-full-edit-lock-v7-8-6-test.html',
 'platform-builder-admin-shell-v6-58-test.html':'stream-bandit-clean-machine-menu-v7-12-40-test.html',
 'platform-control-tower-live-machine-route-doctor-v7-12-32-test.html':'stream-bandit-clean-machine-menu-v7-12-40-test.html',
 'platform-control-tower-machine-gated-route-doctor-v7-12-31-test.html':'stream-bandit-clean-machine-menu-v7-12-40-test.html',
 'platform-control-tower-route-doctor-v7-12-30-test.html':'stream-bandit-clean-machine-menu-v7-12-40-test.html',
 'platform-control-tower-route-doctor-v7-12-29-test.html':'stream-bandit-clean-machine-menu-v7-12-40-test.html',
 'final-shell-navigation-admin-shell-v6-59-test.html':'final-shell-navigation-global-helpers-v7-5-9-test.html',
 'all-pages-version-registry-admin-shell-v6-61-test.html':'all-pages-version-registry-v7-1-4-full-test.html'
};

const GLOBAL_FAVICON_PARTS=['https://xzxqfrvqdgkzwujbkdbk.supabase','.co/storage/v1/object/public/','stream-bandit-images/global/','logo-1779203548544.png'];
let movies=[];

const pages=[
 ['🏠','Home','home-global-helpers-v7-4-4-test.html','Clean Home current'],
 ['🎬','Details','details-clean-machine-v7-12-38-test.html','Clean Details passed'],
 ['▶️','Player 1','player-one-global-helpers-v7-3-3-test.html','Single-title Player 1'],
 ['⏯️','Continue Watching','continue-watching-global-helpers-v7-3-9-test.html','Continue Watching current'],
 ['🕘','Watch History','watch-history-global-helpers-v7-4-0-test.html','Watch History current'],
 ['🔖','Watchlist','watchlist-global-helpers-v7-3-5-test.html','Personal saved list'],
 ['⭐','Favourites','favourites-clean-machine-v7-12-41-test.html','Clean Favourites passed'],
 ['👍','Liked','likes-global-helpers-v7-3-7-test.html','Personal saved list'],
 ['♿','Accessibility','accessibility-global-helpers-v7-4-2-test.html','Player comfort / accessibility'],
 ['🎞️','Library','library-global-helpers-v7-4-8-test.html','Browse library movies'],
 ['🟢','Supabase Library','supabase-library-home-header-form-fix-v7-12-34-test.html','Fixed Supabase Library editor'],
 ['🏷️','Genres','genres-global-helpers-v7-5-4-test.html','Genre discovery'],
 ['🔎','Global Search','global-search-global-helpers-v7-4-9-test.html','Global search results'],
 ['ℹ️','About','about-global-helpers-v7-4-7-test.html','About / platform info'],
 ['📃','Playlists','playlists-global-helpers-v7-5-2-test.html','Group playback owner'],
 ['📺','Channels','channels-global-helpers-v7-5-3-test.html','Group playback owner'],
 ['📡','My Channel','my-channel-global-helpers-v7-5-0-test.html','Creator channel'],
 ['🧺','Collections','collections-global-helpers-v7-5-1-test.html','Curated group playback owner'],
 ['▶️▶️','Player 2','player-2-progress-helper-v6-78-9-4-test.html','Group / queue Player 2'],
 ['⬆️','Submit Video','submit-video-global-helpers-v7-5-6-test.html','Creator submit video'],
 ['📜','Rules','rules-global-helpers-v7-5-5-test.html','Creator rules'],
 ['🧾','Review Queue','review-queue-global-helpers-v7-5-7-test.html','Creator review queue'],
 ['⚙️','Settings','settings-brand-icons-promoted-v7-12-21-test.html','Settings with Brand/App Icons'],
 ['🎨','Settings Studio','settings-studio-admin-shell-v6-55-test.html','Settings Studio'],
 ['👤','Profile Settings','profile-settings-global-helpers-v7-5-8-test.html','Profile settings'],
 ['🏗️','Web Builder','web-builder-full-edit-lock-v7-8-6-test.html','Web builder'],
 ['🧱','Clean Machine Menu','stream-bandit-clean-machine-menu-v7-12-40-test.html','Passed machines plus route tools'],
 ['🛡️','Route Guard Proof','platform-control-tower-route-guard-proof-v7-12-33-test.html','End-of-batch scanner'],
 ['🎯','Route Pointer Machine','stream-bandit-route-pointer-machine-v7-12-36-test.html','One-page route picker'],
 ['🧭','Final Shell Navigation','final-shell-navigation-global-helpers-v7-5-9-test.html','Final shell checkpoint'],
 ['🛠️','Admin Centre','admin-centre-command-deck-v7-10-0-test.html','Admin command deck'],
 ['🚦','Live Readiness','live-readiness-global-helpers-v7-10-2-test.html','Release smoke test'],
 ['📋','All Pages Version Registry','all-pages-version-registry-v7-1-4-full-test.html','Full registry'],
 ['🧪','Test Checklist','test-checklist-global-helpers-v7-10-5-test.html','Test checklist'],
 ['🧰','Tools Page','tools-page-global-helpers-v7-10-1-test.html','Admin tools'],
 ['✅','Health Check','health-check-global-helpers-v7-10-6-test.html','Health readiness'],
 ['🎥','Mux Manager','mux-manager-global-helpers-v7-10-7-test.html','Mux video/HLS'],
 ['🪣','Storage Prep','storage-prep-global-helpers-v7-10-8-test.html','Supabase storage'],
 ['🛡️','Backup / Safety','backup-safety-global-helpers-v7-10-9-test.html','Backup safety'],
 ['👥','User Dashboard Concept','user-management-dashboard-v7-11-2-test.html','User dashboard planning'],
 ['💳','Fair Pricing Matrix','plans-pricing-feature-shop-v7-11-3-test.html','Pricing/plans'],
 ['🔐','Permissions Matrix','permissions-matrix-user-management-v7-11-4-test.html','Permissions/feature access'],
 ['📚','Policy & FAQ Centre','policy-agreements-centre-v7-11-6-test.html','Policy and FAQ centre'],
 ['🧾','Policy Admin Editor','policy-admin-save-editor-v7-12-25-test.html','Protected policy save editor'],
 ['📖','Published Policy Proof','policy-reader-published-row-v7-12-27-test.html','Read-only published policy proof']
];

const groupOrder=['Watch','Browse','Group Play','Creator','Settings','Admin','User Management','Policy'];

function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function arr(v){if(Array.isArray(v))return v;if(typeof v==='string'&&v.trim()){try{const j=JSON.parse(v);if(Array.isArray(j))return j;}catch(e){}return v.split(',').map(x=>x.trim()).filter(Boolean);}return[];}
function poster(m){return m.thumbnail_url||m.poster_url||m.image_url||m.backdrop_url||m.thumb||'';}
function snippet(s,n=118){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s;}
function groupFor(p){const n=p[1];if(['Home','Details','Player 1','Continue Watching','Watch History','Watchlist','Favourites','Liked','Accessibility'].includes(n))return'Watch';if(['Library','Supabase Library','Genres','Global Search','About'].includes(n))return'Browse';if(['Playlists','Channels','My Channel','Collections','Player 2'].includes(n))return'Group Play';if(['Submit Video','Rules','Review Queue'].includes(n))return'Creator';if(['Settings','Settings Studio','Profile Settings','Web Builder','Clean Machine Menu','Route Guard Proof','Route Pointer Machine','Final Shell Navigation'].includes(n))return'Settings';if(['Admin Centre','Live Readiness','All Pages Version Registry','Test Checklist','Tools Page','Health Check','Mux Manager','Storage Prep','Backup / Safety'].includes(n))return'Admin';if(['User Dashboard Concept','Fair Pricing Matrix','Permissions Matrix'].includes(n))return'User Management';return'Policy';}
function sbGlobalFaviconUrl(){return GLOBAL_FAVICON_PARTS.join('');}
function sbSetFaviconLink(rel,sizes,url){let link=document.querySelector('link[rel="'+rel+'"][data-sb-global-favicon="true"]')||document.querySelector('link[rel="'+rel+'"]');if(!link){link=document.createElement('link');link.rel=rel;document.head.appendChild(link);}link.dataset.sbGlobalFavicon='true';if(sizes)link.sizes=sizes;link.href=url;return link;}
function applyStreamBanditGlobalFavicon(){try{const cleanUrl=sbGlobalFaviconUrl();const bustedUrl=cleanUrl+(cleanUrl.includes('?')?'&':'?')+'sbFav='+Date.now();sbSetFaviconLink('icon','32x32',bustedUrl);sbSetFaviconLink('shortcut icon','32x32',bustedUrl);sbSetFaviconLink('apple-touch-icon','180x180',bustedUrl);document.documentElement.dataset.streamBanditFavicon='loaded';document.dispatchEvent(new CustomEvent('streambandit:favicon-loaded',{detail:{version:VERSION,url:cleanUrl,source:'stream-bandit-shell-v6-24.js'}}));}catch(e){}}
function fixedRouteValue(v){if(!v||typeof v!=='string'||!v.includes('.html'))return v;try{const u=new URL(v,location.href);const parts=u.pathname.split('/');const file=parts.pop();const clean=file.split('#')[0];if(ROUTE_FIXES[clean]){parts.push(ROUTE_FIXES[clean]);u.pathname=parts.join('/');return u.pathname.split('/').pop()+u.search+u.hash;}}catch(e){}const m=v.match(/([^\/?#]+\.html)(.*)$/);if(m&&ROUTE_FIXES[m[1]])return ROUTE_FIXES[m[1]]+(m[2]||'');return v;}
function applyRouteGuard(root=document){try{root.querySelectorAll&&root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(el=>{['href','action','data-href','data-target','data-route','data-url'].forEach(attr=>{const val=el.getAttribute&&el.getAttribute(attr);if(!val)return;const fixed=fixedRouteValue(val);if(fixed!==val){el.setAttribute(attr,fixed);el.dataset.sbRouteGuard='fixed';}});});document.documentElement.dataset.streamBanditRouteGuard='v7-12-41';}catch(e){}}
function guardClick(e){const a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;const val=a.getAttribute('href');const fixed=fixedRouteValue(val);if(fixed&&fixed!==val){e.preventDefault();location.href=fixed;}}
function addStyle(){if(document.getElementById('sbSharedShellStyle'))return;const s=document.createElement('style');s.id='sbSharedShellStyle';s.textContent=`.sb-shell-menu-toggle{position:fixed;left:18px;top:96px;z-index:10002;width:54px;height:54px;border-radius:18px;border:1px solid #22d3a65c;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-size:24px;font-weight:950;box-shadow:0 14px 40px #0007;cursor:pointer}.sb-shell-scrim{position:fixed;inset:0;background:#0008;opacity:0;pointer-events:none;z-index:10000;transition:.2s}.sb-shell-scrim.show{opacity:1;pointer-events:auto}.sb-shell-drawer{position:fixed;left:0;top:0;bottom:0;width:min(430px,92vw);background:linear-gradient(180deg,#08101cfc,#120c26fc);border-right:1px solid #ffffff24;box-shadow:30px 0 90px #000a;transform:translateX(-104%);transition:.24s;z-index:10001;padding:18px;overflow-y:auto;color:#fff;font-family:Inter,system-ui,Arial,sans-serif}.sb-shell-drawer.open{transform:translateX(0)}.sb-shell-top{display:flex;justify-content:space-between;gap:12px}.sb-shell-top h2{margin:0 0 6px}.sb-shell-muted{color:#b9c0d8;font-size:14px;line-height:1.45}.sb-shell-close{width:42px;height:42px;border-radius:14px;border:1px solid #ffffff24;background:#ffffff14;color:#fff;font-size:20px;cursor:pointer}.sb-shell-filter{display:flex;gap:8px;border:1px solid #ffffff24;border-radius:16px;background:#0004;padding:10px;margin:12px 0}.sb-shell-filter input{flex:1;background:transparent;border:0;color:#fff;outline:0}.sb-shell-group{border:1px solid #ffffff1a;border-radius:18px;background:#ffffff0e;margin-bottom:10px;overflow:hidden}.sb-shell-group-btn{width:100%;display:flex;align-items:center;justify-content:space-between;border:0;background:transparent;color:#fff;font-weight:950;padding:12px 14px;cursor:pointer}.sb-shell-items{display:none;padding:0 12px 12px}.sb-shell-group.open .sb-shell-items{display:grid;gap:8px}.sb-shell-link{display:flex;align-items:center;gap:8px;justify-content:flex-start;border-radius:14px;background:#414667b8;color:#fff;text-decoration:none;font-size:13px;font-weight:950;padding:11px 15px}.sb-shell-pill{display:inline-flex;width:max-content;border-radius:999px;padding:5px 8px;background:#ffffff18;border:1px solid #ffffff1a;color:#dfffee;font-size:11px;font-weight:900}.sb-shell-hidden{display:none!important}.sb-search-overlay{position:absolute;right:0;top:56px;width:min(620px,92vw);max-height:70vh;overflow:auto;border:1px solid #22d3a657;border-radius:22px;background:linear-gradient(180deg,#08101cfa,#120c26fa);box-shadow:0 30px 90px #000c;padding:12px;display:none;z-index:9999;color:#fff}.sb-search-overlay.open{display:block}.sb-search-result{display:grid;grid-template-columns:72px 1fr;gap:10px;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:16px;background:#ffffff0d;padding:9px;margin:8px 0}.sb-search-result:hover{outline:3px solid #22d3a6}.sb-search-result small{display:block;color:#b9c0d8;margin-top:4px;line-height:1.35}.sb-search-desc{display:block;color:#d6def7;margin-top:5px;font-size:12px;line-height:1.35}.sb-search-thumb{aspect-ratio:16/9;border-radius:10px;background:#ffffff14;overflow:hidden;display:grid;place-items:center;color:#dfffee;font-size:20px}.sb-search-thumb img{width:100%;height:100%;object-fit:cover}.sb-search-note{padding:12px 14px;border-radius:18px;background:#ffb1421f;border:1px solid #ffb14252;color:#ffe7ad;font-weight:850;margin-top:10px}.sb-search-close{border:0;border-radius:999px;padding:9px 12px;background:#414667;color:#fff;font-weight:950;cursor:pointer}`;document.head.appendChild(s);}
function injectDrawer(){['menuToggle','drawer','scrim','sbShellMenuToggle','sbShellDrawer','sbShellScrim'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});const btn=document.createElement('button');btn.id='sbShellMenuToggle';btn.className='sb-shell-menu-toggle';btn.textContent='☰';const scrim=document.createElement('div');scrim.id='sbShellScrim';scrim.className='sb-shell-scrim';const drawer=document.createElement('nav');drawer.id='sbShellDrawer';drawer.className='sb-shell-drawer';const groups={};pages.forEach(p=>{const g=groupFor(p);(groups[g]||(groups[g]=[])).push(p);});const groupHtml=groupOrder.filter(g=>groups[g]).map((g,i)=>`<section class="sb-shell-group ${i<5?'open':''}" data-sb-wrap><button class="sb-shell-group-btn" data-sb-group><span>${esc(g)}</span><span class="sb-shell-pill">${groups[g].length}</span></button><div class="sb-shell-items">${groups[g].map(p=>`<a class="sb-shell-link" href="${p[2]}" data-sb-text="${esc((p[1]+' '+p[3]).toLowerCase())}"><span style="width:24px">${p[0]}</span>${esc(p[1])}</a>`).join('')}</div></section>`).join('');drawer.innerHTML=`<div class="sb-shell-top"><div><h2>🎬 Stream Bandit</h2><div class="sb-shell-muted">${VERSION}. Clean machine menu + route tools promoted.</div></div><button id="sbShellClose" class="sb-shell-close">×</button></div><div class="sb-shell-filter"><span>🔎</span><input id="sbShellFilter" placeholder="Filter menu..."></div>${groupHtml}`;document.body.append(scrim,drawer,btn);function open(){drawer.classList.add('open');scrim.classList.add('show')}function close(){drawer.classList.remove('open');scrim.classList.remove('show')}btn.onclick=open;scrim.onclick=close;drawer.querySelector('#sbShellClose').onclick=close;drawer.querySelector('#sbShellFilter').oninput=function(){const q=this.value.toLowerCase();drawer.querySelectorAll('[data-sb-wrap]').forEach(w=>{let any=false;w.querySelectorAll('.sb-shell-link').forEach(a=>{const hit=!q||a.dataset.sbText.includes(q);a.classList.toggle('sb-shell-hidden',!hit);if(hit)any=true;});w.classList.toggle('sb-shell-hidden',!any);if(q&&any)w.classList.add('open');});};drawer.addEventListener('click',e=>{const g=e.target.closest('[data-sb-group]');if(g)g.closest('.sb-shell-group').classList.toggle('open');});document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});}
function ensureSearch(){let input=document.getElementById('globalSearch')||document.getElementById('topSearch')||document.querySelector('.search input')||document.querySelector('input[placeholder*="Search"]');if(!input)return null;let wrap=input.closest('.searchWrap')||input.closest('.search-wrap')||input.closest('.search')||input.parentElement;if(!wrap)return null;wrap.style.position='relative';wrap.style.zIndex='200';let overlay=wrap.querySelector('.sb-search-overlay')||document.getElementById('searchOverlay');if(overlay)overlay.remove();overlay=document.createElement('div');overlay.id='searchOverlay';overlay.className='sb-search-overlay';overlay.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px"><b id="searchTitle">Search results</b><button id="closeSearch" class="sb-search-close" type="button">Close</button></div><div id="searchResults"></div><div class="sb-search-note">Press Enter or Search for full Global Search in this tab. Click a movie result for Details.</div>';wrap.appendChild(overlay);const button=document.getElementById('globalSearchBtn')||document.getElementById('topSearchBtn')||wrap.querySelector('button')||input.parentElement.querySelector('button');return{input,overlay,button,wrap};}
function fullSearch(input){const q=(input&&input.value||'').trim();location.href=GLOBAL_SEARCH+(q?'?q='+encodeURIComponent(q):'');}
function renderSearch(input,overlay){const q=(input.value||'').trim().toLowerCase();if(q.length<2){overlay.classList.remove('open');return;}const title=overlay.querySelector('#searchTitle');const results=overlay.querySelector('#searchResults');const pageHits=pages.filter(p=>(p[1]+' '+p[3]).toLowerCase().includes(q)).slice(0,5);const movieHits=movies.filter(m=>(String(m.title||'')+' '+String(m.description||'')+' '+arr(m.genres).join(' ')+' '+arr(m.tags).join(' ')).toLowerCase().includes(q)).slice(0,7);let html='';movieHits.forEach(m=>{const im=poster(m);const id=encodeURIComponent(m.id||'');const d=snippet(m.description||'No description yet.');html+=`<a class="sb-search-result" href="${CURRENT_DETAILS}?id=${id}"><span class="sb-search-thumb">${im?`<img src="${esc(im)}" alt="">`:'🎬'}</span><span><b>${esc(m.title||'Untitled')}</b><small>Movie result — Clean Details</small><span class="sb-search-desc">${esc(d)}</span></span></a>`;});pageHits.forEach(p=>{html+=`<a class="sb-search-result" href="${p[2]}"><span class="sb-search-thumb">${p[0]}</span><span><b>${esc(p[1])}</b><small>Page result</small><span class="sb-search-desc">${esc(p[3]||'')}</span></span></a>`;});const total=movieHits.length+pageHits.length;title.textContent=total?`Results for “${q}”`:`No quick results for “${q}”`;results.innerHTML=html||'<div class="sb-search-note">No overlay results. Press Enter for full Global Search.</div>';overlay.classList.add('open');}
async function loadMovies(){try{if(!window.supabase)return;const c=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await c.from('sb_movies').select('*').order('created_at',{ascending:false}).limit(150);if(!r.error)movies=(r.data||[]).filter(m=>String(m.status||'published')!=='archived');}catch(e){}}
async function init(){applyStreamBanditGlobalFavicon();addStyle();injectDrawer();applyRouteGuard(document);document.addEventListener('click',guardClick,true);try{new MutationObserver(muts=>muts.forEach(m=>m.addedNodes&&m.addedNodes.forEach(n=>{if(n.nodeType===1)applyRouteGuard(n);}))).observe(document.documentElement,{childList:true,subtree:true});}catch(e){}await loadMovies();const s=ensureSearch();if(s){s.input.addEventListener('input',()=>renderSearch(s.input,s.overlay),true);s.input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();fullSearch(s.input);}if(e.key==='Escape')s.overlay.classList.remove('open');},true);if(s.button){s.button.addEventListener('click',e=>{e.preventDefault();fullSearch(s.input);},true);}const close=s.overlay.querySelector('#closeSearch');if(close)close.onclick=()=>s.overlay.classList.remove('open');document.addEventListener('click',e=>{if(!s.wrap.contains(e.target))s.overlay.classList.remove('open');});}document.documentElement.dataset.streamBanditShell='v7-12-41-clean-machine-menu';document.documentElement.dataset.streamBanditRouteGuardVersion=VERSION;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();