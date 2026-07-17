/* Code Labs Buddy Bridge Tab V264 - stable fourth tab. */
(function(){'use strict';
var V='V264-buddy-tab-stable',R='clProductTabsV227',B='clBuddyPageBridgeV139',G='buddy',wrapped=false,timer=0;
function q(s,r){return(r||document).querySelector(s)}
function all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function page(){return(document.body&&document.body.getAttribute('data-page'))||location.pathname.split('/').pop().replace(/\.html?$/i,'')||'index'}
function key(){return'codeLabsProductTabV227:'+page()}
function get(){try{return localStorage.getItem(key())||''}catch(e){return''}}
function set(v){try{localStorage.setItem(key(),v)}catch(e){}}
function managed(){return all('.clProductManagedV227[data-cl-product-group]')}
function bridge(){return q('#'+B)}
function select(root,name){all('.clProductTab',root).forEach(function(x){var on=x.dataset.group===name;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1})}
function add(root){var row=q('.clProductTabList',root),x=q('.clProductTab[data-group="'+G+'"]',root);if(!row||!bridge())return null;if(!x){x=document.createElement('button');x.type='button';x.className='clProductTab';x.setAttribute('role','tab');x.dataset.group=G;x.textContent='4. 🤖 Buddy Bridge (1)';row.appendChild(x)}return x}
function showBuddy(root){var b=bridge();if(!b)return false;add(root);managed().forEach(function(s){s.classList.add('clProductTabHiddenV227')});b.hidden=false;b.classList.remove('clProductTabHiddenV227');select(root,G);set(G);return true}
function showPage(root,name){var b=bridge();if(b)b.hidden=true;select(root,name);set(name)}
function install(){var root=q('#'+R),b=bridge();if(!root||!b)return false;add(root);b.setAttribute('data-cl-product-ignore','yes');b.setAttribute('data-cl-page-runtime-ignore','yes');if(!root.dataset.v264Bound){root.dataset.v264Bound='1';root.addEventListener('click',function(e){var x=e.target.closest&&e.target.closest('.clProductTab');if(!x)return;if(x.dataset.group===G){e.preventDefault();e.stopImmediatePropagation();showBuddy(root)}else setTimeout(function(){showPage(root,x.dataset.group)},0)},true)}if(get()===G)showBuddy(root);else b.hidden=true;root.dataset.clBuddyBridgeTabVersion=V;return true}
function schedule(){clearTimeout(timer);timer=setTimeout(install,0)}
function wrap(){var t=window.CodeLabsPageTabsV235;if(!t||!t.render||wrapped)return false;var old=t.render;t.render=function(c){var want=get()===G,root=q('#'+R),x=root&&q('.clProductTab[data-group="'+G+'"]',root);if(x)x.remove();var ok=old(c);install();if(want)showBuddy(q('#'+R));return ok};wrapped=true;return true}
function boot(){wrap();install();[120,500,1200,2600].forEach(function(ms){setTimeout(function(){wrap();install()},ms)})}
window.CodeLabsBuddyBridgeTabV264={version:V,install:install};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();