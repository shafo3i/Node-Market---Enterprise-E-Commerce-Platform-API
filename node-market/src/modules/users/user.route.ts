import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.get("/profile", UserController.getProfile);
router.put("/profile", UserController.updateUser);

//for admins
router.get("/all", UserController.getAllUsers);
router.get("/:id", UserController.getUserByIdAdmin);
router.put("/update/:id", UserController.updateUserByAdmin);
router.delete("/delete/:id", UserController.deleteUserByAdmin);

export default router;