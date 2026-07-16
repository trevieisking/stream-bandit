/* Code Labs Test + Safety Family V258 - bounded presentation for routes 12-13. */
(function(){
'use strict';
var PAGE=(document.body&&document.body.getAttribute('data-page'))||'';
var ROUTES=[['preview-test','preview-test.html','12','Preview + Test'],['checkpoints','checkpoints.html','13','Checkpoints']];
if(!ROUTES.some(function(x){return x[0]===PAGE}))return;
function q(s,r){return(r||document).querySelector(s)}
function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function add(n,c){if(n)n.classList.add(c)}
function panelFor(n){return n&&n.closest?n.closest('section,.panel'):null}
function headingPanel(main,text){return qa(':scope>section,:scope>.panel',main).filter(function(n){var h=q('h2',n);return String(h&&h.textContent||'').trim()===text})[0]||null