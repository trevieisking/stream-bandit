(() => {
  'use strict';
  const C = window.CodeLabsSystemContractScannerV141Core;
  if (!C) throw new Error('Code Labs scanner core is missing.');

  function scanEnvironment(files, roles) {
    const rows=[];
    const patterns=[
      ['Deno.env.get',/Deno\.env\.get\(\s*["'`]([A-Z0-9_]+)["'`]\s*\)/g],
      ['Deno.env.delete',/Deno\.env\.delete\(\s*["'`]([A-Z0-9_]+)["'`]\s*\)/g],
      ['process.env',/process\.env(?:\.([A-Z0-9_]+)|\[\s*["'`]([A-Z0-9_]+)["'`]\s*\])/g],
      ['import.meta.env',/import\.meta\.env\.([A-Z0-9_]+)/g],
      ['Bun.env',/Bun\.env\.([A-Z0-9_]+)/g]
    ];
    for(const file of files) for(const [call,regex] of patterns) {
      regex.lastIndex=0; let match;
      while((match=regex.exec(file.text))) {
        const name=match[1]||match[2], runtime=roles.get(file.path)||{};
        rows.push({name,call,file:file.path,line:C.lineOf(file.text,match.index),secret_like:C.SECRET_NAME.test(name),browser_exposure:file.path.startsWith('code-labs/'),source_kind:C.sourceKind(file.path),runtime_role:runtime.role||'unclassified',confidence:'confirmed_text_match'});
      }
    }
    return C.dedupe(rows,x=>[x.name,x.call,x.file,x.line].join('|'));
  }

  function computedMethodNames(text) {
    const constants=C.constantStrings(text), names=new Map();
    for(const [name,value] of constants) if(['select','insert','update','delete','upsert'].includes(value)) names.set(name,value);
    return names;
  }
  function scanDatabase(files, roles) {
    const rows=[];
    for(const file of files) {
      const channel=file.path.startsWith('code-labs/')?'browser':file.path.startsWith('supabase/functions/')?'edge_function':file.path.endsWith('.sql')?'migration':'repository';
      const source_kind=C.sourceKind(file.path), runtime=roles.get(file.path)||{};
      const add=(target,operation,index,evidence,confidence='confirmed_text_match')=>rows.push({target,operation,file:file.path,line:C.lineOf(file.text,index),channel,evidence,source_kind,runtime_role:runtime.role||'unclassified',confidence});
      const methods=computedMethodNames(file.text); let match;
      const from=/\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
      while((match=from.exec(file.text))) {
        const tail=file.text.slice(match.index,match.index+1000);
        let op=(tail.match(/\.(select|insert|update|delete|upsert)\s*\(/)||[])[1]||'';
        if(!op) {
          const computed=tail.match(/\[\s*([A-Za-z_$][\w$]*)\s*\]\s*\(/);
          if(computed&&methods.has(computed[1])) op=methods.get(computed[1]);
        }
        add(match[1],op||'unknown',match.index,op?'supabase.from executable call':'supabase.from target only',op?'confirmed_executable_pattern':'needs_source_review');
      }
      const rpc=/\.rpc\(\s*["'`]([^"'`]+)["'`]/g; while((match=rpc.exec(file.text))) add(match[1],'rpc',match.index,'supabase.rpc');
      const rest=/rest\(\s*["'`]([^"'`?]+)[^"'`]*["'`]/g;
      while((match=rest.exec(file.text))) { const tail=file.text.slice(match.index,match.index+500); const method=(tail.match(/method\s*:\s*["'`](GET|POST|PATCH|PUT|DELETE)/i)||[])[1]||'GET'; add(match[1],method.toLowerCase(),match.index,'rest helper'); }
      const rpcPath=/\/rpc\/([A-Za-z0-9_]+)/g; while((match=rpcPath.exec(file.text))) add(match[1],'rpc',match.index,'REST RPC path');
      if(file.path.endsWith('.sql')) {
        const sql=/(insert\s+into|update|delete\s+from|alter\s+table|drop\s+table|create\s+(?:or\s+replace\s+)?function)\s+(?:if\s+(?:not\s+)?exists\s+)?(?:public\.)?([A-Za-z0-9_]+)/gi;
        while((match=sql.exec(file.text))) add(match[2],match[1].toLowerCase().replace(/\s+/g,'_'),match.index,'SQL');
      }
    }
    return C.dedupe(rows,x=>[x.target,x.operation,x.file,x.line].join('|'));
  }

  function scanRouting(files) {
    const rows=[];
    for(const file of files.filter(x=>/\/main\.(?:ts|js)$/.test(x.path))) {
      const imports=new Map(); let match;
      const imp=/import\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g;
      while((match=imp.exec(file.text))) for(const item of match[1].split(',').map(x=>x.trim()).filter(Boolean)) { const parts=item.split(/\s+as\s+/); imports.set(parts[1]||parts[0],match[2]); }
      const defs=[]; const def=/\{\s*name\s*:\s*["'`]([^"'`]+)["'`][\s\S]{0,900}?annotations\s*:\s*([A-Za-z0-9_]+)/g;
      while((match=def.exec(file.text))) defs.push({tool:match[1],annotation:match[2],file:file.path,line:C.lineOf(file.text,match.index)});
      const calls=new Map();
      file.text.split('\n').forEach((line,index)=>{
        const m=line.match(/if\s*\(\s*name\s*===\s*["'`]([^"'`]+)["'`]\s*\)\s*return\s+(.+?);?\s*$/); if(!m)return;
        const expression=m[2],handlers=[];
        for(const h of expression.matchAll(/(?:\?|:|^|\s)([A-Za-z_$][\w$]*)\s*\(/g)) if(!['String','Boolean','Number','JSON'].includes(h[1])) handlers.push(h[1]);
        if(!handlers.length) { const direct=expression.match(/^([A-Za-z_$][\w$]*)\s*\(/); if(direct)handlers.push(direct[1]); }
        calls.set(m[1],{handlers:C.uniq(handlers),line:index+1,expression});
      });
      for(const definition of defs) { const call=calls.get(definition.tool),handlers=call?.handlers||[]; rows.push({...definition,handler:handlers.join(' | '),module:handlers.map(h=>imports.get(h)||'same file'),status:handlers.length?'mapped':'missing_handler',routing_expression:call?.expression||''}); }
      for(const [tool,call] of calls) if(!defs.some(x=>x.tool===tool)) rows.push({tool,annotation:'',file:file.path,line:call.line,handler:call.handlers.join(' | '),module:call.handlers.map(h=>imports.get(h)||'same file'),status:'handler_without_definition',routing_expression:call.expression});
    }
    return rows;
  }

  function dependencyManifest(files, pages, roles, knownPaths) {
    const reverse=new Map();
    for(const file of files) for(const ref of C.references(file.text,file.path,knownPaths)) {
      if(!reverse.has(ref.path)) reverse.set(ref.path,[]); reverse.get(ref.path).push({from:file.path,resolved:ref.resolved,raw:ref.raw});
    }
    return files.filter(x=>x.path.startsWith('code-labs/')).map(file=>{
      const refs=C.references(file.text,file.path,knownPaths),runtime=roles.get(file.path)||{};
      return {path:file.path,type:/\.html?$/.test(file.path)?'page':/\.js$/.test(file.path)?'helper':/\.css$/.test(file.path)?'style':'asset',runtime_role:runtime.role||'unclassified',direct_pages:runtime.direct_pages||[],transitive_pages:runtime.transitive_pages||[],references:refs.map(x=>x.path),unresolved_references:refs.filter(x=>!x.resolved).map(x=>`${x.raw} -> ${x.path}`),loaded_by:C.uniq((reverse.get(file.path)||[]).map(x=>x.from)),storage_writes:C.storage(file.text,'setItem').map(key=>`${key}:${C.storageAuthority(key)}`)};
    });
  }

  function workflowMatrix(pages, databaseRows) {
    return pages.map(page=>{
      const order=C.WORKFLOW_ORDER.indexOf(page.data_page),next=order>=0?C.WORKFLOW_ORDER[order+1]||'':'unknown';
      const loaded=new Set([page.path,...page.scripts,...page.transitive_scripts]);
      const mutations=databaseRows.filter(x=>x.channel==='browser'&&['active_page','active_direct_helper','active_transitive_helper'].includes(x.runtime_role)&&loaded.has(x.file)&&['insert','update','delete','upsert','rpc','post','patch','put'].includes(x.operation));
      const fields={}; for(const row of page.workflow_state_fields||[]) { if(!fields[row.group])fields[row.group]=[]; fields[row.group].push(`${row.field}:${row.access}`); }
      const warnings=[];
      if(mutations.length)warnings.push('confirmed_active_browser_database_mutation');
      if((fields.authoritative_identity||[]).length)warnings.push('browser_authoritative_identity_fields_need_reconciliation');
      if((fields.authoritative_workflow||[]).length)warnings.push('browser_authoritative_workflow_fields_need_reconciliation');
      for(const authority of page.local_storage_authority) if(authority.endsWith(':security_sensitive'))warnings.push(`security_sensitive_browser_state:${authority.split(':')[0]}`); else if(authority.endsWith(':dynamic_needs_source_review'))warnings.push(`dynamic_browser_state_needs_source_review:${authority.split(':')[0]}`);
      if(!page.data_page)warnings.push('missing_data_page_review_only');
      return {page:page.path,step:page.data_page||'',expected_next:next,direct_scripts:page.scripts,transitive_scripts:page.transitive_scripts,storage_writes:page.local_storage.write,storage_authority:page.local_storage_authority,workflow_state_fields:fields,direct_browser_mutations:mutations.map(x=>`${x.operation}:${x.target}:${x.file}`),warnings};
    });
  }

  function sanitiseLive(input) {
    if(!input)return null; const out={};
    for(const key of ['repository','ref','commit_sha','supabase_project_ref','captured_at']) if(typeof input[key]==='string'&&!C.CREDENTIAL_VALUE.test(input[key]))out[key]=input[key];
    out.functions=Array.isArray(input.functions)?input.functions.map(f=>({name:String(f.name||''),version:f.version??null,status:String(f.status||''),verify_jwt:typeof f.verify_jwt==='boolean'?f.verify_jwt:null,source_sha:/^[a-f0-9]{40,64}$/i.test(String(f.source_sha||''))?f.source_sha:null})).filter(x=>x.name):[];
    out.smoke_tests=Array.isArray(input.smoke_tests)?input.smoke_tests.map(t=>({name:String(t.name||''),outcome:String(t.outcome||''),timestamp:String(t.timestamp||''),evidence:String(t.evidence||'').slice(0,500)})).filter(x=>x.name&&!C.CREDENTIAL_VALUE.test(x.evidence)):[];
    const rollback=input.rollback||{}; out.rollback={commit_sha:/^[a-f0-9]{40}$/i.test(String(rollback.commit_sha||''))?rollback.commit_sha:null,notes:C.CREDENTIAL_VALUE.test(String(rollback.notes||''))?'[redacted credential-shaped input]':String(rollback.notes||'').slice(0,500),function_versions:Array.isArray(rollback.function_versions)?rollback.function_versions.map(x=>({name:String(x.name||''),version:x.version??null})):[]};
    return out;
  }
  function deploymentLedger(files,live,repo,commitSha) {
    const functionNames=C.uniq(files.filter(x=>x.path.startsWith('supabase/functions/')).map(x=>x.path.split('/')[2]));
    const migrations=files.filter(x=>x.path.startsWith('supabase/migrations/')).map(x=>x.path),workflows=files.filter(x=>x.path.startsWith('.github/workflows/')).map(x=>x.path),accepted=sanitiseLive(live);
    return {rows:[
      {gate:'repository_commit',status:accepted?.commit_sha===commitSha?'supplied_matches':accepted?.commit_sha?'supplied_mismatch':'not_supplied',evidence:accepted?.commit_sha||commitSha,source:accepted?.commit_sha?'live import + repository scan':'repository scan only'},
      {gate:'edge_function_inventory',status:accepted?.functions?.length?'supplied':'not_supplied',evidence:accepted?.functions||functionNames,source:accepted?.functions?.length?'live import':'repository paths only'},
      {gate:'migration_inventory',status:migrations.length?'static_only':'none_found',evidence:migrations,source:'repository scan'},
      {gate:'workflow_inventory',status:workflows.length?'static_only':'none_found',evidence:workflows,source:'repository scan'},
      {gate:'post_deployment_smoke_tests',status:accepted?.smoke_tests?.length?'supplied':'not_supplied',evidence:accepted?.smoke_tests||[],source:accepted?.smoke_tests?.length?'live import':'none'},
      {gate:'rollback_proof',status:accepted?.rollback?.commit_sha||accepted?.rollback?.function_versions?.length?'supplied':'not_supplied',evidence:accepted?.rollback||{},source:accepted?.rollback?'live import':'none'}
    ],live:accepted||null,static:{repo,commit_sha:commitSha,function_names:functionNames,migrations,workflows}};
  }

  function findings(report) {
    const triage={confirmed_runtime_blocker:[],workflow_authority_risk:[],scanner_defect:[],source_inspection:[],review_only:[],missing_live_proof:[],preserved_working_function:[]};
    for(const x of report.environment_variables) {
      if(x.browser_exposure&&x.secret_like&&['active_page','active_direct_helper','active_transitive_helper'].includes(x.runtime_role)) triage.confirmed_runtime_blocker.push(`Secret-like environment call in active browser runtime: ${x.file}:${x.line} ${x.name}`);
      else if(x.secret_like)triage.source_inspection.push(`Secret reference requires context: ${x.file}:${x.line} ${x.name} (${x.runtime_role})`);
    }
    for(const x of report.database_rpc) {
      if(x.channel==='browser'&&['active_page','active_direct_helper','active_transitive_helper'].includes(x.runtime_role)&&['insert','update','delete','upsert','rpc','post','patch','put'].includes(x.operation))triage.confirmed_runtime_blocker.push(`Active browser mutation: ${x.file}:${x.line} ${x.operation} ${x.target}`);
      else if(x.channel==='browser'&&x.operation==='unknown')triage.source_inspection.push(`Browser database target needs method review: ${x.file}:${x.line} ${x.target}`);
    }
    for(const x of report.tool_routing) if(x.status!=='mapped')triage.confirmed_runtime_blocker.push(`Tool routing mismatch: ${x.tool} (${x.status}) in ${x.file}`);
    for(const dep of report.dependencies) {
      for(const unresolved of dep.unresolved_references||[])triage.scanner_defect.push(`Unresolved path evidence: ${dep.path}: ${unresolved}`);
      if(dep.runtime_role==='unreached_needs_review'&&dep.type==='helper')triage.source_inspection.push(`Helper exists but current runtime reachability is unproved: ${dep.path}`);
      if(['documentation_only','test_or_fixture','retired_marker'].includes(dep.runtime_role))triage.review_only.push(`${dep.runtime_role}: ${dep.path}`);
    }
    for(const page of report.cross_page_workflow) {
      const identity=page.workflow_state_fields.authoritative_identity||[],workflow=page.workflow_state_fields.authoritative_workflow||[],source=page.workflow_state_fields.source_cache||[],draft=page.workflow_state_fields.preserved_draft||[];
      if(identity.length)triage.workflow_authority_risk.push(`${page.page}: browser identity fields ${C.uniq(identity).join(', ')}`);
      if(workflow.length)triage.workflow_authority_risk.push(`${page.page}: browser workflow fields ${C.uniq(workflow).join(', ')}`);
      if(source.length)triage.workflow_authority_risk.push(`${page.page}: source cache must reconcile backend-wins ${C.uniq(source).join(', ')}`);
      if(draft.length)triage.preserved_working_function.push(`${page.page}: preserved draft/backup fields ${C.uniq(draft).join(', ')}`);
      for(const authority of page.storage_authority) {
        if(authority.endsWith(':preserved_local_utility')||authority.endsWith(':preserved_local_draft_or_backup'))triage.preserved_working_function.push(`${page.page}: ${authority}`);
        else if(authority.endsWith(':dynamic_needs_source_review')||authority.endsWith(':local_unknown_review'))triage.source_inspection.push(`${page.page}: ${authority}`);
        else if(authority.endsWith(':security_sensitive'))triage.confirmed_runtime_blocker.push(`${page.page}: ${authority}`);
      }
      if(page.warnings.includes('missing_data_page_review_only'))triage.review_only.push(`Missing data-page requires page-specific review: ${page.page}`);
    }
    for(const row of report.deployment_ledger.rows) if(row.status==='not_supplied')triage.missing_live_proof.push(`${row.gate}: not supplied`);
    for(const key of Object.keys(triage))triage[key]=C.uniq(triage[key]);
    const blockers=triage.confirmed_runtime_blocker;
    return {ready:blockers.length===0,triage,confirmed_blockers:blockers,suspected:C.uniq([...triage.workflow_authority_risk,...triage.source_inspection]),warnings:C.uniq([...triage.review_only,...triage.missing_live_proof,...triage.scanner_defect]),preserved_functions:triage.preserved_working_function,blockers,headline:blockers.length?'Confirmed active-runtime blockers found.':triage.workflow_authority_risk.length?'No active-runtime blocker, but workflow-authority reconciliation is still required.':'No confirmed static blocker found; live proof may still be required.'};
  }

  window.CodeLabsSystemContractScannerV141Analyzers = Object.freeze({scanEnvironment,scanDatabase,scanRouting,dependencyManifest,workflowMatrix,sanitiseLive,deploymentLedger,findings});
})();
