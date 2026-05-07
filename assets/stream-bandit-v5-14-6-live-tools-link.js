/* Stream Bandit V5.18.1 — Live Tools Link to V5.18.1 Tools Page
   Keeps a safe Tools page link in the live menu only.
   Removes any repeated Tools cards from Admin/Supabase Manager.
   Helper tools remain standalone on tools-v5-18-1.html.
   V5.17 and V5.18 remain available as rollback fallback pages.
   No Supabase writes, no movie saves, no Mux, no player, no Sound Booster, no database changes. */
(function(){
'use strict';

var VERSION='V5.18.1';
var TOOLS_URL='tools-v5-18-1.html';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function side(){return document.querySelector('.side')||document.querySelector('aside')||null;}
function addStyle(){
  if(document.getElementById('sb5146ToolsLinkStyle'))return;
  var st=document.createElement('style');
  st.id='sb5146ToolsLinkStyle';
  st.textContent='\n.sb5146ToolsBtn{display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;text-align:left!important;text-decoration:none!important;border:0!important;border-radius:18px!important;padding:12px 14px!important;margin:0 0 8px!important;background:linear-gradient(135deg,rgba(255,45,133,.20),rgba(124,60,255,.22))!important;color:#f6f7ff!important;font-weight:950!important;box-shadow:0 12px 28px rgba(0,0,0,.22)!important;cursor:pointer!important}.sb5146ToolsBtn:hover{filter:brightness(1.12)}.sb5146ToolsCard{display:none!important}\n';
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
function removeSpawnedCards(){
  Array.prototype.slice.call(document.querySelectorAll('#sb5146ToolsCard,.sb5146ToolsCard')).forEach(function(card){
    try{card.remove();}catch(e){card.style.display='none';}
  });
  Array.prototype.slice.call(document.querySelectorAll('section,div')).forEach(function(el){
    var t=text(el).toLowerCase();
    if((t.indexOf('tools page link')>-1 || t.indexOf('open tools page')>-1) && t.indexOf('helper tools such as rating calculator')>-1){
      try{el.remove();}catch(e){el.style.display='none';}
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
  btn.title=VERSION+' standalone Tools page';
}
function run(){removeSpawnedCards();addSidebarLink();}
var mo=new MutationObserver(function(){setTimeout(run,120);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1000);
setTimeout(run,900);
})();
