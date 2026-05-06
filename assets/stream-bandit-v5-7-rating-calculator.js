/* Stream Bandit V5.7.2 — Admin Rating Calculator
   Admin helper only. Manually enter public ratings and calculate a Stream Bandit Score.
   No live scraping/API calls, no Supabase writes, no Mux, player, storage, movie save or database changes. */
(function(){
'use strict';

var VERSION='V5.7.2';
var lastResult='';
var forceOpen=false;

function byId(id){return document.getElementById(id)}
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2'));}
function isRealAdminPage(){
  var title=pageTitle().toLowerCase();
  return title==='admin'||title.indexOf('admin')===0;
}
function addStyle(){
  if(byId('sb57Style'))return;
  var st=document.createElement('style');
  st.id='sb57Style';
  st.textContent='\n.sb57Calc{background:linear-gradient(180deg,rgba(16,24,39,.94),rgba(13,14,21,.90));border:1px solid rgba(182,140,255,.28);border-radius:24px;padding:15px;margin:14px 0;box-shadow:0 16px 42px rgba(0,0,0,.32)}.sb57Calc h3{margin:0 0 7px;font-size:20px}.sb57Calc p{color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb57Grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.sb57Result{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;background:linear-gradient(135deg,rgba(61,220,151,.16),rgba(124,60,255,.18));border:1px solid rgba(61,220,151,.25);border-radius:20px;padding:13px;margin-top:12px}.sb57Score{font-size:36px;font-weight:1000;letter-spacing:-.05em}.sb57Grade{font-size:13px;color:#baf7df;font-weight:900}.sb57Actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.sb57Mini{font-size:12px;color:var(--muted,#a9afc3);margin-top:8px}.sb57Breakdown{font-size:12px;color:var(--muted,#a9afc3);margin-top:8px;line-height:1.45}.sb57MenuButton{margin:0!important}.sb57MenuButton.active{box-shadow:0 0 0 1px rgba(255,45,85,.26),0 10px 28px rgba(124,60,255,.18)}.sb57SafeNote{margin-top:10px;padding:10px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.20);color:#baf7df;font-size:12px;line-height:1.45}\n';
  document.head.appendChild(st);
}
function panelHtml(){
  return '<div class="sb57Calc" id="sb57Calc" tabindex="-1">'+
    '<h3>Stream Bandit Rating Calculator</h3>'+ 
    '<p>Manually enter ratings you looked up, then calculate your own overall score. Leave unknown sources blank. IMDb should be entered as 0–10; everything else as 0–100.</p>'+ 
    '<div class="sb57Grid">'+
      field('sb57Imdb','IMDb','Example: 7.2','0–10')+
      field('sb57RtCritics','Rotten Tomatoes Critics','Example: 84','0–100')+
      field('sb57RtAudience','Rotten Tomatoes Audience','Example: 79','0–100')+
      field('sb57Meta','Metacritic','Example: 68','0–100')+
      field('sb57Letter','Letterboxd','Example: 3.6','0–5')+
      field('sb57Extra','Other / Your score','Example: 80','0–100')+
    '</div>'+
    '<div class="sb57Actions"><button type="button" id="sb57Calculate">Calculate Stream Bandit Score</button><button type="button" class="secondary" id="sb57Copy">Copy result</button><button type="button" class="secondary" id="sb57Clear">Clear</button></div>'+ 
    '<div class="sb57Result"><div><b>Stream Bandit Score</b><div class="sb57Grade" id="sb57Grade">Enter at least one rating.</div></div><div class="sb57Score" id="sb57Score">--</div></div>'+ 
    '<div class="sb57Breakdown" id="sb57Breakdown">Ready.</div>'+ 
    '<div class="sb57SafeNote">Manual helper only — copy the result and paste it into the movie rating field when you are happy. This calculator does not save or overwrite movie data.</div>'+ 
  '</div>';
}
function field(id,label,placeholder,help){return '<div><label>'+label+'</label><input id="'+id+'" inputmode="decimal" placeholder="'+placeholder+'"><div class="sb57Mini">'+help+'</div></div>';}
function value(id){var el=byId(id);if(!el)return null;var raw=String(el.value||'').replace('%','').trim();if(!raw)return null;var n=Number(raw);return Number.isFinite(n)?n:null;}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function grade(score){if(score>=90)return 'Elite / must-watch';if(score>=80)return 'Excellent';if(score>=70)return 'Good';if(score>=60)return 'Mixed but watchable';if(score>=50)return 'Weak / only if interested';return 'Low score';}
function calculate(){
  var rows=[];
  var imdb=value('sb57Imdb');if(imdb!=null)rows.push(['IMDb',clamp(imdb,0,10)*10]);
  var rtc=value('sb57RtCritics');if(rtc!=null)rows.push(['Rotten Tomatoes Critics',clamp(rtc,0,100)]);
  var rta=value('sb57RtAudience');if(rta!=null)rows.push(['Rotten Tomatoes Audience',clamp(rta,0,100)]);
  var meta=value('sb57Meta');if(meta!=null)rows.push(['Metacritic',clamp(meta,0,100)]);
  var letter=value('sb57Letter');if(letter!=null)rows.push(['Letterboxd',clamp(letter,0,5)*20]);
  var extra=value('sb57Extra');if(extra!=null)rows.push(['Other / Your score',clamp(extra,0,100)]);
  var scoreEl=byId('sb57Score'), gradeEl=byId('sb57Grade'), br=byId('sb57Breakdown');
  if(!scoreEl||!gradeEl||!br)return;
  if(!rows.length){scoreEl.textContent='--';gradeEl.textContent='Enter at least one rating.';br.textContent='Ready.';lastResult='';return;}
  var avg=rows.reduce(function(a,r){return a+r[1];},0)/rows.length;
  var score=Math.round(avg), g=grade(score);
  scoreEl.textContent=score;gradeEl.textContent=g;
  br.innerHTML='<b>Used sources:</b> '+rows.map(function(r){return r[0]+': '+Math.round(r[1])+'/100';}).join(' · ');
  lastResult='Stream Bandit Score: '+score+'/100 ('+g+') — '+rows.map(function(r){return r[0]+': '+Math.round(r[1])+'/100';}).join(', ');
}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove()},2500)}catch(e){}}
function copyResult(){if(!lastResult)calculate();if(!lastResult)return;navigator.clipboard&&navigator.clipboard.writeText?navigator.clipboard.writeText(lastResult).then(function(){toast('Rating result copied');}):toast(lastResult);}
function clearAll(){['sb57Imdb','sb57RtCritics','sb57RtAudience','sb57Meta','sb57Letter','sb57Extra'].forEach(function(id){var el=byId(id);if(el)el.value='';});lastResult='';calculate();}
function bindCalc(){
  var calc=byId('sb57Calculate'), copy=byId('sb57Copy'), clear=byId('sb57Clear');
  if(calc&&!calc.dataset.bound){calc.dataset.bound='1';calc.onclick=calculate;}
  if(copy&&!copy.dataset.bound){copy.dataset.bound='1';copy.onclick=copyResult;}
  if(clear&&!clear.dataset.bound){clear.dataset.bound='1';clear.onclick=clearAll;}
  ['sb57Imdb','sb57RtCritics','sb57RtAudience','sb57Meta','sb57Letter','sb57Extra'].forEach(function(id){var el=byId(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('input',calculate);}});
}
function removePanelFromWrongPage(){
  if(isRealAdminPage()||forceOpen)return;
  var p=byId('sb57Calc');
  if(p)p.remove();
}
function injectPanel(){
  removePanelFromWrongPage();
  if(!isRealAdminPage()&&!forceOpen)return false;
  addStyle();
  if(!byId('sb57Calc')){
    var main=document.querySelector('.main');
    var top=main&&main.querySelector('.top');
    if(!main)return false;
    if(top)top.insertAdjacentHTML('afterend',panelHtml());else main.insertAdjacentHTML('afterbegin',panelHtml());
  }
  bindCalc();
  return true;
}
function openAdminAndScroll(){
  forceOpen=true;
  var adminBtn=Array.prototype.slice.call(document.querySelectorAll('button')).find(function(b){return /admin/i.test(text(b))&&!/admin tools/i.test(text(b));});
  if(adminBtn)adminBtn.click();
  setTimeout(function(){
    injectPanel();
    var p=byId('sb57Calc');
    if(p){p.scrollIntoView({behavior:'smooth',block:'start'});try{p.focus();}catch(e){} toast('Rating Calculator opened');}
  },500);
}
function addMenuButton(){
  addStyle();
  var groups=Array.prototype.slice.call(document.querySelectorAll('.sb56Group'));
  var adminGroup=groups.find(function(g){return /admin tools/i.test(text(g.querySelector('summary')));});
  var body=adminGroup&&adminGroup.querySelector('.sb56GroupBody');
  if(!body||body.querySelector('#sb57MenuButton'))return;
  var btn=document.createElement('button');
  btn.type='button';
  btn.id='sb57MenuButton';
  btn.className='sb57MenuButton';
  btn.innerHTML='⭐ Rating Calculator';
  btn.onclick=openAdminAndScroll;
  body.insertBefore(btn,body.firstChild);
}
function run(){addMenuButton();injectPanel();}
document.addEventListener('click',function(ev){
  var b=ev.target&&ev.target.closest&&ev.target.closest('button[data-view],button');
  if(b&&b.id!=='sb57MenuButton')setTimeout(function(){forceOpen=false;removePanelFromWrongPage();},250);
},true);
var mo=new MutationObserver(function(){setTimeout(run,160);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1200);
setTimeout(function(){run();},900);
})();
