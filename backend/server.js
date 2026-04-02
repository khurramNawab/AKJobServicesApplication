console.log("SERVER SCRIPT LOADED at", new Date().toISOString());
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
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

// Connect to database
console.log("Starting Database Connection...");
connectDB().then(() => {
  console.log("Database connection sequence initiated.");
}).catch(err => {
  console.error("Critical Database Error:", err);
});

console.log("Initializing Express App...");
const app = express();


// Middlewares
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/candidates", candidateRoutes);
app.use("/api/v1/recruiters", recruiterRoutes);
app.use("/api/v1/companies", recruiterRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/saved-jobs", savedJobRoutes);
app.use("/api/v1/admin", adminRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Job Portal API is running...");
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

console.log("🚀 [Server] Initializing on port", process.env.PORT || 5050);

const PORT = process.env.PORT || 5050;

app.listen(PORT, "0.0.0.0", () => {
  console.log('✨ [Startup] Success! Server active.');
  console.log(`📍 [Endpoint] http://localhost:${PORT}`);
  console.log(`🛠️  [Environment] ${process.env.NODE_ENV || 'development'}`);
  console.log('---------------------------------------------');
});

