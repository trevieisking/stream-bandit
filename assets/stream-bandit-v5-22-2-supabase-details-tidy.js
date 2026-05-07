/* Stream Bandit V5.22.2 — Supabase Details Tidy TEST
   Fix target: Supabase Details overview has large empty gaps / uneven card layout.
   This is a visual tidy overlay only. It does not save, edit, delete, upload, or change Supabase rows.
   It also avoids building a full drag/drop site builder into the live app for now.
   No database changes, no player source changes, no Mux changes, no movie saves. */
(function(){
'use strict';

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isSupabaseDetails(){
  var m=main();
  var t=text(m).toLowerCase();
  return t.indexOf('supabase details')>-1 && t.indexOf('overview')>-1 && t.indexOf('cast & crew')>-1;
}
function activeOverview(){
  var m=main();
  if(!m)return false;
  var active=Array.prototype.slice.call(m.querySelectorAll('button,.tab')).find(function(b){return /overview/i.test(text(b)) && /active/i.test(String(b.className||''));});
  if(active)return true;
  var t=text(m).toLowerCase();
  return t.indexOf('play / resume')>-1 && t.indexOf('source')>-1;
}
function addStyle(){
  if(document.getElementById('sb5222DetailsTidyStyle'))return;
  var st=document.createElement('style');
  st.id='sb5222DetailsTidyStyle';
  st.textContent='\nbody.sb5222DetailsTidy .main{max-width:1200px!important}body.sb5222DetailsTidy .sb5222TidyPanel{background:linear-gradient(180deg,rgba(17,21,34,.96),rgba(10,12,21,.94))!important;border:1px solid rgba(182,140,255,.22)!important;border-radius:26px!important;padding:20px!important;box-shadow:0 22px 62px rgba(0,0,0,.32)!important}body.sb5222DetailsTidy .sb5222OverviewGrid{display:grid!important;grid-template-columns:minmax(260px,390px) 1fr!important;gap:18px!important;align-items:start!important}body.sb5222DetailsTidy .sb5222PosterBox{display:flex!important;flex-direction:column!important;gap:14px!important}body.sb5222DetailsTidy .sb5222PosterBox img{width:100%!important;height:auto!important;max-height:430px!important;object-fit:cover!important;border-radius:18px!important;border:1px solid rgba(255,255,255,.10)!important;background:#050712!important}body.sb5222DetailsTidy .sb5222InfoBox{min-width:0!important}body.sb5222DetailsTidy .sb5222InfoBox h3{margin-top:0!important}body.sb5222DetailsTidy .sb5222MetaGrid{display:grid!important;grid-template-columns:repeat(2,minmax(160px,1fr))!important;gap:12px!important;margin-top:14px!important}body.sb5222DetailsTidy .sb5222MetaGrid>*{min-height:auto!important;margin:0!important}body.sb5222DetailsTidy .sb5222Actions{display:flex!important;gap:10px!important;flex-wrap:wrap!important;margin-top:16px!important}body.sb5222DetailsTidy .sb5222Actions button,body.sb5222DetailsTidy .sb5222Actions a{margin:0!important}body.sb5222DetailsTidy .sb5222EmptySpacer{display:none!important}body.sb5222DetailsTidy .sb5222TidyNote{margin-top:12px;padding:11px 13px;border-radius:16px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;font-size:13px;line-height:1.45}body.sb5222DetailsTidy .sb5222BuilderNote{margin:12px 0 0;padding:11px 13px;border-radius:16px;background:rgba(255,209,102,.10);border:1px solid rgba(255,209,102,.24);color:#ffe8a3;font-size:13px;line-height:1.45}@media(max-width:850px){body.sb5222DetailsTidy .sb5222OverviewGrid{grid-template-columns:1fr!important}body.sb5222DetailsTidy .sb5222MetaGrid{grid-template-columns:1fr!important}}\n';
  document.head.appendChild(st);
}
function findOverviewPanel(){
  var m=main();
  if(!m)return null;
  var buttons=Array.prototype.slice.call(m.querySelectorAll('button'));
  var play=buttons.find(function(b){return /play\s*\/\s*resume/i.test(text(b));});
  if(play)return play.closest('.card,.panel,section,div');
  var src=Array.prototype.slice.call(m.querySelectorAll('*')).find(function(el){return /^source$/i.test(text(el));});
  if(src)return src.closest('.card,.panel,section,div');
  return null;
}
function collectNodes(panel){
  var imgs=Array.prototype.slice.call(panel.querySelectorAll('img'));
  var poster=imgs.find(function(img){var r=img.getBoundingClientRect();return r.width>120&&r.height>80;})||imgs[0]||null;
  var buttons=Array.prototype.slice.call(panel.querySelectorAll('button,a')).filter(function(b){return /play|resume|back|library|details/i.test(text(b));});
  var headings=Array.prototype.slice.call(panel.querySelectorAll('h2,h3,h4')).filter(function(h){return !/overview|trailer|cast|supabase/i.test(text(h));});
  var metaTiles=Array.prototype.slice.call(panel.querySelectorAll('.infoTile,.tile,.stat,.mini,.metaTile,div')).filter(function(el){
    if(el===panel)return false;
    if(poster&&el.contains(poster))return false;
    if(buttons.some(function(b){return el===b||el.contains(b);}))return false;
    var s=text(el);
    if(!s||s.length>180)return false;
    return /year|rating|runtime|age rating|source|playable|published|mux|hls/i.test(s);
  });
  return {poster:poster,buttons:buttons,headings:headings,metaTiles:metaTiles};
}
function already(panel){return panel&&panel.dataset&&panel.dataset.sb5222Tidy==='1';}
function tidy(){
  if(!isSupabaseDetails()||!activeOverview()){
    document.body.classList.remove('sb5222DetailsTidy');
    return;
  }
  addStyle();
  document.body.classList.add('sb5222DetailsTidy');
  var panel=findOverviewPanel();
  if(!panel||already(panel))return;
  panel.dataset.sb5222Tidy='1';
  panel.classList.add('sb5222TidyPanel');
  var c=collectNodes(panel);
  var original=Array.prototype.slice.call(panel.childNodes);
  var title='';
  var desc='';
  var h=c.headings[0];
  if(h)title=text(h);
  var paras=Array.prototype.slice.call(panel.querySelectorAll('p')).map(text).filter(Boolean).filter(function(s){return s.length>25;});
  desc=paras[0]||'';
  var tags=Array.prototype.slice.call(panel.querySelectorAll('.pill')).map(function(x){return x.cloneNode(true);});
  var meta=[];
  var seen={};
  c.metaTiles.forEach(function(el){
    var s=text(el);
    if(!s||seen[s])return;
    seen[s]=1;
    if(/play\s*\/\s*resume|back to library/i.test(s))return;
    meta.push(el.cloneNode(true));
  });
  var actions=c.buttons.map(function(b){return b.cloneNode(true);});
  var wrap=document.createElement('div');
  wrap.className='sb5222OverviewGrid';
  var left=document.createElement('div');
  left.className='sb5222PosterBox';
  if(c.poster){left.appendChild(c.poster.cloneNode(true));}
  else{left.innerHTML='<div style="display:grid;place-items:center;min-height:220px;border:1px dashed rgba(255,255,255,.16);border-radius:18px;color:var(--muted,#a9afc3)">No poster</div>';}
  var right=document.createElement('div');
  right.className='sb5222InfoBox';
  if(title){var nh=document.createElement('h3');nh.textContent=title;right.appendChild(nh);}
  if(desc){var p=document.createElement('p');p.className='muted';p.textContent=desc;right.appendChild(p);}
  if(tags.length){var row=document.createElement('div');row.className='row';tags.forEach(function(t){row.appendChild(t)});right.appendChild(row);}
  if(meta.length){var grid=document.createElement('div');grid.className='sb5222MetaGrid';meta.slice(0,8).forEach(function(x){grid.appendChild(x)});right.appendChild(grid);}
  if(actions.length){var ar=document.createElement('div');ar.className='sb5222Actions';actions.forEach(function(a){ar.appendChild(a)});right.appendChild(ar);}
  var note=document.createElement('div');
  note.className='sb5222TidyNote';
  note.textContent='V5.22.2 tidy test: Details layout cleaned visually only. Movie data and Supabase rows are unchanged.';
  right.appendChild(note);
  var builder=document.createElement('div');
  builder.className='sb5222BuilderNote';
  builder.textContent='Future idea: a proper site-builder/editor can be planned later as a separate safe tool, but this page is only a tidy layout fix.';
  right.appendChild(builder);
  wrap.appendChild(left);wrap.appendChild(right);
  panel.innerHTML='';
  panel.appendChild(wrap);
  // Reconnect cloned buttons by forwarding clicks to matching original controls when possible.
  var newBtns=Array.prototype.slice.call(panel.querySelectorAll('button,a'));
  newBtns.forEach(function(nb){
    var label=text(nb);
    var old=c.buttons.find(function(ob){return text(ob)===label;});
    if(old){nb.addEventListener('click',function(e){e.preventDefault();try{old.click();}catch(err){}});}
  });
}
var mo=new MutationObserver(function(){setTimeout(tidy,250);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(tidy,800);});
setInterval(tidy,1200);
})();
