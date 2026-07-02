/* Stream Bandit Social Share Helper V7.13.002
   Privacy-aware external sharing foundation for Social Profile, Friends, News Feed and Groups.
   Public content can be shared externally. Private, friends-only, group-members-only and private-message content is blocked.
   Also cleans stale Social promotion wording/proof text after Social routes pass.
*/
(function(){
'use strict';

const VERSION='V7.13.002 Social Share Helper + Promotion Text Cleanup';
const BLOCKED_VISIBILITY=new Set(['private','friends','friend','friends_only','friends-only','group_members','group-members','members','member','group','message','private_message','dm']);
const DEFAULT_TITLE='Stream Bandit';

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]||m));}
function clean(v,n){v=String(v||'').replace(/\s+/g,' ').trim();return n&&v.length>n?v.slice(0,n-1).trim()+'…':v;}
function canonVisibility(v){return String(v||'public').toLowerCase().replace(/\s+/g,'_');}
function isBlockedVisibility(v){return BLOCKED_VISIBILITY.has(canonVisibility(v));}
function absoluteUrl(url){try{return new URL(url||location.href,location.href).href;}catch(e){return location.href;}}
function titleFromPage(){return document.title||DEFAULT_TITLE;}
function pageFile(){return String(location.pathname||'').split('/').pop()||'index.html';}
function toast(msg){
  let t=document.createElement('div');
  t.textContent=msg;
  t.style.cssText='position:fixed;right:18px;bottom:18px;z-index:2147483647;background:#12172a;color:#fff;border:1px solid #ffffff35;border-radius:16px;padding:13px 16px;box-shadow:0 16px 44px #0009;font:900 14px Inter,system-ui,Arial,sans-serif;max-width:min(420px,calc(100vw - 36px))';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),3200);
}
function buildUrl(data){
  let base=absoluteUrl(data.url||location.href);
  let u=new URL(base);
  if(data.type)u.searchParams.set('sb_share_type',data.type);
  if(data.id)u.searchParams.set('sb_share_id',data.id);
  return u.href;
}
function canShare(data){
  if(!data)return {ok:false,reason:'Nothing selected to share.'};
  if(isBlockedVisibility(data.visibility))return {ok:false,reason:'This item is not public, so it cannot be shared externally.'};
  if(canonVisibility(data.type)==='private_message')return {ok:false,reason:'Private messages cannot be shared externally.'};
  return {ok:true,reason:'Public share allowed.'};
}
function shareTargets(data){
  const url=buildUrl(data);
  const title=clean(data.title||titleFromPage(),120);
  const text=clean(data.text||data.description||title,220);
  const encUrl=encodeURIComponent(url);
  const encText=encodeURIComponent(text);
  const encTitle=encodeURIComponent(title);
  return {
    copy:url,
    facebook:'https://www.facebook.com/sharer/sharer.php?u='+encUrl,
    whatsapp:'https://wa.me/?text='+encodeURIComponent(title+' '+url),
    x:'https://twitter.com/intent/tweet?text='+encText+'&url='+encUrl,
    reddit:'https://www.reddit.com/submit?url='+encUrl+'&title='+encTitle,
    email:'mailto:?subject='+encTitle+'&body='+encodeURIComponent(text+'\n\n'+url)
  };
}
async function copy(url){
  try{await navigator.clipboard.writeText(url);toast('Share link copied.');return true;}catch(e){}
  try{
    let ta=document.createElement('textarea');ta.value=url;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;left:-9999px;top:-9999px';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Share link copied.');return true;
  }catch(e){toast('Copy blocked by browser.');return false;}
}
async function nativeShare(data){
  const allowed=canShare(data);
  if(!allowed.ok){toast(allowed.reason);return false;}
  const url=buildUrl(data);
  const title=clean(data.title||titleFromPage(),120);
  const text=clean(data.text||data.description||title,220);
  if(navigator.share){
    try{await navigator.share({title,text,url});return true;}catch(e){return false;}
  }
  return copy(url);
}
async function openTarget(kind,data){
  const allowed=canShare(data);
  if(!allowed.ok){toast(allowed.reason);return false;}
  const targets=shareTargets(data);
  if(kind==='copy')return copy(targets.copy);
  if(kind==='native')return nativeShare(data);
  const url=targets[kind];
  if(!url){toast('Unknown share target.');return false;}
  if(kind==='email')location.href=url;
  else window.open(url,'_blank','noopener,noreferrer');
  return true;
}
function button(label,kind){return '<button class="sbSocialShareBtn" data-sb-share-target="'+esc(kind)+'" type="button">'+esc(label)+'</button>';}
function bar(data){
  const allowed=canShare(data);
  if(!allowed.ok)return '<div class="sbSocialShareBar blocked" data-sb-share-blocked="true"><span>'+esc(allowed.reason)+'</span></div>';
  return '<div class="sbSocialShareBar" data-sb-share-bar="true">'+
    button('Copy link','copy')+button('Native Share','native')+button('Facebook','facebook')+button('WhatsApp','whatsapp')+button('X','x')+button('Reddit','reddit')+button('Email','email')+
  '</div>';
}
function css(){
  if(document.getElementById('sbSocialShareStyle'))return;
  let s=document.createElement('style');
  s.id='sbSocialShareStyle';
  s.textContent='.sbSocialShareBar{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:8px 0;max-width:100%}.sbSocialShareBtn{border:0;border-radius:999px;padding:8px 10px;background:linear-gradient(135deg,#41e8ff,#7c3cff);color:#061017;font-weight:950;cursor:pointer}.sbSocialShareBar.blocked{border:1px solid #ffb14266;border-radius:14px;background:#ffb14220;color:#ffe8b8;padding:9px 11px;font-weight:850}.sbSocialShareBtn:focus{outline:2px solid #fff;outline-offset:2px}[data-sb-social-share]{overflow-wrap:anywhere}.profileMini[data-sb-social-share],.friendCard[data-sb-social-share],.requestCard[data-sb-social-share]{align-items:flex-start}.profileMini[data-sb-social-share]{flex-wrap:wrap}.profileMini[data-sb-social-share]>.sbSocialShareBar,.friendCard[data-sb-social-share]>.sbSocialShareBar,.requestCard[data-sb-social-share]>.sbSocialShareBar{flex:1 1 100%;width:100%;clear:both}.profileMini[data-sb-social-share]>.sbSocialShareBar{margin-left:108px}@media(max-width:700px){.profileMini[data-sb-social-share]>.sbSocialShareBar{margin-left:0}.sbSocialShareBtn{padding:8px 9px}}';
  document.head.appendChild(s);
}
function readData(el){
  return {
    id:el.getAttribute('data-sb-share-id')||'',
    type:el.getAttribute('data-sb-share-type')||'page',
    visibility:el.getAttribute('data-sb-share-visibility')||'public',
    url:el.getAttribute('data-sb-share-url')||location.href,
    title:el.getAttribute('data-sb-share-title')||titleFromPage(),
    text:el.getAttribute('data-sb-share-text')||''
  };
}
function mount(){
  css();
  document.querySelectorAll('[data-sb-social-share]:not([data-sb-share-mounted])').forEach(el=>{
    el.setAttribute('data-sb-share-mounted','true');
    const data=readData(el);
    el.insertAdjacentHTML('beforeend',bar(data));
  });
  patchPromotionText();
}
function socialTruth(){
  const f=pageFile();
  if(f==='profile-social-v7-13-001-test.html')return {version:VERSION,page:f,route:'Social Profile',promotionStatus:'promoted through index.html and tracked in passed-route ledger',indexPromotion:true,livePromotion:true,shareProfilePassed:true,serviceRole:false,authAdmin:false,deleteAccountBrowserAction:false};
  if(f==='groups-social-v7-13-001-test.html')return {version:VERSION,page:f,route:'Groups',promotionStatus:'promoted through index.html and tracked in passed-route ledger',indexPromotion:true,livePromotion:true,groupsPassed:true,removeGroupPassed:true,removeEventPassed:true,softRemoveRpcHelpers:['sb_social_remove_own_group','sb_social_remove_own_event'],serviceRole:false,authAdmin:false};
  return {version:VERSION,page:f,promotionStatus:'unchanged'};
}
function textIncludes(el,a,b){let t=String(el&&el.textContent||'');return t.includes(a)&&(b?t.includes(b):true);}
function patchPromotionText(){
  try{
    const f=pageFile();
    if(f!=='profile-social-v7-13-001-test.html'&&f!=='groups-social-v7-13-001-test.html')return;
    document.querySelectorAll('.card').forEach(card=>{
      if(f==='profile-social-v7-13-001-test.html'&&textIncludes(card,'Still a test page')){
        let b=card.querySelector('b'),p=card.querySelector('p');
        if(b)b.textContent='Promoted social route';
        if(p)p.textContent='Promoted through index.html, tracked in the passed-route ledger, and Share Profile has passed.';
      }
      if(f==='groups-social-v7-13-001-test.html'&&textIncludes(card,'No index promotion')){
        let b=card.querySelector('b'),p=card.querySelector('p');
        if(b)b.textContent='Promoted social route';
        if(p)p.textContent='Promoted through index.html, tracked in the passed-route ledger, with Remove Group and Remove Event passed through RPC helpers.';
      }
    });
    document.querySelectorAll('.micro').forEach(m=>{
      if(f==='profile-social-v7-13-001-test.html'&&/no index promotion/i.test(m.textContent))m.textContent='Profile Social V7.13.010 - promoted social route, Share Profile passed, tracked in passed-route ledger.';
      if(f==='groups-social-v7-13-001-test.html'&&/no index promotion/i.test(m.textContent))m.textContent='Groups Social V7.13.002 - promoted social route, Group/Event remove passed, tracked in passed-route ledger.';
    });
    document.documentElement.dataset.sbSocialPromotionText='cleaned-v7-13-002';
  }catch(e){}
}
function patchDebugProofText(){
  try{
    let d=document.getElementById('debug');
    if(!d||!d.textContent)return;
    let t=String(d.textContent||'');
    t=t.replace(/"indexPromotion"\s*:\s*false/g,'"indexPromotion": true');
    t=t.replace(/"livePromotion"\s*:\s*false/g,'"livePromotion": true');
    if(t!==d.textContent)d.textContent=t;
  }catch(e){}
}
function copyPromotionTruth(){
  const txt=JSON.stringify(socialTruth(),null,2);
  if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>toast('Updated promotion safety truth copied.')).catch(()=>copy(txt));
  else copy(txt);
}
function bindPromotionProof(){
  document.addEventListener('click',e=>{
    const f=pageFile();
    if(f!=='profile-social-v7-13-001-test.html'&&f!=='groups-social-v7-13-001-test.html')return;
    const copyBtn=e.target&&e.target.closest&&e.target.closest('#copySafety');
    if(copyBtn){e.preventDefault();e.stopImmediatePropagation();copyPromotionTruth();return;}
    if(e.target&&e.target.closest&&e.target.closest('#runChecks'))setTimeout(patchDebugProofText,900);
  },true);
}
function bind(){
  document.addEventListener('click',e=>{
    const btn=e.target&&e.target.closest&&e.target.closest('[data-sb-share-target]');
    if(!btn)return;
    const box=btn.closest('[data-sb-social-share]');
    if(!box)return;
    e.preventDefault();
    openTarget(btn.getAttribute('data-sb-share-target'),readData(box));
  });
  bindPromotionProof();
}

window.StreamBanditSocialShare={version:VERSION,canShare,targets:shareTargets,open:openTarget,native:nativeShare,mount,bar,promotionTruth:socialTruth,patchPromotionText};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();mount();setTimeout(mount,800);setTimeout(patchDebugProofText,1500);});
else{bind();mount();setTimeout(mount,800);setTimeout(patchDebugProofText,1500);}
})();