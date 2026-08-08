import {
  getCgRepairLabWorkflow,
  scanRepositorySnapshot,
} from "./cg-repair-lab.ts";
import { cleanRepository } from "./github-authority.ts";
import { listActions } from "./guarded-workspace.ts";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

Deno.test("CG Repair Lab maps dependencies, database calls, and exact secret references without writing", async () => {
  const report = await scanRepositorySnapshot({
    repo: "owner/example",
    ref: "verified-commit",
    selected_path: "index.html",
    manifest_paths: [
      "index.html",
      "assets/app.js",
      "assets/shared.js",
      "assets/logo.png",
      "supabase/migrations/schema.sql",
    ],
    coverage_complete: true,
    files: [
      {
        path: "index.html",
        content: [
          "<!doctype html>",
          '<html data-page="home">',
          '<script src="assets/app.js"></script>',
          '<script src="assets/app.js"></script>',
          '<img src="assets/logo.png" alt="Example">',
          '<div id="duplicate"></div>',
          '<div id="duplicate"></div>',
          "</html>",
        ].join("\n"),
      },
      {
        path: "assets/app.js",
        content: [
          'const clientKey = Deno.env.get("SB_CLIENT_KEY");',
          "createClient(projectUrl, clientKey);",
          "function sharedHelper() { return true; }",
          'client.from("sb_pages").select("*");',
          'client.from("sb_pages").update({ title: "Safe title" });',
          'client.functions.invoke("render-page");',
        ].join("\n"),
      },
      {
        path: "assets/shared.js",
        content: "function sharedHelper() { return false; }",
      },
      {
        path: "supabase/migrations/schema.sql",
        content:
          "create table if not exists public.sb_pages (id bigint primary key);",
      },
    ],
  });

  assert(
    report.outcome === "CANDIDATE_READY",
    "A deterministic duplicate-only candidate should be proposed.",
  );
  assert(report.read_only === true, "Analysis must be read-only.");
  assert(
    report.wrote_database === false,
    "Analysis must not write a database.",
  );
  assert(report.wrote_github === false, "Analysis must not write GitHub.");
  assert(
    report.replaced_selected_source === false,
    "Analysis must not replace the selected source.",
  );
  assert(
    report.proposed_complete_file_candidate?.split('src="assets/app.js"')
      .length === 2,
    "The proposed complete file should keep one exact script include.",
  );
  assert(
    report.findings.some((item) => item.rule_id === "CGRL-DUPLICATE-ID-001"),
    "Duplicate DOM ids should be reported.",
  );
  assert(
    !report.debug_report.missing_dependencies.some((item) =>
      item.target === "assets/logo.png"
    ),
    "Existing non-source assets should satisfy dependency existence checks.",
  );
  assert(
    report.debug_report.duplicate_symbols.some((item) =>
      item.name === "sharedHelper"
    ),
    "Duplicate cross-file symbols should be mapped.",
  );
  assert(
    report.database_map.tables.some((item: Record<string, any>) =>
      item.name === "sb_pages" && item.write_call_sites.length === 1
    ),
    "Table write call sites should be mapped.",
  );
  assert(
    report.database_map.edge_functions.some((item: Record<string, any>) =>
      item.name === "render-page"
    ),
    "Edge Function call sites should be mapped.",
  );
  const secret = report.secret_reference_map.find((item) =>
    item.name === "SB_CLIENT_KEY"
  );
  assert(
    secret?.reference === 'Deno.env.get("SB_CLIENT_KEY")',
    "The exact environment reference should be reported.",
  );
  assert(
    secret?.call_sites.some((item) =>
      item.expression === "createClient(… clientKey …)"
    ),
    "The downstream call using the key alias should be included.",
  );
});

