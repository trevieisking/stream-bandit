/* Code Labs V230 Help current-tools compatibility owner. */
(function(){
'use strict';
if(!document.body||document.body.getAttribute('data-page')!=='help')return;
var timer=0;
function q(s){return document.querySelector(s)}
function text(selector,value){var e=q(selector);if(e&&e.textContent!==value)e.textContent=value}
function run(){
text('#clToolsUtilityLane>p','These browser helpers remain useful fallbacks alongside the live V104 Tool-Only