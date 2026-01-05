import { RefundsController } from "./refunds.controller";
import { Router } from "express";

const router = Router();

router.get("/", RefundsController.getAllRefunds);
router.get("/:id", RefundsController.getRefundById);

export default router;
