import { Router } from "express";
import { LogsController } from "./logs.controller";
import { isAdmin } from "../../middleware/auth-middleware";


const router = Router();

router.get("/", isAdmin, LogsController.getAllLogs);
router.get("/:id", isAdmin, LogsController.getLogById);
router.delete("/:id", isAdmin, LogsController.deleteLog);

export default router;