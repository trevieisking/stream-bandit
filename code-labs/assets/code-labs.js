/* Code Labs V1 - manual-first repair engine */
(function(){
  'use strict';

  var APP_VERSION = 'Code Labs V1 Manual Rescue Build';
  var PAGES = [
    ['index','Home','Start here','index.html','🏠'],
    ['setup','Setup','Workspace','setup.html','⚙️'],
    ['project-picker','Projects','Choose website','project-picker.html','🗂️'],
    ['file-lab','File Lab','Paste or load code','file-lab.html','📄'],
    ['rescue-room','Rescue Room','Describe the problem','rescue-room.html','🛟'],
    ['packet-builder','Packet Builder','Copy ChatGPT packet','packet-builder.html','📦'],
    ['patch-desk','Patch Desk','Paste fixed code','patch-desk.html','🧩'],
    ['preview-test','Preview + Test','Test before replacing','preview-test.html','🧪'],
    ['checkpoints','Checkpoints','Rollback safety','checkpoints.html','💾'],
    ['connector-status','Connector Status','Future app links','connector-status.html','🔌'],
    ['help','Help','Plain-English guide','help.html','❓']
  ];

  var KEY = 'codeLabsV1State';
  var DEFAULT_STATE = {
    project:{workspace:'',siteName:'',siteUrl:'',repo:'',mode:'manual',notes:''},
    file:{filename:'index.html',currentCode:'',fixedCode:'',problem:'',dontTouch:'',errors:'',packet:'',packetType:'full-file-repair'},
    checkpoints:[],
    tests:[],
    log:[]
  };

  function clone(obj){return JSON.parse(JSON.stringify(obj));}
  function $(sel, root){return (root||document).querySelector(sel);}
  function $all(sel, root){return Array.prototype.slice.call((root||document).querySelectorAll(sel));}
  function esc(v){return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function uid(){return 'cl_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,8);}
  function now(){return new Date().toLocaleString();}
  function state(){
    try{
      var raw = localStorage.getItem(KEY);
      if(!raw) return clone(DEFAULT_STATE);
      var saved = JSON.parse(raw);
      return Object.assign(clone(DEFAULT_STATE), saved, {
        project:Object.assign(clone(DEFAULT_STATE.project), saved.project||{}),
        file:Object.assign(clone(DEFAULT_STATE.file), saved.file||{}),
        checkpoints:Array.isArray(saved.checkpoints)?saved.checkpoints:[],
        tests:Array.isArray(saved.tests)?saved.tests:[],
        log:Array.isArray(saved.log)?saved.log:[]
      });
    }catch(e){return clone(DEFAULT_STATE);}
  }
  function save(s){localStorage.setItem(KEY, JSON.stringify(s));}
  function log(msg){var s=state();s.log.unshift({id:uid(),date:now(),msg:msg});s.log=s.log.slice(0,80);save(s);}
  function toast(msg){var t=$('#toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(function(){t.classList.remove('show');},2200);}
  function copyText(text){
    if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(text||'').then(function(){toast('Copied.');});return;}
    var ta=document.createElement('textarea');ta.value=text||'';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();toast('Copied.');
  }
  function downloadText(filename,text){
    var blob=new Blob([text||''],{type:'text/plain;charset=utf-8'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename||'code-labs-file.txt';document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},0);
  }
  function lines(text){return String(text||'').split(/\r?\n/).length;}
  function chars(text){return String(text||'').length;}
  function words(text){return String(text||'').trim()?String(text||'').trim().split(/\s+/).length:0;}
  function pageId(){return document.body.getAttribute('data-page') || 'index';}
  function pageInfo(id){return PAGES.filter(function(p){return p[0]===id;})[0] || PAGES[0];}
  function navHtml(id){return PAGES.map(function(p){return '<a class="'+(p[0]===id?'active':'')+'" href="'+p[3]+'"><span>'+p[4]+'</span><div>'+p[1]+'<small>'+p[2]+'</small></div></a>';}).join('');}
  function statusBadges(s){
    var hasProject = !!(s.project.siteName || s.project.siteUrl || s.project.repo);
    var hasCode = !!s.file.currentCode;
    var hasFixed = !!s.file.fixedCode;
    return '<span class="badge '+(hasProject?'good':'warn')+'">'+(hasProject?'Project ready':'No project yet')+'</span>'+
      '<span class="badge '+(hasCode?'good':'warn')+'">'+(hasCode?'Code loaded':'No code loaded')+'</span>'+
      '<span class="badge '+(hasFixed?'good':'warn')+'">'+(hasFixed?'Fix pasted':'No fix yet')+'</span>'+
      '<span class="badge good">'+s.checkpoints.length+' checkpoints</span>';
  }
  function shell(content){
    var id=pageId(), p=pageInfo(id), s=state();
    document.title = 'Code Labs - ' + p[1];
    document.body.innerHTML = '<div class="app"><aside class="sidebar"><div class="logo"><div class="logoMark">CL</div><div><b>Code Labs</b><small>ChatGPT repair room for non-coders</small></div></div><nav class="nav">'+navHtml(id)+'</nav><div class="sideBox"><b>Safety rule</b><p>Do not replace a live file until you have saved a checkpoint and tested the preview.</p></div><div class="sideBox"><b>Mode</b><p>Manual rescue works now. GitHub and Supabase are planned connector layers.</p></div></aside><main class="main"><div class="topbar"><div class="crumbs"><span>Code Labs</span><span>›</span><b>'+esc(p[1])+'</b></div><div>'+statusBadges(s)+'</div></div>'+content+'<div class="footerNote">'+APP_VERSION+' · Local manual mode · No live writes from these pages.</div></main></div><div id="toast" class="toast"></div>';
  }
  function hero(title,desc,steps){
    var li=(steps||[]).map(function(x){return '<li>'+esc(x)+'</li>';}).join('');
    return '<section class="hero"><div><span class="pill">Beginner safe</span><h1>'+esc(title)+'</h1><p>'+esc(desc)+'</p></div><div class="heroCard"><b>What to do here</b><ol>'+li+'</ol></div></section>';
  }
  function quickStats(){var s=state();return '<div class="grid3"><div class="stat"><b>Current file</b><span>'+esc(s.file.filename||'none')+'</span></div><div class="stat"><b>Original code</b><span>'+chars(s.file.currentCode)+'</span></div><div class="stat"><b>Fixed code</b><span>'+chars(s.file.fixedCode)+'</span></div></div>';}
  function setVal(id,val){var el=$(id); if(el) el.value=val||'';}
  function getVal(id){var el=$(id); return el?el.value:'';}
  function saveCheckpoint(kind,label,code,note){
    var s=state();
    s.checkpoints.unshift({id:uid(),kind:kind||'manual',label:label||'Checkpoint',filename:s.file.filename||'file.html',code:code||'',note:note||'',date:now()});
    s.checkpoints=s.checkpoints.slice(0,60);
    save(s);log('Saved checkpoint: '+(label||'Checkpoint'));toast('Checkpoint saved.');
  }
  function buildPacket(){
    var s=state(), f=s.file, p=s.project;
    var type = f.packetType || 'full-file-repair';
    var titleMap={
      'full-file-repair':'Full file repair',
      'console-error':'Console error fix',
      'mobile-layout':'Mobile/layout fix',
      'supabase-github':'Supabase or GitHub issue',
      'safety-review':'Safety review before changing code'
    };
    return [
      'CODE LABS CHATGPT HELP PACKET',
      'Packet type: '+(titleMap[type]||type),
      '',
      'USER LEVEL: Non-coder. Give clear instructions and avoid jargon.',
      'OUTPUT WANTED: Return a full replacement file when code is changed. Explain the test steps after the code.',
      '',
      'PROJECT',
      'Workspace: '+(p.workspace||'Not set'),
      'Website name: '+(p.siteName||'Not set'),
      'Website URL: '+(p.siteUrl||'Not set'),
      'GitHub repo: '+(p.repo||'Not set'),
      'Mode: '+(p.mode||'manual'),
      '',
      'FILE',
      'File name: '+(f.filename||'Not set'),
      '',
      'WHAT IS BROKEN',
      f.problem||'Not described yet.',
      '',
      'DO NOT TOUCH / MUST PRESERVE',
      f.dontTouch||'No special rules provided.',
      '',
      'ERRORS OR SCREENSHOT NOTES',
      f.errors||'No error notes provided.',
      '',
      'CURRENT FULL CODE STARTS BELOW',
      '```html',
      f.currentCode||'PASTE FULL CURRENT FILE HERE',
      '```',
      'CURRENT FULL CODE ENDS ABOVE',
      '',
      'IMPORTANT RULES FOR CHATGPT',
      '- Do not guess missing code if the full file is not present. Ask for the full file.',
      '- Preserve working login, saves, database, routing, and accessibility logic unless the user asked to change it.',
      '- Prefer full-file replacement for non-coders.',
      '- Include a short checklist: what to test after pasting the fixed file.'
    ].join('\n');
  }
  function compareSummary(a,b){
    var A=String(a||'').split(/\r?\n/), B=String(b||'').split(/\r?\n/);
    var max=Math.max(A.length,B.length), changed=0, same=0;
    for(var i=0;i<max;i++){if((A[i]||'')===(B[i]||'')) same++; else changed++;}
    return 'Original lines: '+A.length+'\nFixed lines: '+B.length+'\nSame line positions: '+same+'\nChanged line positions: '+changed+'\nOriginal characters: '+chars(a)+'\nFixed characters: '+chars(b)+'\nCharacter difference: '+(chars(b)-chars(a));
  }

  function renderHome(){var s=state();shell(hero('Fix website code without panic','Code Labs gives ChatGPT the full context it needs, then gives you safe copy, preview, checkpoint, and rollback steps.',['Choose or describe your website.','Paste the full broken file.','Build a ChatGPT help packet.','Paste the fixed code back and test it.'])+quickStats()+
    '<section class="grid"><div class="card step"><div class="num">1</div><div><b>Start simple</b><p>Manual mode works even when tools are blocked. Paste the file and Code Labs builds the help packet.</p><div class="actions"><a class="btn primary" href="setup.html">Start setup</a><a class="btn ghost" href="file-lab.html">Paste code</a></div></div></div><div class="card step"><div class="num">2</div><div><b>Help ChatGPT help you</b><p>The packet includes file name, full code, the problem, errors, and protected rules.</p><div class="actions"><a class="btn primary" href="packet-builder.html">Build packet</a></div></div></div><div class="card step"><div class="num">3</div><div><b>Test before replacing</b><p>Paste fixed code into Patch Desk, preview it, save a checkpoint, then copy or download.</p><div class="actions"><a class="btn primary" href="patch-desk.html">Open Patch Desk</a></div></div></div></section>'+recentPanel(s));}
  function recentPanel(s){return '<section class="panel"><h2>Current repair</h2><div class="grid"><div class="item"><b>Website</b><p>'+esc(s.project.siteName||'Not set yet')+'</p></div><div class="item"><b>File</b><p>'+esc(s.file.filename||'No file chosen')+'</p></div><div class="item"><b>Last problem</b><p>'+esc(s.file.problem||'No problem described yet')+'</p></div><div class="item"><b>Last log</b><p>'+esc((s.log[0]&&s.log[0].msg)||'No actions yet')+'</p></div></div></section>';}
  function renderSetup(){var s=state();shell(hero('Setup','Tell Code Labs what website you are fixing. You can leave GitHub and Supabase blank for manual mode.',['Fill in the fields you know.','Choose Manual if you are unsure.','Save workspace.','Move to Project Picker.'])+'<section class="panel"><h2>Workspace details</h2><div class="fieldRow"><label>Your workspace name<input id="workspace" placeholder="My repair workspace"></label><label>Website name<input id="siteName" placeholder="My website"></label></div><div class="fieldRow"><label>Website URL<input id="siteUrl" placeholder="https://example.com"></label><label>GitHub repo optional<input id="repo" placeholder="owner/repo"></label></div><div class="fieldRow"><label>Mode<select id="mode"><option value="manual">Manual paste mode</option><option value="github">GitHub later</option><option value="supabase">Supabase later</option></select></label><label>Notes<input id="notes" placeholder="Anything important about this site"></label></div><div class="notice"><p><b>Plain English:</b> Manual mode means you copy and paste code yourself. It is the safest first version and works even when tools are blocked.</p></div><div class="actions"><button class="btn primary" id="saveSetup">Save setup</button><a class="btn ghost" href="project-picker.html">Next: choose project</a></div></section>');setVal('#workspace',s.project.workspace);setVal('#siteName',s.project.siteName);setVal('#siteUrl',s.project.siteUrl);setVal('#repo',s.project.repo);setVal('#notes',s.project.notes);setVal('#mode',s.project.mode);$('#saveSetup').onclick=function(){var st=state();st.project={workspace:getVal('#workspace'),siteName:getVal('#siteName'),siteUrl:getVal('#siteUrl'),repo:getVal('#repo'),mode:getVal('#mode'),notes:getVal('#notes')};save(st);log('Saved Code Labs setup');toast('Setup saved.');};}
  function renderProjectPicker(){var s=state();shell(hero('Choose your website','Pick how Code Labs should work. Manual mode is ready now; GitHub and Supabase are future connector layers.',['Use Manual for today.','Saved project loads your local browser data.','GitHub/Supabase cards explain what comes later.'])+recentPanel(s)+'<section class="grid"><div class="card"><h3>Manual project</h3><p>Best for non-coders right now. Paste the full file, build the packet, paste the fixed file back.</p><div class="actions"><a class="btn primary" href="file-lab.html">Use manual mode</a></div></div><div class="card"><h3>GitHub project</h3><p>Future connector mode: load files from a repo, save fixed code to a test branch, keep rollback commits.</p><div class="actions"><a class="btn ghost" href="connector-status.html">View status</a></div></div><div class="card"><h3>Supabase saved project</h3><p>Future database mode: save repair jobs, versions, packets, and test runs to Code Labs tables.</p><div class="actions"><a class="btn ghost" href="connector-status.html">View status</a></div></div></section>');}
  function renderFileLab(){var s=state();shell(hero('File Lab','Put the full broken file here. Full files prevent hidden logic from being accidentally removed.',['Enter the exact file name.','Paste the full current code.','Or upload a text/code file.','Save before building a packet.'])+'<section class="layout"><div class="panel"><h2>File details</h2><label>File name<input id="filename" placeholder="index.html"></label><label>Upload file from computer<input id="fileUpload" type="file" accept=".html,.htm,.css,.js,.txt,.json,.md"></label><div class="notice"><p><b>Important:</b> Do not paste a tiny piece unless you only want an explanation. For repairs, paste the full file.</p></div><div class="actions"><button class="btn primary" id="saveFile">Save file code</button><button class="btn ghost" id="checkpointOriginal">Checkpoint original</button><a class="btn ghost" href="rescue-room.html">Next: Rescue Room</a></div></div><div class="panel codeBox"><div class="codeTools"><h2>Current full code</h2><div class="metaLine"><span id="codeStats"></span></div></div><textarea class="big" id="currentCode" placeholder="Paste the full current file here"></textarea></div></section>');setVal('#filename',s.file.filename);setVal('#currentCode',s.file.currentCode);function updateStats(){var v=getVal('#currentCode');$('#codeStats').textContent=lines(v)+' lines · '+chars(v)+' chars';}updateStats();$('#currentCode').addEventListener('input',updateStats);$('#fileUpload').addEventListener('change',function(e){var file=e.target.files[0];if(!file)return;var r=new FileReader();r.onload=function(){setVal('#filename',file.name);setVal('#currentCode',String(r.result||''));updateStats();toast('File loaded into the box.');};r.readAsText(file);});$('#saveFile').onclick=function(){var st=state();st.file.filename=getVal('#filename')||'file.html';st.file.currentCode=getVal('#currentCode');save(st);log('Saved current code for '+st.file.filename);toast('Current code saved.');};$('#checkpointOriginal').onclick=function(){saveCheckpoint('original','Original before repair',getVal('#currentCode'),'Saved from File Lab');};}
  function renderRescueRoom(){var s=state();shell(hero('Rescue Room','Describe the problem in plain English. Code Labs will turn it into a clean ChatGPT request.',['Say what is broken.','Say what must not change.','Paste any error messages.','Build the repair packet.'])+'<section class="layout"><div class="panel"><h2>Problem details</h2><label>What is broken?<textarea id="problem" class="mid" placeholder="Example: The menu opens but the links do not work on mobile."></textarea></label><label>Do not touch / must preserve<textarea id="dontTouch" placeholder="Example: Do not remove login, Supabase saves, header, footer, or accessibility buttons."></textarea></label><label>Error text or screenshot notes<textarea id="errors" placeholder="Paste console error text or describe the screenshot."></textarea></label><div class="actions"><button class="btn primary" id="saveProblem">Save problem</button><button class="btn good" id="buildPacket">Build packet now</button><a class="btn ghost" href="packet-builder.html">Open Packet Builder</a></div></div><div class="panel"><h2>Current file summary</h2>'+quickStats()+'<div class="notice"><p>If current code is empty, go back to File Lab and paste the full file first.</p></div><textarea id="packetPreview" class="mid" readonly placeholder="Your ChatGPT packet will appear here"></textarea><div class="actions"><button class="btn ghost" id="copyPacket">Copy packet</button></div></div></section>');setVal('#problem',s.file.problem);setVal('#dontTouch',s.file.dontTouch);setVal('#errors',s.file.errors);setVal('#packetPreview',s.file.packet);function saveProblem(){var st=state();st.file.problem=getVal('#problem');st.file.dontTouch=getVal('#dontTouch');st.file.errors=getVal('#errors');save(st);log('Saved repair problem');}$('#saveProblem').onclick=function(){saveProblem();toast('Problem saved.');};$('#buildPacket').onclick=function(){saveProblem();var st=state();st.file.packet=buildPacket();save(st);setVal('#packetPreview',st.file.packet);log('Built repair packet');toast('Packet built.');};$('#copyPacket').onclick=function(){copyText(getVal('#packetPreview'));};}
  function renderPacketBuilder(){var s=state();shell(hero('Packet Builder','This is the copy box for ChatGPT. It gathers the full code and the repair rules so ChatGPT does not have to guess.',['Choose packet type.','Build the packet.','Copy it into ChatGPT.','Paste the fixed code into Patch Desk.'])+'<section class="panel"><div class="fieldRow"><label>Packet type<select id="packetType"><option value="full-file-repair">Full file repair</option><option value="console-error">Console error fix</option><option value="mobile-layout">Mobile/layout fix</option><option value="supabase-github">Supabase or GitHub issue</option><option value="safety-review">Safety review</option></select></label><label>File name<input id="packetFile" placeholder="index.html"></label></div><div class="actions"><button class="btn primary" id="makePacket">Build ChatGPT Help Packet</button><button class="btn ghost" id="copyPacket2">Copy packet</button><button class="btn ghost" id="downloadPacket">Download packet</button></div><textarea class="big" id="packetOut" placeholder="Packet will appear here"></textarea></section>');setVal('#packetType',s.file.packetType);setVal('#packetFile',s.file.filename);setVal('#packetOut',s.file.packet);$('#makePacket').onclick=function(){var st=state();st.file.packetType=getVal('#packetType');st.file.filename=getVal('#packetFile')||st.file.filename;st.file.packet=buildPacket();save(st);setVal('#packetOut',st.file.packet);log('Built packet from Packet Builder');toast('Packet ready.');};$('#copyPacket2').onclick=function(){copyText(getVal('#packetOut'));};$('#downloadPacket').onclick=function(){downloadText('code-labs-chatgpt-packet.txt',getVal('#packetOut'));};}
  function renderPatchDesk(){var s=state();shell(hero('Patch Desk','Paste ChatGPT’s fixed full file here, compare it, save a checkpoint, then copy or download.',['Paste fixed code.','Save it locally.','Compare old and new.','Preview before replacing live files.'])+'<section class="layout"><div class="panel codeBox"><div class="codeTools"><h2>Original code</h2><span class="pill">read only copy</span></div><textarea id="originalCode" class="big" readonly></textarea></div><div class="panel codeBox"><div class="codeTools"><h2>Fixed code from ChatGPT</h2><span class="pill">paste here</span></div><textarea id="fixedCode" class="big" placeholder="Paste ChatGPT fixed full file here"></textarea></div></section><section class="panel"><h2>Actions</h2><div class="actions"><button class="btn primary" id="saveFixed">Save fixed code</button><button class="btn good" id="checkpointFixed">Checkpoint fixed code</button><button class="btn ghost" id="copyFixed">Copy fixed code</button><button class="btn ghost" id="downloadFixed">Download fixed file</button><a class="btn ghost" href="preview-test.html">Preview + Test</a></div><h3>Compare summary</h3><pre class="diffBox" id="diffOut"></pre></section>');setVal('#originalCode',s.file.currentCode);setVal('#fixedCode',s.file.fixedCode);function updateDiff(){setVal('#diffOut',compareSummary(getVal('#originalCode'),getVal('#fixedCode')));}updateDiff();$('#fixedCode').addEventListener('input',updateDiff);$('#saveFixed').onclick=function(){var st=state();st.file.fixedCode=getVal('#fixedCode');save(st);log('Saved fixed code for '+(st.file.filename||'file'));toast('Fixed code saved.');updateDiff();};$('#checkpointFixed').onclick=function(){var code=getVal('#fixedCode');saveCheckpoint('fixed','Fixed code from ChatGPT',code,'Saved from Patch Desk');};$('#copyFixed').onclick=function(){copyText(getVal('#fixedCode'));};$('#downloadFixed').onclick=function(){var st=state();downloadText((st.file.filename||'fixed-file.html').replace(/\s+/g,'-'),getVal('#fixedCode'));};}
  function renderPreviewTest(){var s=state();shell(hero('Preview + Test','Preview the fixed file before replacing anything live. Then mark the checklist.',['Choose original or fixed preview.','Check desktop and mobile.','Mark each test.','Save pass or fail result.'])+'<section class="panel"><div class="actions"><button class="btn primary" id="showFixed">Preview fixed code</button><button class="btn ghost" id="showOriginal">Preview original code</button><button class="btn ghost" id="desktopView">Desktop width</button><button class="btn ghost" id="mobileView">Mobile width</button><button class="btn good" id="savePass">Save PASS test</button><button class="btn bad" id="saveFail">Save FAIL test</button></div></section><section class="layout"><div class="panel"><h2>Checklist</h2><div class="checklist" id="checks">'+['Page opens','Menu/buttons work','Mobile layout looks okay','No duplicate header/footer','Images/media still appear','No obvious error text on page','User understands what to copy next'].map(function(x,i){return '<label class="check"><input type="checkbox" data-check="'+i+'"><span>'+esc(x)+'</span></label>';}).join('')+'</div><label>Test notes<textarea id="testNotes" placeholder="Write what passed or failed."></textarea></label></div><div class="panel"><h2>Preview</h2><div id="previewFrame" class="previewFrame"><iframe id="preview"></iframe></div></div></section>');function load(code){$('#preview').srcdoc=code||'<h1 style="font-family:system-ui">No code saved yet</h1><p>Paste code in File Lab or Patch Desk first.</p>';}load(s.file.fixedCode||s.file.currentCode);$('#showFixed').onclick=function(){load(state().file.fixedCode);};$('#showOriginal').onclick=function(){load(state().file.currentCode);};$('#desktopView').onclick=function(){$('#previewFrame').classList.remove('mobile');};$('#mobileView').onclick=function(){$('#previewFrame').classList.add('mobile');};function saveTest(result){var st=state();var checked=$all('[data-check]').filter(function(c){return c.checked;}).length;st.tests.unshift({id:uid(),date:now(),result:result,checked:checked,total:7,notes:getVal('#testNotes'),filename:st.file.filename});st.tests=st.tests.slice(0,40);save(st);log('Saved '+result+' test for '+(st.file.filename||'file'));toast('Test saved: '+result);}$('#savePass').onclick=function(){saveTest('PASS');};$('#saveFail').onclick=function(){saveTest('FAIL');};}
  function renderCheckpoints(){var s=state();var list=s.checkpoints.length?s.checkpoints.map(function(c){return '<div class="item"><b>'+esc(c.label)+' <span class="pill">'+esc(c.kind)+'</span></b><p>'+esc(c.filename)+' · '+esc(c.date)+'</p><p>'+esc(c.note||'No note')+'</p><div class="actions"><button class="btn ghost smallBtn" data-copy="'+c.id+'">Copy</button><button class="btn ghost smallBtn" data-restore-current="'+c.id+'">Restore as current</button><button class="btn ghost smallBtn" data-restore-fixed="'+c.id+'">Restore as fixed</button></div></div>';}).join(''):'<div class="empty">No checkpoints yet. Save one from File Lab or Patch Desk before replacing any live file.</div>';shell(hero('Checkpoints','Checkpoints are your safety net. Save before and after every repair.',['Review saved versions.','Copy old code if needed.','Restore a checkpoint into current or fixed code.','Never replace live files without one.'])+'<section class="panel"><h2>Saved checkpoints</h2><div class="list">'+list+'</div></section><section class="panel"><h2>Recent tests</h2><div class="list">'+(s.tests.length?s.tests.map(function(t){return '<div class="item"><b>'+esc(t.result)+' · '+esc(t.filename)+'</b><p>'+esc(t.date)+' · '+t.checked+'/'+t.total+' checked</p><p>'+esc(t.notes||'No notes')+'</p></div>';}).join(''):'<div class="empty">No test runs saved yet.</div>')+'</div></section>');$all('[data-copy]').forEach(function(b){b.onclick=function(){var c=state().checkpoints.filter(function(x){return x.id===b.getAttribute('data-copy');})[0];if(c)copyText(c.code);};});$all('[data-restore-current]').forEach(function(b){b.onclick=function(){var st=state(), c=st.checkpoints.filter(function(x){return x.id===b.getAttribute('data-restore-current');})[0];if(c){st.file.filename=c.filename;st.file.currentCode=c.code;save(st);log('Restored checkpoint as current: '+c.label);toast('Restored as current code.');}};});$all('[data-restore-fixed]').forEach(function(b){b.onclick=function(){var st=state(), c=st.checkpoints.filter(function(x){return x.id===b.getAttribute('data-restore-fixed');})[0];if(c){st.file.filename=c.filename;st.file.fixedCode=c.code;save(st);log('Restored checkpoint as fixed: '+c.label);toast('Restored as fixed code.');}};});}
  function renderConnectorStatus(){var s=state();shell(hero('Connector Status','This page explains what works now and what will become the ChatGPT connector/app layer later.',['Manual rescue is active now.','GitHub loading/pushing is planned.','Supabase repair history is planned.','No secret keys belong in the browser.'])+'<section class="grid"><div class="card"><h3>Manual mode</h3><span class="badge good">Ready</span><p>Paste code, build packets, preview, download, and save local checkpoints.</p></div><div class="card"><h3>GitHub mode</h3><span class="badge warn">Planned</span><p>Load repo files, create test branches, commit fixed files, and keep rollback commits.</p></div><div class="card"><h3>Supabase mode</h3><span class="badge warn">Planned</span><p>Save projects, jobs, packets, versions, and test runs in dedicated Code Labs tables.</p></div><div class="card"><h3>ChatGPT app</h3><span class="badge warn">Planned</span><p>Expose safe actions so ChatGPT can help users patch code without guessing.</p></div></section><section class="panel"><h2>Action log</h2><div class="list">'+(s.log.length?s.log.map(function(x){return '<div class="item"><b>'+esc(x.msg)+'</b><p>'+esc(x.date)+'</p></div>';}).join(''):'<div class="empty">No actions yet.</div>')+'</div></section>');}
  function renderHelp(){shell(hero('Help','Plain-English answers for people who do not code.',['Read the simple definition.','Use the page links when ready.','Manual mode is enough to start.'])+'<section class="grid"><div class="card"><h3>What is a full file?</h3><p>The entire page or code file, from the first line to the last line. For HTML, it usually starts with <code>&lt;!doctype html&gt;</code>.</p></div><div class="card"><h3>What is a repair packet?</h3><p>A prepared message for ChatGPT. It includes your problem, file name, rules, errors, and full code.</p></div><div class="card"><h3>What is fixed code?</h3><p>The replacement code ChatGPT gives back. Paste it into Patch Desk, preview it, then copy or download.</p></div><div class="card"><h3>What is a checkpoint?</h3><p>A saved backup. It lets you roll back if the new code fails.</p></div><div class="card"><h3>What is GitHub?</h3><p>A place where website files can live. Later Code Labs can load and save files there.</p></div><div class="card"><h3>What is Supabase?</h3><p>A database and login system. Later Code Labs can save projects and repair history there.</p></div></section><section class="notice"><p><b>Best rule:</b> Before replacing any live file, save a checkpoint and run Preview + Test.</p></section>');}

  function init(){
    var id=pageId();
    if(id==='index') return renderHome();
    if(id==='setup') return renderSetup();
    if(id==='project-picker') return renderProjectPicker();
    if(id==='file-lab') return renderFileLab();
    if(id==='rescue-room') return renderRescueRoom();
    if(id==='packet-builder') return renderPacketBuilder();
    if(id==='patch-desk') return renderPatchDesk();
    if(id==='preview-test') return renderPreviewTest();
    if(id==='checkpoints') return renderCheckpoints();
    if(id==='connector-status') return renderConnectorStatus();
    if(id==='help') return renderHelp();
    renderHome();
  }
  document.addEventListener('DOMContentLoaded', init);
})();
