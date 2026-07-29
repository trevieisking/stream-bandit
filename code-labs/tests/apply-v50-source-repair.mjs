import { readFile, writeFile } from 'node:fs/promises';

const path = 'supabase/functions/code-labs-mcp-stub/github-writer.ts';
const before = await readFile(path, 'utf8');
const from = `      const reconciliation = reconcileExistingCommit(
        reconciledSha,
        createdCommitSha,
        plan.expected_parent_sha,
      );
      if (reconciliation === "applied") {
        // GitHub applied the ref update but the original response was lost.
      } else if (reconciliation === "no_write") {
        stage = "ref_update_no_write";
        throw error;
      } else {
        stage = "ref_update_conflict";
        throw new Error("The branch head changed before the reviewed commit could be applied.");
      }
`;
const to = `      if (reconciledSha === createdCommitSha) {
        // GitHub applied the ref update but the original response was lost.
      } else if (reconciledSha === plan.expected_parent_sha) {
        stage = "ref_update_no_write";
        throw error;
      } else {
        stage = "ref_update_conflict";
        throw new Error("The branch head changed before the reviewed commit could be applied.");
      }
`;
const first = before.indexOf(from);
if (first === -1) throw new Error('Exact Writer reconciliation block not found.');
if (before.indexOf(from, first + from.length) !== -1) throw new Error('Writer reconciliation block is ambiguous.');
const after = before.slice(0, first) + to + before.slice(first + from.length);
await writeFile(path, after);
console.log('Applied explicit Writer reconciliation branch repair.');
