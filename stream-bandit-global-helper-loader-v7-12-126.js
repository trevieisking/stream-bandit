/* Stream Bandit V7.12.127 Global Helper Loader / Stabiliser
   Fix after V7.12.126 test:
   - Keep existing helper shells.
   - Remove duplicate/right-side search icons.
   - Keep one clean owner icon row only.
   - Restore movie overlay search from sb_movies.
   - Promote Registry/Admin/Builder/Policy/Profile routes inside overlay after drawer render.
   - No Supabase writes. No payments. No index promotion.
*/

(function(){
'use strict';

const VERSION='V7.12.127 Global Helper Loader / Stabiliser';

const SITE={
  domain:'https://chatterfriendsstreambandit.co.uk',
  contactEmail:'info@chatterfriendsstreambandit.co.uk',
  githubPages:'https://trevieisking.github.io/stream-bandit/'
};

window.StreamBanditSite=Object.assign(window.StreamBanditSite||{},SITE);

const ROUTES={
  home:'home-global-helpers-v7-4-4-test.html',
  details:'details-clean-machine-v7-12-38-test.html',
  player1:'player-one-global-helpers-v7-3-3-test.html',
  search:'global-search-global-helpers-v7-4-9-test.html',

  profile:'profile-settings-live-ready-v7-12-90-test.html',

  builder:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
  builderStudio:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
  pagesManager:'web-builder-pages-manager-v7-12-111-test.html',
  publishedPreview:'web-builder-shared-style-preview-v7-12-117-test.html?page=test-page',
  formAdvanced:'web-builder-form-save-v7-12-94-test.html?page=test-page',
  formInbox:'web-builder-form-submissions-v7-12-94-test.html?page=test-page',

  admin:'admin-centre-command-deck-v7-12-121-test.html',
  registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',

  policyCentre:'policy-documents-centre-v7-12-119-test.html',
  policyReader:'policy-reader-v7-12-119-test.html?policy=terms',
  policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',

  watchlist:'watchlist-clean-machine-v7-12-43-test.html',
  favourites:'favourites-clean-machine-v7-12-41-test.html',
  liked:'likes-clean-machine-v7-12-42-test.html'
};

const ROUTE_FIXES={
  'profile-settings-global-helpers-v7-5-8-test.html':ROUTES.profile,
  'profile-settings-admin-shell-v6-56-test.html':ROUTES.profile,

  'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
  'web-builder-global-helpers-v7-9-3-test.html':ROUTES.builder,
  'web-builder-admin-shell-v6-57-test.html':ROUTES.builder,
  'web-builder-full-edit-lock-v7-8-6-test.html':ROUTES.builder,
  'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,

  'web-builder-shared-style-preview-v7-9-0-test.html':ROUTES.publishedPreview,
  'web-builder-shared-style-preview-v7-9-2-test.html':ROUTES.publishedPreview,

  'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,

  'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
  'all-pages-version-registry-v7-10-3-full-test.html':ROUTES.registry,
  'all-pages-version-registry-v6-29-test.html':ROUTES.registry,
  'all-pages-version-registry-admin-shell-v6-61-test.html':ROUTES.registry,

  'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,
  'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,
  'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,

  'watchlist-watch-shell-v6-37-test.html':ROUTES.watchlist,
  'favourites-watch-shell-v6-38-test.html':ROUTES.favourites,
  'liked-watch-shell-v6-39-test.html':ROUTES.liked
};

/* Keep this small. Screenshot showed too many icons. */
const OWNER_ICONS=[
  ['🧭','Pages Manager',ROUTES.pagesManager],
  ['👁️','Published Preview',ROUTES.publishedPreview],
  ['📋','Current Routes Registry',ROUTES.registry],
  ['🏗️','Builder Studio',ROUTES.builderStudio]
];

const OWNER_MENU_LINKS=[
  ['Owner','🧭','Pages Manager',ROUTES.pagesManager,'Create, edit, hide, restore and guarded-delete Web Builder pages'],
  ['Owner','👁️','Published Preview',ROUTES.publishedPreview,'Interactive published Web Builder preview'],
  ['Owner','📬','Form Inbox',ROUTES.formInbox,'Builder form submissions inbox'],
  ['Owner','🧾','Advanced Form',ROUTES.formAdvanced,'Advanced builder form route'],
  ['Owner','🏗️','Web Builder Studio',ROUTES.builderStudio,'Current Builder Studio route']
];

const ADMIN_MENU_LINKS=[
  ['Admin','📋','Current Routes Registry',ROUTES.registry,'Current route scanner'],
  ['Admin','🛠️','Admin Centre',ROUTES.admin,'Admin command deck']
];

let sb=null;
let cfg=null;
let movies=[];
let moviesLoaded=false;
let moviesError='';
let lastAuth={signedIn:false,email:'',role:'signed-out',avatar:''};
let observerStarted=false;

function esc(s){
  return String(s??'').replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}

function fileOf(v){
  return String(v||'').split('/').pop().split('?')[0].split('#')[0];
}

function pageParam(){
  try{
    return new URL(location.href).searchParams.get('page')||'test-page';
  }catch(e){
    return 'test-page';
  }
}

function pageRoute(route,oldValue){
  if(!String(route||'').includes('page=test-page')) return route;

  let p=pageParam();

  try{
    const u=new URL(String(oldValue||''),location.href);
    p=u.searchParams.get('page')||p;
  }catch(e){}

  return String(route).replace('page=test-page','page='+encodeURIComponent(p));
}

function fixedUrl(raw){
  if(!raw || !String(raw).includes('.html')) return raw;

  const f=fileOf(raw);
  const target=ROUTE_FIXES[f];

  if(!target) return raw;

  return pageRoute(target,raw);
}

async function readShellConfig(){
  if(cfg) return cfg;

  try{
    const txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(function(r){return r.text();});
    cfg={
      url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'',
      key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||''
    };
  }catch(e){
    cfg={url:'',key:''};
  }

  return cfg;
}

async function client(){
  if(sb) return sb;

  const c=await readShellConfig();

  if(!window.supabase || !window.supabase.createClient || !c.url || !c.key) return null;

  sb=window.supabase.createClient(c.url,c.key);

  return sb;
}

function installStyle(){
  if(document.getElementById('sbGlobalHelperLoader127Style')) return;

  const s=document.createElement('style');
  s.id='sbGlobalHelperLoader127Style';
  s.textContent=`
/* Hide duplicate icon strips made by earlier shell/helper experiments */
#sb104Icons,
#sb124Icons,
#sb126OwnerIcons,
#sbShellHeaderIcons,
.sb-shell-header-icons{
  display:none!important;
  visibility:hidden!important;
  pointer-events:none!important;
}

/* One clean icon strip only */
#sb127OwnerIcons{
  display:flex!important;
  gap:6px!important;
  align-items:center!important;
  flex-wrap:wrap!important;
  justify-content:flex-end!important;
  margin:0 0 8px!important;
}
#sb127OwnerIcons a{
  width:34px!important;
  height:34px!important;
  border-radius:13px!important;
  border:1px solid #ffffff2b!important;
  background:linear-gradient(135deg,#101529,#17122d)!important;
  display:grid!important;
  place-items:center!important;
  text-decoration:none!important;
  font-size:16px!important;
  box-shadow:0 10px 26px #0007!important;
  color:#fff!important;
}

#sbGlobalShellSearchOverlay{
  display:none!important;
  visibility:hidden!important;
  pointer-events:none!important;
}

.sb127-movie-overlay{
  position:absolute;
  right:0;
  top:56px;
  width:min(720px,92vw);
  max-height:74vh;
  overflow:auto;
  border:1px solid #22d3a657;
  border-radius:22px;
  background:linear-gradient(180deg,#08101cfa,#120c26fa);
  box-shadow:0 30px 90px #000c;
  padding:12px;
  display:none;
  z-index:999999;
  color:#fff;
  font-family:Inter,system-ui,Arial,sans-serif;
}
.sb127-movie-overlay.open{display:block}
.sb127-search-head{
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:center;
  margin-bottom:8px;
}
.sb127-close{
  border:0;
  border-radius:999px;
  background:#414667;
  color:#fff;
  font-weight:950;
  padding:8px 11px;
  cursor:pointer;
}
.sb127-search-result{
  display:grid;
  grid-template-columns:86px 1fr;
  gap:10px;
  text-decoration:none;
  color:#fff;
  border:1px solid #ffffff14;
  border-radius:16px;
  background:#ffffff0d;
  padding:9px;
  margin:8px 0;
}
.sb127-thumb{
  aspect-ratio:16/9;
  border-radius:10px;
  background:#ffffff14;
  overflow:hidden;
  display:grid;
  place-items:center;
  color:#dfffee;
  font-size:20px;
}
.sb127-thumb img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.sb127-search-result small,
.sb127-desc{
  display:block;
  color:#b9c0d8;
  margin-top:4px;
}
.sb127-row-actions{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  margin-top:8px;
}
.sb127-mini-btn{
  display:inline-flex;
  border-radius:999px;
  padding:7px 10px;
  background:linear-gradient(135deg,#22d3a6,#7c3cff);
  color:white;
  text-decoration:none;
  font-weight:950;
  font-size:12px;
}
.sb127-mini-btn.hot{
  background:linear-gradient(135deg,#ff2d85,#7c3cff);
}
.sb127-note{
  padding:12px 14px;
  border-radius:18px;
  background:#ffb1421f;
  border:1px solid #ffb14252;
  color:#ffe7ad;
  font-weight:850;
  margin-top:8px;
}
.sb127-owner-added{
  outline:1px solid #22d3a650;
}
@media(max-width:980px){
  #sb127OwnerIcons{
    justify-content:flex-start!important;
    width:100%!important;
  }
  .sb127-movie-overlay{
    left:0!important;
    right:auto!important;
    width:calc(100vw - 24px)!important;
    max-width:calc(100vw - 24px)!important;
  }
  .sb127-search-result{
    grid-template-columns:1fr;
  }
}
`;
  document.head.appendChild(s);
}

function patchRoutes(root){
  root=root||document;

  try{
    root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(function(el){
      ['href','action','data-href','data-target','data-route','data-url'].forEach(function(attr){
        const old=el.getAttribute(attr);
        const fixed=fixedUrl(old);

        if(old && fixed && fixed!==old){
          el.setAttribute(attr,fixed);
          el.dataset.sbRouteFixedBy='v7-12-127';
        }
      });
    });
  }catch(e){}

  try{
    if(window.StreamBanditRoutes){
      Object.keys(window.StreamBanditRoutes).forEach(function(k){
        const old=window.StreamBanditRoutes[k];
        const fixed=fixedUrl(old);
        if(old && fixed && fixed!==old) window.StreamBanditRoutes[k]=fixed;
      });

      window.StreamBanditRoutes.builder=ROUTES.builder;
      window.StreamBanditRoutes.builderStudio=ROUTES.builderStudio;
      window.StreamBanditRoutes.pagesManager=ROUTES.pagesManager;
      window.StreamBanditRoutes.publishedPreview=ROUTES.publishedPreview;
      window.StreamBanditRoutes.admin=ROUTES.admin;
      window.StreamBanditRoutes.registry=ROUTES.registry;
      window.StreamBanditRoutes.policyCentre=ROUTES.policyCentre;
      window.StreamBanditRoutes.policyProof=ROUTES.policyReader;
      window.StreamBanditRoutes.policyAdmin=ROUTES.policyAdmin;
    }

    if(window.StreamBanditShell && window.StreamBanditShell.routes){
      Object.keys(window.StreamBanditShell.routes).forEach(function(k){
        const old=window.StreamBanditShell.routes[k];
        const fixed=fixedUrl(old);
        if(old && fixed && fixed!==old) window.StreamBanditShell.routes[k]=fixed;
      });

      window.StreamBanditShell.routes.builder=ROUTES.builder;
      window.StreamBanditShell.routes.builderStudio=ROUTES.builderStudio;
      window.StreamBanditShell.routes.pagesManager=ROUTES.pagesManager;
      window.StreamBanditShell.routes.publishedPreview=ROUTES.publishedPreview;
      window.StreamBanditShell.routes.admin=ROUTES.admin;
      window.StreamBanditShell.routes.registry=ROUTES.registry;
      window.StreamBanditShell.routes.policyCentre=ROUTES.policyCentre;
      window.StreamBanditShell.routes.policyProof=ROUTES.policyReader;
      window.StreamBanditShell.routes.policyAdmin=ROUTES.policyAdmin;
    }
  }catch(e){}

  document.documentElement.dataset.streamBanditGlobalRouteFix='v7-12-127';
}

async function readAuth(){
  try{
    if(window.StreamBanditShellAuth && window.StreamBanditShellAuth.getState){
      const st=window.StreamBanditShellAuth.getState()||{};
      const user=st.user||null;
      const profile=st.profile||null;

      lastAuth.signedIn=!!user;
      lastAuth.email=user&&user.email||lastAuth.email||'';
      lastAuth.role=profile&&profile.role||st.role||lastAuth.role||'signed-out';
      lastAuth.avatar=profile&&profile.avatar_url||lastAuth.avatar||'';
    }

    const c=await client();
    if(!c) return lastAuth;

    const got=await c.auth.getUser();
    const user=got&&got.data&&got.data.user?got.data.user:null;

    if(!user){
      lastAuth.signedIn=false;
      lastAuth.role='signed-out';
      return lastAuth;
    }

    lastAuth.signedIn=true;
    lastAuth.email=user.email||lastAuth.email||'';

    const r=await c.from('sb_profiles').select('role,avatar_url').eq('id',user.id).maybeSingle();
    if(r.error) throw r.error;

    if(r.data){
      lastAuth.role=r.data.role||lastAuth.role||'user';
      lastAuth.avatar=r.data.avatar_url||lastAuth.avatar||'';
    }
  }catch(e){}

  return lastAuth;
}

function isOwner(){
  const role=String(lastAuth.role||document.documentElement.dataset.streamBanditRole||'').toLowerCase();
  const email=String(lastAuth.email||'').toLowerCase();

  return /admin|owner/.test(role) || email.includes('trevieisking');
}

function removeDuplicateIconStrips(){
  ['sb126OwnerIcons','sb124Icons','sb104Icons'].forEach(function(id){
    const el=document.getElementById(id);
    if(el){
      el.style.display='none';
      el.style.visibility='hidden';
      el.style.pointerEvents='none';
    }
  });

  document.querySelectorAll('.sb-shell-header-icons,#sbShellHeaderIcons').forEach(function(el){
    el.style.display='none';
    el.style.visibility='hidden';
    el.style.pointerEvents='none';
  });
}

function installOwnerIcons(){
  try{
    removeDuplicateIconStrips();

    const searchWrap=document.querySelector('.searchWrap')||document.querySelector('.search');
    if(!searchWrap) return;

    let zone=document.getElementById('sb127OwnerIcons');

    if(!zone){
      zone=document.createElement('nav');
      zone.id='sb127OwnerIcons';
      searchWrap.parentNode.insertBefore(zone,searchWrap);
    }

    zone.style.display=isOwner()?'flex':'none';

    zone.innerHTML=OWNER_ICONS.map(function(x){
      return '<a href="'+esc(pageRoute(x[2],x[2]))+'" title="'+esc(x[1])+'" aria-label="'+esc(x[1])+'">'+x[0]+'</a>';
    }).join('');

    patchRoutes(zone);
  }catch(e){}
}

function groupName(section){
  const h=section&&section.querySelector('h3');
  return String(h&&h.textContent||'').replace(/\d+$/,'').trim().toLowerCase();
}

function findMenuGroup(name){
  const drawer=document.getElementById('sbShellDrawer');
  if(!drawer) return null;

  const wanted=String(name||'').toLowerCase();

  return Array.from(drawer.querySelectorAll('.sb-shell-group')).find(function(sec){
    return groupName(sec).includes(wanted);
  })||null;
}

function countLinks(section){
  return section?section.querySelectorAll('a.sb-shell-link').length:0;
}

function updateGroupCount(section){
  if(!section) return;

  const c=section.querySelector('.sb-shell-count');
  if(c) c.textContent=String(countLinks(section));
}

function linkExists(section,title,href){
  if(!section) return true;

  const f=fileOf(href);
  const titleText=String(title||'').toLowerCase();

  return Array.from(section.querySelectorAll('a.sb-shell-link')).some(function(a){
    const ah=fileOf(a.getAttribute('href')||'');
    const txt=String(a.textContent||'').toLowerCase();
    return ah===f || txt.includes(titleText);
  });
}

function appendMenuLink(section,row){
  if(!section) return;

  const group=row[0];
  const icon=row[1];
  const title=row[2];
  const href=pageRoute(row[3],row[3]);
  const desc=row[4];

  if(linkExists(section,title,href)) return;

  const a=document.createElement('a');
  a.className='sb-shell-link sb127-owner-added';
  a.href=href;
  a.dataset.search=(group+' '+title+' '+desc).toLowerCase();
  a.innerHTML=
    '<span class="sb-shell-icon">'+icon+'</span>'+
    '<span><span class="sb-shell-title">'+esc(title)+'</span>'+
    '<span class="sb-shell-desc">'+esc(desc)+'</span></span>';

  section.appendChild(a);
  updateGroupCount(section);
}

function promoteExistingRegistryLink(){
  const drawer=document.getElementById('sbShellDrawer');
  if(!drawer) return;

  Array.from(drawer.querySelectorAll('a.sb-shell-link')).forEach(function(a){
    const href=a.getAttribute('href')||'';
    const txt=String(a.textContent||'');

    if(
      fileOf(href)==='all-pages-version-registry-v7-1-4-full-test.html' ||
      fileOf(href)==='all-pages-version-registry-v7-10-3-full-test.html' ||
      /Version Registry/i.test(txt) ||
      /Current Routes Registry/i.test(txt)
    ){
      a.href=ROUTES.registry;
      a.dataset.sbRouteFixedBy='v7-12-127-registry';

      const title=a.querySelector('.sb-shell-title');
      if(title){
        const pill=title.querySelector('.sb-shell-pill');
        title.textContent='Current Routes Registry';
        if(pill) title.appendChild(pill);
      }

      const desc=a.querySelector('.sb-shell-desc');
      if(desc) desc.textContent='Current route scanner';
    }
  });
}

function promoteOverlayMenu(){
  const drawer=document.getElementById('sbShellDrawer');
  if(!drawer) return;

  patchRoutes(drawer);
  promoteExistingRegistryLink();

  if(isOwner()){
    const owner=findMenuGroup('owner');
    const admin=findMenuGroup('admin');

    OWNER_MENU_LINKS.forEach(function(row){
      appendMenuLink(owner,row);
    });

    ADMIN_MENU_LINKS.forEach(function(row){
      appendMenuLink(admin,row);
    });
  }

  patchRoutes(drawer);
  applyOverlayAvatar();
  fixMenuSaveCounts();
}

function applyOverlayAvatar(){
  try{
    const drawer=document.getElementById('sbShellDrawer');
    if(!drawer || !lastAuth.avatar) return;

    const img=drawer.querySelector('.sb-shell-logo');
    if(img){
      img.src=lastAuth.avatar;
      img.alt='Profile avatar';
      img.title='Signed-in profile avatar';
      img.style.objectFit='cover';
    }
  }catch(e){}
}

function arr(v){
  if(Array.isArray(v)) return v;

  if(typeof v==='string' && v.trim()){
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

function firstVideo(m){
  return m.video_url||m.mux_playback_url||m.stream_url||m.url||'';
}

function snippet(s,n){
  n=n||120;
  s=String(s||'').replace(/\s+/g,' ').trim();
  return s.length>n?s.slice(0,n-1).trim()+'…':s;
}

async function loadMovies(){
  if(moviesLoaded) return movies;

  moviesLoaded=true;
  moviesError='';

  try{
    const c=await client();

    if(!c) throw new Error('Supabase client not ready');

    const r=await c.from('sb_movies').select('*').order('created_at',{ascending:false}).limit(160);

    if(r.error) throw r.error;

    movies=(r.data||[]).filter(function(m){
      return String(m.status||'published')!=='archived';
    });
  }catch(e){
    movies=[];
    moviesLoaded=false;
    moviesError=e.message||String(e);
  }

  return movies;
}

function ensureSearchWrap(input){
  const search=input.closest('.search')||input.parentElement;

  if(!search) return null;

  let wrap=search.closest('.searchWrap');

  if(!wrap){
    wrap=document.createElement('div');
    wrap.className='searchWrap';
    search.parentNode.insertBefore(wrap,search);
    wrap.appendChild(search);
  }

  return wrap;
}

function ensureMovieOverlay(input){
  const wrap=ensureSearchWrap(input);

  if(!wrap) return null;

  let overlay=document.getElementById('sb127MovieSearchOverlay');

  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='sb127MovieSearchOverlay';
    overlay.className='sb127-movie-overlay';
    overlay.innerHTML=
      '<div class="sb127-search-head">'+
        '<b id="sb127SearchTitle">Movie search</b>'+
        '<button id="sb127CloseSearch" class="sb127-close" type="button">Close</button>'+
      '</div>'+
      '<div id="sb127SearchResults"></div>'+
      '<div class="sb127-note">Typing searches Stream Bandit movies from <b>sb_movies</b>. Press Enter for the full Global Search page.</div>';

    wrap.appendChild(overlay);

    const close=document.getElementById('sb127CloseSearch');
    if(close) close.onclick=function(){
      overlay.classList.remove('open');
    };
  }

  return overlay;
}

function searchText(m){
  return (
    String(m.title||'')+' '+
    String(m.description||'')+' '+
    String(m.director||'')+' '+
    String(m.cast_text||'')+' '+
    arr(m.genres).join(' ')+' '+
    arr(m.tags).join(' ')
  ).toLowerCase();
}

function renderMovieResults(q){
  const title=document.getElementById('sb127SearchTitle');
  const results=document.getElementById('sb127SearchResults');

  if(!results) return;

  const needle=String(q||'').trim().toLowerCase();

  if(!needle || needle.length<2){
    results.innerHTML='';
    if(title) title.textContent='Movie search';
    return;
  }

  const hits=movies.filter(function(m){
    return searchText(m).includes(needle);
  }).slice(0,10);

  if(title){
    title.textContent=hits.length?'Movie results for “'+needle+'”':'No movie results for “'+needle+'”';
  }

  if(moviesError){
    results.innerHTML='<div class="sb127-note">Movie search error: '+esc(moviesError)+'</div>';
    return;
  }

  if(!hits.length){
    results.innerHTML='<div class="sb127-note">No matching movies yet. Press Enter for full Global Search.</div>';
    return;
  }

  results.innerHTML=hits.map(function(m){
    const id=encodeURIComponent(m.id||'');
    const img=poster(m);
    const play=firstVideo(m);

    return '<div class="sb127-search-result">'+
      '<a class="sb127-thumb" href="'+esc(ROUTES.details+'?id='+id)+'">'+
        (img?'<img src="'+esc(img)+'" alt="">':'🎬')+
      '</a>'+
      '<div>'+
        '<a href="'+esc(ROUTES.details+'?id='+id)+'" style="color:#fff;text-decoration:none"><b>'+esc(m.title||'Untitled')+'</b></a>'+
        '<small>Movie result · '+esc([m.year,m.age_rating,m.runtime_text].filter(Boolean).join(' · ')||'Stream Bandit')+'</small>'+
        '<span class="sb127-desc">'+esc(snippet(m.description||'No description yet.'))+'</span>'+
        '<div class="sb127-row-actions">'+
          '<a class="sb127-mini-btn" href="'+esc(ROUTES.details+'?id='+id)+'">Details</a>'+
          (play?'<a class="sb127-mini-btn hot" href="'+esc(ROUTES.player1+'?id='+id)+'">Play</a>':'')+
        '</div>'+
      '</div>'+
    '</div>';
  }).join('');
}

async function openMovieOverlay(input,q){
  const overlay=ensureMovieOverlay(input);

  if(!overlay) return;

  const value=String(q||input.value||'').trim();

  if(value.length<2){
    overlay.classList.remove('open');
    return;
  }

  overlay.classList.add('open');

  const results=document.getElementById('sb127SearchResults');
  const title=document.getElementById('sb127SearchTitle');

  if(title) title.textContent='Searching movies for “'+value+'”';

  if(results){
    results.innerHTML='<div class="sb127-note">Loading movies from Supabase <b>sb_movies</b>...</div>';
  }

  await loadMovies();

  renderMovieResults(value);
}

function disableOldShellSearchOverlay(){
  const old=document.getElementById('sbGlobalShellSearchOverlay');

  if(old){
    old.classList.remove('open');
    old.style.display='none';
    old.style.visibility='hidden';
    old.style.pointerEvents='none';
  }
}

function installMovieSearch(){
  const input=document.getElementById('globalSearch')||document.getElementById('topSearch');
  const btn=document.getElementById('globalSearchBtn')||document.getElementById('topSearchBtn');

  if(!input) return;

  ensureMovieOverlay(input);
  disableOldShellSearchOverlay();

  input.oninput=function(e){
    if(e){
      e.preventDefault();
      e.stopPropagation();
    }
    openMovieOverlay(input,input.value);
    return false;
  };

  input.onfocus=function(e){
    if(e) e.stopPropagation();

    if(String(input.value||'').trim().length>1){
      openMovieOverlay(input,input.value);
    }

    return false;
  };

  input.onkeydown=function(e){
    if(e.key==='Enter'){
      e.preventDefault();
      e.stopImmediatePropagation();

      const q=String(input.value||'').trim();

      location.href=ROUTES.search+(q?'?q='+encodeURIComponent(q):'');

      return false;
    }

    if(e.key==='Escape'){
      const overlay=document.getElementById('sb127MovieSearchOverlay');
      if(overlay) overlay.classList.remove('open');
    }
  };

  input.addEventListener('input',function(e){
    e.preventDefault();
    e.stopImmediatePropagation();
    openMovieOverlay(input,input.value);
  },true);

  if(btn){
    btn.onclick=function(e){
      if(e){
        e.preventDefault();
        e.stopImmediatePropagation();
      }

      const q=String(input.value||'').trim();

      if(q.length>1){
        openMovieOverlay(input,q);
      }else{
        location.href=ROUTES.search;
      }

      return false;
    };
  }

  document.addEventListener('click',function(e){
    const overlay=document.getElementById('sb127MovieSearchOverlay');

    if(overlay && !e.target.closest('.searchWrap') && !e.target.closest('#sb127MovieSearchOverlay')){
      overlay.classList.remove('open');
    }
  },true);

  document.documentElement.dataset.streamBanditMovieOverlaySearch='v7-12-127';
}

function fixMenuSaveCounts(){
  try{
    const drawer=document.getElementById('sbShellDrawer');

    if(!drawer || !window.StreamBanditCoreSavesV675 || !window.StreamBanditCoreSavesV675.counts) return;

    const counts=window.StreamBanditCoreSavesV675.counts()||{};

    const targets=[
      ['watchlist','Watchlist',counts.watchlist||0],
      ['favourites','Favourites',counts.favourites||0],
      ['liked','Liked',counts.likes||counts.liked||0]
    ];

    targets.forEach(function(t){
      const key=t[0];
      const label=t[1];
      const value=t[2];

      const link=Array.from(drawer.querySelectorAll('a.sb-shell-link')).find(function(a){
        return String(a.textContent||'').toLowerCase().includes(label.toLowerCase());
      });

      if(!link) return;

      let badge=link.querySelector('[data-sb127-save-count="'+key+'"]');

      if(!badge){
        badge=document.createElement('span');
        badge.dataset.sb127SaveCount=key;
        badge.style.cssText='margin-left:auto;display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;padding:0 7px;border-radius:999px;background:#22d3a62b;border:1px solid #22d3a66b;color:#dfffee;font-size:12px;font-weight:950';
        link.appendChild(badge);
      }

      badge.textContent=String(value);
    });
  }catch(e){}
}

function refreshAll(){
  patchRoutes(document);
  removeDuplicateIconStrips();
  installOwnerIcons();
  installMovieSearch();
  promoteOverlayMenu();
  fixMenuSaveCounts();
  applyOverlayAvatar();

  document.dispatchEvent(new CustomEvent('streambandit:global-helper-loader-refresh',{
    detail:{
      version:VERSION,
      site:SITE,
      routes:ROUTES,
      auth:lastAuth,
      movieCount:movies.length,
      moviesLoaded:moviesLoaded,
      movieError:moviesError
    }
  }));
}

async function refreshAuthThenAll(){
  await readAuth();
  refreshAll();
}

function hookMenuButton(){
  document.addEventListener('click',function(e){
    if(e.target.closest('#sbShellMenuToggle') || e.target.closest('[data-sb-open-menu]')){
      setTimeout(refreshAuthThenAll,80);
      setTimeout(refreshAuthThenAll,180);
      setTimeout(refreshAuthThenAll,450);
      setTimeout(refreshAuthThenAll,900);
      setTimeout(refreshAuthThenAll,1400);
    }
  },true);
}

function hookAuthEvents(){
  document.addEventListener('streambandit:auth-state',function(e){
    const d=e.detail||{};
    const user=d.user||null;
    const profile=d.profile||null;

    lastAuth.signedIn=!!user;
    lastAuth.email=user&&user.email||lastAuth.email||'';
    lastAuth.role=profile&&profile.role||d.role||lastAuth.role||'signed-out';
    lastAuth.avatar=profile&&profile.avatar_url||lastAuth.avatar||'';

    setTimeout(refreshAuthThenAll,120);
  });
}

function startDrawerObserver(){
  if(observerStarted) return;

  observerStarted=true;

  try{
    const obs=new MutationObserver(function(){
      const drawer=document.getElementById('sbShellDrawer');

      if(drawer){
        setTimeout(refreshAuthThenAll,50);
        setTimeout(refreshAuthThenAll,220);
      }
    });

    obs.observe(document.body,{childList:true,subtree:true});
  }catch(e){}
}

function boot(){
  installStyle();
  patchRoutes(document);
  installMovieSearch();
  hookMenuButton();
  hookAuthEvents();
  startDrawerObserver();

  setTimeout(refreshAuthThenAll,150);
  setTimeout(refreshAuthThenAll,450);
  setTimeout(refreshAuthThenAll,900);
  setTimeout(refreshAuthThenAll,1700);
  setTimeout(refreshAuthThenAll,3200);

  setInterval(refreshAll,1200);

  window.StreamBanditGlobalHelperLoader={
    version:VERSION,
    site:SITE,
    routes:ROUTES,
    routeFixes:ROUTE_FIXES,
    refresh:refreshAuthThenAll,
    patchRoutes:patchRoutes,
    installMovieSearch:installMovieSearch,
    promoteOverlayMenu:promoteOverlayMenu,
    state:function(){
      return {
        version:VERSION,
        site:SITE,
        auth:Object.assign({},lastAuth),
        movieCount:movies.length,
        moviesLoaded:moviesLoaded,
        movieError:moviesError,
        owner:isOwner()
      };
    }
  };

  document.documentElement.dataset.streamBanditGlobalHelperLoader='v7-12-127';
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
