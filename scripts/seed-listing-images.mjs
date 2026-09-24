#!/usr/bin/env node
/**
 * One-shot: fix listing title/description/category/price/destination +
 * upload matching Unsplash product photos → Cloudinary → attach/replace media.
 *
 * Auth: each listing owner (seller). Admin only used to list all listings.
 *
 * Usage:
 *   API_UPSTREAM_URL=http://HOST:3010 npm run seed:listing-images
 *   BATCH=10 OFFSET=0   # process 10 listings starting at index 0
 *   FORCE=1             # re-upload even if media.url already set
 *   DRY=1               # plan only, no writes
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const axios = require("axios");

const BASE = (
  process.env.API_UPSTREAM_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3010"
)
  .replace(/\/$/, "")
  .replace(/\/api\/v1$/, "");

const API = `${BASE}/api/v1`;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@fripcash.test";
const PASSWORD = process.env.SEED_PASSWORD || "Password123!";
const FORCE = process.env.FORCE === "1" || process.env.FORCE === "true";
const DRY = process.env.DRY === "1" || process.env.DRY === "true";
const BATCH = Math.max(1, Number(process.env.BATCH || 10));
const OFFSET = Math.max(0, Number(process.env.OFFSET || 0));

const SELLER_BY_USER_ID = {
  cmu62hwvt000ovi3dtt0u3x1s: "buyer@fripcash.test",
  cmu62hyrx000rvi3dsqipp25y: "seller@fripcash.test",
  cmu62iqfe001xvi3du7zzmjrc: "seller.particulier.1@fripcash.test",
  cmu62is8t0020vi3dwe5hlp02: "seller.particulier.2@fripcash.test",
  cmu62iu290023vi3dej8jkyfg: "seller.particulier.3@fripcash.test",
  cmu62iwwn0026vi3ddky8zmoc: "seller.particulier.4@fripcash.test",
  cmu62iysw0029vi3du02zsu09: "seller.particulier.5@fripcash.test",
  cmu62j0nl002cvi3d4w3ksbyx: "seller.particulier.6@fripcash.test",
  cmu62j2il002fvi3dzrwv5s26: "seller.boutique.1@fripcash.test",
  cmu62j495002ivi3de1n87yhd: "seller.boutique.2@fripcash.test",
  cmu62j6jn002lvi3di2nyikyq: "seller.boutique.3@fripcash.test",
};

/** Pexels crop helper — more reliable than Unsplash hotlinks for seed scripts */
function p(id, w = 900) {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

/**
 * Product catalogue: stem → coherent FR listing + leaf category slug + GNF prices + photos.
 * Images are product-matched (watch≠phone, bag≠ball, etc.).
 */
const PRODUCTS = [
  {
    key: "montre",
    match: /montre/i,
    categorySlug: "electronics-accessories",
    destination: "ARTICLES_NEUFS",
    titles: [
      "Montre classique bracelet cuir",
      "Montre analogique cadran blanc",
      "Montre élégante boîtier argenté",
    ],
    descriptions: [
      "Montre analogique au design classique, bracelet en cuir véritable. Parfaite pour un usage quotidien ou élégant.",
      "Cadran blanc lisible, aiguilles fines, mouvement à quartz. Livrée avec son écrin.",
      "Montre sobre et raffinée, boîtier métallique, étanche aux éclaboussures. Très bon état.",
    ],
    prices: [320000, 450000, 580000],
    images: [p(2783873), p(190819), p(277390)],
  },
  {
    key: "chemise",
    match: /chemise/i,
    categorySlug: "fashion-men",
    destination: "SECONDE_MAIN",
    titles: [
      "Chemise en lin beige",
      "Chemise lin coupe droite",
      "Chemise lin bleu ciel",
      "Chemise lin blanche légère",
    ],
    descriptions: [
      "Chemise en lin naturel, coupe droite, idéale par temps chaud. Tissu respirant, peu froissé.",
      "Lin de qualité, boutons nacrés, col classique. Portée quelques fois, état impeccable.",
      "Teinte bleu ciel, manches longues retroussables. Parfaite pour le bureau ou les sorties.",
      "Chemise blanche en lin, coupe confortable. Lavage délicat recommandé.",
    ],
    prices: [180000, 250000, 320000, 280000],
    images: [p(297933), p(428340), p(769733), p(996329)],
  },
  {
    key: "sac",
    match: /sac\s*[àa]\s*main|sac\b/i,
    categorySlug: "fashion-women",
    destination: "SECONDE_MAIN",
    titles: [
      "Sac à main cuir cognac",
      "Sac bandoulière noir",
      "Sac à main structuré beige",
      "Sac cabas élégant",
    ],
    descriptions: [
      "Sac à main en cuir cognac, compartiments intérieurs, fermeture éclair. Porté avec soin.",
      "Bandoulière ajustable, intérieur doublé. Idéal pour le quotidien en ville.",
      "Forme structurée, teinte beige neutre, s'accorde avec toutes les tenues.",
      "Grand cabas pratique, anses solides. Quelques marques d'usage légères.",
    ],
    prices: [280000, 350000, 420000, 390000],
    images: [p(1152077), p(904350), p(2081199), p(1152077)],
  },
  {
    key: "casque",
    match: /casque/i,
    categorySlug: "electronics-accessories",
    destination: "ARTICLES_NEUFS",
    titles: [
      "Casque Bluetooth over-ear",
      "Casque sans fil réduction de bruit",
      "Casque audio Bluetooth noir",
    ],
    descriptions: [
      "Casque Bluetooth over-ear, autonomie jusqu'à 20 h, coussinets confortables. Son clair.",
      "Réduction de bruit active, micro intégré pour appels. Charge USB-C.",
      "Design noir mat, pliable pour le transport. Excellent rapport qualité-prix.",
    ],
    prices: [280000, 450000, 320000],
    images: [p(3394650), p(1649771), p(577769)],
  },
  {
    key: "sandales",
    match: /sandales?/i,
    categorySlug: "fashion-women",
    destination: "SECONDE_MAIN",
    titles: [
      "Sandales cuir plates",
      "Sandales cuir cognac",
      "Sandales artisanales en cuir",
      "Sandales ouvertes confort",
    ],
    descriptions: [
      "Sandales plates en cuir souple, semelle antidérapante. Pointure 38–39.",
      "Cuir cognac tanné, bride réglable. Idéales pour la saison chaude.",
      "Finition artisanale, semelle cousue. Très confortables dès le premier port.",
      "Modèle ouvert, léger et respirant. Quelques traces d'usure normales.",
    ],
    prices: [95000, 120000, 150000, 110000],
    images: [p(336372), p(267301), p(336372), p(267301)],
  },
  {
    key: "sneakers",
    match: /sneakers?|nike|baskets/i,
    categorySlug: "sports-leisure",
    destination: "ENSEIGNES",
    titles: [
      "Baskets sport blanches",
      "Sneakers running légères",
      "Baskets lifestyle noires",
      "Sneakers streetwear",
    ],
    descriptions: [
      "Baskets sport blanches, semelle amortie, idéales pour la marche et le sport léger.",
      "Running légères, mesh respirant, laçage classique. Pointure 42.",
      "Modèle noir polyvalent, compatible tenue casual ou sport.",
      "Streetwear tendance, semelle épaisse, très bon état général.",
    ],
    prices: [480000, 620000, 550000, 700000],
    images: [p(1478442), p(1598505), p(267301), p(1478442)],
  },
  {
    key: "boubou",
    match: /boubou/i,
    categorySlug: "fashion-men",
    destination: "SECONDE_MAIN",
    titles: [
      "Boubou homme brodé",
      "Boubou traditionnel beige",
      "Boubou homme coton léger",
    ],
    descriptions: [
      "Boubou homme avec broderies discrètes, tissu fluide. Taille L–XL.",
      "Coupe ample traditionnelle, teinte beige. Idéal cérémonies et fêtes.",
      "Coton léger, respirant, entretien facile. Porté rarement.",
    ],
    prices: [350000, 420000, 380000],
    images: [p(8090137), p(7940624), p(6069785)],
  },
  {
    key: "robe",
    match: /\brobe\b/i,
    categorySlug: "fashion-women",
    destination: "SECONDE_MAIN",
    titles: [
      "Robe wax motifs colorés",
      "Robe wax mi-longue",
      "Robe wax cérémonie",
      "Robe wax coton imprimée",
    ],
    descriptions: [
      "Robe en tissu wax aux motifs vifs, coupe confortable. Taille M.",
      "Longueur mi-mollet, manches courtes. Parfaite pour sorties et événements.",
      "Modèle cérémonie, tombé élégant, ceinture amovible.",
      "Coton imprimé wax, entretien machine à froid. Très bon état.",
    ],
    prices: [320000, 450000, 520000, 380000],
    images: [p(985635), p(972995), p(1488463), p(1755428)],
  },
  {
    key: "iphone",
    match: /iphone|t[eé]l[eé]phone|smartphone/i,
    categorySlug: "electronics-phones",
    destination: "ARTICLES_NEUFS",
    titles: [
      "iPhone reconditionné 128 Go",
      "iPhone reconditionné grade A",
      "Smartphone reconditionné écran neuf",
    ],
    descriptions: [
      "iPhone reconditionné 128 Go, batterie testée >85 %. Débloqué tous opérateurs.",
      "Grade A : coque et écran sans rayures visibles. Chargeur inclus.",
      "Écran remplacé, boîtier soigné. Garantie vendeur 30 jours.",
    ],
    prices: [3200000, 3800000, 3500000],
    images: [p(788946), p(699122), p(404280)],
  },
  {
    key: "jupe",
    match: /jupe/i,
    categorySlug: "fashion-women",
    destination: "SECONDE_MAIN",
    titles: [
      "Jupe plissée midi",
      "Jupe plissée noire",
      "Jupe plissée fluide",
    ],
    descriptions: [
      "Jupe plissée longueur midi, tissu fluide. Taille S–M.",
      "Noir polyvalent, taille élastique confortable. Idéale bureau ou soirée.",
      "Plis permanents, tombé léger. Quelques plis de rangement uniquement.",
    ],
    prices: [140000, 180000, 160000],
    images: [p(1007018), p(8386649), p(6764007)],
  },
  {
    key: "probe",
    match: /^buyer\s*probe$/i,
    categorySlug: "home-decor",
    destination: "QUARTIER_BOUTIQUES",
    titles: ["Vase céramique décoratif"],
    descriptions: [
      "Vase en céramique mate, idéal pour fleurs séchées ou bouquet frais. Hauteur ~25 cm.",
    ],
    prices: [85000],
    images: [p(1090638)],
  },
];

/** Extra products to diversify leftover / force-home categories if needed */
const FALLBACK = {
  key: "lampe",
  categorySlug: "home-decor",
  destination: "QUARTIER_BOUTIQUES",
  titles: ["Lampe de table design"],
  descriptions: [
    "Lampe de table abat-jour tissu, pied métallique. Ampoule non fournie.",
  ],
  prices: [175000],
  images: [p(1571460)],
};

const stemCounters = new Map();

function pickProduct(title, variantIndex = 0) {
  for (const p of PRODUCTS) {
    if (p.match.test(title || "")) {
      const i = Math.abs(variantIndex) % p.titles.length;
      return {
        key: p.key,
        categorySlug: p.categorySlug,
        destination: p.destination,
        title: p.titles[i],
        description: p.descriptions[i % p.descriptions.length],
        priceGnf: p.prices[i % p.prices.length],
        imageUrl: p.images[i % p.images.length],
      };
    }
  }
  return {
    key: FALLBACK.key,
    categorySlug: FALLBACK.categorySlug,
    destination: FALLBACK.destination,
    title: FALLBACK.titles[0],
    description: FALLBACK.descriptions[0],
    priceGnf: FALLBACK.prices[0],
    imageUrl: FALLBACK.images[0],
  };
}

function client(token) {
  return axios.create({
    baseURL: API,
    headers: {
      Origin: BASE,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    timeout: 90_000,
    validateStatus: () => true,
  });
}

async function signIn(email) {
  const http = client();
  const res = await http.post("/auth/sign-in/email", {
    email,
    password: PASSWORD,
  });
  if (res.status >= 400) {
    throw new Error(
      `sign-in ${email} ${res.status}: ${JSON.stringify(res.data?.message || res.data)}`
    );
  }
  const token = res.data?.token || res.data?.session?.token;
  if (!token) throw new Error(`No token for ${email}`);
  return { token, userId: res.data?.user?.id };
}

async function downloadImage(url, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 90_000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; fripcash-seed/1.0)" },
        validateStatus: () => true,
        maxRedirects: 5,
      });
      if (res.status >= 400) {
        throw new Error(`download ${res.status}: ${url}`);
      }
      const ctype = String(res.headers["content-type"] || "");
      if (!ctype.includes("image")) {
        throw new Error(`not an image (${ctype}): ${url}`);
      }
      return Buffer.from(res.data);
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function uploadToCloudinary(http, buffer, filename) {
  const signRes = await http.post("/media/cloudinary-sign", {
    folder: "listings",
  });
  if (signRes.status >= 400) {
    throw new Error(
      `cloudinary-sign ${signRes.status}: ${JSON.stringify(signRes.data)}`
    );
  }
  const sign = signRes.data;
  const form = new FormData();
  form.append(
    "file",
    new Blob([buffer], { type: "image/jpeg" }),
    filename
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
  return { secure_url: up.data.secure_url, public_id: up.data.public_id };
}

function flattenCategories(nodes, out = []) {
  for (const n of nodes || []) {
    out.push(n);
    const kids = n.children || n.subcategories || [];
    if (kids.length) flattenCategories(kids, out);
  }
  return out;
}

async function main() {
  console.log("API:", API);
  console.log({ FORCE, DRY, BATCH, OFFSET });

  const admin = await signIn(ADMIN_EMAIL);
  const adminHttp = client(admin.token);

  const catRes = await adminHttp.get("/catalog/categories");
  if (catRes.status >= 400 || !Array.isArray(catRes.data)) {
    throw new Error(`categories ${catRes.status}`);
  }
  const cats = flattenCategories(catRes.data);
  const catBySlug = new Map(cats.map((c) => [c.slug, c]));

  const listRes = await adminHttp.get("/admin/listings");
  if (listRes.status >= 400 || !Array.isArray(listRes.data)) {
    throw new Error(`admin/listings ${listRes.status}`);
  }
  const all = listRes.data.slice().sort((a, b) => a.id.localeCompare(b.id));
  // Stable variant index per product stem across the full sorted list
  const stemIndex = new Map();
  const productByListingId = new Map();
  for (const listing of all) {
    let key = "fallback";
    for (const p of PRODUCTS) {
      if (p.match.test(listing.title || "")) {
        key = p.key;
        break;
      }
    }
    const n = stemIndex.get(key) || 0;
    stemIndex.set(key, n + 1);
    productByListingId.set(listing.id, pickProduct(listing.title, n));
  }

  const slice = all.slice(OFFSET, OFFSET + BATCH);
  console.log(`Listings total=${all.length} processing=${slice.length} [${OFFSET}..${OFFSET + slice.length})`);

  const tokenCache = new Map();
  const sellerMeta = new Map(); // email → { allowedDestinations, listingDestination }
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const listing of slice) {
    const sellerUserId = listing.sellerProfile?.userId;
    const email = SELLER_BY_USER_ID[sellerUserId];
    const product = productByListingId.get(listing.id);
    const category = catBySlug.get(product.categorySlug);
    if (!category) {
      console.error(`  ✗ ${listing.id}: missing category ${product.categorySlug}`);
      failed += 1;
      continue;
    }
    if (!email) {
      console.error(`  ✗ ${listing.id}: no seller email for ${sellerUserId}`);
      failed += 1;
      continue;
    }

    const hasUrl = Boolean(listing.media?.[0]?.url);
    if (!FORCE && hasUrl) {
      console.log(`  skip (has url): ${listing.title?.slice(0, 40)}`);
      skipped += 1;
      continue;
    }

    if (DRY) {
      console.log(
        `  → ${listing.id.slice(-8)} | ${listing.title?.slice(0, 28)} → ${product.title} | ${product.categorySlug} | ${product.priceGnf} GNF | ${email}`
      );
      ok += 1;
      continue;
    }

    try {
      if (!tokenCache.has(email)) {
        tokenCache.set(email, await signIn(email));
      }
      const { token } = tokenCache.get(email);
      const http = client(token);

      if (!sellerMeta.has(email)) {
        const meRes = await http.get("/me");
        if (meRes.status >= 400) {
          throw new Error(`GET /me ${meRes.status}`);
        }
        const s = meRes.data?.seller || {};
        sellerMeta.set(email, {
          allowed: s.allowedDestinations || [],
          preferred: s.listingDestination,
        });
      }
      const meta = sellerMeta.get(email);
      const destination =
        (meta.preferred && meta.allowed.includes(meta.preferred)
          ? meta.preferred
          : meta.allowed[0]) || product.destination;

      console.log(
        `  → ${listing.id.slice(-8)} | ${listing.title?.slice(0, 28)} → ${product.title} | ${product.categorySlug} | ${product.priceGnf} GNF | dest=${destination} | ${email}`
      );

      const patch = await http.patch(`/listings/${listing.id}`, {
        title: product.title,
        description: product.description,
        priceGnf: product.priceGnf,
        categoryId: category.id,
        destination,
      });
      if (patch.status >= 400) {
        throw new Error(
          `PATCH listing ${patch.status}: ${JSON.stringify(patch.data)}`
        );
      }

      process.stdout.write("    download+upload … ");
      const buf = await downloadImage(product.imageUrl);
      const uploaded = await uploadToCloudinary(
        http,
        buf,
        `${product.key}-${listing.id.slice(-6)}.jpg`
      );

      const mediaId = listing.media?.[0]?.id;
      let mediaRes;
      if (mediaId) {
        mediaRes = await http.patch(
          `/listings/${listing.id}/media/${mediaId}`,
          {
            publicId: uploaded.public_id,
            url: uploaded.secure_url,
            mimeType: "image/jpeg",
            sortOrder: 0,
          }
        );
      } else {
        mediaRes = await http.post(`/listings/${listing.id}/media`, {
          publicId: uploaded.public_id,
          url: uploaded.secure_url,
          mimeType: "image/jpeg",
          sortOrder: 0,
        });
      }
      if (mediaRes.status >= 400) {
        throw new Error(
          `media ${mediaRes.status}: ${JSON.stringify(mediaRes.data)}`
        );
      }
      console.log("ok");
      ok += 1;
    } catch (err) {
      console.error(`    FAIL: ${err.message || err}`);
      failed += 1;
    }
  }

  console.log(`\nDone batch. ok=${ok} skipped=${skipped} failed=${failed}`);
  const next = OFFSET + BATCH;
  if (next < all.length) {
    console.log(`Next: OFFSET=${next} BATCH=${BATCH}`);
  } else {
    console.log("All listings in range processed.");
  }
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message || err);
  process.exit(1);
});
