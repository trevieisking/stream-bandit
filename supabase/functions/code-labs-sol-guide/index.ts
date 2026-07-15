import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const VERSION = "Code Labs ChatGPT Guide V225";
const API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-5.6-terra";
const URL = Deno.env.get("SUPABASE_URL") || "";
const ANON = Deno.env.get("SUPABASE_ANON_KEY") || "";
const ALLOWED = new Set([
  "https://chatterfriendsstreambandit.co.uk",
  "https://www.chatterfriendsstreambandit.co.uk",
]);

function headers(req: