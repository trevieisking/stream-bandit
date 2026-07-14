/* Code Labs Preview Route Guard V200
   Gives srcdoc previews the hosted Code Labs base URL so relative menu/assets resolve correctly.
   Preview only: does not change the source file or live deployment.
*/
(function () {
  'use strict';

  var VERSION = 'V200.1-preview-route-base';
  var BASE = 'https://chatterfriendsstreambandit.co.uk/code-labs/';
  var MARKER = 'data-cl-preview-route-v200';
  var busy = false;

  function q(selector) { return document.querySelector(selector); }
  function toast(message) {
    var element = q('#toast');
    if (!element) return;
    element.textContent = message;
    element.classList.add('show');
    setTimeout(function () { element.classList.remove('show'); }, 2200);
  }
  function normalize(html) {
    var source = String(html || '');
    if (!source.trim() || source.indexOf(MARKER) !== -1) return source;
    var base = '<base href="' + BASE + '"><meta name="' + MARKER + '" content="' + VERSION + '">';
    if (/<head[\s>]/i.test(source)) {
      return source.replace(/<head([^>]*)>/i, '<head$1>' + base);
    }
    if (/<html[\s>]/i.test(source)) {
      return source.replace(/<html([^>]*)>/i, '<html$1><head>' + base + '</head>');
    }
    return '<!doctype html><html><head>' + base + '</head><body>' + source + '</body></html>';
  }
  function apply() {
    var frame = q('#preview');
    if (!frame || busy) return;
    var current = String(frame.getAttribute('srcdoc') || frame.srcdoc || '');
    var next = normalize(current);
    if (next !== current) {
      busy = true;
      frame.srcdoc = next;
      setTimeout(function () { busy = false; }, 0);
    }
  }
  function bind() {
    var frame = q('#preview');
    if (!frame) { setTimeout(bind, 180); return; }
    if (!frame.getAttribute('data-cl-preview-route-bound')) {
      frame.setAttribute('data-cl-preview-route-bound', VERSION);
      new MutationObserver(apply).observe(frame, { attributes: true, attributeFilter: ['srcdoc'] });
      frame.addEventListener('load', function () {
        try {
          var doc = frame.contentDocument;
          if (doc && !doc.querySelector('base')) {
            var base = doc.createElement('base');
            base.href = BASE;
            doc.head.insertBefore(base, doc.head.firstChild);
          }
        } catch (error) {}
      });
    }
    ['#showFixed', '#showOriginal'].forEach(function (selector) {
      var button = q(selector);
      if (button && !button.getAttribute('data-cl-preview-route-button')) {
        button.setAttribute('data-cl-preview-route-button', VERSION);
        button.addEventListener('click', function () {
          setTimeout(function () {
            apply();
            toast('Preview routes use the hosted Code Labs base.');
          }, 20);
        });
      }
    });
    apply();
    window.CodeLabsPreviewRouteV200 = { version: VERSION, apply: apply, normalize: normalize };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
