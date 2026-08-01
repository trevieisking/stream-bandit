/* Code Labs Workflow Clarity V288 - complete passive V287 registry consumer.
 *
 * Compatibility purpose
 * ---------------------
 * The historical Workflow Clarity helper exposed page identity, visible-step
 * numbering, next/back guidance, support-page information and a public
 * CodeLabsWorkflowClarityV130 diagnostics object. Those read surfaces remain
 * available here, but all workflow authority has been removed from this file.
 *
 * Sole authority
 * --------------
 * code-labs/assets/cl-nav.js owns route records, workflow order, visible-step
 * numbers, previous/next relationships, sidebar membership and support
 * classification. This file only reads window.CodeLabsWorkflowRegistry. It
 * never creates a fallback route, repairs a missing route, or substitutes its
 * own sequence.
 *
 * Explicitly retired
 * ------------------
 * - FLOW and SUPPORT arrays;
 * - INFO, ROUTE and BACK maps;
 * - independent step-number ownership;
 * - breadcrumb, navigation or guidance-panel mutation;
 * - style injection and page-content movement;
 * - localStorage readiness gates;
 * - delayed retries, observers, polling, click interception and reloads.
 */
(function(){
'use strict';

var EXPECTED_OWNER='code-labs/assets/cl-nav.js';
var VERSION='V288-complete-passive-v287-registry-consumer';
var MODE='read-only-registry-consumer';
var RETIRED_BEHAVIOURS=Object.freeze([
  'own-workflow-array',
  'own-support-array',
  'own-info-map',
  'own-route-map',
  'own-back-map',
  'own-step-numbering',
  'create-navigation-link',
  'rewrite-navigation-link',
  'rewrite-breadcrumb',
  'inject-guidance-panel',
  'inject-styles',
  'move-page-content',
  'read-local-storage',
  'gate-pages-from-local-state',
  'run-delayed-retries',
  'observe-page-mutations',
  'poll-page-state',
  'intercept-clicks',
  'reload-page'
]);

function registry(){
  return window.CodeLabsWorkflowRegistry||null;
}

function isFunction(value){
  return typeof value==='function';
}

function currentPage(){
  var bodyPage=document.body&&document.body.getAttribute('data-page');
  if(bodyPage)return String(bodyPage);
  var name=String(location.pathname||'').split('/').pop()||'index';
  return name.replace(/\.html?$/i,'')||'index';
}

function routeFrom(source,id){
  return source&&isFunction(source.route)?source.route(String(id||'')):null;
}

function previousFrom(source,id){
  return source&&isFunction(source.previous)?source.previous(String(id||'')):null;
}

function nextFrom(source,id){
  return source&&isFunction(source.next)?source.next(String(id||'')):null;
}

function indexFrom(source,id){
  return source&&isFunction(source.workflowIndex)?source.workflowIndex(String(id||'')):-1;
}

function familyFrom(source,id,family){
  return source&&isFunction(source.hasFamily)?source.hasFamily(String(id||''),String(family||'')):false;
}

function sameRoute(actual,id,file){
  return !!(
    actual&&
    actual.id===id&&
    actual.file===file
  );
}

function numericStep(item){
  return item&&typeof item.step==='number'&&Number.isFinite(item.step)?item.step:null;
}

function validateRegistry(source){
  if(!source||source.owner!==EXPECTED_OWNER)return false;
  if(!isFunction(source.route)||!isFunction(source.next)||!isFunction(source.previous))return false;
  if(!isFunction(source.workflowIndex)||!isFunction(source.hasFamily))return false;
  var home=routeFrom(source,'index');
  var setup=routeFrom(source,'setup');
  var picker=routeFrom(source,'project-picker');
  var fileLab=routeFrom(source,'file-lab');
  var homeStep=numericStep(home);
  var setupStep=numericStep(setup);
  var pickerStep=numericStep(picker);
  var fileStep=numericStep(fileLab);
  return !!(
    sameRoute(home,'index','index.html')&&
    sameRoute(setup,'setup','setup.html')&&
    sameRoute(picker,'project-picker','project-picker.html')&&
    sameRoute(fileLab,'file-lab','file-lab.html')&&
    homeStep!==null&&setupStep===homeStep+1&&
    pickerStep===setupStep+1&&fileStep===pickerStep+1&&
    indexFrom(source,'setup')===0&&
    indexFrom(source,'project-picker')===1&&
    indexFrom(source,'file-lab')===2&&
    previousFrom(source,'setup')===null&&
    nextFrom(source,'setup')===picker&&
    nextFrom(source,'project-picker')===fileLab
  );
}

function safeSource(){
  var source=registry();
  return validateRegistry(source)?source:null;
}

function cloneArray(value){
  return Object.freeze(Array.isArray(value)?value.slice():[]);
}

function numberedRoutes(value){
  return Array.isArray(value)?value.filter(function(item){return numericStep(item)!==null}):[];
}

function sourceOwnedFlow(source){
  if(!source)return Object.freeze([]);
  if(Array.isArray(source.numberedRoutes))return cloneArray(numberedRoutes(source.numberedRoutes));
  if(Array.isArray(source.navRoutes))return cloneArray(numberedRoutes(source.navRoutes));
  if(Array.isArray(source.routes))return cloneArray(numberedRoutes(source.routes));
  if(Array.isArray(source.flow))return cloneArray(numberedRoutes(source.flow));
  if(Array.isArray(source.workflow))return cloneArray(numberedRoutes(source.workflow));
  if(Array.isArray(source.workflowRoutes))return cloneArray(numberedRoutes(source.workflowRoutes));
  return Object.freeze([]);
}

function sourceOwnedSupport(source){
  if(!source)return Object.freeze([]);
  if(Array.isArray(source.supportRoutes))return cloneArray(source.supportRoutes);
  if(Array.isArray(source.support))return cloneArray(source.support);
  if(Array.isArray(source.supportPages))return cloneArray(source.supportPages);
  if(Array.isArray(source.routes)){
    return cloneArray(source.routes.filter(function(item){return item&&item.kind==='support'}));
  }
  return Object.freeze([]);
}

function visibleStepTotal(source){
  var routes=sourceOwnedFlow(source);
  var maximum=0;
  routes.forEach(function(item){
    var step=numericStep(item);
    if(step!==null&&step>maximum)maximum=step;
  });
  return maximum||null;
}

function readRoute(id){
  return routeFrom(safeSource(),id);
}

function readNext(id){
  return nextFrom(safeSource(),id);
}

function readPrevious(id){
  return previousFrom(safeSource(),id);
}

function workflowIndex(id){
  return indexFrom(safeSource(),id);
}

function hasFamily(id,family){
  return familyFrom(safeSource(),id,family);
}

function readFlow(){
  return sourceOwnedFlow(safeSource());
}

function readSupport(){
  return sourceOwnedSupport(safeSource());
}

function routeFile(id){
  var item=readRoute(id);
  return item&&item.file||null;
}

function routeLabel(id){
  var item=readRoute(id);
  if(!item)return null;
  return item.label||item.title||item.name||item.id||null;
}

function routePurpose(id){
  var item=readRoute(id);
  if(!item)return null;
  return item.purpose||item.description||item.help||null;
}

function routeStep(id){
  return numericStep(readRoute(id));
}

function isWorkflowPage(id){
  var item=readRoute(id);
  return !!(item&&(item.kind==='workflow'||item.kind==='entry'||workflowIndex(id)>=0));
}

function isSupportPage(id){
  var item=readRoute(id);
  if(!item)return false;
  if(item.kind==='support'||item.support===true||item.role==='support'||item.family==='support')return true;
  var support=readSupport();
  for(var index=0;index<support.length;index+=1){
    var entry=support[index];
    if(entry===id||entry&&entry.id===id)return true;
  }
  return false;
}

function number(id){
  var source=safeSource();
  var item=source?routeFrom(source,id):null;
  var step=numericStep(item);
  if(step===null)return 'Specialist support page';
  var total=visibleStepTotal(source);
  return total?'Workflow step '+step+' of '+total:'Workflow step '+step;
}

function needsSource(id){
  var source=safeSource();
  var item=source?routeFrom(source,id):null;
  if(!item)return false;
  if(typeof item.requiresSource==='boolean')return item.requiresSource;
  if(typeof item.needsSource==='boolean')return item.needsSource;
  return familyFrom(source,id,'source');
}

function saveText(id){
  var item=readRoute(id);
  if(!item)return 'Save only appears where the canonical page owner provides a real record action.';
  if(item.saveText)return String(item.saveText);
  if(item.saveDescription)return String(item.saveDescription);
  return 'Save behaviour is owned by the canonical page action, not Workflow Clarity.';
}

function describe(id){
  var item=readRoute(id);
  if(!item)return Object.freeze({
    id:String(id||''),
    found:false,
    file:null,
    label:null,
    purpose:null,
    step:null,
    number:'Specialist support page',
    workflow:false,
    support:false,
    requiresSource:false,
    previous:null,
    next:null,
    families:Object.freeze([])
  });
  return Object.freeze({
    id:item.id,
    found:true,
    file:item.file||null,
    label:routeLabel(id),
    purpose:routePurpose(id),
    step:routeStep(id),
    number:number(id),
    workflow:isWorkflowPage(id),
    support:isSupportPage(id),
    requiresSource:needsSource(id),
    previous:readPrevious(id),
    next:readNext(id),
    families:Object.freeze(Array.isArray(item.families)?item.families.slice():[])
  });
}

function snapshot(){
  var source=registry();
  var valid=validateRegistry(source);
  var page=currentPage();
  var selected=valid?routeFrom(source,page):null;
  return Object.freeze({
    version:VERSION,
    active:valid,
    valid:valid,
    mode:MODE,
    registryOwner:source&&source.owner||null,
    expectedOwner:EXPECTED_OWNER,
    page:page,
    route:selected,
    description:valid?describe(page):null,
    flow:valid?sourceOwnedFlow(source):Object.freeze([]),
    support:valid?sourceOwnedSupport(source):Object.freeze([]),
    visibleStepTotal:valid?visibleStepTotal(source):null,
    workflowIndex:valid?indexFrom(source,page):-1,
    previous:valid?previousFrom(source,page):null,
    next:valid?nextFrom(source,page):null,
    retiredBehaviours:RETIRED_BEHAVIOURS,
    completeCompatibilitySurface:true,
    ownsWorkflow:false,
    ownsSupportClassification:false,
    ownsRouteInformation:false,
    ownsRoutes:false,
    ownsNumbering:false,
    ownsNavigation:false,
    mutatesDom:false,
    rewritesContent:false,
    readsLocalStorage:false,
    injectsStyles:false,
    movesContent:false,
    gatesPages:false,
    usesTimers:false,
    usesObservers:false,
    usesPolling:false,
    interceptsClicks:false,
    reloadsPage:false
  });
}

function verify(){
  var state=snapshot();
  if(!state.valid&&window.console&&isFunction(window.console.warn)){
    window.console.warn('Code Labs Workflow Clarity is inactive because the canonical cl-nav.js registry is unavailable or incompatible.');
  }
  return state.valid;
}

var initial=snapshot();
var api={
  version:initial.version,
  active:initial.active,
  valid:initial.valid,
  mode:initial.mode,
  registryOwner:initial.registryOwner,
  expectedOwner:initial.expectedOwner,
  page:initial.page,
  route:initial.route,
  description:initial.description,
  flow:initial.flow,
  support:initial.support,
  visibleStepTotal:initial.visibleStepTotal,
  workflowIndex:initial.workflowIndex,
  previous:initial.previous,
  next:initial.next,
  retiredBehaviours:initial.retiredBehaviours,
  completeCompatibilitySurface:true,
  ownsWorkflow:false,
  ownsSupportClassification:false,
  ownsRouteInformation:false,
  ownsRoutes:false,
  ownsNumbering:false,
  ownsNavigation:false,
  mutatesDom:false,
  rewritesContent:false,
  readsLocalStorage:false,
  injectsStyles:false,
  movesContent:false,
  gatesPages:false,
  usesTimers:false,
  usesObservers:false,
  usesPolling:false,
  interceptsClicks:false,
  reloadsPage:false,
  readRoute:readRoute,
  readNext:readNext,
  readPrevious:readPrevious,
  readFlow:readFlow,
  readSupport:readSupport,
  routeFile:routeFile,
  routeLabel:routeLabel,
  routePurpose:routePurpose,
  routeStep:routeStep,
  isWorkflowPage:isWorkflowPage,
  isSupportPage:isSupportPage,
  workflowNumber:number,
  number:number,
  needsSource:needsSource,
  saveText:saveText,
  hasFamily:hasFamily,
  describe:describe,
  snapshot:snapshot,
  verify:verify
};

window.CodeLabsWorkflowClarityV130=Object.freeze(api);
verify();
})();
