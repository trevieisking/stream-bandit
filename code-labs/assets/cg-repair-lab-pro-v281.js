(function(){
'use strict';
var VERSION='CG Repair Lab Pro V281';
var access={entitled:false,repositories:[]};
var lastReport=null;
function q(id){return document.getElementById(id)}
function text(value){return String(value==null?'':value)}
function redact(value){
  return text(value)
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gi,'[REDACTED_CREDENTIAL]')
    .replace(/\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_]{12,}\b/g,'[REDACTED_CREDENTIAL]')
    .replace(/\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{12,}\b/g,'[REDACTED_CREDENTIAL]')
    .replace(/\bsb_(?:secret|publishable)_[A-Za-z0-9_-]{12,}\b/g,'[REDACTED_CREDENTIAL]')
    .replace(/\bsk-[A-Za-z0-9_-]{20,}\b/g,'[REDACTED_CREDENTIAL]');
}
function node(tag,className,value){var el=document.createElement(tag);if(className)el.className=className;if(value!=null)el.textContent=redact(value);return el}
function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail:detail}))}
function setStatus(label,state){var el=q('cgrlStatus');el.textContent=label;el.dataset.state=state||'ready'}
function requestAccess(){q('cgrlAccessText').textContent='Checking Code Labs Pro entitlement and owner-authorized repositories…';emit('code-labs:cg-repair-lab-access-request',{tool:'get_cg_repair_lab_access',read_only:true})}
function applyAccess(result){
  result=result&&typeof result==='object'?result:{};
  var repositories=Array.isArray(result.repositories)?result.repositories.filter(function(row){return row&&typeof row.repo==='string'}):[];
  access={entitled:result.entitled===true,repositories:repositories};
  var select=q('cgrlRepo');select.replaceChildren();
  if(!access.entitled){
    select.appendChild(new Option('Code Labs Pro required',''));
    q('cgrlFields').disabled=true;
    q('cgrlAccessText').textContent='Locked. An active Code Labs Pro entitlement is required. The server will enforce this again for every analysis.';
    setStatus('PRO REQUIRED','block');return;
  }
  if(!repositories.length){
    select.appendChild(new Option('Connect an owner-authorized GitHub repository',''));
    q('cgrlFields').disabled=true;
    q('cgrlAccessText').textContent='Code Labs Pro is active, but no owner-authorized GitHub repository is available.';
    setStatus('REPOSITORY REQUIRED','block');return;
  }
  repositories.forEach(function(row){var option=new Option(redact(row.repo),row.repo);option.dataset.defaultBranch=text(row.default_branch);select.appendChild(option)});
  q('cgrlFields').disabled=false;
  q('cgrlAccessText').textContent='Code Labs Pro confirmed. Only repositories verified for this signed-in owner are selectable.';
  setStatus('READY','pass');
}
function requestAnalysis(event){
  event.preventDefault();
  if(!access.entitled||q('cgrlFields').disabled)return;
  var repo=text(q('cgrlRepo').value).trim(),ref=text(q('cgrlRef').value).trim(),path=text(q('cgrlPath').value).trim();
  if(!repo||!path)return;
  setStatus('ANALYSING','working');q('cgrlRun').disabled=true;
  emit('code-labs:cg-repair-lab-request',{tool:'analyze_code_labs_repository',repo:repo,ref:ref,path:path,read_only:true});
}
function renderCounts(report){
  var coverage=report.coverage||{},database=report.database_map||{},debug=report.debug_report||{};
  var rows=[['Indexed files',coverage.indexed_files||0],['Live pages',coverage.indexed_live_pages||0],['Findings',(report.findings||[]).length],['Dependencies',(report.dependency_map||[]).length],['Secret references',(report.secret_reference_map||[]).length],['Tables',(database.tables||[]).length],['Write routes',(debug.write_routes||[]).length],['Coverage',coverage.complete===true?'Complete':'Safe failure']];
  var root=q('cgrlCounts');root.replaceChildren();rows.forEach(function(row){var card=node('div','stat');card.appendChild(node('b','',row[0]));card.appendChild(node('span','',row[1]));root.appendChild(card)});
}
function renderFindings(report){
  var root=q('cgrlFindings'),rows=Array.isArray(report.findings)?report.findings:[];root.replaceChildren();
  if(!rows.length){root.appendChild(node('div','empty','No findings were reported.'));return}
  rows.forEach(function(row){var item=node('div','item cgrlFinding');item.dataset.severity=text(row.severity);item.appendChild(node('div','cgrlSeverity',row.severity||'P3'));var body=node('div');body.appendChild(node('b','',row.rule_id||'CGRL-FINDING'));body.appendChild(node('p','',row.message));if(row.path)body.appendChild(node('div','cgrlLocation',row.path+(row.line?':'+row.line:'')));body.appendChild(node('p','',row.correction));item.appendChild(body);root.appendChild(item)});
}
function renderSecrets(report){
  var root=q('cgrlSecrets'),rows=Array.isArray(report.secret_reference_map)?report.secret_reference_map:[];root.replaceChildren();
  if(!rows.length){root.appendChild(node('div','empty','No supported secret references were found.'));return}
  rows.forEach(function(row){
    var item=node('div','item');
    item.appendChild(node('div','cgrlSecretName',row.name));
    item.appendChild(node('p','',row.reference));
    var declaration=row.declaration||{};
    item.appendChild(node('div','cgrlLocation',text(declaration.path)+(declaration.line?':'+declaration.line:'')));
    var calls=Array.isArray(row.call_sites)?row.call_sites:[];
    item.appendChild(node('p','',calls.length?'Downstream call sites:':'No downstream alias call was mapped.'));
    calls.forEach(function(call){
      item.appendChild(node('div','cgrlCalls',text(call.expression)+' — '+text(call.path)+(call.line?':'+call.line:'')));
    });
    root.appendChild(item);
  });
}
function applyReport(report){
  q('cgrlRun').disabled=false;
  if(!report||typeof report!=='object'){setStatus('SAFE FAILURE','block');q('cgrlSummary').textContent='No valid read-only report was returned.';return}
  lastReport=report;
  var complete=report.coverage&&report.coverage.complete===true;
  setStatus(redact(report.outcome||'REVIEW'),complete?'pass':'block');
  q('cgrlSummary').textContent=complete?'Read-only analysis completed. Review every finding and exact call site before preparing a candidate.':'Analysis failed closed because complete indexed coverage was not proven. No repair candidate may continue.';
  renderCounts(report);renderFindings(report);renderSecrets(report);
  var ready=complete&&typeof report.proposed_complete_file_candidate==='string'&&report.proposed_complete_file_candidate.length>0;
  q('cgrlCodeGod').disabled=!ready;
  q('cgrlCandidateText').textContent=ready?'A separate complete-file candidate is ready for deterministic Code God review. It has not replaced the selected source.':'No proposed complete-file candidate is ready. CG Repair Lab has not replaced the selected source.';
}
function applyError(error){q('cgrlRun').disabled=false;setStatus('BLOCKED','block');q('cgrlSummary').textContent=redact(error&&error.message||error||'The server blocked the request.')}
function sendToCodeGod(){
  if(!lastReport||typeof lastReport.proposed_complete_file_candidate!=='string')return;
  emit('code-labs:cg-repair-lab-code-god-request',{candidate_code:lastReport.proposed_complete_file_candidate,candidate_hash:lastReport.proposed_candidate_hash||'',repository:lastReport.repository||'',ref:lastReport.ref||'',path:lastReport.selected_path||'',requires_code_god:true,replace_selected_source:false});
}
function boot(){
  q('cgrlCheckAccess').addEventListener('click',requestAccess);
  q('cgrlForm').addEventListener('submit',requestAnalysis);
  q('cgrlCodeGod').addEventListener('click',sendToCodeGod);
  q('cgrlRepo').addEventListener('change',function(){var selected=q('cgrlRepo').selectedOptions[0];if(selected&&selected.dataset.defaultBranch&&!q('cgrlRef').value)q('cgrlRef').placeholder=selected.dataset.defaultBranch});
  window.addEventListener('code-labs:cg-repair-lab-access-result',function(event){applyAccess(event.detail)});
  window.addEventListener('code-labs:cg-repair-lab-result',function(event){applyReport(event.detail)});
  window.addEventListener('code-labs:cg-repair-lab-error',function(event){applyError(event.detail)});
  window.CodeLabsCgRepairLabProV281={version:VERSION,applyAccess:applyAccess,applyReport:applyReport,applyError:applyError};
  emit('code-labs:cg-repair-lab-ready',{version:VERSION,read_only:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
