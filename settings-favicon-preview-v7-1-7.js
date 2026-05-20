(function(){
'use strict';
function $(id){return document.getElementById(id)}
function preview(inputId,imgId,statusId,label){
  const input=$(inputId),img=$(imgId),status=$(statusId);
  if(!input)return;
  input.addEventListener('change',function(){
    const f=input.files&&input.files[0];
    if(!f){if(status)status.textContent='No '+label+' chosen yet.';if(img)img.style.display='none';return;}
    if(status)status.textContent=label+' chosen locally: '+f.name+' ('+Math.round(f.size/1024)+' KB).';
    if(img){
      if(f.type&&f.type.indexOf('image/')===0){img.src=URL.createObjectURL(f);img.style.display='block';}
      else {img.style.display='none';}
    }
    const box=$('statusBox');
    if(box)box.textContent=label+' selected for local preview. No save happened yet.';
  });
}
function init(){
  preview('faviconFile','faviconPreview','faviconStatus','Favicon');
  preview('appIconFile','appIconPreview','appIconStatus','App icon');
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else setTimeout(init,250);
})();