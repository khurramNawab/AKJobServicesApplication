import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, MapPin, IndianRupee, Briefcase } from 'lucide-react';

const HeroIllustration = () => {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

      {/* Main Card - Job Listing */}
      <motion.div
        initial={{ opacity: 0, x: 50, rotate: 2 }}
        animate={{ opacity: 1, x: 0, rotate: -2 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="glass-card p-8 w-[400px] shadow-2xl relative z-20 border-white/10"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-white/20">
            <img src="/logo.png" alt="AK Group" className="w-14 h-14 object-contain" />
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/30">Verified</span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Senior Software Engineer</h3>
        <p className="text-slate-400 font-bold text-sm mb-6 flex items-center gap-2">AK Group <span className="w-1 h-1 bg-slate-600 rounded-full" /> London (Remote)</p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Full health & dental insurance
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Competitive equity package
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Remote-first culture
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Salary Range</span>
            <span className="text-lg font-black text-white">₹12L - ₹24L</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30"
          >
            Apply Now
          </motion.button>
        </div>
      </motion.div>

      {/* Secondary Card - Candidate Match */}
      <motion.div
        initial={{ opacity: 0, x: -50, rotate: -5 }}
        animate={{ opacity: 1, x: -180, y: -100, rotate: 5 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="glass-card p-6 w-[280px] absolute z-30 border-white/10 hidden md:block"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-primary-light p-0.5 overflow-hidden">
            <img src="https://i.pravatar.cc/150?u=4" alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <h4 className="font-black text-white">Alex Rivera</h4>
            <p className="text-slate-500 text-xs font-bold">Product Designer</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '92%' }}
              transition={{ duration: 2, delay: 1 }}
              className="h-full bg-gradient-to-r from-primary to-indigo-400"
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span>Match Score</span>
            <span className="text-primary-light">92%</span>
          </div>
        </div>
      </motion.div>

      {/* Small Floating Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, x: 120, y: 180 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="glass shadow-2xl p-4 rounded-2xl absolute z-30 flex items-center gap-4 border-white/5"
      >
        <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center">
          <IndianRupee className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Total Earnings</div>
          <div className="text-lg font-black text-white">₹12.4L</div>
        </div>
      </motion.div>

      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-secondary/5 blur-3xl rounded-full" />
    </div>
  );
};

export default HeroIllustration;
