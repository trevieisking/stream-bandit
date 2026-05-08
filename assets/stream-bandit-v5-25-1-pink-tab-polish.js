/* Stream Bandit V5.25.1 — Pink Tab Polish
   Tiny visual polish only.
   Keeps current working pages/layouts intact.
   Makes active tabs/buttons use the Stream Bandit pink/purple style.
   No player, progress, Supabase, movie row, Sound Booster or database changes. */
(function(){
'use strict';
function addCss(){
  if(document.getElementById('sb5251PinkTabs'))return;
  var st=document.createElement('style');
  st.id='sb5251PinkTabs';
  st.textContent='\n:root{--sb-pink:#ff2d85;--sb-purple:#8a35ff}.tab.active,.tabs .active,.sb5232Tab.active,.sb523Tab.active,.sb525Tab.active,button.active[data-tab],button.active[data-panel],button.active[data-view],.active-tab,.nav button.active,.side button.active{background:linear-gradient(135deg,var(--sb-pink),var(--sb-purple))!important;border-color:rgba(255,45,133,.55)!important;box-shadow:0 14px 34px rgba(255,45,133,.26),0 0 0 1px rgba(255,255,255,.05) inset!important;color:#fff!important}.continue-watching button.primary,.continue-watching .primary,.continue-watching .btn-primary,.continue-watching [class*=primary],body:has(h1) .sb-pink-keep{background:linear-gradient(135deg,var(--sb-pink),var(--sb-purple))!important}.card button:focus-visible,.tabs button:focus-visible,.side button:focus-visible{outline:2px solid var(--sb-pink)!important;outline-offset:2px!important}\n';
  document.head.appendChild(st);
}
document.addEventListener('DOMContentLoaded',addCss);
addCss();
})();
