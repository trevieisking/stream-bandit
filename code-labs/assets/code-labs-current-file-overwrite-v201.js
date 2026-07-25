/* Code Labs Current File Overwrite V202.
   Explicit forward-only stage saves. The actual workflow page owns every save.
   Backend source replacement is delegated only to the protected V104 adapter.
*/
(function(){
'use strict';
var VERSION='V202.3';
var KEY='codeLabsV1State';
var FORWARD_KEY='codeLabsForwardStagesV202';
var STAGES=['file-lab','rescue-room','packet-builder','buddy-canvas','v20','patch-desk','patch-lab','preview-test','checkpoints','repo-desk','publish-prep','github-tracker'];
var SOURCE_PAGES={'file-lab':true,'saved-files':true};
var SAVE_IDS={saveFile:'file-lab',clSavedFileUse:'file-lab',saveProblem:'rescue-room',buildPacket:'rescue-room',makePacket:'packet-builder',savePacket:'packet-builder',saveNow:'buddy-canvas',saveCanvas:'buddy-canvas',saveWorkflow:'v20',advanceWorkflow:'v20',saveFixed:'patch-desk',savePatch:'patch-desk',plSave:'patch-lab',savePatchLab:'patch-lab',savePass:'preview-test',saveFail:'preview-test',saveCheckpoint:'checkpoints',checkpointOriginal:'checkpoints',checkpointFixed:'checkpoints',saveRepo:'repo-desk',saveHandoff:'repo-desk',prepareRepo:'repo-desk',saveWriter:'publish-prep',savePublish:'publish-prep',gwSave:'publish-prep',saveTracker:'github-tracker',savePr:'github-tracker'};
var ACTION_STAGES={'save-current-source':'file-lab','save-repair-notes':'rescue-room','build-repair-packet':'rescue-room','save-repair-packet':'packet-builder','save-buddy-canvas':'buddy-canvas','save-fixed-full-file':'patch-desk','save-patch-lab':'patch-lab','save-test-result':'preview-test','create-checkpoint':'checkpoints','prepare-repository-handoff':'repo-desk','prepare-github-writer':'publish-prep','save-github-tracker':'github-tracker'};
function q(s,r){return(r||document).querySelector(s)}
function clone(v){try{return JSON.parse(JSON.stringify(v||{}))}catch(e){return{}}}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function write(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}))}catch(e){}}
function forward(){try{var x=JSON.parse(localStorage.getItem(FORWARD_KEY)||'{}')||{};x.stages=x.stages||{};return x}catch(e){return{stages:{}}}}
function writeForward(x){try{localStorage.setItem(FORWARD_KEY,JSON.stringify(x||{stages:{}}))}catch(e){}}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/i,'')||''}
function stagePage(id){return id==='saved-files'?'file-lab':id}
function stageIndex(id){return STAGES.indexOf(stagePage(id))}
function ownedStage(requested){var current=stagePage(page());return stageIndex(current)>=0?current:stagePage(requested)}
function sourcePageAllowed(){return Boolean(SOURCE_PAGES[page()])}
function value(s){var e=q(s);return e?String(e.value==null?'':e.value):''}
function setValue(s,v){var e=q(s);if(e&&v!=null&&String(v)!==String(e.value==null?'':e.value))e.value=String(v)}
function status(text,kind){var e=q('#clOverwriteStatusV201');if(e){e.className='badge '+(kind||'warn');e.textContent=text}}
function ensure(s){s=s||{};s.project=s.project||{};s.file=s.file||{};s.checkpoints=Array.isArray(s.checkpoints)?s.checkpoints:[];s.tests=Array.isArray(s.tests)?s.tests:[];s.log=Array.isArray(s.log)?s.log:[];return s}
function sync(){
  var s=ensure(read()),f=s.file,p=s.project,id=page();
  if(id==='file-lab'){
    p.workspace=value('#workspaceName')||value('#workspace')||p.workspace||'';
    p.siteName=value('#siteName')||p.siteName||'';
    p.siteUrl=value('#siteUrl')||p.siteUrl||'';
    p.repo=value('#repoName')||value('#repo')||p.repo||'';
    p.mode=value('#mode')||p.mode||'manual';
    f.filename=value('#filename')||f.filename||'';
    f.type=value('#fileType')||f.type||'';
    f.currentCode=value('#currentCode')||value('#codeInput')||f.currentCode||'';
  }
  if(id==='saved-files'){
    f.filename=value('#clSavedFileName')||value('#sfName')||f.filename||'';
    f.currentCode=value('#clSavedFileCode')||value('#sfOriginal')||f.currentCode||'';
  }
  if(id==='rescue-room'){
    f.problem=value('#problem')||f.problem||'';
    f.dontTouch=value('#dontTouch')||f.dontTouch||'';
    f.errors=value('#errors')||f.errors||'';
    f.packet=value('#packetPreview')||f.packet||'';
  }
  if(id==='packet-builder'){
    f.packetType=value('#packetType')||f.packetType||'full-file-repair';
    f.filename=value('#packetFile')||f.filename||'';
    f.packet=value('#packetOut')||f.packet||'';
  }
  if(id==='buddy-canvas'){
    f.currentCode=value('#loadedCode')||f.currentCode||'';
    f.fixedCode=value('#fixedCode')||f.fixedCode||'';
    f.notes=value('#hint')||f.notes||'';
  }
  if(id==='patch-desk'){
    f.currentCode=value('#originalCode')||f.currentCode||'';
    f.fixedCode=value('#fixedCode')||f.fixedCode||'';
  }
  if(id==='patch-lab'){
    f.currentCode=value('#plIn')||f.currentCode||'';
    f.fixedCode=value('#plOut')||f.fixedCode||'';
  }
  if(id==='preview-test')f.testNotes=value('#testNotes')||f.testNotes||'';
  if(id==='repo-desk'){
    f.repoAction=value('#repoAction')||value('#action')||f.repoAction||'';
    f.repairBranch=value('#repairBranch')||value('#branch')||f.repairBranch||'';
    f.path=value('#repoPath')||value('#path')||f.path||f.filename||'';
  }
  if(id==='publish-prep'){
    f.path=value('#gwPath')||f.path||f.filename||'';
    f.fixedCode=value('#gwFixed')||f.fixedCode||'';
    f.repairBranch=value('#gwBranch')||f.repairBranch||'';
  }
  if(id==='github-tracker'){
    f.pullRequest=value('#prUrl')||value('#pullRequest')||f.pullRequest||'';
    f.previewUrl=value('#previewUrl')||f.previewUrl||'';
  }
  f.lastWorkingPage=id;
  f.lastWorkingAt=new Date().toISOString();
  write(s);
  return s;
}
function applySnapshot(s){
  s=ensure(s);var f=s.file,p=s.project,id=page();
  if(id==='file-lab'){
    setValue('#workspaceName',p.workspace);setValue('#workspace',p.workspace);setValue('#siteName',p.siteName);setValue('#siteUrl',p.siteUrl);setValue('#repoName',p.repo);setValue('#repo',p.repo);setValue('#mode',p.mode);setValue('#filename',f.filename);setValue('#fileType',f.type);setValue('#currentCode',f.currentCode);setValue('#codeInput',f.currentCode);
  }
  if(id==='saved-files'){
    setValue('#clSavedFileName',f.filename);setValue('#sfName',f.filename);setValue('#clSavedFileCode',f.currentCode);setValue('#sfOriginal',f.currentCode);
  }
  if(id==='rescue-room'){
    setValue('#problem',f.problem);setValue('#dontTouch',f.dontTouch);setValue('#errors',f.errors);setValue('#packetPreview',f.packet);
  }
  if(id==='packet-builder'){
    setValue('#packetType',f.packetType);setValue('#packetFile',f.filename);setValue('#packetOut',f.packet);
  }
  if(id==='buddy-canvas'){
    setValue('#loadedCode',f.currentCode);setValue('#fixedCode',f.fixedCode);setValue('#hint',f.notes);
  }
  if(id==='patch-desk'){
    setValue('#originalCode',f.currentCode);setValue('#fixedCode',f.fixedCode);
  }
  if(id==='patch-lab'){
    setValue('#plIn',f.currentCode);setValue('#plOut',f.fixedCode);
  }
  if(id==='preview-test')setValue('#testNotes',f.testNotes);
  if(id==='repo-desk'){
    setValue('#repoAction',f.repoAction);setValue('#action',f.repoAction);setValue('#repairBranch',f.repairBranch);setValue('#branch',f.repairBranch);setValue('#repoPath',f.path);setValue('#path',f.path);
  }
  if(id==='publish-prep'){
    setValue('#gwPath',f.path);setValue('#gwFixed',f.fixedCode);setValue('#gwBranch',f.repairBranch);
  }
  if(id==='github-tracker'){
    setValue('#prUrl',f.pullRequest);setValue('#pullRequest',f.pullRequest);setValue('#previewUrl',f.previewUrl);
  }
}
function saveForward(stage){
  var normalized=ownedStage(stage||page()),index=stageIndex(normalized),s=sync(),store=forward();
  if(index<0)return{ok:false,reason:'not_a_forward_stage'};
  for(var i=index;i<STAGES.length;i++)store.stages[STAGES[i]]=clone(s);
  store.version=VERSION;
  store.lastStage=normalized;
  store.savedAt=new Date().toISOString();
  writeForward(store);
  window.dispatchEvent(new CustomEvent('code-labs-forward-stage-saved',{detail:{stage:normalized,from:index,to:STAGES.length-1}}));
  status(normalized==='file-lab'?'File Lab saved to every later stage':'Saved this stage and every later stage','good');
  return{ok:true,stage:normalized,from:index,to:STAGES.length-1};
}
function hydrate(){
  var normalized=stagePage(page()),index=stageIndex(normalized);
  if(index<0)return;
  var store=forward(),snapshot=store.stages[normalized];
  if(!snapshot){for(var i=index-1;i>=0&&!snapshot;i--)snapshot=store.stages[STAGES[i]]}
  if(!snapshot)return;
  snapshot=clone(snapshot);
  write(snapshot);
  applySnapshot(snapshot);
  window.dispatchEvent(new CustomEvent('code-labs-forward-stage-loaded',{detail:{stage:normalized}}));
}
function guardedAdapter(original){
  if(!original||original.__clForwardGuardV202)return original;
  var guarded=function(){
    if(!sourcePageAllowed()){
      var local=saveForward(page());
      return Promise.resolve({ok:true,local_only:true,forward:local,reason:'later_stage_cannot_overwrite_file_lab'});
    }
    return original.apply(this,arguments);
  };
  guarded.__clForwardGuardV202=true;
  guarded.__clOriginal=original;
  return guarded;
}
function installAdapterGuard(){
  var adapter=window.CodeLabsCurrentFileV104OverwriteV201;
  if(adapter&&adapter.overwrite)adapter.overwrite=guardedAdapter(adapter.overwrite);
  var base=window.CodeLabsCurrentFileOverwriteV201;
  if(base&&base.overwriteV104)base.overwriteV104=guardedAdapter(base.overwriteV104);
  var button=q('#clOverwriteNowV201');
  if(button&&sourcePageAllowed())button.onclick=requestOverwrite;
}
function protectedAdapter(){
  var base=window.CodeLabsCurrentFileOverwriteV201;
  if(base&&typeof base.overwriteV104==='function')return base.overwriteV104;
  var adapter=window.CodeLabsCurrentFileV104OverwriteV201;
  return adapter&&typeof adapter.overwrite==='function'?adapter.overwrite:null;
}
async function backendOverwrite(){
  if(!sourcePageAllowed())return{ok:true,local_only:true,reason:'later_stage_cannot_overwrite_file_lab'};
  var adapter=protectedAdapter();
  if(!adapter){
    status('Saved forward · protected V104 overwrite unavailable','warn');
    return{ok:true,local_only:true,reason:'v104_adapter_unavailable'};
  }
  return adapter();
}
async function requestOverwrite(){
  var forwardResult=saveForward(page());
  if(!sourcePageAllowed())return{ok:true,local_only:true,forward:forwardResult,reason:'later_stage_cannot_overwrite_file_lab'};
  var result=await backendOverwrite();
  if(result&&typeof result==='object'&&!result.forward)result.forward=forwardResult;
  return result;
}
function explicitStage(target){
  if(!target)return'';
  var id=String(target.id||''),action=String(target.getAttribute&&target.getAttribute('data-buddy-action')||'');
  if(id==='clSaveHistory'||action==='overwrite-current-saved-file')return ownedStage(page());
  var detected=SAVE_IDS[id]||ACTION_STAGES[action]||'';
  return detected?ownedStage(detected):'';
}
function onExplicitSave(event){
  var target=event.target&&event.target.closest?event.target.closest('button,a,[data-buddy-action]'):event.target;
  if(target&&target.id==='clOverwriteNowV201')return;
  var stage=explicitStage(target);
  if(!stage)return;
  setTimeout(function(){
    var result=saveForward(stage);
    if(stage==='file-lab'&&target&&target.id==='saveFile')Promise.resolve(backendOverwrite()).catch(function(){});
    return result;
  },0);
}
function schedule(){return{ok:false,reason:'passive_autosave_disabled'}}
function addPanel(){
  if(!sourcePageAllowed())return;
  var main=q('.main')||q('main');
  if(!main||q('#clCurrentFileOverwriteV201'))return;
  var panel=document.createElement('section');
  panel.id='clCurrentFileOverwriteV201';
  panel.className='panel';
  panel.innerHTML='<h2>Current saved file</h2><p>Only an explicit File Lab or Saved Files action may request a protected V104 overwrite. Typing never writes the backend. Each workflow save updates its own stage and the stages that follow.</p><div class="actions"><span id="clOverwriteStatusV201" class="badge warn">Explicit save mode ready</span><button id="clOverwriteNowV201" class="btn primary" type="button">Overwrite current saved file</button><a class="btn ghost" href="saved-files.html">Choose current file</a></div><p class="fine">Earlier workflow stages keep their own last explicit save. No direct browser database fallback is available.</p>';
  var footer=q('#clFooterBuddyShellV201')||q('#clFooterBuddyShellV200')||q('.footerNote');
  if(footer&&footer.parentNode===main)main.insertBefore(panel,footer);else main.appendChild(panel);
  q('#clOverwriteNowV201').onclick=requestOverwrite;
}
function boot(){
  hydrate();
  addPanel();
  document.addEventListener('click',onExplicitSave,false);
  window.addEventListener('code-labs-current-file-request-overwrite',requestOverwrite);
  window.addEventListener('code-labs-history-saved',function(){saveForward(page())});
  window.addEventListener('code-labs-stage-save',function(e){saveForward(e&&e.detail&&e.detail.stage||page())});
  installAdapterGuard();
  setTimeout(hydrate,250);
  setTimeout(installAdapterGuard,600);
  setTimeout(installAdapterGuard,1600);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.CodeLabsCurrentFileOverwriteV201={version:VERSION,sync:sync,overwrite:requestOverwrite,overwriteNow:requestOverwrite,overwriteProtected:backendOverwrite,schedule:schedule,saveForward:saveForward,hydrate:hydrate,stages:STAGES.slice(),ownedStage:ownedStage};
window.CodeLabsCurrentFileOverwrite=window.CodeLabsCurrentFileOverwriteV201;
})();
