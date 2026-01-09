import { Router } from "express";
import { ReturnsController } from "./returns.controller";
import { isAdmin, isAuthenticated } from "../../middleware/auth-middleware";
import rateLimit from "express-rate-limit";

const router = Router();

const returnsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later",
});

router.use(returnsLimiter);

// Customer routes (authenticated users can create and view their own returns)
router.post("/", isAuthenticated, ReturnsController.create);
router.get("/my-returns", isAuthenticated, ReturnsController.getMyReturns);
router.get("/order/:orderId", isAuthenticated, ReturnsController.getByOrderId);

// Admin routes
router.get("/", isAdmin, ReturnsController.getAll);
router.get("/statistics", isAdmin, ReturnsController.getStatistics);
router.get("/status", isAdmin, ReturnsController.getByStatus);
router.get("/:id", isAdmin, ReturnsController.getById);
router.get("/number/:returnNumber", isAdmin, ReturnsController.getByReturnNumber);
router.put("/:id", isAdmin, ReturnsController.update);
router.delete("/:id", isAdmin, ReturnsController.delete);

export default router;
