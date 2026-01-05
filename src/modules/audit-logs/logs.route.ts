import { Router } from "express";
import { LogsController } from "./logs.controller";

const router = Router();

router.get("/", LogsController.getAllLogs);
router.get("/:id", LogsController.getLogById);
router.delete("/:id", LogsController.deleteLog);

export default router;