/* Stream Bandit V6.83 Favourites label sync helper. Wording only. */
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
    document.title = 'Stream Bandit V6.83 Favourites Label Sync TEST';
    setText('.badge', 'V6.83 Favourites Label Sync TEST');
    setText('.footer', 'V6.83 Favourites Label Sync TEST — live index unchanged.');
    replaceText('Favourites Real Remove TEST. Signed-in user rows only.', 'Favourites Label Sync TEST. Real sb_favourites remove logic kept. Exact route files shown.');
    replaceText('V6.38.1 Favourites Real Remove TEST', 'V6.83 Favourites Label Sync TEST');
    replaceText('Details V6.33.2 / Player V6.34', 'Details opens: details-watch-shell-v6-33-test.html / Play opens: player-watch-shell-v6-34-test.html');
    replaceText('Details opens V6.33.2, Play opens V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('Details V6.33.2 and Play V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('V6.38.1 Checklist', 'V6.83 Favourites Checklist');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
  setTimeout(sync, 700);
  setTimeout(sync, 1500);
  window.StreamBanditFavouritesLabelSyncV683 = { refresh: sync };
})();
