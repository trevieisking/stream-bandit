/* Stream Bandit V5.14.3 — Test Rating Calculator
   Test-page-only replacement for the old V5.7 calculator while V5.14 UI controller is tested.
   Fixes calculator appearing then disappearing on Admin/Supabase Manager test pages.
   Manual helper only. No Supabase writes, no movie saves, no Mux, no player, no database changes. */
(function(){
'use strict';

var VERSION='V5.14.3';
var lastResult='';
var openWanted=false;

function byId(id){return document.getElementById(id);}
function text(el){return String(el&&el.textContent||'').replace(/\s+/g,' ').trim();}
function main(){return document.querySelector('.main')||document.querySelector('main')||document.getElementById('app');}
function pageTitle(){return text(document.querySelector('.main .top h2,.main h1,.main h2')).toLowerCase();}
function isAllowedPage(){
  var m=main();
  var t=text(m).toLowerCase();
  var p=pageTitle();
  return p==='admin'||p==='admin tools'||p.indexOf('admin')===0||p.indexOf('supabase movie manager')>-1||
    (t.indexOf('supabase rows')>-1&&t.indexOf('edit supabase movie')>-1)||
    (t.indexOf('rating calculator')>-1&&t.indexOf('admin')>-1);
}
function addStyle(){
  if(byId('sb5143RatingStyle'))return;
  var st=document.createElement('style');
  st.id='sb5143RatingStyle';
  st.textContent='\n.sb5143Calc{background:linear-gradient(180deg,rgba(16,24,39,.96),rgba(13,14,21,.92));border:1px solid rgba(182,140,255,.30);border-radius:24px;padding:15px;margin:14px 0;box-shadow:0 16px 42px rgba(0,0,0,.32);color:#f6f7ff}.sb5143CalcHead{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.sb5143Calc h3{margin:0 0 7px;font-size:20px}.sb5143Close{padding:8px 11px!important;border-radius:999px!important}.sb5143Calc p{color:var(--muted,#a9afc3);font-size:13px;line-height:1.45}.sb5143Grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}.sb5143Grid input{width:100%}.sb5143Result{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;background:linear-gradient(135deg,rgba(61,220,151,.16),rgba(124,60,255,.18));border:1px solid rgba(61,220,151,.25);border-radius:20px;padding:13px;margin-top:12px}.sb5143Score{font-size:36px;font-weight:1000;letter-spacing:-.05em}.sb5143Grade{font-size:13px;color:#baf7df;font-weight:900}.sb5143Actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.sb5143Mini{font-size:12px;color:var(--muted,#a9afc3);margin-top:8px}.sb5143Breakdown{font-size:12px;color:var(--muted,#a9afc3);margin-top:8px;line-height:1.45}.sb5143SafeNote{margin-top:10px;padding:10px;border-radius:16px;background:rgba(61,220,151,.10);border:1px solid rgba(61,220,151,.20);color:#baf7df;font-size:12px;line-height:1.45}#sb5143MenuButton{margin:0!important}\n';
  document.head.appendChild(st);
}
function field(id,label,placeholder,help){return '<div><label>'+label+'</label><input id="'+id+'" inputmode="decimal" placeholder="'+placeholder+'"><div class="sb5143Mini">'+help+'</div></div>';}
function panelHtml(){
  return '<div class="sb5143Calc" data-sb5143-calc="1" id="sb5143Calc" tabindex="-1">'+
    '<div class="sb5143CalcHead"><div><h3>Stream Bandit Rating Calculator</h3><p>Manually enter ratings you looked up, then calculate your own overall score. Leave unknown sources blank. IMDb should be entered as 0–10; everything else as 0–100.</p></div><button type="button" class="secondary sb5143Close" id="sb5143Close">Close calculator</button></div>'+ 
    '<div class="sb5143Grid">'+
      field('sb5143Imdb','IMDb','Example: 7.2','0–10')+
      field('sb5143RtCritics','Rotten Tomatoes Critics','Example: 84','0–100')+
      field('sb5143RtAudience','Rotten Tomatoes Audience','Example: 79','0–100')+
      field('sb5143Meta','Metacritic','Example: 68','0–100')+
      field('sb5143Letter','Letterboxd','Example: 3.6','0–5')+
      field('sb5143Extra','Other / Your score','Example: 80','0–100')+
    '</div>'+ 
    '<div class="sb5143Actions"><button type="button" id="sb5143Calculate">Calculate Stream Bandit Score</button><button type="button" class="secondary" id="sb5143Copy">Copy result</button><button type="button" class="secondary" id="sb5143Clear">Clear</button></div>'+ 
    '<div class="sb5143Result"><div><b>Stream Bandit Score</b><div class="sb5143Grade" id="sb5143Grade">Enter at least one rating.</div></div><div class="sb5143Score" id="sb5143Score">--</div></div>'+ 
    '<div class="sb5143Breakdown" id="sb5143Breakdown">Ready.</div>'+ 
    '<div class="sb5143SafeNote">Manual helper only — copy the result and paste it into the movie rating field when you are happy. This calculator does not save or overwrite movie data.</div>'+ 
  '</div>';
}
function panels(){return Array.prototype.slice.call(document.querySelectorAll('#sb5143Calc,[data-sb5143-calc="1"]'));}
function removeDuplicatePanels(){var ps=panels();ps.forEach(function(p,i){if(i>0){try{p.remove();}catch(e){}}});}
function removeAllPanels(){panels().forEach(function(p){try{p.remove();}catch(e){}});}
function value(id){var el=byId(id);if(!el)return null;var raw=String(el.value||'').replace('%','').trim();if(!raw)return null;var n=Number(raw);return Number.isFinite(n)?n:null;}
function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function grade(score){if(score>=90)return 'Elite / must-watch';if(score>=80)return 'Excellent';if(score>=70)return 'Good';if(score>=60)return 'Mixed but watchable';if(score>=50)return 'Weak / only if interested';return 'Low score';}
function calculate(){
  var rows=[];
  var imdb=value('sb5143Imdb');if(imdb!=null)rows.push(['IMDb',clamp(imdb,0,10)*10]);
  var rtc=value('sb5143RtCritics');if(rtc!=null)rows.push(['Rotten Tomatoes Critics',clamp(rtc,0,100)]);
  var rta=value('sb5143RtAudience');if(rta!=null)rows.push(['Rotten Tomatoes Audience',clamp(rta,0,100)]);
  var meta=value('sb5143Meta');if(meta!=null)rows.push(['Metacritic',clamp(meta,0,100)]);
  var letter=value('sb5143Letter');if(letter!=null)rows.push(['Letterboxd',clamp(letter,0,5)*20]);
  var extra=value('sb5143Extra');if(extra!=null)rows.push(['Other / Your score',clamp(extra,0,100)]);
  var scoreEl=byId('sb5143Score'), gradeEl=byId('sb5143Grade'), br=byId('sb5143Breakdown');
  if(!scoreEl||!gradeEl||!br)return;
  if(!rows.length){scoreEl.textContent='--';gradeEl.textContent='Enter at least one rating.';br.textContent='Ready.';lastResult='';return;}
  var avg=rows.reduce(function(a,r){return a+r[1];},0)/rows.length;
  var score=Math.round(avg), g=grade(score);
  scoreEl.textContent=score;gradeEl.textContent=g;
  br.innerHTML='<b>Used sources:</b> '+rows.map(function(r){return r[0]+': '+Math.round(r[1])+'/100';}).join(' · ');
  lastResult='Stream Bandit Score: '+score+'/100 ('+g+') — '+rows.map(function(r){return r[0]+': '+Math.round(r[1])+'/100';}).join(', ');
}
function toast(msg){try{var t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},2500);}catch(e){}}
function copyResult(){if(!lastResult)calculate();if(!lastResult)return;if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(lastResult).then(function(){toast('Rating result copied');});}else toast(lastResult);}
function clearAll(){['sb5143Imdb','sb5143RtCritics','sb5143RtAudience','sb5143Meta','sb5143Letter','sb5143Extra'].forEach(function(id){var el=byId(id);if(el)el.value='';});lastResult='';calculate();}
function closePanel(){openWanted=false;removeAllPanels();}
function bindCalc(){
  var calc=byId('sb5143Calculate'), copy=byId('sb5143Copy'), clear=byId('sb5143Clear'), close=byId('sb5143Close');
  if(calc&&!calc.dataset.bound){calc.dataset.bound='1';calc.onclick=calculate;}
  if(copy&&!copy.dataset.bound){copy.dataset.bound='1';copy.onclick=copyResult;}
  if(clear&&!clear.dataset.bound){clear.dataset.bound='1';clear.onclick=clearAll;}
  if(close&&!close.dataset.bound){close.dataset.bound='1';close.onclick=closePanel;}
  ['sb5143Imdb','sb5143RtCritics','sb5143RtAudience','sb5143Meta','sb5143Letter','sb5143Extra'].forEach(function(id){var el=byId(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('input',calculate);}});
}
function injectPanel(){
  if(!openWanted)return false;
  if(!isAllowedPage())return false;
  addStyle();
  removeDuplicatePanels();
  if(!byId('sb5143Calc')){
    var m=main();
    if(!m)return false;
    var top=m.querySelector('.top');
    if(top)top.insertAdjacentHTML('afterend',panelHtml());else m.insertAdjacentHTML('afterbegin',panelHtml());
  }
  removeDuplicatePanels();
  bindCalc();
  return true;
}
function openCalculator(){
  openWanted=true;
  removeAllPanels();
  var adminBtn=Array.prototype.slice.call(document.querySelectorAll('button')).find(function(b){return /^🛠?\s*admin$/i.test(text(b))||/^admin$/i.test(text(b));});
  if(adminBtn && !isAllowedPage())adminBtn.click();
  [250,600,1000].forEach(function(ms){setTimeout(function(){
    injectPanel();
    var p=byId('sb5143Calc');
    if(p){try{p.scrollIntoView({behavior:'smooth',block:'start'});p.focus();}catch(e){} }
  },ms);});
}
function addMenuButton(){
  addStyle();
  var groups=Array.prototype.slice.call(document.querySelectorAll('.sb56Group'));
  var adminGroup=groups.find(function(g){return /admin tools/i.test(text(g.querySelector('summary')));});
  var body=adminGroup&&adminGroup.querySelector('.sb56GroupBody');
  if(!body)return;
  Array.prototype.slice.call(body.querySelectorAll('#sb57MenuButton,.sb57MenuButton')).forEach(function(old){try{old.remove();}catch(e){}});
  var existing=body.querySelector('#sb5143MenuButton');
  if(existing){existing.onclick=openCalculator;return;}
  var btn=document.createElement('button');
  btn.type='button';
  btn.id='sb5143MenuButton';
  btn.innerHTML='⭐ Rating Calculator';
  btn.onclick=openCalculator;
  body.insertBefore(btn,body.firstChild);
}
function run(){
  addMenuButton();
  removeDuplicatePanels();
  if(openWanted)injectPanel();
}
document.addEventListener('click',function(ev){
  var target=ev.target;
  if(target&&target.closest&&target.closest('#sb5143MenuButton'))return;
  if(target&&target.closest&&target.closest('#sb5143Calc'))return;
  var btn=target&&target.closest&&target.closest('button');
  if(btn && !btn.closest('.side')){
    // Keep calculator open while using it, but close on main page navigation/action buttons outside the panel.
    if(openWanted && !btn.closest('#sb5143Calc'))setTimeout(function(){},80);
  }
},true);
var mo=new MutationObserver(function(){setTimeout(run,180);});
try{mo.observe(document.documentElement,{childList:true,subtree:true});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){setTimeout(run,700);});
setInterval(run,1000);
setTimeout(run,900);
})();
