/*
 * Code Labs V104 Current-File Overwrite Adapter V203.0
 *
 * Retired browser-control transport compatibility facade.
 *
 * Authority boundaries:
 * - code-labs-mcp-stub is the only authoritative current-file write owner.
 * - CodeLabsCurrentFileOverwriteV201 is the passive read/fail-closed facade.
 * - This adapter performs no browser session lookup, secret lookup, network call,
 *   local/session storage mutation, button rebinding, timer, retry or DOM mutation.
 */
(function(){
'use strict';

var VERSION='V203.0-retired-browser-control-transport';
var ROLE='passive-v104-overwrite-adapter-compatibility-facade';
var AUTHORITY='code-labs-mcp-stub';
var RETIRED_ENDPOINT='code-labs-browser-control';

function page(){
  return document.body&&document.body.getAttribute('data-page')||
    location.pathname.split('/').pop().replace(/\.html?$/i,'')||'';
}

function base(){
  var candidate=window.CodeLabsCurrentFileOverwriteV201;
  return candidate&&typeof candidate==='object'?candidate:null;
}

function readOnlyState(){
  var candidate=base();
  if(candidate&&typeof candidate.current==='function')return candidate.current();
  return null;
}

function readOnlyProof(){
  var candidate=base();
  if(candidate&&typeof candidate.proof==='function')return candidate.proof();
  return Object.freeze({
    file:'',path:'',repo:'',source_loaded:false,source_full_loaded:false,
    source_characters:0,source_lines:0,fixed_saved_for_this_file:false,
    fixed_characters:0,fixed_lines:0
  });
}

function fail(reason,extra){
  var result={
    ok:false,
    local_only:true,
    reason:reason||'protected_tool_only_overwrite_required',
    authority:AUTHORITY,
    page:page(),
    retiredEndpoint:RETIRED_ENDPOINT,
    replacement:'Use the protected Code Labs Tool-Only current-file update action.'
  };
  if(extra&&typeof extra==='object'){
    Object.keys(extra).forEach(function(key){result[key]=extra[key]});
  }
  return Object.freeze(result);
}

function overwrite(){
  return Promise.resolve(fail('browser_control_overwrite_retired',{
    state:readOnlyState(),
    proof:readOnlyProof()
  }));
}

function send(){
  return Promise.resolve(fail('browser_control_transport_retired'));
}

function sourcePageAllowed(){
  return false;
}

function compatibilityContract(){
  return Object.freeze({
    historicalGlobal:'window.CodeLabsCurrentFileV104OverwriteV201',
    historicalMethods:Object.freeze(['overwrite','send','sourcePageAllowed','diagnostics','selfCheck']),
    retainedBehaviour:Object.freeze([
      'historical global publication',
      'promise-compatible overwrite response',
      'promise-compatible send response',
      'read-only delegation to current-file facade',
      'structured fail-closed replacement guidance'
    ]),
    retiredBehaviour:Object.freeze([
      'browser-control Edge Function transport',
      'publishable-key browser request',
      'browser session secret lookup',
      'sessionStorage reads',
      'localStorage reads and writes',
      'shared state replacement',
      'button handler replacement',
      'status badge mutation',
      'delayed adapter installation',
      'automatic retry',
      'source overwrite from browser state'
    ])
  });
}

function diagnostics(){
  return Object.freeze({
    version:VERSION,
    role:ROLE,
    authority:AUTHORITY,
    retiredEndpoint:RETIRED_ENDPOINT,
    page:page(),
    browserControl:false,
    networkCalls:0,
    fetchCalls:0,
    sessionStorageReads:0,
    localStorageReads:0,
    localStorageWrites:0,
    buttonRebindings:0,
    domMutations:0,
    timers:0,
    retries:0,
    observers:0,
    backendWrites:0,
    sourcePageAllowed:false
  });
}

function selfCheck(){
  var d=diagnostics();
  var checks=Object.freeze({
    canonicalAuthority:d.authority==='code-labs-mcp-stub',
    browserControlRetired:d.browserControl===false,
    noNetwork:d.networkCalls===0&&d.fetchCalls===0,
    noBrowserSecrets:d.sessionStorageReads===0,
    noSharedState:d.localStorageReads===0&&d.localStorageWrites===0,
    noDomOwnership:d.buttonRebindings===0&&d.domMutations===0,
    noRetryOwnership:d.timers===0&&d.retries===0&&d.observers===0,
    noBackendWrite:d.backendWrites===0,
    sourcePagesDisabled:d.sourcePageAllowed===false
  });
  return Object.freeze({
    ok:Object.keys(checks).every(function(key){return checks[key]===true}),
    checks:checks
  });
}

function publish(){
  var api=Object.freeze({
    version:VERSION,
    role:ROLE,
    authority:AUTHORITY,
    overwrite:overwrite,
    send:send,
    sourcePageAllowed:sourcePageAllowed,
    diagnostics:diagnostics,
    compatibilityContract:compatibilityContract,
    selfCheck:selfCheck,
    browserControl:false,
    networkCalls:0,
    sessionStorageReads:0,
    localStorageWrites:0,
    buttonRebindings:0,
    timers:0,
    retries:0,
    backendWrites:0
  });
  window.CodeLabsCurrentFileV104OverwriteV201=api;
  return api;
}

/* One bounded publication only. No delayed install and no page-wide listeners. */
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',publish,{once:true});
}else{
  publish();
}

})();
