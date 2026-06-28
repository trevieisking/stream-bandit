(function(){
  'use strict';

  var VERSION = 'V7.13.024 Unified Route Registry Foundation / Social Route Parity';

  var ROUTE_CLASSES = {
    PUBLIC: 'public',
    ACCOUNT_OPTIONAL: 'account_optional',
    ACCOUNT_REQUIRED: 'account_required',
    CREATOR: 'creator_submit',
    CREATOR_PLAN: 'creator_plan',
    ADMIN: 'admin_only',
    OWNER: 'owner_only',
    WEB_BUILDER: 'web_builder',
    WEB_BUILDER_OWNER: 'web_builder_owner',
    PROTECTED_FILE: 'protected_file',
    MANIFEST: 'manifest'
  };

  var SHELLS = {
    MAIN_APP: 'main_app_shell',
    WEB_BUILDER: 'web_builder_studio_shell',
    PROTECTED_HELPER: 'protected_helper'
  };

  var ROUTES = [
    {label:'Home',url:'home-global-helpers-v7-4-4-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_movies'],write:[]},
    {label:'Library',url:'library-global-helpers-v7-4-8-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_movies','sb_watchlist','sb_favourites','sb_likes'],write:[]},
    {label:'Details',url:'details-clean-machine-v7-12-38-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_movies'],write:[]},
    {label:'Player 1',url:'player-one-global-helpers-v7-3-3-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_movies'],write:[]},
    {label:'Player 2',url:'player-2-clean-machine-v7-12-58-test.html',group:'Group Play',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_movies'],write:[]},
    {label:'Continue Watching',url:'continue-watching-global-helpers-v7-3-9-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_OPTIONAL,read:['sb_movies'],write:[]},
    {label:'Watch History',url:'watch-history-global-helpers-v7-4-0-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_OPTIONAL,read:['sb_movies'],write:[]},
    {label:'Watchlist',url:'watchlist-clean-machine-v7-12-43-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_OPTIONAL,read:['sb_movies','sb_watchlist'],write:['sb_watchlist']},
    {label:'Favourites',url:'favourites-clean-machine-v7-12-41-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_OPTIONAL,read:['sb_movies','sb_favourites'],write:['sb_favourites']},
    {label:'Likes',url:'likes-clean-machine-v7-12-42-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_OPTIONAL,read:['sb_movies','sb_likes'],write:['sb_likes']},
    {label:'Accessibility',url:'accessibility-clean-machine-v7-12-44-test.html',group:'Watch',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_app_settings'],write:[]},
    {label:'Global Search',url:'global-search-global-helpers-v7-4-9-test.html',group:'Browse',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_movies','sb_channels','sb_playlists'],write:[]},
    {label:'About',url:'about-global-helpers-v7-4-7-test.html',group:'Browse',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:[],write:[]},
    {label:'Supabase Library Editor',url:'supabase-library-home-header-form-fix-v7-12-34-test.html',group:'Browse',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ADMIN,read:['sb_movies','sb_profiles'],write:['sb_movies']},
    {label:'Genres',url:'genres-clean-machine-v7-12-45-test.html',group:'Browse',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_genres','sb_movies'],write:['sb_genres']},
    {label:'Submit Video',url:'submit-video-clean-machine-v7-12-79-test.html',group:'Creator',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.CREATOR,read:['sb_channels','sb_movies','sb_profiles','sb_submissions'],write:['sb_submissions']},
    {label:'Creator Rules',url:'rules-clean-machine-v7-12-82-test.html',group:'Creator',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_profiles'],write:[]},
    {label:'Review Queue',url:'review-queue-clean-machine-v7-12-80-publish-test.html',group:'Creator',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ADMIN,read:['sb_movies','sb_submissions','sb_profiles','sb_channels'],write:['sb_movies','sb_submissions']},
    {label:'Playlists',url:'playlists-global-helpers-v7-5-2-test.html',group:'Group Play',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.CREATOR_PLAN,minPlan:'viewer_plus',feature:'playlists',read:['sb_movies','sb_playlists','sb_playlist_movies','sb_profiles'],write:['sb_playlists','sb_playlist_movies']},
    {label:'Channels',url:'channels-global-helpers-v7-5-3-test.html',group:'Group Play',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.CREATOR_PLAN,minPlan:'creator_starter',feature:'channels',read:['sb_channels','sb_movies','sb_profiles'],write:['sb_channels','sb_profiles']},
    {label:'My Channel',url:'my-channel-clean-machine-v7-12-47-test.html',group:'Group Play',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_REQUIRED,read:['sb_channels','sb_collections','sb_movies','sb_playlists','sb_profiles','sb_submissions'],write:['sb_profiles']},
    {label:'Collections',url:'collections-clean-machine-v7-12-51-test.html',group:'Group Play',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.CREATOR_PLAN,minPlan:'creator_growth',feature:'collections',read:['sb_collection_movies','sb_collections','sb_movies','sb_profiles'],write:['sb_collections','sb_collection_movies']},
    {label:'Profile / Login',url:'profile-settings-live-ready-v7-12-90-test.html',group:'Account',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.PUBLIC,read:['sb_profiles'],write:['sb_profiles']},
    {label:'Social Profile',url:'profile-social-v7-13-001-test.html',group:'Social',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_REQUIRED,read:['sb_profiles','sb_profile_social_settings'],write:['sb_profile_social_settings']},
    {label:'Friends',url:'friends-social-v7-13-001-test.html',group:'Social',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_REQUIRED,read:['sb_profiles','sb_user_friends','sb_likes','sb_movies'],write:['sb_user_friends']},
    {label:'News Feed',url:'news-feed-social-v7-13-001-test.html',group:'Social',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_REQUIRED,read:['sb_social_posts','sb_social_events','sb_social_post_comments','sb_social_post_reactions'],write:['sb_social_posts','sb_social_post_comments','sb_social_post_reactions','sb_social_event_rsvps']},
    {label:'Groups',url:'groups-social-v7-13-001-test.html',group:'Social',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.ACCOUNT_REQUIRED,read:['sb_social_groups','sb_social_group_members','sb_social_posts','sb_social_events'],write:['sb_social_groups','sb_social_group_members','sb_social_posts','sb_social_events','sb_social_event_rsvps']},
    {label:'User Management Dashboard',url:'user-management-dashboard-v7-11-2-test.html',group:'User Management',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.OWNER,read:['sb_profiles','sb_admin_audit_log'],write:['sb_profiles']},
    {label:'Permissions Matrix',url:'permissions-matrix-user-management-v7-11-4-test.html',group:'User Management',shell:SHELLS.MAIN_APP,routeClass:ROUTE_CLASSES.OWNER,read:['sb_profiles','sb_admin_audit_log'],write:[]},
    {label:'Web Builder Hub',url:'web-builder-account-control-hub-v7-12-263-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER,read:['sb_profiles','sb_site_pages'],write:[]},
    {label:'Owned Pages Manager',url:'web-builder-pages-manager-owned-v7-12-256-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:['sb_site_pages']},
    {label:'Studio Shell',url:'overlay-route-truth-machine-v7-12-66-test.html?page=landing',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:[]},
    {label:'Owned Preview',url:'web-builder-preview-owned-v7-12-257-test.html?page=landing',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages','sb_form_submissions'],write:['sb_form_submissions']},
    {label:'Menu Builder',url:'web-builder-menu-builder-owned-v7-12-264-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:['sb_site_pages']},
    {label:'Form Designer',url:'web-builder-form-designer-owned-v7-12-258-test.html?page=landing',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages','sb_form_submissions','sb_private_messages'],write:['sb_site_pages','sb_form_submissions','sb_private_messages']},
    {label:'Form Inbox Bridge',url:'web-builder-form-inbox-owned-v7-12-258-test.html?page=landing',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_private_messages','sb_user_friends'],write:['sb_private_messages','sb_user_friends']},
    {label:'Assets',url:'web-builder-assets-v7-12-252-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:[]},
    {label:'Route Map',url:'web-builder-route-map-v7-12-252-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles'],write:[]},
    {label:'Control Map',url:'web-builder-control-map-v7-12-253-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles'],write:[]},
    {label:'Pages Source Map',url:'web-builder-pages-source-map-v7-12-255-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:[]},
    {label:'Header/Footer Code',url:'web-builder-header-footer-code-v7-12-254-test.html',group:'Web Builder',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:['sb_site_pages']},
    {label:'Web Builder Manifest',url:'WEB-BUILDER-MANIFEST-V7-12-252.md',group:'Manifest',shell:SHELLS.WEB_BUILDER,routeClass:ROUTE_CLASSES.WEB_BUILDER_OWNER,read:['sb_profiles','sb_site_pages'],write:[]}
  ];

  var OLD_ALIASES = {
    'collections-clean-machine-v7-12-48-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-clean-machine-v7-12-49-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-clean-machine-v7-12-50-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-global-helpers-v7-5-1-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-browse-shell-v6-46-1-test.html':'collections-clean-machine-v7-12-51-test.html',
    'player-two-global-helpers-v7-3-4-test.html':'player-2-clean-machine-v7-12-58-test.html',
    'player-2-clean-machine-v7-12-57-test.html':'player-2-clean-machine-v7-12-58-test.html',
    'web-builder-live-studio-v7-12-116-test.html':'web-builder-account-control-hub-v7-12-263-test.html',
    'web-builder-live-studio-v7-12-97-test.html':'web-builder-account-control-hub-v7-12-263-test.html',
    'web-builder-live-studio-v7-12-93-test.html':'web-builder-account-control-hub-v7-12-263-test.html',
    'web-builder-admin-shell-v6-57-test.html':'web-builder-account-control-hub-v7-12-263-test.html',
    'web-builder-global-helpers-v7-9-3-test.html':'web-builder-account-control-hub-v7-12-263-test.html',
    'news-feed-social-v7-13-002-test.html':'news-feed-social-v7-13-001-test.html',
    'news-feed-social-v7-13-003-test.html':'news-feed-social-v7-13-001-test.html',
    'user-dashboard-concept-v6-68-test.html':'user-management-dashboard-v7-11-2-test.html',
    'plans-pricing-matrix-v6-69-test.html':'plans-pricing-feature-shop-v7-11-3-test.html',
    'permissions-matrix-v6-70-test.html':'permissions-matrix-user-management-v7-11-4-test.html'
  };

  function fileOf(value){return String(value||'').split('/').pop().split('?')[0].split('#')[0] || 'index.html';}
  function canonical(value){var f = fileOf(value); return OLD_ALIASES[f] || f;}

  var GROUPS = ROUTES.reduce(function(acc, route){
    if(!acc[route.group]) acc[route.group] = [];
    acc[route.group].push(route);
    return acc;
  }, {});

  var BY_URL = ROUTES.reduce(function(acc, route){
    acc[fileOf(route.url)] = route;
    acc[route.url] = route;
    return acc;
  }, {});

  Object.keys(OLD_ALIASES).forEach(function(oldPath){
    var target = BY_URL[OLD_ALIASES[oldPath]];
    if(target) BY_URL[oldPath] = target;
  });

  function normalizePath(path){return canonical(path || location.pathname || 'index.html');}

  function currentRoute(){
    var clean = normalizePath(location.pathname);
    return BY_URL[clean] || BY_URL[clean + location.search] || null;
  }

  function isProtected(route){
    if(!route) return false;
    return route.routeClass !== ROUTE_CLASSES.PUBLIC && route.routeClass !== ROUTE_CLASSES.ACCOUNT_OPTIONAL;
  }

  function isWebBuilder(route){
    return !!route && route.shell === SHELLS.WEB_BUILDER;
  }

  window.SB_ROUTE_REGISTRY_V7_13_001 = {
    version: VERSION,
    routeClasses: ROUTE_CLASSES,
    shells: SHELLS,
    routes: ROUTES,
    groups: GROUPS,
    byUrl: BY_URL,
    oldAliases: OLD_ALIASES,
    fileOf: fileOf,
    canonical: canonical,
    normalizePath: normalizePath,
    currentRoute: currentRoute,
    isProtected: isProtected,
    isWebBuilder: isWebBuilder
  };

  window.dispatchEvent(new CustomEvent('sb:route-registry-ready',{detail:window.SB_ROUTE_REGISTRY_V7_13_001}));
})();