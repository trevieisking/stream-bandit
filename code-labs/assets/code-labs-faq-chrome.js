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
    var panel=q('#clNextFlowPanel');
    if(panel){
      panel.innerHTML='<h2>FAQ navigation</h2><p><b>FAQ</b> · This extra page explains the current Code Labs build without changing the tested repair flow.</p><div class="actions"><a class="btn ghost" href="help.html">Previous: Help + Tools</a><a class="btn good" href="index.html">Next: Home</a></div>';
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fix);else fix();
  setTimeout(fix,300);setTimeout(fix,700);setTimeout(fix,1100);setTimeout(fix,1800);setTimeout(fix,2600);
})();