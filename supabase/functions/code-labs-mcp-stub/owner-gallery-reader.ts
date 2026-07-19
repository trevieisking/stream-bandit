import { Binding, rest, SUPABASE_URL } from "./oauth.ts";

const BUCKET = "code-labs-owner-gallery";
const MAX_ITEMS = 60;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

type StorageObject = { name?: string; metadata?: Record<string, unknown> | null };
type GalleryItem = { reference: string; media_type: string };

function serviceKey() {
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SB_SERVICE_ROLE_KEY") || "";
}

function opaqueKey() {
  return Deno.env.get("CODE_LABS_OAUTH_SECRET") || serviceKey();
}

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function opaqueReference(ownerId: string, objectPath: string) {
  const secret = opaqueKey();
  if (!secret) throw new Error("Code Labs gallery reference key is unavailable.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = new Uint8Array(await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(ownerId + "\n" + BUCKET + "\n" + objectPath),
  ));
  return "img_" + bytesToHex(digest);
}

function activeEntitlement(row: Record<string, unknown> | null) {
  if (!row || row.plan_key !== "pro" || row.status !== "active") return false;
  const now = Date.now();
  const starts = row.starts_at ? Date.parse(String(row.starts_at)) : null;
  const expires = row.expires_at ? Date.parse(String(row.expires_at)) : null;
  return (starts === null || Number.isNaN(starts) || starts <= now) &&
    (expires === null || Number.isNaN(expires) || expires > now);
}

async function requireOwnerPro(ownerId: string) {
  const [owners, entitlements] = await Promise.all([
    rest("code_labs_owners?select=user_id&user_id=eq." + encodeURIComponent(ownerId) + "&limit=1"),
    rest(
      "code_labs_entitlements?select=plan_key,status,starts_at,expires_at" +
        "&owner_id=eq." + encodeURIComponent(ownerId) +
        "&product_key=eq.code_labs&limit=1",
    ),
  ]);
  const owner = Array.isArray(owners) ? owners[0] : null;
  const entitlement = Array.isArray(entitlements) ? entitlements[0] : null;
  if (!owner || !activeEntitlement(entitlement)) {
    throw new Error("Code Labs owner and active Pro access are required.");
  }
}

function cleanReference(value: unknown) {
  const reference = String(value || "").trim();
  if (!/^img_[a-f0-9]{64}$/.test(reference)) throw new Error("A valid opaque gallery image reference is required.");
  return reference;
}

function mediaType(row: StorageObject) {
  const value = String(row.metadata?.mimetype || row.metadata?.contentType || "").toLowerCase();
  return ALLOWED_TYPES.has(value) ? value : "application/octet-stream";
}

async function listObjects(ownerId: string) {
  const key = serviceKey();
  if (!key) throw new Error("Code Labs gallery service access is unavailable.");
  const response = await fetch(SUPABASE_URL + "/storage/v1/object/list/" + BUCKET, {
    method: "POST",
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ prefix: ownerId, limit: MAX_ITEMS, offset: 0, sortBy: { column: "created_at", order: "desc" } }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(data)) throw new Error("Private gallery listing was blocked.");
  return data.filter((row: StorageObject) => row && row.name && row.name !== ".emptyFolderPlaceholder").slice(0, MAX_ITEMS);
}

async function indexedObjects(ownerId: string) {
  const rows = await listObjects(ownerId);
  return Promise.all(rows.map(async (row: StorageObject) => {
    const objectPath = ownerId + "/" + String(row.name);
    return { row, objectPath, reference: await opaqueReference(ownerId, objectPath) };
  }));
}

export async function listOwnerGalleryReferences(binding: Binding) {
  await requireOwnerPro(binding.owner_id);
  const indexed = await indexedObjects(binding.owner_id);
  const images: GalleryItem[] = indexed.map((item) => ({
    reference: item.reference,
    media_type: mediaType(item.row),
  }));
  return {
    ok: true,
    version: "Code Labs owner gallery read bridge V1",
    count: images.length,
    images,
    read_only: true,
    filenames_returned: false,
    owner_ids_returned: false,
    object_paths_returned: false,
    signed_urls_returned: false,
    storage_writes: false,
    can_upload: false,
    can_replace: false,
    can_delete: false,
  };
}

export async function readOwnerGalleryImage(binding: Binding, args: Record<string, unknown>) {
  const reference = cleanReference(args.reference);
  await requireOwnerPro(binding.owner_id);
  const indexed = await indexedObjects(binding.owner_id);
  const selected = indexed.find((item) => item.reference === reference);
  if (!selected) throw new Error("The selected gallery image reference is unavailable.");

  const key = serviceKey();
  const encodedPath = selected.objectPath.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    SUPABASE_URL + "/storage/v1/object/authenticated/" + BUCKET + "/" + encodedPath,
    { headers: { apikey: key, Authorization: "Bearer " + key } },
  );
  if (!response.ok) throw new Error("The selected private gallery image could not be read.");
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_BYTES) throw new Error("The selected gallery image exceeds the read limit.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (!bytes.length || bytes.length > MAX_BYTES) throw new Error("The selected gallery image is empty or exceeds the read limit.");
  const headerType = String(response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const type = ALLOWED_TYPES.has(headerType) ? headerType : mediaType(selected.row);
  if (!ALLOWED_TYPES.has(type)) throw new Error("The selected object is not an allowed image type.");
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunk, bytes.length)));
  }
  return {
    ok: true,
    reference,
    mime_type: type,
    data: btoa(binary),
    byte_length: bytes.length,
    read_only: true,
    storage_writes: false,
  };
}
