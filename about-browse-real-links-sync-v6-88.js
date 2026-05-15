/* Stream Bandit V6.88 About Browse real links sync helper. Wording only. */
(function(){
  'use strict';
  function setText(selector, value) {
    var element = document.querySelector(selector);
    if (element) element.textContent = value;
  }
  function replaceText(oldText, newText) {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf(oldText) !== -1) {
        node.nodeValue = node.nodeValue.split(oldText).join(newText);
      }
    }
  }
  function sync() {
    document.title = 'Stream Bandit V6.88 About Browse Real Links Sync TEST';
    setText('.badge', 'V6.88 About Browse Real Links Sync TEST');
    setText('.footer', 'V6.88 About Browse Real Links Sync TEST — Browse group in progress.');
    replaceText('About Browse Shell TEST. Shared menu, overlay search and account shell active.', 'About Browse Real Links Sync TEST. Tabs and safe route links active.');
    replaceText('V6.42 About Browse Shell TEST', 'V6.88 About Browse Real Links Sync TEST');
    replaceText('same-tab Global Search V6.27', 'same-tab Global Search');
    replaceText('Open Accessibility V6.40', 'Open Accessibility route');
    replaceText('Open Player V6.34', 'Open Player route');
    replaceText('movie clicks open Details V6.33', 'movie clicks open details-watch-shell-v6-33-test.html');
    replaceText('Accessibility link opens V6.40 and Player link opens V6.34.', 'Accessibility opens: accessibility-watch-shell-v6-40-test.html. Player opens: player-watch-shell-v6-34-test.html.');
    replaceText('Search overlay while typing, full Global Search V6.27 on Enter/Search.', 'Search overlay while typing, full Global Search on Enter/Search. Movie results open details-watch-shell-v6-33-test.html.');
    replaceText('V6.42 About Checklist', 'V6.88 About Checklist');
    replaceText('V6.42 About Browse Shell TEST — live app unchanged.', 'V6.88 About Browse Real Links Sync TEST — Browse group in progress.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
  setTimeout(sync, 700);
  setTimeout(sync, 1600);
  window.StreamBanditAboutLinksSyncV688 = { refresh: sync };
})();
