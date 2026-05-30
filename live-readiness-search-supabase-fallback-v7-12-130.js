/* Stream Bandit V7.12.156 Live Readiness Supabase search fallback + menu route sanitizer
   App-wide search overlay fallback for pages that load it.
   Also repairs visible shell menu links to current working routes without replacing the protected shell. */
(function(){
'use strict';
const VERSION='V7.12.156 Live Readiness Search + Menu Route Sanitizer';
const ROUTES={
  home:'home-global-helpers-v7-4-4-test.html',
  library:'library-global-helpers-v7-4-8-test.html',
  details:'details-clean-machine-v7-12-38-test.html',
  player:'player-one-global-helpers-v7-3-3-test.html',
  search:'global-search-global-helpers-v7-4-9-test.html',
  genres:'genres-clean-machine-v7-12-45-test.html',
  channels:'channels-global-helpers-v7-5-3-test.html',
  playlists:'playlists-global-helpers-v7-5-2-test.html',
  collections:'collections-clean-machine-v7-12-48-test.html',
  watchlist:'watchlist-clean-machine-v7-12-43-test.html',
  favourites:'favourites-clean-machine-v7-12-41-test.html',
  likes:'likes-clean-machine-v7-12-42-test.html',
  profile:'profile-settings-live-ready-v7-12-90-test.html',
  admin:'admin-centre-command-deck-v7-12-121-test.html',
  readiness:'live-readiness-global-helpers-v7-10-2-test.html',
  registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',
  checklist:'test-checklist-global-helpers-v7-10-5-test.html',
  tools:'tools-page-original-global-pass-v7-12-136-test.html',
  health:'health-check-global-helpers-v7-10-6-test.html',
  mux:'mux-manager-global-helpers-v7-10-7-test.html',
  storage:'storage-prep-global-helpers-v7-10-8-test.html',
  backup:'backup-safety-global-helpers-v7-10-9-test.html',
  builder:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
  theme:'web-builder-theme-studio-controls-v7-8-9-test.html',
  pagesManager:'web-builder-pages-manager-v7-12-111-test.html',
  preview:'web-builder-shared-style-preview-v7-12-117-test.html?page=test-page',
  formAdvanced:'web-builder-form-save-v7-12-94-test.html?page=test-page',
  formInbox:'web-builder-form-submissions-v7-12-94-test.html?page=test-page',
  policyCentre:'policy-documents-centre-v7-12-119-test.html',
  policyReader:'policy-reader-v7-12-119-test.html?policy=terms',
  policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',
  brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
  helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',
  oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',
  settingsHub:'settings-platform-control-hub-v7-12-85-test.html',
  myChannel:'my-channel-clean-machine-v7-12-47-test.html',
  submit:'submit-video-clean-machine-v7-12-79-test.html',
  rules:'rules-clean-machine-v7-12-82-test.html',
  review:'review-queue-clean-machine-v7-12-80-publish-test.html',
  about:'about-global-helpers-v7-4-7-test.html',
  supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
  player2:'player-2-progress-helper-v6-78-9-4-test.html'
};
const BY_LABEL={
  'Admin Centre':[ROUTES.admin,'Admin command deck'],
  'Live Readiness':[ROUTES.readiness,'Release smoke test'],
  'Current Routes Registry':[ROUTES.registry,'Current route scanner'],
  'Version Registry':[ROUTES.registry,'Current route scanner'],
  'Test Checklist':[ROUTES.checklist,'Testing'],
  'Tools':[ROUTES.tools,'Tools'],
  'Health Check':[ROUTES.health,'Health'],
  'Mux Manager':[ROUTES.mux,'Mux'],
  'Storage Prep':[ROUTES.storage,'Storage'],
  'Backup / Safety':[ROUTES.backup,'Backup'],
  'Library':[ROUTES.library,'Supabase Library'],
  'Supabase Library Editor':[ROUTES.supabaseLibrary,'Supabase editor'],
  'Genres':[ROUTES.genres,'Genres'],
  'Global Search':[ROUTES.search,'Full search'],
  'About':[ROUTES.about,'About'],
  'Submit Video':[ROUTES.submit,'Passed direct poster upload + direct submission'],
  'Rules':[ROUTES.rules,'Passed workflow checkpoint'],
  'Review Queue':[ROUTES.review,'Passed publish to Library'],
  'Playlists':[ROUTES.playlists,'Playlists'],
  'Channels':[ROUTES.channels,'Channels'],
  'My Channel':[ROUTES.myChannel,'My Channel'],
  'Collections':[ROUTES.collections,'Collections'],
  'Player 2':[ROUTES.player2,'Group Player'],
  'Form Inbox':[ROUTES.formInbox,'Builder form submissions inbox'],
  'Advanced Form':[ROUTES.formAdvanced,'Passed advanced builder form route'],
  'Web Builder Studio':[ROUTES.builder,'Builder rebuild route'],
  'Pages Manager':[ROUTES.pagesManager,'Create, edit, hide, restore and guarded-delete Web Builder pages'],
  'Published Preview':[ROUTES.preview,'Interactive published Web Builder preview'],
  'Policy & FAQ Centre':[ROUTES.policyCentre,'Policy'],
  'Published Policy Proof':[ROUTES.policyReader,'Read-only proof'],
  'Policy Admin Editor':[ROUTES.policyAdmin,'Policy admin'],
  'One Machine':[ROUTES.oneMachine,'Owner diagnostics'],
  'Platform Control Centre':[ROUTES.settingsHub,'Owner controls hub'],
  'Clean Machine Menu':[ROUTES.registry,'Owner diagnostic routed to current registry'],
  'Route Guard Proof':[ROUTES.health,'Owner diagnostic routed to health check'],
  'Route Pointer Machine':[ROUTES.registry,'Owner diagnostic routed to current registry'],
  'Final Shell Navigation':[ROUTES.helperShell,'Owner diagnostic routed to helper shell'],
  'Brand / App Icons':[ROUTES.brandIcons,'Brand tools'],
  'Brand Image Helper':[ROUTES.brandIcons,'Brand helper routed to brand tools'],
  'Favicon / App Icon Builder':[ROUTES.brandIcons,'Icon builder routed to brand tools'],
  'Settings Hub':[ROUTES.settingsHub,'Settings hub'],
  'Settings Studio':[ROUTES.theme,'Theme Studio owner'],
  'Web Builder':[ROUTES.builder,'Builder Studio route'],
  'Profile Settings':[ROUTES.profile,'Profile image overlay'],
  'Home':[ROUTES.home,'Clean Home current'],
  'Details':[ROUTES.details,'Clean Details'],
  'Player 1':[ROUTES.player,'Single-title Player'],
  'Watchlist':[ROUTES.watchlist,'Watchlist'],
  'Favourites':[ROUTES.favourites,'Favourites'],
  'Liked':[ROUTES.likes,'Liked'],
  'Likes':[ROUTES.likes,'Liked']
};
const BY_FILE={
  'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,
  'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
  'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,
  'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
  'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,
  'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,
  'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,
  'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,
  'stream-bandit-one-machine-v7-12-72-test.html':ROUTES.oneMachine,
  'platform-control-centre-combined-v7-12-61-test.html':ROUTES.settingsHub,
  'stream-bandit-clean-machine-menu-v7-12-40-test.html':ROUTES.registry,
  'platform-control-tower-route-guard-proof-v7-12-33-test.html':ROUTES.health,
  'stream-bandit-route-pointer-machine-v7-12-36-test.html':ROUTES.registry,
  'final-shell-navigation-global-helpers-v7-5-9-test.html':ROUTES.helperShell,
  'brand-logo-helper-responsive-v7-12-20-test.html':ROUTES.brandIcons,
  'favicon-app-icon-builder-v7-12-15-test.html':ROUTES.brandIcons
};
const STATIC_POLICIES=[
  ['terms','Terms of Use / End User Agreement','Terms, rules and end-user agreement for using Stream Bandit.'],
  ['privacy','Privacy Policy','Privacy, user data, account and contact policy.'],
  ['cookies','Cookie Policy','Cookies, local storage and browser storage policy.'],
  ['family-watch','Children / Family Watch Policy','Family watch, children safety and viewing guidance.'],
  ['cancellation','Cancellation / Refunds Policy','Cancellation, refund and subscription policy placeholder.'],
  ['creator-content','Creator / Content Rules','Creator upload, content, copyright and community rules.'],
  ['accessibility','Accessibility Statement','Accessibility statement, louder audio and player comfort support.']
];
let cache=null,loading=null,wired=false,cfg=null,observer=null,lastPatch=0;
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clean(s){return String(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function arr(v){if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean);if(typeof v==='string'){try{let j=JSON.parse(v);if(Array.isArray(j))return j.map(x=>String(x).trim()).filter(Boolean);}catch(e){}return v.split(/[|,]/).map(x=>x.trim()).filter(Boolean);}return v?[String(v).trim()].filter(Boolean):[];}
function text(v){if(v==null)return '';if(Array.isArray(v))return v.join(' ');if(typeof v==='object'){try{return JSON.stringify(v);}catch(e){return '';}}return String(v);}
function short(s,q){s=clean(s);let n=s.toLowerCase().indexOf(String(q||'').toLowerCase());if(n<0)return s.slice(0,230);let a=Math.max(0,n-70),b=Math.min(s.length,n+170);return (a?'...':'')+s.slice(a,b)+(b<s.length?'...':'');}
function poster(m){return m.thumbnail_url||m.poster_url||m.poster||m.thumb||m.backdrop_url||m.image_url||'';}
function file(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0];}
function pageParam(){try{return new URL(location.href).searchParams.get('page')||'test-page';}catch(e){return 'test-page';}}
function route(u){return String(u||'').replace('page=test-page','page='+encodeURIComponent(pageParam()));}
function labelOf(a){let b=a.querySelector('b');return clean(b?b.textContent:a.textContent).split('\n')[0].trim();}
function applyRouteMap(){
  try{window.StreamBanditRoutes=Object.assign(window.StreamBanditRoutes||{},ROUTES,{registry:ROUTES.registry,admin:ROUTES.admin,tools:ROUTES.tools,builder:ROUTES.builder,builderStudio:ROUTES.builder,policyCentre:ROUTES.policyCentre,policyAdmin:ROUTES.policyAdmin,policyProof:ROUTES.policyReader,platformControl:ROUTES.settingsHub,cleanMenu:ROUTES.registry,guard:ROUTES.health,pointer:ROUTES.registry,finalShell:ROUTES.helperShell,brandLogoHelper:ROUTES.brandIcons,faviconBuilder:ROUTES.brandIcons});}catch(e){}
}
function fixLink(a){
  if(!a||!a.getAttribute)return 0;
  let changed=0;
  let label=labelOf(a);
  let byLabel=BY_LABEL[label]||null;
  let href=a.getAttribute('href')||'';
  let f=file(href);
  let target=byLabel?byLabel[0]:(BY_FILE[f]||'');
  if(target){let next=route(target);if(href!==next){a.setAttribute('href',next);changed++;}}
  if(label==='Version Registry'){let b=a.querySelector('b');if(b){b.textContent='Current Routes Registry';changed++;}}
  if(byLabel&&byLabel[1]){let sm=a.querySelector('small');if(sm&&clean(sm.textContent)!==byLabel[1]){sm.textContent=byLabel[1];changed++;}}
  if(target){a.dataset.sb156RouteFixed='true';}
  return changed;
}
function sanitizeMenu(force){
  let now=Date.now();if(!force&&now-lastPatch<350)return 0;lastPatch=now;
  applyRouteMap();
  let changed=0;
  try{document.querySelectorAll('a.sb-shell-link,.sb-shell-drawer a[href],a[href]').forEach(a=>{changed+=fixLink(a);});}catch(e){}
  try{document.documentElement.dataset.sb156MenuRouteSanitizer='active';document.documentElement.dataset.sb156MenuRoutesFixed=String((Number(document.documentElement.dataset.sb156MenuRoutesFixed)||0)+changed);}catch(e){}
  return changed;
}
async function readConfig(){if(cfg)return cfg;try{let txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());cfg={url:(txt.match(/SUPABASE_URL\s*=\s*['\"]([^'\"]+)/)||[])[1]||'',key:(txt.match(/SUPABASE_KEY\s*=\s*['\"]([^'\"]+)/)||[])[1]||''};}catch(e){cfg={url:'',key:''};}return cfg;}
async function rest(table,params){let c=await readConfig();if(!c.url||!c.key)throw new Error('Supabase shell config unavailable');let url=c.url+'/rest/v1/'+table+'?'+(params||'select=*&limit=200');let r=await fetch(url,{headers:{apikey:c.key,Authorization:'Bearer '+c.key},cache:'no-store'});if(!r.ok)throw new Error(table+' REST '+r.status);return await r.json();}
function add(out,seen,kind,title,url,body,icon,img,chips){title=clean(title||url||kind);url=url||'#';body=clean(body||title);let key=kind+'|'+title+'|'+url;if(!title||seen.has(key))return;seen.add(key);out.push({kind,title,url,body,icon:icon||'🔎',img:img||'',chips:(chips||[]).map(clean).filter(Boolean)});}
function routeRows(out,seen){
  applyRouteMap();
  Object.keys(ROUTES).forEach(k=>add(out,seen,'Route',k,route(ROUTES[k]),k+' '+ROUTES[k],'🧭','',[file(ROUTES[k])]));
  try{document.querySelectorAll('a[href],button,.tab,.card,.gate,.route,.footer a,h1,h2,h3').forEach(el=>{let t=clean(el.innerText||el.textContent||'');let u=el.getAttribute&&el.getAttribute('href')||location.pathname.split('/').pop();if(t.length>2)add(out,seen,'This page',t.slice(0,90),u,t,'📄');});}catch(e){}
  STATIC_POLICIES.forEach(p=>add(out,seen,'Policy agreement',p[1],ROUTES.policyReader.replace('policy=terms','policy='+encodeURIComponent(p[0])),p[0]+' '+p[1]+' '+p[2],'📜','',[p[0],'policy']));
}
async function loadData(force){
  if(cache&&!force)return cache;
  if(loading)return loading;
  loading=(async()=>{
    let out=[],seen=new Set(),meta={movies:0,genres:0,channels:0,playlists:0,collections:0,sitePages:0,policies:0,routes:0,errors:[]};
    routeRows(out,seen);meta.routes=out.length;
    let movies=[];
    try{movies=(await rest('sb_movies','select=*&order=created_at.desc&limit=350')).filter(m=>String(m.status||'published').toLowerCase()!=='archived');movies.forEach(m=>{let gs=arr(m.genres).concat(arr(m.genre)),ts=arr(m.tags).concat(arr(m.tag));let title=m.title||m.name||'Untitled movie';let body=[title,m.description,m.summary,m.channel,m.channel_name,m.creator,m.director,m.cast_text,m.rating,m.age_rating,m.year,m.release_year,m.release_date,m.runtime_text,gs.join(' '),ts.join(' ')].map(text).join(' ');add(out,seen,'Movie',title,ROUTES.details+'?id='+encodeURIComponent(m.id||''),body,'🎬',poster(m),gs.concat(ts).slice(0,4));meta.movies++;});}catch(e){meta.errors.push(e.message||String(e));}
    try{let gm={};movies.forEach(m=>arr(m.genres).concat(arr(m.genre)).forEach(g=>{gm[g]=gm[g]||[];gm[g].push(m.title||m.name||'Untitled movie');}));Object.keys(gm).forEach(g=>{add(out,seen,'Genre',g,ROUTES.genres+'?genre='+encodeURIComponent(g),g+' '+gm[g].length+' movies '+gm[g].join(' '),'🏷️','',[gm[g].length+' movies']);meta.genres++;});}catch(e){}
    try{(await rest('sb_channels','select=*&order=created_at.desc&limit=220')).forEach(x=>{let title=x.name||x.title||'Channel';add(out,seen,'Channel',title,ROUTES.channels+'?id='+encodeURIComponent(x.id||''),[title,x.description,x.is_official?'official channel':'',x.owner_id].map(text).join(' '),'📺',x.avatar_url||x.image_url||'',[x.is_official?'official':'channel']);meta.channels++;});}catch(e){meta.errors.push(e.message||String(e));}
    try{(await rest('sb_playlists','select=*&order=created_at.desc&limit=220')).forEach(x=>{let title=x.name||x.title||'Playlist';add(out,seen,'Playlist',title,ROUTES.playlists+'?id='+encodeURIComponent(x.id||''),[title,x.description,x.is_public?'public playlist':'private playlist',x.owner_id].map(text).join(' '),'📃',x.image_url||'',[x.is_public?'public':'private']);meta.playlists++;});}catch(e){meta.errors.push(e.message||String(e));}
    try{(await rest('sb_collections','select=*&order=created_at.desc&limit=220')).forEach(x=>{let title=x.name||x.title||'Collection';add(out,seen,'Collection',title,ROUTES.collections+'?id='+encodeURIComponent(x.id||''),[title,x.description,x.created_by].map(text).join(' '),'🧺',x.image_url||'',['collection']);meta.collections++;});}catch(e){meta.errors.push(e.message||String(e));}
    try{(await rest('sb_site_pages','select=*&order=updated_at.desc&limit=220')).forEach(x=>{let slug=x.slug||x.page_slug||'';let title=x.title||x.name||x.page_title||slug||'Site page';let body=[title,slug,x.status,x.description,x.excerpt,text(x.blocks||x.sections||x.content_json||x.body||x.html||x.markdown||x.text)].join(' ');add(out,seen,'Site page',title,slug?ROUTES.preview.replace('page=test-page','page='+encodeURIComponent(slug)):ROUTES.pagesManager,body,'🏗️','',[x.status,slug]);meta.sitePages++;});}catch(e){meta.errors.push(e.message||String(e));}
    try{(await rest('sb_policy_documents','select=slug,title,body,status,contact_email,version_label,updated_at&order=updated_at.desc&limit=120')).forEach(x=>{let slug=x.slug||'';let title=x.title||slug||'Policy document';let body=[title,slug,x.status,x.version_label,x.contact_email,x.body].map(text).join(' ');add(out,seen,'Policy agreement',title,'policy-reader-v7-12-119-test.html?policy='+encodeURIComponent(slug||'terms'),body,'📜','',[x.status||'policy',slug]);meta.policies++;});}catch(e){meta.errors.push(e.message||String(e));}
    cache={rows:out,meta};loading=null;document.documentElement.dataset.sb156SearchRows=String(out.length);document.documentElement.dataset.sb156MovieRows=String(meta.movies);document.documentElement.dataset.sb156PolicyRows=String(meta.policies);return cache;
  })();
  return loading;
}
function style(){if(document.getElementById('sb156SearchStyle'))return;let s=document.createElement('style');s.id='sb156SearchStyle';s.textContent='.sb156-site-search{position:fixed!important;right:28px!important;top:92px!important;width:min(900px,92vw)!important;max-height:78vh!important;overflow:auto!important;border:1px solid #22d3a657!important;border-radius:22px!important;background:linear-gradient(180deg,#08101cfa,#120c26fa)!important;box-shadow:0 30px 90px #000c!important;padding:12px!important;display:none!important;z-index:2147483647!important;color:#fff!important;font-family:Inter,system-ui,Arial,sans-serif!important}.sb156-site-search.open{display:block!important}.sb156-search-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}.sb156-close{border:0;border-radius:999px;background:#414667;color:#fff;font-weight:950;padding:8px 11px;cursor:pointer}.sb156-result{display:grid;grid-template-columns:68px 1fr;gap:10px;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:16px;background:#ffffff0d;padding:10px;margin:8px 0}.sb156-result b{color:#baf7df}.sb156-result small,.sb156-desc{display:block;color:#b9c0d8;margin-top:4px}.sb156-kind{width:68px;aspect-ratio:16/10;border-radius:12px;background:linear-gradient(135deg,#22d3a6,#7c3cff);display:grid;place-items:center;overflow:hidden}.sb156-kind img{width:100%;height:100%;object-fit:cover}.sb156-note{padding:12px 14px;border-radius:18px;background:#ffb1421f;border:1px solid #ffb14252;color:#ffe7ad;font-weight:850;margin-top:8px}.sb156-chip{display:inline-flex;margin:4px 5px 0 0;padding:3px 7px;border-radius:999px;background:#22d3a624;border:1px solid #22d3a657;color:#baf7df;font-size:11px;font-weight:900}.sb156-search-meta{font-size:12px;color:#b9c0d8;margin:0 0 8px}.sb156-error{font-size:11px;color:#ffe7ad;margin-top:6px;opacity:.86}@media(max-width:760px){.sb156-site-search{left:10px!important;right:10px!important;top:76px!important;width:auto!important}}';document.head.appendChild(s);}
function overlay(){style();let ov=document.getElementById('sb156SiteSearchOverlay');if(!ov){ov=document.createElement('div');ov.id='sb156SiteSearchOverlay';ov.className='sb156-site-search';ov.innerHTML='<div class="sb156-search-head"><b id="sb156SearchTitle">Stream Bandit search</b><button id="sb156CloseSearch" class="sb156-close" type="button">Close</button></div><div id="sb156SearchResults"></div><div class="sb156-note">Searches movies, genres, channels, playlists, collections, pages, policy agreements and current route/page text. Enter opens the full Global Search page.</div>';document.body.appendChild(ov);let c=document.getElementById('sb156CloseSearch');if(c)c.onclick=()=>ov.classList.remove('open');}return ov;}
function htmlResult(h,q){let chips=h.chips.slice(0,4).map(c=>'<span class="sb156-chip">'+esc(c)+'</span>').join('');let thumb=h.img?'<img src="'+esc(h.img)+'" alt="">':esc(h.icon||'🔎');return '<a class="sb156-result" href="'+esc(route(h.url))+'"><span class="sb156-kind">'+thumb+'</span><span><b>'+esc(h.title)+'</b><small>'+esc(h.kind)+' result</small><span class="sb156-desc">'+esc(short(h.body,q))+'</span>'+chips+'</span></a>';}
async function search(q,force){q=String(q||'').trim();let ov=overlay();if(q.length<2){ov.classList.remove('open');return;}ov.classList.add('open');let box=document.getElementById('sb156SearchResults'),title=document.getElementById('sb156SearchTitle');if(title)title.textContent='Searching Stream Bandit for "'+q+'"';if(box)box.innerHTML='<div class="sb156-note">Loading movies, genres, channels, playlists, pages and policy agreements...</div>';let data=await loadData(force);let n=q.toLowerCase();let hits=data.rows.filter(r=>(r.title+' '+r.kind+' '+r.url+' '+r.body+' '+r.chips.join(' ')).toLowerCase().includes(n)).sort((a,b)=>{let rank={Movie:0,Genre:1,Channel:2,Playlist:3,Collection:4,'Site page':5,'Policy agreement':6,Route:7,'This page':8};return (rank[a.kind]??20)-(rank[b.kind]??20);}).slice(0,34);if(title)title.textContent=hits.length?'Results for “'+q+'”':'No Stream Bandit results for “'+q+'”';let meta=data.meta;let metaHtml='<div class="sb156-search-meta">Indexed '+data.rows.length+' items · movies '+meta.movies+' · genres '+meta.genres+' · channels '+meta.channels+' · playlists '+meta.playlists+' · collections '+meta.collections+' · pages '+meta.sitePages+' · policy agreements '+meta.policies+' · routes/page text '+meta.routes+'</div>';let err=meta.errors.length?'<div class="sb156-error">Read notes: '+esc(meta.errors.slice(0,5).join(' | '))+'</div>':'';box.innerHTML=metaHtml+(hits.length?hits.map(h=>htmlResult(h,q)).join(''):'<div class="sb156-note">No matching movies/pages/routes/policies found. Press Enter for the full Global Search page.</div>')+err;}
function input(){return document.getElementById('globalSearch')||document.getElementById('topSearch');}
function btn(){return document.getElementById('globalSearchBtn')||document.getElementById('topSearchBtn');}
function val(){let i=input();return i?i.value:'';}
function hideOld(){['sb129SiteSearchOverlay','sb128MovieSearchOverlay','sbGlobalShellSearchOverlay','searchOverlay'].forEach(id=>{let x=document.getElementById(id);if(x){x.classList.remove('open');x.style.display='none';x.style.visibility='hidden';x.style.pointerEvents='none';}});}
function capture(e){let i=input(),b=btn();if(!i)return;if(e.type==='input'&&e.target===i){e.stopImmediatePropagation();e.stopPropagation();hideOld();setTimeout(()=>search(i.value,false),0);return;}if((e.type==='keyup'||e.type==='focusin')&&e.target===i){hideOld();setTimeout(()=>search(i.value,false),0);return;}if(e.type==='click'&&(e.target===b||e.target.closest&&e.target.closest('#globalSearchBtn,#topSearchBtn'))){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();hideOld();search(i.value,true);return;}if(e.type==='keydown'&&e.target===i&&e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();location.href=ROUTES.search+(i.value.trim()?'?q='+encodeURIComponent(i.value.trim()):'');}}
function wire(){if(wired)return;wired=true;style();overlay();applyRouteMap();sanitizeMenu(true);['input','keyup','focusin','click','keydown'].forEach(t=>document.addEventListener(t,capture,true));let i=input(),b=btn();if(i){i.dataset.sb156Search='live-readiness-fallback';i.oninput=()=>{search(i.value,false);return false;};i.onfocus=()=>{if(i.value.trim().length>1)search(i.value,false);return false;};}if(b)b.onclick=e=>{e.preventDefault();search(val(),true);return false;};try{observer=new MutationObserver(()=>sanitizeMenu(false));observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['href','class']});}catch(e){}setTimeout(()=>loadData(true),800);setTimeout(()=>loadData(true),2400);setTimeout(()=>sanitizeMenu(true),250);setTimeout(()=>sanitizeMenu(true),1000);setTimeout(()=>sanitizeMenu(true),2500);setInterval(()=>sanitizeMenu(false),2500);document.documentElement.dataset.sb156LiveReadinessSearch='active';window.StreamBanditLiveReadinessSearchFallback={version:VERSION,refresh:()=>{sanitizeMenu(true);return loadData(true);},search:search,sanitizeMenu:()=>sanitizeMenu(true),routes:ROUTES,state:()=>cache};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
