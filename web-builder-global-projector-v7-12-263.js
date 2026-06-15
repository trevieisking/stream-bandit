(function(){
  'use strict';

  var VERSION = 'V7.12.299.7 Web Builder Centered Avatar Logo';
  var LOGO_URL = 'https://xzxqfrvqdgkzwujbkdbk.supabase.co/storage/v1/object/public/stream-bandit-images/builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png';
  var STORAGE_KEY = 'sb.webBuilder.controlHub.v7.12.263';

  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g,function(m){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m;
    });
  }
  function safeHref(v){
    v = String(v || '').trim();
    if(!v || /^javascript:/i.test(v) || /^data:/i.test(v)) return '#';
    return v;
  }
  function cleanSlug(v){
    v = String(v || '').trim();
    try{
      if(v.indexOf('://') > -1){
        var u = new URL(v);
        v = u.searchParams.get('page') || u.hash.replace(/^#/,'') || u.pathname.split('/').pop() || 'landing';
      }else if(v.indexOf('?') > -1){
        var u2 = new URL(v, location.origin);
        v = u2.searchParams.get('page') || v;
      }
    }catch(e){}
    return (v.replace(/\.html.*$/,'').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').toLowerCase() || 'landing');
  }
  function currentSlug(){
    try{
      var url = new URL(location.href);
      var fromUrl = url.searchParams.get('page');
      if(fromUrl) return cleanSlug(fromUrl);
    }catch(e){}
    var ids = ['slug','pageSlug','studioSlug','wbSlug','siteSlug'];
    for(var i=0;i<ids.length;i++){
      var el = document.getElementById(ids[i]);
      if(el && el.value) return cleanSlug(el.value);
    }
    return 'landing';
  }
  function q(){ return encodeURIComponent(currentSlug()); }
  function routeMap(){
    var s = q();
    return [
      {id:'back',label:'Back',href:'settings-platform-control-hub-v7-12-85-test.html',type:'Exit',search:'back exit settings platform'},
      {id:'hub',label:'Hub',href:'web-builder-account-control-hub-v7-12-263-test.html',type:'Hub',search:'hub account control'},
      {id:'pages',label:'Pages',href:'web-builder-pages-manager-owned-v7-12-256-test.html',type:'Pages',search:'pages manager'},
      {id:'builder',label:'Web Builder',href:'overlay-route-truth-machine-v7-12-66-test.html?page='+s,type:'Studio',search:'studio builder canvas editor'},
      {id:'preview',label:'Preview',href:'web-builder-preview-owned-v7-12-257-test.html?page='+s,type:'Preview',search:'preview published page'},
      {id:'menu',label:'Menu',href:'web-builder-menu-builder-owned-v7-12-264-test.html?page='+s,type:'Menu',search:'menu navigation builder'},
      {id:'form',label:'Form',href:'web-builder-form-designer-owned-v7-12-258-test.html?page='+s,type:'Form',search:'form designer fields'},
      {id:'inbox',label:'Inbox',href:'web-builder-form-inbox-owned-v7-12-258-test.html?page='+s,type:'Inbox',search:'inbox messages sent friends blocked'},
      {id:'assets',label:'Assets',href:'web-builder-assets-v7-12-252-test.html?page='+s,type:'Assets',search:'assets media logo avatar upload'},
      {id:'route',label:'Route Map',href:'web-builder-route-map-v7-12-252-test.html?page='+s,type:'Map',search:'route map'},
      {id:'control',label:'Control Map',href:'web-builder-control-map-v7-12-253-test.html?page='+s,type:'Map',search:'control map systems'},
      {id:'source',label:'Source Map',href:'web-builder-pages-source-map-v7-12-255-test.html?page='+s,type:'Map',search:'source map pages'},
      {id:'headerFooter',label:'Header/Footer',href:'web-builder-header-footer-code-v7-12-254-test.html?page='+s,type:'Code',search:'header footer code'},
      {id:'manifest',label:'Manifest',href:'WEB-BUILDER-MANIFEST-V7-12-252.md',type:'Doc',search:'manifest checkpoint'}
    ];
  }
  function activeTabId(){
    var p = location.pathname.split('/').pop();
    if(p.indexOf('account-control-hub') > -1) return 'hub';
    if(p.indexOf('pages-manager') > -1) return 'pages';
    if(p.indexOf('overlay-route-truth-machine') > -1 || p.indexOf('studio') > -1 || p.indexOf('live-studio') > -1) return 'builder';
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
  function logoImg(){
    return '<img src="'+esc(LOGO_URL)+'" alt="Web Builder uploaded logo" onerror="this.onerror=null;this.parentNode.textContent=\'WB\';">';
  }
  function saveProjectedState(){
    try{
      var raw = localStorage.getItem(STORAGE_KEY);
      var state = raw ? JSON.parse(raw) : {};
      state.account = state.account || {displayName:'Web Builder Owner',roleLabel:'Builder owner'};
      state.avatar = {mode:'image',emoji:'WB',url:LOGO_URL,alt:'Web Builder uploaded logo'};
      state.brand = state.brand || {};
      state.brand.logoMode = 'image';
      state.brand.logoUrl = LOGO_URL;
      state.brand.faviconUrl = LOGO_URL;
      state.meta = state.meta || {};
      state.meta.localStorageOnly = true;
      state.meta.connectedToLiveApp = false;
      state.meta.assetAvatarProjection = true;
      state.meta.projectedAssetUrl = LOGO_URL;
      state.meta.projectedAssetPath = 'builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png';
      state.meta.logoFitMode = 'contain-centered';
      state.meta.storageWrites = false;
      state.meta.schemaChanges = false;
      state.meta.indexPromotion = false;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(e){}
  }
  function styleText(){
    return ''+
      '.mark,.brand .mark,header.top .mark{width:44px!important;height:44px!important;min-width:44px!important;max-width:44px!important;max-height:44px!important;padding:0!important;display:grid!important;place-items:center!important;overflow:hidden!important;border-radius:15px!important;background:#050711!important;background-image:none!important}'+
      '.mark img,.brand .mark img,header.top .mark img{width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;display:block!important;object-fit:contain!important;object-position:center center!important;border-radius:inherit!important;background:#050711!important}'+
      '[data-web-builder-projector-rail]{position:fixed;right:12px;bottom:12px;z-index:90020;display:flex;gap:8px;align-items:center;max-width:min(560px,calc(100vw - 24px));border:1px solid var(--wb-line,#ffffff22);border-radius:999px;background:rgba(7,9,16,.9);backdrop-filter:blur(14px);box-shadow:0 18px 60px #0008;padding:8px 10px;color:var(--wb-text,#f7fbff);font-family:Inter,system-ui,Arial,sans-serif;font-size:12px}'+
      '.wb-projector-logo,.wb-account-avatar,.wb-brand-logo{width:42px!important;height:42px!important;min-width:42px!important;border-radius:16px!important;display:grid!important;place-items:center!important;background:#050711!important;background-image:none!important;color:#071015;font-weight:1000;overflow:hidden!important}.wb-account-avatar,.wb-brand-logo{width:48px!important;height:48px!important;min-width:48px!important}.wb-projector-logo img,.wb-account-avatar img,.wb-brand-logo img{width:100%!important;height:100%!important;display:block!important;object-fit:contain!important;object-position:center center!important;border-radius:inherit!important;background:#050711!important}'+
      '.wb-projector-copy{display:grid;gap:2px}.wb-projector-copy b{font-size:14px}.wb-projector-copy small{color:#aeb8d6}.wb-projector-btn,.wb-secondary{border:0;border-radius:999px;background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#071015;text-decoration:none;font-weight:950;padding:9px 11px;cursor:pointer;white-space:nowrap}.wb-secondary{background:#ffffff16;color:#fff;border:1px solid #ffffff22}'+
      '.wb-builder-tabs{position:sticky;top:0;z-index:90010;display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,420px);gap:10px;align-items:center;padding:9px 14px;border-bottom:1px solid #ffffff22;background:rgba(7,9,16,.94);backdrop-filter:blur(14px);font-family:Inter,system-ui,Arial,sans-serif}.wb-builder-tab-scroll{display:flex;gap:8px;align-items:center;overflow-x:auto;scrollbar-width:thin;padding-bottom:2px}.wb-builder-tab{flex:0 0 auto;border:1px solid #ffffff22;border-radius:999px;background:#ffffff0d;color:#fff;text-decoration:none;font-weight:950;font-size:13px;padding:9px 12px}.wb-builder-tab.active{background:linear-gradient(135deg,#22d3a6,#7c3cff);color:#071015;border-color:transparent}.wb-builder-tab:hover{border-color:#22d3a6}'+
      '.wb-builder-search{position:relative;min-width:0}.wb-builder-search input{width:100%;border:1px solid #ffffff22;border-radius:999px;background:#0007;color:#fff;padding:11px 14px;font:inherit;font-weight:850;outline:none}.wb-builder-search input:focus{border-color:#22d3a6;box-shadow:0 0 0 3px #22d3a624}.wb-search-results{position:absolute;right:0;top:calc(100% + 8px);width:min(680px,calc(100vw - 28px));max-height:62vh;overflow:auto;border:1px solid #ffffff22;border-radius:22px;background:#080b16f8;box-shadow:0 24px 80px #000d;padding:8px;z-index:90100}.wb-search-hit{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:16px;background:#ffffff08;padding:11px;margin:0 0 8px}.wb-search-hit b{display:block}.wb-search-hit small{display:block;color:#aeb8d6;margin-top:3px}.wb-search-type{border:1px solid #ffffff20;border-radius:999px;background:#ffffff10;color:#dfffee;padding:5px 8px;font-size:11px;font-weight:950}'+
      '.wb-account-panel{position:fixed;right:12px;bottom:76px;z-index:90030;width:min(440px,calc(100vw - 24px));max-height:72vh;overflow:auto;border:1px solid #ffffff22;border-radius:24px;background:linear-gradient(135deg,#101529,#17122d);box-shadow:0 24px 80px #000b;padding:14px;color:#fff;font-family:Inter,system-ui,Arial,sans-serif;display:none}.wb-account-panel.open{display:block}.wb-account-head{display:grid;grid-template-columns:48px 1fr auto;gap:10px;align-items:center}.wb-account-panel small{display:block;color:#aeb8d6}.wb-panel-close{border:0;border-radius:999px;background:#ffffff18;color:#fff;font-weight:950;width:38px;height:38px;cursor:pointer}.wb-brand-mini{display:grid;grid-template-columns:48px 1fr;gap:10px;border:1px solid #ffffff18;border-radius:18px;background:#ffffff08;padding:10px;margin:12px 0}.wb-account-favs{display:grid;gap:8px}.wb-account-fav{display:block;border:1px solid #ffffff18;border-radius:16px;background:#ffffff08;color:#fff;text-decoration:none;padding:10px}.wb-account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'+
      'body[data-wb-shell] header.top .topRight,body[data-wb-shell] .top>.topRight{display:none!important}body[data-wb-shell] header.top{grid-template-columns:1fr!important}body[data-wb-shell] .brand{max-width:100%!important}'+
      '@media(max-width:980px){.wb-builder-tabs{grid-template-columns:1fr;padding:8px}.wb-builder-tab-scroll{padding-bottom:4px}.wb-builder-tab{font-size:12px;padding:9px 10px}.wb-search-results{left:0;right:auto;width:calc(100vw - 16px)}[data-web-builder-projector-rail]{left:8px;right:8px;max-width:none}.wb-projector-copy small{display:none}.wb-account-panel{left:8px;right:8px;width:auto}}';
  }
  function injectStyle(){
    var old = document.querySelector('[data-web-builder-projector-style]');
    if(old) old.remove();
    var style = document.createElement('style');
    style.setAttribute('data-web-builder-projector-style','true');
    style.textContent = styleText();
    document.head.appendChild(style);
  }
  function applyFavicon(){
    var link = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
    if(!link){ link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.type = 'image/png';
    link.sizes = '32x32';
    link.href = LOGO_URL;
    var apple = document.querySelector('link[rel="apple-touch-icon"]');
    if(apple) apple.href = LOGO_URL;
  }
  function forceLogoBox(el){
    if(!el) return;
    el.innerHTML = logoImg();
    el.setAttribute('title','Web Builder uploaded logo');
    el.style.overflow = 'hidden';
    el.style.background = '#050711';
    el.style.backgroundImage = 'none';
    el.style.display = 'grid';
    el.style.placeItems = 'center';
    var isHeaderMark = el.classList && el.classList.contains('mark');
    if(isHeaderMark){
      el.style.width = '44px';
      el.style.height = '44px';
      el.style.minWidth = '44px';
      el.style.maxWidth = '44px';
      el.style.maxHeight = '44px';
      el.style.padding = '0';
      el.style.borderRadius = '15px';
    }
    var img = el.querySelector('img');
    if(img){
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.maxWidth = '100%';
      img.style.maxHeight = '100%';
      img.style.display = 'block';
      img.style.objectFit = 'contain';
      img.style.objectPosition = 'center center';
      img.style.borderRadius = 'inherit';
      img.style.background = '#050711';
    }
  }
  function applyTopAvatar(){
    document.querySelectorAll('.mark,.wb-projector-logo,.wb-account-avatar,.wb-brand-logo').forEach(forceLogoBox);
  }
  function tabsHtml(){
    var active = activeTabId();
    return '<div class="wb-builder-tab-scroll">'+routeMap().map(function(r){
      return '<a class="wb-builder-tab '+(r.id === active ? 'active' : '')+'" data-wb-tab="'+esc(r.id)+'" href="'+esc(safeHref(r.href))+'">'+esc(r.label)+'</a>';
    }).join('')+'</div><div class="wb-builder-search" data-wb-search><input id="wbGlobalSearch" type="search" autocomplete="off" placeholder="Search Web Builder pages, tools..." aria-label="Search Web Builder"><div id="wbSearchResults" class="wb-search-results" role="listbox" hidden></div></div>';
  }
  function injectTabs(){
    var nav = document.querySelector('[data-web-builder-tabs]');
    if(!nav){
      nav = document.createElement('nav');
      nav.className = 'wb-builder-tabs';
      nav.setAttribute('data-web-builder-tabs','true');
      nav.setAttribute('aria-label','Web Builder navigation and search');
      var header = document.querySelector('header.top') || document.querySelector('.top');
      if(header && header.parentNode) header.parentNode.insertBefore(nav, header.nextSibling);
      else document.body.insertBefore(nav, document.body.firstChild);
    }
    nav.innerHTML = tabsHtml();
    bindSearch();
  }
  function staticSearchItems(){
    var s = q();
    return routeMap().map(function(r){ return {title:r.label,subtitle:r.href,type:r.type,href:r.href,search:(r.label+' '+r.href+' '+r.type+' '+r.search).toLowerCase()}; }).concat([
      {title:'Open Messenger Overlay',subtitle:'Current slug: '+currentSlug(),type:'Inbox',href:'web-builder-form-inbox-owned-v7-12-258-test.html?page='+s,search:'messages overlay inbox sent friends blocked'},
      {title:'Open Full Form Inbox',subtitle:'Current slug: '+currentSlug(),type:'Inbox',href:'web-builder-form-submissions-v7-12-94-test.html?page='+s,search:'full form inbox submissions'},
      {title:'Open Assets / Web Builder Logo',subtitle:'Projected logo source is the uploaded builder asset.',type:'Assets',href:'web-builder-assets-v7-12-252-test.html?page='+s,search:'assets avatar logo image'}
    ]);
  }
  function renderSearchResults(text){
    var box = document.getElementById('wbSearchResults');
    if(!box) return;
    text = String(text || '').trim().toLowerCase();
    if(!text){ box.hidden = true; box.innerHTML = ''; return; }
    var hits = staticSearchItems().filter(function(item){ return item.search.indexOf(text) > -1 || item.title.toLowerCase().indexOf(text) > -1 || item.subtitle.toLowerCase().indexOf(text) > -1; }).slice(0,16);
    box.hidden = false;
    box.innerHTML = hits.length ? hits.map(function(h){ return '<a class="wb-search-hit" href="'+esc(h.href)+'"><div><b>'+esc(h.title)+'</b><small>'+esc(h.subtitle)+'</small></div><span class="wb-search-type">'+esc(h.type)+'</span></a>'; }).join('') : '<div class="wb-search-hit"><div><b>No Web Builder results</b><small>Try page, form, inbox, menu, preview or assets.</small></div><span class="wb-search-type">Search</span></div>';
  }
  function bindSearch(){
    var input = document.getElementById('wbGlobalSearch');
    var box = document.getElementById('wbSearchResults');
    if(!input || !box) return;
    var timer = null;
    input.oninput = function(){ clearTimeout(timer); var text = input.value; timer = setTimeout(function(){ renderSearchResults(text); },120); };
    input.onfocus = function(){ if(input.value.trim()) renderSearchResults(input.value); };
    input.onkeydown = function(e){
      if(e.key === 'Escape'){ input.value=''; box.hidden=true; box.innerHTML=''; input.blur(); }
      if(e.key === 'Enter'){ var first = box.querySelector('a'); if(first){ e.preventDefault(); location.href = first.href; } }
    };
    document.addEventListener('click',function(e){ if(!e.target.closest || !e.target.closest('[data-wb-search]')) box.hidden = true; },true);
  }
  function panelHtml(){
    return '<div class="wb-account-panel" data-wb-account-panel aria-hidden="true">'+
      '<div class="wb-account-head"><div class="wb-account-avatar">'+logoImg()+'</div><div><b>Web Builder Owner</b><small>Web Builder only · local draft</small></div><button type="button" class="wb-panel-close" data-wb-panel-close>×</button></div>'+
      '<p>Web Builder logo projected from Assets. Stream Bandit app branding is untouched.</p>'+
      '<div class="wb-brand-mini"><div class="wb-brand-logo">'+logoImg()+'</div><div><b>Web Builder Studio</b><small>Build pages, forms and sites.</small><small>Avatar source: builder/assets/landing/1781530205862-1e5978b2-android_chrome_192.png</small></div></div>'+
      '<h3>Web Builder routes</h3><div class="wb-account-favs">'+routeMap().filter(function(r){ return ['hub','pages','builder','preview','menu','form','inbox','assets'].indexOf(r.id)>-1; }).map(function(r){ return '<a class="wb-account-fav" href="'+esc(r.href)+'"><b>'+esc(r.label)+'</b><small>'+esc(r.type)+' · '+esc(r.href)+'</small></a>'; }).join('')+'</div>'+
      '<div class="wb-account-actions"><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Open Hub</a><a class="wb-secondary" href="web-builder-assets-v7-12-252-test.html?page='+esc(q())+'">Open Assets</a><button type="button" class="wb-secondary" data-wb-panel-close>Close</button></div>'+
    '</div>';
  }
  function injectRail(){
    var rail = document.querySelector('[data-web-builder-projector-rail]');
    if(!rail){
      rail = document.createElement('div');
      rail.setAttribute('data-web-builder-projector-rail','true');
      document.body.appendChild(rail);
    }
    rail.innerHTML = '<div class="wb-projector-logo">'+logoImg()+'</div><div class="wb-projector-copy"><b>Web Builder Owner</b><small>Uploaded builder logo projected globally</small></div><a class="wb-projector-btn" href="web-builder-account-control-hub-v7-12-263-test.html">Hub</a>';
    var panel = document.querySelector('[data-wb-account-panel]');
    if(panel) panel.remove();
    document.body.insertAdjacentHTML('beforeend',panelHtml());
    bindPanel();
    applyTopAvatar();
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
    document.querySelectorAll('[data-wb-panel-close]').forEach(function(btn){
      btn.onclick = function(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); };
    });
  }
  function expose(){
    window.StreamBanditWebBuilderProjector = {
      version:VERSION,
      correctLogoUrl:LOGO_URL,
      storageKey:STORAGE_KEY,
      connectedToLiveApp:false,
      headerAvatarFit:true,
      logoFitMode:'contain-centered',
      topAvatarProjection:true,
      uploadedAssetAvatarProjection:true,
      sharedHeaderTabs:true,
      sharedRailAllRoutes:true,
      iframe:false,
      storageWrites:false,
      schemaChanges:false,
      indexPromotion:false,
      appliedAt:new Date().toISOString()
    };
    window.dispatchEvent(new CustomEvent('web-builder-projector-applied',{detail:window.StreamBanditWebBuilderProjector}));
  }
  function apply(){
    saveProjectedState();
    injectStyle();
    document.documentElement.setAttribute('data-web-builder-projector','active');
    document.documentElement.setAttribute('data-web-builder-projector-version',VERSION);
    document.documentElement.setAttribute('data-web-builder-live-app-connection','false');
    applyFavicon();
    injectTabs();
    injectRail();
    applyTopAvatar();
    expose();
  }
  function watch(){
    if(window.__wbProjector2997Bound) return;
    window.__wbProjector2997Bound = true;
    document.addEventListener('input',function(e){
      if(e.target && ['slug','pageSlug','studioSlug','wbSlug','siteSlug'].indexOf(e.target.id) > -1) setTimeout(function(){ injectTabs(); expose(); },80);
    },true);
    document.addEventListener('change',function(e){
      if(e.target && ['slug','pageSlug','studioSlug','wbSlug','siteSlug'].indexOf(e.target.id) > -1) setTimeout(function(){ injectTabs(); expose(); },80);
    },true);
    setTimeout(applyTopAvatar,80);
    setTimeout(applyTopAvatar,300);
    setTimeout(applyTopAvatar,900);
    setTimeout(applyTopAvatar,1800);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',function(){ apply(); watch(); });
  else { apply(); watch(); }
})();
