import { RefundsService } from "./refunds.service";
import { Request, Response } from "express";
import { OrderStatus } from "../../generated/prisma/enums";


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

    updateRefundStatus: async (req: Request, res: Response) => {
        try {
            const session = res.locals.session;
            const { id } = req.params;
            const { status } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: "Refund ID is required" });
            }

            if (!status) {
                return res.status(400).json({ success: false, message: "Status is required" });
            }

            // If status is REFUNDED, process through Stripe
            if (status === 'REFUNDED') {
                const result = await RefundsService.processStripeRefund(id, `admin:${session.user.id}`);
                return res.status(200).json({ 
                    success: true, 
                    refundId: result.refundId,
                    message: "Refund processed successfully through Stripe" 
                });
            }

            // For other status updates (like REFUND_PENDING, CANCELLED)
            const refund = await RefundsService.updateRefundStatus(id, status as OrderStatus, `admin:${session.user.id}`);
            return res.status(200).json({ success: true, refund, message: "Refund status updated" });
        } catch (error) {
            console.error('Refund error:', error);
            return res.status(500).json({ success: false, error: (error as Error).message });
        }
    },

    updateRefundAmount: async (req: Request, res: Response) => {
        try {
            const session = res.locals.session;
            const { id } = req.params;
            const { amount } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: "Refund ID is required" });
            }

            if (!amount) {
                return res.status(400).json({ success: false, message: "Amount is required" });
            }

            const refund = await RefundsService.updateRefundAmount(id, amount, `admin:${session.user.id}`);
            return res.status(200).json({ success: true, refund, message: "Refund amount updated" });
        } catch (error) {
            return res.status(500).json({ success: false, error: (error as Error).message });
        }
    },

    updateRefundReferenceCode: async (req: Request, res: Response) => {
        try {
            const session = res.locals.session;
            const { id } = req.params;
            const { orderReference } = req.body;

            if (!id) {
                return res.status(400).json({ success: false, message: "Refund ID is required" });
            }

            if (!orderReference) {
                return res.status(400).json({ success: false, message: "Order reference is required" });
            }

            const refund = await RefundsService.updateRefundReferenceCode(id, orderReference, `admin:${session.user.id}`);
            return res.status(200).json({ success: true, refund, message: "Refund reference code updated" });
        } catch (error) {
            return res.status(500).json({ success: false, error: (error as Error).message });
        }
    },
}

