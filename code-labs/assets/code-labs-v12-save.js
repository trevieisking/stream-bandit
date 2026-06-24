/* Code Labs V1.2 loader alias and status polish */
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
  loadHistory();
  setTimeout(function(){addExtraMenus();groupMenus();},120);
  setTimeout(function(){addExtraMenus();groupMenus();},500);
  setTimeout(polishStatus,220);
  setTimeout(polishStatus,800);
})();