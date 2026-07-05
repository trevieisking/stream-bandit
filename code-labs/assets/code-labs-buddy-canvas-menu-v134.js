/* Code Labs Buddy Canvas Menu V134 - align Buddy Canvas sidebar with promoted workflow. No canvas/save behavior changes. */
(function(){
'use strict';
var ROUTES=[
 ['index.html','🏠','Home','Start here'],
 ['file-lab.html','📄','File Lab','Load or read code'],
 ['rescue-room.html','🛟','Rescue Room','Repair safely'],
 ['packet-builder.html','📦','Packet Builder','Build packet'],
 ['buddy-canvas.html','🤖','Buddy Canvas','Assistant lane'],
 ['v20.html','🧭','Workflow Hub','Choose route'],
 ['patch-desk.html','🧩','Patch Desk','Paste fixed file'],
 ['patch-lab.html','🧠','Patch Lab','Patch exact lines'],
 ['preview-test.html','🧪','Preview + Test','Check before live'],
 ['checkpoints.html','💾','Checkpoints','Rollback saved'],
 ['repo-desk.html','🗂️','Repo Desk','Choose action'],
 ['publish-prep.html','🚀','GitHub Writer','Build handoff'],
 ['github-tracker.html','🔎','GitHub Tracker','PR and preview']
];
var TOOLS=[
 ['connection-guide.html','🔗','Connection Guide','One safe click'],
 ['read-only-proof.html','🔒','Read-Only Proof','Backend V90'],
 ['about.html','ℹ️','About','What Code Labs does'],
 ['checklist-builder.html','✅','Checklist Builder','Build pass lists'],
 ['help.html','🧰','Help + Tools','All utilities'],
 ['faq.html','❔','FAQ','Clear answers']
];
function q(s,r){return(r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function link(item){var active=item[0]==='buddy-canvas.html';return '<a class="'+(active?'active':'')+'" href="'+item[0]+'"><span>'+item[1]+'</span><div>'+esc(item[2])+'<small>'+esc(item[3])+'</small></div></a>'}
function run(){
  if((document.body&&document.body.getAttribute('data-page'))!=='buddy-canvas')return;
  var nav=q('.nav');if(!nav)return;
  nav.innerHTML='<div class="navGroupLabel">Workflow</div>'+ROUTES.map(link).join('')+'<div class="navGroupLabel">Tools</div>'+TOOLS.map(link).join('');
  var logoSmall=q('.logo small');if(logoSmall)logoSmall.textContent='ChatGPT repair room for non-coders';
  var simple=q('.sideBox b');if(simple&&/Simple rule/i.test(simple.textContent))simple.textContent='Safety rule';
  var p=q('.sideBox p');if(p&&/File Lab loads the source/i.test(p.textContent))p.textContent='Do not replace a live file until you have saved a checkpoint and tested the preview.';
  window.CodeLabsBuddyCanvasMenuV134={version:'V134',active:true,routes:ROUTES.map(function(x){return x[2]})};
}
function boot(){run();setTimeout(run,250);setTimeout(run,900);setTimeout(run,1700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
