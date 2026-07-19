import { importPKCS8, SignJWT } from "npm:jose@5.9.6";
import { rest } from "./oauth.ts";

type Row = Record<string, any>;
type Permissions = Record<string, "read" | "write">;

const API = "https://api.github.com";
const API_VERSION = "2022-11-28";

function requiredSecret(name: string) {
  const value = String(Deno.env.get(name) || "").trim();
  if (!value) throw new Error(name + " is not configured in Supabase secrets.");
  return value;
}

export function cleanRepository(value: unknown) {
  const repo = String(value || "").trim();
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
    throw new Error("A repository in owner/name form is required.");
  }
  return repo;
}

function concatBytes(...parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function derLength(length: number) {
  if (length < 128) return new Uint8Array([length]);
  const bytes: number[] = [];
  for (let value = length; value > 0; value >>>= 8) bytes.unshift(value & 255);
  return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function der(tag: number, body: Uint8Array) {
  return concatBytes(new Uint8Array([tag]), derLength(body.length), body);
}

function base64ToBytes(value: string) {
  const binary = atob(value.replace(/\s+/g, ""));
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    out[index] = binary.charCodeAt(index);
  }
  return out;
}

function bytesToBase64(value: Uint8Array) {
  let binary = "";
  const size = 0x8000;
  for (let offset = 0; offset < value.length; offset += size) {
    binary += String.fromCharCode(
      ...value.subarray(offset, Math.min(offset + size, value.length)),
    );
  }
  return btoa(binary);
}

function pem(label: string, value: Uint8Array) {
  const encoded = bytesToBase64(value);
  const lines = encoded.match(/.{1,64}/g) || [];
  return "-----BEGIN " + label + "-----\n" + lines.join("\n") +
    "\n-----END " + label + "-----\n";
}

function normalizePrivateKey(value: string) {
  const key = String(value || "").trim();
  if (key.includes("-----BEGIN PRIVATE KEY-----")) return key + "\n";
  if (!key.includes("-----BEGIN RSA PRIVATE KEY-----")) {
    throw new Error("The GitHub App private key format is unsupported.");
  }
  const body = key
    .replace("-----BEGIN RSA PRIVATE KEY-----", "")
    .replace("-----END RSA PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const pkcs1 = base64ToBytes(body);
  const version = der(0x02, new Uint8Array([0]));
  const rsaAlgorithm = new Uint8Array([
    0x30,
    0x0d,
    0x06,
    0x09,
    0x2a,
    0x86,
    0x48,
    0x86,
    0xf7,
    0x0d,
    0x01,
    0x01,
    0x01,
    0x05,
    0x00,
  ]);
  return pem(
    "PRIVATE KEY",
    der(0x30, concatBytes(version, rsaAlgorithm, der(0x04, pkcs1))),
  );
}

async function one(path: string) {
  const rows = await rest(path);
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function installationToken(
  installationId: string,
  repositoryName: string,
  permissions: Permissions,
) {
  const appId = requiredSecret("CODE_LABS_GITHUB_APP_ID");
  const encodedKey = requiredSecret("CODE_LABS_GITHUB_APP_KEY_B64");
  const keyBytes = base64ToBytes(encodedKey);
  const keyText = normalizePrivateKey(new TextDecoder().decode(keyBytes));
  const key = await importPKCS8(keyText, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(appId)
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 540)
    .sign(key);
  const response = await fetch(
    API + "/app/installations/" + encodeURIComponent(installationId) +
      "/access_tokens",
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: "Bearer " + jwt,
        "X-GitHub-Api-Version": API_VERSION,
        "User-Agent": "code-labs-github-authority",
      },
      body: JSON.stringify({ repositories: [repositoryName], permissions }),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.token) {
    throw new Error(
      "The connected GitHub installation could not authorize the requested repository operation.",
    );
  }
  return String(payload.token);
}

export async function githubRequest(
  path: string,
  token: string,
  init: RequestInit = {},
) {
  const response = await fetch(API + path, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": API_VERSION,
      "User-Agent": "code-labs-github-authority",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  let payload: any = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }
  if (!response.ok) {
    throw new Error(
      "The verified GitHub request failed with status " + response.status + ".",
    );
  }
  return payload;
}

export async function verifyOwnerRepository(
  ownerId: string,
  requestedRepository: unknown,
  permissions: Permissions = { contents: "read" },
) {
  const repo = cleanRepository(requestedRepository);
  const repository = await one(
    "code_labs_github_repositories?select=repo_full_name,default_branch,installation_id,status" +
      "&owner_id=eq." + encodeURIComponent(ownerId) +
      "&repo_full_name=eq." + encodeURIComponent(repo) +
      "&status=eq.active&limit=1",
  );
  if (!repository) {
    throw new Error("The repository is not connected to this Code Labs owner.");
  }
  const installation = await one(
    "code_labs_github_installations?select=installation_id,status" +
      "&owner_id=eq." + encodeURIComponent(ownerId) +
      "&installation_id=eq." + encodeURIComponent(repository.installation_id) +
      "&status=eq.active&limit=1",
  );
  if (!installation) {
    throw new Error("The owner-scoped GitHub installation is not active.");
  }
  const [owner, name] = repo.split("/");
  const token = await installationToken(
    String(installation.installation_id),
    name,
    permissions,
  );
  const verified: Row = await githubRequest(
    "/repos/" + [owner, name].map(encodeURIComponent).join("/"),
    token,
  );
  if (String(verified.full_name || "").toLowerCase() !== repo.toLowerCase()) {
    throw new Error("GitHub did not verify the requested repository identity.");
  }
  return {
    repo,
    owner,
    name,
    token,
    default_branch: String(
      verified.default_branch || repository.default_branch || "main",
    ),
  };
}
