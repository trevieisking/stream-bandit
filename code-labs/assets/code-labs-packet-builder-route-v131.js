/* Code Labs V131 - make Packet Builder visible in the main route */
(function(){
'use strict';
var MAIN={
'file-lab':['File Lab','Main workflow step 1 of 14'],
'rescue-room':['Rescue Room','Main workflow step 2 of 14'],
'packet-builder':['Packet Builder','Main workflow step 3 of 14'],
'buddy-canvas':['Buddy Canvas','Main workflow step 4 of 14'],
'v20':['Workflow Hub','Main workflow step 5 of 14'],
'patch-desk':['Patch Desk','Main workflow step 6 of 14'],
'patch-lab':['Patch Lab','Main workflow step 7 of 14'],
'preview-test':['Preview + Test','Main workflow step 8 of 14'],
'checkpoints':['Checkpoints','Main workflow step 9 of 14'],
'repo-desk':['Repo Desk','Main workflow step 10 of 14'],
'publish-prep':['GitHub Writer','Main workflow step 11 of 14'],
'github-tracker':['GitHub Tracker','Main workflow step 12 of 14'],
'connection-guide':['Connection Guide','Main workflow step 13 of 14'],
'read-only-proof':['Read Only Proof','Main workflow step 14 of 14']
};
function q(s,r){return(r||document).querySelector(s)}
function page(){return (document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html$/,'')||'index'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function addPacketMenu(id){var nav=q('.nav');if(!nav)return;var existing=q('.nav a[href="packet-builder.html"]');if(!existing){var a=document.createElement('a');a.href='packet-builder.html';a.innerHTML='<span>📦</span><div>Packet Builder<small>Build packet</small></div>';var rescue=q('.nav a[href="rescue-room.html"]');if(rescue&&rescue.nextSibling)nav.insertBefore(a,rescue.nextSibling);else nav.appendChild(a);existing=a}if(id==='packet-builder'){Array.prototype.slice.call(nav.querySelectorAll('a')).forEach(function(x){x.classList.toggle('active',x.getAttribute('href')==='packet-builder.html')})}}
function fixLabels(id){var info=MAIN[id];if(!info)return;var crumb=q('.crumbs b');if(crumb)crumb.textContent=info[0];var panel=q('#clNextFlowPanel');if(panel){var p=q('p',panel);if(p)p.innerHTML='<b>'+esc(info[0])+'</b> · '+esc(info[1])+'. Use Previous or Next to return safely.';var prev=q('a',panel),next=panel.querySelectorAll('a')[1];if(id==='packet-builder'){if(prev){prev.href='rescue-room.html';prev.textContent='Previous: Rescue Room'}if(next){next.href='buddy-canvas.html';next.textContent='Next: Buddy Canvas'}}}if(id==='packet-builder')document.title='Packet Builder | Code Labs'}
function run(){var id=page();addPacketMenu(id);fixLabels(id)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,200);setTimeout(run,700);setTimeout(run,1500);setInterval(run,3000);
window.CodeLabsPacketBuilderRouteV131={run:run};
})();
