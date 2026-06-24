/* Code Labs V1.3 loader */
(function(){
  var KEY='codeLabsV1State';
  function toast(msg){
    var t=document.querySelector('#toast');
    if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2600);}
  }
  function saveReport(){
    var box=document.querySelector('#clCodeSearchOut');
    if(!box||!box.value)return;
    try{
      var s=JSON.parse(localStorage.getItem(KEY)||'{}')||{};
      s.file=s.file||{};
      s.file.codeSearchReport=box.value;
      s.file.codeSearchSavedAt=new Date().toISOString();
      localStorage.setItem(KEY,JSON.stringify(s));
    }catch(e){}
  }
  function selectReport(){
    saveReport();
    var box=document.querySelector('#clCodeSearchOut');
    if(box){box.focus();box.select();toast('Report saved and selected. Press Ctrl+C or copy.');}
  }
  function wireButtons(){
    var copy=document.querySelector('#clCopySearchReport');
    if(copy&&!copy.getAttribute('data-select-report-wired')){
      copy.setAttribute('data-select-report-wired','yes');
      copy.onclick=selectReport;
    }
    var search=document.querySelector('#clCodeSearchBtn');
    if(search&&!search.getAttribute('data-save-report-wired')){
      search.setAttribute('data-save-report-wired','yes');
      search.addEventListener('click',function(){setTimeout(saveReport,150);});
    }
  }
  var s=document.createElement('script');
  s.src='assets/code-labs-v1-3-github-readonly.js?v=cl-v50-live-user';
  document.head.appendChild(s);
  setTimeout(wireButtons,500);
  setTimeout(wireButtons,1200);
  setTimeout(wireButtons,2200);
})();