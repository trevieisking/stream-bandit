/* Code Labs Product Shortcut Compatibility V227. */
(function () {
  'use strict';

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function revealTarget(target) {
    if (!target) return false;
    var group = target.getAttribute('data-cl-product-group');
    if (!group) return false;
    var button = q('#clProductTabsV227 .clProductTab[data-group="' + group + '"]');
    if (!button) return false;
    if (button.getAttribute('aria-selected') !== 'true') button.click();
    return true;
  }

  function revealHash() {
    if (!location.hash || location.hash.length < 2) return;
    var id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); }
    catch (error) { id = location.hash.slice(1); }
    var target = document.getElementById(id);
    if (!revealTarget(target)) return;
    window.setTimeout(function () {
      if (target && typeof target.scrollIntoView === 'function') target.scrollIntoView({ block: 'start' });
    }, 0);
  }

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var href = String(link.getAttribute('href') || '');
    if (href.length < 2) return;
    var id = '';
    try { id = decodeURIComponent(href.slice(1)); }
    catch (error) { id = href.slice(1); }
    revealTarget(document.getElementById(id));
  }, true);

  window.addEventListener('hashchange', revealHash);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.setTimeout(revealHash, 120); }, { once: true });
  } else {
    window.setTimeout(revealHash, 120);
  }
})();
