/* Code Labs V3.3 - workflow tidy overlay
   Visual/order polish only. No GitHub writes, no Supabase writes, no direct-main actions.
*/
(function(){
'use strict';
var KEY='codeLabsV1State';
var FLOW=[
  ['file-lab','File Lab','rescue-room.html','Next: Rescue Room'],
  ['rescue-room','Rescue Room','packet-builder.html','Next: Packet Builder'],
  ['packet-builder','Packet Builder','buddy-canvas.html','Next: Buddy Canvas'],
  ['buddy-canvas','Buddy Canvas','v20.html','Next: Workflow Hub'],
  ['v20','Workflow Hub','patch-desk.html','Next: Patch Desk'],
  ['patch-desk','Patch Desk','patch-lab.html','Next: Patch Lab'],
  ['patch-lab','Patch Lab','preview-test.html','Save to Preview + Test'],
  ['preview-test','Preview + Test','checkpoints.html','Save to Checkpoints'],
  ['checkpoints','Checkpoints','repo-desk.html','Send to Repo Desk'],
  ['repo-desk','Repo Desk','publish-prep.html','Send to GitHub Writer'],
  ['publish-prep','GitHub Writer','github-tracker.html','Send to GitHub Tracker'],
  ['github-tracker','GitHub Tracker','connection-guide.html','Copy Tracker Report'],
  ['connection-guide','Connection Guide','read-only-proof.html','Next: Read-Only Proof'],
  ['read-only-proof','Read-Only Proof','file-lab.html','Back to File Lab']
];
var PROOF={'file-lab':1,'rescue-room':1,'packet-builder':1,'buddy-canvas':1,'v20':1,'patch-desk':1,'patch-lab':1,'preview-test':1,'checkpoints':1,'repo-desk':1,'publish-prep':1,'github-tracker':1,'connection-guide':1};
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return document.body&&document.body.getAttribute('data-page')||''}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function item(id){for(var i=0;i<FLOW.length;i++){if(FLOW[i][0]===id)return{index:i+1,id:FLOW[i][0],title:FLOW[i][1],href:FLOW[i][2],next:FLOW[i][3]}}return null}
function fileInfo(){var s=read(),f=s.file||{},p=s.project||{},src=f.githubSource||{};var repo=(src.owner&&src.repo)?src.owner+'/'+src.repo:(p.repo||'trevieisking/stream-bandit');var path=src.path||f.path||f.filename||'';return{repo:repo,path:path,branch:src.branch||'main',hasCurrent:!!f.currentCode,currentChars:String(f.currentCode||'').length,hasFixed:String(f.fixedCode||'').length>120,fixedChars:String(f.fixedCode||'').length}}
function style(){if(q('#clV33TidyStyle'))return;var st=document.createElement('style');st.id='clV33TidyStyle';st.textContent='.clOrderTag{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:5px 9px;margin:0 0 8px;background:#e0f2fe;color:#075985;font-weight:950;font-size:12px}.clOrderTag.good{background:#dcfce7;color:#166534}.clOrderTag.footer{background:#f3e8ff;color:#6b21a8}.clTidyProof{border:2px solid rgba(15,159,110,.24)!important;background:linear-gradient(135deg,rgba(16,185,129,.08),rgba(37,99,235,.05))!important}.clTidyProof .grid3{margin-top:8px}.clFooterHistory{margin-top:18px!important;border:2px solid rgba(126,34,206,.18)!important;background:linear-gradient(135deg,rgba(126,34,206,.05),rgba(15,159,110,.05))!important}.clTidyBigNext{border-width:3px!important}.clTidyMuted{color:#64748b;font-size:12px}.clOlderDetails{border:1px solid rgba(148,163,184,.35);border-radius:16px;padding:10px;margin-top:10px;background:rgba(248,250,252,.72)}.clOlderDetails summary{cursor:pointer;font-weight:950;color:#0f172a}.clTidyMiniFlow{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.clTidyMiniFlow span{border:1px solid rgba(148,163,184,.35);border-radius:999px;padding:4px 8px;background:white;font-size:11px;font-weight:800;color:#334155}.clTidyMiniFlow span.active{background:#dcfce7;border-color:#16a34a;color:#166534}';document.head.appendChild(st)}
function tag(el,text,kind){if(!el||el.querySelector(':scope > .clOrderTag'))return;var d=document.createElement('div');d.className='clOrderTag '+(kind||'');d.textContent=text;el.insertBefore(d,el.firstChild)}
function tuneFlowPanel(){var p=q('#clNextFlowPanel'), it=item(page());if(!p||!it)return;p.classList.add('clTidyBigNext');tag(p,'1. Workflow buttons / where am I?','good');var txt=q('p',p);if(txt)txt.innerHTML='<b>'+esc(it.title)+'</b> · This is step '+it.index+' of '+FLOW.length+' in the main Code Labs flow.';var existing=q('#clV33MiniFlow',p);if(!existing){var mini=document.createElement('div');mini.id='clV33MiniFlow';mini.className='clTidyMiniFlow';mini.innerHTML=FLOW.map(function(x,i){return '<span class="'+(x[0]===page()?'active':'')+'">'+(i+1)+'. '+esc(x[1])+'</span>'}).join('');p.appendChild(mini)}}
function currentProof(){var id=page();if(!PROOF[id])return;var main=q('.main');if(!main)return;if(q('#cfp')){q('#cfp').classList.add('clTidyProof');tag(q('#cfp'),'2. Current file proof','good');return}if(q('#clTidyCurrentFile'))return;var f=fileInfo(),box=document.createElement('section');box.id='clTidyCurrentFile';box.className='panel clTidyProof';box.innerHTML='<h2>Current file proof</h2><p><b>File:</b> '+esc(f.path||'No file loaded yet')+'</p><div class="grid3"><div class="stat"><b>Repo</b><span>'+esc(f.repo)+'</span></div><div class="stat"><b>Original code</b><span>'+(f.hasCurrent?f.currentChars:'not loaded')+'</span></div><div class="stat"><b>Fixed output</b><span>'+(f.hasFixed?f.fixedChars:'not saved')+'</span></div></div><p class="clTidyMuted">This proof panel only reads browser state. It does not write to GitHub or Supabase.</p>';tag(box,'2. Current file proof','good');var after=q('#clNextFlowPanel')||q('.topbar');if(after&&after.parentNode)after.parentNode.insertBefore(box,after.nextSibling);else main.insertBefore(box,main.firstChild)}
function moveHistoryFooter(){var h=q('#clHistoryPanel'),main=q('.main');if(!h||!main)return;h.classList.add('clFooterHistory');tag(h,'Footer. Supabase Repair History','footer');var footers=qa('.footerNote',main);var footer=footers[footers.length-1];if(footer&&h.nextSibling!==footer){main.insertBefore(h,footer)}else if(!footer&&h.parentNode===main&&h!==main.lastElementChild){main.appendChild(h)}}
function movePreviewNext(){if(page()!=='preview-test')return;var next=q('#clGenericNextStep'),layout=q('.layout');if(next&&layout&&layout.parentNode&&next.previousSibling!==layout){layout.parentNode.insertBefore(next,layout.nextSibling)}}
function tidyPatchDesk(){if(page()!=='patch-desk')return;var link=q('a[href="preview-test.html"]');var checkpoint=q('#checkpointFixed');if(link){link.classList.remove('ghost');link.classList.add('good');link.textContent='Preview + Test';if(checkpoint&&checkpoint.parentNode&&link.previousSibling!==checkpoint)checkpoint.parentNode.insertBefore(link,checkpoint.nextSibling)}}
function collapseCheckpoints(){if(page()!=='checkpoints'||q('#clOlderCheckpointsDetails'))return;var panels=qa('.panel'),target=null;panels.forEach(function(p){var h=q('h2',p);if(h&&/Saved checkpoints/i.test(h.textContent))target=p});if(!target)return;var list=q('.list',target),items=qa(':scope > .item',list);if(items.length<3)return;var d=document.createElement('details');d.id='clOlderCheckpointsDetails';d.className='clOlderDetails';d.innerHTML='<summary>Show older checkpoints ('+(items.length-1)+')</summary><div class="list"></div>';var inner=q('.list',d);items.slice(1).forEach(function(x){inner.appendChild(x)});list.parentNode.insertBefore(d,list.nextSibling);var h=q('h2',target);if(h)h.textContent='Latest checkpoint';tag(target,'2. Latest checkpoint first','good')}
function cleanTrackerExamples(){if(page()!=='github-tracker')return;['#gtPr','#gtPreview','#gtBranch'].forEach(function(sel){var el=q(sel);if(!el)return;var v=String(el.value||'');if(/owner\/repo\/pull\/123|example\.com|raw\.githack\.com\/owner\/repo\/branch\/example/.test(v)){el.value=''}});var panel=q('#githubTracker');if(panel)tag(panel,'1. Paste ChatGPT/GitHub result','good')}
function labelSafeWrite(){var p=q('#clSafeWritePanel');if(p)tag(p,'ChatGPT readable / safe write box','')}
function run(){style();tuneFlowPanel();currentProof();labelSafeWrite();movePreviewNext();tidyPatchDesk();collapseCheckpoints();cleanTrackerExamples();moveHistoryFooter();document.body.setAttribute('data-code-labs-v33-tidy','active')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,250);setTimeout(run,700);setTimeout(run,1500);setTimeout(run,3000);setInterval(run,5000);
})();