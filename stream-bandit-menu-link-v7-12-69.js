/* Stream Bandit V7.12.69 extra navigation link */
(function(){
  var href = 'global-helper-property-owner-scan-v7-12-67-test.html';
  var label = 'Global Whatnots';
  function make(){
    var drawer = document.getElementById('sbShellDrawer');
    if(!drawer) return;
    var groups = drawer.querySelectorAll('.sb-shell-group');
    if(!groups.length) return;
    var box = groups[groups.length - 1].querySelector('.sb-shell-items');
    if(!box || box.querySelector('a[href="' + href + '"]')) return;
    var a = document.createElement('a');
    a.className = 'sb-shell-link owner';
    a.href = href;
    a.textContent = '🧬 ' + label;
    box.insertBefore(a, box.children[1] || null);
  }
  setInterval(make, 1000);
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', make); else make();
})();
