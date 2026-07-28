(() => {
  'use strict';
  const VERSION = 'V143 Code Labs System Contract Scanner - red triage and runtime reachability';
  const TEXT_EXT = /\.(?:html?|mjs|cjs|js|jsx|ts|tsx|css|json|md|sql|ya?ml|toml)$/i;
  const RELEVANT = /^(?:code-labs\/|supabase\/functions\/code-labs|supabase\/migrations\/|\.github\/workflows\/|supabase\/config\.toml$)/;
  const WORKFLOW_ORDER = ['index','setup','project-picker','file-lab','rescue-room','v20','packet-builder','buddy-canvas','patch-desk','patch-lab','preview-test','checkpoints','repo-desk','publish-prep','github-tracker'];
  const SECRET_NAME = /(?:secret|service_role|private|password|api[_-]?key|token|credential|signing|webhook)/i;
  const CREDENTIAL_VALUE = /(?:sk-[A-Za-z0-9_-]{16,}|sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]+PRIVATE KEY-----|gh[oprsu]_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})/;
  const $ = id => document.getElementById(id);
  const uniq = xs => [...new Set(xs.filter(Boolean))];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lineOf = (text, index) => text.slice(0, index).split('\n').length;
  const safeJson = text => { if (!String(text || '').trim()) return null; try { return JSON.parse(text); } catch (e) { throw new Error('Invalid imported JSON: ' + e.message); } };
  const table = (headers, rows) => `<table><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${Array.isArray(c)?c.map(x=>`<div>${esc(x)}</div>`).join(''):esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const setStatus = (text, cls='') => { $('status').className = 'status ' + cls; $('status').textContent = text; };

  async function fetchJson(url) {
    const response = await fetch(url, {headers:{Accept:'application/vnd.github+json'}});
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
    return await response.json();
  }
  async function resolveRepository(repo, ref) {
    const commit = await fetchJson(`https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref)}`);
    const tree = await fetchJson(`https://api.github.com/repos/${repo}/git/trees/${commit.commit.tree.sha}?recursive=1`);
    if (tree.truncated) throw new Error('GitHub tree response was truncated; use a narrower repository snapshot.');
    return {commitSha: commit.sha, treeSha: commit.commit.tree.sha, entries: tree.tree || []};
  }
  async function fetchText(repo, sha, path) {
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/${sha}/${path}`, {cache:'no-store'});
    if (!response.ok) throw new Error(`${response.status} ${path}`);
    return await response.text();
  }
  async function pool(items, worker, limit=6) {
    const out = new Array(items.length); let next = 0;
    async function run() { while (next < items.length) { const i = next++; try { out[i] = await worker(items[i], i); } catch (error) { out[i] = {error:String(error)}; } } }
    await Promise.all(Array.from({length:Math.min(limit,items.length)}, run));
    return out;
  }

  function cleanParts(parts) {
    const out=[];
    for(const part of parts) {
      if(!part||part==='.') continue;
      if(part==='..') out.pop(); else out.push(part);
    }
    return out;
  }
  function candidatePaths(from, raw) {
    const value=String(raw||'').split(/[?#]/)[0].trim();
    if(!value||/^(?:https?:|data:|mailto:|tel:|#)/i.test(value)) return [];
    if(value.startsWith('code-labs/')) return [value];
    if(value.startsWith('/')) return [value.replace(/^\/+/, '')];
    const sourceDir=String(from||'').split('/').slice(0,-1);
    const candidates=[];
    const add=parts=>candidates.push(cleanParts(parts).join('/'));
    add([...sourceDir,...value.split('/')]);
    if(String(from||'').startsWith('code-labs/assets/')) {
      if(value.startsWith('assets/')) add(['code-labs',...value.split('/')]);
      if(/^[A-Za-z0-9_.-]+\.html?$/i.test(value)) add(['code-labs',value]);
      if(/^[A-Za-z0-9_.-]+\.(?:js|css|json|svg)$/i.test(value)) add(['code-labs','assets',value]);
    }
    if(String(from||'').startsWith('code-labs/')&&!String(from||'').startsWith('code-labs/assets/')) {
      if(value.startsWith('assets/')) add(['code-labs',...value.split('/')]);
    }
    return uniq(candidates);
  }
  function resolveReference(from, raw, knownPaths) {
    const candidates=candidatePaths(from,raw);
    if(knownPaths&&knownPaths.size) {
      const exact=candidates.find(x=>knownPaths.has(x));
      if(exact) return {path:exact,resolved:true,candidates};
    }
    return {path:candidates[0]||'',resolved:false,candidates};
  }
  function referenceTokens(text) {
    const out=[];
    const regex=/["'`]((?:code-labs\/|(?:\.\.\/|\.\/)?assets\/|(?:\.\.\/|\.\/)?)[A-Za-z0-9_./-]+\.(?:html?|js|css|json|md|svg))(?:[?#][^"'`]*)?["'`]/g;
    let match; while((match=regex.exec(text))) out.push({raw:match[1],index:match.index});
    return out;
  }
  function references(text, from='', knownPaths=null) {
    const rows=[];
    for(const token of referenceTokens(text)) {
      const resolved=resolveReference(from,token.raw,knownPaths);
      if(resolved.path) rows.push({raw:token.raw,path:resolved.path,resolved:resolved.resolved,candidates:resolved.candidates,line:lineOf(text,token.index)});
    }
    return dedupe(rows,x=>[x.raw,x.path,x.line].join('|'));
  }

  function constantStrings(text) {
    const values=new Map();
    const declaration=/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*((?:["'`][^"'`]*["'`]\s*\+\s*)*["'`][^"'`]*["'`])/g;
    let match;
    const capture=(name,expr)=>{const parts=Array.from(expr.matchAll(/["'`]([^"'`]*)["'`]/g),x=>x[1]);if(parts.length)values.set(name,parts.join(''));};
    while((match=declaration.exec(text))) capture(match[1],match[2]);
    const chained=/(?:^|[,;]\s*)([A-Za-z_$][\w$]*)\s*=\s*((?:["'`][^"'`]*["'`]\s*\+\s*)*["'`][^"'`]*["'`])/gm;
    while((match=chained.exec(text))) capture(match[1],match[2]);
    const returnFunctions=/function\s+([A-Za-z_$][\w$]*)\s*\(\s*\)\s*\{[\s\S]{0,240}?return\s+(["'`][^"'`]*["'`]|[A-Za-z_$][\w$]*)\s*;?[\s\S]{0,80}?\}/g;
    while((match=returnFunctions.exec(text))) {
      const literal=match[2].match(/^["'`]([^"'`]*)["'`]$/);
      if(literal) values.set(match[1]+'()',literal[1]);
      else if(values.has(match[2])) values.set(match[1]+'()',values.get(match[2]));
    }
    return values;
  }
  function firstArgumentCalls(text, objectName, method) {
    const needle=`${objectName}.${method}`; const rows=[]; let cursor=0;
    while((cursor=text.indexOf(needle,cursor))>=0) {
      let open=text.indexOf('(',cursor+needle.length); if(open<0) break;
      let quote='',escape=false,depth=0,end=-1;
      for(let i=open+1;i<text.length;i++) {
        const ch=text[i];
        if(quote) { if(escape) escape=false; else if(ch==='\\') escape=true; else if(ch===quote) quote=''; continue; }
        if(ch==='"'||ch==="'"||ch==='`') { quote=ch; continue; }
        if(ch==='('||ch==='['||ch==='{') depth++;
        else if(ch===')'||ch===']'||ch==='}') { if(ch===')'&&depth===0) { end=i; break; } depth=Math.max(0,depth-1); }
        else if(ch===','&&depth===0) { end=i; break; }
      }
      if(end>open) rows.push({expr:text.slice(open+1,end).trim(),index:cursor});
      cursor=open+1;
    }
    return rows;
  }
  function resolveStringExpression(expr, constants) {
    const value=String(expr||'').trim();
    const literal=value.match(/^["'`]([^"'`]*)["'`]$/); if(literal) return literal[1];
    if(constants.has(value)) return constants.get(value);
    if(constants.has(value+'()')) return constants.get(value+'()');
    const call=value.match(/^([A-Za-z_$][\w$]*)\(\s*\)$/); if(call&&constants.has(call[1]+'()')) return constants.get(call[1]+'()');
    const parts=value.split(/\s*\+\s*/); if(parts.length>1) {
      const resolved=parts.map(part=>resolveStringExpression(part,constants));
      if(resolved.every(x=>typeof x==='string')) return resolved.join('');
    }
    return null;
  }
  function wrapperKeys(text, method, constants) {
    const rows=[];
    const functions=/function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*\{([\s\S]*?)\n?\}/g;
    let match;
    while((match=functions.exec(text))) {
      const name=match[1],params=match[2].split(',').map(x=>x.trim()).filter(Boolean),body=match[3];
      const calls=firstArgumentCalls(body,'localStorage',method);
      for(const call of calls) {
        const parameterIndex=params.indexOf(call.expr); if(parameterIndex<0) continue;
        const invoke=new RegExp(`\\b${name}\\s*\\(([^(){};\\n]*)\\)`,'g'); let use;
        while((use=invoke.exec(text))) {
          if(use.index>=match.index&&use.index<=functions.lastIndex) continue;
          const args=use[1].split(',').map(x=>x.trim());
          const resolved=resolveStringExpression(args[parameterIndex],constants);
          if(resolved!=null) rows.push({key:resolved,source:`wrapper:${name}`,line:lineOf(text,use.index)});
        }
      }
    }
    return rows;
  }
  function storageDetails(text, method) {
    const constants=constantStrings(text),rows=[],dynamic=[];
    for(const call of firstArgumentCalls(text,'localStorage',method)) {
      const resolved=resolveStringExpression(call.expr,constants);
      if(resolved!=null) rows.push({key:resolved,source:'direct_or_constant',line:lineOf(text,call.index)});
      else dynamic.push({expr:call.expr,line:lineOf(text,call.index)});
    }
    const wrappers=wrapperKeys(text,method,constants); rows.push(...wrappers);
    const resolvedParameters=new Set(wrappers.map(x=>x.source.replace('wrapper:','')));
    for(const item of dynamic) {
      const plain=item.expr.match(/^[A-Za-z_$][\w$]*$/);
      if(plain&&resolvedParameters.size) continue;
      rows.push({key:`[dynamic:${item.expr.slice(0,80)}]`,source:'unresolved_expression',line:item.line});
    }
    return dedupe(rows,x=>[x.key,x.source,x.line].join('|'));
  }
  function storage(text, method) { return uniq(storageDetails(text,method).map(x=>x.key)); }
  function storageAuthority(key) {
    const value=String(key||'');
    if(value==='codeLabsV1State'||/workflow|current(file|project|job|packet|test)|candidate|codegod|writer|handoff/i.test(value)) return 'workflow_authority_risk';
    if(/token|auth|session|credential|secret/i.test(value)) return 'security_sensitive';
    if(/memory|counter|tooluse|preference|theme|layout|tracker|repoDesk|checklist/i.test(value)) return 'preserved_local_utility';
    if(/draft|backup|canvas|packet|pending|autosave|notes|receipt|undo/i.test(value)) return 'preserved_local_draft_or_backup';
    if(value.startsWith('[dynamic:')) return 'dynamic_needs_source_review';
    return 'local_unknown_review';
  }

  const STATE_FIELD_GROUPS={
    authoritative_identity:['project','projectId','selectedProject','selectedProjectId','file','fileId','selectedFile','selectedFileId','job','jobId','packet','packetId','test','testId'],
    authoritative_workflow:['workflow','workflowStep','stage','stateVersion','state_version','candidateHash','codeGod','codeGodResult','writer','writerRequest','handoff','approval'],
    source_cache:['currentCode','currentHash','githubSource','filename','path','repo','branch'],
    preserved_draft:['fixedCode','draft','backup','packetPreview','buddyPacket','problem','dontTouch','preserve','errors','notes','tests','checkpoints']
  };
  function workflowStateFields(text) {
    if(!/codeLabsV1State/.test(text)) return [];
    const rows=[];
    for(const [group,fields] of Object.entries(STATE_FIELD_GROUPS)) for(const field of fields) {
      const regex=new RegExp(`(?:\\.|["'\\x60])${field}(?:["'\\x60])?\\s*(=|:)?`,'g'); let match;
      while((match=regex.exec(text))) rows.push({field,group,access:match[1]?'write_or_object_build':'read_or_reference',line:lineOf(text,match.index),confidence:'field_heuristic'});
    }
    return dedupe(rows,x=>[x.field,x.group,x.access,x.line].join('|'));
  }

  function transitiveScripts(directScripts, fileMap, knownPaths) {
    const seen=new Set(), queue=[...directScripts];
    while(queue.length) {
      const path=queue.shift(); if(seen.has(path)||!fileMap.has(path)) continue; seen.add(path);
      for(const ref of references(fileMap.get(path)||'',path,knownPaths)) if(ref.resolved&&/\.js$/i.test(ref.path)&&!seen.has(ref.path)) queue.push(ref.path);
    }
    return [...seen];
  }
  function authEvidence(text) {
    const evidence=[],confirmed=[],keyword=[];
    const concrete=[
      ['browser_session',/supabase\.auth\.(?:getUser|getSession|onAuthStateChange)|\.auth\.getUser\s*\(|\.auth\.getSession\s*\(/i],
      ['bearer_token',/headers\s*:\s*\{[^}]*Authorization|authorization\s*:\s*["'`]Bearer|req\.headers\.get\(["'`]authorization/i],
      ['connector_oauth',/\/oauth\/(?:authorize|token|register)|code_labs\.read\s+code_labs\.write/i],
      ['owner_enforcement',/configuredOwnerId\s*\(|\.eq\(\s*["'`]owner_id["'`]|code_labs_owners/i],
      ['pro_entitlement_enforcement',/get_cg_repair_lab_access|code_labs_entitlements|pro_access|entitlement.*(?:active|enabled)/i]
    ];
    for(const [kind,regex] of concrete) if(regex.test(text)) { evidence.push(kind); confirmed.push(kind); }
    for(const [kind,regex] of [['owner_keyword',/owner[_ -]?only/i],['pro_keyword',/code\s*labs\s*pro|subscription/i],['bearer_keyword',/\bBearer\b|Authorization/i]]) if(regex.test(text)&&!evidence.includes(kind.replace('_keyword',''))) keyword.push(kind);
    return {classification:confirmed.length?confirmed.join('+'):keyword.length?'keyword_only':'none_found',evidence,keyword_evidence:keyword,confidence:confirmed.length?'confirmed_source_pattern':keyword.length?'keyword_only_needs_runtime_proof':'no_static_evidence'};
  }
  function pageRecord(path, text, fileMap, imported, knownPaths) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const scripts=[...doc.querySelectorAll('script[src]')].map(x=>resolveReference(path,x.getAttribute('src'),knownPaths)).filter(x=>x.path).map(x=>x.path);
    const allScripts=transitiveScripts(scripts,fileMap,knownPaths);
    const styles=[...doc.querySelectorAll('link[href]')].map(x=>resolveReference(path,x.getAttribute('href'),knownPaths)).filter(x=>x.path&&/\.(css|svg)$/i.test(x.path)).map(x=>x.path);
    const anchors=[...doc.querySelectorAll('a[href]')].map(x=>resolveReference(path,x.getAttribute('href'),knownPaths)).filter(x=>x.path&&x.path.startsWith('code-labs/')).map(x=>x.path);
    const combined=[text,...allScripts.map(x=>fileMap.get(x)||'')].join('\n');
    const live=imported?.htmlPages?.find(x=>x.path===path)||null;
    const localStorage={read:storage(combined,'getItem'),write:storage(combined,'setItem'),remove:storage(combined,'removeItem')};
    const fieldRows=workflowStateFields(combined);
    return {
      path,title:doc.title||'',data_page:doc.documentElement.dataset.page||doc.body?.dataset.page||'',scripts,
      transitive_scripts:allScripts.filter(x=>!scripts.includes(x)),styles,anchors:uniq(anchors),inline_scripts:[...doc.querySelectorAll('script:not([src])')].length,
      buttons:doc.querySelectorAll('button').length,forms:doc.querySelectorAll('form').length,local_storage:localStorage,
      local_storage_authority:uniq([...localStorage.write,...localStorage.remove].map(key=>`${key}:${storageAuthority(key)}`)),
      workflow_state_fields:fieldRows,auth:authEvidence(combined),references:references(combined,path,knownPaths),
      live_http:live?{ok:live.ok,status:live.status,error:live.error||''}:null
    };
  }
  function sourceKind(path) {
    if(/(?:^|\/)(?:test|tests|fixtures?)(?:\/|\.)|\.(?:test|spec)\.[^.]+$/i.test(path)) return 'test_or_fixture';
    if(/\.(?:md|txt)$/i.test(path)) return 'documentation';
    if(path.startsWith('supabase/migrations/')||/\.sql$/i.test(path)) return 'migration';
    if(path.startsWith('.github/workflows/')) return 'workflow';
    return 'runtime_source';
  }
  function runtimeRoles(files,pages) {
    const direct=new Map(),transitive=new Map();
    for(const page of pages) {
      for(const path of page.scripts) { if(!direct.has(path))direct.set(path,[]); direct.get(path).push(page.path); }
      for(const path of page.transitive_scripts) { if(!transitive.has(path))transitive.set(path,[]); transitive.get(path).push(page.path); }
    }
    const roles=new Map();
    for(const file of files) {
      const kind=sourceKind(file.path); let role='unreached_needs_review';
      if(/\.html?$/i.test(file.path)&&file.path.startsWith('code-labs/')) role='active_page';
      else if(direct.has(file.path)) role='active_direct_helper';
      else if(transitive.has(file.path)) role='active_transitive_helper';
      else if(kind==='documentation') role='documentation_only';
      else if(kind==='test_or_fixture') role='test_or_fixture';
      else if(/retired|obsolete|do-not-merge/i.test(file.path+' '+file.text.slice(0,240))) role='retired_marker';
      roles.set(file.path,{role,direct_pages:uniq(direct.get(file.path)||[]),transitive_pages:uniq(transitive.get(file.path)||[])});
    }
    return roles;
  }
  function dedupe(rows,key) { const seen=new Set(); return rows.filter(x=>{const k=key(x); if(seen.has(k))return false; seen.add(k); return true;}); }

  window.CodeLabsSystemContractScannerV141Core = Object.freeze({
    VERSION,TEXT_EXT,RELEVANT,WORKFLOW_ORDER,SECRET_NAME,CREDENTIAL_VALUE,$,uniq,esc,lineOf,safeJson,table,setStatus,
    fetchJson,resolveRepository,fetchText,pool,candidatePaths,resolveReference,references,constantStrings,firstArgumentCalls,
    resolveStringExpression,storageDetails,storage,storageAuthority,workflowStateFields,transitiveScripts,authEvidence,pageRecord,
    sourceKind,runtimeRoles,dedupe
  });
})();
