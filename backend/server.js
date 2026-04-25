import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import candidateRoutes from "./routes/candidateRoutes.js";
import recruiterRoutes from "./routes/recruiterRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import savedJobRoutes from "./routes/savedJobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import newsletterRoutes from "./routes/newsletterRoutes.js";

import path from "path";
import { fileURLToPath } from "url";
import {
  generateCsrfToken,
  csrfProtection,
} from "./middlewares/csrfMiddleware.js";
import { requestTimer } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const backendDir = path.dirname(__filename);
const projectRoot = path.resolve(backendDir, "..");

// Load environment variables with a dev/prod split.
// - Production defaults to `.env`
// - Development prefers `.env.development` (fallback to `.env`)
process.env.NODE_ENV = (process.env.NODE_ENV || "development").trim();
import fs from "fs";

// Load base `.env` first (shared defaults/secrets), then overlay environment-specific file.
// IMPORTANT: Choose environment from the *real* process environment before reading `.env`,
// so a production `.env` doesn't accidentally force production behavior locally.
const bootstrapEnv = (process.env.NODE_ENV || "development").toLowerCase();

const baseEnvPath = path.join(backendDir, ".env");
if (fs.existsSync(baseEnvPath)) {
  dotenv.config({ path: baseEnvPath });
}

const overlayEnvPath =
  process.env.ENV_FILE ||
  (bootstrapEnv === "production"
    ? baseEnvPath
    : path.join(backendDir, ".env.development"));

if (overlayEnvPath && fs.existsSync(overlayEnvPath)) {
  dotenv.config({ path: overlayEnvPath, override: true });
}

// Connect to database
connectDB();

const app = express();

const isProd = process.env.NODE_ENV === "production";

// Trust proxy ONLY in production (so req.secure + req.ip work correctly behind Nginx/Cloudflare).
// In local dev, trusting a proxy can make req.secure depend on spoofable headers.
if (isProd) {
  app.set("trust proxy", 1);
}

// On unified server: same origin — no CORS issues for same-port requests.
// Keep CORS open for Postman/mobile in dev, strict in production.
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5001",
      "http://localhost:5001",
      "http://127.0.0.1:5001",
      "http://localhost:5173", // Vite dev server (localhost)
      "http://127.0.0.1:5173", // Vite dev server (IPv4 literal)
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-XSRF-TOKEN", "Accept"],
    optionsSuccessStatus: 200,
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    // HSTS must be production-only. In dev it can cause the browser to "remember" HTTPS
    // and force upgrades to https://localhost which breaks an HTTP-only dev server.
    hsts: isProd ? undefined : false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        // ── Scripts ─────────────────────────────────────────────
        // Razorpay loads from checkout + CDN domains
        // Google loads GSI client for Sign-In
        scriptSrc: [
          "'self'",
          "'unsafe-inline'", // Required for Razorpay's inline event handlers
          "https://checkout.razorpay.com",
          "https://cdn.razorpay.com",
          "https://accounts.google.com",
          "https://apis.google.com",
        ],

        // ── API/XHR Connections ─────────────────────────────────
        // Razorpay telemetry + payment API calls
        connectSrc: [
          "'self'",
          "https://lumberjack.razorpay.com", // Razorpay primary event logging
          "https://lumberjack-cx.razorpay.com", // Razorpay cross-origin analytics
          "https://api.razorpay.com", // Payment processing
          "https://checkout.razorpay.com", // Checkout API calls
          "https://accounts.google.com", // Google token exchange
        ],

        // ── Iframes ────────────────────────────────────────────
        // Razorpay checkout modal + 3DS authentication
        frameSrc: [
          "'self'",
          "https://api.razorpay.com", // Checkout iframe
          "https://checkout.razorpay.com", // Payment form
          "https://tds.razorpay.com", // 3D Secure bank verification
          "https://accounts.google.com", // Google One Tap popup
        ],

        // ── Images ─────────────────────────────────────────────
        imgSrc: [
          "'self'",
          "data:", // Base64 inline images
          "blob:", // Canvas/generated images
          "https://*.cloudinary.com", // User uploaded assets
          "https://lh3.googleusercontent.com", // Google profile avatars
          "https://cdn.razorpay.com", // Razorpay brand logos
          "https://i.pravatar.cc", // Pravatar avatars
          "https://www.transparenttextures.com", // Background textures
        ],

        // ── Styles ─────────────────────────────────────────────
        styleSrc: [
          "'self'",
          "'unsafe-inline'", // Required for dynamic styles (Razorpay modal, framer-motion)
          "https://fonts.googleapis.com", // Google Fonts stylesheets
          "https://accounts.google.com", // Google Sign-In button styles
        ],

        // ── Fonts ──────────────────────────────────────────────
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com", // Google Fonts .woff2 files
        ],

        // ── Workers ────────────────────────────────────────────
        workerSrc: ["'self'", "blob:"], // Service workers / Web workers
      },
    },
  }),
);

