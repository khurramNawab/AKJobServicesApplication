import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Rocket, Loader2, Lock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CandidatePricingPage = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        const checkAndFetch = async () => {
            try {
                const { data } = await api.get('/platform-config');
                if (!data?.data?.candidateSubscriptionEnabled) {
                    // Admin ne candidate subscription OFF rakhi hai — redirect
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

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'AK Job Services',
                description: `Candidate ${planType} Plan`,
                order_id: data.order.id,
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
                            alert('✅ Subscription Activated!');
                            await fetchUser();
                            navigate('/dashboard');
                        }
                    } catch { alert('Payment verification failed. Contact support.'); }
                },
                prefill: { email: user.email },
                theme: { color: '#4F8EF7' }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
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
            icon: <Rocket className="w-6 h-6 text-gray-400" />,
            color: 'bg-gray-500/10 border-gray-500/20',
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
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            color: 'bg-blue-600/10 border-blue-600/30 shadow-lg shadow-blue-600/10',
            btnText: 'Go Basic',
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
            icon: <Star className="w-6 h-6 text-amber-400" />,
            color: 'bg-amber-600/10 border-amber-600/30 shadow-2xl shadow-amber-600/10',
            btnText: 'Go Premium',
        },
    ];

    return (
        <div className="min-h-screen bg-bg-main py-24 px-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        <Lock size={12} /> Candidate Plans
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                        Boost Your <span className="text-blue-500">Career</span>.
                    </h1>
                    <p className="text-gray-500 text-lg font-medium tracking-wide">
                        Upgrade your profile. Get noticed by top recruiters faster.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.type}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`p-10 rounded-[2.5rem] border backdrop-blur-xl flex flex-col justify-between ${plan.color}`}
                        >
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-white tracking-widest uppercase">{plan.type}</h3>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white">{plan.price}</span>
                                        {plan.period && <span className="text-gray-500 text-sm font-bold uppercase tracking-widest">{plan.period}</span>}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    {plan.features.map(f => (
                                        <div key={f} className="flex items-center gap-3">
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-400">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => !plan.isFree && handleSubscription(plan.type)}
                                disabled={paying || plan.isFree || user?.planType === plan.type}
                                className={`mt-10 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                                    user?.planType === plan.type || plan.isFree
                                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                                        : 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl hover:shadow-blue-600/20'
                                }`}
                            >
                                {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                                {user?.planType === plan.type ? 'Active Plan' : plan.btnText}
                            </button>
                        </motion.div>
                    ))}
                </div>

                <p className="text-center mt-12 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em]">
                    Secured by Razorpay. 256-bit AES Encryption.
                </p>
            </div>
        </div>
    );
};

export default CandidatePricingPage;
