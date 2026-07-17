/* Code Labs Buddy Bridge Tab V263 - presentation-only fourth tab. */
(function(){
'use strict';
var V='V263-buddy-bridge-tab',ROOT='clProductTabsV227',BRIDGE='clBuddyPageBridgeV139',GROUP='buddy',wrapped=false,timer=0;
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function key(){return'codeLabsProductTabV227:'+page()}
function remember(value){try{localStorage.setItem(key(),value)}catch(e){}}
function recalled(){try{return localStorage.getItem(key())||''}catch(e){return''}}
function managed(){return all('.clProductManagedV227[data-cl-product-group]')}
function bridge(){return q('#'+BRIDGE)}
function select(root,name){all('.clProductTab',root).forEach(function(b){var on=b.dataset.group===name;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1})}
function showBuddy(root){var b=bridge();if(!b)return false;managed().forEach(function(s){s.classList.add('clProductTabHiddenV227')});b.hidden=false;b.classList.remove('clProductTabHiddenV227');select(root,GROUP);remember(GROUP);return true}
function showPage(root,name){var b=bridge();if(b)b.hidden=true;select(root,name);remember(name)}
function button(root){var row=q('.clProductTabList',root),b=q('.clProductTab[data-group="'+GROUP+'"]',root);if(!row||!bridge())return null;if(!b){b=document.createElement('button');b.type='button';b.className='clProductTab';b.setAttribute('role','tab');b.dataset.group=GROUP;b.textContent='4. 🤖 Buddy Bridge (1)';row.appendChild(b)}return b}
function keyboard(root,e){if(!/ArrowLeft|ArrowRight|Home|End/.test(e.key))return;var buttons=all('.clProductTab',root),i=buttons.indexOf(e.target);if(i<0)return;e.preventDefault();e.stopImmediatePropagation();var x=i;if(e.key==='ArrowRight')x=(i+1)%buttons.length;if(e.key==='ArrowLeft')x=(i-1+buttons.length)%buttons.length;if(e.key==='Home')x=0;if(e.key==='End')x=buttons.length-1;buttons[x].focus({preventScroll:true});buttons[x].click()}
function install(){var root=q('#'+ROOT),b=bridge();if(!root||!b)return false;button(root);b.setAttribute('data-cl-product-ignore','yes');b.setAttribute('data-cl-page-runtime-ignore','yes');if(!root.dataset.v263Bound){root.dataset.v263Bound='1';root.addEventListener('click',function(e){var tab=e.target.closest&&e.target.closest('.clProductTab');if(!tab)return;if(tab.dataset.group===GROUP){e.preventDefault();showBuddy(root)}else{setTimeout(function(){showPage(root,tab.dataset.group)},0)}},false);root.addEventListener('keydown',function(e){keyboard(root,e)},true)}if(recalled()===GROUP)showBuddy(root);else b.hidden=true;root.dataset.clBuddyBridgeTabVersion=V;return true}
function schedule(){clearTimeout(timer);timer=setTimeout(install,0)}
function wrap(){var tabs=window.CodeLabsPageTabsV235;if(!tabs||!tabs.render||wrapped)return false;var old=tabs.render;tabs.render=function(config){var ok=old(config);schedule();return ok};wrapped=true;return true}
function boot(){wrap();install();[120,500,1200,2600].forEach(function(ms){setTimeout(function(){wrap();install()},ms)})}
window.CodeLabsBuddyBridgeTabV263={version:V,install:install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
