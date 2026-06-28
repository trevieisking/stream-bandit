/* Stream Bandit Global Helper Loader V7.12.187
   Filename kept for old pages.
   Owner Brand Route Truth fix.
   Stops Brand Image Helper and Favicon / App Icon Builder being rewritten back to Brand / App Icons.
   Adds canonical Social route parity and safe Web Builder owned-route targets.
   No Supabase writes, no payments, no player engine changes, no live promotion.
*/
(function(){
'use strict';

const VERSION='V7.12.187 Global Helper Loader / Social Route Parity';
const DEF='test-page';
const FOUNDATION_VERSION='foundation-7-12-187-social-route-parity';

const ROUTES={
  home:'home-global-helpers-v7-4-4-test.html',
  library:'library-global-helpers-v7-4-8-test.html',
  details:'details-clean-machine-v7-12-38-test.html',
  player1:'player-one-global-helpers-v7-3-3-test.html',
  player2:'player-2-clean-machine-v7-12-58-test.html',
  search:'global-search-global-helpers-v7-4-9-test.html',
  genres:'genres-clean-machine-v7-12-45-test.html',
  channels:'channels-global-helpers-v7-5-3-test.html',
  playlists:'playlists-global-helpers-v7-5-2-test.html',
  myChannel:'my-channel-clean-machine-v7-12-47-test.html',
  collections:'collections-clean-machine-v7-12-51-test.html',
  watchlist:'watchlist-clean-machine-v7-12-43-test.html',
  favourites:'favourites-clean-machine-v7-12-41-test.html',
  liked:'likes-clean-machine-v7-12-42-test.html',
  likes:'likes-clean-machine-v7-12-42-test.html',
  accessibility:'accessibility-clean-machine-v7-12-44-test.html',
  continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
  watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
  profile:'profile-settings-live-ready-v7-12-90-test.html',

  socialProfile:'profile-social-v7-13-001-test.html',
  friends:'friends-social-v7-13-001-test.html',
  newsFeed:'news-feed-social-v7-13-001-test.html',
  groups:'groups-social-v7-13-001-test.html',

  submit:'submit-video-clean-machine-v7-12-79-test.html',
  rules:'rules-clean-machine-v7-12-82-test.html',
  review:'review-queue-clean-machine-v7-12-80-publish-test.html',
  about:'about-global-helpers-v7-4-7-test.html',
  supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',

  admin:'admin-centre-command-deck-v7-12-121-test.html',
  readiness:'live-readiness-global-helpers-v7-10-2-test.html',
  registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',
  checklist:'test-checklist-global-helpers-v7-10-5-test.html',
  tools:'tools-page-original-global-pass-v7-12-136-test.html',
  health:'health-check-global-helpers-v7-10-6-test.html',
  mux:'mux-manager-global-helpers-v7-10-7-test.html',
  storage:'storage-prep-global-helpers-v7-10-8-test.html',
  backup:'backup-safety-global-helpers-v7-10-9-test.html',

  builder:'web-builder-account-control-hub-v7-12-263-test.html',
  theme:'web-builder-theme-studio-controls-v7-8-9-test.html',
  pagesManager:'web-builder-pages-manager-owned-v7-12-256-test.html',
  preview:'web-builder-preview-owned-v7-12-257-test.html?page=test-page',
  formAdvanced:'web-builder-form-designer-owned-v7-12-258-test.html?page=test-page',
  formInbox:'web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page',

  policyCentre:'policy-documents-centre-v7-12-119-test.html',
  policyReader:'policy-reader-v7-12-119-test.html?policy=terms',
  policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',

  brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
  brandHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
  faviconBuilder:'favicon-app-icon-builder-v7-12-15-test.html',

  helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',
  oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',
  platformControl:'settings-platform-control-hub-v7-12-85-test.html',

  userDashboard:'user-management-dashboard-v7-11-2-test.html',
  pricing:'plans-pricing-feature-shop-v7-11-3-test.html',
  permissions:'permissions-matrix-user-management-v7-11-4-test.html'
};

const ROUTE_FIXES={
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

  'news-feed-social-v7-13-002-test.html':ROUTES.newsFeed,
  'news-feed-social-v7-13-003-test.html':ROUTES.newsFeed,

  'settings-studio-admin-shell-v6-55-test.html':ROUTES.theme,
  'settings-sources-owner-launcher-v7-6-6-test.html':ROUTES.theme,

  'settings-platform-control-hub-v7-1-8-test.html':ROUTES.platformControl,
  'settings-platform-control-hub-v7-1-6-test.html':ROUTES.platformControl,
  'settings-admin-shell-v6-54-test.html':ROUTES.platformControl,

  'web-builder-full-edit-lock-v7-8-6-test.html':ROUTES.builder,
  'web-builder-admin-shell-v6-57-test.html':ROUTES.builder,
  'web-builder-global-helpers-v7-9-3-test.html':ROUTES.builder,
  'web-builder-live-studio-v7-12-116-test.html':ROUTES.builder,
  'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
  'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,

  'web-builder-form-save-v7-6-5-test.html':ROUTES.formAdvanced,
  'web-builder-form-save-v7-6-7-test.html':ROUTES.formAdvanced,
  'web-builder-form-save-v7-12-94-test.html':ROUTES.formAdvanced,
  'web-builder-form-submissions-v7-12-94-test.html':ROUTES.formInbox,
  'web-builder-shared-style-preview-v7-9-0-test.html':ROUTES.preview,
  'web-builder-shared-style-preview-v7-9-2-test.html':ROUTES.preview,
  'web-builder-shared-style-preview-v7-12-117-test.html':ROUTES.preview,
  'web-builder-pages-manager-v7-12-111-test.html':ROUTES.pagesManager,

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
  'liked-watch-shell-v6-39-test.html':ROUTES.likes,

  'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,
  'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
  'all-pages-version-registry-v7-10-3-full-test.html':ROUTES.registry,
  'all-pages-version-registry-v6-29-test.html':ROUTES.registry,
  'all-pages-version-registry-admin-shell-v6-61-test.html':ROUTES.registry,
  'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,

  'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,
  'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,
  'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,

  'stream-bandit-clean-machine-menu-v7-12-40-test.html':ROUTES.registry,
  'platform-control-tower-route-guard-proof-v7-12-33-test.html':ROUTES.health,
  'stream-bandit-route-pointer-machine-v7-12-36-test.html':ROUTES.registry,
  'final-shell-navigation-global-helpers-v7-5-9-test.html':ROUTES.helperShell,

  'stream-bandit-one-machine-v7-12-72-test.html':ROUTES.oneMachine,
  'platform-control-centre-combined-v7-12-61-test.html':ROUTES.platformControl,
  'platform-control-centre-admin-v7-12-59-test.html':ROUTES.platformControl,

  'settings-brand-icons-promoted-v7-12-21-test.html':ROUTES.brandIcons,
  'brand-logo-helper-responsive-v7-12-20-test.html':ROUTES.brandHelper,
  'brand-image-helper-v7-12-20-test.html':ROUTES.brandHelper,
  'favicon-app-icon-builder-v7-12-15-test.html':ROUTES.faviconBuilder,

  'user-dashboard-concept-v6-68-test.html':ROUTES.userDashboard,
  'plans-pricing-matrix-v6-69-test.html':ROUTES.pricing,
  'permissions-matrix-v6-70-test.html':ROUTES.permissions
};

const LABEL_FIXES={
  'Library':[ROUTES.library,'Supabase Library'],
  'Genres':[ROUTES.genres,'Genres'],
  'Global Search':[ROUTES.search,'Full search'],
  'About':[ROUTES.about,'About'],

  'Playlists':[ROUTES.playlists,'Playlists'],
  'Channels':[ROUTES.channels,'Channels'],
  'My Channel':[ROUTES.myChannel,'My Channel'],
  'Collections':[ROUTES.collections,'Collections'],
  'Player 2':[ROUTES.player2,'Group Player'],

  'Social Profile':[ROUTES.socialProfile,'Social profile and wall'],
  'Friends':[ROUTES.friends,'Friends and requests'],
  'News Feed':[ROUTES.newsFeed,'Social feed'],
  'Groups':[ROUTES.groups,'Groups and events'],

  'Submit Video':[ROUTES.submit,'Passed direct poster upload + direct submission'],
  'Rules':[ROUTES.rules,'Passed workflow checkpoint'],
  'Review Queue':[ROUTES.review,'Passed publish to Library'],

  'Tools':[ROUTES.tools,'Tools'],
  'Current Routes Registry':[ROUTES.registry,'Current route scanner'],
  'Version Registry':[ROUTES.registry,'Current route scanner','Current Routes Registry'],
  'Admin Centre':[ROUTES.admin,'Admin command deck'],
  'Live Readiness':[ROUTES.readiness,'Release smoke test'],
  'Health Check':[ROUTES.health,'Health'],
  'Backup / Safety':[ROUTES.backup,'Backup'],

  'Settings':[ROUTES.platformControl,'Clean useful Settings Hub'],
  'Theme Studio':[ROUTES.theme,'Theme Studio owner'],
  'Settings Studio':[ROUTES.theme,'Theme Studio owner'],
  'Profile Settings':[ROUTES.profile,'Profile image overlay'],
  'Supabase Library Editor':[ROUTES.supabaseLibrary,'Supabase editor'],
  'Web Builder':[ROUTES.builder,'Web Builder hub'],
  'Pages Manager':[ROUTES.pagesManager,'Owned Web Builder pages manager'],
  'Published Preview':[ROUTES.preview,'Owned Web Builder preview'],
  'Form Inbox':[ROUTES.formInbox,'Owned Web Builder form inbox'],
  'Advanced Form':[ROUTES.formAdvanced,'Owned Web Builder form designer'],

  'Brand / App Icons':[ROUTES.brandIcons,'Logos, favicons and app icons'],
  'Brand Image Helper':[ROUTES.brandHelper,'Brand helper'],
  'Brand Logo Helper':[ROUTES.brandHelper,'Brand helper','Brand Image Helper'],
  'Favicon / App Icon Builder':[ROUTES.faviconBuilder,'Icon builder'],
  'Favicon Builder':[ROUTES.faviconBuilder,'Icon builder','Favicon / App Icon Builder'],
  'App Icon Builder':[ROUTES.faviconBuilder,'Icon builder','Favicon / App Icon Builder']
};

function fileOf(v){
  return String(v||'').split('/').pop().split('?')[0].split('#')[0];
}

function pageParam(){
  try{
    return new URL(location.href).searchParams.get('page')||DEF;
  }catch(e){
    return DEF;
  }
}

function pageRoute(route,oldValue){
  let out=String(route||'');
  if(out.includes('page=test-page')){
    let p=pageParam();
    try{
      let u=new URL(String(oldValue||''),location.href);
      p=u.searchParams.get('page')||p;
    }catch(e){}
    out=out.replace('page=test-page','page='+encodeURIComponent(p));
  }
  return out;
}

function fixedUrl(raw){
  if(!raw||!String(raw).includes('.html'))return raw;
  let target=ROUTE_FIXES[fileOf(raw)];
  return target?pageRoute(target,raw):raw;
}

function clean(s){
  return String(s||'').replace(/\s+/g,' ').trim();
}

function labelOf(a){
  let b=a.querySelector&&a.querySelector('b,.sb-shell-title');
  return clean(b?b.textContent:a.textContent).replace(/ Current$/,'');
}

function patchLabelLink(a){
  if(!a||!a.getAttribute)return 0;

  let label=labelOf(a);
  let fix=LABEL_FIXES[label];
  if(!fix)return 0;

  let changed=0;
  let old=a.getAttribute('href')||'';
  let next=pageRoute(fix[0],old);

  if(old!==next){
    a.setAttribute('href',next);
    changed++;
  }

  let b=a.querySelector('b,.sb-shell-title');
  if(fix[2]&&b&&clean(b.textContent)!==fix[2]){
    b.textContent=fix[2];
    changed++;
  }

  let sm=a.querySelector('small,.sb-shell-desc');
  if(sm&&fix[1]&&clean(sm.textContent)!==fix[1]){
    sm.textContent=fix[1];
    changed++;
  }

  a.dataset.sbRouteFixedBy='v7-12-187-loader';
  return changed;
}

function patchRoutes(root){
  root=root||document;
  let changed=0;

  try{
    root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(function(el){
      ['href','action','data-href','data-target','data-route','data-url'].forEach(function(attr){
        let old=el.getAttribute(attr);
        let fix=fixedUrl(old);

        if(old&&fix&&fix!==old){
          el.setAttribute(attr,fix);
          el.dataset.sbRouteFixedBy='v7-12-187-loader';
          changed++;
        }
      });

      if(el.matches&&el.matches('a')){
        changed+=patchLabelLink(el);
      }
    });
  }catch(e){}

  try{
    document.documentElement.dataset.sb186LoaderRoutesFixed=String((Number(document.documentElement.dataset.sb186LoaderRoutesFixed)||0)+changed);
  }catch(e){}

  return changed;
}

function patchRouteGlobals(){
  try{
    window.StreamBanditRoutes=Object.assign(
      window.StreamBanditRoutes||{},
      ROUTES,
      {
        oldRegistry:ROUTES.registry,
        builderStudio:ROUTES.builder,
        policyProof:ROUTES.policyReader,
        policyAdmin:ROUTES.policyAdmin,
        platformControl:ROUTES.platformControl,
        groupPlayer:ROUTES.player2,
        brandIcons:ROUTES.brandIcons,
        brandHelper:ROUTES.brandHelper,
        faviconBuilder:ROUTES.faviconBuilder,
        socialProfile:ROUTES.socialProfile,
        friends:ROUTES.friends,
        newsFeed:ROUTES.newsFeed,
        groups:ROUTES.groups
      }
    );
  }catch(e){}
}

function hideOldSearchOverlays(){
  [
    'sbGlobalShellSearchOverlay',
    'sb128MovieSearchOverlay',
    'sb129SiteSearchOverlay',
    'searchOverlay'
  ].forEach(function(id){
    let el=document.getElementById(id);
    if(el){
      el.classList.remove('open');
      el.style.display='none';
      el.style.visibility='hidden';
      el.style.pointerEvents='none';
    }
  });
}

function loadScript(src){
  try{
    let base=src.split('?')[0];
    if(Array.from(document.scripts||[]).some(function(s){
      return String(s.src||'').includes(base);
    }))return;

    let s=document.createElement('script');
    s.src=src;
    s.defer=true;
    s.dataset.sbLoadedBy='v7-12-187-loader';
    document.head.appendChild(s);
  }catch(e){}
}

function ensureFoundation(){
  loadScript('stream-bandit-theme-projector-v7-12-156.js?v='+FOUNDATION_VERSION);
  loadScript('stream-bandit-header-shell-v7-12-156.js?v='+FOUNDATION_VERSION);
  loadScript('stream-bandit-footer-shell-v7-12-156.js?v='+FOUNDATION_VERSION);
  loadScript('live-readiness-search-supabase-fallback-v7-12-130.js?v='+FOUNDATION_VERSION);
}

function refresh(){
  patchRouteGlobals();
  patchRoutes(document);
  hideOldSearchOverlays();
  ensureFoundation();

  try{
    if(window.StreamBanditThemeProjector&&window.StreamBanditThemeProjector.refresh){
      window.StreamBanditThemeProjector.refresh();
    }
  }catch(e){}

  try{
    if(window.StreamBanditHeaderShell&&window.StreamBanditHeaderShell.refresh){
      window.StreamBanditHeaderShell.refresh();
    }
  }catch(e){}

  try{
    if(window.StreamBanditFooterShell&&window.StreamBanditFooterShell.refresh){
      window.StreamBanditFooterShell.refresh();
    }
  }catch(e){}

  try{
    if(window.StreamBanditLiveReadinessSearchFallback&&window.StreamBanditLiveReadinessSearchFallback.sanitizeMenu){
      window.StreamBanditLiveReadinessSearchFallback.sanitizeMenu();
    }
  }catch(e){}

  try{
    document.dispatchEvent(new CustomEvent('streambandit:global-helper-loader-refresh',{
      detail:{
        version:VERSION,
        routes:ROUTES,
        foundation:true,
        ownerBrandRouteTruth:true
      }
    }));
  }catch(e){}

  return {
    version:VERSION,
    routes:ROUTES,
    foundation:true,
    ownerBrandRouteTruth:true
  };
}

function boot(){
  patchRouteGlobals();
  refresh();

  setTimeout(refresh,250);
  setTimeout(refresh,900);
  setTimeout(refresh,1800);
  setTimeout(refresh,3200);

  setInterval(function(){
    patchRouteGlobals();
    patchRoutes(document);
    ensureFoundation();
  },2500);

  try{
    let obs=new MutationObserver(function(){
      patchRoutes(document);
    });

    obs.observe(document.documentElement,{
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['href','action','data-href','data-target','data-route','data-url']
    });
  }catch(e){}

  window.StreamBanditGlobalHelperLoader={
    version:VERSION,
    refresh:refresh,
    patchRoutes:patchRoutes,
    routes:ROUTES,
    state:function(){
      return {
        version:VERSION,
        routes:ROUTES,
        foundation:true,
        foundationVersion:FOUNDATION_VERSION,
        ownerBrandRouteTruth:true,
        fixedOwnerRoutes:{
          brandIcons:ROUTES.brandIcons,
          brandHelper:ROUTES.brandHelper,
          faviconBuilder:ROUTES.faviconBuilder
        }
      };
    }
  };

  document.documentElement.dataset.streamBanditGlobalHelperLoader='v7-12-187-social-route-parity';
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot);
}else{
  boot();
}

})();