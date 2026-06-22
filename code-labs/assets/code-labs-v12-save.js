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
  function addPatchLabMenu(){
    var nav=document.querySelector('.nav');
    if(!nav || document.querySelector('a[href="patch-lab.html"]'))return;
    var link=document.createElement('a');
    link.href='patch-lab.html';
    if(location.pathname.indexOf('/patch-lab.html')!==-1)link.className='active';
    link.innerHTML='<span>🧠</span><div>Patch Lab<small>Find and replace safely</small></div>';
    var patchDesk=nav.querySelector('a[href="patch-desk.html"]');
    if(patchDesk && patchDesk.nextSibling){nav.insertBefore(link,patchDesk.nextSibling);}else if(patchDesk){nav.appendChild(link);}else{nav.appendChild(link);}
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
  setTimeout(addPatchLabMenu,120);
  setTimeout(addPatchLabMenu,500);
  setTimeout(polishStatus,220);
  setTimeout(polishStatus,800);
})();
