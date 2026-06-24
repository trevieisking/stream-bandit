/* Code Labs V2.9 - Home Command Centre Patch Lab alignment */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return(r||document).querySelector(s)}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}
  function chars(t){return String(t||'').length}
  function lines(t){return String(t||'').split(/\r?\n/).length}
  function card(n,title,text,href,btn,kind){return '<div class="card step"><div class="num">'+n+'</div><div><b>'+esc(title)+'</b><p>'+esc(text)+'</p><div class="actions"><a class="btn '+(kind||'primary')+'" href="'+href+'">'+esc(btn)+'</a></div></div></div>'}
  function render(){
    if(document.body.getAttribute('data-page')!=='index')return;
    var main=q('.main');
    if(!main){setTimeout(render,180);return}
    if(q('#clHomeLiveCentre'))return;
    var s=state(), f=s.file||{}, p=s.project||{};
    var report=!!f.codeSearchReport;
    var top=q('.topbar');
    main.innerHTML=(top?top.outerHTML:'')+
      '<section class="hero" id="clHomeLiveCentre"><div><span class="pill">Code Labs live-ready path</span><h1>ChatGPT repair room for non-coders.</h1><p>Start simple, load the full file, search the code, build a clean ChatGPT request, then preview before any safe branch or pull request.</p><div class="actions"><a class="btn primary" href="file-lab.html">Load + search code</a><a class="btn ghost" href="v20.html">Open Workflow Hub</a></div></div><div class="heroCard"><b>What Code Labs does</b><ol><li>Pulls or stores full code without truncation.</li><li>Finds exact lines for ChatGPT.</li><li>Builds safe repair requests.</li><li>Keeps Stream Bandit and CL in separate lanes.</li></ol></div></section>'+ 
      '<section class="panel"><h2>Current repair state</h2><div class="grid3"><div class="stat"><b>Project</b><span>'+esc(p.siteName||p.workspace||'Not set')+'</span></div><div class="stat"><b>File</b><span>'+esc(f.filename||'No file yet')+'</span></div><div class="stat"><b>Current code</b><span>'+lines(f.currentCode||'')+' lines · '+chars(f.currentCode||'')+' chars</span></div><div class="stat"><b>Code Search</b><span>'+(report?'Report saved':'No report yet')+'</span></div></div></section>'+ 
      '<section class="grid">'+
      card(1,'Start Guide','Use this when the user does not know what to do first. It captures the problem in plain English.','start-guide.html','Start here','primary')+
      card(2,'File Lab + Code Search','Load a public GitHub file or paste full code, then search exact lines and make a report.','file-lab.html','Load and search','primary')+
      card(3,'Workflow Hub','Build the exact ChatGPT request. It includes the saved Code Search Report when one exists.','v20.html','Build request','good')+
      card(4,'Patch Lab','Use exact find/replace or line-range changes when a small targeted patch is safer than replacing a full file.','patch-lab.html','Patch exact lines','ghost')+
      '</section>'+ 
      '<section class="panel"><h2>Safe publish lane</h2><div class="grid"><div class="item"><b>Manual first</b><p>Code Labs can work without connectors by copy/paste, Patch Desk, Patch Lab, preview, checkpoints, export, and handoff.</p></div><div class="item"><b>GitHub connector works</b><p>Use ChatGPT GitHub connector for repo reads, test branches, PRs, previews, merges, and verified cleanup after Trev connects GitHub.</p></div><div class="item"><b>New file cleanup rule</b><p>Before any new repo file is created, verify three old Stream Bandit V4/V5/V6 pages or checkpoint files for cleanup. Never delete V7 or Code Labs pages for this rule.</p></div><div class="item"><b>Supabase separate</b><p>Use Code Labs tables for repair history only when Supabase is connected. No Stream Bandit login redirects or buttons.</p></div></div><div class="actions"><a class="btn ghost" href="patch-desk.html">Patch Desk</a><a class="btn ghost" href="patch-lab.html">Patch Lab</a><a class="btn ghost" href="connector-status.html">Connector status</a><a class="btn ghost" href="repo-desk.html">Repo Desk</a><a class="btn ghost" href="checkpoints.html">Checkpoints</a><a class="btn ghost" href="preview-test.html">Preview + Test</a></div></section>'+ 
      '<div class="footerNote">Code Labs V2.9 Home Command Centre · File Lab, Code Search, Workflow Hub, Patch Lab, Repo Desk, Patch Desk, and Preview are the main flow.</div>';
  }
  function start(){setTimeout(render,240);setTimeout(render,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();