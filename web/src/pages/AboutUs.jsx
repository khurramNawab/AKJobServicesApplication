import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, TrendingUp, Sparkles, ArrowRight, Zap, ShieldCheck, Globe, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Global Pioneers", value: "450k+" },
        { label: "Elite Partners", value: "850+" },
        { label: "Hiring Velocity", value: "12 Days" },
        { label: "Avg Salary Inc.", value: "35%" },
    ];

    const values = [
        {
            icon: ShieldCheck,
            title: "Precision Matching",
            description: "We leverage deep-learning neural architectures to match the top 1% of talent with roles where their impact is maximized. No noise, just precision."
        },
        {
            icon: Globe,
            title: "Elite Curation",
            description: "We don't just list jobs. We curate access to the world's most innovative high-growth startups and Fortune 500 pioneers defining the next decade."
        },
        {
            icon: Zap,
            title: "Pioneer Network",
            description: "Engineering a high-performance ecosystem where the world's best builders connect. We are building the talent architecture of the future."
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 pt-32 pb-32 w-full relative overflow-hidden bg-[#020617]">
            {/* Background Orbs */}
            <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-[#2563EB]/10 blur-[150px] rounded-full animate-glow -z-10" />
            <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-[#EF4444]/5 blur-[150px] rounded-full animate-glow -z-10" />

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-28 md:mb-40"
            >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-primary-light text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl">
                    <Rocket className="w-4 h-4 text-[#EF4444]" /> The Future of Global Talent Architecture
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter mb-10 leading-[0.85]">
                   Architecting the <span className="gradient-text block">1% Workforce</span>
                </h1>
                <p className="text-xl md:text-3xl text-text-secondary max-w-4xl mx-auto leading-relaxed font-medium">
                    AK Job Services is a gated ecosystem engineered for the world's most ambitious builders and the companies that need them most.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-32 md:mb-48">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-10 md:p-14 rounded-[3rem] text-center border-white/5 hover:border-primary/20 transition-all group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-4 group-hover:text-primary transition-colors relative z-10">{stat.label}</h4>
                        <div className="text-5xl md:text-6xl font-black text-white group-hover:text-primary transition-all relative z-10">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Mission & Values */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-32 md:mb-48">
                {values.map((value, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        className="glass-card p-12 rounded-[3.5rem] border-white/5 relative overflow-hidden group hover:scale-[1.02] transition-all"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#2563EB]/5 blur-[80px] pointer-events-none group-hover:bg-[#2563EB]/10 transition-all duration-700" />
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-10 group-hover:rotate-12 transition-transform border border-white/10">
                            <value.icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black text-white mb-6 tracking-tight">{value.title}</h3>
                        <p className="text-text-secondary text-lg leading-relaxed font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                            {value.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass rounded-[5rem] p-16 md:p-32 text-center border-white/5 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#2563EB]/10 via-transparent to-[#EF4444]/5 opacity-40" />
                <h2 className="text-4xl md:text-7xl font-black text-white mb-12 tracking-tighter relative z-10 leading-tight">
                    Start Your <span className="gradient-text italic">Performance Journey</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="btn-power h-16 px-12 group"
                    >
                        Explore Elite Openings <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform ml-2" />
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="h-16 px-12 rounded-[1.2rem] bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black transition-all text-sm uppercase tracking-widest"
                    >
                        Join the Gated Community
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AboutUs;
