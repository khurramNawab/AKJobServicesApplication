import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, Search, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 rounded-[3rem] border-white/5 max-w-2xl w-full text-center space-y-8 relative z-10 shadow-2xl"
      >
        <div className="relative">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-500/20 to-slate-300/20 tracking-tighter">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-20 h-20 bg-secondary/10 rounded-3xl flex items-center justify-center border border-secondary/20 shadow-[0_0_30px_rgba(240,86,116,0.2)] rotate-12">
                  <AlertTriangle className="w-10 h-10 text-secondary" />
               </div>
            </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Page not found</h2>
          <p className="text-slate-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 border-t border-white/5">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-5 h-5" /> Go Back
          </button>
          <Link 
            to="/"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-light text-white font-bold transition-all shadow-[0_0_20px_rgba(79,142,247,0.3)] w-full sm:w-auto justify-center"
          >
            <Home className="w-5 h-5" /> Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
