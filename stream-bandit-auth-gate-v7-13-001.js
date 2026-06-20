/* Stream Bandit Auth Gate V7.13.001
   Shared future sign-in gate helper from Master Plan Section 10.
   Purpose: block normal guest browsing on pages that intentionally load this helper.
   Phase 1 target pages only: index.html and home-global-helpers-v7-4-4-test.html.
   Uses Supabase Auth email/password, signOut and resetPasswordForEmail.
   No public signup. No service-role key. No SQL/RLS/storage/payment changes. */
(function(){
  'use strict';

  var VERSION = 'V7.13.001 Auth Gate / Email Password / No Guest Users';
  var PROFILE_TABLE = 'sb_profiles';
  var APPROVED_STATUSES = ['active','approved','limited','review'];
  var BLOCKED_STATUSES = ['banned','restricted','deleted','disabled','suspended'];
  var sbClient = null;
  var running = false;
  var lastDecision = null;

  function $(id){ return document.getElementById(id); }

  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>\"']/g,function(ch){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
    });
  }

  function addScript(src){
    return new Promise(function(resolve,reject){
      try{
        var base = String(src).split('?')[0];
        var exists = Array.prototype.some.call(document.scripts || [], function(script){
          return String(script.src || '').indexOf(base) > -1;
        });
        if(exists) return resolve();

        var script = document.createElement('script');
        script.src = src;
        script.defer = true;
        script.onload = function(){ resolve(); };
        script.onerror = function(){ reject(new Error('Failed to load ' + src)); };
        document.head.appendChild(script);
      }catch(error){
        reject(error);
      }
    });
  }

  async function ensureSupabaseSdk(){
    if(window.supabase) return window.supabase;
    await addScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    return window.supabase;
  }

  function readShellConfig(){
    try{
      if(window.StreamBanditShell && typeof window.StreamBanditShell.config === 'function'){
        var cfg = window.StreamBanditShell.config();
        if(cfg && cfg.url && cfg.key) return cfg;
      }
    }catch(error){}

    var c = window.StreamBanditSupabaseConfig || window.StreamBanditShellConfig || {};
    return {
      url: window.SUPABASE_URL || c.url || '',
      key: window.SUPABASE_KEY || c.key || c.anonKey || c.anon_key || ''
    };
  }

  async function ensureConfig(){
    var cfg = readShellConfig();
    if(cfg.url && cfg.key) return cfg;

    try{ await addScript('stream-bandit-shell-v6-24.js?v=auth-gate-7-13-001'); }catch(error){}

    for(var i=0;i<30;i++){
      await new Promise(function(resolve){ setTimeout(resolve,100); });
      cfg = readShellConfig();
      if(cfg.url && cfg.key) return cfg;
    }

    return cfg;
  }

  async function client(){
    if(sbClient) return sbClient;
    var sdk = await ensureSupabaseSdk();
    var cfg = await ensureConfig();
    if(!cfg.url || !cfg.key) throw new Error('Supabase public config is not ready.');
    sbClient = sdk.createClient(cfg.url, cfg.key);
    return sbClient;
  }

  function normalizeProfile(profile){
    profile = profile && typeof profile === 'object' ? profile : {};
    return {
      id: profile.id || profile.auth_user_id || '',
      email: profile.email || '',
      username: profile.username || '',
      display_name: profile.display_name || profile.displayName || profile.channel_name || '',
      role: String(profile.role || 'user').toLowerCase(),
      admin_level: String(profile.admin_level || '').toLowerCase(),
      plan_key: String(profile.plan_key || '').toLowerCase(),
      account_status: String(profile.account_status || 'active').toLowerCase(),
      avatar_url: profile.avatar_url || profile.avatar || profile.profile_image_url || ''
    };
  }

  function isOwnerOrAdmin(profile){
    profile = normalizeProfile(profile);
    return profile.role === 'admin' || profile.role === 'owner' || profile.admin_level === 'owner' || profile.plan_key === 'platform_owner';
  }

  function isApproved(profile){
    profile = normalizeProfile(profile);
    if(BLOCKED_STATUSES.indexOf(profile.account_status) !== -1) return false;
    if(isOwnerOrAdmin(profile)) return true;
    return APPROVED_STATUSES.indexOf(profile.account_status || 'active') !== -1;
  }

  async function getProfile(user){
    if(!user || !user.id) return null;
    var c = await client();
    var result = await c.from(PROFILE_TABLE).select('*').eq('id', user.id).maybeSingle();
    if(result.error) throw result.error;
    return result.data || null;
  }

  function css(){
    if($('sbAuthGateCss')) return;
    var style = document.createElement('style');
    style.id = 'sbAuthGateCss';
    style.textContent = ''+
      '.sb-auth-gate{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;padding:18px;background:radial-gradient(circle at 0 0,#22d3a62d,transparent 34%),radial-gradient(circle at 100% 0,#7c3cff36,transparent 38%),linear-gradient(180deg,#070910,#050711);color:#f7fbff;font-family:Inter,system-ui,Arial,sans-serif;overflow:auto}'+
      '.sb-auth-gate.open{display:flex}'+
      '.sb-auth-card{width:min(760px,100%);border:1px solid #ffffff24;border-radius:32px;background:linear-gradient(135deg,#101529,#17122d);box-shadow:0 28px 100px #000c;padding:18px}'+
      '.sb-auth-head{display:flex;gap:12px;align-items:center;margin-bottom:14px}'+
      '.sb-auth-logo{width:58px;height:58px;min-width:58px;border-radius:18px;background:linear-gradient(135deg,#22d3a6,#7c3cff);display:grid;place-items:center;color:#071015;font-weight:1000}'+
      '.sb-auth-card h1{font-size:clamp(34px,6vw,66px);line-height:.94;letter-spacing:-.055em;margin:8px 0}'+
      '.sb-auth-card p,.sb-auth-card small,.sb-auth-card label{color:#b9c0d8;line-height:1.5}'+
      '.sb-auth-form{display:grid;gap:10px;margin-top:12px}'+
      '.sb-auth-form input{width:100%;border:1px solid #ffffff24;border-radius:16px;background:#0009;color:#fff;padding:12px;font:inherit}'+
      '.sb-auth-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}'+
      '.sb-auth-btn{border:0;border-radius:999px;background:#30384f;color:#fff;font-weight:950;padding:11px 14px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}'+
      '.sb-auth-btn.primary{background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#071015}'+
      '.sb-auth-btn.hot{background:linear-gradient(135deg,#ff2d85,#7c3cff);color:#fff}'+
      '.sb-auth-btn:disabled{opacity:.55;cursor:not-allowed}'+
      '.sb-auth-note{border:1px solid #ffb14266;background:#ffb14220;color:#ffe7ad;border-radius:18px;padding:12px;font-weight:850;margin-top:12px}'+
      '.sb-auth-good{border:1px solid #22d3a666;background:#22d3a620;color:#dfffee;border-radius:18px;padding:12px;font-weight:850;margin-top:12px}'+
      'body.sb-auth-gate-locked{overflow:hidden!important}'+
      '@media(max-width:700px){.sb-auth-actions .sb-auth-btn{flex:1 1 100%}.sb-auth-head{align-items:flex-start}}';
    document.head.appendChild(style);
  }

  function gateMarkup(){
    return ''+
      '<div id="sbAuthGate" class="sb-auth-gate" role="dialog" aria-modal="true" aria-labelledby="sbAuthTitle">'+
        '<section class="sb-auth-card">'+
          '<div class="sb-auth-head"><div class="sb-auth-logo">SB</div><div><b>Stream Bandit</b><small> Existing approved users only</small></div></div>'+
          '<h1 id="sbAuthTitle">Welcome to Stream Bandit</h1>'+
          '<p>Sign in to continue. Guest access is blocked on pages that use this gate.</p>'+
          '<div class="sb-auth-form">'+
            '<label>Email</label><input id="sbAuthEmail" type="email" autocomplete="email" placeholder="you@example.com">'+
            '<label>Password</label><input id="sbAuthPassword" type="password" autocomplete="current-password" placeholder="Password">'+
          '</div>'+
          '<div class="sb-auth-actions">'+
            '<button id="sbAuthLogin" class="sb-auth-btn primary" type="button">Login</button>'+
            '<button id="sbAuthReset" class="sb-auth-btn" type="button">Reset Password</button>'+
            '<button id="sbAuthLogout" class="sb-auth-btn hot" type="button">Logout</button>'+
            '<button id="sbAuthCreate" class="sb-auth-btn" type="button" disabled>Create Account Locked</button>'+
          '</div>'+
          '<div id="sbAuthStatus" class="sb-auth-note">Checking session...</div>'+
          '<div class="sb-auth-note">No public signup in this phase. No service-role key in the browser. No SQL, RLS, storage, payment or schema changes are made by this helper.</div>'+
        '</section>'+
      '</div>';
  }

  function ensureGate(){
    css();
    if(!$('sbAuthGate')) document.body.insertAdjacentHTML('beforeend', gateMarkup());
    wireGate();
    return $('sbAuthGate');
  }

  function setStatus(message, good){
    var el = $('sbAuthStatus');
    if(!el) return;
    el.className = good ? 'sb-auth-good' : 'sb-auth-note';
    el.textContent = message;
  }

  function openGate(message){
    var gate = ensureGate();
    gate.classList.add('open');
    document.body.classList.add('sb-auth-gate-locked');
    document.documentElement.dataset.sbAuthGate = 'locked';
    if(message) setStatus(message, false);
  }

  function closeGate(){
    var gate = $('sbAuthGate');
    if(gate) gate.classList.remove('open');
    document.body.classList.remove('sb-auth-gate-locked');
    document.documentElement.dataset.sbAuthGate = 'allowed';
  }

  async function decide(){
    var result = {
      version: VERSION,
      allowed: false,
      signedIn: false,
      reason: 'unknown',
      user: null,
      profile: null
    };

    try{
      var c = await client();
      var userRes = await c.auth.getUser();
      var user = userRes.data && userRes.data.user ? userRes.data.user : null;

      if(!user){
        result.reason = 'signed-out';
        lastDecision = result;
        return result;
      }

      result.signedIn = true;
      result.user = { id: user.id, email: user.email || '' };

      var profile = await getProfile(user);
      result.profile = normalizeProfile(profile);

      if(!profile){
        result.reason = 'profile-missing-not-approved';
        lastDecision = result;
        return result;
      }

      if(!isApproved(profile)){
        result.reason = 'profile-not-approved-or-blocked';
        lastDecision = result;
        return result;
      }

      result.allowed = true;
      result.reason = 'signed-in-approved';
      lastDecision = result;
      return result;
    }catch(error){
      result.reason = 'error: ' + (error.message || String(error));
      lastDecision = result;
      return result;
    }
  }

  async function enforce(){
    if(running) return lastDecision;
    running = true;
    ensureGate();

    var decision = await decide();

    if(decision.allowed){
      closeGate();
      setStatus('Signed in and approved.', true);
    }else{
      var message = 'Sign in required.';
      if(decision.reason === 'profile-missing-not-approved') message = 'Signed in, but no approved Stream Bandit profile was found.';
      else if(decision.reason === 'profile-not-approved-or-blocked') message = 'This profile is not approved for access.';
      else if(String(decision.reason).indexOf('error:') === 0) message = decision.reason;
      openGate(message);
    }

    try{
      window.dispatchEvent(new CustomEvent('streambandit:auth-gate-decision',{detail:decision}));
    }catch(error){}

    running = false;
    return decision;
  }

  async function login(){
    try{
      setStatus('Signing in...', true);
      var email = String(($('sbAuthEmail') || {}).value || '').trim();
      var password = String(($('sbAuthPassword') || {}).value || '');
      if(!email || !email.includes('@')) throw new Error('Enter your approved email address.');
      if(!password) throw new Error('Enter your password.');

      var c = await client();
      var res = await c.auth.signInWithPassword({ email: email, password: password });
      if(res.error) throw res.error;
      setStatus('Signed in. Checking approval...', true);
      await enforce();
    }catch(error){
      openGate('Login failed: ' + (error.message || String(error)));
    }
  }

  async function resetPassword(){
    try{
      var email = String(($('sbAuthEmail') || {}).value || '').trim();
      if(!email || !email.includes('@')) throw new Error('Enter your email first.');
      var c = await client();
      var redirectTo = location.origin + '/stream-bandit-password-setup-test-v7-13-001.html';
      var res = await c.auth.resetPasswordForEmail(email, { redirectTo: redirectTo });
      if(res.error) throw res.error;
      setStatus('Password reset email sent. Check your inbox, then return to Stream Bandit.', true);
    }catch(error){
      setStatus('Reset failed: ' + (error.message || String(error)), false);
    }
  }

  async function logout(){
    try{
      var c = await client();
      await c.auth.signOut();
      openGate('Signed out. Login required to continue.');
    }catch(error){
      openGate('Logout failed: ' + (error.message || String(error)));
    }
  }

  function wireGate(){
    var loginBtn = $('sbAuthLogin');
    var resetBtn = $('sbAuthReset');
    var logoutBtn = $('sbAuthLogout');
    var pass = $('sbAuthPassword');

    if(loginBtn && !loginBtn.dataset.wired){
      loginBtn.onclick = login;
      loginBtn.dataset.wired = '1';
    }

    if(resetBtn && !resetBtn.dataset.wired){
      resetBtn.onclick = resetPassword;
      resetBtn.dataset.wired = '1';
    }

    if(logoutBtn && !logoutBtn.dataset.wired){
      logoutBtn.onclick = logout;
      logoutBtn.dataset.wired = '1';
    }

    if(pass && !pass.dataset.wired){
      pass.addEventListener('keydown', function(event){
        if(event.key === 'Enter') login();
      });
      pass.dataset.wired = '1';
    }
  }

  function state(){
    return {
      version: VERSION,
      lastDecision: lastDecision,
      gateElement: !!$('sbAuthGate'),
      locked: document.documentElement.dataset.sbAuthGate === 'locked',
      phase: 'helper-built-not-mass-applied',
      serviceRoleInBrowser: false,
      publicSignup: false
    };
  }

  function boot(){
    window.StreamBanditAuthGate = {
      version: VERSION,
      enforce: enforce,
      decide: decide,
      login: login,
      logout: logout,
      resetPassword: resetPassword,
      state: state
    };
    window.StreamBanditAuthGateV713001 = window.StreamBanditAuthGate;
    document.documentElement.dataset.sbAuthGateHelper = 'v7-13-001';
    enforce();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
