import React, { useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Star, Rocket, Loader2, CheckCircle2, XCircle, X, LogIn } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Toast = ({ toast, onClose }) => {
    if (!toast) return null;
    const isSuccess = toast.type === 'success';
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm w-full mx-4 border ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
            style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
            {isSuccess ? <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">{toast.title}</p>
                {toast.message && <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button onClick={onClose} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

const PricingPage = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, title, message = '') => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 5000);
    }, []);

    const handleSubscription = async (planType) => {
        if (!user) { navigate('/login'); return; }
        if (planType === 'FREE') return;

        setLoadingPlan(planType);
        try {
            const { data } = await api.post('/payments/create-order', { planType, duration: 'monthly' });
            if (!data.success) throw new Error(data.message);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: 'INR',
                name: 'AK Job Services',
                description: `${planType} Subscription Plan`,
                order_id: data.orderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planType,
                            duration: 'monthly'
                        });
                        if (verifyRes.data.success) {
                            showToast('success', 'Subscription Activated!', `Your ${planType} plan is now active. Enjoy all premium features.`);
                            await fetchUser();
                        } else {
                            showToast('error', 'Verification Failed', verifyRes.data.message || 'Contact support.');
                        }
                    } catch (err) {
                        showToast('error', 'Verification Error', err.response?.data?.message || 'Contact support with your payment ID.');
                    }
                },
                modal: { ondismiss: () => setLoadingPlan(null) },
                prefill: { email: user.email, name: user.name },
                theme: { color: '#4F8EF7' }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                showToast('error', 'Payment Failed', response.error?.description || 'Please try again.');
                setLoadingPlan(null);
            });
            rzp.open();
        } catch (err) {
            showToast('error', 'Could Not Initiate Payment', err.response?.data?.message || err.message || 'Something went wrong.');
        } finally {
            setLoadingPlan(null);
        }
    };

    const plans = [
        {
            type: 'FREE',
            price: 'Rs.0',
            features: ['Post up to 2 Jobs', 'Candidates Apply', 'Resume Locks (upgrade to unlock)'],
            icon: <Rocket className="w-6 h-6 text-text-muted" />,
            accentColor: 'border-[var(--color-border-subtle)]',
            badge: null,
            btnText: 'Free Plan'
        },
        {
            type: 'PRO',
            price: 'Rs.999',
            period: '/ Month',
            features: ['Unlimited Job Posts', 'Unlock Candidate Resumes', 'Priority Listing Support', 'Live Chat Support'],
            icon: <Shield className="w-6 h-6 text-[#4F8EF7]" />,
            accentColor: 'border-[#4F8EF7]/30 shadow-lg shadow-[#4F8EF7]/10',
            badge: 'Popular',
            badgeColor: 'bg-[#4F8EF7]/15 text-[#4F8EF7] border-[#4F8EF7]/25',
            btnText: 'Go Pro'
        },
        {
            type: 'ELITE',
            price: 'Rs.2499',
            period: '/ Month',
            features: ['Everything in Pro', 'Featured Job Placements', 'Dedicated Key Account Manager', 'Advanced Analytics Dashboard'],
            icon: <Star className="w-6 h-6 text-amber-400" />,
            accentColor: 'border-amber-500/30 shadow-2xl shadow-amber-500/10',
            badge: 'Best Value',
            badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
            btnText: 'Go Elite'
        }
    ];

    return (
        <div className="min-h-screen bg-bg-main py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4F8EF7]/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

            <AnimatePresence>
                {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8EF7] mb-4">
                        <Shield className="w-3 h-3" /> Recruiter Plans
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter uppercase leading-none">
                        Scale Your <span className="gradient-text">Service</span>.
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-text-muted text-lg font-medium tracking-wide">
                        Select the tier that fits your growth trajectory.
                    </motion.p>
                    {!user && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-sm text-text-muted mt-2">
                            <LogIn className="w-4 h-4 text-[#4F8EF7]" />
                            <span>You need to <button onClick={() => navigate('/login')} className="text-[#4F8EF7] font-semibold hover:underline">sign in</button> to subscribe</span>
                        </motion.div>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => {
                        const active = user?.planType === plan.type;
                        const busy = loadingPlan === plan.type;
                        return (
                            <motion.div key={plan.type} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`glass-card p-10 rounded-[2.5rem] border flex flex-col justify-between relative overflow-hidden ${plan.accentColor} ${active ? 'ring-2 ring-emerald-500/30' : ''}`}>
                                {active && <div className="absolute inset-0 bg-emerald-500/[0.03] rounded-[2.5rem] pointer-events-none" />}

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 rounded-2xl bg-[rgba(0,0,0,0.04)] border border-[var(--color-border-subtle)]">{plan.icon}</div>
                                            <h3 className="text-xl font-black text-text-primary tracking-widest uppercase">{plan.type}</h3>
                                        </div>
                                        {plan.badge && !active && (
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${plan.badgeColor}`}>{plan.badge}</span>
                                        )}
                                        {active && (
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Active
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-text-primary">{plan.price}</span>
                                        {plan.period && <span className="text-text-muted text-sm font-bold uppercase tracking-widest">{plan.period}</span>}
                                    </div>

                                    <div className="space-y-4 pt-2 border-t border-[var(--color-border-subtle)]">
                                        {plan.features.map(f => (
                                            <div key={f} className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Check className="w-3 h-3 text-emerald-400" />
                                                </div>
                                                <span className="text-sm font-medium text-text-secondary leading-snug">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSubscription(plan.type)}
                                    disabled={busy || active || plan.type === 'FREE'}
                                    className={`mt-10 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                                        active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default'
                                        : plan.type === 'FREE' ? 'bg-[var(--color-bg-elevated)] text-text-muted border border-[var(--color-border-subtle)] cursor-default'
                                        : busy ? 'bg-[#4F8EF7]/20 text-[#4F8EF7] border border-[#4F8EF7]/30'
                                        : plan.type === 'ELITE' ? 'bg-amber-500 text-white hover:bg-amber-400 shadow-xl hover:shadow-amber-500/30'
                                        : 'bg-[#4F8EF7] text-white hover:bg-[#6BA3FF] shadow-xl hover:shadow-[#4F8EF7]/30'
                                    }`}
                                >
                                    {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {active ? <><CheckCircle2 className="w-4 h-4" /> Current Plan</> : plan.btnText}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                <p className="text-center mt-12 text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">
                    Secured by Razorpay · 256-bit AES Encryption · Cancel Anytime
                </p>
            </div>
        </div>
    );
};

export default PricingPage;
