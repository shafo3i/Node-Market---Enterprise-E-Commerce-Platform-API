import { RefundsService } from "./refunds.service";
import { Request, Response } from "express";


export const RefundsController = {
    getAllRefunds: async (req: Request, res: Response) => {
        try {
            const refunds = await RefundsService.getAllRefunds()
            return res.json(refunds)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
    getRefundById: async (req: Request, res: Response) => {
        try {
            const refund = await RefundsService.getRefundById(req.params.id as string)
            return res.json(refund)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
}

