(function(){
function q(s,r){return(r||document).querySelector(s)}
function addLink(href,icon,title,small){var n=q('.nav');if(!n||q('.nav a[href="'+href+'"]'))return;var a=document.createElement('a');a.href=href;a.innerHTML='<span>'+icon+'</span><div>'+title+'<small>'+small+'</small></div>';n.appendChild(a)}
function add(){addLink('publish-prep.html','🚀','GitHub Writer','File handoff');addLink('github-tracker.html','🔎','GitHub Tracker','PR and preview');addLink('about.html','ℹ️','About','What Code Labs does');addLink('faq.html','?','FAQ','Clear answers')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
setTimeout(add,300);setTimeout(add,900);setTimeout(add,1700);setTimeout(add,2600);
})();
