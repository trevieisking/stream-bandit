/* Stream Bandit Header Shell V7.12.297
   Global header, menu overlay, current route markers, search bridge, saved count badges and global account panel.
   Header Shell owns the site-wide account chip/avatar render.
   Profile Settings owns profile edits only and should trigger header refresh after saving sb_profiles.
   App/brand logo is separate from profile/account avatar.
   Account panel supports existing-user-only magic-link sign-in and sign-out.
   No public signup, no Auth Admin, no delete user actions.
*/
(function(){
'use strict';

const VERSION='V7.12.297 Header Shell / Account Chip Avatar Owner';
const THEME_OWNER='web-builder-theme-studio-controls-v7-8-9-test.html';
const LOGO='stream_bandit_original_logo_square_256.png';
const PROFILE='profile-settings-live-ready-v7-12-90-test.html';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
const PROFILE_CACHE_KEYS=['sb_header_profile_cache_v7_12_156','streamBanditProfile','sb_profile'];

let sbClient=null;
let authUser=null;
let authProfile=null;
let authBusy=false;
let authReady=false;

const ROUTES={
 home:'home-global-helpers-v7-4-4-test.html',library:'library-global-helpers-v7-4-8-test.html',details:'details-clean-machine-v7-12-38-test.html',player1:'player-one-global-helpers-v7-3-3-test.html',continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',watchHistory:'watch-history-global-helpers-v7-4-0-test.html',watchlist:'watchlist-clean-machine-v7-12-43-test.html',favourites:'favourites-clean-machine-v7-12-41-test.html',likes:'likes-clean-machine-v7-12-42-test.html',accessibility:'accessibility-clean-machine-v7-12-44-test.html',
 supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',genres:'genres-clean-machine-v7-12-45-test.html',search:'global-search-global-helpers-v7-4-9-test.html',about:'about-global-helpers-v7-4-7-test.html',
 submit:'submit-video-clean-machine-v7-12-79-test.html',rules:'rules-clean-machine-v7-12-82-test.html',review:'review-queue-clean-machine-v7-12-80-publish-test.html',
 playlists:'playlists-global-helpers-v7-5-2-test.html',channels:'channels-global-helpers-v7-5-3-test.html',myChannel:'my-channel-clean-machine-v7-12-47-test.html',collections:'collections-clean-machine-v7-12-51-test.html',player2:'player-2-clean-machine-v7-12-58-test.html',
 settings:'settings-platform-control-hub-v7-12-85-test.html',theme:THEME_OWNER,profile:PROFILE,builder:'web-builder-account-control-hub-v7-12-263-test.html',
 policyCentre:'policy-documents-centre-v7-12-119-test.html',policyReader:'policy-reader-v7-12-119-test.html?policy=terms',policyAdmin:'policy-admin-documents-v7-12-120-test.html?policy=terms',
 admin:'admin-centre-command-deck-v7-12-121-test.html',readiness:'live-readiness-global-helpers-v7-10-2-test.html',registry:'all-pages-version-registry-v7-12-122-current-routes-test.html',checklist:'test-checklist-global-helpers-v7-10-5-test.html',tools:'tools-page-original-global-pass-v7-12-136-test.html',health:'health-check-global-helpers-v7-10-6-test.html',mux:'mux-manager-global-helpers-v7-10-7-test.html',storage:'storage-prep-global-helpers-v7-10-8-test.html',backup:'backup-safety-global-helpers-v7-10-9-test.html',
 formInbox:'web-builder-form-submissions-v7-12-94-test.html?page=test-page',formAdvanced:'web-builder-form-save-v7-12-94-test.html?page=test-page',oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',platformControl:'settings-platform-control-hub-v7-12-85-test.html',helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',brandHelper:'brand-logo-helper-responsive-v7-12-20-test.html',faviconBuilder:'favicon-app-icon-builder-v7-12-15-test.html',pagesManager:'web-builder-pages-manager-v7-12-111-test.html',preview:'web-builder-shared-style-preview-v7-12-117-test.html?page=test-page',
 userDashboard:'user-management-dashboard-v7-11-2-test.html',pricing:'plans-pricing-feature-shop-v7-11-3-test.html',permissions:'permissions-matrix-user-management-v7-11-4-test.html'
};

const OLD={
 'collections-clean-machine-v7-12-48-test.html':ROUTES.collections,'collections-clean-machine-v7-12-49-test.html':ROUTES.collections,'collections-clean-machine-v7-12-50-test.html':ROUTES.collections,'collections-global-helpers-v7-5-1-test.html':ROUTES.collections,'collections-browse-shell-v6-46-1-test.html':ROUTES.collections,
 'player-2-progress-helper-v6-78-9-4-test.html':ROUTES.player2,'player-two-global-helpers-v7-3-4-test.html':ROUTES.player2,'player-2-clean-machine-v7-12-57-test.html':ROUTES.player2,
 'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,'all-pages-version-registry-v7-10-3-full-test.html':ROUTES.registry,'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,
 'web-builder-live-studio-v7-12-116-test.html':ROUTES.builder,'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,
 'stream-bandit-clean-machine-menu-v7-12-40-test.html':ROUTES.registry,'stream-bandit-route-pointer-machine-v7-12-36-test.html':ROUTES.registry,'platform-control-tower-route-guard-proof-v7-12-33-test.html':ROUTES.health,'final-shell-navigation-global-helpers-v7-5-9-test.html':ROUTES.helperShell,'stream-bandit-one-machine-v7-12-72-test.html':ROUTES.oneMachine,'platform-control-centre-admin-v7-12-59-test.html':ROUTES.platformControl,
 'brand-image-helper-v7-12-20-test.html':ROUTES.brandHelper,'brand-logo-helper-responsive-v7-12-20-test.html':ROUTES.brandHelper,'favicon-app-icon-builder-v7-12-15-test.html':ROUTES.faviconBuilder,
 'user-dashboard-concept-v6-68-test.html':ROUTES.userDashboard,'plans-pricing-matrix-v6-69-test.html':ROUTES.pricing,'permissions-matrix-v6-70-test.html':ROUTES.permissions
};

const MENU=[
 ['Watch','🏠','Home',ROUTES.home,'Home'],['Watch','🎞️','Library',ROUTES.library,'Library'],['Watch','🎬','Details',ROUTES.details,'Details'],['Watch','▶️','Player 1',ROUTES.player1,'Single-title player'],['Watch','⏯️','Continue Watching',ROUTES.continueWatching,'Resume'],['Watch','🕘','Watch History',ROUTES.watchHistory,'History'],['Watch','🔖','Watchlist',ROUTES.watchlist,'Watchlist'],['Watch','⭐','Favourites',ROUTES.favourites,'Favourites'],['Watch','👍','Likes',ROUTES.likes,'Likes'],['Watch','♿','Accessibility',ROUTES.accessibility,'Player comfort'],
 ['Browse','🟢','Supabase Library Editor',ROUTES.supabaseLibrary,'Library editor'],['Browse','🏷️','Genres',ROUTES.genres,'Genres'],['Browse','🔎','Global Search',ROUTES.search,'Full search'],['Browse','ℹ️','About',ROUTES.about,'About'],
 ['Creator','⬆️','Submit Video',ROUTES.submit,'Submit'],['Creator','📜','Rules',ROUTES.rules,'Rules'],['Creator','🧾','Review Queue',ROUTES.review,'Review'],
 ['Group Play','📃','Playlists',ROUTES.playlists,'Playlists'],['Group Play','📺','Channels',ROUTES.channels,'Channels'],['Group Play','📡','My Channel',ROUTES.myChannel,'My Channel'],['Group Play','🧺','Collections',ROUTES.collections,'Collections'],['Group Play','▶️▶️','Player 2',ROUTES.player2,'Group player'],
 ['Settings','⚙️','Settings Hub',ROUTES.settings,'Settings'],['Settings','🎨','Theme Studio',ROUTES.theme,'Theme owner'],['Settings','👤','Profile Settings',ROUTES.profile,'Profile'],['Settings','🏗️','Web Builder',ROUTES.builder,'Builder'],
 ['Policy','📚','Policy Documents',ROUTES.policyCentre,'Policy centre'],['Policy','📖','Policy Proof',ROUTES.policyReader,'Published policy'],['Policy','🧾','Policy Admin Editor',ROUTES.policyAdmin,'Policy admin'],
 ['Admin','🛠️','Admin Centre',ROUTES.admin,'Admin'],['Admin','🚦','Live Readiness',ROUTES.readiness,'Readiness'],['Admin','📋','Current Routes Registry',ROUTES.registry,'Registry'],['Admin','🧪','Test Checklist',ROUTES.checklist,'Testing'],['Admin','🧰','Tools',ROUTES.tools,'Tools'],['Admin','✅','Health Check',ROUTES.health,'Health'],['Admin','🎥','Mux Manager',ROUTES.mux,'Mux'],['Admin','🪣','Storage Prep',ROUTES.storage,'Storage'],['Admin','🛡️','Backup / Safety',ROUTES.backup,'Backup'],
 ['Owner','📬','Form Inbox',ROUTES.formInbox,'Form inbox'],['Owner','🧾','Advanced Form',ROUTES.formAdvanced,'Advanced form'],['Owner','🧠','One Machine',ROUTES.oneMachine,'Diagnostics'],['Owner','🎛️','Platform Control Centre',ROUTES.platformControl,'Controls'],['Owner','🧭','Final Shell Navigation',ROUTES.helperShell,'Helper shell'],['Owner','🗂️','Brand / App Icons',ROUTES.brandIcons,'Brand tools'],['Owner','🖼️','Brand Image Helper',ROUTES.brandHelper,'Brand helper'],['Owner','🦌','Favicon / App Icon Builder',ROUTES.faviconBuilder,'Icon builder'],['Owner','🧭','Pages Manager',ROUTES.pagesManager,'Pages'],['Owner','👁️','Published Preview',ROUTES.preview,'Preview'],
 ['User Management','👥','User Dashboard',ROUTES.userDashboard,'Users'],['User Management','💳','Pricing Matrix',ROUTES.pricing,'Pricing'],['User Management','🔐','Permissions Matrix',ROUTES.permissions,'Permissions']
];

function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function file(v){return String(v||'').split('/').pop().split('?')[0].split('#')[0];}
function page(){try{return new URL(location.href).searchParams.get('page')||'test-page';}catch(e){return 'test-page';}}
function route(u){let r=OLD[file(u)]||String(u||'');return r.replace('page=test-page','page='+encodeURIComponent(page()));}
function cur(){return file(location.pathname)||'index.html';}
function same(a,b){return file(route(a))===file(route(b));}
function short(s,n){s=String(s||'').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s;}

function load(src){
 try{
  if(Array.from(document.scripts||[]).some(x=>String(x.src||'').includes(src)))return;
  let s=document.createElement('script');
  s.src=src+(src.includes('?')?'&':'?')+'v=7-12-297';
  s.defer=true;
  document.head.appendChild(s);
 }catch(e){}
}

function helpers(){
 ['stream-bandit-theme-projector-v7-12-156.js','stream-bandit-settings-global-v7-1-8.js','stream-bandit-brand-logo-v7-12-12.js','stream-bandit-menu-saves-count-v6-72-1.js','stream-bandit-core-saves-v6-75.js','live-readiness-search-supabase-fallback-v7-12-130.js'].forEach(load);
}

async function loadSupabaseSdk(){
 if(window.supabase)return window.supabase;
 await new Promise((res,rej)=>{
  let s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload=res;
  s.onerror=rej;
  document.head.appendChild(s);
 });
 return window.supabase;
}

async function sb(){
 if(sbClient)return sbClient;
 await loadSupabaseSdk();
 sbClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 return sbClient;
}

function readCache(k){
 try{
  let raw=localStorage.getItem(k);
  return raw?JSON.parse(raw):null;
 }catch(e){
  return null;
 }
}

function clearProfileCache(){
 PROFILE_CACHE_KEYS.forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
}

function normalProfile(p){
 if(!p||typeof p!=='object')return null;
 return {
  id:p.id||p.auth_user_id||'',
  auth_user_id:p.auth_user_id||p.id||'',
  email:p.email||'',
  username:p.username||'',
  display_name:p.display_name||p.displayName||'',
  displayName:p.displayName||p.display_name||'',
  channel_name:p.channel_name||p.channelName||'',
  channelName:p.channelName||p.channel_name||'',
  role:p.role||p.account_role||p.user_role||'user',
  can_submit:!!p.can_submit,
  avatar_url:p.avatar_url||p.avatar||p.profile_image_url||p.image_url||'',
  avatar:p.avatar||p.avatar_url||p.profile_image_url||p.image_url||'',
  profile_image_url:p.profile_image_url||p.avatar_url||p.avatar||p.image_url||'',
  banner_url:p.banner_url||p.banner||'',
  updated_at:p.updated_at||p.updatedAt||''
 };
}

function cacheProfile(p){
 p=normalProfile(p);
 if(!p||!p.id)return;
 if(authUser&&String(p.id)!==String(authUser.id))return;
 PROFILE_CACHE_KEYS.forEach(k=>{try{localStorage.setItem(k,JSON.stringify(p));}catch(e){}});
 try{localStorage.setItem('streamBanditProfileUpdatedAt',new Date().toISOString());}catch(e){}
}

function cachedProfile(){
 for(const k of PROFILE_CACHE_KEYS){
  let p=normalProfile(readCache(k));
  if(!p||!p.id)continue;

  if(authUser&&String(p.id)!==String(authUser.id)){
   try{localStorage.removeItem(k);}catch(e){}
   continue;
  }

  return p;
 }
 return null;
}

function profile(){
 let out={name:'Stream Bandit Account',role:'guest',avatar:'',id:'',email:''};

 if(authProfile){
  let p=normalProfile(authProfile);
  out.id=p.id||'';
  out.email=authUser&&authUser.email?authUser.email:p.email||'';
  out.name=p.display_name||p.displayName||p.channel_name||p.channelName||p.username||out.email||out.name;
  out.role=p.role||out.role;
  out.avatar=p.avatar_url||p.avatar||p.profile_image_url||out.avatar;
  return out;
 }

 if(authUser){
  out.id=authUser.id||'';
  out.email=authUser.email||'';
  out.name=authUser.email||authUser.id||out.name;
  out.role='signed in';

  let p=cachedProfile();
  if(p&&String(p.id)===String(authUser.id)){
   out.name=p.display_name||p.displayName||p.channel_name||p.channelName||p.username||out.name;
   out.role=p.role||out.role;
   out.avatar=p.avatar_url||p.avatar||p.profile_image_url||out.avatar;
  }

  return out;
 }

 let p=cachedProfile();

 if(p&&!authReady){
  out.id=p.id||'';
  out.email=p.email||'';
  out.name=p.display_name||p.displayName||p.channel_name||p.channelName||p.username||p.email||out.name;
  out.role=p.role||'signed in';
  out.avatar=p.avatar_url||p.avatar||p.profile_image_url||'';
 }

 return out;
}

function accountChipInner(p,signed){
 if(!signed)return 'Account';

 let avatar=p&&p.avatar?'<img src="'+esc(p.avatar)+'" alt="">':'👤';
 return '<span class="sb-h-account-avatar" data-sb-account-avatar-user-id="'+esc(p&&p.id||'')+'">'+avatar+'</span><span>Account ✓</span>';
}

function applyTheme(){
 try{
  let t=null;
  if(window.StreamBanditThemeProjector&&window.StreamBanditThemeProjector.getTheme)t=window.StreamBanditThemeProjector.getTheme();
  if(!t){
   let raw=localStorage.getItem('streamBanditTheme')||localStorage.getItem('streamBanditThemeV7')||'';
   if(raw)t=JSON.parse(raw);
  }
  if(!t||typeof t!=='object')return;
  let root=document.documentElement;
  [['--bg','bg'],['--p','p'],['--p2','p2'],['--line','line'],['--muted','muted'],['--accent','accent'],['--accent2','accent2'],['--btnText','btnText']].forEach(x=>{if(t[x[1]])root.style.setProperty(x[0],t[x[1]]);});
  if(t.fontScale)root.style.setProperty('--fontScale',String(t.fontScale));
 }catch(e){}
}

function hideOld(){
 document.querySelectorAll('header.head,.head').forEach(el=>{
  if(el.id!=='sbHeaderShell'&&!el.closest('#sbHeaderShell')&&!el.closest('#sbMenuDrawer'))el.classList.add('sb-old-page-header-hidden');
 });
}

function css(){
 if(document.getElementById('sbHeaderShellCss'))return;
 let s=document.createElement('style');
 s.id='sbHeaderShellCss';
 s.textContent=`
:root{--sbLine:var(--line,#ffffff22);--sbP:var(--p,#101529);--sbP2:var(--p2,#17122d);--sbA:var(--accent,#22d3a6);--sbA2:var(--accent2,#7c3cff);--sbM:var(--muted,#b9c0d8)}
.sb-old-page-header-hidden{display:none!important}
.sb-header-shell{border:1px solid var(--sbLine);border-radius:28px;background:linear-gradient(135deg,var(--sbP),var(--sbP2));box-shadow:0 18px 60px #0007;padding:14px 16px;margin:0 0 16px;display:grid;grid-template-columns:minmax(330px,410px) minmax(360px,1fr) minmax(300px,520px);gap:14px;align-items:center;color:#fff;position:relative;z-index:9998}
.sb-h-identity{border:1px solid #22d3a65c;border-radius:24px;padding:10px 12px;background:linear-gradient(135deg,#08101c88,#17122daa);display:grid;grid-template-columns:56px 1fr auto;grid-template-rows:auto auto;gap:8px 12px;align-items:center;min-height:86px}
.sb-h-logo{grid-row:1/3;width:56px;height:56px;border-radius:17px;overflow:hidden;background:linear-gradient(135deg,var(--sbA),var(--sbA2));display:grid;place-items:center;border:1px solid #ff2d8580}
.sb-h-logo img{width:100%;height:100%;object-fit:cover}
.sb-h-title{font-size:25px;font-weight:950;line-height:1;letter-spacing:-.03em}
.sb-h-meta{grid-column:2/3;display:grid;gap:2px;border-top:1px solid #ffffff22;padding-top:8px}
.sb-h-profile{font-size:13px;font-weight:900;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sb-h-role{font-size:12px;color:#b9c0d8;font-weight:850}
.sb-h-account{grid-column:3/4;grid-row:2/3;border:0;border-radius:999px;background:#535a7c;color:#fff;text-decoration:none;font-weight:950;padding:9px 13px;align-self:center;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;white-space:nowrap}
.sb-h-account.signed-in{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017}
.sb-h-account-avatar{width:28px;height:28px;border-radius:999px;overflow:hidden;border:1px solid #ffffff66;background:#0005;display:inline-grid;place-items:center;flex:0 0 auto;font-size:15px;line-height:1}
.sb-h-account-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.sb-h-icons{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.sb-h-ico,.sb-h-menu{width:43px;height:43px;border-radius:15px;border:1px solid #ffffff1f;background:#ffffff12;color:#fff;text-decoration:none;font-weight:950;display:grid;place-items:center;position:relative;cursor:pointer}
.sb-h-ico.current{outline:2px solid var(--sbA);background:#22d3a626}
.sb-h-count{position:absolute;right:-6px;top:-7px;border:1px solid #000;background:#ff2d85;color:#fff;border-radius:999px;min-width:19px;height:19px;font-size:11px;display:grid;place-items:center}
.sb-h-search-wrap{position:relative}
.sb-h-search{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;background:#0006;border:1px solid #ffffff24;border-radius:999px;padding:8px 10px}
.sb-h-search input{border:0;background:transparent;color:#fff;outline:none;font:inherit;min-width:0}
.sb-h-search-btn,.sb-search-close,.sb-menu-close,.sb-account-close{border:0;border-radius:999px;background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017;font-weight:950;padding:9px 12px;cursor:pointer}
.sb-search-overlay{position:absolute;left:0;right:0;top:54px;display:none;background:#070a14f8;border:1px solid #ffffff22;border-radius:20px;padding:12px;box-shadow:0 22px 70px #0009;z-index:99999}
.sb-search-overlay.open{display:block}
.sb-search-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.sb-result{display:block;text-decoration:none;color:#fff;border:1px solid #ffffff14;border-radius:14px;padding:10px;margin:7px 0;background:#ffffff0e}
.sb-result small{color:var(--sbM)}
.sb-note{border:1px solid #ffb14255;background:#ffb1421f;color:#ffe7ad;border-radius:14px;padding:10px;font-weight:850}
.sb-menu-scrim{position:fixed;inset:0;background:#0008;z-index:10000;display:none}
.sb-menu-scrim.open{display:block}
.sb-menu-drawer{position:fixed;top:0;left:0;bottom:0;width:min(420px,92vw);background:#070a14;z-index:10001;transform:translateX(-105%);transition:transform .2s ease;padding:14px;overflow:auto;border-right:1px solid #ffffff22}
.sb-menu-drawer.open{transform:translateX(0)}
.sb-menu-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.sb-menu-filter{width:100%;border:1px solid #ffffff22;border-radius:14px;background:#0006;color:#fff;padding:12px;margin-bottom:12px}
.sb-menu-group{border:1px solid #ffffff18;border-radius:18px;padding:10px;margin-bottom:10px;background:#ffffff08}
.sb-menu-group.current{border-color:#22d3a666}
.sb-menu-group h3{margin:0 0 8px;display:flex;justify-content:space-between}
.sb-menu-link{display:grid;grid-template-columns:38px 1fr;gap:10px;text-decoration:none;color:#fff;border-radius:14px;padding:9px;margin:5px 0;background:#ffffff0a}
.sb-menu-link.current{background:#22d3a624;outline:1px solid #22d3a666}
.sb-menu-link small{display:block;color:var(--sbM)}
.sb-account-panel{position:absolute;right:14px;top:95px;width:min(620px,94vw);display:none;background:#070a14fb;border:1px solid #ffffff22;border-radius:24px;padding:14px;box-shadow:0 24px 80px #000a;z-index:999999}
.sb-account-panel.open{display:block}
.sb-account-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.sb-account-grid{display:grid;grid-template-columns:160px 1fr;gap:14px}
.sb-account-avatar{width:132px;height:132px;border-radius:28px;border:1px solid #ffffff24;background:linear-gradient(135deg,var(--sbA),var(--sbA2));overflow:hidden;display:grid;place-items:center;font-size:54px}
.sb-account-avatar img{width:100%;height:100%;object-fit:cover}
.sb-account-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.sb-account-actions button,.sb-account-actions a{border:0;border-radius:999px;background:#535a7c;color:#fff;text-decoration:none;font-weight:950;padding:10px 12px;cursor:pointer}
.sb-account-actions .primary{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017}
.sb-account-actions .hot{background:linear-gradient(135deg,#ff2d85,var(--sbA2));color:#fff}
.sb-account-actions .danger{background:linear-gradient(135deg,#ff4d6d,var(--sbA2));color:#fff}
.sb-account-panel input{width:100%;border:1px solid #ffffff24;border-radius:14px;background:#0006;color:#fff;padding:11px}
.sb-account-good{border:1px solid #22d3a666;background:#22d3a624;color:#baf7df;border-radius:14px;padding:10px;font-weight:850}
.sb-account-note{border:1px solid #ffb14266;background:#ffb14224;color:#ffe7ad;border-radius:14px;padding:10px;font-weight:850}
body.sb-menu-open{overflow:hidden}
@media(max-width:1080px){.sb-header-shell{grid-template-columns:1fr}.sb-h-icons{justify-content:flex-start}.sb-h-account{padding:9px 13px;width:auto}.sb-account-panel{right:6px;left:6px;width:auto}.sb-account-grid{grid-template-columns:1fr}.sb-account-avatar{width:100%;height:150px}}
`;
 document.head.appendChild(s);
}

function header(){
 let p=profile();
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

 return '<header id="sbHeaderShell" class="sb-header-shell" data-sb-logo-ownership="brand-only" data-sb-profile-ownership="account-only">'+
  '<div class="sb-h-identity">'+
   '<div class="sb-h-logo"><img id="sbHeaderBrandLogo" data-sb-brand-logo src="'+esc(LOGO)+'" alt="Stream Bandit app logo"></div>'+
   '<div class="sb-h-title">Stream Bandit</div>'+
   '<div class="sb-h-meta"><span id="sbHeaderProfileText" class="sb-h-profile">'+esc(short(p.name,26))+'</span><span id="sbHeaderRoleText" class="sb-h-role">Role: '+esc(short(p.role,24))+'</span></div>'+
   '<button id="sbHeaderAccountChip" class="sb-h-account" type="button">'+accountChipInner(p,!!authUser)+'</button>'+
  '</div>'+
  '<nav class="sb-h-icons">'+icons.map(x=>x[3]==='menu'?'<button id="sbHeaderMenuBtn" class="sb-h-menu" type="button" title="Open menu">☰</button>':'<a class="sb-h-ico '+(same(x[1],cur())?'current':'')+'" href="'+esc(route(x[1]))+'" title="'+esc(x[2])+'" '+(x[3]?'data-sb-count-link="'+esc(x[3])+'"':'')+'>'+x[0]+(x[3]?'<span class="sb-h-count" data-sb-count="'+esc(x[3])+'">0</span>':'')+'</a>').join('')+'</nav>'+
  '<div class="sb-h-search-wrap"><div class="sb-h-search"><span>🔎</span><input id="sbHeaderSearchInput" placeholder="Search Stream Bandit"><button id="sbHeaderSearchBtn" class="sb-h-search-btn" type="button">Search</button></div><div id="sbSearchOverlay" class="sb-search-overlay"><div class="sb-search-top"><b>Search Stream Bandit</b><button id="sbSearchClose" class="sb-search-close" type="button">Close</button></div><div id="sbSearchResults"><div class="sb-note">Type to search movies, genres, channels, playlists, pages and policies.</div></div></div></div>'+
 '</header>';
}

function ensure(){
 css();
 hideOld();
 let w=document.querySelector('.wrap')||document.body;
 if(!document.getElementById('sbHeaderShell'))w.insertAdjacentHTML('afterbegin',header());
 wire();
 updateAccount();
 updateCounts();
 patch();
 try{if(window.StreamBanditBrandLogo&&window.StreamBanditBrandLogo.refresh)window.StreamBanditBrandLogo.refresh();}catch(e){}
}

function drawer(){
 if(!document.getElementById('sbMenuDrawer'))document.body.insertAdjacentHTML('beforeend','<div id="sbMenuScrim" class="sb-menu-scrim"></div><aside id="sbMenuDrawer" class="sb-menu-drawer"></aside>');
 document.getElementById('sbMenuScrim').onclick=closeMenu;
 return document.getElementById('sbMenuDrawer');
}

function buildMenu(){
 let d=drawer();
 let q=(document.getElementById('sbMenuFilter')||{}).value||'';
 let n=q.toLowerCase();
 let rows=MENU.filter(r=>!n||r.join(' ').toLowerCase().includes(n));
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
 document.body.classList.add('sb-menu-open');
 setTimeout(()=>{
  let c=document.querySelector('#sbMenuDrawer .sb-menu-link.current');
  if(c)c.scrollIntoView({block:'center'});
 },80);
}

function closeMenu(){
 let d=document.getElementById('sbMenuDrawer'),s=document.getElementById('sbMenuScrim');
 if(d)d.classList.remove('open');
 if(s)s.classList.remove('open');
 document.body.classList.remove('sb-menu-open');
}

function search(q,force){
 q=String(q||'').trim();
 let ov=document.getElementById('sbSearchOverlay'),box=document.getElementById('sbSearchResults');
 if(!ov||!box)return;
 if(q.length<2){ov.classList.remove('open');return;}
 closeAccountPanel();
 ov.classList.add('open');
 let n=q.toLowerCase();
 let rows=MENU.filter(r=>r[2].toLowerCase().includes(n)||r[0].toLowerCase().includes(n)||r[4].toLowerCase().includes(n));
 box.innerHTML=(rows.length?rows.slice(0,20).map(r=>'<a class="sb-result" href="'+esc(route(r[3]))+'"><b>'+esc(r[2])+'</b><small> '+esc(r[0])+' · '+esc(r[4])+'</small></a>').join(''):'<div class="sb-note">No page matches. Press Enter for full search.</div>')+'<div class="sb-note">Search covers movies, genres, channels, playlists, pages and policy agreements.</div>';
 if(force&&window.StreamBanditLiveReadinessSearchFallback&&window.StreamBanditLiveReadinessSearchFallback.search){
  try{window.StreamBanditLiveReadinessSearchFallback.search(q,true);}catch(e){}
 }
}

function accountPanel(){
 let p=profile();
 let signed=!!authUser;
 let avatar=p.avatar?'<img id="sbAccountAvatar" data-sb-profile-avatar src="'+esc(p.avatar)+'" alt="Account avatar">':'👤';

 return '<div id="sbAccountPanel" class="sb-account-panel">'+
  '<div class="sb-account-top"><b>Stream Bandit Account</b><button id="sbAccountClose" class="sb-account-close" type="button">Close</button></div>'+
  '<div class="sb-account-grid">'+
   '<div>'+
    '<div id="sbAccountAvatarBox" class="sb-account-avatar">'+avatar+'</div>'+
    '<p><b id="sbAccountName">'+esc(p.name)+'</b></p>'+
    '<p id="sbAccountRole">Role: '+esc(p.role)+'</p>'+
    '<p id="sbAccountEmail">'+esc(authUser&&authUser.email?authUser.email:'Not signed in')+'</p>'+
    '<div id="sbAccountStatus" class="'+(signed?'sb-account-good':'sb-account-note')+'">'+(signed?'Signed in.':'Existing users can request a sign-in link. Public signup is locked.')+'</div>'+
   '</div>'+
   '<div>'+
    '<label>Email address</label>'+
    '<input id="sbAccountEmailInput" type="email" autocomplete="email" placeholder="you@example.com" value="'+esc(authUser&&authUser.email?authUser.email:'')+'">'+
    '<div class="sb-account-actions">'+
     '<button id="sbAccountSend" class="primary" type="button">Send Sign-in Link</button>'+
     '<button id="sbAccountRefresh" type="button">Refresh</button>'+
     '<button id="sbAccountSignOut" class="danger" type="button">Sign Out</button>'+
     '<a class="hot" href="'+esc(route(PROFILE))+'">Profile Settings</a>'+
    '</div>'+
    '<div class="sb-account-note">Existing users only: sign-in links use shouldCreateUser false. The site-wide account avatar is read from the signed-in user’s sb_profiles.avatar_url. App branding is controlled by Brand / App Icons.</div>'+
   '</div>'+
  '</div>'+
 '</div>';
}

function openAccountPanel(){
 closeMenu();
 let existing=document.getElementById('sbAccountPanel');
 if(!existing){
  let h=document.getElementById('sbHeaderShell');
  if(h)h.insertAdjacentHTML('beforeend',accountPanel());
  wireAccountPanel();
 }else{
  existing.classList.add('open');
  updateAccountPanel();
 }
 let p=document.getElementById('sbAccountPanel');
 if(p){
  p.classList.add('open');
  setTimeout(()=>{
   let e=document.getElementById('sbAccountEmailInput');
   if(e&&!authUser)e.focus();
  },80);
 }
 refreshAuth(false,true);
}

function closeAccountPanel(){
 let p=document.getElementById('sbAccountPanel');
 if(p)p.classList.remove('open');
}

function setAccountStatus(msg,warn){
 let el=document.getElementById('sbAccountStatus');
 if(el){
  el.textContent=msg;
  el.className=warn?'sb-account-note':'sb-account-good';
 }
}

function updateAccountPanel(){
 let p=profile();
 let n=document.getElementById('sbAccountName'),r=document.getElementById('sbAccountRole'),e=document.getElementById('sbAccountEmail'),inp=document.getElementById('sbAccountEmailInput'),box=document.getElementById('sbAccountAvatarBox');

 if(n)n.textContent=p.name;
 if(r)r.textContent='Role: '+p.role;
 if(e)e.textContent=authUser&&authUser.email?authUser.email:'Not signed in';
 if(inp&&authUser&&authUser.email)inp.value=authUser.email;

 if(box){
  box.innerHTML=p.avatar?'<img id="sbAccountAvatar" data-sb-profile-avatar data-sb-profile-avatar-user-id="'+esc(p.id||'')+'" src="'+esc(p.avatar)+'" alt="Account avatar">':'👤';
 }
}

function wireAccountPanel(){
 let c=document.getElementById('sbAccountClose'),s=document.getElementById('sbAccountSend'),r=document.getElementById('sbAccountRefresh'),o=document.getElementById('sbAccountSignOut'),inp=document.getElementById('sbAccountEmailInput');

 if(c)c.onclick=closeAccountPanel;
 if(s)s.onclick=sendSignInLink;
 if(r)r.onclick=()=>refreshAuth(true,true);
 if(o)o.onclick=signOut;
 if(inp)inp.onkeydown=e=>{if(e.key==='Enter')sendSignInLink();};
}

async function refreshAuth(verbose,force){
 if(authBusy&&!force)return authUser;

 authBusy=true;

 try{
  let previousId=authUser&&authUser.id?String(authUser.id):'';
  let client=await sb();
  let session=await client.auth.getSession();

  authUser=session.data&&session.data.session?session.data.session.user:null;
  authReady=true;

  if(!authUser){
   authProfile=null;
   clearProfileCache();
   if(verbose)setAccountStatus('Signed out. Existing users can request a sign-in link.',true);
   updateAccount();
   updateAccountPanel();
   authBusy=false;
   return null;
  }

  if(previousId&&String(authUser.id)!==previousId){
   authProfile=null;
   clearProfileCache();
  }

  let pr=await client.from('sb_profiles').select('id,username,display_name,channel_name,avatar_url,banner_url,role,can_submit,updated_at').eq('id',authUser.id).maybeSingle();

  if(pr.error)throw pr.error;

  authProfile=normalProfile(pr.data)||null;

  if(authProfile)cacheProfile(authProfile);
  else clearProfileCache();

  if(verbose)setAccountStatus('Signed in as '+(authUser.email||authUser.id)+'.',false);

  updateAccount();
  updateAccountPanel();

  authBusy=false;
  return authUser;
 }catch(e){
  if(verbose)setAccountStatus('Account check failed: '+(e.message||e),true);
  authBusy=false;
  return null;
 }
}

async function refreshProfile(verbose){
 return refreshAuth(!!verbose,true);
}

async function sendSignInLink(){
 let input=document.getElementById('sbAccountEmailInput');
 let email=String(input&&input.value||'').trim();

 if(!email||!email.includes('@')){
  setAccountStatus('Enter an existing-user email first.',true);
  return;
 }

 try{
  setAccountStatus('Sending existing-user sign-in link...',false);
  let client=await sb();
  let r=await client.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname+location.search}});

  if(r.error)throw r.error;

  setAccountStatus('Sign-in link sent. If that email is not already registered, Supabase should not create it.',false);
 }catch(e){
  setAccountStatus('Sign-in link failed: '+(e.message||e)+'. If the email is new, this is expected while signup is locked.',true);
 }
}

