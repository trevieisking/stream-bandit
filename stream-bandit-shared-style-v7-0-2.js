(function(){
'use strict';
const VERSION='V7.12.93 Shared Style + Mobile + Playlists Footer Helper';
const STYLE_KEY='web_builder_shared_style_v7_8_8';
let sb=null;
function readCfg(){return fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text()).then(txt=>({url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'',key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||''})).catch(()=>({url:'',key:''}));}
async function client(){if(sb)return sb;if(!window.supabase||!window.supabase.createClient)return null;const c=await readCfg();if(c.url&&c.key)sb=window.supabase.createClient(c.url,c.key);return sb;}
function installMobileNoSideScroll(){
  let style=document.getElementById('sbMobileNoSideScrollHelper');
  const css='html,body{width:100%!important;max-width:100vw!important;overflow-x:hidden!important}body{position:relative!important}*,*::before,*::after{box-sizing:border-box!important}.wrap,.container,main,header,section,.panel,.hero,.box,.card,.grid,.footerGrid,.movieGrid,.checks,.stats,.head,.modalPanel{max-width:100%!important}.card,.movie,.check,.footerCol,.note,.status,.good,.danger,.modalPanel,.field,p,li,a,label,small,b,h1,h2,h3,pre,code{overflow-wrap:anywhere!important;word-break:break-word!important}img,video,iframe,canvas,svg{max-width:100%!important;height:auto!important}.searchWrap,.search,.topSearch,.controls,.actions,.tabs,.chips,.field,input,textarea,select,button{max-width:100%!important;min-width:0!important}@media(max-width:760px){body{padding-left:max(12px,env(safe-area-inset-left))!important;padding-right:max(12px,env(safe-area-inset-right))!important}.wrap{width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important;overflow-x:hidden!important}.panel,.hero,.box,section,main{width:100%!important;margin-left:0!important;margin-right:0!important;overflow-x:hidden!important}.head{grid-template-columns:minmax(0,1fr)!important;overflow:visible!important}.brand,.muted,.searchWrap,.search,.topSearch{min-width:0!important;width:100%!important}.grid,.footerGrid,.movieGrid,.checks,.stats{grid-template-columns:minmax(0,1fr)!important}.actions,.tabs,.chips,.controls{width:100%!important;justify-content:flex-start!important;overflow-x:hidden!important}.btn,.tab{max-width:100%!important;white-space:normal!important;line-height:1.25!important}.actions .btn,.tabs .tab{flex:1 1 auto!important}.searchOverlay,.sb-search-overlay{left:0!important;right:auto!important;width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important}.modal{padding:12px!important;align-items:flex-start!important;overflow-y:auto!important;overflow-x:hidden!important}.modalPanel,.modalCard{width:100%!important;max-width:calc(100vw - 24px)!important;margin:0!important;overflow-x:hidden!important}.top,.modalHead,.postTop{min-width:0!important;flex-wrap:wrap!important}input,textarea,select{min-width:0!important;width:100%!important}.field{width:100%!important}.card,.movie,.check,.footerCol,.sb-global-footer-col{overflow:hidden!important;overflow-wrap:anywhere!important}.code,pre,.source{white-space:pre-wrap!important;overflow-x:hidden!important}}';
  if(!style){style=document.createElement('style');style.id='sbMobileNoSideScrollHelper';document.head.appendChild(style);} 
  if(style.textContent!==css)style.textContent=css;
  document.documentElement.dataset.streamBanditMobileNoSideScroll='loaded';
  clampWideElements();
}
function clampWideElements(){
  try{
    const vw=Math.max(document.documentElement.clientWidth||0, window.innerWidth||0);
    document.querySelectorAll('body *').forEach(el=>{
      if(el.id==='sbMenuOverlay'||el.id==='sbShellDrawer'||el.classList.contains('sb-menu-overlay')||el.classList.contains('sb-shell-drawer'))return;
      const rect=el.getBoundingClientRect();
      if(rect.width>vw+2 || rect.left<-2 || rect.right>vw+2){
        el.style.maxWidth='100%';
        el.style.overflowWrap='anywhere';
        if(getComputedStyle(el).position!=='fixed')el.style.overflowX='hidden';
      }
    });
  }catch(e){}
}
function isPlaylistsPage(){return /playlists-global-helpers-v7-5-2-test\.html$/i.test(location.pathname)||document.title.includes('Playlists Global Helpers');}
function installGlobalFooter(config){
  if(!config||!config.enabled)return;
  if(document.getElementById('sbGlobalFooter'))return;
  const wrap=document.querySelector('.wrap')||document.body;
  document.querySelectorAll('p.footer').forEach(el=>{el.style.display='none';});
  if(!document.getElementById('sbGlobalFooterStyle')){
    const style=document.createElement('style');
    style.id='sbGlobalFooterStyle';
    style.textContent='#sbGlobalFooter{display:block!important;visibility:visible!important;opacity:1!important;position:relative!important;z-index:5!important;border:1px solid var(--line,#ffffff22);border-radius:28px;background:linear-gradient(135deg,var(--p,#101529),var(--p2,#17122d));box-shadow:0 20px 70px #0007;padding:22px;margin:18px 0 28px;color:#fff}.sb-global-footer-grid{display:grid;grid-template-columns:1.3fr repeat(3,minmax(180px,1fr));gap:12px}.sb-global-footer-col{border:1px solid #ffffff1a;border-radius:18px;background:#ffffff0f;padding:14px;overflow-wrap:anywhere}.sb-global-footer-col b{display:block;color:#baf7df;margin-bottom:8px}.sb-global-footer-col a{display:block;color:#baf7df;text-decoration:none;margin:7px 0;font-weight:850}.sb-global-footer-col small{color:#8f98b8}@media(max-width:980px){.sb-global-footer-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }
  const footer=document.createElement('section');
  footer.id='sbGlobalFooter';
  footer.setAttribute('aria-label','Stream Bandit Global Footer');
  footer.innerHTML='<div class="sb-global-footer-grid"><div class="sb-global-footer-col"><b>Stream Bandit</b><small>'+config.note+'</small></div><div class="sb-global-footer-col"><b>Watch</b><a href="home-global-helpers-v7-4-4-test.html">Home</a><a href="details-clean-machine-v7-12-38-test.html">Details</a><a href="player-one-global-helpers-v7-3-3-test.html">Player 1</a></div><div class="sb-global-footer-col"><b>Browse</b><a href="library-global-helpers-v7-4-8-test.html">Library</a><a href="global-search-global-helpers-v7-4-9-test.html">Search</a><a href="genres-clean-machine-v7-12-45-test.html">Genres</a></div><div class="sb-global-footer-col"><b>'+config.lastTitle+'</b>'+config.lastLinks+'</div></div>';
  wrap.appendChild(footer);
  document.documentElement.dataset.streamBanditGlobalFooter=config.key;
}
function playlistFooterConfig(){
  if(!isPlaylistsPage())return {enabled:false};
  return {enabled:true,key:'playlists-v7-12-93',note:'Playlists live-polish pass V7.12.93. Playlist create/edit/upload/add/remove preserved. Payments disabled until billing is designed.',lastTitle:'Group Play',lastLinks:'<a href="playlists-global-helpers-v7-5-2-test.html">Playlists</a><a href="channels-global-helpers-v7-5-3-test.html">Channels</a><a href="my-channel-clean-machine-v7-12-47-test.html">My Channel</a><a href="collections-clean-machine-v7-12-48-test.html">Collections</a><a href="player-2-progress-helper-v6-78-9-4-test.html">Player 2</a>'};
}
function polishPlaylistsPage(){
  if(!isPlaylistsPage())return;
  try{
    document.querySelectorAll('a[href*="details-global-helpers-v7-3-1-test.html"]').forEach(a=>{a.setAttribute('href',a.getAttribute('href').replace('details-global-helpers-v7-3-1-test.html','details-clean-machine-v7-12-38-test.html'));});
    document.querySelectorAll('.check p,.card p,.muted,.source').forEach(el=>{
      if(el.textContent&&el.textContent.includes('details-global-helpers-v7-3-1-test.html'))el.textContent=el.textContent.replaceAll('details-global-helpers-v7-3-1-test.html','details-clean-machine-v7-12-38-test.html');
      if(el.textContent&&el.textContent.includes('Details V7.3.1'))el.textContent=el.textContent.replaceAll('Details V7.3.1','Clean Details V7.12.76');
    });
    document.documentElement.dataset.streamBanditPlaylistsPolish='v7-12-93';
  }catch(e){}
}
function installPagePolish(){installGlobalFooter(playlistFooterConfig());polishPlaylistsPage();}
function applyStyle(s){s=s||{};const root=document.documentElement;root.style.setProperty('--accent',s.accent||'#22d3a6');root.style.setProperty('--good',s.accent||'#22d3a6');root.style.setProperty('--accent2',s.accent2||'#7c3cff');root.style.setProperty('--purple',s.accent2||'#7c3cff');root.style.setProperty('--bg',s.bg||'#050711');root.style.setProperty('--card',s.card||'#101529');root.style.setProperty('--p',s.card||'#101529');root.style.setProperty('--p2',s.card||'#17122d');root.style.setProperty('--title',s.titleColor||'#ffffff');root.style.setProperty('--muted',s.textColor||'#b9c0d8');root.style.setProperty('--btnText',s.buttonText||'#ffffff');root.style.setProperty('--fontScale',s.largeText?'1.12':'1');root.style.setProperty('--line',s.highContrast?'#ffffff66':'#ffffff22');if(s.font)document.body.style.fontFamily=s.font;installMobileNoSideScroll();installPagePolish();document.documentElement.dataset.streamBanditSharedStyle='loaded';}
async function load(){try{installMobileNoSideScroll();installPagePolish();const c=await client();if(!c)return null;const r=await c.from('sb_app_settings').select('settings').eq('id','stream_bandit').maybeSingle();if(r.error)throw r.error;const settings=(r.data&&r.data.settings)||{};const style=settings[STYLE_KEY]||settings.web_builder_style||settings.builderStyle||{};applyStyle(style);document.dispatchEvent(new CustomEvent('streambandit:shared-style-loaded',{detail:{version:VERSION,style}}));return style;}catch(e){installMobileNoSideScroll();installPagePolish();document.dispatchEvent(new CustomEvent('streambandit:shared-style-error',{detail:{version:VERSION,error:e.message||String(e)}}));return null;}}
window.StreamBanditSharedStyle={version:VERSION,load,applyStyle,installMobileNoSideScroll,clampWideElements,installPagePolish};
installMobileNoSideScroll();installPagePolish();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,100));else setTimeout(load,100);
window.addEventListener('resize',()=>setTimeout(()=>{installMobileNoSideScroll();installPagePolish();},60));
setTimeout(()=>{installMobileNoSideScroll();installPagePolish();},250);
setTimeout(()=>{installMobileNoSideScroll();installPagePolish();},800);
setTimeout(()=>{installMobileNoSideScroll();installPagePolish();},1800);
setTimeout(()=>{installMobileNoSideScroll();installPagePolish();},3500);
})();