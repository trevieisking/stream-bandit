/* Code Labs Master Checklist V2 - local final-verification view, no authority to promote. */
(function(){
'use strict';
var KEY='codeLabsChecklistBuilder';
var VERSION='V2.0-master-checklist-final-view';
var STATES=['PASS','HOLD','BLOCK','NOT_RUN','USER_CHECK'];
var REPAIR_CONTEXT_FIELDS=['operation_id','expected_state_version','repository','pull_request','branch','reviewed_head_sha','merge_commit_sha','target_file','source_hash','candidate_hash','plan_id','plan_revision','plan_hash','page','page_role','requested_action','preserved_capabilities','affected_helpers','dependencies','authentication','owner_scope','entitlement','database_boundary','browser_boundary','github_boundary','rollback','replay','fencing_tests','cg_repair_lab_findings','code_god_findings','workflow_run_count','combined_status_count','evidence_source','required','performed','passed','failed','not_run','user_checks'];
var loadedChecklist=null;

function q(s,r){return(r||document).querySelector(s)}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function copy(t){
  var value=String(t||'');
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value);return}
  var a=document.createElement('textarea');
  a.value=value;
  document.body.appendChild(a);
  a.select();
  document.execCommand('copy');
  a.remove();
}
function val(id){var e=q(id);return e?String(e.value||'').trim():''}
function checks(){return Array.prototype.map.call(document.querySelectorAll('[data-cl-check]'),function(c){return [!!c.checked,String(c.getAttribute('data-cl-check')||'')]})}
function selected(){return checks().filter(function(x){return x[0]}).map(function(x){return x[1]})}
function normalizeState(value){
  var state=String(value||'').trim().toUpperCase().replace(/[ -]+/g,'_');
  return STATES.indexOf(state)>-1?state:'HOLD';
}
function normalizeItems(value){
  if(!Array.isArray(value))throw new Error('The exact checklist must contain an items array.');
  if(value.length>500)throw new Error('The exact checklist is too large for this browser view.');
  return value.map(function(item,index){
    var row=item&&typeof item==='object'?item:{};
    return{
      id:row.id==null?index+1:row.id,
      state:normalizeState(row.state),
      requirement:String(row.requirement||row.title||'Unnamed checklist item'),
      evidence:String(row.evidence||row.reason||'No evidence recorded.')
    };
  });
}
function parseChecklistText(text){
  var parsed=JSON.parse(String(text||''));
  var source=parsed&&parsed.exact_checklist&&typeof parsed.exact_checklist==='object'?parsed.exact_checklist:parsed;
  var items=Array.isArray(source)?source:source&&source.items;
  return{
    checklist_id:String((source&&source.checklist_id)||(parsed&&parsed.checklist_id)||''),
    checklist_version:Number((source&&source.checklist_version)||(parsed&&parsed.checklist_version)||0)||0,
    plan_id:String((source&&source.plan_record_id)||(source&&source.plan_id)||(parsed&&parsed.plan_id)||''),
    plan_revision:String((source&&source.plan_revision)||(parsed&&parsed.plan_revision)||''),
    plan_hash:String((source&&source.source_hash)||(source&&source.plan_hash)||(parsed&&parsed.plan_hash)||''),
    reviewed_repository:String((source&&source.reviewed_repository)||(parsed&&parsed.reviewed_repository)||''),
    reviewed_pull_request:String((source&&source.reviewed_pull_request)||(parsed&&parsed.reviewed_pull_request)||''),
    reviewed_head_sha:String((source&&source.reviewed_head_sha)||(parsed&&parsed.reviewed_head_sha)||''),
    workflow_run_count:Number((source&&source.workflow_run_count)||(parsed&&parsed.workflow_run_count)||0)||0,
    combined_status_count:Number((source&&source.combined_status_count)||(parsed&&parsed.combined_status_count)||0)||0,
    items:normalizeItems(items),
    imported_at:new Date().toISOString()
  };
}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function write(value){try{localStorage.setItem(KEY,JSON.stringify(value||{}));return true}catch(e){return false}}
function binding(){
  return{
    plan_id:val('#clPlanId'),
    plan_revision:val('#clPlanRevision'),
    plan_hash:val('#clPlanHash'),
    repository:val('#clChecklistRepository'),
    pull_request:val('#clChecklistPr'),
    reviewed_head_sha:val('#clChecklistHead'),
    workflow_run_count:Number(val('#clWorkflowRunCount')||0)||0,
    combined_status_count:Number(val('#clStatusCount')||0)||0
  };
}
function state(){
  return{
    version:VERSION,
    title:val('#clChecklistTitle')||'Code Labs Master Checklist',
    page:val('#clChecklistPage')||'code-labs/checklist-builder.html',
    goal:val('#clChecklistGoal')||'Verify the selected Master Plan against exact evidence',
    notes:val('#clChecklistNotes'),
    items:checks(),
    repair_context_fields:REPAIR_CONTEXT_FIELDS,
    user_checks:selected(),
    binding:binding(),
    canonical_checklist:loadedChecklist,
    saved_at:new Date().toISOString(),
    authority:'local-browser-verification-view-only'
  };
}
function save(){
  var value=state();
  write(value);
  setStatus('Master Checklist view saved locally','good');
  return value;
}
function overall(items){
  if(!items||!items.length)return'HOLD';
  if(items.some(function(item){return item.state==='BLOCK'}))return'BLOCK';
  if(items.some(function(item){return item.state==='HOLD'||item.state==='NOT_RUN'||item.state==='USER_CHECK'}))return'HOLD';
  return'PASS';
}
function counts(items){
  var out={PASS:0,HOLD:0,BLOCK:0,NOT_RUN:0,USER_CHECK:0};
  (items||[]).forEach(function(item){out[normalizeState(item.state)]++});
  return out;
}
function report(){
  var s=state(),list=s.canonical_checklist&&s.canonical_checklist.items||[],result=overall(list),totals=counts(list),picked=selected();
  var lines=[
    'CODE LABS MASTER CHECKLIST',
    'Browser summary: '+result,
    'Authority: Local verification view only. This result cannot authorise Writer, merge, deployment or production use.',
    'Checklist ID: '+((s.canonical_checklist&&s.canonical_checklist.checklist_id)||'Not loaded'),
    'Checklist version: '+((s.canonical_checklist&&s.canonical_checklist.checklist_version)||'Not loaded'),
    'Plan ID: '+(s.binding.plan_id||'Not bound'),
    'Plan revision: '+(s.binding.plan_revision||'Not bound'),
    'Plan hash: '+(s.binding.plan_hash||'Not bound'),
    'Repository: '+(s.binding.repository||'Not bound'),
    'Pull request: '+(s.binding.pull_request||'Not bound'),
    'Reviewed head SHA: '+(s.binding.reviewed_head_sha||'Not bound'),
    'Workflow runs found: '+s.binding.workflow_run_count,
    'Combined statuses found: '+s.binding.combined_status_count,
    '',
    'State totals: PASS '+totals.PASS+' | HOLD '+totals.HOLD+' | BLOCK '+totals.BLOCK+' | NOT RUN '+totals.NOT_RUN+' | USER CHECK '+totals.USER_CHECK,
    '',
    'Canonical items:'
  ];
  if(!list.length)lines.push('- No exact checklist loaded.');
  else list.forEach(function(item){lines.push('#'+item.id+' ['+item.state+'] '+item.requirement+' - '+item.evidence)});
  lines.push('', 'Manual user checks:', picked.length?picked.map(function(x){return'- '+x}).join('\n'):'- None selected yet.');
  lines.push('', 'Notes:', s.notes||'No notes yet.');
  lines.push('', 'Rules',
    '- Use the exact owner-scoped Master Plan ID, revision and canonical hash.',
    '- Retrieve mutable GitHub facts again for the exact repository, pull request and reviewed head.',
    '- Report missing workflows or statuses as none found; absence is not PASS.',
    '- Code God and CG Repair Lab remain advisory until separately promoted for trust.',
    '- Contradictory evidence, stale identity, HOLD, NOT RUN or USER CHECK prevents release promotion.',
    '- No direct write to main, merge, deployment, deletion or force-push from this page.'
  );
  return lines.join('\n');
}
function setStatus(text,kind){var e=q('#clMasterChecklistStatus');if(e){e.className='badge '+(kind||'warn');e.textContent=text}}
function setValue(id,value){var e=q('#'+id);if(e)e.value=String(value==null?'':value)}
function syncBinding(checklist){
  if(!checklist)return;
  setValue('clPlanId',checklist.plan_id||'');
  setValue('clPlanRevision',checklist.plan_revision||checklist.checklist_version||'');
  setValue('clPlanHash',checklist.plan_hash||'');
  setValue('clChecklistRepository',checklist.reviewed_repository||'');
  setValue('clChecklistPr',checklist.reviewed_pull_request||'');
  setValue('clChecklistHead',checklist.reviewed_head_sha||'');
  setValue('clWorkflowRunCount',checklist.workflow_run_count||0);
  setValue('clStatusCount',checklist.combined_status_count||0);
}
function renderCanonical(){
  var box=q('#clCanonicalChecklistView');
  if(!box)return;
  var list=loadedChecklist&&loadedChecklist.items||[];
  if(!list.length){box.innerHTML='<div class="notice"><p>No exact checklist is loaded. Paste the owner-scoped checklist JSON, then load it.</p></div>';return}
  var totals=counts(list),result=overall(list);
  var rows=list.map(function(item){return'<tr><td>'+esc(item.id)+'</td><td><b>'+esc(item.state)+'</b></td><td>'+esc(item.requirement)+'</td><td>'+esc(item.evidence)+'</td></tr>'}).join('');
  box.innerHTML=''
    +'<div class="notice"><p><b>Browser summary: '+esc(result)+'</b> - PASS '+totals.PASS+', HOLD '+totals.HOLD+', BLOCK '+totals.BLOCK+', NOT RUN '+totals.NOT_RUN+', USER CHECK '+totals.USER_CHECK+'. This is not a promotion decision.</p></div>'
    +'<div style="overflow:auto"><table><thead><tr><th>#</th><th>State</th><th>Requirement</th><th>Evidence</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function loadCanonical(){
  try{
    loadedChecklist=parseChecklistText(val('#clCanonicalChecklistJson'));
    syncBinding(loadedChecklist);
    renderCanonical();
    save();
    setStatus('Exact checklist loaded into local verification view','good');
  }catch(error){
    loadedChecklist=null;
    renderCanonical();
    setStatus('Checklist JSON could not be loaded: '+String(error&&error.message||error),'bad');
  }
}
function restore(){
  var old=read();
  if(old.title)setValue('clChecklistTitle',old.title);
  if(old.page)setValue('clChecklistPage',old.page);
  if(old.goal)setValue('clChecklistGoal',old.goal);
  if(old.notes)setValue('clChecklistNotes',old.notes);
  if(old.binding){
    setValue('clPlanId',old.binding.plan_id);
    setValue('clPlanRevision',old.binding.plan_revision);
    setValue('clPlanHash',old.binding.plan_hash);
    setValue('clChecklistRepository',old.binding.repository);
    setValue('clChecklistPr',old.binding.pull_request);
    setValue('clChecklistHead',old.binding.reviewed_head_sha);
    setValue('clWorkflowRunCount',old.binding.workflow_run_count);
    setValue('clStatusCount',old.binding.combined_status_count);
  }
  if(old.items){old.items.forEach(function(x){var selector='[data-cl-check="'+String(x[1]||'').replace(/"/g,'\\"')+'"]';var c=q(selector);if(c)c.checked=!!x[0]})}
  if(old.canonical_checklist){loadedChecklist=old.canonical_checklist;syncBinding(loadedChecklist)}
  renderCanonical();
}
function add(){
  var main=q('.main');
  if(!main){setTimeout(add,160);return}
  if(q('#clChecklistBuilder'))return;
  var panel=document.createElement('section');
  panel.className='hero';
  panel.id='clChecklistBuilder';
  panel.innerHTML=''
    +'<div><span class="pill">Final verification owner</span><h1>Master Checklist</h1><p>Load the exact owner-scoped checklist, bind it to the selected Master Plan and current GitHub head, then record what is PASS, HOLD, BLOCK, NOT RUN or waiting for USER CHECK.</p><p><span id="clMasterChecklistStatus" class="badge warn">Local verification view ready</span></p><div class="actions"><button class="btn primary" id="clLoadExactChecklist" type="button">Load exact checklist</button><button class="btn ghost" id="clBuildChecklist" type="button">Build report</button><button class="btn ghost" id="clCopyChecklist" type="button">Copy report</button><button class="btn ghost" id="clSaveChecklist" type="button">Save locally</button></div></div>'
    +'<div class="heroCard"><b>Use this last</b><ol><li>Paste the authoritative checklist JSON.</li><li>Refresh exact repository, PR, head, workflows and statuses.</li><li>Record user checks and unresolved evidence.</li><li>Request a separate promotion decision only when every required gate is proven.</li></ol></div>';
  var exact=document.createElement('section');
  exact.className='panel';
  exact.innerHTML=''
    +'<h2>Exact Master Plan binding</h2>'
    +'<div class="grid2"><label>Plan ID<input id="clPlanId" placeholder="Owner-scoped plan record ID"></label><label>Plan revision<input id="clPlanRevision" placeholder="Exact revision"></label></div>'
    +'<label>Canonical plan hash<input id="clPlanHash" placeholder="Full SHA-256 hash"></label>'
    +'<div class="grid2"><label>Repository<input id="clChecklistRepository" placeholder="owner/repository"></label><label>Pull request<input id="clChecklistPr" placeholder="Exact PR number"></label></div>'
    +'<label>Reviewed head SHA<input id="clChecklistHead" placeholder="Full 40-character head SHA"></label>'
    +'<div class="grid2"><label>Workflow runs found<input id="clWorkflowRunCount" inputmode="numeric" value="0"></label><label>Combined statuses found<input id="clStatusCount" inputmode="numeric" value="0"></label></div>'
    +'<label>Authoritative checklist JSON<textarea id="clCanonicalChecklistJson" class="mid" placeholder="Paste an object containing exact_checklist or an items array. Secret values must never be pasted here."></textarea></label>'
    +'<div id="clCanonicalChecklistView"></div>';
  var form=document.createElement('section');
  form.className='panel';
  form.innerHTML=''
    +'<h2>Manual user and visible checks</h2>'
    +'<div class="grid2"><label>Checklist title<input id="clChecklistTitle" value="Code Labs Master Checklist"></label><label>Target page<input id="clChecklistPage" value="code-labs/checklist-builder.html"></label></div>'
    +'<label>Goal<input id="clChecklistGoal" value="Verify the selected Master Plan against exact evidence"></label>'
    +'<div class="grid2"><div class="item"><b>Workflow checks</b><label><input type="checkbox" data-cl-check="Beginning-to-end workflow tested"> Beginning-to-end workflow tested</label><label><input type="checkbox" data-cl-check="One owner per responsibility confirmed"> One owner per responsibility confirmed</label><label><input type="checkbox" data-cl-check="Working legacy capability preserved"> Working legacy capability preserved</label><label><input type="checkbox" data-cl-check="Rollback route confirmed"> Rollback route confirmed</label></div><div class="item"><b>User checks</b><label><input type="checkbox" data-cl-check="Desktop visual test passed"> Desktop visual test passed</label><label><input type="checkbox" data-cl-check="Mobile visual test passed"> Mobile visual test passed</label><label><input type="checkbox" data-cl-check="No secret value exposed"> No secret value exposed</label><label><input type="checkbox" data-cl-check="User approved exact visible result"> User approved exact visible result</label></div></div>'
    +'<label>Notes<textarea id="clChecklistNotes" class="mid" placeholder="Record what passed, what remains open, and the exact evidence source."></textarea></label>';
  var out=document.createElement('section');
  out.className='panel';
  out.innerHTML=''
    +'<h2>Master Checklist report</h2><textarea id="clChecklistOutput" class="mid" readonly placeholder="The final verification report appears here"></textarea>'
    +'<div class="notice"><p><b>Safety boundary:</b> this page only stores a local verification view and builds text. It cannot change authoritative Code Labs records, write GitHub, prepare Writer, merge, deploy, delete or promote production use.</p></div>';
  main.appendChild(panel);
  main.appendChild(exact);
  main.appendChild(form);
  main.appendChild(out);
  restore();
  q('#clLoadExactChecklist').onclick=loadCanonical;
  q('#clBuildChecklist').onclick=function(){q('#clChecklistOutput').value=report();save()};
  q('#clCopyChecklist').onclick=function(){var text=q('#clChecklistOutput').value||report();q('#clChecklistOutput').value=text;copy(text);save();setStatus('Master Checklist report copied','good')};
  q('#clSaveChecklist').onclick=function(){q('#clChecklistOutput').value=report();save()};
  window.CodeLabsMasterChecklistV2={
    version:VERSION,
    states:STATES.slice(),
    parse:parseChecklistText,
    read:function(){return read()},
    report:report,
    overall:function(){return overall(loadedChecklist&&loadedChecklist.items||[])}
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
})();
