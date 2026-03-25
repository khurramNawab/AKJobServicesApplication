import multer from "multer";
import { storage } from "./firebase.js";
import { getDownloadURL } from "firebase-admin/storage";

// Multer Memory Storage Configuration
const memoryStorage = multer.memoryStorage();

/**
 * File Filter Configuration for Security
 */
const fileFilter = (req, file, cb) => {
  console.log("MULTER RECEIVED FILE:", file.fieldname, file.mimetype, file.originalname);
  
  if (file.fieldname === "resume") {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    return allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only PDF, DOC, DOCX allowed for resume"), false);
  }

  if (file.fieldname === "avatar" || file.fieldname === "logo" || file.fieldname === "photo") {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    return allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, JPEG, PNG allowed for images"), false);
  }

  cb(new Error(`Unexpected field name: ${file.fieldname || 'undefined'}`), false);
};

// Multer Upload Instance
const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: 250 * 1024, // 250KB limit for industrial storage optimization
  },
});

/**
 * Utility Function for Firebase Storage Upload
 * @param {Object} file - The file object from Multer memoryStorage
 * @param {String} folder - Target folder in Firebase Storage bucket
 */
export const uploadToFirebase = async (file, folder) => {
  try {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const fileRef = storage.file(fileName);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Make the file publicly accessible and get the signed URL
    // (In Firebase Admin, you usually get a signed URL or make the public bucket perm public)
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error("Firebase Storage Upload Error:", error);
    throw error;
  }
};

export default upload;
