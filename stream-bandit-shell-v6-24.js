/* Stream Bandit V7.6.3 Shared Shell / Menu Control Tower Label
   Safe UI pass only: keeps grouped drawer/search behaviour and labels Platform Builder as Platform Control Tower.
   No saves, uploads, deletes, billing, permission writes, database writes or live/index promotion. */
(function(){
'use strict';
const VERSION='V7.6.3 Shared Shell Menu Control Tower Label';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const GLOBAL_SEARCH='global-search-admin-shell-v6-52-test.html';
const CURRENT_DETAILS='details-global-helpers-v7-3-1-test.html';
let movies=[];
const pages=[
['🏠','Home','home-watch-shell-v6-32-test.html','Watch home start current'],
['🎬','Details','details-global-helpers-v7-3-1-test.html','Single-title Details V7.3.1'],
['▶️','Player 1','player-one-global-helpers-v7-3-3-test.html','Single-title Player 1 V7.3.3'],
['⏯️','Continue Watching','continue-watching-watch-shell-v6-35-test.html','Promoted to Continue Watching V7.3.9'],
['🕘','Watch History','watch-history-watch-shell-v6-36-test.html','Promoted to Watch History V7.4.0'],
['🔖','Watchlist','watchlist-watch-shell-v6-37-test.html','Personal saved list, no Play All'],
['⭐','Favourites','favourites-watch-shell-v6-38-test.html','Personal saved list, no Play All'],
['👍','Liked','liked-watch-shell-v6-39-test.html','Personal saved list, no Play All'],
['♿','Accessibility','accessibility-watch-shell-v6-40-test.html','Promoted to Accessibility V7.4.2'],
['🎞️','Library','library-browse-shell-v6-41-test.html','Browse library movies current'],
['🟢','Supabase Library','supabase-library-browse-shell-v6-43-test.html','Supabase library movies current'],
['🏷️','Genres','genres-browse-shell-v6-44-test.html','Genre discovery current'],
['🔎','Global Search','global-search-admin-shell-v6-52-test.html','Global search results'],
['ℹ️','About','about-browse-shell-v6-42-test.html','About / platform info'],
['📃','Playlists','playlists-browse-shell-v6-47-test.html','Group playback owner / Player 2 later'],
['📺','Channels','channels-browse-shell-v6-45-test.html','Group playback owner / Player 2 later'],
['📡','My Channel','my-channel-creator-shell-v6-48-test.html','Creator channel / group playback owner'],
['🧺','Collections','collections-browse-shell-v6-46-1-test.html','Curated group playback owner'],
['▶️▶️','Player 2','player-two-global-helpers-v7-3-4-test.html','Group / queue Player 2 V7.3.4'],
['⬆️','Submit Video','submit-video-creator-shell-v6-49-test.html','Creator submit video current'],
['📜','Rules','rules-creator-shell-v6-50-test.html','Creator rules current'],
['🧾','Review Queue','review-queue-creator-shell-v6-51-test.html','Creator review queue current'],
['⚙️','Settings','settings-admin-shell-v6-54-test.html','Settings hub / control hub'],
['🎨','Settings Studio','settings-studio-admin-shell-v6-55-test.html','Settings Studio preview/current route'],
['👤','Profile Settings','profile-settings-admin-shell-v6-56-test.html','Profile settings V7.5.8 route'],
['🏗️','Web Builder','web-builder-admin-shell-v6-57-test.html','Web builder current; owns global display/theme and page/form layout'],
['🧱','Platform Control Tower','platform-builder-admin-shell-v6-58-test.html','One-click full platform scanner: 48/48 route map, diagnostics, table counts, ownership and release gates'],
['🧭','Final Shell Navigation','final-shell-navigation-admin-shell-v6-59-test.html','Final shell checkpoint'],
['🛠️','Admin Centre','admin-centre-admin-shell-v6-53-test.html','Admin centre hub current'],
['🚦','Live Readiness','live-readiness-admin-shell-v6-60-test.html','Release smoke test current'],
['📋','All Pages Version Registry','all-pages-version-registry-v6-29-test.html','Full registry current checkpoint'],
['🧪','Test Checklist','test-checklist-admin-shell-v6-62-test.html','Admin checklist current'],
['🧰','Tools Page','tools-page-admin-shell-v6-63-test.html','Admin tools current'],
['✅','Health Check','health-check-admin-shell-v6-64-test.html','Health readiness current'],
['🎥','Mux Manager','mux-manager-admin-shell-v6-65-test.html','Mux video/HLS current'],
['🪣','Storage Prep','storage-prep-admin-shell-v6-66-test.html','Supabase storage current'],
['🛡️','Backup / Safety','backup-safety-admin-shell-v6-67-test.html','Backup safety current'],
['👥','User Dashboard Concept','user-dashboard-concept-v6-68-test.html','User dashboard planning read-only'],
['💳','Fair Pricing Matrix','plans-pricing-matrix-v6-69-test.html','Pricing/plans read-only'],
['🔐','Permissions Matrix','permissions-matrix-v6-70-test.html','Permissions/feature access read-only'],
['📚','Policy & FAQ Centre','policy-faq-centre-v6-71-test.html','Policy/FAQ docs read-only'],
['🔎','Original Global Search','global-search-v5-80-test.html','Legacy original global search'],
['🎨','Original Settings Studio','settings-controls-v5-81-test.html','Legacy original settings studio'],
['🧭','Original Final Shell','final-shell-navigation-v5-79-test.html','Legacy original final shell'],
['🚦','Original Live Readiness','live-readiness-standalone-v5-64-test.html','Legacy original live readiness'],
['🧭','Old Final Shell Upgrade','old-final-shell-menu-upgrade-v6-26-test.html','Reference old final shell'],
['🔗','Reconciliation Batch 1','reconciliation-batch1-v6-24-test.html','Shared shell reconciliation launcher'],
['⭐','Favourite Tools V5.24.1','tools-v5-24-1.html','Protected working tools page']
];
const groupOrder=['Watch','Browse','Group Play','Creator','Settings','Admin','User Management','Legacy / Reference'];
function esc(s){return String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function arr(v){if(Array.isArray(v))return v;if(typeof v==='string'&&v.trim()){try{const j=JSON.parse(v);if(Array.isArray(j))return j}catch(e){}return v.split(',').map(x=>x.trim()).filter(Boolean)}return []}
function poster(m){return m.thumbnail_url||m.poster_url||m.image_url||m.backdrop_url||m.thumb||''}
function snippet(s,n=118){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s}
function groupFor(p){const n=p[1];
 if(['Home','Details','Player 1','Continue Watching','Watch History','Watchlist','Favourites','Liked','Accessibility'].includes(n))return 'Watch';
 if(['Library','Supabase Library','Genres','Global Search','About'].includes(n))return 'Browse';
 if(['Playlists','Channels','My Channel','Collections','Player 2'].includes(n))return 'Group Play';
 if(['Submit Video','Rules','Review Queue'].includes(n))return 'Creator';
 if(['Settings','Settings Studio','Profile Settings','Web Builder','Platform Control Tower','Final Shell Navigation'].includes(n))return 'Settings';
 if(['Admin Centre','Live Readiness','All Pages Version Registry','Test Checklist','Tools Page','Health Check','Mux Manager','Storage Prep','Backup / Safety'].includes(n))return 'Admin';
 if(['User Dashboard Concept','Fair Pricing Matrix','Permissions Matrix','Policy & FAQ Centre'].includes(n))return 'User Management';
 return 'Legacy / Reference';
}
function addStyle(){
 if(document.getElementById('sbSharedShellStyle'))return;
 const s=document.createElement('style');
 s.id='sbSharedShellStyle';
 s.textContent=`.sb-shell-menu-toggle{position:fixed;left:18px;top:96px;z-index:10002;width:54px;height:54px;border-radius:18px;border:1px solid #22d3a65c;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-size:24px;font-weight:950;box-shadow:0 14px 40px #0007;cursor:pointer}.sb-shell-scrim{position:fixed;inset:0;background:#0008;opacity:0;pointer-events:none;z-index:10000;transition:.2s}.sb-shell-scrim.show{opacity:1;pointer-events:auto}.sb-shell-drawer{position:fixed;left:0;top:0;bottom:0;width:min(430px,92vw);background:linear-gradient(180deg,#08101cfc,#120c26fc);border-right:1px solid #ffffff24;box-shadow:30px 0 90px #000a;transform:translateX(-104%);transition:.24s;z-index:10001;padding:18px;overflow-y:auto;color:#fff;font-family:Inter,system-ui,Arial,sans-serif}.sb-shell-drawer.open{transform:translateX(0)}.sb-shell-top{display:flex;justify-content:space-between;gap:12px}.sb-shell-top h2{margin:0 0 6px}.sb-shell-muted{color:#b9c0d8;font-size:14px;line-height:1.45}.sb-shell-close{width:42px;height:42px;border-radius:14px;border:1px solid #ffffff24;background:#ffffff14;color:#fff;font-size:20px;cursor:pointer}.sb-shell-filter{display:flex;gap:8px;border:1px solid #ffffff24;border-radius:16px;background:#0004;padding:10px;margin:12px 0}.sb-shell-filter input{flex:1;background:transparent;border:0;color:#fff;outline:0}.sb-shell-group{border:1px solid #ffffff1a;border-radius:18px;background:#ffffff0e;margin-bottom:10px;overflow:hidden}.sb-shell-group-btn{width:100%;display:flex;align-items:center;justify-content:space-between;border:0;border-radius:0;background:transparent;color:#fff;font-weight:950;padding:12px 14px;cursor:pointer}.sb-shell-items{display:none;padding:0 12px 12px}.sb-shell-group.open .sb-shell-items{display:grid;gap:8px}.sb-shell-link{display:flex;align-items:center;gap:8px;justify-content:flex-start;border-radius:14px;background:#414667b8;color:#fff;text-decoration:none;font-size:13px;font-weight:950;padding:11px 15px}.sb-shell-pill{display:inline-flex;width:max-content;border-radius:999px;padding:5px 8px;background:#ffffff18;border:1px solid #ffffff1a;color:#dfffee;font-size:11px;font-weight:900}.sb-shell-hidden{display:none!important}.sb-search-overlay{position:absolute;right:0;top:56px;width:min(620px,92vw);max-height:70vh;overflow:auto;border:1px solid #22d3a657;border-radius:22px;background:linear-gradient(180deg,#08101cfa,#120c26fa);box-shadow:0 30px 90px #000c;padding:12px;display:none;z-index:9999;color:#fff}.sb-search-overlay.open{display:block}.sb-search-result{display:grid;grid-template-columns:72px 1fr;gap:10px;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:16px;background:#ffffff0d;padding:9px;margin:8px 0}.sb-search-result:hover{outline:3px solid #22d3a6}.sb-search-result small{display:block;color:#b9c0d8;margin-top:4px;line-height:1.35}.sb-search-desc{display:block;color:#d6def7;margin-top:5px;font-size:12px;line-height:1.35}.sb-search-thumb{aspect-ratio:16/9;border-radius:10px;background:#ffffff14;overflow:hidden;display:grid;place-items:center;color:#dfffee;font-size:20px}.sb-search-thumb img{width:100%;height:100%;object-fit:cover}.sb-search-note{padding:12px 14px;border-radius:18px;background:#ffb1421f;border:1px solid #ffb14252;color:#ffe7ad;font-weight:850;margin-top:10px}.sb-search-close{border:0;border-radius:999px;padding:9px 12px;background:#414667;color:#fff;font-weight:950;cursor:pointer}`;
 document.head.appendChild(s);
}
function injectDrawer(){
 ['menuToggle','drawer','scrim','sbShellMenuToggle','sbShellDrawer','sbShellScrim'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
 const btn=document.createElement('button');btn.id='sbShellMenuToggle';btn.className='sb-shell-menu-toggle';btn.textContent='☰';
 const scrim=document.createElement('div');scrim.id='sbShellScrim';scrim.className='sb-shell-scrim';
 const drawer=document.createElement('nav');drawer.id='sbShellDrawer';drawer.className='sb-shell-drawer';
 const groups={};pages.forEach(p=>{const g=groupFor(p);(groups[g]||(groups[g]=[])).push(p)});
 const groupHtml=groupOrder.filter(g=>groups[g]).map((g,i)=>`<section class="sb-shell-group ${i<5?'open':''}" data-sb-wrap><button class="sb-shell-group-btn" data-sb-group><span>${esc(g)}</span><span class="sb-shell-pill">${groups[g].length}</span></button><div class="sb-shell-items">${groups[g].map(p=>`<a class="sb-shell-link" href="${p[2]}" data-sb-text="${esc((p[1]+' '+p[3]).toLowerCase())}"><span style="width:24px">${p[0]}</span>${esc(p[1])}</a>`).join('')}</div></section>`).join('');
 drawer.innerHTML=`<div class="sb-shell-top"><div><h2>🎬 Stream Bandit</h2><div class="sb-shell-muted">${VERSION}. Groups: Watch, Browse, Group Play, Creator, Settings, Admin, User Management and Legacy / Reference.</div></div><button id="sbShellClose" class="sb-shell-close">×</button></div><div class="sb-shell-filter"><span>🔎</span><input id="sbShellFilter" placeholder="Filter menu..."></div>${groupHtml}`;
 document.body.append(scrim,drawer,btn);
 function open(){drawer.classList.add('open');scrim.classList.add('show')}
 function close(){drawer.classList.remove('open');scrim.classList.remove('show')}
 btn.onclick=open;scrim.onclick=close;drawer.querySelector('#sbShellClose').onclick=close;
 drawer.querySelector('#sbShellFilter').oninput=function(){const q=this.value.toLowerCase();drawer.querySelectorAll('[data-sb-wrap]').forEach(w=>{let any=false;w.querySelectorAll('.sb-shell-link').forEach(a=>{const hit=!q||a.dataset.sbText.includes(q);a.classList.toggle('sb-shell-hidden',!hit);if(hit)any=true});w.classList.toggle('sb-shell-hidden',!any);if(q&&any)w.classList.add('open')})};
 drawer.addEventListener('click',e=>{const g=e.target.closest('[data-sb-group]');if(g)g.closest('.sb-shell-group').classList.toggle('open')});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
}
function ensureSearch(){
 let input=document.getElementById('globalSearch')||document.getElementById('topSearch')||document.querySelector('.search input')||document.querySelector('input[placeholder*="Search"]');
 if(!input)return null;
 let wrap=input.closest('.searchWrap')||input.closest('.search-wrap')||input.closest('.search')||input.parentElement;
 if(!wrap)return null;
 wrap.style.position='relative';wrap.style.zIndex='200';
 let overlay=wrap.querySelector('.sb-search-overlay')||document.getElementById('searchOverlay');if(overlay)overlay.remove();
 overlay=document.createElement('div');overlay.id='searchOverlay';overlay.className='sb-search-overlay';
 overlay.innerHTML='<div style="display:flex;justify-content:space-between;gap:10px"><b id="searchTitle">Search results</b><button id="closeSearch" class="sb-search-close" type="button">Close</button></div><div id="searchResults"></div><div class="sb-search-note">Press Enter or Search for full Global Search in this tab. Click a movie result for Details.</div>';
 wrap.appendChild(overlay);
 const button=document.getElementById('globalSearchBtn')||document.getElementById('topSearchBtn')||wrap.querySelector('button')||input.parentElement.querySelector('button');
 return{input,overlay,button,wrap};
}
function fullSearch(input){const q=(input&&input.value||'').trim();location.href=GLOBAL_SEARCH+(q?'?q='+encodeURIComponent(q):'')}
function renderSearch(input,overlay){
 const q=(input.value||'').trim().toLowerCase();
 if(q.length<2){overlay.classList.remove('open');return}
 const title=overlay.querySelector('#searchTitle'),results=overlay.querySelector('#searchResults');
 const pageHits=pages.filter(p=>(p[1]+' '+p[3]).toLowerCase().includes(q)).slice(0,5);
 const movieHits=movies.filter(m=>(String(m.title||'')+' '+String(m.description||'')+' '+arr(m.genres).join(' ')+' '+arr(m.tags).join(' ')).toLowerCase().includes(q)).slice(0,7);
 let html='';
 movieHits.forEach(m=>{const im=poster(m),id=encodeURIComponent(m.id||''),d=snippet(m.description||'No description yet.');html+=`<a class="sb-search-result" href="${CURRENT_DETAILS}?id=${id}"><span class="sb-search-thumb">${im?`<img src="${esc(im)}" alt="">`:'🎬'}</span><span><b>${esc(m.title||'Untitled')}</b><small>Movie result — Details</small><span class="sb-search-desc">${esc(d)}</span></span></a>`});
 pageHits.forEach(p=>{html+=`<a class="sb-search-result" href="${p[2]}"><span class="sb-search-thumb">${p[0]}</span><span><b>${esc(p[1])}</b><small>Page result</small><span class="sb-search-desc">${esc(p[3]||'')}</span></span></a>`});
 const total=movieHits.length+pageHits.length;
 title.textContent=total?`Results for “${q}”`:`No quick results for “${q}”`;
 results.innerHTML=html||'<div class="sb-search-note">No overlay results. Press Enter for full Global Search.</div>';
 overlay.classList.add('open');
}
async function loadMovies(){try{if(!window.supabase)return;const c=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await c.from('sb_movies').select('*').order('created_at',{ascending:false}).limit(150);if(!r.error)movies=(r.data||[]).filter(m=>String(m.status||'published')!=='archived')}catch(e){}}
async function init(){
 addStyle();injectDrawer();await loadMovies();
 const s=ensureSearch();
 if(s){
  s.input.addEventListener('input',()=>renderSearch(s.input,s.overlay),true);
  s.input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();fullSearch(s.input)}if(e.key==='Escape')s.overlay.classList.remove('open')},true);
  if(s.button)s.button.addEventListener('click',e=>{e.preventDefault();fullSearch(s.input)},true);
  const close=s.overlay.querySelector('#closeSearch');if(close)close.onclick=()=>s.overlay.classList.remove('open');
  document.addEventListener('click',e=>{if(!s.wrap.contains(e.target))s.overlay.classList.remove('open')});
 }
 document.documentElement.dataset.streamBanditShell='v7-6-3';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();