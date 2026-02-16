import express from "express";
import {
  getCurrentUser,
  register,
  login,
  activateAccount,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/activate/:token", activateAccount);
router.post("/password-reset", requestPasswordReset);
router.post("/password-reset/:token", resetPassword);

router.get("/me", protect, getCurrentUser);

// Example: Caretaker-only route
router.get(
  "/caretaker-only",
  protect,
  authorize("CARETAKER"),
  (req, res) => {
    res.json({ message: "Welcome Caretaker" });
  }
);

// Example: Tenant-only route
router.get(
  "/tenant-only",
  protect,
  authorize("TENANT"),
  (req, res) => {
    res.json({ message: "Welcome Tenant" });
  }
);

export default router;
