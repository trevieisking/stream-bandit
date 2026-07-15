/* Code Labs Page Polish V219.
   Shared non-destructive page polish:
   - leaves sidebar order owned by the stable navigation runtime
   - numbers each main panel once, in visible page order
   - removes only duplicate generated helper shells with known IDs
   - keeps SEO wording and the GitHub connector request lane
*/
(function(){
'use strict';
var VERSION='V219';
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
'code-god':'Code Labs Code God performs a read-only deterministic review before GitHub Writer and pull request creation.',
'publish-prep':'Code Labs GitHub Writer prepares safe branch and pull request requests for ChatGPT and the GitHub connector.',
'github-tracker':'Code Labs GitHub Tracker records PR bridge requests, preview links, review status, and fallback PR guidance.',
'saved-files':'Code Labs Saved Files Manager lets the owner review, load, and edit Code Labs Supabase saved-file history.',
'help':'Code Labs Help gives non-coders tool search, Buddy Memory, GitHub request packets, local utilities, backups, and repair guidance.'};
var GENERATED_IDS=['clGithubConnectorRequestV172','clFooterBuddyShellV201','clSolGuideV220','clV202Tools'];
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return document.body&&document.body.getAttribute('data-page')||location.pathname.split('/').pop().replace(/\.html?$/,'')||'index'}
function ensureMeta(name,content){if(!content)return;var m=q('meta[name="'+name+'"]');if(!m){m=document.createElement('meta');m.setAttribute('name',name);document.head.appendChild(m)}if(!m.getAttribute('content'))m.setAttribute('content',content)}
function ensureProp(prop,content){if(!content)return;var m=q('meta[property="'+prop+'"]');if(!m){m=document.createElement('meta');m.setAttribute('property',prop);document.head.appendChild(m)}if(!m.getAttribute('content'))m.setAttribute('content',content)}
function seo(){var desc=SEO[page()]||'';ensureMeta('description',desc);ensureMeta('keywords','Code Labs, ChatGPT repair workflow, Buddy Canvas, GitHub connector, Supabase repair history, non-coder website repair, checkpoints, Saved Files');ensureProp('og:title',document.title||'Code Labs');ensureProp('og:description',desc);ensureMeta('twitter:card','summary');ensureMeta('twitter:description',desc)}
function addStyle(){if(q('#clPagePolishV219Style'))return;var s=document.createElement('style');s.id='clPagePolishV219Style';s.textContent='.clPolishNote{border:1px solid #bfdbfe;background:#eff6ff;color:#172554;border-radius:18px;padding:12px;margin:10px 0}.clTiny{font-size:12px;opacity:.85}.clReqBox{width:100%;min-height:130px;margin-top:10px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px}.clPanelNumber{display:inline-grid;place-items:center;min-width:34px;height:34px;margin-right:10px;padding:0 9px;border-radius:12px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:white;font-size:14px;font-weight:1000;vertical-align:middle}.panel[data-cl-panel-numbered="V219"]>h2{display:flex;align-items:center;gap:0}.clStepBadge{display:none!important}';document.head.appendChild(s)}
function removeKnownDuplicates(){GENERATED_IDS.forEach(function(id){var nodes=qa('#'+id);nodes.slice(1).forEach(function(node){node.remove()})})}
function cleanLegacyBadges(){qa('.clStepBadge').forEach(function(b){b.remove()})}
function numberPanels(){var main=q('.main');if(!main)return;var panels=qa(':scope > .panel',main);panels.forEach(function(panel,index){var h=q(':scope > h2',panel);if(!h)return;var existing=q(':scope > .clPanelNumber',h);if(!existing){existing=document.createElement('span');existing.className='clPanelNumber';h.insertBefore(existing,h.firstChild)}existing.textContent=String(index+1);panel.setAttribute('data-cl-panel-numbered',VERSION)})}
function patchText(){var id=page();qa('.sideBox').forEach(function(box){if(/GitHub and Supabase are planned connector layers|future connector/i.test(box.textContent||'')){box.innerHTML='<b>Mode</b><p>Manual workflow, Buddy Page Bridge, GitHub connector requests, and Supabase repair history are active support lanes. Browser pages still do not write GitHub directly.</p>'}});if(id==='setup'){qa('select#mode option').forEach(function(o){if(o.value==='manual')o.textContent='Manual + Buddy assisted';if(o.value==='github')o.textContent='GitHub connector ready';if(o.value==='supabase')o.textContent='Supabase history ready'})}}
function requestText(){var p={};try{if(window.CodeLabsBuddyPageBridge&&window.CodeLabsBuddyPageBridge.packet)p=window.CodeLabsBuddyPageBridge.packet()||{}}catch(e){}var repo=p.repo||'trevieisking/stream-bandit',path=p.path||'',branch=p.request_branch||'',action=p.action||'read_context';return ['CODE LABS GITHUB CONNECTOR REQUEST '+VERSION,'Page: '+page(),'Repo: '+repo,'Path: '+(path||'missing - fill before write request'),'Branch: '+(branch||'Buddy should choose a safe non-main branch'),'Action: '+action,'','Request:','Use the GitHub connector in ChatGPT to read, create, or update the target file safely. Do not write main directly. Open a branch/PR only when a real file path and full replacement content are present.'].join('\n')}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);var a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();return Promise.resolve()}
function bridgeRequest(){var p=q('#clBuddyPageBridgeV139');if(!p||q('#clGithubConnectorRequestV172'))return;var wrap=document.createElement('div');wrap.id='clGithubConnectorRequestV172';wrap.className='clPolishNote';wrap.innerHTML='<b>GitHub connector request</b><p class="clTiny">This prepares the request for Buddy/ChatGPT. The browser still does not write GitHub directly.</p><div class="actions"><button class="btn good" type="button" id="clCopyGithubRequestV172">Copy GitHub Connector Request</button><button class="btn ghost" type="button" id="clBuildGithubRequestV172">Build Request Text</button></div><textarea class="clReqBox" id="clGithubRequestOutV172" readonly></textarea>';p.appendChild(wrap);q('#clBuildGithubRequestV172').onclick=function(){q('#clGithubRequestOutV172').value=requestText()};q('#clCopyGithubRequestV172').onclick=function(){var t=requestText();q('#clGithubRequestOutV172').value=t;copy(t)}}
function run(){addStyle();seo();removeKnownDuplicates();cleanLegacyBadges();numberPanels();patchText();bridgeRequest()}
function schedule(){run();setTimeout(run,250);setTimeout(run,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.CodeLabsPagePolishV172={run:run,version:VERSION,menu_owner:'stable navigation runtime'};
})();