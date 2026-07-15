/* Code Labs Product Polish V227 - stable tabs for long existing pages. */
(function () {
  'use strict';

  var VERSION = 'V227-helpdesk-shell';
  var ROOT_ID = 'clProductTabsV227';
  var observer = null;
  var applyTimer = 0;
  var stopTimer = 0;

  function q(selector, root) {
    return (root || document).querySelector(selector);
  }

  function page() {
    return document.body && document.body.getAttribute('data-page') || 'index';
  }

  function text(node) {
    return String(node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function heading(node) {
    return text(q('h1,h2,h3', node));
  }

  function keyFor(node) {
    return [node.id || '', node.className || '', heading(node)].join(' ').toLowerCase();
  }

  function managedSections(main) {
    return Array.prototype.slice.call(main.children).filter(function (node) {
      if (!node || node.id === ROOT_ID || node.matches('.topbar,.hero,.footerNote,script,style')) return false;
      if (node.hasAttribute('data-cl-product-ignore')) return false;
      return node.matches('section,.panel,.card,.notice,.danger,.success,.layout,.grid,.grid2,.grid3,.canvasGrid');
    });
  }

  function setupGroup(key) {
    if (/github|supabase|connection|connector|backend|owner|sign[ -]?in|repository/.test(key)) return 'connections';
    if (/history|backup|saved|checkpoint|receipt|current file|overwrite/.test(key)) return 'history';
    if (/workflow|guide|clarity|completion|guard|buddy page bridge|page command|read packet|safe write/.test(key)) return 'support';
    return 'settings';
  }

  function helpGroup(key) {
    if (/buddy memory|memory|context packet|context/.test(key)) return 'memory';
    if (/github|raw file|raw github|safe change|repo|branch|pull request/.test(key)) return 'github';
    if (/diff|html safety|utility|tool search|checker|json|counter|compare/.test(key)) return 'checks';
    if (/backend|hosting|what code labs|workflow|start|help desk/.test(key)) return 'start';
    return 'repair';
  }

  function workflowGroup(key) {
    if (/workflow|clarity|completion|guard|guide|checklist|next safe|page command/.test(key)) return 'guidance';
    if (/buddy page bridge|current saved|backup|history|receipt|checkpoint|read packet|safe write|overwrite current/.test(key)) return 'saved';
    return 'work';
  }

  function groupFor(node, currentPage) {
    var key = keyFor(node);
    if (currentPage === 'setup') return setupGroup(key);
    if (currentPage === 'help') return helpGroup(key);
    return workflowGroup(key);
  }

  function definitions(currentPage) {
    if (currentPage === 'setup') {
      return [
        ['settings', '⚙️', 'Workspace'],
        ['connections', '🔗', 'Connections'],
        ['history', '🗃️', 'History & backup'],
        ['support', '🧭', 'Guidance']
      ];
    }
    if (currentPage === 'help') {
      return [
        ['start', '🏠', 'Start here'],
        ['repair', '🧰', 'Repair tools'],
        ['github', '🐙', 'GitHub & files'],
        ['memory', '🧠', 'Memory & context'],
        ['checks', '✅', 'Checks & utilities']
      ];
    }
    return [
      ['work', '🛠️', 'Page work'],
      ['guidance', '🧭', 'Guidance'],
      ['saved', '🗃️', 'Saved state & backup']
    ];
  }

  function titleFor(currentPage) {
    if (currentPage === 'setup') return 'Settings desk';
    if (currentPage === 'help') return 'Help desk';
    return 'Page workspace';
  }

  function rememberKey(currentPage) {
    return 'codeLabsProductTabV227:' + currentPage;
  }

  function remembered(currentPage) {
    try { return localStorage.getItem(rememberKey(currentPage)) || ''; }
    catch (error) { return ''; }
  }

  function remember(currentPage, group) {
    try { localStorage.setItem(rememberKey(currentPage), group); }
    catch (error) {}
  }

  function addCss() {
    if (q('#clProductPolishV227Style')) return;
    var style = document.createElement('style');
    style.id = 'clProductPolishV227Style';
    style.textContent =
      '.clProductPolishV227 .main{scroll-behavior:smooth}' +
      '#clProductTabsV227{position:sticky;top:0;z-index:35;margin:0 0 14px;padding:10px;border:1px solid var(--line);border-radius:20px;background:color-mix(in srgb,var(--panel) 94%,transparent);box-shadow:0 12px 34px rgba(20,32,58,.13);backdrop-filter:blur(16px)}' +
      '.clProductTabsHead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 2px 8px}.clProductTabsHead b{font-size:15px}.clProductTabsHead span{color:var(--muted);font-size:12px;font-weight:800}' +
      '.clProductTabList{display:flex;gap:8px;overflow:auto;padding:2px;scrollbar-width:thin}' +
      '.clProductTab{flex:0 0 auto;border:1px solid var(--line);border-radius:999px;background:var(--panel2);color:var(--ink);padding:9px 12px;font-weight:950;cursor:pointer}' +
      '.clProductTab[aria-selected="true"]{background:linear-gradient(135deg,var(--brand),var(--brand2));border-color:transparent;color:white;box-shadow:0 8px 24px rgba(36,91,255,.24)}' +
      '.clProductTab:focus-visible{outline:3px solid rgba(110,164,255,.75);outline-offset:2px}' +
      '.clProductManagedV227.clProductTabHiddenV227{display:none!important}' +
      '.clProductManagedV227{animation:clProductInV227 .16s ease-out}' +
      '@keyframes clProductInV227{from{opacity:.72;transform:translateY(3px)}to{opacity:1;transform:none}}' +
      '.clProductPolishV227 .panel,.clProductPolishV227 .card,.clProductPolishV227 .notice,.clProductPolishV227 .danger,.clProductPolishV227 .success{scroll-margin-top:110px}' +
      '@media(max-width:980px){#clProductTabsV227{position:relative;top:auto}.clProductTabsHead{align-items:flex-start;flex-direction:column}.clProductTab{padding:9px 11px}}';
    document.head.appendChild(style);
  }

  function tabButton(definition, count, active) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'clProductTab';
    button.setAttribute('role', 'tab');
    button.setAttribute('data-group', definition[0]);
    button.setAttribute('aria-selected', definition[0] === active ? 'true' : 'false');
    button.tabIndex = definition[0] === active ? 0 : -1;
    button.textContent = definition[1] + ' ' + definition[2] + ' (' + count + ')';
    return button;
  }

  function activate(root, currentPage, group) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.clProductTab'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('.clProductManagedV227'));
    buttons.forEach(function (button) {
      var selected = button.getAttribute('data-group') === group;
      button.setAttribute('aria-selected', selected ? 'true' : 'false');
      button.tabIndex = selected ? 0 : -1;
    });
    sections.forEach(function (section) {
      section.classList.toggle('clProductTabHiddenV227', section.getAttribute('data-cl-product-group') !== group);
    });
    remember(currentPage, group);
  }

  function wire(root, currentPage) {
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.clProductTab'));
    buttons.forEach(function (button, index) {
      button.onclick = function () {
        activate(root, currentPage, button.getAttribute('data-group'));
      };
      button.onkeydown = function (event) {
        if (!/ArrowLeft|ArrowRight|Home|End/.test(event.key)) return;
        event.preventDefault();
        var target = index;
        if (event.key === 'ArrowRight') target = (index + 1) % buttons.length;
        if (event.key === 'ArrowLeft') target = (index - 1 + buttons.length) % buttons.length;
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = buttons.length - 1;
        buttons[target].focus();
        buttons[target].click();
      };
    });
  }

  function apply() {
    var main = q('.main') || q('main');
    if (!main) return false;
    var currentPage = page();
    if (currentPage === 'code-god') return false;
    var sections = managedSections(main);
    var force = currentPage === 'setup' || currentPage === 'help';
    if (!force && sections.length < 5) {
      var old = q('#' + ROOT_ID);
      if (old) old.remove();
      sections.forEach(function (section) {
        section.classList.remove('clProductManagedV227', 'clProductTabHiddenV227');
        section.removeAttribute('data-cl-product-group');
      });
      return true;
    }

    addCss();
    document.body.classList.add('clProductPolishV227');
    var counts = {};
    sections.forEach(function (section) {
      var group = groupFor(section, currentPage);
      section.classList.add('clProductManagedV227');
      section.setAttribute('data-cl-product-group', group);
      counts[group] = (counts[group] || 0) + 1;
    });

    var defs = definitions(currentPage).filter(function (definition) { return counts[definition[0]]; });
    if (defs.length < 2) return true;
    var wanted = remembered(currentPage);
    var active = defs.some(function (definition) { return definition[0] === wanted; }) ? wanted : defs[0][0];
    var root = q('#' + ROOT_ID);
    if (!root) {
      root = document.createElement('section');
      root.id = ROOT_ID;
      root.setAttribute('data-cl-product-ignore', 'yes');
      var hero = q('.hero', main);
      var topbar = q('.topbar', main);
      var anchor = hero || topbar;
      if (anchor && anchor.parentNode === main) anchor.insertAdjacentElement('afterend', root);
      else main.insertBefore(root, main.firstChild);
    }
    root.innerHTML = '';
    var head = document.createElement('div');
    head.className = 'clProductTabsHead';
    head.innerHTML = '<b>' + titleFor(currentPage) + '</b><span>Everything stays on this page—tabs only reduce scrolling.</span>';
    var list = document.createElement('div');
    list.className = 'clProductTabList';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', titleFor(currentPage));
    defs.forEach(function (definition) { list.appendChild(tabButton(definition, counts[definition[0]], active)); });
    root.appendChild(head);
    root.appendChild(list);
    wire(root, currentPage);
    activate(root, currentPage, active);
    return true;
  }

  function schedule() {
    if (applyTimer) return;
    applyTimer = window.setTimeout(function () {
      applyTimer = 0;
      apply();
    }, 70);
  }

  function watch() {
    var main = q('.main') || q('main');
    if (!main || observer) return;
    observer = new MutationObserver(schedule);
    observer.observe(main, { childList: true });
    stopTimer = window.setTimeout(function () {
      if (observer) observer.disconnect();
      observer = null;
    }, 9000);
  }

  function boot() {
    apply();
    watch();
    [250, 800, 1600, 3200, 6000].forEach(function (delay) { window.setTimeout(apply, delay); });
    window.CodeLabsProductPolishV227 = { version: VERSION, apply: apply };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
