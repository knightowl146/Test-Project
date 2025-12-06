import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, Label } from 'recharts';
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Activity, Shield, AlertTriangle, Crosshair, ArrowRight, MoreHorizontal, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Custom Mock Sparklines (SVG paths)
const Sparkline = ({ color }) => (
    <svg className={`w-full h-8 ${color}`} viewBox="0 0 100 20" preserveAspectRatio="none">
        <path d="M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 5 T 100 12" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const StatCard = ({ title, value, subtext, icon: Icon, color, badge, sparkColor }) => (
    <div className="bg-[#1E293B] p-5 rounded-xl border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-all">
        <div className="flex justify-between items-start mb-2">
            <div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color} bg-opacity-20`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
        {badge && (
            <span className={`absolute top-5 right-12 px-2 py-0.5 text-[10px] font-bold uppercase rounded ${badge.style}`}>
                {badge.text}
            </span>
        )}
        <div className="mt-4 opacity-50 group-hover:opacity-100 transition-opacity">
            <Sparkline color={sparkColor} />
            {subtext && <p className="text-xs text-slate-500 mt-2">{subtext}</p>}
        </div>
    </div>
);

const Overview = () => {
    const [stats, setStats] = useState(null);
    const [recentIncidents, setRecentIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locations, setLocations] = useState([]);

    const { socket } = useSocket();
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, incidentsRes] = await Promise.all([
                api.get('/logs/stats'),
                api.get('/incidents?limit=5')
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.data);
                // Extract map locations from logs if available or use a separate call
                fetchRecentAttacks();
            }
            if (incidentsRes.data.success) {
                setRecentIncidents(incidentsRes.data.data.incidents.slice(0, 3));
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentAttacks = async () => {
        try {
            const res = await api.get('/logs?limit=50&category=SECURITY');
            if (res.data.success && res.data.data.logs) {
                const logsWithGeo = res.data.data.logs.filter(log => log.geo && log.geo.lat && log.geo.lon);
                setLocations(logsWithGeo);
            }
        } catch (err) { console.error(err); }
    }

    useEffect(() => {
        fetchDashboardData();

        if (socket) {
            socket.on("NEW_LOG", (newLog) => {
                // Refresh stats silently
                api.get('/logs/stats').then(res => res.data.success && setStats(res.data.data));

                if (newLog.geo && newLog.geo.lat) {
                    setLocations(prev => [newLog, ...prev].slice(0, 50));
                }
            });
            socket.on("NEW_INCIDENT", () => {
                api.get('/incidents?limit=5').then(res => res.data.success && setRecentIncidents(res.data.data.incidents.slice(0, 3)));
                api.get('/logs/stats').then(res => res.data.success && setStats(res.data.data));
            });
        }
        return () => {
            if (socket) {
                socket.off("NEW_LOG");
                socket.off("NEW_INCIDENT");
            }
        }
    }, [socket]);

    const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']; // Violet, Blue, Emerald, Amber, Red

    if (loading && !stats) return <div className="p-8 text-slate-400 flex justify-center items-center h-full">Loading System Telemetry...</div>;
    if (!stats) return null;

    return (
        <div className="p-8 space-y-6 max-w-[1600px] mx-auto">
            {/* Header / Subheader */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Overview Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-1">Real time security monitoring and threat intelligence</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchDashboardData} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors">
                        <Activity size={18} />
                    </button>
                </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Logs (24h)"
                    value={stats.summary.totalLogs}
                    icon={Activity}
                    color="text-cyan-400"
                    sparkColor="text-cyan-500/50"
                    subtext="Processing rate: Normal"
                />
                <StatCard
                    title="Security Events"
                    value={stats.summary.securityLogs}
                    icon={Shield}
                    color="text-amber-400"
                    sparkColor="text-amber-500/50"
                />
                <StatCard
                    title="Active Incidents"
                    value={stats.incidentSummary?.active || 0}
                    icon={AlertTriangle}
                    color="text-orange-500"
                    sparkColor="text-orange-500/50"
                    badge={{ text: "Active", style: "bg-orange-900/50 text-orange-400 border border-orange-500/30" }}
                />
                <StatCard
                    title="High/Critical"
                    value={stats.incidentSummary?.critical || 0}
                    icon={Crosshair}
                    color="text-red-500"
                    sparkColor="text-red-500/50"
                    badge={{ text: "Critical", style: "bg-red-900/50 text-red-400 border border-red-500/30" }}
                />
            </div>

            {/* Main Grid: Map & Timeline */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Global Threat Map (Span 2 to 3) */}
                <div className="xl:col-span-3 bg-[#1E293B] rounded-xl border border-slate-700/50 overflow-hidden relative min-h-[400px]">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.9)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.9)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
                    <div className="p-6 absolute top-0 left-0 z-10 pointer-events-none">
                        <h3 className="text-white text-lg font-bold flex items-center gap-2">
                            <Activity size={18} className="text-cyan-400" />
                            Global Threat Map
                        </h3>
                    </div>

                    {/* Map Legend */}
                    <div className="absolute bottom-6 left-6 z-10 bg-slate-900/80 backdrop-blur p-3 rounded-lg border border-slate-700 text-xs">
                        <p className="text-slate-400 mb-2 font-semibold">Threat Level:</p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span className="text-slate-300">Low</span></div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> <span className="text-slate-300">Med</span></div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span> <span className="text-slate-300">High</span></div>
                            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> <span className="text-slate-300">Critical</span></div>
                        </div>
                        <div className="mt-3 border-t border-slate-700 pt-2 flex justify-between items-center text-slate-500">
                            <span>Active Threat Locations</span>
                            <span className="text-cyan-400 font-bold">{locations.length}</span>
                        </div>
                    </div>

                    <div className="w-full h-[450px]">
                        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 120, rotate: [-10, 0, 0] }} style={{ width: "100%", height: "100%" }}>
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => (
                                        <Geography key={geo.rsmKey} geography={geo} fill="#0F172A" stroke="#334155" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { fill: "#1E293B", outline: "none" }, pressed: { outline: "none" } }} />
                                    ))
                                }
                            </Geographies>
                            {locations.map((log) => (
                                <Marker key={log._id || log.logId} coordinates={[log.geo.lon, log.geo.lat]}>
                                    <circle r={log.severity === 'CRITICAL' ? 8 : 4} fill={log.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'} fillOpacity={0.6} className="animate-ping" />
                                    <circle r={3} fill="#fff" />
                                </Marker>
                            ))}
                        </ComposableMap>
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Timeline, Incidents, Top IPs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Security Timeline */}
                <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-white font-bold mb-6 flex items-center justify-between">
                        <span>Security Events Timeline (24h)</span>
                        <div className="flex gap-2 text-xs">
                            <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400"></span> Security Events</span>
                            <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Total Logs</span>
                        </div>
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.timeline || []} margin={{ left: 10, right: 10, top: 10, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSec" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="_id" stroke="#475569" tickLine={false} axisLine={false} tick={{ fontSize: 12 }}>
                                    <Label value="Time (Hour)" offset={0} position="insideBottom" fill="#64748b" style={{ fontSize: '11px', fontWeight: 500 }} />
                                </XAxis>
                                <YAxis stroke="#475569" tickLine={false} axisLine={false} tick={{ fontSize: 12 }}>
                                    <Label value="Volume" angle={-90} position="insideLeft" fill="#64748b" style={{ fontSize: '11px', fontWeight: 500 }} />
                                </YAxis>
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} cursor={{ stroke: '#334155' }} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area name="Total Requests" type="monotone" dataKey="count" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                                <Area name="Security Events" type="monotone" dataKey="securityCount" stroke="#f87171" fillOpacity={1} fill="url(#colorSec)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Severity / Attack Vector Mix (Stacked or Tabs) - Let's do Attack Vectors Pie */}
                <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-white font-bold mb-6">Attack Vectors</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.attackVectors}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count" nameKey="_id"
                                >
                                    {stats.attackVectors.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#ccc' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* New Row: Top Targets & Traffic Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Target Endpoints */}
                <div className="lg:col-span-2 bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-white font-bold mb-6">Top Target Endpoints (24h)</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.topEndpoints || []} layout="vertical" margin={{ left: 20, right: 30, bottom: 20 }}>
                                <XAxis type="number" stroke="#475569" tickLine={false} axisLine={false}>
                                    <Label value="Request Count" offset={-10} position="insideBottom" fill="#64748b" style={{ fontSize: '11px', fontWeight: 500 }} />
                                </XAxis>
                                <YAxis dataKey="_id" type="category" stroke="#94a3b8" tickLine={false} axisLine={false} width={150} tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff' }} cursor={{ fill: '#334155', opacity: 0.4 }} />
                                <Bar dataKey="count" name="Hits" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Status Distribution */}
                <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-white font-bold mb-6">Traffic Status</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.statusDist || []}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count" nameKey="_id"
                                >
                                    {(stats.statusDist || []).map((entry, index) => {
                                        // Color logic based on status code
                                        let color = '#94a3b8'; // default gray
                                        const code = entry._id;
                                        if (code >= 200 && code < 300) color = '#10b981'; // Green
                                        if (code >= 400 && code < 500) color = '#f59e0b'; // Amber
                                        if (code === 403) color = '#ef4444'; // Red (Blocked)
                                        if (code >= 500) color = '#ec4899'; // Pink
                                        return <Cell key={`cell-${index}`} fill={color} stroke="rgba(0,0,0,0)" />;
                                    })}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                                <Legend
                                    layout="vertical"
                                    verticalAlign="middle"
                                    align="right"
                                    iconType="circle"
                                    payload={[
                                        { value: 'Success (2xx)', type: 'circle', color: '#10b981' },
                                        { value: 'Client Error (4xx)', type: 'circle', color: '#f59e0b' },
                                        { value: 'Blocked (403)', type: 'circle', color: '#ef4444' },
                                        { value: 'Server Error (5xx)', type: 'circle', color: '#ec4899' }
                                    ]}
                                    wrapperStyle={{ fontSize: '11px', color: '#ccc' }}
                                />
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xl font-bold">
                                    {stats.summary.totalLogs}
                                </text>
                                <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-500 text-[10px] font-medium uppercase tracking-widest">
                                    Total
                                </text>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Incidents & Top IPs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Incidents */}
                <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-white font-bold">Recent Incidents</h3>
                        <button onClick={() => navigate('/dashboard/incidents')} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">View All <ArrowRight size={12} /></button>
                    </div>

                    <div className="space-y-4">
                        {recentIncidents.length === 0 ? <p className="text-slate-500 text-sm">No recent incidents.</p> : recentIncidents.map(inc => (
                            <div key={inc.incidentId} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-10 rounded-full ${inc.severity === 'CRITICAL' ? 'bg-red-500' : inc.severity === 'HIGH' ? 'bg-orange-500' : 'bg-yellow-500'}`}></div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{inc.incidentId}</p>
                                        <p className="text-xs text-slate-400">{inc.type}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${inc.status === 'OPEN' ? 'bg-red-500/10 text-red-500' : 'bg-slate-700 text-slate-400'}`}>{inc.status}</span>
                                    <p className="text-xs text-slate-500 mt-1 font-mono">{inc.sourceIp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Attacking IPs */}
                <div className="bg-[#1E293B] p-6 rounded-xl border border-slate-700/50">
                    <h3 className="text-white font-bold mb-6">Top Attacking IPs</h3>
                    <div className="space-y-4">
                        {stats.topIPs && stats.topIPs.length > 0 ? stats.topIPs.map((ip, idx) => (
                            <div key={idx} className="group">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-300 font-mono flex items-center gap-2">
                                        <span className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">{idx + 1}</span>
                                        {ip._id}
                                    </span>
                                    <span className="text-cyan-400 font-bold">{ip.count}</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${(ip.count / (stats.topIPs[0].count)) * 100}%` }}></div>
                                </div>
                            </div>
                        )) : <p className="text-center text-slate-500 py-4">No data available</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
