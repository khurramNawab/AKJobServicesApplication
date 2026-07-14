import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import "./cloudinary.js";

// Ensure the local temp uploads directory exists
const tempDir = path.join(process.cwd(), "temp_uploads");
const quarantineDir = path.join(tempDir, "quarantine");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
if (!fs.existsSync(quarantineDir)) {
  fs.mkdirSync(quarantineDir, { recursive: true });
}

// ─── Local Disk Storage ────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") {
      cb(null, quarantineDir);
    } else {
      cb(null, tempDir);
    }
  },
  filename: (req, file, cb) => {
    const baseName = file.originalname
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60); // max 60 chars
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

// ─── File Filter (Integrity and Mimetype Validation) ───────────────────────────
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "resume") {
    const allowedMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExt = [".pdf", ".doc", ".docx"];

    if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error("Only PDF, DOC, or DOCX files are allowed for resume."), false);
  }

  if (["avatar", "logo", "photo"].includes(file.fieldname)) {
    const allowedMime = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    const allowedExt = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

    if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error("Only JPG, PNG, WEBP, or HEIC images are allowed."), false);
  }

  if (file.fieldname === "video") {
    const allowedVideoExts = [".mp4", ".mkv", ".avi", ".mov", ".wmv", ".webm"];
    if (file.mimetype.startsWith("video/") || allowedVideoExts.includes(ext)) {
      return cb(null, true);
    }
    return cb(new Error(`Only video files are allowed. Got ${ext} file.`), false);
  }

  cb(new Error(`Unexpected field: ${file.fieldname}`), false);
};

// ─── Simulated Antivirus / Malware Signature Scanner ─────────────────────────────
const scanFileForMalware = (filePath) => {
  try {
    const fd = fs.openSync(filePath, "r");
    const buffer = Buffer.alloc(2048);
    const bytesRead = fs.readSync(fd, buffer, 0, 2048, 0);
    fs.closeSync(fd);

    const fileContent = buffer.toString("utf8", 0, bytesRead);

    // Signatures of scripts and executable binaries
    const maliciousSignatures = [
      "<?php",
      "<script",
      "#!/bin/bash",
      "#!/bin/sh",
      "#!/usr/bin/env",
      "eval(",
      "exec(",
      "system("
    ];

    for (const sig of maliciousSignatures) {
      if (fileContent.includes(sig)) {
        return { infected: true, reason: `Malicious script signature found (${sig})` };
      }
    }

    // Check magic bytes for PE executable (MZ header)
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return { infected: true, reason: "Malicious PE Executable (MZ header) detected" };
    }

    // Check magic bytes for ELF binary
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return { infected: true, reason: "Malicious ELF Binary detected" };
    }

    return { infected: false };
  } catch (err) {
    console.error("[Antivirus Mock] Error scanning file:", err.message);
    return { infected: false }; // Non-blocking fail-safe
  }
};

// ─── Cloudinary Retry Manager with Exponential Backoff ────────────────────────────
const uploadWithRetry = async (filePath, options, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const isVideo = options.resource_type === 'video';
      const result = isVideo 
        ? await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_large(filePath, options, (error, uploadResult) => {
              if (error) return reject(error);
              resolve(uploadResult);
            });
          })
        : await cloudinary.uploader.upload(filePath, options);
      return result;
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(
        `[Cloudinary Upload] Attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${error.message}`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // exponential backoff
    }
  }
};

// ─── Wrapped Multer Instance with Secure Upload Flow ────────────────────────────────
const multerInstance = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5 GB global Multer limit for videos
  },
});

const upload = {
  single: (fieldname) => {
    const multerMiddleware = multerInstance.single(fieldname);
    return (req, res, next) => {
      multerMiddleware(req, res, async (err) => {
        if (err) {
          console.error(`[Multer Error] Field: ${fieldname} | Error: ${err.message} | Content-Type: ${req.headers['content-type']}`);
          return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`,
          });
        }

        if (!req.file) {
          return next();
        }

        const localPath = req.file.path;

        try {
          // 1. Local Malware Signature Scan
          const scanResult = scanFileForMalware(localPath);
          if (scanResult.infected) {
            try { fs.unlinkSync(localPath); } catch {}
            return res.status(400).json({
              success: false,
              message: `Security validation failed: ${scanResult.reason}`,
            });
          }

          // 2. Exact size validations on host
          const fileSize = req.file.size;
          if (fieldname === "resume" && fileSize > 300 * 1024) {
            try { fs.unlinkSync(localPath); } catch {}
            return res.status(400).json({
              success: false,
              message: `Resume too large. Maximum size is 300 kb not more than that. (Your file is ${Math.round(fileSize / 1024)} KB.)`,
            });
          }

          if (["avatar", "logo"].includes(fieldname) && fileSize > 2 * 1024 * 1024) {
            try { fs.unlinkSync(localPath); } catch {}
            return res.status(400).json({
              success: false,
              message: `Image too large. Maximum size is 2 MB. (Your file is ${(fileSize / (1024 * 1024)).toFixed(2)} MB.)`,
            });
          }

           if (fieldname === "photo" && fileSize > 5 * 1024 * 1024) {
            try { fs.unlinkSync(localPath); } catch {}
            return res.status(400).json({
              success: false,
              message: `Workspace image too large. Maximum size is 5 MB. (Your file is ${(fileSize / (1024 * 1024)).toFixed(2)} MB.)`,
            });
          }



          // 3. SPECIAL HANDLING FOR ASYNC QUEUE RESUME UPLOADS:
          // Bypass synchronous Cloudinary upload. CandidateController will enqueue it.
          if (fieldname === "resume") {
            req.file.quarantinePath = localPath;
            return next(); // Proceed directly to controller!
          }

          // 4. Prepare Cloudinary options based on field type
          let folder = "jobportal/avatars";
          let resourceType = "image";
          let transformation = [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" },
          ];

          if (fieldname === "video") {
            folder = "jobportal/videos";
            resourceType = "video";
            transformation = [
              { quality: "auto" },
              { fetch_format: "auto" }
            ];
          }

          const uploadOptions = {
            folder,
            resource_type: resourceType,
            public_id: path.basename(localPath, path.extname(localPath)),
            transformation: transformation
          };

          // 5. Secure upload to Cloudinary using retry manager
          const result = await uploadWithRetry(localPath, uploadOptions);

          // 6. Replace local disk path with the Cloudinary secure CDN URL
          req.file.path = result.secure_url;
          req.file.cloudinary_public_id = result.public_id;

        } catch (uploadError) {
          console.error("[Multer Cloudinary Wrapper] Upload failed:", uploadError);
          return res.status(500).json({
            success: false,
            message: `Cloudinary upload failed: ${uploadError.message}`,
          });
        } finally {
          // 7. Mandatory local file cleanup for synchronous image uploads
          if (fieldname !== "resume" && fs.existsSync(localPath)) {
            try {
              fs.unlinkSync(localPath);
              console.log(`[Multer Local Buffering] Safely deleted temp buffered file: ${localPath}`);
            } catch (cleanupError) {
              console.error("[Multer Local Buffering] Cleanup failed for file:", cleanupError.message);
            }
          }
        }

        next();
      });
    };
  },
};

export default upload;
