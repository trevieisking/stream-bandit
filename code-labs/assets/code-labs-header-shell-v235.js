/* Code Labs Header Shell V247 - passive canonical-registry tool drawer.

   Ownership contract:
   - code-labs/assets/cl-nav.js is the only route catalogue and sidebar renderer.
   - this helper never creates, repairs, reorders, renumbers or observes sidebar links.
   - specialist links come only from the canonical registry toolRoutes group.
   - this helper performs one bounded decoration pass after cl-nav has rendered.

   Preserved compatibility surfaces:
   - responsive sidebar/tool-link styling;
   - the existing #clV202Tools specialist drawer location and identifier;
   - the logo status text;
   - window.CodeLabsStableNav and window.CodeLabsHeaderShellV235 diagnostics.
*/
(function(){'use strict';
var VERSION='V247-header-shell-passive-tool-registry';
var ROLE='passive-canonical-registry-consumer';
var EXPECTED_OWNER='code-labs/assets/cl-nav.js';

function q(selector,scope){return(scope||document).querySelector(selector)}
function esc(value){return String(value==null?'':value).replace(/[<>"'&]/g,function(character){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]})}
function registry(){var value=window.CodeLabsWorkflowRegistry;return value&&Array.isArray(value.toolRoutes)&&value.owner===EXPECTED_OWNER?value:null}
function canonicalNav(){var node=q('.nav'),rootOwner=document.documentElement.getAttribute('data-cl-route-registry-owner'),navOwner=node&&node.getAttribute('data-cl-route-registry-owner');return node&&rootOwner&&navOwner===rootOwner?node:null}
function toolRoutes(){var value=registry();if(!value)return[];return value.toolRoutes.filter(function(route){return route&&route.file&&route.label&&route.tool===true})}
function routeSnapshot(routes){return Object.freeze(routes.map(function(route){return Object.freeze({id:route.id,file:route.file,label:route.label})}))}

function ensureStyle(){
 if(q('#clHeaderShellV235Style'))return false;
 var node=document.createElement('style');
 node.id='clHeaderShellV235Style';
 node.textContent='.clV235ToolLinks{display:grid;gap:6px;margin-top:8px}.clV235ToolLinks a{display:block;padding:7px 9px;border-radius:10px;background:rgba(255,255,255,.08);text-decoration:none}@media(max-width:980px){.sidebar{position:relative!important;max-height:none!important}.main{min-width:0!important}}';
 document.head.appendChild(node);
 return true
}

function ensureTools(routes){
 var side=q('.sidebar'),nav=canonicalNav();
 if(!side||!nav||!routes.length)return false;
 var existing=q('#clV202Tools',side);
 if(existing)return true;
 var details=document.createElement('details');
 details.id='clV202Tools';
 details.className='sideBox';
 details.setAttribute('data-cl-header-shell-owner',VERSION);
 details.innerHTML='<summary><b>Specialist tools</b></summary><p>Original helpers stay available without cluttering the main route.</p><div class="clV235ToolLinks">'+routes.map(function(route){return'<a href="'+esc(route.file)+'">'+esc(route.label)+'</a>'}).join('')+'</div>';
 side.insertBefore(details,nav.nextSibling);
 return true
}

function updateLogo(){
 var small=q('.logo small');
 if(!small)return false;
 small.textContent='Complete repair workflow · CG Repair Lab and Code God before GitHub Writer';
 small.setAttribute('data-cl-header-shell-owner',VERSION);
 return true
}

function publishDiagnostics(routes,result){
 var value=registry();
 var api=Object.freeze({
  version:VERSION,
  role:ROLE,
  routeOwner:value?value.owner:null,
  routeRegistryVersion:value?value.version:null,
  toolRouteCount:routes.length,
  toolRoutes:routeSnapshot(routes),
  navMutations:0,
  observers:0,
  retryTimers:0,
  lastResult:Object.freeze(result),
  run:run
 });
 window.CodeLabsStableNav=api;
 window.CodeLabsHeaderShellV235=api;
 return api
}

function run(){
 var value=registry(),nav=canonicalNav();
 if(!value||!nav){
  publishDiagnostics([],{ok:false,reason:'canonical_registry_unavailable'});
  return false
 }
 var routes=toolRoutes();
 var result={
  ok:true,
  styleReady:ensureStyle(),
  toolsReady:ensureTools(routes),
  logoReady:updateLogo(),
  routeOwner:value.owner,
  navOwner:nav.getAttribute('data-cl-route-registry-owner')
 };
 nav.setAttribute('data-cl-header-shell',VERSION);
 document.documentElement.dataset.clHeaderReady='v247';
 publishDiagnostics(routes,result);
 return true
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
