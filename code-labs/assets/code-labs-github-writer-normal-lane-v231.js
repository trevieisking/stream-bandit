/* Code Labs V231 GitHub Writer normal-lane compatibility owner. */
(function(){
'use strict';
if(!document.body||document.body.getAttribute('data-page')!=='publish-prep')return;
var observer=null;
function q(s,r){return(r||document).querySelector(s)}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(error){return{}}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value||{}))}catch(error){}}
function normaliseStore(key,field){var value=read(key);if(String(value[field]||'').toLowerCase()==='remove'){value[field]='change';write(key,value)}}
function replaceText(root,from,to){if(!root)return;var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),node;while((node=walker.nextNode())){if(node.nodeValue&&node.nodeValue.indexOf(from)>-1)node.nodeValue=node.nodeValue.split(from).join(to)}}
function run(){
  normaliseStore('codeLabsGithubWriterV2','action');
  normaliseStore('codeLabsV30RepoDesk','mode');
  var select=q('#gwAction');
  if(select){var remove=select.querySelector('option[value="remove"]');if(remove)remove.remove();if(select.value==='remove'){select.value='change';select.dispatchEvent(new Event('change',{bubbles:true}))}}
  var drill=q('#gwSafeRemove');if(drill)drill.remove();
  replaceText(document.body,'Read, add, edit, remove, or review one GitHub file safely.','Read, add, edit, or review one GitHub file safely.');
  replaceText(document.body,'verified file removals, and PR review','PR review and tracking');
  replaceText(document.body,'Remove one exact verified file with proof.','Use a separate explicitly approved maintenance lane for any file removal.');
  replaceText(document.body,'Add and edit need a complete file body. Remove needs proof that the exact target is safe to remove.','Add and edit need a complete file body. File removal is unavailable in the normal V104 lane.');
  replaceText(document.body,'Notes / remove proof','Change notes');
  replaceText(document.body,'For add/edit: explain what is being changed. For remove: prove why this exact file is verified safe to remove.','Explain what is being changed or reviewed.');
  replaceText(document.body,'For remove, this box is intentionally ignored by the handoff.','File removal is unavailable in the normal V104 lane.');
  replaceText(document.body,'read, add, edit, remove a verified file, or review a PR safely.','read, add, edit, or review a PR safely.');
  replaceText(document.body,'this read/add/edit/remove/review handoff','this read/add/edit/review handoff');
  document.title='Code Labs GitHub Writer - Read, Add, Edit and Review Files Safely';
}
function boot(){run();observer=new MutationObserver(run);observer.observe(document.body,{childList:true,subtree:true});setTimeout(function(){if(observer)observer.disconnect();run()},8000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
