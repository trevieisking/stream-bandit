/* Code Labs V3.1 - Home Command Centre final scan wording */
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
      '<section class="hero" id="clHomeLiveCentre"><div><span class="pill">Code Labs live-ready workbench</span><h1>ChatGPT repair room for non-coders.</h1><p>Keep the repair job in one place: load the full file, search exact lines, build the ChatGPT request, preview safely, track checkpoints, and use GitHub or Supabase only when the signed-in user connects the right tool.</p><div class="actions"><a class="btn primary" href="file-lab.html">Load + search code</a><a class="btn ghost" href="v20.html">Open Workflow Hub</a></div></div><div class="heroCard"><b>What Code Labs does</b><ol><li>Prevents long ChatGPT chats losing the job.</li><li>Stores full code and exact search evidence.</li><li>Builds safe ChatGPT repair requests.</li><li>Keeps Code Labs and Stream Bandit in separate lanes.</li></ol></div></section>'+ 
      '<section class="panel"><h2>Current repair state</h2><div class="grid3"><div class="stat"><b>Project</b><span>'+esc(p.siteName||p.workspace||'Not set')+'</span></div><div class="stat"><b>File</b><span>'+esc(f.filename||'No file yet')+'</span></div><div class="stat"><b>Current code</b><span>'+lines(f.currentCode||'')+' lines · '+chars(f.currentCode||'')+' chars</span></div><div class="stat"><b>Code Search</b><span>'+(report?'Report saved':'No report yet')+'</span></div></div></section>'+ 
      '<section class="grid">'+
      card(1,'Start Guide','Use this when the user does not know what to do first. It captures the problem in plain English.','start-guide.html','Start here','primary')+
      card(2,'File Lab + Code Search','Load a public GitHub file or paste full code, then search exact lines and make a report.','file-lab.html','Load and search','primary')+
      card(3,'Workflow Hub','Build the exact ChatGPT request. It includes the saved Code Search Report when one exists.','v20.html','Build request','good')+
      card(4,'Patch Lab','Use exact find/replace or line-range changes when a small targeted patch is safer than replacing a full file.','patch-lab.html','Patch exact lines','ghost')+
      '</section>'+ 
      '<section class="panel"><h2>Live promotion status</h2><div class="grid"><div class="item"><b>Final scan mode</b><p>Code Labs is in final GitHub-only scan mode. The shared helper cache is aligned, and new changes should be limited to proven blockers, broken labels, live promotion wording, or brand polish.</p></div><div class="item"><b>Manual first</b><p>Code Labs can work without connectors by copy/paste, Patch Desk, Patch Lab, preview, checkpoints, export, and handoff.</p></div><div class="item"><b>GitHub connector works</b><p>Use ChatGPT GitHub connector for repo reads, test branches, PRs, previews, merges, and verified cleanup after the signed-in user connects GitHub.</p></div><div class="item"><b>Supabase separate</b><p>Use Code Labs tables for repair history only when Supabase is connected. No Stream Bandit login redirects or buttons.</p></div></div></section>'+ 
      '<section class="panel"><h2>Safe publish lane</h2><div class="grid"><div class="item"><b>Existing files first</b><p>Logo and favicon work should use existing Code Labs files first. New repo files wait until the new-file cleanup rule is satisfied.</p></div><div class="item"><b>One connector at a time</b><p>Use GitHub for repo work or Supabase for Code Labs history work. Do not mix both in the same pass unless the user explicitly switches.</p></div></div><div class="actions"><a class="btn ghost" href="patch-desk.html">Patch Desk</a><a class="btn ghost" href="patch-lab.html">Patch Lab</a><a class="btn ghost" href="connector-status.html">Connector status</a><a class="btn ghost" href="repo-desk.html">Repo Desk</a><a class="btn ghost" href="checkpoints.html">Checkpoints</a><a class="btn ghost" href="preview-test.html">Preview + Test</a></div></section>'+ 
      '<div class="footerNote">Code Labs V3.1 Home Command Centre · durable ChatGPT workbench · final GitHub scan mode · existing-file brand polish.</div>';
  }
  function start(){setTimeout(render,240);setTimeout(render,900)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();