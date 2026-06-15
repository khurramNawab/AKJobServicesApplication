import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Star, TrendingUp, Search } from 'lucide-react';

const HeroIllustration = () => {
  return (
    <div className="relative w-full h-[550px] flex items-center justify-center select-none">

      {/* ── Rotating Radar Rings (Background Layer) ── */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[480px] h-[480px] rounded-full border border-dashed border-white/[0.04] animate-[spin_60s_linear_infinite]" />
        <div className="w-[360px] h-[360px] rounded-full border border-dashed border-white/[0.02] absolute animate-[spin_30s_linear_infinite_reverse]" />
      </div>

      {/* ── Floating Brand Nodes ── */}
      {/* Infosys Node */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-12 left-6 z-30 p-2 bg-[#141C36]/90 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="w-6 h-6 rounded-lg bg-[#007CC3] flex items-center justify-center text-[10px] font-black text-white">I</div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black text-white leading-none">Infosys</span>
          <span className="text-[7.5px] text-emerald-400 font-bold mt-0.5">Interviewing</span>
        </div>
      </motion.div>

      {/* Zomato Node */}
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-12 right-6 z-30 p-2 bg-[#141C36]/90 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="w-6 h-6 rounded-lg bg-[#CB202D] flex items-center justify-center text-[10px] font-black text-white">Z</div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black text-white leading-none">Zomato</span>
          <span className="text-[7.5px] text-[#4F8EF7] font-bold mt-0.5">Matched</span>
        </div>
      </motion.div>

      {/* TCS Node */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-24 right-4 z-30 p-2 bg-[#141C36]/90 backdrop-blur-md rounded-xl border border-white/10 flex items-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      >
        <div className="w-6 h-6 rounded-lg bg-[#00509A] flex items-center justify-center text-[10px] font-black text-white">T</div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] font-black text-white leading-none">TCS</span>
          <span className="text-[7.5px] text-[#94A3B8] mt-0.5">Active</span>
        </div>
      </motion.div>

      {/* ── Main SaaS Mock Browser Window ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-[490px] h-[340px] relative z-20"
      >
        {/* Glowing glass frame border */}
        <div className="w-full h-full bg-gradient-to-br from-white/15 via-white/[0.04] to-white/5 p-[1.5px] rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="w-full h-full bg-[#141C36]/95 rounded-[15px] flex flex-col overflow-hidden relative">

            {/* Title Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-[#1A2544]/90">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
              </div>

              {/* URL Mock Bar */}
              <div className="flex items-center gap-1.5 px-4 py-0.5 bg-white/5 rounded-md text-[9px] text-[#94A3B8] font-mono border border-white/5 w-[220px] justify-center">
                <Search className="w-2.5 h-2.5 text-[#64748B]" />
                <span>akjobservices.com/Koushik Sarkar</span>
              </div>

              <div className="w-[30px]" />
            </div>

            {/* Split Panel Layout */}
            <div className="flex-1 flex overflow-hidden">

              {/* Left Panel: Profile Info */}
              <div className="w-[42%] border-r border-white/[0.07] p-4 flex flex-col justify-between bg-white/[0.01]">

                {/* Profile Detail */}
                <div className="flex flex-col items-center text-center mt-1">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#4F8EF7] to-[#A855F7] p-[2px] shadow-lg shadow-[#4F8EF7]/20">
                      <div className="w-full h-full rounded-full bg-[#141C36] p-0.5 overflow-hidden">
                        <img
                          src="https://i.pravatar.cc/150?u=rahul_m"
                          className="w-full h-full rounded-full object-cover"
                          alt="Koushik Sarkar"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full border-2 border-[#141C36] p-0.5 shadow-md shadow-emerald-500/50">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  <h5 className="font-extrabold text-white text-base tracking-tight leading-snug">Koushik Sarkar</h5>
                  <p className="text-[#94A3B8] text-[9.5px] font-bold uppercase tracking-wider mt-1">Marketing Strategist</p>
                </div>

                {/* Circular Matching Gauge */}
                <div className="bg-white/[0.03] border border-white/[0.06] p-2 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex flex-col text-left">
                    <span className="text-[7.5px] font-bold text-[#A855F7] uppercase tracking-wider">Verification</span>
                    <span className="text-[9.5px] font-black text-white mt-0.5">Strong Match</span>
                  </div>

                  <div className="relative w-8 h-8 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="16" cy="16" r="13" stroke="rgba(255,255,255,0.06)" strokeWidth="3" fill="none" />
                      <circle
                        cx="16"
                        cy="16"
                        r="13"
                        stroke="#4F8EF7"
                        strokeWidth="3"
                        fill="none"
                        strokeDasharray="81.6"
                        strokeDashoffset="4.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[8px] font-black text-[#4F8EF7]">94%</span>
                  </div>
                </div>
              </div>

              {/* Right Panel: Active Matching Feed & Stats */}
              <div className="flex-1 p-4 flex flex-col justify-between">

                {/* Live Activity Feed */}
                <div className="space-y-2 text-left">
                  <span className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-widest block">Recruiter Status</span>

                  <div className="flex items-center justify-between p-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#007CC3]/10 flex items-center justify-center text-[8px] font-black text-[#007CC3]">I</div>
                      <span className="text-[9.5px] font-bold text-white">Infosys</span>
                    </div>
                    <span className="text-[7.5px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                      Interview
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-[#CB202D]/10 flex items-center justify-center text-[8px] font-black text-[#CB202D]">Z</div>
                      <span className="text-[9.5px] font-bold text-[#94A3B8]">Zomato</span>
                    </div>
                    <span className="text-[7.5px] font-bold text-[#64748B]">Viewed 5m ago</span>
                  </div>
                </div>

                {/* Skills Cloud */}
                <div className="text-left mt-2">
                  <span className="text-[8px] font-extrabold text-[#64748B] uppercase tracking-widest block mb-1.5">Endorsements</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['Growth Hacking', 'Brand Strategy', 'Market Ops'].map((skill, idx) => {
                      const colors = [
                        'bg-[#38BDF8]/8 text-[#38BDF8] border-[#38BDF8]/15',
                        'bg-[#A855F7]/8 text-[#A855F7] border-[#A855F7]/15',
                        'bg-[#FBBF24]/8 text-[#FBBF24] border-[#FBBF24]/15'
                      ];
                      return (
                        <span
                          key={skill}
                          className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase border tracking-wider ${colors[idx % colors.length]}`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Salary Package Trend */}
                <div className="flex items-center justify-between bg-white/[0.02] p-2 rounded-xl border border-white/[0.05] mt-3">
                  <div className="text-left">
                    <span className="text-[8px] font-extrabold text-[#38BDF8] uppercase tracking-wider">Avg Package</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-black text-white">₹8.5L+</span>
                      <span className="text-[8px] text-[#64748B]">/ yr</span>
                    </div>
                  </div>

                  {/* SVG Sparkline Graphic */}
                  <div className="w-16 h-8 opacity-90 self-end">
                    <svg viewBox="0 0 60 30" className="w-full h-full">
                      <defs>
                        <linearGradient id="consoleChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 25 C10 20, 20 28, 30 18 C40 10, 50 15, 60 5 L60 30 L0 30 Z" fill="url(#consoleChart)" />
                      <path d="M0 25 C10 20, 20 28, 30 18 C40 10, 50 15, 60 5" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="60" cy="5" r="2" fill="#4F8EF7" />
                      <circle
                        cx="60"
                        cy="5"
                        r="4"
                        fill="#4F8EF7"
                        className="animate-ping"
                        style={{ transformOrigin: '60px 5px' }}
                      />
                    </svg>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── Ambient Radial Glows (Mesh Backdrop Layer) ── */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#4F8EF7]/15 blur-[120px] rounded-full animate-glow pointer-events-none z-10" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-[#A855F7]/10 blur-[130px] rounded-full animate-glow pointer-events-none z-10" />
    </div>
  );
};

export default HeroIllustration;