async function signOut(){
 try{
  let client=await sb();

  await client.auth.signOut();

  authUser=null;
  authProfile=null;
  authReady=true;

  clearProfileCache();

  setAccountStatus('Signed out. Existing users can sign in again.',true);
  updateAccount();
  updateAccountPanel();
 }catch(e){
  setAccountStatus('Sign out failed: '+(e.message||e),true);
 }
}

function updateAccount(){
 let p=profile();
 let n=document.getElementById('sbHeaderProfileText'),r=document.getElementById('sbHeaderRoleText'),chip=document.getElementById('sbHeaderAccountChip');

 if(n)n.textContent=short(p.name,26);
 if(r)r.textContent='Role: '+short(p.role,24);

 if(chip){
  chip.innerHTML=accountChipInner(p,!!authUser);
  chip.classList.toggle('signed-in',!!authUser);
  chip.setAttribute('data-sb-account-user-id',authUser&&authUser.id?authUser.id:'');
  chip.setAttribute('data-sb-account-avatar-url',authUser&&p.avatar?p.avatar:'');
  chip.title=authUser?'Account: '+p.name:'Account';
 }

 document.documentElement.dataset.sbHeaderOwnership='brand-profile-split';
 document.documentElement.dataset.sbHeaderAccountOwner='header-shell';
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
 let bags=[];

 try{
  let m=window.StreamBanditMenuSavesCount;
  if(m){
   if(m.counts)bags.push(typeof m.counts==='function'?m.counts():m.counts);
   if(m.state)bags.push(typeof m.state==='function'?m.state():m.state);
   if(m.getCounts)bags.push(m.getCounts());
  }
 }catch(e){}

 try{
  let c=window.StreamBanditCoreSaves||window.StreamBanditCoreSavesV675;
  if(c){
   if(c.counts)bags.push(typeof c.counts==='function'?c.counts():c.counts);
   if(c.state)bags.push(typeof c.state==='function'?c.state():c.state);
  }
 }catch(e){}

 for(const obj of bags){
  if(!obj||typeof obj!=='object')continue;
  let s=obj.counts&&typeof obj.counts==='object'?obj.counts:obj;
  let v=s[key]??s[key+'Count']??s[key+'_count'];
  if(key==='likes')v=v??s.liked??s.likedCount??s.liked_count;
  if(typeof v==='number')return v;
  if(Array.isArray(v))return v.length;
  if(v&&typeof v==='object')return Object.keys(v).length;
 }

 return null;
}

