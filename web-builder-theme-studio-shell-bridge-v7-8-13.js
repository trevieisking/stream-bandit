/* Stream Bandit V7.8.13 Theme Studio Shell Bridge
   Hard fixes Theme Studio header: global logo applies to shell, long account/name text is contained. */
(function(){
'use strict';
const STORE_ID='stream_bandit';
let sb=null;
function $(id){return document.getElementById(id)}
function addCss(){
  if($('sbThemeStudioShellFixCss')) return;
  var s=document.createElement('style');
  s.id='sbThemeStudioShellFixCss';
  s.textContent='body .head{display:grid!important;grid-template-columns:minmax(0,260px) minmax(0,1fr) minmax(260px,360px)!important;gap:14px!important;align-items:start!important;border:1px solid var(--line)!important;border-radius:24px!important;background:linear-gradient(135deg,var(--card),var(--card2))!important;padding:20px!important;margin:0 0 16px!important;box-shadow:0 18px 60px #0007!important;overflow:hidden!important}body .head *{box-sizing:border-box!important;min-width:0!important}body .head .brand{display:grid!important;grid-template-columns:44px minmax(0,1fr)!important;gap:12px!important;align-items:center!important;font-size:22px!important;font-weight:950!important;overflow:hidden!important;max-width:100%!important}body .head .brand>span{display:block!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}body .head .logo{width:44px!important;height:44px!important;border-radius:14px!important;background:linear-gradient(135deg,var(--accent),var(--accent2))!important;display:grid!important;place-items:center!important;overflow:hidden!important}body .head .logo img,body .logoPreview img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:inherit!important;display:block!important}body .head .muted{overflow:hidden!important;max-width:100%!important}body .head .muted b{display:block!important;overflow:hidden!important;text-overflow:ellipsis!important;line-height:1.35!important}body .head .search{display:flex!important;gap:8px!important;border:1px solid #ffffff24!important;border-radius:999px!important;background:#0004!important;padding:9px 10px 9px 14px!important;max-width:100%!important}body .head .search input{flex:1!important;background:transparent!important;border:0!important;color:#fff!important;outline:0!important;min-width:0!important}.sb-auth-chip,.sb-auth-panel,.sb-auth-card,[id^="sbAuth"]{max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}.sb-auth-chip *, .sb-auth-panel *, .sb-auth-card *, [id^="sbAuth"] *{min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important}@media(max-width:900px){body .head{grid-template-columns:1fr!important}}';
  document.head.appendChild(s);
}
async function client(){
  if(sb) return sb;
  let t=await fetch('stream-bandit-shell-v6-24.js',{cache:'no-store'}).then(r=>r.text());
  let url=(t.match(/SUPABASE_URL\s*=\s*'([^']+)'/)||[])[1];
  let key=(t.match(/SUPABASE_KEY\s*=\s*'([^']+)'/)||[])[1];
  sb=supabase.createClient(url,key);
  return sb;
}
function ensureHeader(){
  addCss();
  if(document.querySelector('.head')) return;
  var wrap=document.querySelector('.wrap')||document.body;
  var header=document.createElement('header');
  header.className='head';
  header.innerHTML='<div class="brand"><div class="logo">🎨</div><span>Stream Bandit</span></div><div class="muted"><b>Theme Studio global controls. Shared shell, account state and search are active here.</b></div><div><div class="search"><span>🔎</span><input id="globalSearch" placeholder="Search Stream Bandit"><button id="globalSearchBtn" class="btn primary">Search</button></div></div>';
  wrap.insertBefore(header,wrap.firstChild);
}
function applyIdentity(name,logo){
  addCss();
  name=String(name||'Stream Bandit').trim()||'Stream Bandit';
  logo=String(logo||'').trim();
  document.querySelectorAll('.head .brand>span').forEach(el=>{el.textContent=name;el.title=name});
  if(logo){document.querySelectorAll('.head .brand .logo,.logoPreview').forEach(el=>{el.innerHTML='<img src="'+logo.replace(/"/g,'')+'" alt="">'});}
}
function applyFromInputs(){
  let n=$('sbAppName')&&$('sbAppName').value;
  let l=$('sbLogoUrl')&&$('sbLogoUrl').value;
  if(n||l) applyIdentity(n,l);
}
async function loadIdentity(){
  try{
    let c=await client();
    let r=await c.from('sb_app_settings').select('settings').eq('id',STORE_ID).maybeSingle();
    let st=(r.data&&r.data.settings)||{};
    applyIdentity(st.appName,st.logoUrl);
  }catch(e){applyFromInputs();}
}
function hookButtons(){
  ['sbApplyIdentity','sbUploadLogo','sbSaveIdentity','sbLoadIdentity'].forEach(id=>{
    let b=$(id);
    if(b&&!b.dataset.sbShellFix){
      b.dataset.sbShellFix='1';
      b.addEventListener('click',()=>{setTimeout(loadIdentity,350);setTimeout(applyFromInputs,900);});
    }
  });
}
function start(){
  ensureHeader();
  loadIdentity();
  setInterval(()=>{ensureHeader();hookButtons();loadIdentity();},1500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
