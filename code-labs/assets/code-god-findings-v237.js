/* Code God Console V239 - one visible review-state owner. */
(function(){
'use strict';

var V='V239-code-god-console',
    last=null,
    obs=null,
    timer=0,
    wrapped=false;

function q(s,r){
  return (r||document).querySelector(s);
}

function a(s,r){
  return [].slice.call((r||document).querySelectorAll(s));
}

function t(v){
  return String(v==null?'':v);
}

function cp(x){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(x);
  }

  var n=document.createElement('textarea');
  n.value=x;
  document.body.appendChild(n);
  n.select();
  document.execCommand('copy');
  n.remove();

  return Promise.resolve();
}

function ctx(){
  try{
    return window.CodeLabsCurrentFileContextV200
      ? window.CodeLabsCurrentFileContextV200.current()||{}
      : {};
  }catch(e){
    return {};
  }
}

function find(text,rx,hide){
  var value=t(text);
  var m=rx.exec(value);

  if(!m)return {};

  var line=value.slice(0,m.index).split(/\r?\n/).length;
  var raw=value.split(/\r?\n/)[line-1]||'';

  return {
    kind:'source',
    line:line,
    evidence:hide
      ? '[redacted credential-shaped value]'
      : raw.trim().slice(0,240)
  };
}

function detail(f,c){
  c=c||ctx();

  var p=c.latest_handoff_body_bound
    ? t(c.latest_handoff_proposed)
    : t(c.proposed);

  var d={};
  var id=f.rule_id||'';
  var path=t(c.path||'proposed file');

  if(id==='CG-CONFLICT-001'){
    d=find(p,/<<<<<<<|=======|>>>>>>>/,false);
  }else if(id==='CG-FENCE-001'){
    d=find(p,/```(?:html|javascript|js|typescript|ts|json)?/i,false);
  }else if(id==='CG-SECRET-001'){
    d=find(
      p,
      /(?:authorization\s*:\s*bearer\s+[A-Za-z0-9._~-]{12,}|sk-[A-Za-z0-9_-]{12,}|sb_secret_[A-Za-z0-9_-]{12,}|[A-Za-z0-9_]*(?:service[_ -]?role|private[_ -]?key|api[_ -]?key|secret)[A-Za-z0-9_]*\s*(?:=|:)\s*["']?[A-Za-z0-9._~-]{16,})/i,
      true
    );
  }else if(id==='CG-TIMER-001'){
    d=find(
      p,
      /setInterval\s*\([^,]+,\s*(?:[1-9]\d{0,3})\s*\)/,
      false
    );
  }else if(id==='CG-DUPLICATE-001'){
    d=find(p,/\.insert\s*\(/,false);
  }

  if(d.kind==='source'){
    d.file=path;
  }

  var fields={
    'CG-HANDOFF-MISSING':[
      'repository handoff',
      'Missing required fields',
      'Save action, repository, target path and required branch together.'
    ],
    'CG-HANDOFF-STALE-001':[
      'saved handoff',
      c.handoff_source,
      'Select and save the newest handoff.'
    ],
    'CG-HANDOFF-INCOMPLETE-001':[
      'latest handoff',
      'Incomplete',
      'Complete every required handoff field.'
    ],
    'CG-IDENTITY-004':[
      'source repository',
      c.source_repo,
      'Reload the target file from GitHub read-only.'
    ],
    'CG-IDENTITY-003':[
      'repository',
      t(c.source_repo)+' -> '+t(c.repo),
      'Use the approved repository for source and handoff.'
    ],
    'CG-IDENTITY-001':[
      'repository',
      c.repo,
      'Set the repository to trevieisking/stream-bandit.'
    ],
    'CG-IDENTITY-002':[
      'target path',
      c.path,
      'Use one repository-relative path without traversal segments.'
    ],
    'CG-TARGET-MISMATCH':[
      'target path',
      t(c.path)+' vs '+t(c.review_source_path),
      'Load the exact GitHub source for the saved path.'
    ],
    'CG-REMOVE-PROOF-001':[
      'removal notes',
      c.notes,
      'Add safety proof for the exact target path.'
    ],
    'CG-BRANCH-001':[
      'requested branch',
      c.request_branch,
      'Use a non-protected repair branch.'
    ]
  };

  if(fields[id]){
    d.kind='field';
    d.field=fields[id][0];
    d.evidence=t(fields[id][1]||'(missing)').slice(0,240);
    d.edit=fields[id][2];
  }

  var why={
    'CG-CONFLICT-001':
      'Conflict markers hide competing source versions.',

    'CG-FENCE-001':
      'Markdown fences can break the source file.',

    'CG-SECRET-001':
      'Privileged values must not enter browser-delivered source.',

    'CG-TIMER-001':
      'A short repeating timer can duplicate work while the page settles.',

    'CG-DUPLICATE-001':
      'An unconditional insert can create duplicate owner records.',

    'CG-FULLFILE-001':
      'GitHub Writer requires one complete file, not a fragment.',

    'CG-TRUNCATION-001':
      'A large size reduction can mean working sections were lost.',

    'CG-SOURCE-INTEGRITY-001':
      'The reviewed source must match a fresh GitHub read.',

    'CG-ENGINE':
      'No verdict is trustworthy without the deterministic engine.'
  };

  var edit={
    'CG-CONFLICT-001':
      'Choose the correct code and remove all conflict markers.',

    'CG-FENCE-001':
      'Delete only the opening and closing fence markers.',

    'CG-SECRET-001':
      'Remove the assigned value and read it only from protected server runtime.',

    'CG-TIMER-001':
      'Use one guarded owner, an explicit event, or a bounded retry.',

    'CG-DUPLICATE-001':
      'Update the selected row unless a deliberate new version is required.',

    'CG-FULLFILE-001':
      'Restore the complete file, then apply the intended edits.',

    'CG-TRUNCATION-001':
      'Compare original and proposed files and restore unrelated sections.',

    'CG-SOURCE-INTEGRITY-001':
      'Reload the exact file from GitHub read-only.',

    'CG-ENGINE':
      'Reload Code God and stop before GitHub Writer if it still fails.'
  };

  if(
    !d.kind&&(
      id==='CG-FULLFILE-001'||
      id==='CG-TRUNCATION-001'||
      id==='CG-SOURCE-INTEGRITY-001'||
      id==='CG-ENGINE'
    )
  ){
    d.kind='file';
    d.file=id==='CG-ENGINE'
      ? 'assets/code-god-review-v200.js'
      : path;
    d.evidence=f.message;
  }

  d.why=why[id]||f.message;
  d.edit=d.edit||edit[id]||f.correction;

  return Object.assign({},f,d);
}

function decorate(r,c){
  r=r||{};

  r.findings=(r.findings||[]).map(function(f){
    return detail(f,c);
  });

  last=r;
  window.CodeGodLatestReviewV239=r;

  return r;
}

function wrap(){
  if(
    wrapped||
    !window.CodeGodReviewV200||
    !window.CodeGodReviewV200.review
  ){
    return false;
  }

  var old=window.CodeGodReviewV200.review;

  window.CodeGodReviewV200.review=function(c){
    return decorate(old(c),c||ctx());
  };

  wrapped=true;
  return true;
}

function loc(f){
  if(f.kind==='source'){
    return (f.file||'proposed file')+' · line '+f.line;
  }

  if(f.kind==='field'){
    return 'Handoff field · '+f.field;
  }

  return f.file||'Proposed file';
}

function report(f){
  return [
    f.severity+' · '+f.rule_id,
    'Location: '+loc(f),
    'Found: '+(f.evidence||'See finding.'),
    'Why: '+(f.why||f.message),
    'Suggested correction: '+(f.edit||f.correction)
  ].join('\n');
}

function state(x,msg){
  var b=q('#cgConsoleStateV239');
  var p=q('#cgConsoleMessageV239');
  var run=q('#cgRun');
  var copy=q('#cgCopyReviewV239');
  var s=t(x||'READY').replace('_',' ');

  if(b){
    b.textContent=s;
    b.className='badge '+(
      s==='PASS'
        ? 'good'
        : s==='BLOCK'
          ? 'bad'
          : s==='FIX FIRST'
            ? 'warn'
            : ''
    );
  }

  if(p){
    p.textContent=msg||'';
  }

  if(run){
    run.disabled=s==='REVIEWING';
    run.textContent=s==='REVIEWING'
      ? 'Reviewing…'
      : 'Run Code God Review';

    run.setAttribute(
      'aria-busy',
      s==='REVIEWING'?'true':'false'
    );
  }

  if(copy){
    copy.disabled=!last;
  }
}

function consoleBox(){
  var run=q('#cgRun');

  if(!run)return;

  var box=q('#cgConsoleV239');

  if(!box){
    box=document.createElement('div');
    box.id='cgConsoleV239';
    box.className='notice cgConsoleV239';
    box.setAttribute('role','status');
    box.setAttribute('aria-live','polite');

    box.innerHTML=
      '<div class="cgConsoleHead">'+
        '<b>Code God Console</b>'+
        '<span id="cgConsoleStateV239" class="badge">READY</span>'+
      '</div>'+
      '<p id="cgConsoleMessageV239">'+
        'Context loaded. Run the deterministic review when ready.'+
      '</p>'+
      '<div class="actions">'+
        '<button class="btn ghost" '+
          'id="cgCopyReviewV239" '+
          'type="button" disabled>'+
          'Copy full review'+
        '</button>'+
      '</div>';

    run.parentNode.parentNode.insertBefore(
      box,
      run.parentNode
    );
  }

  var c=q('#cgCopyReviewV239');

  if(c&&!c.dataset.bound){
    c.dataset.bound='1';

    c.onclick=function(){
      if(!last)return;

      cp(
        ['Code God '+last.outcome]
          .concat((last.findings||[]).map(report))
          .join('\n\n')
      ).then(function(){
        c.textContent='Copied';

        setTimeout(function(){
          c.textContent='Copy full review';
        },1200);
      });
    };
  }
}

function openResult(){
  var b=q(
    '#clProductTabsV227 '+
    '.clProductTab[data-group="guidance"]'
  );

  if(
    b&&
    b.getAttribute('aria-selected')!=='true'
  ){
    b.click();
  }
}

function enhance(){
  var root=q('#cgFindings');

  if(!root)return;

  var c=ctx();
  var cards=a('.item',root);

  cards.forEach(function(card,i){
    if(q('.cgActionableV239',card))return;

    var f=
      last&&
      last.findings&&
      last.findings[i];

    if(!f){
      var h=t(
        q('b',card)&&q('b',card).textContent
      ).split('·');

      var ps=a('p',card);

      f=detail({
        severity:t(h[0]).trim(),
        rule_id:t(h[1]).trim(),
        message:t(ps[0]&&ps[0].textContent),
        correction:t(
          ps[1]&&ps[1].textContent
        ).replace(/^Correction:\s*/i,'')
      },c);
    }

    var box=document.createElement('div');
    box.className='cgActionableV239';

    [
      ['Location',loc(f)],
      [
        'Found',
        f.evidence||
        'See complete proposed file.'
      ],
      ['Why',f.why||f.message],
      [
        'Suggested correction',
        f.edit||f.correction
      ]
    ].forEach(function(x){
      var p=document.createElement('p');
      var b=document.createElement('b');

      b.textContent=x[0]+': ';

      p.appendChild(b);
      p.appendChild(
        document.createTextNode(
          x[1]||'Not available'
        )
      );

      box.appendChild(p);
    });

    var btn=document.createElement('button');
    btn.type='button';
    btn.className='btn ghost';
    btn.textContent='Copy suggested correction';

    btn.onclick=function(){
      cp(report(f));
    };

    box.appendChild(btn);
    card.appendChild(box);
  });
}

function sync(){
  var s=t(
    q('#cgStatus')&&
    q('#cgStatus').textContent
  ).trim().toUpperCase();

  if(!s||s==='READY'){
    state(
      'READY',
      'Context loaded. Run the deterministic review when ready.'
    );
    return;
  }

  if(s==='PASS'){
    state(
      'PASS',
      'Review passed. GitHub Writer is unlocked for this exact saved context.'
    );
  }else if(s==='BLOCK'){
    state(
      'BLOCK',
      'Blocking findings were found. Review exact locations and corrections.'
    );
  }else if(
    s==='FIX_FIRST'||
    s==='FIX FIRST'
  ){
    state(
      'FIX FIRST',
      'Correct the findings before GitHub Writer.'
    );
  }else{
    return;
  }

  clearTimeout(timer);
  enhance();
  openResult();
}

function start(){
  last=null;

  state(
    'REVIEWING',
    'Checking handoff identity, source integrity, complete-file safety and deterministic code rules…'
  );

  clearTimeout(timer);

  timer=setTimeout(function(){
    var value=t(
      q('#cgStatus')&&
      q('#cgStatus').textContent
    ).trim().toUpperCase();

    if(value==='READY'){
      state(
        'READY',
        'The review did not complete. Reload Code God and retry.'
      );
    }
  },20000);
}

function bind(){
  var run=q('#cgRun');

  if(run&&!run.dataset.v239){
    run.dataset.v239='1';
    run.addEventListener(
      'click',
      start,
      true
    );
  }

  if(obs){
    obs.disconnect();
  }

  obs=new MutationObserver(function(){
    sync();
    enhance();
  });

  var s=q('#cgStatus');
  var f=q('#cgFindings');

  if(s){
    obs.observe(s,{
      childList:true,
      subtree:true,
      characterData:true
    });
  }

  if(f){
    obs.observe(f,{
      childList:true,
      subtree:true
    });
  }
}

function style(){
  if(q('#cgConsoleV239Style'))return;

  var s=document.createElement('style');
  s.id='cgConsoleV239Style';

  s.textContent=
    '.cgConsoleV239{margin:12px 0}'+
    '.cgConsoleHead{display:flex;align-items:center;'+
      'justify-content:space-between;gap:10px}'+
    '.cgConsoleV239 p{margin:7px 0 0}'+
    '.cgActionableV239{margin-top:12px;'+
      'padding-top:12px;'+
      'border-top:1px solid var(--line);'+
      'display:grid;gap:6px}'+
    '.cgActionableV239 p{margin:0;overflow-wrap:anywhere}'+
    '.cgActionableV239 .btn{justify-self:start;margin-top:4px}';

  document.head.appendChild(s);
}

function boot(){
  if(
    !document.body||
    document.body.dataset.page!=='code-god'
  ){
    return;
  }

  style();
  consoleBox();
  bind();

  if(!wrap()){
    setTimeout(boot,40);
  }

  sync();

  window.CodeGodConsoleV239={
    version:V,
    sync:sync,
    enhance:enhance
  };
}

if(document.readyState==='loading'){
  document.addEventListener(
    'DOMContentLoaded',
    boot,
    {once:true}
  );
}else{
  boot();
}
})();
