/* Stream Bandit V5.24.1 — Add Quality Tools tab to full Tools page STABLE
   Loads on top of tools-v5-20-2.html.
   Adds a read-only Quality Tools tab to the existing full Tools page.
   No quick fixes, no Supabase writes, no movie updates, no player/Sound Booster changes. */
(function(){
'use strict';
var SUPABASE_URL='https://xzxqfrvqdgkzwujbkdbk.supabase.co';
var SUPABASE_KEY='sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
var lastQuality='',lastMoveSafety='';
function qs(s,r){return (r||document).querySelector(s)}
function qsa(s,r){return Array.from((r||document).querySelectorAll(s))}
function text(v){return String(v||'').trim()}
function txt(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim()}
function toast(msg){var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2200)}
function copyText(val,msg){if(!val){toast('Nothing to copy yet');return}navigator.clipboard.writeText(val).then(function(){toast(msg||'Copied')}).catch(function(){toast('Copy blocked')})}
function addCss(){
 if(qs('#sb5241QualityCss'))return;
 var st=document.createElement('style');st.id='sb5241QualityCss';
 st.textContent='.stat{border:1px solid rgba(255,255,255,.08);border-radius:20px;background:rgba(255,255,255,.035);padding:14px}.stat b{display:block;margin-bottom:6px}.stat strong{display:block;font-size:26px}.listBox{border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(5,7,14,.55);padding:14px;min-height:72px;color:var(--muted,#a9afc3);line-height:1.45}.sb5241Badge{display:inline-flex;gap:8px;align-items:center;border-radius:999px;padding:7px 10px;margin-left:8px;background:rgba(34,211,166,.12);border:1px solid rgba(34,211,166,.22);color:#baf7df;font-weight:950;font-size:12px}.sb5241Tiny{font-size:12px;color:var(--muted,#a9afc3);line-height:1.45}.sb5241QualityNote{margin-top:14px;padding:13px;border-radius:18px;background:rgba(34,211,166,.10);border:1px solid rgba(34,211,166,.20);color:#baf7df;line-height:1.45}.sb5241Amber{background:rgba(255,209,102,.10);border-color:rgba(255,209,102,.25);color:#ffe8a3}';
 document.head.appendChild(st);
}
function polishInheritedSafety(){
  var path=location.pathname;
  var stable=/tools-v5-24-1\.html$/i.test(path);
  if(!stable)return;
  qsa('.statusItem').forEach(function(row){
    var s=txt(row).toLowerCase();
    if(s.indexOf('direct v5.20.2 test page')>-1&&s.indexOf('another filename')>-1){
      var icon=row.firstElementChild;
      var small=row.querySelector('small');
      if(icon)icon.textContent='✅';
      if(small)small.textContent='Viewing stable V5.24.1 Tools page built from V5.20.2 fallback.';
    }
  });
}
function updateHeader(){
 document.title='Stream Bandit Tools V5.24.1 Stable';
 var pill=qs('.pill'); if(pill) pill.innerHTML='<span class="dot"></span> V5.24.1 Full Tools + Quality Tools Live';
 var hero=qs('.hero p'); if(hero) hero.textContent='V5.24.1 keeps the full V5.20.2 Tools page and adds the read-only Quality Tools audit as a normal Tools tab. V5.20.2 remains the fallback.';
 var mini=qsa('.hero .mini');
 if(mini[0]) mini[0].innerHTML='<b>Live fallback kept</b><span>V5.20.2 remains available as the rollback fallback.</span>';
 if(mini[1]) mini[1].innerHTML='<b>Quality Tools added</b><span>Read-only quality audit is now a normal Tools tab.</span>';
 if(mini[2]) mini[2].innerHTML='<b>All tools kept</b><span>Release Safety, Backup Notes, Cast, Links, Images, Size, Mux, Metadata, Rating and Runtime remain here.</span>';
 if(mini[3]) mini[3].innerHTML='<b>No write actions</b><span>Quality Tools audit is read-only. Quick fixes are not moved yet.</span>';
 polishInheritedSafety();
}
function show(name){qsa('.tab').forEach(function(b){b.classList.toggle('active',b.dataset.tool===name)});qsa('.panel').forEach(function(p){p.classList.toggle('active',p.id==='tool-'+name)});try{history.replaceState(null,'','#'+name)}catch(e){}}
function addTab(){
 var tabs=qs('.tabs'); if(!tabs||qs('[data-tool="quality"]'))return;
 var btn=document.createElement('button');btn.className='tab';btn.type='button';btn.dataset.tool='quality';btn.innerHTML='🧰 Quality Tools <span class="sb5241Badge">read-only</span>';
 var future=qs('[data-tool="future"]',tabs);
 tabs.insertBefore(btn,future||null);
 btn.addEventListener('click',function(){show('quality')});
}
function addPanel(){
 if(qs('#tool-quality'))return;
 var panel=document.createElement('section');panel.className='card panel';panel.id='tool-quality';
 panel.innerHTML='<h2>Quality Tools — Read-only Library Audit</h2><p>Moved from the active app page into the standalone Tools flow. This checks Supabase movie rows and builds a report. It does not write, fix, upload or delete anything.</p><div class="actions"><button class="primary" type="button" id="sb5241RunQuality">Run quality audit</button><button type="button" id="sb5241CopyQuality">Copy quality report</button><button type="button" id="sb5241ClearQuality">Clear report</button></div><div class="grid"><div class="stat"><b>Duplicate groups</b><strong id="sb5241Dup">--</strong></div><div class="stat"><b>Missing thumbnails</b><strong id="sb5241Thumb">--</strong></div><div class="stat"><b>No source</b><strong id="sb5241Source">--</strong></div><div class="stat"><b>Weak descriptions</b><strong id="sb5241Desc">--</strong></div><div class="stat"><b>Blank channels</b><strong id="sb5241Channel">--</strong></div><div class="stat"><b>Blank genres/tags</b><strong id="sb5241Genre">--</strong></div></div><div class="grid"><div><h2>Duplicate movies</h2><div class="listBox" id="sb5241ListDup">Run the audit.</div></div><div><h2>Missing thumbnails</h2><div class="listBox" id="sb5241ListThumb">Run the audit.</div></div><div><h2>No-source movies</h2><div class="listBox" id="sb5241ListSource">Run the audit.</div></div><div><h2>Weak descriptions</h2><div class="listBox" id="sb5241ListDesc">Run the audit.</div></div><div><h2>Blank channels</h2><div class="listBox" id="sb5241ListChannel">Run the audit.</div></div><div><h2>Blank genres/tags</h2><div class="listBox" id="sb5241ListGenre">Run the audit.</div></div></div><div class="actions"><button class="primary" type="button" id="sb5241RunMoveSafety">Run V5.24.1 live safety</button><button type="button" id="sb5241CopyMoveSafety">Copy live safety report</button></div><div class="statusList" id="sb5241SafetyList"><div class="statusItem"><div>ℹ️</div><div><b>Ready</b><small>Run live safety after the quality audit.</small></div></div></div><div class="sb5241QualityNote sb5241Amber"><b>Safe rule:</b> this merged tab is read-only. Quick-fix/write buttons stay out until a separate safe test passes.</div>';
 var future=qs('#tool-future');
 if(future) future.parentNode.insertBefore(panel,future); else qs('.shell').appendChild(panel);
 qs('#sb5241RunQuality').onclick=runQuality;
 qs('#sb5241CopyQuality').onclick=function(){copyText(lastQuality,'Quality report copied')};
 qs('#sb5241ClearQuality').onclick=clearQuality;
 qs('#sb5241RunMoveSafety').onclick=runMoveSafety;
 qs('#sb5241CopyMoveSafety').onclick=function(){copyText(lastMoveSafety,'Live safety report copied')};
}
function arr(v){if(Array.isArray(v))return v;if(!v)return [];return String(v).split(',').map(function(x){return x.trim()}).filter(Boolean)}
function movieTitle(m){return text(m.title||m.name||m.movie_title||'Untitled')}
function poster(m){return text(m.poster_url||m.poster||m.thumbnail||m.thumbnail_url||m.image_url||m.image||'')}
function stream(m){return text(m.stream_url||m.video_url||m.url||m.hls_url||m.mux_hls_url||m.mux_playback_id||m.playback_id||m.local_video_url||'')}
function desc(m){return text(m.description||m.overview||m.summary||'')}
function channel(m){return text(m.channel||m.channel_name||m.channel_title||m.sb_channel||m.channel_id||'')}
function genres(m){return arr(m.genres||m.genre||m.tags)}
function setStat(id,n){var x=qs('#'+id); if(x)x.textContent=String(n)}
function list(id,items,ok){var x=qs('#'+id); if(x)x.innerHTML=items.length?items.map(function(v){return '• '+v}).join('<br>'):ok}
async function getMovies(){if(!window.supabase||!window.supabase.createClient)throw new Error('Supabase SDK did not load');var sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);var q=await sb.from('sb_movies').select('*').limit(1000);if(q.error)throw new Error(q.error.message);return q.data||[]}
async function runQuality(){
 try{var rows=await getMovies();var byTitle={},dups=[],missingThumb=[],noSource=[],weak=[],blankChannel=[],blankGenre=[];rows.forEach(function(m){var title=movieTitle(m);var key=title.toLowerCase();if(!byTitle[key])byTitle[key]=[];byTitle[key].push(title);if(!poster(m))missingThumb.push(title);if(!stream(m))noSource.push(title);if(desc(m).length<35)weak.push(title);if(!channel(m))blankChannel.push(title);if(!genres(m).length)blankGenre.push(title)});Object.keys(byTitle).forEach(function(k){if(byTitle[k].length>1)dups.push(byTitle[k][0]+' × '+byTitle[k].length)});setStat('sb5241Dup',dups.length);setStat('sb5241Thumb',missingThumb.length);setStat('sb5241Source',noSource.length);setStat('sb5241Desc',weak.length);setStat('sb5241Channel',blankChannel.length);setStat('sb5241Genre',blankGenre.length);list('sb5241ListDup',dups,'No duplicate movie titles found.');list('sb5241ListThumb',missingThumb,'All movies have thumbnails.');list('sb5241ListSource',noSource,'Every movie has a stream/Mux/HLS/local source.');list('sb5241ListDesc',weak,'Descriptions look okay.');list('sb5241ListChannel',blankChannel,'All movies have channels.');list('sb5241ListGenre',blankGenre,'All movies have genres/tags.');lastQuality='Stream Bandit V5.24.1 Quality Tools live audit\nRows checked: '+rows.length+'\nDuplicate groups: '+dups.length+'\nMissing thumbnails: '+missingThumb.length+'\nNo source: '+noSource.length+'\nWeak descriptions: '+weak.length+'\nBlank channels: '+blankChannel.length+'\nBlank genres/tags: '+blankGenre.length+'\n\nDuplicates:\n'+(dups.join('\n')||'None')+'\n\nMissing thumbnails:\n'+(missingThumb.join('\n')||'None')+'\n\nNo source:\n'+(noSource.join('\n')||'None')+'\n\nWeak descriptions:\n'+(weak.join('\n')||'None')+'\n\nBlank channels:\n'+(blankChannel.join('\n')||'None')+'\n\nBlank genres/tags:\n'+(blankGenre.join('\n')||'None')+'\n\nNo write actions used.';toast('Quality audit finished')}catch(e){lastQuality='Stream Bandit V5.24.1 Quality audit failed: '+e.message;toast('Audit failed: '+e.message)}
}
function clearQuality(){lastQuality='';['sb5241Dup','sb5241Thumb','sb5241Source','sb5241Desc','sb5241Channel','sb5241Genre'].forEach(function(id){setStat(id,'--')});['sb5241ListDup','sb5241ListThumb','sb5241ListSource','sb5241ListDesc','sb5241ListChannel','sb5241ListGenre'].forEach(function(id){var x=qs('#'+id);if(x)x.textContent='Run the audit.'})}
async function checkUrl(path){try{var r=await fetch(path+'?sb-check='+Date.now(),{cache:'no-store'});return{ok:r.ok,status:r.status}}catch(e){return{ok:false,status:'blocked'}}}
function addStatus(icon,title,detail){var list=qs('#sb5241SafetyList');var row=document.createElement('div');row.className='statusItem';row.innerHTML='<div>'+icon+'</div><div><b></b><small></small></div>';row.querySelector('b').textContent=title;row.querySelector('small').textContent=detail||'';list.appendChild(row);return icon+' '+title+(detail?' — '+detail:'')}
async function runMoveSafety(){var list=qs('#sb5241SafetyList');list.innerHTML='';var lines=['Stream Bandit V5.24.1 full Tools + Quality Tools live safety report'];lines.push(addStatus('✅','V5.24.1 page loaded','Full Tools page with Quality Tools tab is running.'));var good=/tools-v5-24-1\.html$/i.test(location.pathname)||/tools-v5-24-1-full-quality-test\.html$/i.test(location.pathname);lines.push(addStatus(good?'✅':'⚠️','Direct V5.24.1 page',location.pathname));var paths=['index.html','tools-v5-20-2.html','tools-v5-24-1.html','tools-v5-24-quality-tools-test.html','tools-v5-24-1-full-quality-test.html','assets/stream-bandit-v5-24-1-tools-quality-tab.js','assets/stream-bandit.css','assets/stream-bandit-v5-5-polish.css','assets/stream-bandit-logo.png'];for(var i=0;i<paths.length;i++){var r=await checkUrl(paths[i]);lines.push(addStatus(r.ok?'✅':'❌',paths[i],String(r.status)))}try{var rows=await getMovies();lines.push(addStatus('✅','Supabase read: sb_movies',rows.length+' rows visible to this key'))}catch(e){lines.push(addStatus('⚠️','Supabase read: sb_movies',e.message))}lines.push(addStatus('✅','No write actions used','This live safety check did not insert, update, delete, upload or run quick fixes.'));lastMoveSafety=lines.join('\n');toast('Live safety checks finished')}
function init(){addCss();updateHeader();addTab();addPanel();polishInheritedSafety();if(location.hash==='#quality')show('quality')}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(init,100)});else setTimeout(init,100);
setInterval(polishInheritedSafety,900);
})();
