/* Stream Bandit Footer Shell V7.12.156
   Compact tabbed global footer. Reads global theme variables; theme owner remains Theme Studio.
   Browse cleanup:
   - Library stays in Watch only.
   - Browse now contains Supabase Library Editor, Genres, Global Search and About.
*/
(function(){
'use strict';

const VERSION='V7.12.156 Footer Shell';
const THEME_OWNER='web-builder-theme-studio-controls-v7-8-9-test.html';

const ROUTES={
 home:'home-global-helpers-v7-4-4-test.html',
 library:'library-global-helpers-v7-4-8-test.html',
 supabaseLibrary:'supabase-library-home-header-form-fix-v7-12-34-test.html',
 genres:'genres-clean-machine-v7-12-45-test.html',
 search:'global-search-global-helpers-v7-4-9-test.html',
 about:'about-global-helpers-v7-4-7-test.html',
 details:'details-clean-machine-v7-12-38-test.html',
 player1:'player-one-global-helpers-v7-3-3-test.html',
 player2:'player-2-progress-helper-v6-78-9-4-test.html',
 continueWatching:'continue-watching-global-helpers-v7-3-9-test.html',
 watchHistory:'watch-history-global-helpers-v7-4-0-test.html',
 watchlist:'watchlist-clean-machine-v7-12-43-test.html',
 favourites:'favourites-clean-machine-v7-12-41-test.html',
 likes:'likes-clean-machine-v7-12-42-test.html',
 accessibility:'accessibility-clean-machine-v7-12-44-test.html',
 playlists:'playlists-global-helpers-v7-5-2-test.html',
 channels:'channels-global-helpers-v7-5-3-test.html',
 myChannel:'my-channel-clean-machine-v7-12-47-test.html',
 collections:'collections-clean-machine-v7-12-48-test.html',
 submit:'submit-video-clean-machine-v7-12-79-test.html',
 rules:'rules-clean-machine-v7-12-82-test.html',
 review:'review-queue-clean-machine-v7-12-80-publish-test.html',
 settings:'settings-platform-control-hub-v7-12-85-test.html',
 theme:THEME_OWNER,
 profile:'profile-settings-live-ready-v7-12-90-test.html',
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
 'all-pages-version-registry-v7-1-4-full-test.html':ROUTES.registry,
 'admin-centre-command-deck-v7-10-0-test.html':ROUTES.admin,
 'tools-page-global-helpers-v7-10-1-test.html':ROUTES.tools,
 'web-builder-live-studio-v7-12-97-test.html':ROUTES.builder,
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

const GROUPS=[
 ['Watch',[
  ['Home',ROUTES.home],
  ['Library',ROUTES.library],
  ['Details',ROUTES.details],
  ['Player 1',ROUTES.player1],
  ['Continue Watching',ROUTES.continueWatching],
  ['Watch History',ROUTES.watchHistory]
 ]],
 ['Saved',[
  ['Watchlist',ROUTES.watchlist],
  ['Favourites',ROUTES.favourites],
  ['Likes',ROUTES.likes],
  ['Accessibility',ROUTES.accessibility],
  ['Profile',ROUTES.profile]
 ]],
 ['Browse',[
  ['Supabase Library Editor',ROUTES.supabaseLibrary],
  ['Genres',ROUTES.genres],
  ['Global Search',ROUTES.search],
  ['About',ROUTES.about]
 ]],
 ['Creator',[
  ['Submit Video',ROUTES.submit],
  ['Rules',ROUTES.rules],
  ['Review Queue',ROUTES.review],
  ['My Channel',ROUTES.myChannel],
  ['Player 2',ROUTES.player2]
 ]],
 ['Builder',[
  ['Web Builder Studio',ROUTES.builder],
  ['Pages Manager',ROUTES.pagesManager],
  ['Published Preview',ROUTES.preview],
  ['Form Inbox',ROUTES.formInbox],
  ['Advanced Form',ROUTES.formAdvanced],
  ['Theme Studio',ROUTES.theme]
 ]],
 ['Policy',[
  ['Policy Documents',ROUTES.policyCentre],
  ['Policy Proof',ROUTES.policyReader],
  ['Policy Admin Editor',ROUTES.policyAdmin]
 ]],
 ['Admin',[
  ['Admin Centre',ROUTES.admin],
  ['Live Readiness',ROUTES.readiness],
  ['Current Routes Registry',ROUTES.registry],
  ['Test Checklist',ROUTES.checklist],
  ['Tools',ROUTES.tools],
  ['Health Check',ROUTES.health],
  ['Mux Manager',ROUTES.mux],
  ['Storage Prep',ROUTES.storage],
  ['Backup / Safety',ROUTES.backup]
 ]],
 ['Owner',[
  ['One Machine',ROUTES.oneMachine],
  ['Platform Control Centre',ROUTES.platformControl],
  ['Clean Machine Menu',ROUTES.registry],
  ['Route Guard Proof',ROUTES.health],
  ['Route Pointer Machine',ROUTES.registry],
  ['Final Shell Navigation',ROUTES.helperShell],
  ['Brand / App Icons',ROUTES.brandIcons],
  ['Brand Image Helper',ROUTES.brandIcons],
  ['Favicon / App Icon Builder',ROUTES.brandIcons]
 ]]
];

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

function activeGroup(){
 let c=cur();
 for(const g of GROUPS){
  if(g[1].some(x=>same(x[1],c)))return g[0];
 }
 return 'Watch';
}

function css(){
 if(document.getElementById('sbFooterShellCss'))return;

 let s=document.createElement('style');
 s.id='sbFooterShellCss';
 s.textContent=':root{--sbLine:var(--line,#ffffff22);--sbP:var(--p,#101529);--sbP2:var(--p2,#17122d);--sbA:var(--accent,#22d3a6);--sbA2:var(--accent2,#7c3cff);--sbM:var(--muted,#b9c0d8)}.sb-old-page-footer-hidden{display:none!important}.sb-footer-shell{border:1px solid var(--sbLine);border-radius:24px;background:linear-gradient(135deg,var(--sbP),var(--sbP2));box-shadow:0 14px 48px #0007;padding:14px;margin:14px 0;color:#fff}.sb-footer-top{display:grid;grid-template-columns:minmax(220px,1fr) 2.4fr;gap:12px;align-items:start}.sb-footer-brand{border:1px solid #ffffff18;border-radius:18px;background:#ffffff0b;padding:12px}.sb-footer-brand h2{font-size:22px;margin:0 0 5px}.sb-footer-brand p{margin:0 0 6px;color:var(--sbM);line-height:1.35}.sb-footer-brand small{color:var(--sbM)}.sb-footer-tabs{display:flex;flex-wrap:wrap;gap:7px;align-items:center}.sb-footer-tab{border:1px solid #ffffff20;border-radius:999px;background:#ffffff12;color:#baf7df;font-weight:950;padding:8px 11px;cursor:pointer}.sb-footer-tab.current{background:linear-gradient(135deg,var(--sbA),var(--sbA2));color:#061017;border-color:#ffffff55}.sb-footer-panel{margin-top:12px;border:1px solid #ffffff18;border-radius:18px;background:#ffffff0b;padding:12px}.sb-footer-panel-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px}.sb-footer-panel-head b{color:#baf7df}.sb-footer-links{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,180px));gap:10px;justify-content:start;align-items:stretch}.sb-footer-links a{display:flex;align-items:center;justify-content:center;text-align:center;color:#baf7df;text-decoration:none;font-weight:950;border-radius:15px;background:#ffffff0e;border:1px solid #ffffff12;padding:10px 12px;width:180px;min-width:180px;max-width:180px;height:54px;min-height:54px;max-height:54px;line-height:1.1;overflow:hidden}.sb-footer-links a.current{color:#fff;background:linear-gradient(135deg,#22d3a638,#7c3cff38);border-color:#22d3a670;box-shadow:0 0 0 2px #22d3a618}.sb-footer-note{margin-top:10px;text-align:center;color:#8f98b8;font-size:12px}@media(max-width:900px){.sb-footer-top{grid-template-columns:1fr}.sb-footer-tab{flex:1;min-width:88px}.sb-footer-links{grid-template-columns:repeat(auto-fit,minmax(155px,155px));justify-content:center}.sb-footer-links a{width:155px;min-width:155px;max-width:155px;height:50px;min-height:50px;max-height:50px}}@media(max-width:520px){.sb-footer-shell{padding:12px}.sb-footer-tabs{display:grid;grid-template-columns:repeat(2,1fr)}.sb-footer-links{grid-template-columns:1fr;justify-content:stretch}.sb-footer-links a{width:100%;min-width:0;max-width:none;height:48px;min-height:48px;max-height:48px}}';
 document.head.appendChild(s);
}

function hideOld(){
 try{
  let w=document.querySelector('.wrap')||document.body;
  Array.from(w.children).forEach(el=>{
   if(el.id!=='sbFooterShell'&&el.matches&&el.matches('section.footer,.footer,footer')){
    el.classList.add('sb-old-page-footer-hidden');
   }
  });
 }catch(e){}
}

function applyTheme(){
 try{
  if(window.StreamBanditThemeProjector&&window.StreamBanditThemeProjector.refresh){
   window.StreamBanditThemeProjector.refresh();
  }else if(window.StreamBanditSettingsGlobal&&window.StreamBanditSettingsGlobal.refresh){
   window.StreamBanditSettingsGlobal.refresh();
  }
 }catch(e){}
 document.documentElement.dataset.sbThemeReaderFooter='footer-shell';
}

function panel(name){
 let c=cur();
 let g=GROUPS.find(x=>x[0]===name)||GROUPS[0];

 return '<div class="sb-footer-panel-head"><b>'+esc(g[0])+'</b><small>'+g[1].length+' links</small></div><div class="sb-footer-links">'+g[1].map(x=>'<a class="'+(same(x[1],c)?'current':'')+'" href="'+esc(route(x[1]))+'">'+esc(x[0])+'</a>').join('')+'</div>';
}

function html(){
 let ag=activeGroup();

 return '<footer id="sbFooterShell" class="sb-footer-shell" data-version="'+esc(VERSION)+'" data-active-group="'+esc(ag)+'"><div class="sb-footer-top"><div class="sb-footer-brand"><h2>Stream Bandit</h2><p>Global footer shell. Compact route tabs, current links, theme read from Theme Studio.</p><small>'+esc(VERSION)+'</small></div><div><div class="sb-footer-tabs" role="tablist" aria-label="Footer navigation groups">'+GROUPS.map(g=>'<button class="sb-footer-tab '+(g[0]===ag?'current':'')+'" type="button" data-sb-footer-tab="'+esc(g[0])+'">'+esc(g[0])+'</button>').join('')+'</div><div id="sbFooterPanel" class="sb-footer-panel">'+panel(ag)+'</div></div></div><div class="sb-footer-note">Header + page + compact footer tabs. Theme read globally, owned by Theme Studio.</div></footer>';
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
}

function ensure(){
 css();
 hideOld();
 let w=document.querySelector('.wrap')||document.body;
 if(!document.getElementById('sbFooterShell'))w.insertAdjacentHTML('beforeend',html());
 wire();
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
 patch();
 wire();
}

function boot(){
 refresh();

 window.StreamBanditFooterShell={
  version:VERSION,
  routes:ROUTES,
  refresh,
  showGroup:function(name){
   let f=document.getElementById('sbFooterShell');
   let b=f&&f.querySelector('[data-sb-footer-tab="'+name+'"]');
   if(b)b.click();
  },
  state:()=>({
   version:VERSION,
   current:cur(),
   activeGroup:(document.getElementById('sbFooterShell')||{}).dataset&&document.getElementById('sbFooterShell').dataset.activeGroup,
   themeOwner:THEME_OWNER
  })
 };

 document.documentElement.dataset.sbFooterShell='v7-12-156-tabs';
 setTimeout(refresh,700);
 setTimeout(refresh,1800);
 setInterval(()=>{applyTheme();patch();},5000);
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
