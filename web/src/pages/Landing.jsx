import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Star, TrendingUp, Users, ArrowRight, ShieldCheck, Globe, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import HeroIllustration from '../components/HeroIllustration';

const Landing = () => {
  return (
    <div className="w-full relative overflow-hidden bg-[#020617]">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Main Navy Gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#0B3C91]/20 via-transparent to-transparent" />

        {/* Animated Glow Orbs */}
        <div className="glow-orb top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#2563EB]/20 animate-glow" />
        <div className="glow-orb bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-[#EF4444]/10 animate-glow" style={{ animationDelay: '-5s' }} />
        <div className="glow-orb top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/10 animate-glow" style={{ animationDelay: '-2s' }} />

        {/* Subtle Light Flare */}
        <div className="absolute top-[10%] left-[20%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-[#2563EB]/40 to-transparent rotate-45" />
      </div>

      {/* Grid Pattern with Fade */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.15] mix-blend-overlay pointer-events-none z-0" />

      {/* 🚀 Hero Section */}
      <section className="relative pt-20 mt-6 pb-10 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-left space-y-6 lg:space-y-8">
              {/* Badge - Left Aligned */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary-light shadow-2xl"
              >
                <Zap className="w-4 h-4 text-[#EF4444] animate-pulse" />
                Connecting the World's Elite Talent
              </motion.div>

              {/* Headline - Universal and Impactful */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl font-black leading-[1.1] tracking-tight"
              >
                The Easiest Way <br />
                To Land Your <br />
                <span className="gradient-text">Dream Career.</span>
              </motion.h1>

              {/* Subtext - Focus on Universal Opportunities */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed font-medium opacity-80"
              >
                Browse over 100,000+ top jobs in India across all industries. From entry-level roles to executive positions, connect with the world's most trusted companies.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <button className="btn-power group px-8 py-4">
                  <span className="flex items-center gap-3">
                    Scale Your Team <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-8 py-4 rounded-[1.2rem] bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all text-sm uppercase tracking-widest">
                  View Career Paths
                </button>
              </motion.div>
            </div>

            {/* Sidebar Cards Illustration - Scaled and Repositioned */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1.1, x: 0 }}
              transition={{ duration: 1 }}
              className="flex-1 hidden lg:flex justify-center items-center relative pl-10 h-[500px]"
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* 🏝️ The Search Island (Conversion Focused) */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-6xl mx-auto"
          >
            <div className="glass-island p-3 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-3 transition-all hover:border-white/20">
              <div className="flex-1 w-full relative flex items-center">
                <Search className="absolute left-8 w-6 h-6 text-[#2563EB]" />
                <input
                  type="text"
                  placeholder="Role, Skill, or Company..."
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-muted pl-20 pr-6 py-8 text-xl font-bold"
                />
              </div>

              <div className="hidden lg:block w-[1px] h-14 bg-white/10" />

              <div className="flex-1 w-full relative flex items-center">
                <MapPin className="absolute left-8 w-6 h-6 text-[#EF4444]" />
                <input
                  type="text"
                  placeholder="Location (Remote, NYC...)"
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-muted pl-20 pr-6 py-8 text-xl font-bold"
                />
              </div>

              <button className="btn-power w-full lg:w-auto h-full !py-8 !rounded-[1.8rem] !shadow-none hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                Search Opportunities
              </button>
            </div>

            {/* Quick Links - Common Sectors */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-10">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Top Sectors</span>
              {['Marketing', 'Finance', 'Sales', 'Customer Success', 'Operations', 'Design'].map(tag => (
                <button key={tag} className="text-xs font-bold text-text-secondary hover:text-primary transition-all flex items-center gap-2 group">
                  <div className="w-1 h-1 bg-[#2563EB] rounded-full group-hover:scale-150 transition-transform" /> {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 💼 Social Proof / Trust Section - General Corporate */}
      <section className="py-10 border-y border-white/5 bg-white/[0.01] relative">
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-transparent to-bg-main pointer-events-none z-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-0">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Connect with 5,000+ Verified Companies</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-80 transition-all duration-700">
            <div className="flex items-center gap-3 font-black text-2xl text-white tracking-tighter">ZOMATO</div>
            <div className="flex items-center gap-3 font-black text-2xl text-white tracking-widest">RELIANCE</div>
            <div className="flex items-center gap-3 font-bold text-2xl text-white tracking-tight">HDFC BANK</div>
            <div className="flex items-center gap-3 font-black text-2xl text-white uppercase italic">TATA</div>
            <div className="flex items-center gap-3 font-black text-2xl text-white">INFOSYS</div>
          </div>
        </div>
      </section>

      {/* 📊 High-Performance Metrics */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Activated Talents', value: '450k+', icon: Users, color: 'text-[#2563EB]' },
            { label: 'Daily Opportunities', value: '1,200+', icon: Zap, color: 'text-[#EF4444]' },
            { label: 'Success Rate', value: '98%', icon: Star, color: 'text-amber-400' },
            { label: 'Avg Salary Peak', value: '45%', icon: TrendingUp, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass-card p-5 group relative flex flex-col items-center text-center space-y-2 rounded-xl"
            >
              <div className={`p-3 rounded-xl bg-white/[0.02] border border-white/5 group-hover:border-primary/20 ${stat.color} transition-all`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ⚡ Latest Openings Section */}
      <section className="py-16 px-6 bg-white/[0.01] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Latest <span className="gradient-text">Openings</span>
              </h2>
              <p className="text-base text-text-secondary max-w-2xl font-medium opacity-80">
                Don't miss out on your dream job. Handpicked opportunities from the world's most innovative companies.
              </p>
            </div>
            <button className="px-10 py-5 rounded-[1.2rem] bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 hover:border-white/20 transition-all text-sm uppercase tracking-widest whitespace-nowrap">
              View All Jobs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { id: 1, initial: 'Z', title: 'Senior Marketing Strategist', company: 'Zomato', location: 'Remote', tags: ['Growth', 'Brand', '₹12L+'], posted: '2h ago' },
              { id: 2, initial: 'R', title: 'Lead Operations Manager', company: 'Reliance', location: 'Mumbai', tags: ['Strategy', 'Lean', '₹18L+'], posted: '4h ago' },
              { id: 3, initial: 'H', title: 'Financial Analyst', company: 'HDFC Bank', location: 'Delhi', tags: ['Fintech', 'Excel', '₹15L+'], posted: '1h ago' },
              { id: 4, initial: 'T', title: 'Product Manager', company: 'Tata Group', location: 'Bangalore', tags: ['Agile', 'User Research', '₹22L+'], posted: '5h ago' },
              { id: 5, initial: 'I', title: 'Strategic HR Lead', company: 'Infosys', location: 'Hyderabad', tags: ['Talent', 'Culture', '₹14L+'], posted: '3h ago' },
              { id: 6, initial: 'W', title: 'Business Development Executive', company: 'Wipro', location: 'Remote', tags: ['Sales', 'Growth', '₹10L+'], posted: '6h ago' },
            ].map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -5 }}
                className="glass-card p-6 group relative overflow-hidden flex flex-col h-full border-white/5 hover:border-[#2563EB]/40 transition-all shadow-xl rounded-xl"
              >
                {/* Header with Featured Badge */}
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/40 transition-all shadow-inner">
                      <span className="text-2xl font-black text-white">{job.initial}</span>
                   </div>
                   <span className="px-3 py-1 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-full text-[8px] font-black text-[#2563EB] uppercase tracking-[0.2em] shadow-sm">
                      Featured
                   </span>
                </div>

                <div className="space-y-2 mb-6">
                   <h3 className="text-lg font-black text-white tracking-tight leading-tight group-hover:text-[#2563EB] transition-colors line-clamp-1">{job.title}</h3>
                   <p className="text-xs font-bold text-text-secondary opacity-80 flex items-center gap-2">
                     {job.company} <span className="w-1 h-1 bg-white/20 rounded-full" /> {job.location}
                   </p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-white/5 rounded-lg text-[9px] font-black text-white/50 border border-white/5 uppercase tracking-tighter">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                    Posted {job.posted}
                  </span>
                  <button className="flex items-center gap-1.5 text-xs font-black text-white hover:text-[#2563EB] transition-all group/btn">
                    Apply Now <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Decorative Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/0 to-[#2563EB]/0 group-hover:from-[#2563EB]/5 group-hover:to-transparent pointer-events-none transition-all duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
