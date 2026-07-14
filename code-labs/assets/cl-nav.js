/* Code Labs V202 stable page-first runtime.
   One navigation owner, one page renderer, one footer/V104 relay.
*/
(function(){
'use strict';
var VERSION='V203.1-stable-page-first';
var LINKS=[
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
 ['publish-prep.html','🚀','GitHub Writer','Branch and PR handoff'],
 ['github-tracker.html','🔎','GitHub Tracker','PR, preview and checks'],
 ['help.html','❔','Help + Tools','Guides and specialist tools']
];
var TOOLS=[
 ['start-guide.html','Start Guide'],['fix-wizard.html','Fix Wizard'],['ai-handoff.html','AI Handoff'],
 ['checklist-builder.html','Checklist Builder'],['about.html','About'],['faq.html','FAQ'],
 ['context-packet.html','Context Packet'],['helper-route-map.html','Route Scanner'],
 ['read-only-proof.html','Read-only Proof'],['owner-read-proof.html','Owner Read Proof'],
 ['buddy-canvas-receipt-v115.html','Canvas Receipt'],['chatgpt-buddy-tools.html','Buddy Tools']
];
function q(s,r){return(r||document).querySelector(s)}
function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function active(href){return page()+'.html'===href||(page()==='index'&&href==='index.html')}
function link(item,i){var a=document.createElement('a');a.href=item[0];a.setAttribute('data-step',String(i+1));if(active(item[0]))a.className='active';a.innerHTML='<span>'+esc(item[1])+'</span><div>'+(i+1)+'. '+esc(item[2])+'<small>'+esc(item[3])+'</small></div>';return a}
function nav(){var n=q('.nav');if(!n)return false;if(n.getAttribute('data-cl-nav-owner')===VERSION)return true;n.innerHTML='';LINKS.forEach(function(item,i){n.appendChild(link(item,i))});n.setAttribute('data-cl-nav-owner',VERSION);n.setAttribute('aria-label','Complete Code Labs workflow');return true}
function tools(){var side=q('.sidebar'),n=q('.nav');if(!side||!n||q('#clV202Tools',side))return;var d=document.createElement('details');d.id='clV202Tools';d.className='sideBox';d.innerHTML='<summary><b>Specialist tools</b></summary><p>Original helpers kept available without cluttering the main route.</p><div class="clV202ToolLinks">'+TOOLS.map(function(t){return'<a href="'+esc(t[0])+'">'+esc(t[1])+'</a>'}).join('')+'</div>';side.insertBefore(d,n.nextSibling)}
function style(){if(q('#clV202Style'))return;var s=document.createElement('style');s.id='clV202Style';s.textContent='.clV202ToolLinks{display:grid;gap:6px;margin-top:8px}.clV202ToolLinks a{display:block;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.65);text-decoration:none}.panel,.card,.notice,.danger,.success{overflow-wrap:anywhere}.actions{align-items:stretch}.actions .btn{justify-content:center}html[data-cl-shell-settling]{visibility:visible!important}html[data-cl-shell-settling] .sidebar .nav,html[data-cl-shell-settling] #clFooterBuddyShellV201{visibility:visible!important}@media(max-width:980px){.sidebar{position:relative!important;max-height:none!important}.main{min-width:0!important}}';document.head.appendChild(s)}
function load(src,attr){if(q('script['+attr+']'))return;var s=document.createElement('script');s.src=src;s.setAttribute(attr,'yes');document.head.appendChild(s)}
function helpers(){load('assets/code-labs-workflow-clarity-v130.js?v=cl-v202','data-cl-v202-clarity');load('assets/code-labs-page-completion-v139.js?v=cl-v202','data-cl-v202-completion');load('assets/code-labs-page-polish-v172.js?v=cl-v202','data-cl-v202-polish');load('assets/code-labs-current-file-overwrite-v201.js?v=cl-v202','data-cl-v202-overwrite');load('assets/code-labs-current-file-v104-overwrite-v201.js?v=cl-v202','data-cl-v202-v104-overwrite');load('assets/code-labs-history-overwrite-compat-v201.js?v=cl-v202','data-cl-v202-history-compat');if(page()==='saved-files')load('assets/code-labs-saved-files-repo-puller-v201.js?v=cl-v202','data-cl-v202-repo-puller');load('assets/code-labs-footer-buddy-shell-v200.js?v=cl-v203-1-shared-focused','data-cl-v202-footer')}
function run(){document.documentElement.removeAttribute('data-cl-shell-settling');document.documentElement.setAttribute('data-cl-shell-ready',VERSION);style();if(!nav()){setTimeout(run,120);return false}tools();var small=q('.logo small');if(small)small.textContent='Complete repair workflow · one V104 connector';helpers();return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.CodeLabsStableNav={version:VERSION,links:LINKS.length,run:run};
})();
