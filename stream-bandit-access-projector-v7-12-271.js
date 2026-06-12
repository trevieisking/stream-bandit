/* Stream Bandit Access Projector V7.12.271
   Global read-only access state projector.
   Reads Supabase session/profile, uses shared entitlement resolver, projects safe route access flags.
   V7.12.271.1 also checks backend admin/owner RPC truth so real owner/admin accounts are not falsely locked.
   No Supabase writes. No redirects. No billing. Old URLs preserved.
*/
(function(){
  'use strict';

  const VERSION = 'V7.12.271.1 Access Projector / Backend Admin Truth';
  const CONFIG_SOURCE = 'stream-bandit-access-projector-v7-12-271.js';
  let client = null;
  let state = null;
  let loading = null;

  function fileOf(value){
    return String(value||'').split('/').pop().split('?')[0].split('#')[0] || 'index.html';
  }

  function currentFile(){
    return fileOf(location.pathname);
  }

  function routeMap(){
    return window.StreamBanditRouteAccessMapV712271 || null;
  }

  function routeInfo(file){
    const map = routeMap();
    if(map && typeof map.lookup === 'function') return map.lookup(file || currentFile());
    return null;
  }

  function loadScript(src){
    return new Promise(function(resolve,reject){
      try{
        const base = src.split('?')[0];
        const found = Array.from(document.scripts || []).find(function(s){
          return String(s.src || '').includes(base);
        });
        if(found){
          if(window.supabase || !base.includes('supabase')) return resolve();
        }
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.dataset.sbLoadedBy = 'access-projector-v7-12-271';
        s.onload = function(){ resolve(); };
        s.onerror = function(){ reject(new Error('Could not load '+src)); };
        document.head.appendChild(s);
      }catch(e){ reject(e); }
    });
  }

  async function ensureSupabase(){
    if(window.supabase) return window.supabase;
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    if(!window.supabase) throw new Error('Supabase SDK did not load.');
    return window.supabase;
  }

  async function ensureEntitlements(){
    if(window.StreamBanditEntitlementsV712269) return window.StreamBanditEntitlementsV712269;
    await loadScript('stream-bandit-entitlements-v7-12-269.js?v=access-projector-7-12-271-1');
    if(!window.StreamBanditEntitlementsV712269) throw new Error('Entitlements helper did not load.');
    return window.StreamBanditEntitlementsV712269;
  }

  async function ensureRouteMap(){
    if(window.StreamBanditRouteAccessMapV712271) return window.StreamBanditRouteAccessMapV712271;
    await loadScript('stream-bandit-route-access-map-v7-12-271.js?v=access-projector-7-12-271-1');
    return window.StreamBanditRouteAccessMapV712271 || null;
  }

  function config(){
    const cfg = window.StreamBanditSupabaseConfig || window.StreamBanditShellConfig || null;
    if(cfg && cfg.url && cfg.key) return cfg;
    if(window.StreamBanditShell && typeof window.StreamBanditShell.config === 'function'){
      const c = window.StreamBanditShell.config();
      if(c && c.url && c.key) return c;
    }
    if(window.SUPABASE_URL && window.SUPABASE_KEY){
      return { url: window.SUPABASE_URL, key: window.SUPABASE_KEY, source:'window globals' };
    }
    return null;
  }

  async function sb(){
    if(client) return client;
    const cfg = config();
    if(!cfg || !cfg.url || !cfg.key) throw new Error('Supabase config bridge not ready for access projector.');
    await ensureSupabase();
    client = window.supabase.createClient(cfg.url, cfg.key);
    return client;
  }

  async function readProfile(){
    const c = await sb();
    const session = await c.auth.getSession();
    const user = session && session.data && session.data.session ? session.data.session.user : null;
    if(!user) return { user:null, profile:null };
    const pr = await c.from('sb_profiles').select('id,username,display_name,channel_name,avatar_url,role,can_submit,account_status,admin_level,permissions_json,plan_key').eq('id', user.id).maybeSingle();
    if(pr.error) throw pr.error;
    return { user:user, profile:pr.data || null };
  }

  function boolValue(value){
    if(value === true) return true;
    if(value === false) return false;
    if(value === 1) return true;
    if(value === 0) return false;
    if(typeof value === 'string') return ['true','1','yes','y','on'].includes(value.trim().toLowerCase());
    return false;
  }

  async function readBackendAccess(user){
    const out = { admin:false, owner:false, checked:false, admin_error:null, owner_error:null };
    if(!user) return out;
    const c = await sb();
    out.checked = true;
    try{
      const r = await c.rpc('sb_is_admin');
      if(r && r.error) out.admin_error = r.error.message || String(r.error);
      else out.admin = boolValue(r && r.data);
    }catch(e){
      out.admin_error = e.message || String(e);
    }
    try{
      const r = await c.rpc('sb_is_owner');
      if(r && r.error) out.owner_error = r.error.message || String(r.error);
      else out.owner = boolValue(r && r.data);
    }catch(e){
      out.owner_error = e.message || String(e);
    }
    if(out.owner) out.admin = true;
    return out;
  }

  function elevateWithBackend(ent, backend){
    ent = ent || {};
    backend = backend || {};
    ent.backend_admin = !!backend.admin;
    ent.backend_owner = !!backend.owner;
    ent.backend_checked = !!backend.checked;
    ent.backend_admin_error = backend.admin_error || null;
    ent.backend_owner_error = backend.owner_error || null;

    ent.flags = ent.flags || {};
    ent.can = ent.can || {};
    ent.limits = ent.limits || {};

    if(backend.admin || backend.owner){
      ent.is_admin = true;
      ent.flags.admin_pages = true;
      ent.can.adminPages = true;
      ent.flags.profile_channel_edit = true;
      ent.flags.channels_create = true;
      ent.flags.channels_edit_own = true;
      ent.flags.channels_delete_own = true;
      ent.flags.channels_add_videos = true;
      ent.flags.playlists_create = true;
      ent.flags.playlists_edit_own = true;
      ent.flags.playlists_delete_own = true;
      ent.flags.playlists_add_videos = true;
      ent.flags.collections_create = true;
      ent.flags.collections_edit_own = true;
      ent.flags.collections_delete_own = true;
      ent.flags.collections_add_videos = true;
      ent.flags.group_play_manage = true;
      ent.can.editProfileChannel = true;
      ent.can.createChannel = true;
      ent.can.editOwnChannel = true;
      ent.can.deleteOwnChannel = true;
      ent.can.addVideosToChannel = true;
      ent.can.createPlaylist = true;
      ent.can.editOwnPlaylist = true;
      ent.can.deleteOwnPlaylist = true;
      ent.can.addVideosToPlaylist = true;
      ent.can.createCollection = true;
      ent.can.editOwnCollection = true;
      ent.can.deleteOwnCollection = true;
      ent.can.addVideosToCollection = true;
      ent.limits.channels_limit = Math.max(Number(ent.limits.channels_limit)||0, 9999);
      ent.limits.playlists_limit = Math.max(Number(ent.limits.playlists_limit)||0, 9999);
      ent.limits.collections_limit = Math.max(Number(ent.limits.collections_limit)||0, 9999);
      ent.limits.channel_movies_limit = Math.max(Number(ent.limits.channel_movies_limit)||0, 999999);
    }

    if(backend.owner){
      ent.is_owner = true;
      ent.flags.owner_pages = true;
      ent.can.ownerPages = true;
    }

    return ent;
  }

  function canSubmit(profile, ent){
    return !!(profile && profile.can_submit) || !!(ent && ent.is_admin) || ['creator_starter','creator_growth','creator_pro','studio_business','platform_owner'].includes(String(ent && ent.plan_key || ''));
  }

  function hasCustom(profile, key){
    const helper = window.StreamBanditEntitlementsV712269;
    const perms = helper && helper.parsePerms ? helper.parsePerms(profile || {}) : {};
    return perms && Object.prototype.hasOwnProperty.call(perms, key) && !!perms[key];
  }

  function webBuilderAllowed(profile, ent){
    if(ent && (ent.is_owner || ent.is_admin)) return true;
    if(hasCustom(profile, 'web_builder')) return true;
    return ['creator_growth','creator_pro','studio_business','platform_owner'].includes(String(ent && ent.plan_key || ''));
  }

  function accessAllowed(rule, profile, ent){
    if(!rule) return true;
    if(rule === 'public') return true;
    if(rule === 'account_optional') return true;
    if(rule === 'account_required') return !!profile && !!(ent && ent.is_active);
    if(rule === 'creator_submit') return !!profile && !!(ent && ent.is_active) && canSubmit(profile, ent);
    if(rule === 'theme_settings') return true;
    if(rule === 'group_play') return true;
    if(rule === 'reviewer_or_admin') return !!(ent && ent.can && ent.can.adminPages) || hasCustom(profile, 'review_queue') || hasCustom(profile, 'reviewer');
    if(rule === 'admin') return !!(ent && ent.can && ent.can.adminPages);
    if(rule === 'owner') return !!(ent && ent.can && ent.can.ownerPages);
    if(rule === 'owner_reference') return !!(ent && ent.can && ent.can.ownerPages);
    if(rule === 'web_builder') return !!profile && webBuilderAllowed(profile, ent);
    if(rule === 'web_builder_or_owner') return !!profile && (webBuilderAllowed(profile, ent) || !!(ent && ent.can && ent.can.ownerPages));
    return false;
  }

  function routeDecision(info, profile, ent){
    info = info || routeInfo();
    const rule = info && info.access || 'public';
    const allowed = accessAllowed(rule, profile, ent);
    return {
      route: currentFile(),
      info: info,
      rule: rule,
      allowed: allowed,
      noFlashGate: !!(info && info.noFlashGate),
      group: info && info.group || 'Unknown',
      label: info && info.label || currentFile(),
      mode: info && info.mode || 'unknown'
    };
  }

  function applyDataset(next){
    const root = document.documentElement;
    root.dataset.sbAccessProjector = 'v7-12-271-1';
    root.dataset.sbAccessReady = next.ready ? 'true' : 'false';
    root.dataset.sbAccessSignedIn = next.user ? 'true' : 'false';
    root.dataset.sbAccessPlan = next.entitlements ? next.entitlements.plan_key : 'guest';
    root.dataset.sbAccessAdmin = next.entitlements && next.entitlements.can && next.entitlements.can.adminPages ? 'true' : 'false';
    root.dataset.sbAccessOwner = next.entitlements && next.entitlements.can && next.entitlements.can.ownerPages ? 'true' : 'false';
    root.dataset.sbAccessBackendAdmin = next.entitlements && next.entitlements.backend_admin ? 'true' : 'false';
    root.dataset.sbAccessBackendOwner = next.entitlements && next.entitlements.backend_owner ? 'true' : 'false';
    root.dataset.sbAccessRouteAllowed = next.route && next.route.allowed ? 'true' : 'false';
    root.dataset.sbAccessRouteRule = next.route ? next.route.rule : 'public';
  }

  function dispatch(next){
    try{
      document.dispatchEvent(new CustomEvent('sb:access-ready', { detail: next }));
      document.dispatchEvent(new CustomEvent('streambandit:access-ready', { detail: next }));
    }catch(e){}
  }

  async function refresh(options){
    options = options || {};
    if(loading && !options.force) return loading;
    loading = (async function(){
      await ensureRouteMap();
      const helper = await ensureEntitlements();
      let payload = { user:null, profile:null };
      let backend = { admin:false, owner:false, checked:false };
      try{
        payload = await readProfile();
        backend = await readBackendAccess(payload.user);
      }catch(e){
        state = {
          version: VERSION,
          ready: true,
          error: e.message || String(e),
          user: null,
          profile: null,
          entitlements: helper.resolve({}, {}),
          route: routeDecision(routeInfo(), null, helper.resolve({}, {})),
          source: CONFIG_SOURCE
        };
        applyDataset(state);
        dispatch(state);
        loading = null;
        return state;
      }
      const ent = elevateWithBackend(helper.resolve(payload.profile || {}, {}), backend);
      state = {
        version: VERSION,
        ready: true,
        error: null,
        user: payload.user ? { id: payload.user.id, email: payload.user.email || '' } : null,
        profile: payload.profile,
        entitlements: ent,
        backend: backend,
        route: routeDecision(routeInfo(), payload.profile, ent),
        source: CONFIG_SOURCE
      };
      applyDataset(state);
      dispatch(state);
      loading = null;
      return state;
    })();
    return loading;
  }

  function getState(){
    return state;
  }

  function can(key){
    const ent = state && state.entitlements;
    if(!ent) return false;
    if(ent.can && Object.prototype.hasOwnProperty.call(ent.can, key)) return !!ent.can[key];
    if(ent.flags && Object.prototype.hasOwnProperty.call(ent.flags, key)) return !!ent.flags[key];
    return false;
  }

  function allowed(route){
    const info = routeInfo(route || currentFile());
    const ent = state && state.entitlements;
    const profile = state && state.profile;
    return accessAllowed(info && info.access || 'public', profile, ent);
  }

  window.StreamBanditAccessProjector = {
    version: VERSION,
    refresh: refresh,
    state: getState,
    can: can,
    allowed: allowed,
    routeInfo: routeInfo,
    routeDecision: function(route){
      const info = routeInfo(route || currentFile());
      return routeDecision(info, state && state.profile, state && state.entitlements);
    }
  };

  document.documentElement.dataset.sbAccessReady = 'false';

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ refresh({force:true}); });
  }else{
    refresh({force:true});
  }

  setTimeout(function(){ refresh({force:true}); }, 1200);
  window.addEventListener('storage', function(e){
    if(String(e.key || '').includes('sb_') || String(e.key || '').includes('streamBandit')) refresh({force:true});
  });
})();
