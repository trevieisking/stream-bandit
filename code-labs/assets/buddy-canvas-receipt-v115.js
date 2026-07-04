/* Code Labs Buddy Canvas V115 - Receipt Helper */
(function(){
'use strict';
var KEY='codeLabsV1State',last=null;
function q(s,r){return(r||document).querySelector(s);}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
function val(sel){var el=q(sel);return el?String(el.value||''):'';}
function setVal(sel,v){var el=q(sel);if(el)el.value=String(v||'');}
function text(sel,v){var el=q(sel);if(el)el.textContent=String(v||'');}
function chars(t){return String(t||'').length;}
function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
function toast(msg){var t=q('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}}
function copy(v){v=String(v||'');navigator.clipboard.writeText(v).then(function(){toast('Receipt copied.');}).catch(function(){var out=q('#clReceiptOut');if(out){out.focus();out.select();document.execCommand('copy');toast('Receipt selected.');}});}
function info(){var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');var path=g.path||f.path||f.filename||'';var repo=(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:(p.repo||'trevieisking/stream-bandit'));return{state:s,file:f,path:path,repo:repo,branch:g.branch||'main'};}
function source(){return val('#loadedCode')||String((read().file||{}).currentCode||'');}
function fixed(){return val('#fixedCode')||String((read().file||{}).fixedCode||'');}
function exists(sel){return !!q(sel);}
function ensureUi(){
 var main=q('.main');
 if(!main||q('#clReceiptPanel'))return;
 var panel=document.createElement('section');
 panel.id='clReceiptPanel';
 panel.className='panel';
 panel.style.border='3px solid rgba(34,197,94,.42)';
 panel.innerHTML='\
 <h2>Buddy Canvas Receipt</h2>\
 <p class="muted">Local receipt for loaded panels, visible source, fixed code, and local Code Labs state.</p>\
 <div class="actions">\
  <button class="btn primary" id="clReceiptRun" type="button">Run Receipt</button>\
  <button class="btn ghost" id="clReceiptCopy" type="button">Copy Receipt</button>\
  <span id="clReceiptStatus" class="badge warn">Not run</span>\
 </div>\
 <div id="clReceiptSummary" class="readonlyNote">Waiting.</div>\
 <textarea id="clReceiptOut" class="bigReport" readonly placeholder="Receipt appears here"></textarea>';
 var after=q('#clHandoffDesk')||q('#clProofPanel')||q('#clSourceControlPanel')||q('#sourceProof')||q('.stickyApply')||q('.hero');
 if(after&&after.parentNode)after.parentNode.insertBefore(panel,after.nextSibling);else main.insertBefore(panel,main.firstChild);
 q('#clReceiptRun').onclick=run;
 q('#clReceiptCopy').onclick=function(){if(!last)last=receipt();setVal('#clReceiptOut',JSON.stringify(last,null,2));copy(JSON.stringify(last,null,2));};
}
function receipt(){var i=info(),src=source(),fix=fixed(),stateSrc=String((i.file||{}).currentCode||''),stateFix=String((i.file||{}).fixedCode||'');var checks={loaded_code:exists('#loadedCode'),fixed_code:exists('#fixedCode'),source_control:exists('#clSourceControlPanel'),proof_tools:exists('#clProofPanel'),handoff_desk:exists('#clHandoffDesk'),receipt:exists('#clReceiptPanel'),global_canvas:!!window.CodeLabsBuddyCanvas,global_source_control:!!window.CodeLabsBuddyCanvasSourceControl,global_proof_tools:!!window.CodeLabsBuddyCanvasProofTools,global_handoff:!!window.CodeLabsBuddyCanvasHandoffDesk};var total=0,passed=0;Object.keys(checks).forEach(function(k){total++;if(checks[k])passed++;});return{tool:'Code Labs Buddy Canvas Receipt',version:'V115',created_at:new Date().toISOString(),repo:i.repo,path:i.path||null,branch:i.branch,checks:checks,score:{passed:passed,total:total,clean:passed===total},visible_source:{characters:chars(src),lines:lines(src),hash:hash32(src)},visible_fixed:{characters:chars(fix),lines:lines(fix),hash:hash32(fix)},local_state:{bytes:chars(JSON.stringify(i.state||{})),source_characters:chars(stateSrc),fixed_characters:chars(stateFix),source_matches_visible:stateSrc===src,fixed_matches_visible:stateFix===fix},cache_warning:(stateSrc&&src&&stateSrc!==src)?'local state source and visible source differ':'none'};}
function run(){last=receipt();var clean=last.score.clean;var st=q('#clReceiptStatus');if(st){st.textContent=clean?'clean':'needs check';st.className='badge '+(clean?'good':'warn');}text('#clReceiptSummary','Panels '+last.score.passed+'/'+last.score.total+' | source '+last.visible_source.characters+' chars | fixed '+last.visible_fixed.characters+' chars | cache '+last.cache_warning);setVal('#clReceiptOut',JSON.stringify(last,null,2));}
function expose(){window.CodeLabsBuddyCanvasReceipt={version:'V115',run:function(){last=receipt();return last;},copy:function(){if(!last)last=receipt();copy(JSON.stringify(last,null,2));}};}
function boot(){ensureUi();expose();setTimeout(run,800);setInterval(function(){if(q('#clReceiptPanel'))run();},5000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
