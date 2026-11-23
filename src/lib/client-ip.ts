import type { NextRequest } from "next/server";

// cf-connecting-ip is trusted only because the front proxy overwrites it with
// the real visitor address (or Cloudflare sets it); see docs/self-hosting.md.
// If the proxy passes it through, clients can forge it and dodge the rate limit.
export function clientIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
