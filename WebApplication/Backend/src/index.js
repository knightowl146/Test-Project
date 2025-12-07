import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

import { createServer } from "http";
import { initSocket } from "./socket.js";
import { startLogCleanup } from "./utils/cleanupService.js";
import { seedKnowledgeBase } from "./services/rag.service.js";

connectDB()
    .then(async () => {
        const server = createServer(app);
        initSocket(server);
        startLogCleanup();

        // Seed RAG Data
        try {
            await seedKnowledgeBase();
        } catch (err) {
            console.error("Seeding Failed:", err);
        }

        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
