/* Code Labs Header Shell V200
   Owns shared Code Labs identity and the simple ten-step navigation only.
   Existing page tools remain untouched.
*/
(function () {
  'use strict';

  var VERSION = 'V200.9';
  var ROUTES = [
    ['index.html', '🏠', 'Home', 'Start here'],
    ['setup.html', '⚙️', 'Setup', 'Project and repo'],
    ['saved-files.html', '📄', 'Saved Files', 'Load or edit full file'],
    ['rescue-room.html', '🛟', 'Rescue Room', 'Problem and rules'],
    ['packet-builder.html', '📦', 'Packet Builder', 'Build repair context'],
    ['patch-lab.html', '🧪', 'Patch Lab', 'Apply or validate repair'],
    ['buddy-canvas.html', '🤖', 'Buddy Lane', 'ChatGPT handoff'],
    ['preview-test.html', '🎯', 'Preview + Test', 'Check before live'],
    ['checkpoints.html', '💾', 'Checkpoints', 'Rollback and receipts'],
    ['help.html', '❔', 'Help', 'Plain-English guide']
  ];
  var repairing = false;
  var observer = null;

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }

  function pageId() {
    return (document.body && document.body.getAttribute('data-page')) ||
      location.pathname.split('/').pop().replace(/\.html?$/i, '') ||
      'index';
  }

  function isActive(href) {
    var page = pageId();
    return page + '.html' === href ||
      (page === 'index' && href === 'index.html') ||
      (page === 'file-lab' && href === 'saved-files.html');
  }

  function makeLink(route, index) {
    var link = document.createElement('a');
    link.href = route[0];
    link.setAttribute('data-step', String(index + 1));
    if (isActive(route[0])) link.className = 'active';
    link.innerHTML = '<span>' + escapeHtml(route[1]) + '</span><div>' +
      String(index + 1) + '. ' + escapeHtml(route[2]) +
      '<small>' + escapeHtml(route[3]) + '</small></div>';
    return link;
  }

  function sameOrder(nav) {
    var actual = all('a', nav).map(function (link) {
      return (link.getAttribute('href') || '').split('?')[0].split('#')[0];
    }).join('|');
    var expected = ROUTES.map(function (route) { return route[0]; }).join('|');
    return actual === expected;
  }

  function stabilizeNavigation() {
    var nav = q('.nav');
    if (!nav) return false;
    if (nav.getAttribute('data-cl-header-shell') === VERSION && sameOrder(nav)) return true;

    repairing = true;
    nav.innerHTML = '';
    ROUTES.forEach(function (route, index) {
      nav.appendChild(makeLink(route, index));
    });
    nav.setAttribute('data-cl-header-shell', VERSION);
    nav.setAttribute('data-cl-nav-stable', VERSION);
    nav.setAttribute('aria-label', 'Code Labs simple workflow navigation');
    repairing = false;
    return true;
  }

  function watchNavigation() {
    var nav = q('.nav');
    if (!nav || nav.getAttribute('data-cl-header-watch') === VERSION) return;
    nav.setAttribute('data-cl-header-watch', VERSION);
    observer = new MutationObserver(function () {
      if (repairing) return;
      if (!sameOrder(nav) || nav.getAttribute('data-cl-header-shell') !== VERSION) {
        stabilizeNavigation();
      }
    });
    observer.observe(nav, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href', 'data-cl-header-shell', 'data-cl-nav-stable']
    });
  }

  function advancedToolsEnabled() {
    try {
      var params = new URLSearchParams(location.search);
      if (params.get('buddy') === '1') {
        localStorage.setItem('clBuddyTools', '1');
        return true;
      }
      if (params.get('hideBuddy') === '1') {
        localStorage.removeItem('clBuddyTools');
        return false;
      }
      return localStorage.getItem('clBuddyTools') === '1';
    } catch (error) {
      return false;
    }
  }

  function addAdvancedTools() {
    if (!advancedToolsEnabled()) return;
    var sidebar = q('.sidebar');
    var nav = q('.nav');
    if (!sidebar || !nav || q('#clBuddyToolsBox', sidebar)) return;

    var box = document.createElement('div');
    box.className = 'sideBox';
    box.id = 'clBuddyToolsBox';
    box.innerHTML = '<b>Advanced tools</b>' +
      '<p>Diagnostics and specialist pages remain available without cluttering the normal repair path.</p>' +
      '<a class="btn good" href="chatgpt-buddy-tools.html" style="width:100%;justify-content:center;margin-top:8px">Open advanced tools</a>';
    sidebar.insertBefore(box, nav.nextSibling);
  }

  function normalizeIdentity() {
    var small = q('.logo small');
    if (small) small.textContent = 'Kind repair workflow for non-coders';

    if (pageId() === 'setup') {
      all('a[href="project-picker.html"],a[href="file-lab.html"]').forEach(function (link) {
        link.href = 'saved-files.html';
        link.textContent = /next/i.test(link.textContent || '') ? 'Next: Saved Files' : 'Saved Files';
      });
    }
  }

  function run() {
    if (!stabilizeNavigation()) {
      setTimeout(run, 100);
      return false;
    }
    watchNavigation();
    addAdvancedTools();
    normalizeIdentity();
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 250);
  setTimeout(run, 900);
  setTimeout(run, 3200);

  window.CodeLabsHeaderShellV200 = {
    version: VERSION,
    routes: ROUTES,
    run: run
  };
})();
