import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Shield, Plus, Lock, Unlock, Search, Trash2 } from 'lucide-react';

const Blocklist = () => {
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        ip: '',
        reason: '',
        expiresAt: ''
    });

    const fetchBlocklist = async () => {
        try {
            const { data } = await api.get('/admin/blocklist');
            if (data.success) {
                setBlocks(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch blocklist", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlocklist();
    }, []);

    const handleAddBlock = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/admin/blocklist', formData);
            if (data.success) {
                fetchBlocklist();
                setShowModal(false);
                setFormData({ ip: '', reason: '', expiresAt: '' });
                alert('IP blocked successfully');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to block IP");
        }
    };

    const handleUnblock = async (id) => {
        if (!window.confirm("Are you sure you want to unblock this IP?")) return;
        try {
            await api.delete(`/admin/blocklist/${id}`);
            fetchBlocklist();
        } catch (error) {
            alert("Failed to unblock IP");
        }
    };

    const filteredBlocks = blocks.filter(block =>
        block.ip.includes(searchTerm) || block.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-white p-8">Loading Blocklist...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Lock className="text-red-500" /> Blocklist Manager
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Block IP
                </button>
            </div>

            {/* Search */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search IP or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">IP Address</th>
                            <th className="p-4">Reason</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Blocked At</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredBlocks.map(block => (
                            <tr key={block._id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="p-4 font-mono text-white">{block.ip}</td>
                                <td className="p-4 text-slate-300">{block.reason}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${block.source === 'MANUAL' ? 'bg-blue-900/30 text-blue-400 border border-blue-900' : 'bg-orange-900/30 text-orange-400 border border-orange-900'}`}>
                                        {block.source}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${block.isActive ? 'bg-red-900/30 text-red-500' : 'bg-slate-700 text-slate-400'}`}>
                                        {block.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="p-4 text-slate-400 text-xs">{new Date(block.blockedAt).toLocaleString()}</td>
                                <td className="p-4 text-right">
                                    {block.isActive && (
                                        <button onClick={() => handleUnblock(block._id)} className="bg-slate-700 hover:bg-emerald-600 text-white p-2 rounded transition-colors" title="Unblock">
                                            <Unlock size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredBlocks.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">No blocked IPs found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Manual IP Block</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleAddBlock} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">IP Address</label>
                                <input required type="text" value={formData.ip} onChange={e => setFormData({ ...formData, ip: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500 font-mono" placeholder="192.168.1.1" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Reason</label>
                                <input required type="text" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500" placeholder="Suspicious activity" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors">Block IP</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blocklist;
