import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Eye, Loader2, FileText, User, Briefcase, ExternalLink, ShieldAlert } from 'lucide-react';
import api from '../../../services/api';

const ApplicationsView = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    const fetchPendingApps = async () => {
        try {
            // Fetching applications with status=PENDING (STRICT mode quarantine)
            const { data } = await api.get('/admin/applications?status=PENDING');
            setApplications(data.data || []);
        } catch (err) {
            console.error('Failed to fetch pending applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingApps();
    }, []);

    const handleReview = async (id, status) => {
        const remarks = window.prompt(`Reason for ${status.toLowerCase()}? (Optional)`);
        setActionId(id);
        try {
            const res = await api.put(`/admin/applications/${id}/review`, { status, remarks });
            if (res.data.success) {
                setApplications(prev => prev.filter(app => app._id !== id));
            }
        } catch (err) {
            alert('Review submission failed');
        } finally {
            setActionId(null);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div className="space-y-1 text-left">
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Vetting <span className="text-blue-500">Quarantine</span>.</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Manual verification for STRICT protocol resumes.</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <ShieldAlert className="text-amber-500" size={18} />
                    <span className="text-amber-500 text-[10px] font-black uppercase tracking-widest">{applications.length} PENDING REVIEW</span>
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-600">
                        <CheckCircle size={32} />
                    </div>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Operational Area Clear</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {applications.map((app, idx) => (
                            <motion.div
                                key={app._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] p-8 space-y-8 group hover:border-blue-500/30 transition-all shadow-xl"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-xl">
                                            {app.candidateId?.name?.charAt(0)}
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <h4 className="text-white font-black tracking-tight">{app.candidateId?.name}</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                    <Briefcase size={12} /> {app.jobId?.title}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest">
                                        Pending Vetting
                                    </div>
                                </div>

                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-gray-400">
                                        <FileText size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Candidate Resume.pdf</span>
                                    </div>
                                    <a 
                                        href={app.resume} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                                    >
                                        <Eye size={14} /> Inspect
                                    </a>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => handleReview(app._id, 'APPROVED')}
                                        disabled={actionId === app._id}
                                        className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {actionId === app._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Approve & Transmit
                                    </button>
                                    <button
                                        onClick={() => handleReview(app._id, 'REJECTED')}
                                        disabled={actionId === app._id}
                                        className="flex-1 py-4 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {actionId === app._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                        Reject Access
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default ApplicationsView;
