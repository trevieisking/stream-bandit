(() => {
  'use strict';
  const C=window.CodeLabsSystemContractScannerV141Core,A=window.CodeLabsSystemContractScannerV141Analyzers;
  if(!C||!A)throw new Error('Code Labs scanner modules are missing.');

  function groupHtml(label,items,kind,open=false){return `<details ${open?'open':''}><summary>${C.esc(label)} (${items.length})</summary>${items.map(x=>`<div class="${kind}">${C.esc(x)}</div>`).join('')||'<div class="good">None.</div>'}</details>`;}
  function render(report){
    const t=report.findings.triage;
    const counts=[['Files scanned',report.files_scanned],['Pages',report.pages.length],['Dependencies',report.dependencies.length],['DB/RPC entries',report.database_rpc.length],['Tool routes',report.tool_routing.length],['Runtime blockers',t.confirmed_runtime_blocker.length],['Workflow risks',t.workflow_authority_risk.length],['Scanner defects',t.scanner_defect.length],['Source review',t.source_inspection.length],['Preserved',t.preserved_working_function.length]];
    C.$('summary').innerHTML=counts.map(([l,v])=>`<div class="card"><strong>${C.esc(v)}</strong>${C.esc(l)}</div>`).join('');
    C.$('findings').innerHTML=`<h3 class="${report.findings.ready?'good':'bad'}">${C.esc(report.findings.headline)}</h3>`+
      groupHtml('Confirmed active-runtime blockers',t.confirmed_runtime_blocker,'bad',true)+
      groupHtml('Workflow-authority risks',t.workflow_authority_risk,'warn',true)+
      groupHtml('Scanner defects',t.scanner_defect,'warn')+
      groupHtml('Requires source inspection',t.source_inspection,'warn')+
      groupHtml('Review-only',t.review_only,'warn')+
      groupHtml('Missing live proof',t.missing_live_proof,'warn')+
      groupHtml('Preserved working functions',t.preserved_working_function,'good',true);
    C.$('dependency').innerHTML=C.table(['Path','Type','Runtime role','Direct pages','Transitive pages','References','Unresolved','Storage writes'],report.dependencies.map(x=>[x.path,x.type,x.runtime_role,x.direct_pages,x.transitive_pages,x.references,x.unresolved_references,x.storage_writes]));
    C.$('environment').innerHTML=C.table(['Variable','Call','File','Line','Runtime role','Secret-like','Browser','Confidence'],report.environment_variables.map(x=>[x.name,x.call,x.file,x.line,x.runtime_role,x.secret_like,x.browser_exposure,x.confidence]));
    C.$('database').innerHTML=C.table(['Target','Operation','Channel','Runtime role','File','Line','Evidence','Confidence'],report.database_rpc.map(x=>[x.target,x.operation,x.channel,x.runtime_role,x.file,x.line,x.evidence,x.confidence]));
    C.$('routing').innerHTML=C.table(['Tool','Annotation','Handler','Module','File','Line','Status','Expression'],report.tool_routing.map(x=>[x.tool,x.annotation,x.handler,x.module,x.file,x.line,x.status,x.routing_expression]));
    C.$('authentication').innerHTML=C.table(['Page','data-page','Classification','Evidence','Keyword evidence','Confidence','Live HTTP'],report.pages.map(x=>[x.path,x.data_page,x.auth.classification,x.auth.evidence,x.auth.keyword_evidence,x.auth.confidence,x.live_http?`${x.live_http.status} ${x.live_http.ok?'OK':'FAIL'}`:'not imported']));
    C.$('workflow').innerHTML=C.table(['Page','Step','Expected next','Direct helpers','Transitive helpers','Storage authority','State fields','Direct mutations','Warnings'],report.cross_page_workflow.map(x=>[x.page,x.step,x.expected_next,x.direct_scripts,x.transitive_scripts,x.storage_authority,JSON.stringify(x.workflow_state_fields),x.direct_browser_mutations,x.warnings]));
    C.$('deployment').innerHTML=C.table(['Gate','Status','Evidence','Source'],report.deployment_ledger.rows.map(x=>[x.gate,x.status,typeof x.evidence==='string'?x.evidence:JSON.stringify(x.evidence),x.source]));
    C.$('reportJson').value=JSON.stringify(report,null,2);C.$('download').disabled=false;C.$('copy').disabled=false;
  }
  async function scanLivePages(pages,siteBase){if(!siteBase)return;let base;try{base=new URL(siteBase);}catch{throw new Error('Deployed Code Labs base URL is invalid.');}const results=await C.pool(pages,async page=>{const url=new URL(page.path,base).toString();const response=await fetch(url,{method:'GET',cache:'no-store'});return{path:page.path,ok:response.ok,status:response.status,url};},4);const map=new Map(results.filter(x=>x&&!x.error).map(x=>[x.path,x]));for(const page of pages)if(map.has(page.path))page.live_http=map.get(page.path);}
  async function run(){C.$('run').disabled=true;C.setStatus('Resolving exact repository commit...','warn');try{
    const repo=C.$('repo').value.trim(),ref=C.$('ref').value.trim();if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))throw new Error('Repository must be owner/name.');if(!ref)throw new Error('Ref is required.');
    const importedV140=C.safeJson(C.$('v140').value),live=C.safeJson(C.$('live').value),resolved=await C.resolveRepository(repo,ref);
    const entries=resolved.entries.filter(x=>x.type==='blob'&&x.size<=750000&&C.TEXT_EXT.test(x.path)&&C.RELEVANT.test(x.path));
    C.setStatus(`Reading ${entries.length} relevant files at ${resolved.commitSha.slice(0,12)}...`,'warn');
    const fetched=await C.pool(entries,async entry=>({path:entry.path,text:await C.fetchText(repo,resolved.commitSha,entry.path),size:entry.size}));
    const files=fetched.filter(x=>x&&!x.error),failures=fetched.filter(x=>x?.error),fileMap=new Map(files.map(x=>[x.path,x.text])),knownPaths=new Set(files.map(x=>x.path));
    const pages=files.filter(x=>x.path.startsWith('code-labs/')&&/\.html?$/.test(x.path)).map(x=>C.pageRecord(x.path,x.text,fileMap,importedV140,knownPaths));
    await scanLivePages(pages,C.$('siteBase').value.trim());
    const roles=C.runtimeRoles(files,pages),dependencies=A.dependencyManifest(files,pages,roles,knownPaths),environment=A.scanEnvironment(files,roles),database=A.scanDatabase(files,roles),routing=A.scanRouting(files);
    const report={version:C.VERSION,generated_at:new Date().toISOString(),read_only:true,repository:repo,requested_ref:ref,resolved_commit_sha:resolved.commitSha,resolved_tree_sha:resolved.treeSha,files_scanned:files.length,fetch_failures:failures,pages,dependencies,environment_variables:environment,database_rpc:database,tool_routing:routing,cross_page_workflow:A.workflowMatrix(pages,database),deployment_ledger:A.deploymentLedger(files,live,repo,resolved.commitSha),evidence_boundaries:{static_repository:true,imported_v140:Boolean(importedV140),live_deployment_metadata:Boolean(live),secret_values_collected:false,database_writes:false,github_writes:false,local_storage_writes:false,missing_live_evidence_is_not_failure:true}};
    report.findings=A.findings(report);render(report);C.setStatus(`Scan complete at ${resolved.commitSha}. ${report.findings.triage.confirmed_runtime_blocker.length} runtime blocker(s), ${report.findings.triage.workflow_authority_risk.length} workflow risk(s), ${report.findings.triage.scanner_defect.length} scanner defect(s).`,report.findings.triage.confirmed_runtime_blocker.length?'bad':report.findings.triage.workflow_authority_risk.length?'warn':'good');
  }catch(error){C.setStatus(error instanceof Error?error.message:String(error),'bad');}finally{C.$('run').disabled=false;}}
  C.$('run').addEventListener('click',run);C.$('copy').addEventListener('click',async()=>{await navigator.clipboard.writeText(C.$('reportJson').value);C.setStatus('Report copied.','good');});C.$('download').addEventListener('click',()=>{const blob=new Blob([C.$('reportJson').value],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`code-labs-system-contract-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);});
  window.CodeLabsSystemContractScannerV141=Object.freeze({version:C.VERSION,run});
})();
