/* Code Labs V104 current-file overwrite adapter V201 */
(function(){
'use strict';
var ENDPOINT='https://xzxqfrvqdgkzwujbkdbk.supabase.co/functions/v1/code-labs-browser-control';
var PUB='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var SESSION='codeLabsV104BrowserSession';
var SECRET='codeLabsV104BrowserSecret';
var KEY='codeLabsV1State';
function q(s){return document.querySelector(s)}
function stored(k){try{return sessionStorage.getItem(k)||''}catch(e){return''}}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s||{}))}
function status(text,kind){var e=q('#clOverwriteStatusV201');if(e){e.className='badge '+(kind||'warn');e.textContent=text}}
async function send(fileId,filename,content,metadata){var sessionId=stored(SESSION),secret=stored(SECRET);if(!sessionId||!secret)throw new Error('The V104 page session is still starting.');var response=await fetch(ENDPOINT,{method:'POST',headers:{apikey:PUB,'Content-Type':'application/json'},body:JSON.stringify({action:'overwrite_current_file',session_id:sessionId,browser_secret:secret,file_id:fileId,filename:filename,content:content,metadata:metadata||{}})});var data=await response.json().catch(function(){return{}});if(!response.ok||data.ok===false)throw new Error(data.error||'V104 overwrite failed.');return data}
async function overwrite(){var base=window.CodeLabsCurrentFileOverwriteV201,s=base&&base.sync?base.sync():state(),f=s.file||{},fileId=String(f.savedFileId||f.saved_file_id||''),filename=f.filename||f.path||'file.txt',content=String(f.fixedCode||f.currentCode||'');if(!fileId){status('Choose one saved file first','warn');return{ok:false,reason:'no_saved_file_id'}}if(!content.trim()){status('Nothing to save','warn');return{ok:false,reason:'empty'}}status('Overwriting through V104','warn');try{var result=await send(fileId,filename,content,{path:f.path||filename,repo:(s.project||{}).repo||'',branch:(f.githubSource||{}).branch||'main',lastPage:document.body&&document.body.getAttribute('data-page')||'',source:'code-labs-v104-overwrite-adapter-v201'});f.lastSupabaseOverwriteAt=result.updated_at||new Date().toISOString();f.lastSupabaseOverwriteSource='v104';save(s);status('Current saved file overwritten','good');return result}catch(error){status('Overwrite will retry','bad');return{ok:false,error:String(error.message||error)}}}
function install(){var base=window.CodeLabsCurrentFileOverwriteV201;if(!base){setTimeout(install,180);return}base.overwriteV104=overwrite;var button=q('#clOverwriteNowV201');if(button){button.onclick=overwrite;button.setAttribute('data-cl-v104-overwrite','yes')}window.CodeLabsCurrentFileV104OverwriteV201={version:'V201.1',overwrite:overwrite,send:send}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,500);setTimeout(install,1400);
})();
