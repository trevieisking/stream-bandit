/* Code God Findings V237 - actionable read-only review details. */
(function(){
'use strict';
var VERSION='V237-actionable-findings',observer=null,wrapped=false;
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(text);var a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();return Promise.resolve()}
function secretRx(){return /(?:authorization\s*:\s*bearer\s+[A-Za-z0-9._~-]{12,}|sk-[A-Za-z0-9_-]{12,}|sb_secret_[A-Za-z0-9_-]{12,}|[A-Za-z0-9_]*(?:service[_ -]?role|private[_ -]?key|api[_ -]?key|secret)[A-Za-z0-9_]*\s*(?:=|:)\s*["']?[A-Za-z0-9._~-]{16,})/i}
function locate(text,rx,redact){var value=String(text||''),m=rx&&rx.exec(value);if(!m)return{};var before=value.slice(0,m.index),line=before.split(/\r?\n/).length,raw=value.split(/\r?\n/)[line-1]||'';return{location_type:'source',line:line,end_line:line,evidence:redact?'[redacted credential-shaped value]':raw.trim().slice(0,240)}}
function detail(f,input){var proposed=input.latest_handoff_body_bound?String(input.latest_handoff_proposed||''):String(input.proposed||''),path=String(input.path||'proposed file'),d={};
if(f.rule_id==='CG-CONFLICT-001')d=locate(proposed,/<<<<<<<|=======|>>>>>>>/,false);
else if(f.rule_id==='CG-FENCE-001')d=locate(proposed,/```(?:html|javascript|js|typescript|ts|json)?/i,false);
else if(f.rule_id==='CG-SECRET-001')d=locate(proposed,secretRx(),true);
else if(f.rule_id==='CG-TIMER-001')d=locate(proposed,/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/,false);
else if(f.rule_id==='CG-DUPLICATE-001')d=locate(proposed,/\.insert\s*\(/,false);
if(d.location_type==='source')d.file=path;
var map={
'CG-HANDOFF-STALE-001':['saved handoff','Reviewing stale request data could approve the wrong GitHub action.','Select and save the newest handoff before running Code God.'],
'CG-HANDOFF-INCOMPLETE-001':['handoff','Code God cannot verify an action whose required fields are missing.','Complete every required handoff field, save it, and rerun the review.'],
'CG-IDENTITY-004':['source repository','Existing-file changes must be tied to a verified GitHub source.','Reload the target file from GitHub read-only.'],
'CG-IDENTITY-003':['repository','Source and destination repository identities must match.','Use the approved repository for both source and handoff.'],
'CG-IDENTITY-001':['repository','The Code Labs lane is restricted to the approved repository.','Set the repository to trevieisking/stream-bandit.'],
'CG-IDENTITY-002':['target path','A missing or traversing path could target the wrong file.','Use one exact repository-relative path without ../ segments.'],
'CG-REMOVE-PROOF-001':['removal notes','A removal needs evidence that the exact path is disposable.','Add concise safety proof for the exact target path.'],
'CG-BRANCH-001':['requested branch','Mutating work must remain branch-and-PR only.','Use a non-protected repair branch.']};
if(map[f.rule_id]){d.location_type='field';d.field=map[f.rule_id][0];d.evidence=String(input[map[f.rule_id][0].replace(/ /g,'_')]||'(missing)').slice(0,240);d.why=map[f.rule_id][1];d.suggested_edit=map[f.rule_id][2]}
if(f.rule_id==='CG-FULLFILE-001'){d.location_type='file';d.file=path;d.why='GitHub Writer requires one complete replacement file, not a recipe or fragment.';d.suggested_edit='Restore the complete file, then apply the intended edits inside it.'}
if(f.rule_id==='CG-TRUNCATION-001'){d.location_type='file';d.file=path;d.why='A large unexplained size reduction usually means working sections were lost.';d.suggested_edit='Compare original and proposed files and restore every unrelated section.'}
if(f.rule_id==='CG-CONFLICT-001'){d.why='Conflict markers are not valid final source and hide competing versions.';d.suggested_edit='Choose the correct code, remove all conflict markers, and keep one resolved version.'}
if(f.rule_id==='CG-FENCE-001'){d.why='Markdown fences inside a source file can break the file syntax.';d.suggested_edit='Delete only the opening and closing fence markers.'}
if(f.rule_id==='CG-SECRET-001'){d.why='Privileged values must never be committed to browser-delivered source.';d.suggested_edit='Remove the assigned value and read it only from the protected server runtime.'}
if(f.rule_id==='CG-TIMER-001'){d.why='A short repeating timer can rerun visual or write work while the page is settling.';d.suggested_edit='Replace it with one guarded owner, an explicit event, or a bounded retry.'}
if(f.rule_id==='CG-DUPLICATE-001'){d.why='An unconditional insert can create duplicate owner records or history rows.';d.suggested_edit='Update the selected row, or document that a deliberate new version is required.'}
return Object.assign(f,d)}
function wrap(){if(wrapped||!window.CodeGodReviewV200||!window.CodeGodReviewV200.review)return false;var original=window.CodeGodReviewV200.review;window.CodeGodReviewV200.review=function(input){input=input||(window.CodeLabsCurrentFileContextV200&&window.CodeLabsCurrentFileContextV200.current())||{};var result=original(input);result.findings=(result.findings||[]).map(function(f){return detail(f,input)});result.checks_run=(result.checks_run||[]).concat(['finding-locations']);window.CodeGodLatestReviewV237=result;return result};wrapped=true;return true}
function location(f){if(f.location_type==='source')return(f.file||'proposed file')+(f.line?' · line '+f.line:'');if(f.location_type==='field')return'Handoff field · '+(f.field||'unknown');return f.file||'Proposed file'}
function report(f){return[f.severity+' · '+f.rule_id,'Location: '+location(f),'Found: '+(f.evidence||'See finding details.'),'Why: '+(f.why||f.message||''),'Suggested correction: '+(f.suggested_edit||f.correction||'')].join('\n')}
function row(label,value){var p=document.createElement('p'),b=document.createElement('b');b.textContent=label+': ';p.appendChild(b);p.appendChild(document.createTextNode(value||'Not available'));return p}
function enhance(){var result=window.CodeGodLatestReviewV237,root=q('#cgFindings');if(!result||!root)return;var cards=all(':scope>.item',root);(result.findings||[]).forEach(function(f,i){var card=cards[i];if(!card||q('.cgActionableV237',card))return;var box=document.createElement('div');box.className='cgActionableV237';box.appendChild(row('Location',location(f)));box.appendChild(row('Found',f.evidence||'See the full proposed file.'));box.appendChild(row('Why',f.why||f.message));box.appendChild(row('Suggested correction',f.suggested_edit||f.correction));var btn=document.createElement('button');btn.type='button';btn.className='btn ghost';btn.textContent='Copy suggested correction';btn.onclick=function(){copy(report(f)).then(function(){btn.textContent='Copied';setTimeout(function(){btn.textContent='Copy suggested correction'},1200)})};box.appendChild(btn);card.appendChild(box)})}
function style(){if(q('#cgActionableV237Style'))return;var s=document.createElement('style');s.id='cgActionableV237Style';s.textContent='.cgActionableV237{margin-top:12px;padding-top:12px;border-top:1px solid var(--line);display:grid;gap:6px}.cgActionableV237 p{margin:0;overflow-wrap:anywhere}.cgActionableV237 .btn{justify-self:start;margin-top:4px}';document.head.appendChild(s)}
function boot(){if(!document.body||document.body.getAttribute('data-page')!=='code-god')return;style();if(!wrap()){setTimeout(boot,40);return}var root=q('#cgFindings');if(!root){setTimeout(boot,40);return}observer=new MutationObserver(enhance);observer.observe(root,{childList:true,subtree:true});enhance();window.CodeGodFindingsV237={version:VERSION,enhance:enhance}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();