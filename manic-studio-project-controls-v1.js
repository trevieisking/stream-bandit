/* Manic Studio Project Controls V1
   Clarifies the existing local save/update and JSON download actions, and adds confirmed local-save deletion.
   Does not replace or mutate the sequencer, arrangement, recording, import, or export implementation.
*/
(function(){
'use strict';

const VERSION='V1.0.0 Manic Studio Project Save Download Delete';
const SAVE_KEYS=['sb:manic-studio:v5','sb:manic-studio:v4','sb:manic-studio:v3','sb:manic-studio:v2'];

function $(id){return document.getElementById(id);}
function existingKey(){
  try{return SAVE_KEYS.find(function(key){return localStorage.getItem(key)!==null;})||null;}catch(e){return null;}
}
function setStatus(message){
  const status=$('studioLocalSaveState');
  if(status)status.textContent=message;
}
function updateState(){
  const key=existingKey();
  setStatus(key?'A local Manic Studio project is saved on this device.':'No local Manic Studio project is saved on this device.');
}
function addDjNavigation(){
  document.querySelectorAll('.tabs').forEach(function(tabs){
    if(tabs.querySelector('a[href="manic-dj.html"]'))return;
    const studio=tabs.querySelector('a[href="manic-studio.html"]');
    if(!studio)return;
    const link=document.createElement('a');
    link.href='manic-dj.html';
    link.className=studio.className.replace(/\bactive\b/g,'').trim()||'pill';
    link.textContent='Manic DJ';
    studio.insertAdjacentElement('afterend',link);
  });
}
function deleteLocalSave(){
  const key=existingKey();
  if(!key){setStatus('There is no local Manic Studio save to delete.');return;}
  if(!window.confirm('Delete the saved Manic Studio project from this device?\n\nThe project currently open in the sequencer will stay open until you reload or start a new project. Exported JSON and recorded audio files are not deleted.'))return;
  try{
    SAVE_KEYS.forEach(function(saveKey){localStorage.removeItem(saveKey);});
    setStatus('Local save deleted. The open sequencer project and downloaded files were left unchanged.');
    const pageStatus=$('status');
    if(pageStatus)pageStatus.textContent='Local saved project deleted. The current open project remains available.';
  }catch(error){
    setStatus('The browser blocked local-save deletion.');
  }
}
function boot(){
  addDjNavigation();
  const save=$('save');
  const load=$('load');
  const exportJson=$('exportJson');
  const grid=save&&save.parentElement;
  if(!save||!load||!exportJson||!grid)return;

  save.textContent='Save / Update Local';
  exportJson.textContent='Download Project JSON';

  let remove=$('deleteLocalSave');
  if(!remove){
    remove=document.createElement('button');
    remove.type='button';
    remove.id='deleteLocalSave';
    remove.className='btn danger';
    remove.textContent='Delete Local Save';
    load.insertAdjacentElement('afterend',remove);
  }

  let state=$('studioLocalSaveState');
  if(!state){
    state=document.createElement('div');
    state.id='studioLocalSaveState';
    state.className='note';
    state.dataset.version=VERSION;
    grid.insertAdjacentElement('afterend',state);
  }

  remove.addEventListener('click',deleteLocalSave);
  save.addEventListener('click',function(){setTimeout(updateState,0);});
  load.addEventListener('click',function(){setTimeout(updateState,0);});
  window.addEventListener('storage',updateState);
  updateState();
}

window.ManicStudioProjectControls={version:VERSION,keys:SAVE_KEYS.slice(),refresh:updateState,deleteLocalSave:deleteLocalSave};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
