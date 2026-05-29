(function(){
'use strict';

const VERSION = 'V7.12.144 Auth Avatar Visible-State Helper';

let sb = null;
let lastUrl = '';
let busy = false;
let observerStarted = false;

function readCfg(){
  return fetch('stream-bandit-shell-v6-24.js', { cache: 'no-store' })
    .then(r => r.text())
    .then(txt => ({
      url: (txt.match(/SUPABASE_URL\s*=\s*'([^']+)'/) || [])[1] || '',
      key: (txt.match(/SUPABASE_KEY\s*=\s*'([^']+)'/) || [])[1] || ''
    }))
    .catch(() => ({ url: '', key: '' }));
}

async function client(){
  if(sb) return sb;
  if(!window.supabase || !window.supabase.createClient) return null;

  const cfg = await readCfg();

  if(cfg.url && cfg.key){
    sb = window.supabase.createClient(cfg.url, cfg.key);
  }

  return sb;
}

function installStyle(){
  if(document.getElementById('sbAuthAvatarStyle')) return;

  const style = document.createElement('style');
  style.id = 'sbAuthAvatarStyle';
  style.textContent = `
.brand.sb-auth-host .logo.sb-auth-avatar-logo,
.brand .logo.sb-auth-avatar-logo,
.sb-shell-logo.sb-auth-avatar-logo{
  background:#0006!important;
  background-image:none!important;
  background-size:cover!important;
  background-position:center!important;
  background-repeat:no-repeat!important;
  color:transparent!important;
  overflow:hidden!important;
  border:1px solid var(--accent,#22d3a6)!important;
}

.brand.sb-auth-host .logo.sb-auth-avatar-logo img,
.brand .logo.sb-auth-avatar-logo img,
.sb-shell-logo.sb-auth-avatar-logo img{
  width:100%!important;
  height:100%!important;
  object-fit:cover!important;
  display:block!important;
}

.sb-auth-chip-avatar{
  width:34px!important;
  height:34px!important;
  border-radius:12px!important;
  overflow:hidden!important;
  border:1px solid var(--accent,#22d3a6)!important;
  background:#0006!important;
  flex:0 0 34px!important;
  display:block!important;
}

.sb-auth-chip-avatar img{
  width:100%!important;
  height:100%!important;
  object-fit:cover!important;
  display:block!important;
}

#sbAuthChip.has-sb-auth-avatar{
  display:grid!important;
  grid-template-columns:34px minmax(0,1fr) auto!important;
  gap:8px!important;
  align-items:center!important;
}

.brand.sb-auth-host .logo.sb-auth-avatar-logo[data-empty="true"]{
  color:inherit!important;
}
`;

  document.head.appendChild(style);
}

function imgHtml(url){
  return '<img alt="Profile avatar" src="' + String(url).replace(/"/g, '') + '">';
}

function setLogoBox(el, url){
  if(!el || !url) return;

  el.classList.add('sb-auth-avatar-logo');
  el.dataset.empty = 'false';
  el.dataset.sbAuthAvatarVisible = 'v7-12-144';
  el.style.backgroundImage = 'none';
  el.style.overflow = 'hidden';
  el.innerHTML = imgHtml(url);
}

function setAccountChip(url){
  try{
    const chip = document.getElementById('sbAuthChip');
    if(!chip || !url) return;

    let avatar = chip.querySelector('.sb-auth-chip-avatar');

    if(!avatar){
      avatar = document.createElement('span');
      avatar.className = 'sb-auth-chip-avatar';
      chip.insertBefore(avatar, chip.firstChild);
    }

    chip.classList.add('has-sb-auth-avatar');
    chip.dataset.sbAuthAvatarVisible = 'v7-12-144';
    avatar.innerHTML = imgHtml(url);
  }catch(e){}
}

function applyAvatar(url){
  installStyle();

  if(!url){
    if(!lastUrl){
      document.querySelectorAll('.brand.sb-auth-host .logo,.brand .logo,.sb-shell-logo').forEach(el => {
        el.classList.remove('sb-auth-avatar-logo');
        el.dataset.empty = 'true';
      });
    }
    return;
  }

  lastUrl = url;

  document.querySelectorAll('.brand.sb-auth-host .logo,.brand .logo,.sb-shell-logo').forEach(el => {
    setLogoBox(el, url);
  });

  setAccountChip(url);

  document.documentElement.dataset.streamBanditAuthAvatarVisible = 'v7-12-144';
}

async function findAvatarUrl(){
  try{
    const c = await client();
    if(!c) return lastUrl;

    const sessionResult = await c.auth.getSession();
    const user = sessionResult.data && sessionResult.data.session
      ? sessionResult.data.session.user
      : null;

    if(!user){
      return '';
    }

    const profileResult = await c
      .from('sb_profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if(profileResult.error) throw profileResult.error;

    return profileResult.data && profileResult.data.avatar_url
      ? profileResult.data.avatar_url
      : lastUrl;
  }catch(e){
    return lastUrl;
  }
}

async function refresh(){
  if(busy) return;

  busy = true;

  try{
    const url = await findAvatarUrl();
    applyAvatar(url);
  }catch(e){
    /* never break page */
  }

  busy = false;
}

function startObserver(){
  if(observerStarted) return;
  observerStarted = true;

  try{
    const observer = new MutationObserver(() => {
      setTimeout(refresh, 80);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }catch(e){}
}

function init(){
  installStyle();
  startObserver();

  refresh();

  [
    120,
    300,
    700,
    1200,
    2000,
    3200,
    5200,
    8000,
    12000
  ].forEach(t => setTimeout(refresh, t));

  setInterval(refresh, 2200);

  document.addEventListener('streambandit:auth-state', () => {
    setTimeout(refresh, 120);
  });

  document.addEventListener('streambandit:brand-logo-loaded', () => {
    setTimeout(refresh, 120);
  });

  document.addEventListener('streambandit:global-helper-loader-refresh', () => {
    setTimeout(refresh, 120);
  });

  document.addEventListener('click', e => {
    if(
      e.target.closest &&
      (
        e.target.closest('#sbAuthOpen') ||
        e.target.closest('#sbShellMenuToggle') ||
        e.target.closest('[data-sb-open-menu]')
      )
    ){
      setTimeout(refresh, 120);
      setTimeout(refresh, 600);
      setTimeout(refresh, 1200);
    }
  }, true);

  window.StreamBanditAuthAvatar = {
    version: VERSION,
    refresh,
    state: () => ({
      version: VERSION,
      avatarApplied: document.documentElement.dataset.streamBanditAuthAvatarVisible || '',
      avatarCached: !!lastUrl,
      chipApplied: !!document.querySelector('#sbAuthChip .sb-auth-chip-avatar')
    })
  };
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}

})();
