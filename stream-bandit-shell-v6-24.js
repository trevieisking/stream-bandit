/* Stream Bandit V6.24 Legacy Shell Bridge
   Filename kept because many older pages read Supabase config from it.
   V7.12.187 corrects Owner Brand route truth:
   Brand / App Icons -> settings-brand-icons-promoted-v7-12-21-test.html
   Brand Image Helper -> brand-logo-helper-responsive-v7-12-20-test.html
   Favicon / App Icon Builder -> favicon-app-icon-builder-v7-12-15-test.html
   Also preserves Group Play route truth:
   Collections -> collections-clean-machine-v7-12-51-test.html
   Player 2 -> player-2-clean-machine-v7-12-58-test.html
   V7.12.264 points legacy Web Builder route aliases to the Web Builder Hub.
   V7.12.271 loads the read-only Access Projector and protected-route Access Gate.
   V7.13.057 points app-facing old Web Builder support aliases to current owned Web Builder pages.
   No visual old shell. No movie-card save helper auto-load. No Supabase writes. No payments.
*/
(function(){
'use strict';

const VERSION='V6.24 Legacy Shell Bridge -> V7.13.057 Web Builder Owned Route Exposure Cleanup';
const DEF='test-page';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const FAVICON_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/global/logo-1779203548544.png';
const FOUNDATION='v7-13-057-web-builder-owned-route-exposure-cleanup';

const R={
 home:'home-global-helpers-v7-4-4-test.html',
 library:'library-global-helpers-v7-4-8-test.html',
 details:'details-clean-machine-v7-12-38-test.html',
 player1:'player-one-global-helpers-v7-3-3-test.html',
 player2:'player-2-clean-machine-v7-12-58-test.html',
 continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
 watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
 watchlist:'watchlist-clean-machine-v7-12-43-test.html',
 favourites:'favourites-clean-machine-v7-12-41-test.html',
 liked:'likes-clean-machine-v7-12-42-test.html',
 likes:'likes-clean-machine-v7-12-42-test.html',
 accessibility:'accessibility-clean-machine-v7-12-44-test.html',

 libraryEditor:'supabase-library-home-header-form-fix-v7-12-34-test.html',
 supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
 genres:'genres-clean-machine-v7-12-45-test.html',
 search:'global-search-global-helpers-v7-4-9-test.html',
 about:'about-global-helpers-v7-4-7-test.html',

 playlists:'playlists-global-helpers-v7-5-2-test.html',
 channels:'channels-global-helpers-v7-5-3-test.html',
 myChannel:'my-channel-clean-machine-v7-12-47-test.html',
 collections:'collections-clean-machine-v7-12-51-test.html',

 submit:'submit-video-clean-machine-v7-12-79-test.html',
 rules:'rules-clean-machine-v7-12-82-test.html',
 review:'review-queue-clean-machine-v7-12-80-publish-test.html',

 settings:'settings-platform-control-hub-v7-12-85-test.html',
 settingsHub:'settings-platform-control-hub-v7-12-85-test.html',
 studio:'web-builder-theme-studio-controls-v7-8-9-test.html',
 theme:'web-builder-theme-studio-controls-v7-8-9-test.html',
 profile:'profile-settings-live-ready-v7-12-90-test.html',

 builder:'web-builder-account-control-hub-v7-12-263-test.html',
 builderStudio:'web-builder-account-control-hub-v7-12-263-test.html',
 pagesManager:'web-builder-pages-manager-owned-v7-12-256-test.html',
 preview:'web-builder-preview-owned-v7-12-257-test.html?page=test-page',
 formAdvanced:'web-builder-form-designer-owned-v7-12-258-test.html?page=test-page',
 formInbox:'web-builder-form-inbox-owned-v7-12-258-test.html?page=test-page',

 brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
 brandHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
 brandLogoHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
 faviconBuilder:'favicon-app-icon-builder-v7-12-15-test.html',

 policyCentre:'policy-documents-centre-v7-12-119-test.html',
 policyReader:'policy-reader-v7-12-119-test.html?policy=terms',
 policyProof:'policy-reader-v7-12-119-test.html?policy=terms',
 policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',

 admin:'admin-centre-command-deck-v7-12-121-test.html',
 readiness:'live-readiness-global-helpers-v7-10-2-test.html',
 registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',
 checklist:'test-checklist-global-helpers-v7-10-5-test.html',
 tools:'tools-page-original-global-pass-v7-12-136-test.html',
 health:'health-check-global-helpers-v7-10-6-test.html',
 mux:'mux-manager-global-helpers-v7-10-7-test.html',
 storage:'storage-prep-global-helpers-v7-10-8-test.html',
 backup:'backup-safety-global-helpers-v7-10-9-test.html',

 helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',
 oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',
 platformControl:'settings-platform-control-hub-v7-12-85-test.html'
};

const FIX={
 'collections-clean-machine-v7-12-48-test.html':R.collections,
 'collections-clean-machine-v7-12-49-test.html':R.collections,
 'collections-clean-machine-v7-12-50-test.html':R.collections,
 'collections-global-helpers-v7-5-1-test.html':R.collections,
 'collections-browse-shell-v6-46-1-test.html':R.collections,

 'player-two-global-helpers-v7-3-4-test.html':R.player2,
 'player-2-progress-helper-v6-78-9-4-test.html':R.player2,
 'player-2-clean-machine-v7-12-57-test.html':R.player2,

 'my-channel-global-helpers-v7-5-0-test.html':R.myChannel,

 'profile-settings-global-helpers-v7-5-8-test.html':R.profile,
 'profile-settings-admin-shell-v6-56-test.html':R.profile,

 'settings-studio-admin-shell-v6-55-test.html':R.theme,
 'settings-sources-owner-launcher-v7-6-6-test.html':R.theme,

 'settings-platform-control-hub-v7-1-8-test.html':R.platformControl,
 'settings-platform-control-hub-v7-1-6-test.html':R.platformControl,
 'settings-admin-shell-v6-54-test.html':R.platformControl,

 'web-builder-full-edit-lock-v7-8-6-test.html':R.builder,
 'web-builder-admin-shell-v6-57-test.html':R.builder,
 'web-builder-global-helpers-v7-9-3-test.html':R.builder,
 'web-builder-live-studio-v7-12-116-test.html':R.builder,
 'web-builder-live-studio-v7-12-97-test.html':R.builder,
 'web-builder-live-studio-v7-12-93-test.html':R.builder,
 'web-builder-pages-manager-v7-12-111-test.html':R.pagesManager,

 'web-builder-form-save-v7-6-5-test.html':R.formAdvanced,
 'web-builder-form-save-v7-6-7-test.html':R.formAdvanced,
 'web-builder-form-save-v7-12-94-test.html':R.formAdvanced,
 'web-builder-form-submissions-v7-12-94-test.html':R.formInbox,
 'web-builder-shared-style-preview-v7-9-0-test.html':R.preview,
 'web-builder-shared-style-preview-v7-9-2-test.html':R.preview,
 'web-builder-shared-style-preview-v7-12-117-test.html':R.preview,

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

 'global-search-admin-shell-v6-52-test.html':R.search,
 'global-search-v5-90-test.html':R.search,

 'home-watch-shell-v6-32-test.html':R.home,
 'watchlist-watch-shell-v6-37-test.html':R.watchlist,
 'favourites-watch-shell-v6-38-test.html':R.favourites,
 'liked-watch-shell-v6-39-test.html':R.likes,

 'admin-centre-command-deck-v7-10-0-test.html':R.admin,
 'all-pages-version-registry-v7-1-4-full-test.html':R.registry,
 'all-pages-version-registry-v7-10-3-full-test.html':R.registry,
 'all-pages-version-registry-v6-29-test.html':R.registry,
 'all-pages-version-registry-admin-shell-v6-61-test.html':R.registry,
 'tools-page-global-helpers-v7-10-1-test.html':R.tools,

 'policy-agreements-centre-v7-11-6-test.html':R.policyCentre,
 'policy-reader-published-row-v7-12-27-test.html':R.policyReader,
 'policy-admin-save-editor-v7-12-25-test.html':R.policyAdmin,

 'stream-bandit-clean-machine-menu-v7-12-40-test.html':R.registry,
 'platform-control-tower-route-guard-proof-v7-12-33-test.html':R.health,
 'stream-bandit-route-pointer-machine-v7-12-36-test.html':R.registry,
 'final-shell-navigation-global-helpers-v7-5-9-test.html':R.helperShell,

 'stream-bandit-one-machine-v7-12-72-test.html':R.oneMachine,
 'platform-control-centre-combined-v7-12-61-test.html':R.platformControl,
 'platform-control-centre-admin-v7-12-59-test.html':R.platformControl,

 'settings-brand-icons-promoted-v7-12-21-test.html':R.brandIcons,
 'brand-logo-helper-responsive-v7-12-20-test.html':R.brandHelper,
 'brand-image-helper-v7-12-20-test.html':R.brandHelper,
 'favicon-app-icon-builder-v7-12-15-test.html':R.faviconBuilder
};

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
 let target=FIX[file(raw)];
 return target?pageRoute(target,raw):raw;
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
  s.dataset.sbLoadedBy='legacy-shell-bridge-safe-v7-13-057';
  document.head.appendChild(s);
 }catch(e){}
}

