/* Code Labs FAQ V1 - factual public FAQ and help bubble */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return(r||document).querySelector(s);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'');return true;}var a=document.createElement('textarea');a.value=text||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();return true;}
  function item(question,answer,badge){return '<div class="item"><b>'+esc(question)+'</b><p>'+esc(answer)+'</p>'+(badge?'<span class="badge '+(badge[1]||'')+'">'+esc(badge[0])+'</span>':'')+'</div>';}
  function prompt(){var s=state(),f=s.file||{},p=s.project||{};return ['CODE LABS HELP REQUEST','I am using the Code Labs FAQ page and I am stuck.','Please help me in plain English.','','Current page: FAQ','Website/project: '+(p.siteName||p.workspace||'Not set'),'Repo: '+(p.repo||'Not set'),'File: '+(f.filename||'Not set'),'Current code saved: '+String(f.currentCode||'').length+' characters','Fixed code saved: '+String(f.fixedCode||'').length+' characters','','What I need:','Tell me which Code Labs page to open next and what to copy or paste.','','Rules:','Keep Code Labs separate from Stream Bandit. Do not ask me to replace a live file unless I have previewed and saved a checkpoint.'].join('\n');}
  function render(){
    if(document.body.getAttribute('data-page')!=='faq')return;
    var main=q('.main');if(!main){setTimeout(render,160);return;}if(q('#clFaqPage'))return;
    var top=q('.topbar');
    main.innerHTML=(top?top.outerHTML:'')+
      '<section class="hero" id="clFaqPage"><div><span class="pill">Code Labs FAQ</span><h1>Clear answers before you change code.</h1><p>This FAQ explains what Code Labs is now, what each page does, what is local, what uses connectors, and what to do if you get stuck.</p><div class="actions"><a class="btn primary" href="file-lab.html">Start File Lab</a><a class="btn ghost" href="v20.html">Open Workflow Hub</a><a class="btn ghost" href="help.html">Open Help tools</a></div></div><div class="heroCard"><b>Normal safe flow</b><ol><li>File Lab: load or paste full code.</li><li>Workflow Hub: copy the right request.</li><li>Patch Desk: paste fixed code.</li><li>Preview + Test: check before live.</li><li>Checkpoints: keep rollback.</li></ol></div></section>'+ 
      '<section class="panel"><h2>What Code Labs is</h2><div class="grid3">'+
      item('What is Code Labs?','Code Labs is a browser workbench for non-coders to repair website code with a safe copy, paste, preview, and checkpoint flow. It prepares clear requests for ChatGPT and connector work.', ['Browser workbench','good'])+
      item('Does Code Labs change live files by itself?','The current Code Labs pages are manual-first. The browser pages do not directly replace live website files. The safe-change request asks for a branch and pull request, not a direct main update.', ['No direct live replace','good'])+
      item('Is Code Labs separate from Stream Bandit?','Yes. Code Labs keeps its wording, menu, repair flow, and connector guidance separate. Code Labs can reference the same repo or project when approved, but the user flow stays Code Labs-specific.', ['Separate lane','good'])+
      '</div></section>'+ 
      '<section class="panel"><h2>Page-by-page FAQ</h2><div class="grid2">'+
      item('What does Home do?','Home explains the simple flow, shows the current repair state, and links to File Lab, Workflow Hub, Patch Desk, Help, and the advanced Patch Lab.')+
      item('What does File Lab do?','File Lab stores the full current file in this browser. It can paste/upload a file, load a public GitHub file read-only, and make a Code Search report for exact line evidence.')+
      item('What does Workflow Hub do?','Workflow Hub builds copyable requests for read, code generation, review, exact patch, safe test branch, GitHub connector help, and Supabase connector help.')+
      item('What does Patch Desk do?','Patch Desk is the normal place to paste the full fixed file from ChatGPT, compare original vs fixed, save fixed code, checkpoint it, copy it, or download it.')+
      item('What does Preview + Test do?','Preview + Test opens the saved original or fixed code inside the browser, lets you switch desktop/mobile width, and saves PASS or FAIL test notes.')+
      item('What do Checkpoints do?','Checkpoints save rollback copies in this browser. They can be copied or restored as current code or fixed code.')+
      item('What does Patch Lab do?','Patch Lab is an advanced exact-edit tool. It searches exact text, replaces selected matches, replaces line ranges, and saves a full fixed output. It has a safety gate before promotion.')+
      item('What does Help do?','Help contains public guidance, local utility tools, safe-change packet builder, raw GitHub link builder, HTML safety checker, Supabase/history guidance, and feedback.')+
      '</div></section>'+ 
      '<section class="panel"><h2>Safety and storage FAQ</h2><div class="grid2">'+
      item('Where is repair data saved?','Most repair state is saved in browser localStorage under the Code Labs state. Export repair job downloads a JSON backup. Clear all test data resets this browser copy.')+
      item('What does Supabase Repair History do?','When a signed-in Supabase user is available, the history panel can save Code Labs projects, files, jobs, versions, packets, tests, and audit logs to dedicated Code Labs tables. GitHub remains separate.')+
      item('What does GitHub Read-Only Loader do?','It fetches public raw GitHub file text into File Lab. It does not commit, push, delete, or change any repo file.')+
      item('What should be tested before promotion?','Check the page opens, menu/buttons work, mobile looks acceptable, no obvious error text appears, and a checkpoint exists before replacing a live file.')+
      '</div></section>'+ 
      '<section class="panel"><h2>Connector FAQ</h2><div class="grid2">'+
      item('When do I use GitHub connector help?','Use GitHub connector help for repo reads, branches, pull requests, previews, and merges. Code Labs asks for read first, then branch/PR work when approved.')+
      item('When do I use Supabase connector help?','Use Supabase connector help for Code Labs repair history or database/table planning. It should not be mixed with GitHub repo work in the same request.')+
      item('Why one connector at a time?','One connector at a time keeps the task clear. GitHub is for files and PRs. Supabase is for Code Labs data and history.')+
      item('Does the browser contain a service-role key?','No. The browser layer uses a publishable Supabase key for client access. Privileged database or connector work must be handled outside the browser with reviewed permission.')+
      '</div></section>'+ 
      '<section class="panel"><h2>If you get stuck</h2><p>Use the help bubble in the bottom-right corner. It copies a clear Code Labs help request, then opens ChatGPT in the browser so you can paste it.</p><div class="actions"><button class="btn primary" id="clFaqCopyPrompt">Copy stuck prompt</button><button class="btn ghost" id="clFaqOpenChat">Open ChatGPT</button></div><textarea id="clFaqPrompt" class="mid" readonly></textarea></section>'+ 
      '<div class="footerNote">Code Labs FAQ · factual public guide based on the current 8-page Code Labs build and attached scripts.</div>';
    q('#clFaqPrompt').value=prompt();
    q('#clFaqCopyPrompt').onclick=function(){copyText(prompt());q('#clFaqPrompt').value=prompt();};
    q('#clFaqOpenChat').onclick=function(){copyText(prompt());window.open('https://chatgpt.com/','_blank','noopener');};
    addBubble();
  }
  function addBubble(){
    if(q('#clAskBubble'))return;
    var b=document.createElement('button');b.id='clAskBubble';b.type='button';b.textContent='Need help? Ask ChatGPT';
    b.setAttribute('aria-label','Copy a Code Labs help request and open ChatGPT');
    b.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;border:0;border-radius:999px;padding:14px 18px;font-weight:950;background:linear-gradient(135deg,#245bff,#7538ff);color:white;box-shadow:0 18px 50px rgba(20,32,58,.28);cursor:pointer';
    b.onclick=function(){copyText(prompt());window.open('https://chatgpt.com/','_blank','noopener');};
    document.body.appendChild(b);
  }
  function start(){setTimeout(render,240);setTimeout(render,900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();