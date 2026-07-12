(function(){
'use strict';
var VERSION='v200-one-flow';
var LINKS=[
 ['index.html','🏠','Home','Start here'],
 ['setup.html','⚙️','Setup','Project and repo'],
 ['saved-files.html','📄','Saved Files','Load or edit full file'],
 ['rescue-room.html','🛟','Rescue Room','Problem and rules'],
 ['packet-builder.html','📦','Packet Builder','Build repair context'],
 ['patch-lab.html','🧪','Patch Lab','Apply or validate repair'],
 ['buddy-canvas.html','🤖','Buddy Lane','ChatGPT handoff'],
 ['preview-test.html','🎯','Preview + Test','Check before live'],
 ['checkpoints.html','💾','Checkpoints','Rollback and receipts'],
 ['help.html','FAQ','Help','Plain-English guide']
];
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/,'')||'index'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function makeLink(item,i){var href=item[0],icon=item[1],title=item[2],small=item[3],a=document.createElement('a');a.href=href;a.setAttribute('data-step',String(i+1));if(page()+'.html'===href||(page()==='index'&&href==='index.html')||(page()==='file-lab'&&href==='saved-files.html'))a.className='active';a.innerHTML='<span>'+esc(icon)+'</span><div>'+(i+1)+'. '+esc(title)+'<small>'+esc(small)+'</small></div>';return a}
function sameOrder(nav){var got=qa('a',nav).map(function(a){return(a.getAttribute('href')||'').split('?')[0].split('#')[0]}).join('|');var want=LINKS.map(function(x){return x[0]}).join('|');return got===want}
function stabilizeNav(){var nav=q('.nav');if(!nav)return false;if(nav.getAttribute('data-cl-nav-stable')===VERSION&&sameOrder(nav))return true;nav.innerHTML='';LINKS.forEach(function(item,i){nav.appendChild(makeLink(item,i))});nav.setAttribute('data-cl-nav-stable',VERSION);nav.setAttribute('aria-label','Code Labs simple workflow navigation');return true}
function buddyOn(){try{var p=new URLSearchParams(location.search);if(p.get('buddy')==='1'){localStorage.setItem('clBuddyTools','1');return true}if(p.get('hideBuddy')==='1'){localStorage.removeItem('clBuddyTools');return false}return localStorage.getItem('clBuddyTools')==='1'}catch(e){return false}}
function addBuddyBox(){if(!buddyOn())return;var side=q('.sidebar'),nav=q('.nav');if(!side||!nav||q('#clBuddyToolsBox',side))return;var box=document.createElement('div');box.className='sideBox';box.id='clBuddyToolsBox';box.innerHTML='<b>Advanced tools</b><p>Diagnostics and older specialist pages. Normal repairs use the numbered workflow above.</p><a class="btn good" href="chatgpt-buddy-tools.html" style="width:100%;justify-content:center;margin-top:8px">Open advanced tools</a>';side.insertBefore(box,nav.nextSibling)}
function loadScriptOnce(src,attr,onload){var old=q('script['+attr+']');if(old){if(onload)onload();return old}var s=document.createElement('script');s.src=src;s.setAttribute(attr,'yes');if(onload)s.onload=onload;document.head.appendChild(s);return s}
function loadWorkflowClarity(){loadScriptOnce('assets/code-labs-workflow-clarity-v130.js?v=cl-v200-one-flow','data-cl-workflow-clarity-v130');loadScriptOnce('assets/code-labs-page-completion-v139.js?v=cl-v200-one-flow','data-cl-page-completion-v139')}
function loadRouteAgreement(){loadScriptOnce('assets/code-labs-packet-builder-route-v131.js?v=cl-v200-one-flow','data-cl-packet-builder-route-v131')}
function loadPagePolish(){loadScriptOnce('assets/code-labs-page-polish-v172.js?v=cl-v200-one-flow','data-cl-page-polish-v172')}
function loadPatchDeskDedupe(){if(page()==='patch-desk')loadScriptOnce('assets/code-labs-v34-patch-desk-dedupe.js?v=cl-v200-one-flow','data-cl-patch-desk-dedupe')}
function loadSolWorkbench(){function sol(){loadScriptOnce('assets/code-labs-sol-packet-guard-v142.js?v=cl-v200-one-flow','data-cl-sol-packet-guard-v143',function(){loadScriptOnce('assets/code-labs-sol-workbench-v141.js?v=cl-v200-one-flow','data-cl-sol-workbench-v141')})}if(window.CL_SB||window.CodeLabsRepairHistory){sol();return}document.documentElement.setAttribute('data-cl-sol-auth-only','1');if(!q('style[data-cl-sol-auth-only]')){var st=document.createElement('style');st.setAttribute('data-cl-sol-auth-only','yes');st.textContent='html[data-cl-sol-auth-only="1"] #clHistoryPanel{display:none!important}';document.head.appendChild(st)}loadScriptOnce('assets/code-labs-v1-2-history.js?v=cl-v200-one-flow','data-cl-sol-auth-helper',sol)}
function loadOneFlow(){loadScriptOnce('assets/code-labs-one-flow-v200.js?v=cl-v200-one-flow','data-cl-one-flow-v200')}
function setupNextToSavedFiles(){if(page()!=='setup')return;qa('a[href="project-picker.html"],a[href="file-lab.html"]').forEach(function(a){a.href='saved-files.html';a.textContent=/next/i.test(a.textContent)?'Next: Saved Files':'Saved Files'});var box=q('#clWorkflowClarityV130');if(box){var next=q('.next',box);if(next){next.href='saved-files.html';next.textContent='Next: Saved Files'}}}
function run(){var ok=stabilizeNav();if(!ok){setTimeout(run,100);return}addBuddyBox();setupNextToSavedFiles();loadWorkflowClarity();loadRouteAgreement();loadPagePolish();loadPatchDeskDedupe();loadOneFlow();loadSolWorkbench()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();setTimeout(run,250);setTimeout(run,900);
window.CodeLabsStableNav={version:VERSION,links:LINKS.length,run:run};
})();