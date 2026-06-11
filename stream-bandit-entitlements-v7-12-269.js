/* Stream Bandit Entitlements V7.12.269
   Shared frontend entitlement resolver for Group Play and owner/admin gating.
   No Supabase writes. No route changes. No billing changes.
*/
(function(){
  'use strict';

  const VERSION = 'V7.12.269 Stream Bandit Entitlements';

  const PLAN_LIMITS = {
    free_viewer: {
      channels_limit: 0,
      playlists_limit: 0,
      collections_limit: 0,
      channel_movies_limit: 0
    },
    viewer_plus: {
      channels_limit: 0,
      playlists_limit: 2,
      collections_limit: 0,
      channel_movies_limit: 0
    },
    creator_starter: {
      channels_limit: 1,
      playlists_limit: 5,
      collections_limit: 0,
      channel_movies_limit: 25
    },
    creator_growth: {
      channels_limit: 3,
      playlists_limit: 12,
      collections_limit: 5,
      channel_movies_limit: 150
    },
    creator_pro: {
      channels_limit: 8,
      playlists_limit: 40,
      collections_limit: 20,
      channel_movies_limit: 1000
    },
    studio_business: {
      channels_limit: 25,
      playlists_limit: 150,
      collections_limit: 75,
      channel_movies_limit: 5000
    },
    platform_owner: {
      channels_limit: 9999,
      playlists_limit: 9999,
      collections_limit: 9999,
      channel_movies_limit: 999999
    }
  };

  const DEFAULT_FLAGS = {
    profile_channel_edit: false,
    channels_create: false,
    channels_edit_own: false,
    channels_delete_own: false,
    channels_add_videos: false,
    playlists_create: false,
    playlists_edit_own: false,
    playlists_delete_own: false,
    playlists_add_videos: false,
    collections_create: false,
    collections_edit_own: false,
    collections_delete_own: false,
    collections_add_videos: false,
    group_play_manage: false,
    admin_pages: false,
    owner_pages: false
  };

  const PLAN_FLAGS = {
    free_viewer: {},
    viewer_plus: {
      playlists_create: true,
      playlists_edit_own: true,
      playlists_delete_own: true,
      playlists_add_videos: true
    },
    creator_starter: {
      profile_channel_edit: true,
      channels_create: true,
      channels_edit_own: true,
      channels_delete_own: true,
      channels_add_videos: true,
      playlists_create: true,
      playlists_edit_own: true,
      playlists_delete_own: true,
      playlists_add_videos: true
    },
    creator_growth: {
      profile_channel_edit: true,
      channels_create: true,
      channels_edit_own: true,
      channels_delete_own: true,
      channels_add_videos: true,
      playlists_create: true,
      playlists_edit_own: true,
      playlists_delete_own: true,
      playlists_add_videos: true,
      collections_create: true,
      collections_edit_own: true,
      collections_delete_own: true,
      collections_add_videos: true,
      group_play_manage: true
    },
    creator_pro: {
      profile_channel_edit: true,
      channels_create: true,
      channels_edit_own: true,
      channels_delete_own: true,
      channels_add_videos: true,
      playlists_create: true,
      playlists_edit_own: true,
      playlists_delete_own: true,
      playlists_add_videos: true,
      collections_create: true,
      collections_edit_own: true,
      collections_delete_own: true,
      collections_add_videos: true,
      group_play_manage: true
    },
    studio_business: {
      profile_channel_edit: true,
      channels_create: true,
      channels_edit_own: true,
      channels_delete_own: true,
      channels_add_videos: true,
      playlists_create: true,
      playlists_edit_own: true,
      playlists_delete_own: true,
      playlists_add_videos: true,
      collections_create: true,
      collections_edit_own: true,
      collections_delete_own: true,
      collections_add_videos: true,
      group_play_manage: true,
      admin_pages: true
    },
    platform_owner: {
      profile_channel_edit: true,
      channels_create: true,
      channels_edit_own: true,
      channels_delete_own: true,
      channels_add_videos: true,
      playlists_create: true,
      playlists_edit_own: true,
      playlists_delete_own: true,
      playlists_add_videos: true,
      collections_create: true,
      collections_edit_own: true,
      collections_delete_own: true,
      collections_add_videos: true,
      group_play_manage: true,
      admin_pages: true,
      owner_pages: true
    }
  };

  function asBool(value){
    if(value === true) return true;
    if(value === false) return false;
    if(value === 1) return true;
    if(value === 0) return false;
    if(typeof value === 'string'){
      return ['true','1','yes','y','on'].includes(value.trim().toLowerCase());
    }
    return false;
  }

  function asInt(value, fallback){
    const n = Number(value);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
  }

  function parsePerms(profile){
    const raw = profile && profile.permissions_json;
    if(!raw) return {};
    if(typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if(typeof raw === 'string'){
      try{
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      }catch(e){
        return {};
      }
    }
    return {};
  }

  function planKey(profile){
    const key = String(profile && profile.plan_key || 'free_viewer');
    return PLAN_LIMITS[key] ? key : 'free_viewer';
  }

  function isOwner(profile){
    return !!profile && (profile.admin_level === 'owner' || (profile.role === 'admin' && profile.plan_key === 'platform_owner'));
  }

  function isAdmin(profile){
    return !!profile && (profile.role === 'admin' || profile.admin_level === 'admin' || profile.admin_level === 'owner');
  }

  function isActive(profile){
    return !!profile && String(profile.account_status || 'active') === 'active';
  }

  function resolve(profile, counts){
    counts = counts || {};
    const key = planKey(profile || {});
    const custom = parsePerms(profile || {});
    const limits = Object.assign({}, PLAN_LIMITS[key] || PLAN_LIMITS.free_viewer);
    const flags = Object.assign({}, DEFAULT_FLAGS, PLAN_FLAGS[key] || {});
    const admin = isAdmin(profile);
    const owner = isOwner(profile);
    const active = isActive(profile);

    Object.keys(flags).forEach(function(flag){
      if(Object.prototype.hasOwnProperty.call(custom, flag)) flags[flag] = asBool(custom[flag]);
    });

    Object.keys(limits).forEach(function(limit){
      if(Object.prototype.hasOwnProperty.call(custom, limit)) limits[limit] = asInt(custom[limit], limits[limit]);
    });

    if(admin){
      flags.profile_channel_edit = true;
      flags.channels_create = true;
      flags.channels_edit_own = true;
      flags.channels_delete_own = true;
      flags.channels_add_videos = true;
      flags.playlists_create = true;
      flags.playlists_edit_own = true;
      flags.playlists_delete_own = true;
      flags.playlists_add_videos = true;
      flags.collections_create = true;
      flags.collections_edit_own = true;
      flags.collections_delete_own = true;
      flags.collections_add_videos = true;
      flags.group_play_manage = true;
      flags.admin_pages = true;
      limits.channels_limit = Math.max(limits.channels_limit, 9999);
      limits.playlists_limit = Math.max(limits.playlists_limit, 9999);
      limits.collections_limit = Math.max(limits.collections_limit, 9999);
      limits.channel_movies_limit = Math.max(limits.channel_movies_limit, 999999);
    }

    if(owner){
      flags.owner_pages = true;
    }

    if(!active){
      Object.keys(flags).forEach(function(flag){
        if(flag !== 'owner_pages' && flag !== 'admin_pages') flags[flag] = false;
      });
    }

    const channelCount = asInt(counts.channels, 0);
    const playlistCount = asInt(counts.playlists, 0);
    const collectionCount = asInt(counts.collections, 0);
    const movieCount = asInt(counts.channelMovies, counts.movies || 0);

    return {
      version: VERSION,
      profile_id: profile && profile.id || null,
      plan_key: key,
      account_status: profile && profile.account_status || 'active',
      role: profile && profile.role || 'user',
      admin_level: profile && profile.admin_level || 'none',
      can_submit: !!(profile && profile.can_submit),
      is_active: active,
      is_admin: admin,
      is_owner: owner,
      permissions_json: custom,
      flags: flags,
      limits: limits,
      counts: {
        channels: channelCount,
        playlists: playlistCount,
        collections: collectionCount,
        channelMovies: movieCount
      },
      can: {
        editProfileChannel: active && flags.profile_channel_edit,
        createChannel: active && flags.channels_create && channelCount < limits.channels_limit,
        editOwnChannel: active && flags.channels_edit_own,
        deleteOwnChannel: active && flags.channels_delete_own,
        addVideosToChannel: active && flags.channels_add_videos && movieCount < limits.channel_movies_limit,
        createPlaylist: active && flags.playlists_create && playlistCount < limits.playlists_limit,
        editOwnPlaylist: active && flags.playlists_edit_own,
        deleteOwnPlaylist: active && flags.playlists_delete_own,
        addVideosToPlaylist: active && flags.playlists_add_videos,
        createCollection: active && flags.collections_create && collectionCount < limits.collections_limit,
        editOwnCollection: active && flags.collections_edit_own,
        deleteOwnCollection: active && flags.collections_delete_own,
        addVideosToCollection: active && flags.collections_add_videos,
        adminPages: active && flags.admin_pages,
        ownerPages: active && flags.owner_pages
      }
    };
  }

  function describe(entitlements){
    if(!entitlements) return 'No entitlements loaded.';
    return [
      'Plan: ' + entitlements.plan_key,
      'Status: ' + entitlements.account_status,
      'Channels: ' + entitlements.counts.channels + ' / ' + entitlements.limits.channels_limit,
      'Playlists: ' + entitlements.counts.playlists + ' / ' + entitlements.limits.playlists_limit,
      'Collections: ' + entitlements.counts.collections + ' / ' + entitlements.limits.collections_limit
    ].join(' | ');
  }

  window.StreamBanditEntitlementsV712269 = {
    version: VERSION,
    planLimits: PLAN_LIMITS,
    planFlags: PLAN_FLAGS,
    resolve: resolve,
    describe: describe,
    parsePerms: parsePerms,
    planKey: planKey,
    isAdmin: isAdmin,
    isOwner: isOwner,
    isActive: isActive
  };

  document.documentElement.dataset.sbEntitlements = 'v7-12-269';
})();
