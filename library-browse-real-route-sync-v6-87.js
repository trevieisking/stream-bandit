/* Stream Bandit V6.87 Library Browse real route sync helper. Wording only. */
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
    document.title = 'Stream Bandit V6.87 Library Browse Real Route Sync TEST';
    setText('.badge', 'V6.87 Library Browse Real Route Sync TEST');
    setText('.footer', 'V6.87 Library Browse Real Route Sync TEST — Browse group in progress.');
    replaceText('Library Core Saves TEST. Shared menu, overlay search, account shell and real save buttons active.', 'Library Browse Real Route Sync TEST. Supabase rows, filters, reload and real save buttons active.');
    replaceText('V6.41.1 Library Core Saves TEST', 'V6.87 Library Browse Real Route Sync TEST');
    replaceText('Details opens V6.33.1 and Play opens V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('Details opens V6.33.1, Play opens V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('Details goes to V6.33.1; Play goes to V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('V6.41.1 Library Checklist', 'V6.87 Library Checklist');
    replaceText('V6.41.1 Library Core Saves TEST — live index unchanged.', 'V6.87 Library Browse Real Route Sync TEST — Browse group in progress.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
  setTimeout(sync, 700);
  setTimeout(sync, 1600);
  window.StreamBanditLibraryRouteSyncV687 = { refresh: sync };
})();
