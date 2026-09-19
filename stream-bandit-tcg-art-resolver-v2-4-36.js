(function(){
'use strict';

const VERSION='2.4.36';
const ART_MANIFEST='assets/tcg/tcg-art-manifest.json';
const CARD_INTAKE='assets/tcg/cards/set-one/tcg-card-art-intake-v1.json';
const PAGE_KEYS=Object.freeze({
  home:'home',
  play:'play',
  battle:'battle',
  decks:'decks',
  collection:'collection',
  battlepass:'battle_pass',
  progress:'battle_pass',
  shop:'shop',
  packs:'shop',
  settings:'settings'
});

let artManifest=null;
let cardIntake=null;
let cardIndex=new Map();
let readyPromise=null;
let fallbackInstalled=false;

function absolute(path){
  return new URL(String(path||''),document.baseURI).href;
}
function cssUrl(path){
  return 'url("'+String(path||'').replace(/\\/g,'\\\\').replace(/"/g,'\\\"')+'")';
}
async function readJson(path){
  const response=await fetch(absolute(path),{credentials:'same-origin'});
  if(!response.ok) throw new Error('TCG art manifest unavailable: '+path+' (HTTP '+response.status+')');
  return response.json();
}
function installCardArtFallback(root){
  if(fallbackInstalled)return;
  fallbackInstalled=true;
  const target=root&&root.addEventListener?root:document;
  target.addEventListener('load',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||img.dataset.sbTcgCardArt!=='candidate')return;
    const holder=img.closest('.sb-card-art');
    if(!holder)return;
    holder.dataset.artState='approved';
    holder.classList.remove('is-candidate','is-missing');
    holder.classList.add('is-approved');
    img.dataset.sbTcgCardArt='approved';
  },true);
  target.addEventListener('error',event=>{
    const img=event.target;
    if(!(img instanceof HTMLImageElement)||img.dataset.sbTcgCardArt!=='candidate')return;
    const holder=img.closest('.sb-card-art');
    if(!holder)return;
    holder.dataset.artState='missing';
    holder.classList.remove('is-candidate','is-approved');
    holder.classList.add('is-missing');
    holder.replaceChildren(Object.assign(document.createElement('span'),{textContent:'Artwork pending'}));
  },true);
}
function ready(){
  if(!readyPromise){
    readyPromise=Promise.all([readJson(ART_MANIFEST),readJson(CARD_INTAKE)]).then(([art,cards])=>{
      artManifest=art&&typeof art==='object'?art:{};
      cardIntake=cards&&typeof cards==='object'?cards:{};
      const rows=Array.isArray(cardIntake.cards)?cardIntake.cards:[];
      cardIndex=new Map(rows.filter(row=>row&&row.card_id).map(row=>[String(row.card_id),row]));
      installCardArtFallback(document);
      return api;
    });
  }
  return readyPromise;
}
function cardId(instance,structured,definition){
  return String(
    (instance&&instance.card_id)||
    (structured&&structured.id)||
    (definition&&definition.id)||
    ''
  );
}
function cardArt(instance,structured,definition){
  const id=cardId(instance,structured,definition);
  if(!id)return null;
  const entry=cardIndex.get(id);
  if(!entry||!entry.expected_asset_path)return null;
  return Object.freeze({
    state:'candidate',
    url:String(entry.expected_asset_path),
    card_id:id,
    artwork_status:String(entry.artwork_status||'missing')
  });
}
function pageKey(body){
  const el=body||document.body;
  return PAGE_KEYS[String(el&&el.dataset&&el.dataset.sbTcgPage||'')]||'';
}
function pageArtPath(body){
  if(!artManifest)return '';
  const key=pageKey(body);
  if(key==='home')return String(artManifest.branding&&artManifest.branding.primary_key_art||'');
  return String(artManifest.ui_reference&&artManifest.ui_reference[key]||'');
}
function applyPageArt(body){
  const el=body||document.body;
  const path=pageArtPath(el);
  if(!el||!path)return false;
  const veil=pageKey(el)==='battle'
    ? 'linear-gradient(180deg,rgba(0,7,17,.76),rgba(0,4,12,.82) 58%,rgba(0,2,8,.92))'
    : 'linear-gradient(180deg,rgba(0,7,17,.58),rgba(0,4,12,.72) 58%,rgba(0,2,8,.9))';
  el.style.setProperty('background-image',veil+','+cssUrl(path),'important');
  el.style.setProperty('background-size','cover','important');
  el.style.setProperty('background-position','center','important');
  el.style.setProperty('background-repeat','no-repeat','important');
  el.dataset.sbTcgArtSurface=pageKey(el)||'generic';
  el.dataset.sbTcgArtSource='canonical-manifest';
  return true;
}
function brandingPath(){
  if(!artManifest)return '';
  return String(
    artManifest.branding&&(
      artManifest.branding.primary_key_art||
      artManifest.branding.legacy_logo||
      artManifest.branding.legacy_topbar_emblem
    )||''
  );
}
function applyBranding(root){
  const path=brandingPath();
  if(!path)return 0;
  const scope=root&&root.querySelectorAll?root:document;
  const images=Array.from(scope.querySelectorAll('img[data-sb-tcg-brand-art]'));
  images.forEach(img=>{
    if(img.getAttribute('src')!==path)img.setAttribute('src',path);
    img.dataset.sbTcgBrandSource='canonical-manifest';
  });
  return images.length;
}
function counts(){
  return Object.freeze({
    cards:cardIndex.size,
    complete:Array.from(cardIndex.values()).filter(row=>row.artwork_status==='complete').length
  });
}

const api=Object.freeze({
  version:VERSION,
  ready,
  cardArt,
  applyPageArt,
  applyBranding,
  installCardArtFallback,
  counts
});
window.StreamBanditTCGArtResolverV2436=api;
})();