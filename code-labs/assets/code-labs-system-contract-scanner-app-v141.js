(() => {
  'use strict';
  const C=window.CodeLabsSystemContractScannerV141Core;
  const A=window.CodeLabsSystemContractScannerV141Analyzers;
  if(!C||!A) throw new Error('Code Labs scanner modules are missing.');

  function render(report) {
    const counts=[
      ['Files scanned',report.files_scanned],['Pages',report.pages.length],['Dependencies',report.dependencies.length],
      ['Environment calls',report.environment_variables.length],['DB/RPC entries',report.database_rpc.length],['Tool routes',report.tool_routing.length],
      ['Confirmed blockers',report.findings.confirmed_blockers.length],['Suspected',report.findings.suspected.length],
      ['Preserved functions',report.findings.preserved_functions.length],['Warnings',report.findings.warnings.length]
    ];
    C.$('summary').innerHTML=counts.map(([label,value])=>`<div class="card"><strong>${C.esc(value)}</strong>${C.esc(label)}</div>`).join('');
    C.$('findings').innerHTML=`<h3 class="${report.findings.ready?'good':'bad'}">${C.esc(report.findings.headline)}</h3>
      <details open><summary>Confirmed blockers (${report.findings.confirmed_blockers.length})</summary>${report.findings.confirmed_blockers.map(x=>`<div class="bad">${C.esc(x)}</div>`).join('')||'<div class="good">None found by confirmed static rules.</div>'}</details>
      <details open><summary>Preserved working functions (${report.findings.preserved_functions.length})</summary>${report.findings.preserved_functions.map(x=>`<div class="good">${C.esc(x)}</div>`).join('')||'<div class="warn">None classified yet.</div>'}</details>
      <details><summary>Suspected / needs review (${report.findings.suspected.length})</summary>${report.findings.suspected.map(x=>`<div class="warn">${C.esc(x)}</div>`).join('')||'<div class="good">None.</div>'}</details>
      <details><summary>Warnings and missing live proof (${report.findings.warnings.length})</summary>${report.findings.warnings.map(x=>`<div class="warn">${C.esc(x)}</div>`).join('')||'<div class="good">None.</div>'}</details>`;
    C.$('dependency').innerHTML=C.table(['Page / asset','Type','Loads / references','Loaded by','Storage writes'],report.dependencies.map(x=>[x.path,x.type,x.references,x.loaded_by,x.storage_writes]));
    C.$('environment').innerHTML=C.table(['Variable','Call','File','Line','Source kind','Secret-like','Browser exposure','Confidence'],report.environment_variables.map(x=>[x.name,x.call,x.file,x.line,x.source_kind,x.secret_like,x.browser_exposure,x.confidence]));
    C.$('database').innerHTML=C.table(['Target','Operation','Channel','Source kind','File','Line','Evidence','Confidence'],report.database_rpc.map(x=>[x.target,x.operation,x.channel,x.source_kind,x.file,x.line,x.evidence,x.confidence]));
    C.$('routing').innerHTML=C.table(['Tool','Annotation','Handler','Module','File','Line','Status','Expression'],report.tool_routing.map(x=>[x.tool,x.annotation,x.handler,x.module,x.file,x.line,x.status,x.routing_expression]));
    C.$('authentication').innerHTML=C.table(['Page','data-page','Classification','Confirmed evidence','Keyword evidence','Confidence','Live HTTP'],report.pages.map(x=>[x.path,x.data_page,x.auth.classification,x.auth.evidence,x.auth.keyword_evidence,x.auth.confidence,x.live_http?`${x.live_http.status} ${x.live_http.ok?'OK':'FAIL'}`:'not imported']));
    C.$('workflow').innerHTML=C.table(['Page','Step','Expected next','Direct helpers','Transitive helpers','Storage writes','Storage authority','Direct mutations','Warnings'],report.cross_page_workflow.map(x=>[x.page,x.step,x.expected_next,x.direct_scripts,x.transitive_scripts,x.storage_writes,x.storage_authority,x.direct_browser_mutations,x.warnings]));
    C.$('deployment').innerHTML=C.table(['Gate','Status','Evidence','Source'],report.deployment_ledger.rows.map(x=>[x.gate,x.status,typeof x.evidence==='string'?x.evidence:JSON.stringify(x.evidence),x.source]));
    C.$('reportJson').value=JSON.stringify(report,null,2); C.$('download').disabled=false; C.$('copy').disabled=false;
  }

  async function scanLivePages(pages, siteBase) {
    if(!siteBase) return;
    let base; try { base=new URL(siteBase); } catch { throw new Error('Deployed Code Labs base URL is invalid.'); }
    const results=await C.pool(pages,async page=>{const url=new URL(page.path,base).toString();const response=await fetch(url,{method:'GET',cache:'no-store'});return {path:page.path,ok:response.ok,status:response.status,url};},4);
    const map=new Map(results.filter(x=>x&&!x.error).map(x=>[x.path,x]));
    for(const page of pages) if(map.has(page.path)) page.live_http=map.get(page.path);
  }

  async function run() {
    C.$('run').disabled=true; C.setStatus('Resolving exact repository commit…','warn');
    try {
      const repo=C.$('repo').value.trim(), ref=C.$('ref').value.trim();
      if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) throw new Error('Repository must be owner/name.');
      if(!ref) throw new Error('Ref is required.');
      const importedV140=C.safeJson(C.$('v140').value), live=C.safeJson(C.$('live').value);
      const resolved=await C.resolveRepository(repo,ref);
      const entries=resolved.entries.filter(x=>x.type==='blob'&&x.size<=750000&&C.TEXT_EXT.test(x.path)&&C.RELEVANT.test(x.path));
      C.setStatus(`Reading ${entries.length} relevant repository files at ${resolved.commitSha.slice(0,12)}…`,'warn');
      const fetched=await C.pool(entries,async entry=>({path:entry.path,text:await C.fetchText(repo,resolved.commitSha,entry.path),size:entry.size}));
      const files=fetched.filter(x=>x&&!x.error), failures=fetched.filter(x=>x?.error);
      if(failures.length) {
        const paths=failures.slice(0,5).map((x,index)=>x?.path||entries[fetched.indexOf(x)]?.path||`source-${index+1}`);
        throw new Error(`Repository scan is incomplete: ${failures.length} relevant source file(s) could not be read${paths.length?` (${paths.join(', ')}${failures.length>paths.length?', …':''})`:''}. No readiness result was produced.`);
      }
      const fileMap=new Map(files.map(x=>[x.path,x.text]));
      const pages=files.filter(x=>x.path.startsWith('code-labs/')&&/\.html?$/.test(x.path)).map(x=>C.pageRecord(x.path,x.text,fileMap,importedV140));
      await scanLivePages(pages,C.$('siteBase').value.trim());
      const reverseReferences=new Map();
      for(const file of files) for(const reference of C.references(file.text,file.path)) { if(!reverseReferences.has(reference))reverseReferences.set(reference,[]); reverseReferences.get(reference).push(file.path); }
      const dependencies=files.filter(x=>x.path.startsWith('code-labs/')).map(file=>({
        path:file.path,
        type:/\.html?$/.test(file.path)?'page':/\.js$/.test(file.path)?'helper':/\.css$/.test(file.path)?'style':'asset',
        references:C.references(file.text,file.path),
        loaded_by:C.uniq(reverseReferences.get(file.path)||[]),
        storage_writes:C.storage(file.text,'setItem').map(key=>`${key}:${C.storageAuthority(key)}`)
      }));
      const environment=A.scanEnvironment(files), database=A.scanDatabase(files), routing=A.scanRouting(files);
      const report={
        version:C.VERSION,generated_at:new Date().toISOString(),read_only:true,repository:repo,requested_ref:ref,
        resolved_commit_sha:resolved.commitSha,resolved_tree_sha:resolved.treeSha,files_scanned:files.length,fetch_failures:failures,pages,dependencies,
        environment_variables:environment,database_rpc:database,tool_routing:routing,cross_page_workflow:A.workflowMatrix(pages,database),
        deployment_ledger:A.deploymentLedger(files,live,repo,resolved.commitSha),
        evidence_boundaries:{static_repository:true,imported_v140:Boolean(importedV140),live_deployment_metadata:Boolean(live),secret_values_collected:false,database_writes:false,github_writes:false,local_storage_writes:false}
      };
      report.findings=A.findings(report); render(report);
      C.setStatus(`Scan complete at exact commit ${resolved.commitSha}. ${report.findings.confirmed_blockers.length} confirmed blocker(s), ${report.findings.suspected.length} suspected finding(s), ${report.findings.preserved_functions.length} preserved function(s).`,report.findings.confirmed_blockers.length?'bad':report.findings.suspected.length?'warn':'good');
    } catch(error) { C.setStatus(error instanceof Error?error.message:String(error),'bad'); }
    finally { C.$('run').disabled=false; }
  }

  C.$('run').addEventListener('click',run);
  C.$('copy').addEventListener('click',async()=>{await navigator.clipboard.writeText(C.$('reportJson').value); C.setStatus('Report copied.','good');});
  C.$('download').addEventListener('click',()=>{const blob=new Blob([C.$('reportJson').value],{type:'application/json'});const anchor=document.createElement('a');anchor.href=URL.createObjectURL(blob);anchor.download=`code-labs-system-contract-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;anchor.click();setTimeout(()=>URL.revokeObjectURL(anchor.href),1000);});

  window.CodeLabsSystemContractScannerV141 = Object.freeze({version:C.VERSION,run});
})();
