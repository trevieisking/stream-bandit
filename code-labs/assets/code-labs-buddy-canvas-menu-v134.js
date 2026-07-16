/* Code Labs Buddy Canvas compatibility loader V257. */
(function(){
'use strict';
var root=document.documentElement;
root.setAttribute('data-cl-shell-loader','v256');
root.setAttribute('data-cl-shell-booting','v256');
function q(s){return document.querySelector(s)}
function pathOf(src){try{return new URL(src,document.baseURI).pathname}catch(e){return String(src||'').split('?')[0]}}
function load(src,attr){var path=pathOf(src),old=Array.prototype.slice.call(document.scripts).filter(function(s){return pathOf(s.getAttribute('src')||'')===path})[0];if(old)return old;var s=document.createElement('script');s.async=false;s.src=src;s.setAttribute(attr,'yes');document.head.appendChild(s);return s}
function ruleBox(){return q('.sidebar .sideBox:not(#clBuddyToolsBox)')}
function run(){if((document.body&&document.body.getAttribute('data-page'))!=='buddy-canvas')return;var small=q('.logo small');if(small)small.textContent='Kind repair workflow for non-coders';var side=ruleBox();if(side){side.setAttribute('data-cl-buddy-lane-rule','V257');side.innerHTML='<b>Buddy Lane rule</b><p>You prepare or approve the complete file. ChatGPT and Sol help with the page; GitHub changes stay on a reviewed branch and pull request.</p>'}load('assets/code-labs-repair-family-v257.js?v=cl-v257-repair-family','data-cl-repair-family-v257');window.CodeLabsBuddyCanvasMenuV134={version:'V257',active:true,routes:window.CodeLabsStableNav?window.CodeLabsStableNav.routes:[]}}
load('assets/cl-nav.js?v=cl-v256-bounded-families','data-cl-shell-loader-v256');
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();