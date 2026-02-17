import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js"
import unitRoutes from "./routes/unit.routes.js";
import leaseRoutes from "./routes/lease.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/leases", leaseRoutes);

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Rental Management API running 🚀",
  });
});

export default app;
