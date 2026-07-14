import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Globe, Lock, Shield, CreditCard, Loader2 } from 'lucide-react';
import api from '../../../services/api';

const SettingsView = () => {
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');

    const fetchConfig = async () => {
        try {
            const { data } = await api.get('/admin/platform-config');
            setConfig(data.data);
        } catch (err) {
            console.error('Failed to fetch config');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleToggle = (field) => {
        setConfig(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleSave = async () => {
        setSaving(true);
        setToast('');
        try {
            await api.put('/admin/platform-config', config);
            setToast('✅ Parameter matrix synchronized successfully!');
        } catch (err) {
            setToast('❌ Failed to update global configuration.');
        } finally {
            setSaving(false);
            setTimeout(() => setToast(''), 3000);
        }
    };

    if (loading) return null;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl">
            {toast && (
               <div className="p-4 bg-bg-surface/90 backdrop-blur-md border border-blue-500/30 rounded-2xl text-xs font-black uppercase tracking-widest text-blue-400 text-left">
                  {toast}
               </div>
            )}
            <div className="space-y-1 text-left">
                <h2 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">Platform <span className="text-blue-500">Preferences</span>.</h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Adjust global settings and access overrides.</p>
            </div>

            <div className="grid gap-6">
                
                {/* 🛡️ Monetization Status */}
                <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 flex items-center justify-between group hover:border-blue-500/30 transition-all">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <CreditCard size={28} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-text-primary font-black text-sm uppercase tracking-widest">Paid Subscriptions</h4>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Enforce subscription plans for Recruiters & Candidates.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggle('subscriptionEnabled')}
                        className={`w-16 h-8 rounded-full transition-all relative ${config.subscriptionEnabled ? 'bg-blue-600' : 'bg-slate-600 border border-slate-500'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-xl ${config.subscriptionEnabled ? 'left-9' : 'left-1'}`} />
                    </button>
                </div>

                {/* 🆓 Free Mode (Campaign Override) */}
                <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                    <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Globe size={28} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-text-primary font-black text-sm uppercase tracking-widest">Free Trial Mode</h4>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Temporarily make all plans and features free for everyone.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => handleToggle('freeMode')}
                        className={`w-16 h-8 rounded-full transition-all relative ${config.freeMode ? 'bg-emerald-500' : 'bg-slate-600 border border-slate-500'}`}
                    >
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-xl ${config.freeMode ? 'left-9' : 'left-1'}`} />
                    </button>
                </div>

                {/* 🛂 Messaging Strictness */}
                <div className="bg-bg-surface border border-border-subtle rounded-[2.5rem] p-10 space-y-8 group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                         <div className="flex gap-6 items-center">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                                <Shield size={28} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-text-primary font-black text-sm uppercase tracking-widest">Verification Mode</h4>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Verification rules for new jobs and applicants.</p>
                            </div>
                        </div>
                        <div className="flex bg-white/5 border border-border-subtle rounded-2xl p-1 gap-1">
                            {['STRICT', 'MODERATE', 'OPEN'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setConfig(prev => ({ ...prev, candidateMessagingMode: mode }))}
                                    className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${
                                        config.candidateMessagingMode === mode
                                        ? 'bg-amber-600 text-text-primary shadow-lg shadow-amber-600/20'
                                        : 'text-gray-500 hover:text-text-primary'
                                    }`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                    </div>
                    {config.candidateMessagingMode === 'STRICT' && (
                        <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                             <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                WARNING: In STRICT mode, all job applications are held for manual admin review before they are visible to recruiters.
                             </p>
                        </div>
                    )}
                </div>

            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="fixed bottom-12 right-12 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-text-primary rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(37,99,235,0.4)] transition-all transform active:scale-95 flex items-center gap-4 z-50 group"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                {saving ? 'Syncing...' : 'Update Matrix Settings'}
            </button>
        </div>
    );
};

export default SettingsView;
