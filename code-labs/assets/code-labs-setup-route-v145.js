/* Code Labs Setup Route V266 - canonical Home -> Setup -> Project Picker -> File Lab. No writes. */
(function(){
'use strict';
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function iconStyle(){if(q('#clSetupRouteV145Style'))return;var st=document.createElement('style');st.id='clSetupRouteV145Style';st.textContent='.nav a[href="setup.html"]>span{color:#dbeafe!important;font-size:16px!important;line-height:1!important}.nav a[href="setup.html"].active>span{color:#34d399!important}';document.head.appendChild(st)}
function make(){var a=document.createElement('a');a.href='setup.html';a.innerHTML='<span>⚙️</span><div>Setup<small>Project and repo</small></div>';return a}
function keepSetup(){var nav=q('.nav');if(!nav)return;iconStyle();var setup=q('.nav a[href="setup.html"]')||make(),home=q('.nav a[href="index.html"]');if(home&&setup.previousElementSibling!==home)nav.insertBefore(setup,home.nextSibling);else if(!setup.parentNode)nav.appendChild(setup);if((document.body&&document.body.getAttribute('data-page'))==='setup')setup.classList.add('active')}
function nextLink(box,href,label){var next=box&&q('.next',box);if(!next)return;next.href=href;next.textContent='Next: '+label}
function restoreSetupNext(){if((document.body&&document.body.getAttribute('data-page'))!=='setup')return;qa('a').forEach(function(a){if(a.closest&&a.closest('.nav'))return;if(/^Next:/i.test(String(a.textContent||'').trim())){a.href='project-picker.html';a.textContent='Next: Project Picker'}})}
function fixRoutePanels(){var id=(document.body&&document.body.getAttribute('data-page'))||'',box=q('#clWorkflowClarityV130');if(id==='index')nextLink(box,'setup.html','Setup');if(id==='setup'){nextLink(box,'project-picker.html','Project Picker');restoreSetupNext()}if(id==='project-picker')nextLink(box,'file-lab.html','File Lab');var foot=q('#clHelpShortcut');if(foot){foot.innerHTML=foot.innerHTML.replace(/Home\s*→\s*Setup(?:\s*→\s*Project Picker)?\s*→\s*File Lab/g,'Home → Setup → Project Picker → File Lab').replace(/Home\s*→\s*File Lab/g,'Home → Setup → Project Picker → File Lab')}}
function watch(){var nav=q('.nav');if(!nav||nav.getAttribute('data-cl-setup-route-v145')==='yes')return;nav.setAttribute('data-cl-setup-route-v145','yes');try{new MutationObserver(function(){keepSetup();fixRoutePanels()}).observe(nav,{childList:true})}catch(e){}}
function run(){keepSetup();fixRoutePanels();watch();document.body.setAttribute('data-code-labs-setup-route-v145','active');window.CodeLabsSetupRouteV145={version:'V266',active:true,route:'Home -> Setup -> Project Picker -> File Lab'}}
function boot(){run();setTimeout(run,60);setTimeout(run,300);setTimeout(run,1000);setTimeout(run,2600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();