function updateCounts(){
 let map={watchlist:['streamBanditWatchlist','stream-bandit-watchlist','sb_watchlist','watchlist'],favourites:['streamBanditFavourites','stream-bandit-favourites','sb_favourites','favourites','favorites'],likes:['streamBanditLikes','stream-bandit-likes','sb_likes','likes','liked']};

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

function patch(){
 document.querySelectorAll('a[href]').forEach(a=>{
  let m=OLD[file(a.getAttribute('href'))];
  if(m)a.setAttribute('href',route(m));
 });
}

function wire(){
 let m=document.getElementById('sbHeaderMenuBtn'),i=document.getElementById('sbHeaderSearchInput'),b=document.getElementById('sbHeaderSearchBtn'),c=document.getElementById('sbSearchClose'),chip=document.getElementById('sbHeaderAccountChip');

 if(m&&!m.dataset.w){m.onclick=openMenu;m.dataset.w=1;}
 if(chip&&!chip.dataset.w){chip.onclick=openAccountPanel;chip.dataset.w=1;}
 if(c&&!c.dataset.w){c.onclick=()=>document.getElementById('sbSearchOverlay').classList.remove('open');c.dataset.w=1;}

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

 if(!document.documentElement.dataset.sbHeaderOutsideClickWired){
  document.addEventListener('click',function(e){
   let p=document.getElementById('sbAccountPanel'),chip=document.getElementById('sbHeaderAccountChip');
   if(!p||!p.classList.contains('open'))return;
   if(p.contains(e.target)||chip===e.target||chip&&chip.contains(e.target))return;
   closeAccountPanel();
  },{capture:true});
  document.documentElement.dataset.sbHeaderOutsideClickWired='1';
 }
}

function refresh(){
 applyTheme();
 ensure();
 patch();
 updateAccount();
 updateCounts();
 try{if(window.StreamBanditBrandLogo&&window.StreamBanditBrandLogo.refresh)window.StreamBanditBrandLogo.refresh();}catch(e){}
}

function onProfileEvent(e){
 let detail=e&&e.detail?e.detail:{};
 let p=normalProfile(detail.profile||detail);

 if(authUser&&p&&p.id&&String(p.id)===String(authUser.id)){
  authProfile=p;
  cacheProfile(p);
  updateAccount();
  updateAccountPanel();
  return;
 }

 refreshAuth(false,true);
}

function wireProfileEvents(){
 if(document.documentElement.dataset.sbHeaderProfileEventsWired)return;

 ['streambandit-profile-updated','streambandit-account-updated','streambandit-header-profile-updated'].forEach(name=>{
  window.addEventListener(name,onProfileEvent);
 });

 window.addEventListener('storage',function(e){
  if(!e||!PROFILE_CACHE_KEYS.includes(e.key))return;
  let p=normalProfile(e.newValue?JSON.parse(e.newValue):null);
  if(authUser&&p&&p.id&&String(p.id)===String(authUser.id)){
   authProfile=p;
   updateAccount();
   updateAccountPanel();
  }else{
   refreshAuth(false,true);
  }
 });

 document.documentElement.dataset.sbHeaderProfileEventsWired='1';
}

function boot(){
 helpers();
 applyTheme();
 ensure();
 drawer();
 patch();
 wireProfileEvents();
 refreshAuth(false,true);

 window.StreamBanditHeaderShell={
  version:VERSION,
  routes:ROUTES,
  menu:openMenu,
  openMenu,
  closeMenu,
  search,
  updateCounts,
  updateAccount,
  updateAccountPanel,
  refresh,
  refreshAuth,
  refreshProfile,
  openAccountPanel,
  closeAccountPanel,
  signOut,
  state:()=>({
   version:VERSION,
   current:cur(),
   themeOwner:THEME_OWNER,
   profileRoute:PROFILE,
   brandLogoElement:'sbHeaderBrandLogo',
   brandLogoOwner:'Brand / App Icons',
   profileAvatarOwner:'Header Shell reads signed-in sb_profiles.avatar_url',
   brandProfileSplit:true,
   accountChipAvatarOwner:'Header Shell',
   authReady,
   auth:!!authUser,
   authUser:authUser?{id:authUser.id,email:authUser.email}:null,
   authProfile,
   profile:profile()
  })
 };

 setTimeout(refresh,400);
 setTimeout(()=>refreshAuth(false,true),800);
 setTimeout(refresh,1200);
 setInterval(updateCounts,5000);
 setInterval(()=>refreshAuth(false,false),60000);

 document.documentElement.dataset.sbHeaderShell='v7-12-297';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
