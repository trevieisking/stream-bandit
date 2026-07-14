/* Code Labs Page Runtime V201
   Restores the full protected route without renaming or suppressing old pages.
*/
(function(){
'use strict';
var VERSION='V201.2-full-page-roles';
var ROLES={
'index':{step:1,title:'Home'},'setup':{step:2,title:'Setup'},'project-picker':{step:3,title:'Project Picker'},
'file-lab':{step:4,title:'File Lab'},'saved-files':{step:5,title:'Saved Files'},'rescue-room':{step:6,title:'Rescue Room'},
'packet-builder':{step:7,title:'Packet Builder'},'buddy-canvas':{step:8,title:'Buddy Canvas'},'v20':{step:9,title:'Workflow Hub'},
'patch-desk':{step:10,title:'Patch Desk'},'patch-lab':{step:11,title:'Patch Lab'},'preview-test':{step:12,title:'Preview + Test'},
'checkpoints':{step:13,title:'Checkpoints'},'repo-desk':{step:14,title:'Repo Desk'},'publish-prep':{step:15,title:'GitHub Writer'},
'github-tracker':{step:16,title:'GitHub Tracker'},'help':{step:17,title:'Help + Tools'},
'start-guide':{title:'Start Guide'},'fix-wizard':{title:'Fix Wizard'},'ai-handoff':{title:'AI Handoff'},
'checklist-builder':{title:'Checklist Builder'},'about':{title:'About'},'faq':{title:'FAQ'},'context-packet':{title:'Context Packet'},
'helper-route-map':{title:'Route Scanner'},'read-only-proof':{title:'Read-only Proof'},'owner-read-proof':{title:'Owner Read Proof'}
};
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function load(src,attr){if(q('script['+attr+']'))return;var s=document.createElement('script');s.src=src;s.setAttribute(attr,'yes');document.head.appendChild(s)}
function isFullFile(path,text){text=String(text||'').trim();if(!text||text.length<120)return false;if(/BEGIN PATCH|Find:\s*\n|Replace with:|^diff --git |^@@\s/m.test(text))return false;if(/\.html?$/i.test(path||'')&&!(/<!doctype\s+html/i.test(text)||/<html[\s>]/i.test(text)))return false;return true}
function syncVisibleEditor(){var id=page(),state;try{state=JSON.parse(localStorage.getItem('codeLabsV1State')||'{}')||{}}catch(e){state={}}state.file=state.file||{};var source='',fixed='',path=state.file.path||(state.file.githubSource||{}).path||state.file.filename||'';
if(id==='file-lab'){source=q('#currentCode')&&q('#currentCode').value||'';path=q('#filename')&&q('#filename').value||path}
if(id==='saved-files'){source=q('#clSavedFileCode')&&q('#clSavedFileCode').value||'';path=q('#clSavedFileName')&&q('#clSavedFileName').value||path}
if(id==='buddy-canvas'){source=q('#loadedCode')&&q('#loadedCode').value||'';fixed=q('#fixedCode')&&q('#fixedCode').value||''}
if(id==='patch-desk'){source=q('#originalCode')&&q('#originalCode').value||'';fixed=q('#fixedCode')&&q('#fixedCode').value||''}
if(id==='patch-lab'){source=q('#plIn')&&q('#plIn').value||'';fixed=q('#plOut')&&q('#plOut').value||''}
if(id==='publish-prep'){path=q('#gwPath')&&q('#gwPath').value||path;fixed=q('#gwFixed')&&q('#gwFixed').value||''}
if(source.trim())state.file.currentCode=source;if(fixed.trim())state.file.fixedCode=fixed;if(path){state.file.path=path;state.file.filename=path.split('/').pop()||state.file.filename;state.file.githubSource=state.file.githubSource||{};state.file.githubSource.path=path}state.file.lastVisibleSyncPage=id;state.file.lastVisibleSyncAt=new Date().toISOString();localStorage.setItem('codeLabsV1State',JSON.stringify(state));return state}
function run(){var id=page(),role=ROLES[id];document.documentElement.setAttribute('data-cl-page-runtime-v201',VERSION);if(role){if(role.step)document.documentElement.setAttribute('data-cl-workflow-step',String(role.step));var crumb=q('.crumbs b');if(crumb)crumb.textContent=role.title;}
load('assets/code-labs-workflow-clarity-v130.js?v=cl-v201-2','data-cl-workflow-clarity-v130');
load('assets/code-labs-page-completion-v139.js?v=cl-v201-2','data-cl-page-completion-v139');
load('assets/code-labs-page-polish-v172.js?v=cl-v201-2','data-cl-page-polish-v172');
if(id==='saved-files')load('assets/code-labs-saved-files-repo-puller-v201.js?v=cl-v201-2','data-cl-saved-files-repo-puller-v201');
load('assets/code-labs-current-file-overwrite-v201.js?v=cl-v201-2','data-cl-current-file-overwrite-v201');
load('assets/code-labs-current-file-v104-overwrite-v201.js?v=cl-v201-2','data-cl-current-file-v104-overwrite-v201');
load('assets/code-labs-history-overwrite-compat-v201.js?v=cl-v201-2','data-cl-history-overwrite-compat-v201');
document.addEventListener('input',syncVisibleEditor,true);document.addEventListener('change',syncVisibleEditor,true);return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();setTimeout(run,350);setTimeout(run,1200);
window.CodeLabsPageRuntimeV201={version:VERSION,roles:ROLES,isFullFile:isFullFile,syncVisibleEditor:syncVisibleEditor,run:run};window.CodeLabsPageRuntimeV200=window.CodeLabsPageRuntimeV201;
})();
