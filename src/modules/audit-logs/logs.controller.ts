import { LogsService } from "./logs.service";
import { Request, Response } from "express";


export const LogsController = {
    getAllLogs: async (req: Request, res: Response) => {
        try {
            const logs = await LogsService.getAllLogs()
            return res.json(logs)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
    getLogById: async (req: Request, res: Response) => {
        try {
            const log = await LogsService.getLogById(req.params.id as string)
            return res.json(log)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
    deleteLog: async (req: Request, res: Response) => {
        try {
            const log = await LogsService.deleteLog(req.params.id as string)
            return res.json(log)
        } catch (error) {
            return res.status(500).json({ error: "Internal Server Error" })
        }
    },
}