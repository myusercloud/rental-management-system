import express from "express";
import {
  createTenant,
  getAllTenants,
  getTenantById,
  getMyTenantProfile,
  updateTenant,
  deleteTenant,
} from "../controllers/tenant.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();




router.post("/", protect, authorize("CARETAKER"), createTenant);
router.get("/", protect, authorize("CARETAKER"), getAllTenants);

router.get(
  "/me",
  protect,
  authorize("TENANT"),
  getMyTenantProfile
);

router.get("/:id", protect, authorize("CARETAKER"), getTenantById);
router.put("/:id", protect, authorize("CARETAKER"), updateTenant);
router.delete("/:id", protect, authorize("CARETAKER"), deleteTenant);

export default router;
