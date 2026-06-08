(function(){
  'use strict';

  var VERSION = 'V7.12.263.6 Web Builder Projector Account Overlay Favourites';
  var STORAGE_KEY = 'sb.webBuilder.controlHub.v7.12.263';
  var SUCCESS = 'Saved successfully to this browser. Web Builder only. Live app connection remains off.';
  var DEFAULTS = {
    account:{displayName:'Web Builder Owner',email:'builder@local.test',roleLabel:'Builder owner',mode:'Owner',bio:'Local Web Builder profile preview.'},
    avatar:{mode:'emoji',emoji:'WB',url:'',alt:'Web Builder avatar'},
    theme:{accent:'#22d3a6',accent2:'#7c3cff',bg:'#050711',panel1:'#101529',panel2:'#17122d',text:'#f7fbff',muted:'#aeb8d6',font:'Inter,system-ui,Arial,sans-serif',largeText:false,highContrast:false},
    brand:{name:'Web Builder Studio',tagline:'Build pages, forms and sites.',logoMode:'text',logoText:'WB',logoUrl:'',faviconNote:'Use Web Builder icon helper later.'},
    shell:{railLabels:'Pages · Assets · Theme · Forms',inspectorNote:'Sticky inspector, save rail and preview controls.',canvasTitle:'Canvas',footerText:'Web Builder only - local draft',backLabel:'Back to Stream Bandit',mode:'Studio'},
    favourites:[
      {id:'studio',label:'Studio',url:'web-builder-studio-v7-12-252-test.html',type:'Tool',locked:true},
      {id:'pages',label:'Owned Pages',url:'web-builder-pages-manager-owned-v7-12-256-test.html',type:'Page',locked:true},
      {id:'preview',label:'Owned Preview',url:'web-builder-preview-owned-v7-12-257-test.html?page=landing',type:'Preview',locked:true},
      {id:'assets',label:'Assets',url:'web-builder-assets-v7-12-252-test.html',type:'Asset',locked:true}
    ],
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
      var s = merge(DEFAULTS, JSON.parse(raw));
      if(s.shell && s.shell.footerText === 'Saved locally · not connected') s.shell.footerText = 'Web Builder only - local draft';
      if(!Array.isArray(s.favourites) || !s.favourites.length) s.favourites = clone(DEFAULTS.favourites);
      return s;
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
  function safeHref(v){
    v = String(v || '').trim();
    if(!v) return '#';
    if(/^javascript:/i.test(v) || /^data:/i.test(v)) return '#';
    return v;
  }
  function avatarHtml(s){
    var a = s.avatar || DEFAULTS.avatar;
    if(a.mode === 'image' && a.url){ return '<img src="'+escapeHtml(a.url)+'" alt="'+escapeHtml(a.alt || 'Web Builder avatar')+'">'; }
    return escapeHtml(a.emoji || 'WB');
  }
  function logoHtml(s){
    var b = s.brand || DEFAULTS.brand;
    if(b.logoMode === 'image' && b.logoUrl){ return '<img src="'+escapeHtml(b.logoUrl)+'" alt="'+escapeHtml(b.name || 'Web Builder')+'">'; }
    return escapeHtml(b.logoText || 'WB');
  }
  function railText(s){
    var text = (s.shell && s.shell.footerText) || DEFAULTS.shell.footerText;
    if(text === 'Saved locally · not connected') return 'Web Builder only - local draft';
    return text;
  }
  function favouriteCards(s){
    var favs = Array.isArray(s.favourites) ? s.favourites : DEFAULTS.favourites;
    return favs.map(function(f){
      return '<a class="wb-account-fav" href="'+escapeHtml(safeHref(f.url))+'"><b>'+escapeHtml(f.label || 'Saved page')+'</b><small>'+escapeHtml(f.type || 'Page')+' · '+escapeHtml(f.url || '')+'</small></a>';
    }).join('') || '<p class="wb-empty">No saved builder pages yet.</p>';
  }
  function panelHtml(s){
    var a = s.account || DEFAULTS.account;
    var b = s.brand || DEFAULTS.brand;
    return '<div class="wb-account-panel" data-wb-account-panel aria-hidden="true">'
      + '<div class="wb-account-head"><div class="wb-account-avatar">'+avatarHtml(s)+'</div><div><b>'+escapeHtml(a.displayName || 'Web Builder Owner')+'</b><small>'+escapeHtml(a.email || '')+' · '+escapeHtml(a.roleLabel || a.mode || 'Builder')+'</small></div><button type="button" class="wb-panel-close" data-wb-panel-close>×</button></div>'
      + '<p>'+escapeHtml(a.bio || 'Local Web Builder profile preview.')+'</p>'
      + '<div class="wb-brand-mini"><div class="wb-brand-logo">'+logoHtml(s)+'</div><div><b>'+escapeHtml(b.name || 'Web Builder Studio')+'</b><small>'+escapeHtml(b.tagline || 'Build pages, forms and sites.')+'</small></div></div>'
      + '<h3>Saved builder pages</h3><div class="wb-account-favs">'+favouriteCards(s)+'</div>'
      + '<div class="wb-account-actions"><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Open Hub</a><button type="button" class="wb-secondary" data-wb-panel-close>Close</button></div>'
      + '</div>';
  }
  function styleText(){
    return '[data-web-builder-projector-rail]{position:fixed;right:12px;bottom:12px;z-index:90;display:flex;gap:8px;align-items:center;max-width:min(560px,calc(100vw - 24px));border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:rgba(7,9,16,.9);backdrop-filter:blur(14px);box-shadow:0 18px 60px #0008;padding:8px 10px;color:var(--wb-text,#f7fbff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);font-size:12px}.wb-projector-logo,.wb-account-avatar,.wb-brand-logo{background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));display:grid;place-items:center;color:#061017;font-weight:1000;overflow:hidden}.wb-projector-logo{width:38px;height:38px;min-width:38px;border-radius:14px}.wb-projector-logo img,.wb-account-avatar img,.wb-brand-logo img{width:100%;height:100%;object-fit:cover}.wb-projector-copy{min-width:0}.wb-projector-copy b{display:block;color:var(--wb-text,#fff);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}.wb-projector-copy small{display:block;color:var(--wb-muted,#aeb8d6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px}.wb-projector-btn,.wb-secondary{border:0;border-radius:999px;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#061017;text-decoration:none;font-weight:950;padding:8px 10px;white-space:nowrap;cursor:pointer}.wb-secondary{background:#30384f;color:#fff}.wb-account-panel{position:fixed;right:12px;bottom:72px;z-index:91;width:min(440px,calc(100vw - 24px));max-height:min(74vh,680px);overflow:auto;border:1px solid var(--wb-line,#ffffff22);border-radius:28px;background:radial-gradient(circle at 0 0,color-mix(in srgb,var(--wb-accent,#22d3a6),transparent 72%),transparent 32%),linear-gradient(135deg,var(--wb-panel,#101529),var(--wb-panel-2,#17122d));box-shadow:0 24px 90px #000c;padding:14px;color:var(--wb-text,#fff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);display:none}.wb-account-panel.open{display:block}.wb-account-head,.wb-brand-mini,.wb-account-actions{display:flex;gap:10px;align-items:center}.wb-account-head{justify-content:space-between}.wb-account-avatar{width:72px;height:72px;min-width:72px;border-radius:22px}.wb-brand-logo{width:48px;height:48px;min-width:48px;border-radius:16px}.wb-account-head b,.wb-brand-mini b{display:block;color:var(--wb-text,#fff)}.wb-account-head small,.wb-brand-mini small,.wb-account-panel p,.wb-account-fav small{display:block;color:var(--wb-muted,#aeb8d6);line-height:1.45}.wb-panel-close{border:0;border-radius:999px;background:#ffffff14;color:#fff;width:34px;height:34px;font-weight:1000;cursor:pointer}.wb-account-panel h3{margin:14px 0 8px}.wb-account-favs{display:grid;gap:8px}.wb-account-fav{display:block;border:1px solid var(--wb-line,#ffffff22);border-radius:16px;background:#ffffff0d;padding:10px;text-decoration:none;color:var(--wb-text,#fff)}.wb-account-actions{justify-content:flex-end;flex-wrap:wrap;margin-top:12px}.wb-empty{border:1px solid var(--wb-line,#ffffff22);border-radius:16px;padding:10px}@media(max-width:720px){[data-web-builder-projector-rail]{left:10px;right:10px;bottom:10px;border-radius:22px}.wb-projector-copy b,.wb-projector-copy small{max-width:180px}.wb-account-panel{left:10px;right:10px;bottom:88px;width:auto}}';
  }
  function bindPanel(){
    var rail = document.querySelector('[data-web-builder-projector-rail]');
    var panel = document.querySelector('[data-wb-account-panel]');
    if(!rail || !panel) return;
    rail.onclick = function(e){
      if(e.target && e.target.closest && e.target.closest('a')) return;
      panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true');
    };
    document.querySelectorAll('[data-wb-panel-close]').forEach(function(btn){btn.onclick=function(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');};});
  }
  function refreshChrome(s,textOverride){
    var title = document.querySelector('.wb-projector-copy b');
    var sub = document.querySelector('.wb-projector-copy small');
    var logo = document.querySelector('.wb-projector-logo');
    var panel = document.querySelector('[data-wb-account-panel]');
    if(title) title.textContent = (s.account && s.account.displayName) || DEFAULTS.account.displayName;
    if(sub) sub.textContent = textOverride || railText(s);
    if(logo) logo.innerHTML = avatarHtml(s);
    if(panel){
      var wasOpen = panel.classList.contains('open');
      panel.outerHTML = panelHtml(s);
      panel = document.querySelector('[data-wb-account-panel]');
      if(wasOpen) panel.classList.add('open');
      bindPanel();
    }
  }
  function injectChrome(s){
    if(!document.querySelector('[data-web-builder-projector-style]')){
      var style = document.createElement('style');
      style.setAttribute('data-web-builder-projector-style','true');
      style.textContent = styleText();
      document.head.appendChild(style);
    }
    if(!document.querySelector('[data-web-builder-projector-rail]')){
      var rail = document.createElement('div');
      rail.setAttribute('data-web-builder-projector-rail','true');
      rail.innerHTML = '<div class="wb-projector-logo">'+avatarHtml(s)+'</div><div class="wb-projector-copy"><b>'+escapeHtml((s.account && s.account.displayName) || DEFAULTS.account.displayName)+'</b><small>'+escapeHtml(railText(s))+'</small></div><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Hub</a>';
      document.body.appendChild(rail);
    }
    if(!document.querySelector('[data-wb-account-panel]')) document.body.insertAdjacentHTML('beforeend',panelHtml(s));
    refreshChrome(s);
    bindPanel();
  }
  function expose(s){
    window.StreamBanditWebBuilderProjector = {version:VERSION,storageKey:STORAGE_KEY,state:s,connectedToLiveApp:false,appliedAt:new Date().toISOString(),accountOverlay:true,favouritesOverlay:true,saveSuccessText:SUCCESS};
    window.dispatchEvent(new CustomEvent('web-builder-projector-applied',{detail:window.StreamBanditWebBuilderProjector}));
  }
  function apply(){
    var s = load();
    document.documentElement.setAttribute('data-web-builder-projector','active');
    document.documentElement.setAttribute('data-web-builder-projector-version',VERSION);
    document.documentElement.setAttribute('data-web-builder-live-app-connection','false');
    applyTheme(s);
    injectChrome(s);
    expose(s);
  }
  function watchSaveButtons(){
    document.addEventListener('click',function(e){
      var el = e.target;
      while(el && el !== document){
        if(el.id === 'save' || el.id === 'saveBtn' || (el.textContent || '').trim() === 'Save Local'){
          setTimeout(function(){
            var s = load();
            refreshChrome(s,SUCCESS);
            var status = document.getElementById('status');
            if(status) status.textContent = SUCCESS;
            if(window.StreamBanditWebBuilderProjector){
              window.StreamBanditWebBuilderProjector.state = s;
              window.StreamBanditWebBuilderProjector.saveButtonObserved = true;
              window.StreamBanditWebBuilderProjector.connectedToLiveApp = false;
            }
          },200);
          break;
        }
        el = el.parentNode;
      }
    },true);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',function(){apply();watchSaveButtons();});
  else { apply(); watchSaveButtons(); }
})();
