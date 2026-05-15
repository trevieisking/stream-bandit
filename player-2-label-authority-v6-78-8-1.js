/* Stream Bandit V6.78.8.1 Player 2 Label Authority Fix. Player 2 labels win over old polish helpers. */
(function(){
  'use strict';
  var PLAYER_ROUTE = 'player-2-queue-watch-shell-v6-78-8-1-test.html';
  var DETAILS_ROUTE = 'details-watch-shell-v6-33-test.html';
  function esc(value){return String(value == null ? '' : value).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function params(){return new URLSearchParams(location.search);}
  function readQueue(){var keys=['streamBanditQueueV1','streamBanditUpNextV1'];for(var i=0;i<keys.length;i++){try{var raw=sessionStorage.getItem(keys[i])||localStorage.getItem(keys[i]);if(!raw)continue;var q=JSON.parse(raw);if(q&&Array.isArray(q.items)&&q.items.length)return q;}catch(e){}}return null;}
  function isQueueRequest(q){var p=params();return !!(q&&q.items&&q.items.length&&(p.get('queue')||p.get('qi')||p.get('tab')==='queue'));}
  function currentId(){return params().get('id')||'';}
  function findIndex(q){var id=currentId(),items=q.items||[],qi=params().get('qi');if(qi!==null&&qi!==''){var n=Number(qi);if(!Number.isNaN(n)&&n>=0&&n<items.length)return n;}var byId=items.findIndex(function(x){return String(x.id)===String(id);});if(byId>=0)return byId;return Math.max(0,Math.min(items.length-1,Number(q.currentIndex||0)||0));}
  function itemUrl(item,index,q){var id=encodeURIComponent(String(item.id||''));var genre=encodeURIComponent(String((q&&q.genre)||''));return PLAYER_ROUTE+'?id='+id+'&queue='+encodeURIComponent(String((q&&q.type)||'genre'))+'&genre='+genre+'&qi='+encodeURIComponent(String(index))+'&tab=queue';}
  function persistIndex(q,index){try{q.currentIndex=index;sessionStorage.setItem('streamBanditQueueV1',JSON.stringify(q));sessionStorage.setItem('streamBanditUpNextV1',JSON.stringify(q));localStorage.setItem('streamBanditQueueV1',JSON.stringify(q));localStorage.setItem('streamBanditUpNextV1',JSON.stringify(q));}catch(e){}}
  function forcePlayer2Labels(){
    document.title='Stream Bandit V6.78.8.1 Player 2 Label Authority Fix TEST';
    var badge=document.querySelector('.badge'); if(badge) badge.textContent='V6.78.8.1 Player 2 Label Authority Fix TEST';
    var heroTitle=document.getElementById('title'); if(heroTitle&&isQueueRequest(readQueue())) heroTitle.textContent='▶️ Player 2 — Queue Mode';
    var hero=document.querySelector('.hero p'); if(hero) hero.textContent='Player 2 is the multi-video player for Play All queues. Single videos stay on Player 1.';
    var footer=document.querySelector('.footer'); if(footer) footer.textContent='V6.78.8.1 Player 2 Label Authority Fix TEST — Player 2 queue mode.';
    var checklist=document.querySelector('#checklist h2'); if(checklist) checklist.textContent='V6.78.8.1 Player 2 Queue Checklist';
    var queueTab=document.querySelector('[data-tab="queue"]'); if(queueTab) queueTab.textContent='Player 2 Queue';
    var comfortTab=document.querySelector('[data-tab="comfort"]'); if(comfortTab) comfortTab.textContent='Player Comfort';
  }
  function activateQueueTab(){var q=readQueue();if(!isQueueRequest(q))return;var tab=document.querySelector('[data-tab="queue"]'),section=document.getElementById('queue');if(!tab||!section)return;document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});tab.classList.add('active');section.classList.add('active');var status=document.getElementById('status');if(status)status.textContent='Player 2 active: Queue / Up Next. Multi-video mode.';}
  function navButton(label,item,index,q,cls){if(!item)return '<button class="btn '+(cls||'')+'" disabled>'+esc(label)+'</button>';return '<a class="btn '+(cls||'')+'" href="'+esc(itemUrl(item,index,q))+'">'+esc(label)+'</a>';}
  function chips(item,q){var gs=Array.isArray(item&&item.genres)?item.genres:[];if(!gs.length&&q&&q.genre)gs=[q.genre];return gs.slice(0,6).map(function(g){return '<span class="pill">'+esc(g)+'</span>';}).join('');}
  function renderQueue(){
    forcePlayer2Labels();
    var box=document.getElementById('queue'); if(!box)return;
    var q=readQueue();
    if(!q||!isQueueRequest(q)){box.innerHTML='<h2>Player 2 — Queue Mode</h2><div class="note">No queue is loaded. Player 2 only appears when a real Play All queue exists.</div>';return;}
    var items=q.items||[],currentIndex=findIndex(q);persistIndex(q,currentIndex);
    var current=items[currentIndex]||items[0]||{},previousItem=currentIndex>0?items[currentIndex-1]:null,nextItem=currentIndex<items.length-1?items[currentIndex+1]:null;
    var upNext=items.filter(function(_,i){return i>currentIndex;}),previous=items.filter(function(_,i){return i<currentIndex;});
    var percent=items.length?Math.round(((currentIndex+1)/items.length)*100):0;
    var html='';
    html+='<h2>Player 2 — Queue Mode</h2>';
    html+='<div class="good">'+esc(q.genre||'Play All')+' queue loaded — Movie '+(currentIndex+1)+' of '+items.length+'.</div>';
    html+='<div style="height:12px;border-radius:999px;background:#0006;border:1px solid #ffffff22;overflow:hidden;margin:14px 0"><div style="height:100%;width:'+percent+'%;background:linear-gradient(135deg,#22d3a6,#7c3cff)"></div></div>';
    html+='<div class="checks" style="grid-template-columns:1.2fr .8fr .8fr">';
    html+='<div class="check"><b>Now Playing</b><p style="font-size:22px;color:#fff;font-weight:950;margin:.2rem 0">'+esc(current.title||'Current movie')+'</p><div>'+chips(current,q)+'</div></div>';
    html+='<div class="check"><b>Queue Position</b><p>Movie '+(currentIndex+1)+' of '+items.length+'</p></div>';
    html+='<div class="check"><b>Coming Up</b><p>'+upNext.length+' remaining</p></div>';
    html+='</div><div class="actions" style="margin:16px 0 4px">';
    html+=navButton('⬅ Previous',previousItem,currentIndex-1,q,'');
    html+=navButton('▶ Next',nextItem,currentIndex+1,q,'hot');
    html+='<a class="btn primary" href="'+DETAILS_ROUTE+'?id='+encodeURIComponent(String(current.id||''))+'">Current Details</a></div>';
    if(upNext.length){html+='<h2 style="margin-top:22px">Up Next</h2><div class="checks">';upNext.forEach(function(item,offset){var index=currentIndex+offset+1;html+='<div class="check"><b>'+esc(item.title||('Movie '+(index+1)))+'</b><p>Queue position '+(index+1)+' of '+items.length+'</p><div>'+chips(item,q)+'</div><div class="actions"><a class="btn small hot" href="'+esc(itemUrl(item,index,q))+'">Play This</a><a class="btn small primary" href="'+DETAILS_ROUTE+'?id='+encodeURIComponent(String(item.id||''))+'">Details</a></div></div>';});html+='</div>';}else{html+='<div class="note">This is the final movie in the queue.</div>';}
    if(previous.length){html+='<h2 style="margin-top:22px">Previous</h2><div class="checks">';previous.slice(-6).forEach(function(item){var index=items.findIndex(function(x){return String(x.id)===String(item.id);});html+='<div class="check"><b>'+esc(item.title||'Previous movie')+'</b><p>Already played in this queue.</p><div class="actions"><a class="btn small" href="'+esc(itemUrl(item,index,q))+'">Replay</a></div></div>';});html+='</div>';}
    box.innerHTML=html;activateQueueTab();forcePlayer2Labels();
  }
  function init(){forcePlayer2Labels();renderQueue();activateQueueTab();document.addEventListener('click',function(e){var tab=e.target.closest&&e.target.closest('[data-tab="queue"]');if(tab)setTimeout(renderQueue,80);});[100,400,900,1600,2600,4000].forEach(function(ms){setTimeout(function(){forcePlayer2Labels();renderQueue();activateQueueTab();},ms);});setInterval(function(){forcePlayer2Labels();},1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.StreamBanditPlayer2LabelAuthorityV67881={refresh:renderQueue,readQueue:readQueue,activateQueueTab:activateQueueTab,forceLabels:forcePlayer2Labels};
})();
