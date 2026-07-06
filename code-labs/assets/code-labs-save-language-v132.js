/* Code Labs Save Language V132 - clearer labels only. No menu edits.
   V161: helper panel sits below the real page hero/title. */
(function(){
'use strict';
var VERSION='Code Labs Save Language V132';
var LABELS={
  saveSetup:'Save workspace setup',
  saveFile:'Save current source',
  checkpointOriginal:'Checkpoint original source',
  saveProblem:'Save repair notes',
  buildPacket:'Build repair packet',
  makePacket:'Build repair packet',
  copyPacket:'Copy repair packet',
  copyPacket2:'Copy repair packet',
  downloadPacket:'Download repair packet',
  saveFixed:'Save fixed full file',
  checkpointFixed:'Checkpoint fixed full file',
  copyFixed:'Copy fixed full file',
  downloadFixed:'Download fixed full file',
  showFixed:'Preview fixed full file',
  showOriginal:'Preview original source',
  savePass:'Save PASS test result',
  saveFail:'Save FAIL test result',
  saveNow:'Save Buddy Canvas backup',
  copyReport:'Copy Buddy report',
  useLoaded:'Reset fixed canvas to File Lab source',
  clExportState:'Export browser state backup',
  clCopyStateSummary:'Copy backup summary'
};
var MEANING={
  setup:'Stores workspace notes in this browser only.',
  'file-lab':'Stores the full original source file in this repair state.',
  'rescue-room':'Stores the problem, preserve rules and error notes before packet building.',
  'packet-builder':'Builds the assistant repair packet. It is not a live page change.',
  'buddy-canvas':'Stores assistant canvas backup and repair-history context.',
  'patch-desk':'Stores the complete fixed full-file candidate before preview.',
  'patch-lab':'Fallback repair lane. Save after the output is complete.',
  'preview-test':'Stores the test result only.',
  checkpoints:'Stores rollback proof.',
  'repo-desk':'Prepares repository handoff details.',
  'publish-prep':'Prepares GitHub handoff instructions.',
  'github-tracker':'Tracks PR and preview results.'
};
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return (document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html$/,'')||'index'}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function style(){if(q('#clSaveLanguageV132Style'))return;var s=document.createElement('style');s.id='clSaveLanguageV132Style';s.textContent='.clSaveLanguageV132{border:1px solid rgba(34,211,166,.28);background:linear-gradient(135deg,rgba(34,211,166,.08),rgba(124,60,255,.06));border-radius:16px;padding:10px 12px;margin:8px 0;color:#dfffee}.clSaveLanguageV132 b{color:#dfffee}.clSaveLanguageV132 small{display:block;color:#b9c0d8;line-height:1.4}';document.head.appendChild(s)}
function renameButtons(){Object.keys(LABELS).forEach(function(id){var el=q('#'+id);if(!el)return;el.textContent=LABELS[id];el.setAttribute('aria-label',LABELS[id]);el.setAttribute('title',LABELS[id]);el.setAttribute('data-cl-save-language-v132','true')})}
function renameHistoryButtons(){qa('button,a').forEach(function(el){var t=String(el.textContent||'').trim();if(t==='Save repair history'){el.textContent='Save repair history snapshot';el.setAttribute('title','Save repair history snapshot')}if(t==='Load saved history'){el.textContent='Load repair history';el.setAttribute('title','Load repair history')}})}
function meaningPanel(){var id=page(),msg=MEANING[id];if(!msg||q('#clSaveMeaningV132'))return;var target=q('#clWorkflowClarityV130')||q('.hero');var box=document.createElement('div');box.id='clSaveMeaningV132';box.className='clSaveLanguageV132';box.innerHTML='<b>Save meaning on this page</b><small>'+esc(msg)+'</small>';if(target&&target.parentNode)target.parentNode.insertBefore(box,target.nextSibling);else{var main=q('.main')||document.body;main.appendChild(box)}}
function run(){style();renameButtons();renameHistoryButtons();meaningPanel();window.CodeLabsSaveLanguageV132={version:VERSION,page:page()}}
function boot(){run();setTimeout(run,250);setTimeout(run,900);setTimeout(run,1600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
