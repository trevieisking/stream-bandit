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
        rows.push({name,call,file:file.path,line:C.lineOf(file.text,match.index),secret_like:C.SECRET_NAME.test(name),browser_exposure:file.path.startsWith('code-labs/'),source_kind:C.sourceKind(file.path),confidence:'confirmed_text_match'});
      }
    }
    return C.dedupe(rows, x=>[x.name,x.call,x.file,x.line].join('|'));
  }

  function computedMethodNames(text) {
    const constants=C.constantStrings(text), names=new Map();
    for(const [name,value] of constants) if(['select','insert','update','delete','upsert'].includes(value)) names.set(name,value);
    return names;
  }

  function scanDatabase(files) {
    const rows=[];
    for(const file of files) {
      const channel=file.path.startsWith('code-labs/')?'browser':file.path.startsWith('supabase/functions/')?'edge_function':file.path.endsWith('.sql')?'migration':'repository';
      const source_kind=C.sourceKind(file.path);
      const add=(target,operation,index,evidence,confidence='confirmed_text_match')=>rows.push({target,operation,file:file.path,line:C.lineOf(file.text,index),channel,evidence,source_kind,confidence});
      const methods=computedMethodNames(file.text); let match;
      const from=/\.from\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
      while((match=from.exec(file.text))) {
        const tail=file.text.slice(match.index,match.index+900);
        let op=(tail.match(/\.(select|insert|update|delete|upsert)\s*\(/)||[])[1]||'';
        if(!op) {
          const computed=tail.match(/\[\s*([A-Za-z_$][\w$]*)\s*\]\s*\(/);
          if(computed&&methods.has(computed[1])) op=methods.get(computed[1]);
        }
        add(match[1],op||'unknown',match.index,op?'supabase.from executable call':'supabase.from target only',op?'confirmed_executable_pattern':'needs_review');
      }
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
    const rows=[];
    for(const file of files.filter(x=>/\/main\.(?:ts|js)$/.test(x.path))) {
      const imports=new Map(); let match;
      const imp=/import\s*\{([^}]+)\}\s*from\s*["'`]([^"'`]+)["'`]/g;
      while((match=imp.exec(file.text))) for(const item of match[1].split(',').map(x=>x.trim()).filter(Boolean)) {
        const parts=item.split(/\s+as\s+/); imports.set(parts[1]||parts[0],match[2]);
      }
      const defs=[]; const def=/\{\s*name\s*:\s*["'`]([^"'`]+)["'`][\s\S]{0,900}?annotations\s*:\s*([A-Za-z0-9_]+)/g;
      while((match=def.exec(file.text))) defs.push({tool:match[1],annotation:match[2],file:file.path,line:C.lineOf(file.text,match.index)});
      const calls=new Map();
      const lines=file.text.split('\n');
      lines.forEach((line,index)=>{
        const m=line.match(/if\s*\(\s*name\s*===\s*["'`]([^"'`]+)["'`]\s*\)\s*return\s+(.+?);?\s*$/);
        if(!m) return;
        const expression=m[2];
        const handlers=[];
        for(const h of expression.matchAll(/(?:\?|:|^|\s)([A-Za-z_$][\w$]*)\s*\(/g)) if(!['String','Boolean','Number','JSON'].includes(h[1])) handlers.push(h[1]);
        if(!handlers.length) {
          const direct=expression.match(/^([A-Za-z_$][\w$]*)\s*\(/); if(direct) handlers.push(direct[1]);
        }
        calls.set(m[1],{handlers:C.uniq(handlers),line:index+1,expression});
      });
      for(const definition of defs) {
        const call=calls.get(definition.tool); const handlers=call?.handlers||[];
        rows.push({...definition,handler:handlers.join(' | '),module:handlers.map(h=>imports.get(h)||'same file'),status:handlers.length?'mapped':'missing_handler',routing_expression:call?.expression||''});
      }
      for(const [tool,call] of calls) if(!defs.some(x=>x.tool===tool)) rows.push({tool,annotation:'',file:file.path,line:call.line,handler:call.handlers.join(' | '),module:call.handlers.map(h=>imports.get(h)||'same file'),status:'handler_without_definition',routing_expression:call.expression});
    }
    return rows;
  }

  function workflowMatrix(pages, databaseRows) {
    return pages.map(page=>{
      const order=C.WORKFLOW_ORDER.indexOf(page.data_page); const next=order>=0?C.WORKFLOW_ORDER[order+1]||'':'unknown';
      const loaded=new Set([page.path,...page.scripts,...page.transitive_scripts]);
      const pageWrites=databaseRows.filter(x=>x.channel==='browser'&&x.source_kind==='runtime_source'&&loaded.has(x.file)&&['insert','update','delete','upsert','rpc','post','patch','put'].includes(x.operation));
      const warnings=[];
      if(pageWrites.length) warnings.push('confirmed_direct_browser_database_mutation');
      for(const authority of page.local_storage_authority) {
        if(authority.endsWith(':workflow_authoritative_risk')) warnings.push(`workflow_state_browser_write:${authority.split(':')[0]}`);
        else if(authority.endsWith(':security_sensitive')) warnings.push(`security_sensitive_browser_state:${authority.split(':')[0]}`);
        else if(authority.endsWith(':dynamic_needs_review')) warnings.push(`dynamic_browser_state_needs_review:${authority.split(':')[0]}`);
      }
      if(!page.data_page) warnings.push('missing_data_page_review_only');
      return {page:page.path,step:page.data_page||'',expected_next:next,links:page.anchors,direct_scripts:page.scripts,transitive_scripts:page.transitive_scripts,storage_reads:page.local_storage.read,storage_writes:page.local_storage.write,storage_authority:page.local_storage_authority,direct_browser_mutations:pageWrites.map(x=>`${x.operation}:${x.target}:${x.file}`),warnings};
    });
  }

  function sanitiseLive(input) {
    if(!input) return null;
    const out={};
    for(const key of ['repository','ref','commit_sha','supabase_project_ref','captured_at']) if(typeof input[key]==='string'&&!C.CREDENTIAL_VALUE.test(input[key])) out[key]=input[key];
    out.functions=Array.isArray(input.functions)?input.functions.map(f=>({name:String(f.name||''),version:f.version??null,status:String(f.status||''),verify_jwt:typeof f.verify_jwt==='boolean'?f.verify_jwt:null,source_sha:/^[a-f0-9]{40,64}$/i.test(String(f.source_sha||''))?f.source_sha:null})).filter(x=>x.name):[];
    out.smoke_tests=Array.isArray(input.smoke_tests)?input.smoke_tests.map(t=>({name:String(t.name||''),outcome:String(t.outcome||''),timestamp:String(t.timestamp||''),evidence:String(t.evidence||'').slice(0,500)})).filter(x=>x.name&&!C.CREDENTIAL_VALUE.test(x.evidence)):[];
    const rollback=input.rollback||{};
    out.rollback={commit_sha:/^[a-f0-9]{40}$/i.test(String(rollback.commit_sha||''))?rollback.commit_sha:null,notes:C.CREDENTIAL_VALUE.test(String(rollback.notes||''))?'[redacted credential-shaped input]':String(rollback.notes||'').slice(0,500),function_versions:Array.isArray(rollback.function_versions)?rollback.function_versions.map(x=>({name:String(x.name||''),version:x.version??null})):[]};
    return out;
  }

  function deploymentLedger(files, live, repo, commitSha) {
    const functionNames=C.uniq(files.filter(x=>x.path.startsWith('supabase/functions/')).map(x=>x.path.split('/')[2]));
    const migrations=files.filter(x=>x.path.startsWith('supabase/migrations/')).map(x=>x.path);
    const workflows=files.filter(x=>x.path.startsWith('.github/workflows/')).map(x=>x.path);
    const accepted=sanitiseLive(live);
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
    const confirmed_blockers=[],suspected=[],warnings=[],preserved=[];
    for(const x of report.environment_variables) {
      if(x.browser_exposure&&x.secret_like&&x.source_kind==='runtime_source') confirmed_blockers.push(`Confirmed secret-like environment call in browser runtime: ${x.file}:${x.line} ${x.name}`);
      else if(x.secret_like&&x.source_kind!=='runtime_source') suspected.push(`Non-runtime secret reference requires context only: ${x.file}:${x.line} ${x.name}`);
    }
    for(const x of report.database_rpc) {
      if(x.channel==='browser'&&x.source_kind==='runtime_source'&&['insert','update','delete','upsert','rpc','post','patch','put'].includes(x.operation)) confirmed_blockers.push(`Confirmed browser mutation: ${x.file}:${x.line} ${x.operation} ${x.target}`);
      else if(x.channel==='browser'&&x.operation==='unknown') suspected.push(`Browser database target needs executable-method review: ${x.file}:${x.line} ${x.target}`);
    }
    for(const x of report.tool_routing) if(x.status!=='mapped') confirmed_blockers.push(`Tool routing mismatch: ${x.tool} (${x.status}) in ${x.file}`);
    for(const page of report.pages) {
      if(!page.data_page) warnings.push(`Missing data-page requires page-specific review: ${page.path}`);
      for(const authority of page.local_storage_authority) {
        if(authority.endsWith(':workflow_authoritative_risk')) confirmed_blockers.push(`Workflow-authoritative browser state on ${page.path}: ${authority}`);
        else if(authority.endsWith(':security_sensitive')) confirmed_blockers.push(`Security-sensitive browser state on ${page.path}: ${authority}`);
        else if(authority.endsWith(':dynamic_needs_review')) suspected.push(`Dynamic localStorage key on ${page.path}: ${authority}`);
        else preserved.push(`Preserved browser function on ${page.path}: ${authority}`);
      }
    }
    for(const row of report.deployment_ledger.rows) if(row.status==='not_supplied') warnings.push(`Live evidence not supplied: ${row.gate}`);
    return {
      ready:confirmed_blockers.length===0,
      confirmed_blockers:C.uniq(confirmed_blockers),
      suspected:C.uniq(suspected),
      warnings:C.uniq(warnings),
      preserved_functions:C.uniq(preserved),
      blockers:C.uniq(confirmed_blockers),
      headline:confirmed_blockers.length?'Scanner found confirmed contract blockers.':suspected.length?'No confirmed blocker found, but suspected findings need review.':'No static contract blocker found; live deployment proof may still be required.'
    };
  }

  window.CodeLabsSystemContractScannerV141Analyzers = Object.freeze({scanEnvironment,scanDatabase,scanRouting,workflowMatrix,sanitiseLive,deploymentLedger,findings});
})();
