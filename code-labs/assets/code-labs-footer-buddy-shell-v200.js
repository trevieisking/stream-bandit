/* Code Labs Footer and V104 Tool-Only Action Registry V207.
   Navigation and shared server action IDs only. No browser relay, pairing, polling, or live-tab control.
*/
(function(){
'use strict';
if(location.hostname==='www.chatterfriendsstreambandit.co.uk'){location.replace('https://chatterfriendsstreambandit.co.uk'+location.pathname+location.search+location.hash);return}
var VERSION='V207-cg-repair-lab-route';
var ROUTES=[
['index','index.html','Home'],['setup','setup.html','Setup'],['project-picker','project-picker.html','Project Picker'],
['file-lab','file-lab.html','File Lab'],['saved-files','saved-files.html','Saved Files'],['rescue-room','rescue-room.html','Rescue Room'],
['packet-builder','packet-builder.html','Packet Builder'],['buddy-canvas','buddy-canvas.html','Buddy Canvas'],['v20','v20.html','Workflow Hub'],
['patch-desk','patch-desk.html','Patch Desk'],['patch-lab','patch-lab.html','Patch Lab'],['preview-test','preview-test.html','Preview + Test'],
['checkpoints','checkpoints.html','Checkpoints'],['repo-desk','repo-desk.html','Repo Desk'],['cg-repair-lab','cg-repair-lab.html','CG Repair Lab'],['code-god','code-god.html','Code God'],
['publish-prep','publish-prep.html','GitHub Writer'],['github-tracker','github-tracker.html','GitHub Tracker'],['help','help.html','Help + Tools']
];
var ACTIONS={
setup:'setup.save','project-picker':'project.select','file-lab':'file.select','saved-files':'file.select','rescue-room':'repair.save',
'packet-builder':'packet.build','buddy-canvas':'canvas.load_packet','patch-desk':'candidate.save','patch-lab':'candidate.save',
'preview-test':'test.record','checkpoints':'checkpoint.create','repo-desk':'github.prepare_request','cg-repair-lab':'cg_repair_lab.analyze','publish-prep':'github.prepare_request',
v20:'workflow.advance'
};
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function routeIndex(){var id=page();for(var i=0;i<ROUTES.length;i++)if(ROUTES[i][0]===id)return i;return-1}
function markActions(){var action=ACTIONS[page()]||'';if(!action)return;var buttons=document.querySelectorAll('button,.btn,[role="button"]');for(var i=0;i<buttons.length;i++){if(!buttons[i].getAttribute('data-code-labs-action'))buttons[i].setAttribute('data-code-labs-action',action)}}
function addFooter(){var main=q('.main')||q('main');if(!main||q('#clFooterBuddyShellV201'))return;var i=routeIndex();if(i<0)return;var prev=i>0?ROUTES[i-1]:null,next=i<ROUTES.length-1?ROUTES[i+1]:null,action=ACTIONS[page()]||'none',f=document.createElement('section');f.id='clFooterBuddyShellV201';f.className='panel';f.innerHTML='<h2>Safe next step</h2><p>Code Labs V104 is tool-only. Meaningful workflow controls use the shared server action ID <code>'+action+'</code>. No browser pairing, page polling, active-tab lease, or page-control request is used.</p><div class="actions">'+(prev?'<a class="btn ghost" href="'+prev[1]+'">Previous: '+prev[2]+'</a>':'')+(next?'<a class="btn primary" href="'+next[1]+'">Next: '+next[2]+'</a>':'')+'<a class="btn ghost" href="help.html">Help + Tools</a></div><p class="fine">'+VERSION+' · one Code Labs V104 connector · GitHub changes remain branch and pull request only.</p>';main.appendChild(f)}
function run(){markActions();addFooter();window.CodeLabsV104ToolOnlyActions={version:VERSION,actions:ACTIONS,current:ACTIONS[page()]||null};return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
window.CodeLabsFooterBuddyShellV204={version:VERSION,routes:ROUTES,actions:ACTIONS,run:run};window.CodeLabsFooterBuddyShellV203=window.CodeLabsFooterBuddyShellV204;window.CodeLabsFooterBuddyShellV202=window.CodeLabsFooterBuddyShellV204;window.CodeLabsFooterBuddyShellV201=window.CodeLabsFooterBuddyShellV204;window.CodeLabsFooterBuddyShellV200=window.CodeLabsFooterBuddyShellV204;
})();
