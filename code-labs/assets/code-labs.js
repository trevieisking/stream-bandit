/* Code Labs V204 - scoped manual renderer with canonical registry links. */
(function(){
  'use strict';

  var APP_VERSION='Code Labs V204 Canonical-Link Manual Renderer';
  var EXPECTED_OWNER='code-labs/assets/cl-nav.js';
  var KEY='codeLabsV1State';
  var DEFAULT_STATE={
    project:{workspace:'',siteName:'',siteUrl:'',repo:'',mode:'manual',notes:''},
    file:{filename:'index.html',currentCode:'',fixedCode:'',problem:'',dontTouch:'',errors:'',packet:'',packetType:'full-file-repair'},
    checkpoints:[],
    tests:[],
    log:[]
  };
  var shellMode='none';

  function clone(obj){return JSON.parse(JSON.stringify(obj));}
  function $(sel,root){return(root||document).querySelector(sel);}
  function $all(sel,root){return Array.prototype.slice.call((root||document).querySelectorAll(sel));}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function uid(){return'cl_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);}
  function now(){return new Date().toLocaleString();}
  function state(){
    try{
      var raw=localStorage.getItem(KEY);
      if(!raw)return clone(DEFAULT_STATE);
      var saved=JSON.parse(raw);
      return Object.assign(clone(DEFAULT_STATE),saved,{
        project:Object.assign(clone(DEFAULT_STATE.project),saved.project||{}),
        file:Object.assign(clone(DEFAULT_STATE.file),saved.file||{}),
        checkpoints:Array.isArray(saved.checkpoints)?saved.checkpoints:[],
        tests:Array.isArray(saved.tests)?saved.tests:[],
        log:Array.isArray(saved.log)?saved.log:[]
      });
    }catch(error){return clone(DEFAULT_STATE);}
  }
  function save(value){localStorage.setItem(KEY,JSON.stringify(value));}
  function log(message){var value=state();value.log.unshift({id:uid(),date:now(),msg:message});value.log=value.log.slice(0,80);save(value);}
  function toast(message){var node=$('#toast');if(!node)return;node.textContent=message;node.classList.add('show');setTimeout(function(){node.classList.remove('show');},2200);}
  function copyText(text){
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text||'').then(function(){toast('Copied.');});return;}
    var area=document.createElement('textarea');area.value=text||'';document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();toast('Copied.');
  }
  function downloadText(filename,text){
    var blob=new Blob([text||''],{type:'text/plain;charset=utf-8'}),link=document.createElement('a');
    link.href=URL.createObjectURL(blob);link.download=filename||'code-labs-file.txt';document.body.appendChild(link);link.click();
    setTimeout(function(){URL.revokeObjectURL(link.href);link.remove();},0);
  }
  function lines(text){return String(text||'').split(/\r?\n/).length;}
  function chars(text){return String(text||'').length;}
  function pageId(){return document.body.getAttribute('data-page')||'index';}
  function registry(){
    var value=window.CodeLabsWorkflowRegistry;
    return value&&value.owner===EXPECTED_OWNER&&typeof value.route==='function'?value:null;
  }
  function canonicalRoute(id){var value=registry();return value?value.route(id):null;}
  function routeFile(id){var route=canonicalRoute(id);return route&&route.file?route.file:'';}
  function routeLink(id,label,classes){
    var file=routeFile(id),css=classes||'btn ghost';
    if(!file)return'<span class="'+esc(css)+'" data-cl-route-id="'+esc(id)+'" data-cl-route-missing="true" aria-disabled="true">'+esc(label)+'</span>';
    return'<a class="'+esc(css)+'" data-cl-route-id="'+esc(id)+'" href="'+esc(file)+'">'+esc(label)+'</a>';
  }
  function pageLabel(id){
    var route=canonicalRoute(id);
    if(route&&route.label)return route.label;
    var title=String(document.title||'').split('|')[0].replace(/^\s*Code Labs\s*/i,'').trim();
    return title||String(id||'Code Labs');
  }
  function statusBadges(value){
    var hasProject=!!(value.project.siteName||value.project.siteUrl||value.project.repo),hasCode=!!value.file.currentCode,hasFixed=!!value.file.fixedCode;
    return'<span class="badge '+(hasProject?'good':'warn')+'">'+(hasProject?'Project ready':'No project yet')+'</span>'+
      '<span class="badge '+(hasCode?'good':'warn')+'">'+(hasCode?'Code loaded':'No code loaded')+'</span>'+
      '<span class="badge '+(hasFixed?'good':'warn')+'">'+(hasFixed?'Fix pasted':'No fix yet')+'</span>'+
      '<span class="badge good">'+value.checkpoints.length+' checkpoints</span>';
  }
  function ensureShell(){
    var app=$('.app');
    if(app){shellMode='adopted';return app;}
    shellMode='created';
    app=document.createElement('div');
    app.className='app';
    app.setAttribute('data-cl-v1-renderer-owner','code-labs-js-v204');
    app.innerHTML='<aside class="sidebar" data-cl-shell-structure="code-labs-js-v204">'+
      '<div class="logo"><div class="logoMark">CL</div><div><b>Code Labs</b><small>Manual repair workspace</small></div></div>'+
      '<nav class="nav" aria-label="Code Labs canonical workflow"></nav>'+
      '<div class="sideBox"><b>Safety rule</b><p>Do not replace a live file until you have saved a checkpoint and tested the preview.</p></div>'+
      '<div class="sideBox"><b>Ownership</b><p>Workflow routes and numbering are provided only by the canonical registry.</p></div>'+
      '</aside><main class="main" data-cl-main-structure="code-labs-js-v204">'+
      '<div class="topbar"><div class="crumbs"><span>Code Labs</span><span>&rsaquo;</span><b data-cl-v1-page-label></b></div><div data-cl-v1-status></div></div>'+
      '<div id="clV1PageContent" data-cl-content-owner="code-labs-js-v204"></div>'+
      '<div class="footerNote" data-cl-v1-footer></div></main>';
    var firstScript=$('script',document.body);
    document.body.insertBefore(app,firstScript||null);
    if(!$('#toast')){
      var toastNode=document.createElement('div');toastNode.id='toast';toastNode.className='toast';app.insertAdjacentElement('afterend',toastNode);
    }
    return app;
  }
  function shell(content){
    var id=pageId(),value=state(),app=ensureShell(),label=$('[data-cl-v1-page-label]',app),badges=$('[data-cl-v1-status]',app),mount=$('#clV1PageContent',app),footer=$('[data-cl-v1-footer]',app);
    if(label)label.textContent=pageLabel(id);
    if(badges)badges.innerHTML=statusBadges(value);
    if(mount)mount.innerHTML=String(content||'');
    if(footer)footer.textContent=APP_VERSION+' - local manual mode - no live writes from these pages.';
    document.body.setAttribute('data-cl-v1-renderer','v204');
    return mount;
  }
  function hero(title,description,steps){
    var items=(steps||[]).map(function(item){return'<li>'+esc(item)+'</li>';}).join('');
    return'<section class="hero"><div><span class="pill">Beginner safe</span><h1>'+esc(title)+'</h1><p>'+esc(description)+'</p></div><div class="heroCard"><b>What to do here</b><ol>'+items+'</ol></div></section>';
  }
  function quickStats(){var value=state();return'<div class="grid3"><div class="stat"><b>Current file</b><span>'+esc(value.file.filename||'none')+'</span></div><div class="stat"><b>Original code</b><span>'+chars(value.file.currentCode)+'</span></div><div class="stat"><b>Fixed code</b><span>'+chars(value.file.fixedCode)+'</span></div></div>';}
  function setVal(id,value){var element=$(id);if(element)element.value=value||'';}
  function getVal(id){var element=$(id);return element?element.value:'';}
  function saveCheckpoint(kind,label,code,note){
    var value=state();
    value.checkpoints.unshift({id:uid(),kind:kind||'manual',label:label||'Checkpoint',filename:value.file.filename||'file.html',code:code||'',note:note||'',date:now()});
    value.checkpoints=value.checkpoints.slice(0,60);save(value);log('Saved checkpoint: '+(label||'Checkpoint'));toast('Checkpoint saved.');
  }
  function buildPacket(){
    var value=state(),file=value.file,project=value.project,type=file.packetType||'full-file-repair',fence=['`','`','`'].join('');
    var titleMap={'full-file-repair':'Full file repair','console-error':'Console error fix','mobile-layout':'Mobile/layout fix','supabase-github':'Supabase or GitHub issue','safety-review':'Safety review before changing code'};
    return[
      'CODE LABS CHATGPT HELP PACKET',
      'Packet type: '+(titleMap[type]||type),
      '',
      'USER LEVEL: Non-coder. Give clear instructions and avoid jargon.',
      'OUTPUT WANTED: Return a full replacement file when code is changed. Explain the test steps after the code.',
      '',
      'PROJECT',
      'Workspace: '+(project.workspace||'Not set'),
      'Website name: '+(project.siteName||'Not set'),
      'Website URL: '+(project.siteUrl||'Not set'),
      'GitHub repo: '+(project.repo||'Not set'),
      'Mode: '+(project.mode||'manual'),
      '',
      'FILE',
      'File name: '+(file.filename||'Not set'),
      '',
      'WHAT IS BROKEN',
      file.problem||'Not described yet.',
      '',
      'DO NOT TOUCH / MUST PRESERVE',
      file.dontTouch||'No special rules provided.',
      '',
      'ERRORS OR SCREENSHOT NOTES',
      file.errors||'No error notes provided.',
      '',
      'CURRENT FULL CODE STARTS BELOW',
      fence+'html',
      file.currentCode||'PASTE FULL CURRENT FILE HERE',
      fence,
      'CURRENT FULL CODE ENDS ABOVE',
      '',
      'IMPORTANT RULES FOR CHATGPT',
      '- Do not guess missing code if the full file is not present. Ask for the full file.',
      '- Preserve working login, saves, database, routing, and accessibility logic unless the user asked to change it.',
      '- Prefer full-file replacement for non-coders.',
      '- Include a short checklist: what to test after pasting the fixed file.'
    ].join('\n');
  }
  function compareSummary(original,fixed){
    var originalLines=String(original||'').split(/\r?\n/),fixedLines=String(fixed||'').split(/\r?\n/),maximum=Math.max(originalLines.length,fixedLines.length),changed=0,same=0;
    for(var index=0;index<maximum;index+=1){if((originalLines[index]||'')===(fixedLines[index]||''))same+=1;else changed+=1;}
    return'Original lines: '+originalLines.length+'\nFixed lines: '+fixedLines.length+'\nSame line positions: '+same+'\nChanged line positions: '+changed+'\nOriginal characters: '+chars(original)+'\nFixed characters: '+chars(fixed)+'\nCharacter difference: '+(chars(fixed)-chars(original));
  }
  function recentPanel(value){return'<section class="panel"><h2>Current repair</h2><div class="grid"><div class="item"><b>Website</b><p>'+esc(value.project.siteName||'Not set yet')+'</p></div><div class="item"><b>File</b><p>'+esc(value.file.filename||'No file chosen')+'</p></div><div class="item"><b>Last problem</b><p>'+esc(value.file.problem||'No problem described yet')+'</p></div><div class="item"><b>Last log</b><p>'+esc((value.log[0]&&value.log[0].msg)||'No actions yet')+'</p></div></div></section>';}

  function renderSetup(){
    var value=state();
    shell(hero('Setup','Tell Code Labs what website you are fixing. You can leave GitHub and Supabase blank for manual mode.',['Fill in the fields you know.','Choose Manual if you are unsure.','Save workspace.','Move to Project Picker.'])+'<section class="panel"><h2>Workspace details</h2><div class="fieldRow"><label>Your workspace name<input id="workspace" placeholder="My repair workspace"></label><label>Website name<input id="siteName" placeholder="My website"></label></div><div class="fieldRow"><label>Website URL<input id="siteUrl" placeholder="https://example.com"></label><label>GitHub repo optional<input id="repo" placeholder="owner/repo"></label></div><div class="fieldRow"><label>Mode<select id="mode"><option value="manual">Manual paste mode</option><option value="github">GitHub later</option><option value="supabase">Supabase later</option></select></label><label>Notes<input id="notes" placeholder="Anything important about this site"></label></div><div class="notice"><p><b>Plain English:</b> Manual mode means you copy and paste code yourself. It is the safest first version and works even when tools are blocked.</p></div><div class="actions"><button class="btn primary" id="saveSetup">Save setup</button>'+routeLink('project-picker','Next: choose project','btn ghost')+'</div></section>');
    setVal('#workspace',value.project.workspace);setVal('#siteName',value.project.siteName);setVal('#siteUrl',value.project.siteUrl);setVal('#repo',value.project.repo);setVal('#notes',value.project.notes);setVal('#mode',value.project.mode);
    $('#saveSetup').onclick=function(){var current=state();current.project={workspace:getVal('#workspace'),siteName:getVal('#siteName'),siteUrl:getVal('#siteUrl'),repo:getVal('#repo'),mode:getVal('#mode'),notes:getVal('#notes')};save(current);log('Saved Code Labs setup');toast('Setup saved.');};
  }
  function renderProjectPicker(){
    var value=state();
    shell(hero('Choose your website','Pick how Code Labs should work. Manual mode is ready now; GitHub and Supabase are future connector layers.',['Use Manual for today.','Saved project loads your local browser data.','GitHub/Supabase cards explain what comes later.'])+recentPanel(value)+'<section class="grid"><div class="card"><h3>Manual project</h3><p>Best for non-coders right now. Paste the full file, build the packet, paste the fixed file back.</p><div class="actions">'+routeLink('file-lab','Use manual mode','btn primary')+'</div></div><div class="card"><h3>GitHub project</h3><p>Future connector mode: load files from a repo, save fixed code to a test branch, keep rollback commits.</p><div class="actions">'+routeLink('connector-status','View status','btn ghost')+'</div></div><div class="card"><h3>Supabase saved project</h3><p>Future database mode: save repair jobs, versions, packets, and test runs in Code Labs tables.</p><div class="actions">'+routeLink('connector-status','View status','btn ghost')+'</div></div></section>');
  }
  function renderFileLab(){
    var value=state();
    shell(hero('File Lab','Put the full broken file here. Full files prevent hidden logic from being accidentally removed.',['Enter the exact file name.','Paste the full current code.','Or upload a text/code file.','Save before building a packet.'])+'<section class="layout"><div class="panel"><h2>File details</h2><label>File name<input id="filename" placeholder="index.html"></label><label>Upload file from computer<input id="fileUpload" type="file" accept=".html,.htm,.css,.js,.txt,.json,.md"></label><div class="notice"><p><b>Important:</b> Do not paste a tiny piece unless you only want an explanation. For repairs, paste the full file.</p></div><div class="actions"><button class="btn primary" id="saveFile">Save file code</button><button class="btn ghost" id="checkpointOriginal">Checkpoint original</button>'+routeLink('rescue-room','Next: Rescue Room','btn ghost')+'</div></div><div class="panel codeBox"><div class="codeTools"><h2>Current full code</h2><div class="metaLine"><span id="codeStats"></span></div></div><textarea class="big" id="currentCode" placeholder="Paste the full current file here"></textarea></div></section>');
    setVal('#filename',value.file.filename);setVal('#currentCode',value.file.currentCode);
    function updateStats(){var current=getVal('#currentCode');$('#codeStats').textContent=lines(current)+' lines - '+chars(current)+' chars';}
    updateStats();$('#currentCode').addEventListener('input',updateStats);$('#fileUpload').addEventListener('change',function(event){var file=event.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){setVal('#filename',file.name);setVal('#currentCode',String(reader.result||''));updateStats();toast('File loaded into the box.');};reader.readAsText(file);});
    $('#saveFile').onclick=function(){var current=state();current.file.filename=getVal('#filename')||'file.html';current.file.currentCode=getVal('#currentCode');save(current);log('Saved current code for '+current.file.filename);toast('Current code saved.');};
    $('#checkpointOriginal').onclick=function(){saveCheckpoint('original','Original before repair',getVal('#currentCode'),'Saved from File Lab');};
  }
  function renderRescueRoom(){
    var value=state();
    shell(hero('Rescue Room','Describe the problem in plain English. Code Labs will turn it into a clean ChatGPT request.',['Say what is broken.','Say what must not change.','Paste any error messages.','Build the repair packet.'])+'<section class="layout"><div class="panel"><h2>Problem details</h2><label>What is broken?<textarea id="problem" class="mid" placeholder="Example: The menu opens but the links do not work on mobile."></textarea></label><label>Do not touch / must preserve<textarea id="dontTouch" placeholder="Example: Do not remove login, Supabase saves, header, footer, or accessibility buttons."></textarea></label><label>Error text or screenshot notes<textarea id="errors" placeholder="Paste console error text or describe the screenshot."></textarea></label><div class="actions"><button class="btn primary" id="saveProblem">Save problem</button><button class="btn good" id="buildPacket">Build packet now</button>'+routeLink('packet-builder','Open Packet Builder','btn ghost')+'</div></div><div class="panel"><h2>Current file summary</h2>'+quickStats()+'<div class="notice"><p>If current code is empty, go back to File Lab and paste the full file first.</p></div><textarea id="packetPreview" class="mid" readonly placeholder="Your ChatGPT packet will appear here"></textarea><div class="actions"><button class="btn ghost" id="copyPacket">Copy packet</button></div></div></section>');
    setVal('#problem',value.file.problem);setVal('#dontTouch',value.file.dontTouch);setVal('#errors',value.file.errors);setVal('#packetPreview',value.file.packet);
    function saveProblem(){var current=state();current.file.problem=getVal('#problem');current.file.dontTouch=getVal('#dontTouch');current.file.errors=getVal('#errors');save(current);log('Saved repair problem');}
    $('#saveProblem').onclick=function(){saveProblem();toast('Problem saved.');};
    $('#buildPacket').onclick=function(){saveProblem();var current=state();current.file.packet=buildPacket();save(current);setVal('#packetPreview',current.file.packet);log('Built repair packet');toast('Packet built.');};
    $('#copyPacket').onclick=function(){copyText(getVal('#packetPreview'));};
  }
  function renderPacketBuilder(){
    var value=state();
    shell(hero('Packet Builder','This is the copy box for ChatGPT. It gathers the full code and the repair rules so ChatGPT does not have to guess.',['Choose packet type.','Build the packet.','Copy it into ChatGPT.','Paste the fixed code into Patch Desk.'])+'<section class="panel"><div class="fieldRow"><label>Packet type<select id="packetType"><option value="full-file-repair">Full file repair</option><option value="console-error">Console error fix</option><option value="mobile-layout">Mobile/layout fix</option><option value="supabase-github">Supabase or GitHub issue</option><option value="safety-review">Safety review</option></select></label><label>File name<input id="packetFile" placeholder="index.html"></label></div><div class="actions"><button class="btn primary" id="makePacket">Build ChatGPT Help Packet</button><button class="btn ghost" id="copyPacket2">Copy packet</button><button class="btn ghost" id="downloadPacket">Download packet</button></div><textarea class="big" id="packetOut" placeholder="Packet will appear here"></textarea></section>');
    setVal('#packetType',value.file.packetType);setVal('#packetFile',value.file.filename);setVal('#packetOut',value.file.packet);
    $('#makePacket').onclick=function(){var current=state();current.file.packetType=getVal('#packetType');current.file.filename=getVal('#packetFile')||current.file.filename;current.file.packet=buildPacket();save(current);setVal('#packetOut',current.file.packet);log('Built packet from Packet Builder');toast('Packet ready.');};
    $('#copyPacket2').onclick=function(){copyText(getVal('#packetOut'));};
    $('#downloadPacket').onclick=function(){downloadText('code-labs-chatgpt-packet.txt',getVal('#packetOut'));};
  }
  function renderPatchDesk(){
    var value=state();
    shell(hero('Patch Desk','Paste ChatGPT fixed full file here, compare it, save a checkpoint, then copy or download.',['Paste fixed code.','Save it locally.','Compare old and new.','Preview before replacing live files.'])+'<section class="layout"><div class="panel codeBox"><div class="codeTools"><h2>Original code</h2><span class="pill">read only copy</span></div><textarea id="originalCode" class="big" readonly></textarea></div><div class="panel codeBox"><div class="codeTools"><h2>Fixed code from ChatGPT</h2><span class="pill">paste here</span></div><textarea id="fixedCode" class="big" placeholder="Paste ChatGPT fixed full file here"></textarea></div></section><section class="panel"><h2>Actions</h2><div class="actions"><button class="btn primary" id="saveFixed">Save fixed code</button><button class="btn good" id="checkpointFixed">Checkpoint fixed code</button><button class="btn ghost" id="copyFixed">Copy fixed code</button><button class="btn ghost" id="downloadFixed">Download fixed file</button>'+routeLink('preview-test','Preview + Test','btn ghost')+'</div><h3>Compare summary</h3><pre class="diffBox" id="diffOut"></pre></section>');
    setVal('#originalCode',value.file.currentCode);setVal('#fixedCode',value.file.fixedCode);
    function updateDiff(){var output=$('#diffOut');if(output)output.textContent=compareSummary(getVal('#originalCode'),getVal('#fixedCode'));}
    updateDiff();$('#fixedCode').addEventListener('input',updateDiff);
    $('#saveFixed').onclick=function(){var current=state();current.file.fixedCode=getVal('#fixedCode');save(current);log('Saved fixed code for '+(current.file.filename||'file'));toast('Fixed code saved.');updateDiff();};
    $('#checkpointFixed').onclick=function(){saveCheckpoint('fixed','Fixed code from ChatGPT',getVal('#fixedCode'),'Saved from Patch Desk');};
    $('#copyFixed').onclick=function(){copyText(getVal('#fixedCode'));};
    $('#downloadFixed').onclick=function(){var current=state();downloadText((current.file.filename||'fixed-file.html').replace(/\s+/g,'-'),getVal('#fixedCode'));};
  }
  function renderPreviewTest(){
    var value=state();
    shell(hero('Preview + Test','Preview the fixed file before replacing anything live. Then mark the checklist.',['Choose original or fixed preview.','Check desktop and mobile.','Mark each test.','Save pass or fail result.'])+'<section class="panel"><div class="actions"><button class="btn primary" id="showFixed">Preview fixed code</button><button class="btn ghost" id="showOriginal">Preview original code</button><button class="btn ghost" id="desktopView">Desktop width</button><button class="btn ghost" id="mobileView">Mobile width</button><button class="btn good" id="savePass">Save PASS test</button><button class="btn bad" id="saveFail">Save FAIL test</button></div></section><section class="layout"><div class="panel"><h2>Checklist</h2><div class="checklist" id="checks">'+['Page opens','Menu/buttons work','Mobile layout looks okay','No duplicate header/footer','Images/media still appear','No obvious error text on page','User understands what to copy next'].map(function(item,index){return'<label class="check"><input type="checkbox" data-check="'+index+'"><span>'+esc(item)+'</span></label>';}).join('')+'</div><label>Test notes<textarea id="testNotes" placeholder="Write what passed or failed."></textarea></label></div><div class="panel"><h2>Preview</h2><div id="previewFrame" class="previewFrame"><iframe id="preview"></iframe></div></div></section>');
    function load(code){$('#preview').srcdoc=code||'<h1 style="font-family:system-ui">No code saved yet</h1><p>Paste code in File Lab or Patch Desk first.</p>';}
    load(value.file.fixedCode||value.file.currentCode);$('#showFixed').onclick=function(){load(state().file.fixedCode);};$('#showOriginal').onclick=function(){load(state().file.currentCode);};$('#desktopView').onclick=function(){$('#previewFrame').classList.remove('mobile');};$('#mobileView').onclick=function(){$('#previewFrame').classList.add('mobile');};
    function saveTest(result){var current=state(),checked=$all('[data-check]').filter(function(control){return control.checked;}).length;current.tests.unshift({id:uid(),date:now(),result:result,checked:checked,total:7,notes:getVal('#testNotes'),filename:current.file.filename});current.tests=current.tests.slice(0,40);save(current);log('Saved '+result+' test for '+(current.file.filename||'file'));toast('Test saved: '+result);}
    $('#savePass').onclick=function(){saveTest('PASS');};$('#saveFail').onclick=function(){saveTest('FAIL');};
  }
  function renderCheckpoints(){
    var value=state(),list=value.checkpoints.length?value.checkpoints.map(function(checkpoint){return'<div class="item"><b>'+esc(checkpoint.label)+' <span class="pill">'+esc(checkpoint.kind)+'</span></b><p>'+esc(checkpoint.filename)+' - '+esc(checkpoint.date)+'</p><p>'+esc(checkpoint.note||'No note')+'</p><div class="actions"><button class="btn ghost smallBtn" data-copy="'+checkpoint.id+'">Copy</button><button class="btn ghost smallBtn" data-restore-current="'+checkpoint.id+'">Restore as current</button><button class="btn ghost smallBtn" data-restore-fixed="'+checkpoint.id+'">Restore as fixed</button></div></div>';}).join(''):'<div class="empty">No checkpoints yet. Save one from File Lab or Patch Desk before replacing any live file.</div>';
    shell(hero('Checkpoints','Checkpoints are your safety net. Save before and after every repair.',['Review saved versions.','Copy old code if needed.','Restore a checkpoint into current or fixed code.','Never replace live files without one.'])+'<section class="panel"><h2>Saved checkpoints</h2><div class="list">'+list+'</div></section><section class="panel"><h2>Recent tests</h2><div class="list">'+(value.tests.length?value.tests.map(function(result){return'<div class="item"><b>'+esc(result.result)+' - '+esc(result.filename)+'</b><p>'+esc(result.date)+' - '+result.checked+'/'+result.total+' checked</p><p>'+esc(result.notes||'No notes')+'</p></div>';}).join(''):'<div class="empty">No test runs saved yet.</div>')+'</div></section>');
    $all('[data-copy]').forEach(function(button){button.onclick=function(){var checkpoint=state().checkpoints.filter(function(item){return item.id===button.getAttribute('data-copy');})[0];if(checkpoint)copyText(checkpoint.code);};});
    $all('[data-restore-current]').forEach(function(button){button.onclick=function(){var current=state(),checkpoint=current.checkpoints.filter(function(item){return item.id===button.getAttribute('data-restore-current');})[0];if(checkpoint){current.file.filename=checkpoint.filename;current.file.currentCode=checkpoint.code;save(current);log('Restored checkpoint as current: '+checkpoint.label);toast('Restored as current code.');}};});
    $all('[data-restore-fixed]').forEach(function(button){button.onclick=function(){var current=state(),checkpoint=current.checkpoints.filter(function(item){return item.id===button.getAttribute('data-restore-fixed');})[0];if(checkpoint){current.file.filename=checkpoint.filename;current.file.fixedCode=checkpoint.code;save(current);log('Restored checkpoint as fixed: '+checkpoint.label);toast('Restored as fixed code.');}};});
  }
  function renderConnectorStatus(){var value=state();shell(hero('Connector Status','This page explains what works now and what will become the ChatGPT connector/app layer later.',['Manual rescue is active now.','GitHub loading/pushing is planned.','Supabase repair history is planned.','No secret keys belong in the browser.'])+'<section class="grid"><div class="card"><h3>Manual mode</h3><span class="badge good">Ready</span><p>Paste code, build packets, preview, download, and save local checkpoints.</p></div><div class="card"><h3>GitHub mode</h3><span class="badge warn">Planned</span><p>Load repo files, create test branches, commit fixed files, and keep rollback commits.</p></div><div class="card"><h3>Supabase mode</h3><span class="badge warn">Planned</span><p>Save projects, jobs, packets, versions, and test runs in dedicated Code Labs tables.</p></div><div class="card"><h3>ChatGPT app</h3><span class="badge warn">Planned</span><p>Expose safe actions so ChatGPT can help users patch code without guessing.</p></div></section><section class="panel"><h2>Action log</h2><div class="list">'+(value.log.length?value.log.map(function(item){return'<div class="item"><b>'+esc(item.msg)+'</b><p>'+esc(item.date)+'</p></div>';}).join(''):'<div class="empty">No actions yet.</div>')+'</div></section>');}
  function renderHelp(){shell(hero('Help','Plain-English answers for people who do not code.',['Read the simple definition.','Use the page links when ready.','Manual mode is enough to start.'])+'<section class="grid"><div class="card"><h3>What is a full file?</h3><p>The entire page or code file, from the first line to the last line. For HTML, it usually starts with <code>&lt;!doctype html&gt;</code>.</p></div><div class="card"><h3>What is a repair packet?</h3><p>A prepared message for ChatGPT. It includes your problem, file name, rules, errors, and full code.</p></div><div class="card"><h3>What is fixed code?</h3><p>The replacement code ChatGPT gives back. Paste it into Patch Desk, preview it, then copy or download.</p></div><div class="card"><h3>What is a checkpoint?</h3><p>A saved backup. It lets you roll back if the new code fails.</p></div><div class="card"><h3>What is GitHub?</h3><p>A place where website files can live. Later Code Labs can load and save files there.</p></div><div class="card"><h3>What is Supabase?</h3><p>A database and login system. Later Code Labs can save projects and repair history there.</p></div></section><section class="notice"><p><b>Best rule:</b> Before replacing any live file, save a checkpoint and run Preview + Test.</p></section>');}

  function renderNeutral(){
    var existing=$('.app');
    if(existing){shellMode='adopted';document.body.setAttribute('data-cl-neutral-specialist-shell','adopted-v204');return false;}
    ensureShell();
    document.body.setAttribute('data-cl-neutral-specialist-shell','created-v204');
    return true;
  }
  function init(){
    var id=pageId();
    var renderers={
      'setup':renderSetup,
      'project-picker':renderProjectPicker,
      'file-lab':renderFileLab,
      'rescue-room':renderRescueRoom,
      'packet-builder':renderPacketBuilder,
      'patch-desk':renderPatchDesk,
      'preview-test':renderPreviewTest,
      'checkpoints':renderCheckpoints,
      'connector-status':renderConnectorStatus,
      'help':renderHelp
    };
    var render=renderers[id];
    if(render)return render();
    return renderNeutral();
  }
  function diagnostics(){var value=registry();return Object.freeze({version:APP_VERSION,role:'scoped-manual-renderer-and-empty-shell-provider',routeOwner:value?value.owner:null,shellMode:shellMode,routeFallbacks:0,privateRouteCollections:0,navMutations:0,bodyReplacements:0,observers:0,polling:0,retryTimers:0,utilityTimers:2,storageKey:KEY,storageAuthority:'local-manual-state-only'});}
  var api=Object.freeze({version:APP_VERSION,role:'scoped-manual-renderer-and-empty-shell-provider',pageId:pageId,state:state,ensureShell:ensureShell,canonicalRoute:canonicalRoute,routeFile:routeFile,routeLink:routeLink,diagnostics:diagnostics,init:init});
  window.CodeLabsV1ManualRendererV204=api;
  window.CodeLabsV1ManualRendererV203=api;
  window.CodeLabsV1ManualRendererV202=api;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
