/* Code God Review V216
   Read-only pre-commit analysis for the Buddy lane.
 */
(function () {
  'use strict';
  var VERSION = 'V216.1';

  function finding(severity, rule, message, fix, blocks) {
    return { severity: severity, rule_id: rule, message: message, correction: fix, blocks_github: Boolean(blocks) };
  }

  function completeFile(path, text) {
    var value = String(text || '').trim();
    if (!value || value.length < 120) return false;
    if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(value)) return false;
    if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(value)) return false;
    if (/\.html?$/i.test(path || '') && !/<!doctype\s+html/i.test(value) && !/<html[\s>]/i.test(value)) return false;
    return true;
  }

  function actionOf(input) {
    var action = String(input.action || input.mode || 'change').toLowerCase();
    if (action === 'delete') return 'remove';
    if (action === 'create') return 'add';
    return /^(read|add|change|remove|review)$/.test(action) ? action : 'change';
  }

  function review(input) {
    input = input || (window.CodeLabsCurrentFileContextV200 && window.CodeLabsCurrentFileContextV200.current()) || {};
    var findings = [];
    var action = actionOf(input);
    var repo = String(input.repo || '');
    var sourceRepo = String(input.source_repo || '');
    var path = String(input.path || '');
    var original = String(input.original || '');
    var proposed = String(input.proposed || '');
    var branch = String(input.request_branch || '');
    var mutating = action === 'add' || action === 'change' || action === 'remove';
    var requiresSource = action === 'read' || action === 'change' || action === 'remove';

    if (requiresSource && !sourceRepo) findings.push(finding('P1', 'CG-IDENTITY-004', 'The loaded review source has no verified repository identity.', 'Reload the complete source directly from the selected GitHub repository, then rerun Code God.', true));
    else if (sourceRepo && repo && sourceRepo !== repo) findings.push(finding('P1', 'CG-IDENTITY-003', 'The loaded source repository does not match the saved handoff repository.', 'Reload the complete source from the same repository selected for the handoff, then rerun Code God.', true));
    if (repo && repo !== 'trevieisking/stream-bandit') findings.push(finding('P1', 'CG-IDENTITY-001', 'The selected repository is not the approved repository.', 'Reload the correct saved file and repository before continuing.', true));
    if (!path || path.indexOf('..') >= 0) findings.push(finding('P1', 'CG-IDENTITY-002', 'The target file path is missing or unsafe.', 'Save the exact repository-relative path without traversal segments.', true));

    if ((action === 'add' || action === 'change') && !completeFile(path, proposed)) findings.push(finding('P1', 'CG-FULLFILE-001', 'The proposed file is blank, truncated, a snippet, or a patch recipe.', 'Restore the complete file and apply only the intended correction.', true));
    if (action === 'change' && original && proposed && proposed.length < Math.max(120, Math.floor(original.length * 0.65))) findings.push(finding('P1', 'CG-TRUNCATION-001', 'The proposed file is much smaller than the original and may be truncated.', 'Compare against the original and restore any missing sections before review.', true));
    if (action === 'remove' && !String(input.notes || '').trim()) findings.push(finding('P1', 'CG-REMOVE-PROOF-001', 'The remove handoff has no safety proof.', 'Explain why this exact path is verified safe to remove.', true));

    if ((action === 'add' || action === 'change') && /<<<<<<<|=======|>>>>>>>/.test(proposed)) findings.push(finding('P1', 'CG-CONFLICT-001', 'Unresolved merge-conflict markers were found.', 'Resolve the conflict markers and rerun Code God.', true));
    if ((action === 'add' || action === 'change') && /```(?:html|javascript|js|typescript|ts|json)?/i.test(proposed)) findings.push(finding('P2', 'CG-FENCE-001', 'Markdown code fences appear inside the proposed file.', 'Remove the Markdown fences and keep only the complete file contents.', true));
    if ((action === 'add' || action === 'change') && /(service[_ -]?role|private[_ -]?key|authorization:\s*bearer|sk-[A-Za-z0-9_-]{12,})/i.test(proposed)) findings.push(finding('P0', 'CG-SECRET-001', 'Secret-like content appears in the proposed browser file.', 'Remove the secret and keep privileged values server-side only.', true));
    if ((action === 'add' || action === 'change') && /setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed)) findings.push(finding('P2', 'CG-TIMER-001', 'A frequent repeating timer may cause duplicate work or page jumping.', 'Use an explicit action, visibility-aware heartbeat, or guarded single owner instead.', false));
    if ((action === 'add' || action === 'change') && /\.insert\s*\(/.test(proposed) && /code_labs_(?:files|versions|packets|jobs)/.test(proposed)) findings.push(finding('P2', 'CG-DUPLICATE-001', 'The proposed code may insert repeated Code Labs history rows.', 'Prefer an explicit update of the selected saved-file row unless a new version was deliberately requested.', false));
    if (mutating && /^(main|master|production|live|gh-pages)$/i.test(branch)) findings.push(finding('P0', 'CG-BRANCH-001', 'The requested GitHub branch is protected.', 'Create or use a non-main repair branch.', true));

    var blocking = findings.some(function (item) { return item.blocks_github; });
    var outcome = blocking ? (findings.some(function (item) { return item.severity === 'P0'; }) ? 'BLOCK' : 'FIX_FIRST') : 'PASS';
    return { tool: 'code_god_review', version: VERSION, outcome: outcome, action: action, repo: repo, source_repo: sourceRepo, path: path, saved_file_id: input.saved_file_id || '', original_characters: original.length, proposed_characters: proposed.length, findings: findings, checks_run: ['action-scope', 'source-repository-identity', 'identity', 'full-file-integrity', 'truncation', 'remove-proof', 'conflicts', 'secret-scan', 'timer-scan', 'duplicate-save-scan', 'branch-safety'], created_at: new Date().toISOString(), wrote_database: false, wrote_github: false, opened_pr: false };
  }

  window.CodeGodReviewV200 = { version: VERSION, review: review, completeFile: completeFile };
})();