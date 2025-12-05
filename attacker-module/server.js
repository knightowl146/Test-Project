const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { setIo } = require('./lib/logger');
const engine = require('./lib/attacker-engine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Pass IO instance to logger
setIo(io);

// API Routes
app.post('/api/simulation/start', (req, res) => {
    engine.startSimulation();
    res.json({ status: 'started' });
});

app.post('/api/simulation/stop', (req, res) => {
    engine.stopSimulation();
    res.json({ status: 'stopped' });
});

app.post('/api/simulation/config', (req, res) => {
    engine.updateConfig(req.body);
    res.json({ status: 'updated' });
});

app.get('/api/simulation/status', (req, res) => {
    res.json({ running: engine.getStatus() });
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('Client connected to Log Stream');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Attacker Module running on port ${PORT}`);
    console.log(`Control API: http://localhost:${PORT}/api/simulation`);
    console.log(`WebSocket Stream: ws://localhost:${PORT}`);
});
