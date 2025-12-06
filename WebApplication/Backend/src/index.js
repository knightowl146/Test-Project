import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

import { createServer } from "http";
import { initSocket } from "./socket.js";
import { startLogCleanup } from "./utils/cleanupService.js";

connectDB()
    .then(() => {
        const server = createServer(app);
        initSocket(server);
        startLogCleanup();

        server.listen(process.env.PORT || 8000, () => {
            console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!! ", err);
    })
