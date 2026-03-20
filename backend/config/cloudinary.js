import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";




// console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME),
// console.log("API KEY:", process.env.CLOUDINARY_API_KEY),
// console.log("SECRET EXISTS:", !!process.env.CLOUDINARY_API_SECRET),


cloudinary.config({

  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,

});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "jobportal/misc";
    if (file.fieldname === "resume") {
      folder = "jobportal/resumes";
    } else if (file.fieldname === "avatar" || file.fieldname === "photo") {
      folder = "jobportal/avatars";
    } else if (file.fieldname === "logo") {
      folder = "jobportal/logos";
    }

    return {
      folder,
      resource_type: "auto", // Crucial for PDF/DOCX support
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});


const fileFilter = (req, file, cb) => {
  console.log("MULTER RECEIVED FILE:", file.fieldname, file.mimetype, file.originalname);
  if (file.fieldname === "resume") {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream"
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

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;