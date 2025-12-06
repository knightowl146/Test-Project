import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Search, Shield } from 'lucide-react';

const Rules = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        pattern: '',
        category: 'SQLI',
        severity: 'MEDIUM',
        description: '',
        tags: ''
    });

    const fetchRules = async () => {
        try {
            const { data } = await api.get('/admin/rules');
            if (data.success) {
                setRules(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch rules", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(t => t)
            };
            const { data } = await api.post('/admin/rules', payload);
            if (data.success) {
                fetchRules();
                setShowModal(false);
                setFormData({ name: '', pattern: '', category: 'SQLI', severity: 'MEDIUM', description: '', tags: '' });
                alert('Rule created successfully');
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create rule");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this rule?")) return;
        try {
            await api.delete(`/admin/rules/${id}`);
            fetchRules();
        } catch (error) {
            alert("Failed to delete rule");
        }
    };

    const handleToggle = async (id) => {
        try {
            await api.patch(`/admin/rules/${id}/toggle`);
            // Optimistic update
            setRules(rules.map(r => r._id === id ? { ...r, isActive: !r.isActive } : r));
        } catch (error) {
            fetchRules(); // Revert on failure
        }
    };

    const filteredRules = rules.filter(rule =>
        rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-white p-8">Loading Rules...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="text-red-500" /> Detection Rules
                </h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} /> Add Rule
                </button>
            </div>

            {/* Search & Filters */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                    />
                </div>
            </div>

            {/* Rules Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700/50 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-bold">
                        <tr>
                            <th className="p-4">Status</th>
                            <th className="p-4">Rule Name</th>
                            <th className="p-4">Pattern</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Severity</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {filteredRules.map(rule => (
                            <tr key={rule._id} className="hover:bg-slate-700/20 transition-colors">
                                <td className="p-4">
                                    <button onClick={() => handleToggle(rule._id)} className={`${rule.isActive ? 'text-emerald-400' : 'text-slate-500'} hover:opacity-80`}>
                                        {rule.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                    </button>
                                </td>
                                <td className="p-4 font-medium text-white">{rule.name}</td>
                                <td className="p-4 font-mono text-xs text-slate-400 max-w-[200px] truncate" title={rule.pattern}>{rule.pattern}</td>
                                <td className="p-4">
                                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">{rule.category}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${rule.severity === 'CRITICAL' ? 'bg-red-900/30 text-red-400 border-red-900' :
                                            rule.severity === 'HIGH' ? 'bg-orange-900/30 text-orange-400 border-orange-900' :
                                                'bg-blue-900/30 text-blue-400 border-blue-900'
                                        }`}>
                                        {rule.severity}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(rule._id)} className="text-slate-400 hover:text-red-400 p-2">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredRules.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-slate-500">No rules found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Add Detection Rule</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleCreate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Rule Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500" placeholder="e.g. Detect SQL Union" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Pattern (Regex)</label>
                                <input required type="text" value={formData.pattern} onChange={e => setFormData({ ...formData, pattern: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-mono text-sm outline-none focus:border-red-500" placeholder="e.g. ' UNION SELECT" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500">
                                        {['SQLI', 'XSS', 'RCE', 'BRUTE_FORCE', 'MALWARE', 'DATA_EXFIL', 'DDOS', 'OTHER'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Severity</label>
                                    <select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500">
                                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500 h-20" placeholder="Describe what this rule detects..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Tags (comma separated)</label>
                                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-red-500" placeholder="e.g. owasp, web" />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded transition-colors">Create Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rules;
