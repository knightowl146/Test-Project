import mongoose, { Schema } from "mongoose";

const incidentSchema = new Schema(
    {
<<<<<<< HEAD
        // Unique identifier for the incident (e.g., INC-A1B2C3D4)
        incidentId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        title: {
            type: String,
            required: true
        },
        // Phase 8: Incident Triage & Prioritization
        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "CLOSED_TRUE_POSITIVE", "CLOSED_FALSE_POSITIVE"],
            default: "OPEN"
        },
=======
        incidentId: {
            type: String,
            required: true,
            unique: true
        },
        type: {
            type: String,
            required: true, // e.g., "SQL Injection", "XSS", "Brute Force"
        },
        sourceIp: {
            type: String,
            required: true
        },
>>>>>>> upstream/main
        severity: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            required: true
        },
<<<<<<< HEAD
        attackVector: {
            type: String,
            enum: ["NONE", "SQLI", "XSS", "BRUTEFORCE", "PORTSCAN", "DDOS", "TOKEN_ABUSE", "MALWARE", "OTHER"],
            required: true
        },
        attackerIP: {
            type: String,
            required: true,
            index: true
        },
        endpointTargeted: {
            type: String,
            default: null
        },
        // Link to the Log documents that caused or contributed to this incident
        relatedLogIds: {
            type: [Schema.Types.ObjectId],
            ref: "Log",
            default: []
        },
        // Count of security events tied to this single incident (correlation)
=======
        status: {
            type: String,
            enum: ["OPEN", "IN_PROGRESS", "RESOLVED", "FALSE_POSITIVE"],
            default: "OPEN"
        },
>>>>>>> upstream/main
        occurrenceCount: {
            type: Number,
            default: 1
        },
<<<<<<< HEAD
        timeOfFirstEvent: {
            type: Date,
            required: true
        },
        timeOfLastEvent: {
            type: Date,
            required: true
        },
        // Analyst-related fields for Phase 8/9
        assignedTo: {
            type: String,
            default: null
        },
        analystNotes: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true // Tracks createdAt and updatedAt
    }
);

export const Incident = mongoose.model("Incident", incidentSchema);
=======
        firstSeenAt: {
            type: Date,
            required: true
        },
        lastSeenAt: {
            type: Date,
            required: true
        },
        relatedLogs: [{
            type: Schema.Types.ObjectId,
            ref: "Log"
        }],
        analystNotes: {
            type: String,
            default: null
        },
        assignedTo: {
            type: String, // User ID of the analyst
            default: null
        },
        triggerRule: {
            type: String,
            default: null // e.g., "SQLI-001"
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster dashboard queries
incidentSchema.index({ status: 1, severity: -1 });
incidentSchema.index({ sourceIp: 1 });
incidentSchema.index({ createdAt: -1 });

export const Incident = mongoose.model("Incident", incidentSchema);
>>>>>>> upstream/main
