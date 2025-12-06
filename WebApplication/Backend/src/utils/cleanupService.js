import Log from "../models/Log.model.js";

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run every 1 hour
const RETENTION_PERIOD_HOURS = 12;

export const runCleanup = async () => {
    try {
        const thresholdDate = new Date();
        thresholdDate.setHours(thresholdDate.getHours() - RETENTION_PERIOD_HOURS);

        const result = await Log.deleteMany({ timestamp: { $lt: thresholdDate } });

        if (result.deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${result.deletedCount} logs older than ${RETENTION_PERIOD_HOURS} hours.`);
        }
    } catch (error) {
        console.error("[Cleanup] Failed to delete old logs:", error);
    }
};

export const startLogCleanup = () => {
    console.log("[Cleanup] Log retention service started.");

    // Run immediately on startup
    runCleanup();

    // Schedule periodic cleanup
    setInterval(runCleanup, CLEANUP_INTERVAL_MS);
};
