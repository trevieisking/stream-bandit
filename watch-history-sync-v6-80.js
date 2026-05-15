/* Stream Bandit V6.80 Watch History Sync
   UI + shared saves helper for Watch History test candidate.
   History remains read-only. No clear/delete/rewrite history action. */
(function(){
  'use strict';
  const DETAILS='details-watch-shell-v6-33-test.html';
  const PLAYER='player-watch-shell-v6-34-test.html';
  function qs(s){return document.querySelector(s)}
  function text(sel,value){const el=qs(sel); if(el) el.textContent=value;}
  function replaceText(from,to){
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null);
    let n;
    while((n=walker.nextNode())){
      if(n.nodeValue && n.nodeValue.indexOf(from)!==-1) n.nodeValue=n.nodeValue.split(from).join(to);
    }
  }
  function movieIdFromHref(h){try{return new URL(h,location.href).searchParams.get('id')||'';}catch(e){return''}}
  function syncLabels(){
    document.title='Stream Bandit V6.80 Watch History Route + Core Saves Sync TEST';
    text('.badge','V6.80 Watch History Route + Core Saves Sync TEST');
    text('.head .muted b','Watch History sync test. Current stack: Details V6.77.5, Player V6.78.4, History V6.74, Saves V6.75.');
    text('.hero p','Read-only Watch History candidate using browser history/progress data, current Details/Player routes and shared V6.75 Watchlist, Favourite and Like saves.');
    text('.footer','V6.80 Watch History Route + Core Saves Sync TEST — live app unchanged.');
    replaceText('V6.36 Watch History Watch Shell TEST','V6.80 Watch History Route + Core Saves Sync TEST');
    replaceText('Details opens V6.33 and Play opens V6.34.','Details opens current Details V6.77.5 and Play opens current Player V6.78.4.');
    replaceText('Details goes to V6.33; Play goes to V6.34.','Details opens current Details V6.77.5 and Play opens current Player V6.78.4.');
    replaceText('Details opens details-watch-shell-v6-33-test.html.','Details opens details-watch-shell-v6-33-test.html, currently Details V6.77.5.');
    replaceText('Play opens player-watch-shell-v6-34-test.html.','Play opens player-watch-shell-v6-34-test.html, currently Player V6.78.4.');
    replaceText('Watchlist/Favourite/Like are preview-only.','Watchlist/Favourite/Like use shared V6.75 saves.');
    replaceText('V6.36 Watch History Checklist','V6.80 Watch History Checklist');
  }
  async function syncSaves(){
    const core=window.StreamBanditCoreSavesV675;
    if(!core) return;
    try{await core.init();}catch(e){}
    document.querySelectorAll('.movie .actions').forEach(actions=>{
      const details=actions.querySelector('a[href*="details-watch-shell"]');
      const id=details?movieIdFromHref(details.getAttribute('href')):'';
      if(!id || actions.dataset.v680==='yes') return;
      actions.dataset.v680='yes';
      actions.querySelectorAll('[data-preview]').forEach(b=>b.remove());
      const wrap=document.createElement('span');
      wrap.className='actions';
      wrap.style.marginTop='0';
      wrap.innerHTML=core.buttons(id,{className:'btn small sb-core-save-btn'});
      actions.after(wrap);
    });
  }
  async function run(){syncLabels(); await syncSaves();}
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-sb-core-save]');
    if(!b || !window.StreamBanditCoreSavesV675) return;
    e.preventDefault();
    try{b.disabled=true; await window.StreamBanditCoreSavesV675.toggle(b.dataset.sbCoreSave,b.dataset.movieId); await run();}
    finally{b.disabled=false;}
  });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  setTimeout(run,900);
  setTimeout(run,1800);
  window.StreamBanditWatchHistorySyncV680={refresh:run};
})();
