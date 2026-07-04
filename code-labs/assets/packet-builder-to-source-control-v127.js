/* Code Labs Packet Builder To Source Control V127 - preview target only, no redirect */
(function(){
  'use strict';
  var KEY='codeLabsV1State';
  var PENDING='codeLabsSourceControlPendingReadV126';
  function q(s,r){return (r||document).querySelector(s);}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s||{}));return true;}catch(e){console.error(e);return false;}}
  function val(sel){var el=q(sel);return el?String(el.value==null?'':el.value):'';}
  function toast(msg){var t=q('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2400);}else{console.log(msg);}}
  function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
  function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
  function basename(path){return String(path||'').split(/[\\/]/).pop()||'';}
  function resolveTargetPath(visibleFile,storedPath){visibleFile=String(visibleFile||'').trim()||'file.html';storedPath=String(storedPath||'').trim();if(!storedPath)return visibleFile;if(storedPath===visibleFile)return visibleFile;if(visibleFile.indexOf('/')>-1||visibleFile.indexOf('\\')>-1)return visibleFile;if(basename(storedPath)===visibleFile)return storedPath;return visibleFile;}
  function extractCode(packet){packet=String(packet||'');var m=packet.match(/CURRENT FULL CODE STARTS BELOW\s*```(?:html|javascript|js|css|json|md|text)?\s*([\s\S]*?)\s*```\s*CURRENT FULL CODE ENDS ABOVE/i);return m?m[1]:'';}
  function ensurePacketBuilt(){var out=val('#packetOut');if(out.trim())return out;var make=q('#makePacket');if(make)make.click();return val('#packetOut');}
  function syncVisibleFields(target){
    var s=read();s.project=s.project||{};s.file=s.file||{};s.log=Array.isArray(s.log)?s.log:[];
    var f=s.file,p=s.project,packet=ensurePacketBuilt(),filename=val('#packetFile')||f.filename||'file.html',packetType=val('#packetType')||f.packetType||'full-file-repair';
    var targetPath=resolveTargetPath(filename,(f.githubSource&&f.githubSource.path)||f.path||''),code=extractCode(packet)||f.currentCode||'';
    f.filename=filename;f.path=targetPath;f.packetType=packetType;f.packet=packet||f.packet||'';if(code)f.currentCode=code;
    f.githubSource=f.githubSource||{};f.githubSource.path=targetPath;f.githubSource.branch=f.githubSource.branch||'main';f.githubSource.loadedAt=new Date().toISOString();
    if(!p.siteName)p.siteName='stream-bandit';if(!p.repo)p.repo='trevieisking/stream-bandit';p.siteUrl=targetPath;p.mode=p.mode||'manual';
    var pending={version:'V126',source:'packet-builder-v127',target:target||'chatgpt',read_kind:target==='github'?'github':(target==='supabase'?'supabase':'code_labs'),label:target==='github'?'GitHub Read':(target==='supabase'?'Supabase Read':(target==='codelabs'?'Code Labs Read':'Packet Builder ChatGPT Target')),filename:filename,path:targetPath,repo:p.repo||'trevieisking/stream-bandit',branch:f.githubSource.branch||'main',packet_type:packetType,packet_characters:(packet||'').length,code:code||'',current_code_characters:(code||'').length,current_code_lines:lines(code||''),current_code_hash32:hash32(code||''),created_at:new Date().toISOString(),safety:{preview_only:true,browser_github_write:false,browser_supabase_schema:false,browser_delete:false,code_labs_state_only:true}};
    s.buddyCanvasTarget=pending;s.log.unshift({id:'cl_'+Date.now(),date:new Date().toLocaleString(),msg:'Packet Builder sent '+targetPath+' to Source Control preview target '+(target||'chatgpt')});s.log=s.log.slice(0,80);save(s);
    try{localStorage.setItem(PENDING,JSON.stringify(pending));}catch(e){}
    try{window.dispatchEvent(new CustomEvent('code-labs-source-control-pending-read',{detail:pending}));}catch(e){}
    return s;
  }
  function send(target){var s=syncVisibleFields(target);var path=(s.buddyCanvasTarget&&s.buddyCanvasTarget.path)||(s.file&&s.file.filename)||'file';toast('Sent to Source Control preview: '+path);}
  function addButtons(){
    if(document.body.getAttribute('data-page')!=='packet-builder')return;
    var old=q('#packetToBuddyV125');if(old)old.remove();
    if(q('#packetToSourceControlV127'))return;
    var out=q('#packetOut'),actions=q('#makePacket')&&q('#makePacket').parentNode;if(!out||!actions){setTimeout(addButtons,160);return;}
    var wrap=document.createElement('div');wrap.id='packetToSourceControlV127';wrap.className='notice';wrap.style.margin='10px 0';wrap.style.borderColor='#ff4d6d66';wrap.style.background='#ff4d6d18';
    wrap.innerHTML='<p style="color:#ffd2d9;font-weight:950;margin:0 0 8px">Load for ChatGPT: send this exact Packet Builder state into Buddy Canvas Source Control preview.</p><div class="actions"><button class="btn hot" type="button" data-pb-target="chatgpt">Load for ChatGPT</button><button class="btn ghost" type="button" data-pb-target="github">GitHub</button><button class="btn ghost" type="button" data-pb-target="supabase">Supabase</button><button class="btn ghost" type="button" data-pb-target="codelabs">Code Labs</button></div><p style="margin:8px 0 0;color:#b9c0d8">Preview target only: no redirect, no GitHub browser write, no Supabase schema change, no live route change.</p>';
    actions.parentNode.insertBefore(wrap,out);Array.prototype.slice.call(wrap.querySelectorAll('[data-pb-target]')).forEach(function(btn){btn.onclick=function(){send(btn.getAttribute('data-pb-target')||'chatgpt');};});
  }
  function boot(){addButtons();setTimeout(addButtons,450);setTimeout(addButtons,1200);window.CodeLabsPacketToSourceControlV127={send:send,syncVisibleFields:syncVisibleFields};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