Deno.test("CG Repair Lab fails closed when repository coverage is incomplete", async () => {
  const report = await scanRepositorySnapshot({
    repo: "owner/example",
    ref: "verified-commit",
    selected_path: "index.html",
    manifest_paths: ["index.html"],
    files: [{ path: "index.html", content: '<html data-page="home"></html>' }],
    coverage_complete: false,
    skipped_paths: ["bounded coverage"],
  });

  assert(
    report.outcome === "SAFE_FAILURE",
    "Incomplete coverage must not be presented as a complete scan.",
  );
  assert(report.ok === false, "Incomplete coverage must fail closed.");
  assert(report.code_god_required === true, "Code God must remain required.");
  assert(
    report.github_writer_required === true,
    "GitHub Writer must remain required.",
  );
});

Deno.test("CG Repair Lab preserves exact bracket and global secret references without resolving them", async () => {
  const report = await scanRepositorySnapshot({
    repo: "owner/example",
    ref: "verified-commit",
    selected_path: "app.ts",
    manifest_paths: ["app.ts"],
    coverage_complete: true,
    files: [{
      path: "app.ts",
      content: [
        'const serverToken = process.env["SERVER_TOKEN_NAME"];',
        "callProvider(serverToken);",
        "const browserReference = globalThis.SB_SECRET_KEY_CALL;",
      ].join("\n"),
    }],
  });

  const processReference = report.secret_reference_map.find((item) =>
    item.name === "SERVER_TOKEN_NAME"
  );
  const globalReference = report.secret_reference_map.find((item) =>
    item.name === "SB_SECRET_KEY_CALL"
  );
  assert(
    processReference?.reference === 'process.env["SERVER_TOKEN_NAME"]',
    "Bracket environment access should retain its exact safe call expression.",
  );
  assert(
    processReference?.call_sites.some((item) =>
      item.expression === "callProvider(… serverToken …)"
    ),
    "The safe alias call site should be included.",
  );
  assert(
    globalReference?.reference === "globalThis.SB_SECRET_KEY_CALL",
    "The globalThis reference must not be rewritten as a window reference.",
  );
});

Deno.test("CG Repair Lab publishes guarded workflow availability without promoting Repair Lab or Code God authority", () => {
  const workflow = getCgRepairLabWorkflow();
  const controls = workflow.controls as Array<Record<string, any>>;
  assert(
    workflow.trust_state === "HOLD_UNTRUSTED_ADVISORY" &&
      workflow.authoritative_use === false,
    "Repair Lab must remain advisory and held from independent authoritative use.",
  );
  assert(
    String(workflow.availability_semantics || "").includes("callable") &&
      String(workflow.availability_semantics || "").includes("never grants"),
    "Workflow metadata must distinguish guarded availability from authority.",
  );
  for (const action of ["cg_repair_lab.access", "cg_repair_lab.analyze"]) {
    assert(
      controls.some((item) =>
        item.tool === "run_code_labs_action" &&
        item.action === action &&
        item.enabled === true &&
        item.writes === false
      ),
      `The read-only Repair Lab action must remain enabled: ${action}`,
    );
  }
  const candidateControl = controls.find((item) =>
    item.control === "save_separate_candidate"
  );
  assert(
    candidateControl?.tool === "save_code_labs_candidate" &&
      candidateControl?.enabled === true &&
      candidateControl?.owner_control === true &&
      candidateControl?.repair_lab_authority === false &&
      candidateControl?.replaces_selected_source === false &&
      candidateControl?.requires_complete_file_candidate === true,
    "Candidate saving must be an available guarded owner control outside Repair Lab authority.",
  );
  const handoff = controls.find((item) =>
    item.control === "prepare_code_god_handoff"
  );
  assert(
    handoff?.enabled === true &&
      handoff?.authoritative_use === false &&
      handoff?.requires_verified_provenance === true &&
      handoff?.requires_existing_non_protected_branch === true,
    "Code God handoff must be callable only through verified branch/provenance gates.",
  );
  const codeGod = controls.find((item) => item.control === "run_code_god");
  assert(
    codeGod?.enabled === true &&
      codeGod?.code_god_advisory_only === true &&
      codeGod?.cannot_self_certify === true,
    "Code God may be callable but must remain bounded, advisory, and unable to self-certify.",
  );
  const writerPrepare = controls.find((item) =>
    item.control === "queue_writer_request"
  );
  assert(
    writerPrepare?.enabled === true &&
      writerPrepare?.requires_code_god_pass === true &&
      writerPrepare?.requires_independent_evidence_receipt === true &&
      writerPrepare?.requires_existing_non_protected_branch === true,
    "Writer preparation must stay behind Code God, independent evidence, and branch proof.",
  );
  const writerControl = controls.find((item) =>
    item.control === "execute_reviewed_writer"
  );
  assert(
    writerControl?.enabled === true &&
      writerControl?.repair_lab_authority === false &&
      writerControl?.requires_code_god_pass === true &&
      writerControl?.requires_independent_evidence_receipt === true &&
      writerControl?.requires_validated_queued_request === true,
    "Writer execution must remain a separate guarded owner requiring validated review and evidence.",
  );
  const checkpoint = workflow.independent_checkpoint_contract as Record<string, any>;
  assert(
    checkpoint?.kind === "master-checklist-independent-gate-v1" &&
      checkpoint?.tool === "create_code_labs_checkpoint" &&
      checkpoint?.generic_prose_checkpoint_writer_valid === false &&
      checkpoint?.writer_revalidates_at_prepare === true &&
      checkpoint?.writer_revalidates_at_execute === true &&
      Array.isArray(checkpoint?.required_bindings) &&
      checkpoint.required_bindings.length >= 8,
    "Workflow guidance must publish the actual strict Writer-independent checkpoint contract.",
  );
  assert(
    !controls.some((item) => item.action === "cg_repair_lab.save_candidate"),
    "The removed Repair Lab mutation alias must not be published as a workflow action.",
  );
  assert(
    workflow.prohibited.includes("candidate.accept") &&
      workflow.prohibited.includes("direct default-branch write") &&
      workflow.prohibited.includes("merge") &&
      workflow.prohibited.includes("deploy"),
    "CGRL workflow guidance must continue to prohibit authority and protected production mutations.",
  );
  const repairActions = (listActions().actions as Array<Record<string, any>>)
    .map((item) => String(item.action || ""))
    .filter((action) => action.startsWith("cg_repair_lab."));
  assert(
    repairActions.length === 2 &&
      repairActions.includes("cg_repair_lab.access") &&
      repairActions.includes("cg_repair_lab.analyze"),
    "The public Repair Lab namespace must contain only its two read-only actions.",
  );
});

