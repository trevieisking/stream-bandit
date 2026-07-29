import { readFile, writeFile } from 'node:fs/promises';

async function change(path, transform) {
  const before = await readFile(path, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`No asserted change applied to ${path}`);
  await writeFile(path, after);
}

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first === -1) throw new Error(`Missing asserted source for ${label}`);
  if (source.indexOf(from, first + from.length) !== -1) throw new Error(`Ambiguous asserted source for ${label}`);
  return source.slice(0, first) + to + source.slice(first + from.length);
}

await change('code-labs/assets/code-labs-v12-save.js', (source) =>
  replaceOnce(
    source,
    'function run(){compactStyle();ensureFavicon();simplifyMenu();updatePageChrome();',
    'function run(){compactStyle();ensureFavicon();updatePageChrome();',
    'V12 sidebar handoff',
  )
);

await change('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md', (source) => {
  let next = replaceOnce(
    source,
    '| 1 | File Lab | `code-labs/file-lab.html` | Load or read the full current file | Main workflow start. |',
    '| 1 | File Lab | `code-labs/file-lab.html` | Load or read the full current file | Main workflow start. |\n| 1A | Saved Files | `code-labs/saved-files.html` | Select an existing saved file without creating a competing file owner | Bounded source-selection support inside the canonical workflow. |',
    'Saved Files role',
  );
  next = replaceOnce(
    next,
    '| Context Packet | `code-labs/context-packet.html` | Assistant context packet support | Keep as support/proof page. |',
    '| Context Packet | `code-labs/context-packet.html` | Assistant context packet support | Keep as support/proof page. |\n| Buddy Tools | `code-labs/help.html` specialist-tools drawer | Assistant utilities, memory recovery, and bounded local helpers | Keep discoverable; never become a second workflow engine. |',
    'Buddy Tools discoverability',
  );
  return replaceOnce(
    next,
    '# Code Labs Page Role Register V147/V148/V163/V244',
    '# Code Labs Page Role Register V147/V148/V163/V244\n\n**Visible route owner:** V282 shared shell loader.',
    'V282 owner declaration',
  );
});

await change('code-labs/assets/code-labs-v18-fix-wizard.js', (source) => {
  let next = replaceOnce(source, "var KEY='codeLabsV1State';", "var KEY='codeLabsV1State', ROLE='support_only';", 'Fix Wizard role');
  next = replaceOnce(next, 'function nextStep(s){', 'function supportNextStep(s){var policy=window.CodeLabsWorkflowNextStepPolicy;if(policy&&typeof policy.nextStep===\'function\')return policy.nextStep(s);', 'Fix Wizard shared policy');
  return next.replaceAll('nextStep(s)', 'supportNextStep(s)');
});

await change('code-labs/assets/code-labs-v19-start-guide.js', (source) => {
  let next = replaceOnce(source, "var KEY='codeLabsV1State';", "var KEY='codeLabsV1State', DRAFT_KEY='codeLabsStartGuideDraft', ROLE='draft_fields';", 'Start Guide role');
  next = replaceOnce(
    next,
    "function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}}",
    "function state(){try{var base=JSON.parse(localStorage.getItem(KEY)||'{}')||{},draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')||{};return Object.assign({},base,draft,{project:Object.assign({},base.project||{},draft.project||{}),file:Object.assign({},base.file||{},draft.file||{})})}catch(e){return{}}}",
    'Start Guide draft overlay',
  );
  return replaceOnce(next, "function saveState(s){localStorage.setItem(KEY,JSON.stringify(s||{}))}", "function saveState(s){localStorage.setItem(DRAFT_KEY,JSON.stringify(s||{}))}", 'Start Guide draft save');
});

await change('code-labs/assets/cl-nav.js', (source) => {
  let next = replaceOnce(
    source,
    "var SPECIAL_REVIEW_PAGES={'code-god':true,'cg-repair-lab':true};",
    "var SPECIAL_REVIEW_PAGES={'code-god':true,'cg-repair-lab':true};\nvar BUDDY_BRIDGE_MODES={index:'read_only_context',setup:'draft_fields','project-picker':'draft_fields','file-lab':'assisted_page_fields','saved-files':'assisted_page_fields','rescue-room':'assisted_page_fields','packet-builder':'assisted_page_fields','buddy-canvas':'assisted_page_fields',v20:'read_only_context','patch-desk':'assisted_page_fields','patch-lab':'assisted_page_fields','preview-test':'read_only_context',checkpoints:'protected_action_only','repo-desk':'protected_action_only','cg-repair-lab':'read_only_context','code-god':'protected_action_only','publish-prep':'protected_action_only','github-tracker':'read_only_context',help:'read_only_context'};",
    'Buddy Bridge modes',
  );
  return replaceOnce(next, "specialReview:Object.keys(SPECIAL_REVIEW_PAGES)}};", "specialReview:Object.keys(SPECIAL_REVIEW_PAGES),buddyBridgeModes:BUDDY_BRIDGE_MODES}};", 'Buddy Bridge mode export');
});

await change('code-labs/assets/code-labs-checklist-builder.js', (source) => {
  let next = replaceOnce(
    source,
    "var KEY='codeLabsChecklistBuilder';",
    "var KEY='codeLabsChecklistBuilder';\nvar REPAIR_CONTEXT_FIELDS=['operation_id','expected_state_version','repository','branch','target_file','source_hash','candidate_hash','page','page_role','requested_action','preserved_capabilities','affected_helpers','dependencies','authentication','owner_scope','entitlement','database_boundary','browser_boundary','github_boundary','rollback','replay','fencing_tests','cg_repair_lab_findings','code_god_findings','evidence_source','required','performed','passed','failed','not_run','user_checks'];",
    'repair-specific checklist fields',
  );
  next = replaceOnce(
    next,
    "function state(){return {title:val('#clChecklistTitle')||'Code Labs live checklist',page:val('#clChecklistPage')||'code-labs/index.html',goal:val('#clChecklistGoal')||'Promote a safe Code Labs page',notes:val('#clChecklistNotes'),items:checks()}}",
    "function state(){return {title:val('#clChecklistTitle')||'Code Labs live checklist',page:val('#clChecklistPage')||'code-labs/index.html',goal:val('#clChecklistGoal')||'Promote a safe Code Labs page',notes:val('#clChecklistNotes'),items:checks(),repair_context_fields:REPAIR_CONTEXT_FIELDS,user_checks:selected()}}",
    'checklist state context',
  );
  return replaceOnce(
    next,
    "'Rules','- Keep Code Labs separate from Stream Bandit app/auth/database files.'",
    "'Repair evidence fields: '+REPAIR_CONTEXT_FIELDS.join(', '),'','Rules','- Keep Code Labs separate from Stream Bandit app/auth/database files.'",
    'checklist report context',
  );
});

console.log('Applied assertion-guarded Code Labs V50 single-owner repairs.');
