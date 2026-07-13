import Candidate from '../models/Candidate.js';
import Application from '../models/Application.js';
import { deleteCloudinaryFile } from '../config/cloudinary.js';
import { fileScanQueue } from '../config/queue.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

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
    if (!req.file || !req.file.quarantinePath) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF or DOCX file.' });
    }

    console.log('[RESUME UPLOAD QUEUED] req.file →', {
      originalname: req.file.originalname,
      size: req.file.size,
      quarantinePath: req.file.quarantinePath,
    });

    // Mark previous resume as scanning or simply set status
    const existing = await Candidate.findOne({ userId: req.user._id });
    if (existing?.resumeUrl && existing.resumeUrl.startsWith("http")) {
      // In a real environment, we'd delete the old Cloudinary file when the scan succeeds
      // For now, we will let the background worker handle clean profiles.
    }

    // Add scanning background job to BullMQ
    await fileScanQueue.add("resumeScan", {
      filePath: req.file.quarantinePath,
      candidateId: req.user._id,
      originalName: req.file.originalname,
      userId: req.user._id,
    });

    res.status(202).json({
      success: true,
      message: 'Resume successfully uploaded to security quarantine. It is being scanned for active scripts, polyglot payloads, and macros. Your profile will be updated shortly.',
      status: 'SCANNING',
    });
  } catch (error) {
    console.error('[RESUME UPLOAD QUEUE ERROR] Error:', error);
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

// ─── GET /api/v1/candidates ───────────────────────────────────────────────────
export const getCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('userId', 'name email')
      .lean();
    res.status(200).json({ success: true, count: candidates.length, data: candidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
