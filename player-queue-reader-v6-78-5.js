/* Stream Bandit V6.78.5 Player Queue Reader. Reads real queue payloads only. */
(function(){
  'use strict';
  var PLAYER_ROUTE = 'player-watch-shell-v6-34-test.html';
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
    if(p.get('queue')) return true;
    return !!(q && q.type === 'genre');
  }
  function itemUrl(item, index, q){
    var id = encodeURIComponent(String(item.id || ''));
    var genre = encodeURIComponent(String((q && q.genre) || ''));
    return PLAYER_ROUTE + '?id=' + id + '&queue=' + encodeURIComponent(String((q && q.type) || 'genre')) + '&genre=' + genre + '&qi=' + encodeURIComponent(String(index));
  }
  function renderQueue(){
    var box = document.getElementById('queue');
    if(!box) return;
    var q = readQueue();
    if(!q || !isQueueRequest(q)){
      box.innerHTML = '<h2>Queue / Up Next</h2><div class="note">No fake Up Next. This appears only when a real queue exists later.</div>';
      return;
    }
    var id = currentId();
    var items = q.items || [];
    var currentIndex = Math.max(0, items.findIndex(function(x){return String(x.id) === String(id);}));
    if(currentIndex < 0) currentIndex = Number(q.currentIndex || 0) || 0;
    var current = items[currentIndex] || items[0];
    var upNext = items.filter(function(_,i){return i > currentIndex;});
    var previous = items.filter(function(_,i){return i < currentIndex;});
    var html = '';
    html += '<h2>Queue / Up Next</h2>';
    html += '<div class="good">Real queue loaded: '+esc(q.genre || q.type || 'Queue')+' — '+items.length+' movie(s).</div>';
    html += '<div class="checks">';
    html += '<div class="check"><b>Now Playing</b><p>'+esc(current && current.title ? current.title : 'Current movie')+'</p></div>';
    html += '<div class="check"><b>Up Next</b><p>'+upNext.length+' movie(s)</p></div>';
    html += '<div class="check"><b>Queue Source</b><p>'+esc(q.type || 'genre')+'</p></div>';
    html += '<div class="check"><b>Created</b><p>'+esc(q.createdAt || 'Stored queue')+'</p></div>';
    html += '</div>';
    if(upNext.length){
      html += '<h2 style="margin-top:18px">Up Next</h2><div class="checks">';
      upNext.forEach(function(item, offset){
        var index = currentIndex + offset + 1;
        html += '<div class="check"><b>'+esc(item.title || ('Movie '+(index+1)))+'</b>';
        html += '<p>'+(Array.isArray(item.genres) ? item.genres.map(esc).join(', ') : esc(q.genre || ''))+'</p>';
        html += '<div class="actions"><a class="btn small hot" href="'+esc(itemUrl(item,index,q))+'">Play Next</a>';
        html += '<a class="btn small primary" href="'+DETAILS_ROUTE+'?id='+encodeURIComponent(String(item.id || ''))+'">Details</a></div></div>';
      });
      html += '</div>';
    } else {
      html += '<div class="note">This is the last movie in the real queue.</div>';
    }
    if(previous.length){
      html += '<h2 style="margin-top:18px">Previous</h2><div class="checks">';
      previous.slice(-4).forEach(function(item, index){
        html += '<div class="check"><b>'+esc(item.title || 'Previous movie')+'</b><div class="actions"><a class="btn small" href="'+esc(itemUrl(item,index,q))+'">Replay</a></div></div>';
      });
      html += '</div>';
    }
    box.innerHTML = html;
  }
  function fixLabels(){
    document.title = 'Stream Bandit V6.78.5 Player Queue Reader TEST';
    var badge = document.querySelector('.badge');
    if(badge) badge.textContent = 'V6.78.5 Player Queue Reader TEST';
    var footer = document.querySelector('.footer');
    if(footer) footer.textContent = 'V6.78.5 Player Queue Reader TEST — Browse queue bridge candidate.';
    var checklist = document.querySelector('#checklist h2');
    if(checklist) checklist.textContent = 'V6.78.5 Player Queue Reader Checklist';
  }
  function init(){
    fixLabels();
    renderQueue();
    document.addEventListener('click', function(e){
      var tab = e.target.closest && e.target.closest('[data-tab="queue"]');
      if(tab) setTimeout(renderQueue, 80);
    });
    setTimeout(renderQueue, 600);
    setTimeout(renderQueue, 1500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.StreamBanditPlayerQueueReaderV6785 = { refresh: renderQueue, readQueue: readQueue };
})();
