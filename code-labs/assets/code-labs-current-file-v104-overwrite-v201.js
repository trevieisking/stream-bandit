/* Code Labs V104 current-file overwrite adapter V202 */
(function(){
'use strict';
var VERSION='V202.0';
var ENDPOINT='https://xzxqfrvqdgkzwujbkdbk.supabase.co/functions/v1/code-labs-browser-control';
var PUB='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var SESSION='codeLabsV104BrowserSession';
var SECRET='codeLabsV104BrowserSecret';
var KEY='codeLabsV1State';
var SOURCE_PAGES={'file-lab':true,'saved-files':true};
function q(s){return document.querySelector(s)}
function stored(k){try{return sessionStorage.getItem(k)||''}catch(e){return''}}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}))}catch(e){}}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/i,'')||''}
function sourcePageAllowed(){return Boolean(SOURCE_PAGES[page()])}
function status(text,kind){var e=q('#clOverwriteStatusV201');if(e){e.className='badge '+(kind||'warn');e.textContent=text}}
async function send(fileId,filename,content,metadata){
  var sessionId=stored(SESSION),secret=stored(SECRET);
  if(!sessionId||!secret)throw new Error('The V104 page session is still starting.');
  var response=await fetch(ENDPOINT,{method:'POST',headers:{apikey:PUB,'Content-Type':'application/json'},body:JSON.stringify({action:'overwrite_current_file',session_id:sessionId,browser_secret:secret,file_id:fileId,filename:filename,content:content,metadata:metadata||{}})});
  var data=await response.json().catch(function(){return{}});
  if(!response.ok||data.ok===false)throw new Error(data.error||'V104 overwrite failed.');
  return data;
}
async function overwrite(){
  var base=window.CodeLabsCurrentFileOverwriteV201;
  if(!base)throw new Error('Current-file overwrite helper is not available.');
  if(!sourcePageAllowed()){
    var forward=base.saveForward?base.saveForward(page()):null;
    return{ok:true,local_only:true,forward:forward,reason:'later_stage_cannot_overwrite_file_lab'};
  }
  var s=base.sync?base.sync():state(),f=s.file||{};
  var fileId=String(f.savedFileId||f.saved_file_id||'');
  var filename=f.filename||f.path||'file.txt';
  var content=String(f.currentCode||'');
  if(!fileId){status('Choose one saved file first','warn');return{ok:false,reason:'no_saved_file_id'}}
  if(!content.trim()){status('No complete File Lab source is available','warn');return{ok:false,reason:'empty_source'}}
  status('Overwriting through V104','warn');
  try{
    var result=await send(fileId,filename,content,{path:f.path||filename,repo:(s.project||{}).repo||'',branch:(f.githubSource||{}).branch||'main',lastPage:page(),source:'code-labs-v104-overwrite-adapter-v202'});
    f.lastSupabaseOverwriteAt=result.updated_at||new Date().toISOString();
    f.lastSupabaseOverwriteSource='v104';
    save(s);
    status('Current saved file overwritten from File Lab','good');
    return result;
  }catch(error){
    status('Overwrite will retry','bad');
    return{ok:false,error:String(error.message||error)};
  }
}
function install(){
  var base=window.CodeLabsCurrentFileOverwriteV201;
  if(!base){setTimeout(install,180);return}
  base.overwriteV104=overwrite;
  var button=q('#clOverwriteNowV201');
  if(button&&sourcePageAllowed()){
    button.onclick=overwrite;
    button.setAttribute('data-cl-v104-overwrite','yes');
  }
  window.CodeLabsCurrentFileV104OverwriteV201={version:VERSION,overwrite:overwrite,send:send,sourcePageAllowed:sourcePageAllowed};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
setTimeout(install,500);setTimeout(install,1400);
})();
