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
    "The downstream call using the key alias should be reported without a value.",
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

Deno.test("CG Repair Lab publishes a held read-only workflow with owner controls separated", () => {
  const workflow = getCgRepairLabWorkflow();
  const controls = workflow.controls as Array<Record<string, any>>;
  assert(
    workflow.trust_state === "HOLD_UNTRUSTED_ADVISORY" &&
      workflow.authoritative_use === false,
    "Repair Lab must disclose that it is advisory and held from authoritative use.",
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
      candidateControl?.enabled === false &&
      candidateControl?.owner_control === true &&
      candidateControl?.repair_lab_authority === false &&
      candidateControl?.replaces_selected_source === false,
    "Candidate saving must be an explicitly held owner control outside Repair Lab authority.",
  );
  assert(
    !controls.some((item) => item.action === "cg_repair_lab.save_candidate"),
    "The removed Repair Lab mutation alias must not be published as a workflow action.",
  );
  for (const controlName of [
    "prepare_code_god_handoff",
    "run_code_god",
    "queue_writer_request",
    "execute_reviewed_writer",
  ]) {
    const control = controls.find((item) => item.control === controlName);
    assert(
      control?.enabled === false,
      `The downstream control must remain held during education: ${controlName}`,
    );
  }
  const writerControl = controls.find((item) =>
    item.control === "execute_reviewed_writer"
  );
  assert(
    writerControl?.requires_code_god_pass === true &&
      writerControl?.requires_independent_evidence_receipt === true,
    "Writer must require both the mechanical Code God prerequisite and independent evidence.",
  );
  assert(
    workflow.prohibited.includes("candidate.accept"),
    "CG Repair Lab must prohibit the source-replacement action.",
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
