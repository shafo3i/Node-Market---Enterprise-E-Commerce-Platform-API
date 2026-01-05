import { RefundsService } from "./refunds.service";
import { Request, Response } from "express";
import { auth } from "../../auth";
import { fromNodeHeaders } from "better-auth/node";

export const RefundsController = {
    getAllRefunds: async (req: Request, res: Response) => {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const refunds = await RefundsService.getAllRefunds()
            return res.json(refunds)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
    getRefundById: async (req: Request, res: Response) => {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const refund = await RefundsService.getRefundById(req.params.id as string)
            return res.json(refund)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
}

