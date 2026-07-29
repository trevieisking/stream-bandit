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

await change('code-labs/CODE_LABS_PAGE_ROLE_REGISTER_V147.md', (source) =>
  replaceOnce(
    source,
    '| 10 | Repo Desk | `code-labs/repo-desk.html` | Choose repo handoff/action | Main workflow. |',
    '| 10 | Repo Desk | `code-labs/repo-desk.html` | Choose repo handoff/action | Main workflow. |\n| 10A | CG Repair Lab | `code-labs/cg-repair-lab.html` | Read-only repair analysis and evidence preparation | Specialist gate; never owns workflow state or GitHub execution. |\n| 10B | Code God | `code-labs/code-god.html` | Deterministic final review | Sole final-review owner; cannot merge or deploy. |',
    'special review route registration',
  )
);

await change('code-labs/v20.html', (source) =>
  replaceOnce(
    source,
    '<noscript><main style="padding:20px;font-family:system-ui"><h1>Code Labs Workflow Hub</h1><p>This page needs JavaScript.</p></main></noscript>',
    '<noscript><main style="padding:20px;font-family:system-ui"><h1>Code Labs Workflow Hub</h1><p>This page needs JavaScript.</p></main></noscript>\n<script>window.CodeLabsWorkflowNextStepPolicy=window.CodeLabsWorkflowNextStepPolicy||{nextStep:function(state){var s=state||{},f=s.file||{},p=s.project||{};if(!(p.siteName||p.repo||p.siteUrl))return "Open Setup next.";if(!f.currentCode)return "Open File Lab and load the complete source.";if(!f.problem)return "Open Rescue Room and record the problem and preserve rules.";if(!f.packet)return "Open Packet Builder and build the exact repair context.";if(!f.fixedCode)return "Use Buddy Canvas, Patch Desk, or Patch Lab for the selected repair route.";return "Continue through Preview + Test, Checkpoints, Repo Desk, Code God, GitHub Writer, and GitHub Tracker.";}};</script>',
    'Workflow Hub shared policy',
  )
);

await change('code-labs/assets/code-labs-v15-handoff.js', (source) =>
  replaceOnce(source, "var KEY='codeLabsV1State';", "var KEY='codeLabsV1State', ROLE='read_only_context';", 'AI Handoff role')
);

console.log('Applied remaining V50 page-owner repairs.');
