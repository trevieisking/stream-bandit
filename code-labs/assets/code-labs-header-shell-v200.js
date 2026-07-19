/* Code Labs Header Shell V245.
   Canonical 19-step fallback navigation. cl-nav.js remains the primary owner.
*/
(function () {
  'use strict';
  var VERSION = 'V245-canonical-19';
  var ROUTES = [
    ['index.html','🏠','Home','Start and current repair'],
    ['setup.html','⚙️','Setup','Project and repository'],
    ['project-picker.html','🗂️','Project Picker','Choose saved project'],
    ['file-lab.html','📥','File Lab','Load complete source'],
    ['saved-files.html','🗃️','Saved Files','Select one saved file'],
    ['rescue-room.html','🛟','Rescue Room','Problem and preserve rules'],
    ['packet-builder.html','📦','Packet Builder','Complete repair context'],
    ['buddy-canvas.html','🤖','Buddy Canvas','Source and fixed file'],
    ['v20.html','🧭','Workflow Hub','Choose the safe route'],
    ['patch-desk.html','🧩','Patch Desk','Review full replacement'],
    ['patch-lab.html','🧪','Patch Lab','Exact-edit fallback'],
    ['preview-test.html','🎯','Preview + Test','Check before GitHub'],
    ['checkpoints.html','💾','Checkpoints','Rollback and receipts'],
    ['repo-desk.html','🧾','Repo Desk','Choose repository action'],
    ['cg-repair-lab.html','🧠','CG Repair Lab','Code Labs Pro analysis'],
    ['code-god.html','⚖️','Code God','Deterministic final review'],
    ['publish-prep.html','🚀','GitHub Writer','Branch and PR handoff'],
    ['github-tracker.html','🔎','GitHub Tracker','PR, preview and checks'],
    ['help.html','❔','Help + Tools','Guides and specialist tools']
  ];
  var TOOLS = [
    ['start-guide.html','Start Guide'],['fix-wizard.html','Fix Wizard'],['ai-handoff.html','AI Handoff'],
    ['checklist-builder.html','Checklist Builder'],['about.html','About'],['faq.html','FAQ'],
    ['context-packet.html','Context Packet'],['helper-route-map.html','Route Scanner'],
    ['read-only-proof.html','Read-only Proof'],['repair-bridge-status.html','Repair Bridge Status'],
    ['buddy-canvas-receipt-v115.html','Canvas Receipt'],['chatgpt-buddy-tools.html','All Buddy Tools']
  ];
  var scans = 0;
  var observer = null;
  function q(s,r){return(r||document).querySelector(s)}
  function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
  function active(h){return page()+'.html'===h||(page()==='index'&&h==='index.html')}
  function make(r,i){var a=document.createElement('a');a.href=r[0];a.dataset.step=String(i+1);if(active(r[0]))a.className='active';a.innerHTML='<span>'+esc(r[1])+'</span><div>'+(i+1)+'. '+esc(r[2])+'<small>'+esc(r[3])+'</small></div>';return a}
  function correct(nav){var links=all('a[data-step]',nav);return links.length===ROUTES.length&&links.every(function(a,i){return(a.getAttribute('href')||'').split('?')[0]===ROUTES[i][0]&&a.getAttribute('data-step')===String(i+1)})}
  function nav(){var n=q('.nav');if(!n)return false;if(window.CodeLabsStableNav&&typeof window.CodeLabsStableNav.run==='function'){window.CodeLabsStableNav.run();if(correct(n))return true}if(correct(n)){n.dataset.clHeaderShell=VERSION;return true}n.innerHTML='';ROUTES.forEach(function(r,i){n.appendChild(make(r,i))});n.dataset.clHeaderShell=VERSION;n.setAttribute('aria-label','Complete Code Labs workflow');return true}
  function tools(){var side=q('.sidebar'),n=q('.nav');if(!side||!n)return;var old=q('#clProtectedToolsV201',side),primary=q('#clV202Tools',side);if(primary){if(old)old.remove();return}if(!old){old=document.createElement('details');old.id='clProtectedToolsV201';old.className='sideBox';side.insertBefore(old,n.nextSibling)}old.innerHTML='<summary><b>Specialist tools</b></summary><p>Original helpers kept available without cluttering the main route.</p><div style="display:grid;gap:6px">'+TOOLS.map(function(t){return'<a href="'+esc(t[0])+'">'+esc(t[1])+'</a>'}).join('')+'</div>'}
  function run(){scans+=1;if(!nav())return false;tools();var small=q('.logo small');if(small)small.textContent='Complete repair workflow · CG Repair Lab and Code God before GitHub Writer';if(scans>=20&&observer){observer.disconnect();observer=null}return true}
  function boot(){run();var n=q('.nav');if(n){observer=new MutationObserver(function(){window.setTimeout(run,40)});observer.observe(n,{childList:true,subtree:true,attributes:true,attributeFilter:['href','data-step']})}window.setTimeout(function(){if(observer){observer.disconnect();observer=null}},5000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.CodeLabsHeaderShellV245={version:VERSION,routes:ROUTES,run:run};
  window.CodeLabsHeaderShellV244=window.CodeLabsHeaderShellV245;
  window.CodeLabsHeaderShellV202=window.CodeLabsHeaderShellV245;
  window.CodeLabsHeaderShellV201=window.CodeLabsHeaderShellV245;
  window.CodeLabsHeaderShellV200=window.CodeLabsHeaderShellV245;
})();
