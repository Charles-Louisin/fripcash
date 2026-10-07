import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM =
  process.env.API_UPSTREAM_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:5000";

const HOP_BY_HOP = new Set([
  "connection",
  "content-length",
  "content-encoding",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "origin",
  "referer",
  "accept-encoding",
]);

async function proxy(req: NextRequest, path: string[]) {
  const upstreamPath = `/api/v1/${path.join("/")}`;
  const url = new URL(upstreamPath, `${UPSTREAM}/`);
  url.search = req.nextUrl.search;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  // Deployed Better Auth trusts the API host origin, not localhost.
  headers.set("origin", UPSTREAM);
  // Node fetch decompresses gzip; forwarding Content-Encoding: gzip would
  // make the browser try to inflate already-plain JSON (empty homepage).
  headers.set("accept-encoding", "identity");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }

  let upstream: Response;
  try {
    upstream = await fetch(url, init);
  } catch {
    return NextResponse.json(
      {
        statusCode: 502,
        code: "API_UNREACHABLE",
        message:
          "Le backend n’est pas joignable sur le port 5000. Lance `npm run dev` dans /backend.",
        locale: "FR",
      },
      { status: 502 }
    );
  }
  const outHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    // Avoid leaking upstream CORS headers into same-origin responses
    if (key.toLowerCase().startsWith("access-control-")) return;
    outHeaders.set(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: outHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
