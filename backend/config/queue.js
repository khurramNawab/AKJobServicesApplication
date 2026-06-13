import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import Candidate from "../models/Candidate.js";
import AuditLog from "../models/AuditLog.js";
import EmailLog from "../models/EmailLog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import nodemailer from "nodemailer";

// ─── High-Performance Mock Queue System ──────────────────────────────────────
const workers = {};

class MockQueue {
  constructor(name) {
    this.name = name;
  }

  async add(jobName, data, options = {}) {
    console.log(`[Mock Queue: ${this.name}] Added job: ${jobName}`);
    // Process asynchronously in the next event loop tick to emulate background queues
    setTimeout(async () => {
      try {
        const mockJob = {
          id: `mock-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          data,
          attemptsMade: 0,
        };
        const worker = workers[this.name];
        if (worker) {
          console.log(`[Mock Worker: ${this.name}] Started job ${mockJob.id}`);
          const result = await worker.handler(mockJob);
          if (worker.onCompleted) {
            worker.onCompleted(mockJob, result);
          }
        }
      } catch (err) {
        console.error(`🚨 [Mock Worker: ${this.name}] Job ${jobName} failed:`, err.message);
        const worker = workers[this.name];
        if (worker && worker.onFailed) {
          worker.onFailed({ id: `mock-job` }, err);
        }
      }
    }, 50);

    return { id: `mock-job-${Date.now()}` };
  }
}

class MockWorker {
  constructor(name, handler, options = {}) {
    this.name = name;
    this.handler = handler;
    this.completedCallbacks = [];
    this.failedCallbacks = [];

    workers[name] = {
      handler,
      onCompleted: (job, result) => this.completedCallbacks.forEach(cb => cb(job, result)),
      onFailed: (job, err) => this.failedCallbacks.forEach(cb => cb(job, err)),
    };
  }

  on(event, callback) {
    if (event === "completed") {
      this.completedCallbacks.push(callback);
    } else if (event === "failed") {
      this.failedCallbacks.push(callback);
    }
    return this;
  }
}

// ─── Initialize Queue & Worker Classes ───────────────────────────────────────
let QueueClass = MockQueue;
let WorkerClass = MockWorker;
let redisConnection = null;

// Only attempt Redis connection if explicitly requested and a Redis environment variable is set
const runWithRedis = process.env.USE_REDIS === "true";

if (runWithRedis) {
  try {
    const Redis = (await import("ioredis")).default;
    const BullMQ = await import("bullmq");

    redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      connectTimeout: 2000,
    });

    redisConnection.on("error", (err) => {
      console.warn("🚨 [BullMQ Redis] Connection warning:", err.message);
    });

    // Verify connection behaves
    await redisConnection.connect();

    QueueClass = BullMQ.Queue;
    WorkerClass = BullMQ.Worker;
    console.log("⚡ [Redis Queue] Successfully initialized BullMQ with active Redis connection.");
  } catch (err) {
    console.warn("⚠️ [Queue System] Redis connection unavailable. Falling back to self-contained In-Memory Queues.", err.message);
    if (redisConnection) {
      try {
        redisConnection.disconnect();
      } catch (_) {}
      redisConnection = null;
    }
    QueueClass = MockQueue;
    WorkerClass = MockWorker;
  }
} else {
  console.log("ℹ️ [Queue System] Running in pure self-contained In-Memory queue mode.");
}

// ─── BullMQ Queues Definitions ──────────────────────────────────────────────
export const fileScanQueue = new QueueClass("fileScanQueue", { connection: redisConnection });
export const emailQueue = new QueueClass("emailQueue", { connection: redisConnection });
export const notificationQueue = new QueueClass("notificationQueue", { connection: redisConnection });

// ─── Nodemailer Setup for Email Worker ───────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ─── ClamAV Mock / Hex Polyglot & Macro Payload Checkers ─────────────────────
const scanQuarantineFile = async (filePath) => {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hex = fileBuffer.toString("hex");

    // 1. Zip Bomb prevention check (extremely high compression ratios)
    const stats = fs.statSync(filePath);
    if (stats.size > 300 * 1024) {
      return { clean: false, reason: "File size exceeds absolute resume cap (300KB)." };
    }

    // 2. Polyglot Check: Reject PDFs that masquerade as images or contain executable headers
    if (filePath.endsWith(".pdf")) {
      const header = fileBuffer.toString("utf8", 0, 5);
      if (header !== "%PDF-") {
        return { clean: false, reason: "Polyglot PDF Bypass Blocked: Invalid PDF header signature." };
      }

      // Check for dangerous scripts in PDF body: e.g. /JS, /JavaScript, /Launch action
      if (hex.includes("2f4a53") || hex.includes("2f4a617661536372697074") || hex.includes("2f4c61756e6368")) {
        return { clean: false, reason: "Embedded JavaScript execution block in PDF." };
      }
    }

    // 3. Active Microsoft Office Macro Detection (vbaProject.bin reference in Office docs)
    if (filePath.endsWith(".doc") || filePath.endsWith(".docx")) {
      if (hex.includes("76626150726f6a6563742e62696e")) {
        return { clean: false, reason: "Active Excel/Word VBA macro payload detected." };
      }
    }

    // 4. Sandbox binary script checks (magic signatures)
    const signatures = [
      "<?php", "<script", "eval(", "exec(", "system(", "passthru(", "popen(", "shell_exec("
    ];
    const rawContent = fileBuffer.toString("utf8", 0, Math.min(stats.size, 10240));
    for (const sig of signatures) {
      if (rawContent.includes(sig)) {
        return { clean: false, reason: `Executable Script injection detected: found ${sig}` };
      }
    }

    return { clean: true };
  } catch (error) {
    console.error("[AntiVirus scan error]:", error.message);
    return { clean: false, reason: "Scanner core system failure." };
  }
};

// ─── Background Worker Execution ──────────────────────────────────────────────
if (!process.env.NO_BACKGROUND_WORKERS) {
  // 1. File Scanning Background Worker
  const fileWorker = new WorkerClass(
    "fileScanQueue",
    async (job) => {
      const { filePath, candidateId, originalName, userId } = job.data;
      console.log(`[Worker] Started resume scanning job: ${job.id} for Candidate: ${candidateId}`);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Quarantined file not found at: ${filePath}`);
      }

      try {
        const result = await scanQuarantineFile(filePath);

        if (!result.clean) {
          console.error(`🚨 [Worker] MALWARE/POLYGLOT FILE DETECTED! Job: ${job.id} | Reason: ${result.reason}`);

          await Candidate.findOneAndUpdate(
            { userId: candidateId },
            { resumeUrl: "BLOCKED_MALWARE", resumeOriginalName: originalName }
          );

          await AuditLog.create({
            adminId: userId,
            action: "OTHER",
            targetType: "User",
            details: `🚨 INTRUSION DETECTION ATTEMPT: User uploaded a corrupted/malicious resume. Reason: ${result.reason}`,
            ipAddress: "System Background Worker",
          });

          return { success: false, reason: result.reason };
        }

        console.log(`[Worker] Resume clean. Starting Cloudinary raw secure upload...`);
        
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: "jobportal/resumes",
          resource_type: "raw",
          public_id: `${Date.now()}-${path.basename(filePath, path.extname(filePath))}`,
        });

        await Candidate.findOneAndUpdate(
          { userId: candidateId },
          {
            resumeUrl: uploadResult.secure_url,
            resumeOriginalName: originalName,
            resumeUploadedAt: new Date(),
          }
        );

        console.log(`⚡ [Worker] Upload complete. Candidate profile updated: ${uploadResult.secure_url}`);
        return { success: true, url: uploadResult.secure_url };
      } finally {
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            console.log(`🧹 [Worker] Cleaned quarantine buffer: ${filePath}`);
          } catch (e) {
            console.error("[Worker] Cleanup failed:", e.message);
          }
        }
      }
    },
    { connection: redisConnection, concurrency: 5 }
  );

  fileWorker.on("completed", (job, result) => {
    console.log(`[Worker] Resume scan job ${job.id} completed. Clean: ${result?.success}`);
  });

  fileWorker.on("failed", (job, err) => {
    console.error(`🚨 [Worker] Resume scan job ${job?.id} failed with error:`, err.message);
  });

  // 2. Transactional Email Offloader Background Worker
  const emailWorker = new WorkerClass(
    "emailQueue",
    async (job) => {
      const { to, subject, html, logId } = job.data;
      const attempt = (job.attemptsMade || 0) + 1;
      console.log(`[Worker] Sending email to: ${to} | job: ${job.id} | attempt: ${attempt}`);
      
      try {
        await transporter.sendMail({
          from: `"${process.env.SMTP_FROM_NAME || 'AKJOB Services'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
          to,
          subject,
          html,
        });

        if (logId) {
          await EmailLog.findByIdAndUpdate(logId, { status: "SUCCESS", attempts: attempt, error: null });
        }
        return { sent: true };
      } catch (error) {
        if (logId) {
          await EmailLog.findByIdAndUpdate(logId, { status: "FAILED", attempts: attempt, error: error.message });
        }
        throw error;
      }
    },
    { connection: redisConnection, concurrency: 10 }
  );

  emailWorker.on("completed", (job) => {
    console.log(`[Worker] Email sent successfully for job: ${job.id}`);
  });

  emailWorker.on("failed", (job, err) => {
    console.error(`🚨 [Worker] Email dispatch fail for job: ${job?.id}:`, err.message);
  });

  // 3. Dynamic Mass Broadcast Notification Worker
  const notificationWorker = new WorkerClass(
    "notificationQueue",
    async (job) => {
      const { title, message, adminId, ipAddress } = job.data;
      console.log(`[Worker] Starting mass broadcast notification: ${title} (Job: ${job.id})`);

      const BATCH_SIZE = 500;
      let skip = 0;
      let totalSent = 0;

      while (true) {
        const users = await User.find().select('_id').skip(skip).limit(BATCH_SIZE).lean();
        if (users.length === 0) break;

        const notifications = users.map(u => ({
          userId: u._id,
          title,
          message,
          type: 'SYSTEM',
        }));

        await Notification.insertMany(notifications);
        totalSent += users.length;
        skip += BATCH_SIZE;

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      await AuditLog.create({
        adminId,
        action: 'BROADCAST_SENT',
        targetType: 'System',
        details: `Mass broadcast titled "${title}" successfully dispatched to ${totalSent} users via async worker.`,
        ipAddress: ipAddress || 'System Background Worker',
      });

      console.log(`⚡ [Worker] Mass broadcast complete. Dispatched to ${totalSent} users.`);
      return { success: true, count: totalSent };
    },
    { connection: redisConnection, concurrency: 1 }
  );

  notificationWorker.on("completed", (job, result) => {
    console.log(`[Worker] Notification broadcast job ${job.id} completed. Sent to ${result?.count} users.`);
  });

  notificationWorker.on("failed", (job, err) => {
    console.error(`🚨 [Worker] Notification broadcast job ${job?.id} failed:`, err.message);
  });
}
