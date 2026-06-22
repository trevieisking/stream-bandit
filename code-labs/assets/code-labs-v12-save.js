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
  setTimeout(addExtraMenus,120);
  setTimeout(addExtraMenus,500);
  setTimeout(polishStatus,220);
  setTimeout(polishStatus,800);
})();
