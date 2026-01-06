import { Router } from "express";
import { UserController } from "./user.controller";
import { isAdmin, isAuthenticated } from "../../middleware/auth-middleware";

const router = Router();

router.get("/profile", isAuthenticated, UserController.getProfile);
router.put("/profile", isAuthenticated, UserController.updateUser);

//for admins
router.get("/all", isAdmin, UserController.getAllUsers);
router.get("/:id", isAdmin, UserController.getUserByIdAdmin);
router.put("/update/:id", isAdmin, UserController.updateUserByAdmin);
router.delete("/delete/:id", isAdmin, UserController.deleteUserByAdmin);

export default router;