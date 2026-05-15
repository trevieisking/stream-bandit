/* Stream Bandit V6.80.6 Watch History Stable Save Refresh
   Capture save clicks before the full-grid repaint handler.
   Refreshes only save rows using shared V6.75 state. */
(function(){
  'use strict';

  function core(){ return window.StreamBanditCoreSavesV675 || null; }

  function movieIdFromRow(row){
    if (!row) return '';
    var button = row.querySelector('[data-movie-id]');
    return button ? String(button.dataset.movieId || '') : '';
  }

  function renderSaveRow(row, movieId){
    var c = core();
    if (!row || !movieId || !c) return;
    row.innerHTML = c.buttons(movieId, { className: 'btn small sb-core-save-btn' });
  }

  function refreshSaveRows(){
    var c = core();
    if (!c) return;
    document.querySelectorAll('.saveTitle + .actions').forEach(function(row){
      var movieId = movieIdFromRow(row) || row.dataset.movieId || '';
      if (!movieId) {
        var card = row.closest('.movie');
        var link = card ? card.querySelector('a[href*="details-watch-shell"],a[href*="player-watch-shell"]') : null;
        if (link) {
          try { movieId = new URL(link.getAttribute('href'), location.href).searchParams.get('id') || ''; } catch (err) {}
        }
      }
      if (movieId) {
        row.dataset.movieId = movieId;
        renderSaveRow(row, movieId);
      }
    });
  }

  async function ensureReady(){
    var c = core();
    if (!c) return null;
    if (!c.__v6806Ready) {
      try { await c.init(); } catch (err) {}
      c.__v6806Ready = true;
    }
    return c;
  }

  document.addEventListener('click', async function(event){
    var button = event.target.closest('[data-sb-core-save]');
    if (!button) return;

    var c = core();
    if (!c) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();

    var status = document.getElementById('status');
    var movieId = button.dataset.movieId;
    var kind = button.dataset.sbCoreSave;

    try {
      button.disabled = true;
      await ensureReady();
      await c.toggle(kind, movieId);
      if (typeof c.refresh === 'function') await c.refresh();
      refreshSaveRows();
      if (window.StreamBanditMenuSavesCount && window.StreamBanditMenuSavesCount.refresh) {
        window.StreamBanditMenuSavesCount.refresh();
      }
      if (status) status.textContent = 'V6.80.6 save updated. Buttons stayed visible. History remains read-only.';
    } catch (err) {
      if (status) status.textContent = err.message || String(err);
    } finally {
      button.disabled = false;
    }
  }, true);

  async function start(){
    await ensureReady();
    refreshSaveRows();
    setTimeout(refreshSaveRows, 500);
    setTimeout(refreshSaveRows, 1200);
    var status = document.getElementById('status');
    if (status) status.textContent = 'V6.80.6 Watch History ready. Stable save refresh active. History remains read-only.';
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.StreamBanditWatchHistoryStableRefreshV6806 = { refresh: refreshSaveRows };
})();
