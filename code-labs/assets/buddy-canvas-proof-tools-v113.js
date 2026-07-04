/* Code Labs Buddy Canvas V114 - local proof tools + packet desk loader */
(function(){
'use strict';
var KEY='codeLabsV1State';
var chunks=[];
var chunkIndex=0;
var links=[];
function q(s,r){return(r||document).querySelector(s);}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){return{};}}
function val(sel){var el=q(sel);return el?String(el.value||''):'';}
function setVal(sel,v){var el=q(sel);if(el)el.value=String(v||'');}
function text(sel,v){var el=q(sel);if(el)el.textContent=String(v||'');}
function chars(t){return String(t||'').length;}
function lines(t){var v=String(t||'');return v?v.split(/\r?\n/).length:0;}
function toast(msg){var t=q('#toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2200);}else{console.log(msg);}}
function hash32(str){str=String(str||'');var h=0;for(var i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return ('00000000'+(h>>>0).toString(16)).slice(-8);}
function info(){var s=read(),f=s.file||{},g=f.githubSource||{},p=s.project||{},parts=String(p.repo||'').split('/');var path=g.path||f.path||f.filename||'';var repo=(g.owner&&g.repo)?g.owner+'/'+g.repo:((parts[0]&&parts[1])?parts[0]+'/'+parts[1]:(p.repo||'trevieisking/stream-bandit'));return{state:s,file:f,path:path,repo:repo,branch:g.branch||'main'};}
function source(){return val('#loadedCode')||String((read().file||{}).currentCode||'');}
function fixed(){return val('#fixedCode')||String((read().file||{}).fixedCode||'');}
function preview(){return val('#clSourcePreview');}
function pick(kind){if(kind==='fixed')return fixed();if(kind==='preview')return preview();if(kind==='state')return String((read().file||{}).currentCode||'');return source();}
function fullHtml(code,path){code=String(code||'');if(!code.trim())return false;if(/\.html?$/i.test(path||''))return /<!doctype\s+html/i.test(code)||/<html[\s>]/i.test(code);return true;}
function copy(v,msg){v=String(v||'');navigator.clipboard.writeText(v).then(function(){toast(msg||'Copied.');}).catch(function(){var out=q('#clProofOut');if(out){out.value=v;out.focus();out.select();document.execCommand('copy');toast(msg||'Selected/copied.');}});}
function loadPacketDesk(){if(window.CodeLabsBuddyCanvasHandoffDesk)return;if(q('script[data-cl-packet-desk-v114]'))return;var sc=document.createElement('script');sc.src='assets/buddy-canvas-handoff-desk-v114.js?v=cl-v114-packet-desk';sc.setAttribute('data-cl-packet-desk-v114','yes');document.head.appendChild(sc);}
function ensureUi(){
 var main=q('.main');
 if(!main||q('#clProofPanel'))return;
 var panel=document.createElement('section');
 panel.id='clProofPanel';
 panel.className='panel';
 panel.style.border='3px solid rgba(255,177,66,.42)';
 panel.innerHTML='\
 <h2>Buddy Canvas Proof Tools</h2>\
 <p class="muted">Local page checks only: read proof, link finder and chunk copier. These tools use the visible canvases and browser Code Labs state.</p>\
 <div class="actions">\
   <button class="btn ghost" id="clProofRefresh" type="button">Refresh Read Proof</button>\
   <button class="btn ghost" id="clProofCopy" type="button">Copy Read Proof</button>\
   <button class="btn ghost" id="clProofLinks" type="button">Find Links</button>\
   <button class="btn ghost" id="clProofCopyLinks" type="button">Copy Links</button>\
 </div>\
 <div class="actions" style="align-items:center">\
   <label class="readonlyNote">Chunk <select id="clChunkKind"><option value="source">left source</option><option value="fixed">right fixed</option><option value="preview">source preview</option><option value="state">local state source</option></select></label>\
   <label class="readonlyNote">Size <input id="clChunkSize" type="number" min="5000" max="90000" value="45000" style="width:110px;border-radius:999px;border:1px solid #ffffff24;padding:8px;background:#0005;color:inherit"></label>\
   <button class="btn ghost" id="clChunkBuild" type="button">Build Chunks</button>\
   <button class="btn ghost" id="clChunkPrev" type="button">Prev</button>\
   <button class="btn ghost" id="clChunkNext" type="button">Next</button>\
   <button class="btn primary" id="clChunkCopy" type="button">Copy Chunk</button>\
   <span id="clChunkStatus" class="badge warn">No chunks</span>\
 </div>\
 <div id="clProofSummary" class="readonlyNote">Proof waiting.</div>\
 <textarea id="clProofOut" class="bigReport" readonly placeholder="Proof, links, or chunk appears here"></textarea>';
 var after=q('#clSourceControlPanel')||q('#sourceProof')||q('.stickyApply')||q('.hero');
 if(after&&after.parentNode)after.parentNode.insertBefore(panel,after.nextSibling);else main.insertBefore(panel,main.firstChild);
 q('#clProofRefresh').onclick=renderProof;
 q('#clProofCopy').onclick=function(){var r=proofReport();setVal('#clProofOut',r);copy(r,'Read proof copied.');};
 q('#clProofLinks').onclick=function(){setVal('#clProofOut',linkReport());};
 q('#clProofCopyLinks').onclick=function(){var r=links.length?JSON.stringify(links,null,2):linkReport();copy(r,'Links copied.');};
 q('#clChunkBuild').onclick=buildChunks;
 q('#clChunkPrev').onclick=function(){if(!chunks.length)return;chunkIndex=Math.max(0,chunkIndex-1);showChunk();};
 q('#clChunkNext').onclick=function(){if(!chunks.length)return;chunkIndex=Math.min(chunks.length-1,chunkIndex+1);showChunk();};
 q('#clChunkCopy').onclick=function(){if(!chunks.length){toast('Build chunks first.');return;}copy(chunks[chunkIndex]||'','Chunk copied.');};
}
function proofObject(){var i=info(),src=source(),fix=fixed(),prev=preview(),stateSrc=String((i.file||{}).currentCode||''),stateFix=String((i.file||{}).fixedCode||'');return{tool:'Code Labs Buddy Canvas Proof Tools',version:'V114',path:i.path||null,repo:i.repo,branch:i.branch,source_control_loaded:!!window.CodeLabsBuddyCanvasSourceControl,packet_desk_loaded:!!window.CodeLabsBuddyCanvasHandoffDesk,visible_source:{characters:chars(src),lines:lines(src),hash:hash32(src),full_page:fullHtml(src,i.path)},visible_fixed:{characters:chars(fix),lines:lines(fix),hash:hash32(fix),full_page:fullHtml(fix,i.path)},source_preview:{characters:chars(prev),lines:lines(prev),hash:hash32(prev),full_page:fullHtml(prev,i.path)},local_state_source:{characters:chars(stateSrc),lines:lines(stateSrc),hash:hash32(stateSrc),matches_visible_source:stateSrc===src},local_state_fixed:{characters:chars(stateFix),lines:lines(stateFix),hash:hash32(stateFix),matches_visible_fixed:stateFix===fix},local_state_bytes:chars(JSON.stringify(i.state||{})),cache_warning:(stateSrc&&src&&stateSrc!==src)?'local state source and visible source differ':'none'};}
function proofReport(){return JSON.stringify(proofObject(),null,2);}
function renderProof(){var p=proofObject();text('#clProofSummary','Path: '+(p.path||'not set')+' | source '+p.visible_source.characters+' chars / '+p.visible_source.lines+' lines | fixed '+p.visible_fixed.characters+' chars / '+p.visible_fixed.lines+' lines | cache warning: '+p.cache_warning);setVal('#clProofOut',JSON.stringify(p,null,2));}
function classify(u){u=String(u||'');if(/^https?:\/\//i.test(u))return'external';if(/\.html?(\?|#|$)/i.test(u))return'internal_html';if(/\.js(\?|#|$)/i.test(u))return'js_helper';if(/\.(css|png|jpg|jpeg|gif|svg|webp|ico|json|mp4|m3u8)(\?|#|$)/i.test(u))return'asset';if(/^#/.test(u))return'anchor';return'other';}
function findLinks(code){code=String(code||'');var out=[],seen={};function add(kind,u,raw){u=String(u||'').trim();if(!u)return;var k=kind+'|'+u;if(seen[k])return;seen[k]=true;out.push({kind:kind,url:u,class:classify(u),raw:String(raw||'').slice(0,180)});}code.replace(/\b(?:href|src|action|poster|data-src|data-url)\s*=\s*(['"])(.*?)\1/gi,function(m,q,u){add('attribute',u,m);return m;});code.replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,function(m,q,u){add('css_url',u,m);return m;});return out;}
function linkReport(){var i=info(),code=source()||preview()||fixed();links=findLinks(code);var counts={};links.forEach(function(x){counts[x.class]=(counts[x.class]||0)+1;});return JSON.stringify({tool:'Code Labs Buddy Canvas Link Finder',version:'V114',path:i.path||null,source_characters:chars(code),source_lines:lines(code),link_count:links.length,counts:counts,links:links},null,2);}
function buildChunks(){var kind=(q('#clChunkKind')&&q('#clChunkKind').value)||'source';var size=parseInt((q('#clChunkSize')&&q('#clChunkSize').value)||'45000',10);if(!size||size<5000)size=45000;var code=pick(kind),i=info(),total=Math.ceil(chars(code)/size)||0;chunks=[];chunkIndex=0;for(var n=0;n<total;n++){var start=n*size,end=Math.min(chars(code),(n+1)*size);chunks.push('CODE LABS CHUNK '+(n+1)+' OF '+total+'\nPath: '+(i.path||'not set')+'\nKind: '+kind+'\nCharacters: '+start+'-'+end+' of '+chars(code)+'\nHash: '+hash32(code)+'\n\n'+code.slice(start,end));}showChunk();}
function showChunk(){if(!chunks.length){text('#clChunkStatus','No chunks');setVal('#clProofOut','No chunk built.');return;}text('#clChunkStatus','Chunk '+(chunkIndex+1)+' / '+chunks.length);setVal('#clProofOut',chunks[chunkIndex]);}
function expose(){window.CodeLabsBuddyCanvasProofTools={version:'V114',proof:proofObject,proofReport:proofReport,links:function(){return findLinks(source()||preview()||fixed());},linkReport:linkReport,buildChunks:buildChunks};}
function boot(){ensureUi();expose();loadPacketDesk();renderProof();setInterval(function(){if(q('#clProofPanel'))renderProof();loadPacketDesk();},3000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
