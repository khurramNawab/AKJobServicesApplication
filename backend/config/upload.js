import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import "./cloudinary.js";

// ─── Cloudinary Storage ────────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isResume = file.fieldname === "resume";

    const folder = isResume ? "jobportal/resumes" : "jobportal/avatars";

    // Sanitize: strip extension + special chars from original filename
    const baseName = file.originalname
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 60); // max 60 chars

    const public_id = `${Date.now()}-${baseName}`;

    if (isResume) {
      return {
        folder,
        resource_type: "raw",   // raw = store as-is (PDF/DOCX binary)
        public_id,
        // ⚠️  Do NOT set format:'pdf' here — it forces re-encoding which
        //     (a) breaks DOCX files and (b) is not available on free Cloudinary plans.
        //     The URL returned will still work for Google Docs Viewer.
      };
    }

    // Images (avatar / logo / photo)
    return {
      folder,
      resource_type: "auto",
      public_id,
      transformation: [
        { width: 800, height: 800, crop: "limit" }, // resize large images
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ],
    };
  },
});

// ─── File Filter ───────────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  console.log("MULTER FILE:", file.fieldname, file.mimetype, file.originalname);

  if (file.fieldname === "resume") {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only PDF, DOC, or DOCX files are allowed for resume."), false);
  }

  if (["avatar", "logo", "photo"].includes(file.fieldname)) {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("Only JPG, PNG, WEBP, or HEIC images are allowed."), false);
  }

  cb(new Error(`Unexpected field: ${file.fieldname}`), false);
};

// ─── Multer Instance ───────────────────────────────────────────────────────────
// Global limit: 10MB. Per-field size validation is done in the controller.
// (Multer's global limit must be >= the largest file type you accept.)
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB hard cap — controller enforces stricter limits
  },
});

export default upload;
