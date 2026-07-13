/* Code God Review V200
   Read-only pre-commit analysis for the Buddy lane.
*/
(function () {
  'use strict';
  var VERSION = 'V200.1';

  function finding(severity, rule, message, fix, blocks) {
    return {
      severity: severity,
      rule_id: rule,
      message: message,
      correction: fix,
      blocks_github: Boolean(blocks)
    };
  }

  function completeFile(path, text) {
    var value = String(text || '').trim();
    if (!value || value.length < 120) return false;
    if (/BEGIN PATCH|Find:\s*\n|Replace with:/i.test(value)) return false;
    if (/^(?:diff --git |Index: |@@\s*-\d+)/m.test(value)) return false;
    if (/\.html?$/i.test(path || '') && !/<!doctype\s+html/i.test(value) && !/<html[\s>]/i.test(value)) return false;
    return true;
  }

  function review(input) {
    input = input || (window.CodeLabsCurrentFileContextV200 && window.CodeLabsCurrentFileContextV200.current()) || {};
    var findings = [];
    var repo = String(input.repo || '');
    var path = String(input.path || '');
    var original = String(input.original || '');
    var proposed = String(input.proposed || '');
    var branch = String(input.request_branch || '');

    if (repo && repo !== 'trevieisking/stream-bandit') {
      findings.push(finding('P1', 'CG-IDENTITY-001', 'The selected repository is not the approved repository.', 'Reload the correct saved file and repository before continuing.', true));
    }
    if (!path || path.indexOf('..') >= 0) {
      findings.push(finding('P1', 'CG-IDENTITY-002', 'The target file path is missing or unsafe.', 'Reload the original file so the exact repository path is available.', true));
    }
    if (!completeFile(path, proposed)) {
      findings.push(finding('P1', 'CG-FULLFILE-001', 'The proposed replacement is blank, truncated, a snippet, or a patch recipe.', 'Restore the complete file and apply only the intended correction.', true));
    }
    if (original && proposed && proposed.length < Math.max(120, Math.floor(original.length * 0.65))) {
      findings.push(finding('P1', 'CG-TRUNCATION-001', 'The proposed file is much smaller than the original and may be truncated.', 'Compare against the original and restore any missing sections before review.', true));
    }
    if (/<<<<<<<|=======|>>>>>>>/.test(proposed)) {
      findings.push(finding('P1', 'CG-CONFLICT-001', 'Unresolved merge-conflict markers were found.', 'Resolve the conflict markers and rerun Code God.', true));
    }
    if (/```(?:html|javascript|js|typescript|ts|json)?/i.test(proposed)) {
      findings.push(finding('P2', 'CG-FENCE-001', 'Markdown code fences appear inside the proposed file.', 'Remove the Markdown fences and keep only the complete file contents.', true));
    }
    if (/(service[_ -]?role|private[_ -]?key|authorization:\s*bearer|sk-[A-Za-z0-9_-]{12,})/i.test(proposed)) {
      findings.push(finding('P0', 'CG-SECRET-001', 'Secret-like content appears in the proposed browser file.', 'Remove the secret and keep privileged values server-side only.', true));
    }
    if (/setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/.test(proposed)) {
      findings.push(finding('P2', 'CG-TIMER-001', 'A frequent repeating timer may cause duplicate work or page jumping.', 'Use an explicit action, visibility-aware heartbeat, or guarded single owner instead.', false));
    }
    if (/\.insert\s*\(/.test(proposed) && /code_labs_(?:files|versions|packets|jobs)/.test(proposed)) {
      findings.push(finding('P2', 'CG-DUPLICATE-001', 'The proposed code may insert repeated Code Labs history rows.', 'Prefer an explicit update of the selected saved-file row unless a new version was deliberately requested.', false));
    }
    if (/^(main|master|production|live|gh-pages)$/i.test(branch)) {
      findings.push(finding('P0', 'CG-BRANCH-001', 'The requested GitHub branch is protected.', 'Create or use a non-main repair branch.', true));
    }

    var blocking = findings.some(function (item) { return item.blocks_github; });
    var outcome = blocking ? (findings.some(function (item) { return item.severity === 'P0'; }) ? 'BLOCK' : 'FIX_FIRST') : 'PASS';
    return {
      tool: 'code_god_review',
      version: VERSION,
      outcome: outcome,
      repo: repo,
      path: path,
      saved_file_id: input.saved_file_id || '',
      original_characters: original.length,
      proposed_characters: proposed.length,
      findings: findings,
      checks_run: ['identity', 'full-file-integrity', 'truncation', 'conflicts', 'secret-scan', 'timer-scan', 'duplicate-save-scan', 'branch-safety'],
      created_at: new Date().toISOString(),
      wrote_database: false,
      wrote_github: false,
      opened_pr: false
    };
  }

  window.CodeGodReviewV200 = { version: VERSION, review: review, completeFile: completeFile };
})();
