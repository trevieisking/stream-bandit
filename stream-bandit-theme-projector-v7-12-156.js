/* Stream Bandit Theme Projector V7.12.173
   Reads the theme owned by web-builder-theme-studio-controls-v7-8-9-test.html
   and projects it onto every page through shared CSS variables.
   Also carries the global Details route bridge so old/bare Details buttons keep the clicked movie id/title.
   V7.12.173 adds a tiny favicon bridge so two-shell pages such as Details load the approved favicon helper. */
(function(){
'use strict';

const VERSION='V7.12.173 Theme Projector + Details Route Bridge + Favicon Bridge';
const OWNER='web-builder-theme-studio-controls-v7-8-9-test.html';
const DETAILS='details-clean-machine-v7-12-38-test.html';
const FAVICON_HELPER='stream-bandit-favicon-v7-12-16.js';
const KEYS=['streamBanditTheme','stream-bandit-theme','sbTheme','sb_theme','web_builder_shared_style_v7_8_8','web_builder_style'];
const DEFAULT={accent:'#22d3a6',accent2:'#7c3cff',bg:'#050711',background:'#050711',card:'#101529',card2:'#17122d',p:'#101529',p2:'#17122d',title:'#ffffff',titleColor:'#ffffff',muted:'#b9c0d8',textColor:'#b9c0d8',btnText:'#ffffff',buttonText:'#ffffff',font:'Inter,system-ui,Arial,sans-serif',fontScale:'1',line:'#ffffff22'};

let last='';

function readLocal(){
  for(const k of KEYS){
    try{
      const raw=localStorage.getItem(k);
      if(raw){
        const obj=JSON.parse(raw);
        if(obj&&typeof obj==='object')return obj;
      }
    }catch(e){}
  }
  return null;
}

function pick(s,a,b,c){
  return s[a]||s[b]||s[c]||DEFAULT[a]||DEFAULT[b]||DEFAULT[c]||'';
}

function normalized(theme){
  theme=theme&&typeof theme==='object'?theme:{};
  const out=Object.assign({},DEFAULT,theme);
  out.bg=pick(out,'bg','background');
  out.background=out.bg;
  out.p=pick(out,'p','card');
  out.card=out.p;
  out.p2=pick(out,'p2','card2')||out.p;
  out.card2=out.p2;
  out.title=pick(out,'title','titleColor');
  out.titleColor=out.title;
  out.muted=pick(out,'muted','textColor');
  out.textColor=out.muted;
  out.btnText=pick(out,'btnText','buttonText');
  out.buttonText=out.btnText;
  out.fontScale=String(out.fontScale||((out.largeText)?'1.12':'1'));
  out.line=out.line||(out.highContrast?'#ffffff66':'#ffffff22');
  return out;
}

function apply(theme,source){
  const s=normalized(theme);
  const sig=JSON.stringify({
    accent:s.accent,
    accent2:s.accent2,
    bg:s.bg,
    p:s.p,
    p2:s.p2,
    title:s.title,
    muted:s.muted,
    btnText:s.btnText,
    font:s.font,
    fontScale:s.fontScale,
    line:s.line
  });

  if(sig===last&&source!=='force')return s;
  last=sig;

  const r=document.documentElement;
  r.style.setProperty('--accent',s.accent);
  r.style.setProperty('--accent2',s.accent2);
  r.style.setProperty('--bg',s.bg);
  r.style.setProperty('--background',s.bg);
  r.style.setProperty('--p',s.p);
  r.style.setProperty('--p2',s.p2);
  r.style.setProperty('--card',s.p);
  r.style.setProperty('--card2',s.p2);
  r.style.setProperty('--title',s.title);
  r.style.setProperty('--muted',s.muted);
  r.style.setProperty('--textColor',s.muted);
  r.style.setProperty('--btnText',s.btnText);
  r.style.setProperty('--buttonText',s.btnText);
  r.style.setProperty('--fontScale',s.fontScale);
  r.style.setProperty('--line',s.line);

  try{document.body.style.fontFamily=s.font||DEFAULT.font;}catch(e){}

  r.dataset.sbThemeProjector='v7-12-173';
  r.dataset.sbThemeOwner=OWNER;
  r.dataset.sbThemeSource=source||s.source||'local';

  try{
    window.dispatchEvent(new CustomEvent('streambandit:theme-projected',{detail:s}));
  }catch(e){}

  return s;
}

function refresh(force){
  const s=readLocal()||DEFAULT;
  return apply(s,force?'force':'local');
}

function saveAndApply(theme){
  const s=normalized(theme);
  KEYS.forEach(k=>{
    try{localStorage.setItem(k,JSON.stringify(s));}catch(e){}
  });
  return apply(s,'saved-local');
}

function loadFaviconHelper(){
  try{
    if(window.StreamBanditFavicon&&window.StreamBanditFavicon.refresh){
      window.StreamBanditFavicon.refresh();
      return;
    }

    if(Array.from(document.scripts||[]).some(s=>String(s.src||'').includes(FAVICON_HELPER)))return;

    let s=document.createElement('script');
    s.src=FAVICON_HELPER+'?v=theme-projector-favicon-bridge-1';
    s.defer=true;
    s.dataset.sbLoadedBy='theme-projector-favicon-bridge';
    document.head.appendChild(s);
  }catch(e){}
}

function refreshFavicon(){
  try{
    if(window.StreamBanditFavicon&&window.StreamBanditFavicon.refresh)window.StreamBanditFavicon.refresh();
    else loadFaviconHelper();
  }catch(e){}
}

function file(u){
  return String(u||'').split('/').pop().split('?')[0].split('#')[0];
}

function clean(s){
  return String(s||'').replace(/\s+/g,' ').trim();
}

function first(){
  for(let i=0;i<arguments.length;i++){
    let v=arguments[i];
    if(v!==undefined&&v!==null&&String(v).trim()!=='')return clean(v);
  }
  return '';
}

function isDetailsHref(href){
  return file(href)===DETAILS||String(href||'').includes('/'+DETAILS);
}

function readStoredTarget(){
  try{
    return JSON.parse(sessionStorage.getItem('streamBanditDetailsTarget')||localStorage.getItem('streamBanditDetailsTarget')||'{}')||{};
  }catch(e){
    return {};
  }
}

function storeTarget(t){
  try{
    let obj={
      id:first(t.id,t.movie_id,t.movieId),
      title:first(t.title,t.name),
      source:first(t.source,'details-route-bridge'),
      at:Date.now()
    };
    if(obj.id||obj.title){
      sessionStorage.setItem('streamBanditDetailsTarget',JSON.stringify(obj));
      localStorage.setItem('streamBanditDetailsTarget',JSON.stringify(obj));
    }
  }catch(e){}
}

function attrAny(el,names){
  if(!el)return '';
  for(const n of names){
    let v=el.getAttribute&&el.getAttribute(n);
    if(v)return v;
    if(el.dataset){
      let key=n.replace(/^data-/,'').replace(/-([a-z])/g,(m,c)=>c.toUpperCase());
      if(el.dataset[key])return el.dataset[key];
    }
  }
  return '';
}

function inferTarget(a){
  let href=a.getAttribute('href')||'';
  let url=null;

  try{url=new URL(href,location.href);}catch(e){}

  let wrap=a.closest('[data-movie-id],[data-card-id],[data-id],[data-sb-movie-id],[data-save-slot],article,.movie,.card,.result,.searchResult,.related');

  let id=first(
    url&&url.searchParams.get('id'),
    url&&url.searchParams.get('movie_id'),
    url&&url.searchParams.get('movieId'),
    attrAny(a,['data-movie-id','data-card-id','data-id','data-sb-movie-id','data-details-id','data-save-slot']),
    attrAny(wrap,['data-movie-id','data-card-id','data-id','data-sb-movie-id','data-details-id','data-save-slot'])
  );

  let title=first(
    url&&url.searchParams.get('title'),
    attrAny(a,['data-title','data-movie-title','aria-label','title']),
    attrAny(wrap,['data-title','data-movie-title','aria-label','title']),
    (wrap&&wrap.querySelector('h1,h2,h3,b,strong,[data-title]')||{}).textContent,
    (a.textContent&&clean(a.textContent).toLowerCase()!=='details')?a.textContent:''
  );

  if(!id&&!title){
    let st=readStoredTarget();
    id=first(st.id);
    title=first(st.title);
  }

  return {id:id,title:title};
}

function detailsUrl(t){
  let q=[];
  if(t.id)q.push('id='+encodeURIComponent(t.id));
  if(t.title)q.push('title='+encodeURIComponent(t.title));
  q.push('v=173');
  return DETAILS+'?'+q.join('&');
}

function patchOne(a){
  try{
    let href=a.getAttribute('href')||'';
    if(!isDetailsHref(href))return;

    let t=inferTarget(a);
    if(t.id||t.title){
      a.setAttribute('href',detailsUrl(t));
      a.dataset.sbDetailsBridge='1';
      storeTarget(Object.assign({source:'href-patch'},t));
    }
  }catch(e){}
}

function patchDetailsLinks(){
  try{
    document.querySelectorAll('a[href]').forEach(patchOne);
    document.documentElement.dataset.sbDetailsRouteBridge='v7-12-173';
  }catch(e){}
}

function onDetailsClick(e){
  try{
    let a=e.target&&e.target.closest&&e.target.closest('a[href]');
    if(!a||!isDetailsHref(a.getAttribute('href')||''))return;

    let t=inferTarget(a);
    if(t.id||t.title){
      let u=detailsUrl(t);
      storeTarget(Object.assign({source:'click'},t));
      a.setAttribute('href',u);
      if(!e.defaultPrevented&&a.target!=='_blank'){
        e.preventDefault();
        location.href=u;
      }
    }
  }catch(err){}
}

function bridgeBoot(){
  patchDetailsLinks();
  document.addEventListener('click',onDetailsClick,true);
  setTimeout(patchDetailsLinks,350);
  setTimeout(patchDetailsLinks,1200);
  setTimeout(patchDetailsLinks,2500);
}

function boot(){
  loadFaviconHelper();
  refresh(true);
  bridgeBoot();

  setTimeout(()=>refresh(true),250);
  setTimeout(()=>refresh(true),1000);
  setTimeout(refreshFavicon,550);
  setTimeout(refreshFavicon,1600);

  setInterval(()=>refresh(false),3000);
  setInterval(patchDetailsLinks,3500);

  window.addEventListener('storage',e=>{
    if(!e.key||KEYS.includes(e.key))refresh(true);
  });

  window.addEventListener('streambandit:theme-updated',e=>{
    if(e&&e.detail)apply(e.detail,'theme-updated-event');
    else refresh(true);
  });

  window.StreamBanditThemeProjector={
    version:VERSION,
    owner:OWNER,
    keys:KEYS,
    refresh:()=>refresh(true),
    apply:apply,
    saveAndApply:saveAndApply,
    read:readLocal,
    patchDetailsLinks:patchDetailsLinks,
    refreshFavicon:refreshFavicon,
    state:()=>({
      version:VERSION,
      owner:OWNER,
      theme:normalized(readLocal()||DEFAULT),
      detailsRouteBridge:'v7-12-173',
      faviconBridge:'theme-projector-favicon-bridge-1',
      detailsTarget:readStoredTarget()
    })
  };
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
else boot();

})();
