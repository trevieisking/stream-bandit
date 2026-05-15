/* Stream Bandit V6.80.4 Watch History Single Save Row
   Replaces old preview buttons with one real shared V6.75 save row.
   History remains read-only. */
(function(){
  'use strict';

  function addStyle(){
    if (document.getElementById('sb-v6804-style')) return;
    var style = document.createElement('style');
    style.id = 'sb-v6804-style';
    style.textContent = '.sb-v6804-save-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.sb-v6804-save-actions .btn{font-size:12px;padding:8px 10px}.sb-v6804-save-label{color:#baf7df;font-weight:950;font-size:12px;margin-top:10px}.sb-v6804-hidden{display:none!important}';
    document.head.appendChild(style);
  }

  function getMovieId(card) {
    var link = card.querySelector('a[href*="details-watch-shell"], a[href*="player-watch-shell"]');
    if (!link) return '';
    try {
      return new URL(link.getAttribute('href'), location.href).searchParams.get('id') || '';
    } catch (err) {
      return '';
    }
  }

  async function getCore() {
    var core = window.StreamBanditCoreSavesV675;
    if (!core) return null;
    if (!core.__singleSaveRowReady) {
      try { await core.init(); } catch (err) {}
      core.__singleSaveRowReady = true;
    }
    return core;
  }

  async function renderCards() {
    addStyle();
    var core = await getCore();
    if (!core) return;

    document.querySelectorAll('.movie').forEach(function(card) {
      var movieId = getMovieId(card);
      if (!movieId) return;

      var body = card.querySelector('.body') || card;
      var previewButtons = body.querySelectorAll('[data-preview]');
      previewButtons.forEach(function(button) {
        button.classList.add('sb-v6804-hidden');
        button.setAttribute('aria-hidden', 'true');
        button.disabled = true;
      });

      var existing = body.querySelector('.sb-v6804-save-actions');
      if (!existing) {
        var label = document.createElement('div');
        label.className = 'sb-v6804-save-label';
        label.textContent = 'Save this movie';

        var row = document.createElement('div');
        row.className = 'sb-v6804-save-actions';
        row.dataset.movieId = movieId;
        row.innerHTML = core.buttons(movieId, { className: 'btn small sb-core-save-btn' });

        body.appendChild(label);
        body.appendChild(row);
      } else if (existing.dataset.movieId !== movieId) {
        existing.dataset.movieId = movieId;
        existing.innerHTML = core.buttons(movieId, { className: 'btn small sb-core-save-btn' });
      }
    });

    var status = document.getElementById('status');
    if (status && !/save updated|failed|error/i.test(status.textContent || '')) {
      status.textContent = 'V6.80.4 Watch History ready. One real save row only. History remains read-only.';
    }
  }

  var scheduled = false;
  function scheduleRender() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(function() {
      scheduled = false;
      renderCards();
    }, 80);
  }

  document.addEventListener('click', async function(event) {
    var button = event.target.closest('[data-sb-core-save]');
    if (!button || !window.StreamBanditCoreSavesV675) return;
    event.preventDefault();

    var status = document.getElementById('status');
    try {
      button.disabled = true;
      await window.StreamBanditCoreSavesV675.toggle(button.dataset.sbCoreSave, button.dataset.movieId);
      if (typeof window.StreamBanditCoreSavesV675.refresh === 'function') {
        await window.StreamBanditCoreSavesV675.refresh();
      }
      await renderCards();
      if (status) status.textContent = 'V6.80.4 save updated. Menu badges should refresh.';
    } catch (err) {
      if (status) status.textContent = err.message || String(err);
    } finally {
      button.disabled = false;
    }
  });

  function start() {
    renderCards();
    var historyGrid = document.getElementById('historyGrid');
    var progressGrid = document.getElementById('progressGrid');
    [historyGrid, progressGrid].filter(Boolean).forEach(function(target) {
      new MutationObserver(scheduleRender).observe(target, { childList: true, subtree: true });
    });
    setTimeout(renderCards, 600);
    setTimeout(renderCards, 1400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.StreamBanditWatchHistorySingleSaveRowV6804 = { refresh: renderCards };
})();
