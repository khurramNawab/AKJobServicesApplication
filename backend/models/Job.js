import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a job title"],
    },
    description: {
      type: String,
      required: [true, "Please add a job description"],
    },
    requirements: {
      type: String,
      default: '',
    },
    skills: [String],
    salaryRange: {
      type: mongoose.Schema.Types.Mixed,
      default: "Competitive",
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    category: {
      type: String,
      default: 'Other',
    },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Remote", "Contract", "Internship", "Freelance"],
      required: [true, "Please specify job type"],
    },
    // ── New Spec Fields ────────────────────────────────────
    educationQualification: {
      type: String,
      default: '',
    },
    vacancies: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 vacancy required'],
    },
    applicationDeadline: {
      type: Date,
      default: null,
    },
    interviewMode: {
      type: String,
      enum: ['Online', 'Offline', 'Both'],
      default: 'Online',
    },
    experienceRequired: {
      type: String,
      default: '',
    },
    // ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "DRAFT"],
      default: "OPEN",
    },
    applicantsCount: {
      type: Number,
      default: 0,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
// ═══ INDEXES ═══════════════════════════════════════════════════════
// Compound index for search: title + location (case-insensitive regex perf)
jobSchema.index({ title: 'text', location: 'text' });
// Status-based listing (most common query pattern)
jobSchema.index({ status: 1, createdAt: -1 });
// Recruiter's own jobs lookup
jobSchema.index({ recruiterId: 1, createdAt: -1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
