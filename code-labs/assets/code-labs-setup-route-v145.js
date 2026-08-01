/* Code Labs Setup Route V288 - passive V287 registry consumer.
 *
 * This file preserves the historical CodeLabsSetupRouteV145 compatibility
 * surface while retiring every former ownership behaviour. cl-nav.js is the
 * sole route, ordering, visible-step numbering and sidebar owner.
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
  Object.freeze({id:'setup',file:'setup.html'}),
  Object.freeze({id:'project-picker',file:'project-picker.html'}),
  Object.freeze({id:'file-lab',file:'file-lab.html'})
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
  'own-route-map',
  'own-visible-step-numbers'
]);

function registry(){
  return window.CodeLabsWorkflowRegistry||null;
}

function route(source,id){
  return source&&typeof source.route==='function'?source.route(id):null;
}

function workflowIndex(source,id){
  return source&&typeof source.workflowIndex==='function'?source.workflowIndex(id):-1;
}

function sameRoute(actual,expected){
  return !!(
    actual&&expected&&
    actual.id===expected.id&&
    actual.file===expected.file
  );
}

function numericStep(item){
  return item&&typeof item.step==='number'&&Number.isFinite(item.step)?item.step:null;
}

function validate(source){
  if(!source||source.owner!==EXPECTED_OWNER)return false;
  if(typeof source.route!=='function'||typeof source.next!=='function'||typeof source.previous!=='function')return false;
  if(typeof source.workflowIndex!=='function')return false;
  var home=route(source,'index');
  var setup=route(source,'setup');
  var picker=route(source,'project-picker');
  var fileLab=route(source,'file-lab');
  var homeStep=numericStep(home);
  var setupStep=numericStep(setup);
  var pickerStep=numericStep(picker);
  var fileStep=numericStep(fileLab);
  return !!(
    home&&home.id==='index'&&home.file==='index.html'&&
    sameRoute(setup,EXPECTED_SEQUENCE[0])&&
    sameRoute(picker,EXPECTED_SEQUENCE[1])&&
    sameRoute(fileLab,EXPECTED_SEQUENCE[2])&&
    homeStep!==null&&setupStep===homeStep+1&&
    pickerStep===setupStep+1&&fileStep===pickerStep+1&&
    workflowIndex(source,'setup')===0&&
    workflowIndex(source,'project-picker')===1&&
    workflowIndex(source,'file-lab')===2&&
    source.previous('setup')===null&&
    source.next('setup')===picker&&
    source.next('project-picker')===fileLab
  );
}

function snapshot(){
  var source=registry();
  var valid=validate(source);
  var home=valid?route(source,'index'):null;
  var setup=valid?route(source,'setup'):null;
  var picker=valid?route(source,'project-picker'):null;
  var fileLab=valid?route(source,'file-lab'):null;
  return Object.freeze({
    version:'V288-passive-v287-registry-consumer',
    active:valid,
    valid:valid,
    mode:'read-only-registry-consumer',
    registryOwner:source&&source.owner||null,
    expectedOwner:EXPECTED_OWNER,
    route:valid?'Home -> Master Plan + Setup -> Project Picker -> File Lab':null,
    home:home,
    setup:setup,
    projectPicker:picker,
    fileLab:fileLab,
    visibleSteps:valid?Object.freeze({
      home:home.step,
      setup:setup.step,
      projectPicker:picker.step,
      fileLab:fileLab.step
    }):null,
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
    window.console.warn('Code Labs Setup Route is inactive because the canonical cl-nav.js registry is unavailable or incompatible.');
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
  home:state.home,
  setup:state.setup,
  projectPicker:state.projectPicker,
  fileLab:state.fileLab,
  visibleSteps:state.visibleSteps,
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
