(function(){
  'use strict';

  var VERSION = 'V7.12.299.4 Web Builder Shared Rail Asset Avatar';
  var STORAGE_KEY = 'sb.webBuilder.controlHub.v7.12.263';
  var SUCCESS = 'Saved successfully to this browser. Web Builder only. Live app connection remains off.';
  var DEFAULT_ICON = 'stream_bandit_stag_icon_32.png';
  var SUPABASE_URL = 'https://xzxqfrvqdgkzwujbkdbk.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  var BUCKET = 'stream-bandit-images';

  var DEFAULTS = {
    account:{displayName:'Web Builder Owner',email:'builder@local.test',roleLabel:'Builder owner',mode:'Owner',bio:'Local Web Builder profile preview.'},
    avatar:{mode:'emoji',emoji:'WB',url:'',alt:'Web Builder avatar'},
    theme:{accent:'#22d3a6',accent2:'#7c3cff',bg:'#050711',panel1:'#101529',panel2:'#17122d',text:'#f7fbff',muted:'#aeb8d6',font:'Inter,system-ui,Arial,sans-serif',largeText:false,highContrast:false},
    brand:{name:'Web Builder Studio',tagline:'Build pages, forms and sites.',logoMode:'text',logoText:'WB',logoUrl:'',faviconUrl:DEFAULT_ICON,faviconNote:'Use Web Builder icon helper later.'},
    shell:{railLabels:'Back · Hub · Pages · Web Builder · Preview · Menu · Form · Inbox · Assets · Route Map · Control Map · Manifest',footerText:'Web Builder only - local draft',backLabel:'Back to Stream Bandit',mode:'Studio'},
    meta:{localStorageOnly:true,connectedToLiveApp:false,assetAvatarProjection:false,storageReads:false,storageWrites:false,schemaChanges:false,indexPromotion:false}
  };

  var cachedPages = null;
  var searchTimer = null;
  var bound = false;
  var discoveringAsset = false;

  function clone(v){ return JSON.parse(JSON.stringify(v || {})); }
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
      var s = raw ? merge(DEFAULTS, JSON.parse(raw)) : clone(DEFAULTS);
      if(s.shell && s.shell.footerText === 'Saved locally · not connected') s.shell.footerText = 'Web Builder only - local draft';
      return s;
    }catch(e){ return clone(DEFAULTS); }
  }
  function saveState(s){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }catch(e){} }
  function setVar(name,value){ document.documentElement.style.setProperty(name,value); }
  function escapeHtml(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m; }); }
  function safeHref(v){ v = String(v || '').trim(); if(!v) return '#'; if(/^javascript:/i.test(v) || /^data:/i.test(v)) return '#'; return v; }
  function safeIcon(v){ v = String(v || '').trim(); if(!v) return ''; if(/^javascript:/i.test(v) || /^data:text/i.test(v)) return ''; return v; }
  function imageTag(src,alt,fallback){
    src = safeIcon(src);
    if(!src) return escapeHtml(fallback || 'WB');
    return '<img src="'+escapeHtml(src)+'" alt="'+escapeHtml(alt || 'Web Builder avatar')+'" onerror="this.parentNode.textContent=\''+escapeHtml(fallback || 'WB').replace(/'/g,'')+'\';">';
  }

  function cleanSlug(v){
    v = String(v || '').trim();
    try{
      if(v.indexOf('://') > -1){ var u = new URL(v); v = u.searchParams.get('page') || u.hash.replace(/^#/,'') || u.pathname.split('/').pop() || 'landing'; }
      else if(v.indexOf('?') > -1){ var u2 = new URL(v, location.origin); v = u2.searchParams.get('page') || v; }
    }catch(e){}
    return (v.replace(/\.html.*$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase() || 'landing');
  }
  function currentSlug(){
    try{ var url = new URL(location.href); var fromUrl = url.searchParams.get('page'); if(fromUrl) return cleanSlug(fromUrl); }catch(e){}
    var ids = ['slug','pageSlug','studioSlug','wbSlug','siteSlug'];
    for(var i=0;i<ids.length;i++){ var el = document.getElementById(ids[i]); if(el && el.value) return cleanSlug(el.value); }
    return 'landing';
  }
  function q(){ return encodeURIComponent(currentSlug()); }

  function routeMap(){
    var s = q();
    return [
      {id:'back',label:'Back',href:'settings-platform-control-hub-v7-12-85-test.html',type:'Exit',search:'back exit stream bandit settings platform control hub'},
      {id:'hub',label:'Hub',href:'web-builder-account-control-hub-v7-12-263-test.html',type:'Hub',search:'hub account doorway control'},
      {id:'pages',label:'Pages',href:'web-builder-pages-manager-owned-v7-12-256-test.html',type:'Pages',search:'pages manager owned pages'},
      {id:'builder',label:'Web Builder',href:'overlay-route-truth-machine-v7-12-66-test.html?page='+s,type:'Studio',search:'web builder studio editor canvas'},
      {id:'preview',label:'Preview',href:'web-builder-preview-owned-v7-12-257-test.html?page='+s,type:'Preview',search:'preview published page visitor'},
      {id:'menu',label:'Menu',href:'web-builder-menu-builder-owned-v7-12-264-test.html?page='+s,type:'Menu',search:'menu builder navigation'},
      {id:'form',label:'Form',href:'web-builder-form-designer-owned-v7-12-258-test.html?page='+s,type:'Form',search:'form designer fields contact'},
      {id:'inbox',label:'Inbox',href:'web-builder-form-inbox-owned-v7-12-258-test.html?page='+s,type:'Inbox',search:'inbox messenger messages friends blocked form inbox'},
      {id:'assets',label:'Assets',href:'web-builder-assets-v7-12-252-test.html?page='+s,type:'Assets',search:'assets media images upload library avatar logo'},
      {id:'route',label:'Route Map',href:'web-builder-route-map-v7-12-252-test.html?page='+s,type:'Map',search:'route map routes'},
      {id:'control',label:'Control Map',href:'web-builder-control-map-v7-12-253-test.html?page='+s,type:'Map',search:'control map systems map'},
      {id:'source',label:'Source Map',href:'web-builder-pages-source-map-v7-12-255-test.html?page='+s,type:'Map',search:'pages source map route source'},
      {id:'headerFooter',label:'Header/Footer',href:'web-builder-header-footer-code-v7-12-254-test.html?page='+s,type:'Code',search:'header footer code navigation'},
      {id:'manifest',label:'Manifest',href:'WEB-BUILDER-MANIFEST-V7-12-252.md',type:'Doc',search:'manifest checkpoint plan'}
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
    if(p.indexOf('form-inbox') > -1 || p.indexOf('form-submissions') > -1) return 'inbox';
    if(p.indexOf('assets') > -1) return 'assets';
    if(p.indexOf('route-map') > -1) return 'route';
    if(p.indexOf('control-map') > -1) return 'control';
    if(p.indexOf('source-map') > -1) return 'source';
    if(p.indexOf('header-footer') > -1) return 'headerFooter';
    if(p.indexOf('MANIFEST') > -1) return 'manifest';
    return '';
  }

  function avatarUrl(s){
    var a = s.avatar || DEFAULTS.avatar;
    var b = s.brand || DEFAULTS.brand;
    var m = s.meta || {};
    return safeIcon(a.url) || safeIcon(m.projectedAssetUrl) || safeIcon(b.logoUrl) || '';
  }
  function avatarHtml(s){ var a = s.avatar || DEFAULTS.avatar; var u = avatarUrl(s); if((a.mode === 'image' || u) && u){ return imageTag(u, a.alt || 'Web Builder avatar','WB'); } return escapeHtml(a.emoji || 'WB'); }
  function logoHtml(s){ var b = s.brand || DEFAULTS.brand; if(b.logoMode === 'image' && b.logoUrl){ return imageTag(b.logoUrl,b.name || 'Web Builder','WB'); } return escapeHtml(b.logoText || 'WB'); }
  function iconUrl(s){ var b = s.brand || DEFAULTS.brand; var a = s.avatar || DEFAULTS.avatar; var m = s.meta || {}; return safeIcon(b.faviconUrl) || safeIcon(a.url) || safeIcon(m.projectedAssetUrl) || safeIcon(b.logoUrl) || DEFAULT_ICON; }
  function railText(s){ var text = (s.shell && s.shell.footerText) || DEFAULTS.shell.footerText; if(text === 'Saved locally · not connected') return 'Web Builder only - local draft'; return text; }

  function applyTheme(s){
    var t = s.theme || DEFAULTS.theme;
    setVar('--wb-accent', t.accent || DEFAULTS.theme.accent);
    setVar('--wb-accent-2', t.accent2 || DEFAULTS.theme.accent2);
    setVar('--wb-bg', t.bg || DEFAULTS.theme.bg);
    setVar('--wb-panel', t.panel1 || DEFAULTS.theme.panel1);
    setVar('--wb-panel-2', t.panel2 || DEFAULTS.theme.panel2);
    setVar('--wb-text', t.text || DEFAULTS.theme.text);
    setVar('--wb-muted', t.muted || DEFAULTS.theme.muted);
    setVar('--wb-line', t.highContrast ? '#ffffff55' : '#ffffff22');
    setVar('--wb-font', t.font || DEFAULTS.theme.font);
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
  function applyFavicon(s){
    var href = iconUrl(s);
    var link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if(!link){ link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/png'; link.sizes = '32x32'; link.href = href;
    var apple = document.querySelector('link[rel="apple-touch-icon"]'); if(apple) apple.href = href;
  }
  function applyTopAvatar(s){
    document.querySelectorAll('.mark').forEach(function(mark){ mark.innerHTML = avatarHtml(s); mark.setAttribute('title','Web Builder account avatar'); mark.style.overflow = 'hidden'; });
  }

  function tabsHtml(){
    var active = activeTabId();
    var tabs = routeMap().map(function(r){
      return '<a class="wb-builder-tab '+(r.id === active ? 'active' : '')+'" data-wb-tab="'+escapeHtml(r.id)+'" href="'+escapeHtml(safeHref(r.href))+'">'+escapeHtml(r.label)+'</a>';
    }).join('');
    return '<div class="wb-builder-tab-scroll">'+tabs+'</div><div class="wb-builder-search" data-wb-search><input id="wbGlobalSearch" type="search" autocomplete="off" placeholder="Search Web Builder pages, tools..." aria-label="Search Web Builder"><div id="wbSearchResults" class="wb-search-results" role="listbox" hidden></div></div>';
  }
  function favouriteCards(s){
    var favs = (Array.isArray(s.favourites) && s.favourites.length) ? s.favourites : routeMap().filter(function(r){ return ['hub','pages','builder','preview','menu','form','inbox','assets'].indexOf(r.id) > -1; }).map(function(r){ return {label:r.label,type:r.type,url:r.href}; });
    return favs.map(function(f){ return '<a class="wb-account-fav" href="'+escapeHtml(safeHref(f.url))+'"><b>'+escapeHtml(f.label || 'Saved page')+'</b><small>'+escapeHtml(f.type || 'Page')+' · '+escapeHtml(f.url || '')+'</small></a>'; }).join('') || '<p class="wb-empty">No saved builder pages yet.</p>';
  }
  function panelHtml(s){
    var a = s.account || DEFAULTS.account; var b = s.brand || DEFAULTS.brand; var m = s.meta || {};
    return '<div class="wb-account-panel" data-wb-account-panel aria-hidden="true">'
      + '<div class="wb-account-head"><div class="wb-account-avatar">'+avatarHtml(s)+'</div><div><b>'+escapeHtml(a.displayName || 'Web Builder Owner')+'</b><small>'+escapeHtml(a.email || '')+' · '+escapeHtml(a.roleLabel || a.mode || 'Builder')+'</small></div><button type="button" class="wb-panel-close" data-wb-panel-close>×</button></div>'
      + '<p>'+escapeHtml(a.bio || 'Local Web Builder profile preview.')+'</p>'
      + '<div class="wb-brand-mini"><div class="wb-brand-logo">'+logoHtml(s)+'</div><div><b>'+escapeHtml(b.name || 'Web Builder Studio')+'</b><small>'+escapeHtml(b.tagline || 'Build pages, forms and sites.')+'</small><small>Avatar source: '+escapeHtml(m.projectedAssetPath || avatarUrl(s) || 'WB fallback')+'</small></div></div>'
      + '<h3>Web Builder routes</h3><div class="wb-account-favs">'+favouriteCards(s)+'</div>'
      + '<div class="wb-account-actions"><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Open Hub</a><a class="wb-secondary" href="web-builder-assets-v7-12-252-test.html?page='+escapeHtml(q())+'">Open Assets</a><button type="button" class="wb-secondary" data-wb-panel-close>Close</button></div>'
      + '</div>';
  }

  function styleText(){
    return ''+
    '[data-web-builder-projector-rail]{position:fixed;right:12px;bottom:12px;z-index:90020;display:flex;gap:8px;align-items:center;max-width:min(560px,calc(100vw - 24px));border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:rgba(7,9,16,.9);backdrop-filter:blur(14px);box-shadow:0 18px 60px #0008;padding:8px 10px;color:var(--wb-text,#f7fbff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);font-size:12px}'+
    '.wb-projector-logo{width:42px;height:42px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#071015;font-weight:1000;overflow:hidden}.wb-projector-logo img{width:100%;height:100%;object-fit:cover}.wb-projector-copy{display:grid;gap:2px}.wb-projector-copy b{font-size:14px}.wb-projector-copy small{color:var(--wb-muted,#aeb8d6)}.wb-projector-btn,.wb-secondary{border:0;border-radius:999px;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#071015;text-decoration:none;font-weight:950;padding:9px 11px;cursor:pointer;white-space:nowrap}'+
    '.wb-secondary{background:#ffffff16;color:#fff;border:1px solid #ffffff22}.wb-builder-tabs{position:sticky;top:0;z-index:90010;display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,420px);gap:10px;align-items:center;padding:9px 14px;border-bottom:1px solid var(--wb-line,#ffffff22);background:rgba(7,9,16,.94);backdrop-filter:blur(14px);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif)}.wb-builder-tab-scroll{display:flex;gap:8px;align-items:center;overflow-x:auto;scrollbar-width:thin;padding-bottom:2px}.wb-builder-tab{flex:0 0 auto;border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:#ffffff0d;color:var(--wb-text,#fff);text-decoration:none;font-weight:950;font-size:13px;padding:9px 12px}.wb-builder-tab.active{background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#071015;border-color:transparent}.wb-builder-tab:hover{border-color:var(--wb-accent,#22d3a6)}'+
    '.wb-builder-search{position:relative;min-width:0}.wb-builder-search input{width:100%;border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:#0007;color:var(--wb-text,#fff);padding:11px 14px;font:inherit;font-weight:850;outline:none}.wb-builder-search input:focus{border-color:var(--wb-accent,#22d3a6);box-shadow:0 0 0 3px #22d3a624}.wb-search-results{position:absolute;right:0;top:calc(100% + 8px);width:min(680px,calc(100vw - 28px));max-height:62vh;overflow:auto;border:1px solid var(--wb-line,#ffffff22);border-radius:22px;background:#080b16f8;box-shadow:0 24px 80px #000d;padding:8px;z-index:90100}.wb-search-hit{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;text-decoration:none;color:var(--wb-text,#fff);border:1px solid #ffffff14;border-radius:16px;background:#ffffff08;padding:11px;margin:0 0 8px}.wb-search-hit b{display:block}.wb-search-hit small{display:block;color:var(--wb-muted,#aeb8d6);margin-top:3px}.wb-search-type{border:1px solid #ffffff20;border-radius:999px;background:#ffffff10;color:#dfffee;padding:5px 8px;font-size:11px;font-weight:950}'+
    '.wb-account-panel{position:fixed;right:12px;bottom:76px;z-index:90030;width:min(440px,calc(100vw - 24px));max-height:72vh;overflow:auto;border:1px solid var(--wb-line,#ffffff22);border-radius:24px;background:linear-gradient(135deg,var(--wb-panel,#101529),var(--wb-panel-2,#17122d));box-shadow:0 24px 80px #000b;padding:14px;color:var(--wb-text,#fff);font-family:var(--wb-font,Inter,system-ui,Arial,sans-serif);display:none}.wb-account-panel.open{display:block}.wb-account-head{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center}.wb-account-avatar,.wb-brand-logo{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,var(--wb-accent,#22d3a6),var(--wb-accent-2,#7c3cff));color:#071015;font-weight:1000;overflow:hidden}.wb-account-avatar img,.wb-brand-logo img{width:100%;height:100%;object-fit:cover}.wb-account-panel small{display:block;color:var(--wb-muted,#aeb8d6)}.wb-panel-close{border:0;border-radius:999px;background:#ffffff18;color:#fff;font-weight:950;width:38px;height:38px;cursor:pointer}.wb-brand-mini{display:grid;grid-template-columns:48px 1fr;gap:10px;border:1px solid #ffffff18;border-radius:18px;background:#ffffff08;padding:10px;margin:12px 0}.wb-account-favs{display:grid;gap:8px}.wb-account-fav{display:block;border:1px solid #ffffff18;border-radius:16px;background:#ffffff08;color:#fff;text-decoration:none;padding:10px}.wb-account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'+
    'body[data-wb-shell] header.top .topRight,body[data-wb-shell] .top>.topRight{display:none!important}body[data-wb-shell] header.top{grid-template-columns:1fr!important}body[data-wb-shell] .brand{max-width:100%!important}'+
    '@media(max-width:980px){.wb-builder-tabs{grid-template-columns:1fr;padding:8px}.wb-builder-tab-scroll{padding-bottom:4px}.wb-builder-tab{font-size:12px;padding:9px 10px}.wb-search-results{left:0;right:auto;width:calc(100vw - 16px)}[data-web-builder-projector-rail]{left:8px;right:8px;max-width:none}.wb-projector-copy small{display:none}.wb-account-panel{left:8px;right:8px;width:auto}}';
  }

  function staticSearchItems(){
    var s = q();
    return routeMap().map(function(r){ return {title:r.label,subtitle:r.href,type:r.type || 'Tool',href:r.href,search:(r.label+' '+r.href+' '+(r.type||'')+' '+(r.search||'')).toLowerCase()}; }).concat([
      {title:'Open current page in Builder',subtitle:'Current slug: '+currentSlug(),type:'Action',href:'overlay-route-truth-machine-v7-12-66-test.html?page='+s,search:'edit builder publish current page'},
      {title:'Open current page Preview',subtitle:'Current slug: '+currentSlug(),type:'Action',href:'web-builder-preview-owned-v7-12-257-test.html?page='+s,search:'preview published current page'},
      {title:'Open Messenger Overlay',subtitle:'Current slug: '+currentSlug(),type:'Inbox',href:'web-builder-form-inbox-owned-v7-12-258-test.html?page='+s,search:'messages overlay inbox sent friends blocked'},
      {title:'Open Full Form Inbox',subtitle:'Current slug: '+currentSlug(),type:'Inbox',href:'web-builder-form-submissions-v7-12-94-test.html?page='+s,search:'full form inbox submissions'},
      {title:'Open Assets / Set Avatar',subtitle:'Use uploaded builder asset as global Web Builder avatar',type:'Assets',href:'web-builder-assets-v7-12-252-test.html?page='+s,search:'assets avatar logo image'}
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
  function renderSearchResults(qtext){
    var box = document.getElementById('wbSearchResults');
    if(!box) return;
    qtext = String(qtext || '').trim().toLowerCase();
    if(!qtext){ box.hidden = true; box.innerHTML = ''; return; }
    fetchPages().then(function(pageItems){
      var items = staticSearchItems().concat(pageItems || []);
      var hits = items.filter(function(item){ return item.search.indexOf(qtext) > -1 || String(item.title||'').toLowerCase().indexOf(qtext) > -1 || String(item.subtitle||'').toLowerCase().indexOf(qtext) > -1; }).slice(0,16);
      if(!hits.length){ box.hidden = false; box.innerHTML = '<div class="wb-search-hit"><div><b>No Web Builder results</b><small>Try a page title, slug, tool name, form, inbox, menu or preview.</small></div><span class="wb-search-type">Search</span></div>'; return; }
      box.hidden = false;
      box.innerHTML = hits.map(function(h){ return '<a class="wb-search-hit" href="'+escapeHtml(safeHref(h.href))+'"><div><b>'+escapeHtml(h.title)+'</b><small>'+escapeHtml(h.subtitle || h.href)+'</small></div><span class="wb-search-type">'+escapeHtml(h.type || 'Result')+'</span></a>'; }).join('');
    });
  }
  function bindSearch(){
    var input = document.getElementById('wbGlobalSearch');
    var box = document.getElementById('wbSearchResults');
    if(!input || !box) return;
    input.oninput = function(){ clearTimeout(searchTimer); var text = input.value; searchTimer = setTimeout(function(){ renderSearchResults(text); },120); };
    input.onfocus = function(){ if(input.value.trim()) renderSearchResults(input.value); };
    input.onkeydown = function(e){
      if(e.key === 'Escape'){ input.value = ''; box.hidden = true; box.innerHTML = ''; input.blur(); }
      if(e.key === 'Enter'){ var first = box.querySelector('a'); if(first){ e.preventDefault(); location.href = first.href; } }
    };
    document.addEventListener('click',function(e){ if(!e.target.closest || !e.target.closest('[data-wb-search]')) box.hidden = true; },true);
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
  function bindPanel(){
    var rail = document.querySelector('[data-web-builder-projector-rail]');
    var panel = document.querySelector('[data-wb-account-panel]');
    if(!rail || !panel) return;
    rail.onclick = function(e){ if(e.target && e.target.closest && e.target.closest('a')) return; panel.classList.toggle('open'); panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false' : 'true'); };
    document.querySelectorAll('[data-wb-panel-close]').forEach(function(btn){ btn.onclick=function(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); }; });
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

  function supa(){ if(!window.supabase || !window.supabase.createClient) return null; try{return window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);}catch(e){return null;} }
  function getUserId(c){
    if(!c) return Promise.resolve('');
    return c.auth.getUser().then(function(r){ if(r && r.data && r.data.user) return r.data.user.id || ''; return c.auth.getSession().then(function(s){ return s && s.data && s.data.session && s.data.session.user ? s.data.session.user.id || '' : ''; }); }).catch(function(){ return ''; });
  }
  function firstImageInPrefix(c,prefix){
    return c.storage.from(BUCKET).list(prefix,{limit:100,offset:0,sortBy:{column:'name',order:'desc'}}).then(function(res){
      if(res.error) return null;
      var row = (res.data || []).filter(function(x){ return x && x.name && !/\.metadata\.json$/i.test(x.name) && /\.(png|jpe?g|webp|gif|avif)$/i.test(x.name); })[0];
      if(!row) return null;
      var path = prefix + '/' + row.name;
      var pub = c.storage.from(BUCKET).getPublicUrl(path);
      return {path:path,url:pub && pub.data && pub.data.publicUrl ? pub.data.publicUrl : ''};
    }).catch(function(){ return null; });
  }
  function discoverAssetAvatar(){
    if(discoveringAsset) return;
    discoveringAsset = true;
    var c = supa();
    if(!c){ discoveringAsset = false; return; }
    var slug = currentSlug();
    getUserId(c).then(function(uid){
      var prefixes = [];
      if(uid){
        prefixes.push('builder/logos/users/'+uid+'/'+slug);
        prefixes.push('builder/assets/users/'+uid+'/'+slug);
        prefixes.push('builder/favicons/users/'+uid+'/'+slug);
      }
      prefixes.push('builder/logos/'+slug);
      prefixes.push('builder/assets/'+slug);
      prefixes.push('builder/favicons/'+slug);
      var chain = Promise.resolve(null);
      prefixes.forEach(function(prefix){ chain = chain.then(function(found){ return found || firstImageInPrefix(c,prefix); }); });
      return chain;
    }).then(function(found){
      discoveringAsset = false;
      if(!found || !found.url) return;
      var s = load();
      s.avatar = s.avatar || {};
      s.brand = s.brand || {};
      s.meta = s.meta || {};
      if(s.meta.projectedAssetUrl === found.url && s.avatar.url === found.url) return;
      s.avatar.mode = 'image';
      s.avatar.url = found.url;
      s.avatar.alt = 'Web Builder uploaded asset avatar';
      s.brand.logoMode = 'image';
      s.brand.logoUrl = found.url;
      s.brand.faviconUrl = found.url;
      s.meta.projectedAssetUrl = found.url;
      s.meta.projectedAssetPath = found.path;
      s.meta.assetAvatarProjection = true;
      s.meta.storageReads = true;
      s.meta.storageWrites = false;
      s.meta.schemaChanges = false;
      s.meta.indexPromotion = false;
      saveState(s);
      applyTheme(s);
      refreshChrome(s,'Uploaded builder asset projected globally');
      expose(s);
    }).catch(function(){ discoveringAsset = false; });
  }

  function expose(s){
    window.StreamBanditWebBuilderProjector = {version:VERSION,storageKey:STORAGE_KEY,state:s,connectedToLiveApp:false,appliedAt:new Date().toISOString(),accountOverlay:true,favouritesOverlay:true,faviconProjection:true,topAvatarProjection:true,uploadedAssetAvatarProjection:!!(s.meta && s.meta.assetAvatarProjection),sharedHeaderTabs:true,sharedRailAllRoutes:true,globalSearch:true,duplicateStudioTopNavHidden:true,saveSuccessText:SUCCESS,storageReads:!!(s.meta && s.meta.storageReads),storageWrites:false,schemaChanges:false,indexPromotion:false};
    window.dispatchEvent(new CustomEvent('web-builder-projector-applied',{detail:window.StreamBanditWebBuilderProjector}));
  }
  function apply(){
    var s = load();
    document.documentElement.setAttribute('data-web-builder-projector','active');
    document.documentElement.setAttribute('data-web-builder-projector-version',VERSION);
    document.documentElement.setAttribute('data-web-builder-live-app-connection','false');
    applyTheme(s); injectChrome(s); addFaviconField(s); expose(s);
    setTimeout(discoverAssetAvatar,350);
  }
  function watchButtons(){
    if(bound) return;
    bound = true;
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
            setTimeout(discoverAssetAvatar,250);
          },220);
          break;
        }
        el = el.parentNode;
      }
    },true);
    document.addEventListener('input',function(e){ if(e.target && ['slug','pageSlug','studioSlug','wbSlug','siteSlug'].indexOf(e.target.id) > -1) setTimeout(function(){ injectTabs(); discoverAssetAvatar(); },100); },true);
    document.addEventListener('change',function(e){ if(e.target && e.target.id === 'faviconUrl') saveFaviconFromField(); if(e.target && ['slug','pageSlug','studioSlug','wbSlug','siteSlug'].indexOf(e.target.id) > -1) setTimeout(function(){ injectTabs(); discoverAssetAvatar(); },100); },true);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',function(){ apply(); watchButtons(); });
  else { apply(); watchButtons(); }
})();
