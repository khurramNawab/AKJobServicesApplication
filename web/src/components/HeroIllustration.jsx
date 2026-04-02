import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, MapPin, IndianRupee, Briefcase, Zap, Shield, TrendingUp } from 'lucide-react';

const HeroIllustration = () => {
  return (
    <div className="relative w-full h-[650px] flex items-center justify-center">
      {/* 🚀 Candidate Profile Card */}
      <motion.div
        initial={{ opacity: 0, x: 100, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1 }}
        className="glass-card p-6 w-[320px] shadow-2xl relative z-20 border-white/10 animate-float-slow bg-white/[0.03] backdrop-blur-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
             <div className="w-14 h-14 rounded-2xl border-2 border-[#2563EB] p-0.5 overflow-hidden">
               <img src="https://i.pravatar.cc/150?u=rahul_m" alt="Rahul Sharma" className="w-full h-full rounded-xl object-cover" />
             </div>
             <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full border-2 border-[#0F172A] p-0.5">
               <CheckCircle2 className="w-3 h-3 text-white" />
             </div>
          </div>
          <div>
            <h4 className="font-black text-white text-lg">Rahul Sharma</h4>
            <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Marketing Strategist</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {['Growth Hacking', 'Brand Strategy', 'Market Operations'].map(skill => (
            <span key={skill} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-white/70 uppercase border border-white/5 tracking-tighter">{skill}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-5 border-t border-white/5">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0F172A] bg-white/10 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                   <img src={`https://i.pravatar.cc/150?u=${i+20}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-[#0F172A] bg-primary flex items-center justify-center text-[8px] font-black text-white">+24</div>
           </div>
           <span className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest">Profile Strong</span>
        </div>
      </motion.div>

      {/* 📊 Profile Strength Card (Floating Left) */}
      <motion.div
        initial={{ opacity: 0, x: -100, y: 100 }}
        animate={{ opacity: 1, x: -140, y: 120 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="glass-card p-5 w-[240px] absolute z-30 border-[#EF4444]/20 animate-float-medium bg-black/40 backdrop-blur-3xl"
      >
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#EF4444]" />
              <span className="text-xs font-black text-white uppercase tracking-tighter">Profile Strength</span>
           </div>
           <span className="text-2xl font-black text-[#EF4444]">94%</span>
        </div>
        
        <div className="space-y-3">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 2, delay: 1 }}
              className="h-full bg-gradient-to-r from-[#2563EB] to-[#EF4444]"
            />
          </div>
          <p className="text-[10px] font-bold text-text-muted leading-tight">Excellent! Complete your bio to reach 100% and get noticed by top recruiters.</p>
        </div>
      </motion.div>

      {/* 💰 Salary Preview Card (Floating Bottom Right) */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, x: 180, y: 180 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="glass-island p-5 rounded-3xl absolute z-40 flex items-center gap-5 border-[#2563EB]/20 animate-float-slow"
      >
        <div className="w-14 h-14 bg-[#2563EB]/20 text-[#2563EB] rounded-2xl flex items-center justify-center border border-[#2563EB]/30">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <div className="text-[10px] font-black text-[#2563EB] uppercase tracking-[0.2em] mb-1">Average Package</div>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-black text-white">₹8.5L+</span>
             <span className="text-[10px] font-bold text-text-muted">/ annum</span>
          </div>
        </div>
      </motion.div>

      {/* Ambient Light Flares */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#EF4444]/5 blur-[150px] rounded-full" />
    </div>
  );
};

export default HeroIllustration;

