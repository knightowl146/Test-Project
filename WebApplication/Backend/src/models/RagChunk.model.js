import mongoose from 'mongoose';

const ragChunkSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    metadata: {
        type: Object, // e.g., { type: 'playbook', title: 'Phishing', source: 'SOP-1' }
        default: {}
    },
    embedding: {
        type: [Number], // Vector string
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Basic index for metadata searching
ragChunkSchema.index({ "metadata.type": 1 });

export const RagChunk = mongoose.model('RagChunk', ragChunkSchema);
