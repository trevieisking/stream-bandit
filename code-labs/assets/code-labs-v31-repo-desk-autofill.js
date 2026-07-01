/* Code Labs V3.1 Repo Desk Autofill
   Fixes stale Repo Desk fields by preferring current File Lab / Patch Lab state.
   No GitHub write from browser. No direct-main write.
*/
(function(){
'use strict';
var KEY='codeLabsV1State',STORE='codeLabsV30RepoDesk';
function q(s,r){return(r||document).querySelector(s)}
function app(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function getStore(){try{return JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch(e){return{}}}
function setStore(x){try{localStorage.setItem(STORE,JSON.stringify(x||{}))}catch(e){}}
function val(el){return el?String(el.value||''):''}
function put(id,v){var e=q(id);if(e)e.value=String(v||'')}
function page(){return document.body&&document.body.getAttribute('data-page')}
function fileState(){var s=app(),f=s.file||{},g=f.githubSource||{},p=s.project||{},repo=p.repo||'trevieisking/stream-bandit';if(g.owner&&g.repo)repo=g.owner+'/'+g.repo;var path=g.path||f.path||f.filename||'';return{repo:repo,sourceBranch:g.branch||'main',path:path,current:f.currentCode||'',fixed:f.fixedCode||'',hasPath:!!path,hasFixed:String(f.fixedCode||'').length>120}}
function branchName(mode,path){var clean=String(path||'file').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,46)||'file';return 'code-labs-'+(mode||'change')+'-'+clean}
function desired(){var f=fileState(),old=getStore(),mode=f.hasFixed?'change':(old.mode||'read'),path=f.hasPath?f.path:(old.path||''),branch=branchName(mode,path);return{mode:mode,path:path,branch:branch,notes:'Auto-filled from File Lab / Patch Lab for '+(path||'current file')+'. Buddy handles Repo Desk / GitHub lane. Branch and PR only; no direct-main write.',ready:f.hasPath}}
function apply(force){if(page()!=='repo-desk')return;var pathEl=q('#rdPath'),branchEl=q('#rdBranch'),modeEl=q('#rdMode'),notesEl=q('#rdNotes');if(!pathEl||!branchEl||!modeEl||!notesEl)return;var d=desired(),oldPath=val(pathEl);var stale=oldPath&&d.path&&oldPath!==d.path;if(force||stale||!oldPath||/test-page-do-not-merge/i.test(oldPath)){put('#rdMode',d.mode);put('#rdPath',d.path);put('#rdBranch',d.branch);put('#rdNotes',d.notes);setStore({mode:d.mode,path:d.path,branch:d.branch,notes:d.notes,pr:val(q('#rdPr')),preview:val(q('#rdPreview')),autoFilledFromFileLab:true,savedAt:new Date().toISOString()});var save=q('#rdSave');if(save)save.click();}
addPanel(d,stale)}
function addPanel(d,stale){if(q('#rdAutoFillPanel'))return;var hero=q('#repoDesk'),panel=document.createElement('section');panel.id='rdAutoFillPanel';panel.className='panel';panel.style.border='3px solid rgba(15,159,110,.30)';panel.style.background='#ecfdf5';panel.style.color='#0f172a';panel.innerHTML='<h2 style="margin-top:0">Auto-fill from File Lab</h2><p><b>Repo Desk should use the same file you loaded in File Lab / Patch Lab.</b></p><p>Current target: <b id="rdAutoFillTarget"></b></p><div class="actions"><button class="btn primary" id="rdAutoFillBtn" type="button">Auto-fill Repo Desk from File Lab</button></div><p><b>Plain rule:</b> If the action/path/branch fields look wrong, press this button. Buddy handles the GitHub lane.</p>';if(hero&&hero.parentNode)hero.parentNode.insertBefore(panel,hero.nextSibling);var b=q('#rdAutoFillBtn');if(b)b.onclick=function(){apply(true)};refreshPanel(d,stale)}
function refreshPanel(d,stale){var t=q('#rdAutoFillTarget');if(t)t.textContent=d.path||'No File Lab file found yet';var p=q('#rdAutoFillPanel');if(p&&stale){p.style.background='#fff1f2';p.style.borderColor='rgba(180,35,24,.35)'}}
function start(){setTimeout(function(){apply(false)},700);setTimeout(function(){apply(false)},1600);setTimeout(function(){apply(false)},3200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();