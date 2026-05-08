/* Stream Bandit V5.24.2 — Remove active Quality Tools menu item
   Quality Tools now lives inside the standalone Tools Page: tools-v5-24-1.html.
   This patch removes only the old active-app sidebar menu item.
   It does not remove the Tools Page, does not touch player/Sound Booster, Supabase saves, movie rows, Mux or database logic. */
(function(){
'use strict';
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function removeQualityButton(){
  var removed=false;
  Array.prototype.slice.call(document.querySelectorAll('.side button, aside button, .nav button, button[data-view], a')).forEach(function(el){
    var t=text(el).toLowerCase();
    if(t==='🧰 quality tools'||t==='quality tools'||t.indexOf('quality tools')>-1){
      if(text(el).toLowerCase().indexOf('tools page')===-1){
        try{el.remove();removed=true;}catch(e){el.style.display='none';removed=true;}
      }
    }
  });
  return removed;
}
function updateAdminCount(){
  Array.prototype.slice.call(document.querySelectorAll('.sb56Group summary, details summary')).forEach(function(sum){
    var s=text(sum);
    if(/^admin tools\s*\(/i.test(s)){
      var body=sum.parentElement&&sum.parentElement.querySelector('.sb56GroupBody');
      if(body){
        var count=Array.prototype.slice.call(body.querySelectorAll('button,a')).filter(function(x){return getComputedStyle(x).display!=='none';}).length;
        sum.textContent='Admin Tools ('+count+')';
      }else{
        sum.textContent=s.replace(/Admin Tools\s*\(\d+\)/i,'Admin Tools (9)');
      }
    }
  });
}
function run(){removeQualityButton();updateAdminCount();}
var mo=new MutationObserver(function(){setTimeout(run,80);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,600);});
setInterval(run,1000);
setTimeout(run,900);
})();
