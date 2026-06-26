(function(){
function add(){
var n=document.querySelector('.nav');if(!n)return;
if(document.querySelector('.nav a[href="faq.html"]'))return;
var a=document.createElement('a');
a.href='faq.html';
a.innerHTML='<span>?</span><div>FAQ<small>Clear answers</small></div>';
n.appendChild(a);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
setTimeout(add,300);setTimeout(add,900);setTimeout(add,1700);setTimeout(add,2600);
})();