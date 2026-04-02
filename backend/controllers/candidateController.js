import Candidate from '../models/Candidate.js';
import Application from '../models/Application.js';
import { v2 as cloudinary } from 'cloudinary';
import '../config/cloudinary.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Delete a file from Cloudinary by its URL.
 * Works for resource_type: 'raw' (resumes) and 'image' (photos).
 */
const deleteCloudinaryFile = async (url, resourceType = 'raw') => {
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

// ─── GET /api/v1/candidates/me ────────────────────────────────────────────────
export const getMyCandidateProfile = async (req, res) => {
  try {
    let candidate = await Candidate.findOne({ userId: req.user._id });

    if (!candidate) {
      candidate = await Candidate.create({ userId: req.user._id });
    }

    const stats = {
      applied: await Application.countDocuments({ candidateId: req.user._id }),
      interviews: await Application.countDocuments({
        candidateId: req.user._id,
        status: { $in: ['REVIEWING', 'SHORTLISTED', 'HIRED'] },
      }),
      matchRate: '84%',
    };

    res.status(200).json({ success: true, data: candidate, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/v1/candidates/me ────────────────────────────────────────────────
export const updateCandidateProfile = async (req, res) => {
  try {
    const candidate = await Candidate.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.status(200).json({ success: true, data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/v1/candidates/me/resume ───────────────────────────────────────
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file.' });
    }

    // ── Debug log ──────────────────────────────────────────────────────────────
    console.log('[RESUME UPLOAD] req.file →', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,      // Cloudinary secure_url
      filename: req.file.filename,
    });

    // ── Size guard (300 KB) ────────────────────────────────────────────────────
    const MAX_RESUME_SIZE = 300 * 1024; // 300 KB
    if (req.file.size > MAX_RESUME_SIZE) {
      // File is already on Cloudinary at this point — delete it to avoid orphans
      await deleteCloudinaryFile(req.file.path, 'raw');
      return res.status(400).json({
        success: false,
        message: `Resume too large. Maximum size is 300 kb not more than that. (Your file is ${Math.round(req.file.size / 1024)} KB.)`,
      });
    }

    const newUrl = req.file.path; // Cloudinary secure_url
    console.log('[RESUME UPLOAD] Cloudinary URL:', newUrl);

    // ── Delete previous resume from Cloudinary (avoid storage waste) ──────────
    const existing = await Candidate.findOne({ userId: req.user._id });
    if (existing?.resumeUrl) {
      await deleteCloudinaryFile(existing.resumeUrl, 'raw');
    }

    // ── Save to MongoDB ────────────────────────────────────────────────────────
    const candidate = await Candidate.findOneAndUpdate(
      { userId: req.user._id },
      {
        resumeUrl: newUrl,
        resumeUploadedAt: new Date(),
        resumeOriginalName: req.file.originalname,
      },
      { new: true, upsert: true }
    );

    console.log('[RESUME UPLOAD] Saved → resumeUrl:', candidate.resumeUrl);

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully!',
      resumeUrl: candidate.resumeUrl,
      data: candidate,
    });
  } catch (error) {
    console.error('[RESUME UPLOAD] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/v1/candidates/me/photo ─────────────────────────────────────────
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file.' });
    }

    const newUrl = req.file.path;

    // Delete old photo
    const existing = await Candidate.findOne({ userId: req.user._id });
    if (existing?.profilePhoto) {
      await deleteCloudinaryFile(existing.profilePhoto, 'image');
    }

    const candidate = await Candidate.findOneAndUpdate(
      { userId: req.user._id },
      { profilePhoto: newUrl },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully!',
      photoUrl: candidate.profilePhoto,
      data: candidate,
    });
  } catch (error) {
    console.error('[PHOTO UPLOAD] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
