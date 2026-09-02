import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore -- resolved by the Supabase Edge Runtime.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Connection": "keep-alive"
};

const ADMIN_ROLES = new Set(["admin", "owner", "superadmin", "super_admin"]);
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: corsHeaders });
}

function env(name: string) {
  return Deno.env.get(name) || "";
}

function serviceRoleKey() {
  const direct = env("SUPABASE_SERVICE_ROLE_KEY");
  if (direct) return direct;
  try {
    const keys = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}");
    return keys.default || Object.values(keys)[0] || "";
  } catch (_e) {
    return "";
  }
}

function adminClient() {
  const url = env("SUPABASE_URL");
  const key = serviceRoleKey();
  if (!url || !key) throw new Error("Supabase service role secret is not available to the Edge Function.");
  return createClient(url, key, { auth: { persistSession: false } });
}

function muxAuthHeader() {
  const tokenId = env("MUX_TOKEN_ID");
  const tokenSecret = env("MUX_TOKEN_SECRET");
  if (!tokenId || !tokenSecret) throw new Error("MUX_TOKEN_ID and MUX_TOKEN_SECRET are not set in Supabase Edge Function secrets.");
  return "Basic " + btoa(`${tokenId}:${tokenSecret}`);
}

function muxHeaders() {
  return {
    "Authorization": muxAuthHeader(),
    "Content-Type": "application/json"
  };
}

async function getSignedInUser(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) throw new Error("Missing Authorization bearer token.");

  const admin = adminClient();
  const got = await admin.auth.getUser(jwt);
  const user = got?.data?.user;
  if (!user) throw new Error("Signed-in user not found.");

  const checks: Array<[string, string]> = [["id", user.id], ["user_id", user.id], ["auth_user_id", user.id]];
  if (user.email) checks.push(["email", user.email]);

  let profile: Record<string, unknown> | null = null;
  for (const [field, value] of checks) {
    const res = await admin.from("sb_profiles").select("*").eq(field, value).maybeSingle();
    if (!res.error && res.data) {
      profile = res.data;
      break;
    }
  }

  const role = String(
    profile?.role ||
    profile?.account_role ||
    profile?.user_role ||
    user.app_metadata?.role ||
    user.user_metadata?.role ||
    ""
  ).toLowerCase();

  return { user, profile, role, admin };
}

async function getSignedInAdmin(req: Request) {
  const signedIn = await getSignedInUser(req);
  if (!ADMIN_ROLES.has(signedIn.role)) {
    throw new Error("Admin or owner role required for Mux uploads.");
  }
  return signedIn;
}

async function muxFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.mux.com/video/v1${path}`, {
    ...init,
    headers: { ...muxHeaders(), ...(init.headers || {}) }
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (_e) { data = { raw: text }; }
  if (!res.ok) {
    throw new Error(`Mux API ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function muxFetchOptional(path: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.mux.com/video/v1${path}`, {
    ...init,
    headers: { ...muxHeaders(), ...(init.headers || {}) }
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch (_e) { data = { raw: text }; }
  if (res.status === 404) return { found: false, status: 404, data: null };
  if (!res.ok) throw new Error(`Mux API ${res.status}: ${JSON.stringify(data)}`);
  return { found: true, status: res.status, data };
}

function playbackUrls(playbackId: string) {
  return {
    playback_id: playbackId,
    public_hls_url: `https://stream.mux.com/${playbackId}.m3u8`,
    public_player_url: `https://player.mux.com/${playbackId}`,
    thumbnail_url: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
    animated_gif_url: `https://image.mux.com/${playbackId}/animated.gif`
  };
}

