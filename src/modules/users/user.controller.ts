import { Request, Response } from "express";
import { UserService } from "./user.service";
import { updateUserSchema } from "./user.validation";


export const UserController = {
    async getProfile(req: Request, res: Response) {
        // Session already verified by isAuthenticated middleware and stored in res.locals
        const session = res.locals.session;
        
        const user = await UserService.getUserById(session.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Create a custom response object excluding sensitive data if needed, but here we just append lastPasswordChange
        const credentialAccount = user.accounts.find(acc => acc.providerId === "credential");
        const lastPasswordChange = credentialAccount?.updatedAt || user.createdAt; // Fallback to creation date

        return res.status(200).json({ ...user, lastPasswordChange });
    },

    // Update user
    async updateUser(req: Request, res: Response) {
        console.log("updateUser HIT. Body:", JSON.stringify(req.body, null, 2));
        // Session already verified by isAuthenticated middleware and stored in res.locals
        const session = res.locals.session;

        const validate = updateUserSchema.safeParse(req.body);
        if (!validate.success) {
            console.error("Validation Error:", validate.error.format());
            return res.status(400).json({ error: validate.error.message });
        }

        try {
            // Remove undefined fields to ensure clean update
            const updateData = JSON.parse(JSON.stringify(validate.data));

            const user = await UserService.updateUser(session.user.id, updateData);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json(user);
        } catch (error: any) {
            console.error("Update User Error:", error);
            return res.status(500).json({ error: "Failed to update user profile", details: error.message || "Internal Server Error" });
        }
    },



    //for admins get all users
    async getAllUsers(req: Request, res: Response) {
        console.log("getAllUsers HIT");
        // Session and admin role already verified by isAdmin middleware
        const users = await UserService.getAllUsers();
        return res.status(200).json(users);
    },

    //for admins get user by id
    async getUserByIdAdmin(req: Request, res: Response) {
        // Session and admin role already verified by isAdmin middleware
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "User ID is required" });

        const user = await UserService.getUserById(id);
        if (!user) return res.status(404).json({ error: "User not found" });

        return res.status(200).json(user);
    },

    //for admins update user
    async updateUserByAdmin(req: Request, res: Response) {
        console.log("updateUserByAdmin HIT. Body:", JSON.stringify(req.body, null, 2));
        // Session and admin role already verified by isAdmin middleware
        const session = res.locals.session;

        const { id } = req.params; // Get User ID from URL
        if (!id) return res.status(400).json({ error: "User ID is required" });

        const validate = updateUserSchema.safeParse(req.body);
        if (!validate.success) {
            console.error("Validation Error:", validate.error.format());
            return res.status(400).json({ error: validate.error.message });
        }

        try {
            // Remove undefined fields to ensure clean update
            const updateData = JSON.parse(JSON.stringify(validate.data));

            const user = await UserService.updateUserByAdmin(id, updateData, session.user.id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            return res.status(200).json(user);
        } catch (error: any) {
            console.error("Update User Error:", error);
            return res.status(500).json({ error: "Failed to update user profile", details: error.message || "Internal Server Error" });
        }
    },

    //for admins delete user
    async deleteUserByAdmin(req: Request, res: Response) {
        console.log("deleteUserByAdmin HIT. Body:", JSON.stringify(req.body, null, 2));
        // Session and admin role already verified by isAdmin middleware
        const session = res.locals.session;

        const { id } = req.params;
        if (!id) return res.status(400).json({ error: "User ID is required" });

        try {
            const user = await UserService.deleteUserByAdmin(id, session.user.id);
            // if (!user ) {
            //     return res.status(404).json({ error: "User not found" });
            // }
            return res.status(200).json(user);
        } catch (error: any) {
            console.error("Delete User Error:", error);
            return res.status(500).json({ error: "Failed to delete user profile", details: error.message || "Internal Server Error" });
        }
    },
};