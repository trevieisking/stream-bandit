/* Code Labs V105 Sol Pairing
   Adds a short-lived, signed-in browser pairing around the existing V140 page bridge.
   Does not alter existing Buddy wording or page workflow copy.
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
  var pollTimer = 0;
  var heartbeatTimer = 0;
  var busy = false;

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
        var token = value.access_token || value.currentSession && value.currentSession.access_token || value.session && value.session.access_token;
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
  }

  function status(message, kind) {
    var badge = q('#clSolPairingStatusV105');
    if (badge) {
      badge.className = 'badge ' + (kind || 'warn');
      badge.textContent = message;
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

  function safeSnapshot() {
    var bridge = window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge;
    if (!bridge || !bridge.readPage) return {};
    var packet = bridge.readPage();
    var text = JSON.stringify(packet);
    if (text.length <= 650000) return packet;

    var copy = JSON.parse(text);
    ['current_source', 'fixed_output'].forEach(function (key) {
      if (copy[key] && typeof copy[key].value === 'string' && copy[key].value.length > 160000) {
        copy[key].value = copy[key].value.slice(0, 160000) + '\n...[trimmed for live pairing]';
      }
    });
    (copy.fields || []).forEach(function (field) {
      if (typeof field.value === 'string' && field.value.length > 160000) {
        field.value = field.value.slice(0, 160000) + '\n...[trimmed for live pairing]';
      }
    });
    return copy;
  }

  function pageInfo() {
    var snapshot = safeSnapshot();
    return {
      page_name: snapshot.page || document.body && document.body.getAttribute('data-page') || '',
      page_url: location.href,
      page_fingerprint: snapshot.page_fingerprint || '',
      page_snapshot: snapshot
    };
  }

  function post(action, extra, keepalive) {
    return accessToken().then(function (token) {
      if (!token) throw new Error('Sign in to Code Labs first, then press Pair this page with Sol.');
      var base = {
        action: action,
        session_id: sessionId(),
        browser_secret: browserSecret()
      };
      var includeSnapshot = action === 'create_pairing' || action === 'heartbeat' || (action === 'receipt' && !keepalive);
      var info = includeSnapshot ? pageInfo() : {
        page_name: document.body && document.body.getAttribute('data-page') || '',
        page_url: location.href,
        page_fingerprint: (window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge || {}).readPage ?
          (window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge).readPage().page_fingerprint : ''
      };
      var body = Object.assign(base, info, extra || {});
      return fetch(ENDPOINT, {
        method: 'POST',
        keepalive: Boolean(keepalive),
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
    status('Creating code', 'warn');
    message('');
    post('create_pairing').then(function (data) {
      remember(data);
      showCode(data.pairing_code);
      status('Waiting for Sol', 'warn');
      message('Use this temporary code when Sol asks to pair. It expires after 10 minutes.');
      startLoops();
    }).catch(function (error) {
      status('Pairing unavailable', 'bad');
      message(String(error.message || error));
    });
  }

  function heartbeat() {
    if (!sessionId() || !browserSecret() || busy) return;
    post('heartbeat').then(function (data) {
      if (data.status === 'paired') {
        status('Sol connected', 'good');
        message('Sol can now read this live page and use approved Code Labs controls.');
      } else {
        status('Waiting for Sol', 'warn');
      }
    }).catch(function (error) {
      status('Pairing paused', 'bad');
      message(String(error.message || error));
    });
  }

  function sendReceipt(commandId, receipt, keepalive) {
    return post('receipt', { command_id: commandId, receipt: receipt }, keepalive);
  }

  function applyCommand(commandRow) {
    var bridge = window.CodeLabsBuddyPageBridgeV140 || window.CodeLabsBuddyPageBridge;
    if (!bridge || !bridge.applyCommand) {
      return Promise.resolve({ ok: false, error: 'The V140 page bridge is not ready.' });
    }
    try {
      return Promise.resolve(bridge.applyCommand(commandRow.command || {}));
    } catch (error) {
      return Promise.resolve({ ok: false, error: String(error.message || error) });
    }
  }

  function poll() {
    if (!sessionId() || !browserSecret() || busy) return;
    busy = true;
    post('poll').then(function (data) {
      if (data.status === 'paired') status('Sol connected', 'good');
      if (!data.command) return null;
      return applyCommand(data.command).then(function (receipt) {
        var likelyNavigation = data.command.command && data.command.command.type === 'run_action';
        return sendReceipt(data.command.id, receipt, likelyNavigation);
      });
    }).catch(function (error) {
      status('Pairing paused', 'bad');
      message(String(error.message || error));
    }).finally(function () {
      busy = false;
    });
  }

  function closePairing() {
    var hadSession = Boolean(sessionId() && browserSecret());
    var done = function () {
      forget();
      showCode('');
      status('Not paired', 'warn');
      message('');
      stopLoops();
    };
    if (!hadSession) return done();
    post('close').then(done).catch(done);
  }

  function startLoops() {
    stopLoops();
    heartbeat();
    poll();
    heartbeatTimer = setInterval(heartbeat, 4000);
    pollTimer = setInterval(poll, 1800);
  }

  function stopLoops() {
    clearInterval(heartbeatTimer);
    clearInterval(pollTimer);
    heartbeatTimer = 0;
    pollTimer = 0;
  }

  function buildPanel() {
    if (q('#' + ROOT_ID)) return true;
    var bridgePanel = q('#clBuddyPageBridgeV139');
    var main = q('.main') || q('main');
    if (!bridgePanel && !main) return false;

    var panel = document.createElement('section');
    panel.id = ROOT_ID;
    panel.className = 'panel';
    panel.style.border = '2px solid rgba(16,185,129,.28)';
    panel.innerHTML =
      '<h2>Sol Pairing</h2>' +
      '<p class="muted">Temporarily connect this signed-in Code Labs tab so Sol can use the existing V140 read, write, action, receipt and undo controls.</p>' +
      '<div class="actions">' +
      '<span id="clSolPairingStatusV105" class="badge warn">Not paired</span>' +
      '<button class="btn primary" id="clSolPairingStartV105" type="button">Pair this page with Sol</button>' +
      '<button class="btn ghost" id="clSolPairingCloseV105" type="button">Disconnect Sol</button>' +
      '</div>' +
      '<label>Temporary pairing code<input id="clSolPairingCodeV105" readonly></label>' +
      '<p id="clSolPairingMessageV105" class="muted"></p>';

    if (bridgePanel && bridgePanel.parentNode) {
      bridgePanel.parentNode.insertBefore(panel, bridgePanel.nextSibling);
    } else {
      main.insertBefore(panel, main.firstChild || null);
    }

    q('#clSolPairingStartV105').onclick = createPairing;
    q('#clSolPairingCloseV105').onclick = closePairing;
    showCode(pairingCode());
    if (sessionId() && browserSecret()) {
      status('Restoring pairing', 'warn');
      startLoops();
    }
    return true;
  }

  function boot() {
    if (!buildPanel()) setTimeout(boot, 300);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();