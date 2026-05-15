/* Stream Bandit V6.78.7 Player Queue Stay-On-Tab. Opens Queue tab in queue mode only. */
(function(){
  'use strict';
  var PLAYER_ROUTE = 'player-queue-stay-tab-v6-78-7-test.html';
  var DETAILS_ROUTE = 'details-watch-shell-v6-33-test.html';
  function esc(value){
    return String(value == null ? '' : value).replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});
  }
  function params(){ return new URLSearchParams(location.search); }
  function readQueue(){
    var keys = ['streamBanditQueueV1','streamBanditUpNextV1'];
    for(var i=0;i<keys.length;i++){
      try{
        var raw = sessionStorage.getItem(keys[i]) || localStorage.getItem(keys[i]);
        if(!raw) continue;
        var q = JSON.parse(raw);
        if(q && Array.isArray(q.items) && q.items.length) return q;
      }catch(e){}
    }
    return null;
  }
  function currentId(){ return params().get('id') || ''; }
  function isQueueRequest(q){
    var p = params();
    return !!(q && q.items && q.items.length && (p.get('queue') || p.get('qi') || p.get('tab') === 'queue'));
  }
  function findIndex(q){
    var id = currentId();
    var items = q.items || [];
    var qi = params().get('qi');
    if(qi !== null && qi !== ''){
      var n = Number(qi);
      if(!Number.isNaN(n) && n >= 0 && n < items.length) return n;
    }
    var byId = items.findIndex(function(x){return String(x.id) === String(id);});
    if(byId >= 0) return byId;
    return Math.max(0, Math.min(items.length - 1, Number(q.currentIndex || 0) || 0));
  }
  function itemUrl(item, index, q){
    var id = encodeURIComponent(String(item.id || ''));
    var genre = encodeURIComponent(String((q && q.genre) || ''));
    return PLAYER_ROUTE + '?id=' + id + '&queue=' + encodeURIComponent(String((q && q.type) || 'genre')) + '&genre=' + genre + '&qi=' + encodeURIComponent(String(index)) + '&tab=queue';
  }
  function persistIndex(q, index){
    try{
      q.currentIndex = index;
      sessionStorage.setItem('streamBanditQueueV1', JSON.stringify(q));
      sessionStorage.setItem('streamBanditUpNextV1', JSON.stringify(q));
      localStorage.setItem('streamBanditQueueV1', JSON.stringify(q));
      localStorage.setItem('streamBanditUpNextV1', JSON.stringify(q));
    }catch(e){}
  }
  function activateQueueTab(){
    var q = readQueue();
    if(!isQueueRequest(q)) return;
    var tab = document.querySelector('[data-tab="queue"]');
    var section = document.getElementById('queue');
    if(!tab || !section) return;
    document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
    document.querySelectorAll('.section').forEach(function(s){s.classList.remove('active');});
    tab.classList.add('active');
    section.classList.add('active');
    var status = document.getElementById('status');
    if(status) status.textContent = 'Player tab open: Queue / Up Next. Real queue mode.';
  }
  function navButton(label, item, index, q, cls){
    if(!item) return '<button class="btn small" disabled>'+esc(label)+'</button>';
    return '<a class="btn small '+(cls||'')+'" href="'+esc(itemUrl(item,index,q))+'">'+esc(label)+'</a>';
  }
  function renderQueue(){
    var box = document.getElementById('queue');
    if(!box) return;
    var q = readQueue();
    if(!q || !isQueueRequest(q)){
      box.innerHTML = '<h2>Queue / Up Next</h2><div class="note">No fake Up Next. This appears only when a real queue exists later.</div>';
      return;
    }
    var items = q.items || [];
    var currentIndex = findIndex(q);
    persistIndex(q,currentIndex);
    var current = items[currentIndex] || items[0];
    var previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    var nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;
    var upNext = items.filter(function(_,i){return i > currentIndex;});
    var previous = items.filter(function(_,i){return i < currentIndex;});
    var html = '';
    html += '<h2>Queue / Up Next</h2>';
    html += '<div class="good">Real queue loaded: '+esc(q.genre || q.type || 'Queue')+' — '+items.length+' movie(s). Position '+(currentIndex+1)+' of '+items.length+'.</div>';
    html += '<div class="actions">';
    html += navButton('⬅ Previous', previousItem, currentIndex - 1, q, '');
    html += navButton('▶ Next', nextItem, currentIndex + 1, q, 'hot');
    html += '</div>';
    html += '<div class="checks">';
    html += '<div class="check"><b>Now Playing</b><p>'+esc(current && current.title ? current.title : 'Current movie')+'</p></div>';
    html += '<div class="check"><b>Up Next</b><p>'+upNext.length+' movie(s)</p></div>';
    html += '<div class="check"><b>Previous</b><p>'+previous.length+' movie(s)</p></div>';
    html += '<div class="check"><b>Queue Source</b><p>'+esc(q.type || 'genre')+'</p></div>';
    html += '</div>';
    if(upNext.length){
      html += '<h2 style="margin-top:18px">Up Next</h2><div class="checks">';
      upNext.forEach(function(item, offset){
        var index = currentIndex + offset + 1;
        html += '<div class="check"><b>'+esc(item.title || ('Movie '+(index+1)))+'</b>';
        html += '<p>'+(Array.isArray(item.genres) ? item.genres.map(esc).join(', ') : esc(q.genre || ''))+'</p>';
        html += '<div class="actions"><a class="btn small hot" href="'+esc(itemUrl(item,index,q))+'">Play This</a>';
        html += '<a class="btn small primary" href="'+DETAILS_ROUTE+'?id='+encodeURIComponent(String(item.id || ''))+'">Details</a></div></div>';
      });
      html += '</div>';
    } else {
      html += '<div class="note">This is the last movie in the real queue.</div>';
    }
    if(previous.length){
      html += '<h2 style="margin-top:18px">Previous</h2><div class="checks">';
      previous.slice(-6).forEach(function(item){
        var index = items.findIndex(function(x){return String(x.id) === String(item.id);});
        html += '<div class="check"><b>'+esc(item.title || 'Previous movie')+'</b><div class="actions"><a class="btn small" href="'+esc(itemUrl(item,index,q))+'">Replay</a></div></div>';
      });
      html += '</div>';
    }
    box.innerHTML = html;
    activateQueueTab();
  }
  function fixLabels(){
    document.title = 'Stream Bandit V6.78.7 Player Queue Stay-On-Tab TEST';
    var badge = document.querySelector('.badge');
    if(badge) badge.textContent = 'V6.78.7 Player Queue Stay-On-Tab TEST';
    var footer = document.querySelector('.footer');
    if(footer) footer.textContent = 'V6.78.7 Player Queue Stay-On-Tab TEST — queue tab persistence candidate.';
    var checklist = document.querySelector('#checklist h2');
    if(checklist) checklist.textContent = 'V6.78.7 Player Queue Stay-On-Tab Checklist';
  }
  function init(){
    fixLabels();
    renderQueue();
    activateQueueTab();
    document.addEventListener('click', function(e){
      var tab = e.target.closest && e.target.closest('[data-tab="queue"]');
      if(tab) setTimeout(renderQueue, 80);
    });
    setTimeout(function(){renderQueue();activateQueueTab();}, 600);
    setTimeout(function(){renderQueue();activateQueueTab();}, 1500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.StreamBanditPlayerQueueStayTabV6787 = { refresh: renderQueue, readQueue: readQueue, activateQueueTab: activateQueueTab };
})();
