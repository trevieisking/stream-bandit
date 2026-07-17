/* Code God fallback clarity V276: safe branch suggestions and source evidence. */
(function(){
'use strict';
var STATE='codeLabsV1State',WRITER='codeLabsGithubWriterV2',REPO='codeLabsV30RepoDesk';
function id(v){return document.getElementById(v)}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return{}}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v||{}))}catch(e){}}
function slug(v){return String(v||'file').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,46)||'file'}
function path(){var manual=id('cgManualPath');if(manual&&manual.value.trim())return manual.value.trim();var s=read(STATE),f=s.file||{},g=f.githubSource||{};return g.path||f.path||f.filename||'file'}
function suggested(){return 'fix/code-labs-'+slug(path().replace(/\.[^.]+$/,''))}
function fillManual(){var b=id('cgManualRequestBranch');if(b&&!b.value.trim()){b.value=suggested();b.dispatchEvent(new Event('input',{bubbles:true}))}}
function fillWorkflow(){var branch=suggested(),s=read(STATE),f=s.file||{},changed=false;f.githubWriter=f.githubWriter||{};if((f.githubWriter.repo||f.githubWriter.path||f.githubWriter.action)&&!String(f.githubWriter.branch||'').trim()){f.githubWriter.branch=branch;changed=true}s.file=f;if(changed)write(STATE,s);var w=read(WRITER);if((w.repo||w.path||w.action)&&!String(w.branch||'').trim()){w.branch=branch;write(WRITER,w)}var r=read(REPO);if((r.repo||r.path||r.mode)&&!String(r.branch||'').trim()){r.branch=branch;write(REPO,r)}return branch}
function chars(v){return String(v||'').length}
function evidence(){var host=id('cgSourceModes');if(!host)return;var box=id('cgFallbackEvidence');if(!box){box=document.createElement('div');box.id='cgFallbackEvidence';box.className='notice';box.style.marginTop='12px';host.appendChild(box)}var s=read(STATE),f=s.file||{},ctx=window.CodeGodSourceModesV275&&window.CodeGodSourceModesV275.workflowContext?window.CodeGodSourceModesV275.workflowContext():{},manualOriginal=id('cgManualOriginal'),manualProposed=id('cgManualProposed'),github=manualOriginal&&manualOriginal.value?manualOriginal