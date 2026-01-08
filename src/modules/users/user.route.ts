import { Router } from "express";
import { UserController } from "./user.controller";
import { isAdmin, isAuthenticated } from "../../middleware/auth-middleware";
import rateLimit from "express-rate-limit";

const router = Router();
const profilerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after a minute"
});

// User profile routes (self-management)
router.get("/profile", profilerLimiter, isAuthenticated, UserController.getProfile);
router.put("/profile", profilerLimiter, isAuthenticated, UserController.updateUser);

// Notification preferences routes
router.get("/notifications/preferences", isAuthenticated, UserController.getNotificationPreferences);
router.put("/notifications/preferences", isAuthenticated, UserController.updateNotificationPreferences);

// Admin routes - IMPORTANT: specific routes BEFORE parameterized routes
router.get("/all", isAdmin,  UserController.getAllUsers); // Must come before /:id
router.get("/:id", isAdmin,  UserController.getUserByIdAdmin);
router.put("/update/:id", isAdmin, UserController.updateUserByAdmin);
router.delete("/delete/:id", isAdmin, UserController.deleteUserByAdmin);

export default router;