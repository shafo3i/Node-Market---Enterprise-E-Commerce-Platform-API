import { Router } from "express";
import { DisputeController } from "./dispute.controller";

const router = Router();

// Get all disputes
router.get("/", DisputeController.getAllDisputes);

// Get dispute by id
router.get("/:id", DisputeController.getDisputeById);

// Create dispute
router.post("/", DisputeController.createDispute);

// Update dispute
router.put("/:id", DisputeController.updateDispute);

// Delete dispute
router.delete("/:id", DisputeController.deleteDispute);

// Get disputes by user id
router.get("/user/:id", DisputeController.getDisputesByUserId);

export default router;