// Rate Limiting (Prevent DDoS/Brute-force)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// 🛠️ DATA PARSING
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Monitoring & CSRF
app.use(requestTimer);
app.use(generateCsrfToken);

// 🧪 DEBUG: Log cookies for session troubleshooting
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.path.includes("/auth")) {
    const cookies = Object.keys(req.cookies || {}).length;
    console.log(
      `🔍 [Session] Request to ${req.path} | Cookies count: ${cookies} | Proto: ${req.get("X-Forwarded-Proto")}`,
    );
  }
  next();
});

// 🛡️ SECURITY: Force HTTPS in production only
app.use((req, res, next) => {
  if (isProd && !req.secure) {
    return res.redirect("https://" + req.get("Host") + req.originalUrl);
  }
  next();
});

// Request logging
app.use(morgan("dev"));

// 🛤️ ROUTES
app.use((req, res, next) => {
  if (req.path.includes("/api/v1/auth")) {
    const origin = req.headers.origin || req.headers.referer || "";
    const allowedDomains = ["akjobservices.com", "localhost", "127.0.0.1"];
    const isAllowed = allowedDomains.some((domain) => origin.includes(domain));

    if (origin && !isAllowed) {
      console.warn(`[SECURITY] Blocked Origin: ${origin}`);
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized origin" });
    }
  }
  next();
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/recruiters", recruiterRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/saved-jobs", savedJobRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/newsletter", newsletterRoutes);

// 🌐 SERVE FRONTEND (Unified Port — backend serves built React app)

// Dynamic Path Discovery: Check multiple possible locations for Hostinger environment
const possiblePaths = [
  path.resolve(projectRoot, "web", "dist"), // Standard monorepo layout
  path.resolve(projectRoot, "..", "web", "dist"), // One level up
  path.resolve(projectRoot, "nodejs", "web", "dist"), // Inside nodejs folder
  path.join(process.cwd(), "web", "dist"), // Current working directory
];

let frontendDist = possiblePaths[0];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    frontendDist = p;
    console.log(`✅ [Discovery] Found dist folder at: ${p}`);
    break;
  }
}

if (!fs.existsSync(frontendDist)) {
  console.error(
    `❌ [Discovery] FAILED to find dist folder. Checked: ${possiblePaths.join(", ")}`,
  );
}

app.use(express.static(frontendDist));

// SPA Fallback: All non-API routes serve index.html
app.get(/^(?!\/api).*/, (req, res) => {
  const indexPath = path.join(frontendDist, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({
      success: false,
      message: "Frontend files not found.",
      checked_paths: possiblePaths,
      resolved_path: indexPath,
    });
  }
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 [Server] Unified Server running on http://localhost:${PORT}`);
  console.log(`   ├─ API:      http://localhost:${PORT}/api/v1`);
  console.log(`   └─ Frontend: http://localhost:${PORT}`);
});
