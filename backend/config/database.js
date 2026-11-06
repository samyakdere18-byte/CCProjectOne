const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI ||
    (process.env.NODE_ENV !== "production"
      ? "mongodb://127.0.0.1:27017/CCProjectOne"
      : "");

  if (!uri) {
    console.error("[DB] MONGODB_URI is not set. Aborting startup.");
    throw new Error("Set MONGODB_URI in production environment variables");
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[DB] MongoDB connected: ${conn.connection.host}`);
    console.log(`[DB] Database name: ${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error("[DB] Connection error:", err.message);
    throw err;
  }
};

module.exports = connectDB;
