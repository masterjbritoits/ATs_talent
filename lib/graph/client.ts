import { env } from "@/lib/utils/env";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

async function graphFetch(path: string, init?: RequestInit) {
  const token = env("MICROSOFT_CLIENT_SECRET");
  if (!token) {
    throw new Error("Microsoft Graph is not configured.");
  }

  const response = await fetch(`${GRAPH_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Graph API error: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listMailboxMessages() {
  return graphFetch(
    `/users/${encodeURIComponent(env("MICROSOFT_USER_EMAIL", "careers@itsector.pt"))}/mailFolders/inbox/messages?$top=25&$orderby=receivedDateTime desc`
  );
}

export async function sendGraphEmail(payload: {
  to: string[];
  subject: string;
  body: string;
}) {
  return graphFetch(
    `/users/${encodeURIComponent(env("MICROSOFT_USER_EMAIL", "careers@itsector.pt"))}/sendMail`,
    {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: payload.subject,
          body: { contentType: "Text", content: payload.body },
          toRecipients: payload.to.map((address) => ({
            emailAddress: { address }
          }))
        }
      })
    }
  );
}

export async function createGraphCalendarEvent(payload: {
  subject: string;
  start: string;
  end: string;
  attendees: string[];
  location?: string;
  body?: string;
}) {
  return graphFetch(
    `/users/${encodeURIComponent(env("MICROSOFT_USER_EMAIL", "careers@itsector.pt"))}/events`,
    {
      method: "POST",
      body: JSON.stringify({
        subject: payload.subject,
        start: { dateTime: payload.start, timeZone: "Europe/Lisbon" },
        end: { dateTime: payload.end, timeZone: "Europe/Lisbon" },
        location: payload.location ? { displayName: payload.location } : undefined,
        body: payload.body ? { contentType: "Text", content: payload.body } : undefined,
        attendees: payload.attendees.map((address) => ({
          emailAddress: { address },
          type: "required"
        }))
      })
    }
  );
}
