import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const ComingSoon = ({ pageName }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 pt-32 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 max-w-2xl w-full text-center relative overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full -z-10" />

        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20">
          <Rocket className="w-10 h-10 text-primary-light animate-bounce" />
        </div>

        <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
          {pageName} <span className="text-primary-light">is Coming Soon</span>
        </h1>

        <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
          We're busy building a world-class experience for {pageName.toLowerCase()}.
          Stay tuned as we prepare to launch something extraordinary.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" variant="cta" onClick={() => navigate('/')} className="w-full sm:w-auto px-8">
            <ArrowLeft className="mr-2 w-5 h-5" /> Back to Home
          </Button>
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 font-bold text-sm">
            <Clock className="w-5 h-5 text-primary-light" />
            Estimated: Q2 2026
          </div>
        </div>

        <div className="mt-12 pt-10 border-t border-white/5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            Pushing the boundaries of progress
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
