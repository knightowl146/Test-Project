import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Save, User, ShieldAlert } from 'lucide-react';
// Socket not currently used in this component, but imported for future use
// import { useSocket } from '../context/SocketContext';

const IncidentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState(null);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [loading, setLoading] = useState(false);

    // Use local user state (would ideally be from context, but using localStorage for quick sync consistent with layouts)
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            // We can check localStorage or call /auth/me. 
            // Since layout handles redirect, we assume token is valid.
            try {
                const res = await api.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.user);
                }
            } catch (e) {
                // Fallback if needed
                const local = JSON.parse(localStorage.getItem('user'));
                if (local) setUser(local);
            }
        }
        fetchUser();
    }, []);

    const currentUser = user || { username: '...' };

    const fetchIncident = async () => {
        try {
            const res = await api.get(`/incidents/${id}`);
            if (res.data.success) {
                const data = res.data.data;
                setIncident(data);
                setNotes(data.analystNotes || '');
                setStatus(data.status);
                setAssignedTo(data.assignedTo || '');
            }
        } catch (error) {
            console.error("Failed to fetch incident", error);
        }
    };

    useEffect(() => {
        fetchIncident();
    }, [id]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Only update details like notes and status here. Assignment handled separately.
            const payload = {
                status,
                analystNotes: notes
            };
            const res = await api.patch(`/incidents/${id}`, payload);
            if (res.data.success) {
                fetchIncident();
                alert('Incident updated successfully');
            }
        } catch (error) {
            console.error("Update failed", error);
            alert('Failed to update incident: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleAssignToMe = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/incidents/${id}/assign`);
            if (res.data.success) {
                fetchIncident();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to assign incident");
        } finally {
            setLoading(false);
        }
    };

    const handleUnassign = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/incidents/${id}/unassign`);
            if (res.data.success) {
                fetchIncident();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to unassign incident");
        } finally {
            setLoading(false);
        }
    };

    if (!incident) return <div className="p-8 text-white">Loading...</div>;

    return (
        <div className="p-8 h-full flex flex-col">
            <button onClick={() => navigate('/dashboard/incidents')} className="flex items-center text-slate-400 hover:text-white mb-6 w-fit">
                <ArrowLeft size={18} className="mr-2" /> Back to Incidents
            </button>

            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-white tracking-tight">{incident.incidentId}</h1>
                        <span className={`px-3 py-1 rounded text-sm font-bold border ${getHeaderSeverityClass(incident.severity)}`}>
                            {incident.severity}
                        </span>
                        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-sm font-medium border border-slate-700">
                            {incident.status.replace('_', ' ')}
                        </span>
                    </div>
                    <p className="text-xl text-slate-300 mt-2">{incident.type}</p>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50">
                        <Save size={18} />
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Left Column: Details & Logs */}
                <div className="col-span-2 space-y-6 overflow-auto pr-2">
                    {/* Attack Source Card */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4 text-slate-400 uppercase text-xs font-bold tracking-wider">
                            <ShieldAlert size={16} /> Attack Context
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-slate-500 text-xs uppercase font-bold">Attacker IP</label>
                                <p className="text-white font-mono text-lg">{incident.sourceIp}</p>
                            </div>
                            <div>
                                <label className="text-slate-500 text-xs uppercase font-bold">First Seen</label>
                                <p className="text-slate-300">{new Date(incident.firstSeenAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-slate-500 text-xs uppercase font-bold">Trigger Rule</label>
                                <p className="text-slate-300 font-mono">{incident.triggerRule}</p>
                            </div>
                            <div>
                                <label className="text-slate-500 text-xs uppercase font-bold">Total Events</label>
                                <p className="text-slate-300">{incident.occurrenceCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Related Logs */}
                    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
                            <h3 className="font-bold text-white">Related Logs</h3>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 text-slate-400">
                                <tr>
                                    <th className="px-4 py-3">Time</th>
                                    <th className="px-4 py-3">Event</th>
                                    <th className="px-4 py-3">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {incident.relatedLogs && incident.relatedLogs.map(log => (
                                    <tr key={log._id} className="hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                        <td className="px-4 py-3 text-white">{log.eventType}</td>
                                        <td className="px-4 py-3 text-slate-400 font-mono text-xs truncate max-w-xs">{JSON.stringify(log.details)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Triage */}
                <div className="space-y-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                        <h3 className="font-bold text-white mb-4">Triage Actions</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 text-white rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="OPEN">Open</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="RESOLVED">Resolved (Fixed)</option>
                                    <option value="CLOSED_FALSE_POSITIVE">Closed (False Positive)</option>
                                    <option value="CLOSED_TRUE_POSITIVE">Closed (True Positive)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Assigned Analyst</label>
                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-2">
                                        <div className={`flex-1 flex items-center bg-slate-900 border ${assignedTo ? 'border-blue-500/50' : 'border-slate-600'} text-white rounded p-2`}>
                                            <User size={16} className={`mr-2 ${assignedTo ? 'text-blue-400' : 'text-slate-500'}`} />
                                            <span className={assignedTo ? 'text-white' : 'text-slate-500'}>
                                                {assignedTo || "Unassigned"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Assignment Actions */}
                                    <div className="flex gap-2">
                                        {!assignedTo && (
                                            <button
                                                onClick={handleAssignToMe}
                                                disabled={loading}
                                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm py-2 rounded transition-colors disabled:opacity-50"
                                            >
                                                Assign to Me
                                            </button>
                                        )}

                                        {assignedTo === currentUser.username && (
                                            <button
                                                onClick={handleUnassign}
                                                disabled={loading}
                                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm py-2 rounded transition-colors disabled:opacity-50"
                                            >
                                                Unassign
                                            </button>
                                        )}

                                        {assignedTo && assignedTo !== currentUser.username && (
                                            <div className="flex-1 bg-slate-800 border border-slate-700 text-slate-500 text-sm py-2 rounded text-center cursor-not-allowed">
                                                Locked by {assignedTo}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex-1 flex flex-col">
                        <h3 className="font-bold text-white mb-4">Investigation Notes</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full flex-1 bg-slate-900 border border-slate-600 text-white rounded p-3 focus:ring-2 focus:ring-blue-500 outline-none min-h-[200px]"
                            placeholder="Enter investigation details, analysis, and containment steps..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const getHeaderSeverityClass = (severity) => {
    switch (severity) {
        case 'CRITICAL': return 'bg-red-900 text-red-200 border-red-800';
        case 'HIGH': return 'bg-orange-900 text-orange-200 border-orange-800';
        case 'MEDIUM': return 'bg-yellow-900 text-yellow-200 border-yellow-800';
        default: return 'bg-blue-900 text-blue-200 border-blue-800';
    }
}

export default IncidentDetail;
