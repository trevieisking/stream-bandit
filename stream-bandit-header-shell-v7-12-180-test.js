/* Stream Bandit Header Shell V7.12.180 TEST
   Test shell only.
   Based on V7.12.156 header shell.
   Purpose: test Group Play route truth before replacing the real shell.

   Shell owns:
   - header
   - icons
   - overlay menu/current scroll
   - search bridge
   - saved count badges

   Test change only:
   - Collections route now points to collections-clean-machine-v7-12-51-test.html
   - Player 2 route now points to player-2-clean-machine-v7-12-58-test.html
   - Old Group Play routes are mapped inside the shell OLD route map.
*/
(function(){
'use strict';

const VERSION='V7.12.180 Header Shell TEST / Group Play Route Truth';
const THEME_OWNER='web-builder-theme-studio-controls-v7-8-9-test.html';
const LOGO='stream_bandit_original_logo_square_256.png';
const PROFILE='profile-settings-live-ready-v7-12-90-test.html';

const ROUTES={
 home:'home-global-helpers-v7-4-4-test.html',
 library:'library-global-helpers-v7-4-8-test.html',
 supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
 genres:'genres-clean-machine-v7-12-45-test.html',
 search:'global-search-global-helpers-v7-4-9-test.html',
 about:'about-global-helpers-v7-4-7-test.html',
 details:'details-clean-machine-v7-12-38-test.html',
 player1:'player-one-global-helpers-v7-3-3-test.html',
 player2:'player-2-clean-machine-v7-12-58-test.html',
 continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
 watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
 watchlist:'watchlist-clean-machine-v7-12-43-test.html',
 favourites:'favourites-clean-machine-v7-12-41-test.html',
 likes:'likes-clean-machine-v7-12-42-test.html',
 accessibility:'accessibility-clean-machine-v7-12-44-test.html',
 playlists:'playlists-global-helpers-v7-5-2-test.html',
 channels:'channels-global-helpers-v7-5-3-test.html',
 myChannel:'my-channel-clean-machine-v7-12-47-test.html',
 collections:'collections-clean-machine-v7-12-51-test.html',
 submit:'submit-video-clean-machine-v7-12-79-test.html',
 rules:'rules-clean-machine-v7-12-82-test.html',
 review:'review-queue-clean-machine-v7-12-80-publish-test.html',
 settings:'settings-platform-control-hub-v7-12-85-test.html',
 theme:THEME_OWNER,
 profile:PROFILE,
 builder:'web-builder-live-studio-v7-12-116-test.html?page=test-page',
 pagesManager:'web-builder-pages-manager-v7-12-111-test.html',
 preview:'web-builder-shared-style-preview-v7-12-117-test.html?page=test-page',
 formAdvanced:'web-builder-form-save-v7-12-94-test.html?page=test-page',
 formInbox:'web-builder-form-submissions-v7-12-94-test.html?page=test-page',
 policyCentre:'policy-documents-centre-v7-12-119-test.html',
 policyReader:'policy-reader-v7-12-119-test.html?policy=terms',
 policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',
 admin:'admin-centre-command-deck-v7-12-121-test.html',
 readiness:'live-readiness-global-helpers-v7-10-2-test.html',
 registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',
 checklist:'test-checklist-global-helpers-v7-10-5-test.html',
 tools:'tools-page-original-global-pass-v7-12-136-test.html',
 health:'health-check-global-helpers-v7-10-6-test.html',
 mux:'mux-manager-global-helpers-v7-10-7-test.html',
 storage:'storage-prep-global-helpers-v7-10-8-test.html',
 backup:'backup-safety-global-helpers-v7-10-9-test.html',
 brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
 helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',
 oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',
 platformControl:'settings-platform-control-hub-v7-12-85-test.html'
};

const OLD={
 'collections-clean-machine-v7-12-48-test.html':ROUTES.collections,
 'collections-clean-machine-v7-12-49-test.html':ROUTES.collections,
 'collections-clean-machine-v7-12-50-test.html':ROUTES.collections,
 'collections-global-helpers-v7-5-1-test.html':ROUTES.collections,
 'collections-browse-shell-v6-46-1-test.html':ROUTES.collections,

 'player-2-progress-helper-v6-78-9-4-test.html':ROUTES.player2,
 'player-two-global-helpers-v7-3-4-test.html':ROUTES.player2,
 'player-2-clean-machine-v7-12-57-test.html':ROUTES.player2,

 'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
 'all-pages-version-registry-v7-10-3-full-test.html':ROUTES.registry,
 'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,
 'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,
 'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
 'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,
 'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,
 'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,
 'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,
 'stream-bandit-clean-machine-menu-v7-12-40-test.html':ROUTES.registry,
 'platform-control-tower-route-guard-proof-v7-12-33-test.html':ROUTES.health,
 'stream-bandit-route-pointer-machine-v7-12-36-test.html':ROUTES.registry,
 'final-shell-navigation-global-helpers-v7-5-9-test.html':ROUTES.helperShell,
 'stream-bandit-one-machine-v7-12-72-test.html':ROUTES.oneMachine,
 'platform-control-centre-combined-v7-12-61-test.html':ROUTES.platformControl,
 'platform-control-centre-admin-v7-12-59-test.html':ROUTES.platformControl,
 'brand-logo-helper-responsive-v7-12-20-test.html':ROUTES.brandIcons,
 'brand-image-helper-v7-12-20-test.html':ROUTES.brandIcons,
 'favicon-app-icon-builder-v7-12-15-test.html':ROUTES.brandIcons
};

const MENU=[
 ['Watch','🏠','Home',ROUTES.home,'Home'],
 ['Watch','🎞️','Library',ROUTES.library,'Library'],
 ['Watch','🎬','Details',ROUTES.details,'Details'],
 ['Watch','▶️','Player 1',ROUTES.player1,'Single-title player'],
 ['Watch','⏯️','Continue Watching',ROUTES.continueWatching,'Resume'],
 ['Watch','🕘','Watch History',ROUTES.watchHistory,'History'],
 ['Watch','🔖','Watchlist',ROUTES.watchlist,'Watchlist'],
 ['Watch','⭐','Favourites',ROUTES.favourites,'Favourites'],
 ['Watch','👍','Likes',ROUTES.likes,'Likes'],
 ['Watch','♿','Accessibility',ROUTES.accessibility,'Player comfort'],

 ['Browse','🟢','Supabase Library Editor',ROUTES.supabaseLibrary,'Library editor'],
 ['Browse','🏷️','Genres',ROUTES.genres,'Genres'],
 ['Browse','🔎','Global Search',ROUTES.search,'Full search'],
 ['Browse','ℹ️','About',ROUTES.about,'About'],

 ['Creator','⬆️','Submit Video',ROUTES.submit,'Submit'],
 ['Creator','📜','Rules',ROUTES.rules,'Rules'],
 ['Creator','🧾','Review Queue',ROUTES.review,'Review'],

 ['Group Play','📃','Playlists',ROUTES.playlists,'Playlists'],
 ['Group Play','📺','Channels',ROUTES.channels,'Channels'],
 ['Group Play','📡','My Channel',ROUTES.myChannel,'My Channel'],
 ['Group Play','🧺','Collections',ROUTES.collections,'Collections'],
 ['Group Play','▶️▶️','Player 2',ROUTES.player2,'Group player'],

 ['Settings','⚙️','Settings Hub',ROUTES.settings,'Settings'],
 ['Settings','🎨','Theme Studio',ROUTES.theme,'Theme owner'],
 ['Settings','👤','Profile Settings',ROUTES.profile,'Profile'],
 ['Settings','🏗️','Web Builder',ROUTES.builder,'Builder'],

 ['Policy','📚','Policy Documents',ROUTES.policyCentre,'Policy centre'],
 ['Policy','📖','Policy Proof',ROUTES.policyReader,'Published policy'],
 ['Policy','🧾','Policy Admin Editor',ROUTES.policyAdmin,'Policy admin'],

 ['Admin','🛠️','Admin Centre',ROUTES.admin,'Admin'],
 ['Admin','🚦','Live Readiness',ROUTES.readiness,'Readiness'],
 ['Admin','📋','Current Routes Registry',ROUTES.registry,'Registry'],
 ['Admin','🧪','Test Checklist',ROUTES.checklist,'Testing'],
 ['Admin','🧰','Tools',ROUTES.tools,'Tools'],
 ['Admin','✅','Health Check',ROUTES.health,'Health'],
 ['Admin','🎥','Mux Manager',ROUTES.mux,'Mux'],
 ['Admin','🪣','Storage Prep',ROUTES.storage,'Storage'],
 ['Admin','🛡️','Backup / Safety',ROUTES.backup,'Backup'],

 ['Owner','📬','Form Inbox',ROUTES.formInbox,'Form inbox'],
 ['Owner','🧾','Advanced Form',ROUTES.formAdvanced,'Advanced form'],
 ['Owner','🏗️','Web Builder Studio',ROUTES.builder,'Builder studio'],
 ['Owner','🧠','One Machine',ROUTES.oneMachine,'Diagnostics'],
 ['Owner','🎛️','Platform Control Centre',ROUTES.platformControl,'Controls'],
 ['Owner','🧱','Clean Machine Menu',ROUTES.registry,'Routed to registry'],
 ['Owner','🛡️','Route Guard Proof',ROUTES.health,'Routed to health'],
 ['Owner','🎯','Route Pointer Machine',ROUTES.registry,'Routed to registry'],
 ['Owner','🧭','Final Shell Navigation',ROUTES.helperShell,'Helper shell'],
 ['Owner','🗂️','Brand / App Icons',ROUTES.brandIcons,'Brand'],
 ['Owner','🖼️','Brand Image Helper',ROUTES.brandIcons,'Brand helper'],
 ['Owner','🦌','Favicon / App Icon Builder',ROUTES.brandIcons,'Icons'],
 ['Owner','🧭','Pages Manager',ROUTES.pagesManager,'Pages'],
 ['Owner','👁️','Published Preview',ROUTES.preview,'Preview']
];

let sbProfileClient=null;
let sbProfileCache=null;
let sbProfileLoading=false;
let sbProfileLastRead=0;
let sbProfileAuthWatch=false;

function esc(s){
 return String(s??'').replace(/[&<>"']/g,c=>({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
 }[c]));
}

function file(v){
 return String(v||'').split('/').pop().split('?')[0].split('#')[0];
}

function page(){
 try{
  return new URL(location.href).searchParams.get('page')||'test-page';
 }catch(e){
  return 'test-page';
 }
}

function route(u){
 let r=OLD[file(u)]||String(u||'');
 return r.replace('page=test-page','page='+encodeURIComponent(page()));
}

function cur(){
 return file(location.pathname)||'index.html';
}

function same(a,b){
 return file(route(a))===file(route(b));
}

function short(s,n){
 s=String(s||'').trim();
 return s.length>n?s.slice(0,n-1).trim()+'…':s;
}

function firstNonEmpty(){
 for(let i=0;i<arguments.length;i++){
  let v=arguments[i];
  if(v!==undefined&&v!==null&&String(v).trim()!=='')return String(v).trim();
 }
 return '';
}

function addCss(){
 if(document.getElementById('sbHeaderShellCss'))return;

 let s=document.createElement('style');
 s.id='sbHeaderShellCss';
 s.textContent=`:root{--sbLine:var(--line,#ffffff22);--sbP:var(--p,#101529);--sbP2:var(--p2,#17122d);--sbA:var(--accent,#22d3a6);--sbA2:var(--accent2,#7c3cff);--sbM:var(--muted,#b9c0d8)}
.sb-old-page-header-hidden{display:none!important}
#sbHeaderShell>.sb-h-extra-strip,#sbHeaderShell>*:not(.sb-h-identity):not(.sb-h-icons):not(.sb-h-search-wrap){display:none!important}
.sb-header-shell{border:1px solid var(--sbLine);border-radius:28px;background:linear-gradient(135deg,var(--sbP),var(--sbP2));box-shadow:0 18px 60px #0007;padding:14px 16px;margin:0 0 16px;display:grid;grid-template-columns:minmax(330px,410px) minmax(360px,1fr) minmax(300px,520px);gap:14px;align-items:center;color:#fff;position:relative;z-index:9998}
.sb-h-identity{border:1px solid #22d3a65c;border-radius:24px;padding:10px 12px;background:linear-gradient(135deg,#08101c88,#17122daa);display:grid;grid-template-columns:56px 1fr auto;grid-template-rows:auto auto;gap:8px 12px;align-items:center;min-height:86px}
.sb-h-logo{grid-row:1/3;width:56px;height:56px;border-radius:17px;overflow:hidden;background:linear-gradient(135deg,var(--sbA),var(--sbA2));display:grid;place-items:center;border:1px solid #ff2d8580}
.sb-h-logo img{width:100%;height:100%;object-fit:cover}
.sb-h-title{font-size:25px;font-weight:950;line-height:1;letter-spacing:-.03em}
.sb-h-meta{grid-column:2/3;display:grid;gap:2px;border-top:1px solid #ffffff22;padding-top:8px}
.sb-h-profile{font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-h-role{font-size:12px;color:#b9c0d8;font-weight:850}
.sb-h-account{grid-column:3/4;grid-row:2/3;border-radius:999px;background:#535a7c;color:#fff;text-decoration:none;font-weight:950;padding:12px 17px;align-self:center}
.sb-h-icons{display:flex;gap:7px;align-items:center;justify-content:center;flex-wrap:wrap}
.sb-h-ico,.sb-h-menu,.sb-h-search-btn{border:1px solid #ffffff24;border-radius:14px;background:#ffffff12;color:#fff;text-decoration:none;font-weight:950;min-width:38px;height:38px;display:grid;place-items:center;cursor:pointer;position:relative}
.sb-h-menu,.sb-h-search-btn{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017}
.sb-h-ico.current{outline:2px solid var(--sbA);background:#22d3a626}
.sb-h-count{position:absolute;right:-6px;top:-7px;min-width:18px;height:18px;padding:0 5px;border-radius:999px;background:#ff2d85;border:1px solid #ffffff85;color:#fff;font-size:10px;font-weight:950;display:none;align-items:center;justify-content:center;line-height:18px}
.sb-h-ico.has-count .sb-h-count{display:flex}
.sb-h-search{display:flex;gap:8px;border:1px solid #ffffff24;border-radius:999px;background:#0004;padding:8px 9px 8px 14px}
.sb-h-search input{flex:1;background:transparent;border:0;color:#fff;outline:0;font:inherit}
.sb-h-search-wrap{position:relative}
.sb-menu-scrim{position:fixed;inset:0;background:#0008;opacity:0;pointer-events:none;z-index:2147483600}
.sb-menu-scrim.open{opacity:1;pointer-events:auto}
.sb-menu-drawer{position:fixed;left:0;top:0;bottom:0;width:min(460px,94vw);background:linear-gradient(180deg,#101529,#17122d);border-right:1px solid #ffffff22;box-shadow:30px 0 90px #000c;z-index:2147483601;transform:translateX(-106%);transition:.22s;padding:18px;overflow:auto;color:#fff}
.sb-menu-drawer.open{transform:translateX(0)}
.sb-menu-head,.sb-search-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px}
.sb-menu-close,.sb-search-close{border:0;border-radius:999px;background:#414667;color:#fff;padding:9px 13px;font-weight:950;cursor:pointer}
.sb-menu-filter{width:100%;border:1px solid #ffffff24;border-radius:999px;background:#0004;color:#fff;outline:0;padding:12px 14px;margin:8px 0 12px}
.sb-menu-group{border:1px solid #ffffff18;border-radius:20px;background:#ffffff08;padding:12px;margin:12px 0}
.sb-menu-group.current{border-color:#22d3a670;box-shadow:0 0 0 2px #22d3a618}
.sb-menu-group h3{margin:0 0 9px;font-size:16px;display:flex;justify-content:space-between}
.sb-menu-link{display:grid;grid-template-columns:34px 1fr;gap:10px;align-items:center;text-decoration:none;color:#fff;border-radius:14px;background:#ffffff11;margin:8px 0;padding:11px}
.sb-menu-link.current{outline:2px solid var(--sbA);background:linear-gradient(135deg,#22d3a628,#7c3cff38)}
.sb-menu-link.current b:after{content:' Current';font-size:10px;margin-left:8px;border:1px solid #22d3a67a;border-radius:999px;padding:3px 7px;color:#baf7df}
.sb-menu-link small{display:block;color:var(--sbM);font-size:11px;margin-top:2px}
.sb-search-overlay{position:absolute;right:0;top:52px;width:min(920px,94vw);max-height:76vh;overflow:auto;border:1px solid #22d3a657;border-radius:22px;background:linear-gradient(180deg,#08101cfa,#120c26fa);box-shadow:0 30px 90px #000c;padding:12px;display:none;z-index:2147483599;color:#fff}
.sb-search-overlay.open{display:block}
.sb-note{padding:12px 14px;border-radius:18px;background:#ffb1421f;border:1px solid #ffb14252;color:#ffe7ad;font-weight:850;margin-top:8px}
@media(max-width:1180px){.sb-header-shell{grid-template-columns:1fr}.sb-h-icons{justify-content:flex-start}.sb-search-overlay{left:0;right:auto;width:94vw}}
@media(max-width:520px){.sb-h-identity{grid-template-columns:48px 1fr;grid-template-rows:auto auto auto}.sb-h-logo{width:48px;height:48px}.sb-h-title{font-size:22px}.sb-h-meta{grid-column:1/3}.sb-h-account{grid-column:1/3;grid-row:3;width:max-content}}`;
 document.head.appendChild(s);
}

function load(src){
 try{
  if(Array.from(document.scripts||[]).some(x=>String(x.src||'').includes(src)))return;
  let s=document.createElement('script');
  s.src=src+(src.includes('?')?'&':'?')+'v=7-12-180-header-route-truth-test';
  s.defer=true;
  document.head.appendChild(s);
 }catch(e){}
}

function helpers(){
 [
  'stream-bandit-theme-projector-v7-12-156.js',
  'stream-bandit-settings-global-v7-1-8.js',
  'stream-bandit-brand-logo-v7-12-12.js',
  'stream-bandit-menu-saves-count-v6-72-1.js',
  'stream-bandit-core-saves-v6-75.js',
  'live-readiness-search-supabase-fallback-v7-12-130.js'
 ].forEach(load);

 if(cur()===file(PROFILE))load('stream-bandit-profile-signin-v7-12-156.js');
}

function applyTheme(){
 try{
  if(window.StreamBanditThemeProjector&&window.StreamBanditThemeProjector.refresh)window.StreamBanditThemeProjector.refresh();
  else if(window.StreamBanditSettingsGlobal&&window.StreamBanditSettingsGlobal.refresh)window.StreamBanditSettingsGlobal.refresh();
 }catch(e){}
 document.documentElement.dataset.sbThemeReader='header-shell';
}

function hideOld(){
 document.querySelectorAll('header.head,.head').forEach(el=>{
  if(el.id!=='sbHeaderShell'&&!el.closest('#sbHeaderShell')&&!el.closest('#sbMenuDrawer')){
   el.classList.add('sb-old-page-header-hidden');
  }
 });
}

async function readProfileConfig(){
 if(window.StreamBanditSupabaseConfig&&window.StreamBanditSupabaseConfig.url&&window.StreamBanditSupabaseConfig.key){
  return {url:window.StreamBanditSupabaseConfig.url,key:window.StreamBanditSupabaseConfig.key};
 }

 if(window.StreamBanditShell&&typeof window.StreamBanditShell.config==='function'){
  let c=window.StreamBanditShell.config();
  if(c&&c.url&&c.key)return {url:c.url,key:c.key};
 }

 let txt=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());
 return {
  url:(txt.match(/SUPABASE_URL\s*=\s*['"]([^'"]+)/)||[])[1]||'',
  key:(txt.match(/SUPABASE_KEY\s*=\s*['"]([^'"]+)/)||[])[1]||''
 };
}

function profileFromRow(row,user,source){
 row=row||{};
 let meta=(user&&user.user_metadata)||{};
 let app=(user&&user.app_metadata)||{};

 let name=firstNonEmpty(
  row.display_name,row.displayName,row.channel_name,row.channelName,row.full_name,row.name,row.username,
  meta.display_name,meta.full_name,meta.name,meta.username,
  user&&user.email,
  'Stream Bandit Account'
 );

 let role=firstNonEmpty(row.role,row.account_role,row.user_role,row.permission,app.role,meta.role,'user');
 let username=firstNonEmpty(row.username,row.handle,meta.username,'');
 let avatar=firstNonEmpty(row.avatar_url,row.avatar,row.profile_image_url,row.image_url,row.channel_avatar_url,meta.avatar_url,'');
 let email=firstNonEmpty(row.email,user&&user.email,'');

 return {name:name,role:role,avatar:avatar,username:username,email:email,source:source||'sb_profiles'};
}

async function queryProfileRow(client,user){
 if(!client||!user)return null;

 let tries=[
  ['user_id',user.id],
  ['id',user.id],
  ['auth_user_id',user.id]
 ];

 if(user.email)tries.push(['email',user.email]);

 for(const t of tries){
  try{
   let r=await client.from('sb_profiles').select('*').eq(t[0],t[1]).maybeSingle();
   if(!r.error&&r.data)return r.data;
  }catch(e){}
 }

 return null;
}

async function loadSupabaseProfile(force){
 if(sbProfileLoading)return;

 let now=Date.now();
 if(!force&&sbProfileLastRead&&now-sbProfileLastRead<12000)return;

 sbProfileLoading=true;
 sbProfileLastRead=now;

 try{
  if(!window.supabase)throw new Error('Supabase SDK not ready');

  let cfg=await readProfileConfig();
  if(!cfg.url||!cfg.key)throw new Error('Missing Supabase config');

  if(!sbProfileClient)sbProfileClient=window.supabase.createClient(cfg.url,cfg.key);

  if(!sbProfileAuthWatch&&sbProfileClient.auth&&sbProfileClient.auth.onAuthStateChange){
   sbProfileAuthWatch=true;
   sbProfileClient.auth.onAuthStateChange(function(){
    setTimeout(()=>loadSupabaseProfile(true),120);
   });
  }

  let got=await sbProfileClient.auth.getUser();
  let user=got&&got.data&&got.data.user?got.data.user:null;

  if(!user){
   sbProfileCache={name:'Stream Bandit Account',role:'guest',avatar:'',source:'no-session'};
   try{localStorage.setItem('sb_header_profile_cache_v7_12_156',JSON.stringify(sbProfileCache));}catch(e){}
   updateAccount(false);
   return;
  }

  let row=await queryProfileRow(sbProfileClient,user);
  sbProfileCache=profileFromRow(row||{},user,row?'sb_profiles':'auth-user');

  try{
   localStorage.setItem('sb_header_profile_cache_v7_12_156',JSON.stringify(sbProfileCache));
   localStorage.setItem('sb_profile',JSON.stringify({
    display_name:sbProfileCache.name,
    username:sbProfileCache.username,
    role:sbProfileCache.role,
    avatar_url:sbProfileCache.avatar,
    email:sbProfileCache.email
   }));
   localStorage.setItem('streamBanditProfile',JSON.stringify({
    display_name:sbProfileCache.name,
    username:sbProfileCache.username,
    role:sbProfileCache.role,
    avatar_url:sbProfileCache.avatar,
    email:sbProfileCache.email
   }));
  }catch(e){}

  updateAccount(false);
 }catch(e){
  try{
   let raw=localStorage.getItem('sb_header_profile_cache_v7_12_156');
   if(raw)sbProfileCache=JSON.parse(raw);
  }catch(x){}
  updateAccount(false);
 }finally{
  sbProfileLoading=false;
 }
}

function accountState(){
 let out={name:'Stream Bandit Account',role:'guest',avatar:'',username:'',email:'',source:'default'};

 try{
  let raw=localStorage.getItem('streamBanditProfile')||localStorage.getItem('sb_profile')||localStorage.getItem('sb_header_profile_cache_v7_12_156')||'';
  if(raw){
   let p=JSON.parse(raw);
   out.name=firstNonEmpty(p.display_name,p.displayName,p.channel_name,p.channelName,p.username,p.name,out.name);
   out.role=firstNonEmpty(p.role,p.account_role,p.user_role,out.role);
   out.avatar=firstNonEmpty(p.avatar_url,p.avatar,p.profile_image_url,p.image_url,out.avatar);
   out.username=firstNonEmpty(p.username,p.handle,out.username);
   out.email=firstNonEmpty(p.email,out.email);
   out.source='local';
  }
 }catch(e){}

 try{
  let st=window.StreamBanditAuthProfile&&window.StreamBanditAuthProfile.getState&&window.StreamBanditAuthProfile.getState();
  if(st){
   let p=st.profile||st||{};
   out.name=firstNonEmpty(p.display_name,p.displayName,p.channel_name,p.channelName,p.username,p.name,out.name);
   out.role=firstNonEmpty(p.role,p.account_role,p.user_role,out.role);
   out.avatar=firstNonEmpty(p.avatar_url,p.avatar,p.profile_image_url,p.image_url,out.avatar);
   out.username=firstNonEmpty(p.username,p.handle,out.username);
   out.email=firstNonEmpty(p.email,out.email);
   out.source='auth-profile-helper';
  }
 }catch(e){}

 if(sbProfileCache){
  out.name=firstNonEmpty(sbProfileCache.name,out.name);
  out.role=firstNonEmpty(sbProfileCache.role,out.role);
  out.avatar=firstNonEmpty(sbProfileCache.avatar,out.avatar);
  out.username=firstNonEmpty(sbProfileCache.username,out.username);
  out.email=firstNonEmpty(sbProfileCache.email,out.email);
  out.source=sbProfileCache.source||'sb_profiles';
 }

 return out;
}

function header(){
 let icons=[
  ['☰','#','Menu','menu'],
  ['📬',ROUTES.formInbox,'Form Inbox'],
  ['🏗️',ROUTES.builder,'Web Builder'],
  ['🔎',ROUTES.search,'Search'],
  ['🔖',ROUTES.watchlist,'Watchlist','watchlist'],
  ['⭐',ROUTES.favourites,'Favourites','favourites'],
  ['👍',ROUTES.likes,'Likes','likes'],
  ['▶️',ROUTES.player1,'Player 1'],
  ['♿',ROUTES.accessibility,'Accessibility'],
  ['👤',ROUTES.profile,'Profile'],
  ['⚙️',ROUTES.settings,'Settings'],
  ['🚦',ROUTES.readiness,'Readiness']
 ];

 let a=accountState();

 return '<header id="sbHeaderShell" class="sb-header-shell"><div class="sb-h-identity"><div class="sb-h-logo"><img id="sbHeaderAvatar" data-sb-brand-logo src="'+esc(a.avatar||LOGO)+'" alt="Stream Bandit"></div><div class="sb-h-title">Stream Bandit</div><div class="sb-h-meta"><span id="sbHeaderProfileText" class="sb-h-profile">'+esc(short(a.name,26))+'</span><span id="sbHeaderRoleText" class="sb-h-role">Role: '+esc(short(a.role,24))+'</span></div><a id="sbHeaderAccountChip" class="sb-h-account" href="'+esc(route(PROFILE))+'">Account</a></div><nav class="sb-h-icons">'+icons.map(x=>x[3]==='menu'?'<button id="sbHeaderMenuBtn" class="sb-h-menu" type="button" title="Open menu">☰</button>':'<a class="sb-h-ico '+(same(x[1],cur())?'current':'')+'" href="'+esc(route(x[1]))+'" title="'+esc(x[2])+'" '+(x[3]?'data-sb-count-link="'+esc(x[3])+'"':'')+'>'+x[0]+(x[3]?'<span class="sb-h-count" data-sb-count="'+esc(x[3])+'">0</span>':'')+'</a>').join('')+'</nav><div class="sb-h-search-wrap"><div class="sb-h-search"><span>🔎</span><input id="sbHeaderSearchInput" placeholder="Search Stream Bandit"><button id="sbHeaderSearchBtn" class="sb-h-search-btn" type="button">Search</button></div><div id="sbSearchOverlay" class="sb-search-overlay"><div class="sb-search-top"><b>Search Stream Bandit</b><button id="sbSearchClose" class="sb-search-close" type="button">Close</button></div><div id="sbSearchResults"><div class="sb-note">Type to search everything.</div></div><div class="sb-note">Search includes movies, genres, channels, playlists, pages and policy agreements.</div></div></div></header>';
}

function ensure(){
 addCss();
 hideOld();

 let w=document.querySelector('.wrap')||document.body;

 if(!document.getElementById('sbHeaderShell')){
  w.insertAdjacentHTML('afterbegin',header());
 }

 cleanupExtraStrip();
 wire();
 updateAccount();
 updateCounts();
}

function cleanupExtraStrip(){
 let h=document.getElementById('sbHeaderShell');
 if(!h)return;

 Array.from(h.children).forEach(ch=>{
  if(!ch.classList.contains('sb-h-identity')&&!ch.classList.contains('sb-h-icons')&&!ch.classList.contains('sb-h-search-wrap')){
   ch.classList.add('sb-h-extra-strip');
  }
 });

 h.querySelectorAll('a,button,div,span,small,b').forEach(el=>{
  if(el.closest('.sb-h-identity')||el.closest('.sb-h-icons')||el.closest('.sb-h-search-wrap'))return;
  let t=(el.textContent||'').trim();
  if(t==='Account'||/Role:\s*/i.test(t)||/Stream Bandit Admin/i.test(t)){
   el.classList.add('sb-h-extra-strip');
  }
 });
}

function drawer(){
 if(!document.getElementById('sbMenuDrawer')){
  document.body.insertAdjacentHTML('beforeend','<div id="sbMenuScrim" class="sb-menu-scrim"></div><aside id="sbMenuDrawer" class="sb-menu-drawer"></aside>');
 }

 document.getElementById('sbMenuScrim').onclick=closeMenu;
 return document.getElementById('sbMenuDrawer');
}

function buildMenu(){
 let d=drawer();
 let q=(document.getElementById('sbMenuFilter')||{}).value||'';
 let n=q.toLowerCase();
 let rows=MENU.filter(r=>!n||(r.join(' ').toLowerCase().includes(n)));
 let groups=[...new Set(MENU.map(x=>x[0]))];
 let ci=MENU.find(r=>same(r[3],cur()));
 let cg=ci?ci[0]:'';

 let html='<div class="sb-menu-head"><b>Stream Bandit Menu</b><button id="sbMenuClose" class="sb-menu-close" type="button">Close</button></div><input id="sbMenuFilter" class="sb-menu-filter" placeholder="Filter menu" value="'+esc(q)+'">';

 groups.forEach(g=>{
  let list=rows.filter(r=>r[0]===g);
  if(!list.length)return;

  html+='<section class="sb-menu-group '+(g===cg?'current':'')+'"><h3>'+esc(g)+' <span>'+list.length+'</span></h3>';

  list.forEach(r=>{
   let is=same(r[3],cur());
   html+='<a class="sb-menu-link '+(is?'current':'')+'" href="'+esc(route(r[3]))+'"><span>'+r[1]+'</span><span><b>'+esc(r[2])+'</b><small>'+esc(r[4])+'</small></span></a>';
  });

  html+='</section>';
 });

 d.innerHTML=html;

 document.getElementById('sbMenuClose').onclick=closeMenu;
 document.getElementById('sbMenuFilter').oninput=buildMenu;
}

function openMenu(){
 buildMenu();
 drawer().classList.add('open');
 document.getElementById('sbMenuScrim').classList.add('open');

 setTimeout(()=>{
  let c=document.querySelector('#sbMenuDrawer .sb-menu-link.current');
  if(c)c.scrollIntoView({block:'center'});
 },80);
}

function closeMenu(){
 let d=document.getElementById('sbMenuDrawer');
 let s=document.getElementById('sbMenuScrim');

 if(d)d.classList.remove('open');
 if(s)s.classList.remove('open');
}

function search(q,force){
 q=String(q||'').trim();

 let ov=document.getElementById('sbSearchOverlay');
 let box=document.getElementById('sbSearchResults');

 if(q.length<2){
  ov.classList.remove('open');
  return;
 }

 ov.classList.add('open');
 box.innerHTML='<div class="sb-note">Loading full search...</div>';

 let fb=window.StreamBanditLiveReadinessSearchFallback;

 if(fb&&fb.search){
  fb.search(q,!!force);
  box.innerHTML='<div class="sb-note">Full search opened.</div>';
  return;
 }

 load('live-readiness-search-supabase-fallback-v7-12-130.js');

 setTimeout(()=>{
  if(window.StreamBanditLiveReadinessSearchFallback&&window.StreamBanditLiveReadinessSearchFallback.search){
   window.StreamBanditLiveReadinessSearchFallback.search(q,true);
   box.innerHTML='<div class="sb-note">Full search opened.</div>';
  }else{
   location.href=ROUTES.search+'?q='+encodeURIComponent(q);
  }
 },500);
}

function updateAccount(allowRead){
 let a=accountState();

 let n=document.getElementById('sbHeaderProfileText');
 let r=document.getElementById('sbHeaderRoleText');
 let img=document.getElementById('sbHeaderAvatar');
 let chip=document.getElementById('sbHeaderAccountChip');

 if(n)n.textContent=short(a.name,26);
 if(r)r.textContent='Role: '+short(a.role,24);
 if(img)img.src=a.avatar||LOGO;
 if(chip)chip.href=route(PROFILE);

 document.documentElement.dataset.sbHeaderProfileSource=a.source||'unknown';
 cleanupExtraStrip();

 if(allowRead!==false)setTimeout(()=>loadSupabaseProfile(false),0);
}

function localCount(keys){
 let best=0;

 keys.forEach(k=>{
  try{
   let v=localStorage.getItem(k);
   if(!v)return;

   let j=JSON.parse(v);

   if(Array.isArray(j))best=Math.max(best,j.length);
   else if(j&&typeof j==='object')best=Math.max(best,Object.keys(j).length);
  }catch(e){}
 });

 return best;
}

function helperCount(key){
 let candidates=[];

 try{
  let m=window.StreamBanditMenuSavesCount;
  if(m){
   if(m.counts)candidates.push(typeof m.counts==='function'?m.counts():m.counts);
   if(m.state)candidates.push(typeof m.state==='function'?m.state():m.state);
   if(m.getCounts)candidates.push(m.getCounts());
  }
 }catch(e){}

 try{
  let c=window.StreamBanditCoreSaves||window.StreamBanditCoreSavesV675;
  if(c){
   if(c.counts)candidates.push(typeof c.counts==='function'?c.counts():c.counts);
   if(c.state)candidates.push(typeof c.state==='function'?c.state():c.state);
  }
 }catch(e){}

 for(const obj of candidates){
  if(!obj||typeof obj!=='object')continue;

  let source=obj.counts&&typeof obj.counts==='object'?obj.counts:obj;
  let v=source[key]??source[key+'Count']??source[key+'_count'];

  if(key==='likes')v=v??source.liked??source.likedCount??source.liked_count;

  if(typeof v==='number')return v;
  if(Array.isArray(v))return v.length;
  if(v&&typeof v==='object')return Object.keys(v).length;
 }

 return null;
}

function updateCounts(){
 let map={
  watchlist:['streamBanditWatchlist','stream-bandit-watchlist','sb_watchlist','watchlist'],
  favourites:['streamBanditFavourites','stream-bandit-favourites','sb_favourites','favourites','favorites'],
  likes:['streamBanditLikes','stream-bandit-likes','sb_likes','likes','liked']
 };

 Object.keys(map).forEach(k=>{
  let v=helperCount(k);

  if(v==null)v=localCount(map[k]);

  document.querySelectorAll('[data-sb-count="'+k+'"]').forEach(el=>{
   el.textContent=String(v||0);
   let a=el.closest('.sb-h-ico');
   if(a)a.classList.toggle('has-count',Number(v)>0);
  });
 });
}

function wire(){
 let m=document.getElementById('sbHeaderMenuBtn');
 let i=document.getElementById('sbHeaderSearchInput');
 let b=document.getElementById('sbHeaderSearchBtn');
 let c=document.getElementById('sbSearchClose');
 let chip=document.getElementById('sbHeaderAccountChip');

 if(m&&!m.dataset.w){
  m.onclick=openMenu;
  m.dataset.w=1;
 }

 if(chip){
  chip.onclick=null;
  chip.href=route(PROFILE);
 }

 if(c&&!c.dataset.w){
  c.onclick=()=>document.getElementById('sbSearchOverlay').classList.remove('open');
  c.dataset.w=1;
 }

 if(i&&!i.dataset.w){
  i.oninput=()=>search(i.value,false);
  i.onkeydown=e=>{
   if(e.key==='Enter'){
    e.preventDefault();
    let q=i.value.trim();
    location.href=ROUTES.search+(q?'?q='+encodeURIComponent(q):'');
   }
  };
  i.dataset.w=1;
 }

 if(b&&!b.dataset.w){
  b.onclick=e=>{
   e.preventDefault();
   search(i.value,true);
  };
  b.dataset.w=1;
 }
}

function patch(){
 document.querySelectorAll('a[href]').forEach(a=>{
  let m=OLD[file(a.getAttribute('href'))];
  if(m)a.setAttribute('href',route(m));
 });

 let chip=document.getElementById('sbHeaderAccountChip');
 if(chip)chip.href=route(PROFILE);
}

function refresh(){
 applyTheme();
 ensure();
 patch();
 updateAccount();
 updateCounts();
 cleanupExtraStrip();
}

function boot(){
 helpers();
 applyTheme();
 ensure();
 drawer();
 patch();

 window.StreamBanditHeaderShell={
  version:VERSION,
  routes:ROUTES,
  menu:openMenu,
  openMenu,
  closeMenu,
  search,
  updateCounts,
  updateAccount,
  refresh,
  reloadProfile:function(){return loadSupabaseProfile(true);},
  state:()=>({
   version:VERSION,
   current:cur(),
   themeOwner:THEME_OWNER,
   account:accountState(),
   accountDestination:PROFILE,
   groupPlayRouteTruth:{
    collections:ROUTES.collections,
    player2:ROUTES.player2
   }
  })
 };

 document.documentElement.dataset.sbHeaderShell='v7-12-180-group-play-route-truth-test';

 setTimeout(()=>loadSupabaseProfile(true),150);
 setTimeout(refresh,300);
 setTimeout(()=>loadSupabaseProfile(true),900);
 setTimeout(refresh,900);
 setTimeout(refresh,1800);
 setInterval(refresh,5000);
 setInterval(()=>loadSupabaseProfile(false),30000);

 window.addEventListener('streambandit:profile-updated',()=>loadSupabaseProfile(true));
 window.addEventListener('streambandit:auth-changed',()=>loadSupabaseProfile(true));
 window.addEventListener('storage',e=>{
  if(e&&/profile|auth/i.test(e.key||''))updateAccount();
 });
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
