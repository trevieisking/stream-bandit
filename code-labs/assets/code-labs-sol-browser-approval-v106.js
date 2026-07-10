/* Code Labs V106 Sol Browser Approval
   Adds an explicit owner approval step without sending pairing codes through chat.
*/
(function () {
  'use strict';

  var PROJECT_URL = 'https://xzxqfrvqdgkzwujbkdbk.supabase.co';
  var PUBLIC_KEY = 'sb_publishable_1wHhSq2xo0XBwsKXO_64HQ_xyVY9xRN';
  var SESSION_ID_KEY = 'codeLabsSolPairingSessionV105';
  var SECRET_KEY = 'codeLabsSolPairingSecretV105';
  var BUTTON_ID = 'clSolApproveV106';

  function q(selector) { return document.querySelector(selector); }

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

  function stored(key) {
    try { return sessionStorage.getItem(key) || ''; } catch (error) { return ''; }
  }

  function setStatus(text, kind) {
    var badge = q('#clSolPairingStatusV105');
    if (badge) {
      badge.className = 'badge ' + (kind || 'warn');
      badge.textContent = text;
    }
  }

  function setMessage(text) {
    var output = q('#clSolPairingMessageV105');
    if (output) output.textContent = text || '';
  }

  function approve() {
    var sessionId = stored(SESSION_ID_KEY);
    var browserSecret = stored(SECRET_KEY);
    if (!sessionId || !browserSecret) {
      setStatus('Create pairing first', 'bad');
      setMessage('Press Pair workspace with Sol first, then press Approve Sol.');
      return;
    }

    setStatus('Approving Sol', 'warn');
    setMessage('Checking the signed-in Code Labs owner and this exact browser session...');

    accessToken().then(function (token) {
      if (!token) throw new Error('Sign in to Code Labs first, then return to this page.');
      return fetch(PROJECT_URL + '/rest/v1/rpc/code_labs_approve_sol_v106', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          apikey: PUBLIC_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_session_id: sessionId,
          p_browser_secret: browserSecret
        })
      });
    }).then(function (response) {
      return response.text().then(function (text) {
        var data = {};
        try { data = JSON.parse(text || '{}'); } catch (error) { data = {}; }
        if (!response.ok) throw new Error(data.message || data.error || text || 'Sol approval failed.');
        return data;
      });
    }).then(function () {
      setStatus('Approved for Sol', 'good');
      setMessage('Approval complete. Return to ChatGPT and tell Sol: approved. Keep both Code Labs windows open.');
    }).catch(function (error) {
      setStatus('Approval unavailable', 'bad');
      setMessage(String(error.message || error));
    });
  }

  function install() {
    if (q('#' + BUTTON_ID)) return;
    var pairButton = q('#clSolPairingStartV105');
    if (!pairButton || !pairButton.parentNode) {
      setTimeout(install, 200);
      return;
    }
    var button = document.createElement('button');
    button.id = BUTTON_ID;
    button.type = 'button';
    button.className = 'btn primary';
    button.textContent = 'Approve Sol';
    button.onclick = approve;
    pairButton.parentNode.insertBefore(button, pairButton.nextSibling);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
