import { Router } from "express";
import { CarrierController } from "./carrier.controller";
import { isAdmin } from "../../middleware/auth-middleware";

const router = Router();

// Public routes
router.get("/active", CarrierController.getActiveCarriers);

// Admin routes
router.get("/", isAdmin, CarrierController.getAllCarriers);
router.get("/:id", isAdmin, CarrierController.getCarrierById);
router.post("/", isAdmin, CarrierController.createCarrier);
router.put("/:id", isAdmin, CarrierController.updateCarrier);
router.delete("/:id", isAdmin, CarrierController.deleteCarrier);
router.patch("/:id/toggle-status", isAdmin, CarrierController.toggleCarrierStatus);

export default router;
