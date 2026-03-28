import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Star, TrendingUp, Users, ArrowRight, ShieldCheck, Globe } from 'lucide-react';
import Button from '../components/ui/Button';
import HeroIllustration from '../components/HeroIllustration';

const Landing = () => {
  return (
    <div className="w-full relative overflow-hidden bg-[#020617]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full opacity-50" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-secondary/5 blur-[100px] rounded-full opacity-30" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none z-0" />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-24 px-6 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-left space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest text-primary-light"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Trusted by 500+ Global Companies
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-6xl md:text-8xl font-extrabold leading-[1.1] tracking-tight"
              >
                Hire the top <br />
                <span className="gradient-text">1% Talent</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed"
              >
                The modern job board for the next generation of builders. Connect with pioneers and lead the future of technology.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-5 pt-4"
              >
                <Button size="lg" variant="cta" className="w-auto px-10">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="w-auto px-10">
                  Post a Job
                </Button>
              </motion.div>
              
              {/* Trust Badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="flex items-center gap-8 pt-6 grayscale opacity-50"
              >
                <div className="flex items-center gap-2 font-bold text-white/40"><Globe className="w-4 h-4" /> GLOBAL</div>
                <div className="flex items-center gap-2 font-bold text-white/40"><ShieldCheck className="w-4 h-4" /> VERIFIED</div>
                <div className="flex items-center gap-2 font-bold text-white/40 font-serif italic text-lg">Fortune 500</div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="flex-1 hidden lg:block relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
              <HeroIllustration />
            </motion.div>
          </div>

          {/* Search Island */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-24 max-w-5xl mx-auto"
          >
            <div className="glass-card p-2 rounded-[2rem] flex flex-col md:flex-row gap-2 shadow-2xl border-white/5 group">
              <div className="flex-[1.5] relative flex items-center">
                <Search className="absolute left-6 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Design, Engineering, Marketing..."
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-6 text-lg font-medium"
                />
              </div>
              <div className="hidden md:block w-[1px] h-12 self-center bg-white/10" />
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-6 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Remote, NYC, London"
                  className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-6 text-lg font-medium"
                />
              </div>
              <Button size="lg" variant="primary" className="md:w-48 rounded-[1.5rem] py-6 shadow-2xl">
                Search Jobs
              </Button>
            </div>
            
            <div className="flex justify-center gap-6 mt-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Popular:</span>
              {['Remote', 'Product', 'AI', 'JavaScript'].map(tag => (
                <button key={tag} className="text-xs font-bold text-slate-400 hover:text-primary-light transition-colors">{tag}</button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: 'Active Jobs', value: '12,400+', icon: Briefcase, color: 'text-blue-400' },
              { label: 'Top Companies', value: '850+', icon: Users, color: 'text-purple-400' },
              { label: 'Candidates', value: '250k+', icon: Star, color: 'text-amber-400' },
              { label: 'Successful Hires', value: '45k+', icon: TrendingUp, color: 'text-emerald-400' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center space-y-2"
              >
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-4xl font-black text-white">{stat.value}</span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-tighter">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black">Latest <span className="text-primary-light">Openings</span></h2>
            <p className="text-slate-400 text-lg max-w-xl font-medium line-clamp-2">
              Don't miss out on your dream job. Handpicked opportunities from the world's most innovative companies.
            </p>
          </div>
          <Button variant="outline" className="w-auto">View All Jobs</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:border-primary/40 transition-colors">
                  <span className="text-2xl font-black text-white/50 group-hover:text-primary-light">{String.fromCharCode(64 + i)}</span>
                </div>
                <div className="flex gap-1">
                  <span className="px-3 py-1 bg-primary/10 text-primary-light text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">Featured</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary-light transition-colors">Senior Software Engineer</h3>
              <p className="text-slate-400 text-sm mb-6 font-medium flex items-center gap-2">
                TechVanguard Ltd <span className="w-1 h-1 bg-slate-600 rounded-full" /> Remote
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                {['React', 'Go', '₹15L+'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-slate-300 border border-white/5 group-hover:border-white/10 transition-colors">{tag}</span>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Posted 2h ago</span>
                <button className="flex items-center gap-2 text-sm font-bold text-white group/btn">
                  Apply Now <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Landing;
