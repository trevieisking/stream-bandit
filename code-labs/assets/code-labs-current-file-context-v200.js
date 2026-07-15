/* Code Labs Current File Context V219 - read only. */
(function () {
  'use strict';
  var VERSION = 'V219.0';
  var STATE_KEY = 'codeLabsV1State';

  function readStore(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; }
    catch (error) { return {}; }
  }

  function readState() {
    return readStore(STATE_KEY);
  }

  function value(selector) {
    var element = document.querySelector(selector);
    return element ? String(element.value == null ? element.textContent || '' : element.value) : '';
  }

  function cleanPath(path) {
    return String(path || '').replace(/^\/+/, '');
  }

  function rawPath(path) {
    return String(path || '').trim();
  }

  function actionOf(value) {
    value = String(value || 'change').toLowerCase();
    if (value === 'delete') return 'remove';
    if (value === 'create') return 'add';
    return /^(read|add|change|remove|review)$/.test(value) ? value : 'change';
  }

  function mutating(action) {
    return action === 'add' || action === 'change' || action === 'remove';
  }

  function savedTime(item) {
    var parsed = Date.parse(String(item && item.savedAt || ''));
    return isFinite(parsed) ? parsed : 0;
  }

  function meaningful(item) {
    return Boolean(item.savedAt || item.repo || item.path || item.branch || item.notes || item.fixedCode);
  }

  function sameLogicalSave(left, right) {
    if (!left || !right) return false;
    if (left.action !== right.action || left.repo !== right.repo || left.path !== right.path || left.branch !== right.branch) return false;
    var leftTime = savedTime(left);
    var rightTime = savedTime(right);
    return Boolean(leftTime && rightTime && Math.abs(leftTime - rightTime) <= 5000);
  }

  function completeHandoff(item) {
    return Boolean(item && item.repo && item.path && (!mutating(item.action) || item.branch) && (item.action !== 'remove' || item.notes));
  }

  function newestHandoff(state, verifiedRepo) {
    var file = state.file || {};
    var project = state.project || {};
    var metadata = file.metadata || {};
    var writerState = file.githubWriter || {};
    var writerStore = readStore('codeLabsGithubWriterV2');
    var repoDesk = readStore('codeLabsV30RepoDesk');
    var projectRepo = String(project.repo || metadata.repo || '').trim();
    var items = [
      { source: 'state.file.githubWriter', action: writerState.action, repo: writerState.repo, path: writerState.path, branch: writerState.branch, notes: writerState.notes, fixedCode: writerState.fixedCode, savedAt: writerState.savedAt },
      { source: 'codeLabsGithubWriterV2', action: writerStore.action, repo: writerStore.repo, path: writerStore.path, branch: writerStore.branch, notes: writerStore.notes, fixedCode: writerStore.fixedCode, savedAt: writerStore.savedAt },
      { source: 'codeLabsV30RepoDesk', action: repoDesk.mode, repo: repoDesk.repo || verifiedRepo || projectRepo, path: repoDesk.path, branch: repoDesk.branch, notes: repoDesk.notes, fixedCode: repoDesk.fixedCode, savedAt: repoDesk.savedAt }
    ].map(function (item) {
      return {
        source: item.source,
        action: actionOf(item.action),
        repo: String(item.repo || '').trim(),
        path: rawPath(item.path),
        branch: String(item.branch || '').trim(),
        notes: String(item.notes || '').trim(),
        fixedCode: String(item.fixedCode || ''),
        savedAt: String(item.savedAt || '')
      };
    }).filter(meaningful);

    items.sort(function (left, right) { return savedTime(right) - savedTime(left); });
    var latest = items[0] || null;
    if (!latest) return null;

    items.slice(1).forEach(function (candidate) {
      if (!sameLogicalSave(latest, candidate)) return;
      if (!latest.notes && candidate.notes) latest.notes = candidate.notes;
      if (!latest.fixedCode && candidate.fixedCode) latest.fixedCode = candidate.fixedCode;
    });

    latest.complete = completeHandoff(latest);
    latest.bodyBound = latest.source === 'codeLabsGithubWriterV2' || items.some(function (candidate) {
      return candidate.source === 'codeLabsGithubWriterV2' && sameLogicalSave(latest, candidate);
    });
    return latest;
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
      var rawSourcePath = parts.slice(3).map(decodeURIComponent).join('/');
      return rawOwner === String(source.owner) &&
        rawRepo === String(source.repo) &&
        rawBranch === String(source.branch || 'main') &&
        cleanPath(rawSourcePath) === cleanPath(source.path);
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
    var fallbackProposed = value('#fixedCode') || value('#plOut') || file.fixedCode || original;
    var latest = newestHandoff(state, sourceRepo);
    var proposed = latest && latest.bodyBound ? latest.fixedCode : fallbackProposed;
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
      latest_handoff_present: Boolean(latest),
      latest_handoff_source: latest ? latest.source : '',
      latest_handoff_action: latest ? latest.action : '',
      latest_handoff_repo: latest ? latest.repo : '',
      latest_handoff_path: latest ? latest.path : '',
      latest_handoff_branch: latest ? latest.branch : '',
      latest_handoff_notes: latest ? latest.notes : '',
      latest_handoff_saved_at: latest ? latest.savedAt : '',
      latest_handoff_complete: latest ? latest.complete : false,
      latest_handoff_body_bound: latest ? latest.bodyBound : false,
      latest_handoff_proposed: latest && latest.bodyBound ? latest.fixedCode : '',
      page: document.body && document.body.getAttribute('data-page') || ''
    };
  }

  window.CodeLabsCurrentFileContextV200 = { version: VERSION, current: current, verifiedGitHubSource: verifiedGitHubSource, newestHandoff: newestHandoff };
})();
