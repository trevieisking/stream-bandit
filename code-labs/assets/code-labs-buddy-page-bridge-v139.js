/* Code Labs Buddy Page Bridge V140
   Shared full-page read/write bridge for Code Labs.
   Browser-only: no GitHub token, no direct main write, no browser GitHub write.
*/
(function () {
  'use strict';

  var VERSION = 'V140';
  var STATE_KEY = 'codeLabsV1State';
  var LEGACY_OUTPUT_KEY = 'codeLabsBuddyPageBridgeV139';
  var OUTPUT_KEY = 'codeLabsBuddyPageBridgeV140';
  var COMMAND_KEY = 'codeLabsBuddyPageCommandV140';
  var RECEIPT_KEY = 'codeLabsBuddyPageReceiptV140';
  var UNDO_KEY = 'codeLabsBuddyPageUndoV140';
  var NOTES_KEY = 'codeLabsBuddySectionNotesV140:' + location.pathname;
  var ROOT_ID = 'clBuddyPageBridgeV139';
  var INSTALLED_V139 = 'data-cl-buddy-page-bridge-v139-installed';
  var INSTALLED_V140 = 'data-cl-buddy-page-bridge-v140-installed';

  if (document.documentElement.getAttribute(INSTALLED_V140) === 'yes') return;
  document.documentElement.setAttribute(INSTALLED_V139, 'yes');
  document.documentElement.setAttribute(INSTALLED_V140, 'yes');

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '{}') || {};
    } catch (error) {
      return {};
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value || {}));
      return true;
    } catch (error) {
      return false;
    }
  }

  function now() {
    return new Date().toISOString();
  }

  function firstNonEmpty() {
    for (var i = 0; i < arguments.length; i += 1) {
      var value = String(arguments[i] == null ? '' : arguments[i]);
      if (value.trim()) return value;
    }
    return '';
  }

  function hash32(value) {
    var text = String(value == null ? '' : value);
    var hash = 0;
    for (var i = 0; i < text.length; i += 1) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8);
  }

  function slug(value) {
    return String(value || 'item')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 70) || 'item';
  }

  function cleanPath(value) {
    return String(value || '').trim().replace(/^\/+/, '').replace(/\.\.\//g, '');
  }

  function pageName() {
    return (document.body && document.body.getAttribute('data-page')) ||
      location.pathname.split('/').pop().replace(/\.html?$/i, '') ||
      'unknown';
  }

  function pageFingerprint() {
    return hash32(location.pathname + '|' + document.title + '|' + pageName());
  }

  function isHidden(element) {
    var style = getComputedStyle(element);
    return Boolean(element.hidden || style.display === 'none' || style.visibility === 'hidden');
  }

  function isSensitive(element, key) {
    var type = String(element.type || '').toLowerCase();
    var proof = [
      key,
      element.id,
      element.name,
      element.autocomplete,
      element.getAttribute('aria-label'),
      element.placeholder
    ].join(' ');
    return type === 'password' ||
      /(password|passcode|secret|token|authorization|api.?key|service.?role|private.?key)/i.test(proof);
  }

  function currentFileBridge() {
    try {
      if (window.CodeLabsCurrentFileBridge && window.CodeLabsCurrentFileBridge.current) {
        return window.CodeLabsCurrentFileBridge.current() || {};
      }
    } catch (error) {}
    return {};
  }

  function buddyCanvas() {
    try {
      if (window.CodeLabsBuddyCanvas && window.CodeLabsBuddyCanvas.read) {
        return window.CodeLabsBuddyCanvas.read() || {};
      }
    } catch (error) {}
    return {};
  }

  function legacyContext() {
    var state = readJson(STATE_KEY);
    var file = state.file || {};
    var project = state.project || {};
    var githubSource = file.githubSource || {};
    var repoDesk = readJson('codeLabsV30RepoDesk');
    var githubWriter = readJson('codeLabsGithubWriterV2');
    var lane = readJson('codeLabsGithubLaneAutopilotV131');
    var laneContext = lane.context || {};
    var bridge = currentFileBridge();
    var canvas = buddyCanvas();

    var repo = firstNonEmpty(
      githubWriter.repo,
      laneContext.repo,
      repoDesk.repo,
      bridge.repo,
      githubSource.owner && githubSource.repo ? githubSource.owner + '/' + githubSource.repo : '',
      project.repo,
      'trevieisking/stream-bandit'
    );

    var path = cleanPath(firstNonEmpty(
      githubWriter.path,
      laneContext.path,
      repoDesk.path,
      bridge.path,
      githubSource.path,
      file.path,
      file.filename,
      canvas.path
    ));

    var sourceBranch = firstNonEmpty(
      githubWriter.sourceBranch,
      laneContext.source_branch,
      repoDesk.sourceBranch,
      githubSource.branch,
      'main'
    );

    var action = firstNonEmpty(
      githubWriter.action,
      laneContext.action,
      lane.action,
      repoDesk.action,
      repoDesk.mode,
      'read_context'
    );

    var fixed = firstNonEmpty(
      githubWriter.fixedCode,
      laneContext.fixed,
      bridge.fixedCode,
      file.fixedCode,
      valueBySelector('#fixedCode'),
      canvas.fixed
    );

    var source = firstNonEmpty(
      bridge.currentCode,
      file.currentCode,
      valueBySelector('#loadedCode'),
      canvas.source
    );

    var writeReady = Boolean(repo === 'trevieisking/stream-bandit' && path && fixed.trim());
    var requestBranch = firstNonEmpty(
      githubWriter.branch,
      laneContext.branch,
      repoDesk.branch,
      writeReady ? 'code-labs-buddy-' + slug(action) + '-' + slug(path) + '-v140' : ''
    );

    return {
      state: state,
      file: file,
      project: project,
      repoDesk: repoDesk,
      githubWriter: githubWriter,
      lane: lane,
      laneContext: laneContext,
      bridge: bridge,
      canvas: canvas,
      repo: repo,
      path: path,
      sourceBranch: sourceBranch,
      requestBranch: requestBranch,
      action: action,
      source: source,
      fixed: fixed,
      writeReady: writeReady,
      problem: firstNonEmpty(
        file.problem,
        valueBySelector('#problem'),
        valueBySelector('#problemText'),
        valueBySelector('#repairProblem'),
        valueBySelector('#clSafeProblem')
      ),
      preserve: firstNonEmpty(
        file.dontTouch,
        file.preserve,
        valueBySelector('#dontTouch'),
        valueBySelector('#preserve'),
        valueBySelector('#clSafeKeep')
      ),
      errors: firstNonEmpty(
        file.errors,
        valueBySelector('#errors'),
        valueBySelector('#errorNotes')
      ),
      tests: firstNonEmpty(
        valueBySelector('#testNotes'),
        valueBySelector('#previewNotes'),
        valueBySelector('#clSafeTest')
      )
    };
  }

  function valueBySelector(selector) {
    var element = q(selector);
    if (!element) return '';
    return String(element.value == null ? element.textContent || '' : element.value);
  }

  function sectionRoots() {
    var selectors = [
      'main section',
      'main .panel',
      'main [data-section]',
      '.main section',
      '.main .panel',
      '.main [data-section]',
      'body > section',
      'body > .panel'
    ].join(',');

    var seen = [];
    var roots = all(selectors).filter(function (element) {
      if (element.id === ROOT_ID) return false;
      if (element.closest && element.closest('#' + ROOT_ID)) return false;
      if (element.closest && element.closest('[data-cl-buddy-notes-ui="true"]')) return false;
      if (seen.indexOf(element) >= 0) return false;
      seen.push(element);
      return true;
    });

    if (!roots.length) roots = [q('.main') || q('main') || document.body];
    return roots;
  }

  function sectionFor(element) {
    var roots = sectionRoots();
    var best = null;
    var bestIndex = -1;

    roots.forEach(function (root, index) {
      if ((root === element || root.contains(element)) && (!best || best.contains(root))) {
        best = root;
        bestIndex = index;
      }
    });

    if (!best) return { element: document.body, key: 'page' };

    var key = firstNonEmpty(
      best.getAttribute('data-buddy-section-key'),
      best.id,
      best.getAttribute('data-section')
    );

    if (!key) {
      var heading = q('h1,h2,h3,h4,[role="heading"]', best);
      key = 'section-' + slug(heading && heading.textContent || 'part') + '-' + (bestIndex + 1);
      best.setAttribute('data-buddy-section-key', key);
    }

    return { element: best, key: key };
  }

  function ensureSectionNotes() {
    var savedNotes = readJson(NOTES_KEY);

    sectionRoots().forEach(function (root) {
      var section = sectionFor(root);
      var existing = all('[data-cl-buddy-section-note-for]', root).some(function (element) {
        return element.getAttribute('data-cl-buddy-section-note-for') === section.key;
      });
      if (existing) return;

      var details = document.createElement('details');
      details.open = true;
      details.setAttribute('data-cl-buddy-notes-ui', 'true');
      details.style.cssText = 'margin-top:12px;padding:10px;border:1px dashed rgba(59,130,246,.35);border-radius:14px';

      var summary = document.createElement('summary');
      summary.textContent = 'Buddy Notes - ' + section.key;
      summary.style.cursor = 'pointer';

      var textarea = document.createElement('textarea');
      textarea.setAttribute('data-cl-buddy-section-note-for', section.key);
      textarea.setAttribute('data-cl-buddy-writable', 'true');
      textarea.setAttribute('data-buddy-key', 'buddy-note-' + section.key);
      textarea.placeholder = 'Buddy can read and write notes for this section.';
      textarea.value = String(savedNotes[section.key] || '');
      textarea.addEventListener('input', function () {
        var notes = readJson(NOTES_KEY);
        notes[section.key] = textarea.value;
        writeJson(NOTES_KEY, notes);
      });

      details.appendChild(summary);
      details.appendChild(textarea);
      root.appendChild(details);
    });
  }

  function fieldElements(root) {
    return all('input,textarea,select,[contenteditable="true"],[data-cl-buddy-writable="true"]', root || document)
      .filter(function (element) {
        return !(element.closest && element.closest('#' + ROOT_ID));
      });
  }

  function fieldKey(element) {
    return firstNonEmpty(
      element.getAttribute('data-buddy-key'),
      element.id,
      element.name
    );
  }

  function ensureFieldKeys() {
    var counters = {};
    fieldElements().forEach(function (element) {
      var key = fieldKey(element);
      if (!key) {
        var base = sectionFor(element).key + '-' + element.tagName.toLowerCase();
        counters[base] = (counters[base] || 0) + 1;
        key = base + '-' + counters[base];
      }
      element.setAttribute('data-buddy-key', key);
    });
  }

  function canWriteField(element) {
    var type = String(element.type || '').toLowerCase();
    var key = fieldKey(element);
    return !isSensitive(element, key) &&
      !element.disabled &&
      !element.readOnly &&
      !element.hasAttribute('data-cl-buddy-readonly') &&
      !/^(file|button|submit|reset|image|hidden)$/i.test(type);
  }

  function readFieldValue(element) {
    var type = String(element.type || '').toLowerCase();
    if (type === 'file') {
      return element.files && element.files.length ? '[FILES SELECTED: ' + element.files.length + ']' : '';
    }
    if (type === 'checkbox' || type === 'radio') return Boolean(element.checked);
    if (element.tagName === 'SELECT' && element.multiple) {
      return all('option', element).filter(function (option) {
        return option.selected;
      }).map(function (option) {
        return option.value;
      });
    }
    if (element.isContentEditable) return element.textContent || '';
    return element.value == null ? '' : String(element.value);
  }

  function fieldLabel(element) {
    var label = element.id ? q('label[for="' + element.id.replace(/"/g, '\\"') + '"]') : null;
    return firstNonEmpty(
      element.getAttribute('aria-label'),
      label && label.textContent,
      element.placeholder,
      element.name,
      element.id,
      element.tagName
    );
  }

  function fieldInfo(element) {
    var key = fieldKey(element);
    var sensitive = isSensitive(element, key);
    var value = sensitive ? '[REDACTED]' : readFieldValue(element);
    var text = typeof value === 'string' ? value : JSON.stringify(value);

    return {
      key: key,
      section: sectionFor(element).key,
      id: element.id || '',
      name: element.name || '',
      tag: element.tagName.toLowerCase(),
      type: String(element.type || '').toLowerCase(),
      label: fieldLabel(element),
      writable: canWriteField(element),
      sensitive: sensitive,
      disabled: Boolean(element.disabled),
      readonly: Boolean(element.readOnly),
      value: value,
      characters: text.length,
      hash32: hash32(text)
    };
  }

  function actionElements(root) {
    return all('button,a[href],[role="button"]', root || document).filter(function (element) {
      return !(element.closest && element.closest('#' + ROOT_ID));
    });
  }

  function actionKey(element) {
    return firstNonEmpty(
      element.getAttribute('data-buddy-action'),
      element.id
    );
  }

  function ensureActionKeys() {
    var counters = {};
    actionElements().forEach(function (element) {
      var key = actionKey(element);
      if (!key) {
        var base = sectionFor(element).key + '-action-' + slug(
          element.textContent || element.getAttribute('aria-label') || element.tagName
        );
        counters[base] = (counters[base] || 0) + 1;
        key = base + '-' + counters[base];
      }
      element.setAttribute('data-buddy-action', key);
    });
  }

  function isDangerousAction(element) {
    return /(delete|remove|trash|merge|publish|deploy|send|submit|approve|reject|production|main branch)/i.test([
      actionKey(element),
      element.textContent,
      element.getAttribute('aria-label')
    ].join(' '));
  }

  function actionInfo(element) {
    var dangerous = isDangerousAction(element);
    return {
      key: actionKey(element),
      section: sectionFor(element).key,
      id: element.id || '',
      label: String(element.textContent || element.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
      href: element.getAttribute('href') || '',
      disabled: Boolean(element.disabled),
      dangerous: dangerous,
      approved: !dangerous || element.getAttribute('data-buddy-action-approved') === 'true'
    };
  }

  function collectSections() {
    return sectionRoots().map(function (root) {
      var section = sectionFor(root);
      var heading = q('h1,h2,h3,h4,[role="heading"]', root);
      var fields = fieldElements(root).filter(function (element) {
        return sectionFor(element).element === root;
      }).map(fieldInfo);
      var actions = actionElements(root).filter(function (element) {
        return sectionFor(element).element === root;
      }).map(actionInfo);
      var text = String(root.innerText || root.textContent || '');

      return {
        key: section.key,
        heading: String(heading && heading.textContent || '').trim(),
        hidden: isHidden(root),
        text: text,
        hash32: hash32(text),
        fields: fields,
        actions: actions
      };
    });
  }

  function readPage() {
    ensureSectionNotes();
    ensureFieldKeys();
    ensureActionKeys();

    var legacy = legacyContext();
    var sections = collectSections();
    var fields = [];
    var actions = [];

    sections.forEach(function (section) {
      fields = fields.concat(section.fields);
      actions = actions.concat(section.actions);
    });

    return {
      tool: 'Code Labs Buddy Page Bridge',
      version: VERSION,
      generated_at: now(),
      page: pageName(),
      page_fingerprint: pageFingerprint(),
      title: document.title || '',
      url: location.href,
      mode: legacy.writeReady ? 'write_context_ready' : 'read_write_page_bridge',

      /* V139 compatibility fields consumed by code-labs-page-polish-v172.js. */
      repo: legacy.repo,
      path: legacy.path,
      source_branch: legacy.sourceBranch,
      request_branch: legacy.requestBranch,
      action: legacy.action,

      problem: legacy.problem,
      preserve_rules: legacy.preserve,
      error_notes: legacy.errors,
      test_notes: legacy.tests,
      current_source: {
        characters: legacy.source.length,
        lines: legacy.source ? legacy.source.split(/\r?\n/).length : 0,
        hash32: hash32(legacy.source),
        value: legacy.source,
        preview: legacy.source.slice(0, 2400)
      },
      fixed_output: {
        characters: legacy.fixed.length,
        lines: legacy.fixed ? legacy.fixed.split(/\r?\n/).length : 0,
        hash32: hash32(legacy.fixed),
        value: legacy.fixed,
        preview: legacy.fixed.slice(0, 2400)
      },
      repo_desk: legacy.repoDesk,
      github_writer: {
        repo: legacy.githubWriter.repo || '',
        path: legacy.githubWriter.path || '',
        branch: legacy.githubWriter.branch || '',
        action: legacy.githubWriter.action || '',
        has_fixed_code: Boolean(String(legacy.githubWriter.fixedCode || '').trim())
      },
      github_lane: {
        action: legacy.lane.action || '',
        has_request: Boolean(String(legacy.lane.request || '').trim()),
        context: legacy.laneContext
      },
      buddy_canvas: legacy.canvas,
      counts: {
        sections: sections.length,
        fields: fields.length,
        writable_fields: fields.filter(function (field) { return field.writable; }).length,
        actions: actions.length
      },
      sections: sections,
      fields: fields,
      actions: actions,
      safety_rules: [
        'Every detected section and empty field is included.',
        'Every section receives a persistent Buddy Notes field.',
        'Sensitive fields are redacted and blocked.',
        'Blocked or sensitive field values are never stored in undo state.',
        'Writes use stable field keys only.',
        'Normal input, change, and blur events are dispatched.',
        'Dangerous actions require page opt-in and explicit confirmation.',
        'Every write returns a receipt and supports one-step undo.',
        'No GitHub token, no direct main write, and no browser GitHub write.'
      ]
    };
  }

  function elementMaps() {
    var fields = {};
    var actions = {};
    fieldElements().forEach(function (element) {
      fields[fieldKey(element)] = element;
    });
    actionElements().forEach(function (element) {
      actions[actionKey(element)] = element;
    });
    return { fields: fields, actions: actions };
  }

  function dispatchFieldEvents(element) {
    ['input', 'change', 'blur'].forEach(function (name) {
      try {
        element.dispatchEvent(new Event(name, { bubbles: true, cancelable: true }));
      } catch (error) {
        var event = document.createEvent('Event');
        event.initEvent(name, true, true);
        element.dispatchEvent(event);
      }
    });
  }

  function setFieldValue(element, value) {
    if (!canWriteField(element)) throw new Error('Field is not writable.');

    var type = String(element.type || '').toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      element.checked = Boolean(value);
    } else if (element.tagName === 'SELECT' && element.multiple) {
      var wanted = Array.isArray(value) ? value.map(String) : [String(value)];
      all('option', element).forEach(function (option) {
        option.selected = wanted.indexOf(String(option.value)) >= 0;
      });
    } else if (element.isContentEditable) {
      element.textContent = value == null ? '' : String(value);
    } else {
      element.value = value == null ? '' : String(value);
    }

    dispatchFieldEvents(element);
  }

  function commandItems(value) {
    if (Array.isArray(value)) return value;
    return Object.keys(value || {}).map(function (key) {
      return { key: key, value: value[key] };
    });
  }

  function newReceipt(command) {
    return {
      id: firstNonEmpty(command && command.id, 'cl-' + Date.now()),
      version: VERSION,
      page: pageName(),
      page_fingerprint: pageFingerprint(),
      started_at: now(),
      type: command && (command.type || command.command) || '',
      ok: false,
      changed: [],
      failed: [],
      action: null,
      completed_at: ''
    };
  }

  function runAction(command) {
    command = command || {};
    ensureActionKeys();

    var receipt = newReceipt(command);
    var maps = elementMaps();
    var key = String(command.action || command.key || '');
    var element = maps.actions[key];

    if (command.expected_page_fingerprint && command.expected_page_fingerprint !== pageFingerprint()) {
      receipt.failed.push({ key: 'page', error: 'Page changed before action.' });
    } else if (!element) {
      receipt.failed.push({ key: key, error: 'Action key not found.' });
    } else {
      var info = actionInfo(element);
      if (element.disabled) {
        receipt.failed.push({ key: key, error: 'Action is disabled.' });
      } else if (info.dangerous && !(info.approved && command.confirmed === true && command.allow_dangerous === true)) {
        receipt.failed.push({ key: key, error: 'Dangerous action is blocked.' });
      } else {
        element.click();
        receipt.action = info;
        receipt.ok = true;
      }
    }

    receipt.completed_at = now();
    writeJson(RECEIPT_KEY, receipt);
    return receipt;
  }

  function writeFields(command) {
    command = command || {};
    var before = readPage();
    var receipt = newReceipt(command);
    var maps = elementMaps();
    var undo = { page_fingerprint: before.page_fingerprint, fields: {} };

    if (command.expected_page && command.expected_page !== before.page) {
      receipt.failed.push({ key: 'page', error: 'Wrong page.' });
    } else if (command.expected_page_fingerprint && command.expected_page_fingerprint !== before.page_fingerprint) {
      receipt.failed.push({ key: 'page', error: 'Page changed before write.' });
    } else {
      commandItems(command.fields || command.values || {}).forEach(function (item) {
        var element = maps.fields[item.key];
        if (!element) {
          receipt.failed.push({ key: item.key, error: 'Field key not found.' });
          return;
        }

        /* Security boundary: check first, then capture the undo value. */
        if (!canWriteField(element) || isSensitive(element, item.key)) {
          receipt.failed.push({ key: item.key, error: 'Field is blocked or sensitive.' });
          return;
        }

        try {
          undo.fields[item.key] = readFieldValue(element);
          setFieldValue(element, item.value);
          receipt.changed.push({
            key: item.key,
            section: sectionFor(element).key,
            after_hash: fieldInfo(element).hash32
          });
        } catch (error) {
          delete undo.fields[item.key];
          receipt.failed.push({ key: item.key, error: String(error.message || error) });
        }
      });
    }

    if (receipt.changed.length) writeJson(UNDO_KEY, undo);

    if (command.action) {
      receipt.action = runAction({
        id: receipt.id + '-action',
        action: command.action,
        confirmed: command.confirmed,
        allow_dangerous: command.allow_dangerous,
        expected_page_fingerprint: before.page_fingerprint
      });
    }

    receipt.ok = receipt.changed.length > 0 &&
      receipt.failed.length === 0 &&
      (!receipt.action || receipt.action.ok);
    receipt.completed_at = now();
    writeJson(RECEIPT_KEY, receipt);
    saveSnapshot(readPage());
    scheduleRender();
    return receipt;
  }

  function writeSection(command) {
    command = command || {};
    var snapshot = readPage();
    var sectionKey = command.section || command.section_key;
    var section = snapshot.sections.filter(function (item) {
      return item.key === sectionKey;
    })[0];

    if (!section) {
      var receipt = newReceipt(command);
      receipt.failed.push({ key: sectionKey || '', error: 'Section key not found.' });
      receipt.completed_at = now();
      writeJson(RECEIPT_KEY, receipt);
      return receipt;
    }

    var allowed = {};
    section.fields.forEach(function (field) {
      allowed[field.key] = true;
    });

    var fields = {};
    commandItems(command.fields || {}).forEach(function (item) {
      if (allowed[item.key]) fields[item.key] = item.value;
    });

    command.fields = fields;
    return writeFields(command);
  }

  function undoLastWrite() {
    var undo = readJson(UNDO_KEY);
    var receipt = newReceipt({ type: 'undo' });
    var maps = elementMaps();

    if (!undo.fields) {
      receipt.failed.push({ key: 'undo', error: 'No Buddy write to undo.' });
    } else if (undo.page_fingerprint !== pageFingerprint()) {
      receipt.failed.push({ key: 'undo', error: 'Page changed; undo blocked.' });
    } else {
      Object.keys(undo.fields).forEach(function (key) {
        var element = maps.fields[key];
        if (!element || !canWriteField(element) || isSensitive(element, key)) {
          receipt.failed.push({ key: key, error: 'Undo field is unavailable or blocked.' });
          return;
        }
        try {
          setFieldValue(element, undo.fields[key]);
          receipt.changed.push({ key: key, restored: true });
        } catch (error) {
          receipt.failed.push({ key: key, error: String(error.message || error) });
        }
      });
    }

    receipt.ok = receipt.changed.length > 0 && receipt.failed.length === 0;
    receipt.completed_at = now();
    writeJson(RECEIPT_KEY, receipt);
    localStorage.removeItem(UNDO_KEY);
    saveSnapshot(readPage());
    scheduleRender();
    return receipt;
  }

  function applyCommand(command) {
    if (typeof command === 'string') {
      try {
        command = JSON.parse(command);
      } catch (error) {
        return { ok: false, error: 'Invalid command JSON.' };
      }
    }

    command = command || {};
    var type = String(command.type || command.command || '').toLowerCase();

    if (type === 'read' || type === 'read_page' || type === 'snapshot') {
      return { ok: true, packet: readPage() };
    }
    if (type === 'write' || type === 'write_fields') return writeFields(command);
    if (type === 'write_section') return writeSection(command);
    if (type === 'run_action' || type === 'action') return runAction(command);
    if (type === 'undo') return undoLastWrite();

    return {
      ok: false,
      error: 'Use read_page, write_fields, write_section, run_action, or undo.'
    };
  }

  function processQueuedCommand() {
    var command = readJson(COMMAND_KEY);
    var last = readJson(RECEIPT_KEY);
    if (!command.id || last.command_id === command.id || last.id === command.id) {
      return last.id ? last : null;
    }
    var receipt = applyCommand(command);
    receipt.command_id = command.id;
    writeJson(RECEIPT_KEY, receipt);
    return receipt;
  }

  function packetText(packet) {
    var output = [
      'CODE LABS BUDDY FULL PAGE PACKET ' + VERSION,
      'Generated: ' + packet.generated_at,
      'Page: ' + packet.page,
      'Fingerprint: ' + packet.page_fingerprint,
      'Title: ' + packet.title,
      'URL: ' + packet.url,
      'Mode: ' + packet.mode,
      '',
      'REPO / FILE',
      'Repo: ' + (packet.repo || 'missing'),
      'Path: ' + (packet.path || 'missing'),
      'Source branch: ' + (packet.source_branch || 'main'),
      'Request branch: ' + (packet.request_branch || 'context-only'),
      'Action: ' + (packet.action || 'read_context'),
      '',
      'COUNTS',
      'Sections: ' + packet.counts.sections,
      'Fields: ' + packet.counts.fields + ' (' + packet.counts.writable_fields + ' writable)',
      'Actions: ' + packet.counts.actions,
      '',
      'SECTIONS'
    ];

    packet.sections.forEach(function (section) {
      output.push('');
      output.push('[' + section.key + '] ' + (section.heading || 'Untitled'));
      output.push('Hidden: ' + section.hidden);
      output.push('SECTION TEXT');
      output.push(section.text || '(empty)');
      output.push('FIELDS');
      section.fields.forEach(function (field) {
        output.push('- ' + field.key + ' | ' + field.label + ' | writable=' + field.writable + ' | value=' + JSON.stringify(field.value));
      });
      output.push('ACTIONS');
      section.actions.forEach(function (action) {
        output.push('- ' + action.key + ' | ' + action.label + ' | dangerous=' + action.dangerous + ' | approved=' + action.approved);
      });
    });

    output.push('');
    output.push('WRITE FORMAT');
    output.push(JSON.stringify({
      type: 'write_fields',
      expected_page: packet.page,
      expected_page_fingerprint: packet.page_fingerprint,
      fields: { 'field-key': 'new value' }
    }));
    output.push('');
    output.push('Buddy must read first, write the smallest field set, inspect the receipt, then read again.');
    output.push('GitHub source changes remain branch/PR-only through ChatGPT connectors.');

    return output.join('\n');
  }

  function saveSnapshot(packet) {
    var text = packetText(packet);
    writeJson(OUTPUT_KEY, { packet: packet, text: text, saved_at: now(), version: VERSION });
    writeJson(LEGACY_OUTPUT_KEY, { packet: packet, text: text, saved_at: now(), version: VERSION });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    return Promise.resolve();
  }

  function toast(message) {
    var element = q('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    setTimeout(function () {
      element.classList.remove('show');
    }, 2000);
  }

  var renderTimer = 0;
  function scheduleRender() {
    clearTimeout(renderTimer);
    renderTimer = setTimeout(render, 180);
  }

  function render() {
    var packet = readPage();
    var text = packetText(packet);
    saveSnapshot(packet);

    var status = q('#clBuddyBridgeStatusV139');
    var proof = q('#clBuddyBridgeProofV139');
    var output = q('#clBuddyBridgeOutV139');
    var receipt = q('#clBuddyBridgeReceiptV140');

    if (status) {
      status.className = 'badge good';
      status.textContent = 'Full page read/write ready';
    }
    if (proof) {
      proof.innerHTML =
        '<div class="grid3">' +
        '<div class="stat"><b>Sections</b><span>' + packet.counts.sections + '</span></div>' +
        '<div class="stat"><b>Fields</b><span>' + packet.counts.fields + '</span></div>' +
        '<div class="stat"><b>Writable</b><span>' + packet.counts.writable_fields + '</span></div>' +
        '<div class="stat"><b>Actions</b><span>' + packet.counts.actions + '</span></div>' +
        '</div>';
    }
    if (output) output.value = text;
    if (receipt) {
      var savedReceipt = readJson(RECEIPT_KEY);
      receipt.value = savedReceipt.id ? JSON.stringify(savedReceipt, null, 2) : 'No Buddy page write receipt yet.';
    }

    return { text: text, packet: packet };
  }

  function createPanel() {
    if (q('#' + ROOT_ID)) return;
    var main = q('.main') || q('main');
    if (!main) {
      setTimeout(createPanel, 250);
      return;
    }

    var panel = document.createElement('section');
    panel.id = ROOT_ID;
    panel.className = 'panel';
    panel.style.border = '3px solid rgba(59,130,246,.28)';
    panel.innerHTML =
      '<h2>Buddy Page Bridge V140</h2>' +
      '<p class="muted">Reads every section and empty field. Adds persistent Buddy Notes, writes approved fields by stable key, records receipts, and supports undo. Browser GitHub writes remain disabled.</p>' +
      '<div id="clBuddyBridgeProofV139"></div>' +
      '<div class="actions">' +
      '<span id="clBuddyBridgeStatusV139" class="badge warn">Checking</span>' +
      '<button class="btn primary" id="clBuddyBridgeBuildV139" type="button">Build Full Page Packet</button>' +
      '<button class="btn good" id="clBuddyBridgeCopyV139" type="button">Copy Full Page Packet</button>' +
      '<button class="btn ghost" id="clBuddyBridgeUndoV140" type="button">Undo Last Buddy Write</button>' +
      '</div>' +
      '<textarea id="clBuddyBridgeOutV139" class="big" readonly></textarea>' +
      '<h3>Buddy page command</h3>' +
      '<textarea id="clBuddyBridgeCommandV140" class="big" placeholder=\'{"type":"write_fields","fields":{"field-key":"new value"}}\'></textarea>' +
      '<div class="actions"><button class="btn primary" id="clBuddyBridgeApplyV140" type="button">Apply Buddy Page Command</button></div>' +
      '<textarea id="clBuddyBridgeReceiptV140" class="big" readonly></textarea>';

    main.insertBefore(panel, main.firstChild || null);

    q('#clBuddyBridgeBuildV139').onclick = render;
    q('#clBuddyBridgeCopyV139').onclick = function () {
      copyText(render().text).then(function () {
        toast('Full Buddy page packet copied');
      });
    };
    q('#clBuddyBridgeUndoV140').onclick = function () {
      q('#clBuddyBridgeReceiptV140').value = JSON.stringify(undoLastWrite(), null, 2);
    };
    q('#clBuddyBridgeApplyV140').onclick = function () {
      q('#clBuddyBridgeReceiptV140').value = JSON.stringify(
        applyCommand(q('#clBuddyBridgeCommandV140').value),
        null,
        2
      );
    };

    render();
  }

  function boot() {
    ensureSectionNotes();
    ensureFieldKeys();
    ensureActionKeys();

    window.CodeLabsBuddyPageBridge = {
      version: VERSION,
      readPage: readPage,
      collect: readPage,
      packet: readPage,
      text: function () { return packetText(readPage()); },
      render: render,
      writeFields: writeFields,
      writeSection: writeSection,
      runAction: runAction,
      applyCommand: applyCommand,
      undoLastWrite: undoLastWrite,
      processQueuedCommand: processQueuedCommand,
      keys: {
        snapshot: OUTPUT_KEY,
        legacy_snapshot: LEGACY_OUTPUT_KEY,
        command: COMMAND_KEY,
        receipt: RECEIPT_KEY,
        undo: UNDO_KEY
      }
    };
    window.CodeLabsBuddyPageBridgeV140 = window.CodeLabsBuddyPageBridge;

    createPanel();
    setTimeout(createPanel, 700);
    setTimeout(function () {
      render();
      processQueuedCommand();
    }, 300);

    document.addEventListener('input', function (event) {
      if (!(event.target.closest && event.target.closest('#' + ROOT_ID))) scheduleRender();
    }, true);
    document.addEventListener('change', function (event) {
      if (!(event.target.closest && event.target.closest('#' + ROOT_ID))) scheduleRender();
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
