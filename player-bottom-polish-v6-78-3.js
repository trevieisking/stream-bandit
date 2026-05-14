/* Stream Bandit V6.78.3 Player Bottom Layout Polish
   UI-only helper. Keeps V6.73 resume, V6.74 history and V6.75 saves untouched. */
(function(){
  'use strict';
  function fixLabel(){
    var badge=document.querySelector('.badge');
    if(badge) badge.textContent='V6.78.3 Player Bottom Layout Polish Direct TEST';
    var hero=document.querySelector('.hero p');
    if(hero) hero.textContent='Player candidate with V6.34 playback behaviour, V6.73 resume helper, V6.74 history helper, shared V6.75 saves and polished bottom tabs.';
    var footer=document.querySelector('.footer');
    if(footer) footer.textContent='V6.78.3 Player Bottom Layout Polish Direct TEST — live app unchanged.';
    document.title='Stream Bandit V6.78.3 Player Bottom Layout Polish Direct TEST';
  }
  function polish(){
    var tabBox=null;
    document.querySelectorAll('.box').forEach(function(b){
      if(b.querySelector('.tabs') && b.querySelector('.tab')) tabBox=b;
    });
    if(!tabBox || tabBox.dataset.polished==='yes') return;
    tabBox.dataset.polished='yes';
    tabBox.classList.add('player-polished-tabs');
    var h=tabBox.querySelector('h2');
    if(h) h.textContent='Player tools';
    var sections=['comfort','queue','source','saves','checklist','rules'].map(function(id){return document.getElementById(id);}).filter(Boolean);
    var content=document.createElement('div');
    content.className='polished-tab-content';
    tabBox.appendChild(content);
    sections.forEach(function(sec){
      content.appendChild(sec);
      sec.classList.add('polished-section');
    });
    var style=document.createElement('style');
    style.textContent='.player-polished-tabs{background:linear-gradient(135deg,#101529,#17122d)!important}.player-polished-tabs .tabs{margin-bottom:16px}.player-polished-tabs .polished-tab-content{border:1px solid #ffffff1a;border-radius:22px;background:#05071166;padding:16px;margin-top:14px}.player-polished-tabs .polished-section{margin:0!important;border:0!important;box-shadow:none!important;background:transparent!important;padding:0!important}.player-polished-tabs .polished-section:not(.active){display:none!important}.player-polished-tabs .polished-section.active{display:block!important}';
    document.head.appendChild(style);
  }
  function run(){fixLabel();polish();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
  setTimeout(run,800);
  setTimeout(run,1600);
  setInterval(fixLabel,2500);
  window.StreamBanditPlayerBottomPolishV6783={refresh:run};
})();
