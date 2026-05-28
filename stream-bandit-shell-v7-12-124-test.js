/* Stream Bandit V7.12.124 Route Repair TEST Shell
   Test-only shell. Same drawer/layout direction as protected shell.
   Fixes current route URLs, protects owner/admin routes, adds Pages Manager + Published Preview,
   and loads Supabase SDK safely if a page forgot to load it.
   No index promotion. No Supabase writes. No payments. */

(function(){
'use strict';

const VERSION='V7.12.124 Route Repair TEST Shell';
const DEF='test-page';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const SUPABASE_SDK='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const FAVICON_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/global/logo-1779203548544.png';

const R={
home:'home-global-helpers-v7-4-4-test.html',
details:'details-clean-machine-v7-12-38-test.html',
player1:'player-one-global-helpers-v7-3-3-test.html',
continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
watchlist:'watchlist-clean-machine-v7-12-43-test.html',
favourites:'favourites-clean-machine-v7-12-41-test.html',
liked:'likes-clean-machine-v7-12-42-test.html',
accessibility:'accessibility-clean-machine-v7-12-44-test.html',

library:'library-global-helpers-v7-4-8-test.html',
supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
genres:'genres-clean-machine-v7-12-45-test.html',
search:'global-search-global-helpers-v7-4-9-test.html',
about:'about-global-helpers-v7-4-7-test.html',

playlists:'playlists-global-helpers-v7-5-2-test.html',
channels:'channels-global-helpers-v7-5-3-test.html',
myChannel:'my-channel-clean-machine-v7-12-47-test.html',
collections:'collections-clean-machine-v7-12-48-test.html',
player2:'player-2-progress-helper-v6-78-9-4-test.html',

submit:'submit-video-clean-machine-v7-12-79-test.html',
rules:'rules-clean-machine-v7-12-82-test.html',
review:'review-queue-clean-machine-v7-12-80-publish-test.html',

settings:'settings-platform-control-hub-v7-12-85-test.html',
settingsHub:'settings-platform-control-hub-v7-12-85-test.html',
studio:'settings-studio-admin-shell-v6-55-test.html',
profile:'profile-settings-live-ready-v7-12-90-test.html',

builder:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
builderStudio:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
pagesManager:'web-builder-pages-manager-v7-12-111-test.html',
publishedPreview:'web-builder-shared-style-preview-v7-12-117-test.html?page=test-page',
formAdvanced:'web-builder-form-save-v7-12-94-test.html?page=test-page',
formInbox:'web-builder-form-submissions-v7-12-94-test.html?page=test-page',

brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
policyCentre:'policy-documents-centre-v7-12-119-test.html',
policyProof:'policy-reader-v7-12-119-test.html?policy=terms',
policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',

admin:'admin-centre-command-deck-v7-12-121-test.html',
readiness:'live-readiness-global-helpers-v7-10-2-test.html',
registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',
checklist:'test-checklist-global-helpers-v7-10-5-test.html',
tools:'tools-page-global-helpers-v7-10-1-test.html',
health:'health-check-global-helpers-v7-10-6-test.html',
mux:'mux-manager-global-helpers-v7-10-7-test.html',
storage:'storage-prep-global-helpers-v7-10-8-test.html',
backup:'backup-safety-global-helpers-v7-10-9-test.html',

userDashboard:'user-management-dashboard-v7-11-2-test.html',
pricing:'plans-pricing-feature-shop-v7-11-3-test.html',
permissions:'permissions-matrix-user-management-v7-11-4-test.html',

cleanMenu:'stream-bandit-clean-machine-menu-v7-12-40-test.html',
guard:'platform-control-tower-route-guard-proof-v7-12-33-test.html',
pointer:'stream-bandit-route-pointer-machine-v7-12-36-test.html',
finalShell:'final-shell-navigation-global-helpers-v7-5-9-test.html',
oneMachine:'stream-bandit-one-machine-v7-12-72-test.html',
platformControl:'platform-control-centre-combined-v7-12-61-test.html',
brandLogoHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
faviconBuilder:'favicon-app-icon-builder-v7-12-15-test.html'
};

window.StreamBanditRoutes=Object.assign(window.StreamBanditRoutes||{},R);

const FIX={
'profile-settings-global-helpers-v7-5-8-test.html':R.profile,
'profile-settings-admin-shell-v6-56-test.html':R.profile,

'settings-studio-admin-shell-v6-55-test.html':R.studio,
'settings-sources-owner-launcher-v7-6-6-test.html':R.studio,
'settings-platform-control-hub-v7-1-8-test.html':R.settings,
'settings-platform-control-hub-v7-1-6-test.html':R.settings,
'settings-admin-shell-v6-54-test.html':R.settings,

'web-builder-full-edit-lock-v7-8-6-test.html':R.builder,
'web-builder-admin-shell-v6-57-test.html':R.builder,
'web-builder-global-helpers-v7-9-3-test.html':R.builder,
'web-builder-live-studio-v7-12-93-test.html':R.builder,
'web-builder-live-studio-v7-12-97-test.html':R.builder,
'web-builder-shared-style-preview-v7-9-0-test.html':R.publishedPreview,
'web-builder-shared-style-preview-v7-9-2-test.html':R.publishedPreview,
'web-builder-form-save-v7-6-5-test.html':R.formAdvanced,
'web-builder-form-save-v7-6-7-test.html':R.formAdvanced,

'submit-video-clean-machine-v7-12-53-test.html':R.submit,
'submit-video-clean-machine-v7-12-75-test.html':R.submit,
'submit-video-clean-machine-v7-12-78-test.html':R.submit,
'submit-video-creator-shell-v6-49-test.html':R.submit,
'submit-video-global-helpers-v7-5-6-test.html':R.submit,

'rules-clean-machine-v7-12-54-test.html':R.rules,
'rules-clean-machine-v7-12-81-test.html':R.rules,
'rules-creator-shell-v6-50-test.html':R.rules,
'rules-global-helpers-v7-5-5-test.html':R.rules,

'review-queue-clean-machine-v7-12-55-test.html':R.review,
'review-queue-global-helpers-v7-5-7-test.html':R.review,
'review-queue-approved-to-movies-v7-0-0-test.html':R.review,
'review-queue-creator-shell-v6-51-test.html':R.review,

'my-channel-global-helpers-v7-5-0-test.html':R.myChannel,
'collections-clean-machine-v7-12-51-test.html':R.collections,
'player-2-clean-machine-v7-12-58-test.html':R.player2,

'global-search-admin-shell-v6-52-test.html':R.search,
'global-search-v5-90-test.html':R.search,
'home-watch-shell-v6-32-test.html':R.home,

'admin-centre-command-deck-v7-10-0-test.html':R.admin,
'all-pages-version-registry-v7-1-4-full-test.html':R.registry,
'policy-agreements-centre-v7-11-6-test.html':R.policyCentre,
'policy-reader-published-row-v7-12-27-test.html':R.policyProof,
'policy-admin-save-editor-v7-12-25-test.html':R.policyAdmin
};

const PUBLIC=[
['Watch','🏠','Home',R.home,'Clean Home current'],
['Watch','🎬','Details',R.details,'Clean Details'],
['Watch','▶️','Player 1',R.player1,'Single-title Player'],
['Watch','⏯️','Continue Watching',R.continueWatching,'Resume progress'],
['Watch','🕘','Watch History',R.watchHistory,'Watch history'],
['Watch','🔖','Watchlist',R.watchlist,'Watchlist'],
['Watch','⭐','Favourites',R.favourites,'Favourites'],
['Watch','👍','Liked',R.liked,'Liked'],
['Watch','♿','Accessibility',R.accessibility,'Accessibility'],

['Browse','🎞️','Library',R.library,'Public movie library'],
['Browse','🏷️','Genres',R.genres,'Genres'],
['Browse','🔎','Global Search',R.search,'Full search'],
['Browse','ℹ️','About',R.about,'About Stream Bandit'],

['Group Play','📃','Playlists',R.playlists,'Public playlists'],
['Group Play','📺','Channels',R.channels,'Public channels'],
['Group Play','📡','My Channel',R.myChannel,'Your channel area'],
['Group Play','🧺','Collections',R.collections,'Collections'],
['Group Play','▶️▶️','Player 2',R.player2,'Group Player'],

['Creator','⬆️','Submit Video',R.submit,'Submit videos for review'],
['Creator','📜','Rules',R.rules,'Creator rules'],

['Settings','👤','Profile Settings',R.profile,'Your profile, avatar and banner'],

['Policy','📚','Policy & FAQ Centre',R.policyCentre,'Published policies and help'],
['Policy','📖','Published Policy Proof',R.policyProof,'Read published terms']
];

const OWNER=[
['Settings','⚙️','Settings Hub',R.settings,'Owner/admin settings doorway'],
['Settings','🎨','Settings Studio',R.studio,'Theme and platform settings doorway'],
['Settings','🏗️','Web Builder',R.builder,'Current Builder Studio route'],
['Settings','🗂️','Brand / App Icons',R.brandIcons,'Brand tools'],

['Creator','🧾','Review Queue',R.review,'Admin/owner review and publish queue'],

['Owner','🧭','Pages Manager',R.pagesManager,'Create, edit, hide, restore and guarded-delete Web Builder pages'],
['Owner','👁️','Published Preview',R.publishedPreview,'Interactive published Web Builder page preview'],
['Owner','📬','Form Inbox',R.formInbox,'Builder form submissions inbox'],
['Owner','🧾','Advanced Form',R.formAdvanced,'Passed advanced builder form route'],
['Owner','🏗️','Web Builder Studio',R.builderStudio,'Builder rebuild route'],

['Admin','🛠️','Admin Centre',R.admin,'Admin command deck'],
['Admin','🚦','Live Readiness',R.readiness,'Release smoke test'],
['Admin','📋','Current Routes Registry',R.registry,'Current route scanner'],
['Admin','🧪','Test Checklist',R.checklist,'Testing checklist'],
['Admin','🧰','Tools',R.tools,'Tools'],
['Admin','✅','Health Check',R.health,'Health'],
['Admin','🎥','Mux Manager',R.mux,'Mux'],
['Admin','🪣','Storage Prep',R.storage,'Storage'],
['Admin','🛡️','Backup / Safety',R.backup,'Backup'],

['User Management','👥','User Dashboard',R.userDashboard,'Users'],
['User Management','💳','Pricing Matrix',R.pricing,'Pricing info only; no payments'],
['User Management','🔐','Permissions Matrix',R.permissions,'Permissions'],

['Policy','🧾','Policy Admin Editor',R.policyAdmin,'Policy admin'],

['Owner','🧠','One Machine',R.oneMachine,'Owner diagnostics'],
['Owner','🎛️','Platform Control Centre',R.platformControl,'Owner controls'],
['Owner','🧱','Clean Machine Menu',R.cleanMenu,'Owner diagnostic'],
['Owner','🛡️','Route Guard Proof',R.guard,'Owner diagnostic'],
['Owner','🎯','Route Pointer Machine',R.pointer,'Owner diagnostic'],
['Owner','🧭','Final Shell Navigation',R.finalShell,'Owner diagnostic'],
['Owner','🖼️','Brand Image Helper',R.brandLogoHelper,'Brand helper'],
['Owner','🦌','Favicon / App Icon Builder',R.faviconBuilder,'Icon builder']
];

const GROUPS=['Watch','Browse','Group Play','Creator','Settings','Policy','Admin','User Management','Owner'];

let ownerAllowed=false;
let userEmail='';
let roleLabel='';
let sb=null;
let quickMovies=[];
let quickLoaded=false;
let lastMovieError='';
let sdkPromise=null;

function esc(s){
  return String(s??'').replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function file(v){
  return String(v||'').split('/').pop().split('?')[0].split('#')[0];
}

function pageParam(){
  try{
    return new URL(location.href).searchParams.get('page')||DEF;
  }catch(e){
    return DEF;
  }
}

function pageRoute(route){
  return String(route||'').replace('page=test-page','page='+encodeURIComponent(pageParam()));
}

function fixed(v){
  if(!v||!String(v).includes('.html')) return v;
  const f=file(v);
  return FIX[f]||v;
}

function fixedForValue(v){
  if(!v||!String(v).includes('.html')) return v;
  const f=file(v);
  const target=FIX[f];
  if(!target) return v;
  if(String(target).includes('page=test-page')){
    let p=pageParam();
    try{
      const u=new URL(String(v),location.href);
      p=u.searchParams.get('page')||p;
    }catch(e){}
    return String(target).replace('page=test-page','page='+encodeURIComponent(p));
  }
  return target;
}

function same(a,b){
  return file(fixed(a))===file(fixed(b));
}

function curFile(){
  return file(location.pathname)||'index.html';
}

function pages(){
  return PUBLIC.concat(ownerAllowed?OWNER:[]);
}

function curPage(){
  const c=curFile();
  return pages().find(function(p){ return same(p[3],c); })||null;
}

function arr(v){
  if(Array.isArray(v)) return v;
  if(typeof v==='string'&&v.trim()){
    try{
      const j=JSON.parse(v);
      if(Array.isArray(j)) return j;
    }catch(e){}
    return v.split(',').map(function(x){return x.trim();}).filter(Boolean);
  }
  return [];
}

function poster(m){
  return m.thumbnail_url||m.poster_url||m.poster||m.thumb||m.backdrop_url||m.image_url||'';
}

function snippet(s,n){
  n=n||115;
  s=String(s||'').replace(/\s+/g,' ').trim();
  return s.length>n?s.slice(0,n-1).trim()+'…':s;
}

function addCss(){
  if(document.getElementById('sbSharedShellStyle124')) return;
  const s=document.createElement('style');
  s.id='sbSharedShellStyle124';
  s.textContent=`
.sb-shell-menu-toggle{position:fixed;left:18px;top:96px;z-index:10002;width:54px;height:54px;border-radius:18px;border:1px solid #22d3a65c;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#fff;font-size:24px;font-weight:950;box-shadow:0 14px 40px #0007;cursor:pointer}
.head.sb124-head{display:grid!important;grid-template-columns:minmax(250px,340px) minmax(0,1fr)!important;gap:18px!important;align-items:start!important;overflow:visible!important}
.head.sb124-head>.muted{display:none!important}
.head.sb124-head>.brand{grid-column:1!important;grid-row:1!important}
.head.sb124-head>.sb124-right{grid-column:2!important;grid-row:1!important}
.sb124-right{justify-self:end!important;width:min(760px,100%)!important;display:flex!important;gap:8px!important;align-items:center!important;justify-content:flex-end!important;margin-top:0!important;padding-top:2px!important}
.sb124-icons{display:flex!important;gap:6px!important;align-items:center}
.sb124-icons a{width:34px;height:34px;border-radius:13px;border:1px solid #ffffff2b;background:linear-gradient(135deg,#101529,#17122d);display:grid;place-items:center;text-decoration:none;font-size:16px;box-shadow:0 10px 26px #0007}
.sb124-right .searchWrap{position:relative!important;z-index:99998!important;flex:1 1 auto!important;max-width:470px!important;min-width:260px!important}
.sb124-right .search{width:100%!important}
.sb-shell-scrim{position:fixed;inset:0;background:#0008;opacity:0;pointer-events:none;z-index:10000;transition:.2s}
.sb-shell-scrim.show{opacity:1;pointer-events:auto}
.sb-shell-drawer{position:fixed;left:0;top:0;bottom:0;width:min(440px,92vw);z-index:10001;transform:translateX(-105%);transition:.22s;background:linear-gradient(180deg,#101529,#17122d);border-right:1px solid #ffffff22;box-shadow:30px 0 90px #000a;padding:18px;overflow:auto;color:white;font-family:Inter,system-ui,Arial,sans-serif}
.sb-shell-drawer.show{transform:translateX(0)}
.sb-shell-head{display:flex;gap:12px;align-items:center;justify-content:space-between;margin-bottom:12px}
.sb-shell-brand{display:flex;gap:10px;align-items:center;font-weight:950}
.sb-shell-logo{width:44px;height:44px;border-radius:14px;object-fit:cover;background:#0005}
.sb-shell-close{border:0;border-radius:999px;background:#424968;color:white;font-weight:950;padding:8px 12px;cursor:pointer}
.sb-shell-search{display:flex;gap:8px;border:1px solid #ffffff24;border-radius:999px;background:#0004;padding:9px 12px;margin:10px 0 14px}
.sb-shell-search input{flex:1;background:transparent;border:0;outline:0;color:white}
.sb-shell-group{border:1px solid #ffffff18;border-radius:20px;background:#ffffff08;padding:12px;margin:12px 0}
.sb-shell-group.current{border-color:#22d3a670;box-shadow:0 0 0 2px #22d3a618}
.sb-shell-group h3{margin:0 0 10px;display:flex;align-items:center;justify-content:space-between;font-size:16px}
.sb-shell-count{min-width:30px;text-align:center;border-radius:999px;padding:5px 8px;background:#ffffff18;color:#baf7df;border:1px solid #ffffff22}
.sb-shell-link{display:flex;gap:12px;align-items:center;text-decoration:none;color:white;border-radius:14px;background:#ffffff12;margin:8px 0;padding:12px 13px;font-weight:850}
.sb-shell-link:hover{background:#22d3a620}
.sb-shell-link.current{background:linear-gradient(135deg,#22d3a640,#7c3cff55);outline:2px solid #22d3a67a}
.sb-shell-icon{width:28px;text-align:center}
.sb-shell-title{display:block}
.sb-shell-desc{display:block;color:#b9c0d8;font-size:12px;font-weight:650;margin-top:3px}
.sb-shell-pill{display:inline-flex;margin-left:8px;border-radius:999px;padding:3px 7px;background:#22d3a624;border:1px solid #22d3a657;color:#baf7df;font-size:10px}
.sb-shell-hidden{display:none!important}
.sb-shell-footer{color:#8f98b8;font-size:12px;text-align:center;padding:10px 4px 4px}
.searchWrap{position:relative;z-index:99998}
.sb-quick-search-overlay{position:absolute;right:0;top:56px;width:min(660px,92vw);max-height:72vh;overflow:auto;border:1px solid #22d3a657;border-radius:22px;background:linear-gradient(180deg,#08101cfa,#120c26fa);box-shadow:0 30px 90px #000c;padding:12px;display:none;z-index:999999}
.sb-quick-search-overlay.open{display:block}
.sb-search-result{display:grid;grid-template-columns:78px 1fr;gap:10px;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:16px;background:#ffffff0d;padding:9px;margin:8px 0}
.sb-search-thumb{aspect-ratio:16/9;border-radius:10px;background:#ffffff14;overflow:hidden;display:grid;place-items:center}
.sb-search-thumb img{width:100%;height:100%;object-fit:cover}
.sb-search-desc,.sb-search-result small{display:block;color:#b9c0d8;margin-top:4px}
.sb-search-note{padding:12px 14px;border-radius:18px;background:#ffb1421f;border:1px solid #ffb14252;color:#ffe7ad;font-weight:850;margin-top:8px}
#sb100btn,#sb100menu,#sb101MenuBtn,#sb101Drawer,#sb101Scrim,#sb102MenuBtn,#sb102Drawer,#sb102Scrim,#sb103MenuBtn,#sb103Drawer,#sb103Scrim,#sbShellQuickIcons,#sbShellHeaderIcons,.sb-shell-header-icons{display:none!important}
@media(max-width:980px){
  .head.sb124-head{grid-template-columns:1fr!important}
  .head.sb124-head>.brand,.head.sb124-head>.sb124-right{grid-column:1!important;grid-row:auto!important}
  .sb124-right{justify-content:flex-start!important;flex-wrap:wrap!important;width:100%!important;margin-top:10px!important}
  .sb124-right .searchWrap{max-width:none!important;width:100%!important}
  .sb-shell-menu-toggle{left:12px;top:82px;width:48px;height:48px}
}`;
  document.head.appendChild(s);
}

function fav(){
  try{
    const u=FAVICON_URL+(FAVICON_URL.includes('?')?'&':'?')+'sbFav='+Date.now();
    ['icon','shortcut icon','apple-touch-icon'].forEach(function(rel){
      let l=document.querySelector('link[rel="'+rel+'"]');
      if(!l){
        l=document.createElement('link');
        l.rel=rel;
        document.head.appendChild(l);
      }
      l.href=u;
    });
  }catch(e){}
}

function guard(root){
  root=root||document;
  try{
    root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(function(el){
      ['href','action','data-href','data-target','data-route','data-url'].forEach(function(a){
        const v=el.getAttribute(a);
        const f=fixedForValue(v);
        if(v&&f!==v){
          el.setAttribute(a,f);
          el.dataset.sbRouteGuard='fixed-v7-12-124';
        }
      });
    });
    document.documentElement.dataset.streamBanditRouteGuard='v7-12-124-test';
  }catch(e){}
}

function wrapSearch(el){
  if(!el) return null;
  if(el.closest('.searchWrap')) return el.closest('.searchWrap');
  const w=document.createElement('div');
  w.className='searchWrap';
  el.parentNode.insertBefore(w,el);
  w.appendChild(el);
  return w;
}

function headerEnhance(){
  try{
    const h=document.querySelector('.head')||document.querySelector('header');
    if(!h) return;
    h.classList.add('sb124-head');
    const m=h.querySelector(':scope>.muted');
    if(m) m.style.display='none';

    const search=h.querySelector('.search')||document.querySelector('.search');
    if(search){
      const sw=wrapSearch(search);
      let zone=h.querySelector('#sb124Right');
      if(!zone){
        zone=document.createElement('div');
        zone.id='sb124Right';
        zone.className='sb124-right';
        h.appendChild(zone);
      }

      let icons=zone.querySelector('#sb124Icons');
      if(!icons){
        icons=document.createElement('nav');
        icons.id='sb124Icons';
        icons.className='sb124-icons';
        zone.appendChild(icons);
      }

      icons.style.display=ownerAllowed?'flex':'none';
      icons.innerHTML=
        '<a href="'+esc(pageRoute(R.pagesManager))+'" title="Pages Manager">🧭</a>'+
        '<a href="'+esc(pageRoute(R.publishedPreview))+'" title="Published Preview">👁️</a>'+
        '<a href="'+esc(pageRoute(R.formInbox))+'" title="Form Inbox / Submissions">📬</a>'+
        '<a href="'+esc(pageRoute(R.formAdvanced))+'" title="Advanced Form">🧾</a>'+
        '<a href="'+esc(pageRoute(R.builderStudio))+'" title="Web Builder Studio">🏗️</a>';

      if(sw&&sw.parentElement!==zone) zone.appendChild(sw);
    }
  }catch(e){}
}

function button(){
  if(document.getElementById('sbShellMenuToggle')) return;
  const b=document.createElement('button');
  b.id='sbShellMenuToggle';
  b.className='sb-shell-menu-toggle';
  b.type='button';
  b.textContent='☰';
  b.title='Open Stream Bandit menu';
  b.onclick=open;
  document.body.appendChild(b);
}

function render(){
  const old=document.getElementById('sbShellDrawer');
  if(old) old.remove();

  let scrim=document.getElementById('sbShellScrim');
  if(!scrim){
    scrim=document.createElement('div');
    scrim.id='sbShellScrim';
    scrim.className='sb-shell-scrim';
    document.body.appendChild(scrim);
  }

  const d=document.createElement('aside');
  d.id='sbShellDrawer';
  d.className='sb-shell-drawer';

  const all=pages();
  const cur=curPage();
  const cf=curFile();

  d.innerHTML=
    '<div class="sb-shell-head">'+
      '<div class="sb-shell-brand">'+
        '<img class="sb-shell-logo" src="stream_bandit_original_logo_square_256.png" alt="">'+
        '<div><div>Stream Bandit</div><small style="color:#b9c0d8">'+
          esc(userEmail||'Menu')+(cur?' · '+esc(cur[2]):'')+
        '</small></div>'+
      '</div>'+
      '<button class="sb-shell-close" type="button" data-close>Close</button>'+
    '</div>'+
    '<div class="sb-shell-search"><span>🔎</span><input id="sbShellFilter" placeholder="Filter menu"><button class="sb-shell-close" type="button" data-search>Search</button></div>'+
    '<div id="sbShellGroups"></div>'+
    '<div class="sb-shell-footer">'+esc(VERSION)+' · '+esc(roleLabel||'checking role')+' · current: '+esc(cf)+'</div>';

  document.body.appendChild(d);

  const holder=d.querySelector('#sbShellGroups');

  GROUPS.filter(function(g){return all.some(function(p){return p[0]===g;});}).forEach(function(g){
    const rows=all.filter(function(p){return p[0]===g;});
    const isG=cur&&cur[0]===g;
    const sec=document.createElement('section');
    sec.className='sb-shell-group'+(isG?' current':'');
    sec.innerHTML=
      '<h3><span>'+esc(g)+(isG?'<span class="sb-shell-pill">Here</span>':'')+'</span><span class="sb-shell-count">'+rows.length+'</span></h3>'+
      rows.map(function(p){
        const isC=same(p[3],cf);
        return '<a class="sb-shell-link'+(isC?' current':'')+'" href="'+esc(pageRoute(p[3]))+'" data-search="'+esc((p[0]+' '+p[2]+' '+p[4]).toLowerCase())+'">'+
          '<span class="sb-shell-icon">'+p[1]+'</span>'+
          '<span><span class="sb-shell-title">'+esc(p[2])+(isC?'<span class="sb-shell-pill">Current</span>':'')+'</span>'+
          '<span class="sb-shell-desc">'+esc(p[4])+'</span></span>'+
        '</a>';
      }).join('');
    holder.appendChild(sec);
  });

  d.querySelector('[data-close]').onclick=close;
  d.querySelector('[data-search]').onclick=function(){
    const q=d.querySelector('#sbShellFilter').value.trim();
    location.href=R.search+(q?'?q='+encodeURIComponent(q):'');
  };

  d.querySelector('#sbShellFilter').oninput=function(e){
    const q=e.target.value.trim().toLowerCase();
    d.querySelectorAll('.sb-shell-link').forEach(function(a){
      a.classList.toggle('sb-shell-hidden',q&&!a.dataset.search.includes(q));
    });
    d.querySelectorAll('.sb-shell-group').forEach(function(sec){
      sec.classList.toggle('sb-shell-hidden',!Array.from(sec.querySelectorAll('.sb-shell-link')).some(function(a){
        return !a.classList.contains('sb-shell-hidden');
      }));
    });
  };

  scrim.onclick=close;
  guard(d);
  headerEnhance();
}

function open(){
  addCss();
  render();
  const s=document.getElementById('sbShellScrim');
  const d=document.getElementById('sbShellDrawer');
  if(s) s.classList.add('show');
  if(d) d.classList.add('show');
  setTimeout(function(){
    const cur=document.querySelector('#sbShellDrawer .sb-shell-link.current');
    if(cur) cur.scrollIntoView({block:'center',behavior:'smooth'});
  },120);
}

function close(){
  const s=document.getElementById('sbShellScrim');
  const d=document.getElementById('sbShellDrawer');
  if(s) s.classList.remove('show');
  if(d) d.classList.remove('show');
}

function loadScript(src){
  return new Promise(function(resolve,reject){
    const existing=document.querySelector('script[src="'+src+'"]')||document.querySelector('script[data-sb-supabase-sdk]');
    if(existing){
      if(window.supabase&&window.supabase.createClient) return resolve();
      existing.addEventListener('load',function(){resolve();},{once:true});
      existing.addEventListener('error',function(){reject(new Error('Supabase SDK failed to load'));},{once:true});
      setTimeout(function(){
        if(window.supabase&&window.supabase.createClient) resolve();
      },600);
      return;
    }

    const s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.dataset.sbSupabaseSdk='v7-12-124';
    s.onload=function(){resolve();};
    s.onerror=function(){reject(new Error('Supabase SDK failed to load'));};
    document.head.appendChild(s);
  });
}

async function ensureSupabase(){
  if(window.supabase&&window.supabase.createClient) return true;
  if(!sdkPromise) sdkPromise=loadScript(SUPABASE_SDK);
  try{
    await sdkPromise;
    return !!(window.supabase&&window.supabase.createClient);
  }catch(e){
    lastMovieError=e.message||String(e);
    return false;
  }
}

async function client(){
  if(sb) return sb;
  const ok=await ensureSupabase();
  if(!ok){
    lastMovieError='Supabase SDK not ready';
    return null;
  }
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  return sb;
}

async function loadQuick(){
  if(quickLoaded) return;
  quickLoaded=true;
  try{
    const c=await client();
    if(!c) return;
    const r=await c.from('sb_movies').select('*').order('created_at',{ascending:false}).limit(90);
    if(r.error) throw r.error;
    quickMovies=(r.data||[]).filter(function(m){
      const st=String(m.status||'published');
      if(ownerAllowed) return st!=='archived';
      return st==='published'||st==='';
    });
    lastMovieError='';
  }catch(e){
    quickMovies=[];
    lastMovieError=e.message||String(e);
    quickLoaded=false;
  }
}

function hit(q){
  q=String(q||'').toLowerCase();
  return quickMovies.filter(function(m){
    return (String(m.title||'')+' '+String(m.description||'')+' '+arr(m.genres).join(' ')+' '+arr(m.tags).join(' ')).toLowerCase().includes(q);
  }).slice(0,8);
}

function menuHits(q){
  q=String(q||'').toLowerCase();
  return pages().filter(function(p){
    return (p[0]+' '+p[2]+' '+p[4]).toLowerCase().includes(q);
  }).slice(0,6);
}

function searchRows(v,hs,ps){
  const full=R.search+(v?'?q='+encodeURIComponent(v):'');
  const movieRows=hs.map(function(m){
    const im=poster(m);
    return '<a class="sb-search-result" href="'+esc(R.details+'?id='+encodeURIComponent(m.id||''))+'">'+
      '<span class="sb-search-thumb">'+(im?'<img src="'+esc(im)+'" alt="">':'🎬')+'</span>'+
      '<span><b>'+esc(m.title||'Untitled')+'</b><small>Movie result</small><span class="sb-search-desc">'+esc(snippet(m.description||'No description'))+'</span></span>'+
    '</a>';
  }).join('');

  const pageRows=ps.map(function(p){
    return '<a class="sb-search-result" href="'+esc(pageRoute(p[3]))+'">'+
      '<span class="sb-search-thumb">'+p[1]+'</span>'+
      '<span><b>'+esc(p[2])+'</b><small>'+esc(p[0])+'</small><span class="sb-search-desc">'+esc(p[4])+'</span></span>'+
    '</a>';
  }).join('');

  const empty=lastMovieError?'<div class="sb-search-note">Movie load error: '+esc(lastMovieError)+'</div>':'<div class="sb-search-note">No quick movie/page results yet.</div>';
  return '<b>Quick results for “'+esc(v)+'”</b>'+(movieRows+pageRows||empty)+'<a class="sb-search-note" style="display:block;text-decoration:none" href="'+esc(full)+'">Open full Global Search</a>';
}

function enhanceSearch(){
  try{
    const input=document.getElementById('globalSearch')||document.getElementById('topSearch');
    const btn=document.getElementById('globalSearchBtn')||document.getElementById('topSearchBtn');
    if(!input) return;

    const searchEl=input.closest('.search')||input.parentElement;
    const w=wrapSearch(searchEl);
    if(!w) return;

    const existing=document.getElementById('searchOverlay');
    if(existing&&existing.classList.contains('searchOverlay')){
      input.dataset.sbQuickSearch='existing';
      return;
    }

    let ov=document.getElementById('sbGlobalShellSearchOverlay');
    if(!ov){
      ov=document.createElement('div');
      ov.id='sbGlobalShellSearchOverlay';
      ov.className='sb-quick-search-overlay';
      w.appendChild(ov);
    }

    async function run(){
      const q=input.value.trim();
      if(q.length<2){
        ov.classList.remove('open');
        return;
      }
      ov.classList.add('open');
      ov.innerHTML='<b>Searching “'+esc(q)+'”...</b><div class="sb-search-note">Loading movies from Supabase...</div>';
      await loadQuick();
      ov.innerHTML=searchRows(q,hit(q),menuHits(q));
    }

    input.oninput=run;
    input.onfocus=function(){
      if(input.value.trim().length>1) run();
    };
    input.onkeydown=function(e){
      if(e.key==='Enter'){
        e.preventDefault();
        e.stopImmediatePropagation();
        location.href=R.search+(input.value.trim()?'?q='+encodeURIComponent(input.value.trim()):'');
      }
      if(e.key==='Escape') ov.classList.remove('open');
    };

    if(btn){
      btn.onclick=function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        location.href=R.search+(input.value.trim()?'?q='+encodeURIComponent(input.value.trim()):'');
      };
    }

    document.addEventListener('click',function(e){
      if(!e.target.closest('.searchWrap')) ov.classList.remove('open');
    },true);

    input.dataset.sbQuickSearch='v7-12-124';
  }catch(e){}
}

async function ownerCheck(){
  try{
    roleLabel='checking role';
    const c=await client();
    if(!c){
      roleLabel='Supabase unavailable';
      ownerAllowed=false;
      render();
      headerEnhance();
      return;
    }

    const u=await c.auth.getUser();
    const user=u&&u.data&&u.data.user;
    userEmail=user&&user.email||'';

    if(!user){
      roleLabel='signed out';
      ownerAllowed=false;
      render();
      headerEnhance();
      return;
    }

    let role='';
    try{
      const p=await c.from('sb_profiles').select('role').eq('id',user.id).maybeSingle();
      role=p&&p.data&&p.data.role||'';
    }catch(e){}

    roleLabel=role||'user';
    ownerAllowed=/admin|owner/i.test(role)||/trevieisking/i.test(userEmail);
    render();
    headerEnhance();
  }catch(e){
    roleLabel='role check failed';
    headerEnhance();
  }
}

function boot(){
  addCss();
  fav();
  guard();
  button();
  render();
  headerEnhance();
  enhanceSearch();
  ownerCheck();

  setInterval(function(){
    guard();
    headerEnhance();
    enhanceSearch();
  },3000);

  document.addEventListener('click',function(e){
    if(e.target&&e.target.closest&&e.target.closest('[data-sb-open-menu]')){
      e.preventDefault();
      open();
    }
  },true);

  window.StreamBanditShell={
    version:VERSION,
    routes:R,
    open:open,
    close:close,
    guard:guard,
    refresh:render,
    enhanceSearch:enhanceSearch,
    headerEnhance:headerEnhance,
    ownerCheck:ownerCheck,
    isOwnerAllowed:function(){return ownerAllowed;},
    role:function(){return roleLabel;},
    email:function(){return userEmail;}
  };

  document.documentElement.dataset.streamBanditShell='v7-12-124-route-repair-test';
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
