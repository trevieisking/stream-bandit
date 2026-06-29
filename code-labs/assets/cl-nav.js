(function(){
function q(s,r){return(r||document).querySelector(s)}
function makeLink(href,icon,title,small){var a=document.createElement('a');a.href=href;a.innerHTML='<span>'+icon+'</span><div>'+title+'<small>'+small+'</small></div>';return a}
function addLink(href,icon,title,small){var n=q('.nav');if(!n||q('.nav a[href="'+href+'"]'))return;var a=makeLink(href,icon,title,small);n.appendChild(a)}
function addBuddyLink(){var n=q('.nav');if(!n||q('.nav a[href="chatgpt-buddy-tools.html"]'))return;var a=makeLink('chatgpt-buddy-tools.html','🧰','Buddy Tools','Owner index');var home=q('.nav a[href="index.html"]');if(home&&home.parentNode===n){n.insertBefore(a,home.nextSibling)}else{n.insertBefore(a,n.firstChild)}}
function buddyOn(){try{var p=new URLSearchParams(location.search);if(p.get('buddy')==='1'){localStorage.setItem('clBuddyTools','1');return true}if(p.get('hideBuddy')==='1'){localStorage.removeItem('clBuddyTools');return false}return localStorage.getItem('clBuddyTools')==='1'}catch(e){return false}}
function add(){if(buddyOn())addBuddyLink();addLink('publish-prep.html','🚀','GitHub Writer','File handoff');addLink('github-tracker.html','🔎','GitHub Tracker','PR and preview');addLink('about.html','ℹ️','About','What Code Labs does');addLink('faq.html','?','FAQ','Clear answers')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add();
setTimeout(add,120);setTimeout(add,300);setTimeout(add,700);setTimeout(add,1200);setTimeout(add,2200);setTimeout(add,3600);setTimeout(add,5200);
})();