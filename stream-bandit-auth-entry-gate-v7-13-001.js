(function(){
  'use strict';

  var VERSION = 'V7.13.001 Shared Auth Entry Gate Foundation';
  var LOGIN_URL = 'profile-settings-live-ready-v7-12-90-test.html';
  var PROFILE_TABLE = 'sb_profiles';
  var SESSION_CACHE_KEY = 'sb_auth_gate_session_v7_13_001';

  function $(sel, root){return (root || document).querySelector(sel);}
  function all(sel, root){return Array.prototype.slice.call((root || document).querySelectorAll(sel));}
  function now(){return new Date().toISOString();}
  function safeJSON(value, fallback){try{return JSON.parse(value);}catch(e){return fallback;}}

  function getClient(){
    if(window.sb && typeof window.sb.from === 'function') return window.sb;
    if(window.supabaseClient && typeof window.supabaseClient.from === 'function') return window.supabaseClient;
    if(window.SB_SUPABASE_CLIENT && typeof window.SB_SUPABASE_CLIENT.from === 'function') return window.SB_SUPABASE_CLIENT;
    if(window.supabase && typeof window.supabase.createClient === 'function'){
      var url = window.SB_SUPABASE_URL || window.STREAM_BANDIT_SUPABASE_URL || '';
      var key = window.SB_SUPABASE_ANON_KEY || window.SB_SUPABASE_PUBLISHABLE_KEY || window.STREAM_BANDIT_SUPABASE_ANON_KEY || window.STREAM_BANDIT_SUPABASE_PUBLISHABLE_KEY || '';
      if(url && key){
        window.SB_SUPABASE_CLIENT = window.supabase.createClient(url, key);
        return window.SB_SUPABASE_CLIENT;
      }
    }
    return null;
  }

  function getRoute(){
    var registry = window.SB_ROUTE_REGISTRY_V7_13_001;
    if(registry && typeof registry.currentRoute === 'function') return registry.currentRoute();
    return null;
  }

  function loginLink(){
    var next = location.pathname.split('/').pop() + location.search + location.hash;
    return LOGIN_URL + '?next=' + encodeURIComponent(next || 'home-global-helpers-v7-4-4-test.html');
  }

  function cacheState(state){
    try{localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(Object.assign({cachedAt:now()}, state || {})));}catch(e){}
  }

  function readCachedState(){
    try{return safeJSON(localStorage.getItem(SESSION_CACHE_KEY), null);}catch(e){return null;}
  }

  function showBlocked(reason, route){
    var title = route && route.label ? route.label : 'Protected page';
    var shell = document.createElement('div');
    shell.id = 'sbAuthEntryGateBlock';
    shell.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:radial-gradient(circle at 0 0,#22d3a633,transparent 34%),radial-gradient(circle at 100% 0,#7c3cff44,transparent 38%),#050711;color:#fff;display:grid;place-items:center;padding:18px;font-family:Inter,system-ui,Arial,sans-serif;';
    shell.innerHTML = '<main style="width:min(780px,100%);border:1px solid #ffffff26;border-radius:28px;background:linear-gradient(135deg,#101529,#17122d);box-shadow:0 24px 90px #0009;padding:22px">' +
      '<span style="display:inline-flex;border:1px solid #ffb14266;border-radius:999px;background:#ffb14224;color:#ffe7ad;font-weight:950;padding:7px 10px">Account required</span>' +
      '<h1 style="font-size:clamp(36px,6vw,72px);line-height:.94;margin:12px 0;letter-spacing:-.055em">Sign in first</h1>' +
      '<p style="color:#aeb8d6;line-height:1.55;font-weight:750">' + title + ' is protected by the Stream Bandit account and permissions gate. ' + reason + '</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">' +
      '<a href="' + loginLink() + '" style="display:inline-flex;border-radius:999px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#061017;text-decoration:none;font-weight:950;padding:11px 15px">Login / account</a>' +
      '<a href="home-global-helpers-v7-4-4-test.html" style="display:inline-flex;border-radius:999px;background:#30384f;color:white;text-decoration:none;font-weight:950;padding:11px 15px">Back to Home</a>' +
      '</div>' +
      '<p style="margin-top:14px;color:#aeb8d6;font-size:13px">Create account stays marked coming soon until the paid/account rules are ready.</p>' +
      '</main>';
    document.body.innerHTML = '';
    document.body.appendChild(shell);
  }

  function roleAllowed(route, profile){
    if(!route) return {ok:true, reason:''};
    var routeClass = route.routeClass || 'public';
    var role = String(profile && profile.role || '').toLowerCase();
    var adminLevel = String(profile && (profile.admin_level || profile.adminLevel) || '').toLowerCase();
    var planKey = String(profile && (profile.plan_key || profile.planKey) || '').toLowerCase();
    var accountStatus = String(profile && (profile.account_status || profile.accountStatus) || '').toLowerCase();
    var isOwner = role === 'owner' || adminLevel === 'owner' || planKey === 'platform_owner';
    var isAdmin = isOwner || role === 'admin' || adminLevel === 'admin';
    var active = !accountStatus || accountStatus === 'active';
    if(!active) return {ok:false, reason:'Your account is not active.'};
    if(routeClass === 'public') return {ok:true, reason:''};
    if(routeClass === 'account_required') return {ok:true, reason:''};
    if(routeClass === 'creator_submit'){
      if(isAdmin || profile && profile.can_submit) return {ok:true, reason:''};
      return {ok:false, reason:'Creator submit access is not enabled on this account.'};
    }
    if(routeClass === 'admin_only'){
      if(isAdmin) return {ok:true, reason:''};
      return {ok:false, reason:'Admin access is required.'};
    }
    if(routeClass === 'owner_only'){
      if(isOwner) return {ok:true, reason:''};
      return {ok:false, reason:'Owner access is required.'};
    }
    if(routeClass === 'web_builder' || routeClass === 'web_builder_owner'){
      if(isOwner || isAdmin || planKey.indexOf('builder') !== -1 || planKey.indexOf('platform') !== -1) return {ok:true, reason:''};
      return {ok:false, reason:'Web Builder access is not enabled for this account.'};
    }
    return {ok:true, reason:''};
  }

  async function getProfile(client, user){
    if(!client || !user) return null;
    var response = await client.from(PROFILE_TABLE).select('*').eq('id', user.id).maybeSingle();
    if(response && !response.error && response.data) return response.data;
    var alt = await client.from(PROFILE_TABLE).select('*').eq('user_id', user.id).maybeSingle();
    if(alt && !alt.error && alt.data) return alt.data;
    return null;
  }

  async function check(){
    var route = getRoute();
    var registry = window.SB_ROUTE_REGISTRY_V7_13_001;
    var protectedRoute = registry && typeof registry.isProtected === 'function' ? registry.isProtected(route) : false;
    if(!protectedRoute){
      window.SB_AUTH_ENTRY_GATE_V7_13_001 = {version:VERSION,route:route,protected:false,ok:true};
      window.dispatchEvent(new CustomEvent('sb:auth-gate-ready',{detail:window.SB_AUTH_ENTRY_GATE_V7_13_001}));
      return window.SB_AUTH_ENTRY_GATE_V7_13_001;
    }
    var client = getClient();
    if(!client || !client.auth || typeof client.auth.getSession !== 'function'){
      var cached = readCachedState();
      showBlocked('The Supabase auth client is not ready on this page yet.', route);
      return {version:VERSION,route:route,protected:true,ok:false,reason:'no-client',cached:cached};
    }
    var sessionResult = await client.auth.getSession();
    var session = sessionResult && sessionResult.data ? sessionResult.data.session : null;
    var user = session && session.user ? session.user : null;
    if(!user){
      cacheState({signedIn:false,route:route && route.url});
      showBlocked('You must be signed in before this page can show anything private.', route);
      return {version:VERSION,route:route,protected:true,ok:false,reason:'not-signed-in'};
    }
    var profile = await getProfile(client, user);
    var allowed = roleAllowed(route, profile || {});
    var state = {version:VERSION,route:route,protected:true,ok:allowed.ok,userId:user.id,email:user.email,profile:profile,reason:allowed.reason};
    cacheState({signedIn:true,userId:user.id,email:user.email,route:route && route.url,role:profile && profile.role,admin_level:profile && profile.admin_level,plan_key:profile && profile.plan_key,account_status:profile && profile.account_status});
    window.SB_AUTH_ENTRY_GATE_V7_13_001 = state;
    window.dispatchEvent(new CustomEvent('sb:auth-gate-ready',{detail:state}));
    if(!allowed.ok) showBlocked(allowed.reason || 'This page is locked for your account.', route);
    return state;
  }

  window.SB_AUTH_ENTRY_GATE_CHECK_V7_13_001 = check;

  function boot(){
    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', check, {once:true});
    }else{
      check();
    }
  }

  if(window.SB_ROUTE_REGISTRY_V7_13_001) boot();
  else window.addEventListener('sb:route-registry-ready', boot, {once:true});
})();
