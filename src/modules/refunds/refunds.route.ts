import { RefundsController } from "./refunds.controller";
import { Router } from "express";
import { isAdmin } from "../../middleware/auth-middleware";

const router = Router();

router.get("/", isAdmin, RefundsController.getAllRefunds);
router.get("/:id", isAdmin, RefundsController.getRefundById);

export default router;
