/* Code Labs Current File Context V216 - read only. */
(function () {
  'use strict';
  var VERSION = 'V216.0';
  var STATE_KEY = 'codeLabsV1State';

  function readState() {
    try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function value(selector) {
    var element = document.querySelector(selector);
    return element ? String(element.value == null ? element.textContent || '' : element.value) : '';
  }

  function cleanPath(path) {
    return String(path || '').replace(/^\/+/, '');
  }

  function verifiedGitHubSource(source) {
    source = source || {};
    var loader = String(source.loadedBy || '');
    var mode = String(source.mode || '');
    var raw = String(source.raw || '');
    var trustedLoader = mode === 'read-only' || loader === 'buddy-canvas-source-control-v126';
    if (!trustedLoader || !source.owner || !source.repo || !source.path || !raw) return false;
    try {
      var url = new URL(raw);
      if (url.hostname !== 'raw.githubusercontent.com') return false;
      var parts = url.pathname.replace(/^\//, '').split('/');
      var rawOwner = decodeURIComponent(parts[0] || '');
      var rawRepo = decodeURIComponent(parts[1] || '');
      var rawBranch = decodeURIComponent(parts[2] || '');
      var rawPath = parts.slice(3).map(decodeURIComponent).join('/');
      return rawOwner === String(source.owner) &&
        rawRepo === String(source.repo) &&
        rawBranch === String(source.branch || 'main') &&
        cleanPath(rawPath) === cleanPath(source.path);
    } catch (error) {
      return false;
    }
  }

  function current() {
    var state = readState();
    var file = state.file || {};
    var source = file.githubSource || {};
    var project = state.project || {};
    var verified = verifiedGitHubSource(source);
    var path = source.path || file.path || file.filename || '';
    var sourceRepo = verified ? source.owner + '/' + source.repo : '';
    var repo = sourceRepo || project.repo || '';
    var original = value('#loadedCode') || value('#plIn') || file.currentCode || '';
    var proposed = value('#fixedCode') || value('#plOut') || file.fixedCode || original;
    return {
      version: VERSION,
      saved_file_id: file.savedFileId || file.saved_file_id || '',
      project_id: file.projectId || file.project_id || '',
      repo: repo,
      source_repo: sourceRepo,
      source_verified: verified,
      source_raw: verified ? String(source.raw || '') : '',
      source_loaded_at: verified ? String(source.loadedAt || '') : '',
      path: path,
      fixed_path: file.fixedPath || file.fixedFile || file.fixedFilename || '',
      source_branch: source.branch || 'main',
      filename: file.filename || path.split('/').pop() || '',
      original: String(original),
      proposed: String(proposed),
      original_characters: String(original).length,
      proposed_characters: String(proposed).length,
      page: document.body && document.body.getAttribute('data-page') || ''
    };
  }

  window.CodeLabsCurrentFileContextV200 = { version: VERSION, current: current, verifiedGitHubSource: verifiedGitHubSource };
})();