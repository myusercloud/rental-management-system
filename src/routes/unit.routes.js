import express from "express";
import {
  createUnit,
  getAllUnits,
  getAvailableUnits,
  getUnitById,
  deleteUnit,
} from "../controllers/unit.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { updateUnit } from "../controllers/unit.controller.js";

const router = express.Router();

/**
 * CARETAKER ROUTES
 */
router.post("/", protect, authorize("CARETAKER"), createUnit);
router.get("/", protect, authorize("CARETAKER"), getAllUnits);
router.get("/available", protect, authorize("CARETAKER"), getAvailableUnits);
router.get("/:id", protect, authorize("CARETAKER"), getUnitById);
router.put("/:id", protect, authorize("CARETAKER"), updateUnit);
router.delete("/:id", protect, authorize("CARETAKER"), deleteUnit);

export default router;
