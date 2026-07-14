/* Code Labs legacy history compatibility V201
   Converts the old insert-everything save button into current-row overwrite.
*/
(function(){
'use strict';
function q(s){return document.querySelector(s)}
function install(){var history=window.CodeLabsRepairHistory,overwrite=window.CodeLabsCurrentFileV104OverwriteV201||window.CodeLabsCurrentFileOverwriteV201;if(!history||!overwrite){setTimeout(install,220);return}if(history.__v201OverwriteOnly)return;var old=history.saveAll;history.saveLegacySnapshot=old;history.saveAll=function(){var api=window.CodeLabsCurrentFileV104OverwriteV201||window.CodeLabsCurrentFileOverwriteV201;return api&&api.overwriteV104?api.overwriteV104():api&&api.overwrite?api.overwrite():Promise.resolve({ok:false,reason:'overwrite_not_ready'})};history.__v201OverwriteOnly=true;var button=q('#clSaveHistory');if(button){button.textContent='Overwrite current saved file';button.onclick=history.saveAll;button.setAttribute('data-buddy-action','overwrite-current-saved-file');button.className='btn primary'}var title=q('#clHistoryPanel h2');if(title)title.textContent='Current Saved File';var help=q('#clHistoryHelp');if(help)help.innerHTML='<p><b>Current file mode:</b> this button overwrites the selected Code Labs file row. It does not create another project, file, job, packet, test, or version.</p>'}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();setTimeout(install,700);setTimeout(install,1800);setTimeout(install,3600);
window.CodeLabsHistoryOverwriteCompatV201={version:'V201.1',install:install};
})();
