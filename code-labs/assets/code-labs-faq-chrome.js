/* Code Labs FAQ title helper */
(function(){
  function q(s,r){return(r||document).querySelector(s);}
  function fix(){
    if(document.body.getAttribute('data-page')!=='faq')return;
    document.title='Code Labs - FAQ';
    var crumbs=q('.crumbs');
    if(crumbs){crumbs.innerHTML='<span>Code Labs</span><span>›</span><b>FAQ</b>';}
    var nav=q('.nav');
    if(nav&&!q('a[href="faq.html"]',nav)){
      var a=document.createElement('a');
      a.href='faq.html';
      a.className='active';
      a.innerHTML='<span>?</span><div>FAQ<small>Clear answers</small></div>';
      nav.appendChild(a);
    }
    Array.prototype.slice.call(document.querySelectorAll('.nav a')).forEach(function(a){
      if(a.getAttribute('href')==='faq.html'){a.className='active';}
      else{a.classList.remove('active');}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  setTimeout(fix,300);setTimeout(fix,900);setTimeout(fix,1600);setTimeout(fix,2400);
})();