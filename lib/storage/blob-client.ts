/**
 * Azure Blob Storage client factory.
 *
 * Uses DefaultAzureCredential (Managed Identity in production, developer CLI
 * or env credentials locally) when AZURE_STORAGE_ACCOUNT_NAME is set.
 * Falls back to a connection-string when AZURE_STORAGE_CONNECTION_STRING is
 * set (useful for local dev with Azurite).
 */
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlockBlobClient
} from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

let _blobServiceClient: BlobServiceClient | null = null;

function getBlobServiceClient(): BlobServiceClient {
  if (_blobServiceClient) return _blobServiceClient;

  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (connStr) {
    _blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
    return _blobServiceClient;
  }

  const account = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (account) {
    const credential = new DefaultAzureCredential();
    _blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net`,
      credential
    );
    return _blobServiceClient;
  }

  throw new Error(
    "Azure Blob Storage is not configured. " +
      "Set AZURE_STORAGE_ACCOUNT_NAME (production, uses Managed Identity) " +
      "or AZURE_STORAGE_CONNECTION_STRING (local dev with Azurite)."
  );
}

/** Container name normalised from a logical storage directory key. */
const CONTAINER_MAP: Record<string, string> = {
  "storage/raw-emails": "raw-emails",
  "storage/attachments": "attachments",
  "storage/processed": "processed",
  "storage/ocr": "ocr",
  "storage/exports": "exports",
  "storage/temp": "temp"
};

function resolveContainer(relativePath: string): { container: string; blobName: string } {
  for (const [prefix, container] of Object.entries(CONTAINER_MAP)) {
    const normalized = relativePath.replace(/\\/g, "/");
    if (normalized.startsWith(prefix + "/")) {
      return {
        container,
        blobName: normalized.slice(prefix.length + 1)
      };
    }
  }
  // Fallback: use first path segment as container
  const parts = relativePath.replace(/\\/g, "/").split("/");
  return { container: parts[0], blobName: parts.slice(1).join("/") };
}

/** Upload a buffer or string to Azure Blob Storage. */
export async function uploadBlob(
  relativePath: string,
  content: Buffer | string
): Promise<string> {
  const { container, blobName } = resolveContainer(relativePath);
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  const data = typeof content === "string" ? Buffer.from(content) : content;
  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: { blobContentType: detectContentType(blobName) }
  });

  return blockBlobClient.url;
}

/** Download a blob as a Buffer. Returns null if the blob does not exist. */
export async function downloadBlob(relativePath: string): Promise<Buffer | null> {
  const { container, blobName } = resolveContainer(relativePath);
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    const response = await blockBlobClient.downloadToBuffer();
    return response;
  } catch (err: any) {
    if (err?.statusCode === 404) return null;
    throw err;
  }
}

/** Check whether a blob exists. */
export async function blobExists(relativePath: string): Promise<boolean> {
  const { container, blobName } = resolveContainer(relativePath);
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  return containerClient.getBlockBlobClient(blobName).exists();
}

/** Delete a blob. No-op if not found. */
export async function deleteBlob(relativePath: string): Promise<void> {
  const { container, blobName } = resolveContainer(relativePath);
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  await containerClient.getBlockBlobClient(blobName).deleteIfExists();
}

/** Generate a short-lived SAS URL for secure recruiter downloads. */
export async function generateBlobSasUrl(
  relativePath: string,
  expiresInMinutes = 15
): Promise<string> {
  const { container, blobName } = resolveContainer(relativePath);
  const client = getBlobServiceClient();
  const containerClient = client.getContainerClient(container);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // UserDelegationKey-based SAS when using Managed Identity / DefaultAzureCredential
  const expiresOn = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  const sasUrl = await blockBlobClient.generateSasUrl({
    permissions: { read: true } as any,
    expiresOn
  });
  return sasUrl;
}

function detectContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  };
  return types[ext ?? ""] ?? "application/octet-stream";
}
