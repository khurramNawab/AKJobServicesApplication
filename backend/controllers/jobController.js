import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import { buildPagination } from '../utils/pagination.js';
import { z } from 'zod';

// ── Validation Schemas ─────────────────────────────────────────────
const jobSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    requirements: z.union([z.string(), z.array(z.string())]),
    skills: z.array(z.string()).optional(),
    salaryRange: z.union([
        z.string(),
        z.object({
            min: z.number().min(0).optional(),
            max: z.number().min(0).optional(),
            currency: z.string().default('INR')
        })
    ]).optional(),
    location: z.string().min(2),
    type: z.string().optional(),
    jobType: z.string().optional(), // Match frontend field name
    category: z.string().optional(),
    experienceLevel: z.string().optional()
});

const updateJobSchema = jobSchema.partial();

// @desc    Get all jobs (paginated, searchable)
// @route   GET /api/v1/jobs?page=1&limit=20&search=engineer&location=mumbai&type=Remote
// @access  Public
export const getJobs = async (req, res) => {
    try {
        const { query, pagination } = buildPagination(req.query);

        // Build smart filter from query params
        if (req.query.search) {
            query.filter.title = { $regex: req.query.search, $options: 'i' };
        }
        if (req.query.location) {
            query.filter.location = { $regex: req.query.location, $options: 'i' };
        }
        if (req.query.type) {
            query.filter.type = req.query.type;
        }
        if (req.query.status) {
            query.filter.status = req.query.status;
        } else {
            query.filter.status = 'OPEN';  // default: only open jobs
        }

        const totalDocs = await Job.countDocuments(query.filter);
        let jobs = await Job.find(query.filter)
            .populate('recruiterId', 'name email')
            .sort(query.sort)
            .skip(query.skip)
            .limit(query.limit)
            .lean();

        // Attach recruiter company info in a single batch query
        const recruiterUserIds = jobs.map(job => job.recruiterId?._id).filter(Boolean);
        if (recruiterUserIds.length > 0) {
            const recruiters = await Recruiter.find({ userId: { $in: recruiterUserIds } }).lean();
            const recruiterMap = recruiters.reduce((acc, rec) => {
                acc[rec.userId.toString()] = rec;
                return acc;
            }, {});

            jobs = jobs.map(job => {
                if (job.recruiterId) {
                    const info = recruiterMap[job.recruiterId._id.toString()];
                    if (info) {
                        job.recruiterId.companyName = info.companyName;
                        job.recruiterId.companyLogo = info.companyLogo?.replace('http://', 'https://');
                    }
                }
                return job;
            });
        }

        res.status(200).json({
            success: true,
            count: jobs.length,
            ...pagination(totalDocs),
            data: jobs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
export const getJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id).populate('recruiterId', 'name email').lean();

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        if (job.recruiterId) {
            const recruiterInfo = await Recruiter.findOne({ userId: job.recruiterId._id });
            if (recruiterInfo) {
                job.recruiterId.companyName = recruiterInfo.companyName;
                job.recruiterId.companyLogo = recruiterInfo.companyLogo;
            }
        }

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private (Recruiter only)
export const createJob = async (req, res) => {
    try {
        const validated = jobSchema.parse(req.body);
        const { title, description, requirements, skills, salaryRange, location, type, jobType, category } = validated;

        // Smart mapping for flexible fields
        const finalType = jobType || type || 'Full-time';
        const finalRequirements = Array.isArray(requirements) ? requirements.join('\n') : requirements;

        const jobDoc = await Job.create({
            title, 
            description, 
            requirements: finalRequirements, 
            skills, 
            salaryRange: salaryRange || 'Competitive',
            location, 
            type: finalType, 
            category,
            recruiterId: req.user._id,
        });

        let job = await jobDoc.populate('recruiterId', 'name email');
        job = job.toObject();

        const recruiterInfo = await Recruiter.findOne({ userId: req.user._id });
        if (recruiterInfo) {
            job.recruiterId.companyName = recruiterInfo.companyName;
            job.recruiterId.companyLogo = recruiterInfo.companyLogo;
        }

        console.log(`✅ [JOB] Created: "${job.title}" by Recruiter: ${req.user.email} (ID: ${req.user._id})`);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private (Recruiter only)
export const updateJob = async (req, res) => {
    try {
        const validated = updateJobSchema.parse(req.body);
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is recruiter owner
        if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ success: false, message: 'User not authorized to update this job' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, validated, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private (Recruiter only)
export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Make sure user is recruiter owner
        if (job.recruiterId.toString() !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(401).json({ success: false, message: 'User not authorized to delete this job' });
        }

        // 🧹 Cascade Cleanup
        await Application.deleteMany({ jobId: req.params.id });
        await SavedJob.deleteMany({ jobId: req.params.id });
        
        await job.deleteOne();

        res.status(200).json({ success: true, data: {}, message: 'Job and related applications purged' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
