"use client";

import { uploadFiles, authHeaders } from "@/lib/uploadthing";
import { api } from "./client";

export type CloudinaryFolder = "listings" | "categories" | "excel" | "kyc" | "disputes";

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
};

export type UploadThingEndpoint =
  | "profileImage"
  | "listingImage"
  | "categoryImage"
  | "kycDocument"
  | "excelCatalog"
  | "disputeFile";

function endpointForFolder(folder: CloudinaryFolder): UploadThingEndpoint {
  if (folder === "categories") return "categoryImage";
  if (folder === "excel") return "excelCatalog";
  if (folder === "kyc") return "kycDocument";
  if (folder === "disputes") return "disputeFile";
  return "listingImage";
}

export async function uploadViaUploadThing(
  endpoint: UploadThingEndpoint,
  file: File,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  try {
    const uploaded = await uploadFiles(endpoint, {
      files: [file],
      headers: authHeaders(),
      onUploadProgress: ({ progress }) => {
        onProgress?.(Math.round(progress));
      },
    });
    const fileRes = uploaded[0];
    if (!fileRes) throw new Error("Upload échoué");
    const url = fileRes.ufsUrl || fileRes.url;
    if (!url) throw new Error("URL UploadThing manquante");
    return {
      secure_url: url,
      public_id: fileRes.key,
    };
  } catch {
    return uploadViaApi(file, "listings", onProgress);
  }
}

async function uploadViaApi(
  file: File,
  folder: string,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  const { data } = await api.post(
    "/media/upload",
    {
      filename: file.name,
      mimeType: file.type || "image/jpeg",
      dataBase64,
      folder,
    },
    {
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
      },
    }
  );
  const url = data.secure_url || data.url;
  if (!url) throw new Error("Upload échoué");
  onProgress?.(100);
  return {
    secure_url: url,
    public_id: data.public_id || data.publicId,
  };
}

export async function uploadCatalogueImage(
  file: File,
  folder: CloudinaryFolder = "listings",
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  return uploadViaUploadThing(endpointForFolder(folder), file, onProgress);
}

export async function uploadProfileImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<CloudinaryUploadResult> {
  return uploadViaUploadThing("profileImage", file, onProgress);
}
