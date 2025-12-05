const http = require('http');
const { io } = require('socket.io-client');

// 1. Start the Server (we assume it's running separately or we start it here? Better to assume running)
// Actually, for a self-contained test, let's just require the server file, but it starts listening automatically.
// So we'll just run this script AFTER starting the server.
// WAIT, I can't easily start two processes in one go and keep them alive.
// I will write a script that connects to the ALREADY RUNNING server.
// But I haven't started the server yet.
// I will start the server in background, then run this test.

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to WebSocket');

    // Start Simulation via API
    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/simulation/start',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        console.log(`Start API Status: ${res.statusCode}`);
    });
    req.end();
});

socket.on('log', (data) => {
    console.log('Received Log:', JSON.stringify(data, null, 2));
    // After receiving a few logs, stop and exit
    if (data.event_type) {
        // Just show we got data
    }
});

// Stop after 5 seconds
setTimeout(() => {
    console.log('Stopping simulation...');
    const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/simulation/stop',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        console.log(`Stop API Status: ${res.statusCode}`);
        socket.disconnect();
        process.exit(0);
    });
    req.end();
}, 5000);
