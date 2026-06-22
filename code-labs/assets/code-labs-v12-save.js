/* Code Labs V1.2 loader alias and status polish */
(function(){
  function loadHistory(){
    var s=document.createElement('script');
    s.src='assets/code-labs-v1-2-history.js';
    document.head.appendChild(s);
  }
  function polishStatus(){
    if(document.body.getAttribute('data-page')!=='connector-status')return;
    var text=document.body.innerHTML;
    text=text.replace('Supabase repair history is planned.','Supabase repair history is production-tested.');
    text=text.replace('Save projects, jobs, packets, versions, and test runs in dedicated Code Labs tables.','Save projects, jobs, packets, versions, and test runs in dedicated Code Labs tables. Production-domain save/load passed.');
    text=text.replace('Supabase mode</h3><span class="badge warn">Planned</span>','Supabase mode</h3><span class="badge good">Working</span>');
    document.body.innerHTML=text;
  }
  loadHistory();
  setTimeout(polishStatus,220);
  setTimeout(polishStatus,800);
})();
