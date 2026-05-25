/* Stream Bandit V7.12.70 extra Owner navigation link
   Fix: never adds Global Whatnots into Policy/last group.
   It waits for an actual Owner group. If Owner is hidden on a page, it leaves the menu alone. */
(function(){
  'use strict';

  var href = 'global-helper-property-owner-scan-v7-12-67-test.html';
  var label = 'Global Whatnots';
  var VERSION = 'v7-12-70-owner-only';

  function groupName(group){
    var btn = group && group.querySelector('.sb-shell-group-btn');
    if(!btn) return '';
    var first = btn.querySelector('span');
    return String((first && first.textContent) || btn.textContent || '').replace(/\d+$/,'').trim().toLowerCase();
  }

  function findOwnerGroup(drawer){
    var direct = drawer.querySelector('.sb-shell-group.owner');
    if(direct && groupName(direct) === 'owner') return direct;

    var groups = drawer.querySelectorAll('.sb-shell-group');
    for(var i=0;i<groups.length;i++){
      if(groupName(groups[i]) === 'owner') return groups[i];
    }
    return null;
  }

  function make(){
    var drawer = document.getElementById('sbShellDrawer');
    if(!drawer) return false;

    var ownerGroup = findOwnerGroup(drawer);
    if(!ownerGroup){
      document.documentElement.dataset.streamBanditMenuExtraLink = VERSION + '-waiting-owner';
      return false;
    }

    var box = ownerGroup.querySelector('.sb-shell-items');
    if(!box) return false;

    var wrongLinks = drawer.querySelectorAll('a[href="' + href + '"]');
    wrongLinks.forEach(function(a){
      if(!ownerGroup.contains(a)) a.remove();
    });

    if(box.querySelector('a[href="' + href + '"]')){
      document.documentElement.dataset.streamBanditMenuExtraLink = VERSION;
      return true;
    }

    var a = document.createElement('a');
    a.className = 'sb-shell-link owner';
    a.href = href;
    a.setAttribute('data-sb-text','global whatnots property helper settings bucket supabase role gate owner');
    a.innerHTML = '<span style="width:24px">🧬</span>' + label;

    var first = box.querySelector('a');
    if(first && first.nextSibling){
      box.insertBefore(a, first.nextSibling);
    }else{
      box.appendChild(a);
    }

    ownerGroup.classList.add('open','owner');
    document.documentElement.dataset.streamBanditMenuExtraLink = VERSION;
    return true;
  }

  function start(){
    var n = 0;
    var t = setInterval(function(){
      n++;
      var ok = make();
      if(ok || n > 80) clearInterval(t);
    },250);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  try{
    new MutationObserver(function(){ make(); }).observe(document.documentElement,{childList:true,subtree:true});
  }catch(e){}
})();
