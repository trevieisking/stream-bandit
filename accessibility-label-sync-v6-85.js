/* Stream Bandit V6.85 Accessibility label sync helper. Wording only. */
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
    document.title = 'Stream Bandit V6.85 Accessibility Label Sync TEST';
    setText('.badge', 'V6.85 Accessibility Label Sync TEST');
    setText('.footer', 'V6.85 Accessibility Label Sync TEST — live app unchanged.');
    replaceText('Accessibility Watch Shell TEST. Shared menu, overlay search and account shell active.', 'Accessibility Label Sync TEST. Preview controls kept. Exact route files shown.');
    replaceText('V6.40 Accessibility Watch Shell TEST', 'V6.85 Accessibility Label Sync TEST');
    replaceText('Player Comfort opens V6.34, Details opens V6.33', 'Player opens: player-watch-shell-v6-34-test.html. Details opens: details-watch-shell-v6-33-test.html');
    replaceText('Open Player V6.34', 'Open Player route');
    replaceText('Open Details V6.33', 'Open Details route');
    replaceText('Player opens V6.34 and Details opens V6.33.', 'Player opens: player-watch-shell-v6-34-test.html. Details opens: details-watch-shell-v6-33-test.html.');
    replaceText('Player Comfort uses V6.34; Details uses V6.33.', 'Player opens: player-watch-shell-v6-34-test.html. Details opens: details-watch-shell-v6-33-test.html.');
    replaceText('V6.40 Accessibility Checklist', 'V6.85 Accessibility Checklist');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
  setTimeout(sync, 700);
  setTimeout(sync, 1600);
  window.StreamBanditAccessibilityLabelSyncV685 = { refresh: sync };
})();
