/* Code Labs Footer and Buddy Shell V200
   Owns shared receipts, page bridge, Sol loading, V104 page relay and previous/next navigation.
*/
(function () {
  'use strict';

  var VERSION = 'V200.18-v104-safe-relay';
  var ROUTES = [
    ['index', 'index.html', 'Home'],
    ['setup', 'setup.html', 'Setup'],
    ['saved-files', 'saved-files.html', 'Saved Files'],
    ['rescue-room', 'rescue-room.html', 'Rescue Room'],
    ['packet-builder', 'packet-builder.html', 'Packet Builder'],
    ['patch-lab', 'patch-lab.html', 'Patch Lab'],
    ['buddy-canvas', 'buddy-canvas.html', 'Buddy Lane'],
    ['preview-test', 'preview-test.html', 'Preview + Test'],
    ['checkpoints', 'checkpoints.html', 'Checkpoints'],
    ['help', 'help.html', 'Help']
  ];
  var RELAY_SESSION_KEY = 'codeLabsV104BrowserSession';
  var RELAY_SECRET_KEY = 'codeLabsV104BrowserSecret';
  var relayBusy = false;
  var relayTimer = 0;

  function q(selector, root) { return (root || document).querySelector(selector); }

  function pageId() {
    var id = (document.body && document.body.getAttribute('data-page')) ||
      location.pathname.split('/').pop().replace(/\.html?$/i, '') || 'index';
    return id === 'file-lab' ? 'saved-files' : id;
  }

  function loadScriptOnce(src, attribute, onload) {
    var existing = q('script[' + attribute + ']');
    if (existing) { if (onload) onload(); return existing; }
    var script = document.createElement('script');
    script.src = src;
    script.setAttribute(attribute, 'yes');
    if (onload) script.onload = onload;
    document.head.appendChild(script);
    return script;
  }

  function loadPageBridge() {
    if (window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge) return;
    loadScriptOnce('assets/code-labs-buddy-page-bridge-v139.js?v=cl-v200-18-v104-safe-relay', 'data-cl-buddy-page-bridge-v139');
  }

  function loadSol() {
    function startSol() {
      loadScriptOnce('assets/code-labs-sol-packet-guard-v142.js?v=cl-v200-three-shell', 'data-cl-sol-packet-guard-v143', function () {
        loadScriptOnce('assets/code-labs-sol-workbench-v141.js?v=cl-v200-three-shell', 'data-cl-sol-workbench-v141');
      });
    }
    if (window.CL_SB || window.CodeLabsRepairHistory) { startSol(); return; }
    document.documentElement.setAttribute('data-cl-sol-auth-only', '1');
    if (!q('style[data-cl-sol-auth-only]')) {
      var style = document.createElement('style');
      style.setAttribute('data-cl-sol-auth-only', 'yes');
      style.textContent = 'html[data-cl-sol-auth-only="1"] #clHistoryPanel{display:none!important}';
      document.head.appendChild(style);
    }
    loadScriptOnce('assets/code-labs-v1-2-history.js?v=cl-v200-18-v104-safe-relay', 'data-cl-sol-auth-helper', startSol);
  }

  function relaySession() { try { return sessionStorage.getItem(RELAY_SESSION_KEY) || ''; } catch (e) { return ''; } }
  function relaySecret() { try { return sessionStorage.getItem(RELAY_SECRET_KEY) || ''; } catch (e) { return ''; } }
  function rememberRelay(data) {
    try {
      sessionStorage.setItem(RELAY_SESSION_KEY, data.session_id || '');
      sessionStorage.setItem(RELAY_SECRET_KEY, data.browser_secret || relaySecret());
    } catch (e) {}
  }
  function clearRelay() {
    try { sessionStorage.removeItem(RELAY_SESSION_KEY); sessionStorage.removeItem(RELAY_SECRET_KEY); } catch (e) {}
  }
  function bridge() { return window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge || null; }
  function snapshot() {
    var b = bridge();
    if (!b || !b.readPage) return null;
    try { return b.readPage(); } catch (e) { return null; }
  }
  function relayBody(action, packet) {
    packet = packet || snapshot() || {};
    return {
      action: action,
      session_id: relaySession(),
      browser_secret: relaySecret(),
      page_name: packet.page || pageId(),
      page_url: location.href,
      page_fingerprint: packet.page_fingerprint || '',
      page_snapshot: packet
    };
  }
  function invokeBrowser(body) {
    if (!window.CL_SB || !window.CL_SB.functions || !window.CL_SB.functions.invoke) {
      return Promise.reject(new Error('Code Labs Supabase session is not ready.'));
    }
    return window.CL_SB.functions.invoke('code-labs-browser-control', { body: body }).then(function (result) {
      if (result.error) throw result.error;
      if (!result.data || result.data.ok === false) throw new Error(result.data && result.data.error || 'Code Labs browser control failed.');
      return result.data;
    });
  }
  function approveV104() {
    if (!window.CL_SB || !window.CL_SB.rpc || !relaySession() || !relaySecret()) return Promise.resolve();
    return window.CL_SB.rpc('code_labs_approve_v104_page', {
      p_session_id: relaySession(),
      p_browser_secret: relaySecret()
    }).then(function () {}).catch(function () {});
  }
  function normalizedCommandType(command) {
    var raw = String(command && (command.type || command.command) || '').toLowerCase();
    if (raw === 'write') return 'write_fields';
    if (raw === 'action') return 'run_action';
    return raw;
  }
  function isChangingCommand(command) {
    var type = normalizedCommandType(command);
    return type === 'write_fields' || type === 'write_section' || type === 'run_action' || type === 'undo';
  }
  function applyCommand(row) {
    var b = bridge();
    if (!b || !b.applyCommand || !b.readPage) return Promise.resolve({ ok: false, error: 'The current Code Labs page bridge is not ready.' });
    var command = row && row.command || {};
    var current = snapshot() || {};
    if (isChangingCommand(command)) {
      var expected = String(command.expected_page_fingerprint || '');
      var actual = String(current.page_fingerprint || '');
      if (!expected) return Promise.resolve({ ok: false, error: 'Read the current Code Labs page before writing. A current page fingerprint is required.' });
      if (!actual || expected !== actual) return Promise.resolve({ ok: false, error: 'The Code Labs page changed. Read the page again before writing.' });
    }
    try { return Promise.resolve(b.applyCommand(command)); }
    catch (error) { return Promise.resolve({ ok: false, error: String(error.message || error) }); }
  }
  function relayTick() {
    if (relayBusy || document.hidden) return;
    var packet = snapshot();
    if (!packet || !window.CL_SB) return;
    relayBusy = true;
    var operation;
    if (!relaySession() || !relaySecret()) {
      operation = invokeBrowser(relayBody('create_pairing', packet)).then(function (data) {
        rememberRelay(data);
        return approveV104();
      });
    } else {
      operation = invokeBrowser(relayBody('heartbeat', packet)).then(function () {
        return approveV104();
      }).then(function () {
        return invokeBrowser(relayBody('poll', null));
      }).then(function (data) {
        if (!data.command) return;
        return applyCommand(data.command).then(function (receipt) {
          var body = relayBody('receipt', snapshot() || packet);
          body.command_id = data.command.id;
          body.receipt = receipt;
          return invokeBrowser(body);
        });
      });
    }
    operation.catch(function (error) {
      var text = String(error && (error.message || error) || '');
      if (/expired|closed|not valid|missing/i.test(text)) clearRelay();
    }).finally(function () { relayBusy = false; });
  }
  function startV104Relay() {
    clearInterval(relayTimer);
    relayTick();
    relayTimer = setInterval(relayTick, 2200);
    document.addEventListener('visibilitychange', relayTick);
    window.addEventListener('pageshow', relayTick);
    window.CodeLabsV104PageRelay = { version: VERSION, run: relayTick, clear: clearRelay };
  }

  function routeIndex() {
    var id = pageId();
    for (var index = 0; index < ROUTES.length; index += 1) if (ROUTES[index][0] === id) return index;
    return -1;
  }

  function addFooter() {
    var main = q('.main') || q('main');
    if (!main || q('#clFooterBuddyShellV200')) return;
    var index = routeIndex();
    if (index < 0) return;
    var previous = index > 0 ? ROUTES[index - 1] : null;
    var next = index < ROUTES.length - 1 ? ROUTES[index + 1] : null;
    var footer = document.createElement('section');
    footer.id = 'clFooterBuddyShellV200';
    footer.className = 'panel';
    footer.setAttribute('data-cl-footer-shell', VERSION);
    footer.innerHTML = '<h2>Safe next step</h2>' +
      '<p>Use Buddy or Sol through the same V104 page controls. GitHub file changes still happen through a reviewed branch and pull request.</p>' +
      '<div class="actions">' +
      (previous ? '<a class="btn ghost" href="' + previous[1] + '">Previous: ' + previous[2] + '</a>' : '') +
      (next ? '<a class="btn primary" href="' + next[1] + '">Next: ' + next[2] + '</a>' : '') +
      '<a class="btn ghost" href="help.html">Help</a></div>' +
      '<p class="fine">Code Labs ' + VERSION + ' · one V104 connector · one page bridge · branch and PR only.</p>';
    main.appendChild(footer);
  }

  function run() {
    document.documentElement.setAttribute('data-cl-footer-buddy-shell-v200', VERSION);
    loadPageBridge();
    loadSol();
    addFooter();
    setTimeout(startV104Relay, 900);
    return true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  setTimeout(run, 500);
  setTimeout(run, 1500);
  window.CodeLabsFooterBuddyShellV200 = { version: VERSION, run: run };
})();
