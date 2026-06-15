import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Star, TrendingUp, Users, ArrowRight, ShieldCheck, Globe, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import HeroIllustration from '../components/HeroIllustration';

const Landing = () => {
  return (
    <div className="w-full relative overflow-hidden bg-bg-main">
      {/* Background — toned-down orbs (max 2, opacity 0.10) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-gradient-to-b from-[#0C1E42]/30 via-transparent to-transparent" />
        <div className="glow-orb top-[-15%] left-[-10%] w-[45%] h-[45%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[5%] right-[-8%] w-[35%] h-[35%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-4s' }} />
        {/* Subtle light beam */}
        <div className="absolute top-[15%] left-[25%] w-[1px] h-[250px] bg-gradient-to-b from-transparent via-[#4F8EF7]/20 to-transparent rotate-[35deg]" />
      </div>

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-left space-y-7 lg:space-y-8">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.06em] text-[#38BDF8] border border-[rgba(56,189,248,0.2)] bg-[rgba(56,189,248,0.06)]"
              >
                <Zap className="w-3.5 h-3.5" />
                India's Top Job Portal & Recruitment Solutions
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1]"
                style={{ letterSpacing: '-0.02em' }}
              >
                Find Best Jobs In India<br />
                & Land Your<br />
                <span className="gradient-text">Dream Career Online.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed"
              >
                Explore over 100,000+ active job openings in India on our leading job search portal. Apply online for elite tech, finance, marketing, and corporate careers with India's most trusted companies.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-1"
              >
                <button className="btn-power group">
                  <span className="flex items-center gap-2">
                    Post Jobs & Scale Your Team <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button className="px-6 py-3 rounded-[10px] border border-[rgba(255,255,255,0.10)] text-text-secondary hover:text-text-primary hover:border-[rgba(79,142,247,0.3)] hover:bg-white/[0.03] transition-all text-sm font-medium">
                  Search Openings Online
                </button>
              </motion.div>
            </div>

            {/* Hero Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex-1 hidden lg:flex justify-center items-center relative h-[480px]"
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* Search Island */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div
              className="p-2 rounded-2xl flex flex-col lg:flex-row items-center gap-2 transition-all"
              style={{ background: 'rgba(13,21,38,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
            >
              <div className="flex-[1.5] w-full relative flex items-center">
                <Search className="absolute left-5 w-5 h-5 text-[#4F8EF7]" />
                <input
                  type="text"
                  placeholder="Role, Skill, or Company..."
                  className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-14 pr-4 py-5 text-base font-medium"
                />
              </div>

              <div className="hidden lg:block w-px h-10 bg-[rgba(255,255,255,0.07)]" />

              <div className="flex-1 w-full relative flex items-center">
                <MapPin className="absolute left-5 w-5 h-5 text-[#F05674]" />
                <input
                  type="text"
                  placeholder="Location (Remote, Mumbai...)"
                  className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-14 pr-4 py-5 text-base font-medium"
                />
              </div>

              <button className="btn-power w-full lg:w-auto px-8 py-4 rounded-xl">
                Search
              </button>
            </div>

            {/* Quick Tags */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
              <span className="label-caps">Top Sectors</span>
              {['Marketing', 'Finance', 'Sales', 'Customer Success', 'Operations', 'Design'].map(tag => (
                <button key={tag} className="text-xs font-medium text-text-secondary hover:text-[#4F8EF7] transition-colors flex items-center gap-1.5 group">
                  <div className="w-1 h-1 bg-[#4F8EF7] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 border-y border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.01)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[#050B18] via-transparent to-[#050B18] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="label-caps">Connect with 5,000+ Verified Companies</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-30 hover:opacity-60 transition-all duration-700">
            <div className="font-black text-xl text-white tracking-tighter">ZOMATO</div>
            <div className="font-black text-xl text-white tracking-widest">RELIANCE</div>
            <div className="font-bold text-xl text-white tracking-tight">HDFC BANK</div>
            <div className="font-black text-xl text-white uppercase italic">TATA</div>
            <div className="font-black text-xl text-white">INFOSYS</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Talents',  value: '450k+', icon: Users,      color: 'text-[#4F8EF7]', bg: 'bg-[#4F8EF7]/10' },
            { label: 'Daily Openings',  value: '1,200+', icon: Zap,       color: 'text-[#F05674]', bg: 'bg-[#F05674]/10' },
            { label: 'Success Rate',    value: '98%',    icon: Star,      color: 'text-[#FBBF24]', bg: 'bg-[#FBBF24]/10' },
            { label: 'Salary Growth',   value: '45%',    icon: TrendingUp, color: 'text-[#34D399]', bg: 'bg-[#34D399]/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="glass-card p-5 flex flex-col items-center text-center gap-3"
            >
              <div className={`p-2.5 rounded-xl ${stat.bg} border border-[rgba(255,255,255,0.06)]`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-text-primary">{stat.value}</h4>
                <p className="label-caps mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest Openings */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary">
                Latest <span className="gradient-text">Openings</span>
              </h2>
              <p className="text-text-secondary max-w-xl leading-relaxed">
                Handpicked opportunities from the world's most innovative companies.
              </p>
            </div>
            <button className="px-6 py-2.5 rounded-[10px] border border-[rgba(255,255,255,0.10)] text-sm font-medium text-text-secondary hover:text-text-primary hover:border-[rgba(79,142,247,0.3)] transition-all whitespace-nowrap">
              View All Jobs
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 1, initial: 'Z', title: 'Senior Marketing Strategist', company: 'Zomato',   location: 'Remote',    tags: ['Growth', 'Brand', '₹12L+'],   posted: '2h ago' },
              { id: 2, initial: 'R', title: 'Lead Operations Manager',     company: 'Reliance', location: 'Mumbai',    tags: ['Strategy', 'Lean', '₹18L+'],  posted: '4h ago' },
              { id: 3, initial: 'H', title: 'Financial Analyst',           company: 'HDFC Bank', location: 'Delhi',   tags: ['Fintech', 'Excel', '₹15L+'],  posted: '1h ago' },
              { id: 4, initial: 'T', title: 'Product Manager',             company: 'Tata Group', location: 'Bangalore', tags: ['Agile', 'Research', '₹22L+'], posted: '5h ago' },
              { id: 5, initial: 'I', title: 'Strategic HR Lead',           company: 'Infosys',  location: 'Hyderabad', tags: ['Talent', 'Culture', '₹14L+'], posted: '3h ago' },
              { id: 6, initial: 'W', title: 'Business Dev Executive',      company: 'Wipro',    location: 'Remote',    tags: ['Sales', 'Growth', '₹10L+'],  posted: '6h ago' },
            ].map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-6 group relative overflow-hidden flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[rgba(255,255,255,0.05)] flex items-center justify-center border border-[rgba(255,255,255,0.08)] group-hover:bg-[#4F8EF7]/10 group-hover:border-[#4F8EF7]/20 transition-all">
                    <span className="text-lg font-bold text-text-muted group-hover:text-[#4F8EF7] transition-colors">{job.initial}</span>
                  </div>
                  <span className="badge badge-blue text-[10px] uppercase tracking-wider">Featured</span>
                </div>

                <div className="space-y-1.5 mb-5 flex-1">
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-[#4F8EF7] transition-colors line-clamp-2">{job.title}</h3>
                  <p className="text-xs text-text-muted flex items-center gap-1.5">
                    {job.company}
                    <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                    <MapPin className="w-3 h-3" /> {job.location}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {job.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-text-muted border border-[rgba(255,255,255,0.06)] bg-white/[0.03]">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <span className="text-[10px] text-text-muted">Posted {job.posted}</span>
                  <button className="flex items-center gap-1 text-xs font-medium text-text-secondary group-hover:text-[#4F8EF7] transition-colors">
                    Apply <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

