import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
    const navigate = useNavigate();

    const stats = [
        { label: "Active Jobs", value: "2.5k+" },
        { label: "Talented Users", value: "15k+" },
        { label: "Successful Hires", value: "1.2k+" },
        { label: "Partner Companies", value: "350+" },
    ];

    const values = [
        {
            icon: Target,
            title: "Our Mission",
            description: "To bridge the gap between extraordinary talent and world-class opportunities through seamless, technology-driven recruitment."
        },
        {
            icon: Sparkles,
            title: "Our Innovation",
            description: "We are redefining the job search experience with a focus on speed, clarity, and modern design."
        },
        {
            icon: Users,
            title: "Our Community",
            description: "Building a trusted ecosystem where recruiters and candidates can grow together in a professional environment."
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 w-full relative overflow-hidden">
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[150px] rounded-full -z-10" />

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20 md:mb-32"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs font-black uppercase tracking-widest mb-8">
                    <TrendingUp className="w-4 h-4" /> The Future of Recruitment
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                    We’re Building the <span className="text-primary-light block">Next Generation</span> of Job Services
                </h1>
                <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
                    AK Job Services was born out of a simple idea: making recruitment faster, transparent, and aesthetically pleasing.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-20 md:mb-32">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="glass p-8 md:p-12 rounded-[2.5rem] text-center hover:bg-white/5 transition-colors group"
                    >
                        <h4 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2 group-hover:text-slate-400 transition-colors">{stat.label}</h4>
                        <div className="text-4xl md:text-5xl font-black text-white group-hover:text-primary-light transition-colors">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Mission & Values */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 md:mb-32">
                {values.map((value, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        className="glass-card p-10 rounded-[3rem] border-white/5 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-700" />
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                            <value.icon className="w-8 h-8 text-primary-light" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{value.title}</h3>
                        <p className="text-slate-400 leading-relaxed font-medium">
                            {value.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* CTA Section */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass rounded-[4rem] p-12 md:p-24 text-center border-white/10 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary/5 blur-[120px] pointer-events-none" />
                <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tighter relative z-10">
                    Ready to Start Your <span className="text-primary-light">Professional Journey?</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                    <button
                        onClick={() => navigate('/jobs')}
                        className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary-dark text-black font-black transition-all hover:scale-105 active:scale-95 flex items-center gap-2 group shadow-xl shadow-primary/20"
                    >
                        Explore Jobs <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold transition-all"
                    >
                        Join Our Community
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default AboutUs;
