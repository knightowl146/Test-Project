import Blocklist from "../models/Blocklist.model.js";

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
