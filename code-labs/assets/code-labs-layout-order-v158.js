/* Code Labs V158 - shared layout/order stabilizer.
   Keeps the current route clear without removing working support pages. */
(function(){
'use strict';
var MAIN=['file-lab','rescue-room','packet-builder','buddy-canvas','v20','patch-desk','patch-lab','preview-test','checkpoints','repo-desk','publish-prep','github-tracker'];
var PREP=['index','setup'];
var SUPPORT=['start-guide','fix-wizard','ai-handoff','checklist-builder','connection-guide','read-only-proof','context-packet','connector-status','help','faq','about','helper-route-map'];
var META={
 index:['Home','Start here','index.html','Home'],
 setup:['Setup','Project and repo','setup.html','Setup'],
 'file-lab':['File Lab','1. Load full file','file-lab.html','1'],
 'rescue-room':['Rescue Room','2. Problem and rules','rescue-room.html','2'],
 'packet-builder':['Packet Builder','3. Build packet','packet-builder.html','3'],
 'buddy-canvas':['Buddy Canvas','4. Assistant lane','buddy-canvas.html','4'],
 v20:['Workflow Hub','5. Choose route','v20.html','5'],
 'patch-desk':['Patch Desk','6. Full fixed file','patch-desk.html','6'],
 'patch-lab':['Patch Lab','7. Exact fallback','patch-lab.html','7'],
 'preview-test':['Preview + Test','8. Check result','preview-test.html','8'],
 checkpoints:['Checkpoints','9. Rollback proof','checkpoints.html','9'],
 'repo-desk':['Repo Desk','10. Repo handoff','repo-desk.html','10'],
 'publish-prep':['GitHub Writer','11. Branch and PR','publish-prep.html','11'],
 'github-tracker':['GitHub Tracker','12. Track result','github-tracker.html','12'],
 'start-guide':['Start Guide','Optional intake','start-guide.html','Guide'],
 'fix-wizard':['Fix Wizard','Optional helper','fix-wizard.html','Help'],
 'ai-handoff':['AI Handoff','Optional package','ai-handoff.html','AI'],
 'checklist-builder':['Checklist Builder','Support checklist','checklist-builder.html','Check'],
 'connection-guide':['Connection Guide','Connections','connection-guide.html','Link'],
 'read-only-proof':['Read-Only Proof','Read proof','read-only-proof.html','Read'],
 'context-packet':['Context Packet','Context support','context-packet.html','Packet'],
 'connector-status':['Connector Status','Status','connector-status.html','Status'],
 help:['Help + Tools','Utilities','help.html','Help'],
 faq:['FAQ','Answers','faq.html','FAQ'],
 about:['About','What Code Labs does','about.html','Info'],
 'helper-route-map':['Helper Route Map','Scanner','helper-route-map.html','Scan']
};
var NEXT={index:'setup',setup:'file-lab','file-lab':'rescue-room','rescue-room':'packet-builder','packet-builder':'buddy-canvas','buddy-canvas':'v20',v20:'patch-desk','patch-desk':'patch-lab','patch-lab':'preview-test','preview-test':'checkpoints',checkpoints:'repo-desk','repo-desk':'publish-prep','publish-prep':'github-tracker','github-tracker':'connection-guide','connection-guide':'read-only-proof','read-only-proof':'file-lab',help:'faq',faq:'about',about:'setup','start-guide':'setup','fix-wizard':'setup','ai-handoff':'buddy-canvas'};
var PREV={setup:'index','file-lab':'setup','rescue-room':'file-lab','packet-builder':'rescue-room','buddy-canvas':'packet-builder',v20:'buddy-canvas','patch-desk':'v20','patch-lab':'patch-desk','preview-test':'patch-lab',checkpoints:'preview-test','repo-desk':'checkpoints','publish-prep':'repo-desk','github-tracker':'publish-prep','connection-guide':'github-tracker','read-only-proof':'connection-guide',help:'index',faq:'help',about:'faq','start-guide':'index','fix-wizard':'start-guide','ai-handoff':'buddy-canvas'};
function q(s,r){return(r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function page(){return (document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html$/,'')||'index'}
function meta(id){return META[id]||[id,'Code Labs page',id+'.html','Page']}
function idx(list,id){for(var i=0;i<list.length;i++){if(list[i]===id)return i+1}return 0}
function routeText(id){var n=idx(MAIN,id);if(n)return 'Main workflow step '+n+' of '+MAIN.length;var p=idx(PREP,id);if(p)return 'Prep step '+p+' of '+PREP.length;return 'Support page'}
function link(id,current){var m=meta(id),a=document.createElement('a');a.href=m[2];if(id===current)a.className='active';a.innerHTML='<span>'+esc(m[3])+'</span><div>'+esc(m[0])+'<small>'+esc(m[1])+'</small></div>';return a}
function style(){if(q('#clLayoutOrderV158Style'))return;var s=document.createElement('style');s.id='clLayoutOrderV158Style';s.textContent='.clRouteListV158{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:7px;margin-top:10px}.clRouteListV158 a{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);border-radius:14px;padding:8px 9px;text-decoration:none;font-weight:900;color:inherit}.clRouteListV158 a.active{border-color:rgba(34,211,166,.7);background:rgba(34,211,166,.14)}#clBuddyLaneV158{border:2px solid rgba(124,60,255,.28);background:linear-gradient(135deg,rgba(124,60,255,.10),rgba(34,211,166,.08))}#clBuddyLaneV158 h2{margin-top:0}#clBuddyLaneV158 .btn{margin-right:7px}.clSupportNoteV158{font-size:12px;opacity:.78;margin-top:8px}';document.head.appendChild(s)}
function rebuildNav(){var nav=q('.nav');if(!nav)return;var current=page();while(nav.firstChild)nav.removeChild(nav.firstChild);var g=document.createElement('div');g.className='navGroupLabel';g.textContent='Prep';nav.appendChild(g);PREP.forEach(function(id){nav.appendChild(link(id,current))});var w=document.createElement('div');w.className='navGroupLabel';w.textContent='Numbered workflow';nav.appendChild(w);MAIN.forEach(function(id){nav.appendChild(link(id,current))});var t=document.createElement('div');t.className='navGroupLabel';t.textContent='Support tools';nav.appendChild(t);SUPPORT.forEach(function(id){if(META[id])nav.appendChild(link(id,current))})}
function ensureSelector(){var main=q('.main')||q('main')||document.body;if(!main)return null;var current=page(), panel=q('#clNextFlowPanel');if(!panel){panel=document.createElement('section');panel.className='panel';panel.id='clNextFlowPanel'}panel.style.border='2px solid rgba(15,159,110,.24)';var m=meta(current), next=meta(NEXT[current]||'file-lab'), prev=meta(PREV[current]||'index');panel.innerHTML='<h2>Page selector</h2><p><b>'+esc(m[0])+'</b> · '+esc(routeText(current))+'. Follow the numbered order unless Buddy tells you a support helper is needed.</p><div class="actions"><a class="btn ghost" href="'+esc(prev[2])+'">Previous: '+esc(prev[0])+'</a><a class="btn good" href="'+esc(next[2])+'">Next: '+esc(next[0])+'</a></div><div class="clRouteListV158">'+MAIN.map(function(id){var mm=meta(id);return '<a class="'+(id===current?'active':'')+'" href="'+esc(mm[2])+'"><b>'+esc(mm[3])+'. '+esc(mm[0])+'</b><br><small>'+esc(mm[1])+'</small></a>'}).join('')+'</div>';var top=q('.topbar');if(top&&top.parentNode){top.parentNode.insertBefore(panel,top.nextSibling)}else if(main.firstChild!==panel){main.insertBefore(panel,main.firstChild)}return panel}
function ensureBuddyLane(){var main=q('.main')||q('main')||document.body, selector=q('#clNextFlowPanel');if(!main||!selector)return;var box=q('#clBuddyLaneV158');if(!box){box=document.createElement('section');box.id='clBuddyLaneV158';box.className='panel'}box.innerHTML='<h2>Buddy lane</h2><p>Use this lane when the numbered route reaches Packet Builder and Buddy Canvas, or when ChatGPT asks for source proof. This stays near the top so Buddy can guide the next move.</p><div class="actions"><a class="btn primary" href="packet-builder.html">3. Packet Builder</a><a class="btn good" href="buddy-canvas.html">4. Buddy Canvas</a><a class="btn ghost" href="v20.html">5. Workflow Hub</a></div><p class="clSupportNoteV158">Support helpers stay available, but the normal route remains numbered and in order.</p>';selector.parentNode.insertBefore(box,selector.nextSibling)}
function moveClarityBelowBuddy(){var buddy=q('#clBuddyLaneV158'), clarity=q('#clWorkflowClarityV130');if(buddy&&clarity&&buddy.nextSibling!==clarity)buddy.parentNode.insertBefore(clarity,buddy.nextSibling)}
function moveSupabaseBottom(){var main=q('.main')||q('main')||document.body, panel=q('#clHistoryPanel');if(!main||!panel)return;var footer=q('.footerNote',main);if(footer&&footer.previousSibling!==panel){main.insertBefore(panel,footer)}else if(!footer&&panel.parentNode!==main){main.appendChild(panel)}}
function run(){style();rebuildNav();ensureSelector();ensureBuddyLane();moveClarityBelowBuddy();moveSupabaseBottom();document.body.setAttribute('data-code-labs-layout-order-v158','active')}
function boot(){run();setTimeout(run,250);setTimeout(run,900);setTimeout(run,1800);setTimeout(run,3200);setTimeout(run,5400)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
