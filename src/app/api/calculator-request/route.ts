import { NextRequest, NextResponse } from "next/server";
import { clientIp } from "@/lib/client-ip";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/server-env";
import { escapeHtml } from "@/lib/html";
import { leadFieldsError } from "@/lib/lead-limits";
import { sendLeadMail } from "@/lib/lead-mail";
import { verifyTurnstile } from "@/lib/turnstile";

// Dedicated endpoint for solar-calculator lead requests.
// Sends through the project's mail integration — Microsoft Graph
// (@azure/msal-node → graph.microsoft.com/sendMail), NOT the Resend service —
// behind the same protections as the feedback form: Upstash rate limit +
// Cloudflare Turnstile, delivering to the corporate mailbox (serverEnv from env).
// Email is optional here; all other contact/calculation fields are required.

interface CalculatorRequestData {
  firstName: string;
  phone: string;
  email?: string;
  captchaToken: string;
  consumerType: string;
  annualConsumptionKwh: number;
  region: string;
  coveragePercent: number;
  includeBESS: boolean;
  recommendedKwp: number;
}

export const runtime = "nodejs";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "calculator-request",
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const result = await ratelimit.limit(ip);

    if (!result.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as CalculatorRequestData;
    // Echoed into the lead email HTML, so only known locales pass.
    const requestedLocale = req.headers.get("Content-Language");
    const locale = hasLocale(routing.locales, requestedLocale)
      ? requestedLocale
      : routing.defaultLocale;

    const {
      firstName,
      phone,
      email,
      captchaToken,
      consumerType,
      annualConsumptionKwh,
      region,
      coveragePercent,
      includeBESS,
      recommendedKwp,
    } = body;

    const fieldsError = leadFieldsError(body, ["firstName", "phone"]);
    if (fieldsError || typeof captchaToken !== "string" || !captchaToken) {
      return NextResponse.json(
        { error: fieldsError ?? "Missing required fields" },
        { status: 400 },
      );
    }

    if (
      (typeof consumerType === "string" && consumerType.length > 100) ||
      (typeof region === "string" && region.length > 150)
    ) {
      return NextResponse.json({ error: "Input is too long" }, { status: 400 });
    }

    const trimmedEmail = email?.trim() ?? "";

    const captchaResult = await verifyTurnstile(
      captchaToken,
      serverEnv.turnstileSecretKey,
    );

    if (!captchaResult.success) {
      // Surface the real reason (e.g. invalid-input-secret, hostname-mismatch,
      // timeout-or-duplicate) so failures are diagnosable from server logs.
      console.error(
        "[calculator-request] Turnstile verification failed:",
        captchaResult["error-codes"],
      );
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 },
      );
    }

    const toNumber = (value: unknown) =>
      Number.isFinite(Number(value)) ? Number(value) : 0;

    const safeFirstName = escapeHtml(firstName.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeEmail = trimmedEmail ? escapeHtml(trimmedEmail) : "—";
    const safeConsumerType = escapeHtml(String(consumerType ?? "").trim());
    const safeRegion = escapeHtml(String(region ?? "").trim());
    const annual = Math.round(toNumber(annualConsumptionKwh));
    const coverage = Math.round(toNumber(coveragePercent));
    const kwp = toNumber(recommendedKwp).toFixed(1);
    const bess = includeBESS ? "Да / Yes" : "Нет / No";

    const sent = await sendLeadMail({
      subject: "New solar calculator request from yashil-energiya.uz",
      html: `
            <h2>New solar calculator request</h2>
            <p><strong>Name:</strong> ${safeFirstName}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Language:</strong> ${locale}</p>
            <hr />
            <h3>Calculation parameters</h3>
            <p><strong>Consumer type:</strong> ${safeConsumerType}</p>
            <p><strong>Annual consumption:</strong> ${annual} kWh</p>
            <p><strong>Region:</strong> ${safeRegion}</p>
            <p><strong>Coverage:</strong> ${coverage}%</p>
            <p><strong>Battery storage (BESS):</strong> ${bess}</p>
            <p><strong>Recommended power:</strong> ${kwp} kW</p>
          `,
      replyTo: trimmedEmail.toLowerCase(),
    });

    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
