/* Code Labs V3.5 - live use pack home guidance, product-neutral copy */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return(r||document).querySelector(s)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function chars(t){return String(t||'').length}
  function lines(t){return String(t||'').split(/\r?\n/).length}
  function step(n,title,text,href,btn,kind){return '<div class="card step"><div class="num">'+n+'</div><div><b>'+esc(title)+'</b><p>'+esc(text)+'</p><div class="actions"><a class="btn '+(kind||'primary')+'" href="'+href+'">'+esc(btn)+'</a></div></div></div>'}
  function render(){
    if(document.body.getAttribute('data-page')!=='index')return;
    var main=q('.main');
    if(!main){setTimeout(render,180);return}
    if(q('#clHomeLiveCentre'))return;
    var s=state(), f=s.file||{}, p=s.project||{};
    var top=q('.topbar');
    main.innerHTML=(top?top.outerHTML:'')+
      '<section class="hero" id="clHomeLiveCentre"><div><span class="pill">Simple Code Labs flow</span><h1>Fix website code with one clear path.</h1><p>Use Code Labs as a focused browser workbench. Load or paste a file, ask ChatGPT, paste the fixed file, preview it, then keep a checkpoint before anything goes live.</p><div class="actions"><a class="btn primary" href="file-lab.html">Start: File Lab</a><a class="btn ghost" href="patch-desk.html">Open Patch Desk</a><a class="btn ghost" href="help.html">60-second help</a></div></div><div class="heroCard"><b>Main flow</b><ol><li>File Lab: load or paste code.</li><li>Workflow Hub: ask ChatGPT.</li><li>Patch Desk: paste the fixed file.</li><li>Preview + Test: check before live.</li><li>Checkpoints: keep rollback.</li></ol></div></section>'+ 
      '<section class="panel"><h2>Use Code Labs in 60 seconds</h2><div class="grid3"><div class="item"><b>1. Start with the full file</b><p>Use File Lab to load or paste the complete broken file. Full files stop hidden logic being lost.</p></div><div class="item"><b>2. Copy the right request</b><p>Use Workflow Hub to ask ChatGPT for read, generate, review, exact patch, or safe test help.</p></div><div class="item"><b>3. Preview before live</b><p>Use Patch Desk, Preview + Test, then Checkpoints. Do not replace a live file until the preview is checked.</p></div></div><div class="actions"><a class="btn good" href="v20.html">Open Workflow Hub</a><a class="btn ghost" href="help.html">Open Help</a></div></section>'+ 
      '<section class="panel"><h2>Current repair state</h2><div class="grid3"><div class="stat"><b>Project</b><span>'+esc(p.siteName||p.workspace||'Not set')+'</span></div><div class="stat"><b>File</b><span>'+esc(f.filename||'No file yet')+'</span></div><div class="stat"><b>Current code</b><span>'+lines(f.currentCode||'')+' lines · '+chars(f.currentCode||'')+' chars</span></div></div></section>'+ 
      '<section class="grid">'+
      step(1,'File Lab','Load a public GitHub file or paste full code. Use Code Search only when you need exact line evidence.','file-lab.html','Start here','primary')+
      step(2,'Workflow Hub','Build the ChatGPT request. This is where the repair instructions are copied from.','v20.html','Ask ChatGPT','good')+
      step(3,'Patch Desk','Paste the full fixed file from ChatGPT, compare it, and save a checkpoint before preview.','patch-desk.html','Paste fixed file','primary')+
      step(4,'Preview + Test','Open the fixed result before live replacement. Keep the check simple: opens, buttons visible, no obvious break.','preview-test.html','Preview','ghost')+
      step(5,'Checkpoints','Save rollback/test notes before any live change.','checkpoints.html','Checkpoint','ghost')+
      '</section>'+ 
      '<section class="panel"><h2>Advanced tool kept</h2><p>Patch Lab is still available for exact line changes, but Patch Desk is the normal workflow patch page.</p><div class="actions"><a class="btn ghost" href="patch-lab.html">Open advanced Patch Lab</a></div></section>'+ 
      '<div class="footerNote">Code Labs V3.5 · Live Use Pack · Home → File Lab → Workflow Hub → Patch Desk → Preview + Test → Checkpoints.</div>';
  }
  function start(){setTimeout(render,240);setTimeout(render,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();