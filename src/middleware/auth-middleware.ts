import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware to ensure the user is authenticated.
 * Attaches the session to res.locals.session for downstream use.
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).json({ error: "Unauthenticated" });
        }

        // Attach session to locals for efficient access in controllers/middlewares
        res.locals.session = session;

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal Server Error during authentication" });
    }
};

/**
 * ADMIN-only middleware.
 * Combines authentication + role check in one atomic operation and stores session in res.locals.
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        res.locals.session = session;
        next();
    } catch (error) {
        console.error("Admin Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal Server Error during admin authentication" });
    }
}

/**
 * MERCHANT-only middleware.
 * Combines authentication + role check in one atomic operation and stores session in res.locals.
 */
export const isMerchant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user?.role !== 'MERCHANT') {
            return res.status(403).json({ error: "Forbidden: Merchants only" });
        }
        res.locals.session = session;
        next();
    } catch (error) {
        console.error("Merchant Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal Server Error during merchant authentication" });
    }
}

/**
 * CUSTOMER-only middleware.
 * Combines authentication + role check in one atomic operation and stores session in res.locals.
 */
export const isCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });
        if (!session) {
            return res.status(401).json({ error: "Unauthenticated" });
        }
        if (session.user?.role !== 'CUSTOMER') {
            return res.status(403).json({ error: "Forbidden: Customers only" });
        }
        res.locals.session = session;
        next();
    } catch (error) {
        console.error("Customer Auth Middleware Error:", error);
        return res.status(500).json({ error: "Internal Server Error during customer authentication" });
    }
}
