/* Code Labs Hero Utilities V266 - keep auto-fill helpers directly under the hero. */
(function(){
'use strict';
var VERSION='V266-autofill-under-hero';
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function main(){return q('.main')||q('main')}
function hero(root){return q(':scope>.hero',root)||q('.hero',root)}
function clearManaged(panel){