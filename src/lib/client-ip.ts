import type { NextRequest } from "next/server";

// cf-connecting-ip is the real visitor behind Cloudflare. It is trusted only
// because the origin takes traffic from Cloudflare alone (Tunnel or firewall,
// see docs/self-hosting.md); an origin open to the internet would let clients
// forge it and dodge the rate limit.
export function clientIp(req: NextRequest) {
  return (
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
