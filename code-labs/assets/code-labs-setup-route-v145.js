/* Code Labs Setup Route V284 - complete passive canonical-registry consumer.
 *
 * This file deliberately preserves the historical CodeLabsSetupRouteV145
 * compatibility surface while retiring every former ownership behaviour.
 * cl-nav.js is the sole route, ordering, numbering and sidebar owner.
 *
 * Retired here:
 * - navigation creation, insertion, ordering and active-state mutation;
 * - workflow-panel and footer text rewriting;
 * - setup-next-link rewriting;
 * - MutationObserver ownership loops;
 * - delayed retries, timers and polling;
 * - click interception, reloads and independent route maps.
 */
(function(){
'use strict';

var EXPECTED_OWNER='code-labs/assets/cl-nav.js';
var EXPECTED_SEQUENCE=Object.freeze([
  Object.freeze({id:'setup',file:'setup.html',step:1}),
  Object.freeze({id:'project-picker',file:'project-picker.html',step:2}),
  Object.freeze({id:'file-lab',file:'file-lab.html',step:3})
]);
var RETIRED_BEHAVIOURS=Object.freeze([
  'create-navigation-link',
  'insert-or-reorder-navigation-link',
  'set-navigation-active-state',
  'rewrite-workflow-next-link',
  'rewrite-help-route-copy',
  'observe-navigation-mutations',
  'run-delayed-retries',
  'poll-or-reload-page',
  'own-route-map'
]);

function registry(){
  return window.CodeLabsWorkflowRegistry||null;
}

function route(source,id){
  return source&&typeof source.route==='function'?source.route(id):null;
}

function sameRoute(actual,expected){
  return !!(
    actual&&expected&&
    actual.id===expected.id&&
    actual.file===expected.file&&
    actual.step===expected.step
  );
}

function validate(source){
  if(!source||source.owner!==EXPECTED_OWNER)return false;
  for(var index=0;index<EXPECTED_SEQUENCE.length;index+=1){
    if(!sameRoute(route(source,EXPECTED_SEQUENCE[index].id),EXPECTED_SEQUENCE[index]))return false;
  }
  var setup=route(source,'setup');
  var previous=typeof source.previous==='function'?source.previous('setup'):null;
  var next=typeof source.next==='function'?source.next('setup'):null;
  return !!(
    setup&&
    previous===null&&
    next&&next.id==='project-picker'&&next.file==='project-picker.html'
  );
}

function snapshot(){
  var source=registry();
  var valid=validate(source);
  return Object.freeze({
    version:'V284-complete-passive-registry-consumer',
    active:valid,
    valid:valid,
    mode:'read-only-registry-consumer',
    registryOwner:source&&source.owner||null,
    expectedOwner:EXPECTED_OWNER,
    route:valid?'Home -> Master Plan + Setup -> Project Picker -> File Lab':null,
    setup:valid?route(source,'setup'):null,
    projectPicker:valid?route(source,'project-picker'):null,
    fileLab:valid?route(source,'file-lab'):null,
    retiredBehaviours:RETIRED_BEHAVIOURS,
    mutatesDom:false,
    ownsNavigation:false,
    ownsRoutes:false,
    ownsNumbering:false,
    ownsSidebar:false,
    rewritesContent:false,
    interceptsClicks:false,
    reloadsPage:false,
    usesTimers:false,
    usesObservers:false,
    usesPolling:false
  });
}

function readRoute(id){
  var source=registry();
  return validate(source)?route(source,id):null;
}

function readSequence(){
  var source=registry();
  if(!validate(source))return Object.freeze([]);
  return Object.freeze(EXPECTED_SEQUENCE.map(function(item){return route(source,item.id)}));
}

function verify(){
  var state=snapshot();
  if(!state.valid&&window.console&&typeof window.console.warn==='function'){
    window.console.warn('Code Labs Setup Route is inactive because the canonical cl-nav.js registry is unavailable or invalid.');
  }
  return state.valid;
}

var state=snapshot();
window.CodeLabsSetupRouteV145=Object.freeze({
  version:state.version,
  active:state.active,
  valid:state.valid,
  mode:state.mode,
  registryOwner:state.registryOwner,
  expectedOwner:state.expectedOwner,
  route:state.route,
  setup:state.setup,
  projectPicker:state.projectPicker,
  fileLab:state.fileLab,
  retiredBehaviours:state.retiredBehaviours,
  mutatesDom:false,
  ownsNavigation:false,
  ownsRoutes:false,
  ownsNumbering:false,
  ownsSidebar:false,
  rewritesContent:false,
  interceptsClicks:false,
  reloadsPage:false,
  usesTimers:false,
  usesObservers:false,
  usesPolling:false,
  readRoute:readRoute,
  readSequence:readSequence,
  snapshot:snapshot,
  verify:verify
});

verify();
})();
