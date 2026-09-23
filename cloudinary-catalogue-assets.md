# Cloudinary for catalogue assets

Frontend guide for **category / subcategory** and **listing product** images.

KYC docs, excel, and invoice PDFs use MinIO (`POST /api/v1/media/presign`) — not covered here.

The Nest API does **not** accept multipart for catalogue images. Always: sign → upload to Cloudinary → attach metadata to the API.

Seeded category and listing images can be replaced or removed the same way as user-uploaded ones. On replace/remove, the API destroys the previous Cloudinary `public_id` (best-effort; demo/seed assets that are not on your cloud are simply skipped by Cloudinary).

---

## Seed category images (FE one-shot)

The former local `public/images/{woman,man,electronics,…}.png` catalogue tiles are **not** served by the FE anymore.

One-shot seed (disk → Cloudinary → DB):

```bash
API_UPSTREAM_URL=http://HOST:3010 npm run seed:catalogue-images
# FORCE=1 to replace existing imageUrl rows
```

Script: `scripts/seed-catalogue-images.mjs` (expects assets under `scripts/catalogue-seed-assets/` when re-seeding). After a successful run, those local files are removed; the UI reads `imageUrl` from `GET /api/v1/catalog/categories` only.

---

## Storage split

| Asset | Storage | FE path |
|-------|---------|---------|
| Category / subcategory images | Cloudinary | Sign → upload → category create/patch |
| Listing product images | Cloudinary | Sign → upload → listing media POST/PATCH/DELETE |
| KYC / excel / PDFs | MinIO | `POST /api/v1/media/presign` (separate flow) |

---

## End-to-end upload flow

```
pick image
  → POST /api/v1/media/cloudinary-sign { folder: "listings" | "categories" }
  → POST multipart to sign.uploadUrl
       fields: file, api_key, timestamp, signature, folder
  → keep secure_url + public_id from Cloudinary JSON
  → attach / replace on listing or category (below)
```

---

## 1. Get a signed upload — POST `/api/v1/media/cloudinary-sign`

Auth: consumer **or** admin bearer.

**Request**

```json
{ "folder": "listings" }
```

`folder` must be `listings` or `categories`.

**Response 200**

```json
{
  "cloudName": "your-cloud",
  "apiKey": "123…",
  "timestamp": 1710000000,
  "signature": "…",
  "folder": "fripcash/listings/a1b2c3d4e5f67890",
  "uploadUrl": "https://api.cloudinary.com/v1_1/your-cloud/image/upload"
}
```

Use the returned `folder` as-is — do not invent a path.

---

## 2. Upload the file to Cloudinary

```ts
type CloudinarySign = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
};

type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

async function uploadCatalogueImage(
  file: File,
  folder: 'listings' | 'categories',
  api: { post: <T>(url: string, body: unknown) => Promise<{ data: T }> },
): Promise<CloudinaryUploadResult> {
  const { data: sign } = await api.post<CloudinarySign>(
    '/api/v1/media/cloudinary-sign',
    { folder },
  );

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  const res = await fetch(sign.uploadUrl, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(`Cloudinary upload failed: ${res.status}`);
  }

  const uploaded = (await res.json()) as CloudinaryUploadResult;
  return {
    secure_url: uploaded.secure_url,
    public_id: uploaded.public_id,
  };
}
```

After upload you have `secure_url` and `public_id` for the API calls below.

---

## 3. Listing photos

Auth: listing **owner** (consumer bearer).

Display: prefer `media[].url`. `media[].storageKey` is the Cloudinary `public_id`.

### Add — POST `/api/v1/listings/:id/media`

```ts
const uploaded = await uploadCatalogueImage(file, 'listings', api);

await api.post(`/api/v1/listings/${listingId}/media`, {
  publicId: uploaded.public_id,
  url: uploaded.secure_url,
  mimeType: file.type || 'image/jpeg',
  sortOrder: 0,
});
```

**Body**

```json
{
  "publicId": "fripcash/listings/…/photo",
  "url": "https://res.cloudinary.com/…/image/upload/…",
  "mimeType": "image/jpeg",
  "sortOrder": 0
}
```

### Replace — PATCH `/api/v1/listings/:id/media/:mediaId`

Works for seeded and user-uploaded media. Upload the **new** image first, then:

```ts
const uploaded = await uploadCatalogueImage(file, 'listings', api);

await api.patch(`/api/v1/listings/${listingId}/media/${mediaId}`, {
  publicId: uploaded.public_id,
  url: uploaded.secure_url,
  mimeType: file.type || 'image/jpeg',
  sortOrder: 0,
});
```

Same body shape as attach. When `publicId` changes, the API **destroys the previous** Cloudinary asset.

### Remove — DELETE `/api/v1/listings/:id/media/:mediaId`

```ts
await api.delete(`/api/v1/listings/${listingId}/media/${mediaId}`);
```

Deletes the row and **destroys** the Cloudinary asset (including seeded `public_id`s when they exist on your cloud).

---

## 4. Category / subcategory images

Auth: admin bearer for create/patch.

`GET /api/v1/catalog/categories` returns `imageUrl` and `imagePublicId` when set (including seed values).

### Set or replace — POST / PATCH `/api/v1/catalog/categories` / `:id`

Upload first, then send both fields. Replace works for seeded images too; previous `imagePublicId` is destroyed when it changes.

```ts
const uploaded = await uploadCatalogueImage(file, 'categories', api);

await api.patch(`/api/v1/catalog/categories/${categoryId}`, {
  // …other category fields required by your PATCH contract…
  imageUrl: uploaded.secure_url,
  imagePublicId: uploaded.public_id,
});
```

**Image fields**

```json
{
  "imageUrl": "https://res.cloudinary.com/…",
  "imagePublicId": "fripcash/categories/…/icon"
}
```

### Clear image

PATCH with both set to `null` (destroys the previous asset):

```json
{
  "imageUrl": null,
  "imagePublicId": null
}
```

---

## Checklist

1. Sign with `listings` or `categories` → upload multipart to `uploadUrl` using returned `folder` + signature fields  
2. **Listing add** → `POST /listings/:id/media` with `publicId`, `url`, `mimeType`  
3. **Listing replace** (seeded or not) → upload new → `PATCH /listings/:id/media/:mediaId`  
4. **Listing remove** → `DELETE /listings/:id/media/:mediaId`  
5. **Category set/replace** (seeded or not) → upload new → create/patch `imageUrl` + `imagePublicId`  
6. **Category clear** → patch both to `null`  
7. Render `media[].url` / `imageUrl` — do not build MinIO URLs for catalogue photos  
8. Do not PUT catalogue files through Nest or MinIO  
