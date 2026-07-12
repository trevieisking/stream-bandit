/* Code Labs One Flow V200
   Global non-coder workflow, Saved Files entry, and full-file Buddy Lane handoff.
   Does not write GitHub, deploy, merge, or change Stream Bandit data. */
(function () {
  'use strict';

  var VERSION = 'V200.6';
  var STATE = 'codeLabsV1State';
  var HANDOFF = 'codeLabsBuddyLaneHandoffV200';
  var sendInFlight = false;

  var PAGES = {
    index: { step: 1, title: 'Start', next: 'setup.html' },
    setup: { step: 2, title: 'Project setup', next: 'saved-files.html' },
    'saved-files': { step: 3, title: 'Load or edit full file', next: 'rescue-room.html' },
    'file-lab': { step: 3, title: 'Legacy file loader', next: 'rescue-room.html' },
    'rescue-room': { step: 4, title: 'Describe the repair', next: 'packet-builder.html' },
    'packet-builder': { step: 5, title: 'Build repair context', next: 'patch-lab.html' },
    'patch-lab': { step: 6, title: 'Apply and validate repair', next: 'buddy-canvas.html' },
    'buddy-canvas': { step: 7, title: 'Buddy Lane handoff', next: 'preview-test.html' },
    'preview-test': { step: 8, title: 'Preview and test', next: 'checkpoints.html' },
    checkpoints: { step: 9, title: 'Checkpoint and receipt', next: 'help.html' }
  };

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function page() {
    return (document.body && document.body.getAttribute('data-page')) ||
      location.pathname.split('/').pop().replace(/\.html?$/, '') ||
      'index';
  }

  function read() {
    try {
      return JSON.parse(localStorage.getItem(STATE) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function write(value) {
    localStorage.setItem(STATE, JSON.stringify(value || {}));
  }

  function readHandoff() {
    try {
      return JSON.parse(localStorage.getItem(HANDOFF) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function esc(value) {
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

  function hash32(text) {
    var value = String(text || '');
    var hash = 0;
    for (var index = 0; index < value.length; index += 1) {
      hash = ((hash << 5) - hash) + value.charCodeAt(index);
      hash |= 0;
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function slug(value) {
    return String(value || 'file')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'file';
  }

  function splitRepo(value) {
    var match = String(value || '').trim().match(/^([^/\s]+)\/([^/\s]+)$/);
    return match ? { valid: true, owner: match[1], repo: match[2], full: match[1] + '/' + match[2] } : { valid: false };
  }

  function info() {
    var state = read();
    var file = state.file || {};
    var source = file.githubSource || {};
    var project = state.project || {};
    var repository = source.owner && source.repo
      ? source.owner + '/' + source.repo
      : (project.repo || 'trevieisking/stream-bandit');

    return {
      state: state,
      file: file,
      name: file.filename || file.path || source.path || 'file.html',
      path: file.path || source.path || file.filename || '',
      repo: repository,
      branch: source.branch || 'main',
      source: String(file.currentCode || ''),
      fixed: String(file.fixedCode || '')
    };
  }

  function isFull(path, code) {
    var text = String(code || '').trim();
    if (!text || text.length < 120) return false;
    if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(text)) return false;
    if (/^(?:diff --git |Index: )/i.test(text)) return false;
    if (/^@@\s*-\d+(?:,\d+)?\s+\+\d+(?:,\d+)?\s*@@/m.test(text)) return false;
    if (/^---\s+\S+/m.test(text) && /^\+\+\+\s+\S+/m.test(text)) return false;
    if (/\.html?$/i.test(path || '') && !(/<!doctype\s+html/i.test(text) || /<html[\s>]/i.test(text))) return false;
    return true;
  }

  function toast(message) {
    var element = q('#toast');
    if (!element) {
      console.log(message);
      return;
    }
    element.textContent = message;
    element.classList.add('show');
    setTimeout(function () {
      element.classList.remove('show');
    }, 2400);
  }

  function editorSnapshot() {
    var name = q('#clSavedFileName');
    var code = q('#clSavedFileCode');
    if (!name || !code) return { ok: false, error: 'Load or paste one complete file first.' };

    var text = String(code.value || '');
    if (!text.trim()) return { ok: false, error: 'Load or paste one complete file first.' };

    var target = String(name.value || 'file.html').trim().replace(/^\/+/, '') || 'file.html';
    return { ok: true, target: target, text: text };
  }

  function selectedSavedFileId() {
    var selected = qa('[data-cl-saved-file-check]:checked');
    return selected.length === 1 ? String(selected[0].value || '') : '';
  }

  async function resolveSelectedProjectRepo(fileId) {
    if (!fileId) return { ok: true, source: 'local_or_manual' };

    var supabase = window.CL_SB;
    if (!supabase || !supabase.from) {
      return { ok: false, error: 'Load the selected saved file before sending it to Buddy Lane.' };
    }

    try {
      var fileResult = await supabase
        .from('code_labs_files')
        .select('project_id')
        .eq('id', fileId)
        .maybeSingle();
      if (fileResult.error) throw fileResult.error;

      var projectId = fileResult.data && fileResult.data.project_id;
      if (!projectId) {
        return { ok: false, error: 'The selected saved file has no Code Labs project.' };
      }

      var projectResult = await supabase
        .from('code_labs_projects')
        .select('repo')
        .eq('id', projectId)
        .maybeSingle();
      if (projectResult.error) throw projectResult.error;

      var repository = splitRepo(projectResult.data && projectResult.data.repo);
      if (!repository.valid) {
        return { ok: false, error: 'The selected saved file has no valid repository. Set it in Code Labs Setup first.' };
      }

      return {
        ok: true,
        source: 'selected_saved_file',
        repo: repository.full,
        owner: repository.owner,
        repoName: repository.repo,
        projectId: projectId
      };
    } catch (error) {
      console.error('Code Labs could not confirm the selected saved-file repository.');
      return { ok: false, error: 'Code Labs could not confirm the selected saved-file repository. No handoff was created.' };
    }
  }

  function commitEditorSnapshot(snapshot, repositoryContext) {
    var state = read();
    state.file = state.file || {};
    state.project = state.project || {};

    var source = {
      branch: 'main',
      path: snapshot.target,
      loadedAt: new Date().toISOString()
    };

    if (repositoryContext && repositoryContext.source === 'selected_saved_file') {
      source.owner = repositoryContext.owner;
      source.repo = repositoryContext.repoName;
      state.project.repo = repositoryContext.repo;
      state.file.projectId = repositoryContext.projectId;
      state.file.repositorySource = 'selected_saved_file';
    } else {
      delete state.file.projectId;
      state.file.repositorySource = 'setup';
      var setupRepository = splitRepo(state.project.repo || '');
      if (setupRepository.valid) {
        source.owner = setupRepository.owner;
        source.repo = setupRepository.repo;
      }
    }

    state.file.filename = snapshot.target;
    state.file.path = snapshot.target;
    state.file.currentCode = snapshot.text;
    state.file.fixedCode = '';
    state.file.githubSource = source;
    state.file.loadedBy = 'saved-files-v200';
    state.file.loadedAt = new Date().toISOString();
    state.log = state.log || [];
    state.log.unshift({
      id: 'cl_v200_' + Date.now(),
      date: new Date().toLocaleString(),
      msg: 'Loaded full file from Saved Files into Code Labs workflow'
    });
    state.log = state.log.slice(0, 80);
    write(state);
    return { ok: true, repo: source.owner && source.repo ? source.owner + '/' + source.repo : '' };
  }

  async function prepareSavedEditor(options) {
    var settings = options || {};
    var snapshot = editorSnapshot();
    if (!snapshot.ok) return snapshot;

    var fileId = settings.forceLocal ? '' : selectedSavedFileId();
    var repositoryContext = await resolveSelectedProjectRepo(fileId);
    if (!repositoryContext.ok) return repositoryContext;

    return commitEditorSnapshot(snapshot, repositoryContext);
  }

  function handoffId(path, code) {
    return 'clh_' + Date.now() + '_' + hash32(String(path || '') + '\n' + String(code || ''));
  }

  function buildHandoff() {
    var current = info();
    var full = current.fixed || current.source;
    var path = current.path || current.name;

    if (!isFull(path, full)) {
      return { ok: false, error: 'Buddy Lane needs one complete file, not a snippet or patch. Save or validate the full output first.' };
    }

    var branch = 'code-labs/' + slug(path) + '-' + new Date().toISOString().slice(0, 10);
    var packet = {
      version: VERSION,
      handoff_id: handoffId(path, full),
      created_at: new Date().toISOString(),
      repo: current.repo,
      path: path,
      source_branch: current.branch,
      request_branch: branch,
      filename: current.name,
      source_code: current.source,
      fixed_code: full,
      source_characters: current.source.length,
      fixed_characters: full.length,
      source_hash32: hash32(current.source),
      fixed_hash32: hash32(full),
      full_file: true,
      branch_pr_only: true,
      direct_main_write: false,
      deletes_anything: false,
      next_action: 'ChatGPT verifies, creates or updates a non-protected branch, opens or updates a PR, runs review gates, and returns receipts.'
    };

    localStorage.setItem(HANDOFF, JSON.stringify(packet));
    var state = current.state;
    state.file = state.file || {};
    state.file.fixedCode = full;
    state.file.buddyLaneHandoff = {
      version: packet.version,
      handoff_id: packet.handoff_id,
      created_at: packet.created_at,
      path: packet.path,
      source_hash32: packet.source_hash32,
      fixed_hash32: packet.fixed_hash32
    };
    write(state);
    return { ok: true, packet: packet };
  }

  function setSendBusy(busy) {
    sendInFlight = busy;
    ['#clSendBuddyLaneV200', '#clSavedToBuddyV200'].forEach(function (selector) {
      var button = q(selector);
      if (!button) return;
      button.disabled = busy;
      button.setAttribute('aria-busy', busy ? 'true' : 'false');
    });
  }

  async function sendToBuddy() {
    if (sendInFlight) {
      toast('Buddy Lane is already preparing this file.');
      return;
    }

    setSendBusy(true);
    try {
      if (page() === 'saved-files') {
        var preparation = await prepareSavedEditor();
        if (!preparation.ok) {
          toast(preparation.error);
          setSendBusy(false);
          return;
        }
      }

      var result = buildHandoff();
      if (!result.ok) {
        toast(result.error);
        setSendBusy(false);
        return;
      }

      toast('Complete file sent to Buddy Lane');
      setTimeout(function () {
        location.href = 'buddy-canvas.html?handoff=v200&handoff_id=' + encodeURIComponent(result.packet.handoff_id);
      }, 350);
    } catch (error) {
      console.error('Code Labs could not prepare the Buddy Lane handoff.');
      toast('Code Labs could not prepare the Buddy Lane handoff. No handoff was created.');
      setSendBusy(false);
    }
  }

  function addStyle() {
    if (q('#clOneFlowV200Style')) return;
    var style = document.createElement('style');
    style.id = 'clOneFlowV200Style';
    style.textContent = '.clOneFlowLane{border:1px solid rgba(124,60,255,.35);background:linear-gradient(135deg,rgba(124,60,255,.10),rgba(14,165,233,.08));border-radius:18px;padding:14px;margin:12px 0}.clOneFlowLane h2{margin:0 0 5px}.clOneFlowMeta{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.clOneFlowMeta span{font-size:12px;font-weight:850;background:#eef2ff;color:#3730a3;border-radius:999px;padding:5px 9px}.clOneFlowNote{font-size:13px;color:#475569}.clSavedUploadV200{display:grid;gap:10px;margin-top:10px}.clSavedUploadV200 input[type=file]{max-width:100%}';
    document.head.appendChild(style);
  }

  function addLane() {
    var id = page();
    var config = PAGES[id];
    var main = q('.main');
    if (!config || !main || q('#clOneFlowLaneV200')) return;

    var current = info();
    var section = document.createElement('section');
    section.id = 'clOneFlowLaneV200';
    section.className = 'clOneFlowLane';
    var showSend = ['packet-builder', 'patch-lab', 'buddy-canvas', 'preview-test', 'checkpoints', 'saved-files'].indexOf(id) >= 0;
    section.innerHTML = '<h2>' + config.step + '. ' + esc(config.title) + '</h2>' +
      '<p class="clOneFlowNote">Buddy Lane keeps this simple: you work only up to the full-file repair. ChatGPT handles branch, pull request, review and deployment through the Code Labs connector.</p>' +
      '<div class="clOneFlowMeta"><span>File: ' + esc(current.name) + '</span><span>Repo: ' + esc(current.repo) + '</span><span>Source: ' + esc(current.branch) + '</span><span>Full source: ' + (current.source.length ? 'yes' : 'not yet') + '</span></div>' +
      '<div class="actions">' + (showSend ? '<button class="btn primary" id="clSendBuddyLaneV200" type="button">Send complete file to Buddy Lane</button>' : '') + '<a class="btn ghost" href="' + esc(config.next) + '">Next step</a></div>';

    var top = q('.topbar', main) || q('.hero', main) || main.firstChild;
    if (top && top.parentNode === main) main.insertBefore(section, top.nextSibling);
    else main.insertBefore(section, main.firstChild);

    var button = q('#clSendBuddyLaneV200');
    if (button) button.onclick = sendToBuddy;
  }

  function addSavedFilesEntry() {
    if (page() !== 'saved-files') return;
    var hero = q('#clSavedFilesV170') || q('.hero');
    var main = q('.main');
    if (!main || q('#clSavedUploadV200')) return;

    var panel = document.createElement('section');
    panel.className = 'panel';
    panel.id = 'clSavedUploadV200';
    panel.innerHTML = '<h2>3. Load or edit one complete file</h2>' +
      '<p>This replaces the old separate File Lab step. Upload a local code file, paste a full file, or load one saved Supabase file below.</p>' +
      '<div class="clSavedUploadV200"><label>Upload local code file<input id="clOneFlowUploadV200" type="file" accept=".html,.htm,.css,.js,.ts,.tsx,.jsx,.json,.md,.txt,.sql,.yml,.yaml"></label>' +
      '<div class="actions"><button class="btn ghost" id="clUseSavedEditorV200" type="button">Use editor file in workflow</button><button class="btn primary" id="clSavedToBuddyV200" type="button">Send complete file to Buddy Lane</button></div>' +
      '<div id="clSavedEntryStatusV200" class="notice"><p><b>Safe:</b> loading here updates Code Labs workflow state only. GitHub is not changed.</p></div></div>';

    if (hero && hero.parentNode === main) main.insertBefore(panel, hero.nextSibling);
    else main.insertBefore(panel, main.firstChild);

    var upload = q('#clOneFlowUploadV200');
    upload.onchange = function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;

      qa('[data-cl-saved-file-check]:checked').forEach(function (checkbox) {
        checkbox.checked = false;
      });

      var reader = new FileReader();
      reader.onload = async function () {
        var name = q('#clSavedFileName');
        var code = q('#clSavedFileCode');
        if (name) name.value = file.name;
        if (code) code.value = String(reader.result || '');

        var preparation = await prepareSavedEditor({ forceLocal: true });
        var status = q('#clSavedEntryStatusV200');
        if (!preparation.ok) {
          if (status) status.innerHTML = '<p><b>Load failed:</b> ' + esc(preparation.error) + '</p>';
          toast(preparation.error);
          return;
        }

        if (status) status.innerHTML = '<p><b>Loaded:</b> ' + esc(file.name) + ' · ' + String(reader.result || '').length + ' characters.</p>';
        toast('Full file loaded');
      };
      reader.readAsText(file);
    };

    q('#clUseSavedEditorV200').onclick = async function () {
      var preparation = await prepareSavedEditor();
      if (preparation.ok) toast('File loaded into workflow');
      else toast(preparation.error);
    };
    q('#clSavedToBuddyV200').onclick = sendToBuddy;
  }

  function hydrateBuddy() {
    if (page() !== 'buddy-canvas') return;
    var params = new URLSearchParams(location.search);
    var handoff = readHandoff();
    var requested = params.get('handoff') === 'v200';
    var id = params.get('handoff_id') || '';
    if (!requested || !handoff.full_file || !handoff.handoff_id || id !== handoff.handoff_id) return;

    localStorage.removeItem(HANDOFF);
    var state = read();
    state.file = state.file || {};
    state.project = state.project || {};
    state.file.filename = handoff.filename || state.file.filename;
    state.file.path = handoff.path || state.file.path;
    state.file.currentCode = handoff.source_code || state.file.currentCode;
    state.file.fixedCode = handoff.fixed_code || state.file.fixedCode;
    state.project.repo = handoff.repo || state.project.repo;
    state.file.githubSource = state.file.githubSource || {};
    state.file.githubSource.path = handoff.path || state.file.githubSource.path;
    state.file.githubSource.branch = handoff.source_branch || state.file.githubSource.branch;
    var repository = splitRepo(handoff.repo || '');
    if (repository.valid) {
      state.file.githubSource.owner = repository.owner;
      state.file.githubSource.repo = repository.repo;
    }
    write(state);

    try {
      history.replaceState(null, '', location.pathname);
    } catch (error) {
      // URL cleanup is best-effort only.
    }

    setTimeout(function () {
      var fixed = q('#fixedCode');
      var loaded = q('#loadedCode');
      if (loaded && handoff.source_code) loaded.value = handoff.source_code;
      if (fixed && handoff.fixed_code) {
        fixed.value = handoff.fixed_code;
        try {
          fixed.dispatchEvent(new Event('input', { bubbles: true }));
        } catch (error) {
          // Older browsers still retain the assigned value.
        }
      }
      toast('Buddy Lane loaded the complete file');
    }, 250);
  }

  function renameLegacy() {
    qa('a[href="file-lab.html"]').forEach(function (anchor) {
      anchor.href = 'saved-files.html';
      var container = q('div', anchor);
      if (!container) return;
      if (container.childNodes[0]) container.childNodes[0].nodeValue = 'Saved Files';
      var small = q('small', container);
      if (small) small.textContent = 'Load or edit full file';
    });
  }

  function run() {
    addStyle();
    renameLegacy();
    addSavedFilesEntry();
    addLane();
    hydrateBuddy();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
  setTimeout(run, 300);
  setTimeout(run, 1000);

  window.CodeLabsOneFlowV200 = {
    version: VERSION,
    sendToBuddyLane: sendToBuddy,
    buildHandoff: buildHandoff,
    readHandoff: readHandoff,
    isFullFile: isFull,
    prepareSavedEditor: prepareSavedEditor
  };
})();