Deno.test("repository validation accepts arbitrary owner/name repositories", () => {
  assert(
    cleanRepository("example-owner/example-repository") ===
      "example-owner/example-repository",
    "Repository validation must not hard-code one project.",
  );
  let rejected = false;
  try {
    cleanRepository("not a repository URL");
  } catch {
    rejected = true;
  }
  assert(rejected, "Unsafe repository identities must be rejected.");
});

Deno.test("current owner activation is explicit and separate from analysis", () => {
  const actions = listActions().actions as Array<Record<string, any>>;
  assert(
    actions.some((item) =>
      item.action === "code_labs.owner_activate_repository" &&
      item.requires_confirmation === true
    ),
    "Interim owner activation must be a confirmed control action.",
  );
  const workflow = getCgRepairLabWorkflow();
  assert(
    !workflow.controls.some((item: Record<string, any>) =>
      item.action === "code_labs.owner_activate_repository"
    ),
    "Owner activation must not be part of the read-only analysis workflow.",
  );
});

Deno.test("publishable configuration and detector literals are not urgent findings", async () => {
  const publishable = "sb_" + "publishable_" + "TESTCONFIG1234567890";
  const report = await scanRepositorySnapshot({
    repo: "owner/example",
    ref: "verified-commit",
    selected_path: "index.html",
    manifest_paths: ["index.html", "detector.ts"],
    coverage_complete: true,
    files: [
      {
        path: "index.html",
        content:
          '<!doctype html><html data-page="test"><script>const publicConfig="' +
          publishable + '";</script></html>',
      },
      {
        path: "detector.ts",
        content: 'const conflictPattern = /<<<<<<<|=======|>>>>>>>/;',
      },
    ],
  });
  const urgent = report.findings.filter((item) =>
    item.severity === "P0" || item.severity === "P1"
  );
  assert(
    urgent.length === 0,
    "Publishable configuration and detector literals must not become urgent findings.",
  );
});

