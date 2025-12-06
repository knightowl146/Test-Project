import mongoose, { Schema } from "mongoose";

const blocklistSchema = new Schema(
    {
        ip: {
            type: String,
            required: true,
            unique: true
        },
        reason: {
            type: String,
            required: true // e.g., "Repeated SQL Injection attempts"
        },
        source: {
            type: String,
            enum: ["MANUAL", "AUTOMATED", "RULE_ENGINE"],
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        blockedAt: {
            type: Date,
            default: Date.now
        },
        expiresAt: {
            type: Date,
            default: null // null means permanent block
        },
        createdBy: {
            type: String, // "SYSTEM" or Analyst ID
            default: "SYSTEM"
        }
    },
    {
        timestamps: true
    }
);

// blocklistSchema.index({ ip: 1 });
blocklistSchema.index({ isActive: 1 });

const Blocklist = mongoose.model("Blocklist", blocklistSchema);
export default Blocklist;
