/* Stream Bandit V6.84 Liked label sync helper. Wording only. */
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
    document.title = 'Stream Bandit V6.84 Liked Label Sync TEST';
    setText('.badge', 'V6.84 Liked Label Sync TEST');
    setText('.footer', 'V6.84 Liked Label Sync TEST — live app unchanged.');
    replaceText('Liked Watch Shell TEST. Shared menu, overlay search and account shell active.', 'Liked Label Sync TEST. Real sb_likes remove helper kept. Exact route files shown.');
    replaceText('V6.39 Liked Watch Shell TEST', 'V6.84 Liked Label Sync TEST');
    replaceText('V6.39.1 Liked Real Remove TEST', 'V6.84 Liked Label Sync TEST');
    replaceText('Details opens V6.33 and Play opens V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('Details opens V6.33.2, Play opens V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('Details goes to V6.33; Play goes to V6.34.', 'Details opens: details-watch-shell-v6-33-test.html. Play opens: player-watch-shell-v6-34-test.html.');
    replaceText('V6.39 Liked Checklist', 'V6.84 Liked Checklist');
    replaceText('Unlike is preview-only.', 'Remove Like is active for the signed-in user only.');
    replaceText('No real unlike/clear/save/write/live/index action.', 'No clear-all/admin/storage/billing/live/index action.');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync); else sync();
  setTimeout(sync, 700);
  setTimeout(sync, 1600);
  window.StreamBanditLikedLabelSyncV684 = { refresh: sync };
})();
