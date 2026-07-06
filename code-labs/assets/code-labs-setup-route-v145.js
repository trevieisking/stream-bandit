/* Code Labs Setup Route V145 - keeps Setup after Home while V12 route owner is corrected. No writes. */
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function iconStyle(){if(q('#clSetupRouteV145Style'))return;var st=document.createElement('style');st.id='clSetupRouteV145Style';st.textContent='.nav a[href="setup.html"]>span:before{content:"⚙️"!important;color:#dbeafe!important;font-size:16px!important;line-height:1!important}.nav a[href="setup.html"].active>span:before{color:#34d399!important}';document.head.appendChild(st)}
function make(){var a=document.createElement('a');a.href='setup.html';a.innerHTML='<span>⚙️</span><div>Setup<small>Project and repo</small></div>';return a}
function keepSetup(){var nav=q('.nav');if(!nav)return;iconStyle();var setup=q('.nav a[href="setup.html"]')||make();var home=q('.nav a[href="index.html"]');if(home&&setup.previousElementSibling!==home){nav.insertBefore(setup,home.nextSibling)}else if(!setup.parentNode){nav.appendChild(setup)}if((document.body&&document.body.getAttribute('data-page'))==='setup')setup.classList.add('active')}
function fixSetupPage(){if((document.body&&document.body.getAttribute('data-page'))!=='setup')return;qa('a[href="project-picker.html"]').forEach(function(a){a.href='file-lab.html';if(/next/i.test(a.textContent||''))a.textContent='Next: File Lab'});var box=q('#clWorkflowClarityV130'),next=box&&q('.next',box);if(next){next.href='file-lab.html';next.textContent='Next: File Lab'}}
function watch(){var nav=q('.nav');if(!nav||nav.getAttribute('data-cl-setup-route-v145')==='yes')return;nav.setAttribute('data-cl-setup-route-v145','yes');try{new MutationObserver(function(){keepSetup();fixSetupPage()}).observe(nav,{childList:true})}catch(e){}}
function run(){keepSetup();fixSetupPage();watch();document.body.setAttribute('data-code-labs-setup-route-v145','active');window.CodeLabsSetupRouteV145={version:'V145',active:true}}
function boot(){run();setTimeout(run,40);setTimeout(run,120);setTimeout(run,260);setTimeout(run,520);setTimeout(run,900);setTimeout(run,1700);setTimeout(run,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
