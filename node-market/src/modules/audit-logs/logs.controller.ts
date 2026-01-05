import { LogsService } from "./logs.service";
import { Request, Response } from "express";
import { auth } from "../../auth";
import { fromNodeHeaders } from "better-auth/node";


export const LogsController = {
    getAllLogs: async (req: Request, res: Response) => {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const logs = await LogsService.getAllLogs()
            return res.json(logs)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
    getLogById: async (req: Request, res: Response) => {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const log = await LogsService.getLogById(req.params.id as string)
            return res.json(log)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
    deleteLog: async (req: Request, res: Response) => {
        const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
        if (!session?.user) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user.role !== "ADMIN") {
            return res.status(403).json({ error: "Forbidden" });
        }
        try {
            const log = await LogsService.deleteLog(req.params.id as string)
            return res.json(log)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
}