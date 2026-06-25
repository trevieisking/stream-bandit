/* Code Labs V4.3 - one connector rule helper with browser-vs-ChatGPT clarity */
(function(){
  'use strict';
  function q(s,r){return (r||document).querySelector(s);}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
  function setModeCard(title,badge,kind,text){
    qa('.card').forEach(function(card){
      var h=card.querySelector('h3');
      if(!h||h.textContent.trim()!==title)return;
      var b=card.querySelector('.badge');
      if(b){b.className='badge '+(kind||'warn');b.textContent=badge;}
      var p=card.querySelector('p');
      if(p)p.textContent=text;
    });
  }
  function clarifyModeCards(){
    if(document.body.getAttribute('data-page')!=='connector-status')return;
    setModeCard('GitHub mode','Instruction only','warn','Use ChatGPT GitHub for repo reads, test branches, PRs, previews, and merges. This browser page cannot see whether ChatGPT GitHub is already connected.');
    setModeCard('Supabase mode','History below','good','Browser Supabase status is shown in the Supabase Repair History panel. Use ChatGPT Supabase only for database/table work.');
    setModeCard('ChatGPT app','Bridge only','warn','ChatGPT decides which connector is needed. Code Labs should not redirect to Stream Bandit login.');
  }
  function addRule(){
    if(document.body.getAttribute('data-page')!=='connector-status')return;
    var main=q('.main');
    if(!main){setTimeout(addRule,160);return;}
    if(!q('#clOneConnectorRule')){
      var anchor=q('#clConnectorBoundary')||q('.hero')||q('.panel');
      var panel=document.createElement('section');
      panel.className='panel';
      panel.id='clOneConnectorRule';
      panel.innerHTML='<h2>One connector at a time</h2><p>This browser page shows instructions, not ChatGPT connector sign-in state. GitHub or Supabase can be connected in ChatGPT even when this page still says which connector to use.</p><div class="grid2"><div class="item"><b>Repo or file work</b><p>Use this when GitHub is the only connector needed for repository reading, branches, PRs, previews, or merges.</p><span class="badge warn">Use ChatGPT GitHub connector</span></div><div class="item"><b>Database or table work</b><p>Use this when Supabase is the only connector needed for Code Labs tables or repair history.</p><span class="badge warn">Use ChatGPT Supabase connector</span></div></div><div class="notice"><p><b>Separation:</b> Code Labs stays in its own lane. Stream Bandit app files, tables, auth, and policies are not changed unless the signed-in user explicitly starts a separate Stream Bandit pass.</p></div>';
      if(anchor&&anchor.parentNode&&anchor.nextSibling){anchor.parentNode.insertBefore(panel,anchor.nextSibling);}else if(anchor&&anchor.parentNode){anchor.parentNode.appendChild(panel);}else{main.appendChild(panel);}
    }
    clarifyModeCards();
  }
  function start(){setTimeout(addRule,360);setTimeout(addRule,900);setTimeout(addRule,1500);setTimeout(clarifyModeCards,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();