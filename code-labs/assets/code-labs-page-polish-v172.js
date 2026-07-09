/* Code Labs Page Polish V172.4
   Small non-destructive polish layer:
   - leaves sidebar order owned by cl-nav.js V173 stable nav
   - keeps workflow wording and SEO polish
   - fixes stale Setup/Project wording after render
   - adds runtime SEO metadata where pages are thin
   - adds a Buddy/GitHub connector request copy lane without browser GitHub writes
   V172.4 does not append, sort, or move sidebar links. That prevents menu jumping.
*/
(function(){
'use strict';
var VERSION='V172.4';
var SEO={
'index':'Code Labs guided ChatGPT repair workflow for non-coders with Setup, File Lab, Buddy Canvas, preview, checkpoints, GitHub Writer, GitHub Tracker, Saved Files, and Supabase repair history.',
'setup':'Code Labs Setup stores workspace, site, repo, GitHub connector, Supabase repair-history, and notes before the full repair workflow starts.',
'file-lab':'Code Labs File Lab loads the full current source file so Buddy and ChatGPT can repair with complete context.',
'rescue-room':'Code Labs Rescue Room captures the problem, preserve rules, error notes, and acceptance checks before a repair packet is built.',
'packet-builder':'Code Labs Packet Builder creates assistant-readable repair packets with file context, problem notes, preserve rules, and test expectations.',
'buddy-canvas':'Code Labs Buddy Canvas is the assistant lane for source proof, fixed full-code review, reports, and Buddy-readable context.',
'v20':'Code Labs Workflow Hub keeps the repair route in order and helps choose the next safe workflow step.',
'patch-desk':'Code Labs Patch Desk stores the complete fixed file, compares old and new code, and prepares preview testing.',
'patch-lab':'Code Labs Patch Lab is the exact-line fallback for careful repairs when a full page workflow needs precision.',
'preview-test':'Code Labs Preview and Test checks fixed output before checkpoints, Repo Desk, GitHub Writer, and promotion.',
'checkpoints':'Code Labs Checkpoints stores rollback proof and reviewed test notes before any repository handoff.',
'repo-desk':'Code Labs Repo Desk prepares repo, path, action, branch, and handoff details for safe GitHub connector work.',
'publish-prep':'Code Labs GitHub Writer prepares safe branch and pull request requests for ChatGPT and the GitHub connector.',
'github-tracker':'Code Labs GitHub Tracker records PR bridge requests, preview links, review status, and fallback PR guidance.',
'saved-files':'Code Labs Saved Files Manager lets the owner review, load, and edit Code Labs Supabase saved-file history.',
'help':'Code Labs Help gives non-coders tool search, Buddy Memory, GitHub request packets, local utilities, backups, and repair guidance.',
'faq':'Code Labs FAQ answers how the workflow, GitHub handoff, Supabase repair history, Buddy Canvas, and checkpoints work.',
'about':'About Code Labs explains the guided ChatGPT repair workflow from setup to repair history.',
'connection-guide':'Code Labs Connection Guide explains safe ChatGPT, GitHub, and Supabase connection steps.',
'read-only-proof':'Code Labs Read-Only Proof shows backend read proof without GitHub writes, deletes, or schema changes.',
'checklist-builder':'Code Labs Checklist Builder creates clear pass lists for preview, checkpoint, and handoff review.'};
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/,'')||'index'}
function keyFromHref(h){return String(h||'').split('?')[0].split('#')[0].split('/').pop()||'index.html'}
function ensureMeta(name,content){if(!content)return;var m=q('meta[name="'+name+'"]');if(!m){m=document.createElement('meta');m.setAttribute('name',name);document.head.appendChild(m)}if(!m.getAttribute('content'))m.setAttribute('content',content)}
function ensureProp(prop,content){if(!content)return;var m=q('meta[property="'+prop+'"]');if(!m){m=document.createElement('meta');m.setAttribute('property',prop);document.head.appendChild(m)}if(!m.getAttribute('content'))m.setAttribute('content',content)}
function seo(){var id=page(),desc=SEO[id]||SEO[keyFromHref(location.pathname).replace(/\.html$/,'')]||'';ensureMeta('description',desc);ensureMeta('keywords','Code Labs, ChatGPT repair workflow, Buddy Canvas, GitHub connector, Supabase repair history, non-coder website repair, checkpoints, Saved Files');ensureProp('og:title',document.title||'Code Labs');ensureProp('og:description',desc);ensureMeta('twitter:card','summary');ensureMeta('twitter:description',desc)}
function addStyle(){if(q('#clPagePolishV172Style'))return;var s=document.createElement('style');s.id='clPagePolishV172Style';s.textContent='.clPolishNote{border:1px solid #bfdbfe;background:#eff6ff;color:#172554;border-radius:18px;padding:12px;margin:10px 0}.clPolishNote b{color:#0f172a}.clTiny{font-size:12px;opacity:.85}.clReqBox{width:100%;min-height:130px;margin-top:10px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px}.clStepBadge,.clPanelStep .clStepBadge{display:none!important}';document.head.appendChild(s)}
function cleanNumberBadges(){qa('.clStepBadge').forEach(function(b){b.remove()});qa('.panel h2').forEach(function(h){var b=q('.clPanelStep',h);if(b)h.textContent=b.textContent.replace(/^\s*(\d+)\s*/,function(_,n){return n+'. '})})}
function patchText(){
var id=page();
qa('.sideBox').forEach(function(box){if(/GitHub and Supabase are planned connector layers|future connector/i.test(box.textContent||'')){box.innerHTML='<b>Mode</b><p>Manual workflow, Buddy Page Bridge, GitHub connector requests, and Supabase repair history are active support lanes. Browser pages still do not write GitHub directly.</p>'}});
if(id==='setup'){
qa('select#mode option').forEach(function(o){if(o.value==='manual')o.textContent='Manual + Buddy assisted';if(o.value==='github')o.textContent='GitHub connector ready';if(o.value==='supabase')o.textContent='Supabase history ready'});
qa('.notice p').forEach(function(p){if(/Manual mode means|safest first version|tools are blocked/i.test(p.textContent||'')){p.innerHTML='<b>Plain English:</b> Manual editing still works, but GitHub connector and Supabase repair history are now active support lanes. Browser pages prepare safe requests; Buddy/ChatGPT handles branch and PR work through the GitHub connector.'}});
var h=q('.hero p');if(h&&/leave GitHub and Supabase blank|manual mode/i.test(h.textContent||''))h.textContent='Tell Code Labs what website you are fixing. GitHub connector, Supabase repair history, and Buddy Page Bridge can help when available, but browser pages still stay safe.';
}
if(id==='project-picker'){
qa('.hero p,.card p,.sideBox p').forEach(function(el){var t=el.textContent||'';if(/future connector layers|what comes later|Future database mode|Future connector mode/i.test(t)){el.textContent=t.replace('GitHub and Supabase are future connector layers.','GitHub connector and Supabase repair history are active support lanes.').replace('GitHub/Supabase cards explain what comes later.','GitHub/Supabase cards explain the active safe handoff lanes.').replace('Future connector mode:','GitHub connector lane:').replace('Future database mode:','Supabase repair-history lane:')}});
}
}
function requestText(){var p={};try{if(window.CodeLabsBuddyPageBridge&&window.CodeLabsBuddyPageBridge.packet)p=window.CodeLabsBuddyPageBridge.packet()||{}}catch(e){}var repo=p.repo||'trevieisking/stream-bandit',path=p.path||'',branch=p.request_branch||'',action=p.action||'read_context';return ['CODE LABS GITHUB CONNECTOR REQUEST '+VERSION,'Page: '+page(),'Repo: '+repo,'Path: '+(path||'missing - fill before write request'),'Branch: '+(branch||'Buddy should choose a safe non-main branch'),'Action: '+action,'','Request:','Use the GitHub connector in ChatGPT to read, create, or update the target file safely. Do not write main directly. Open a branch/PR only when a real file path and full replacement content are present.','','Buddy Page Bridge packet:',(window.CodeLabsBuddyPageBridge&&window.CodeLabsBuddyPageBridge.text?window.CodeLabsBuddyPageBridge.text():'Build the Buddy Read Packet first.')].join('\n')}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();return Promise.resolve()}
function bridgeRequest(){var p=q('#clBuddyPageBridgeV139');if(!p||q('#clGithubConnectorRequestV172'))return;var wrap=document.createElement('div');wrap.id='clGithubConnectorRequestV172';wrap.className='clPolishNote';wrap.innerHTML='<b>GitHub connector request</b><p class="clTiny">This prepares the request for Buddy/ChatGPT. The browser still does not write GitHub directly.</p><div class="actions"><button class="btn good" type="button" id="clCopyGithubRequestV172">Copy GitHub Connector Request</button><button class="btn ghost" type="button" id="clBuildGithubRequestV172">Build Request Text</button></div><textarea class="clReqBox" id="clGithubRequestOutV172" readonly></textarea>';p.appendChild(wrap);q('#clBuildGithubRequestV172').onclick=function(){q('#clGithubRequestOutV172').value=requestText()};q('#clCopyGithubRequestV172').onclick=function(){var t=requestText();q('#clGithubRequestOutV172').value=t;copy(t)}}
function run(){addStyle();seo();cleanNumberBadges();patchText();bridgeRequest()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(run,80)});else setTimeout(run,80);
setTimeout(run,600);setTimeout(run,1800);
window.CodeLabsPagePolishV172={run:run,version:VERSION,menu_owner:'cl-nav.js'};
})();