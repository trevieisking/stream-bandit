/* Code Labs V4.0 - one connector rule helper */
(function(){
  'use strict';
  function q(s,r){return (r||document).querySelector(s);}
  function addRule(){
    if(document.body.getAttribute('data-page')!=='connector-status')return;
    var main=q('.main');
    if(!main){setTimeout(addRule,160);return;}
    if(q('#clOneConnectorRule'))return;
    var anchor=q('#clConnectorBoundary')||q('.hero')||q('.panel');
    var panel=document.createElement('section');
    panel.className='panel';
    panel.id='clOneConnectorRule';
    panel.innerHTML='<h2>One connector at a time</h2><p>Code Labs should use one connector at a time so Trev knows exactly what is needed.</p><div class="grid2"><div class="item"><b>Repo or file work</b><p>I will say this when I need GitHub only.</p><span class="badge warn">Connect GitHub please, Trev</span></div><div class="item"><b>Database or table work</b><p>I will say this when I need Supabase only.</p><span class="badge warn">Connect Supabase please, Trev</span></div></div><div class="notice"><p><b>Separation:</b> Code Labs stays in its own lane. Stream Bandit app files, tables, auth, and policies are not changed unless Trev explicitly starts a separate Stream Bandit pass.</p></div>';
    if(anchor&&anchor.parentNode&&anchor.nextSibling){anchor.parentNode.insertBefore(panel,anchor.nextSibling);}else if(anchor&&anchor.parentNode){anchor.parentNode.appendChild(panel);}else{main.appendChild(panel);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(addRule,360);setTimeout(addRule,900);});
  else{setTimeout(addRule,360);setTimeout(addRule,900);}
})();
