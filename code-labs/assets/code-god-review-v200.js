/* Code God Review V239
   Read-only pre-commit analysis for the Buddy lane.
 */
(function () {
  'use strict';
  var VERSION = 'V239.0';

  function finding(severity, rule, message, fix, blocks) {
    return { severity: severity, rule_id: rule, message: message, correction: fix, blocks_github: Boolean(blocks) };
  }

  function completeFile(path, text) {
    var value = String(text || '').trim();
    if (!value || value.length < 120) return false;
    if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(value)) return false;
    if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(value)) return false;
    if (/\.html?$/i.test(path || '') && !/<!doctype\s+html/i.test(value) && !/<html[\s>]/i.test(value)) return false;
    if (/\.json$/i.test(path || '')) {
      try { JSON.parse(value); } catch (error) { return false; }
    }
    return true;
  }

  function actionOf(input) {
    var action = String(input.action || input.mode || 'change').toLowerCase();
    if (action === 'delete') return 'remove';
    if (action === 'create') return 'add';
    return /^(read|add|change|remove|review)$/.test(action) ? action : 'change';
  }

  function containsSecretValue(text) {
    var value = String(text || '');
    return /(?:authorization\s*:\s*bearer\s+[A-Za-z0-9._~-]{12,}|sk-[A-Za-z0-9_-]{12,}|sb_secret_[A-Za-z0-9_-]{12,}|[A-Za-z0-9_]*(?:service[_ -]?role|private[_ -]?key|api[_ -]?key|secret)[A-Za-z0-9_]*\s*(?:=|:)\s*["'][^"'\\n]{12,}["'])/i.test(value);
  }

  function ensureShell() {
    if (!document.body || document.body.getAttribute('data-page') !== 'code-god') return;
    if (document.querySelector('script[src*="assets/cl-nav.js"]')) return;
    var script = document.createElement('script');
    script.async = false;
    script.src = 'assets/cl-nav.js?v=cl-v236-universal-tabs';
    script.setAttribute('data-cl-shell-loader-v236', 'yes');
    document.head.appendChild(script);
  }

  function review(input) {
    input = input || (window.CodeLabsCurrentFileContextV200 && window.CodeLabsCurrentFileContextV200.current()) || {};
    var findings = [];
    var action = actionOf(input);
    var repo = String(input.repo || '');
    var sourceRepo = String(input.source_repo || '');
    var path = String(input.path || '');
    var original = String(input.original || '');
    var boundProposed = String(input.latest_handoff_proposed || '');
    var proposed = input.latest_handoff_body_bound && boundProposed.trim() ? boundProposed : String(input.proposed || '');
    var branch = String(input.request_branch || '');
    var mutating = action === 'add' || action === 'change' || action === 'remove';
    var requiresSource = action === 'read' || action === 'change' || action === 'remove';
    var latestPresent = Boolean(input.latest_handoff_present);
    var latestAction = actionOf({ action: input.latest_handoff_action });
    var latestRepo = String(input.latest_handoff_repo || '');
    var latestPath = String(input.latest_handoff_path || '');
    var latestBranch = String(input.latest_handoff_branch || '');
    var selectedMatchesLatest = !latestPresent || (
      action === latestAction && repo === latestRepo && path === latestPath && branch === latestBranch
    );

    if (latestPresent && !selectedMatchesLatest) findings.push(finding('P1', 'CG-HANDOFF-STALE-001', 'Code God selected an older saved handoff instead of the newest request.', 'Return to Repo Desk or GitHub Writer, complete the newest request, and rerun Code God.', true));
    if (latestPresent && !input.latest_handoff_complete) findings.push(finding('P1', 'CG-HANDOFF-INCOMPLETE-001', 'The newest saved repository handoff is incomplete.', 'Complete the newest action, repository, target path, required branch, and remove proof before review.', true));

    if (requiresSource && !sourceRepo) findings.push(finding('P1', 'CG-IDENTITY-004', 'The loaded review source has no verified repository identity.', 'Reload the complete source directly from the selected GitHub repository, then rerun Code God.', true));
    else if (sourceRepo && repo && sourceRepo !== repo) findings.push(finding('P1', 'CG-IDENTITY-003', 'The loaded source repository does not match the saved handoff repository.', 'Reload the complete source from the same repository selected for the handoff, then rerun Code God.', true));
    if (repo && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) findings.push(finding('P1', 'CG-IDENTITY-001', 'The selected repository is not a safe owner/name identity.', 'Reload an owner-authorized repository through the verified GitHub installation.', true));
    if (!path || path.indexOf('..') >= 0) findings.push(finding('P1', 'CG-IDENTITY-002', 'The target file path is missing or unsafe.', 'Save the exact repository-relative path without traversal segments.', true));

    if ((action === 'add' || action === 'change') && !completeFile(path, proposed)) findings.push(finding('P1', 'CG-FULLFILE-001', 'The proposed file is blank, malformed, truncated, a snippet, or a patch recipe.', 'Restore a syntactically valid complete file and apply only the intended correction.', true));
    if (action === 'change' && original && proposed && proposed.length < Math.max(120, Math.floor(original.length * 0.65))) findings.push(finding('P1', 'CG-TRUNCATION-001', 'The proposed file is much smaller than the original and may be truncated.', 'Compare against the original and restore any missing sections before review.', true));
    if (action === 'remove' && !String(input.notes || '').trim()) findings.push(finding('P1', 'CG-REMOVE-PROOF-001', 'The remove handoff has no safety proof.', 'Explain why this exact path is verified safe to remove.', true));

    if ((action === 'add' || action === 'change') && /^(?:\s*<<<<<<<(?:\s|$)|\s*=======\s*$|\s*>>>>>>>(?:\s|$))/m.test(proposed)) findings.push(finding('P1', 'CG-CONFLICT-001', 'Unresolved merge-conflict markers were found.', 'Resolve the conflict markers and rerun Code God.', true));
    if ((action === 'add' || action === 'change') && /```(?:html|javascript|js|typescript|ts|json)?/i.test(proposed)) findings.push(finding('P2', 'CG-FENCE-001', 'Markdown code fences appear inside the proposed file.', 'Remove the Markdown fences and keep only the complete file contents.', true));
    if ((action === 'add' || action === 'change') && containsSecretValue(proposed)) findings.push(finding('P0', 'CG-SECRET-001', 'A credential-shaped value appears in the proposed browser file.', 'Remove the credential value and keep privileged values server-side only.', true));
    var hasFastTimer = /setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed);
    var hasChangeGuard = /lastSourceKey/.test(proposed) && /key\s*!==\s*lastSourceKey/.test(proposed);
    if ((action === 'add' || action === 'change') && hasFastTimer && !hasChangeGuard) findings.push(finding('P2', 'CG-TIMER-001', 'A frequent repeating timer may cause duplicate work or page jumping.', 'Use an explicit action, visibility-aware heartbeat, or guarded single owner instead.', false));
    if ((action === 'add' || action === 'change') && /\.insert\s*\(/.test(proposed) && /code_labs_(?:files|versions|packets|jobs)/.test(proposed)) findings.push(finding('P2', 'CG-DUPLICATE-001', 'The proposed code may insert repeated Code Labs history rows.', 'Prefer an explicit update of the selected saved-file row unless a new version was deliberately requested.', false));
    if (mutating && /^(main|master|production|live|gh-pages)$/i.test(branch)) findings.push(finding('P0', 'CG-BRANCH-001', 'The requested GitHub branch is protected.', 'Create or use a non-main repair branch.', true));

    var blocking = findings.some(function (item) { return item.blocks_github; });
    var outcome = blocking ? (findings.some(function (item) { return item.severity === 'P0'; }) ? 'BLOCK' : 'FIX_FIRST') : 'PASS';
    return { tool: 'code_god_review', version: VERSION, outcome: outcome, action: action, repo: repo, source_repo: sourceRepo, path: path, saved_file_id: input.saved_file_id || '', original_characters: original.length, proposed_characters: proposed.length, findings: findings, checks_run: ['action-scope', 'newest-handoff', 'handoff-body-binding', 'source-repository-identity', 'identity', 'full-file-integrity', 'json-syntax', 'truncation', 'remove-proof', 'conflicts', 'secret-value-scan', 'timer-scan', 'duplicate-save-scan', 'branch-safety'], created_at: new Date().toISOString(), wrote_database: false, wrote_github: false, opened_pr: false };
  }

  ensureShell();
  window.CodeGodReviewV200 = { version: VERSION, review: review, completeFile: completeFile, containsSecretValue: containsSecretValue };
})();
