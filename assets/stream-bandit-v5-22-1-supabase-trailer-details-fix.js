/* Stream Bandit V5.22.1 — Supabase Trailer Details Fix TEST
   Fix target: Movie Manager can save a trailer/extra link, but Supabase Details Trailer tab may still show "No trailer added yet".
   This safe overlay reads the current Details title, looks up the Supabase movie row, checks likely trailer field names,
   and renders an iframe/link in the Trailer panel if a trailer URL is found.
   Read-only Supabase check. No inserts, updates, deletes, uploads, movie saves, Mux changes or database changes. */
(function(){
'use strict';

var SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var checkedTitle='';
var lastRun=0;
var sb=null;

function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app')||document.body;}
function isDetailsPage(){
  var m=main();
  var t=text(m).toLowerCase();
  var h=text(m.querySelector('.top h2,h1,h2')).toLowerCase();
  return h.indexOf('details')>-1 || t.indexOf('supabase details')>-1 || (t.indexOf('overview')>-1&&t.indexOf('cast & crew')>-1&&t.indexOf('trailer')>-1&&t.indexOf('supabase info')>-1);
}
function movieTitle(){
  var m=main();
  if(!m)return '';
  var candidates=Array.prototype.slice.call(m.querySelectorAll('h1,h2,h3,.card h2,.card h3'));
  for(var i=0;i<candidates.length;i++){
    var s=text(candidates[i]);
    if(!s)continue;
    if(/supabase details|trailer|extras|overview|cast|crew|stable|checkpoint/i.test(s))continue;
    return s;
  }
  var body=text(m);
  var match=body.match(/V5\.11\.8[^\n]+?\s+([^\n]+?,\s*\d{4})/i)||body.match(/([^\n]+?,\s*\d{4})/);
  return match?match[1].trim():'';
}
function getSb(){
  if(sb)return sb;
  if(!window.supabase||!window.supabase.createClient)return null;
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  return sb;
}
function trailerUrlFromRow(row){
  if(!row)return '';
  var keys=['trailer_url','trailerUrl','trailer','trailer_link','trailerLink','trailer_extra_link','extra_link','extra_url','youtube_url','youtube','video_trailer_url','preview_url'];
  for(var i=0;i<keys.length;i++){
    var v=String(row[keys[i]]||'').trim();
    if(v&&/^https?:\/\//i.test(v))return v;
  }
  // Last-resort scan: only accept obvious trailer/youtube/vimeo URLs from string fields.
  for(var k in row){
    if(!Object.prototype.hasOwnProperty.call(row,k))continue;
    var val=String(row[k]||'').trim();
    if(!/^https?:\/\//i.test(val))continue;
    if(/trailer|youtube|youtu\.be|vimeo/i.test(k+' '+val))return val;
  }
  return '';
}
function embedUrl(url){
  url=String(url||'').trim();
  if(!url)return '';
  try{
    var u=new URL(url);
    var host=u.hostname.replace(/^www\./,'');
    if(host==='youtu.be'){
      var id=u.pathname.split('/').filter(Boolean)[0]||'';
      return id?'https://www.youtube.com/embed/'+encodeURIComponent(id):url;
    }
    if(host.indexOf('youtube.com')>-1){
      var vid=u.searchParams.get('v')||'';
      if(!vid&&u.pathname.indexOf('/shorts/')===0)vid=u.pathname.split('/')[2]||'';
      if(!vid&&u.pathname.indexOf('/embed/')===0)return url;
      return vid?'https://www.youtube.com/embed/'+encodeURIComponent(vid):url;
    }
    if(host.indexOf('vimeo.com')>-1){
      var v=u.pathname.split('/').filter(Boolean).pop()||'';
      return v?'https://player.vimeo.com/video/'+encodeURIComponent(v):url;
    }
    return url;
  }catch(e){return url;}
}
function addStyle(){
  if(document.getElementById('sb5221TrailerStyle'))return;
  var st=document.createElement('style');
  st.id='sb5221TrailerStyle';
  st.textContent='\n.sb5221TrailerBox{border:1px solid rgba(34,211,166,.26);border-radius:22px;background:rgba(5,8,18,.68);padding:14px;margin-top:10px}.sb5221TrailerFrame{width:100%;aspect-ratio:16/9;border:0;border-radius:18px;background:#050712;box-shadow:0 18px 48px rgba(0,0,0,.35)}.sb5221TrailerActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.sb5221TrailerActions a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;border-radius:14px;padding:11px 14px;background:linear-gradient(135deg,#ff2d85,#7c3cff);color:#fff;font-weight:950}.sb5221TrailerNote{margin-top:10px;color:#baf7df;font-size:13px}.sb5221Small{color:var(--muted,#a9afc3);font-size:12px;margin-top:5px}\n';
  document.head.appendChild(st);
}
function findTrailerPanel(){
  var m=main();
  if(!m)return null;
  var no=Array.prototype.slice.call(m.querySelectorAll('*')).find(function(el){return /no trailer added yet/i.test(text(el));});
  if(no)return no.closest('.card,.panel,section,div')||no.parentElement;
  var headings=Array.prototype.slice.call(m.querySelectorAll('h2,h3,h4,b,strong'));
  for(var i=0;i<headings.length;i++){
    if(/trailer|extras/i.test(text(headings[i])))return headings[i].closest('.card,.panel,section,div')||headings[i].parentElement;
  }
  return null;
}
function renderTrailer(panel,url,title,row){
  if(!panel||!url)return;
  if(panel.dataset.sb5221TrailerUrl===url)return;
  addStyle();
  var emb=embedUrl(url);
  panel.dataset.sb5221TrailerUrl=url;
  panel.innerHTML='<h3>Trailer / Extras</h3><div class="sb5221TrailerBox">'+
    '<iframe class="sb5221TrailerFrame" src="'+emb+'" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'+
    '<div class="sb5221TrailerActions"><a href="'+url+'" target="_blank" rel="noopener">Open trailer link</a></div>'+
    '<div class="sb5221TrailerNote">Trailer loaded from Supabase for '+escapeHtml(title)+'.</div>'+
    '<div class="sb5221Small">Read-only V5.22.1 trailer display fix. Field found on row ID: '+escapeHtml(row&&row.id||'unknown')+'</div>'+
    '</div>';
}
function escapeHtml(s){return String(s==null?'':s).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]||c;});}
async function lookupTrailer(title){
  var client=getSb();
  if(!client||!title)return null;
  var clean=title.replace(/\s+/g,' ').trim();
  var base=clean.replace(/,\s*\d{4}$/,'').trim();
  var attempts=[];
  attempts.push(client.from('sb_movies').select('*').eq('title',clean).limit(1));
  if(base&&base!==clean)attempts.push(client.from('sb_movies').select('*').eq('title',base).limit(1));
  attempts.push(client.from('sb_movies').select('*').ilike('title','%'+base.replace(/[%_]/g,'')+'%').limit(3));
  for(var i=0;i<attempts.length;i++){
    try{
      var res=await attempts[i];
      if(res&&res.data&&res.data.length){
        for(var j=0;j<res.data.length;j++){
          var url=trailerUrlFromRow(res.data[j]);
          if(url)return {row:res.data[j],url:url};
        }
      }
    }catch(e){}
  }
  return null;
}
async function run(){
  if(Date.now()-lastRun<1200)return;
  lastRun=Date.now();
  if(!isDetailsPage())return;
  var title=movieTitle();
  if(!title)return;
  var panel=findTrailerPanel();
  if(!panel)return;
  if(checkedTitle===title&&panel.dataset.sb5221Checked)return;
  checkedTitle=title;
  panel.dataset.sb5221Checked='1';
  var found=await lookupTrailer(title);
  if(found&&found.url)renderTrailer(panel,found.url,title,found.row);
}
var mo=new MutationObserver(function(){setTimeout(run,300);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,900);});
setInterval(run,1500);
})();