function setFavicon(){
 try{
  let existing=document.querySelector('link[rel="icon"]')||document.createElement('link');
  existing.rel='icon';
  existing.href=FAVICON_URL;
  document.head.appendChild(existing);
 }catch(e){}
}

function hideLegacyShellArtifacts(){
 try{
  document.querySelectorAll(
   '.sb-shell-menu-toggle,.sb-shell-scrim,.sb-shell-drawer,.sb104-right,.sb104-icons,.sb104-account,.sb104-profile,.sb104-search,.sb104-panel,#sbSharedShellMenu,#sbSharedShellDrawer,#sbSharedShellScrim'
  ).forEach(function(el){
   el.remove();
  });
 }catch(e){}

 try{
  document.querySelectorAll('style#sbSharedShellStyle').forEach(function(el){
   el.remove();
  });
 }catch(e){}

 document.documentElement.dataset.sbLegacyVisualShellRetired='true';
}

function patchRoutes(root){
 root=root||document;

 try{
  root.querySelectorAll('a[href],form[action],[data-href],[data-target],[data-route],[data-url]').forEach(function(el){
   ['href','action','data-href','data-target','data-route','data-url'].forEach(function(attr){
    let old=el.getAttribute(attr);
    let fix=fixedUrl(old);

    if(old&&fix&&fix!==old){
     el.setAttribute(attr,fix);
     el.dataset.sbRouteFixedBy='legacy-shell-bridge-v7-13-057';
    }
   });
  });
 }catch(e){}
}

