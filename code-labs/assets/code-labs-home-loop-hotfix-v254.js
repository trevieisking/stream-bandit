/* Code Labs V254 emergency Home menu loop guard. */
(function(){
'use strict';
var tries=0,timer=0;
function settle(){
  var nav=document.querySelector('.nav');
  if(nav&&nav.querySelectorAll('a[href]').length===18){
    nav.setAttribute('data-cl-nav-owner','V251-first-paint');
    document.documentElement.setAttribute('data-cl-home-loop-hotfix','v254');
  }
  tries+=1;
  if(tries>=240&&timer)clearInterval(timer);
}
settle();
timer=setInterval(settle,25);
setTimeout(function(){if(timer)clearInterval(timer);settle()},6500);
})();
