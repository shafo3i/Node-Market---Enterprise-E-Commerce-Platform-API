import { DisputeService } from "./dispute.service";
import { Request, Response } from "express";
import { auth } from '../../auth'
import { fromNodeHeaders } from "better-auth/node";
import { z } from "zod";




export const DisputeController = {

    // Get all disputes
    getAllDisputes: async (req: Request, res: Response) => {
        const authUser = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!authUser?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (authUser.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }

        try {
            const disputes = await DisputeService.getAllDisputes();
            res.json(disputes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    // Get dispute by id
    getDisputeById: async (req: Request, res: Response) => {
        const authUser = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!authUser?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }

        try {
            if (!req.params.id) {
                return res.status(400).json({ error: "Missing dispute id" });
            }
            const dispute = await DisputeService.getDisputeById(req.params.id);

            if (!dispute) return res.status(404).json({ error: "Dispute not found" });

            // IDOR Protection: Only Admin or Owner can view
            if (authUser.user.role !== "ADMIN" && dispute.openedBy !== authUser.user.id) {
                return res.status(403).json({ error: "Forbidden" });
            }

            res.json(dispute);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    // Create dispute
    createDispute: async (req: Request, res: Response) => {
        const authUser = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!authUser?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }



        try {
            // Force openedBy to be the current user if not admin
            const disputeData = { ...req.body };
            if (authUser.user.role !== "ADMIN") {
                disputeData.openedBy = authUser.user.id;
            }

            const dispute = await DisputeService.createDispute(disputeData);
            res.json(dispute);
        } catch (error: any) {
            console.error(error);
            // Return more specific error for debugging
            if (error.code === 'P2003') {
                return res.status(400).json({ error: "Invalid Transaction ID or User ID. Foreign key constraint failed." });
            }
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    },
    // Update dispute
    updateDispute: async (req: Request, res: Response) => {
        const authUser = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!authUser?.user || authUser?.user.role !== "ADMIN") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            if (!req.params.id) {
                return res.status(400).json({ error: "Missing dispute id" });
            }
            const dispute = await DisputeService.updateDispute(req.params.id, req.body);
            res.json(dispute);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    // Delete dispute
    deleteDispute: async (req: Request, res: Response) => {
        const authUser = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!authUser?.user || authUser?.user.role !== "ADMIN") {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            if (!req.params.id) {
                return res.status(400).json({ error: "Missing dispute id" });
            }
            const dispute = await DisputeService.deleteDispute(req.params.id);
            res.json(dispute);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    // Get disputes by user id
    getDisputesByUserId: async (req: Request, res: Response) => {
        const authUser = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!authUser?.user) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        try {
            const userId = req.params.id;
            if (!userId) {
                return res.status(400).json({ error: "Missing user id" });
            }

            // IDOR Protection: Only Admin or Owner can view
            if (authUser.user.role !== "ADMIN" && userId !== authUser.user.id) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const dispute = await DisputeService.getDisputesByUserId(userId);
            res.json(dispute);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
