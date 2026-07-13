import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ShieldAlert, Cpu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Security = () => {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All sensitive data is encrypted at rest and in transit using industry-standard TLS protocols.",
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      icon: ShieldCheck,
      title: "Secure Authentication",
      description: "Multi-factor authentication and phone-based OTP verification ensure only you can access your account.",
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      icon: Cpu,
      title: "Infrastructure Security",
      description: "Our systems run on enterprise-grade cloud providers with 24/7 monitoring and automated firewalls.",
      color: "text-purple-400",
      bg: "bg-purple-400/10"
    },
    {
      icon: ShieldAlert,
      title: "Proactive Protection",
      description: "Regular security audits and automated threat detection keep our users safe from evolving digital risks.",
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 pt-8 pb-20 w-full relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F8EF7]/5 blur-[120px] rounded-full -z-10" />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-5 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Safety
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[#4F8EF7] text-xs font-black uppercase tracking-widest mb-6">
          <ShieldCheck className="w-4 h-4" /> Enterprise-Grade Security
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter mb-6">
          Your Data Security is Our <span className="text-[#4F8EF7]">Top Priority</span>
        </h1>
        <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          We implement rigorous security standards to protect your professional information and ensure a safe, trusted experience for all users.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {securityFeatures.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-8 rounded-[2rem] border border-[var(--color-border-subtle)] transition-colors group"
          >
            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <feature.icon className={`w-7 h-7 ${feature.color}`} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3 tracking-tight">{feature.title}</h3>
            <p className="text-text-secondary leading-relaxed font-medium">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="glass-card p-10 md:p-14 rounded-[3rem] text-center border border-[var(--color-border-subtle)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#34D399]/5 blur-[100px] pointer-events-none" />
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4 relative z-10">Report a Vulnerability?</h2>
        <p className="text-text-secondary mb-8 max-w-xl mx-auto font-medium relative z-10">
          Our security team appreciates responsible disclosure. If you've discovered a bug or a potential vulnerability, please reach out to us.
        </p>
        <a
          href="mailto:akjobservices7@gmail.com"
          className="inline-flex items-center justify-center h-14 px-10 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-elevated)] text-text-primary font-bold transition-all hover:scale-105 active:scale-95"
        >
          akjobservices7@gmail.com
        </a>
      </motion.div>
    </div>
  );
};

export default Security;
