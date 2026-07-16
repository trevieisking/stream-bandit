/* Code Labs V232 PR Bridge normal-lane compatibility owner. */
(function(){
'use strict';
if(!document.body||document.body.getAttribute('data-page')!=='github-tracker')return;
var observer=null;
function q(s,r){return(r||document).querySelector(s)}
function read(key){try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch(error){return{}}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value||{}))}catch(error){}}
function normalise(key,field){var value=read(key),current=String(value[field]||'').toLowerCase();if(current==='remove'||current==='delete'){value[field]='change';write(key,value)}}
function replaceText(root,from,to){if(!root)return;var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),node;while((node=walker.nextNode())){if(node.nodeValue&&node.nodeValue.indexOf(from)>-1)node.nodeValue=node.nodeValue.split(from).join(to)}}
function run(){
  normalise('codeLabsGithubWriterV2','action');
  normalise('codeLabsV30RepoDesk','mode');
  var out=q('#clPrBridgeOut');
  if(out&&/Action:\s*remove file|REMOVE NOTES/i.test(out.value||'')){out.value='Code Labs PR Bridge refreshed. File removal is unavailable in the normal V104 lane. Return to GitHub Writer and use read, add, change, or review.'}
  replaceText(document.body,'apply exactly this one file action','apply exactly this supported add or change action');
  replaceText(document.body,'Builds a copyable Buddy/GitHub connector request from Repo Desk or GitHub Writer state','Builds a copyable supported Buddy/GitHub connector request from Repo Desk or GitHub Writer state');
  replaceText(document.body,'Safety: branch and PR only; one target path only; browser does not write GitHub.','Safety: branch and PR only; one target path only; no file removal in the normal V104 lane; browser does not write GitHub.');
  var panel=q('#clPrBridge');
  if(panel&&!q('#clV232NoRemove',panel)){var note=document.createElement('div');note.id='clV232NoRemove';note.className='notice';note.innerHTML='<p><b>Current V104 rule:</b> PR Bridge supports add, change and review preparation. File removal is unavailable in the normal lane.</p>';panel.appendChild(note)}
}
function boot(){run();observer=new MutationObserver(run);observer.observe(document.body,{childList:true,subtree:true});setTimeout(function(){if(observer)observer.disconnect();run()},8000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
