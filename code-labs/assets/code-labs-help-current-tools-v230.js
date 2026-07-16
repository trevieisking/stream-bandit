/* Code Labs V230 Help current-tools compatibility owner. */
(function(){
'use strict';
if(!document.body||document.body.getAttribute('data-page')!=='help')return;
var observer=null;
function replaceText(root,from,to){
  if(!root)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  var node;
  while((node=walker.nextNode())){
    if(node.nodeValue&&node.nodeValue.indexOf(from)>-1){
      node.nodeValue=node.nodeValue.split(from).join(to);
    }
  }
}
function run(){
  replaceText(document.body,'Open the eight Code Labs pages.','Open the 18 Code Labs workflow pages.');
  replaceText(document.body,'Add backend tools later, starting read-only, then safe writes, then GitHub PR tools.','Use the live V104 Tool-Only backend for owner-scoped reads, reviewed writes, Code God checks, and GitHub branch-and-PR preparation.');
  replaceText(document.body,'These are browser-safe helpers Code Labs can use before the backend.','These browser helpers remain useful fallbacks alongside the live V104 Tool-Only backend.');
  replaceText(document.body,'connector plan','live connector tools');
  replaceText(document.body,'future gadgets','browser fallback tools');
  replaceText(document.body,'history notes','live backend tools');
}
function boot(){
  run();
  observer=new MutationObserver(run);
  observer.observe(document.body,{childList:true,subtree:true});
  setTimeout(function(){if(observer)observer.disconnect();run()},8000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
