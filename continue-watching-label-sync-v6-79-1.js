/* Stream Bandit V6.79.1 Continue Watching Route Label Sync
   UI/wording-only helper for the actual Continue Watching route.
   Keeps V6.75.6 behaviour, V6.73 local progress and V6.75 saves untouched.
   No Supabase progress writes, no live/index/admin/storage/billing action. */
(function(){
  'use strict';
  function txt(sel,value){var el=document.querySelector(sel);if(el)el.textContent=value;}
  function replaceText(root,from,to){
    var walker=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,null);
    var n;
    while((n=walker.nextNode())){
      if(n.nodeValue && n.nodeValue.indexOf(from)!==-1) n.nodeValue=n.nodeValue.split(from).join(to);
    }
  }
  function sync(){
    document.title='Stream Bandit V6.79.1 Continue Watching Route Label Sync Migration TEST';
    txt('.badge','V6.79.1 Continue Watching Route Label Sync Migration TEST');
    txt('.head .muted b','Continue Watching route label sync migration. Current stack: Details V6.77.5, Player V6.78.4, Resume V6.73, Saves V6.75.');
    txt('.hero p','Continue Watching uses local V6.73 progress/resume, current Details V6.77.5 route, current Player V6.78.4 route and shared V6.75 Watchlist, Favourite and Like saves.');
    txt('.footer','V6.79.1 Continue Watching Route Label Sync Migration TEST — index/live app untouched.');
    replaceText(document.body,'V6.75.6 Continue Watching Route Migration TEST','V6.79.1 Continue Watching Route Label Sync Migration TEST');
    replaceText(document.body,'Built from the passed V6.75.5 candidate.','Labels synced to Home V6.76.1, Details V6.77.5 and Player V6.78.4.');
    replaceText(document.body,'Controlled route migration using the passed V6.75.5 logic. It combines local progress/resume with shared V6.75 Watchlist, Favourite and Like saves.','Continue Watching uses local V6.73 progress/resume, current Details V6.77.5 route, current Player V6.78.4 route and shared V6.75 Watchlist, Favourite and Like saves.');
    replaceText(document.body,'Details/Player routes are current','Details V6.77.5 and Player V6.78.4 routes are current');
    replaceText(document.body,'Resume opens Player V6.34 and keeps timestamp where saved.','Resume opens the current Player V6.78.4 route and keeps timestamp where saved.');
    replaceText(document.body,'Details opens V6.33.2 route.','Details opens the current Details V6.77.5 route.');
    replaceText(document.body,'Details opens details-watch-shell-v6-33-test.html.','Details opens details-watch-shell-v6-33-test.html, currently Details V6.77.5.');
    replaceText(document.body,'Resume/Play opens player-watch-shell-v6-34-test.html with timestamp when available.','Resume/Play opens player-watch-shell-v6-34-test.html, currently Player V6.78.4, with timestamp when available.');
    replaceText(document.body,'V6.75.6 Checklist','V6.79.1 Checklist');
    replaceText(document.body,'Loading V6.75.6 route migration test...','Loading V6.79.1 label sync route migration test...');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
  setTimeout(sync,700);
  setTimeout(sync,1600);
  window.StreamBanditContinueWatchingLabelSyncV6791={refresh:sync};
})();
