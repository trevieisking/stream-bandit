(function(){
'use strict';
const VERSION='V7.12.91 Shared Style + Mobile No Side Scroll Helper';
const STYLE_KEY='web_builder_shared_style_v7_8_8';
let sb=null;
function readCfg(){return fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text()).then(txt=>({url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'',key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||''})).catch(()=>({url:'',key:''}));}
async function client(){if(sb)return sb;if(!window.supabase||!window.supabase.createClient)return null;const c=await readCfg();if(c.url&&c.key)sb=window.supabase.createClient(c.url,c.key);return sb;}
function installMobileNoSideScroll(){
  if(document.getElementById('sbMobileNoSideScrollHelper'))return;
  const style=document.createElement('style');
  style.id='sbMobileNoSideScrollHelper';
  style.textContent='html,body{max-width:100%!important;overflow-x:hidden!important}body{position:relative!important}.wrap,.container,main,header,section,.panel,.hero,.box,.card,.grid,.footerGrid,.movieGrid,.checks,.stats,.head{max-width:100%!important}img,video,iframe,canvas,svg{max-width:100%!important;height:auto}.searchWrap,.search,.topSearch,.controls,.actions,.tabs,.chips,.field,input,textarea,select,button{max-width:100%!important}@media(max-width:760px){body{padding-left:12px!important;padding-right:12px!important}.wrap{width:100%!important;margin-left:auto!important;margin-right:auto!important}.panel,.hero,.box{width:100%!important;margin-left:0!important;margin-right:0!important}.head{grid-template-columns:1fr!important}.grid,.footerGrid,.movieGrid,.checks,.stats{grid-template-columns:1fr!important}.actions,.tabs,.chips,.controls{width:100%!important;justify-content:flex-start!important}.btn,.tab{max-width:100%!important;white-space:normal!important}.searchOverlay{left:0!important;right:auto!important;width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important}.modal,.modalPanel,.panel{max-width:100%!important}.modalPanel{width:calc(100vw - 24px)!important}input,textarea,select{min-width:0!important;width:100%!important}.card,.movie,.check,.footerCol{overflow-wrap:anywhere!important}}';
  document.head.appendChild(style);
  document.documentElement.dataset.streamBanditMobileNoSideScroll='loaded';
}
function applyStyle(s){s=s||{};const root=document.documentElement;root.style.setProperty('--accent',s.accent||'#22d3a6');root.style.setProperty('--good',s.accent||'#22d3a6');root.style.setProperty('--accent2',s.accent2||'#7c3cff');root.style.setProperty('--purple',s.accent2||'#7c3cff');root.style.setProperty('--bg',s.bg||'#050711');root.style.setProperty('--card',s.card||'#101529');root.style.setProperty('--p',s.card||'#101529');root.style.setProperty('--p2',s.card||'#17122d');root.style.setProperty('--title',s.titleColor||'#ffffff');root.style.setProperty('--muted',s.textColor||'#b9c0d8');root.style.setProperty('--btnText',s.buttonText||'#ffffff');root.style.setProperty('--fontScale',s.largeText?'1.12':'1');root.style.setProperty('--line',s.highContrast?'#ffffff66':'#ffffff22');if(s.font)document.body.style.fontFamily=s.font;installMobileNoSideScroll();document.documentElement.dataset.streamBanditSharedStyle='loaded';}
async function load(){try{installMobileNoSideScroll();const c=await client();if(!c)return null;const r=await c.from('sb_app_settings').select('settings').eq('id','stream_bandit').maybeSingle();if(r.error)throw r.error;const settings=(r.data&&r.data.settings)||{};const style=settings[STYLE_KEY]||settings.web_builder_style||settings.builderStyle||{};applyStyle(style);document.dispatchEvent(new CustomEvent('streambandit:shared-style-loaded',{detail:{version:VERSION,style}}));return style;}catch(e){installMobileNoSideScroll();document.dispatchEvent(new CustomEvent('streambandit:shared-style-error',{detail:{version:VERSION,error:e.message||String(e)}}));return null;}}
window.StreamBanditSharedStyle={version:VERSION,load,applyStyle,installMobileNoSideScroll};
installMobileNoSideScroll();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,100));else setTimeout(load,100);
setTimeout(installMobileNoSideScroll,500);
setTimeout(installMobileNoSideScroll,1600);
})();