import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Star, Rocket, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const PricingPage = () => {
    const { user, fetchUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const handleSubscription = async (planType) => {
        if (!user) {
            alert('Please login to continue');
            return;
        }
        
        setLoading(true);
        try {
            // 1. Create order on backend
            const { data } = await api.post('/payments/create-order', { planType });
            
            if (!data.success) throw new Error(data.message);

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID, 
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'AK Job Services',
                description: `${planType} Subscription Plan`,
                order_id: data.order.id,
                handler: async function (response) {
                    // 2. Verify payment on backend
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planType
                        });

                        if (verifyRes.data.success) {
                            alert('SUCCESS: Subscription Activated!');
                            await fetchUser(); // Update UI with new plan status
                        }
                    } catch (err) {
                        alert('CRITICAL: Payment verification failed. Contact support.');
                    }
                },
                prefill: {
                    email: user.email
                },
                theme: {
                    color: "#4F8EF7"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const plans = [
        {
            type: 'FREE',
            price: '₹0',
            features: ['Basic Job Search', 'Apply to 5 Jobs', 'Standard Resume Visibility'],
            icon: <Rocket className="w-6 h-6 text-gray-400" />,
            color: 'bg-gray-500/10 border-gray-500/20',
            btnText: 'Current Plan'
        },
        {
            type: 'BASIC',
            price: '₹499',
            period: '/ Month',
            features: ['Unlimited Job Apps', 'Priority Resume', 'Recruiter Messaging', 'No Ads'],
            icon: <Shield className="w-6 h-6 text-blue-400" />,
            color: 'bg-blue-600/10 border-blue-600/30 shadow-lg shadow-blue-600/10',
            btnText: 'Go Basic'
        },
        {
            type: 'PREMIUM',
            price: '₹1499',
            period: '/ Month',
            features: ['Everything in Basic', 'Verified Badge', 'Direct Admin Support', 'Resume Builder Pro'],
            icon: <Star className="w-6 h-6 text-amber-400" />,
            color: 'bg-amber-600/10 border-amber-600/30 shadow-2xl shadow-amber-600/10',
            btnText: 'Go Premium'
        }
    ];

    return (
        <div className="min-h-screen bg-bg-main py-24 px-6 relative overflow-hidden">
            {/* Glossy Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full" />

            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
                        Scale Your <span className="text-blue-500">Service</span>.
                    </h1>
                    <p className="text-gray-500 text-lg font-medium tracking-wide">Select the tier that fits your growth trajectory.</p>
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
                                            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-400">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleSubscription(plan.type)}
                                disabled={loading || user?.planType === plan.type}
                                className={`mt-10 w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                                    user?.planType === plan.type
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                    : 'bg-white text-black hover:bg-blue-600 hover:text-white shadow-xl hover:shadow-blue-600/20'
                                }`}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {user?.planType === plan.type ? 'Active Tier' : plan.btnText}
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

export default PricingPage;

