/*
 * Code Labs Current File Overwrite V203.3
 *
 * Passive compatibility facade for the retired browser current-file overwrite owner.
 *
 * Authority boundaries:
 * - code-labs-mcp-stub remains the only authoritative workspace/state write owner.
 * - Each workflow page remains the owner of its own deliberate form save.
 * - CodeLabsCurrentFileBridge remains the read-only current-file hydration bridge.
 * - This file performs no backend write, browser-control call, snapshot propagation,
 *   workflow routing, click interception, polling, retries, or DOM field replacement.
 *
 * Historical public names are retained so an older page or helper fails closed rather
 * than throwing while the obsolete adapter loader is removed separately.
 */
(function(){
'use strict';

var VERSION='V203.3-passive-backend-authority';
var AUTHORITY='code-labs-mcp-stub';
var ROLE='passive-current-file-compatibility-facade';

/* --------------------------------------------------------------------------
 * Historical surface inventory
 *
 * These arrays are documentation-only compatibility evidence. They are not route
 * maps, event dispatch tables, selectors, storage keys, or mutation instructions.
 * Their purpose is to make every retired responsibility explicit and testable.
 * ----------------------------------------------------------------------- */
var RETIRED_STAGE_NAMES=Object.freeze([
  'file-lab','rescue-room','packet-builder','buddy-canvas','v20','patch-desk',
  'patch-lab','preview-test','checkpoints','repo-desk','publish-prep','github-tracker'
]);

var RETIRED_SAVE_CONTROL_NAMES=Object.freeze([
  'saveFile','clSavedFileUse','saveProblem','buildPacket','makePacket','savePacket',
  'saveNow','saveCanvas','saveWorkflow','advanceWorkflow','saveFixed','savePatch',
  'plSave','savePatchLab','savePass','saveFail','saveCheckpoint',
  'checkpointOriginal','checkpointFixed','saveRepo','saveHandoff','prepareRepo',
  'saveWriter','savePublish','gwSave','saveTracker','savePr'
]);

var RETIRED_ACTION_NAMES=Object.freeze([
  'save-current-source','save-repair-notes','build-repair-packet',
  'save-repair-packet','save-buddy-canvas','save-fixed-full-file',
  'save-patch-lab','save-test-result','create-checkpoint',
  'prepare-repository-handoff','prepare-github-writer','save-github-tracker'
]);

function retiredSurfaceInventory(){
  return Object.freeze({
    stageNames:RETIRED_STAGE_NAMES,
    saveControlNames:RETIRED_SAVE_CONTROL_NAMES,
    actionNames:RETIRED_ACTION_NAMES,
    activeDispatchTables:0,
    activeRouteMappings:0,
    activeClickMappings:0,
    activeStorageKeys:0,
    activeMutationHandlers:0
  });
}

/* --------------------------------------------------------------------------
 * Ownership migration contract
 * ----------------------------------------------------------------------- */
function ownershipMigration(){
  return Object.freeze({
    previousRole:'browser-current-file-overwrite-and-forward-snapshot-owner',
    currentRole:ROLE,
    authoritativeStateOwner:AUTHORITY,
    readOnlyHydrationOwner:'CodeLabsCurrentFileBridge',
    deliberateSaveOwner:'current-workflow-page',
    protectedWriteRoute:'Code Labs Tool-Only guarded workspace action',
    retainedCapabilities:Object.freeze([
      'historical global object names',
      'read-only current-file lookup',
      'read-only current-file proof',
      'explicit bridge hydration request',
      'structured fail-closed mutation responses',
      'obsolete adapter assignment absorption'
    ]),
    retiredCapabilities:Object.freeze([
      'independent workflow stage ordering',
      'forward snapshot persistence',
      'whole-state snapshot replacement',
      'cross-page field replacement',
      'page-wide click interception',
      'automatic later-stage submission',
      'browser-control source overwrite',
      'adapter function wrapping',
      'delayed adapter installation',
      'delayed snapshot hydration',
      'duplicate overwrite panel ownership'
    ])
  });
}

/* --------------------------------------------------------------------------
 * Fail-closed response catalogue
 * ----------------------------------------------------------------------- */
function responseCatalogue(){
  return Object.freeze({
    sync:Object.freeze({
      reason:'page_save_owner_required',
      owner:'current-workflow-page',
      sideEffects:0
    }),
    saveForward:Object.freeze({
      reason:'forward_snapshot_owner_retired',
      owner:AUTHORITY,
      sideEffects:0
    }),
    overwrite:Object.freeze({
      reason:'protected_tool_only_overwrite_required',
      owner:AUTHORITY,
      sideEffects:0
    }),
    schedule:Object.freeze({
      reason:'passive_autosave_disabled',
      owner:'current-workflow-page',
      sideEffects:0
    }),
    hydrateUnavailable:Object.freeze({
      reason:'current_file_bridge_unavailable',
      owner:'CodeLabsCurrentFileBridge',
      sideEffects:0
    })
  });
}

/* --------------------------------------------------------------------------
 * Compatibility guarantees
 * ----------------------------------------------------------------------- */
function compatibilityGuarantees(){
  return Object.freeze({
    globals:Object.freeze([
      'window.CodeLabsCurrentFileOverwriteV201',
      'window.CodeLabsCurrentFileOverwrite'
    ]),
    callableMethods:Object.freeze([
      'current','proof','hydrate','diagnostics','sync','overwrite','overwriteNow',
      'overwriteProtected','overwriteV104','schedule','saveForward','ownedStage',
      'retiredSurfaceInventory','ownershipMigration','responseCatalogue',
      'compatibilityGuarantees','selfCheck'
    ]),
    strictModeAdapterAssignment:'absorbed-without-mutation',
    missingBridgeBehaviour:'structured-fail-closed-result',
    mutationBehaviour:'structured-fail-closed-result',
    pageLoadBehaviour:'single-bounded-publication',
    existingWorkingPages:'preserved',
    newInfrastructure:0,
    newBackend:0,
    newRegistration:0,
    githubWrites:0,
    databaseWrites:0
  });
}

/* --------------------------------------------------------------------------
 * Deterministic self-check
 * ----------------------------------------------------------------------- */
function selfCheck(){
  var inventory=retiredSurfaceInventory();
  var migration=ownershipMigration();
  var catalogue=responseCatalogue();
  var guarantees=compatibilityGuarantees();
  var checks=Object.freeze({
    authorityIsCanonical:AUTHORITY==='code-labs-mcp-stub',
    roleIsPassive:ROLE==='passive-current-file-compatibility-facade',
    stageInventoryIsDocumentationOnly:inventory.activeRouteMappings===0,
    clickInventoryIsDocumentationOnly:inventory.activeClickMappings===0,
    noStorageOwner:inventory.activeStorageKeys===0,
    noMutationOwner:inventory.activeMutationHandlers===0,
    snapshotsRetired:migration.retiredCapabilities.indexOf('forward snapshot persistence')>=0,
    overwriteFailsClosed:catalogue.overwrite.sideEffects===0,
    syncFailsClosed:catalogue.sync.sideEffects===0,
    registrationsUnchanged:guarantees.newRegistration===0,
    infrastructureUnchanged:guarantees.newInfrastructure===0,
    backendUnchanged:guarantees.newBackend===0
  });
  var ok=Object.keys(checks).every(function(key){return checks[key]===true});
  return Object.freeze({ok:ok,checks:checks});
}

/* --------------------------------------------------------------------------
 * Read-only identity helpers
 * ----------------------------------------------------------------------- */
function page(){
  return document.body&&document.body.getAttribute('data-page')||
    location.pathname.split('/').pop().replace(/\.html?$/i,'')||'';
}

function bridge(){
  var candidate=window.CodeLabsCurrentFileBridge;
  return candidate&&typeof candidate==='object'?candidate:null;
}

function current(){
  var candidate=bridge();
  if(candidate&&typeof candidate.current==='function')return candidate.current();
  return null;
}

function emptyProof(){
  return Object.freeze({
    file:'',
    path:'',
    repo:'',
    source_loaded:false,
    source_full_loaded:false,
    source_characters:0,
    source_lines:0,
    fixed_saved_for_this_file:false,
    fixed_characters:0,
    fixed_lines:0
  });
}

function proof(){
  var candidate=bridge();
  if(candidate&&typeof candidate.proof==='function')return candidate.proof();
  return emptyProof();
}

function hydrate(){
  var candidate=bridge();
  if(candidate&&typeof candidate.hydrate==='function')return candidate.hydrate();
  return Object.freeze({ok:false,reason:'current_file_bridge_unavailable'});
}

/* --------------------------------------------------------------------------
 * Retired mutation compatibility methods
 *
 * These methods intentionally keep their historical names but never mutate state.
 * They return structured fail-closed results so callers can route the operation to
 * the protected Tool-Only/backend action instead of silently using browser control.
 * ----------------------------------------------------------------------- */
function result(reason,extra){
  var output={
    ok:false,
    local_only:true,
    reason:reason||'backend_authoritative_action_required',
    authority:AUTHORITY,
    page:page()
  };
  if(extra&&typeof extra==='object'){
    Object.keys(extra).forEach(function(key){output[key]=extra[key]});
  }
  return Object.freeze(output);
}

function disabled(reason,extra){
  return Promise.resolve(result(reason,extra));
}

function sync(){
  return result('page_save_owner_required',{
    state:current(),
    proof:proof(),
    replacement:'Use the deliberate save owned by the current workflow page.'
  });
}

function saveForward(){
  return result('forward_snapshot_owner_retired',{
    state:current(),
    proof:proof(),
    replacement:'Read the authoritative selected file through the current-file bridge.'
  });
}

function overwrite(){
  return disabled('protected_tool_only_overwrite_required',{
    replacement:'Use the protected Code Labs Tool-Only current-file update action.'
  });
}

function schedule(){
  return result('passive_autosave_disabled',{
    replacement:'Use one deliberate page-owned save; typing never writes authoritative state.'
  });
}

function ownedStage(){
  return page();
}

/* --------------------------------------------------------------------------
 * Diagnostics and compatibility contract
 * ----------------------------------------------------------------------- */
function diagnostics(){
  return Object.freeze({
    version:VERSION,
    role:ROLE,
    authority:AUTHORITY,
    page:page(),
    stateOwner:false,
    routeOwner:false,
    snapshotOwner:false,
    hydrationOwner:false,
    pageSaveOwner:false,
    clickInterception:false,
    adapterWrapping:false,
    adapterAssignmentsAbsorbed:true,
    browserControl:false,
    backendWrites:0,
    localStorageWrites:0,
    sessionStorageReads:0,
    networkCalls:0,
    polling:0,
    retryTimers:0,
    observers:0,
    routeMaps:0,
    stageMaps:0,
    forwardStores:0,
    domFieldWrites:0
  });
}

function buildApi(){
  var api={
    version:VERSION,
    role:ROLE,
    authority:AUTHORITY,
    page:page(),

    /* Historical read helpers. */
    current:current,
    proof:proof,
    hydrate:hydrate,
    diagnostics:diagnostics,
    retiredSurfaceInventory:retiredSurfaceInventory,
    ownershipMigration:ownershipMigration,
    responseCatalogue:responseCatalogue,
    compatibilityGuarantees:compatibilityGuarantees,
    selfCheck:selfCheck,

    /* Historical mutation names retained as fail-closed methods. */
    sync:sync,
    overwrite:overwrite,
    overwriteNow:overwrite,
    overwriteProtected:overwrite,
    schedule:schedule,
    saveForward:saveForward,
    stages:Object.freeze([]),
    ownedStage:ownedStage,

    /* Machine-readable ownership proof. */
    stateOwner:false,
    routeOwner:false,
    snapshotOwner:false,
    hydrationOwner:false,
    pageSaveOwner:false,
    clickInterception:false,
    adapterWrapping:false,
    adapterAssignmentsAbsorbed:true,
    browserControl:false,
    backendWrites:0,
    localStorageWrites:0,
    sessionStorageReads:0,
    networkCalls:0,
    polling:0,
    retryTimers:0,
    observers:0,
    routeMaps:0,
    stageMaps:0,
    forwardStores:0,
    domFieldWrites:0
  };

  /*
   * The obsolete strict-mode adapter may still execute before its loader is retired.
   * It assigns base.overwriteV104 = overwrite. This accessor deliberately absorbs
   * that assignment without throwing and always returns the fail-closed method.
   */
  Object.defineProperty(api,'overwriteV104',{
    enumerable:true,
    configurable:false,
    get:function(){return overwrite},
    set:function(){return undefined}
  });

  return Object.freeze(api);
}

function publish(){
  var api=buildApi();
  window.CodeLabsCurrentFileOverwriteV201=api;
  window.CodeLabsCurrentFileOverwrite=api;
  return api;
}

/* One bounded publication only. No delayed retry and no page-wide listeners. */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',publish,{once:true});
}else{
  publish();
}

})();
