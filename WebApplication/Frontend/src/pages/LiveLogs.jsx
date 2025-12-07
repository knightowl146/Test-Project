import React, { useEffect, useState, useRef, useCallback } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { X, Loader } from 'lucide-react';

const LiveLogs = () => {
    const [logs, setLogs] = useState([]);
    const [selectedLog, setSelectedLog] = useState(null);
    const [filters, setFilters] = useState({ severity: '', category: '' });
    const { socket } = useSocket();

    // Pagination State
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const lastLogElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchLogs = async (pageNum, isNewFilter = false) => {
        setLoading(true);
        try {
            const params = {
                page: pageNum,
                limit: 20 // Fetch 20 at a time for smooth scroll
            };
            if (filters.severity) params.severity = filters.severity;
            if (filters.category) params.category = filters.category;

            const res = await api.get('/logs', { params });
            if (res.data.success) {
                const newLogs = res.data.data.logs;
                setLogs(prev => {
                    // Combine and remove duplicates based on _id/logId just in case
                    const combined = isNewFilter ? newLogs : [...prev, ...newLogs];
                    const unique = Array.from(new Map(combined.map(item => [item._id || item.logId, item])).values());
                    return unique;
                });
                setHasMore(newLogs.length > 0 && newLogs.length >= params.limit);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    // Reset when filters change
    useEffect(() => {
        setPage(1);
        setLogs([]);
        setHasMore(true);
        fetchLogs(1, true);
    }, [filters]);

    // Fetch on page change (except initial load which is covered above or if page is 1 and already fetched)
    useEffect(() => {
        if (page > 1) {
            fetchLogs(page);
        }
    }, [page]);

    useEffect(() => {
        if (!socket) return;

        socket.on("NEW_LOG", (newLog) => {
            // Apply client-side filtering if needed
            if (filters.severity && newLog.severity !== filters.severity) return;
            if (filters.category && newLog.category !== filters.category) return;

            setLogs(prev => {
                // Prepend new log. Keep max list size reasonable if desired, or let it grow infinite
                // "YouTube style" usually keeps growing downward, but real-time updates happen at the top.
                // We'll just prepend.
                const updated = [newLog, ...prev];
                return updated;
            });
        });

        return () => socket.off("NEW_LOG");
    }, [socket, filters]);

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
                            {logs.map((log, index) => {
                                // Attach ref to the last element
                                const isLast = index === logs.length - 1;
                                return (
                                    <tr
                                        key={log._id || log.logId}
                                        ref={isLast ? lastLogElementRef : null}
                                        onClick={() => setSelectedLog(log)}
                                        className="hover:bg-slate-700/50 cursor-pointer transition-colors"
                                    >
                                        <td className="px-6 py-4 text-slate-300">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-6 py-4 text-sky-400 font-mono">{log.sourceIP}</td>
                                        <td className="px-6 py-4 text-white font-medium">{log.eventType}</td>
                                        <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{log.httpMethod} {log.endpoint}</td>
                                        <td className={`px-6 py-4 ${getSeverityColor(log.severity)}`}>{log.severity}</td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-400 hover:underline">View</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="p-4 flex justify-center text-slate-400 bg-slate-800/50">
                            <Loader className="animate-spin mr-2" /> Loading more logs...
                        </div>
                    )}

                    {!hasMore && logs.length > 0 && (
                        <div className="p-4 text-center text-slate-500 text-xs uppercase tracking-widest bg-slate-800/30">
                            End of Logs
                        </div>
                    )}

                    {logs.length === 0 && !loading && (
                        <div className="p-8 text-center text-slate-500">
                            No logs found matching criteria.
                        </div>
                    )}
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