async function createUpload(body: any, req: Request) {
  const adminUser = await getSignedInAdmin(req);
  const origin = String(body?.cors_origin || req.headers.get("origin") || "*");
  const title = String(body?.title || "Stream Bandit upload").slice(0, 120);

  const muxBody = {
    cors_origin: origin === "null" ? "*" : origin,
    new_asset_settings: {
      playback_policy: ["public"],
      mp4_support: "none",
      passthrough: JSON.stringify({ app: "stream-bandit", title, user_id: adminUser.user.id }).slice(0, 255)
    }
  };

  const created = await muxFetch("/uploads", {
    method: "POST",
    body: JSON.stringify(muxBody)
  });

  const upload = created?.data || created;
  return json({
    ok: true,
    action: "create",
    upload_id: upload.id,
    upload_url: upload.url,
    status: upload.status,
    asset_id: upload.asset_id || null,
    role: adminUser.role,
    note: "Upload the selected file to upload_url with tus-js-client. Mux credentials stayed inside this Edge Function."
  });
}

async function getStatus(body: any, req: Request) {
  await getSignedInAdmin(req);
  const uploadId = String(body?.upload_id || "").trim();
  if (!uploadId) throw new Error("upload_id is required.");

  const uploadRes = await muxFetch(`/uploads/${encodeURIComponent(uploadId)}`, { method: "GET" });
  const upload = uploadRes?.data || uploadRes;
  let asset: any = null;
  let playback: any = null;

  if (upload.asset_id) {
    const assetRes = await muxFetch(`/assets/${encodeURIComponent(upload.asset_id)}`, { method: "GET" });
    asset = assetRes?.data || assetRes;
    const publicPlayback = (asset.playback_ids || []).find((p: any) => p.policy === "public") || (asset.playback_ids || [])[0] || null;
    if (publicPlayback?.id) playback = playbackUrls(publicPlayback.id);
  }

  return json({
    ok: true,
    action: "status",
    upload: {
      id: upload.id,
      status: upload.status,
      asset_id: upload.asset_id || null,
      timeout: upload.timeout || null
    },
    asset: asset ? {
      id: asset.id,
      status: asset.status,
      duration: asset.duration || null,
      aspect_ratio: asset.aspect_ratio || null,
      playback_ids: asset.playback_ids || []
    } : null,
    playback,
    supabase_ready_fields: playback ? {
      video_url: playback.public_hls_url,
      mux_playback_url: playback.public_hls_url,
      thumbnail_url: playback.thumbnail_url,
      source_type: "mux"
    } : null
  });
}

function passthroughOwner(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.app !== "stream-bandit") return "";
    return String(parsed.user_id || "").trim();
  } catch (_e) {
    return "";
  }
}

function requireMuxOwnership(metadata: any, creatorId: string, privileged: boolean) {
  const owner = passthroughOwner(metadata?.passthrough || metadata?.new_asset_settings?.passthrough);
  if (owner && owner === creatorId) return;
  if (privileged) return;
  throw new Error("The Mux media ownership proof does not match this track creator.");
}

async function deleteMuxAsset(assetId: string, creatorId: string, privileged: boolean) {
  const read = await muxFetchOptional(`/assets/${encodeURIComponent(assetId)}`, { method: "GET" });
  if (!read.found) return { deleted: false, already_absent: true, upload_cancelled: false };
  const asset = read.data?.data || read.data || {};
  requireMuxOwnership(asset, creatorId, privileged);
  const removed = await muxFetchOptional(`/assets/${encodeURIComponent(assetId)}`, { method: "DELETE" });
  return { deleted: removed.found, already_absent: !removed.found, upload_cancelled: false };
}

async function resolveAndDeleteMuxTrack(track: Record<string, any>, privileged: boolean) {
  const creatorId = String(track.created_by || "").trim();
  if (!UUID.test(creatorId)) throw new Error("The track creator identity is invalid.");

  const directAssetId = String(track.mux_asset_id || "").trim();
  if (directAssetId) return await deleteMuxAsset(directAssetId, creatorId, privileged);

  const uploadId = String(track.mux_upload_id || "").trim();
  if (!uploadId) return { deleted: false, already_absent: true, upload_cancelled: false };

  const uploadResult = await muxFetchOptional(`/uploads/${encodeURIComponent(uploadId)}`, { method: "GET" });
  if (!uploadResult.found) return { deleted: false, already_absent: true, upload_cancelled: false };
  const upload = uploadResult.data?.data || uploadResult.data || {};
  const resolvedAssetId = String(upload.asset_id || "").trim();
  if (resolvedAssetId) return await deleteMuxAsset(resolvedAssetId, creatorId, privileged);
  if (String(upload.status || "") === "waiting") {
    requireMuxOwnership(upload, creatorId, privileged);
    await muxFetch(`/uploads/${encodeURIComponent(uploadId)}/cancel`, { method: "PUT" });
    return { deleted: false, already_absent: false, upload_cancelled: true };
  }
  return { deleted: false, already_absent: true, upload_cancelled: false };
}

