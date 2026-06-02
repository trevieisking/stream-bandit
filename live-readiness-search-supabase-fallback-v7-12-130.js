/* Stream Bandit V7.12.188 Live Readiness Supabase search fallback + menu route sanitizer
   App-wide search overlay fallback for pages that load it.
   Repairs visible shell/menu links to current working routes without replacing the protected shell.
   Owner Brand Route Truth fix:
   - Brand / App Icons remains settings-brand-icons-promoted-v7-12-21-test.html
   - Brand Image Helper remains brand-logo-helper-responsive-v7-12-20-test.html
   - Favicon / App Icon Builder remains favicon-app-icon-builder-v7-12-15-test.html
   No Supabase writes. No payments. No player engine changes.
*/
(function(){
'use strict';

const VERSION='V7.12.188 Live Readiness Search + Owner Brand Route Truth';

const ROUTES={
  home:'home-global-helpers-v7-4-4-test.html',
  library:'library-global-helpers-v7-4-8-test.html',
  details:'details-clean-machine-v7-12-38-test.html',
  player:'player-one-global-helpers-v7-3-3-test.html',
  player1:'player-one-global-helpers-v7-3-3-test.html',
  player2:'player-2-clean-machine-v7-12-58-test.html',
  search:'global-search-global-helpers-v7-4-9-test.html',
  genres:'genres-clean-machine-v7-12-45-test.html',
  channels:'channels-global-helpers-v7-5-3-test.html',
  playlists:'playlists-global-helpers-v7-5-2-test.html',
  collections:'collections-clean-machine-v7-12-51-test.html',
  myChannel:'my-channel-clean-machine-v7-12-47-test.html',
  submit:'submit-video-clean-machine-v7-12-79-test.html',
  rules:'rules-clean-machine-v7-12-82-test.html',
  review:'review-queue-clean-machine-v7-12-80-publish-test.html',
  about:'about-global-helpers-v7-4-7-test.html',
  supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
  watchlist:'watchlist-clean-machine-v7-12-43-test.html',
  favourites:'favourites-clean-machine-v7-12-41-test.html',
  likes:'likes-clean-machine-v7-12-42-test.html',
  liked:'likes-clean-machine-v7-12-42-test.html',
  accessibility:'accessibility-clean-machine-v7-12-44-test.html',
  continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
  watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
  profile:'profile-settings-live-ready-v7-12-90-test.html',
  admin:'admin-centre-command-deck-v7-12-121-test.html',
  readiness:'live-readiness-global-helpers-v7-10-2-test.html',
  registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',
  checklist:'test-checklist-global-helpers-v7-10-5-test.html',
  tools:'tools-page-original-global-pass-v7-12-136-test.html',
  health:'health-check-global-helpers-v7-10-6-test.html',
  mux:'mux-manager-global-helpers-v7-10-7-test.html',
  storage:'storage-prep-global-helpers-v7-10-8-test.html',
  backup:'backup-safety-global-helpers-v7-10-9-test.html',
  builder:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
  theme:'web-builder-theme-studio-controls-v7-8-9-test.html',
  settingsHub:'settings-platform-control-hub-v7-12-85-test.html',
  pagesManager:'web-builder-pages-manager-v7-12-111-test.html',
  preview:'web-builder-shared-style-preview-v7-12-117-test.html?page=test-page',
  formAdvanced:'web-builder-form-save-v7-12-94-test.html?page=test-page',
  formInbox:'web-builder-form-submissions-v7-12-94-test.html?page=test-page',
  policyCentre:'policy-documents-centre-v7-12-119-test.html',
  policyReader:'policy-reader-v7-12-119-test.html?policy=terms',
  policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',
  brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
  brandHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
  brandLogoHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
  faviconBuilder:'favicon-app-icon-builder-v7-12-15-test.html',
  helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',
  oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',
  userDashboard:'user-management-dashboard-v7-11-2-test.html',
  pricing:'plans-pricing-feature-shop-v7-11-3-test.html',
  permissions:'permissions-matrix-user-management-v7-11-4-test.html'
};

const BY_LABEL={
  'Home':[ROUTES.home,'Clean Home current'],
  'Library':[ROUTES.library,'Supabase Library'],
  'Details':[ROUTES.details,'Clean Details'],
  'Player 1':[ROUTES.player,'Single-title Player'],
  'Continue Watching':[ROUTES.continueWatching,'Resume'],
  'Watch History':[ROUTES.watchHistory,'Watch history'],
  'Watchlist':[ROUTES.watchlist,'Watchlist'],
  'Favourites':[ROUTES.favourites,'Favourites'],
  'Liked':[ROUTES.likes,'Liked'],
  'Likes':[ROUTES.likes,'Liked'],
  'Accessibility':[ROUTES.accessibility,'Accessibility'],

  'Supabase Library Editor':[ROUTES.supabaseLibrary,'Supabase editor'],
  'Genres':[ROUTES.genres,'Genres'],
  'Global Search':[ROUTES.search,'Full search'],
  'About':[ROUTES.about,'About'],

  'Submit Video':[ROUTES.submit,'Passed direct poster upload + direct submission'],
  'Rules':[ROUTES.rules,'Passed workflow checkpoint'],
  'Review Queue':[ROUTES.review,'Passed publish to Library'],

  'Playlists':[ROUTES.playlists,'Playlists'],
  'Channels':[ROUTES.channels,'Channels'],
  'My Channel':[ROUTES.myChannel,'My Channel'],
  'Collections':[ROUTES.collections,'Collections'],
  'Player 2':[ROUTES.player2,'Group Player'],

  'Settings Hub':[ROUTES.settingsHub,'Settings hub'],
  'Settings':[ROUTES.settingsHub,'Settings hub'],
  'Settings Studio':[ROUTES.theme,'Theme Studio owner'],
  'Theme Studio':[ROUTES.theme,'Theme Studio owner'],
  'Web Builder':[ROUTES.builder,'Builder Studio route'],
  'Profile Settings':[ROUTES.profile,'Profile image overlay'],

  'Form Inbox':[ROUTES.formInbox,'Builder form submissions inbox'],
  'Advanced Form':[ROUTES.formAdvanced,'Passed advanced builder form route'],
  'Web Builder Studio':[ROUTES.builder,'Builder rebuild route'],
  'Pages Manager':[ROUTES.pagesManager,'Create, edit, hide, restore and guarded-delete Web Builder pages'],
  'Published Preview':[ROUTES.preview,'Interactive published Web Builder preview'],

  'Policy & FAQ Centre':[ROUTES.policyCentre,'Policy'],
  'Policy Documents':[ROUTES.policyCentre,'Policy'],
  'Published Policy Proof':[ROUTES.policyReader,'Read-only proof'],
  'Policy Proof':[ROUTES.policyReader,'Read-only proof'],
  'Policy Admin Editor':[ROUTES.policyAdmin,'Policy admin'],

  'Admin Centre':[ROUTES.admin,'Admin command deck'],
  'Live Readiness':[ROUTES.readiness,'Release smoke test'],
  'Current Routes Registry':[ROUTES.registry,'Current route scanner'],
  'Version Registry':[ROUTES.registry,'Current route scanner','Current Routes Registry'],
  'Test Checklist':[ROUTES.checklist,'Testing'],
  'Tools':[ROUTES.tools,'Tools'],
  'Health Check':[ROUTES.health,'Health'],
  'Mux Manager':[ROUTES.mux,'Mux'],
  'Storage Prep':[ROUTES.storage,'Storage'],
  'Backup / Safety':[ROUTES.backup,'Backup'],

  'One Machine':[ROUTES.oneMachine,'Owner diagnostics'],
  'Platform Control Centre':[ROUTES.settingsHub,'Owner controls hub'],
  'Clean Machine Menu':[ROUTES.registry,'Owner diagnostic routed to current registry'],
  'Route Guard Proof':[ROUTES.health,'Owner diagnostic routed to health check'],
  'Route Pointer Machine':[ROUTES.registry,'Owner diagnostic routed to current registry'],
  'Final Shell Navigation':[ROUTES.helperShell,'Owner diagnostic routed to helper shell'],

  'Brand / App Icons':[ROUTES.brandIcons,'Brand tools'],
  'Brand Image Helper':[ROUTES.brandHelper,'Brand helper'],
  'Brand Logo Helper':[ROUTES.brandHelper,'Brand helper','Brand Image Helper'],
  'Favicon / App Icon Builder':[ROUTES.faviconBuilder,'Icon builder'],
  'Favicon Builder':[ROUTES.faviconBuilder,'Icon builder','Favicon / App Icon Builder'],
  'App Icon Builder':[ROUTES.faviconBuilder,'Icon builder','Favicon / App Icon Builder'],

  'User Dashboard':[ROUTES.userDashboard,'Users'],
  'Pricing Matrix':[ROUTES.pricing,'Pricing info only; no payments'],
  'Pricing Matrix / Feature Shop':[ROUTES.pricing,'Pricing info only; no payments'],
  'Permissions Matrix':[ROUTES.permissions,'Permissions']
};

const BY_FILE={
  'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,
  'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
  'all-pages-version-registry-v7-10-3-full-test.html':ROUTES.registry,
  'all-pages-version-registry-v6-29-test.html':ROUTES.registry,
  'all-pages-version-registry-admin-shell-v6-61-test.html':ROUTES.registry,
  'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,
  'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
  'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,
  'web-builder-full-edit-lock-v7-8-6-test.html':ROUTES.builder,
  'web-builder-admin-shell-v6-57-test.html':ROUTES.builder,
  'web-builder-global-helpers-v7-9-3-test.html':ROUTES.builder,
  'web-builder-form-save-v7-6-5-test.html':ROUTES.formAdvanced,
  'web-builder-form-save-v7-6-7-test.html':ROUTES.formAdvanced,
  'web-builder-shared-style-preview-v7-9-0-test.html':ROUTES.preview,
  'web-builder-shared-style-preview-v7-9-2-test.html':ROUTES.preview,
  'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,
  'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,
  'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,
  'stream-bandit-one-machine-v7-12-72-test.html':ROUTES.oneMachine,
  'platform-control-centre-combined-v7-12-61-test.html':ROUTES.settingsHub,
  'platform-control-centre-admin-v7-12-59-test.html':ROUTES.settingsHub,
  'stream-bandit-clean-machine-menu-v7-12-40-test.html':ROUTES.registry,
  'platform-control-tower-route-guard-proof-v7-12-33-test.html':ROUTES.health,
  'stream-bandit-route-pointer-machine-v7-12-36-test.html':ROUTES.registry,
  'final-shell-navigation-global-helpers-v7-5-9-test.html':ROUTES.helperShell,
  'brand-logo-helper-responsive-v7-12-20-test.html':ROUTES.brandHelper,
  'brand-image-helper-v7-12-20-test.html':ROUTES.brandHelper,
  'favicon-app-icon-builder-v7-12-15-test.html':ROUTES.faviconBuilder,
  'collections-clean-machine-v7-12-48-test.html':ROUTES.collections,
  'collections-clean-machine-v7-12-49-test.html':ROUTES.collections,
  'collections-clean-machine-v7-12-50-test.html':ROUTES.collections,
  'collections-global-helpers-v7-5-1-test.html':ROUTES.collections,
  'collections-browse-shell-v6-46-1-test.html':ROUTES.collections,
  'player-two-global-helpers-v7-3-4-test.html':ROUTES.player2,
  'player-2-progress-helper-v6-78-9-4-test.html':ROUTES.player2,
  'player-2-clean-machine-v7-12-57-test.html':ROUTES.player2,
  'my-channel-global-helpers-v7-5-0-test.html':ROUTES.myChannel,
  'profile-settings-global-helpers-v7-5-8-test.html':ROUTES.profile,
  'profile-settings-admin-shell-v6-56-test.html':ROUTES.profile,
  'settings-studio-admin-shell-v6-55-test.html':ROUTES.theme,
  'settings-sources-owner-launcher-v7-6-6-test.html':ROUTES.theme,
  'settings-platform-control-hub-v7-1-8-test.html':ROUTES.settingsHub,
  'settings-platform-control-hub-v7-1-6-test.html':ROUTES.settingsHub,
  'settings-admin-shell-v6-54-test.html':ROUTES.settingsHub,
  'submit-video-clean-machine-v7-12-53-test.html':ROUTES.submit,
  'submit-video-clean-machine-v7-12-75-test.html':ROUTES.submit,
  'submit-video-clean-machine-v7-12-78-test.html':ROUTES.submit,
  'submit-video-creator-shell-v6-49-test.html':ROUTES.submit,
  'submit-video-global-helpers-v7-5-6-test.html':ROUTES.submit,
  'rules-clean-machine-v7-12-54-test.html':ROUTES.rules,
  'rules-clean-machine-v7-12-81-test.html':ROUTES.rules,
  'rules-creator-shell-v6-50-test.html':ROUTES.rules,
  'rules-global-helpers-v7-5-5-test.html':ROUTES.rules,
  'review-queue-clean-machine-v7-12-55-test.html':ROUTES.review,
  'review-queue-global-helpers-v7-5-7-test.html':ROUTES.review,
  'review-queue-approved-to-movies-v7-0-0-test.html':ROUTES.review,
  'review-queue-creator-shell-v6-51-test.html':ROUTES.review,
  'global-search-admin-shell-v6-52-test.html':ROUTES.search,
  'global-search-v5-90-test.html':ROUTES.search,
  'home-watch-shell-v6-32-test.html':ROUTES.home,
  'watchlist-watch-shell-v6-37-test.html':ROUTES.watchlist,
  'favourites-watch-shell-v6-38-test.html':ROUTES.favourites,
  'liked-watch-shell-v6-39-test.html':ROUTES.likes
};

const STATIC_POLICIES=[
  ['terms','Terms of Use / End User Agreement','Terms, rules and end-user agreement for using Stream Bandit.'],
  ['privacy','Privacy Policy','Privacy, user data, account and contact policy.'],
  ['cookies','Cookie Policy','Cookies, local storage and browser storage policy.'],
  ['family-watch','Children / Family Watch Policy','Family watch, children safety and viewing guidance.'],
  ['cancellation','Cancellation / Refunds Policy','Cancellation, refund and subscription policy placeholder.'],
  ['creator-content','Creator / Content Rules','Creator upload, content, copyright and community rules.'],
  ['accessibility','Accessibility Statement','Accessibility statement, louder audio and player comfort support.']
];

let cache=null,loading=null,wired=false,cfg=null,observer=null,lastPatch=0;

function esc(s){return String(s??'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function arr(v){if(Array.isArray(v))return v.map(function(x){return String(x).trim();}).filter(Boolean);if(typeof v==='string'){try{let j=JSON.parse(v);if(Array.isArray(j))return j.map(function(x){return String(x).trim();}).filter(Boolean);}catch(e){}return v.split(/[|,]/).map(function(x){return x.trim();}).filter(Boolean);}return v?[String(v).trim()].filter(Boolean):[];}
function text(v){if(v==null)return '';if(Array.isArray(v))return v.join(' ');if(typeof v==='object'){try{return JSON.stringify(v);}catch(e){return '';}}return String(v);}
function short(s,q){s=clean(s);let n=s.toLowerCase().indexOf(String(q||'').toLowerCase());if(n<0)return s.slice(0,230);let a=Math.max(0,n-70),b=Math.min(s.length,n+170);return (a?'...':'')+s.slice(a,b)+(b<s.length?'...':'');}
function poster(m){return m.thumbnail_url||m.poster_url||m.poster||m.thumb||m.backdrop_url||m.image_url||'';}
function file(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0];}
function pageParam(){try{return new URL(location.href).searchParams.get('page')||'test-page';}catch(e){return 'test-page';}}
function route(u){return String(u||'').replace('page=test-page','page='+encodeURIComponent(pageParam()));}
function labelOf(a){let b=a.querySelector&&a.querySelector('b,.sb-shell-title');return clean(b?b.textContent:a.textContent).replace(/ Current$/,'').split('\n')[0].trim();}

function applyRouteMap(){
  try{
    window.StreamBanditRoutes=Object.assign(window.StreamBanditRoutes||{},ROUTES,{
      registry:ROUTES.registry,
      admin:ROUTES.admin,
      tools:ROUTES.tools,
      builder:ROUTES.builder,
      builderStudio:ROUTES.builder,
      policyCentre:ROUTES.policyCentre,
      policyAdmin:ROUTES.policyAdmin,
      policyProof:ROUTES.policyReader,
      platformControl:ROUTES.settingsHub,
      cleanMenu:ROUTES.registry,
      guard:ROUTES.health,
      pointer:ROUTES.registry,
      finalShell:ROUTES.helperShell,
      brandIcons:ROUTES.brandIcons,
      brandLogoHelper:ROUTES.brandHelper,
      brandHelper:ROUTES.brandHelper,
      faviconBuilder:ROUTES.faviconBuilder,
      groupPlayer:ROUTES.player2
    });
  }catch(e){}
}

function fixLink(a){
  if(!a||!a.getAttribute)return 0;
  let changed=0;
  let label=labelOf(a);
  let byLabel=BY_LABEL[label]||null;
  let href=a.getAttribute('href')||'';
  let f=file(href);
  let target=byLabel?byLabel[0]:(BY_FILE[f]||'');

  if(target){
    let next=route(target);
    if(href!==next){
      a.setAttribute('href',next);
      changed++;
    }
  }

  if(byLabel&&byLabel[2]){
    let b=a.querySelector('b,.sb-shell-title');
    if(b&&clean(b.textContent)!==byLabel[2]){
      b.textContent=byLabel[2];
      changed++;
    }
  }

  if(label==='Version Registry'){
    let b=a.querySelector('b,.sb-shell-title');
    if(b){b.textContent='Current Routes Registry';changed++;}
  }

  if(byLabel&&byLabel[1]){
    let sm=a.querySelector('small,.sb-shell-desc');
    if(sm&&clean(sm.textContent)!==byLabel[1]){
      sm.textContent=byLabel[1];
      changed++;
    }
  }

  if(target){a.dataset.sb188RouteFixed='true';}
  return changed;
}

function sanitizeMenu(force){
  let now=Date.now();
  if(!force&&now-lastPatch<350)return 0;
  lastPatch=now;
  applyRouteMap();
  let changed=0;
  try{
    document.querySelectorAll('a.sb-shell-link,.sb-shell-drawer a[href],.sb-menu-drawer a[href],#sbMenuDrawer a[href],a[href]').forEach(function(a){
      changed+=fixLink(a);
    });
  }catch(e){}
  try{
    document.documentElement.dataset.sb188MenuRouteSanitizer='active';
    document.documentElement.dataset.sb188MenuRoutesFixed=String((Number(document.documentElement.dataset.sb188MenuRoutesFixed)||0)+changed);
    document.documentElement.dataset.sb188OwnerBrandRouteTruth='true';
  }catch(e){}
  return changed;
}

async function readConfig(){
  if(cfg)return cfg;
  try{
    let txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(function(r){return r.text();});
    cfg={
      url:(txt.match(/SUPABASE_URL\s*=\s*['\"]([^'\"]+)/)||[])[1]||'',
      key:(txt.match(/SUPABASE_KEY\s*=\s*['\"]([^'\"]+)/)||[])[1]||''
    };
  }catch(e){
    cfg={url:'',key:''};
  }
  return cfg;
}

async function rest(table,params){
  let c=await readConfig();
  if(!c.url||!c.key)throw new Error('Supabase shell config unavailable');
  let url=c.url+'/rest/v1/'+table+'?'+(params||'select=*&limit=200');
  let r=await fetch(url,{headers:{apikey:c.key,Authorization:'Bearer '+c.key},cache:'no-store'});
  if(!r.ok)throw new Error(table+' REST '+r.status);
  return await r.json();
}

function add(out,seen,kind,title,url,body,icon,img,chips){
  title=clean(title||url||kind);
  url=url||'#';
  body=clean(body||title);
  let key=kind+'|'+title+'|'+url;
  if(!title||seen.has(key))return;
  seen.add(key);
  out.push({kind:kind,title:title,url:url,body:body,icon:icon||'🔎',img:img||'',chips:(chips||[]).map(clean).filter(Boolean)});
}

function routeRows(out,seen){
  applyRouteMap();
  Object.keys(ROUTES).forEach(function(k){
    add(out,seen,'Route',k,route(ROUTES[k]),k+' '+ROUTES[k],'🧭','',[file(ROUTES[k])]);
  });
  try{
    document.querySelectorAll('a[href],button,.tab,.card,.gate,.route,.footer a,h1,h2,h3').forEach(function(el){
      let t=clean(el.innerText||el.textContent||'');
      let u=el.getAttribute&&el.getAttribute('href')||location.pathname.split('/').pop();
      if(t.length>2)add(out,seen,'This page',t.slice(0,90),u,t,'📄');
    });
  }catch(e){}
  STATIC_POLICIES.forEach(function(p){
    add(out,seen,'Policy agreement',p[1],ROUTES.policyReader.replace('policy=terms','policy='+encodeURIComponent(p[0])),p[0]+' '+p[1]+' '+p[2],'📜','',[p[0],'policy']);
  });
}

async function loadData(force){
  if(cache&&!force)return cache;
  if(loading)return loading;
  loading=(async function(){
    let out=[],seen=new Set(),meta={movies:0,genres:0,channels:0,playlists:0,collections:0,sitePages:0,policies:0,routes:0,errors:[]};
    routeRows(out,seen);
    meta.routes=out.length;

    let movies=[];
    try{
      movies=(await rest('sb_movies','select=*&order=created_at.desc&limit=350')).filter(function(m){return String(m.status||'published').toLowerCase()!=='archived';});
      movies.forEach(function(m){
        let gs=arr(m.genres).concat(arr(m.genre));
        let ts=arr(m.tags).concat(arr(m.tag));
        let title=m.title||m.name||'Untitled movie';
        let body=[title,m.description,m.summary,m.channel,m.channel_name,m.creator,m.director,m.cast_text,m.rating,m.age_rating,m.year,m.release_year,m.release_date,m.runtime_text,gs.join(' '),ts.join(' ')].map(text).join(' ');
        add(out,seen,'Movie',title,ROUTES.details+'?id='+encodeURIComponent(m.id||''),body,'🎬',poster(m),gs.concat(ts).slice(0,4));
        meta.movies++;
      });
    }catch(e){meta.errors.push(e.message||String(e));}

    try{
      let gm={};
      movies.forEach(function(m){arr(m.genres).concat(arr(m.genre)).forEach(function(g){gm[g]=gm[g]||[];gm[g].push(m.title||m.name||'Untitled movie');});});
      Object.keys(gm).forEach(function(g){add(out,seen,'Genre',g,ROUTES.genres+'?genre='+encodeURIComponent(g),g+' '+gm[g].length+' movies '+gm[g].join(' '),'🏷️','',[gm[g].length+' movies']);meta.genres++;});
    }catch(e){}

    try{
      (await rest('sb_channels','select=*&order=created_at.desc&limit=220')).forEach(function(x){
        let title=x.name||x.title||'Channel';
        add(out,seen,'Channel',title,ROUTES.channels+'?id='+encodeURIComponent(x.id||''),[title,x.description,x.is_official?'official channel':'',x.owner_id].map(text).join(' '),'📺',x.avatar_url||x.image_url||'',[x.is_official?'official':'channel']);
        meta.channels++;
      });
    }catch(e){meta.errors.push(e.message||String(e));}

    try{
      (await rest('sb_playlists','select=*&order=created_at.desc&limit=220')).forEach(function(x){
        let title=x.name||x.title||'Playlist';
        add(out,seen,'Playlist',title,ROUTES.playlists+'?id='+encodeURIComponent(x.id||''),[title,x.description,x.is_public?'public playlist':'private playlist',x.owner_id].map(text).join(' '),'📃',x.image_url||'',[x.is_public?'public':'private']);
        meta.playlists++;
      });
    }catch(e){meta.errors.push(e.message||String(e));}

    try{
      (await rest('sb_collections','select=*&order=created_at.desc&limit=220')).forEach(function(x){
        let title=x.name||x.title||'Collection';
        add(out,seen,'Collection',title,ROUTES.collections+'?id='+encodeURIComponent(x.id||''),[title,x.description,x.created_by].map(text).join(' '),'🧺',x.image_url||'',['collection']);
        meta.collections++;
      });
    }catch(e){meta.errors.push(e.message||String(e));}

    try{
      (await rest('sb_site_pages','select=*&order=updated_at.desc&limit=220')).forEach(function(x){
        let slug=x.slug||x.page_slug||'';
        let title=x.title||x.name||x.page_title||slug||'Site page';
        let body=[title,slug,x.status,x.description,x.excerpt,text(x.blocks||x.sections||x.content_json||x.body||x.html||x.markdown||x.text)].join(' ');
        add(out,seen,'Site page',title,slug?ROUTES.preview.replace('page=test-page','page='+encodeURIComponent(slug)):ROUTES.pagesManager,body,'🏗️','',[x.status,slug]);
        meta.sitePages++;
      });
    }catch(e){meta.errors.push(e.message||String(e));}

    try{
      (await rest('sb_policy_documents','select=slug,title,body,status,contact_email,version_label,updated_at&order=updated_at.desc&limit=120')).forEach(function(x){
        let slug=x.slug||'';
        let title=x.title||slug||'Policy document';
        let body=[title,slug,x.status,x.version_label,x.contact_email,x.body].map(text).join(' ');
        add(out,seen,'Policy agreement',title,'policy-reader-v7-12-119-test.html?policy='+encodeURIComponent(slug||'terms'),body,'📜','',[x.status||'policy',slug]);
        meta.policies++;
      });
    }catch(e){meta.errors.push(e.message||String(e));}

    cache={rows:out,meta:meta};
    loading=null;
    document.documentElement.dataset.sb188SearchRows=String(out.length);
    document.documentElement.dataset.sb188MovieRows=String(meta.movies);
    document.documentElement.dataset.sb188PolicyRows=String(meta.policies);
    return cache;
  })();
  return loading;
}

function style(){
  if(document.getElementById('sb188SearchStyle'))return;
  let s=document.createElement('style');
  s.id='sb188SearchStyle';
  s.textContent='.sb156-site-search{position:fixed!important;right:28px!important;top:92px!important;width:min(900px,92vw)!important;max-height:78vh!important;overflow:auto!important;border:1px solid #22d3a657!important;border-radius:22px!important;background:linear-gradient(180deg,#08101cfa,#120c26fa)!important;box-shadow:0 30px 90px #000c!important;padding:12px!important;display:none!important;z-index:2147483647!important;color:#fff!important;font-family:Inter,system-ui,Arial,sans-serif!important}.sb156-site-search.open{display:block!important}.sb156-search-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.sb156-close{border:0;border-radius:999px;background:#414667;color:#fff;font-weight:950;padding:8px 11px;cursor:pointer}.sb156-result{display:grid;grid-template-columns:68px 1fr;gap:10px;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:16px;background:#ffffff0d;padding:10px;margin:8px 0}.sb156-result b{color:#baf7df}.sb156-result small,.sb156-desc{display:block;color:#b9c0d8;margin-top:4px}.sb156-kind{width:68px;aspect-ratio:16/10;border-radius:12px;background:linear-gradient(135deg,#22d3a6,#7c3cff);display:grid;place-items:center;overflow:hidden}.sb156-kind img{width:100%;height:100%;object-fit:cover}.sb156-note{padding:12px 14px;border-radius:18px;background:#ffb1421f;border:1px solid #ffb14252;color:#ffe7ad;font-weight:850;margin-top:8px}.sb156-chip{display:inline-flex;margin:4px 5px 0 0;padding:3px 7px;border-radius:999px;background:#22d3a624;border:1px solid #22d3a657;color:#baf7df;font-size:11px;font-weight:900}.sb156-search-meta{font-size:12px;color:#b9c0d8;margin:0 0 8px}.sb156-error{font-size:11px;color:#ffe7ad;margin-top:6px;opacity:.86}@media(max-width:760px){.sb156-site-search{left:10px!important;right:10px!important;top:76px!important;width:auto!important}}';
  document.head.appendChild(s);
}

function overlay(){
  style();
  let ov=document.getElementById('sb156SiteSearchOverlay');
  if(!ov){
    ov=document.createElement('div');
    ov.id='sb156SiteSearchOverlay';
    ov.className='sb156-site-search';
    ov.innerHTML='<div class="sb156-search-head"><b id="sb156SearchTitle">Stream Bandit search</b><button id="sb156CloseSearch" class="sb156-close" type="button">Close</button></div><div id="sb156SearchResults"></div><div class="sb156-note">Searches movies, genres, channels, playlists, collections, pages, policy agreements and current route/page text. Enter opens the full Global Search page.</div>';
    document.body.appendChild(ov);
    let c=document.getElementById('sb156CloseSearch');
    if(c)c.onclick=function(){ov.classList.remove('open');};
  }
  return ov;
}

function htmlResult(h,q){
  let chips=h.chips.slice(0,4).map(function(c){return '<span class="sb156-chip">'+esc(c)+'</span>';}).join('');
  let thumb=h.img?'<img src="'+esc(h.img)+'" alt="">':esc(h.icon||'🔎');
  return '<a class="sb156-result" href="'+esc(route(h.url))+'"><span class="sb156-kind">'+thumb+'</span><span><b>'+esc(h.title)+'</b><small>'+esc(h.kind)+' result</small><span class="sb156-desc">'+esc(short(h.body,q))+'</span>'+chips+'</span></a>';
}

async function search(q,force){
  q=String(q||'').trim();
  let ov=overlay();
  if(q.length<2){ov.classList.remove('open');return;}
  ov.classList.add('open');
  let box=document.getElementById('sb156SearchResults'),title=document.getElementById('sb156SearchTitle');
  if(title)title.textContent='Searching Stream Bandit for "'+q+'"';
  if(box)box.innerHTML='<div class="sb156-note">Loading movies, genres, channels, playlists, pages and policy agreements...</div>';
  let data=await loadData(force);
  let n=q.toLowerCase();
  let hits=data.rows.filter(function(r){return (r.title+' '+r.kind+' '+r.url+' '+r.body+' '+r.chips.join(' ')).toLowerCase().includes(n);}).sort(function(a,b){let rank={Movie:0,Genre:1,Channel:2,Playlist:3,Collection:4,'Site page':5,'Policy agreement':6,Route:7,'This page':8};return (rank[a.kind]??20)-(rank[b.kind]??20);}).slice(0,34);
  if(title)title.textContent=hits.length?'Results for “'+q+'”':'No Stream Bandit results for “'+q+'”';
  let meta=data.meta;
  let metaHtml='<div class="sb156-search-meta">Indexed '+data.rows.length+' items · movies '+meta.movies+' · genres '+meta.genres+' · channels '+meta.channels+' · playlists '+meta.playlists+' · collections '+meta.collections+' · pages '+meta.sitePages+' · policy agreements '+meta.policies+' · routes/page text '+meta.routes+'</div>';
  let err=meta.errors.length?'<div class="sb156-error">Read notes: '+esc(meta.errors.slice(0,5).join(' | '))+'</div>':'';
  if(box)box.innerHTML=metaHtml+(hits.length?hits.map(function(h){return htmlResult(h,q);}).join(''):'<div class="sb156-note">No matching movies/pages/routes/policies found. Press Enter for the full Global Search page.</div>')+err;
}

function input(){return document.getElementById('globalSearch')||document.getElementById('topSearch')||document.getElementById('sbHeaderSearchInput');}
function btn(){return document.getElementById('globalSearchBtn')||document.getElementById('topSearchBtn')||document.getElementById('sbHeaderSearchBtn');}
function val(){let i=input();return i?i.value:'';}

function hideOld(){
  ['sb129SiteSearchOverlay','sb128MovieSearchOverlay','sbGlobalShellSearchOverlay','searchOverlay'].forEach(function(id){
    let x=document.getElementById(id);
    if(x){x.classList.remove('open');x.style.display='none';x.style.visibility='hidden';x.style.pointerEvents='none';}
  });
}

function capture(e){
  let i=input(),b=btn();
  if(!i)return;
  if(e.type==='input'&&e.target===i){
    e.stopImmediatePropagation();
    e.stopPropagation();
    hideOld();
    setTimeout(function(){search(i.value,false);},0);
    return;
  }
  if((e.type==='keyup'||e.type==='focusin')&&e.target===i){
    hideOld();
    setTimeout(function(){search(i.value,false);},0);
    return;
  }
  if(e.type==='click'&&(e.target===b||e.target.closest&&e.target.closest('#globalSearchBtn,#topSearchBtn,#sbHeaderSearchBtn'))){
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    hideOld();
    search(i.value,true);
    return;
  }
  if(e.type==='keydown'&&e.target===i&&e.key==='Enter'){
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();
    location.href=ROUTES.search+(i.value.trim()?'?q='+encodeURIComponent(i.value.trim()):'');
  }
}

function wire(){
  if(wired)return;
  wired=true;
  style();
  overlay();
  applyRouteMap();
  sanitizeMenu(true);
  ['input','keyup','focusin','click','keydown'].forEach(function(t){document.addEventListener(t,capture,true);});
  let i=input(),b=btn();
  if(i){
    i.dataset.sb188Search='live-readiness-fallback-owner-brand-route-truth';
    i.oninput=function(){search(i.value,false);return false;};
    i.onfocus=function(){if(i.value.trim().length>1)search(i.value,false);return false;};
  }
  if(b)b.onclick=function(e){e.preventDefault();search(val(),true);return false;};
  try{
    observer=new MutationObserver(function(){sanitizeMenu(false);});
    observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href','class']});
  }catch(e){}
  setTimeout(function(){loadData(true);},800);
  setTimeout(function(){loadData(true);},2400);
  setTimeout(function(){sanitizeMenu(true);},250);
  setTimeout(function(){sanitizeMenu(true);},1000);
  setTimeout(function(){sanitizeMenu(true);},2500);
  setInterval(function(){sanitizeMenu(false);},2500);
  document.documentElement.dataset.sb188LiveReadinessSearch='active';
  document.documentElement.dataset.sb188OwnerBrandRouteTruth='true';
  window.StreamBanditLiveReadinessSearchFallback={
    version:VERSION,
    refresh:function(){sanitizeMenu(true);return loadData(true);},
    search:search,
    sanitizeMenu:function(){return sanitizeMenu(true);},
    routes:ROUTES,
    state:function(){return cache;},
    ownerBrandRouteTruth:true
  };
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
