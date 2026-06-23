/* Code Labs V1.3 loader */
(function(){
  window.copyText=window.copyText||function(text){
    var box=document.querySelector('#clCodeSearchOut');
    if(box){box.value=String(text||box.value||'');box.focus();box.select();}
    var t=document.querySelector('#toast');
    if(t){t.textContent='Report selected. Press Ctrl+C or copy.';t.classList.add('show');setTimeout(function(){t.classList.remove('show')},2600);}
  };
  var s=document.createElement('script');
  s.src='assets/code-labs-v1-3-github-readonly.js?v=cl-v25-code-search-reader';
  document.head.appendChild(s);
})();
