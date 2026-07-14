/* Code Labs Current File Context V200 - read only. */
(function () {
  'use strict';
  var VERSION = 'V200.1';
  var STATE_KEY = 'codeLabsV1State';

  function readState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function value(selector) {
    var element = document.querySelector(selector);
    return element ? String(element.value == null ? element.textContent || '' : element.value) : '';
  }

  function current() {
    var state = readState();
    var file = state.file || {};
    var source = file.githubSource || {};
    var project = state.project || {};
    var path = source.path || file.path || file.filename || '';
    var original = value('#loadedCode') || value('#plIn') || file.currentCode || '';
    var proposed = value('#fixedCode') || value('#plOut') || file.fixedCode || original;
    return {
      version: VERSION,
      saved_file_id: file.savedFileId || file.saved_file_id || '',
      project_id: file.projectId || file.project_id || '',
      repo: source.owner && source.repo ? source.owner + '/' + source.repo : project.repo || '',
      path: path,
      source_branch: source.branch || 'main',
      filename: file.filename || path.split('/').pop() || '',
      original: String(original),
      proposed: String(proposed),
      original_characters: String(original).length,
      proposed_characters: String(proposed).length,
      page: document.body && document.body.getAttribute('data-page') || ''
    };
  }

  window.CodeLabsCurrentFileContextV200 = { version: VERSION, current: current };
})();
