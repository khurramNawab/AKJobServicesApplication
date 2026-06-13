import express from "express";
import {
  getMyCandidateProfile,
  updateCandidateProfile,
  uploadResume,
  uploadProfilePhoto,
} from "../controllers/candidateController.js";
import { protect, authorizeRoles as authorize } from "../middlewares/authMiddleware.js";
import upload from "../config/upload.js";
import { resumeUploadLimiter } from "../middlewares/rateLimiterMiddleware.js";

const router = express.Router();

router
  .route("/me")
  .get(protect, authorize("CANDIDATE"), getMyCandidateProfile)
  .put(protect, authorize("CANDIDATE"), updateCandidateProfile);

router.route("/me/resume").post(
  protect,
  authorize("CANDIDATE"),
  resumeUploadLimiter,
  (req, res, next) => {
    upload.single("resume")(req, res, function (err) {
      if (err) {
        console.error("Multer Upload Error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "Unknown Upload Error",
        });
      }
      next();
    });
  },
  uploadResume,
);

router.route("/me/photo")
  .put(
    protect,
    authorize("CANDIDATE"),
    (req, res, next) => {
      upload.single("photo")(req, res, function (err) {
        if (err) {
          console.error("Multer Upload Error:", err);
          return res.status(400).json({
            success: false,
            message: err.message || "Unknown Upload Error",
          });
        }
        next();
      });
    },
    uploadProfilePhoto,
  )
  .post(
    protect,
    authorize("CANDIDATE"),
    (req, res, next) => {
      upload.single("photo")(req, res, function (err) {
        if (err) {
          console.error("Multer Upload Error:", err);
          return res.status(400).json({
            success: false,
            message: err.message || "Unknown Upload Error",
          });
        }
        next();
      });
    },
    uploadProfilePhoto,
  );

export default router;
