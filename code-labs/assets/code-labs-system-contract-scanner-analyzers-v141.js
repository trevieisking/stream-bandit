(() => {
  'use strict';
  const C = window.CodeLabsSystemContractScannerV141Core;
  if (!C) throw new Error('Code Labs scanner core is missing.');

  function scanEnvironment(files) {
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
        const name=match[1]||match[2];
        rows.push({name,call,file:file.path,line:C.lineOf(file.text,match.index),secret_like:C.SECRET_NAME.test(name),browser_exposure:file.path.startsWith('code-labs/')});
      }
    }
    return C.dedupe(rows, x=>[x.name,x.call,x.file,x.line].join('|'));
  }
  function scanDatabase(files) {
    const rows=[];
    for(const file of files) {
      const channel=file.path.startsWith('code-labs/')?'browser':file.path.startsWith('supabase/functions/')?'edge_function':file.path.endsWith('.sql')?'migration':'repository';
      const add=(target,operation,index,evidence)=>rows.push({target,operation,file:file.path,line:C.lineOf(file.text,index),channel,evidence});
      let match;
      const from=/\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
      while((match=from.exec(file.text))) { const tail=file.text.slice(match.index,match.index+500); const op=(tail.match(/\.(select|insert|update|delete|upsert)\s*\(/)||[])[1]||'unknown'; add(match[1],op,match.index,'supabase.from'); }
      const rpc=/\.rpc\(\s*["'`]([^"'`]+)["'`]/g; while((match=rpc.exec(file.text))) add(match[1],'rpc',match.index,'supabase.rpc');
      const rest=/rest\(\s*["'`]([^"'`?]+)[^"'`]*["'`]/g;
      while((match=rest.exec(file.text))) { const tail=file.text.slice(match.index,match.index+450); const method=(tail.match(/method\s*:\s*["'`](GET|POST|PATCH|PUT|DELETE)/i)||[])[1]||'GET'; add(match[1],method.toLowerCase(),match.index,'rest helper'); }
      const rpcPath=/\/rpc\/([A-Za-z0-9_]+)/g; while((match=rpcPath.exec(file.text))) add(match[1],'rpc',match.index,'REST RPC path');
      if(file.path.endsWith('.sql')) {
        const sql=/(insert\s+into|update|delete\s+from|alter\s+table|drop\s+table|create\s+(?:or\s+replace\s+)?function)\s+(?:if\s+(?:not\s+)?exists\s+)?(?:public\.)?([A-Za-z0-9_]+)/gi;
        while((match=sql.exec(file.text))) add(match[2],match[1].toLowerCase().replace(/\s+/g,'_'),match.index,'SQL');
      }
    }
    return C.dedupe(rows,x=>[x.target,x.operation,x.file,x.line].join('|'));
  }
  function scanRouting(files) {
    const rows=[]; const handlers=[];
    for(const file of files.filter(x=>/\/main\.(?:ts|js)$/.test(x.path))) {
      const imports=new Map(); let match;
      const imp=/import\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g;
      while((match=imp.exec(file.text))) for(const name of match[1].split(',').map(x=>x.trim().split(/\s+as\s+/).pop()).filter(Boolean)) imports.set(name,match[2]);
      const defs=[]; const def=/\{\s*name\s*:\s*["'`]([^"'`]+)["'`][\s\S]{0,900}?annotations\s*:\s*([A-Za-z0-9_]+)/g;
      while((match=def.exec(file.text))) defs.push({tool:match[1],annotation:match[2],file:file.path,line:C.lineOf(file.text,match.index)});
      const calls=new Map(); const call=/if\s*\(\s*name\s*===\s*["'`]([^"'`]+)["'`]\s*\)\s*return\s+([A-Za-z0-9_]+)/g;
      while((match=call.exec(file.text))) { calls.set(match[1],match[2]); handlers.push({tool:match[1],handler:match[2],file:file.path,line:C.lineOf(file.text,match.index)}); }
      for(const definition of defs) { const handler=calls.get(definition.tool)||''; rows.push({...definition,handler,module:handler?(imports.get(handler)||'same file'):'',status:handler?'mapped':'missing_handler'}); }
      for(const [tool,handler] of calls) if(!defs.some(x=>x.tool===tool)) rows.push({tool,annotation:'',file:file.path,line:handlers.find(x=>x.tool===tool&&x.file===file.path)?.line||0,handler,module:imports.get(handler)||'same file',status:'handler_without_definition'});
    }
    return rows;
  }
  function workflowMatrix(pages, databaseRows) {
    return pages.map(page=>{
      const order=C.WORKFLOW_ORDER.indexOf(page.data_page); const next=order>=0?C.WORKFLOW_ORDER[order+1]||'':'unknown';
      const pageWrites=databaseRows.filter(x=>x.channel==='browser'&&(x.file===page.path||page.scripts.includes(x.file))&&!['select','get','unknown'].includes(x.operation));
      const actions=C.uniq(page.references.filter(x=>/writer|workflow|checkpoint|candidate|handoff|history|save/i.test(x)).map(x=>x.split('/').pop()));
      const warnings=[]; if(pageWrites.length) warnings.push('direct_browser_database_mutation'); if(page.local_storage.write.length) warnings.push('browser_state_write'); if(!page.data_page) warnings.push('missing_data_page');
      return {page:page.path,step:page.data_page||'',expected_next:next,links:page.anchors,storage_reads:page.local_storage.read,storage_writes:page.local_storage.write,helper_actions:actions,direct_browser_mutations:pageWrites.map(x=>`${x.operation}:${x.target}`),warnings};
    });
  }
  function sanitiseLive(input) {
    if(!input) return null;
    const out={};
    for(const key of ['repository','ref','commit_sha','supabase_project_ref','captured_at']) if(typeof input[key]==='string'&&!C.CREDENTIAL_VALUE.test(input[key])) out[key]=input[key];
    out.functions=Array.isArray(input.functions)?input.functions.map(f=>({name:String(f.name||''),version:f.version??null,status:String(f.status||''),verify_jwt:typeof f.verify_jwt==='boolean'?f.verify_jwt:null,source_sha:/^[a-f0-9]{40,64}$/i.test(String(f.source_sha||''))?f.source_sha:null})).filter(x=>x.name):[];
    out.smoke_tests=Array.isArray(input.smoke_tests)?input.smoke_tests.map(t=>({name:String(t.name||''),outcome:String(t.outcome||''),timestamp:String(t.timestamp||''),evidence:String(t.evidence||'').slice(0,500)})).filter(x=>x.name):[];
    const rollback=input.rollback||{};
    out.rollback={commit_sha:/^[a-f0-9]{40}$/i.test(String(rollback.commit_sha||''))?rollback.commit_sha:null,notes:String(rollback.notes||'').slice(0,500),function_versions:Array.isArray(rollback.function_versions)?rollback.function_versions.map(x=>({name:String(x.name||''),version:x.version??null})):[]};
    return out;
  }
  function deploymentLedger(files, live, repo, commitSha) {
    const functionNames=C.uniq(files.filter(x=>x.path.startsWith('supabase/functions/')).map(x=>x.path.split('/')[2]));
    const migrations=files.filter(x=>x.path.startsWith('supabase/migrations/')).map(x=>x.path);
    const workflows=files.filter(x=>x.path.startsWith('.github/workflows/')).map(x=>x.path);
    const accepted=sanitiseLive(live);
    const rows=[
      {gate:'repository_commit',status:accepted?.commit_sha===commitSha?'supplied_matches':accepted?.commit_sha?'supplied_mismatch':'not_supplied',evidence:accepted?.commit_sha||commitSha,source:accepted?.commit_sha?'live import + repository scan':'repository scan only'},
      {gate:'edge_function_inventory',status:accepted?.functions?.length?'supplied':'not_supplied',evidence:accepted?.functions||functionNames,source:accepted?.functions?.length?'live import':'repository paths only'},
      {gate:'migration_inventory',status:migrations.length?'static_only':'none_found',evidence:migrations,source:'repository scan'},
      {gate:'workflow_inventory',status:workflows.length?'static_only':'none_found',evidence:workflows,source:'repository scan'},
      {gate:'post_deployment_smoke_tests',status:accepted?.smoke_tests?.length?'supplied':'not_supplied',evidence:accepted?.smoke_tests||[],source:accepted?.smoke_tests?.length?'live import':'none'},
      {gate:'rollback_proof',status:accepted?.rollback&&Object.keys(accepted.rollback).length?'supplied':'not_supplied',evidence:accepted?.rollback||{},source:accepted?.rollback?'live import':'none'}
    ];
    return {rows,live:accepted||null,static:{repo,commit_sha:commitSha,function_names:functionNames,migrations,workflows}};
  }
  function findings(report) {
    const blockers=[],warnings=[];
    for(const x of report.environment_variables) if(x.browser_exposure&&x.secret_like) blockers.push(`Secret-like environment call in browser file: ${x.file}:${x.line} ${x.name}`);
    for(const x of report.database_rpc) if(x.channel==='browser'&&!['select','get','unknown'].includes(x.operation)) blockers.push(`Direct browser mutation: ${x.file}:${x.line} ${x.operation} ${x.target}`);
    for(const x of report.tool_routing) if(x.status!=='mapped') blockers.push(`Tool routing mismatch: ${x.tool} (${x.status}) in ${x.file}`);
    for(const page of report.pages) { if(!page.data_page) warnings.push(`Missing data-page: ${page.path}`); if(page.local_storage.write.length) warnings.push(`Browser state writes on ${page.path}: ${page.local_storage.write.join(', ')}`); }
    for(const row of report.deployment_ledger.rows) if(row.status==='not_supplied') warnings.push(`Live evidence not supplied: ${row.gate}`);
    return {ready:blockers.length===0,blockers:C.uniq(blockers),warnings:C.uniq(warnings),headline:blockers.length?'Scanner found contract blockers.':'No static contract blocker found; live deployment proof may still be required.'};
  }

  window.CodeLabsSystemContractScannerV141Analyzers = Object.freeze({scanEnvironment,scanDatabase,scanRouting,workflowMatrix,sanitiseLive,deploymentLedger,findings});
})();
