const winston = require('winston');

// Custom format for JSON output
const jsonFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
    return JSON.stringify({
        timestamp,
        ...message, // We expect 'message' to be the log object itself
    });
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        jsonFormat
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// Helper to broadcast to WebSocket if available
let ioInstance = null;

const setIo = (io) => {
    ioInstance = io;
};

const logEvent = (eventData) => {
    // Add timestamp if not present (though winston adds it, we want it in the data object for WS)
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...eventData
    };

    // Log to Console (Standard Output)
    logger.info(logEntry);

    // Broadcast to WebSocket
    if (ioInstance) {
        ioInstance.emit('log', logEntry);
    }
};

module.exports = {
    setIo,
    logEvent
};
