import express from "express";
import { onboardTenant } from "../controllers/caretaker.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/onboard-tenant",
  protect,
  authorize("CARETAKER"),
  onboardTenant
);

export default router;
