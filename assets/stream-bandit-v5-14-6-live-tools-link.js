/* Stream Bandit V5.14.6 — Live Tools Page Link
   Adds a safe Tools page link to the live app menu/Admin area.
   The Rating Calculator remains standalone on tools-v5-14.html.
   No Supabase writes, no movie saves, no Mux, no player, no Sound Booster, no database changes. */
(function(){
'use strict';

var VERSION='V5.14.6';
var TOOLS_URL='tools-v5-14.html';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function side(){return document.querySelector('.side')||document.querySelector('aside')||null;}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function addStyle(){
  if(document.getElementById('sb5146ToolsLinkStyle'))return;
  var st=document.createElement('style');
  st.id='sb5146ToolsLinkStyle';
  st.textContent='\n.sb5146ToolsBtn{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;text-align:left!important;text-decoration:none!important;border:0!important;border-radius:18px!important;padding:12px 14px!important;margin:0 0 8px!important;background:linear-gradient(135deg,rgba(255,45,133,.20),rgba(124,60,255,.22))!important;color:#f6f7ff!important;font-weight:950!important;box-shadow:0 12px 28px rgba(0,0,0,.22)!important;cursor:pointer!important}.sb5146ToolsBtn:hover{filter:brightness(1.12)}.sb5146ToolsCard{margin:12px 0;padding:14px;border-radius:20px;background:linear-gradient(135deg,rgba(61,220,151,.12),rgba(124,60,255,.12));border:1px solid rgba(61,220,151,.25);color:#f6f7ff}.sb5146ToolsCard h3{margin:0 0 6px}.sb5146ToolsCard p{margin:0 0 10px;color:var(--muted,#a9afc3);line-height:1.45}.sb5146ToolsCard a{display:inline-flex;text-decoration:none;border-radius:14px;padding:10px 13px;background:linear-gradient(135deg,#ff2d85,#7c3cff);color:#fff;font-weight:950}\n';
  document.head.appendChild(st);
}
function openTools(){window.location.href=TOOLS_URL;}
function adminGroupBody(){
  var s=side(); if(!s)return null;
  var groups=Array.prototype.slice.call(s.querySelectorAll('.sb56Group,details'));
  var admin=groups.find(function(g){return /admin tools/i.test(text(g.querySelector('summary')||g));});
  return admin&&(admin.querySelector('.sb56GroupBody')||admin);
}
function removeOldRatingMenu(){
  var body=adminGroupBody();
  if(!body)return;
  Array.prototype.slice.call(body.querySelectorAll('button,a')).forEach(function(el){
    var t=text(el).toLowerCase();
    var id=String(el.id||'').toLowerCase();
    var cls=String(el.className||'').toLowerCase();
    if(id.indexOf('sb57')>-1 || cls.indexOf('sb57')>-1 || t==='⭐ rating calculator' || t==='rating calculator' || t.indexOf('rating calculator')>-1){
      if(el.id!=='sb5146ToolsBtn'){
        try{el.remove();}catch(e){el.style.display='none';}
      }
    }
  });
}
function addSidebarLink(){
  addStyle();
  var body=adminGroupBody();
  if(!body)return;
  removeOldRatingMenu();
  Array.prototype.slice.call(body.querySelectorAll('#sb5146ToolsBtn')).slice(1).forEach(function(old){try{old.remove();}catch(e){}});
  var btn=document.getElementById('sb5146ToolsBtn');
  if(!btn){
    btn=document.createElement('button');
    btn.type='button';
    btn.id='sb5146ToolsBtn';
    btn.className='sb5146ToolsBtn';
    btn.innerHTML='🧰 Tools Page';
    body.insertBefore(btn,body.firstChild);
  }
  btn.onclick=openTools;
}
function addAdminCard(){
  var m=main(); if(!m)return;
  var p=pageTitle();
  if(p!=='admin' && p.indexOf('supabase movie manager')===-1)return;
  if(document.getElementById('sb5146ToolsCard'))return;
  var card=document.createElement('div');
  card.id='sb5146ToolsCard';
  card.className='sb5146ToolsCard';
  card.innerHTML='<h3>'+VERSION+' Tools page link</h3><p>Helper tools such as Rating Calculator now live on their own standalone Tools page, away from Admin and Manager render battles.</p><a href="'+TOOLS_URL+'">Open Tools page</a>';
  var top=m.querySelector('.top')||m.firstElementChild;
  if(top)top.insertAdjacentElement('afterend',card);else m.insertAdjacentElement('afterbegin',card);
}
function run(){addSidebarLink();addAdminCard();}
var mo=new MutationObserver(function(){setTimeout(run,160);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1400);
setTimeout(run,900);
})();