Deno.test("genuine secret shapes and line-anchored conflict markers still block", async () => {
  const secret = "sb_" + "secret_" + "TESTSECRET1234567890";
  const report = await scanRepositorySnapshot({
    repo: "owner/example",
    ref: "verified-commit",
    selected_path: "index.html",
    manifest_paths: ["index.html", "conflicted.js"],
    coverage_complete: true,
    files: [
      {
        path: "index.html",
        content:
          '<!doctype html><html data-page="test"><script>const unsafe="' +
          secret + '";</script></html>',
      },
      {
        path: "conflicted.js",
        content: "<<<<<<< ours\nconst value = 1;\n=======\nconst value = 2;\n>>>>>>> theirs",
      },
    ],
  });
  assert(
    report.findings.some((item) =>
      item.rule_id === "CGRL-CREDENTIAL-VALUE-001" &&
      item.path === "index.html"
    ),
    "A genuine secret-key shape must remain blocked.",
  );
  assert(
    report.findings.some((item) =>
      item.rule_id === "CGRL-CONFLICT-001" &&
      item.path === "conflicted.js"
    ),
    "Actual line-anchored conflict markers must remain blocked.",
  );
});

function governanceFixture(extraFiles: Array<{ path: string; content: string }>) {
  return scanRepositorySnapshot({
    repo: "owner/example",
    ref: "verified-commit",
    selected_path: "code-labs/assets/cl-nav.js",
    manifest_paths: extraFiles.map((file) => file.path),
    coverage_complete: true,
    files: extraFiles,
  });
}

Deno.test("CG Repair Lab blocks duplicate workflow navigation and Repo Desk handoff owners", async () => {
  const report = await governanceFixture([
    {
      path: "code-labs/assets/cl-nav.js",
      content: 'function render(){nav.innerHTML="canonical";} window.location.assign("cg-repair-lab.html");',
    },
    {
      path: "code-labs/assets/legacy-route-owner.js",
      content: 'function rewrite(){nav.innerHTML="legacy";} window.location.assign("cg-repair-lab.html");',
    },
  ]);
  const rules = report.findings.map((item) => item.rule_id);
  assert(
    rules.includes("CGRL-OWNERSHIP-COLLISION-001"),
    "Two visible navigation rebuilders must be a P1 ownership collision.",
  );
  assert(
    rules.includes("CGRL-HANDOFF-OWNER-COLLISION-001"),
    "Two independent Repo Desk-to-CGRL routers must be a P1 handoff collision.",
  );
  assert(
    report.debug_report.governance_contracts.navigation_owners.length === 2 &&
      report.debug_report.governance_contracts.repo_handoff_owners.length === 2,
    "The governance evidence must name both competing owners.",
  );
});

Deno.test("CG Repair Lab does not false-block one canonical owner with a passive routeRepoDesk delegate", async () => {
  const report = await governanceFixture([
    {
      path: "code-labs/assets/cl-nav.js",
      content: 'function render(){nav.innerHTML="canonical";} window.location.assign("cg-repair-lab.html");',
    },
    {
      path: "code-labs/assets/advisory-helper.js",
      content: [
        'function routeRepoDesk(context){return context && context.next;}',
        'function decorate(){document.body.dataset.routeHint="cg-repair-lab";}',
        'const delegated = routeRepoDesk({next:"cg-repair-lab"});',
      ].join("\n"),
    },
  ]);
  const rules = report.findings.map((item) => item.rule_id);
  assert(
    !rules.includes("CGRL-OWNERSHIP-COLLISION-001") &&
      !rules.includes("CGRL-HANDOFF-OWNER-COLLISION-001"),
    "A passive routeRepoDesk symbol/delegate without route mutation must not be misclassified as a handoff owner.",
  );
  assert(
    report.debug_report.governance_contracts.repo_handoff_owners.length === 1 &&
      report.debug_report.governance_contracts.repo_handoff_owners[0] ===
        "code-labs/assets/cl-nav.js",
    "Only the helper that actually mutates the CGRL route may own the handoff in this fixture.",
  );
});

