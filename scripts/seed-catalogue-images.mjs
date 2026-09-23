#!/usr/bin/env node
/**
 * One-shot: upload catalogue seed images (scripts/catalogue-seed-assets/)
 * → Cloudinary → PATCH /catalog/categories imageUrl + imagePublicId.
 *
 * Usage:
 *   API_UPSTREAM_URL=http://HOST:3010 npm run seed:catalogue-images
 *
 * Optional: FORCE=1 to replace existing category images.
 * After success: delete scripts/catalogue-seed-assets/ and public cat copies.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { basename, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axios = require("axios");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "catalogue-seed-assets");

const BASE = (
  process.env.API_UPSTREAM_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3010"
)
  .replace(/\/$/, "")
  .replace(/\/api\/v1$/, "");

const API = `${BASE}/api/v1`;
const EMAIL = process.env.ADMIN_EMAIL || "admin@fripcash.test";
const PASSWORD = process.env.ADMIN_PASSWORD || "Password123!";
const FORCE = process.env.FORCE === "1" || process.env.FORCE === "true";

/** Seed category nameFr → filename in catalogue-seed-assets/ */
const CATEGORY_FILES = {
  Mode: "woman.png",
  Hommes: "man.png",
  Femmes: "woman.png",
  Enfants: "hobbies.png",
  Électronique: "electronics.png",
  Electronique: "electronics.png",
  Téléphones: "electronics.png",
  Telephones: "electronics.png",
  Accessoires: "sports.png",
  Maison: "maison.png",
  Décoration: "maison.png",
  Decoration: "maison.png",
  Cuisine: "hobbies.png",
  Enseignes: "sports.png",
};

function mimeFor(name) {
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  return "application/octet-stream";
}

function client(token) {
  return axios.create({
    baseURL: API,
    headers: {
      Origin: BASE,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 60_000,
    validateStatus: () => true,
  });
}

async function signIn() {
  const http = client();
  const res = await http.post("/auth/sign-in/email", {
    email: EMAIL,
    password: PASSWORD,
  });
  if (res.status >= 400) {
    throw new Error(
      `sign-in ${res.status}: ${JSON.stringify(res.data?.message || res.data)}`
    );
  }
  const token = res.data?.token || res.data?.session?.token;
  if (!token) throw new Error("No token in sign-in response");
  return token;
}

async function uploadToCloudinary(http, filePath) {
  const signRes = await http.post("/media/cloudinary-sign", {
    folder: "categories",
  });
  if (signRes.status >= 400) {
    throw new Error(
      `cloudinary-sign ${signRes.status}: ${JSON.stringify(signRes.data)}`
    );
  }
  const sign = signRes.data;

  const name = basename(filePath);
  const form = new FormData();
  form.append(
    "file",
    new Blob([readFileSync(filePath)], { type: mimeFor(name) }),
    name
  );
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const up = await axios.post(sign.uploadUrl, form, {
    timeout: 300_000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true,
  });
  if (up.status >= 400 || !up.data?.secure_url || !up.data?.public_id) {
    throw new Error(`Cloudinary ${up.status}: ${JSON.stringify(up.data)}`);
  }
  return {
    secure_url: up.data.secure_url,
    public_id: up.data.public_id,
  };
}

function resolveAsset(nameFr) {
  const file = CATEGORY_FILES[nameFr];
  if (!file) return null;
  const full = join(ASSETS_DIR, file);
  if (!existsSync(full)) {
    throw new Error(`Missing asset: ${full}`);
  }
  return full;
}

async function main() {
  if (!existsSync(ASSETS_DIR)) {
    throw new Error(`Assets dir missing: ${ASSETS_DIR}`);
  }
  console.log("API:", API);
  console.log("Assets:", ASSETS_DIR, readdirSync(ASSETS_DIR).join(", "));
  console.log("FORCE:", FORCE);

  const token = await signIn();
  console.log("Signed in as", EMAIL);
  const http = client(token);

  const catRes = await http.get("/catalog/categories");
  if (catRes.status >= 400 || !Array.isArray(catRes.data)) {
    throw new Error(
      `categories ${catRes.status}: ${JSON.stringify(catRes.data)}`
    );
  }
  const categories = catRes.data;
  console.log(`Categories: ${categories.length}`);

  let updated = 0;
  let skipped = 0;
  let noMap = 0;
  /** Reuse Cloudinary result when several categories share the same file. */
  const uploadCache = new Map();

  for (const cat of categories) {
    const path = resolveAsset(cat.nameFr);
    if (!path) {
      console.warn(`  skip (no map): ${cat.nameFr}`);
      noMap += 1;
      continue;
    }
    if (!FORCE && cat.imageUrl) {
      console.log(`  skip (has image): ${cat.nameFr}`);
      skipped += 1;
      continue;
    }

    process.stdout.write(`  upload ${cat.nameFr} ← ${basename(path)} … `);
    let uploaded = uploadCache.get(path);
    if (!uploaded) {
      uploaded = await uploadToCloudinary(http, path);
      uploadCache.set(path, uploaded);
    } else {
      process.stdout.write("(cached) ");
    }
    const patchBody = {
      parentId: cat.parentId,
      nameFr: cat.nameFr,
      nameEn: cat.nameEn,
      slug: cat.slug,
      destination: cat.destination,
      sortOrder: cat.sortOrder ?? 0,
      isActive: cat.isActive !== false,
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    };
    const patch = await http.patch(
      `/catalog/categories/${cat.id}`,
      patchBody
    );
    if (patch.status >= 400) {
      throw new Error(
        `PATCH ${cat.nameFr} ${patch.status}: ${JSON.stringify(patch.data)}`
      );
    }
    console.log("ok");
    updated += 1;
  }

  console.log(
    `\nDone. updated=${updated} skipped=${skipped} unmapped=${noMap}`
  );
  if (updated > 0) {
    console.log(
      "Next: remove scripts/catalogue-seed-assets/ and public/images/{woman,man,electronics,sports,hobbies}.png — FE uses GET /catalog/categories imageUrl only."
    );
  }
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
