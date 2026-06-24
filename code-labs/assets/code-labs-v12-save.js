/* Code Labs V1.3 - shared menu, save, and workspace polish */
(function(){
  function loadHistory(){
    var s=document.createElement('script');
    s.src='assets/code-labs-v1-2-history.js';
    document.head.appendChild(s);
  }
  function textReplace(root,from,to){
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
    var node;
    while((node=walker.nextNode())){
      if(node.nodeValue.indexOf(from)!==-1){node.nodeValue=node.nodeValue.replace(from,to);}
    }
  }
  function addExtraMenus(){
    var nav=document.querySelector('.nav');
    if(!nav)return;
    if(!document.querySelector('a[href="start-guide.html"]')){
      var start=document.createElement('a');
      start.href='start-guide.html';
      if(location.pathname.indexOf('/start-guide.html')!==-1)start.className='active';
      start.innerHTML='<span>🟢</span><div>Start Guide<small>Tell us what broke</small></div>';
      var home=nav.querySelector('a[href="index.html"]');
      if(home && home.nextSibling){nav.insertBefore(start,home.nextSibling);}else{nav.insertBefore(start,nav.firstChild);}
    }
    if(!document.querySelector('a[href="fix-wizard.html"]')){
      var wizard=document.createElement('a');
      wizard.href='fix-wizard.html';
      if(location.pathname.indexOf('/fix-wizard.html')!==-1)wizard.className='active';
      wizard.innerHTML='<span>🧙</span><div>Fix Wizard<small>One next step</small></div>';
      var startLink=nav.querySelector('a[href="start-guide.html"]');
      if(startLink && startLink.nextSibling){nav.insertBefore(wizard,startLink.nextSibling);}else{nav.appendChild(wizard);}
    }
    if(!document.querySelector('a[href="v20.html"]')){
      var hub=document.createElement('a');
      hub.href='v20.html';
      if(location.pathname.indexOf('/v20.html')!==-1)hub.className='active';
      hub.innerHTML='<span>🧰</span><div>Workflow Hub<small>One place helper</small></div>';
      var wizardLink=nav.querySelector('a[href="fix-wizard.html"]');
      if(wizardLink && wizardLink.nextSibling){nav.insertBefore(hub,wizardLink.nextSibling);}else{nav.appendChild(hub);}
    }
    if(!document.querySelector('a[href="patch-lab.html"]')){
      var patch=document.createElement('a');
      patch.href='patch-lab.html';
      if(location.pathname.indexOf('/patch-lab.html')!==-1)patch.className='active';
      patch.innerHTML='<span>🧠</span><div>Patch Lab<small>Find and replace safely</small></div>';
      var patchDesk=nav.querySelector('a[href="patch-desk.html"]');
      if(patchDesk && patchDesk.nextSibling){nav.insertBefore(patch,patchDesk.nextSibling);}else if(patchDesk){nav.appendChild(patch);}else{nav.appendChild(patch);}
    }
    if(!document.querySelector('a[href="ai-handoff.html"]')){
      var handoff=document.createElement('a');
      handoff.href='ai-handoff.html';
      if(location.pathname.indexOf('/ai-handoff.html')!==-1)handoff.className='active';
      handoff.innerHTML='<span>🤖</span><div>AI Handoff<small>Send fix back to ChatGPT</small></div>';
      var packet=nav.querySelector('a[href="packet-builder.html"]');
      if(packet && packet.nextSibling){nav.insertBefore(handoff,packet.nextSibling);}else{nav.appendChild(handoff);}
    }
    if(!document.querySelector('a[href="publish-prep.html"]')){
      var pub=document.createElement('a');
      pub.href='publish-prep.html';
      if(location.pathname.indexOf('/publish-prep.html')!==-1)pub.className='active';
      pub.innerHTML='<span>🚦</span><div>Publish Prep<small>Safe test branch request</small></div>';
      var handoffLink=nav.querySelector('a[href="ai-handoff.html"]');
      if(handoffLink && handoffLink.nextSibling){nav.insertBefore(pub,handoffLink.nextSibling);}else{nav.appendChild(pub);}
    }
    if(!document.querySelector('a[href="repo-desk.html"]')){
      var desk=document.createElement('a');
      desk.href='repo-desk.html';
      if(location.pathname.indexOf('/repo-desk.html')!==-1)desk.className='active';
      desk.innerHTML='<span>🗄️</span><div>Repo Desk<small>Plan file work</small></div>';
      var pubLinkForDesk=nav.querySelector('a[href="publish-prep.html"]');
      if(pubLinkForDesk && pubLinkForDesk.nextSibling){nav.insertBefore(desk,pubLinkForDesk.nextSibling);}else{nav.appendChild(desk);}
    }
    if(!document.querySelector('a[href="github-tracker.html"]')){
      var tracker=document.createElement('a');
      tracker.href='github-tracker.html';
      if(location.pathname.indexOf('/github-tracker.html')!==-1)tracker.className='active';
      tracker.innerHTML='<span>🧭</span><div>GitHub Tracker<small>Track test links</small></div>';
      var repoDesk=nav.querySelector('a[href="repo-desk.html"]');
      if(repoDesk && repoDesk.nextSibling){nav.insertBefore(tracker,repoDesk.nextSibling);}else{nav.appendChild(tracker);}
    }
  }
  function groupMenus(){
    var nav=document.querySelector('.nav');
    if(!nav)return;
    var links={};
    [].slice.call(nav.querySelectorAll('a[href]')).forEach(function(a){links[a.getAttribute('href')]=a;});
    while(nav.firstChild){nav.removeChild(nav.firstChild);}
    var groups=[
      ['Start',['index.html','start-guide.html','fix-wizard.html','v20.html']],
      ['Workspace',['setup.html','project-picker.html']],
      ['Repair',['file-lab.html','rescue-room.html','packet-builder.html','patch-desk.html','patch-lab.html','preview-test.html','checkpoints.html']],
      ['Publish',['ai-handoff.html','publish-prep.html','repo-desk.html','github-tracker.html']],
      ['Connect + Help',['connector-status.html','help.html']]
    ];
    groups.forEach(function(group){
      var found=group[1].filter(function(href){return !!links[href];});
      if(!found.length)return;
      var label=document.createElement('div');
      label.className='navGroupLabel';
      label.textContent=group[0];
      nav.appendChild(label);
      found.forEach(function(href){nav.appendChild(links[href]);delete links[href];});
    });
    Object.keys(links).forEach(function(href){nav.appendChild(links[href]);});
  }
  function polishGlobal(){
    textReplace(document.body,'Manual rescue works now. GitHub and Supabase are planned connector layers.','Manual rescue works now. GitHub connector work is proven through ChatGPT, and Supabase can save Code Labs history when connected.');
  }
  function addWorkspaceLivePanel(){
    var page=document.body.getAttribute('data-page');
    if(page!=='setup'&&page!=='project-picker')return;
    var main=document.querySelector('.main');
    if(!main){setTimeout(addWorkspaceLivePanel,160);return;}
    if(document.querySelector('#clWorkspaceLivePanel'))return;
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clWorkspaceLivePanel';
    panel.innerHTML='<h2>Workspace live-ready rules</h2><p>Workspace pages save local project context for the signed-in Code Labs user. They do not write to GitHub, Supabase, or Stream Bandit app files by themselves.</p><div class="grid2"><div class="item"><b>Manual/local now</b><p>Save project name, live URL, repo path if known, and notes. Code Labs still works when connectors are unavailable.</p><span class="badge good">Ready</span></div><div class="item"><b>GitHub connector lane</b><p>Repo work happens through ChatGPT after the user connects GitHub. Use branches and PRs, not direct browser writes.</p><span class="badge good">Proven</span></div><div class="item"><b>Supabase history lane</b><p>Supabase can save Code Labs repair history when connected. It stays separate from Stream Bandit login and app tables.</p><span class="badge warn">Separate connector</span></div><div class="item"><b>Account later</b><p>Live user names should come from Code Labs profile/account data later. Do not hard-code developer names.</p><span class="badge warn">Planned</span></div></div><div class="notice"><p><b>Promotion check:</b> Setup and Project Picker pass when they save local context clearly, use signed-in-user wording, and keep Code Labs separate from Stream Bandit.</p></div>';
    var first=document.querySelector('.panel');
    if(first&&first.parentNode){first.parentNode.insertBefore(panel,first.nextSibling);}else{main.appendChild(panel);}
  }
  function addAuthDecisionPanel(){
    if(document.body.getAttribute('data-page')!=='setup')return;
    var main=document.querySelector('.main');
    if(!main){setTimeout(addAuthDecisionPanel,160);return;}
    if(document.querySelector('#clAuthDecisionPanel'))return;
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clAuthDecisionPanel';
    panel.innerHTML='<h2>Code Labs account decision</h2><p>Use guest local mode now. GitHub repo work already works through the ChatGPT GitHub connector. Real Code Labs accounts come later after user-owned rows, permissions, and server-side connector actions are ready.</p><div class="grid2"><div class="item"><b>Now</b><p>Manual/local workspace plus ChatGPT GitHub connector for repo branches, PRs, test files, and cleanup when the signed-in user connects GitHub.</p><span class="badge good">GitHub connector works</span></div><div class="item"><b>Later</b><p>Same Supabase project is allowed only if the controls, profile rows, and wording stay Code Labs-only.</p><span class="badge warn">Account mode planned</span></div></div><div class="notice"><p><b>Separation:</b> browser pages stay safe/manual. ChatGPT handles GitHub connector work when the signed-in user connects GitHub. Do not send Code Labs users to Stream Bandit login.</p></div>';
    var ref=document.querySelector('#clWorkspaceLivePanel')||document.querySelector('.panel');
    if(ref&&ref.parentNode){ref.parentNode.insertBefore(panel,ref.nextSibling);}else{main.appendChild(panel);}
  }
  function addHelpOperatingMap(){
    if(document.body.getAttribute('data-page')!=='help')return;
    var main=document.querySelector('.main');
    if(!main){setTimeout(addHelpOperatingMap,160);return;}
    if(document.querySelector('#clHelpOperatingMap'))return;
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clHelpOperatingMap';
    panel.innerHTML='<h2>Code Labs tool map for users and ChatGPT</h2><p>Code Labs exists because long ChatGPT chats can get too big to load. This app keeps the repair job in one place so ChatGPT and non-coders can continue safely.</p><div class="grid2"><div class="item"><b>Start</b><p>Home, Start Guide, and Fix Wizard explain the next safest step in plain English.</p></div><div class="item"><b>Load and search</b><p>File Lab can paste, upload, or read a public GitHub file, then Code Search makes exact line evidence.</p></div><div class="item"><b>Ask ChatGPT</b><p>Workflow Hub builds read, generator, review, exact patch, safe change, GitHub help, and Supabase help requests.</p></div><div class="item"><b>Patch and test</b><p>Patch Desk, Patch Lab, Preview + Test, and Checkpoints help save, compare, preview, and roll back.</p></div><div class="item"><b>Publish lane</b><p>AI Handoff, Publish Prep, Repo Desk, and GitHub Tracker prepare and track safe branch, PR, preview, and approval work.</p></div><div class="item"><b>Connectors</b><p>Use one connector at a time: Connect GitHub for this Code Labs user, or Connect Supabase for this Code Labs user.</p></div></div><div class="notice"><p><b>Rule:</b> Code Labs helps ChatGPT do the work for the user, and also lets the user do the same work manually when tools are unavailable. No silent writes to main, no Stream Bandit login path, and no hidden admin access.</p></div>';
    var first=document.querySelector('.panel');
    if(first&&first.parentNode){first.parentNode.insertBefore(panel,first);}else{main.appendChild(panel);}
  }
  function addPromotionChecklist(){
    var page=document.body.getAttribute('data-page');
    if(page!=='help'&&page!=='connector-status')return;
    var main=document.querySelector('.main');
    if(!main){setTimeout(addPromotionChecklist,160);return;}
    if(document.querySelector('#clPromotionChecklist'))return;
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clPromotionChecklist';
    panel.innerHTML='<h2>Live promotion menu checklist</h2><p>Work through the menu in order. A page is promotion-ready only when its purpose is clear, its buttons work, it saves or copies the right thing, and it keeps Code Labs separate from Stream Bandit.</p><div class="grid2"><div class="item"><b>1. Start</b><p>Home, Start Guide, Fix Wizard, and Workflow Hub must guide a non-coder from confusion to a clean ChatGPT request.</p></div><div class="item"><b>2. Workspace</b><p>Setup and Project Picker must save local project context and explain GitHub/Supabase lanes without Stream Bandit login wording.</p></div><div class="item"><b>3. Repair</b><p>File Lab, Rescue Room, Packet Builder, Patch Desk, Patch Lab, Preview + Test, and Checkpoints must preserve full code, exact line evidence, previews, tests, and rollback.</p></div><div class="item"><b>4. Publish</b><p>AI Handoff, Publish Prep, Repo Desk, and GitHub Tracker must prepare safe branch/PR work and track preview plus signed-in user PASS/FAIL.</p></div><div class="item"><b>5. Connect</b><p>Connector Status must show one connector at a time: GitHub for repo work or Supabase for Code Labs history work.</p></div><div class="item"><b>6. Hard stop rules</b><p>Never touch Stream Bandit V7 pages. Never create new files unless three old V4/V5/V6 Stream Bandit pages or checkpoints are verified for cleanup first.</p></div></div><div class="notice"><p><b>Promotion rule:</b> use existing Code Labs files first. GitHub main is the source of truth. Supabase schema changes need a reviewed plan before SQL.</p></div>';
    var ref=document.querySelector('#clHelpOperatingMap')||document.querySelector('.panel');
    if(ref&&ref.parentNode){ref.parentNode.insertBefore(panel,ref.nextSibling);}else{main.appendChild(panel);}
  }
  function polishSetupAndProjects(){
    var page=document.body.getAttribute('data-page');
    if(page!=='setup'&&page!=='project-picker')return;
    textReplace(document.body,'GitHub later','GitHub via ChatGPT connector');
    textReplace(document.body,'Supabase later','Supabase history when connected');
    textReplace(document.body,'GitHub and Supabase are future connector layers.','GitHub works through ChatGPT connector now. Supabase/database work uses the separate Supabase connector when the signed-in user connects it.');
    textReplace(document.body,'Manual mode is ready now; GitHub and Supabase are future connector layers.','Manual mode works now. GitHub works through ChatGPT connector, and Supabase history works when connected.');
    textReplace(document.body,'Future connector mode: load files from a repo, save fixed code to a test branch, keep rollback commits.','ChatGPT GitHub connector mode: read repo files, create test branches, open PRs, add test files, and help with verified cleanup when the signed-in user connects GitHub. Browser pages stay safe/manual.');
  }
  function polishStatus(){
    if(document.body.getAttribute('data-page')!=='connector-status')return;
    textReplace(document.body,'Supabase repair history is planned.','Supabase repair history is production-tested.');
    textReplace(document.body,'Save projects, jobs, packets, versions, and test runs in dedicated Code Labs tables.','Save projects, jobs, packets, versions, and test runs in dedicated Code Labs tables. Production-domain save/load passed.');
    var cards=[].slice.call(document.querySelectorAll('.card'));
    cards.forEach(function(card){
      var h=card.querySelector('h3');
      if(h && h.textContent.trim()==='Supabase mode'){
        var badge=card.querySelector('.badge');
        if(badge){badge.className='badge good';badge.textContent='Working';}
      }
    });
  }
  function runSharedPolish(){addExtraMenus();groupMenus();polishGlobal();addWorkspaceLivePanel();addAuthDecisionPanel();addHelpOperatingMap();addPromotionChecklist();polishSetupAndProjects();}
  loadHistory();
  setTimeout(runSharedPolish,120);
  setTimeout(runSharedPolish,500);
  setTimeout(polishStatus,220);
  setTimeout(polishStatus,800);
})();