import { asyncHandler } from "../utils/asyncHandler.js";
import { Log } from "../models/Log.model.js";
import { v4 as uuidv4 } from "uuid";

import { processLog } from "../utils/threatEngine.js";

// Configuration for Active Defense
const BLOCK_MODE = true; // Set to true to enable blocking (IPS mode)

export const monitorRequest = asyncHandler(async (req, res, next) => {
    const start = Date.now();
    const requestId = uuidv4();

    // --- Phase 1: Capture Request ---
    const contentLengthIn = req.get("content-length");
    const bytesIn = contentLengthIn ? parseInt(contentLengthIn, 10) : 0;

    const logData = {
        logId: requestId,
        timestamp: new Date(),
        sourceIP: req.ip || req.connection.remoteAddress,
        sourceType: "APP",
        userId: null, // will be filled in finish if req.user exists
        targetSystem: "Mini-SOC-Backend",
        endpoint: req.originalUrl,
        httpMethod: req.method,
        statusCode: 0, // will set in finish
        category: "REQUEST",
        eventType: "HTTP_REQUEST",
        severity: "LOW",
        classification: "INFO",
        attackVector: "NONE",
        details: {
            message: null,
            suspiciousFragment: null,
            username: req.body?.username || null,
            ports: [],
            bytesIn,
            bytesOut: 0,
            fileName: null,
            command: null,
            ruleId: null,
            patternMatched: null,
            tags: ["REQUEST_LOG"]
        }
    };

    // --- Phase 2: Detection (Signatures) ---
    const bodyString = JSON.stringify(req.body || {}).toLowerCase();
    const queryParams = JSON.stringify(req.query || {}).toLowerCase();
    const urlString = req.originalUrl.toLowerCase();

    // Combine all inputs for scanning
    const payload = bodyString + queryParams + urlString;

    const signatures = {
        SQLI: [
            "' or '1'='1",
            "union select",
            "drop table",
            "select * from",
            "--",
            ";--",
            "insert into",
            "update set",
            "delete from"
        ],
        XSS: [
            "<script>",
            "javascript:",
            "onload=",
            "onerror=",
            "alert(",
            "document.cookie",
            "eval(",
            "window.location"
        ],
        RCE: [
            "; ls",
            "&& ls",
            "; cat /etc/passwd",
            "| whoami",
            "system("
        ]
    };

    let detectedThreat = null;

    // Check SQLi
    for (const pattern of signatures.SQLI) {
        if (payload.includes(pattern)) {
            detectedThreat = { type: "SQLI", pattern };
            break;
        }
    }

    // Check XSS (if no SQLi found yet)
    if (!detectedThreat) {
        for (const pattern of signatures.XSS) {
            if (payload.includes(pattern)) {
                detectedThreat = { type: "XSS", pattern };
                break;
            }
        }
    }

    // Check RCE
    if (!detectedThreat) {
        for (const pattern of signatures.RCE) {
            if (payload.includes(pattern)) {
                detectedThreat = { type: "RCE", pattern };
                break;
            }
        }
    }

    if (detectedThreat) {
        // Upgrade log fields
        logData.category = "SECURITY";
        logData.eventType = `${detectedThreat.type}_DETECTED`;
        logData.severity = "HIGH";
        logData.classification = "CONFIRMED_ATTACK";
        logData.attackVector = detectedThreat.type;
        logData.details.ruleId = `${detectedThreat.type}-001`;
        logData.details.patternMatched = detectedThreat.pattern;
        logData.details.suspiciousFragment = detectedThreat.pattern;
        logData.details.tags.push(detectedThreat.type);
    }

    // --- Phase 3: Attach "finish" listener ---
    res.on("finish", async () => {
        const duration = Date.now() - start;

        // If JWT auth ran, we can pick the final userId here
        logData.userId = req.user?.id || null;

        logData.statusCode = res.statusCode;
        logData.details.message = `Request took ${duration}ms`;

        const contentLengthOut = res.get("Content-Length");
        if (contentLengthOut) {
            logData.details.bytesOut = parseInt(contentLengthOut, 10);
        }

        try {
            // SAVE Log into MongoDB
            const savedLog = await Log.create(logData);

            // IF SECURITY LOG -> call ThreatEngine
            if (logData.category === "SECURITY") {
                // Call ThreatEngine asynchronously (fire and forget from request perspective)
                processLog(savedLog);
            }
        } catch (error) {
            console.error("Failed to save monitoring log:", error);
        }
    });

    // --- Condition: Block or Next ---
    if (BLOCK_MODE && detectedThreat) {
        // RETURN 403 (block request)
        return res.status(403).json({
            success: false,
            message: "Malicious Request Detected",
            reason: `${detectedThreat.type} attempt blocked`,
            requestId: requestId
        });
        // Note: The 'finish' listener above will still execute when this response finishes, saving the log.
    } else {
        next();
    }
});
