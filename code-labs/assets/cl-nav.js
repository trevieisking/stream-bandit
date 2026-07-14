/* Code Labs V201 compatibility entry.
   Loads restored header, complete page runtime, V104 relay/footer, and review lane.
*/
(function(){
'use strict';
var VERSION='V201.2-restored-full-route',started=false,completed=false;
function q(s){return document.querySelector(s)}
function reveal(){completed=true;document.documentElement.removeAttribute('data-cl-shell-settling');document.documentElement.setAttribute('data-cl-shell-ready',VERSION)}
function style(){if(q('style[data-cl-shell-settling]'))return;var s=document.createElement('style');s.setAttribute('data-cl-shell-settling','yes');s.textContent='html[data-cl-shell-settling="1"] .sidebar .nav{visibility:hidden!important}html[data-cl-shell-settling="1"] #clFooterBuddyShellV201{visibility:hidden!important}';document.head.appendChild(s)}
function load(src,attr,ready,next){var old=q('script['+attr+']');function wait(n){if(ready()){next();return}if(n>100){reveal();return}setTimeout(function(){wait(n+1)},50)}if(old){wait(0);return old}var s=document.createElement('script');s.src=src;s.setAttribute(attr,'yes');s.onload=function(){wait(0)};s.onerror=reveal;document.head.appendChild(s);return s}
function codeGod(){load('assets/code-god-lane-v200.js?v=cl-v201-2','data-cl-code-god-lane-v200',function(){return!!window.CodeGodLaneV200},function(){if(window.CodeGodLaneV200.install)window.CodeGodLaneV200.install();reveal()})}
function footer(){load('assets/code-labs-v104-state-fingerprint-v200.js?v=cl-v201-2','data-cl-v104-state-fingerprint-v200',function(){return!!window.CodeLabsV104StateFingerprintV200},function(){if(window.CodeLabsV104StateFingerprintV200.install)window.CodeLabsV104StateFingerprintV200.install();load('assets/code-labs-footer-buddy-shell-v200.js?v=cl-v201-2','data-cl-footer-buddy-shell-v201',function(){return!!window.CodeLabsFooterBuddyShellV201},function(){window.CodeLabsFooterBuddyShellV201.run();codeGod()})})}
function runtime(){load('assets/code-labs-page-runtime-v200.js?v=cl-v201-2','data-cl-page-runtime-v201',function(){return!!window.CodeLabsPageRuntimeV201},function(){window.CodeLabsPageRuntimeV201.run();footer()})}
function owners(){if(window.CodeLabsHeaderShellV201&&window.CodeLabsHeaderShellV201.run)window.CodeLabsHeaderShellV201.run();load('assets/code-labs-current-file-context-v200.js?v=cl-v201-2','data-cl-current-file-context-v200',function(){return!!window.CodeLabsCurrentFileContextV200},function(){load('assets/code-god-review-v200.js?v=cl-v201-2','data-cl-code-god-review-v200',function(){return!!window.CodeGodReviewV200},runtime)})}
function run(){if(completed){owners();return true}if(started)return true;started=true;style();document.documentElement.setAttribute('data-cl-shell-settling','1');load('assets/code-labs-header-shell-v200.js?v=cl-v201-2','data-cl-header-shell-v201',function(){return!!window.CodeLabsHeaderShellV201},owners);return true}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();setTimeout(function(){if(!completed){started=false;run()}},1800);
window.CodeLabsStableNav={version:VERSION,links:29,run:run};
})();
