// Server-side check of a Cloudflare Turnstile token, shared by the lead forms
// and the assistant. A hung Cloudflare call fails the request instead of
// holding the function until the platform timeout.
export async function verifyTurnstile(
  token: string,
  secret: string,
): Promise<{ success: boolean; "error-codes"?: string[] }> {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10_000),
    },
  );

  return response.json();
}
