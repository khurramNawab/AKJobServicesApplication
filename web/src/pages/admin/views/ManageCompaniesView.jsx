import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2, Plus, Search, Trash2, Eye, Loader2,
    Mail, Phone, Globe, MapPin, CheckCircle, XCircle, X
} from 'lucide-react';
import api from '../../../services/api';

const ManageCompaniesView = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [form, setForm] = useState({
        name: '', email: '', password: '', companyName: '',
        phone: '', companyAddress: '', website: '', gstNumber: '',
        companyLogo: '', companyPhotosInput: '', description: '',
        industry: '', location: '', foundedDate: '', companyType: '', designation: ''
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchCompanies = async () => {
        try {
            const { data } = await api.get(`/admin/companies?search=${search}`);
            setCompanies(data.data || []);
        } catch (err) {
            console.error('Failed to fetch companies');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(fetchCompanies, 400);
        return () => clearTimeout(t);
    }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const photosArray = form.companyPhotosInput
                ? form.companyPhotosInput.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const payload = {
                ...form,
                companyPhotos: photosArray
            };
            const { data } = await api.post('/admin/companies', payload);
            if (data.success) {
                showToast(`Recruiter account created for ${form.companyName || form.name}!`);
                setShowModal(false);
                setForm({
                    name: '', email: '', password: '', companyName: '',
                    phone: '', companyAddress: '', website: '', gstNumber: '',
                    companyLogo: '', companyPhotosInput: '', description: '',
                    industry: '', location: '', foundedDate: '', companyType: '', designation: ''
                });
                fetchCompanies();
            }
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to create recruiter', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">

            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-2xl ${
                        toast.type === 'success' ? 'bg-emerald-600 text-text-primary' : 'bg-rose-600 text-text-primary'
                    }`}
                >
                    {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {toast.msg}
                </motion.div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Manage <span className="text-blue-500">Companies</span>.</h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">View recruiters and manually create company accounts.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="SEARCH COMPANY..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-bg-surface border border-border-subtle rounded-xl py-3 pl-12 pr-4 text-[11px] font-black tracking-widest text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                        />
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-[10px] font-black text-text-primary uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={14} /> Add Company
                    </button>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-border-subtle bg-white/[0.02] dark:bg-white/[0.02]">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Company / Recruiter</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-600 text-[11px] font-black uppercase tracking-widest">
                                        No companies found
                                    </td>
                                </tr>
                            ) : companies.map((c, i) => (
                                <motion.tr
                                    key={c._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="border-b border-border-subtle hover:bg-white/[0.02] dark:bg-white/[0.02] transition-all group"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                                {c.companyLogo ? (
                                                    <img src={c.companyLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <Building2 size={20} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-text-primary font-black text-sm tracking-tight">{c.companyName || 'Unnamed Company'}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{c.userId?.name || 'Orphaned Recruiter'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <p className="text-gray-400 text-[11px] font-bold flex items-center gap-2">
                                                <Mail size={10} /> {c.userId?.email || 'N/A'}
                                            </p>
                                            {c.website && (
                                                <p className="text-gray-600 text-[10px] font-bold flex items-center gap-2">
                                                    <Globe size={10} /> {c.website}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            c.userId?.planType === 'ELITE' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            c.userId?.planType === 'PRO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                            'bg-white/5 border-border-subtle text-gray-500'
                                        }`}>
                                            {c.userId?.planType || 'FREE'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            c.userId?.isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                        }`}>
                                            {c.userId?.isVerified ? 'Verified' : 'Pending'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Company Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0F172A] border border-border-subtle rounded-[2.5rem] p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Add Company</h3>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manually create a recruiter account</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-text-primary transition-all">
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {[
                                    { key: 'name', label: 'Full Name *', type: 'text', required: true },
                                    { key: 'email', label: 'Email *', type: 'email', required: true },
                                    { key: 'password', label: 'Password *', type: 'password', required: true },
                                    { key: 'companyName', label: 'Company Name *', type: 'text', required: true },
                                    { key: 'phone', label: 'Phone Number', type: 'tel', required: false },
                                    { key: 'website', label: 'Company Website', type: 'url', required: false },
                                    { key: 'gstNumber', label: 'GST Number', type: 'text', required: false },
                                    { key: 'companyAddress', label: 'Company Address', type: 'text', required: false },
                                    { key: 'companyLogo', label: 'Company Logo URL', type: 'url', required: false },
                                    { key: 'companyPhotosInput', label: 'Workspace Photos (URLs, comma-separated)', type: 'text', required: false },
                                    { key: 'industry', label: 'Industry Sector', type: 'text', required: false },
                                    { key: 'location', label: 'Location (City, Country)', type: 'text', required: false },
                                    { key: 'foundedDate', label: 'Founded Year', type: 'text', required: false },
                                    { key: 'companyType', label: 'Company Type (MNC / Startup)', type: 'text', required: false },
                                    { key: 'designation', label: 'Designation', type: 'text', required: false },
                                ].map(({ key, label, type, required }) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
                                        <input
                                            type={type}
                                            required={required}
                                            value={form[key]}
                                            onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                                            className="w-full bg-white/5 border border-border-subtle rounded-2xl px-5 py-3.5 text-[12px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                ))}

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Company Description</label>
                                    <textarea
                                        rows={4}
                                        value={form.description}
                                        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                        className="w-full bg-white/5 border border-border-subtle rounded-2xl px-5 py-3.5 text-[12px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div className="md:col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-text-primary font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        {submitting ? 'Creating...' : 'Create Recruiter Account'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ManageCompaniesView;
