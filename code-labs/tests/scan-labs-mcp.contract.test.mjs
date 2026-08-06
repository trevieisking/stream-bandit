import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);
const mainPath = new URL("supabase/functions/code-labs-mcp-stub/main.ts", root);
const scanPath = new URL("supabase/functions/code-labs-mcp-stub/scan-labs.ts", root);

async function sources() {
  const [main, scan] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(scanPath, "utf8"),
  ]);
  return { main, scan };
}

test("MCP stub registers and dispatches the dedicated Scan Labs tool", async () => {
  const { main } = await sources();
  assert.match(main, /import \{ scanCodeLabsRepository \} from "\.\/scan-labs\.ts";/);
  assert.match(main, /name: "scan_code_labs_repository"/);
  assert.match(main, /title: "Scan Repository with Scan Labs"/);
  assert.match(main, /if \(name === "scan_code_labs_repository"\) return scanCodeLabsRepository\(b, args\);/);
  assert.match(main, /Scan Labs is the optional early, unnumbered, whole-repository read-only reconnaissance tool/);
});

test("Scan Labs remains separate from CG Repair Lab and requires no selected path", async () => {
  const { main, scan } = await sources();
  const toolStart = main.indexOf('{ name: "scan_code_labs_repository"');
  const nextTool = main.indexOf('\n    { name:', toolStart + 10);
  const tool = main.slice(toolStart, nextTool > toolStart ? nextTool : undefined);
  assert.match(tool, /required: \["repo"\]/);
  assert.doesNotMatch(tool, /required: \["repo", "path"\]/);
  assert.match(tool, /whole-repository/);
  assert.match(main, /name: "analyze_code_labs_repository"/);
  assert.match(scan, /tool: "scan_code_labs_repository"/);
  assert.match(scan, /feature: "Scan Labs"/);
  assert.match(scan, /repair_authority: false/);
  assert.match(scan, /promotion_authority: false/);
});

test("Scan Labs binds every report to an exact commit and recursive tree", async () => {
  const { scan } = await sources();
  assert.match(scan, /\/commits\/" \+ encodeURIComponent\(requestedRef\)/);
  assert.match(scan, /\/git\/trees\/" \+ encodeURIComponent\(treeSha\) \+ "\?recursive=1"/);
  assert.match(scan, /resolved_commit_sha: commitSha/);
  assert.match(scan, /resolved_tree_sha: treeSha/);
  assert.match(scan, /exact_commit_bound: true/);
  assert.match(scan, /tree\?\.truncated === true/);
});

test("Scan Labs enforces whole-repository limits and fails closed", async () => {
  const { scan } = await sources();
  assert.match(scan, /const MAX_FILES = 2000;/);
  assert.match(scan, /const MAX_FILE_SIZE = 750000;/);
  assert.match(scan, /const MAX_TOTAL_BYTES = 18000000;/);
  assert.match(scan, /eligible\.length > MAX_FILES/);
  assert.match(scan, /totalDeclaredBytes > MAX_TOTAL_BYTES/);
  assert.match(scan, /if \(failed\.length\) throw new Error/);
  assert.match(scan, /No readiness result was produced/);
});

test("Scan Labs excludes protected and generated paths and redacts credentials", async () => {
  const { scan } = await sources();
  assert.match(scan, /const PROTECTED_PATH =/);
  assert.match(scan, /const GENERATED_PATH =/);
  assert.match(scan, /\[redacted-credential-shaped-value\]/);
  assert.match(scan, /skipped_protected_paths: skippedProtectedPaths/);
  assert.match(scan, /skipped_generated_paths: skippedGeneratedPaths/);
  assert.match(scan, /credentials_redacted: true/);
  assert.match(scan, /protected_paths_excluded: true/);
});

test("Scan Labs is owner-scoped, paginated, and has no workflow or write authority", async () => {
  const { main, scan } = await sources();
  assert.match(scan, /verifyOwnerRepository\(binding\.owner_id, repo, \{ contents: "read", metadata: "read" \}\)/);
  assert.match(scan, /const MAX_LIMIT = 500;/);
  assert.match(scan, /function paginate\(/);
  assert.match(scan, /workflow_state_written: false/);
  assert.match(scan, /wrote_database: false/);
  assert.match(scan, /wrote_github: false/);
  assert.match(scan, /opened_pr: false/);
  assert.match(scan, /deployed: false/);
  assert.match(scan, /code_god_run: false/);
  assert.match(scan, /writer_queued: false/);
  assert.match(scan, /promotion_decided: false/);
  assert.doesNotMatch(scan, /from "\.\/guarded-workspace\.ts"/);
  assert.doesNotMatch(scan, /saveRequest|saveCandidate|updateCurrentFile|executeDirectGithubWriter/);
  assert.match(main, /cannot change workflow state, repair source, run Code God, queue Writer, commit, merge, deploy, or decide promotion/);
});
