import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext({ socket: null, isConnected: false });

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const envServerURL = import.meta.env.VITE_SERVER || "http://localhost:8000";
        let connectionURL = envServerURL;

        // If VITE_SERVER contains a path (like /api/v1), strip it because socket.io
        // treats the path as a namespace. We want to connect to the root namespace.
        try {
            const url = new URL(envServerURL);
            connectionURL = url.origin;
        } catch (e) {
            console.warn("[Socket] Invalid VITE_SERVER URL, using as-is:", envServerURL);
        }

        console.log('[Socket] Connecting to:', connectionURL);
        console.log('[Socket] Environment VITE_SERVER:', envServerURL);

        // Connect to backend with proper configuration
        const newSocket = io(connectionURL, {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Explicitly set transports
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
            timeout: 20000,
            path: '/socket.io/', // Explicit path (default, but making it explicit)
            forceNew: false, // Reuse existing connection if available
        });

        // Connection event listeners
        newSocket.on('connect', () => {
            console.log('[Socket] Connected successfully:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[Socket] Disconnected:', reason);
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            console.error('[Socket] Error type:', error.type);
            console.error('[Socket] Error description:', error.description);
            console.error('[Socket] Full error:', error);
            setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
            console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
            setIsConnected(true);
        });

        newSocket.on('reconnect_attempt', (attemptNumber) => {
            console.log('[Socket] Reconnection attempt', attemptNumber);
        });

        newSocket.on('reconnect_error', (error) => {
            console.error('[Socket] Reconnection error:', error.message);
        });

        newSocket.on('reconnect_failed', () => {
            console.error('[Socket] Reconnection failed after all attempts');
        });

        setSocket(newSocket);

        return () => {
            console.log('[Socket] Cleaning up connection');
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
