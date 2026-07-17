/* Code God review state V277: retire stale findings when review inputs change. */
(function(){
'use strict';
var lastInputSignature='';
var reviewedSignature='';
function id(v){return document.getElementById(v)}
function text(v){var e=id(v);return e?String(e.value||e.textContent||''):''}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return{}}}
function mode(){return read('codeLabsCodeGodModeV275').mode==='manual'?'manual':'workflow'}
function hash(v){v=String(v||'');var h=0;for(var i=0;i<v.length;i++){h=((h<<5)-h)+v.charCodeAt(i);h|=0}return(h>>>0).toString(16)}
function workflow(){return window.CodeGodSourceModesV275&&window.CodeGodSourceModesV275.workflowContext?window.CodeGodSourceModesV275.workflowContext():{}}
function signature(){var m=mode(),c=m==='manual'?(window.CodeGodSourceModesV275&&window.CodeGodSourceModesV275.manualContext?window.CodeGodSourceModesV275.manualContext():{}):workflow();var original=m==='manual'?text('cgManualOriginal'):String(c.original||'');var proposed=m==='manual'?text('cgManualProposed'):String(c.proposed||'');return[m,String(c.action||''),String(c.repo||''),String(c.path||''),String(c.request_branch||''),original.length,hash(original),proposed.length,hash(proposed)].join('|')}
function lockWriter(){var n=id('cgNavWriter'),b=id('cgBackWriter');if(n){n.removeAttribute('href');n.setAttribute('aria-disabled','true');n.setAttribute('tabindex','-1')}if(b)b.hidden=true}
function resetResult(){var current=signature();if(!current||current===reviewedSignature)return;var original=mode()==='manual'?text('cgManualOriginal'):String(workflow().original||'');var proposed=mode()==='manual'?text('cgManualProposed'):String(workflow().proposed||'');var same=original&&proposed&&original===proposed;var ready=original&&proposed&&!same;var status=id('cgStatus'),summary=id('cgSummary'),findings=id('cgFindings');if(status){status.textContent=ready?'READY':same?'NO CHANGE YET':'WAITING';status.className='cgStatus cgFix'}if(summary)summary.innerHTML='<p><b>'+(ready?'READY:':same?'NO CHANGE YET:':'WAITING:')+'</b> '+(ready?'Complete original and proposed files are loaded. Run Code God Review for a fresh result.':same?'The proposed file is complete but identical to the GitHub original. Apply the intended edit before review.':'Load or select a complete proposed file, then run Code God Review.')+'</p>';if(findings)findings.innerHTML='<div class="item"><b>'+(ready?'Fresh review required':same?'No proposed change detected':'Review input incomplete')+'</b><p>The previous Code God result was retired because the review inputs changed.</p></div>';lockWriter()}
function noteReview(){setTimeout(function(){reviewedSignature=signature();lastInputSignature=reviewedSignature},50)}
function watch(){var s=signature();if(!lastInputSignature){lastInputSignature=s;return}if(s!==lastInputSignature){lastInputSignature=s;resetResult()}}
function wire(){var run=id('cgRun');if(run&&!run.getAttribute('data-cg-review-state-v277')){run.setAttribute('data-cg-review-state-v277','yes');run.addEventListener('click',noteReview,true)}['cgManualUrl','cgManualOwner','cgManualRepo','cgManualSourceBranch','cgManualPath','cgManualAction','cgManualRequestBranch','cgManualNotes','cgManualProposed','cgWorkflowMode','cgManualMode','cgPullGithub','cgUseWorkflowDetails','cgUseWorkflowProposal','cgUsePulledProposal'].forEach(function(k){var e=id(k);if(e&&!e.getAttribute('data-cg-review-state-v277')){e.setAttribute('data-cg-review-state-v277','yes');e.addEventListener(e.tagName==='BUTTON'?'click':'input',function(){setTimeout(watch,40)})}})}
function boot(){if(!document.body||document.body.getAttribute('data-page')!=='code-god')return;var tries=0,t=setInterval(function(){tries++;if(id('cgRun')&&id('cgStatus')){wire();lastInputSignature=signature();clearInterval(t)}else if(tries>50)clearInterval(t)},100);setInterval(watch,700)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
