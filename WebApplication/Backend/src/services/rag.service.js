import { GoogleGenerativeAI } from "@google/generative-ai";
import { RagChunk } from "../models/RagChunk.model.js";
import Incident from "../models/Incident.model.js";

const getApiKeys = () => {
    const keys = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',') : [];
    if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
    return [...new Set(keys.filter(k => k))]; // Unique non-empty keys
};

const apiKeys = getApiKeys();
if (apiKeys.length === 0) {
    console.warn("No GEMINI_API_KEYS provided. RAG features will fail.");
}

const clients = apiKeys.map(key => new GoogleGenerativeAI(key));

// Helper: Execute with Rotation
const executeWithRetry = async (operationName, operationFn) => {
    let lastError = null;
    for (let i = 0; i < clients.length; i++) {
        try {
            // Simple round-robin or just failover? Requirement says: Key 1 fails -> Key 2.
            // So we try client[i].
            return await operationFn(clients[i]);
        } catch (error) {
            console.warn(`[RAG] Key ${i + 1} failed for ${operationName}:`, error.message);
            lastError = error;
            // Continue to next key
        }
    }
    throw lastError || new Error(`All API keys failed for ${operationName}`);
};

// Helper: Cosine Similarity
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const ragService = {
    // 1. Embed Text
    embedText: async (text) => {
        try {
            return await executeWithRetry("EmbedText", async (client) => {
                const model = client.getGenerativeModel({ model: "text-embedding-004" });
                const result = await model.embedContent(text);
                return result.embedding.values;
            });
        } catch (error) {
            console.error("Embedding Error (All Keys Failed):", error);
            throw new Error("Failed to generate embedding");
        }
    },

    // 2. Search Chunks (Semantic Search)
    search: async (queryText, topK = 5) => {
        const queryEmbedding = await ragService.embedText(queryText);

        // Fetch all chunks (For "Mini" SOC this is fine. For production, use Vector DB like Pinecone/Mongo Atlas Search)
        // Optimization: Select only embedding and content to reduce RAM usage slightly if needed, but we need metadata too.
        const allChunks = await RagChunk.find({ isActive: true }).lean();

        const chunksWithScore = allChunks.map(chunk => ({
            ...chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }));

        // Sort by score desc
        chunksWithScore.sort((a, b) => b.score - a.score);

        return chunksWithScore.slice(0, topK);
    },

    // 3. Get Live Context
    getLiveContext: async (queryText) => {
        // Simple regex to find Incident IDs like INC-1234
        const incidentMatch = queryText.match(/(INC-\d+)/i);
        if (incidentMatch) {
            const incidentId = incidentMatch[0].toUpperCase();
            const incident = await Incident.findOne({ incidentId }).lean();
            if (incident) {
                return `LIVE INCIDENT FOUND:\n${JSON.stringify(incident, null, 2)}`;
            }
        }
        return "No specific live incident ID detected in query.";
    },

    // 4. Generate Response
    generateResponse: async (query, contextChunks, liveContext) => {

        const contextText = contextChunks.map(c => `[${c.metadata.type || 'INFO'}] ${c.content}`).join("\n\n");

        const prompt = `
You are SHIELD, an elite SOC (Security Operations Center) Assistant.
Your goal is to help security analysts investigate incidents and understand threats.

CONTEXT FROM KNOWLEDGE BASE:
${contextText}

LIVE SYSTEM DATA:
${liveContext}

USER QUESTION:
${query}

INSTRUCTIONS:
- Be concise, technical, and actionable.
- Use bullet points for steps.
- If the RAG context or Live data helps, reference it.
- If you don't know, say "I don't have enough info in my knowledge base."
- Do NOT make up fake incident details if they aren't in the LIVE SYSTEM DATA.
        `;

        return await executeWithRetry("GenerateResponse", async (client) => {
            const model = client.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
            const result = await model.generateContent(prompt);
            return result.response.text();
        });
    },

    // 5. Full Pipeline Wrapper
    processChat: async (userMessage) => {
        // A. Search
        const chunks = await ragService.search(userMessage);

        // B. Live Context
        const liveData = await ragService.getLiveContext(userMessage);

        // C. Generate
        const reply = await ragService.generateResponse(userMessage, chunks, liveData);

        return {
            reply,
            sources: chunks.map(c => c.metadata.title || 'Unknown Source')
        };
    }
};

// Seed function to add some dummy data if empty
export const seedKnowledgeBase = async () => {
    const count = await RagChunk.countDocuments();
    if (count === 0) {
        console.log("Seeding Knowledge Base...");
        const docs = [
            {
                content: "Phishing Playbook: 1. Isolate the affected host. 2. Reset user credentials immediately. 3. Block the sender domain on the email gateway. 4. Scan the host for malware artifacts.",
                metadata: { type: "Playbook", title: "Phishing Response" }
            },
            {
                content: "SQL Injection (SQLi) Handling: Patterns include 'OR 1=1' or 'UNION SELECT'. If detected: 1. Block the source IP. 2. Check WAF logs for bypass attempts. 3. Patch the vulnerable endpoint. 4. Sanitize all inputs using parameterized queries.",
                metadata: { type: "SOP", title: "SQL Injection" }
            },
            {
                content: "Ransomware Containment: IMMEDIATE ACTION REQUIRED. 1. Disconnect infected device from network (pull ethernet/disable wifi). 2. Do NOT power off (ram contents needed). 3. Alert the CISO. 4. Check backups for integrity.",
                metadata: { type: "Playbook", title: "Ransomware" }
            }
        ];

        for (const doc of docs) {
            const embedding = await ragService.embedText(doc.content);
            await RagChunk.create({ ...doc, embedding });
        }
        console.log("Seeding Complete.");
    }
};
