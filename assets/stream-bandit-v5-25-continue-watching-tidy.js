/* Stream Bandit V5.25 — Continue Watching tidy test DISABLED
   Decision: do not promote.
   Reason: the live Continue Watching page already has the correct real Supabase progress cards.
   The tidy overlay added clutter and did not improve the page.

   This disabled test script now performs cleanup only:
   - removes any old V5.25 overlay if cached,
   - restores anything hidden by the old test,
   - does not change player, progress, Supabase, movie rows, Sound Booster or database logic.
*/
(function(){
'use strict';
function cleanup(){
  try{
    document.body.classList.remove('sb525Continue');
    var old=document.getElementById('sb525Wrap');
    if(old)old.remove();
    var css=document.getElementById('sb525Css');
    if(css)css.remove();
    Array.prototype.slice.call(document.querySelectorAll('.sb525Hide')).forEach(function(el){
      el.classList.remove('sb525Hide');
      el.style.display='';
    });
  }catch(e){}
}
cleanup();
document.addEventListener('DOMContentLoaded',function(){setTimeout(cleanup,300);});
setTimeout(cleanup,800);
})();
