import { DisputeService } from "./dispute.service";
import { Request, Response } from "express";




export const DisputeController = {

    // Get all disputes (Admin only - protected by isAdmin middleware)
    getAllDisputes: async (req: Request, res: Response) => {
        try {
            const disputes = await DisputeService.getAllDisputes();
            res.json(disputes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },
    // Get dispute by id (User can view their own, Admin can view all)
    getDisputeById: async (req: Request, res: Response) => {
        try {
            const session = res.locals.session;
            
            if (!req.params.id) {
                return res.status(400).json({ error: "Missing dispute id" });
            }
            
            const dispute = await DisputeService.getDisputeById(req.params.id);
            if (!dispute) return res.status(404).json({ error: "Dispute not found" });

            // IDOR Protection: Only Admin or Owner can view
            if (session.user.role !== "ADMIN" && dispute.openedBy !== session.user.id) {
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

        try {
            const session = res.locals.session;
            // Force openedBy to be the current user if not admin
            const disputeData = { ...req.body };
  
                disputeData.openedBy = session.user.name || session.user.id;
            

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
    // Update dispute (Admin only - protected by isAdmin middleware)
    updateDispute: async (req: Request, res: Response) => {
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
    // Delete dispute (Admin only - protected by isAdmin middleware)
    deleteDispute: async (req: Request, res: Response) => {
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
    // Get disputes by user id (User can view their own, Admin can view any)
    getDisputesByUserId: async (req: Request, res: Response) => {
        try {
            const session = res.locals.session;
            const requestedUserId = req.params.id;
            
            if (!requestedUserId) {
                return res.status(400).json({ error: "Missing user id" });
            }

            // IDOR Protection: Users can only see their own disputes, admins can see any user's
            if (session.user.role !== "ADMIN" && requestedUserId !== session.user.id) {
                return res.status(403).json({ error: "Forbidden" });
            }

            const disputes = await DisputeService.getDisputesByUserId(requestedUserId);
            res.json(disputes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}
