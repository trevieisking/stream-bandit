/* Code Labs Packet Builder To Buddy Canvas V125 - exact target transmit for ChatGPT/GitHub/Supabase/Code Labs reads */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  function q(s,r){return (r||document).querySelector(s);}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}));return true;}catch(e){console.error(e);return false;}}
  function val(sel){var el=q(sel);return el?String(el.value==null?'':el.value):'';}
  function toast(msg){var t=q('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}else{console.log(msg);}}
  function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
  function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
  function basename(path){return String(path||'').split(/[\\/]/).pop()||'';}
  function resolveTargetPath(visibleFile,storedPath){
    visibleFile=String(visibleFile||'').trim()||'file.html';
    storedPath=String(storedPath||'').trim();
    if(!storedPath)return visibleFile;
    if(storedPath===visibleFile)return visibleFile;
    if(visibleFile.indexOf('/')>-1||visibleFile.indexOf('\\')>-1)return visibleFile;
    if(basename(storedPath)===visibleFile)return storedPath;
    return visibleFile;
  }
  function extractCode(packet){packet=String(packet||'');var m=packet.match(/CURRENT FULL CODE STARTS BELOW\s*```(?:html|javascript|js|css|json|md|text)?\s*([\s\S]*?)\s*```\s*CURRENT FULL CODE ENDS ABOVE/i);return m?m[1]:'';}
  function ensurePacketBuilt(){
    var out=val('#packetOut');
    if(out.trim())return out;
    var make=q('#makePacket');
    if(make)make.click();
    return val('#packetOut');
  }
  function syncVisibleFields(target){
    var s=read();s.project=s.project||{};s.file=s.file||{};s.log=Array.isArray(s.log)?s.log:[];
    var f=s.file,p=s.project;
    var packet=ensurePacketBuilt();
    var filename=val('#packetFile')||f.filename||'file.html';
    var packetType=val('#packetType')||f.packetType||'full-file-repair';
    var oldPath=(f.githubSource&&f.githubSource.path)||f.path||'';
    var targetPath=resolveTargetPath(filename,oldPath);
    var code=extractCode(packet)||f.currentCode||'';
    f.filename=filename;
    f.path=targetPath;
    f.packetType=packetType;
    f.packet=packet||f.packet||'';
    if(code){f.currentCode=code;}
    f.githubSource=f.githubSource||{};
    f.githubSource.path=targetPath;
    f.githubSource.branch=f.githubSource.branch||'main';
    f.githubSource.loadedAt=new Date().toISOString();
    if(!p.siteName)p.siteName='stream-bandit';
    if(!p.repo)p.repo='trevieisking/stream-bandit';
    p.siteUrl=targetPath;
    p.mode=p.mode||'manual';
    s.buddyCanvasTarget={
      version:'V125',
      source:'packet-builder',
      target:target||'chatgpt',
      filename:filename,
      path:targetPath,
      repo:p.repo||'trevieisking/stream-bandit',
      branch:f.githubSource.branch||'main',
      packet_type:packetType,
      packet_characters:(packet||'').length,
      current_code_characters:(f.currentCode||'').length,
      current_code_lines:lines(f.currentCode||''),
      current_code_hash32:hash32(f.currentCode||''),
      created_at:new Date().toISOString(),
      safety:{browser_github_write:false,browser_supabase_schema:false,browser_delete:false,code_labs_state_only:true}
    };
    s.log.unshift({id:'cl_'+Date.now(),date:new Date().toLocaleString(),msg:'Packet Builder sent '+targetPath+' to Buddy Canvas target '+(target||'chatgpt')});
    s.log=s.log.slice(0,80);
    save(s);
    return s;
  }
  function send(target){
    var s=syncVisibleFields(target);
    toast('Loaded for Buddy Canvas: '+((s.buddyCanvasTarget&&s.buddyCanvasTarget.path)||(s.file&&s.file.filename)||'file'));
    var url='buddy-canvas.html?source=packet-builder&target='+encodeURIComponent(target||'chatgpt')+'&file='+encodeURIComponent((s.buddyCanvasTarget&&s.buddyCanvasTarget.path)||(s.file&&s.file.filename)||'file.html')+'&v=125';
    setTimeout(function(){location.href=url;},220);
  }
  function addButtons(){
    if(document.body.getAttribute('data-page')!=='packet-builder')return;
    if(q('#packetToBuddyV125'))return;
    var out=q('#packetOut');
    var actions=q('#makePacket')&&q('#makePacket').parentNode;
    if(!out||!actions){setTimeout(addButtons,160);return;}
    var wrap=document.createElement('div');
    wrap.id='packetToBuddyV125';
    wrap.className='notice';
    wrap.style.margin='10px 0';
    wrap.style.borderColor='#ff4d6d66';
    wrap.style.background='#ff4d6d18';
    wrap.innerHTML='<p style="color:#ffd2d9;font-weight:950;margin:0 0 8px">Load for ChatGPT: send this exact Packet Builder state into Buddy Canvas.</p><div class="actions"><button class="btn hot" type="button" data-pb-target="chatgpt">Load for ChatGPT</button><button class="btn ghost" type="button" data-pb-target="github">GitHub</button><button class="btn ghost" type="button" data-pb-target="supabase">Supabase</button><button class="btn ghost" type="button" data-pb-target="codelabs">Code Labs</button></div><p style="margin:8px 0 0;color:#b9c0d8">This only updates Code Labs browser state and opens Buddy Canvas. No GitHub write, no Supabase schema change, no live route change.</p>';
    actions.parentNode.insertBefore(wrap,out);
    Array.prototype.slice.call(wrap.querySelectorAll('[data-pb-target]')).forEach(function(btn){btn.onclick=function(){send(btn.getAttribute('data-pb-target')||'chatgpt');};});
  }
  function boot(){addButtons();setTimeout(addButtons,450);setTimeout(addButtons,1200);window.CodeLabsPacketToBuddyV125={send:send,syncVisibleFields:syncVisibleFields,resolveTargetPath:resolveTargetPath};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
