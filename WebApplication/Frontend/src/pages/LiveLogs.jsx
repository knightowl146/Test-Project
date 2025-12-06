import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { X } from 'lucide-react';

const LiveLogs = () => {
    const [logs, setLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({ severity: '', category: '' });
    const { socket, isConnected } = useSocket();

    const fetchLogs = async () => {
        try {
            const params = {};
            if (filters.severity) params.severity = filters.severity;
            if (filters.category) params.category = filters.category;

            const res = await api.get('/logs', { params });
            if (res.data.success) {
                setLogs(res.data.data.logs);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    useEffect(() => {
        if (!socket) return;

        socket.on("NEW_LOG", (newLog) => {
            // Apply client-side filtering if needed, or just prepend
            // For strict filtering, we might need to check if newLog matches filters
            setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50
        });

        return () => socket.off("NEW_LOG");
    }, [socket]);

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'CRITICAL': return 'text-red-500 font-bold';
            case 'HIGH': return 'text-orange-500 font-bold';
            case 'MEDIUM': return 'text-yellow-500';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="flex h-full">
            <div className="flex-1 p-6 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Live Security Logs</h2>
                    <div className="flex gap-4">
                        <select
                            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2"
                            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                        >
                            <option value="">All Severities</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                        <select
                            className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2"
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            <option value="REQUEST">Request</option>
                            <option value="SECURITY">Security</option>
                        </select>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900/50 text-slate-400 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Method / Endpoint</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {logs.map((log) => (
                                <tr key={log._id || log.logId} onClick={() => setSelectedLog(log)} className="hover:bg-slate-700/50 cursor-pointer transition-colors">
                                    <td className="px-6 py-4 text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-6 py-4 text-sky-400 font-mono">{log.sourceIP}</td>
                                    <td className="px-6 py-4 text-white font-medium">{log.eventType}</td>
                                    <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{log.httpMethod} {log.endpoint}</td>
                                    <td className={`px-6 py-4 ${getSeverityColor(log.severity)}`}>{log.severity}</td>
                                    <td className="px-6 py-4">
                                        <button className="text-blue-400 hover:underline">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Side Panel for Detail */}
            {selectedLog && (
                <div className="w-96 bg-slate-900 border-l border-slate-800 p-6 overflow-auto shadow-2xl relative animate-in slide-in-from-right">
                    <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-bold text-white mb-6">Log Details</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Event Type</label>
                            <p className="text-lg text-white font-medium">{selectedLog.eventType}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Source</label>
                            <p className="text-slate-300 font-mono">{selectedLog.sourceIP}</p>
                            <p className="text-sm text-slate-500">{selectedLog.userAgent}</p>
                        </div>
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Request</label>
                            <p className="text-slate-300 font-mono bg-slate-950 p-2 rounded mt-1 border border-slate-800">
                                {selectedLog.httpMethod} {selectedLog.endpoint}
                            </p>
                        </div>
                        {selectedLog.details && (
                            <div>
                                <label className="text-xs uppercase text-slate-500 font-bold">Threat Details</label>
                                <div className="bg-red-900/20 border border-red-900/50 rounded p-3 mt-1">
                                    <p className="text-sm text-red-200"><span className="font-bold">Vector:</span> {selectedLog.attackVector}</p>
                                    <p className="text-sm text-red-200 mt-1"><span className="font-bold">Rule:</span> {selectedLog.details.ruleId}</p>
                                    {selectedLog.details.suspiciousFragment && (
                                        <p className="text-sm text-red-200 mt-2 font-mono break-all">{selectedLog.details.suspiciousFragment}</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="text-xs uppercase text-slate-500 font-bold">Raw Data</label>
                            <pre className="text-xs text-slate-500 mt-2 overflow-auto max-h-40 bg-slate-950 p-2 rounded">
                                {JSON.stringify(selectedLog, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveLogs;
