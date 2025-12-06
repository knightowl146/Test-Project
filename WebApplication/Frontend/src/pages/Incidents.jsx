import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const Incidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const { socket, isConnected } = useSocket();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'mine'

    const fetchIncidents = async () => {
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (activeTab === 'mine') params.assignedTo = 'me';

            const res = await api.get('/incidents', { params });
            if (res.data.success) {
                setIncidents(res.data.data.incidents);
            }
        } catch (error) {
            console.error("Failed to fetch incidents", error);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [statusFilter, activeTab]);

    useEffect(() => {
        if (!socket) return;
        socket.on("NEW_INCIDENT", () => fetchIncidents());
        socket.on("INCIDENT_UPDATED", () => fetchIncidents());

        return () => {
            socket.off("NEW_INCIDENT");
            socket.off("INCIDENT_UPDATED");
        }
    }, [socket, activeTab, statusFilter]);

    const getSeverityBadge = (severity) => {
        const colors = {
            CRITICAL: 'bg-red-900/50 text-red-200 border-red-800',
            HIGH: 'bg-orange-900/50 text-orange-200 border-orange-800',
            MEDIUM: 'bg-yellow-900/50 text-yellow-200 border-yellow-800',
            LOW: 'bg-blue-900/50 text-blue-200 border-blue-800'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold border ${colors[severity] || 'bg-slate-800 text-slate-400'}`}>
                {severity}
            </span>
        );
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'OPEN': return <AlertCircle size={18} className="text-red-500" />;
            case 'IN_PROGRESS': return <Clock size={18} className="text-yellow-500" />;
            case 'RESOLVED': return <CheckCircle size={18} className="text-green-500" />;
            default: return <Clock size={18} className="text-slate-500" />;
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Security Incidents</h2>
                    <p className="text-slate-400 mt-1">Manage and triage detected threats</p>
                </div>
                <div className="flex gap-4">
                    <select
                        className="bg-slate-800 text-white border border-slate-700 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-700 mb-6">
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Incidents
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'mine' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                    onClick={() => setActiveTab('mine')}
                >
                    Assigned to Me
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {incidents.length === 0 ? (
                    <div className="text-slate-500 text-center py-20 bg-slate-800/20 rounded-xl border border-dashed border-slate-700">
                        No incidents found.
                    </div>
                ) : (
                    incidents.map((incident) => (
                        <div
                            key={incident.incidentId}
                            onClick={() => navigate(`/dashboard/incidents/${incident.incidentId}`)}
                            className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 hover:bg-slate-800 cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                        >
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 bg-slate-900 rounded-lg border border-slate-700">{getStatusIcon(incident.status)}</div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors font-mono tracking-tight">
                                            {incident.incidentId}
                                        </h3>
                                        {getSeverityBadge(incident.severity)}
                                    </div>
                                    <p className="text-slate-300 font-medium mt-1">{incident.type}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                                        <p>Target: <span className="text-slate-400">{incident.sourceIp}</span></p>
                                        {incident.assignedTo && (
                                            <p className="flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                                Assigned to: <span className="text-blue-400 font-semibold">{incident.assignedTo}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-sm text-slate-400 flex items-center gap-1 justify-end">
                                    <Clock size={14} /> {new Date(incident.lastSeenAt).toLocaleString()}
                                </p>
                                <div className="mt-3">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${incident.status === 'OPEN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : incident.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                        {incident.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Incidents;
