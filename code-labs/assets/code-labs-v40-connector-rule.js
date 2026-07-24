/* Code Labs V4.6 - protected one-file Writer route helper */
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
    setModeCard('GitHub mode','Protected Writer route','warn','Repository changes use an existing non-main branch, a Code God PASS, and the protected one-file Writer. GitHub remains the audit, review, preview, and merge surface.');
    setModeCard('Supabase mode','Separate approval','good','Use the separately approved Supabase route only for database, authentication, configuration, or edge-function work. It does not replace the protected repository route.');
    setModeCard('ChatGPT app','Workspace bridge','warn','ChatGPT prepares and verifies work through the Tool-Only workspace. Only the protected Writer executes an approved one-file repository change.');
  }
  function addConnectorSetupPanel(){
    if(q('#clChatGPTConnectorSetup'))return;
    var main=q('.main');if(!main)return;
    var anchor=q('#clOneConnectorRule')||q('#clConnectorBoundary')||q('.hero')||q('.panel');
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clChatGPTConnectorSetup';
    panel.innerHTML='<h2>How ChatGPT works with Code Labs</h2><p>Code Labs uses a protected repository route: Tool-Only workspace, CG Repair Lab, Code God PASS, protected one-file Writer, Draft PR, GitHub audit, then SHA-pinned merge.</p><div class="grid2"><div class="item"><b>Protected repository path</b><p>Select one exact file and an existing non-main branch. Save the complete candidate, pass Code God, then let the protected Writer commit that one reviewed file and open or reuse a Draft PR.</p><span class="badge warn">Use protected Writer route</span></div><div class="item"><b>Separate Supabase path</b><p>Use a separately approved pass for Code Labs database, history, account, authentication, configuration, or edge-function work. Keep it distinct from repository execution.</p><span class="badge warn">Require separate approval</span></div></div><div class="notice"><p><b>Safe route:</b> Tool-Only workspace -&gt; CG Repair Lab -&gt; Code God PASS -&gt; protected one-file Writer -&gt; Draft PR -&gt; GitHub audit -&gt; SHA-pinned merge.</p></div>';
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
      panel.innerHTML='<h2>Protected Code Labs route</h2><p>Prepare and prove each repository change in Code Labs before the protected one-file Writer executes it on an existing non-main branch.</p><div class="grid2"><div class="item"><b>One-file repository work</b><p>Import the immutable source, save the complete candidate, run CG Repair Lab and require Code God PASS before queueing the protected Writer.</p><span class="badge warn">Branch and Draft PR only</span></div><div class="item"><b>Database or service work</b><p>Start a separate, explicitly approved Supabase pass for database, authentication, configuration, or edge-function changes.</p><span class="badge warn">Separate approval required</span></div></div><div class="notice"><p><b>Boundary:</b> this browser page records source proof, candidate, checks, gates, and audit history. It does not commit, merge, delete, deploy, or write directly to main.</p></div>';
      if(anchor&&anchor.parentNode&&anchor.nextSibling){anchor.parentNode.insertBefore(panel,anchor.nextSibling);}else if(anchor&&anchor.parentNode){anchor.parentNode.appendChild(panel);}else{main.appendChild(panel);}
    }
    clarifyModeCards();
    addConnectorSetupPanel();
  }
  function start(){setTimeout(addRule,360);setTimeout(addRule,900);setTimeout(addRule,1500);setTimeout(clarifyModeCards,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();