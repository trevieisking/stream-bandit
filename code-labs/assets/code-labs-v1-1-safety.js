/* Code Labs V1.1 stable backup panel */
(function(){
'use strict';
var KEY='codeLabsV1State';
function q(s,r){return(r||document).querySelector(s)}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function toast(t){var x=q('#toast');if(!x)return;x.textContent=t;x.classList.add('show');setTimeout(function(){x.classList.remove('show')},1800)}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t||'').then(function(){toast('Copied')});return}var a=document.createElement('textarea');a.value=t||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied')}
function saveFile(name,text){var b=new Blob([text||''],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},0)}
function loadOne(src,attr){if(q('script['+attr+']'))return;var s=document.createElement('script');s.src=src;s.setAttribute(attr,'yes');document.head.appendChild(s)}
function loadClarity(){loadOne('assets/code-labs-workflow-clarity-v130.js?v=cl-workflow-clarity-v130','data-cl-workflow-clarity-v130');loadOne('assets/code-labs-save-language-v132.js?v=cl-save-language-v132','data-cl-save-language-v132')}
function summary(){var s=read(),p=s.project||{},f=s.file||{};return ['CODE LABS BACKUP','Website: '+(p.siteName||'Not set'),'Repo: '+(p.repo||'Not set'),'File: '+(f.filename||'Not set'),'Current chars: '+String(f.currentCode||'').length,'Fixed chars: '+String(f.fixedCode||'').length,'Checkpoints: '+((s.checkpoints||[]).length),'Tests: '+((s.tests||[]).length)].join('\n')}
function add(){loadClarity();var main=q('.main');if(!main||q('#clBackupPanel'))return;var p=document.createElement('section');p.className='panel';p.id='clBackupPanel';p.innerHTML='<h2>Backup tools</h2><p>Before promotion, keep a copy of this browser state and a short summary.</p><div class="actions"><button class="btn primary" id="clExportState">Export state</button><button class="btn ghost" id="clCopyStateSummary">Copy summary</button></div>';var f=q('.footerNote');if(f&&f.parentNode)f.parentNode.insertBefore(p,f);else main.appendChild(p);q('#clExportState').onclick=function(){saveFile('code-labs-state.json',JSON.stringify(read(),null,2))};q('#clCopyStateSummary').onclick=function(){copy(summary())}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(add,300)});else setTimeout(add,300);
})();