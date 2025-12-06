import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import Incident from "../models/Incident.model.js";
import Log from "../models/Log.model.js";
import Blocklist from "../models/Blocklist.model.js";
import mongoose from "mongoose";


const getSystemHealth = asyncHandler(async (req, res) => {

    const dbStatus = mongoose.connection.readyState === 1 ? "UP" : "DOWN";


    const [
        activeIncidents,
        criticalIncidents,
        totalLogs24h,
        totalBlocks,
        recentLogs1h
    ] = await Promise.all([
        Incident.countDocuments({ status: { $in: ["OPEN", "IN_PROGRESS"] } }),
        Incident.countDocuments({ severity: "CRITICAL", status: { $in: ["OPEN", "IN_PROGRESS"] } }),
        Log.countDocuments({ timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        Blocklist.countDocuments({ isActive: true }),
        Log.countDocuments({ timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } })
    ]);

    const topAttackers = await Log.aggregate([
        {
            $match: {
                category: "SECURITY",
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        },
        { $group: { _id: "$sourceIP", count: { $sum: 1 }, country: { $first: "$geo.country" } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

    const healthData = {
        system: {
            database: dbStatus,
            api: "UP",
            socket: "UNKNOWN"
        },
        metrics: {
            activeIncidents,
            criticalIncidents,
            blockedIPs: totalBlocks,
            logsLastHour: recentLogs1h,
            logsLast24h: totalLogs24h,
            mttr: "45m"
        },
        topAttackers
    };

    return res.status(200).json(
        new ApiResponse(200, healthData, "System health data fetched successfully")
    );
});

export { getSystemHealth };
