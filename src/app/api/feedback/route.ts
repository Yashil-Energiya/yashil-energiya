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

interface FeedbackData {
  firstName: string;
  phone: string;
  email: string;
  message: string;
  captchaToken: string;
}

export const runtime = "nodejs";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "feedback-form",
});

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);

    const result = await ratelimit.limit(ip);

    if (!result.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = (await req.json()) as FeedbackData;
    // Echoed into the lead email HTML, so only known locales pass.
    const requestedLocale = req.headers.get("Content-Language");
    const locale = hasLocale(routing.locales, requestedLocale)
      ? requestedLocale
      : routing.defaultLocale;

    const { firstName, phone, email, message, captchaToken } = body;
    const fieldsError = leadFieldsError(body, [
      "firstName",
      "phone",
      "email",
      "message",
    ]);
    if (fieldsError || typeof captchaToken !== "string" || !captchaToken) {
      return NextResponse.json(
        { error: fieldsError ?? "Missing required fields" },
        { status: 400 },
      );
    }

    const safeFirstName = escapeHtml(firstName.trim());
    const safePhone = escapeHtml(phone.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br />");

    const captchaResult = await verifyTurnstile(
      captchaToken,
      serverEnv.turnstileSecretKey,
    );

    if (!captchaResult.success) {
      // Surface the real reason (e.g. invalid-input-secret, hostname-mismatch,
      // timeout-or-duplicate) so failures are diagnosable from server logs.
      console.error(
        "[feedback] Turnstile verification failed:",
        captchaResult["error-codes"],
      );
      return NextResponse.json(
        { error: "Captcha verification failed" },
        { status: 400 },
      );
    }
    const sent = await sendLeadMail({
      subject: `New feedback request from yashil-energiya.uz`,
      html: `
            <h2>New feedback request</h2>
            <p><strong>Name:</strong> ${safeFirstName}</p>
            <p><strong>Phone:</strong> ${safePhone}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Language:</strong> ${locale}</p>
            <p><strong>Message:</strong></p>
            <p>${safeMessage}</p>
          `,
      replyTo: email.trim().toLowerCase(),
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
