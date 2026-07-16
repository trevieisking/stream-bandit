/* Code Labs V1.1 stable backup panel + V235 three-shell delegation. */
(function(){
'use strict';
var KEY='codeLabsV1State';
var root=document.documentElement;
root.setAttribute('data-cl-shell-loader','v235');
root.setAttribute('data-cl-shell-booting','v235');
function q(s,r){return(r||document).querySelector(s)}
function pathOf(src){try{return new URL(src,document.baseURI).pathname}catch(e){return String(src||'').split('?')[0]}}
function loadOne(src,attr,onload){var path=pathOf(src),old=Array.prototype.slice.call(document.scripts).filter(function(s){return pathOf(s.getAttribute('src')||'')===path})[0];if(old){if(onload)onload();return old}var s=document.createElement('script');s.async=false;s.src=src;s.setAttribute(attr,'yes');if(onload)s.onload=onload;document.head.appendChild(s);return s}
function ensureShell(){if(window.CodeLabsShellLoaderV235){window.CodeLabsShellLoaderV235.run();return}loadOne('assets/cl-nav.js?v=cl-v235-three-shell-loader','data-cl-shell-loader-v235')}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function toast(t){var x=q('#toast');if(!x)return;x.textContent=t;x.classList.add('show');setTimeout(function(){x.classList.remove('show')},1800)}
function copy(t){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t||'').then(function(){toast('Copied')});return}var a=document.createElement('textarea');a.value=t||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied')}
function saveFile(name,text){var b=new Blob([text||''],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},0)}
function summary(){var s=read(),p=s.project||{},f=s.file||{};return['CODE LABS BACKUP','Website: '+(p.siteName||'Not set'),'Repo: '+(p.repo||'Not set'),'File: '+(f.filename||'Not set'),'Current chars: '+String(f.currentCode||'').length,'Fixed chars: '+String(f.fixedCode||'').length,'Checkpoints: '+((s.checkpoints||[]).length),'Tests: '+((s.tests||[]).length)].join('\n')}
function restoreTitleTop(){var main=q('.main');if(!main)return;var top=q('.topbar',main),hero=q('.hero',main);if(!hero)return;if(top&&top.parentNode===main){if(main.firstElementChild!==top)main.insertBefore(top,main.firstElementChild);if(top.nextSibling!==hero)main.insertBefore(hero,top.nextSibling)}else if(main.firstElementChild!==hero)main.insertBefore(hero,main.firstElementChild);document.body.setAttribute('data-code-labs-page-intro-top','v235')}
function add(){ensureShell();restoreTitleTop();var main=q('.main');if(!main||q('#clBackupPanel'))return;var p=document.createElement('section');p.className='panel';p.id='clBackupPanel';p.innerHTML='<h2>Backup tools</h2><p>Before promotion, keep a copy of this browser state and a short summary.</p><div class="actions"><button class="btn primary" id="clExportState">Export state</button><button class="btn ghost" id="clCopyStateSummary">Copy summary</button></div>';var f=q('.footerNote');if(f&&f.parentNode)f.parentNode.insertBefore(p,f);else main.appendChild(p);q('#clExportState').onclick=function(){saveFile('code-labs-state.json',JSON.stringify(read(),null,2))};q('#clCopyStateSummary').onclick=function(){copy(summary())}}
function boot(){add()}
ensureShell();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
