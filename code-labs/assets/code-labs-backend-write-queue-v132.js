/* Code Labs Backend Write Queue V139 disabled shell
   The old V138 backend panel is intentionally disabled.
   Buddy Page Bridge V139 is now the primary page-readable lane and works without Supabase.
   Browser still does not write GitHub, store a GitHub token, write main, or open PRs.
 */
(function(){
'use strict';
function disabled(){return Promise.resolve({ok:false,disabled:true,reason:'Backend Queue panel disabled. Use Buddy Page Bridge V139 / Copy Buddy Read Packet. GitHub branch and PR work stays in ChatGPT with the GitHub connector.'})}
function noop(){return[]}
function loadV145(){if(!document.body||document.body.getAttribute('data-page')!=='buddy-canvas'||document.querySelector('script[data-cl-page-runtime-v145]'))return;var s=document.createElement('script');s.src='assets/code-labs-page-runtime-v145.js?v=cl-v145-every-page-write';s.setAttribute('data-cl-page-runtime-v145','yes');document.body.appendChild(s)}
window.CodeLabsBackendWriteQueueV132={version:'V139-disabled',disabled:true,collect:function(){return{disabled:true,mode:'buddy_page_bridge_v139'}},send:disabled,loadQueue:noop,status:noop};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadV145);else loadV145();
})();