/* Code Labs Setup Persist V136
   Keeps Setup identity remembered as the user types and when Save is clicked.
   Project URL and repository are preserved separately from the current file path.
   Browser/local state only. No GitHub write. No Supabase schema/RLS change.
*/
(function () {
  'use strict';

  var KEY = 'codeLabsV1State';
  var VERSION = 'V136 setup identity persist';
  var IDS = ['workspace', 'siteName', 'siteUrl', 'repo', 'mode', 'notes'];
  var timer = null;

  function q(selector) { return document.querySelector(selector); }
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
    catch (error) { return {}; }
  }
  function write(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state || {})); return true; }
    catch (error) { return false; }
  }
  function now() { return new Date().toISOString(); }
  function value(id) {
    var element = q('#' + id);
    return element ? String(element.value || '') : '';
  }
  function setValue(id, nextValue) {
    var element = q('#' + id);
    if (element && String(element.value || '') !== String(nextValue || '')) {
      element.value = String(nextValue || '');
    }
  }
  function toast(message) {
    var element = q('#toast');
    if (element) {
      element.textContent = message;
      element.classList.add('show');
      setTimeout(function () { element.classList.remove('show'); }, 1800);
    } else {
      console.log(message);
    }
  }
  function collect() {
    return {
      workspace: value('workspace'),
      siteName: value('siteName'),
      siteUrl: value('siteUrl'),
      repo: value('repo'),
      mode: value('mode') || 'manual',
      notes: value('notes')
    };
  }
  function status(message, kind) {
    var element = q('#clSetupPersistStatus');
    if (!element) {
      var panel = q('.panel') || q('main');
      if (panel) {
        element = document.createElement('span');
        element.id = 'clSetupPersistStatus';
        element.className = 'badge warn';
        var wrap = document.createElement('p');
        wrap.appendChild(element);
        panel.insertBefore(wrap, panel.firstChild);
      }
    }
    if (element) {
      element.className = 'badge ' + (kind || 'warn');
      element.textContent = message;
    }
  }
  function restore() {
    var state = read();
    var project = state.project || {};
    var restored = {
      workspace: project.setupWorkspace || project.workspace || '',
      siteName: project.setupSiteName || project.siteName || '',
      siteUrl: project.setupSiteUrl || project.siteUrl || '',
      repo: project.setupRepo || project.repo || '',
      mode: project.mode || 'manual',
      notes: project.notes || ''
    };
    IDS.forEach(function (id) { setValue(id, restored[id]); });
    status('Setup remembered', 'good');
  }
  function save(reason) {
    var state = read();
    var values = collect();
    state.project = Object.assign({}, state.project || {}, values);
    state.project.setupWorkspace = values.workspace;
    state.project.setupSiteName = values.siteName;
    state.project.setupSiteUrl = values.siteUrl;
    state.project.setupRepo = values.repo;
    state.project.savedAt = now();
    state.project.setupPersistVersion = VERSION;
    state.log = Array.isArray(state.log) ? state.log : [];
    state.log.unshift({
      id: 'cl_setup_' + Date.now(),
      date: new Date().toLocaleString(),
      msg: 'Setup saved: ' + (reason || 'auto')
    });
    state.log = state.log.slice(0, 80);
    write(state);
    status(reason === 'button' ? 'Setup saved' : 'Setup auto-saved', 'good');
    return state;
  }
  function schedule() {
    clearTimeout(timer);
    status('Saving setup...', 'warn');
    timer = setTimeout(function () { save('auto'); }, 450);
  }
  function bind() {
    if (document.body && document.body.getAttribute('data-page') !== 'setup') return;
    var ready = IDS.every(function (id) { return !!q('#' + id); });
    if (!ready) { setTimeout(bind, 220); return; }
    restore();
    IDS.forEach(function (id) {
      var element = q('#' + id);
      if (element && !element.getAttribute('data-cl-setup-persist')) {
        element.setAttribute('data-cl-setup-persist', 'yes');
        element.addEventListener('input', schedule);
        element.addEventListener('change', schedule);
      }
    });
    var button = q('#saveSetup');
    if (button && !button.getAttribute('data-cl-setup-save-bound')) {
      button.setAttribute('data-cl-setup-save-bound', 'yes');
      button.addEventListener('click', function () {
        setTimeout(function () {
          save('button');
          toast('Setup saved and remembered.');
        }, 30);
      });
    }
    window.CodeLabsSetupPersistV134 = {
      version: VERSION,
      read: function () { return read().project || {}; },
      save: function () { return save('manual'); },
      restore: restore
    };
    window.CodeLabsSetupPersistV136 = window.CodeLabsSetupPersistV134;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
