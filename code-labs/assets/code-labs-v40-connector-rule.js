/* Code Labs V4.6 - one connector rule helper with ChatGPT connector setup */
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
    setModeCard('GitHub mode','Connect GitHub','warn','Connect the GitHub connector for repo reads, test branches, PRs, previews, or merges. Use it by itself.');
    setModeCard('Supabase mode','Connect Supabase','good','Connect the Supabase connector for Code Labs table/history work. Browser Supabase status is shown below. Use it by itself.');
    setModeCard('ChatGPT app','Bridge only','warn','ChatGPT uses the connected GitHub connector for repo work through branches and PRs. The browser page itself prepares and tests work.');
  }
  function addConnectorSetupPanel(){
    if(q('#clChatGPTConnectorSetup'))return;
    var main=q('.main');if(!main)return;
    var anchor=q('#clOneConnectorRule')||q('#clConnectorBoundary')||q('.hero')||q('.panel');
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clChatGPTConnectorSetup';
    panel.innerHTML='<h2>How ChatGPT works with Code Labs</h2><p>Code Labs is a browser workbench. ChatGPT works with it through the connector chosen in this chat. Use GitHub connector for repo work or Supabase connector for database work.</p><div class="grid2"><div class="item"><b>GitHub repo path</b><p>Use this for Code Labs files, branches, pull requests, previews, and merges. ChatGPT reads GitHub main, creates a branch, opens a PR, then waits for testing before merge.</p><span class="badge warn">Connect GitHub connector</span></div><div class="item"><b>Supabase database path</b><p>Use this for Code Labs database/history/account work. It stays on Code Labs tables unless a separate Stream Bandit pass is started.</p><span class="badge warn">Connect Supabase connector</span></div></div><div class="notice"><p><b>Simple rule:</b> browser Code Labs prepares, saves, tests, and copies. ChatGPT connector does repo or database work. Use one connector at a time.</p></div>';
    if(anchor&&anchor.parentNode&&anchor.nextSibling){anchor.parentNode.insertBefore(panel,anchor.nextSibling);}else if(anchor&&anchor.parentNode){anchor.parentNode.appendChild(panel);}else{main.appendChild(panel);}
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
      panel.innerHTML='<h2>One connector at a time</h2><p>Connect one ChatGPT connector per pass. GitHub connector and Supabase connector do not run together.</p><div class="grid2"><div class="item"><b>Repo or file work</b><p>Connect GitHub when repository reading, branches, PRs, previews, or merges are needed.</p><span class="badge warn">Connect GitHub connector</span></div><div class="item"><b>Database or table work</b><p>Connect Supabase when Code Labs tables or repair history are needed.</p><span class="badge warn">Connect Supabase connector</span></div></div><div class="notice"><p><b>Separation:</b> Code Labs stays in its own lane. Stream Bandit app files, tables, auth, and policies are not changed unless the signed-in user explicitly starts a separate Stream Bandit pass.</p></div>';
      if(anchor&&anchor.parentNode&&anchor.nextSibling){anchor.parentNode.insertBefore(panel,anchor.nextSibling);}else if(anchor&&anchor.parentNode){anchor.parentNode.appendChild(panel);}else{main.appendChild(panel);}
    }
    clarifyModeCards();
    addConnectorSetupPanel();
  }
  function start(){setTimeout(addRule,360);setTimeout(addRule,900);setTimeout(addRule,1500);setTimeout(clarifyModeCards,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();