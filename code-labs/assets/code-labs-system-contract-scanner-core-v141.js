(() => {
  'use strict';
  const VERSION = 'V141 Code Labs System Contract Scanner';
  const TEXT_EXT = /\.(?:html?|mjs|cjs|js|jsx|ts|tsx|css|json|md|sql|ya?ml|toml)$/i;
  const RELEVANT = /^(?:code-labs\/|supabase\/functions\/code-labs|supabase\/migrations\/|\.github\/workflows\/|supabase\/config\.toml$)/;
  const WORKFLOW_ORDER = ['index','setup','project-picker','file-lab','rescue-room','v20','packet-builder','buddy-canvas','patch-desk','patch-lab','preview-test','checkpoints','repo-desk','publish-prep','github-tracker'];
  const SECRET_NAME = /(?:secret|service_role|private|password|api[_-]?key|token|credential|signing|webhook)/i;
  const CREDENTIAL_VALUE = /(?:sk-[A-Za-z0-9_-]{16,}|sb_secret_[A-Za-z0-9_-]{16,}|-----BEGIN [A-Z ]+PRIVATE KEY-----|gh[oprsu]_[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,})/;
  const $ = id => document.getElementById(id);
  const uniq = xs => [...new Set(xs.filter(Boolean))];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lineOf = (text, index) => text.slice(0, index).split('\n').length;
  const safeJson = text => { if (!text.trim()) return null; try { return JSON.parse(text); } catch (e) { throw new Error('Invalid imported JSON: ' + e.message); } };
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
  function references(text) {
    return uniq(Array.from(text.matchAll(/(?:["'`](?:\.\.\/|\.\/)?|\b)(code-labs\/[A-Za-z0-9_./-]+\.(?:html?|js|css|json|md|svg))/g), match=>match[1]));
  }
  function storage(text, method) {
    const regex = new RegExp(`localStorage\\.${method}\\(\\s*["'\\x60]([^"'\\x60]+)`, 'g');
    return uniq(Array.from(text.matchAll(regex), match=>match[1]));
  }
  function normalise(from, value) {
    if (!value || /^(?:https?:|data:|mailto:|tel:|#)/i.test(value)) return '';
    const clean=value.split(/[?#]/)[0]; if (!clean) return '';
    if (clean.startsWith('/')) return clean.slice(1);
    const base=from.split('/').slice(0,-1);
    for (const part of clean.split('/')) { if(part==='.'||!part)continue; if(part==='..')base.pop(); else base.push(part); }
    return base.join('/');
  }
  function authEvidence(text) {
    const evidence=[];
    const checks=[
      ['browser_session',/supabase\.auth|getSession\s*\(|onAuthStateChange\s*\(/i],
      ['bearer_token',/Authorization|Bearer\s+/i],
      ['connector_oauth',/oauth\/authorize|oauth\/token|code_labs\.read|code_labs\.write/i],
      ['owner',/code_labs_owners|owner[_ -]?only|configuredOwnerId|get_cg_repair_lab_access/i],
      ['pro_entitlement',/entitlement|code\s*labs\s*pro|pro_access|subscription/i]
    ];
    for(const [kind,regex] of checks) if(regex.test(text)) evidence.push(kind);
    return {classification:evidence.length?evidence.join('+'):'none_found',evidence};
  }
  function pageRecord(path, text, fileMap, imported) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    const scripts = [...doc.querySelectorAll('script[src]')].map(x=>normalise(path,x.getAttribute('src'))).filter(Boolean);
    const styles = [...doc.querySelectorAll('link[href]')].map(x=>normalise(path,x.getAttribute('href'))).filter(x=>/\.(css|svg)$/i.test(x));
    const anchors = [...doc.querySelectorAll('a[href]')].map(x=>normalise(path,x.getAttribute('href'))).filter(x=>x&&x.startsWith('code-labs/'));
    const combined = [text, ...scripts.map(x=>fileMap.get(x)||'')].join('\n');
    const live = imported?.htmlPages?.find(x=>x.path===path) || null;
    return {
      path, title: doc.title || '', data_page: doc.documentElement.dataset.page || doc.body?.dataset.page || '',
      scripts, styles, anchors:uniq(anchors), inline_scripts:[...doc.querySelectorAll('script:not([src])')].length,
      buttons:doc.querySelectorAll('button').length, forms:doc.querySelectorAll('form').length,
      local_storage:{read:storage(combined,'getItem'),write:storage(combined,'setItem'),remove:storage(combined,'removeItem')},
      auth:authEvidence(combined), references:references(combined),
      live_http:live ? {ok:live.ok,status:live.status,error:live.error||''} : null
    };
  }
  function dedupe(rows,key) { const seen=new Set(); return rows.filter(x=>{const k=key(x); if(seen.has(k))return false; seen.add(k); return true;}); }

  window.CodeLabsSystemContractScannerV141Core = Object.freeze({
    VERSION,TEXT_EXT,RELEVANT,WORKFLOW_ORDER,SECRET_NAME,CREDENTIAL_VALUE,$,uniq,esc,lineOf,safeJson,table,setStatus,
    fetchJson,resolveRepository,fetchText,pool,references,storage,normalise,authEvidence,pageRecord,dedupe
  });
})();
