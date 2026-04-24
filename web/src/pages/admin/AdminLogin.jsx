import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { user, fetchUser } = useContext(AuthContext);
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();

    // Redirect if already logged in as admin
    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            navigate('/admin');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setLocalError('');
        try {
            // Using the standardized login flow which handles cookie placement
            const res = await api.post('/auth/admin/login', { email, password });
            if (res.data.success) {
                // IMPORTANT: Synchronize the AuthContext state with the new cookie
                // before attempting navigation. 
                await fetchUser();
                navigate('/admin');
            }
        } catch (err) {
            console.error('Admin Login Failed:', err);
            setLocalError(err.response?.data?.message || 'Unauthorized Access');
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
            
            {/* Background Aesthetics */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-10 space-y-4">
                    <div className="inline-flex p-4 rounded-3xl bg-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.3)] mb-4">
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Admin <span className="text-blue-500">Matrix</span>.</h1>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Authorized Personnel Only</p>
                </div>

                {/* Login Form */}
                <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {localError && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
                                {localError}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Terminal Identify (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@matrix.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Secure Passcode</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            {submitting ? 'Authenticating...' : 'Enter Matrix'}
                        </button>
                    </form>
                </div>

                {/* Back Link */}
                <Link to="/" className="flex items-center justify-center gap-2 mt-8 text-gray-600 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Website
                </Link>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
