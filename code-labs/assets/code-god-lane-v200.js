/* Code God Buddy Lane V200 - explicit read-only review panel. */
(function () {
  'use strict';
  var VERSION = 'V200.1';
  var ROOT_ID = 'clCodeGodLaneV200';

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function renderResult(result) {
    var output = q('#clCodeGodResultV200');
    var badge = q('#clCodeGodStatusV200');
    if (output) output.value = JSON.stringify(result || {}, null, 2);
    if (badge) {
      badge.textContent = result && result.outcome || 'Not checked';
      badge.className = 'badge ' + (result && result.outcome === 'PASS' ? 'good' : result && result.outcome === 'BLOCK' ? 'bad' : 'warn');
    }
  }

  function runReview() {
    var context = window.CodeLabsCurrentFileContextV200 && window.CodeLabsCurrentFileContextV200.current ? window.CodeLabsCurrentFileContextV200.current() : {};
    var review = window.CodeGodReviewV200 && window.CodeGodReviewV200.review ? window.CodeGodReviewV200.review(context) : {
      tool: 'code_god_review',
      version: VERSION,
      outcome: 'BLOCK',
      findings: [{ severity: 'P1', rule_id: 'CG-NOT-READY', message: 'Code God is not ready on this page.', correction: 'Reload the page and run the review again.', blocks_github: true }]
    };
    renderResult(review);
    window.CodeGodLatestReviewV200 = review;
    return review;
  }

  function install() {
    if (q('#' + ROOT_ID)) return true;
    var main = q('.main') || q('main');
    if (!main) return false;
    var panel = document.createElement('section');
    panel.id = ROOT_ID;
    panel.className = 'panel';
    panel.setAttribute('data-buddy-section-key', 'code-god-review');
    panel.innerHTML = '<h2>Code God review</h2>' +
      '<p>Buddy uses this read-only checker before any GitHub branch request. It compares the current file context with the proposed complete file and reports what must be fixed.</p>' +
      '<div class="actions"><button class="btn primary" id="clRunCodeGodV200" type="button" data-buddy-action="run-code-god-review">Run Code God Review</button><span id="clCodeGodStatusV200" class="badge warn">Not checked</span></div>' +
      '<textarea id="clCodeGodResultV200" data-buddy-key="code-god-review-result" data-cl-buddy-readonly readonly style="min-height:220px" aria-label="Code God review result">Run Code God Review when the complete proposed file is ready.</textarea>' +
      '<p class="fine">Read-only · no Supabase save · no GitHub write · no merge · no deployment.</p>';
    var footer = q('#clFooterBuddyShellV200');
    if (footer && footer.parentNode === main) main.insertBefore(panel, footer);
    else main.appendChild(panel);
    q('#clRunCodeGodV200', panel).addEventListener('click', runReview);
    return true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  window.CodeGodLaneV200 = { version: VERSION, install: install, review: runReview };
})();
