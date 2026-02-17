import express from "express";
import {
  createLease,
  terminateLease,
  getActiveLeases,
  getTenantLeases,
  getUnitLeases,
} from "../controllers/lease.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create new lease
router.post("/", protect, createLease);

// Terminate lease
router.put("/:id/terminate", protect, terminateLease);

// Get all active leases
router.get("/active", protect, getActiveLeases);

// Get lease history for tenant
router.get("/tenant/:tenantId", protect, getTenantLeases);

// Get lease history for unit
router.get("/unit/:unitId", protect, getUnitLeases);

export default router;
