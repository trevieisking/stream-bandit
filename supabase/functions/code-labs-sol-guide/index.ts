import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const VERSION = "Code Labs Page Guide Retired V227";
const ALLOWED = new Set([
  "https://chatterfriendsstreambandit.co.uk",
  "https://www.chatterfriendsstreambandit.co.uk",
]);

function headers(req: Request) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": ALLOWED.has(origin)
      ? origin
      : "https://chatterfriendsstreambandit.co.uk",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };
}

Deno.serve((req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: headers(req) });
  }

  return new Response(
    JSON.stringify({
      ok: false,
      retired: true,
      version: VERSION,
      error: "The Code Labs page guide has been retired.",
    }),
    { status: 410, headers: headers(req) },
  );
});
