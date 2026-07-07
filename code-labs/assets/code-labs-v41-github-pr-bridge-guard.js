/* Code Labs V4.1 PR Bridge Guard - prevents opening empty GitHub compare pages. */
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function note(){
  var p=q('#clPrBridge');
  if(p&&!q('#clPrBridgeGuardNote')){
    var n=document.createElement('div');
    n.id='clPrBridgeGuardNote';
    n.className='notice';
    n.innerHTML='<p><b>Use this first:</b> press <b>Copy PR Request For Buddy</b> and paste it into ChatGPT. Buddy creates the GitHub branch and PR. The GitHub form link only works after the branch exists.</p>';
    p.insertBefore(n,p.firstChild.nextSibling);
  }
}
function guard(){
  if((document.body&&document.body.getAttribute('data-page'))!=='github-tracker')return;
  note();
  var open=q('#clPrBridgeCompare');
  if(open){
    open.textContent='GitHub PR form - after Buddy creates branch';
    open.onclick=function(e){e.preventDefault();alert('First click Copy PR Request For Buddy and paste it into ChatGPT. Buddy must create the branch before GitHub can open a PR.');return false};
  }
  var copy=q('#clPrBridgeCopy');
  if(copy){copy.textContent='1. Copy PR Request For Buddy';copy.style.outline='4px solid rgba(15,159,110,.35)'}
  var save=q('#clPrBridgeSave');
  if(save)save.textContent='Save request locally';
}
function boot(){guard();setTimeout(guard,700);setTimeout(guard,1800);setInterval(guard,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
