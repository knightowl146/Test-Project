<<<<<<< HEAD
import { isIPBlocked } from '../services/containment.service.js';
// Removed ApiError import as middleware handles its own response

/**
 * PHASE 10: Enforces the IP Blocklist using the Redis-based service.
 */
export const blocklistEnforcer = async (req, res, next) => {
    // Get the client IP (using the same logic as in monitorRequest)
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check Redis for blocklist status
    const isBlocked = await isIPBlocked(clientIP);

    if (isBlocked) {
        console.warn(`[BLOCK] Request from blocked IP: ${clientIP}`);

        // Block the request with a standard 403 Forbidden error
        return res.status(403).json({
            success: false,
            message: "Access Denied: Your IP address has been flagged for security violations."
        });
    }

    next();
};
=======
import { Blocklist } from "../models/Blocklist.model.js";

export const blocklistMiddleware = async (req, res, next) => {
    // try to get real client IP
    const forwarded = req.headers["x-forwarded-for"];
    const ipFromHeader = Array.isArray(forwarded)
        ? forwarded[0]
        : typeof forwarded === "string"
            ? forwarded.split(",")[0].trim()
            : null;

    const sourceIP = ipFromHeader || req.ip || req.connection.remoteAddress;

    try {
        // Check if IP exists in blocklist and is active
        const entry = await Blocklist.findOne({ ip: sourceIP, isActive: true });

        if (entry) {
            return res.status(403).json({
                success: false,
                message: "Access denied by Mini-SOC blocklist"
            });
        }
    } catch (err) {
        console.error("Blocklist check failed:", err.message);
        // fail-open: if DB error, let request proceed
    }

    next();
};
>>>>>>> upstream/main
