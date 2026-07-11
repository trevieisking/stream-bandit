(function(){
'use strict';
var VERSION='v178-sol-read-output-guard';
var LINKS=[
 ['index.html','🏠','Home','Start here'],
 ['setup.html','⚙️','Setup','Project and repo'],
 ['file-lab.html','📄','File Lab','Load full file'],
 ['rescue-room.html','🛟','Rescue Room','Problem and rules'],
 ['packet-builder.html','📦','Packet Builder','Build packet'],
 ['buddy-canvas.html','🤖','Buddy Canvas','Assistant lane'],
 ['v20.html','🧭','Workflow Hub','Choose route'],
 ['patch-desk.html','🧩','Patch Desk','Full fixed file'],
 ['patch-lab.html','🧪','Patch Lab','Exact fallback'],
 ['preview-test.html','🎯','Preview + Test','Check before live'],
 ['checkpoints.html','💾','Checkpoints','Rollback proof'],
 ['repo-desk.html','🗂️','Repo Desk','Repo handoff'],
 ['publish-prep.html','GitHub','GitHub Writer','File handoff'],
 ['github-tracker.html','PR','GitHub Tracker','PR and preview'],
 ['saved-files.html','🗃️','Saved Files','Edit saved files'],
 ['connection-guide.html','🔌','Connection Guide','Connect tools'],
 ['read-only-proof.html','✅','Read-Only Proof','Backend proof'],
 ['checklist-builder.html','☑️','Checklist Builder','Pass lists'],
 ['help.html','FAQ','Help','Tools and guide'],
 ['faq.html','FAQ','FAQ','Clear answers'],
 ['about.html','Info','About','What Code Labs does']
];
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/,'')||'index'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function makeLink(item,i){var href=item[0],icon=item[1],title=item[2],small=item[3],a=document.createElement('a');a.href=href;a.setAttribute('data-step',String(i));if(page()+'.html'===href||(page()==='index'&&href==='index.html'))a.className='active';a.innerHTML='<span>'+esc(icon)+'</span><div>'+i+'. '+esc(title)+'<small>'+esc(small)+'</div>';return a}
function sameOrder(nav){var got=qa('a',nav).map(function(a){return (a.getAttribute('href')||'').split('?')[0].split('#')[0]}).join('|');var want=LINKS.map(function(x){return x[0]}).join('|');return got===want}
function stabilizeNav(){var nav=q('.nav');if(!nav)return false;if(nav.getAttribute('data-cl-nav-stable')===VERSION&&sameOrder(nav))return true;nav.innerHTML='';LINKS.forEach(function(item,i){nav.appendChild(makeLink(item,i))});nav.setAttribute('data-cl-nav-stable',VERSION);nav.setAttribute('aria-label','Code Labs workflow navigation');return true}
function buddyOn(){try{var p=new URLSearchParams(location.search);if(p.get('buddy')==='1'){localStorage.setItem('clBuddyTools','1');return true}if(p.get('hideBuddy')==='1'){localStorage.removeItem('clBuddyTools');return false}return localStorage.getItem('clBuddyTools')==='1'}catch(e){return false}}
function addBuddyBox(){if(!buddyOn())return;var side=q('.sidebar'),nav=q('.nav');if(!side||!nav||q('#clBuddyToolsBox',side))return;var box=document.createElement('div');box.className='sideBox';box.id='clBuddyToolsBox';box.innerHTML='<b>Buddy Tools</b><p>Owner tools index. Separate from the workflow menu.</p><a class="btn good" href="chatgpt-buddy-tools.html" style="width:100%;justify-content:center;margin-top:8px">Open Buddy Tools</a>';side.insertBefore(box,nav.nextSibling)}
function loadScriptOnce(src,attr,onload){var old=q('script['+attr+']');if(old){if(onload)onload();return old}var s=document.createElement('script');s.src=src;s.setAttribute(attr,'yes');if(onload)s.onload=onload;document.head.appendChild(s);return s}
function loadWorkflowClarity(){loadScriptOnce('assets/code-labs-workflow-clarity-v130.js?v=cl-workflow-clarity-v161','data-cl-workflow-clarity-v130');loadScriptOnce('assets/code-labs-page-completion-v139.js?v=cl-v161','data-cl-page-completion-v139')}
function loadRouteAgreement(){loadScriptOnce('assets/code-labs-packet-builder-route-v131.js?v=cl-packet-builder-route-v131','data-cl-packet-builder-route-v131')}
function loadBuddyLaneGuide(){var id=page();var allowed={"preview-test":1,"checkpoints":1,"repo-desk":1,"publish-prep":1,"github-tracker":1};if(allowed[id])loadScriptOnce('assets/code-labs-v16-buddy-lane-guide.js?v=cl-buddy-lane-20260701','data-cl-buddy-lane-guide')}
function loadNextButtons(){var id=page();var allowed={"patch-lab":1,"preview-test":1,"checkpoints":1,"repo-desk":1,"publish-prep":1,"github-tracker":1};if(allowed[id])loadScriptOnce('assets/code-labs-v16-next-step-buttons.js?v=cl-next-buttons-v165','data-cl-next-buttons')}
function loadCurrentFilePanel(){var id=page();var allowed={"publish-prep":1,"github-tracker":1,"connection-guide":1};if(allowed[id])loadScriptOnce('assets/code-labs-v32-current-file-panel.js?v=cl-current-file-20260701','data-cl-current-file-panel')}
function loadPagePolish(){loadScriptOnce('assets/code-labs-page-polish-v172.js?v=cl-v173-menu-stability','data-cl-page-polish-v172')}
function loadPatchDeskDedupe(){if(page()==='patch-desk')loadScriptOnce('assets/code-labs-v34-patch-desk-dedupe.js?v=cl-v34-patch-desk-dedupe-20260701','data-cl-patch-desk-dedupe')}
function loadSolWorkbench(){function sol(){loadScriptOnce('assets/code-labs-sol-packet-guard-v142.js?v=cl-v143-sol-read-output','data-cl-sol-packet-guard-v143',function(){loadScriptOnce('assets/code-labs-sol-workbench-v141.js?v=cl-v143-sol-workbench','data-cl-sol-workbench-v141')})}if(window.CL_SB||window.CodeLabsRepairHistory){sol();return}document.documentElement.setAttribute('data-cl-sol-auth-only','1');if(!q('style[data-cl-sol-auth-only]')){var st=document.createElement('style');st.setAttribute('data-cl-sol-auth-only','yes');st.textContent='html[data-cl-sol-auth-only="1"] #clHistoryPanel{display:none!important}';document.head.appendChild(st)}loadScriptOnce('assets/code-labs-v1-2-history.js?v=cl-sol-auth-20260711','data-cl-sol-auth-helper',sol)}
function setupNextToFileLab(){if(page()!=='setup')return;qa('a[href="project-picker.html"]').forEach(function(a){a.href='file-lab.html';a.textContent=/next/i.test(a.textContent)?'Next: File Lab':'File Lab'});var box=q('#clWorkflowClarityV130');if(box){var next=q('.next',box);if(next){next.href='file-lab.html';next.textContent='Next: File Lab'}}}
function run(){var ok=stabilizeNav();if(!ok){setTimeout(run,100);return}addBuddyBox();setupNextToFileLab();loadWorkflowClarity();loadRouteAgreement();loadBuddyLaneGuide();loadNextButtons();loadCurrentFilePanel();loadPagePolish();loadPatchDeskDedupe();loadSolWorkbench()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,250);setTimeout(run,900);
window.CodeLabsStableNav={version:VERSION,links:LINKS.length,run:run};
})();