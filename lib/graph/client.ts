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

const MAILBOX_USER = () =>
  encodeURIComponent(env("MICROSOFT_USER_EMAIL", "careers@itsector.pt"));

/**
 * Lists inbox messages.
 * Uses $deltaToken / $skipToken for incremental sync when `deltaLink` is
 * provided, otherwise fetches the most recent 50 messages.
 */
export async function listMailboxMessages(options?: {
  deltaLink?: string;
  top?: number;
}): Promise<{ value: any[]; "@odata.deltaLink"?: string; "@odata.nextLink"?: string }> {
  if (options?.deltaLink) {
    return graphFetch(options.deltaLink.replace(GRAPH_BASE, ""));
  }

  const top = options?.top ?? 50;
  return graphFetch(
    `/users/${MAILBOX_USER()}/mailFolders/inbox/messages?$top=${top}&$orderby=receivedDateTime desc&$expand=attachments($select=id,name,contentType,size,isInline)&$select=id,internetMessageId,conversationId,subject,from,toRecipients,ccRecipients,body,bodyPreview,receivedDateTime,hasAttachments,internetMessageHeaders`
  );
}

/**
 * Fetches full attachment content (base64) for a specific message attachment.
 * Only fetches when the attachment is not inline and has a supported MIME type.
 */
export async function getAttachmentContent(
  messageId: string,
  attachmentId: string
): Promise<{ contentBytes: string; contentType: string; name: string } | null> {
  try {
    const data = await graphFetch(
      `/users/${MAILBOX_USER()}/messages/${messageId}/attachments/${attachmentId}`
    );
    return {
      contentBytes: data?.contentBytes ?? "",
      contentType: data?.contentType ?? "application/octet-stream",
      name: data?.name ?? "attachment"
    };
  } catch {
    return null;
  }
}

export async function sendGraphEmail(payload: {
  to: string[];
  subject: string;
  body: string;
}) {
  return graphFetch(
    `/users/${MAILBOX_USER()}/sendMail`,
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
    `/users/${MAILBOX_USER()}/events`,
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

