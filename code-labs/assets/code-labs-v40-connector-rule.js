/* Code Labs V4.4 - one connector rule helper with explicit connector labels */
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
    setModeCard('GitHub mode','Instruction only','warn','Use the GitHub connector for repo reads, test branches, PRs, previews, or merges. Use it by itself.');
    setModeCard('Supabase mode','History below','good','Use the Supabase connector for Code Labs table/history work. Browser Supabase status is shown below. Use it by itself.');
    setModeCard('ChatGPT app','Bridge only','warn','ChatGPT chooses one connector at a time. GitHub connector and Supabase connector do not run together in one pass.');
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
      panel.innerHTML='<h2>One connector at a time</h2><p>Use one ChatGPT connector per pass. GitHub connector and Supabase connector do not run together.</p><div class="grid2"><div class="item"><b>Repo or file work</b><p>Use this when GitHub is the only connector needed for repository reading, branches, PRs, previews, or merges.</p><span class="badge warn">GitHub connector only</span></div><div class="item"><b>Database or table work</b><p>Use this when Supabase is the only connector needed for Code Labs tables or repair history.</p><span class="badge warn">Supabase connector only</span></div></div><div class="notice"><p><b>Separation:</b> Code Labs stays in its own lane. Stream Bandit app files, tables, auth, and policies are not changed unless the signed-in user explicitly starts a separate Stream Bandit pass.</p></div>';
      if(anchor&&anchor.parentNode&&anchor.nextSibling){anchor.parentNode.insertBefore(panel,anchor.nextSibling);}else if(anchor&&anchor.parentNode){anchor.parentNode.appendChild(panel);}else{main.appendChild(panel);}
    }
    clarifyModeCards();
  }
  function start(){setTimeout(addRule,360);setTimeout(addRule,900);setTimeout(addRule,1500);setTimeout(clarifyModeCards,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();