function expose(){
 window.StreamBanditRoutes=Object.assign(
  window.StreamBanditRoutes||{},
  R,
  {
   groupPlayer:R.player2,
   brandIcons:R.brandIcons,
   brandHelper:R.brandHelper,
   brandLogoHelper:R.brandHelper,
   faviconBuilder:R.faviconBuilder
  }
 );

 window.StreamBanditSupabaseConfig={
  url:SUPABASE_URL,
  key:SUPABASE_KEY,
  source:'stream-bandit-shell-v6-24.js'
 };

 window.StreamBanditShellConfig=window.StreamBanditSupabaseConfig;
 window.SUPABASE_URL=window.SUPABASE_URL||SUPABASE_URL;
 window.SUPABASE_KEY=window.SUPABASE_KEY||SUPABASE_KEY;
}

function ensureFoundation(){
 loadScript('stream-bandit-theme-projector-v7-12-156.js?v='+FOUNDATION);
 loadScript('stream-bandit-route-access-map-v7-12-271.js?v='+FOUNDATION);
 loadScript('stream-bandit-access-projector-v7-12-271.js?v='+FOUNDATION);
 loadScript('stream-bandit-route-registry-v7-13-001.js?v='+FOUNDATION);
 loadScript('stream-bandit-auth-entry-gate-v7-13-001.js?v='+FOUNDATION);
 loadScript('stream-bandit-header-shell-v7-12-156.js?v='+FOUNDATION);
 loadScript('stream-bandit-footer-shell-v7-12-156.js?v='+FOUNDATION);
 loadScript('stream-bandit-global-helper-loader-v7-12-126.js?v='+FOUNDATION);
 loadScript('live-readiness-search-supabase-fallback-v7-12-130.js?v='+FOUNDATION);
 loadScript('stream-bandit-core-saves-v6-75.js?v='+FOUNDATION);
}

function refresh(){
 expose();
 setFavicon();
 hideLegacyShellArtifacts();
 patchRoutes(document);
 ensureFoundation();

 try{
  if(window.StreamBanditThemeProjector&&window.StreamBanditThemeProjector.refresh){
   window.StreamBanditThemeProjector.refresh();
  }
 }catch(e){}

 return state();
}

function state(){
 return {
  version:VERSION,
  visualShellRetired:true,
  foundation:true,
  movieCardHelperAutoLoad:false,
  routes:R,
  ownerBrandRouteTruth:true,
  accessProjectorLoaded:!!window.StreamBanditAccessProjector,
  accessGateLoaded:!!window.StreamBanditAccessGate,
  fixedOwnerRoutes:{
   brandIcons:R.brandIcons,
   brandHelper:R.brandHelper,
   faviconBuilder:R.faviconBuilder
  },
  supabase:{
   url:SUPABASE_URL,
   keyPresent:!!SUPABASE_KEY
  }
 };
}

function boot(){
 refresh();

 setTimeout(refresh,200);
 setTimeout(refresh,800);
 setTimeout(refresh,1800);

 setInterval(function(){
  hideLegacyShellArtifacts();
  patchRoutes(document);
  ensureFoundation();
 },3000);

 window.StreamBanditShell={
  version:VERSION,
  routes:R,
  refresh:refresh,
  state:state,
  config:function(){
   return {
    url:SUPABASE_URL,
    key:SUPABASE_KEY
   };
  }
 };

 window.StreamBanditLegacyShellBridge=window.StreamBanditShell;
 document.documentElement.dataset.sbLegacyShellBridge='v7-13-057-web-builder-owned-route-exposure-cleanup';
}

if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',boot);
}else{
 boot();
}

})();
