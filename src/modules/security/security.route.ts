import { Router } from "express";
import { SecurityController } from "./security.controller";
import { isAdmin } from "../../middleware/auth-middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const securityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: "Too many requests from this IP, please try again later",
});

router.use(securityLimiter);

// Admin routes
router.get("/debug-mode", isAdmin, SecurityController.getDebugMode);
router.put("/debug-mode", isAdmin, SecurityController.updateDebugMode);

export default router;
