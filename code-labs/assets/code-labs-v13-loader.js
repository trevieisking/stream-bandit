/* Code Labs V1.3 loader */
(function(){
  function toast(msg){
    var t=document.querySelector('#toast');
    if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2600);}
  }
  function selectReport(){
    var box=document.querySelector('#clCodeSearchOut');
    if(box){box.focus();box.select();toast('Report selected. Press Ctrl+C or copy.');}
  }
  function wireReportButton(){
    var btn=document.querySelector('#clCopySearchReport');
    if(btn&&!btn.getAttribute('data-select-report-wired')){
      btn.setAttribute('data-select-report-wired','yes');
      btn.onclick=selectReport;
    }
  }
  var s=document.createElement('script');
  s.src='assets/code-labs-v1-3-github-readonly.js?v=cl-v25-code-search-reader-2';
  document.head.appendChild(s);
  setTimeout(wireReportButton,500);
  setTimeout(wireReportButton,1200);
  setTimeout(wireReportButton,2200);
})();