async function removeStoredObject(
  admin: any,
  bucketValue: unknown,
  pathValue: unknown,
  creatorId: string,
  allowedBuckets: Set<string>
) {
  const bucket = String(bucketValue || "").trim();
  const path = String(pathValue || "").trim().replace(/^\/+/, "");
  if (!bucket || !path) return false;
  if (!allowedBuckets.has(bucket)) throw new Error("The stored media bucket is not an approved Manic Records bucket.");
  if (path.split("/")[0] !== creatorId) throw new Error("The stored media path does not belong to this track creator.");
  const result = await admin.storage.from(bucket).remove([path]);
  if (result.error) throw new Error("Stored Manic Records media cleanup failed.");
  return true;
}

async function deleteTrack(body: any, req: Request) {
  const signedIn = await getSignedInUser(req);
  const trackId = String(body?.track_id || "").trim();
  if (!UUID.test(trackId)) throw new Error("A valid track_id is required.");

  const read = await signedIn.admin
    .from("manic_tracks")
    .select("id,created_by,title,media_kind,mux_upload_id,mux_asset_id,audio_bucket,audio_storage_path,cover_bucket,cover_storage_path")
    .eq("id", trackId)
    .maybeSingle();
  if (read.error) throw read.error;
  const track = read.data;
  if (!track) {
    return json({ ok: true, action: "delete_track", track_id: trackId, already_deleted: true, record_deleted: false });
  }

  const creatorId = String(track.created_by || "").trim();
  const isCreator = creatorId === String(signedIn.user.id);
  const privileged = ADMIN_ROLES.has(signedIn.role);
  if (!isCreator && !privileged) {
    throw new Error("Only the track creator or an administrator can delete this item.");
  }

  let mux = { deleted: false, already_absent: false, upload_cancelled: false };
  if (String(track.media_kind || "") === "video") {
    mux = { ...mux, ...(await resolveAndDeleteMuxTrack(track, privileged)) };
  }

  let removedStorageObjects = 0;
  if (await removeStoredObject(
    signedIn.admin,
    track.audio_bucket,
    track.audio_storage_path,
    creatorId,
    new Set(["manic-records-public-audio", "manic-records-audio"])
  )) removedStorageObjects += 1;
  if (await removeStoredObject(
    signedIn.admin,
    track.cover_bucket,
    track.cover_storage_path,
    creatorId,
    new Set(["manic-records-public-covers", "manic-records-covers"])
  )) removedStorageObjects += 1;

  const removed = await signedIn.admin.from("manic_tracks").delete().eq("id", trackId).select("id");
  if (removed.error) throw removed.error;
  if (!Array.isArray(removed.data) || removed.data.length !== 1) {
    throw new Error("The Manic Records catalogue row could not be deleted.");
  }

  return json({
    ok: true,
    action: "delete_track",
    track_id: trackId,
    record_deleted: true,
    removed_storage_objects: removedStorageObjects,
    mux_asset_deleted: mux.deleted === true,
    mux_asset_already_absent: mux.already_absent === true,
    mux_upload_cancelled: mux.upload_cancelled === true
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "create").toLowerCase();
    if (action === "create") return await createUpload(body, req);
    if (action === "status") return await getStatus(body, req);
    if (action === "delete_track") return await deleteTrack(body, req);
    return json({ ok: false, error: "Unknown action" }, 400);
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 400);
  }
});
