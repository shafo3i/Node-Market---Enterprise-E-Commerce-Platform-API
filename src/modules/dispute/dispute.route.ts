import { Router } from "express";
import { DisputeController } from "./dispute.controller";
import { isAdmin, isAuthenticated} from "../../middleware/auth-middleware";

const router = Router();

// Get all disputes (Admin only - sensitive data)
router.get("/", isAdmin, DisputeController.getAllDisputes);

// Get dispute by id (User can view their own, Admin can view all)
router.get("/:id", isAuthenticated, DisputeController.getDisputeById);

// Create dispute (Authenticated users)
router.post("/", isAuthenticated, DisputeController.createDispute);

// Update dispute (Admin only)
router.put("/:id", isAdmin, DisputeController.updateDispute);

// Delete dispute (Admin only)
router.delete("/:id", isAdmin, DisputeController.deleteDispute);

// Get disputes by user id (User can view their own, Admin can view any)
router.get("/user/:id", isAuthenticated, DisputeController.getDisputesByUserId);

export default router;

