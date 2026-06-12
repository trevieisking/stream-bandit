/* Stream Bandit Access Gate V7.12.271
   Visible route gate for protected Admin, Owner, User Management, Policy Admin and editor pages.
   Uses Access Projector + Route Access Map.
   No Supabase writes. No redirects. No billing. Old URLs preserved.
*/
(function(){
  'use strict';

  const VERSION = 'V7.12.271 Access Gate';
  let applied = false;

  function fileOf(value){
    return String(value||'').split('/').pop().split('?')[0].split('#')[0] || 'index.html';
  }

  function currentFile(){
    return fileOf(location.pathname);
  }

  function loadScript(src){
    return new Promise(function(resolve,reject){
      try{
        const base = src.split('?')[0];
        if(Array.from(document.scripts || []).some(function(s){ return String(s.src || '').includes(base); })){
          return resolve();
        }
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        s.dataset.sbLoadedBy = 'access-gate-v7-12-271';
        s.onload = function(){ resolve(); };
        s.onerror = function(){ reject(new Error('Could not load '+src)); };
        document.head.appendChild(s);
      }catch(e){ reject(e); }
    });
  }

  function css(){
    if(document.getElementById('sbAccessGateCss')) return;
    const s = document.createElement('style');
    s.id = 'sbAccessGateCss';
    s.textContent = `
      .sb-access-lock-page{min-height:100vh;background:radial-gradient(circle at 10% 0,#ff4d6d28,transparent 34%),radial-gradient(circle at 90% 0,#7c3cff33,transparent 38%),#050711;color:#fff;font-family:Inter,system-ui,Arial,sans-serif;display:grid;place-items:center;padding:18px}
      .sb-access-lock-box{max-width:900px;border:1px solid #ff4d6d66;border-radius:30px;background:linear-gradient(135deg,#101529,#17122d);box-shadow:0 22px 80px #0008;padding:24px}
      .sb-access-lock-badge{display:inline-flex;border-radius:999px;background:#ff4d6d24;border:1px solid #ff4d6d66;color:#ffd2d9;font-weight:950;padding:7px 12px}
      .sb-access-lock-box h1{font-size:clamp(34px,6vw,72px);line-height:.95;margin:12px 0;letter-spacing:-.055em}
      .sb-access-lock-box p,.sb-access-lock-box small{color:#b9c0d8;line-height:1.5}
      .sb-access-lock-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .sb-access-lock-btn{border:0;border-radius:999px;padding:11px 15px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#061017;font-weight:950;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
      .sb-access-lock-btn.dark{background:#414667;color:#fff}
      .sb-access-lock-code{font-family:ui-monospace,Consolas,monospace;background:#0007;border-radius:14px;padding:10px;color:#dfffee;white-space:pre-wrap;word-break:break-word;margin-top:12px}
      @media(max-width:760px){.sb-access-lock-actions{display:grid}.sb-access-lock-btn{width:100%}}
    `;
    document.head.appendChild(s);
  }

  function esc(s){
    return String(s==null?'':s).replace(/[&<>\"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c] || c;
    });
  }

  function routeInfo(){
    const map = window.StreamBanditRouteAccessMapV712271;
    if(map && typeof map.lookup === 'function') return map.lookup(currentFile());
    return null;
  }

  function isProtected(info){
    return !!(info && info.noFlashGate);
  }

  function lockPage(decision){
    if(applied) return;
    applied = true;
    css();
    const info = decision && decision.info || routeInfo() || {};
    const group = info.group || 'Protected';
    const label = info.label || currentFile();
    const rule = decision && decision.rule || info.access || 'protected';
    document.documentElement.dataset.sbAccessGateLocked = 'true';
    document.body.className = 'sb-access-lock-page';
    document.body.innerHTML = '<main class="sb-access-lock-box">'
      + '<span class="sb-access-lock-badge">Access locked</span>'
      + '<h1>Protected page</h1>'
      + '<p>This page is protected by Stream Bandit access rules. Your account can keep using allowed Watch, Creator, Group Play, Settings and Web Builder pages, but this protected route is locked.</p>'
      + '<div class="sb-access-lock-code">Route: '+esc(currentFile())+'\nPage: '+esc(label)+'\nGroup: '+esc(group)+'\nRequired: '+esc(rule)+'</div>'
      + '<div class="sb-access-lock-actions">'
      + '<a class="sb-access-lock-btn" href="home-global-helpers-v7-4-4-test.html">Go Home</a>'
      + '<a class="sb-access-lock-btn dark" href="collections-clean-machine-v7-12-51-test.html">Open Collections</a>'
      + '<a class="sb-access-lock-btn dark" href="profile-settings-live-ready-v7-12-90-test.html">Profile Settings</a>'
      + '</div>'
      + '<small>Backend policies remain the final safety layer. This frontend gate stops normal users browsing protected tools.</small>'
      + '</main>';
  }

  async function ensureProjector(){
    if(!window.StreamBanditRouteAccessMapV712271){
      await loadScript('stream-bandit-route-access-map-v7-12-271.js?v=access-gate-7-12-271');
    }
    if(!window.StreamBanditAccessProjector){
      await loadScript('stream-bandit-access-projector-v7-12-271.js?v=access-gate-7-12-271');
    }
    return window.StreamBanditAccessProjector || null;
  }

  async function run(){
    try{
      const map = window.StreamBanditRouteAccessMapV712271;
      const infoNow = map && typeof map.lookup === 'function' ? map.lookup(currentFile()) : null;
      if(infoNow && !isProtected(infoNow)){
        document.documentElement.dataset.sbAccessGate = 'not-protected';
      }
      const projector = await ensureProjector();
      const info = routeInfo();
      if(!isProtected(info)){
        document.documentElement.dataset.sbAccessGate = 'not-protected';
        return;
      }
      document.documentElement.dataset.sbAccessGate = 'checking';
      const state = projector && projector.refresh ? await projector.refresh({force:true}) : null;
      const decision = projector && projector.routeDecision ? projector.routeDecision(currentFile()) : state && state.route;
      if(!decision || !decision.allowed){
        lockPage(decision || { info: info, rule: info.access, allowed:false });
        return;
      }
      document.documentElement.dataset.sbAccessGate = 'allowed';
      document.documentElement.dataset.sbAccessGateLocked = 'false';
    }catch(e){
      const info = routeInfo();
      if(isProtected(info)) lockPage({ info: info, rule: info.access || 'protected', allowed:false, error:e.message || String(e) });
    }
  }

  window.StreamBanditAccessGate = {
    version: VERSION,
    run: run,
    locked: function(){ return applied; },
    current: currentFile
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', run);
  }else{
    run();
  }

  setTimeout(run, 1200);
  document.addEventListener('sb:access-ready', run);
})();
