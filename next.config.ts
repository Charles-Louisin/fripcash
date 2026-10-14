import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.utfs.io",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/produits", destination: "/recherche", permanent: true },
      { source: "/produits/:path*", destination: "/recherche", permanent: true },
    ];
  },
  async rewrites() {
    const upstream = process.env.API_UPSTREAM_URL || "";
    const api = process.env.NEXT_PUBLIC_API_URL || "";
    const absolute = [upstream, api, "http://127.0.0.1:5000"].find((value) =>
      /^https?:\/\//.test(value)
    )!;
    const origin = absolute.replace(/\/$/, "").replace(/\/api\/v1\/?$/, "");
    return [{ source: "/uploads/:path*", destination: `${origin}/uploads/:path*` }];
  },
};

export default nextConfig;
