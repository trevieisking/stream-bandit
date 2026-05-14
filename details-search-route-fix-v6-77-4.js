/* Stream Bandit V6.77.4 Details Search Route Fix
   Test-layer search override for the Details full metadata candidate.
   Rewrites shared shell movie search results from older Details routes to the current Details candidate.
   Safe UI routing only: no database writes, no live promotion. */
(function(){
  'use strict';
  const TARGET='details-full-metadata-v6-77-4-test.html';
  const OLD_ROUTES=['details-watch-shell-v6-33-test.html','details-full-metadata-v6-77-3-test.html'];
  function fixLinks(root){
    const scope=root||document;
    scope.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      const old=OLD_ROUTES.find(r=>href.indexOf(r)===0);
      if(!old)return;
      a.setAttribute('href',TARGET+href.slice(old.length));
      const small=a.querySelector('small');
      if(small&&/Details/i.test(small.textContent||''))small.textContent='Movie result — Details V6.77.4';
    });
  }
  function updateNote(){
    const note=document.querySelector('.sb-search-note');
    if(note&&/Details V6\.33|older Details/i.test(note.textContent||'')){
      note.textContent='Press Enter for full Global Search in this tab. Click a movie result for Details V6.77.4.';
    }
  }
  function run(){fixLinks(document);updateNote();}
  const obs=new MutationObserver(ms=>ms.forEach(m=>fixLinks(m.target)));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{run();obs.observe(document.body,{childList:true,subtree:true});});
  else {run();obs.observe(document.body,{childList:true,subtree:true});}
  window.StreamBanditDetailsSearchRouteFixV6774={refresh:run,target:TARGET};
})();