Deno.test("CG Repair Lab detects public MCP registration and preservation-contract drift", async () => {
  const main = [
    "function tools() {",
    '  return [{ name: "alpha" }, { name: "beta" }];',
    "}",
    "function decodeBase64(value) { return value; }",
  ].join("\n");
  const preservation = [
    "const expected = [",
    '  "alpha",',
    "];",
  ].join("\n");
  const report = await governanceFixture([
    { path: "supabase/functions/code-labs-mcp-stub/main.ts", content: main },
    {
      path: "supabase/functions/code-labs-mcp-stub/connector-access-preservation.test.ts",
      content: preservation,
    },
  ]);
  assert(
    report.findings.some((item) =>
      item.rule_id === "CGRL-PUBLIC-TOOL-CONTRACT-DRIFT-001"
    ),
    "A public tool added without the strict preservation expectation must be blocked.",
  );
  assert(
    report.debug_report.governance_contracts.public_tool_contract_comparable === true &&
      report.debug_report.governance_contracts.public_tool_contract_matches === false,
    "The report must disclose that the two tool inventories were comparable but mismatched.",
  );
});

Deno.test("CG Repair Lab accepts synchronized public MCP registration and preservation contract", async () => {
  const main = [
    "function tools() {",
    '  return [{ name: "alpha" }, { name: "beta" }];',
    "}",
    "function decodeBase64(value) { return value; }",
  ].join("\n");
  const preservation = [
    "const expected = [",
    '  "alpha",',
    '  "beta",',
    "];",
  ].join("\n");
  const report = await governanceFixture([
    { path: "supabase/functions/code-labs-mcp-stub/main.ts", content: main },
    {
      path: "supabase/functions/code-labs-mcp-stub/connector-access-preservation.test.ts",
      content: preservation,
    },
  ]);
  assert(
    !report.findings.some((item) =>
      item.rule_id === "CGRL-PUBLIC-TOOL-CONTRACT-DRIFT-001"
    ) && report.debug_report.governance_contracts.public_tool_contract_matches === true,
    "Synchronized registration and preservation inventories must remain a clean control.",
  );
});

Deno.test("CG Repair Lab detects a certification-critical contract that canonical smoke does not run", async () => {
  const criticalPath = "supabase/functions/code-labs-mcp-stub/cg-repair-lab.test.ts";
  const report = await governanceFixture([
    { path: criticalPath, content: 'Deno.test("fixture", () => {});' },
    {
      path: ".github/workflows/code-labs-v50-functional-smoke.yml",
      content: "name: Code Labs V50 Functional Smoke\nsteps:\n  - run: deno test other.test.ts",
    },
  ]);
  assert(
    report.findings.some((item) =>
      item.rule_id === "CGRL-CI-CONTRACT-NOT-RUN-001" &&
      item.path === ".github/workflows/code-labs-v50-functional-smoke.yml"
    ),
    "An existing certification contract omitted from canonical smoke must be blocked.",
  );
  assert(
    report.debug_report.governance_contracts.missing_ci_tests.includes(criticalPath),
    "The missing CI contract must be named in governance evidence.",
  );
});

Deno.test("CG Repair Lab clears the CI drift finding when canonical smoke invokes the contract", async () => {
  const criticalPath = "supabase/functions/code-labs-mcp-stub/cg-repair-lab.test.ts";
  const report = await governanceFixture([
    { path: criticalPath, content: 'Deno.test("fixture", () => {});' },
    {
      path: ".github/workflows/code-labs-v50-functional-smoke.yml",
      content: "name: Code Labs V50 Functional Smoke\nsteps:\n  - run: deno test " + criticalPath,
    },
  ]);
  assert(
    !report.findings.some((item) => item.rule_id === "CGRL-CI-CONTRACT-NOT-RUN-001") &&
      report.debug_report.governance_contracts.missing_ci_tests.length === 0,
    "A correctly wired certification contract must not be reported as missing from CI.",
  );
});
