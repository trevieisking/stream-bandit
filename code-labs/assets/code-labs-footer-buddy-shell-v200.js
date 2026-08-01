/* Code Labs Footer Buddy Shell V209 - passive canonical route and page-action reader.
 *
 * Ownership contract:
 * - code-labs/assets/cl-nav.js alone owns route identity and governed order.
 * - page-owned controls alone declare executable server action IDs.
 * - this helper adds one generated Safe next step footer and read-only diagnostics.
 * - this helper never stamps actions onto controls, invents routes, polls, observes,
 *   pairs a browser tab, writes storage, calls the backend, or mutates navigation.
 */
(function(){
'use strict';
if(location.hostname==='www.chatterfriendsstreambandit.co.uk'){
  location.replace('https://chatterfriendsstreambandit.co.uk'+location.pathname+location.search+location.hash);
  return;
}
var VERSION='V209-footer-passive-route-and-page-action-reader';
var EXPECTED_OWNER='code-labs/assets/cl-nav.js';
function q(selector,scope){return(scope||document).querySelector(selector)}
function all(selector,scope){return Array.prototype.slice.call((scope||document).querySelectorAll(selector))}
function esc(value){return String(value==null?'':value).replace(/[<>"'&]/g,function(character){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]})}
function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function registry(){var value=window.CodeLabsWorkflowRegistry;return value&&value.owner===EXPECTED_OWNER&&typeof value.route==='function'&&typeof value.previous==='function'&&typeof value.next==='function'?value:null}
function currentRoute(){var value=registry();return value?value.route(page()):null}
function routeSnapshot(route){return route?Object.freeze({id:route.id,file:route.file,label:route.label,step:route.step,kind:route.kind}):null}
function declaredActions(){var seen=Object.create(null);all('[data-code-labs-action]').forEach(function(control){var action=String(control.getAttribute('data-code-labs-action')||'').trim();if(action)seen[action]=true});return Object.freeze(Object.keys(seen).sort())}
function helpRoute(){var value=registry(),route=value&&value.route('help');return route&&route.file?route:null}
function actionMap(actions){var map={};if(actions.length===1)map[page()]=actions[0];return Object.freeze(map)}
function addFooter(){
  var value=registry(),current=currentRoute(),main=q('.main')||q('main');
  if(!value||!current||current.kind!=='workflow'||!main||q('#clFooterBuddyShellV201'))return false;
  var previous=value.previous(current.id),next=value.next(current.id),help=helpRoute(),actions=declaredActions(),footer=document.createElement('section');
  var actionText=actions.length?actions.map(function(action){return'<code>'+esc(action)+'</code>'}).join(', '):'No executable server action is declared by this page.';
  footer.id='clFooterBuddyShellV201';
  footer.className='panel';
  footer.setAttribute('data-cl-footer-owner',VERSION);
  footer.setAttribute('data-cl-generated-helper-surface','footer-buddy-shell');
  footer.setAttribute('data-cl-page-runtime-ignore','yes');
  footer.setAttribute('data-cl-product-ignore','yes');
  footer.innerHTML='<h2>Safe next step</h2><p>Code Labs V104 is tool-only. Page-owned controls declare these exact server action IDs: '+actionText+' This footer does not assign actions or control execution.</p><div class="actions">'+(previous?'<a class="btn ghost" href="'+esc(previous.file)+'">Previous: '+esc(previous.label)+'</a>':'')+(next?'<a class="btn primary" href="'+esc(next.file)+'">Next: '+esc(next.label)+'</a>':'')+(help?'<a class="btn ghost" href="'+esc(help.file)+'">'+esc(help.label||'Help + Tools')+'</a>':'')+'</div><p class="fine">'+esc(VERSION)+' · one canonical route registry · GitHub changes remain branch and pull request only.</p>';
  main.appendChild(footer);
  return true;
}
function publish(footerReady){
  var value=registry(),current=currentRoute(),previous=value&&current?value.previous(current.id):null,next=value&&current?value.next(current.id):null,actions=declaredActions(),currentAction=actions.length===1?actions[0]:null;
  var api=Object.freeze({version:VERSION,role:'passive-canonical-route-and-page-action-reader',routeOwner:value?value.owner:null,routeRegistryVersion:value?value.version:null,routes:value?value.workflowRoutes:Object.freeze([]),currentActions:actions,currentAction:currentAction,currentRoute:routeSnapshot(current),previousRoute:routeSnapshot(previous),nextRoute:routeSnapshot(next),footerReady:footerReady,actionAnnotationsAdded:0,actionMutations:0,routeMutations:0,navMutations:0,storageWrites:0,backendWrites:0,observers:0,retryTimers:0,run:run});
  window.CodeLabsV104ToolOnlyActions=Object.freeze({version:VERSION,role:'read-only-page-declared-action-view',actions:actionMap(actions),current:currentAction,currentActions:actions,authoritative:false});
  window.CodeLabsFooterBuddyShellV204=api;
  window.CodeLabsFooterBuddyShellV203=api;
  window.CodeLabsFooterBuddyShellV202=api;
  window.CodeLabsFooterBuddyShellV201=api;
  window.CodeLabsFooterBuddyShellV200=api;
  return api;
}
function run(){var footerReady=addFooter();publish(footerReady);return!!registry()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
