import mongoose, { Schema } from "mongoose";

const ruleSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String
        },
        pattern: {
            type: String, // Regex string or substring
            required: true
        },
        category: {
            type: String, // SQLI, XSS, RCE, DATA_EXFIL, etc.
            required: true,
            enum: ['SQLI', 'XSS', 'RCE', 'BRUTE_FORCE', 'MALWARE', 'DATA_EXFIL', 'DDOS', 'OTHER']
        },
        severity: {
            type: String,
            required: true,
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        createdBy: {
            type: String // Admin username
        },
        tags: [{
            type: String
        }]
    },
    {
        timestamps: true
    }
);

// Ensure efficiency when looking up active rules
ruleSchema.index({ isActive: 1, category: 1 });

const Rule = mongoose.model("Rule", ruleSchema);
export default Rule;
