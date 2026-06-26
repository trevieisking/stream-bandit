/* Code Labs V1.1 - safety tools and shared nav guard */
(function(){
'use strict';
var KEY='codeLabsV1State';
var VERSION='Code Labs V1.1';
function $(s,r){return(r||document).querySelector(s)}
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s||{}))}
function toast(msg){var t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2200)}
function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'').then(function(){toast('Copied')});return}var a=document.createElement('textarea');a.value=text||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();toast('Copied')}
function download(name,text){var blob=new Blob([text||''],{type:'application/json;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},0)}
function addFaq(){
var nav=$('.nav');if(!nav)return;
var link=$('a[href="faq.html"]',nav);
if(!link){link=document.createElement('a');link.href='faq.html';link.innerHTML='<span>?</span><div>FAQ<small>Clear answers</small></div>';nav.appendChild(link)}
if(document.body.getAttribute('data-page')==='faq'){
Array.prototype.slice.call(nav.querySelectorAll('a')).forEach(function(a){a.classList.remove('active')});
link.className='active';document.title='Code Labs - FAQ';
var c=$('.crumbs');if(c)c.innerHTML='<span>Code Labs</span><span>›</span><b>FAQ</b>';
}
}
function watchFaq(){addFaq();if(window.__clFaqWatch)return;window.__clFaqWatch=1;new MutationObserver(function(){addFaq()}).observe(document.documentElement,{childList:true,subtree:true})}
function blankJob(){var s=state();s.file={filename:'index.html',currentCode:'',fixedCode:'',problem:'',dontTouch:'',errors:'',packet:'',packetType:'full-file-repair'};s.tests=[];s.log=s.log||[];s.log.unshift({id:'cl_'+Date.now(),date:new Date().toLocaleString(),msg:'Started a new repair'});save(s)}
function addPanel(){
var main=$('.main');if(!main||$('#clSafetyTools'))return;
var panel=document.createElement('section');panel.className='panel';panel.id='clSafetyTools';
panel.innerHTML='<h2>Safety Tools</h2><p>Use these before risky repairs. Export saves local repair data as a file. Start New Repair clears only the current job boxes. Clear All Test Data resets Code Labs in this browser.</p><div class="actions"><button class="btn primary" id="clExportJob">Export repair job</button><label class="btn ghost" for="clImportJob" style="cursor:pointer">Import repair job</label><input id="clImportJob" type="file" accept=".json,application/json" style="display:none"><button class="btn ghost" id="clCopySummary">Copy repair summary</button><button class="btn warn" id="clStartNew">Start new repair</button><button class="btn bad" id="clClearAll">Clear all test data</button></div><div class="notice"><p><b>Safe habit:</b> export your repair job before replacing or clearing anything.</p></div>';
var footer=$('.footerNote');if(footer)main.insertBefore(panel,footer);else main.appendChild(panel);
$('#clExportJob').onclick=function(){var s=state();s.exportedAt=new Date().toISOString();s.codeLabsVersion=VERSION;download('code-labs-repair-job.json',JSON.stringify(s,null,2))};
$('#clImportJob').onchange=function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{save(JSON.parse(String(r.result||'{}')));toast('Repair job imported');setTimeout(function(){location.reload()},700)}catch(err){toast('Import failed')}};r.readAsText(f)};
$('#clCopySummary').onclick=function(){var s=state(),p=s.project||{},f=s.file||{};copy(['CODE LABS REPAIR SUMMARY','Website: '+(p.siteName||'Not set'),'URL: '+(p.siteUrl||'Not set'),'Repo: '+(p.repo||'Not set'),'File: '+(f.filename||'Not set'),'Problem: '+(f.problem||'Not set'),'Original characters: '+String(f.currentCode||'').length,'Fixed characters: '+String(f.fixedCode||'').length,'Checkpoints: '+((s.checkpoints||[]).length),'Tests: '+((s.tests||[]).length)].join('\n'))};
$('#clStartNew').onclick=function(){if(confirm('Start a new repair?')){blankJob();location.href='file-lab.html'}};
$('#clClearAll').onclick=function(){if(confirm('Clear all Code Labs test data in this browser?')){localStorage.removeItem(KEY);location.href='index.html'}};
}
document.addEventListener('DOMContentLoaded',function(){watchFaq();setTimeout(addPanel,80);setTimeout(addFaq,120);setTimeout(addFaq,520);setTimeout(addFaq,1020);setTimeout(addFaq,1820)});
})();