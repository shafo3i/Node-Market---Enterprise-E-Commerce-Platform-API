import { Router } from "express";
import { CarrierController } from "./carrier.controller";

const router = Router();

// Public routes
router.get("/active", CarrierController.getActiveCarriers);

// Admin routes
router.get("/", CarrierController.getAllCarriers);
router.get("/:id", CarrierController.getCarrierById);
router.post("/", CarrierController.createCarrier);
router.put("/:id", CarrierController.updateCarrier);
router.delete("/:id", CarrierController.deleteCarrier);
router.patch("/:id/toggle-status", CarrierController.toggleCarrierStatus);

export default router;
