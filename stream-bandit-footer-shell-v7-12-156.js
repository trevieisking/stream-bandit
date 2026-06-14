/* Stream Bandit Footer Shell V7.12.298.2
   Compact tabbed global footer + global private messages overlay.
   Footer owns a lightweight messenger overlay on every page.
   Full Form Inbox remains the full admin/owner management page.
   Uses existing sb_private_messages, sb_profiles, sb_user_friends, sb_user_blocks.
   Inbox reply now uses the same proven message payload shape as New Message.
   No schema/storage/RLS/index changes in this file.
*/
(function(){
'use strict';

const VERSION='V7.12.298.2 Footer Shell / Inbox Reply Payload Fix';
const THEME_OWNER='web-builder-theme-studio-controls-v7-8-9-test.html';
const SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
const SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';

let sbClient=null;
let msgUser=null;
let msgProfile=null;
let messages=[];
let selectedMessage=null;
let friends=[];
let blocks=[];
let profilesById={};
let msgTab='inbox';
let msgBusy=false;
let msgLoaded=false;

const ROUTES={
 home:'home-global-helpers-v7-4-4-test.html',
 library:'library-global-helpers-v7-4-8-test.html',
 details:'details-clean-machine-v7-12-38-test.html',
 player1:'player-one-global-helpers-v7-3-3-test.html',
 continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
 watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
 watchlist:'watchlist-clean-machine-v7-12-43-test.html',
 favourites:'favourites-clean-machine-v7-12-41-test.html',
 likes:'likes-clean-machine-v7-12-42-test.html',
 accessibility:'accessibility-clean-machine-v7-12-44-test.html',
 profile:'profile-settings-live-ready-v7-12-90-test.html',
 supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
 genres:'genres-clean-machine-v7-12-45-test.html',
 search:'global-search-global-helpers-v7-4-9-test.html',
 about:'about-global-helpers-v7-4-7-test.html',
 submit:'submit-video-clean-machine-v7-12-79-test.html',
 rules:'rules-clean-machine-v7-12-82-test.html',
 review:'review-queue-clean-machine-v7-12-80-publish-test.html',
 playlists:'playlists-global-helpers-v7-5-2-test.html',
 channels:'channels-global-helpers-v7-5-3-test.html',
 myChannel:'my-channel-clean-machine-v7-12-47-test.html',
 collections:'collections-clean-machine-v7-12-51-test.html',
 player2:'player-2-clean-machine-v7-12-58-test.html',
 settings:'settings-platform-control-hub-v7-12-85-test.html',
 theme:THEME_OWNER,
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
 oneMachine:'stream-bandit-one-machine-v7-12-73-test.html',
 platformControl:'platform-control-centre-combined-v7-12-61-test.html',
 helperShell:'stream-bandit-global-helper-shell-v7-12-126-test.html',
 brandIcons:'settings-brand-icons-promoted-v7-12-21-test.html',
 brandHelper:'brand-logo-helper-responsive-v7-12-20-test.html',
 faviconBuilder:'favicon-app-icon-builder-v7-12-15-test.html',
 userDashboard:'user-management-dashboard-v7-11-2-test.html',
 pricing:'plans-pricing-feature-shop-v7-11-3-test.html',
 permissions:'permissions-matrix-user-management-v7-11-4-test.html'
};

const OLD={
 'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
 'all-pages-version-registry-v7-10-3-full-test.html':ROUTES.registry,
 'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,
 'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,
 'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
 'web-builder-live-studio-v7-12-93-test.html':ROUTES.builder,
 'policy-agreements-centre-v7-11-6-test.html':ROUTES.policyCentre,
 'policy-reader-published-row-v7-12-27-test.html':ROUTES.policyReader,
 'policy-admin-save-editor-v7-12-25-test.html':ROUTES.policyAdmin,
 'platform-control-tower-route-guard-proof-v7-12-33-test.html':ROUTES.health,
 'final-shell-navigation-global-helpers-v7-5-9-test.html':ROUTES.helperShell,
 'stream-bandit-one-machine-v7-12-72-test.html':ROUTES.oneMachine,
 'platform-control-centre-admin-v7-12-59-test.html':ROUTES.platformControl,
 'brand-image-helper-v7-12-20-test.html':ROUTES.brandHelper,
 'brand-logo-helper-responsive-v7-12-20-test.html':ROUTES.brandHelper,
 'favicon-app-icon-builder-v7-12-15-test.html':ROUTES.faviconBuilder,
 'collections-clean-machine-v7-12-48-test.html':ROUTES.collections,
 'collections-clean-machine-v7-12-49-test.html':ROUTES.collections,
 'collections-clean-machine-v7-12-50-test.html':ROUTES.collections,
 'player-2-progress-helper-v6-78-9-4-test.html':ROUTES.player2,
 'player-two-global-helpers-v7-3-4-test.html':ROUTES.player2,
 'about-clean-machine-v7-12-46-test.html':ROUTES.about,
 'user-dashboard-concept-v6-68-test.html':ROUTES.userDashboard,
 'plans-pricing-matrix-v6-69-test.html':ROUTES.pricing,
 'permissions-matrix-v6-70-test.html':ROUTES.permissions
};

const GROUPS=[
 ['Watch',[['Home',ROUTES.home],['Library',ROUTES.library],['Details',ROUTES.details],['Player 1',ROUTES.player1],['Continue Watching',ROUTES.continueWatching],['Watch History',ROUTES.watchHistory]]],
 ['Saved',[['Watchlist',ROUTES.watchlist],['Favourites',ROUTES.favourites],['Likes',ROUTES.likes],['Accessibility',ROUTES.accessibility],['Profile',ROUTES.profile]]],
 ['Browse',[['Supabase Library Editor',ROUTES.supabaseLibrary],['Genres',ROUTES.genres],['Global Search',ROUTES.search],['About',ROUTES.about]]],
 ['Creator',[['Submit Video',ROUTES.submit],['Rules',ROUTES.rules],['Review Queue',ROUTES.review],['My Channel',ROUTES.myChannel],['Player 2',ROUTES.player2]]],
 ['Builder',[['Pages Manager',ROUTES.pagesManager],['Published Preview',ROUTES.preview],['Form Inbox',ROUTES.formInbox],['Advanced Form',ROUTES.formAdvanced],['Theme Studio',ROUTES.theme]]],
 ['Policy',[['Policy Documents',ROUTES.policyCentre],['Policy Proof',ROUTES.policyReader],['Policy Admin Editor',ROUTES.policyAdmin]]],
 ['Admin',[['Admin Centre',ROUTES.admin],['Live Readiness',ROUTES.readiness],['Current Routes Registry',ROUTES.registry],['Test Checklist',ROUTES.checklist],['Tools',ROUTES.tools],['Health Check',ROUTES.health],['Mux Manager',ROUTES.mux],['Storage Prep',ROUTES.storage],['Backup / Safety',ROUTES.backup]]],
 ['Owner',[['One Machine',ROUTES.oneMachine],['Platform Control Centre',ROUTES.platformControl],['Final Shell Navigation',ROUTES.helperShell],['Brand / App Icons',ROUTES.brandIcons],['Brand Image Helper',ROUTES.brandHelper],['Favicon / App Icon Builder',ROUTES.faviconBuilder]]],
 ['User Management',[['User Dashboard',ROUTES.userDashboard],['Pricing Matrix',ROUTES.pricing],['Permissions Matrix',ROUTES.permissions]]]
];

function esc(s){
 return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function file(v){
 return String(v||'').split('/').pop().split('?')[0].split('#')[0];
}

function page(){
 try{return new URL(location.href).searchParams.get('page')||'test-page';}
 catch(e){return 'test-page';}
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

function activeGroup(){
 let c=cur();
 for(const g of GROUPS){
  if(g[1].some(x=>same(x[1],c)))return g[0];
 }
 return 'Watch';
}

function messagePageSlug(){
 let p=page();

 if(p&&p!=='test-page')return p;

 let f=cur()
  .replace(/\.html$/,'')
  .replace(/[^a-z0-9]+/gi,'-')
  .replace(/^-+|-+$/g,'')
  .toLowerCase();

 return f||'global-footer-messenger';
}

function date(v){
 try{return v?new Date(v).toLocaleString():'No date';}
 catch(e){return v||'No date';}
}

function email(){
 return (msgUser&&msgUser.email||'').toLowerCase();
}

function myName(){
 return (msgProfile&&msgProfile.display_name)||(msgProfile&&msgProfile.username)||(msgProfile&&msgProfile.channel_name)||(msgUser&&msgUser.email)||'Stream Bandit user';
}

function css(){
 if(document.getElementById('sbFooterShellCss'))return;

 let s=document.createElement('style');
 s.id='sbFooterShellCss';
 s.textContent=`
:root{--sbLine:var(--line,#ffffff22);--sbP:var(--p,#101529);--sbP2:var(--p2,#17122d);--sbA:var(--accent,#22d3a6);--sbA2:var(--accent2,#7c3cff);--sbM:var(--muted,#b9c0d8)}
.sb-old-page-footer-hidden,#sbCollectionsFooter,#sbPlayer2Footer,.microFooter{display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;min-height:0!important;max-height:0!important;overflow:hidden!important;margin:0!important;padding:0!important;border:0!important}
.sb-footer-shell{border:1px solid var(--sbLine);border-radius:24px;background:linear-gradient(135deg,var(--sbP),var(--sbP2));box-shadow:0 14px 48px #0007;padding:14px;margin:14px 0;color:#fff}
.sb-footer-top{display:grid;grid-template-columns:minmax(220px,1fr) 2.4fr;gap:12px;align-items:start}
.sb-footer-brand{border:1px solid #ffffff18;border-radius:18px;background:#ffffff0b;padding:12px}
.sb-footer-brand h2{font-size:22px;margin:0 0 5px}
.sb-footer-brand p{margin:0 0 6px;color:var(--sbM);line-height:1.35}
.sb-footer-brand small{color:var(--sbM)}
.sb-footer-brand-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.sb-footer-action{border:1px solid #ffffff24;border-radius:999px;background:#ffffff12;color:#fff;font-weight:950;padding:9px 12px;cursor:pointer;text-decoration:none}
.sb-footer-action.primary{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017}
.sb-footer-action.hot{background:linear-gradient(135deg,#ff2d85,var(--sbA2));color:#fff}
.sb-footer-tabs{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
.sb-footer-tab{border:1px solid #ffffff20;border-radius:999px;background:#ffffff12;color:#baf7df;font-weight:950;padding:8px 11px;cursor:pointer}
.sb-footer-tab.current{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017;border-color:#ffffff55}
.sb-footer-panel{margin-top:12px;border:1px solid #ffffff18;border-radius:18px;background:#ffffff0b;padding:12px}
.sb-footer-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}
.sb-footer-panel-head b{color:#baf7df}
.sb-footer-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,180px));gap:10px;justify-content:start;align-items:stretch}
.sb-footer-links a{display:flex;align-items:center;justify-content:center;text-align:center;color:#baf7df;text-decoration:none;font-weight:950;border-radius:15px;background:#ffffff0e;border:1px solid #ffffff12;padding:10px 12px;width:180px;min-width:180px;max-width:180px;height:54px;min-height:54px;max-height:54px;line-height:1.1;overflow:hidden}
.sb-footer-links a.current{color:#fff;background:linear-gradient(135deg,#22d3a638,#7c3cff38);border-color:#22d3a670;box-shadow:0 0 0 2px #22d3a618}
.sb-footer-note{margin-top:10px;text-align:center;color:#8f98b8;font-size:12px}
.sb-msg-scrim{position:fixed;inset:0;background:#000a;z-index:100000;display:none;padding:18px;overflow:auto}
.sb-msg-scrim.open{display:block}
.sb-msg-overlay{width:min(1180px,100%);margin:22px auto;border:1px solid #ffffff2c;border-radius:28px;background:linear-gradient(135deg,#070a14,#1a0a31);box-shadow:0 30px 120px #000;padding:16px;color:#fff}
.sb-msg-head{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;border-bottom:1px solid #ffffff18;padding-bottom:12px;margin-bottom:12px}
.sb-msg-head h2{margin:0;font-size:clamp(26px,3vw,42px);letter-spacing:-.04em}
.sb-msg-head p{margin:5px 0 0;color:var(--sbM);line-height:1.4}
.sb-msg-close{border:0;border-radius:999px;background:#535a7c;color:#fff;font-weight:950;padding:10px 14px;cursor:pointer}
.sb-msg-status{border:1px solid #22d3a650;background:#22d3a620;color:#dfffee;border-radius:16px;padding:11px 13px;font-weight:850;margin:10px 0}
.sb-msg-status.warn{border-color:#ffb14266;background:#ffb14224;color:#ffe7ad}
.sb-msg-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.sb-msg-tab{border:1px solid #ffffff20;border-radius:999px;background:#ffffff12;color:#fff;font-weight:950;padding:10px 13px;cursor:pointer}
.sb-msg-tab.active{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017}
.sb-msg-grid{display:grid;grid-template-columns:minmax(280px,420px) minmax(0,1fr);gap:14px}
.sb-msg-list,.sb-msg-detail,.sb-msg-card{border:1px solid #ffffff18;border-radius:22px;background:#ffffff0b;padding:12px}
.sb-msg-list{max-height:620px;overflow:auto}
.sb-msg-item{border:1px solid #ffffff18;border-radius:18px;background:#ffffff0d;padding:11px;margin:0 0 10px;cursor:pointer;display:grid;grid-template-columns:44px 1fr;gap:10px;align-items:start}
.sb-msg-item.active{outline:2px solid #22d3a688;background:#22d3a617}
.sb-msg-avatar{width:42px;height:42px;border-radius:999px;overflow:hidden;border:1px solid #ffffff35;background:linear-gradient(135deg,var(--sbA),var(--sbA2));display:grid;place-items:center;font-weight:950;color:#061017}
.sb-msg-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.sb-msg-item h3{margin:0 0 4px;font-size:16px}
.sb-msg-item p{margin:0;color:var(--sbM);font-size:13px;line-height:1.35}
.sb-msg-pill{display:inline-flex;border-radius:999px;background:#22d3a624;border:1px solid #22d3a657;color:#baf7df;font-weight:950;padding:4px 7px;font-size:11px;margin:2px}
.sb-msg-pill.warn{background:#ffb14224;border-color:#ffb14266;color:#ffe7ad}
.sb-msg-pill.bad{background:#ff4d6d24;border-color:#ff4d6d66;color:#ffd8df}
.sb-msg-body{white-space:pre-wrap;line-height:1.55;border:1px solid #ffffff14;border-radius:18px;background:#0005;padding:12px;margin:10px 0}
.sb-msg-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.sb-msg-btn{border:0;border-radius:999px;background:#535a7c;color:#fff;font-weight:950;padding:10px 12px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}
.sb-msg-btn.primary{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017}
.sb-msg-btn.hot{background:linear-gradient(135deg,#ff2d85,var(--sbA2));color:#fff}
.sb-msg-btn.warn{background:linear-gradient(135deg,#ffb142,var(--sbA2));color:#111}
.sb-msg-btn.bad{background:linear-gradient(135deg,#ff4d6d,var(--sbA2));color:#fff}
.sb-msg-form{display:grid;gap:10px}
.sb-msg-form label{color:var(--sbM);font-weight:850}
.sb-msg-form input,.sb-msg-form textarea{width:100%;border:1px solid #ffffff24;border-radius:14px;background:#0006;color:#fff;padding:11px;font:inherit}
.sb-msg-form textarea{min-height:130px;resize:vertical}
.sb-msg-mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.sb-msg-person{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;border:1px solid #ffffff18;border-radius:18px;background:#ffffff0d;padding:10px;margin-bottom:10px}
.sb-msg-person b{display:block}
.sb-msg-person small{color:var(--sbM)}
@media(max-width:900px){.sb-footer-top{grid-template-columns:1fr}.sb-footer-tab{flex:1;min-width:88px}.sb-footer-links{grid-template-columns:repeat(auto-fit,minmax(155px,155px));justify-content:center}.sb-footer-links a{width:155px;min-width:155px;max-width:155px;height:50px;min-height:50px;max-height:50px}.sb-msg-grid{grid-template-columns:1fr}.sb-msg-head{grid-template-columns:1fr}.sb-msg-list{max-height:420px}}
@media(max-width:520px){.sb-footer-shell{padding:12px}.sb-footer-tabs{display:grid;grid-template-columns:repeat(2,1fr)}.sb-footer-links{grid-template-columns:1fr;justify-content:stretch}.sb-footer-links a{width:100%;min-width:0;max-width:none;height:48px;min-height:48px;max-height:48px}.sb-msg-scrim{padding:8px}.sb-msg-overlay{margin:10px auto;padding:12px}.sb-msg-tabs{display:grid;grid-template-columns:1fr 1fr}.sb-msg-btn,.sb-msg-tab{width:100%}}
`;
 document.head.appendChild(s);
}

function hideOld(){
 try{
  let w=document.querySelector('.wrap')||document.body;
  Array.from(w.children).forEach(el=>{
   if(el.id!=='sbFooterShell'&&el.matches&&el.matches('section.footer,.footer,footer,#sbCollectionsFooter,#sbPlayer2Footer'))el.classList.add('sb-old-page-footer-hidden');
  });
  document.querySelectorAll('#sbCollectionsFooter,#sbPlayer2Footer,.microFooter').forEach(el=>el.classList.add('sb-old-page-footer-hidden'));
 }catch(e){}
}

function applyTheme(){
 try{
  if(window.StreamBanditThemeProjector&&window.StreamBanditThemeProjector.refresh)window.StreamBanditThemeProjector.refresh();
  else if(window.StreamBanditSettingsGlobal&&window.StreamBanditSettingsGlobal.refresh)window.StreamBanditSettingsGlobal.refresh();
 }catch(e){}
 document.documentElement.dataset.sbThemeReaderFooter='footer-shell';
}

function panel(name){
 let c=cur();
 let g=GROUPS.find(x=>x[0]===name)||GROUPS[0];
 return '<div class="sb-footer-panel-head"><b>'+esc(g[0])+'</b><small>'+g[1].length+' links</small></div><div class="sb-footer-links">'+g[1].map(x=>'<a class="'+(same(x[1],c)?'current':'')+'" href="'+esc(route(x[1]))+'">'+esc(x[0])+'</a>').join('')+'</div>';
}

function unreadCount(){
 if(!msgUser)return 0;
 return messages.filter(m=>mineRecipient(m)&&!trashedForMe(m)&&m.status!=='spam'&&m.status!=='read').length;
}

function html(){
 let ag=activeGroup();
 return '<footer id="sbFooterShell" class="sb-footer-shell" data-version="'+esc(VERSION)+'" data-active-group="'+esc(ag)+'">'+
  '<div class="sb-footer-top">'+
   '<div class="sb-footer-brand">'+
    '<h2>Stream Bandit</h2>'+
    '<p>Global footer shell. Compact route tabs, current links, theme read from Theme Studio.</p>'+
    '<small>'+esc(VERSION)+'</small>'+
    '<div class="sb-footer-brand-actions">'+
     '<button id="sbFooterMessagesBtn" class="sb-footer-action primary" type="button">💬 Messages <span id="sbFooterMessageCount"></span></button>'+
     '<a class="sb-footer-action" href="'+esc(route(ROUTES.formInbox))+'">Form Inbox</a>'+
    '</div>'+
   '</div>'+
   '<div>'+
    '<div class="sb-footer-tabs" role="tablist" aria-label="Footer navigation groups">'+GROUPS.map(g=>'<button class="sb-footer-tab '+(g[0]===ag?'current':'')+'" type="button" data-sb-footer-tab="'+esc(g[0])+'">'+esc(g[0])+'</button>').join('')+'</div>'+
    '<div id="sbFooterPanel" class="sb-footer-panel">'+panel(ag)+'</div>'+
   '</div>'+
  '</div>'+
  '<div class="sb-footer-note">Header + page + compact footer tabs. Theme read globally, owned by Theme Studio. Private messages open as a lightweight overlay.</div>'+
 '</footer>';
}

function ensureMessenger(){
 if(document.getElementById('sbGlobalMessagesScrim'))return;

 document.body.insertAdjacentHTML('beforeend',
  '<div id="sbGlobalMessagesScrim" class="sb-msg-scrim">'+
   '<div class="sb-msg-overlay" role="dialog" aria-modal="true" aria-label="Stream Bandit private messages">'+
    '<div class="sb-msg-head">'+
     '<div><span class="sb-msg-pill">V7.12.298.2 Global Messenger</span><h2>💬 Private Messages</h2><p>Lightweight footer overlay. Full form-submission management stays in Form Inbox.</p></div>'+
     '<button id="sbMsgClose" class="sb-msg-close" type="button">Close</button>'+
    '</div>'+
    '<div id="sbMsgStatus" class="sb-msg-status">Open messages to load your inbox.</div>'+
    '<div class="sb-msg-tabs">'+
     '<button class="sb-msg-tab active" data-msg-tab="inbox" type="button">Inbox</button>'+
     '<button class="sb-msg-tab" data-msg-tab="sent" type="button">Sent</button>'+
     '<button class="sb-msg-tab" data-msg-tab="compose" type="button">New Message</button>'+
     '<button class="sb-msg-tab" data-msg-tab="friends" type="button">Friends</button>'+
     '<button class="sb-msg-tab" data-msg-tab="blocks" type="button">Blocked</button>'+
    '</div>'+
    '<div id="sbMsgContent"></div>'+
   '</div>'+
  '</div>'
 );

 document.getElementById('sbMsgClose').onclick=closeMessages;
 document.getElementById('sbGlobalMessagesScrim').addEventListener('click',function(e){
  if(e.target&&e.target.id==='sbGlobalMessagesScrim')closeMessages();
 });

 document.querySelectorAll('[data-msg-tab]').forEach(btn=>{
  btn.onclick=()=>{
   msgTab=btn.getAttribute('data-msg-tab')||'inbox';
   document.querySelectorAll('[data-msg-tab]').forEach(x=>x.classList.toggle('active',x===btn));
   renderMessenger();
  };
 });
}

function wire(){
 let f=document.getElementById('sbFooterShell');
 if(!f)return;

 f.querySelectorAll('[data-sb-footer-tab]').forEach(btn=>{
  if(btn.dataset.w)return;
  btn.dataset.w=1;
  btn.onclick=()=>{
   let name=btn.getAttribute('data-sb-footer-tab');
   f.setAttribute('data-active-group',name);
   f.querySelectorAll('.sb-footer-tab').forEach(x=>x.classList.toggle('current',x===btn));
   let p=document.getElementById('sbFooterPanel');
   if(p)p.innerHTML=panel(name);
   patch();
  };
 });

 let msgBtn=document.getElementById('sbFooterMessagesBtn');
 if(msgBtn&&!msgBtn.dataset.w){
  msgBtn.dataset.w=1;
  msgBtn.onclick=openMessages;
 }
}

function ensure(){
 css();
 hideOld();
 let w=document.querySelector('.wrap')||document.body;
 if(!document.getElementById('sbFooterShell'))w.insertAdjacentHTML('beforeend',html());
 ensureMessenger();
 wire();
 patch();
 updateFooterMessageBadge();
}

function patch(){
 document.querySelectorAll('a[href]').forEach(a=>{
  let m=OLD[file(a.getAttribute('href'))];
  if(m)a.setAttribute('href',route(m));
 });
}

function refresh(){
 applyTheme();
 ensure();
 hideOld();
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

async function client(){
 if(sbClient)return sbClient;
 await loadSupabaseSdk();
 sbClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 return sbClient;
}

function setMsgStatus(text,warn){
 let el=document.getElementById('sbMsgStatus');
 if(el){
  el.textContent=text;
  el.className=warn?'sb-msg-status warn':'sb-msg-status';
 }
}

function avatar(profile){
 let url=profile&&profile.avatar_url;
 return url?'<span class="sb-msg-avatar"><img src="'+esc(url)+'" alt=""></span>':'<span class="sb-msg-avatar">👤</span>';
}

function profileName(id,fallback){
 let p=id&&profilesById[id];
 return (p&&p.display_name)||(p&&p.username)||(p&&p.channel_name)||fallback||'Stream Bandit user';
}

function profileAvatar(id){
 return avatar(id&&profilesById[id]);
}

function mineSender(m){
 return !!msgUser&&(m.sender_id===msgUser.id||String(m.sender_email||'').toLowerCase()===email());
}

function mineRecipient(m){
 return !!msgUser&&(m.recipient_id===msgUser.id||String(m.recipient_email||'').toLowerCase()===email());
}

function deletedForMe(m){
 return mineSender(m)?!!m.sender_deleted_at:mineRecipient(m)?!!m.recipient_deleted_at:false;
}

function trashedForMe(m){
 return m.status==='trashed'||(mineSender(m)?!!m.sender_trashed_at:mineRecipient(m)?!!m.recipient_trashed_at:false);
}

function otherUserId(m){
 if(!msgUser||!m)return '';
 if(m.sender_id===msgUser.id)return m.recipient_id||'';
 return m.sender_id||'';
}

function otherUserEmail(m){
 if(!msgUser||!m)return '';
 if(mineSender(m))return m.recipient_email||'';
 return m.sender_email||'';
}

function participant(m,side){
 if(side==='sender'){
  return profileName(m.sender_id,m.sender_name||m.sender_email||m.sender_id||'sender');
 }
 return profileName(m.recipient_id,m.recipient_name||m.recipient_email||m.recipient_id||'recipient');
}

function messageAvatar(m){
 let id=msgTab==='sent'?m.recipient_id:m.sender_id;
 return profileAvatar(id);
}

async function refreshAuth(){
 try{
  let c=await client();
  let u=await c.auth.getUser();

  msgUser=u.data&&u.data.user||null;
  msgProfile=null;

  if(msgUser){
   let p=await c.from('sb_profiles').select('id,username,display_name,channel_name,avatar_url,role').eq('id',msgUser.id).maybeSingle();
   msgProfile=p.data||null;
   if(msgProfile)profilesById[msgProfile.id]=msgProfile;
  }

  return msgUser;
 }catch(e){
  msgUser=null;
  msgProfile=null;
  return null;
 }
}

async function loadProfiles(ids){
 ids=[...new Set((ids||[]).filter(Boolean))];

 if(!ids.length)return;

 try{
  let c=await client();
  let r=await c.from('sb_profiles').select('id,username,display_name,channel_name,avatar_url,role').in('id',ids);

  if(!r.error){
   (r.data||[]).forEach(p=>{profilesById[p.id]=p;});
  }
 }catch(e){}
}

async function loadMessages(){
 if(msgBusy)return;

 msgBusy=true;

 try{
  let c=await client();
  await refreshAuth();

  if(!msgUser){
   messages=[];
   friends=[];
   blocks=[];
   setMsgStatus('Sign in to use private messages.',true);
   msgBusy=false;
   renderMessenger();
   return;
  }

  setMsgStatus('Loading private messages...');

  let r=await c.from('sb_private_messages').select('*').order('sent_at',{ascending:false}).limit(150);

  if(r.error)throw r.error;

  messages=(r.data||[]).filter(m=>{
   return mineSender(m)||mineRecipient(m);
  });

  await loadFriendsAndBlocks(false);

  let ids=[];
  messages.forEach(m=>{
   if(m.sender_id)ids.push(m.sender_id);
   if(m.recipient_id)ids.push(m.recipient_id);
  });
  friends.forEach(f=>{
   if(f.requester_id)ids.push(f.requester_id);
   if(f.addressee_id)ids.push(f.addressee_id);
  });
  blocks.forEach(b=>{
   if(b.blocker_id)ids.push(b.blocker_id);
   if(b.blocked_id)ids.push(b.blocked_id);
  });

  await loadProfiles(ids);

  msgLoaded=true;
  setMsgStatus('Loaded '+messages.length+' private messages.');
  updateFooterMessageBadge();
  renderMessenger();
 }catch(e){
  setMsgStatus('Message load failed: '+(e.message||e),true);
 }finally{
  msgBusy=false;
 }
}

async function loadFriendsAndBlocks(renderAfter){
 try{
  let c=await client();

  if(!msgUser)return;

  let fr=await c.from('sb_user_friends').select('*').or('requester_id.eq.'+msgUser.id+',addressee_id.eq.'+msgUser.id).order('updated_at',{ascending:false});
  if(!fr.error)friends=fr.data||[];

  let bl=await c.from('sb_user_blocks').select('*').or('blocker_id.eq.'+msgUser.id+',blocked_id.eq.'+msgUser.id).order('created_at',{ascending:false});
  if(!bl.error)blocks=bl.data||[];

  if(renderAfter){
   let ids=[];
   friends.forEach(f=>{ids.push(f.requester_id,f.addressee_id);});
   blocks.forEach(b=>{ids.push(b.blocker_id,b.blocked_id);});
   await loadProfiles(ids);
   renderMessenger();
  }
 }catch(e){}
}

function visibleMessages(){
 return messages.filter(m=>{
  if(deletedForMe(m))return false;
  if(msgTab==='sent')return mineSender(m)&&!trashedForMe(m)&&m.status!=='spam';
  return mineRecipient(m)&&!trashedForMe(m)&&m.status!=='spam';
 });
}

function statusPill(v){
 v=v||'sent';
 let c=v==='spam'?' bad':v==='trashed'?' warn':v==='read'?'':'';
 return '<span class="sb-msg-pill'+c+'">'+esc(v)+'</span>';
}

function renderMessenger(){
 ensureMessenger();

 let box=document.getElementById('sbMsgContent');
 if(!box)return;

 if(!msgUser){
  box.innerHTML='<div class="sb-msg-card"><h3>Sign in required</h3><p>Open the Account button in the header, sign in, then come back to Messages.</p><div class="sb-msg-actions"><a class="sb-msg-btn primary" href="'+esc(route(ROUTES.profile))+'">Open Profile Settings</a></div></div>';
  return;
 }

 if(msgTab==='compose'){
  renderCompose(box);
  return;
 }

 if(msgTab==='friends'){
  renderFriends(box);
  return;
 }

 if(msgTab==='blocks'){
  renderBlocks(box);
  return;
 }

 renderMessageMailbox(box);
}

function renderMessageMailbox(box){
 let list=visibleMessages();

 if(!list.length){
  selectedMessage=null;
  box.innerHTML='<div class="sb-msg-grid"><aside class="sb-msg-list"><p>No '+esc(msgTab)+' messages yet.</p></aside><main class="sb-msg-detail"><p>Select a message when one appears.</p></main></div>';
  return;
 }

 if(!selectedMessage||!list.some(m=>m.id===selectedMessage.id))selectedMessage=list[0];

 box.innerHTML='<div class="sb-msg-grid"><aside class="sb-msg-list">'+list.map(m=>{
  let from=participant(m,'sender');
  let to=participant(m,'recipient');
  return '<article class="sb-msg-item '+(selectedMessage&&selectedMessage.id===m.id?'active':'')+'" data-msg-id="'+esc(m.id)+'">'+
   messageAvatar(m)+
   '<div>'+statusPill(m.status)+'<h3>'+esc(m.subject||'Private message')+'</h3><p><b>From:</b> '+esc(from)+'</p><p><b>To:</b> '+esc(to)+'</p><p>'+esc(date(m.sent_at||m.created_at))+'</p></div>'+
  '</article>';
 }).join('')+'</aside><main class="sb-msg-detail" id="sbMsgDetail"></main></div>';

 box.querySelectorAll('[data-msg-id]').forEach(el=>{
  el.onclick=()=>{
   selectedMessage=messages.find(m=>m.id===el.getAttribute('data-msg-id'));
   renderMessenger();
  };
 });

 renderMessageDetail();
}

function renderMessageDetail(){
 let d=document.getElementById('sbMsgDetail');
 if(!d)return;

 let m=selectedMessage;

 if(!m){
  d.innerHTML='<p>Select a message.</p>';
  return;
 }

 let other=otherUserId(m);

 d.innerHTML='<span class="sb-msg-pill">'+esc(m.kind||'message')+'</span>'+
  '<h2>'+esc(m.subject||'Private message')+'</h2>'+
  '<p><b>From:</b> '+esc(participant(m,'sender'))+'</p>'+
  '<p><b>To:</b> '+esc(participant(m,'recipient'))+'</p>'+
  '<p><b>Date:</b> '+esc(date(m.sent_at||m.created_at))+'</p>'+
  '<p><b>Status:</b> '+statusPill(m.status)+'</p>'+
  '<div class="sb-msg-body">'+esc(m.body||'No message body')+'</div>'+
  '<div class="sb-msg-actions">'+
   '<button class="sb-msg-btn primary" id="sbMsgReply" type="button">Reply</button>'+
   (other?'<button class="sb-msg-btn" id="sbMsgFriend" type="button">Add friend</button><button class="sb-msg-btn bad" id="sbMsgBlock" type="button">Block</button>':'')+
   '<button class="sb-msg-btn warn" id="sbMsgTrash" type="button">Trash</button>'+
   '<button class="sb-msg-btn" id="sbMsgOpenFull" type="button">Open full inbox</button>'+
  '</div>'+
  '<div id="sbMsgReplyBox" class="sb-msg-card" style="display:none;margin-top:12px">'+
   '<div class="sb-msg-form"><label>Reply message<textarea id="sbMsgReplyBody" placeholder="Write a private reply..."></textarea></label><button id="sbMsgSendReply" class="sb-msg-btn primary" type="button">Send reply</button></div>'+
  '</div>';

 document.getElementById('sbMsgReply').onclick=()=>{document.getElementById('sbMsgReplyBox').style.display='block';};
 document.getElementById('sbMsgOpenFull').onclick=()=>{location.href=route(ROUTES.formInbox);};
 document.getElementById('sbMsgTrash').onclick=trashSelectedMessage;

 let friend=document.getElementById('sbMsgFriend');
 if(friend)friend.onclick=()=>requestFriend(other);

 let block=document.getElementById('sbMsgBlock');
 if(block)block.onclick=()=>blockUser(other);

 document.getElementById('sbMsgSendReply').onclick=sendMessageReply;
}

function renderCompose(box){
 box.innerHTML='<div class="sb-msg-card">'+
  '<h2>New private message</h2>'+
  '<div class="sb-msg-form">'+
   '<div class="sb-msg-mini-grid">'+
    '<label>Recipient email, required<input id="sbMsgToEmail" placeholder="user@email.com"></label>'+
    '<label>Recipient profile ID, optional<input id="sbMsgToId" placeholder="Optional profile id for avatars/friends/blocks"></label>'+
   '</div>'+
   '<label>Subject<input id="sbMsgSubject" value="Private message"></label>'+
   '<label>Message<textarea id="sbMsgBody" placeholder="Write your private message..."></textarea></label>'+
   '<div class="sb-msg-actions"><button id="sbMsgSend" class="sb-msg-btn primary" type="button">Send message</button><a class="sb-msg-btn" href="'+esc(route(ROUTES.formInbox))+'">Open full inbox</a></div>'+
  '</div>'+
  '<p style="color:var(--sbM)">This global overlay sends through the same sb_private_messages table as Form Inbox. Recipient email is required; profile ID is optional for friends/blocks/avatar matching.</p>'+
 '</div>';

 document.getElementById('sbMsgSend').onclick=sendNewMessage;
}

function renderFriends(box){
 let accepted=friends.filter(f=>f.status==='accepted');
 let pending=friends.filter(f=>f.status==='pending');
 let incoming=pending.filter(f=>f.addressee_id===msgUser.id);
 let outgoing=pending.filter(f=>f.requester_id===msgUser.id);

 box.innerHTML='<div class="sb-msg-grid">'+
  '<aside class="sb-msg-list">'+
   '<h3>Friends</h3>'+
   (accepted.length?accepted.map(friendRow).join(''):'<p>No accepted friends yet.</p>')+
   '<h3>Incoming requests</h3>'+
   (incoming.length?incoming.map(friendRow).join(''):'<p>No incoming requests.</p>')+
   '<h3>Sent requests</h3>'+
   (outgoing.length?outgoing.map(friendRow).join(''):'<p>No sent requests.</p>')+
  '</aside>'+
  '<main class="sb-msg-detail">'+
   '<h2>Add friend by profile ID</h2>'+
   '<p>Use a profile/user id from an existing message or profile.</p>'+
   '<div class="sb-msg-form"><label>Profile ID<input id="sbFriendTarget" placeholder="target user uuid"></label><label>Note<input id="sbFriendNote" placeholder="Optional friend request note"></label><button id="sbFriendSend" class="sb-msg-btn primary" type="button">Send friend request</button></div>'+
  '</main>'+
 '</div>';

 box.querySelectorAll('[data-friend-compose]').forEach(btn=>{
  btn.onclick=()=>{
   msgTab='compose';
   document.querySelectorAll('[data-msg-tab]').forEach(x=>x.classList.toggle('active',x.getAttribute('data-msg-tab')==='compose'));
   renderMessenger();
   setTimeout(()=>{
    let input=document.getElementById('sbMsgToId');
    if(input)input.value=btn.getAttribute('data-friend-compose')||'';
   },30);
  };
 });

 box.querySelectorAll('[data-friend-accept]').forEach(btn=>btn.onclick=()=>updateFriend(btn.getAttribute('data-friend-accept'),'accepted'));
 box.querySelectorAll('[data-friend-decline]').forEach(btn=>btn.onclick=()=>updateFriend(btn.getAttribute('data-friend-decline'),'declined'));
 box.querySelectorAll('[data-friend-remove]').forEach(btn=>btn.onclick=()=>deleteFriend(btn.getAttribute('data-friend-remove')));

 document.getElementById('sbFriendSend').onclick=()=>{
  requestFriend(document.getElementById('sbFriendTarget').value,document.getElementById('sbFriendNote').value);
 };
}

function friendOtherId(f){
 return f.requester_id===msgUser.id?f.addressee_id:f.requester_id;
}

function friendRow(f){
 let other=friendOtherId(f);
 let incoming=f.status==='pending'&&f.addressee_id===msgUser.id;

 return '<div class="sb-msg-person">'+
  profileAvatar(other)+
  '<div><b>'+esc(profileName(other,other))+'</b><small>'+esc(f.status)+' · '+esc(other)+'</small></div>'+
  '<div class="sb-msg-actions">'+
   (f.status==='accepted'?'<button class="sb-msg-btn primary" data-friend-compose="'+esc(other)+'" type="button">Message</button>':'')+
   (incoming?'<button class="sb-msg-btn primary" data-friend-accept="'+esc(f.id)+'" type="button">Accept</button><button class="sb-msg-btn warn" data-friend-decline="'+esc(f.id)+'" type="button">Decline</button>':'')+
   '<button class="sb-msg-btn bad" data-friend-remove="'+esc(f.id)+'" type="button">Remove</button>'+
  '</div>'+
 '</div>';
}

function renderBlocks(box){
 let mine=blocks.filter(b=>b.blocker_id===msgUser.id);

 box.innerHTML='<div class="sb-msg-grid">'+
  '<aside class="sb-msg-list">'+
   '<h3>Blocked users</h3>'+
   (mine.length?mine.map(blockRow).join(''):'<p>No blocked users.</p>')+
  '</aside>'+
  '<main class="sb-msg-detail">'+
   '<h2>Block by profile ID</h2>'+
   '<p>Blocked users cannot be messaged through this overlay when their profile ID is known.</p>'+
   '<div class="sb-msg-form"><label>Profile ID<input id="sbBlockTarget" placeholder="target user uuid"></label><label>Reason<input id="sbBlockReason" placeholder="Optional reason"></label><button id="sbBlockSend" class="sb-msg-btn bad" type="button">Block user</button></div>'+
  '</main>'+
 '</div>';

 box.querySelectorAll('[data-unblock]').forEach(btn=>btn.onclick=()=>unblockUser(btn.getAttribute('data-unblock')));

 document.getElementById('sbBlockSend').onclick=()=>{
  blockUser(document.getElementById('sbBlockTarget').value,document.getElementById('sbBlockReason').value);
 };
}

function blockRow(b){
 let other=b.blocked_id;

 return '<div class="sb-msg-person">'+
  profileAvatar(other)+
  '<div><b>'+esc(profileName(other,other))+'</b><small>'+esc(b.reason||'Blocked')+'</small></div>'+
  '<div><button class="sb-msg-btn" data-unblock="'+esc(b.id)+'" type="button">Unblock</button></div>'+
 '</div>';
}

async function canSendTo(targetId){
 targetId=String(targetId||'').trim();

 if(!targetId)return true;

 try{
  let c=await client();
  let r=await c.rpc('sb_can_send_private_message',{target_user_id:targetId});

  if(r.error)return true;

  return !!r.data;
 }catch(e){
  return true;
 }
}

async function sendNewMessage(){
 try{
  if(!msgUser)await refreshAuth();

  if(!msgUser){
   setMsgStatus('Sign in first.',true);
   return;
  }

  let toEmail=String(document.getElementById('sbMsgToEmail').value||'').trim();
  let toId=String(document.getElementById('sbMsgToId').value||'').trim();
  let subject=String(document.getElementById('sbMsgSubject').value||'Private message').trim();
  let body=String(document.getElementById('sbMsgBody').value||'').trim();

  if(!toEmail){
   setMsgStatus('Recipient email is required for sending. Profile ID is optional for avatar/friend/block matching.',true);
   return;
  }

  if(!body){
   setMsgStatus('Message body is required.',true);
   return;
  }

  if(toId&&!(await canSendTo(toId))){
   setMsgStatus('Message blocked by block/friend safety rules.',true);
   return;
  }

  let c=await client();

  let payload={
   page_slug:messagePageSlug(),
   sender_id:msgUser.id,
   sender_email:msgUser.email,
   sender_name:myName(),
   recipient_id:toId||null,
   recipient_email:toEmail,
   recipient_name:toEmail,
   subject:subject,
   body:body,
   kind:'message',
   status:'sent',
   meta:{
    source:'footer_shell_global_messenger',
    page_url:location.href,
    footer_version:VERSION
   }
  };

  let r=await c.from('sb_private_messages').insert(payload).select('*').maybeSingle();

  if(r.error)throw r.error;

  setMsgStatus('Private message sent.');
  msgTab='sent';
  document.querySelectorAll('[data-msg-tab]').forEach(x=>x.classList.toggle('active',x.getAttribute('data-msg-tab')==='sent'));
  await loadMessages();
 }catch(e){
  setMsgStatus('Send failed: '+(e.message||e),true);
 }
}

async function sendMessageReply(){
 try{
  if(!selectedMessage){
   setMsgStatus('Select a message first.',true);
   return;
  }

  if(!msgUser)await refreshAuth();

  if(!msgUser){
   setMsgStatus('Sign in first.',true);
   return;
  }

  let bodyBox=document.getElementById('sbMsgReplyBody');
  let body=String(bodyBox&&bodyBox.value||'').trim();

  if(!body){
   setMsgStatus('Reply body is required.',true);
   return;
  }

  let replyingToInbox=mineRecipient(selectedMessage);
  let recipientEmail=replyingToInbox
   ? String(selectedMessage.sender_email||'').trim()
   : String(selectedMessage.recipient_email||'').trim();
  let recipientId=replyingToInbox
   ? String(selectedMessage.sender_id||'').trim()
   : String(selectedMessage.recipient_id||'').trim();
  let recipientName=replyingToInbox
   ? String(selectedMessage.sender_name||selectedMessage.sender_email||recipientId||'recipient').trim()
   : String(selectedMessage.recipient_name||selectedMessage.recipient_email||recipientId||'recipient').trim();

  if(!recipientEmail){
   setMsgStatus('Reply needs the original sender email. Open full inbox for this older message if it has no sender_email saved.',true);
   return;
  }

  if(recipientId&&!(await canSendTo(recipientId))){
   setMsgStatus('Reply blocked by block/friend safety rules.',true);
   return;
  }

  let c=await client();

  let payload={
   page_slug:selectedMessage.page_slug||messagePageSlug(),
   form_submission_id:selectedMessage.form_submission_id||null,
   sender_id:msgUser.id,
   sender_email:msgUser.email,
   sender_name:myName(),
   recipient_id:recipientId||null,
   recipient_email:recipientEmail,
   recipient_name:recipientName,
   subject:'Re: '+(selectedMessage.subject||'Private message'),
   body:body,
   kind:'message',
   status:'sent',
   meta:{
    source:'footer_shell_inbox_reply',
    reply_to:selectedMessage.id,
    original_kind:selectedMessage.kind||'',
    page_url:location.href,
    footer_version:VERSION
   }
  };

  let r=await c.from('sb_private_messages').insert(payload).select('*').maybeSingle();

  if(r.error)throw r.error;

  setMsgStatus('Reply sent.');
  if(bodyBox)bodyBox.value='';

  msgTab='sent';
  selectedMessage=r.data||null;

  document.querySelectorAll('[data-msg-tab]').forEach(x=>{
   x.classList.toggle('active',x.getAttribute('data-msg-tab')==='sent');
  });

  await loadMessages();
 }catch(e){
  setMsgStatus('Reply failed: '+(e.message||e),true);
 }
}

async function trashSelectedMessage(){
 try{
  if(!selectedMessage||!msgUser)return;

  let patch=mineSender(selectedMessage)?{sender_trashed_at:new Date().toISOString()}:{recipient_trashed_at:new Date().toISOString()};
  let c=await client();
  let r=await c.from('sb_private_messages').update(patch).eq('id',selectedMessage.id);

  if(r.error)throw r.error;

  setMsgStatus('Message moved to trash for you.');
  await loadMessages();
 }catch(e){
  setMsgStatus('Trash failed: '+(e.message||e),true);
 }
}

async function requestFriend(targetId,note){
 try{
  targetId=String(targetId||'').trim();

  if(!targetId){setMsgStatus('Target profile ID is required.',true);return;}
  if(!msgUser)await refreshAuth();
  if(!msgUser){setMsgStatus('Sign in first.',true);return;}
  if(targetId===msgUser.id){setMsgStatus('You cannot add yourself.',true);return;}

  let c=await client();
  let payload={requester_id:msgUser.id,addressee_id:targetId,status:'pending',requester_note:String(note||'').trim()||null};
  let r=await c.from('sb_user_friends').insert(payload).select('*').maybeSingle();

  if(r.error)throw r.error;

  setMsgStatus('Friend request sent.');
  await loadFriendsAndBlocks(true);
 }catch(e){
  setMsgStatus('Friend request failed: '+(e.message||e),true);
 }
}

async function updateFriend(id,status){
 try{
  let c=await client();
  let r=await c.from('sb_user_friends').update({status:status}).eq('id',id);

  if(r.error)throw r.error;

  setMsgStatus('Friend request '+status+'.');
  await loadFriendsAndBlocks(true);
 }catch(e){
  setMsgStatus('Friend update failed: '+(e.message||e),true);
 }
}

async function deleteFriend(id){
 try{
  let c=await client();
  let r=await c.from('sb_user_friends').delete().eq('id',id);

  if(r.error)throw r.error;

  setMsgStatus('Friend relationship removed.');
  await loadFriendsAndBlocks(true);
 }catch(e){
  setMsgStatus('Remove failed: '+(e.message||e),true);
 }
}

async function blockUser(targetId,reason){
 try{
  targetId=String(targetId||'').trim();

  if(!targetId){setMsgStatus('Target profile ID is required.',true);return;}
  if(!msgUser)await refreshAuth();
  if(!msgUser){setMsgStatus('Sign in first.',true);return;}
  if(targetId===msgUser.id){setMsgStatus('You cannot block yourself.',true);return;}

  let c=await client();
  let payload={blocker_id:msgUser.id,blocked_id:targetId,reason:String(reason||'').trim()||null};
  let r=await c.from('sb_user_blocks').upsert(payload,{onConflict:'blocker_id,blocked_id'}).select('*').maybeSingle();

  if(r.error)throw r.error;

  setMsgStatus('User blocked.');
  await loadFriendsAndBlocks(true);
 }catch(e){
  setMsgStatus('Block failed: '+(e.message||e),true);
 }
}

async function unblockUser(id){
 try{
  let c=await client();
  let r=await c.from('sb_user_blocks').delete().eq('id',id);

  if(r.error)throw r.error;

  setMsgStatus('User unblocked.');
  await loadFriendsAndBlocks(true);
 }catch(e){
  setMsgStatus('Unblock failed: '+(e.message||e),true);
 }
}

function updateFooterMessageBadge(){
 let c=document.getElementById('sbFooterMessageCount');
 if(!c)return;

 let n=unreadCount();
 c.textContent=n?String(n):'';
}

async function openMessages(){
 ensureMessenger();

 let scrim=document.getElementById('sbGlobalMessagesScrim');
 if(scrim)scrim.classList.add('open');

 document.body.classList.add('sb-menu-open');

 if(!msgLoaded)await loadMessages();
 else renderMessenger();
}

function closeMessages(){
 let scrim=document.getElementById('sbGlobalMessagesScrim');
 if(scrim)scrim.classList.remove('open');
 document.body.classList.remove('sb-menu-open');
}

function boot(){
 applyTheme();
 ensure();

 setTimeout(refresh,400);
 setTimeout(refresh,1400);
 setInterval(refresh,6000);

 window.StreamBanditFooterShell={
  version:VERSION,
  routes:ROUTES,
  groups:GROUPS,
  refresh:refresh,
  openMessages:openMessages,
  closeMessages:closeMessages,
  loadMessages:loadMessages,
  state:function(){
   return {
    version:VERSION,
    current:cur(),
    activeGroup:activeGroup(),
    messagesLoaded:msgLoaded,
    signedIn:!!msgUser,
    messageCount:messages.length,
    unreadCount:unreadCount(),
    friends:friends.length,
    blocks:blocks.length,
    messagePageSlug:messagePageSlug(),
    sendPayloadPattern:'form-inbox-compatible',
    inboxReplyPayload:'fixed-v7-12-298-2',
    tables:['sb_private_messages','sb_profiles','sb_user_friends','sb_user_blocks'],
    schemaChanges:false,
    storageChanges:false,
    routeRegistryChanges:false
   };
  }
 };

 document.documentElement.dataset.sbFooterShell='v7-12-298-2';
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
