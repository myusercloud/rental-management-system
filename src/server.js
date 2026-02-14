import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "OK",
      message: "Rental Management API is running 🚀",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// Example test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API working properly ✅" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
