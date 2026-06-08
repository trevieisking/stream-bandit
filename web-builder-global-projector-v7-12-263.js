(function(){
  'use strict';

  var VERSION = 'V7.12.263.2 Web Builder Global Projector';
  var STORAGE_KEY = 'sb.webBuilder.controlHub.v7.12.263';
  var DEFAULTS = {
    account:{displayName:'Web Builder Owner',email:'builder@local.test',roleLabel:'Builder owner',mode:'Owner',bio:'Local Web Builder profile preview.'},
    avatar:{mode:'emoji',emoji:'🦌',url:'',alt:'Web Builder avatar'},
    theme:{accent:'#22d3a6',accent2:'#7c3cff',bg:'#050711',panel1:'#101529',panel2:'#17122d',text:'#f7fbff',muted:'#aeb8d6',font:'Inter,system-ui,Arial,sans-serif',largeText:false,highContrast:false},
    brand:{name:'Web Builder Studio',tagline:'Build pages, forms and sites.',logoMode:'text',logoText:'WB',logoUrl:'',faviconNote:'Use Web Builder icon helper later.'},
    shell:{railLabels:'Pages · Assets · Theme · Forms',inspectorNote:'Sticky inspector, save rail and preview controls.',canvasTitle:'Canvas',footerText:'Saved locally · not connected',backLabel:'Back to Stream Bandit',mode:'Studio'},
    meta:{localStorageOnly:true,connectedToLiveApp:false}
  };

  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function merge(a,b){
    var out = clone(a || {});
    Object.keys(b || {}).forEach(function(k){
      if(b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) out[k] = merge(out[k] || {}, b[k]);
      else out[k] = b[k];
    });
    return out;
  }
  function load(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return clone(DEFAULTS);
      return merge(DEFAULTS, JSON.parse(raw));
    }catch(e){ return clone(DEFAULTS); }
  }
  function setVar(name,value){ document.documentElement.style.setProperty(name,value); }
  function applyTheme(s){
    var t = s.theme || DEFAULTS.theme;
    setVar('--wb-accent', t.accent || DEFAULTS.theme.accent);
    setVar('--wb-accent-2', t.accent2 || DEFAULTS.theme.accent2);
    setVar('--wb-bg', t.bg || DEFAULTS.theme.bg);
    setVar('--wb-panel', t.panel1 || DEFAULTS.theme.panel1);
    setVar('--wb-panel-2', t.panel2 || DEFAULTS.theme.panel2);
    setVar('--wb-text', t.text || DEFAULTS.theme.text);
    setVar('--wb-muted', t.muted || DEFAULTS.theme.muted);
    setVar('--wb-font', t.font || DEFAULTS.theme.font);
    setVar('--wb-line', t.highContrast ? '#ffffff55' : '#ffffff22');
    setVar('--wb-font-scale', t.largeText ? '1.13' : '1');

    /* Compatibility names used by the current Web Builder pages. */
    setVar('--good', t.accent || DEFAULTS.theme.accent);
    setVar('--purple', t.accent2 || DEFAULTS.theme.accent2);
    setVar('--bg', t.bg || DEFAULTS.theme.bg);
    setVar('--p', t.panel1 || DEFAULTS.theme.panel1);
    setVar('--p2', t.panel2 || DEFAULTS.theme.panel2);
    setVar('--line', t.highContrast ? '#ffffff55' : '#ffffff22');
    setVar('--text', t.text || DEFAULTS.theme.text);
    setVar('--muted', t.muted || DEFAULTS.theme.muted);
    setVar('--fontScale', t.largeText ? '1.13' : '1');
  }
  function escapeHtml(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m;});
  }
  function renderLogo(s){
    var b = s.brand || DEFAULTS.brand;
    if(b.logoMode === 'image' && b.logoUrl){ return '<img src="'+escapeHtml(b.logoUrl)+'" alt="'+escapeHtml(b.name || 'Web Builder')+'">'; }
    return escapeHtml(b.logoText || 'WB');
  }
  function injectChrome(s){
    if(document.querySelector('[data-web-builder-projector-rail]')) return;
    var style = document.createElement('style');
    style.setAttribute('data-web-builder-projector-style','true');
    style.textContent = '[data-web-builder-projector-rail]{position:fixed;right:12px;bottom:12px;z-index:90;display:flex;gap:8px;align-items:center;max-width:min(520px,calc(100vw - 24px));border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:rgba(7,9,16,.88);backdrop-filter:blur(14px);box-shadow:0 18px 60px #0008;padding:8px 10px;color:var(--wb-text,#f7fbff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);font-size:12px}.wb-projector-logo{width:32px;height:32px;min-width:32px;border-radius:12px;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));display:grid;place-items:center;color:#061017;font-weight:1000;overflow:hidden}.wb-projector-logo img{width:100%;height:100%;object-fit:cover}.wb-projector-copy{min-width:0}.wb-projector-copy b{display:block;color:var(--wb-text,#fff);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}.wb-projector-copy small{display:block;color:var(--wb-muted,#aeb8d6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px}.wb-projector-btn{border:0;border-radius:999px;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#061017;text-decoration:none;font-weight:950;padding:8px 10px;white-space:nowrap}@media(max-width:720px){[data-web-builder-projector-rail]{left:10px;right:10px;bottom:10px;border-radius:22px}.wb-projector-copy b,.wb-projector-copy small{max-width:160px}}';
    document.head.appendChild(style);
    var rail = document.createElement('div');
    rail.setAttribute('data-web-builder-projector-rail','true');
    rail.innerHTML = '<div class="wb-projector-logo">'+renderLogo(s)+'</div><div class="wb-projector-copy"><b>'+escapeHtml((s.brand && s.brand.name) || DEFAULTS.brand.name)+'</b><small>'+escapeHtml((s.shell && s.shell.footerText) || DEFAULTS.shell.footerText)+'</small></div><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Hub</a>';
    document.body.appendChild(rail);
  }
  function apply(){
    var s = load();
    document.documentElement.setAttribute('data-web-builder-projector','active');
    document.documentElement.setAttribute('data-web-builder-projector-version',VERSION);
    document.documentElement.setAttribute('data-web-builder-live-app-connection','false');
    applyTheme(s);
    injectChrome(s);
    window.StreamBanditWebBuilderProjector = {version:VERSION,storageKey:STORAGE_KEY,state:s,connectedToLiveApp:false,appliedAt:new Date().toISOString()};
    window.dispatchEvent(new CustomEvent('web-builder-projector-applied',{detail:window.StreamBanditWebBuilderProjector}));
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',apply);
  else apply();
})();
