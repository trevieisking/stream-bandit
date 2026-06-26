(function(){
function q(s,r){return(r||document).querySelector(s)}
function page(){return document.body.getAttribute('data-page')||'index'}
function add(){
var n=q('.nav');if(!n)return;
var link=q('a[href="faq.html"]',n);
if(!link){link=document.createElement('a');link.href='faq.html';link.innerHTML='<span>?</span><div>FAQ<small>Clear answers</small></div>';n.appendChild(link)}
if(page()==='faq'){
Array.prototype.slice.call(n.querySelectorAll('a')).forEach(function(a){a.classList.remove('active')});
link.className='active';
document.title='Code Labs - FAQ';
var c=q('.crumbs');if(c)c.innerHTML='<span>Code Labs</span><span>›</span><b>FAQ</b>';
}
}
function watch(){
add();
if(window.__clNavWatch)return;window.__clNavWatch=1;
var obs=new MutationObserver(function(){add()});
obs.observe(document.documentElement,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
setTimeout(add,80);setTimeout(add,160);setTimeout(add,320);setTimeout(add,640);setTimeout(add,1200);setTimeout(add,2000);
})();