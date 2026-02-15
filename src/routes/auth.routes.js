import express from "express";
import {
  register,
  login,
  activateAccount,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/activate/:token", activateAccount);
router.post("/password-reset", requestPasswordReset);
router.post("/password-reset/:token", resetPassword);

// Example protected route
router.get(
  "/admin-only",
  protect,
  authorize("ADMIN"),
  (req, res) => {
    res.json({ message: "Welcome Admin" });
  }
);

export default router;
