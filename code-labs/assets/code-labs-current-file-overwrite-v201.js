/* Code Labs Current File Overwrite V201
   One local working file; one selected Supabase current-file row; no duplicate inserts.
*/
(function(){
'use strict';
var VERSION='V201.1';
var KEY='codeLabsV1State';
var timer=0,busy=false,lastHash='';
function q(s,r){return(r||document).querySelector(s)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function write(s){localStorage.setItem(KEY,JSON.stringify(s||{}))}
function hash(v){v=String(v||'');var h=0;for(var i=0;i<v.length;i++){h=((h<<5)-h)+v.charCodeAt(i);h|=0}return('00000000'+(h>>>0).toString(16)).slice(-8)}
function page(){return document.body&&document.body.getAttribute('data-page')||''}
function value(sel){var e=q(sel);return e?String(e.value==null?'':e.value):''}
function sync(){var s=read();s.file=s.file||{};var f=s.file,id=page(),source='',fixed='',name='',path='';
if(id==='file-lab'){name=value('#filename');source=value('#currentCode')}
if(id==='saved-files'){name=value('#clSavedFileName');source=value('#clSavedFileCode')}
if(id==='buddy-canvas'){source=value('#loadedCode');fixed=value('#fixedCode')}
if(id==='patch-desk'){source=value('#originalCode');fixed=value('#fixedCode')}
if(id==='patch-lab'){source=value('#plIn');fixed=value('#plOut')}
if(id==='publish-prep'){path=value('#gwPath');fixed=value('#gwFixed')}
if(name){f.filename=name;f.path=f.path||name}if(path){f.path=path;f.filename=path.split('/').pop()||f.filename;f.githubSource=f.githubSource||{};f.githubSource.path=path}if(source.trim())f.currentCode=source;if(fixed||q('#fixedCode')||q('#plOut')||q('#gwFixed'))f.fixedCode=fixed;f.lastWorkingPage=id;f.lastWorkingAt=new Date().toISOString();write(s);return s}
function currentContent(s){var f=(s||read()).file||{};return String(f.fixedCode||f.currentCode||'')}
function status(text,kind){var e=q('#clOverwriteStatusV201');if(e){e.className='badge '+(kind||'warn');e.textContent=text}}
async function overwriteNow(){if(busy)return{ok:false,reason:'busy'};var s=sync(),f=s.file||{},id=String(f.savedFileId||f.saved_file_id||'');var content=currentContent(s),filename=f.filename||f.path||'file.txt';if(!id){status('Choose one saved file first','warn');return{ok:false,reason:'no_saved_file_id'}}if(!content.trim()){status('Nothing to save','warn');return{ok:false,reason:'empty'}}if(!window.CL_SB||!window.CL_SB.from){status('Local state saved · V104 can overwrite Supabase','warn');return{ok:false,reason:'no_browser_supabase'}}var digest=hash(filename+'|'+content);if(digest===lastHash){status('Current file already saved','good');return{ok:true,unchanged:true}}busy=true;status('Overwriting current saved file','warn');try{var meta=Object.assign({},f.metadata||{},{source:'code-labs-v201-current-file-overwrite',path:f.path||filename,repo:(s.project||{}).repo||'',branch:(f.githubSource||{}).branch||'main',lastPage:page(),overwrittenAt:new Date().toISOString()});var result=await window.CL_SB.from('code_labs_files').update({filename:filename,file_type:(filename.split('.').pop()||'file').toLowerCase(),current_code:content,current_hash:String(content.length),metadata:meta,updated_at:new Date().toISOString()}).eq('id',id).select('id,updated_at').maybeSingle();if(result.error)throw result.error;if(!result.data)throw new Error('The selected current-file row was not available.');lastHash=digest;f.lastSupabaseOverwriteAt=result.data.updated_at||new Date().toISOString();f.lastSupabaseOverwriteHash=digest;write(s);status('Current saved file overwritten','good');return{ok:true,file_id:id,hash:digest}}catch(e){console.error(e);status('Supabase overwrite waiting for V104','bad');return{ok:false,error:String(e.message||e)}}finally{busy=false}}
function schedule(){sync();clearTimeout(timer);timer=setTimeout(overwriteNow,1800)}
function addPanel(){var main=q('.main')||q('main');if(!main||q('#clCurrentFileOverwriteV201'))return;var p=document.createElement('section');p.id='clCurrentFileOverwriteV201';p.className='panel';p.innerHTML='<h2>Current saved file</h2><p>Typing updates the same working file. It never creates a fresh project, file, job, packet, test, or version row. Choose a saved file once; later saves overwrite that row.</p><div class="actions"><span id="clOverwriteStatusV201" class="badge warn">Local working state ready</span><button id="clOverwriteNowV201" data-buddy-action="overwrite-current-saved-file" class="btn primary" type="button">Overwrite current saved file</button><a class="btn ghost" href="saved-files.html">Choose current file</a></div><p class="fine">Checkpoints remain deliberate snapshots. Ordinary page edits are not checkpoints.</p>';var footer=q('#clFooterBuddyShellV201')||q('#clFooterBuddyShellV200')||q('.footerNote');if(footer&&footer.parentNode===main)main.insertBefore(p,footer);else main.appendChild(p);q('#clOverwriteNowV201').onclick=overwriteNow}
function boot(){addPanel();document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);sync()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(addPanel,900);setTimeout(addPanel,2200);
window.CodeLabsCurrentFileOverwriteV201={version:VERSION,sync:sync,overwrite:overwriteNow,schedule:schedule};
})();
