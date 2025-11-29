import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// Cloudflare R2 configuration - will be initialized when first needed
let s3Client: S3Client | null = null;
let config: {
  bucketName: string;
  publicUrl: string;
} | null = null;

/**
 * Initialize the S3 client and configuration
 */
async function initializeS3Client(): Promise<{
  client: S3Client;
  bucketName: string;
  publicUrl: string;
}> {
  if (s3Client && config) {
    return { client: s3Client, ...config };
  }

  const accessKeyId = process.env.S3_ACCESS_KEY || '';
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || '';
  const bucketName = process.env.S3_BUCKET_NAME || '';
  const endpointUrl = process.env.S3_ENDPOINT_URL || '';
  const publicUrl = process.env.S3_PUBLIC_URL || '';

  s3Client = new S3Client({
    region: "auto", // Cloudflare R2 uses "auto" as region
    endpoint: endpointUrl,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  config = { bucketName, publicUrl };

  return { client: s3Client, bucketName, publicUrl };
}

/**
 * Uploads base64 encoded data to Cloudflare R2
 * @param base64Data - Base64 encoded file data (can include data URL prefix)
 * @param s3Key - Full S3 key path for the file (e.g., "env/characters/id/fileType/timestamp_filename")
 * @param contentType - MIME type of the file
 * @returns Promise<string> - The R2 URL of the uploaded file
 */
export async function uploadBase64ToS3(
  base64Data: string,
  s3Key: string,
  contentType: string
): Promise<string> {
  try {
    const { client, bucketName, publicUrl } = await initializeS3Client();

    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");

    // Decode base64 to binary using Node.js Buffer
    const binaryData = Buffer.from(cleanBase64, 'base64');

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: binaryData,
      ContentType: contentType,
      // Note: Cloudflare R2 doesn't use ACL, public access is configured at bucket level
    });

    await client.send(command);

    // Return the public URL for Cloudflare R2
    return `${publicUrl}/${s3Key}`;
  } catch (error) {
    console.error("Error uploading to Cloudflare R2:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to upload file to Cloudflare R2: ${errorMessage}`);
  }
}

/**
 * Deletes a file from Cloudflare R2
 * @param s3Key - The full S3 key path of the file to delete
 * @returns Promise<boolean> - True if deletion was successful
 */
export async function deleteFileFromR2(s3Key: string): Promise<boolean> {
  try {
    const { client, bucketName } = await initializeS3Client();

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    });

    await client.send(command);
    console.log(`Successfully deleted file from R2: ${s3Key}`);
    return true;
  } catch (error) {
    console.error("Error deleting file from Cloudflare R2:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete file from Cloudflare R2: ${errorMessage}`);
    return false;
  }
}

/**
 * Extracts R2 URLs from a message body object
 * @param body - The message body object
 * @returns string[] - Array of R2 URLs found in the body
 */
export async function extractR2UrlsFromBody(body: Record<string, unknown>): Promise<string[]> {
  const { publicUrl } = await initializeS3Client();

  const r2Urls: string[] = [];
  const mediaFields = [
    "photo",
    "audio",
    "video",
    "document",
    "voice",
    "video_note",
  ];

  for (const field of mediaFields) {
    const value = body[field];
    if (typeof value === "string" && value.includes(publicUrl)) {
      r2Urls.push(value);
    }
  }

  return r2Urls;
}

/**
 * Checks if a string is a base64 encoded data URL
 * @param data - The string to check
 * @returns boolean - True if it's a base64 data URL
 */
export function isBase64DataUrl(data: string): boolean {
  return /^data:[^;]+;base64,/.test(data);
}

/**
 * Checks if a string is a plain base64 string (without data URL prefix)
 * @param data - The string to check
 * @returns boolean - True if it appears to be base64
 */
export function isBase64String(data: string): boolean {
  if (isBase64DataUrl(data)) return true;

  // Check if it's a valid base64 string
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(data) && data.length % 4 === 0 && data.length > 10;
}

/**
 * Checks if a string is a URL
 * @param data - The string to check
 * @returns boolean - True if it's a URL
 */
export function isUrl(data: string): boolean {
  try {
    new URL(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the appropriate MIME type based on file extension or data URL
 * @param filename - The filename or data URL
 * @returns string - The MIME type
 */
export function getMimeType(filename: string): string {
  // If it's a data URL, extract the MIME type
  if (isBase64DataUrl(filename)) {
    const match = filename.match(/^data:([^;]+);base64,/);
    if (match) return match[1];
  }

  // Otherwise, determine from file extension
  const ext = filename.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    avi: "video/avi",
    mov: "video/quicktime",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    txt: "text/plain",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}