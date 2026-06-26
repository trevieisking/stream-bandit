(function(){
function q(s,r){return(r||document).querySelector(s)}
function run(){
var n=q('.nav');if(!n)return;
if(!q('a[href="faq.html"]',n)){
var a=document.createElement('a');a.href='faq.html';a.innerHTML='<span>?</span><div>FAQ<small>Clear answers</small></div>';n.appendChild(a);
}
if(document.body.getAttribute('data-page')==='faq'){
document.title='Code Labs - FAQ';
var c=q('.crumbs');if(c)c.innerHTML='<span>Code Labs</span><span>›</span><b>FAQ</b>';
}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,250);setTimeout(run,800);setTimeout(run,1500);setTimeout(run,2500);
})();