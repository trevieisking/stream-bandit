/* Code Labs Saved File Identity V200
   Carries one deliberately selected saved-file row through the workflow.
   No database write and no background save.
*/
(function () {
  'use strict';
  var VERSION = 'V200.1';
  var STATE_KEY = 'codeLabsV1State';

  function readState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function writeState(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state || {}));
  }

  function selectedId() {
    var checked = document.querySelector('[data-cl-saved-file-check]:checked');
    return checked ? String(checked.value || '') : '';
  }

  function rememberSelectedFile() {
    var id = selectedId();
    if (!id) return;
    window.setTimeout(function () {
      var state = readState();
      state.file = state.file || {};
      state.file.savedFileId = id;
      state.file.saved_file_id = id;
      state.file.savedFileSelectedAt = new Date().toISOString();
      state.file.savedFileSource = 'saved-files-explicit-selection';
      writeState(state);
    }, 250);
  }

  function clearForLocalFile() {
    var state = readState();
    state.file = state.file || {};
    delete state.file.savedFileId;
    delete state.file.saved_file_id;
    state.file.savedFileSource = 'local-file-not-linked';
    state.file.savedFileClearedAt = new Date().toISOString();
    writeState(state);
  }

  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('#clLoadSelectedSavedFile') : null;
    if (target) rememberSelectedFile();
  });

  document.addEventListener('change', function (event) {
    var target = event.target;
    if (target && String(target.type || '').toLowerCase() === 'file') clearForLocalFile();
  });

  window.CodeLabsSavedFileIdentityV200 = {
    version: VERSION,
    selectedId: selectedId,
    remember: rememberSelectedFile,
    clear: clearForLocalFile
  };
})();
