/* Stream Bandit V6.80.1 Watch History Visible Core Saves
   Makes Watchlist/Favourite/Like clearly visible on Watch History cards.
   History stays read-only. Uses shared V6.75 saves only. */
(function(){
  'use strict';
  function injectStyle(){
    if(document.getElementById('sb-v6801-style'))return;
    const s=document.createElement('style');
    s.id='sb-v6801-style';
    s.textContent='.sb-v6801-save-row{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important;padding-top:12px!important;border-top:1px solid #ffffff1a!important}.sb-v6801-save-row .btn{font-size:12px!important;padding:8px 10px!important}.sb-v6801-label{width:100%;color:#baf7df;font-weight:950;font-size:12px;margin-bottom:2px}.sb-v6801-card-note{display:inline-flex;border-radius:999px;padding:5px 8px;background:#22d3a624;border:1px solid #22d3a657;color:#baf7df;font-size:11px;font-weight:900;margin:2px}';
    document.head.appendChild(s);
  }
  function idFromCard(card){
    const a=card.querySelector('a[href*="details-watch-shell"],a[href*="player-watch-shell"]');
    if(!a)return'';
    try{return new URL(a.getAttribute('href'),location.href).searchParams.get('id')||'';}catch(e){return'';}
  }
  async function ensureCore(){
    const core=window.StreamBanditCoreSavesV675;
    if(!core)return null;
    try{await core.init();}catch(e){}
    return core;
  }
  async function paint(){
    injectStyle();
    const core=await ensureCore();
    if(!core)return;
    document.querySelectorAll('.movie').forEach(card=>{
      const id=idFromCard(card);
      if(!id)return;
      let row=card.querySelector('.sb-v6801-save-row');
      if(!row){
        row=document.createElement('div');
        row.className='sb-v6801-save-row';
        const body=card.querySelector('.body')||card;
        body.appendChild(row);
      }
      row.innerHTML='<div class="sb-v6801-label">Save this movie</div>'+core.buttons(id,{className:'btn small sb-core-save-btn'});
    });
    const status=document.getElementById('status');
    if(status)status.textContent='V6.80.1 Watch History ready. Save buttons are visible. History remains read-only.';
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-sb-core-save]');
    if(!b||!window.StreamBanditCoreSavesV675)return;
    e.preventDefault();
    try{b.disabled=true;await window.StreamBanditCoreSavesV675.toggle(b.dataset.sbCoreSave,b.dataset.movieId);await paint();}
    catch(err){const status=document.getElementById('status');if(status)status.textContent=err.message||String(err);}
    finally{b.disabled=false;}
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
  setTimeout(paint,900);
  setTimeout(paint,1800);
  setInterval(paint,3500);
  window.StreamBanditWatchHistoryVisibleSavesV6801={refresh:paint};
})();
