/* Code Labs Buddy Canvas Menu V200 - align Buddy Canvas with the simple one-flow workflow. */
(function(){
'use strict';
var ROUTES=[
 ['index.html','🏠','1. Home','Start here'],
 ['setup.html','⚙️','2. Setup','Project and repo'],
 ['saved-files.html','📄','3. Saved Files','Load or edit full file'],
 ['rescue-room.html','🛟','4. Rescue Room','Problem and rules'],
 ['packet-builder.html','📦','5. Packet Builder','Build repair context'],
 ['patch-lab.html','🧪','6. Patch Lab','Apply or validate repair'],
 ['buddy-canvas.html','🤖','7. Buddy Lane','ChatGPT handoff'],
 ['preview-test.html','🎯','8. Preview + Test','Check before live'],
 ['checkpoints.html','💾','9. Checkpoints','Rollback and receipts'],
 ['help.html','❔','10. Help','Plain-English guide']
];
function q(s,r){return(r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function link(item){var active=item[0]==='buddy-canvas.html';return '<a class="'+(active?'active':'')+'" href="'+item[0]+'"><span>'+item[1]+'</span><div>'+esc(item[2])+'<small>'+esc(item[3])+'</small></div></a>'}
function loadOneFlow(){if(q('script[data-cl-one-flow-v200]'))return;var s=document.createElement('script');s.src='assets/code-labs-one-flow-v200.js?v=cl-v200-one-flow';s.setAttribute('data-cl-one-flow-v200','yes');document.head.appendChild(s)}
function run(){
 if((document.body&&document.body.getAttribute('data-page'))!=='buddy-canvas')return;
 var nav=q('.nav');if(!nav)return;
 nav.innerHTML=ROUTES.map(link).join('');
 nav.setAttribute('aria-label','Code Labs simple workflow navigation');
 var logoSmall=q('.logo small');if(logoSmall)logoSmall.textContent='Kind repair workflow for non-coders';
 var side=q('.sideBox');if(side)side.innerHTML='<b>Buddy Lane rule</b><p>You prepare or approve the complete file. ChatGPT handles branch, pull request, review and deployment.</p>';
 loadOneFlow();
 window.CodeLabsBuddyCanvasMenuV134={version:'V200',active:true,routes:ROUTES.map(function(x){return x[2]})};
}
function boot(){run();setTimeout(run,250);setTimeout(run,900);setTimeout(run,1700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();