/* Code Labs V3.4 Patch Desk action tidy
   Visual-only helper: leaves one clear Preview + Test button in Patch Desk actions.
*/
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return document.body&&document.body.getAttribute('data-page')||''}
function run(){
  if(page()!=='patch-desk')return;
  var save=q('#saveFixed'), checkpoint=q('#checkpointFixed');
  var actions=save&&save.parentNode?save.parentNode:q('.panel .actions');
  if(!actions)return;
  var links=qa('a[href="preview-test.html"]',actions);
  var keep=links[0];
  if(!keep){keep=document.createElement('a');keep.href='preview-test.html';actions.appendChild(keep)}
  links.slice(1).forEach(function(a){a.style.display='none';a.setAttribute('aria-hidden','true');a.tabIndex=-1});
  keep.style.display='inline-flex';
  keep.removeAttribute('aria-hidden');
  keep.tabIndex=0;
  keep.className='btn good';
  keep.textContent='Preview + Test';
  if(checkpoint&&checkpoint.parentNode===actions&&keep.previousSibling!==checkpoint){actions.insertBefore(keep,checkpoint.nextSibling)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,200);setTimeout(run,700);setTimeout(run,1500);setInterval(run,3000);
})();