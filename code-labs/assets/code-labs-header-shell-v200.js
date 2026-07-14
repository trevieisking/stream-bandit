/* Code Labs Header Shell V201
   Restores the protected workflow and keeps specialist tools discoverable.
*/
(function () {
  'use strict';

  var VERSION = 'V201.1-full-route';
  var ROUTES = [
    ['index.html','🏠','Home','Start and current repair'],
    ['setup.html','⚙️','Setup','Project and repository'],
    ['project-picker.html','🗂️','Project Picker','Choose saved project'],
    ['file-lab.html','📥','File Lab','Pull or paste full source'],
    ['saved-files.html','🗃️','Saved Files','Current file and history'],
    ['rescue-room.html','🛟','Rescue Room','Problem and preserve rules'],
    ['packet-builder.html','📦','Packet Builder','Complete repair context'],
    ['buddy-canvas.html','🤖','Buddy Canvas','Source and fixed full file'],
    ['v20.html','🧭','Workflow Hub','Choose the safe route'],
    ['patch-desk.html','🧩','Patch Desk','Review full replacement'],
    ['patch-lab.html','🧪','Patch Lab','Exact patch fallback'],
    ['preview-test.html','🎯','Preview + Test','Check before GitHub'],
    ['checkpoints.html','💾','Checkpoints','Rollback and receipts'],
    ['repo-desk.html','🧾','Repo Desk','Choose repository action'],
    ['publish-prep.html','🚀','GitHub Writer','Branch and PR handoff'],
    ['github-tracker.html','🔎','GitHub Tracker','PR, preview and checks'],
    ['help.html','❔','Help + Tools','Guides and specialist tools']
  ];
  var TOOLS = [
    ['start-guide.html','Start Guide'],['fix-wizard.html','Fix Wizard'],['ai-handoff.html','AI Handoff'],
    ['checklist-builder.html','Checklist Builder'],['about.html','About'],['faq.html','FAQ'],
    ['context-packet.html','Context Packet'],['helper-route-map.html','Route Scanner'],
    ['read-only-proof.html','Read-only Proof'],['owner-read-proof.html','Owner Read Proof'],
    ['buddy-canvas-receipt-v115.html','Canvas Receipt'],['chatgpt-buddy-tools.html','All Buddy Tools']
  ];
  var repairing = false;
  var observer = null;

  function q(selector, root) { return (root || document).querySelector(selector); }
  function all(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function esc(value) { return String(value == null ? '' : value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function pageId() { return (document.body && document.body.getAttribute('data-page')) || location.pathname.split('/').pop().replace(/\.html?$/i,'') || 'index'; }
  function isActive(href) { var id=pageId(); return id+'.html'===href || (id==='index'&&href==='index.html'); }
  function makeLink(route,index){var a=document.createElement('a');a.href=route[0];a.setAttribute('data-step',String(index+1));if(isActive(route[0]))a.className='active';a.innerHTML='<span>'+esc(route[1])+'</span><div>'+String(index+1)+'. '+esc(route[2])+'<small>'+esc(route[3])+'</small></div>';return a;}
  function sameOrder(nav){return all('a[data-step]',nav).map(function(a){return(a.getAttribute('href')||'').split('?')[0];}).join('|')===ROUTES.map(function(r){return r[0];}).join('|');}
  function stabilizeNavigation(){var nav=q('.nav');if(!nav)return false;if(nav.getAttribute('data-cl-header-shell')===VERSION&&sameOrder(nav))return true;repairing=true;nav.innerHTML='';ROUTES.forEach(function(r,i){nav.appendChild(makeLink(r,i));});nav.setAttribute('data-cl-header-shell',VERSION);nav.setAttribute('data-cl-nav-stable',VERSION);nav.setAttribute('aria-label','Complete Code Labs workflow navigation');repairing=false;return true;}
  function watchNavigation(){var nav=q('.nav');if(!nav||nav.getAttribute('data-cl-header-watch')===VERSION)return;nav.setAttribute('data-cl-header-watch',VERSION);observer=new MutationObserver(function(){if(!repairing&&(!sameOrder(nav)||nav.getAttribute('data-cl-header-shell')!==VERSION))stabilizeNavigation();});observer.observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:['href','data-cl-header-shell','data-cl-nav-stable']});}
  function addTools(){var sidebar=q('.sidebar'),nav=q('.nav');if(!sidebar||!nav)return;var box=q('#clProtectedToolsV201',sidebar);if(!box){box=document.createElement('details');box.id='clProtectedToolsV201';box.className='sideBox';box.open=false;sidebar.insertBefore(box,nav.nextSibling);}box.innerHTML='<summary><b>Specialist pages</b></summary><p>Protected tools from the original Code Labs workflow.</p><div style="display:grid;gap:6px">'+TOOLS.map(function(t){return '<a href="'+esc(t[0])+'">'+esc(t[1])+'</a>';}).join('')+'</div>';}
  function normalizeIdentity(){var small=q('.logo small');if(small)small.textContent='Complete repair workflow · one V104 connector';}
  function run(){if(!stabilizeNavigation()){setTimeout(run,100);return false;}watchNavigation();addTools();normalizeIdentity();return true;}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setTimeout(run,250);setTimeout(run,900);setTimeout(run,2600);
  window.CodeLabsHeaderShellV201={version:VERSION,routes:ROUTES,tools:TOOLS,run:run};
  window.CodeLabsHeaderShellV200=window.CodeLabsHeaderShellV201;
})();
