import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Shield, Star, Rocket, Loader2, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CandidatePricingPage = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    useEffect(() => {
        const checkAndFetch = async () => {
            try {
                const { data } = await api.get('/platform-config');
                if (!data?.data?.candidateSubscriptionEnabled) {
                    navigate('/dashboard', { replace: true });
                    return;
                }
                setConfig(data.data);
            } catch (err) {
                navigate('/dashboard', { replace: true });
            } finally {
                setLoading(false);
            }
        };
        checkAndFetch();
    }, [navigate]);


    const handleSubscription = async (planType, duration = 'monthly') => {
        if (!user) { navigate('/login'); return; }
        setPaying(true);
        try {
            const { data } = await api.post('/payments/create-order', { planType, duration, userRole: 'CANDIDATE' });
            if (!data.success) throw new Error(data.message);

            // ✅ FIXED: Backend returns { orderId, amount, keyId } not { order: { id, amount } }
            const options = {
                key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,        // amount in paise directly from backend
                currency: 'INR',
                name: 'AK Job Services',
                description: `Candidate ${planType} Plan`,
                order_id: data.orderId,     // orderId from backend
                handler: async (response) => {
                    try {
                        const res = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planType,
                            duration,
                        });
                        if (res.data.success) {
                            showToast('success', '🎉 Subscription Activated! Welcome to ' + planType + ' plan.');
                            await fetchUser();
                            setTimeout(() => navigate('/dashboard'), 2000);
                        }
                    } catch {
                        showToast('error', 'Payment verification failed. Please contact support.');
                    }
                },
                prefill: { email: user.email },
                theme: { color: '#4F8EF7' },
                modal: {
                    ondismiss: () => setPaying(false)
                }
            };

            // Load Razorpay script if not already loaded
            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                showToast('error', resp.error?.description || 'Payment failed. Please try again.');
            });
            rzp.open();
        } catch (err) {
            showToast('error', err.response?.data?.message || err.message || 'Something went wrong. Try again.');
        } finally {
            setPaying(false);
        }
    };

    if (loading || !config) return null;

    const plans = [
        {
            type: 'FREE',
            price: '₹0',
            features: [
                `Apply to ${config.candidateFreeApplicationLimit || 10} jobs`,
                'Basic profile',
                'Standard visibility',
            ],
            icon: <Rocket className="w-6 h-6 text-slate-500" />,
            cardClass: 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700/60',
            iconBg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
            accent: 'text-slate-600 dark:text-slate-400',
            btnText: 'Current Free Plan',
            isFree: true,
        },
        {
            type: 'BASIC',
            price: `₹${config.candidateBasicMonthly || 299}`,
            period: '/ Month',
            features: [
                'Unlimited job applications',
                'Profile boost — recruiters see you first',
                'Application status tracking',
                'No ads',
            ],
            icon: <Shield className="w-6 h-6 text-blue-500" />,
            cardClass: 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700/60 shadow-xl shadow-blue-500/10',
            iconBg: 'bg-blue-100 dark:bg-blue-900/60 border-blue-200 dark:border-blue-700',
            accent: 'text-blue-600 dark:text-blue-400',
            btnText: 'Go Basic',
            highlight: true,
        },
        {
            type: 'PREMIUM',
            price: `₹${config.candidatePremiumMonthly || 599}`,
            period: '/ Month',
            features: [
                'Everything in Basic',
                'Highlighted resume to recruiters',
                'Priority in search results',
                'Direct recruiter connect',
            ],
            icon: <Star className="w-6 h-6 text-amber-500" />,
            cardClass: 'bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700/60 shadow-2xl shadow-amber-500/15',
            iconBg: 'bg-amber-100 dark:bg-amber-900/60 border-amber-200 dark:border-amber-700',
            accent: 'text-amber-600 dark:text-amber-400',
            btnText: 'Go Premium',
        },
    ];

    return (
        <div className="min-h-screen bg-bg-main py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full" />

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border font-bold text-sm backdrop-blur-xl ${
                            toast.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                        }`}
                    >
                        {toast.type === 'success'
                            ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            : <XCircle className="w-5 h-5 flex-shrink-0" />
                        }
                        {toast.message}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Lock size={12} /> Candidate Plans
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tighter uppercase leading-none">
                        Boost Your <span className="text-blue-500">Career</span>.
                    </h1>
                    <p className="text-text-secondary text-lg font-medium tracking-wide">
                        Upgrade your profile. Get noticed by top recruiters faster.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.type}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-10 rounded-[2.5rem] border-2 flex flex-col justify-between relative overflow-hidden ${plan.cardClass} ${plan.highlight ? 'ring-2 ring-blue-400/30 ring-offset-2 ring-offset-transparent' : ''}`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-5 right-5 px-3 py-1 rounded-full bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl border ${plan.iconBg}`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-text-primary tracking-widest uppercase">{plan.type}</h3>
                                        {plan.highlight && <p className={`text-[10px] font-bold uppercase tracking-widest ${plan.accent}`}>Recommended</p>}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-text-primary">{plan.price}</span>
                                        {plan.period && <span className={`text-sm font-bold uppercase tracking-widest ${plan.accent}`}>{plan.period}</span>}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {plan.features.map(f => (
                                        <div key={f} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            </div>
                                            <span className="text-sm font-medium text-text-secondary">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => !plan.isFree && handleSubscription(plan.type)}
                                disabled={paying || plan.isFree || user?.planType === plan.type}
                                className={`mt-10 w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                                    user?.planType === plan.type
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/30 cursor-default'
                                        : plan.isFree
                                        ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 border-2 border-slate-300 dark:border-slate-600 cursor-default'
                                        : plan.highlight
                                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40'
                                        : 'bg-text-primary text-bg-main hover:opacity-80 shadow-xl'
                                }`}
                            >
                                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                                {user?.planType === plan.type ? '✓ Active Plan' : plan.btnText}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center mt-12 text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">
                    Secured by Razorpay · 256-bit AES Encryption · PCI DSS Compliant
                </p>
            </div>
        </div>
    );
};

export default CandidatePricingPage;

