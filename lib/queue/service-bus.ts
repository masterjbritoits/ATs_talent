/**
 * Azure Service Bus client factory and queue helpers.
 *
 * Queue names are defined here and must match the queues provisioned in Azure.
 * When SERVICE_BUS_CONNECTION_STRING is not set (e.g. local dev without
 * Service Bus emulator) calls are silently no-ops and the caller falls back
 * to synchronous processing.
 */
import { ServiceBusClient, ServiceBusSender } from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";

export const QUEUES = {
  MAILBOX_SYNC: "mailbox-sync",
  ATTACHMENT_PROCESSING: "attachment-processing",
  RESCORE: "rescore-application",
  EXPORT: "export-candidates",
  NOTIFICATION: "recruiter-notification"
} as const;

let _sbClient: ServiceBusClient | null = null;
const _senders = new Map<string, ServiceBusSender>();

function getServiceBusClient(): ServiceBusClient | null {
  if (_sbClient) return _sbClient;

  const connStr = process.env.SERVICE_BUS_CONNECTION_STRING;
  if (connStr) {
    _sbClient = new ServiceBusClient(connStr);
    return _sbClient;
  }

  const namespace = process.env.AZURE_SERVICE_BUS_NAMESPACE;
  if (namespace) {
    const credential = new DefaultAzureCredential();
    _sbClient = new ServiceBusClient(
      `${namespace}.servicebus.windows.net`,
      credential
    );
    return _sbClient;
  }

  return null; // Service Bus not configured — fall back to sync processing
}

function getSender(queue: string): ServiceBusSender | null {
  const client = getServiceBusClient();
  if (!client) return null;

  if (!_senders.has(queue)) {
    _senders.set(queue, client.createSender(queue));
  }
  return _senders.get(queue)!;
}

/**
 * Enqueues a message. Returns true when successfully enqueued, false when
 * Service Bus is not configured (caller should fall back to synchronous path).
 */
export async function enqueueMessage<T extends Record<string, unknown>>(
  queue: (typeof QUEUES)[keyof typeof QUEUES],
  body: T,
  options?: { sessionId?: string; messageId?: string; scheduledEnqueueTimeUtc?: Date }
): Promise<boolean> {
  const sender = getSender(queue);
  if (!sender) return false;

  await sender.sendMessages({
    body,
    messageId: options?.messageId,
    sessionId: options?.sessionId,
    scheduledEnqueueTimeUtc: options?.scheduledEnqueueTimeUtc,
    applicationProperties: { enqueuedAt: new Date().toISOString() }
  });

  return true;
}

/** Convenience helper: enqueue a mailbox-sync trigger. */
export async function enqueueMailboxSync(payload: {
  triggeredBy: "manual" | "timer" | "webhook";
  userId?: string;
}): Promise<boolean> {
  return enqueueMessage(QUEUES.MAILBOX_SYNC, {
    ...payload,
    requestedAt: new Date().toISOString()
  });
}

/** Convenience helper: enqueue a specific attachment for async processing. */
export async function enqueueAttachmentProcessing(payload: {
  attachmentId: string;
  candidateKey: string;
  blobPath: string;
  mimeType: string;
}): Promise<boolean> {
  return enqueueMessage(QUEUES.ATTACHMENT_PROCESSING, payload, {
    messageId: `attachment-${payload.attachmentId}`
  });
}

/** Convenience helper: enqueue a rescore request for an application. */
export async function enqueueRescore(payload: {
  candidateId: string;
  jobId: string;
  applicationId: string;
}): Promise<boolean> {
  return enqueueMessage(QUEUES.RESCORE, payload, {
    messageId: `rescore-${payload.applicationId}`
  });
}
