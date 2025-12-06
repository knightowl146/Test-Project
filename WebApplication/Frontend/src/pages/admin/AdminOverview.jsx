import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Activity, ShieldAlert, Server, Shield, Globe } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const AdminOverview = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        try {
            const { data } = await api.get('/admin/health');
            if (data.success) {
                setHealth(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch admin health", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="text-slate-400">Loading System Health...</div>;
    if (!health) return <div className="text-red-400">Failed to load system health.</div>;

    const { system, metrics, topAttackers } = health;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">System Status</p>
                        <h3 className={`text-2xl font-bold mt-1 ${system.database === 'UP' ? 'text-emerald-400' : 'text-red-500'}`}>
                            {system.database === 'UP' ? 'Operational' : 'Degraded'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">DB: {system.database} | API: {system.api}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${system.database === 'UP' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-500'}`}>
                        <Server size={24} />
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Active Incidents</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{metrics.activeIncidents}</h3>
                        <p className="text-xs text-slate-500 mt-1">{metrics.criticalIncidents} Critical</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-400">
                        <ShieldAlert size={24} />
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Blocked IPs</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{metrics.blockedIPs}</h3>
                        <p className="text-xs text-slate-500 mt-1">Active Blocks</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 text-orange-400">
                        <Shield size={24} />
                    </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700/50 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase">Traffic (1h)</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{metrics.logsLastHour}</h3>
                        <p className="text-xs text-slate-500 mt-1">Requests/hr</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                        <Activity size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Attackers */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Globe size={18} className="text-blue-400" /> Top Threat Sources (24h)
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                                    <th className="pb-3 pl-2">Rank</th>
                                    <th className="pb-3">Source IP</th>
                                    <th className="pb-3">Country</th>
                                    <th className="pb-3 text-right">Attacks</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {topAttackers.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-slate-500">No data available</td></tr>
                                ) : (
                                    topAttackers.map((attacker, idx) => (
                                        <tr key={idx} className="group hover:bg-slate-700/30 transition-colors">
                                            <td className="py-3 pl-2 font-mono text-slate-500">#{idx + 1}</td>
                                            <td className="py-3 font-mono text-white group-hover:text-blue-400">{attacker._id}</td>
                                            <td className="py-3 text-slate-300">{attacker.country || 'Unknown'}</td>
                                            <td className="py-3 text-right font-bold text-red-400">{attacker.count}</td>
                                            <td className="py-3 text-right">
                                                <button className="text-xs bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-300 px-2 py-1 rounded border border-slate-600 transition-colors">
                                                    Block
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions / System Controls */}
                <div className="bg-slate-800 rounded-xl border border-slate-700/50 p-6">
                    <h3 className="text-lg font-bold text-white mb-4">System Actions</h3>
                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-all group">
                            <span className="text-slate-200">System Maintenance Mode</span>
                            <div className="w-10 h-5 bg-slate-600 rounded-full relative">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-slate-400 rounded-full"></div>
                            </div>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-all">
                            <span className="text-slate-200">Flush Redis Cache</span>
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Clear</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600 transition-all">
                            <span className="text-slate-200">Force Rotate Logs</span>
                            <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">Execute</span>
                        </button>
                    </div>

                    <div className="mt-8 p-4 bg-blue-900/20 border border-blue-900/50 rounded-lg">
                        <p className="text-xs text-blue-300 mb-2 font-bold uppercase">System Notification</p>
                        <p className="text-sm text-blue-200">SOC System running in Active Defense Mode. Blocking logic enabled.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
