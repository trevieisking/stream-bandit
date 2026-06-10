(function(){
  'use strict';

  var VERSION = 'V7.12.264.11 Web Builder Projector Global Search';
  var STORAGE_KEY = 'sb.webBuilder.controlHub.v7.12.263';
  var SUCCESS = 'Saved successfully to this browser. Web Builder only. Live app connection remains off.';
  var DEFAULT_ICON = 'stream_bandit_stag_icon_32.png';
  var SUPABASE_URL = 'https://xzxqfrvqdgkzwujbkdbk.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  var DEFAULTS = {
    account:{displayName:'Web Builder Owner',email:'builder@local.test',roleLabel:'Builder owner',mode:'Owner',bio:'Local Web Builder profile preview.'},
    avatar:{mode:'emoji',emoji:'WB',url:'',alt:'Web Builder avatar'},
    theme:{accent:'#22d3a6',accent2:'#7c3cff',bg:'#050711',panel1:'#101529',panel2:'#17122d',text:'#f7fbff',muted:'#aeb8d6',font:'Inter,system-ui,Arial,sans-serif',largeText:false,highContrast:false},
    brand:{name:'Web Builder Studio',tagline:'Build pages, forms and sites.',logoMode:'text',logoText:'WB',logoUrl:'',faviconUrl:DEFAULT_ICON,faviconNote:'Use Web Builder icon helper later.'},
    shell:{railLabels:'Pages · Web Builder · Preview · Menu · Form · Inbox',inspectorNote:'Sticky inspector, save rail and preview controls.',canvasTitle:'Canvas',footerText:'Web Builder only - local draft',backLabel:'Back to Stream Bandit',mode:'Studio'},
    favourites:[
      {id:'hub',label:'Hub',url:'web-builder-account-control-hub-v7-12-263-test.html',type:'Hub',locked:true},
      {id:'pages',label:'Pages',url:'web-builder-pages-manager-owned-v7-12-256-test.html',type:'Page',locked:true},
      {id:'builder',label:'Web Builder',url:'overlay-route-truth-machine-v7-12-66-test.html?page=landing',type:'Publish',locked:true},
      {id:'preview',label:'Preview',url:'web-builder-preview-owned-v7-12-257-test.html?page=landing',type:'Preview',locked:true},
      {id:'menu',label:'Menu',url:'web-builder-menu-builder-owned-v7-12-264-test.html',type:'Menu',locked:true},
      {id:'form',label:'Form',url:'web-builder-form-designer-owned-v7-12-258-test.html?page=landing',type:'Form',locked:true},
      {id:'inbox',label:'Inbox',url:'web-builder-form-inbox-owned-v7-12-258-test.html?page=landing',type:'Inbox',locked:true}
    ],
    meta:{localStorageOnly:true,connectedToLiveApp:false}
  };

  var cachedPages = null;
  var searchTimer = null;
  var searchBound = false;

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
  function saveState(s){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }catch(e){} }
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
  function escapeHtml(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m;}); }
  function safeHref(v){ v = String(v || '').trim(); if(!v) return '#'; if(/^javascript:/i.test(v) || /^data:/i.test(v)) return '#'; return v; }
  function safeIcon(v){ v = String(v || '').trim(); if(!v) return ''; if(/^javascript:/i.test(v) || /^data:text/i.test(v)) return ''; return v; }
  function cleanSlug(v){
    v = String(v || '').trim();
    try{
      if(v.indexOf('://') > -1){ var u = new URL(v); v = u.searchParams.get('page') || u.hash.replace(/^#/,'') || u.pathname.split('/').pop() || 'landing'; }
    }catch(e){}
    return (v.replace(/\.html.*$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase() || 'landing');
  }
  function currentSlug(){
    try{ var url = new URL(location.href); var fromUrl = url.searchParams.get('page'); if(fromUrl) return cleanSlug(fromUrl); }catch(e){}
    var ids = ['slug','pageSlug','studioSlug','wbSlug'];
    for(var i=0;i<ids.length;i++){ var el = document.getElementById(ids[i]); if(el && el.value) return cleanSlug(el.value); }
    return 'landing';
  }
  function routeMap(){
    var s = encodeURIComponent(currentSlug());
    return [
      {id:'back',label:'Back',href:'settings-platform-control-hub-v7-12-85-test.html',type:'Exit'},
      {id:'hub',label:'Hub',href:'web-builder-account-control-hub-v7-12-263-test.html',type:'Tool'},
      {id:'pages',label:'Pages',href:'web-builder-pages-manager-owned-v7-12-256-test.html',type:'Tool'},
      {id:'builder',label:'Web Builder',href:'overlay-route-truth-machine-v7-12-66-test.html?page='+s,type:'Tool'},
      {id:'preview',label:'Preview',href:'web-builder-preview-owned-v7-12-257-test.html?page='+s,type:'Tool'},
      {id:'menu',label:'Menu',href:'web-builder-menu-builder-owned-v7-12-264-test.html',type:'Tool'},
      {id:'form',label:'Form',href:'web-builder-form-designer-owned-v7-12-258-test.html?page='+s,type:'Tool'},
      {id:'inbox',label:'Inbox',href:'web-builder-form-inbox-owned-v7-12-258-test.html?page='+s,type:'Tool'},
      {id:'assets',label:'Assets',href:'web-builder-assets-v7-12-252-test.html',type:'Tool'},
      {id:'control',label:'Control Map',href:'web-builder-control-map-v7-12-253-test.html',type:'Tool'},
      {id:'manifest',label:'Manifest',href:'WEB-BUILDER-MANIFEST-V7-12-252.md',type:'Doc'}
    ];
  }
  function activeTabId(){
    var p = location.pathname.split('/').pop();
    if(p.indexOf('account-control-hub') > -1) return 'hub';
    if(p.indexOf('pages-manager') > -1) return 'pages';
    if(p.indexOf('overlay-route-truth-machine') > -1 || p.indexOf('live-studio') > -1 || p.indexOf('studio') > -1) return 'builder';
    if(p.indexOf('preview-owned') > -1) return 'preview';
    if(p.indexOf('menu-builder') > -1) return 'menu';
    if(p.indexOf('form-designer') > -1) return 'form';
    if(p.indexOf('form-inbox') > -1) return 'inbox';
    if(p.indexOf('assets') > -1) return 'assets';
    if(p.indexOf('control-map') > -1) return 'control';
    return '';
  }
  function tabsHtml(){
    var active = activeTabId();
    return routeMap().filter(function(r){return ['back','hub','pages','builder','preview','menu','form','inbox'].indexOf(r.id) > -1;}).map(function(r){
      return '<a class="wb-builder-tab '+(r.id === active ? 'active' : '')+'" data-wb-tab="'+escapeHtml(r.id)+'" href="'+escapeHtml(r.href)+'">'+escapeHtml(r.label)+'</a>';
    }).join('') + '<div class="wb-builder-search" data-wb-search><input id="wbGlobalSearch" type="search" autocomplete="off" placeholder="Search Web Builder pages, tools..." aria-label="Search Web Builder"><div id="wbSearchResults" class="wb-search-results" role="listbox" hidden></div></div>';
  }
  function avatarHtml(s){ var a = s.avatar || DEFAULTS.avatar; if(a.mode === 'image' && a.url){ return '<img src="'+escapeHtml(a.url)+'" alt="'+escapeHtml(a.alt || 'Web Builder avatar')+'">'; } return escapeHtml(a.emoji || 'WB'); }
  function logoHtml(s){ var b = s.brand || DEFAULTS.brand; if(b.logoMode === 'image' && b.logoUrl){ return '<img src="'+escapeHtml(b.logoUrl)+'" alt="'+escapeHtml(b.name || 'Web Builder')+'">'; } return escapeHtml(b.logoText || 'WB'); }
  function iconUrl(s){ var b = s.brand || DEFAULTS.brand; var a = s.avatar || DEFAULTS.avatar; return safeIcon(b.faviconUrl) || safeIcon(a.url) || safeIcon(b.logoUrl) || DEFAULT_ICON; }
  function applyFavicon(s){
    var href = iconUrl(s);
    var link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if(!link){ link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/png'; link.sizes = '32x32'; link.href = href;
    var apple = document.querySelector('link[rel="apple-touch-icon"]'); if(apple) apple.href = href;
  }
  function applyTopAvatar(s){
    var marks = document.querySelectorAll('.mark');
    if(!marks.length) return;
    marks.forEach(function(mark){ mark.innerHTML = avatarHtml(s); mark.setAttribute('title','Web Builder account avatar'); mark.style.overflow = 'hidden'; });
  }
  function railText(s){ var text = (s.shell && s.shell.footerText) || DEFAULTS.shell.footerText; if(text === 'Saved locally · not connected') return 'Web Builder only - local draft'; return text; }
  function favouriteCards(s){
    var favs = Array.isArray(s.favourites) ? s.favourites : DEFAULTS.favourites;
    return favs.map(function(f){ return '<a class="wb-account-fav" href="'+escapeHtml(safeHref(f.url))+'"><b>'+escapeHtml(f.label || 'Saved page')+'</b><small>'+escapeHtml(f.type || 'Page')+' · '+escapeHtml(f.url || '')+'</small></a>'; }).join('') || '<p class="wb-empty">No saved builder pages yet.</p>';
  }
  function panelHtml(s){
    var a = s.account || DEFAULTS.account; var b = s.brand || DEFAULTS.brand;
    return '<div class="wb-account-panel" data-wb-account-panel aria-hidden="true">'
      + '<div class="wb-account-head"><div class="wb-account-avatar">'+avatarHtml(s)+'</div><div><b>'+escapeHtml(a.displayName || 'Web Builder Owner')+'</b><small>'+escapeHtml(a.email || '')+' · '+escapeHtml(a.roleLabel || a.mode || 'Builder')+'</small></div><button type="button" class="wb-panel-close" data-wb-panel-close>×</button></div>'
      + '<p>'+escapeHtml(a.bio || 'Local Web Builder profile preview.')+'</p>'
      + '<div class="wb-brand-mini"><div class="wb-brand-logo">'+logoHtml(s)+'</div><div><b>'+escapeHtml(b.name || 'Web Builder Studio')+'</b><small>'+escapeHtml(b.tagline || 'Build pages, forms and sites.')+'</small><small>Favicon: '+escapeHtml(iconUrl(s))+'</small></div></div>'
      + '<h3>Saved builder pages</h3><div class="wb-account-favs">'+favouriteCards(s)+'</div>'
      + '<div class="wb-account-actions"><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Open Hub</a><button type="button" class="wb-secondary" data-wb-panel-close>Close</button></div>'
      + '</div>';
  }
  function styleText(){
    return '[data-web-builder-projector-rail]{position:fixed;right:12px;bottom:12px;z-index:90;display:flex;gap:8px;align-items:center;max-width:min(560px,calc(100vw - 24px));border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:rgba(7,9,16,.9);backdrop-filter:blur(14px);box-shadow:0 18px 60px #0008;padding:8px 10px;color:var(--wb-text,#f7fbff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);font-size:12px}.wb-builder-tabs{position:sticky;top:0;z-index:89999;display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 14px;border-bottom:1px solid var(--wb-line,#ffffff22);background:rgba(7,9,16,.92);backdrop-filter:blur(14px);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif)}.wb-builder-tab{border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:#ffffff0d;color:var(--wb-text,#fff);text-decoration:none;font-weight:950;font-size:12px;padding:8px 10px}.wb-builder-tab.active{background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#061017}.wb-builder-search{position:relative;flex:1 1 260px;min-width:min(320px,100%)}.wb-builder-search input{width:100%;border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:#0007;color:var(--wb-text,#fff);font-weight:900;padding:9px 12px;font:inherit}.wb-builder-search input:focus{outline:2px solid color-mix(in srgb,var(--wb-accent,#22d3a6),transparent 35%)}.wb-search-results{position:absolute;left:0;right:0;top:calc(100% + 8px);z-index:90050;display:grid;gap:6px;max-height:420px;overflow:auto;border:1px solid var(--wb-line,#ffffff22);border-radius:22px;background:linear-gradient(135deg,var(--wb-panel,#101529),var(--wb-panel-2,#17122d));box-shadow:0 24px 80px #000c;padding:8px}.wb-search-hit{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;border:1px solid var(--wb-line,#ffffff22);border-radius:16px;background:#ffffff0d;color:var(--wb-text,#fff);text-decoration:none;padding:10px}.wb-search-hit b{display:block;color:var(--wb-text,#fff)}.wb-search-hit small{display:block;color:var(--wb-muted,#aeb8d6);line-height:1.35}.wb-search-type{border:1px solid var(--wb-line,#ffffff22);border-radius:999px;padding:5px 7px;color:#baf7df;font-size:11px;font-weight:1000}.mark img{width:100%;height:100%;object-fit:cover}.wb-projector-logo,.wb-account-avatar,.wb-brand-logo{background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));display:grid;place-items:center;color:#061017;font-weight:1000;overflow:hidden}.wb-projector-logo{width:38px;height:38px;min-width:38px;border-radius:14px}.wb-projector-logo img,.wb-account-avatar img,.wb-brand-logo img{width:100%;height:100%;object-fit:cover}.wb-projector-copy{min-width:0}.wb-projector-copy b{display:block;color:var(--wb-text,#fff);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:260px}.wb-projector-copy small{display:block;color:var(--wb-muted,#aeb8d6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px}.wb-projector-btn,.wb-secondary{border:0;border-radius:999px;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#061017;text-decoration:none;font-weight:950;padding:8px 10px;white-space:nowrap;cursor:pointer}.wb-secondary{background:#30384f;color:#fff}.wb-account-panel{position:fixed;right:12px;bottom:72px;z-index:91;width:min(440px,calc(100vw - 24px));max-height:min(74vh,680px);overflow:auto;border:1px solid var(--wb-line,#ffffff22);border-radius:28px;background:radial-gradient(circle at 0 0,color-mix(in srgb,var(--wb-accent,#22d3a6),transparent 72%),transparent 32%),linear-gradient(135deg,var(--wb-panel,#101529),var(--wb-panel-2,#17122d));box-shadow:0 24px 90px #000c;padding:14px;color:var(--wb-text,#fff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);display:none}.wb-account-panel.open{display:block}.wb-account-head,.wb-brand-mini,.wb-account-actions{display:flex;gap:10px;align-items:center}.wb-account-head{justify-content:space-between}.wb-account-avatar{width:72px;height:72px;min-width:72px;border-radius:22px}.wb-brand-logo{width:48px;height:48px;min-width:48px;border-radius:16px}.wb-account-head b,.wb-brand-mini b{display:block;color:var(--wb-text,#fff)}.wb-account-head small,.wb-brand-mini small,.wb-account-panel p,.wb-account-fav small{display:block;color:var(--wb-muted,#aeb8d6);line-height:1.45}.wb-panel-close{border:0;border-radius:999px;background:#ffffff14;color:#fff;width:34px;height:34px;font-weight:1000;cursor:pointer}.wb-account-panel h3{margin:14px 0 8px}.wb-account-favs{display:grid;gap:8px}.wb-account-fav{display:block;border:1px solid var(--wb-line,#ffffff22);border-radius:16px;background:#ffffff0d;padding:10px;text-decoration:none;color:var(--wb-text,#fff)}.wb-account-actions{justify-content:flex-end;flex-wrap:wrap;margin-top:12px}.wb-empty{border:1px solid var(--wb-line,#ffffff22);border-radius:16px;padding:10px}.wb-favicon-helper{border-color:var(--wb-accent,#22d3a6)!important}@media(max-width:720px){[data-web-builder-projector-rail]{left:10px;right:10px;bottom:10px;border-radius:22px}.wb-projector-copy b,.wb-projector-copy small{max-width:180px}.wb-account-panel{left:10px;right:10px;bottom:88px;width:auto}.wb-builder-tabs{gap:6px;padding:8px 10px}.wb-builder-tab{flex:1 1 calc(25% - 6px);text-align:center;border-radius:16px;padding:9px 6px}.wb-builder-search{flex:1 1 100%;min-width:100%}}';
  }
  function staticSearchItems(){
    var s = encodeURIComponent(currentSlug());
    return routeMap().map(function(r){ return {title:r.label,subtitle:r.href,type:r.type || 'Tool',href:r.href,search:(r.label+' '+r.href+' '+(r.type||'')).toLowerCase()}; }).concat([
      {title:'Assets',subtitle:'Web Builder Asset Manager',type:'Tool',href:'web-builder-assets-v7-12-252-test.html',search:'assets media upload image poster library'},
      {title:'Control Map',subtitle:'Web Builder route truth',type:'Tool',href:'web-builder-control-map-v7-12-253-test.html',search:'control map registry route truth'},
      {title:'Manifest',subtitle:'Web Builder manifest',type:'Doc',href:'WEB-BUILDER-MANIFEST-V7-12-252.md',search:'manifest checkpoints plan'},
      {title:'Open current page in Builder',subtitle:'Current slug: '+currentSlug(),type:'Action',href:'overlay-route-truth-machine-v7-12-66-test.html?page='+s,search:'edit builder publish current page'},
      {title:'Open current page Preview',subtitle:'Current slug: '+currentSlug(),type:'Action',href:'web-builder-preview-owned-v7-12-257-test.html?page='+s,search:'preview published current page'}
    ]);
  }
  function pageToResult(p){
    var slug = cleanSlug(p.slug || 'landing');
    return {title:p.title || slug,subtitle:slug+' · '+(p.status || 'page'),type:'Page',href:'web-builder-preview-owned-v7-12-257-test.html?page='+encodeURIComponent(slug),search:String((p.title||'')+' '+slug+' '+(p.status||'')).toLowerCase()};
  }
  function fetchPages(){
    if(cachedPages) return Promise.resolve(cachedPages);
    if(!window.supabase || !window.supabase.createClient) return Promise.resolve([]);
    try{
      var c = window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      return c.from('sb_site_pages').select('slug,title,status,updated_at').limit(500).then(function(res){
        if(res.error) return [];
        cachedPages = (res.data || []).map(pageToResult);
        return cachedPages;
      }).catch(function(){ return []; });
    }catch(e){ return Promise.resolve([]); }
  }
  function renderSearchResults(q){
    var box = document.getElementById('wbSearchResults');
    if(!box) return;
    q = String(q || '').trim().toLowerCase();
    if(!q){ box.hidden = true; box.innerHTML = ''; return; }
    fetchPages().then(function(pageItems){
      var items = staticSearchItems().concat(pageItems || []);
      var hits = items.filter(function(item){ return item.search.indexOf(q) > -1 || String(item.title||'').toLowerCase().indexOf(q) > -1 || String(item.subtitle||'').toLowerCase().indexOf(q) > -1; }).slice(0,14);
      if(!hits.length){ box.hidden = false; box.innerHTML = '<div class="wb-search-hit"><div><b>No Web Builder results</b><small>Try a page title, slug, tool name, form, inbox, menu or preview.</small></div><span class="wb-search-type">Search</span></div>'; return; }
      box.hidden = false;
      box.innerHTML = hits.map(function(h){ return '<a class="wb-search-hit" href="'+escapeHtml(safeHref(h.href))+'"><div><b>'+escapeHtml(h.title)+'</b><small>'+escapeHtml(h.subtitle || h.href)+'</small></div><span class="wb-search-type">'+escapeHtml(h.type || 'Result')+'</span></a>'; }).join('');
    });
  }
  function bindSearch(){
    var input = document.getElementById('wbGlobalSearch');
    var box = document.getElementById('wbSearchResults');
    if(!input || !box) return;
    input.oninput = function(){ clearTimeout(searchTimer); var q = input.value; searchTimer = setTimeout(function(){ renderSearchResults(q); },120); };
    input.onfocus = function(){ if(input.value.trim()) renderSearchResults(input.value); };
    input.onkeydown = function(e){
      if(e.key === 'Escape'){ input.value = ''; box.hidden = true; box.innerHTML = ''; input.blur(); }
      if(e.key === 'Enter'){
        var first = box.querySelector('a');
        if(first){ e.preventDefault(); location.href = first.href; }
      }
    };
    document.addEventListener('click',function(e){ if(!e.target.closest || !e.target.closest('[data-wb-search]')){ box.hidden = true; } },true);
  }
  function bindPanel(){
    var rail = document.querySelector('[data-web-builder-projector-rail]');
    var panel = document.querySelector('[data-wb-account-panel]');
    if(!rail || !panel) return;
    rail.onclick = function(e){ if(e.target && e.target.closest && e.target.closest('a')) return; panel.classList.toggle('open'); panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true'); };
    document.querySelectorAll('[data-wb-panel-close]').forEach(function(btn){ btn.onclick=function(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }; });
  }
  function injectTabs(){
    var existing = document.querySelector('[data-web-builder-tabs]');
    if(existing){ existing.innerHTML = tabsHtml(); bindSearch(); return; }
    var tabs = document.createElement('nav');
    tabs.className = 'wb-builder-tabs';
    tabs.setAttribute('data-web-builder-tabs','true');
    tabs.setAttribute('aria-label','Web Builder navigation and search');
    tabs.innerHTML = tabsHtml();
    var header = document.querySelector('header.top') || document.querySelector('.top');
    if(header && header.parentNode) header.parentNode.insertBefore(tabs, header.nextSibling);
    else document.body.insertBefore(tabs, document.body.firstChild);
    bindSearch();
  }
  function refreshChrome(s,textOverride){
    var title = document.querySelector('.wb-projector-copy b');
    var sub = document.querySelector('.wb-projector-copy small');
    var logo = document.querySelector('.wb-projector-logo');
    var panel = document.querySelector('[data-wb-account-panel]');
    if(title) title.textContent = (s.account && s.account.displayName) || DEFAULTS.account.displayName;
    if(sub) sub.textContent = textOverride || railText(s);
    if(logo) logo.innerHTML = avatarHtml(s);
    applyTopAvatar(s); applyFavicon(s); injectTabs();
    if(panel){ var wasOpen = panel.classList.contains('open'); panel.outerHTML = panelHtml(s); panel = document.querySelector('[data-wb-account-panel]'); if(wasOpen) panel.classList.add('open'); bindPanel(); }
  }
  function injectChrome(s){
    if(!document.querySelector('[data-web-builder-projector-style]')){ var style = document.createElement('style'); style.setAttribute('data-web-builder-projector-style','true'); style.textContent = styleText(); document.head.appendChild(style); }
    injectTabs();
    if(!document.querySelector('[data-web-builder-projector-rail]')){ var rail = document.createElement('div'); rail.setAttribute('data-web-builder-projector-rail','true'); rail.innerHTML = '<div class="wb-projector-logo">'+avatarHtml(s)+'</div><div class="wb-projector-copy"><b>'+escapeHtml((s.account && s.account.displayName) || DEFAULTS.account.displayName)+'</b><small>'+escapeHtml(railText(s))+'</small></div><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Hub</a>'; document.body.appendChild(rail); }
    if(!document.querySelector('[data-wb-account-panel]')) document.body.insertAdjacentHTML('beforeend',panelHtml(s));
    refreshChrome(s); bindPanel(); bindSearch();
  }
  function expose(s){
    window.StreamBanditWebBuilderProjector = {version:VERSION,storageKey:STORAGE_KEY,state:s,connectedToLiveApp:false,appliedAt:new Date().toISOString(),accountOverlay:true,favouritesOverlay:true,faviconProjection:true,topAvatarProjection:true,sharedHeaderTabs:true,globalSearch:true,saveSuccessText:SUCCESS};
    window.dispatchEvent(new CustomEvent('web-builder-projector-applied',{detail:window.StreamBanditWebBuilderProjector}));
  }
  function addFaviconField(s){
    if(document.getElementById('faviconUrl')) return;
    var iconNote = document.getElementById('iconNote'); var logoUrl = document.getElementById('logoUrl'); var target = iconNote || logoUrl;
    if(!target || !target.parentNode) return;
    var wrap = document.createElement('label'); wrap.className = 'field wb-favicon-helper'; wrap.innerHTML = '<b>Favicon URL</b><input id="faviconUrl" placeholder="https://... or local icon file">';
    target.parentNode.parentNode.insertBefore(wrap, target.parentNode.nextSibling);
    document.getElementById('faviconUrl').value = (s.brand && s.brand.faviconUrl) || '';
  }
  function readField(id){ var el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function saveFaviconFromField(){
    var fav = readField('faviconUrl'); if(!fav) return load();
    var s = load(); s.brand = s.brand || {}; s.brand.faviconUrl = fav; s.meta = s.meta || {}; s.meta.localStorageOnly = true; s.meta.connectedToLiveApp = false;
    saveState(s); refreshChrome(s); expose(s); return s;
  }
  function apply(){
    var s = load();
    document.documentElement.setAttribute('data-web-builder-projector','active');
    document.documentElement.setAttribute('data-web-builder-projector-version',VERSION);
    document.documentElement.setAttribute('data-web-builder-live-app-connection','false');
    applyTheme(s); injectChrome(s); addFaviconField(s); expose(s);
  }
  function watchButtons(){
    if(searchBound) return;
    searchBound = true;
    document.addEventListener('click',function(e){
      var el = e.target;
      while(el && el !== document){
        if(el.id === 'applyBrand' || el.id === 'save' || el.id === 'saveBtn' || (el.textContent || '').trim() === 'Save Local'){
          setTimeout(function(){
            var s = saveFaviconFromField();
            var text = (el.id === 'save' || el.id === 'saveBtn' || (el.textContent || '').trim() === 'Save Local') ? SUCCESS : railText(s);
            refreshChrome(s,text);
            var status = document.getElementById('status'); if(status && text === SUCCESS) status.textContent = SUCCESS;
            if(window.StreamBanditWebBuilderProjector){ window.StreamBanditWebBuilderProjector.state = s; window.StreamBanditWebBuilderProjector.saveButtonObserved = text === SUCCESS; window.StreamBanditWebBuilderProjector.connectedToLiveApp = false; }
          },220);
          break;
        }
        el = el.parentNode;
      }
    },true);
    document.addEventListener('input',function(e){ if(e.target && ['slug','pageSlug','studioSlug','wbSlug'].indexOf(e.target.id) > -1) setTimeout(injectTabs,80); },true);
    document.addEventListener('change',function(e){ if(e.target && e.target.id === 'faviconUrl') saveFaviconFromField(); if(e.target && ['slug','pageSlug','studioSlug','wbSlug'].indexOf(e.target.id) > -1) setTimeout(injectTabs,80); },true);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',function(){apply();watchButtons();});
  else { apply(); watchButtons(); }
})();