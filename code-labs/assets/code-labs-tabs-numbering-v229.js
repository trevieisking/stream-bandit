/* Code Labs Tabs + Numbering V229 - stable top tabs and visible-only section numbers. */
(function () {
  'use strict';

  var VERSION = 'V229';
  var ROOT_ID = 'clProductTabsV227';
  var timer = 0;
  var observer = null;

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function mainRoot() {
    return q('.main') || q('main');
  }

  function visible(node) {
    if (!node || node.hidden || node.classList.contains('clProductTabHiddenV227')) return false;
    var style = window.getComputedStyle ? window.getComputedStyle(node) : null;
    return !style || (style.display !== 'none' && style.visibility !== 'hidden');
  }

  function cleanHeading(heading) {
    if (!heading) return;
    qa(':scope > .clPanelNumber', heading).forEach(function (badge) { badge.remove(); });
    var first = heading.firstChild;
    if (first && first.nodeType === 3) {
      first.nodeValue = String(first.nodeValue || '').replace(/^\s*\d+\s*[.)-]\s*/, '');
    }
    heading.classList.remove('clNumberedHeading');
  }

  function majorSections(main) {
    var selectors = [
      ':scope > section.panel',
      ':scope > div.panel',
      ':scope > #clWorkflowClarityV130',
      ':scope > #clPageCompletionV139',
      ':scope > #clBuddyPageBridgeV139',
      ':scope > .canvasGrid > section.panel',
      ':scope > .canvasGrid > div.panel',
      ':scope > .layout > section.panel',
      ':scope > .layout > div.panel'
    ];
    var out = [];
    selectors.forEach(function (selector) {
      try {
        qa(selector, main).forEach(function (node) {
          if (out.indexOf(node) < 0) out.push(node);
        });
      } catch (error) {}
    });
    out.sort(function (a, b) {
      if (a === b) return 0;
      return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
    return out.filter(function (section) {
      return section.id !== ROOT_ID && !!q(':scope > h2', section);
    });
  }

  function placeTabs(main) {
    var root = q('#' + ROOT_ID, main);
    if (!root) return;
    var topbar = q(':scope > .topbar', main);
    if (topbar && root.previousElementSibling !== topbar) {
      topbar.insertAdjacentElement('afterend', root);
    } else if (!topbar && main.firstElementChild !== root) {
      main.insertBefore(root, main.firstElementChild);
    }
    root.setAttribute('data-cl-tabs-position', VERSION);
  }

  function renumber(main) {
    var sections = majorSections(main);
    sections.forEach(function (section) {
      cleanHeading(q(':scope > h2', section));
      section.removeAttribute('data-cl-section-number');
    });

    var number = 0;
    sections.filter(visible).forEach(function (section) {
      var heading = q(':scope > h2', section);
      if (!heading) return;
      number += 1;
      var badge = document.createElement('span');
      badge.className = 'clPanelNumber';
      badge.setAttribute('aria-hidden', 'true');
      badge.textContent = String(number);
      heading.insertBefore(badge, heading.firstChild);
      heading.classList.add('clNumberedHeading');
      section.setAttribute('data-cl-section-number', String(number));
      section.setAttribute('data-cl-visible-numbering', VERSION);
    });
  }

  function apply() {
    var main = mainRoot();
    if (!main || (document.body && document.body.getAttribute('data-page') === 'code-god')) return false;
    placeTabs(main);
    renumber(main);
    window.CodeLabsTabsNumberingV229 = { version: VERSION, apply: apply };
    return true;
  }

  function schedule() {
    if (timer) return;
    timer = window.setTimeout(function () {
      timer = 0;
      apply();
    }, 40);
  }

  function watch() {
    var main = mainRoot();
    if (!main || observer) return;
    observer = new MutationObserver(schedule);
    observer.observe(main, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'hidden', 'aria-selected']
    });
  }

  function boot() {
    apply();
    watch();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('.clProductTab')) {
        window.setTimeout(apply, 0);
      }
    }, true);
    [150, 500, 1000, 2000, 4000, 7000].forEach(function (delay) {
      window.setTimeout(apply, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
