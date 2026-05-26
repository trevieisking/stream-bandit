(function(){
'use strict';
const VERSION='V7.12.92 Shared Style + Strong Mobile No Side Scroll Helper';
const STYLE_KEY='web_builder_shared_style_v7_8_8';
let sb=null;
function readCfg(){return fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text()).then(txt=>({url:(txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1]||'',key:(txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1]||''})).catch(()=>({url:'',key:''}));}
async function client(){if(sb)return sb;if(!window.supabase||!window.supabase.createClient)return null;const c=await readCfg();if(c.url&&c.key)sb=window.supabase.createClient(c.url,c.key);return sb;}
function installMobileNoSideScroll(){
  let style=document.getElementById('sbMobileNoSideScrollHelper');
  const css='html,body{width:100%!important;max-width:100vw!important;overflow-x:hidden!important}body{position:relative!important}*,*::before,*::after{box-sizing:border-box!important}.wrap,.container,main,header,section,.panel,.hero,.box,.card,.grid,.footerGrid,.movieGrid,.checks,.stats,.head,.modalPanel{max-width:100%!important}.card,.movie,.check,.footerCol,.note,.status,.good,.danger,.modalPanel,.field,p,li,a,label,small,b,h1,h2,h3,pre,code{overflow-wrap:anywhere!important;word-break:break-word!important}img,video,iframe,canvas,svg{max-width:100%!important;height:auto!important}.searchWrap,.search,.topSearch,.controls,.actions,.tabs,.chips,.field,input,textarea,select,button{max-width:100%!important;min-width:0!important}@media(max-width:760px){body{padding-left:max(12px,env(safe-area-inset-left))!important;padding-right:max(12px,env(safe-area-inset-right))!important}.wrap{width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important;overflow-x:hidden!important}.panel,.hero,.box,section,main{width:100%!important;margin-left:0!important;margin-right:0!important;overflow-x:hidden!important}.head{grid-template-columns:minmax(0,1fr)!important;overflow:visible!important}.brand,.muted,.searchWrap,.search,.topSearch{min-width:0!important;width:100%!important}.grid,.footerGrid,.movieGrid,.checks,.stats{grid-template-columns:minmax(0,1fr)!important}.actions,.tabs,.chips,.controls{width:100%!important;justify-content:flex-start!important;overflow-x:hidden!important}.btn,.tab{max-width:100%!important;white-space:normal!important;line-height:1.25!important}.actions .btn,.tabs .tab{flex:1 1 auto!important}.searchOverlay{left:0!important;right:auto!important;width:calc(100vw - 24px)!important;max-width:calc(100vw - 24px)!important}.modal{padding:12px!important;align-items:flex-start!important;overflow-y:auto!important;overflow-x:hidden!important}.modalPanel{width:100%!important;max-width:calc(100vw - 24px)!important;margin:0!important;overflow-x:hidden!important}.top{min-width:0!important;flex-wrap:wrap!important}input,textarea,select{min-width:0!important;width:100%!important}.field{width:100%!important}.card,.movie,.check,.footerCol{overflow:hidden!important;overflow-wrap:anywhere!important}.code,pre{white-space:pre-wrap!important;overflow-x:hidden!important}}';
  if(!style){style=document.createElement('style');style.id='sbMobileNoSideScrollHelper';document.head.appendChild(style);} 
  if(style.textContent!==css)style.textContent=css;
  document.documentElement.dataset.streamBanditMobileNoSideScroll='loaded';
  clampWideElements();
}
function clampWideElements(){
  try{
    const vw=Math.max(document.documentElement.clientWidth||0, window.innerWidth||0);
    document.querySelectorAll('body *').forEach(el=>{
      if(el.id==='sbMenuOverlay'||el.classList.contains('sb-menu-overlay'))return;
      const rect=el.getBoundingClientRect();
      if(rect.width>vw+2 || rect.left<-2 || rect.right>vw+2){
        el.style.maxWidth='100%';
        el.style.overflowWrap='anywhere';
        if(getComputedStyle(el).position!=='fixed')el.style.overflowX='hidden';
      }
    });
  }catch(e){}
}
function applyStyle(s){s=s||{};const root=document.documentElement;root.style.setProperty('--accent',s.accent||'#22d3a6');root.style.setProperty('--good',s.accent||'#22d3a6');root.style.setProperty('--accent2',s.accent2||'#7c3cff');root.style.setProperty('--purple',s.accent2||'#7c3cff');root.style.setProperty('--bg',s.bg||'#050711');root.style.setProperty('--card',s.card||'#101529');root.style.setProperty('--p',s.card||'#101529');root.style.setProperty('--p2',s.card||'#17122d');root.style.setProperty('--title',s.titleColor||'#ffffff');root.style.setProperty('--muted',s.textColor||'#b9c0d8');root.style.setProperty('--btnText',s.buttonText||'#ffffff');root.style.setProperty('--fontScale',s.largeText?'1.12':'1');root.style.setProperty('--line',s.highContrast?'#ffffff66':'#ffffff22');if(s.font)document.body.style.fontFamily=s.font;installMobileNoSideScroll();document.documentElement.dataset.streamBanditSharedStyle='loaded';}
async function load(){try{installMobileNoSideScroll();const c=await client();if(!c)return null;const r=await c.from('sb_app_settings').select('settings').eq('id','stream_bandit').maybeSingle();if(r.error)throw r.error;const settings=(r.data&&r.data.settings)||{};const style=settings[STYLE_KEY]||settings.web_builder_style||settings.builderStyle||{};applyStyle(style);document.dispatchEvent(new CustomEvent('streambandit:shared-style-loaded',{detail:{version:VERSION,style}}));return style;}catch(e){installMobileNoSideScroll();document.dispatchEvent(new CustomEvent('streambandit:shared-style-error',{detail:{version:VERSION,error:e.message||String(e)}}));return null;}}
window.StreamBanditSharedStyle={version:VERSION,load,applyStyle,installMobileNoSideScroll,clampWideElements};
installMobileNoSideScroll();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(load,100));else setTimeout(load,100);
window.addEventListener('resize',()=>setTimeout(installMobileNoSideScroll,60));
setTimeout(installMobileNoSideScroll,250);
setTimeout(installMobileNoSideScroll,800);
setTimeout(installMobileNoSideScroll,1800);
setTimeout(installMobileNoSideScroll,3500);
})();