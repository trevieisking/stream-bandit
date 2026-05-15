/* Stream Bandit V6.80.3 Watch History Stable Visible Saves
   Stable observer-based visible save rows for Watch History.
   No interval repaint fight. History stays read-only. */
(function(){
  'use strict';
  let busy=false;
  function style(){
    if(document.getElementById('sb-v6803-style'))return;
    const s=document.createElement('style');
    s.id='sb-v6803-style';
    s.textContent='.sb-v6803-save-row{display:flex!important;gap:8px!important;flex-wrap:wrap!important;margin-top:12px!important;padding-top:12px!important;border-top:1px solid #ffffff1a!important}.sb-v6803-save-row .btn{font-size:12px!important;padding:8px 10px!important}.sb-v6803-label{width:100%;color:#baf7df;font-weight:950;font-size:12px;margin-bottom:2px}.sb-v6803-ready{outline:1px solid rgba(34,211,166,.18)}';
    document.head.appendChild(s);
  }
  function idFromCard(card){
    const a=card.querySelector('a[href*="details-watch-shell"],a[href*="player-watch-shell"]');
    if(!a)return'';
    try{return new URL(a.getAttribute('href'),location.href).searchParams.get('id')||'';}catch(e){return'';}
  }
  async function coreReady(){
    const core=window.StreamBanditCoreSavesV675;
    if(!core)return null;
    if(!core.__v6803Ready){
      try{await core.init();}catch(e){}
      core.__v6803Ready=true;
    }
    return core;
  }
  async function paint(){
    if(busy)return;
    busy=true;
    try{
      style();
      const core=await coreReady();
      if(!core)return;
      document.querySelectorAll('.movie').forEach(card=>{
        const id=idFromCard(card);
        if(!id)return;
        const body=card.querySelector('.body')||card;
        let row=body.querySelector('.sb-v6803-save-row');
        const html='<div class="sb-v6803-label">Save this movie</div>'+core.buttons(id,{className:'btn small sb-core-save-btn'});
        if(!row){
          row=document.createElement('div');
          row.className='sb-v6803-save-row';
          row.dataset.movieId=id;
          row.innerHTML=html;
          body.appendChild(row);
          card.classList.add('sb-v6803-ready');
        }else if(row.dataset.movieId!==id){
          row.dataset.movieId=id;
          row.innerHTML=html;
        }
      });
      const status=document.getElementById('status');
      if(status && !/clicked|failed|error/i.test(status.textContent||'')){
        status.textContent='V6.80.3 Watch History ready. Save buttons are stable. History remains read-only.';
      }
    }finally{busy=false;}
  }
  let scheduled=false;
  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;paint();});
  }
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-sb-core-save]');
    if(!b||!window.StreamBanditCoreSavesV675)return;
    e.preventDefault();
    const status=document.getElementById('status');
    try{
      b.disabled=true;
      await window.StreamBanditCoreSavesV675.toggle(b.dataset.sbCoreSave,b.dataset.movieId);
      await window.StreamBanditCoreSavesV675.refresh?.();
      await paint();
      if(status)status.textContent='V6.80.3 save updated. Buttons stayed stable.';
    }catch(err){if(status)status.textContent=err.message||String(err);}
    finally{b.disabled=false;}
  });
  function start(){
    paint();
    const targets=[document.getElementById('historyGrid'),document.getElementById('progressGrid'),document.body].filter(Boolean);
    targets.forEach(t=>new MutationObserver(schedule).observe(t,{childList:true,subtree:true}));
    setTimeout(paint,500);
    setTimeout(paint,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
  window.StreamBanditWatchHistoryStableSavesV6803={refresh:paint};
})();
