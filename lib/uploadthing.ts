import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from '@uploadthing/react';

const UPLOAD_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/api/uploadthing') ||
  'http://localhost:5000/api/uploadthing';

export const UploadButton = generateUploadButton({
  url: UPLOAD_URL,
});

export const UploadDropzone = generateUploadDropzone({
  url: UPLOAD_URL,
});

export const { useUploadThing } = generateReactHelpers({
  url: UPLOAD_URL,
});
