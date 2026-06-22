/* Code Labs V1.1 - safety/export/import layer */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var VERSION='Code Labs V1.1 Safety Polish';
  function $(s,r){return (r||document).querySelector(s);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s||{}));}
  function now(){return new Date().toLocaleString();}
  function toast(msg){var t=$('#toast');if(!t){alert(msg);return;}t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2300);}
  function download(name,text){var blob=new Blob([text||''],{type:'application/json;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},0);}
  function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'').then(function(){toast('Copied.');});return;}var ta=document.createElement('textarea');ta.value=text||'';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Copied.');}
  function blankJob(){
    var s=state();
    s.file={filename:'index.html',currentCode:'',fixedCode:'',problem:'',dontTouch:'',errors:'',packet:'',packetType:'full-file-repair'};
    s.tests=[];
    s.log=s.log||[];
    s.log.unshift({id:'cl_'+Date.now(),date:now(),msg:'Started a new repair'});
    save(s);
  }
  function clearAll(){localStorage.removeItem(KEY);}
  function addPanel(){
    var main=$('.main');
    if(!main||$('#clSafetyTools'))return;
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clSafetyTools';
    panel.innerHTML='<h2>Safety Tools</h2><p>Use these before risky repairs. Export saves your local repair data as a file. Start New Repair clears only the current job boxes. Clear All Test Data resets Code Labs in this browser.</p><div class="actions"><button class="btn primary" id="clExportJob">Export repair job</button><label class="btn ghost" for="clImportJob" style="cursor:pointer">Import repair job</label><input id="clImportJob" type="file" accept=".json,application/json" style="display:none"><button class="btn ghost" id="clCopySummary">Copy repair summary</button><button class="btn warn" id="clStartNew">Start new repair</button><button class="btn bad" id="clClearAll">Clear all test data</button></div><div class="notice"><p><b>Safe habit:</b> export your repair job before replacing or clearing anything. This version still makes no live GitHub or Supabase writes.</p></div>';
    var footer=$('.footerNote');
    if(footer)main.insertBefore(panel,footer);else main.appendChild(panel);
    $('#clExportJob').onclick=function(){var s=state();s.exportedAt=new Date().toISOString();s.codeLabsVersion=VERSION;download('code-labs-repair-job.json',JSON.stringify(s,null,2));};
    $('#clImportJob').onchange=function(e){var f=e.target.files&&e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){try{var s=JSON.parse(String(r.result||'{}'));save(s);toast('Repair job imported. Reloading.');setTimeout(function(){location.reload();},700);}catch(err){toast('Import failed. The file was not valid JSON.');}};r.readAsText(f);};
    $('#clCopySummary').onclick=function(){var s=state(),p=s.project||{},f=s.file||{};copy(['CODE LABS REPAIR SUMMARY','Website: '+(p.siteName||'Not set'),'URL: '+(p.siteUrl||'Not set'),'Repo: '+(p.repo||'Not set'),'File: '+(f.filename||'Not set'),'Problem: '+(f.problem||'Not set'),'Original characters: '+String(f.currentCode||'').length,'Fixed characters: '+String(f.fixedCode||'').length,'Checkpoints: '+((s.checkpoints||[]).length),'Tests: '+((s.tests||[]).length)].join('\n'));};
    $('#clStartNew').onclick=function(){if(confirm('Start a new repair? This clears the current code/problem/fixed boxes, but keeps saved checkpoints.')){blankJob();location.href='file-lab.html';}};
    $('#clClearAll').onclick=function(){if(confirm('Clear all Code Labs test data in this browser? Export first if you need to keep it.')){clearAll();location.href='index.html';}};
  }
  document.addEventListener('DOMContentLoaded',function(){setTimeout(addPanel,80);});
})();
