(function(){
'use strict';
const VERSION='V7.12.96 My Channel Manager Notice';
if(!/my-channel-clean-machine-v7-12-47-test\.html$/i.test(location.pathname)&&!document.title.includes('Clean My Channel'))return;
function run(){
  const old=document.getElementById('sbMyChannelVideoManager');
  if(old)old.style.display='none';
  if(document.getElementById('sbMyChannelManagerNotice'))return;
  const host=document.getElementById('channels')||document.querySelector('.wrap')||document.body;
  const box=document.createElement('section');
  box.id='sbMyChannelManagerNotice';
  box.className='box';
  box.innerHTML='<h2>Channel video manager</h2><p>The working channel video manager lives on the Channels page.</p><div class="actions"><a class="btn primary" href="channels-global-helpers-v7-5-3-test.html">Open Channels Page</a></div><div class="note">Use Channels page for channel video changes. This keeps the working system in one reliable place.</div>';
  host.appendChild(box);
  document.documentElement.dataset.streamBanditMyChannelManager=VERSION;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
setTimeout(run,800);
})();