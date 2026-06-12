/* Stream Bandit Route Access Map V7.12.272
   Read-only route classes for plan, add-on, owner/admin and editor gates.
   Old URLs preserved. No Supabase writes. No redirects. No billing.
*/
(function(){
  'use strict';

  const VERSION = 'V7.12.272 Route Access Map / Plan Add-on Gate Classes';

  const ROUTES = {
    'home-global-helpers-v7-4-4-test.html': { group:'Watch', label:'Home', access:'public', routeClass:'public', feature:'watch_home', mode:'read' },
    'library-global-helpers-v7-4-8-test.html': { group:'Watch', label:'Library', access:'public', routeClass:'public', feature:'public_library', mode:'read_watch_save' },
    'details-clean-machine-v7-12-38-test.html': { group:'Watch', label:'Details', access:'public', routeClass:'public', feature:'details', mode:'read_watch_save' },
    'player-one-global-helpers-v7-3-3-test.html': { group:'Watch', label:'Player 1', access:'public', routeClass:'public', feature:'player1', mode:'watch' },
    'continue-watching-global-helpers-v7-3-9-test.html': { group:'Watch', label:'Continue Watching', access:'account_optional', routeClass:'account_optional', feature:'continue_watching', mode:'personal_state' },
    'watch-history-global-helpers-v7-4-0-test.html': { group:'Watch', label:'Watch History', access:'account_optional', routeClass:'account_optional', feature:'watch_history', mode:'personal_state' },
    'watchlist-clean-machine-v7-12-43-test.html': { group:'Watch', label:'Watchlist', access:'account_optional', routeClass:'account_optional', feature:'watchlist', mode:'personal_state' },
    'favourites-clean-machine-v7-12-41-test.html': { group:'Watch', label:'Favourites', access:'account_optional', routeClass:'account_optional', feature:'favourites', mode:'personal_state' },
    'likes-clean-machine-v7-12-42-test.html': { group:'Watch', label:'Likes / Liked', access:'account_optional', routeClass:'account_optional', feature:'likes', mode:'personal_state' },
    'accessibility-clean-machine-v7-12-44-test.html': { group:'Watch', label:'Accessibility', access:'public', routeClass:'public', feature:'accessibility', mode:'settings_read' },

    'supabase-library-home-header-form-fix-v7-12-34-test.html': { group:'Browse', label:'Supabase Library Editor', access:'editor_admin_owner', routeClass:'editor_admin_owner', feature:'library_editor', mode:'movie_editor', noFlashGate:true },
    'genres-clean-machine-v7-12-45-test.html': { group:'Browse', label:'Genres', access:'public', routeClass:'public', feature:'genres', mode:'read_watch_save' },
    'global-search-global-helpers-v7-4-9-test.html': { group:'Browse', label:'Global Search', access:'public', routeClass:'public', feature:'global_search', mode:'search' },
    'about-global-helpers-v7-4-7-test.html': { group:'Browse', label:'About', access:'public', routeClass:'public', feature:'about', mode:'read' },

    'submit-video-clean-machine-v7-12-79-test.html': { group:'Creator', label:'Submit Video', access:'creator_plan', routeClass:'creator_plan', feature:'submit_video', minPlan:'creator_starter', mode:'submission' },
    'rules-clean-machine-v7-12-82-test.html': { group:'Creator', label:'Rules', access:'public', routeClass:'public', feature:'rules', mode:'read' },
    'review-queue-clean-machine-v7-12-80-publish-test.html': { group:'Creator', label:'Review Queue', access:'editor_admin_owner', routeClass:'editor_admin_owner', feature:'review_queue', mode:'review_publish', noFlashGate:true },

    'playlists-global-helpers-v7-5-2-test.html': { group:'Group Play', label:'Playlists', access:'creator_plan', routeClass:'creator_plan', feature:'playlists', minPlan:'viewer_plus', mode:'own_write_limited', flags:['playlists_create','playlists_edit_own','playlists_delete_own','playlists_add_videos'], limit:'playlists_limit' },
    'channels-global-helpers-v7-5-3-test.html': { group:'Group Play', label:'Channels', access:'creator_plan', routeClass:'creator_plan', feature:'channels', minPlan:'creator_starter', mode:'own_write_limited', flags:['channels_create','channels_edit_own','channels_delete_own','channels_add_videos'], limit:'channels_limit' },
    'my-channel-clean-machine-v7-12-47-test.html': { group:'Group Play', label:'My Channel', access:'account_required', routeClass:'account_required', feature:'profile_channel', mode:'profile_channel' },
    'collections-clean-machine-v7-12-51-test.html': { group:'Group Play', label:'Collections', access:'creator_plan', routeClass:'creator_plan', feature:'collections', minPlan:'creator_growth', mode:'own_write_limited', flags:['collections_create','collections_edit_own','collections_delete_own','collections_add_videos'], limit:'collections_limit' },
    'player-2-clean-machine-v7-12-58-test.html': { group:'Group Play', label:'Player 2', access:'public', routeClass:'public', feature:'player2', mode:'group_watch' },

    'settings-platform-control-hub-v7-12-85-test.html': { group:'Settings', label:'Settings / Settings Hub', access:'account_optional', routeClass:'account_optional', feature:'settings_hub', mode:'settings_hub' },
    'web-builder-theme-studio-controls-v7-8-9-test.html': { group:'Settings', label:'Settings Studio / Theme Studio', access:'feature_addon', routeClass:'feature_addon', feature:'branding_theme_studio', mode:'theme_projector' },
    'profile-settings-live-ready-v7-12-90-test.html': { group:'Settings', label:'Profile Settings', access:'account_required', routeClass:'account_required', feature:'profile_settings', mode:'profile_settings' },
    'web-builder-account-control-hub-v7-12-263-test.html': { group:'Settings', label:'Web Builder', access:'web_builder', routeClass:'web_builder', feature:'web_builder_starter', minPlan:'creator_growth', mode:'web_builder_doorway' },

    'policy-documents-centre-v7-12-119-test.html': { group:'Policy', label:'Policy & FAQ Centre', access:'public', routeClass:'public', feature:'policy_centre', mode:'read' },
    'policy-reader-v7-12-119-test.html': { group:'Policy', label:'Published Policy Proof', access:'public', routeClass:'public', feature:'policy_reader', mode:'read' },
    'policy-admin-documents-v7-12-120-test.html': { group:'Policy', label:'Policy Admin Editor', access:'editor_admin_owner', routeClass:'editor_admin_owner', feature:'policy_admin', mode:'policy_editor', noFlashGate:true },

    'admin-centre-command-deck-v7-12-121-test.html': { group:'Admin', label:'Admin Centre', access:'owner_admin', routeClass:'owner_admin', feature:'admin_centre', mode:'admin_command', noFlashGate:true },
    'live-readiness-global-helpers-v7-10-2-test.html': { group:'Admin', label:'Live Readiness', access:'owner_admin', routeClass:'owner_admin', feature:'live_readiness', mode:'admin_readiness', noFlashGate:true },
    'all-pages-version-registry-v7-12-122-current-routes-test.html': { group:'Admin', label:'Current Routes Registry', access:'owner_only', routeClass:'owner_only', feature:'current_routes_registry', mode:'registry', noFlashGate:true },
    'test-checklist-global-helpers-v7-10-5-test.html': { group:'Admin', label:'Test Checklist', access:'owner_admin', routeClass:'owner_admin', feature:'test_checklist', mode:'admin_test', noFlashGate:true },
    'tools-page-original-global-pass-v7-12-136-test.html': { group:'Admin', label:'Tools', access:'owner_admin', routeClass:'owner_admin', feature:'tools', mode:'admin_tools', noFlashGate:true },
    'health-check-global-helpers-v7-10-6-test.html': { group:'Admin', label:'Health Check', access:'owner_admin', routeClass:'owner_admin', feature:'health_check', mode:'admin_health', noFlashGate:true },
    'mux-manager-global-helpers-v7-10-7-test.html': { group:'Admin', label:'Mux Manager', access:'owner_admin', routeClass:'owner_admin', feature:'mux_manager', mode:'mux_admin', noFlashGate:true },
    'storage-prep-global-helpers-v7-10-8-test.html': { group:'Admin', label:'Storage Prep', access:'owner_admin', routeClass:'owner_admin', feature:'storage_prep', mode:'storage_admin', noFlashGate:true },
    'backup-safety-global-helpers-v7-10-9-test.html': { group:'Admin', label:'Backup / Safety', access:'owner_admin', routeClass:'owner_admin', feature:'backup_safety', mode:'backup_admin', noFlashGate:true },

    'web-builder-form-submissions-v7-12-94-test.html': { group:'Owner', label:'Form Inbox', access:'web_builder_or_owner', routeClass:'web_builder_or_owner', feature:'forms', mode:'form_inbox', noFlashGate:true },
    'web-builder-form-save-v7-12-94-test.html': { group:'Owner', label:'Advanced Form', access:'web_builder_or_owner', routeClass:'web_builder_or_owner', feature:'forms', mode:'form_builder', noFlashGate:true },
    'stream-bandit-one-machine-v7-12-73-test.html': { group:'Owner', label:'One Machine', access:'owner_only', routeClass:'owner_only', feature:'one_machine', mode:'owner_diagnostic', noFlashGate:true },
    'stream-bandit-global-helper-shell-v7-12-126-test.html': { group:'Owner', label:'Final Shell Navigation', access:'owner_only', routeClass:'owner_only', feature:'final_shell_navigation', mode:'owner_shell', noFlashGate:true },
    'settings-brand-icons-promoted-v7-12-21-test.html': { group:'Owner', label:'Brand / App Icons', access:'owner_only', routeClass:'owner_only', feature:'brand_icons', mode:'brand_owner', noFlashGate:true },
    'brand-logo-helper-responsive-v7-12-20-test.html': { group:'Owner', label:'Brand Image Helper', access:'owner_only', routeClass:'owner_only', feature:'brand_image_helper', mode:'brand_owner', noFlashGate:true },
    'favicon-app-icon-builder-v7-12-15-test.html': { group:'Owner', label:'Favicon / App Icon Builder', access:'owner_only', routeClass:'owner_only', feature:'favicon_builder', mode:'brand_owner', noFlashGate:true },
    'web-builder-pages-manager-v7-12-111-test.html': { group:'Owner', label:'Pages Manager', access:'web_builder_or_owner', routeClass:'web_builder_or_owner', feature:'pages_manager', mode:'pages_manager', noFlashGate:true },
    'web-builder-shared-style-preview-v7-12-117-test.html': { group:'Owner', label:'Published Preview', access:'web_builder_or_owner', routeClass:'web_builder_or_owner', feature:'published_preview', mode:'published_preview' },

    'user-management-dashboard-v7-11-2-test.html': { group:'User Management', label:'User Dashboard', access:'owner_only', routeClass:'owner_only', feature:'user_management_dashboard', mode:'owner_rpc_profile_management', noFlashGate:true },
    'plans-pricing-feature-shop-v7-11-3-test.html': { group:'User Management', label:'Pricing Matrix / Feature Shop', access:'public_reference', routeClass:'public_reference', feature:'pricing_matrix', mode:'read_only_rulebook' },
    'permissions-matrix-user-management-v7-11-4-test.html': { group:'User Management', label:'Permissions Matrix', access:'owner_only', routeClass:'owner_only', feature:'permissions_matrix', mode:'read_only_rulebook', noFlashGate:true }
  };

  const OLD = {
    'collections-clean-machine-v7-12-48-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-clean-machine-v7-12-49-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-clean-machine-v7-12-50-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-global-helpers-v7-5-1-test.html':'collections-clean-machine-v7-12-51-test.html',
    'collections-browse-shell-v6-46-1-test.html':'collections-clean-machine-v7-12-51-test.html',
    'player-two-global-helpers-v7-3-4-test.html':'player-2-clean-machine-v7-12-58-test.html',
    'player-2-clean-machine-v7-12-57-test.html':'player-2-clean-machine-v7-12-58-test.html',
    'user-dashboard-concept-v6-68-test.html':'user-management-dashboard-v7-11-2-test.html',
    'plans-pricing-matrix-v6-69-test.html':'plans-pricing-feature-shop-v7-11-3-test.html',
    'permissions-matrix-v6-70-test.html':'permissions-matrix-user-management-v7-11-4-test.html'
  };

  function fileOf(value){ return String(value||'').split('/').pop().split('?')[0].split('#')[0]; }
  function canonical(value){ const f = fileOf(value); return OLD[f] || f; }
  function lookup(value){ return ROUTES[canonical(value)] || null; }
  function all(){ return Object.assign({}, ROUTES); }

  window.StreamBanditRouteAccessMapV712271 = {
    version: VERSION,
    routes: ROUTES,
    old: OLD,
    fileOf: fileOf,
    canonical: canonical,
    lookup: lookup,
    all: all
  };

  document.documentElement.dataset.sbRouteAccessMap = 'v7-12-272';
})();
