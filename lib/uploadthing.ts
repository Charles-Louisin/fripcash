import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";
import { readToken } from "@/lib/api/client";

const UPLOAD_URL =
  process.env.NEXT_PUBLIC_UPLOADTHING_URL ||
  "http://localhost:5000/api/uploadthing";

function authHeaders(): Record<string, string> {
  const token = readToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const UploadButton = generateUploadButton({
  url: UPLOAD_URL,
});

export const UploadDropzone = generateUploadDropzone({
  url: UPLOAD_URL,
});

export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: UPLOAD_URL,
});

export { authHeaders };
