const VERSION = "Code Labs V104 page control retired";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://chatterfriendsstreambandit.co.uk",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 410) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return json({
    ok: false,
    version: VERSION,
    retired: true,
    error: "This duplicate V104 page-control endpoint is retired. Use the authenticated code-labs-mcp-stub connector.",
    wrote_database: false,
    wrote_github: false,
    opened_pr: false,
    deleted_anything: false,
  });
});
