/* Code Labs V4.0 - Repo Desk final workflow step */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return(r||document).querySelector(s)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function chars(t){return String(t||'').length}
  function lines(t){return String(t||'').split(/\r?\n/).length}
  function navItem(href,icon,title,small){var a=document.createElement('a');a.href=href;a.innerHTML='<span>'+icon+'</span><div>'+esc(title)+'<small>'+esc(small)+'</small></div>';return a}
  function addNav(){
    var n=q('.nav');if(!n)return;
    if(!q('a[href="repo-desk.html"]',n)){n.appendChild(navItem('repo-desk.html','🗄️','Repo Desk','GitHub file work'))}
    if(!q('a[href="faq.html"]',n)){n.appendChild(navItem('faq.html','?','FAQ','Clear answers'))}
  }
  function step(n,title,text,href,btn,kind){return '<div class="card step"><div class="num">'+n+'</div><div><b>'+esc(title)+'</b><p>'+esc(text)+'</p><div class="actions"><a class="btn '+(kind||'primary')+'" href="'+href+'">'+esc(btn)+'</a></div></div></div>'}
  function render(){
    if(document.body.getAttribute('data-page')!=='index')return;
    var main=q('.main');
    if(!main){setTimeout(render,180);return}
    addNav();
    if(q('#clHomeLiveCentre'))return;
    var s=state(), f=s.file||{}, p=s.project||{};
    var top=q('.topbar');
    main.innerHTML=(top?top.outerHTML:'')+
      '<section class="hero" id="clHomeLiveCentre"><div><span class="pill">Simple Code Labs flow</span><h1>Fix website code with one clear path.</h1><p>Use Code Labs as a focused browser workbench. Load or paste a file, use Rescue Room for safe repair prep, ask ChatGPT, paste the fixed file, preview it, keep a checkpoint, then finish in Repo Desk for controlled GitHub file work.</p><div class="actions"><a class="btn primary" href="file-lab.html">Start: File Lab</a><a class="btn ghost" href="rescue-room.html">Open Rescue Room</a><a class="btn ghost" href="patch-desk.html">Open Patch Desk</a><a class="btn good" href="repo-desk.html">Final: Repo Desk</a><a class="btn ghost" href="help.html">60-second help</a><a class="btn ghost" href="faq.html">FAQ</a></div></div><div class="heroCard"><b>Main flow</b><ol><li>File Lab: load or paste code.</li><li>Rescue Room: check the repair path.</li><li>Workflow Hub: ask ChatGPT.</li><li>Patch Desk: paste the fixed file.</li><li>Preview + Test: check before live.</li><li>Checkpoints: keep rollback.</li><li>Repo Desk: controlled GitHub file work.</li></ol></div></section>'+ 
      '<section class="panel"><h2>Use Code Labs in 60 seconds</h2><div class="grid3"><div class="item"><b>1. Start with the full file</b><p>Use File Lab to load or paste the complete broken file. Full files stop hidden logic being lost.</p></div><div class="item"><b>2. Preview and checkpoint first</b><p>Use Rescue Room, Workflow Hub, Patch Desk, Preview + Test, then Checkpoints before any GitHub file-work step.</p></div><div class="item"><b>3. Finish in Repo Desk</b><p>Repo Desk is the final lane for read, add, change, delete verified test-file, and PR tracking requests.</p></div></div><div class="actions"><a class="btn good" href="rescue-room.html">Open Rescue Room</a><a class="btn ghost" href="v20.html">Open Workflow Hub</a><a class="btn good" href="repo-desk.html">Final: Repo Desk</a><a class="btn ghost" href="help.html">Open Help</a><a class="btn ghost" href="faq.html">Open FAQ</a></div></section>'+ 
      '<section class="panel"><h2>Current repair state</h2><div class="grid3"><div class="stat"><b>Project</b><span>'+esc(p.siteName||p.workspace||'Not set')+'</span></div><div class="stat"><b>File</b><span>'+esc(f.filename||'No file yet')+'</span></div><div class="stat"><b>Current code</b><span>'+lines(f.currentCode||'')+' lines · '+chars(f.currentCode||'')+' chars</span></div></div></section>'+ 
      '<section class="grid">'+
      step(1,'File Lab','Load a public GitHub file or paste full code. Use Code Search only when you need exact line evidence.','file-lab.html','Start here','primary')+
      step(2,'Rescue Room','Confirm the repair path after File Lab before moving to Workflow Hub.','rescue-room.html','Rescue Room','good')+
      step(3,'Workflow Hub','Build the ChatGPT request. This is where the repair instructions are copied from.','v20.html','Ask ChatGPT','good')+
      step(4,'Patch Desk','Paste the full fixed file from ChatGPT, compare it, and save a checkpoint before preview.','patch-desk.html','Paste fixed file','primary')+
      step(5,'Preview + Test','Open the fixed result before live replacement. Keep the check simple: opens, buttons visible, no obvious break.','preview-test.html','Preview','ghost')+
      step(6,'Checkpoints','Save rollback/test notes before any GitHub file work.','checkpoints.html','Checkpoint','ghost')+
      step(7,'Repo Desk','Finish here for controlled GitHub file work: read, add, change, delete verified test files, and track PRs.','repo-desk.html','Final step','good')+
      '</section>'+ 
      '<section class="panel"><h2>Final GitHub step</h2><p>Repo Desk is now the last step in the Code Labs flow. It prepares the controlled GitHub file-work request after preview and checkpoint notes are saved.</p><div class="actions"><a class="btn good" href="repo-desk.html">Open final Repo Desk</a><a class="btn ghost" href="checkpoints.html">Back to Checkpoints</a><a class="btn ghost" href="faq.html">Open FAQ</a></div></section>'+ 
      '<div class="footerNote">Code Labs V4.0 · Repo Desk is the final workflow step for controlled GitHub file work.</div>';
    addNav();
  }
  function start(){setTimeout(render,240);setTimeout(render,900);setTimeout(addNav,1500);setTimeout(addNav,2500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();