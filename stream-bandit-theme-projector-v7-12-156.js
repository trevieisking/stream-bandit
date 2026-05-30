/* Stream Bandit Theme Projector V7.12.156
   Reads the theme owned by web-builder-theme-studio-controls-v7-8-9-test.html
   and projects it onto every page through shared CSS variables.
   This file does not own or edit the theme. */
(function(){
'use strict';
const VERSION='V7.12.156 Theme Projector';
const OWNER='web-builder-theme-studio-controls-v7-8-9-test.html';
const KEYS=['streamBanditTheme','stream-bandit-theme','sbTheme','sb_theme','web_builder_shared_style_v7_8_8','web_builder_style'];
const DEFAULT={accent:'#22d3a6',accent2:'#7c3cff',bg:'#050711',background:'#050711',card:'#101529',card2:'#17122d',p:'#101529',p2:'#17122d',title:'#ffffff',titleColor:'#ffffff',muted:'#b9c0d8',textColor:'#b9c0d8',btnText:'#ffffff',buttonText:'#ffffff',font:'Inter,system-ui,Arial,sans-serif',fontScale:'1',line:'#ffffff22'};
let last='';
function readLocal(){for(const k of KEYS){try{const raw=localStorage.getItem(k);if(raw){const obj=JSON.parse(raw);if(obj&&typeof obj==='object')return obj;}}catch(e){}}return null;}
function pick(s,a,b,c){return s[a]||s[b]||s[c]||DEFAULT[a]||DEFAULT[b]||DEFAULT[c]||'';}
function normalized(theme){theme=theme&&typeof theme==='object'?theme:{};const out=Object.assign({},DEFAULT,theme);out.bg=pick(out,'bg','background');out.background=out.bg;out.p=pick(out,'p','card');out.card=out.p;out.p2=pick(out,'p2','card2')||out.p;out.card2=out.p2;out.title=pick(out,'title','titleColor');out.titleColor=out.title;out.muted=pick(out,'muted','textColor');out.textColor=out.muted;out.btnText=pick(out,'btnText','buttonText');out.buttonText=out.btnText;out.fontScale=String(out.fontScale||((out.largeText)?'1.12':'1'));out.line=out.line||(out.highContrast?'#ffffff66':'#ffffff22');return out;}
function apply(theme,source){const s=normalized(theme);const sig=JSON.stringify({accent:s.accent,accent2:s.accent2,bg:s.bg,p:s.p,p2:s.p2,title:s.title,muted:s.muted,btnText:s.btnText,font:s.font,fontScale:s.fontScale,line:s.line});if(sig===last&&source!=='force')return s;last=sig;const r=document.documentElement;r.style.setProperty('--accent',s.accent);r.style.setProperty('--accent2',s.accent2);r.style.setProperty('--bg',s.bg);r.style.setProperty('--background',s.bg);r.style.setProperty('--p',s.p);r.style.setProperty('--p2',s.p2);r.style.setProperty('--card',s.p);r.style.setProperty('--card2',s.p2);r.style.setProperty('--title',s.title);r.style.setProperty('--muted',s.muted);r.style.setProperty('--textColor',s.muted);r.style.setProperty('--btnText',s.btnText);r.style.setProperty('--buttonText',s.btnText);r.style.setProperty('--fontScale',s.fontScale);r.style.setProperty('--line',s.line);try{document.body.style.fontFamily=s.font||DEFAULT.font;}catch(e){}r.dataset.sbThemeProjector='v7-12-156';r.dataset.sbThemeOwner=OWNER;r.dataset.sbThemeSource=source||s.source||'local';try{window.dispatchEvent(new CustomEvent('streambandit:theme-projected',{detail:s}));}catch(e){}return s;}
function refresh(force){const s=readLocal()||DEFAULT;return apply(s,force?'force':'local');}
function saveAndApply(theme){const s=normalized(theme);KEYS.forEach(k=>{try{localStorage.setItem(k,JSON.stringify(s));}catch(e){}});return apply(s,'saved-local');}
function boot(){refresh(true);setTimeout(()=>refresh(true),250);setTimeout(()=>refresh(true),1000);setInterval(()=>refresh(false),3000);window.addEventListener('storage',e=>{if(!e.key||KEYS.includes(e.key))refresh(true);});window.addEventListener('streambandit:theme-updated',e=>{if(e&&e.detail)apply(e.detail,'theme-updated-event');else refresh(true);});window.StreamBanditThemeProjector={version:VERSION,owner:OWNER,keys:KEYS,refresh:()=>refresh(true),apply:apply,saveAndApply:saveAndApply,read:readLocal,state:()=>({version:VERSION,owner:OWNER,theme:normalized(readLocal()||DEFAULT)})};}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
