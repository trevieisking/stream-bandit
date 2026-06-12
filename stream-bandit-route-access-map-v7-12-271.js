/* Stream Bandit Route Access Map V7.12.271
   Read-only map for global access projection.
   Old URLs preserved. No Supabase writes. No redirects. No billing.
*/
(function(){
  'use strict';

  const VERSION = 'V7.12.271 Route Access Map';

  const ROUTES = {
    'home-global-helpers-v7-4-4-test.html': { group:'Watch', label:'Home', access:'public', mode:'read' },
    'library-global-helpers-v7-4-8-test.html': { group:'Watch', label:'Library', access:'public', mode:'read_watch_save' },
    'details-clean-machine-v7-12-38-test.html': { group:'Watch', label:'Details', access:'public', mode:'read_watch_save' },
    'player-one-global-helpers-v7-3-3-test.html': { group:'Watch', label:'Player 1', access:'public', mode:'watch' },
    'continue-watching-global-helpers-v7-3-9-test.html': { group:'Watch', label:'Continue Watching', access:'account_optional', mode:'personal_state' },
    'watch-history-global-helpers-v7-4-0-test.html': { group:'Watch', label:'Watch History', access:'account_optional', mode:'personal_state' },
    'watchlist-clean-machine-v7-12-43-test.html': { group:'Watch', label:'Watchlist', access:'account_optional', mode:'personal_state' },
    'favourites-clean-machine-v7-12-41-test.html': { group:'Watch', label:'Favourites', access:'account_optional', mode:'personal_state' },
    'likes-clean-machine-v7-12-42-test.html': { group:'Watch', label:'Likes / Liked', access:'account_optional', mode:'personal_state' },
    'accessibility-clean-machine-v7-12-44-test.html': { group:'Watch', label:'Accessibility', access:'public', mode:'settings_read' },

    'supabase-library-home-header-form-fix-v7-12-34-test.html': { group:'Browse', label:'Supabase Library Editor', access:'admin', mode:'movie_editor', noFlashGate:true },
    'genres-clean-machine-v7-12-45-test.html': { group:'Browse', label:'Genres', access:'public', mode:'read_watch_save' },
    'global-search-global-helpers-v7-4-9-test.html': { group:'Browse', label:'Global Search', access:'public', mode:'search' },
    'about-global-helpers-v7-4-7-test.html': { group:'Browse', label:'About', access:'public', mode:'read' },

    'submit-video-clean-machine-v7-12-79-test.html': { group:'Creator', label:'Submit Video', access:'creator_submit', mode:'submission' },
    'rules-clean-machine-v7-12-82-test.html': { group:'Creator', label:'Rules', access:'public', mode:'read' },
    'review-queue-clean-machine-v7-12-80-publish-test.html': { group:'Creator', label:'Review Queue', access:'reviewer_or_admin', mode:'review_publish', noFlashGate:true },

    'playlists-global-helpers-v7-5-2-test.html': { group:'Group Play', label:'Playlists', access:'group_play', feature:'playlists', mode:'own_write_limited', flags:['playlists_create','playlists_edit_own','playlists_delete_own','playlists_add_videos'], limit:'playlists_limit' },
    'channels-global-helpers-v7-5-3-test.html': { group:'Group Play', label:'Channels', access:'group_play', feature:'channels', mode:'own_write_limited', flags:['channels_create','channels_edit_own','channels_delete_own','channels_add_videos'], limit:'channels_limit' },
    'my-channel-clean-machine-v7-12-47-test.html': { group:'Group Play', label:'My Channel', access:'account_required', feature:'profile_channel', mode:'profile_channel' },
    'collections-clean-machine-v7-12-51-test.html': { group:'Group Play', label:'Collections', access:'group_play', feature:'collections', mode:'own_write_limited', flags:['collections_create','collections_edit_own','collections_delete_own','collections_add_videos'], limit:'collections_limit' },
    'player-2-clean-machine-v7-12-58-test.html': { group:'Group Play', label:'Player 2', access:'public', mode:'group_watch' },

    'settings-platform-control-hub-v7-12-85-test.html': { group:'Settings', label:'Settings / Settings Hub', access:'account_optional', mode:'settings_hub' },
    'web-builder-theme-studio-controls-v7-8-9-test.html': { group:'Settings', label:'Settings Studio / Theme Studio', access:'theme_settings', mode:'theme_projector' },
    'profile-settings-live-ready-v7-12-90-test.html': { group:'Settings', label:'Profile Settings', access:'account_required', mode:'profile_settings' },
    'web-builder-account-control-hub-v7-12-263-test.html': { group:'Settings', label:'Web Builder', access:'web_builder', mode:'web_builder_doorway' },

    'policy-documents-centre-v7-12-119-test.html': { group:'Policy', label:'Policy & FAQ Centre', access:'public', mode:'read' },
    'policy-reader-v7-12-119-test.html': { group:'Policy', label:'Published Policy Proof', access:'public', mode:'read' },
    'policy-admin-documents-v7-12-120-test.html': { group:'Policy', label:'Policy Admin Editor', access:'admin', mode:'policy_editor', noFlashGate:true },

    'admin-centre-command-deck-v7-12-121-test.html': { group:'Admin', label:'Admin Centre', access:'admin', mode:'admin', noFlashGate:true },
    'live-readiness-global-helpers-v7-10-2-test.html': { group:'Admin', label:'Live Readiness', access:'admin', mode:'admin_readiness', noFlashGate:true },
    'all-pages-version-registry-v7-12-122-current-routes-test.html': { group:'Admin', label:'Current Routes Registry', access:'admin', mode:'registry', noFlashGate:true },
    'test-checklist-global-helpers-v7-10-5-test.html': { group:'Admin', label:'Test Checklist', access:'admin', mode:'admin_test', noFlashGate:true },
    'tools-page-original-global-pass-v7-12-136-test.html': { group:'Admin', label:'Tools', access:'admin', mode:'admin_tools', noFlashGate:true },
    'health-check-global-helpers-v7-10-6-test.html': { group:'Admin', label:'Health Check', access:'admin', mode:'admin_health', noFlashGate:true },
    'mux-manager-global-helpers-v7-10-7-test.html': { group:'Admin', label:'Mux Manager', access:'admin', mode:'mux_admin', noFlashGate:true },
    'storage-prep-global-helpers-v7-10-8-test.html': { group:'Admin', label:'Storage Prep', access:'admin', mode:'storage_admin', noFlashGate:true },
    'backup-safety-global-helpers-v7-10-9-test.html': { group:'Admin', label:'Backup / Safety', access:'admin', mode:'backup_admin', noFlashGate:true },

    'web-builder-form-submissions-v7-12-94-test.html': { group:'Owner', label:'Form Inbox', access:'web_builder_or_owner', mode:'form_inbox', noFlashGate:true },
    'web-builder-form-save-v7-12-94-test.html': { group:'Owner', label:'Advanced Form', access:'web_builder_or_owner', mode:'form_builder', noFlashGate:true },
    'stream-bandit-one-machine-v7-12-73-test.html': { group:'Owner', label:'One Machine', access:'owner', mode:'owner_diagnostic', noFlashGate:true },
    'stream-bandit-global-helper-shell-v7-12-126-test.html': { group:'Owner', label:'Final Shell Navigation', access:'owner', mode:'owner_shell', noFlashGate:true },
    'settings-brand-icons-promoted-v7-12-21-test.html': { group:'Owner', label:'Brand / App Icons', access:'owner', mode:'brand_owner', noFlashGate:true },
    'brand-logo-helper-responsive-v7-12-20-test.html': { group:'Owner', label:'Brand Image Helper', access:'owner', mode:'brand_owner', noFlashGate:true },
    'favicon-app-icon-builder-v7-12-15-test.html': { group:'Owner', label:'Favicon / App Icon Builder', access:'owner', mode:'brand_owner', noFlashGate:true },
    'web-builder-pages-manager-v7-12-111-test.html': { group:'Owner', label:'Pages Manager', access:'web_builder_or_owner', mode:'pages_manager', noFlashGate:true },
    'web-builder-shared-style-preview-v7-12-117-test.html': { group:'Owner', label:'Published Preview', access:'web_builder_or_owner', mode:'published_preview' },

    'user-management-dashboard-v7-11-2-test.html': { group:'User Management', label:'User Dashboard', access:'owner', mode:'owner_rpc_profile_management', noFlashGate:true },
    'plans-pricing-feature-shop-v7-11-3-test.html': { group:'User Management', label:'Pricing Matrix / Feature Shop', access:'owner_reference', mode:'read_only_rulebook', noFlashGate:true },
    'permissions-matrix-user-management-v7-11-4-test.html': { group:'User Management', label:'Permissions Matrix', access:'owner_reference', mode:'read_only_rulebook', noFlashGate:true }
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

  function fileOf(value){
    return String(value||'').split('/').pop().split('?')[0].split('#')[0];
  }

  function canonical(value){
    const f = fileOf(value);
    return OLD[f] || f;
  }

  function lookup(value){
    return ROUTES[canonical(value)] || null;
  }

  function all(){
    return Object.assign({}, ROUTES);
  }

  window.StreamBanditRouteAccessMapV712271 = {
    version: VERSION,
    routes: ROUTES,
    old: OLD,
    fileOf: fileOf,
    canonical: canonical,
    lookup: lookup,
    all: all
  };

  document.documentElement.dataset.sbRouteAccessMap = 'v7-12-271';
})();
