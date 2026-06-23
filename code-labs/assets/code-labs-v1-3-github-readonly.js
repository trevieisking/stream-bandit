/* Code Labs V1.3 - GitHub read-only file loader */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function $(s,r){return (r||document).querySelector(s);}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return {};}}
  function save(s){localStorage.setItem(KEY,JSON.stringify(s||{}));}
  function toast(msg){var t=$('#toast');if(!t){alert(msg);return;}t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2600);}
  function now(){return new Date().toLocaleString();}
  function rawFromInputs(owner,repo,branch,path){return 'https://raw.githubusercontent.com/'+encodeURIComponent(owner).replace(/%2F/g,'/')+'/'+encodeURIComponent(repo).replace(/%2F/g,'/')+'/'+encodeURIComponent(branch||'main').replace(/%2F/g,'/')+'/'+String(path||'').split('/').map(encodeURIComponent).join('/');}
  function parseGitHubUrl(url){
    try{
      var u=new URL(url.trim());
      if(u.hostname==='raw.githubusercontent.com'){
        var parts=u.pathname.replace(/^\//,'').split('/');
        return {owner:parts[0]||'',repo:parts[1]||'',branch:parts[2]||'main',path:parts.slice(3).join('/'),raw:u.href};
      }
      if(u.hostname==='github.com'){
        var p=u.pathname.replace(/^\//,'').split('/');
        var blob=p.indexOf('blob');
        if(blob>=0){return {owner:p[0]||'',repo:p[1]||'',branch:p[blob+1]||'main',path:p.slice(blob+2).join('/'),raw:rawFromInputs(p[0]||'',p[1]||'',p[blob+1]||'main',p.slice(blob+2).join('/') )};}
      }
    }catch(e){}
    return null;
  }
  async function fetchText(rawUrl){
    var res=await fetch(rawUrl,{cache:'no-store'});
    if(!res.ok)throw new Error('GitHub read failed: HTTP '+res.status);
    return await res.text();
  }
  function applyLoadedFile(info,code){
    var s=state();
    s.project=s.project||{};
    s.file=s.file||{};
    s.file.filename=(info.path||'github-file.txt').split('/').pop()||'github-file.txt';
    s.file.currentCode=code||'';
    s.file.githubSource={owner:info.owner||'',repo:info.repo||'',branch:info.branch||'',path:info.path||'',raw:info.raw||'',loadedAt:new Date().toISOString(),mode:'read-only'};
    s.log=s.log||[];
    s.log.unshift({id:'cl_'+Date.now(),date:now(),msg:'Loaded GitHub file read-only: '+s.file.filename});
    save(s);
    var name=$('#filename'), box=$('#currentCode');
    if(name)name.value=s.file.filename;
    if(box){box.value=code||'';box.dispatchEvent(new Event('input',{bubbles:true}));}
    toast('GitHub file loaded read-only. Save file code when ready.');
  }
  async function loadFromPanel(){
    var status=$('#clGithubStatus');
    try{
      if(status){status.className='badge warn';status.textContent='Loading';}
      var url=($('#clGithubUrl')&&$('#clGithubUrl').value.trim())||'';
      var info=url?parseGitHubUrl(url):null;
      if(!info){
        var owner=($('#clGithubOwner')&&$('#clGithubOwner').value.trim())||'';
        var repo=($('#clGithubRepo')&&$('#clGithubRepo').value.trim())||'';
        var branch=($('#clGithubBranch')&&$('#clGithubBranch').value.trim())||'main';
        var path=($('#clGithubPath')&&$('#clGithubPath').value.trim())||'';
        if(!owner||!repo||!path)throw new Error('Add a GitHub file URL or owner/repo/path.');
        info={owner:owner,repo:repo,branch:branch,path:path,raw:rawFromInputs(owner,repo,branch,path)};
      }
      if(!info.raw||!info.path)throw new Error('That GitHub URL is not a file URL. Use a /blob/ URL or a raw file URL.');
      var code=await fetchText(info.raw);
      applyLoadedFile(info,code);
      if(status){status.className='badge good';status.textContent='Loaded read-only';}
    }catch(err){console.error(err);if(status){status.className='badge bad';status.textContent='Load failed';}toast(err.message||String(err));}
  }
  function addFileLabPanel(){
    if(document.body.getAttribute('data-page')!=='file-lab')return;
    var main=$('.main');if(!main){setTimeout(addFileLabPanel,160);return;}if($('#clGithubLoader'))return;
    var panel=document.createElement('section');panel.className='panel';panel.id='clGithubLoader';
    panel.innerHTML='<h2>GitHub Read-Only Loader</h2><p>Load a public GitHub file into File Lab without writing to GitHub. This is for copying code into the normal repair flow only.</p><div class="actions"><span id="clGithubStatus" class="badge warn">Read-only</span></div><label>GitHub file URL<input id="clGithubUrl" placeholder="https://github.com/owner/repo/blob/main/path/file.html"></label><div class="fieldRow"><label>Owner<input id="clGithubOwner" placeholder="trevieisking"></label><label>Repo<input id="clGithubRepo" placeholder="stream-bandit"></label></div><div class="fieldRow"><label>Branch<input id="clGithubBranch" value="main"></label><label>File path<input id="clGithubPath" placeholder="code-labs/index.html"></label></div><div class="actions"><button class="btn primary" id="clLoadGithubFile">Load GitHub file read-only</button><button class="btn ghost" id="clUseDemoGithub">Use Code Labs demo file</button></div><div class="notice"><p><b>Safety:</b> this reads public GitHub files only. It does not commit, push, delete, or change any repo file.</p></div>';
    var firstPanel=$('.panel');if(firstPanel&&firstPanel.parentNode){firstPanel.parentNode.insertBefore(panel,firstPanel.nextSibling);}else{main.appendChild(panel);} 
    $('#clLoadGithubFile').onclick=loadFromPanel;
    $('#clUseDemoGithub').onclick=function(){
      $('#clGithubUrl').value='https://github.com/trevieisking/stream-bandit/blob/main/code-labs/index.html';
      $('#clGithubOwner').value='trevieisking';
      $('#clGithubRepo').value='stream-bandit';
      $('#clGithubBranch').value='main';
      $('#clGithubPath').value='code-labs/index.html';
      toast('Demo GitHub file filled in. Click Load GitHub file read-only.');
    };
    addSearchPanel();
  }
  function addSearchPanel(){
    var main=$('.main');if(!main||$('#clCodeSearchPanel'))return;
    var panel=document.createElement('section');panel.className='panel';panel.id='clCodeSearchPanel';
    panel.innerHTML='<h2>Code Search</h2><p>Search the full loaded file and copy a short report for ChatGPT.</p><label>Search text<input id="clCodeSearchText" placeholder="script, supabase, function, class, error text"></label><div class="actions"><button class="btn primary" id="clCodeSearchBtn">Search code</button><button class="btn ghost" id="clCopySearchReport">Copy report</button></div><textarea id="clCodeSearchOut" class="big" readonly></textarea>';
    var footer=$('.footerNote');if(footer){main.insertBefore(panel,footer);}else{main.appendChild(panel);}
    function buildReport(){
      var s=state(),f=s.file||{},src=f.githubSource||{},code=($('#currentCode')&&$('#currentCode').value)||f.currentCode||'',needle=($('#clCodeSearchText')&&$('#clCodeSearchText').value)||'',lines=code.split(/\r?\n/),matches=[];
      if(needle){var n=needle.toLowerCase();lines.forEach(function(line,i){if(line.toLowerCase().indexOf(n)!==-1&&matches.length<60){matches.push({line:i+1,text:line});}});}
      var report=['CODE LABS CODE SEARCH REPORT','File: '+(f.filename||'Not set'),'Path: '+(src.path||'Not set'),'Repo: '+((src.owner&&src.repo)?src.owner+'/'+src.repo:'Not set'),'Branch: '+(src.branch||'Not set'),'Lines: '+lines.length,'Characters: '+code.length,'Search: '+(needle||'Not set'),'Matches: '+matches.length,'','MATCH LINES',matches.map(function(m){return m.line+': '+m.text.slice(0,260);}).join('\n')||'No matches listed','','ASK CHATGPT','Use this search report to find the safest exact fix. Ask for more line ranges if needed.'].join('\n');
      $('#clCodeSearchOut').value=report;
      return report;
    }
    $('#clCodeSearchBtn').onclick=function(){buildReport();toast('Search report made');};
    $('#clCopySearchReport').onclick=function(){copyText(buildReport());};
  }
  function setCard(title,badge,kind,text){
    var cards=[].slice.call(document.querySelectorAll('.card'));
    cards.forEach(function(card){
      var h=card.querySelector('h3');
      if(!h||h.textContent.trim()!==title)return;
      var b=card.querySelector('.badge');
      if(b){b.className='badge '+(kind||'warn');b.textContent=badge;}
      var p=card.querySelector('p');
      if(p)p.textContent=text;
    });
  }
  function polishStatus(){
    if(document.body.getAttribute('data-page')!=='connector-status')return;
    var main=$('.main');if(!main){setTimeout(polishStatus,160);return;}
    if(!$('#clConnectorBoundary')){
      var top=$('.hero');
      var panel=document.createElement('section');panel.className='panel';panel.id='clConnectorBoundary';
      panel.innerHTML='<h2>Connectors are separate</h2><p>Code Labs can use the same Stream Bandit GitHub repo and the same Supabase project, but the connector controls stay separate. No Stream Bandit login buttons belong here.</p><div class="grid2"><div class="item"><b>GitHub</b><p>For repo reads, branches, commits, PRs, previews, and merges.</p><span class="badge warn">Connect GitHub</span></div><div class="item"><b>Supabase</b><p>For Code Labs projects, repair jobs, packets, versions, checkpoints, and history tables.</p><span class="badge warn">Connect Supabase</span></div></div><div class="notice"><p><b>Plain English:</b> if I need repo code work, I will say <b>Connect GitHub please, Trev</b>. If I need database/table work, I will say <b>Connect Supabase please, Trev</b>.</p></div>';
      if(top&&top.parentNode){top.parentNode.insertBefore(panel,top.nextSibling);}else{main.appendChild(panel);}
    }
    setCard('GitHub mode','Connect GitHub','warn','Use GitHub for repo reads, test branches, PRs, previews, and merges. It is separate from Supabase.');
    setCard('Supabase mode','Connect Supabase','warn','Use Supabase for Code Labs repair history and code_labs_* tables. It is separate from GitHub.');
    setCard('ChatGPT app','Bridge only','warn','ChatGPT tells Trev which connector is needed. Code Labs should not redirect to Stream Bandit login.');
  }
  function start(){setTimeout(addFileLabPanel,220);setTimeout(addFileLabPanel,800);setTimeout(polishStatus,300);setTimeout(polishStatus,900);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
