import { scanRepositorySnapshot } from "./cg-repair-lab.ts";

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
