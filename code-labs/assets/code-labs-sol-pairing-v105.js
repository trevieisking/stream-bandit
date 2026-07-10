/* Code Labs V105 Sol Pairing
   Secure controller for a separate same-origin Code Labs workspace window.
   Existing Buddy wording and page files remain unchanged.
*/
(function () {
  'use strict';

  var VERSION = 'V105';
  var ENDPOINT = 'https://xzxqfrvqdgkzwujbkdbk.supabase.co/functions/v1/code-labs-browser-control';
  var PUBLIC_KEY = 'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  var SESSION_ID_KEY = 'codeLabsSolPairingSessionV105';
  var SECRET_KEY = 'codeLabsSolPairingSecretV105';
  var CODE_KEY = 'codeLabsSolPairingCodeV105';
  var ROOT_ID = 'clSolPairingV105';
  var WORKSPACE_NAME = 'codeLabsSolWorkspaceV105';
  var workspace = null;
  var pollTimer = 0;
  var heartbeatTimer = 0;
  var busy = false;
  var lastSnapshot = {};
  var lastPageUrl = '';

  if (document.documentElement.getAttribute('data-cl-sol-pairing-v105-installed') === 'yes') return;
  document.documentElement.setAttribute('data-cl-sol-pairing-v105-installed', 'yes');

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function readStoredAuth() {
    var preferred = 'sb-xzxqfrvqdgkzwujbkdbk-auth-token';
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i += 1) keys.push(localStorage.key(i));
    } catch (error) {}
    keys.sort(function (a, b) {
      return (a === preferred ? -1 : 0) - (b === preferred ? -1 : 0);
    });
    for (var x = 0; x < keys.length; x += 1) {
      if (!/xzxqfrvqdgkzwujbkdbk.*auth-token/i.test(keys[x])) continue;
      try {
        var value = JSON.parse(localStorage.getItem(keys[x]) || '{}');
        var token = value.access_token ||
          value.currentSession && value.currentSession.access_token ||
          value.session && value.session.access_token;
        if (token) return token;
      } catch (error) {}
    }
    return '';
  }

  function accessToken() {
    try {
      if (window.CL_SB && window.CL_SB.auth && window.CL_SB.auth.getSession) {
        return window.CL_SB.auth.getSession().then(function (result) {
          return result && result.data && result.data.session && result.data.session.access_token || readStoredAuth();
        });
      }
    } catch (error) {}
    return Promise.resolve(readStoredAuth());
  }

  function sessionId() {
    try { return sessionStorage.getItem(SESSION_ID_KEY) || ''; } catch (error) { return ''; }
  }

  function browserSecret() {
    try { return sessionStorage.getItem(SECRET_KEY) || ''; } catch (error) { return ''; }
  }

  function pairingCode() {
    try { return sessionStorage.getItem(CODE_KEY) || ''; } catch (error) { return ''; }
  }

  function remember(data) {
    try {
      sessionStorage.setItem(SESSION_ID_KEY, data.session_id || '');
      sessionStorage.setItem(SECRET_KEY, data.browser_secret || '');
      sessionStorage.setItem(CODE_KEY, data.pairing_code || '');
    } catch (error) {}
  }

  function forget() {
    try {
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SECRET_KEY);
      sessionStorage.removeItem(CODE_KEY);
    } catch (error) {}
    lastSnapshot = {};
    lastPageUrl = '';
  }

  function status(text, kind) {
    var badge = q('#clSolPairingStatusV105');
    if (badge) {
      badge.className = 'badge ' + (kind || 'warn');
      badge.textContent = text;
    }
  }

  function message(text) {
    var output = q('#clSolPairingMessageV105');
    if (output) output.textContent = text || '';
  }

  function showCode(code) {
    var output = q('#clSolPairingCodeV105');
    if (output) output.value = code || '';
  }

  function openWorkspace() {
    if (workspace && !workspace.closed) {
      workspace.focus();
      return workspace;
    }
    workspace = window.open('index.html?v=cl-v105-sol-workspace', WORKSPACE_NAME);
    if (!workspace) throw new Error('Your browser blocked the Code Labs workspace window. Allow the popup, then press Open Code Labs workspace again.');
    return workspace;
  }

  function workspaceWindow() {
    if (workspace && !workspace.closed) return workspace;
    return null;
  }

  function workspaceLocation() {
    var target = workspaceWindow();
    if (!target) throw new Error('Open the Code Labs workspace first.');
    try {
      var url = new URL(target.location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith('/code-labs/')) {
        throw new Error('The workspace left Code Labs. Return it to a /code-labs/ page.');
      }
      return url;
    } catch (error) {
      if (error && /workspace left Code Labs/.test(String(error.message || error))) throw error;
      throw new Error('The workspace left the Code Labs site. Return it to a Code Labs page.');
    }
  }

  function workspaceBridge() {
    var target = workspaceWindow();
    if (!target) return null;
    try {
      workspaceLocation();
      return target.CodeLabsBuddyPageBridgeV140 || target.CodeLabsBuddyPageBridge || null;
    } catch (error) {
      return null;
    }
  }

  function waitForWorkspace(attempts) {
    attempts = attempts == null ? 40 : attempts;
    return new Promise(function (resolve, reject) {
      function check() {
        var bridge = workspaceBridge();
        if (bridge && bridge.readPage && bridge.applyCommand) return resolve(bridge);
        attempts -= 1;
        if (attempts <= 0) return reject(new Error('The Code Labs workspace did not become ready. Keep it on a Code Labs page and try again.'));
        setTimeout(check, 250);
      }
      check();
    });
  }

  function trimText(value, limit) {
    if (typeof value !== 'string' || value.length <= limit) return value;
    return value.slice(0, limit) + '\n...[trimmed for live pairing]';
  }

  function safeSnapshot() {
    var bridge = workspaceBridge();
    if (!bridge || !bridge.readPage) return {};
    var packet = bridge.readPage();
    var text = JSON.stringify(packet);
    if (text.length > 650000) {
      var copy = JSON.parse(text);
      ['current_source', 'fixed_output'].forEach(function (key) {
        if (copy[key]) {
          copy[key].value = trimText(copy[key].value, 120000);
          copy[key].preview = trimText(copy[key].preview, 12000);
        }
      });
      (copy.fields || []).forEach(function (field) {
        field.value = trimText(field.value, 40000);
      });
      (copy.sections || []).forEach(function (section) {
        section.text = trimText(section.text, 40000);
        (section.fields || []).forEach(function (field) {
          field.value = trimText(field.value, 40000);
        });
      });
      packet = copy;
    }
    if (JSON.stringify(packet).length > 740000) {
      throw new Error('The live Code Labs page packet is too large. Shorten the current code/output before pairing.');
    }
    lastSnapshot = packet;
    lastPageUrl = workspaceLocation().toString();
    return packet;
  }

  function pageInfo(includeSnapshot) {
    var target = workspaceWindow();
    if (!target) throw new Error('Open the Code Labs workspace first.');
    var url = workspaceLocation().toString();
    var snapshot = includeSnapshot ? safeSnapshot() : (url === lastPageUrl ? lastSnapshot : {});
    var pageName = '';
    try {
      pageName = snapshot.page || target.document.body && target.document.body.getAttribute('data-page') || '';
    } catch (error) {
      throw new Error('The workspace left the Code Labs site. Return it to a Code Labs page.');
    }
    return {
      page_name: pageName,
      page_url: url,
      page_fingerprint: snapshot.page_fingerprint || '',
      page_snapshot: includeSnapshot ? snapshot : undefined
    };
  }

  function request(action, extra, includeSnapshot, requireWorkspace) {
    return accessToken().then(function (token) {
      if (!token) throw new Error('Sign in to Code Labs first, then return to this page.');
      var body = {
        action: action,
        session_id: sessionId(),
        browser_secret: browserSecret()
      };
      if (requireWorkspace !== false) Object.assign(body, pageInfo(Boolean(includeSnapshot)));
      Object.assign(body, extra || {});
      if (!includeSnapshot) delete body.page_snapshot;
      return fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          apikey: PUBLIC_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = {};
        try { data = JSON.parse(text || '{}'); } catch (error) { data = { ok: false, error: text }; }
        if (!response.ok || data.ok === false) throw new Error(data.error || 'Code Labs pairing request failed.');
        return data;
      });
    });
  }

  function createPairing() {
    status('Opening workspace', 'warn');
    message('');
    try { openWorkspace(); } catch (error) {
      status('Workspace blocked', 'bad');
      message(String(error.message || error));
      return;
    }
    waitForWorkspace().then(function () {
      status('Creating code', 'warn');
      return request('create_pairing', {}, true, true);
    }).then(function (data) {
      remember(data);
      showCode(data.pairing_code);
      status('Waiting for Sol', 'warn');
      message('Give this temporary code to Sol. Keep this control page and the Code Labs workspace open.');
      startLoops();
    }).catch(function (error) {
      status('Pairing unavailable', 'bad');
      message(String(error.message || error));
    });
  }

  function heartbeat() {
    if (!sessionId() || !browserSecret() || busy || !workspaceWindow()) return;
    request('heartbeat', {}, true, true).then(function (data) {
      if (data.status === 'paired') {
        status('Sol connected', 'good');
        message('Sol can now read and use approved controls in the open Code Labs workspace.');
      } else {
        status('Waiting for Sol', 'warn');
      }
    }).catch(function (error) {
      status('Pairing paused', 'bad');
      message(String(error.message || error));
    });
  }

  function commandType(command) {
    return String(command && (command.type || command.command) || '').toLowerCase();
  }

  function applyCommand(commandRow) {
    var bridge = workspaceBridge();
    if (!bridge || !bridge.applyCommand || !bridge.readPage) {
      return Promise.resolve({ ok: false, error: 'The open Code Labs page is not ready for V140 commands.' });
    }
    try {
      var command = commandRow.command || {};
      var type = commandType(command);
      if (['write', 'write_fields', 'write_section', 'run_action', 'action', 'undo'].indexOf(type) >= 0) {
        var current = bridge.readPage();
        var expected = String(command.expected_page_fingerprint || '');
        if (!expected) return Promise.resolve({ ok: false, error: 'A current page fingerprint is required for live changes.' });
        if (expected !== String(current.page_fingerprint || '')) {
          return Promise.resolve({ ok: false, error: 'The Code Labs page changed before this command. Read the live page again.' });
        }
      }
      return Promise.resolve(bridge.applyCommand(command));
    } catch (error) {
      return Promise.resolve({ ok: false, error: String(error.message || error) });
    }
  }

  function poll() {
    if (!sessionId() || !browserSecret() || busy || !workspaceWindow()) return;
    busy = true;
    request('poll', {}, false, true).then(function (data) {
      if (data.status === 'paired') status('Sol connected', 'good');
      if (!data.command) return null;
      return applyCommand(data.command).then(function (receipt) {
        return request('receipt', { command_id: data.command.id, receipt: receipt }, true, true);
      });
    }).catch(function (error) {
      status('Pairing paused', 'bad');
      message(String(error.message || error));
    }).finally(function () {
      busy = false;
    });
  }

  function closePairing() {
    var finish = function () {
      forget();
      showCode('');
      status('Not paired', 'warn');
      message('');
      stopLoops();
    };
    if (!sessionId() || !browserSecret()) return finish();
    request('close', {}, false, false).then(finish).catch(finish);
  }

  function startLoops() {
    stopLoops();
    heartbeat();
    poll();
    heartbeatTimer = setInterval(heartbeat, 8000);
    pollTimer = setInterval(poll, 1800);
  }

  function stopLoops() {
    clearInterval(heartbeatTimer);
    clearInterval(pollTimer);
    heartbeatTimer = 0;
    pollTimer = 0;
  }

  function restorePairing() {
    if (!sessionId() || !browserSecret()) return;
    waitForWorkspace().then(function () {
      status('Restoring pairing', 'warn');
      startLoops();
    }).catch(function (error) {
      status('Pairing paused', 'bad');
      message(String(error.message || error));
    });
  }

  function buildPanel() {
    if (q('#' + ROOT_ID)) return;
    var main = q('.main') || q('main') || document.body;
    var panel = document.createElement('section');
    panel.id = ROOT_ID;
    panel.className = 'panel';
    panel.style.border = '2px solid rgba(16,185,129,.28)';
    panel.innerHTML =
      '<h2>Sol Control</h2>' +
      '<p class="muted">Keep this page open while Sol works in the separate Code Labs workspace window. Existing Buddy tools and wording are unchanged.</p>' +
      '<div class="actions">' +
      '<span id="clSolPairingStatusV105" class="badge warn">Not paired</span>' +
      '<button class="btn ghost" id="clSolWorkspaceOpenV105" type="button">Open Code Labs workspace</button>' +
      '<button class="btn primary" id="clSolPairingStartV105" type="button">Pair workspace with Sol</button>' +
      '<button class="btn ghost" id="clSolPairingCloseV105" type="button">Disconnect Sol</button>' +
      '</div>' +
      '<label>Temporary pairing code<input id="clSolPairingCodeV105" readonly></label>' +
      '<p id="clSolPairingMessageV105" class="muted"></p>';
    main.appendChild(panel);

    q('#clSolWorkspaceOpenV105').onclick = function () {
      try {
        openWorkspace();
        status('Workspace open', 'good');
        message('Use the normal Code Labs menu in the workspace window. Keep this control page open.');
        restorePairing();
      } catch (error) {
        status('Workspace blocked', 'bad');
        message(String(error.message || error));
      }
    };
    q('#clSolPairingStartV105').onclick = createPairing;
    q('#clSolPairingCloseV105').onclick = closePairing;
    showCode(pairingCode());
    if (sessionId() && browserSecret()) {
      status('Reopen workspace', 'warn');
      message('Open the Code Labs workspace again to restore this pairing.');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildPanel);
  else buildPanel();
})();
