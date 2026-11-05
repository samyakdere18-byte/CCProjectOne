// backend/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/database");
const studentRoutes = require("./routes/studentRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

/* ------------------------------------------------------------------ */
/* CORS Configuration                                                 */
/* ------------------------------------------------------------------ */
const isProduction = process.env.NODE_ENV === "production";

// Parse configured origins from environment
const envOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Development default origins
const devOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// In production, warn clearly if no FRONTEND_URL is configured
if (isProduction && envOrigins.length === 0) {
  console.warn(
    "[CORS] WARNING: NODE_ENV=production but FRONTEND_URL is not set. " +
    "All browser requests will be blocked. Set FRONTEND_URL in your hosting environment."
  );
}

const allowedOrigins = Array.from(
  new Set([...(envOrigins.length ? envOrigins : ["http://localhost:5173"]), ...(isProduction ? [] : devOrigins)])
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, curl, Postman (requests without Origin header)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development mode, allow localhost/127.0.0.1 on typical frontend dev ports
    if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1):(5173|5174|3000|4173)$/.test(origin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${origin}`);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ------------------------------------------------------------------ */
/* Body parsing                                                        */
/* ------------------------------------------------------------------ */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Student Information Management API",
    health: "/api/health",
  });
});

app.use("/api", studentRoutes);

/* ------------------------------------------------------------------ */
/* Error handling (must be last)                                       */
/* ------------------------------------------------------------------ */
app.use(notFound);
app.use(errorHandler);

/* ------------------------------------------------------------------ */
/* Start server after database connection                              */
/* ------------------------------------------------------------------ */
const PORT = process.env.PORT || 5000;

let server = null;

const startServer = async () => {
  try {
    // 1. Establish database connection first
    await connectDB();

    // 2. Start HTTP server
    server = app.listen(PORT, () => {
      console.log(`[SERVER] Listening on port ${PORT}`);
      console.log(`[SERVER] Allowed origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (err) {
    console.error(`[SERVER] Startup aborted due to database error:`, err.message);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("\n[SERVER] Received kill signal, closing server...");
  if (server) {
    server.close(async () => {
      console.log("[SERVER] HTTP server closed.");
      try {
        await mongoose.connection.close();
        console.log("[DB] MongoDB connection closed.");
      } catch (e) {
        console.error("[DB] Error closing MongoDB connection:", e.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();

module.exports = app;
