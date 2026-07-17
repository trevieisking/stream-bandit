/* Code God fallback clarity V276: source evidence and safe branch suggestions. */
(function(){
'use strict';
var STATE='codeLabsV1State',WRITER='codeLabsGithubWriterV2',REPO='codeLabsV30RepoDesk';
function id(v){return document.getElementById(v)}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')||{}}catch(e){return{}}}
function write(k,v){try{localStorage.setItem(k,JSON.stringify(v||{}))}catch(e){}}
function chars(v){return String(v||'').length}
function slug(v){return String(v||'file').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,46)||'file'}
function currentPath(){var manual=id('cgManualPath');if(manual&&manual.value.trim())return manual.value.trim();var s=read(STATE),f=s.file||{},g=f.githubSource||{};return g.path||f.path||f.filename||'file'}
function suggestion(){return'fix/code-labs-'+slug(currentPath().replace(/\.[^.]+$/,''))}
function fillBlankBranches(){var branch=suggestion(),changed=false,b=id('cgManualRequestBranch');if(b&&!b.value.trim()){b.value=branch;b.dispatchEvent(new Event('input',{bubbles:true}));changed=true}var s=read(STATE),f=s.file||{};if(f.githubWriter&&(f.githubWriter.repo||f.githubWriter.path||f.githubWriter.action)&&!String(f.githubWriter.branch||'').trim()){f.githubWriter.branch=branch;s.file=f;write(STATE,s);changed=true}var w=read(WRITER);if((w.repo||w.path||w.action)&&!String(w.branch||'').trim()){w.branch=branch;write(WRITER,w);changed=true}var r=read(REPO);if((r.repo||r.path||r.mode)&&!String(r.branch||'').trim()){r.branch=branch;write(REPO,r);changed=true}return{branch:branch,changed:changed}}
function sourceEvidence(){var s=read(STATE),f=s.file||{},ctx=window.CodeGodSourceModesV275&&window.CodeGodSourceModesV275.workflowContext?window.CodeGodSourceModesV275.workflowContext():{},mo=id('cgManualOriginal'),mp=id('cgManualProposed');return{githubOriginal:chars(mo&&mo.value),workflowProposal:chars(ctx.proposed),buddyFallback:chars(f.fixedCode),manualProposal:chars(mp&&mp.value)}}
function render(){var host=id('cgSourceModes');if(!host)return false;var result=fillBlankBranches(),e=sourceEvidence(),box=id('cgFallbackEvidence');if(!box){box=document.createElement('div');box.id='cgFallbackEvidence';box.className='notice';box.style.marginTop='12px';host.appendChild(box)}box.innerHTML='<p><b>Code God source decision:</b> GitHub original <b>'+e.githubOriginal+'</b> characters · workflow proposal <b>'+e.workflowProposal+'</b> · Buddy Canvas fallback <b>'+e.buddyFallback+'</b> · manual proposal <b>'+e.manualProposal+'</b>.</p><p><b>Safe branch suggestion:</b> '+result.branch+(result.changed?' — filled into blank browser handoff fields.':' — existing branch preserved.')+'</p><p><b>Boundary:</b> the V104/Supabase copy remains tool-only and receipt-controlled; this browser page does not claim direct access to it.</p>';return true}
function wire(){if(!render())return false;['cgManualPath','cgManualProposed','cgManualRequestBranch','cgPullGithub','cgUseWorkflowDetails','cgUseWorkflowProposal','cgUsePulledProposal','cgWorkflowMode','cgManualMode'].forEach(function(k){var e=id(k);if(e&&!e.getAttribute('data-cg-v276')){e.setAttribute('data-cg-v276','yes');e.addEventListener(e.tagName==='BUTTON'?'click':'input',function(){setTimeout(render,30)})}});return true}
function boot(){if(!document.body||document.body.getAttribute('data-page')!=='code-god')return;var tries=0,t=setInterval(function(){tries++;if(wire()||tries>40)clearInterval(t)},100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
