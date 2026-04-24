import "dotenv/config";
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

import path from 'path';
import { generateCsrfToken, csrfProtection } from './middlewares/csrfMiddleware.js';
import { requestTimer } from './utils/logger.js';

const __dirname = path.resolve();

// Connect to database
connectDB();

const app = express();

// Trust first proxy (needed for accurate req.ip behind Nginx/Cloudflare)
app.set('trust proxy', 1);

// On unified server: same origin — no CORS issues for same-port requests.
// Keep CORS open for Postman/mobile in dev, strict in production.
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:5001',
        'http://localhost:5001',
        'http://localhost:5173', // allow Vite dev server if running separately
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN', 'Accept'],
    optionsSuccessStatus: 200
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],

            // ── Scripts ─────────────────────────────────────────────
            // Razorpay loads from checkout + CDN domains
            // Google loads GSI client for Sign-In
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",           // Required for Razorpay's inline event handlers
                "https://checkout.razorpay.com",
                "https://cdn.razorpay.com",
                "https://accounts.google.com",
                "https://apis.google.com",
            ],

            // ── API/XHR Connections ─────────────────────────────────
            // Razorpay telemetry + payment API calls
            connectSrc: [
                "'self'",
                "https://lumberjack.razorpay.com",     // Razorpay primary event logging
                "https://lumberjack-cx.razorpay.com",  // Razorpay cross-origin analytics
                "https://api.razorpay.com",             // Payment processing
                "https://checkout.razorpay.com",        // Checkout API calls
                "https://accounts.google.com",          // Google token exchange
            ],

            // ── Iframes ────────────────────────────────────────────
            // Razorpay checkout modal + 3DS authentication
            frameSrc: [
                "'self'",
                "https://api.razorpay.com",       // Checkout iframe
                "https://checkout.razorpay.com",  // Payment form
                "https://tds.razorpay.com",       // 3D Secure bank verification
                "https://accounts.google.com",    // Google One Tap popup
            ],

            // ── Images ─────────────────────────────────────────────
            imgSrc: [
                "'self'",
                "data:",                              // Base64 inline images
                "blob:",                              // Canvas/generated images
                "https://*.cloudinary.com",           // User uploaded assets
                "https://lh3.googleusercontent.com",  // Google profile avatars
                "https://cdn.razorpay.com",           // Razorpay brand logos
                "https://i.pravatar.cc",              // Pravatar avatars
                "https://www.transparenttextures.com", // Background textures
            ],

            // ── Styles ─────────────────────────────────────────────
            styleSrc: [
                "'self'",
                "'unsafe-inline'",                // Required for dynamic styles (Razorpay modal, framer-motion)
                "https://fonts.googleapis.com",   // Google Fonts stylesheets
                "https://accounts.google.com",    // Google Sign-In button styles
            ],

            // ── Fonts ──────────────────────────────────────────────
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",      // Google Fonts .woff2 files
            ],

            // ── Workers ────────────────────────────────────────────
            workerSrc: ["'self'", "blob:"],       // Service workers / Web workers
        }
    }
}));

// Rate Limiting (Prevent DDoS/Brute-force)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 100,
    message: { success: false, message: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// 🛠️ DATA PARSING
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// Monitoring & CSRF
app.use(requestTimer);
app.use(generateCsrfToken);

app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    
    // Whitelist auth entry points for CSRF bootstrap
    const csrfExcludedPaths = [
        '/api/v1/auth/login',
        '/api/v1/auth/google-login',
        '/api/v1/auth/register',
        '/api/v1/auth/refresh-token',
        '/api/v1/auth/admin/login',
        '/api/v1/auth/forgot-password/send-otp',
        '/api/v1/auth/forgot-password/verify'
    ];
    if (csrfExcludedPaths.some(path => req.path.includes(path))) {
        // Enforce strict Origin validation for CSRF excluded routes
        const origin = req.headers.origin || req.headers.referer;
        const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';
        if (origin && !origin.startsWith(allowedOrigin)) {
            return res.status(403).json({ success: false, message: 'Unauthorized origin' });
        }
        return next();
    }

    csrfProtection(req, res, next);
});

// Request logging (always enabled for monitoring)
app.use(morgan('dev'));

// 🛤️ ROUTES
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
import fs from 'fs';

// Dynamic Path Discovery: Check multiple possible locations for Hostinger environment
const possiblePaths = [
    path.resolve(__dirname, '..', 'web', 'dist'), // Standard
    path.resolve(__dirname, '..', '..', 'web', 'dist'), // One level up
    path.resolve(__dirname, '..', 'nodejs', 'web', 'dist'), // Inside nodejs folder
    path.join(process.cwd(), 'web', 'dist') // Current working directory
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
    console.error(`❌ [Discovery] FAILED to find dist folder. Checked: ${possiblePaths.join(', ')}`);
}

app.use(express.static(frontendDist));

// SPA Fallback: All non-API routes serve index.html
app.get(/^(?!\/api).*/, (req, res) => {
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ 
            success: false, 
            message: "Frontend files not found.",
            checked_paths: possiblePaths,
            resolved_path: indexPath
        });
    }
});

// ERROR HANDLER
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [Server] Unified Server running on http://localhost:${PORT}`);
    console.log(`   ├─ API:      http://localhost:${PORT}/api/v1`);
    console.log(`   └─ Frontend: http://localhost:${PORT}`);
});
