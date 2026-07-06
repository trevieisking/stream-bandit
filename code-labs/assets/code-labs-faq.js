/* Code Labs FAQ V154 - setup-first public FAQ */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return(r||document).querySelector(s);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function copyText(text){if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'');return true;}var a=document.createElement('textarea');a.value=text||'';document.body.appendChild(a);a.select();document.execCommand('copy');a.remove();return true;}
  function item(question,answer,badge){return '<div class="item"><b>'+esc(question)+'</b><p>'+esc(answer)+'</p>'+(badge?'<span class="badge '+(badge[1]||'')+'">'+esc(badge[0])+'</span>':'')+'</div>';}
  function prompt(){var s=state(),f=s.file||{},p=s.project||{};return ['CODE LABS HELP REQUEST','I am using the current Code Labs FAQ and I am stuck.','Please help me in plain English.','','Current page: FAQ','Website/project: '+(p.siteName||p.workspace||'Not set'),'Repo: '+(p.repo||'Not set'),'File: '+(f.filename||'Not set'),'Current code saved: '+String(f.currentCode||'').length+' characters','Fixed code saved: '+String(f.fixedCode||'').length+' characters','','What I need:','Tell me which Code Labs page to open next and what to copy, paste, test, or checkpoint.','','Rules:','Start with Setup if the project and repo are not saved. Keep Code Labs separate from Stream Bandit. Do not tell me to promote a live file until Preview + Test and Checkpoints are done.'].join('\n');}
  function render(){
    if(document.body.getAttribute('data-page')!=='faq')return;
    var main=q('.main');if(!main){setTimeout(render,160);return;}if(q('#clFaqPage'))return;
    var top=q('.topbar');
    main.innerHTML=(top?top.outerHTML:'')+
      '<section class="hero" id="clFaqPage"><div><span class="pill">Code Labs FAQ</span><h1>Clear answers for the current Code Labs workflow.</h1><p>This FAQ explains what Code Labs is for, how to start in Setup, what each page does, what is stored locally, what uses repair history, and how the GitHub handoff pages fit into the repair lane.</p><div class="actions"><a class="btn primary" href="setup.html">Start Setup</a><a class="btn good" href="file-lab.html">Open File Lab</a><a class="btn ghost" href="about.html">About Code Labs</a></div></div><div class="heroCard"><b>Normal safe flow</b><ol><li>Setup: save project, site, repo, mode, and notes.</li><li>File Lab: load or paste full code.</li><li>Rescue Room: describe the problem.</li><li>Packet Builder and Buddy Canvas: prepare and review the assistant route.</li><li>Workflow Hub: choose the request route.</li><li>Patch Desk or Patch Lab: save fixed output.</li><li>Preview + Test: check before live.</li><li>Checkpoints: keep rollback.</li><li>GitHub Writer and Tracker: record branch/PR follow-up.</li></ol></div></section>'+ 
      '<section class="panel"><h2>What Code Labs is</h2><div class="grid3">'+
      item('What is Code Labs?','Code Labs is a ChatGPT repair room for website owners and non-coders. It helps collect setup details, full-file context, problem notes, protected rules, fixed output, preview tests, checkpoints, repository follow-up, and repair history.', ['Repair room','good'])+
      item('Who is Code Labs for?','It is for people maintaining website files who need ChatGPT help but do not want to lose working menus, media, page behaviour, routes, or accessibility features.', ['Non-coder friendly','good'])+
      item('Is Code Labs the Stream Bandit app?','No. Stream Bandit is the movie and streaming product. Code Labs is the separate maintenance lane used to scan, repair, test, checkpoint, document, and promote changes.', ['Separate lane','good'])+
      '</div></section>'+ 
      '<section class="panel"><h2>Page-by-page FAQ</h2><div class="grid2">'+
      item('What does Home do?','Home explains the current Code Labs purpose, shows the repair state from browser storage, and sends users to Setup first.')+
      item('What does Setup do?','Setup stores the project, site, repo, mode, and notes before File Lab and the main repair workflow.')+
      item('What does About do?','About explains exactly what Code Labs is, what it protects, how the main workflow works, and how it stays separate from the Stream Bandit app.')+
      item('What does File Lab do?','File Lab stores the current target file in the browser. It can paste or load the full file and keep the filename and source code together for ChatGPT context.')+
      item('What does Rescue Room do?','Rescue Room is where the user says what is broken, what must not change, and what errors or screenshot notes matter.')+
      item('What does Packet Builder do?','Packet Builder turns the current source and problem notes into the assistant repair packet before Buddy Canvas or the next route.')+
      item('What does Buddy Canvas do?','Buddy Canvas is the assistant/source-proof lane for full-code review and repair-history context before the workflow continues.')+
      item('What does Workflow Hub do?','Workflow Hub chooses the route: read request, repair request, review, exact patch, GitHub help, or data/history help.')+
      item('What does Patch Desk do?','Patch Desk is the normal full-file lane. Paste the complete fixed file, save it, checkpoint it, copy it, download it, or move to Preview + Test.')+
      item('What does Patch Lab do?','Patch Lab is the careful manual fallback. It supports exact search/replace, line-range repair, a ChatGPT recipe box, a safety gate, and full fixed output for Preview + Test.')+
      item('What does Preview + Test do?','Preview + Test opens the saved code in the browser, lets you check desktop and mobile, and saves PASS or FAIL notes.')+
      item('What do Checkpoints do?','Checkpoints keep rollback versions. The latest checkpoint is shown first and older checkpoints can be expanded.')+
      item('What does Repo Desk do?','Repo Desk confirms the target path, repo action, notes, and handoff facts before GitHub Writer is used.')+
      item('What does GitHub Writer do?','GitHub Writer prepares a clear branch and pull request handoff for one target file. It is where the final file body, action, branch name, and notes are collected.')+
      item('What does GitHub Tracker do?','GitHub Tracker records the PR or review link, preview link, checklist status, and the report to send back to ChatGPT.')+
      '</div></section>'+ 
      '<section class="panel"><h2>Safety and storage FAQ</h2><div class="grid2">'+
      item('Where is the current repair saved?','Most working state is saved in this browser using Code Labs local storage. Export state can save a local JSON backup.')+
      item('What is repair history?','Repair history can save Code Labs projects, files, jobs, versions, packets, tests, and audit notes to dedicated Code Labs tables when connected.')+
      item('Does Code Labs replace live pages by itself?','The browser workflow is designed around read, preview, test, checkpoint, and reviewed follow-up. The user should not promote anything until testing and checkpoints are done.', ['Test first','warn'])+
      item('What should I test before promotion?','Check that the page opens, buttons work, mobile layout is acceptable, no obvious error text appears, key saves still work where relevant, and a checkpoint exists.')+
      item('Why does Code Labs ask for a full file?','Full files reduce guessing. A tiny snippet can miss working logic, scripts, styles, settings, routes, or data calls that must be preserved.')+
      '</div></section>'+ 
      '<section class="panel"><h2>Connector FAQ</h2><div class="grid2">'+
      item('When do I use GitHub help?','Use GitHub help when a repo file needs branch, pull request, preview, merge, or tracking work. Keep it focused on one clear target path.')+
      item('When do I use data/history help?','Use data/history help for Code Labs Repair History, table checks, data policy questions, or database planning. Keep it separate from GitHub file tasks.')+
      item('Why one connector lane at a time?','One lane at a time keeps the job clear. GitHub is for repo files and PR tracking. Data/history tools are for Code Labs records and repair history.')+
      item('What is Read-Only Proof?','Read-Only Proof checks that the backend can read Code Labs history safely. It is a proof page, not the everyday repair lane.')+
      '</div></section>'+ 
      '<section class="panel"><h2>If you get stuck</h2><p>Use this prompt to ask ChatGPT for the next safe Code Labs click. It includes your current project, repo, file, and saved-code character counts.</p><div class="actions"><button class="btn primary" id="clFaqCopyPrompt">Copy stuck prompt</button><button class="btn ghost" id="clFaqOpenChat">Open ChatGPT</button></div><textarea id="clFaqPrompt" class="mid" readonly></textarea></section>'+ 
      '<div class="footerNote">Code Labs FAQ V154 - Setup-first public guide for the live repair workflow.</div>';
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
