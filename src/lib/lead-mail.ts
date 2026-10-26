import "server-only";
import { ConfidentialClientApplication } from "@azure/msal-node";
import { serverEnv } from "@/lib/server-env";

// Shared by the lead forms (/api/feedback, /api/calculator-request).

const msalClient = new ConfidentialClientApplication({
  auth: {
    clientId: serverEnv.msClientId,
    authority: `https://login.microsoftonline.com/${serverEnv.msTenantId}`,
    clientSecret: serverEnv.msClientSecret,
  },
});

async function getAccessToken() {
  const tokenResponse = await msalClient.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });

  if (!tokenResponse?.accessToken) {
    throw new Error("Failed to acquire Microsoft Graph access token");
  }

  return tokenResponse.accessToken;
}

// Sends the lead to the corporate mailbox via Microsoft Graph; false on a Graph error.
export async function sendLeadMail({
  subject,
  html,
  replyTo,
}: {
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const accessToken = await getAccessToken();

  const emailPayload = {
    message: {
      subject,
      body: { contentType: "HTML", content: html },
      toRecipients: [{ emailAddress: { address: serverEnv.msRecipientEmail } }],
      ...(replyTo ? { replyTo: [{ emailAddress: { address: replyTo } }] } : {}),
    },
    saveToSentItems: true,
  };

  const graphResponse = await fetch(
    `https://graph.microsoft.com/v1.0/users/${serverEnv.msSenderEmail}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!graphResponse.ok) {
    console.error("Microsoft Graph error:", await graphResponse.text());
    return false;
  }

  return true;
}
