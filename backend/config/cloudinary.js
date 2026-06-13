import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete a file from Cloudinary by its URL.
 * Works for resource_type: 'raw' (resumes) and 'image' (photos).
 */
export const deleteCloudinaryFile = async (url, resourceType = 'raw') => {
  if (!url || !url.includes('cloudinary.com')) return;
  try {
    // Extract public_id from URL: everything between /upload/v<version>/ and the end (no extension for raw)
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (!match) return;
    const publicId = match[1];
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[Cloudinary] Deleted old file: ${publicId}`);
  } catch (err) {
    // Non-fatal — log but don't block the response
    console.warn('[Cloudinary] Could not delete old file:', err.message);
  }
};

export default cloudinary;
