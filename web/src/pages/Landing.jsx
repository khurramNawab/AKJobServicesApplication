import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, Star, TrendingUp, Users, ArrowRight, ShieldCheck, Globe, CheckCircle2, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import HeroIllustration from '../components/HeroIllustration';
import api from '../services/api';

const Landing = () => {
  const [promoVideo, setPromoVideo] = useState(null);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('keyword', searchQuery.trim());
    if (searchLocation.trim()) params.set('location', searchLocation.trim());
    navigate(`/jobs${params.toString() ? '?' + params.toString() : ''}`);
  };

  const DUMMY_JOBS = [
    {
      _id: 'dummy1',
      title: 'Senior Software Engineer (React & Node)',
      companyName: 'Zomato',
      location: 'Gurugram, HR',
      jobType: 'Full-time',
      salaryRange: { min: 1800000, max: 3200000, currency: 'INR' },
      createdAt: new Date().toISOString(),
      description: 'Join our core food delivery engineering team to build scalable React frontends and high-performance Node microservices.'
    },
    {
      _id: 'dummy2',
      title: 'Data Analyst & Lead Biologist',
      companyName: 'Reliance Industries',
      location: 'Mumbai, MH',
      jobType: 'Full-time',
      salaryRange: { min: 1200000, max: 2200000, currency: 'INR' },
      createdAt: new Date().toISOString(),
      description: 'Analyze bio-medical data logs and design clinical testing structures for high-grade research facilities.'
    },
    {
      _id: 'dummy3',
      title: 'Cybersecurity Incident Manager',
      companyName: 'HDFC Bank',
      location: 'Bengaluru, KA',
      jobType: 'Remote',
      salaryRange: { min: 2000000, max: 3500000, currency: 'INR' },
      createdAt: new Date().toISOString(),
      description: 'Manage security orchestration, perform forensic audits, and secure banking transacting infrastructure.'
    }
  ];

  const jobsToDisplay = featuredJobs.length > 0 ? featuredJobs : DUMMY_JOBS;

  useEffect(() => {
     api.get('/platform-config').then(res => {
        if (res.data?.success && res.data.data?.promoVideo?.isActive) {
           setPromoVideo(res.data.data.promoVideo);
        }
     }).catch(() => {});

     api.get('/jobs?featured=true&limit=6').then(res => {
        if (res.data?.success) {
           setFeaturedJobs(res.data.data || []);
        }
     }).catch(() => {})
       .finally(() => setJobsLoading(false));
  }, []);

  const getEmbedUrl = (url) => {
      if (!url) return '';
      const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?controls=0&autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}`;
      const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?controls=0&autoplay=1&muted=1&loop=1`;
      return url;
  };
  return (
    <div className="w-full relative overflow-hidden bg-bg-main">
      {/* Background — toned-down orbs (max 2, opacity 0.10) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-gradient-to-b from-[var(--color-bg-surface)] via-transparent to-transparent opacity-40 dark:opacity-80" />
        <div className="glow-orb top-[-15%] left-[-10%] w-[45%] h-[45%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite', opacity: 0.08 }} />
        <div className="glow-orb bottom-[5%] right-[-8%] w-[35%] h-[35%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-4s', opacity: 0.08 }} />
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
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.06em] text-[#4F8EF7] border border-[#4F8EF7]/20 bg-[#4F8EF7]/5"
              >
                <Zap className="w-3.5 h-3.5" />
                India's Top Job Portal & Recruitment Solutions
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-text-primary"
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
                <button onClick={() => navigate('/post-job')} className="btn-power group">
                  <span className="flex items-center gap-2">
                    Post Jobs & Scale Your Team <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => navigate('/jobs')} className="px-6 py-3 rounded-[10px] border border-border-subtle bg-[var(--color-bg-surface)] text-text-secondary hover:text-text-primary hover:border-[#4F8EF7]/40 hover:bg-[rgba(0,0,0,0.02)] dark:hover:bg-white/[0.02] transition-all text-sm font-medium">
                  Explore Opportunities
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
            <form onSubmit={handleSearch}
              className="glass-island p-2 rounded-2xl flex flex-col lg:flex-row items-center gap-2 transition-all shadow-2xl"
            >
              <div className="flex-[1.5] w-full relative flex items-center">
                <Search className="absolute left-5 w-5 h-5 text-[#4F8EF7]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Role, Skill, or Company..."
                  className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-14 pr-4 py-5 text-base font-medium"
                />
              </div>

              <div className="hidden lg:block w-px h-10 bg-border-subtle" />

              <div className="flex-1 w-full relative flex items-center">
                <MapPin className="absolute left-5 w-5 h-5 text-[#F05674]" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  placeholder="Location (Remote, Mumbai...)"
                  className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-14 pr-4 py-5 text-base font-medium"
                />
              </div>

              <button type="submit" className="btn-power w-full lg:w-auto px-8 py-4 rounded-xl flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Search Jobs
              </button>
            </form>

            {/* Quick Tags */}
            <div className="flex flex-wrap justify-center items-center gap-6 mt-8">
              <span className="label-caps">Top Sectors</span>
              {['Marketing', 'Finance', 'Sales', 'Customer Success', 'Operations', 'Design'].map(tag => (
                <button key={tag} onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)} className="text-xs font-medium text-text-secondary hover:text-[#4F8EF7] transition-colors flex items-center gap-1.5 group">
                  <div className="w-1 h-1 bg-[#4F8EF7] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 border-y border-border-subtle bg-[var(--color-bg-surface)]">
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-main)] via-transparent to-[var(--color-bg-main)] pointer-events-none opacity-40 dark:opacity-85" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="label-caps">Connect with 5,000+ Verified Companies</span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-8 opacity-40 dark:opacity-30 hover:opacity-80 dark:hover:opacity-60 transition-all duration-700">
            <div className="font-black text-xl text-text-primary tracking-tighter">ZOMATO</div>
            <div className="font-black text-xl text-text-primary tracking-widest">RELIANCE</div>
            <div className="font-bold text-xl text-text-primary tracking-tight">HDFC BANK</div>
            <div className="font-black text-xl text-text-primary uppercase italic">TATA</div>
            <div className="font-black text-xl text-text-primary">INFOSYS</div>
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
              <div className={`p-2.5 rounded-xl ${stat.bg} border border-border-subtle`}>
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

      {/* Promo Video Showcase Section */}
      {promoVideo && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border-subtle text-left">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 text-[10px] font-black uppercase tracking-widest text-[#4F8EF7]">
                    Featured Media
                 </div>
                 <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter uppercase leading-tight">
                    {promoVideo.title || 'Discover AK Job Services'}
                 </h2>
                 <p className="text-text-secondary text-sm leading-relaxed font-medium">
                    Learn how our platform connects top talent with verified Indian employers. See the premium dashboard features, chat integrations, and advanced tools live in action.
                 </p>
              </div>
               {promoVideo.url ? (
                  <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-black border border-border-subtle shadow-2xl relative">
                     <iframe
                        src={getEmbedUrl(promoVideo.url)}
                        title={promoVideo.title || 'Platform Overview'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-none"
                     />
                  </div>
               ) : promoVideo.cloudinaryUrl ? (
                  <div className="w-full rounded-[2.5rem] overflow-hidden bg-black border border-white/10 shadow-2xl relative flex justify-center items-center">
                     <video
                        src={promoVideo.cloudinaryUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto max-h-[500px] object-contain"
                     />
                  </div>
               ) : null}
           </div>
        </section>
      )}

      {/* Latest Openings */}
      {/* Latest Openings */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border-subtle">
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
            <button 
              onClick={() => navigate('/jobs')}
              className="px-6 py-2.5 rounded-[10px] border border-border-subtle bg-[var(--color-bg-surface)] text-sm font-medium text-text-secondary hover:text-text-primary hover:border-[#4F8EF7]/40 transition-all whitespace-nowrap"
            >
              View All Jobs
            </button>
          </div>

          {jobsLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-xs text-text-muted uppercase tracking-widest font-black">Syncing premium postings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsToDisplay.map((job) => {
                const companyName = job.companyName || job.recruiterId?.companyName || 'Corporate Entity';
                const initial = companyName.charAt(0).toUpperCase();
                const tags = [
                  job.jobType || job.type || 'Full Time',
                  job.salaryRange?.min ? `₹${job.salaryRange.min} - ${job.salaryRange.max} ${job.salaryRange.currency || 'INR'}` : 'Confidential'
                ].filter(Boolean);

                return (
                  <motion.div
                    key={job._id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="glass-card p-6 group relative overflow-hidden flex flex-col h-full text-left"
                  >
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-11 h-11 rounded-xl bg-[var(--color-bg-surface)] flex items-center justify-center border border-border-subtle group-hover:bg-[#4F8EF7]/10 group-hover:border-[#4F8EF7]/20 transition-all">
                        <span className="text-lg font-bold text-text-muted group-hover:text-[#4F8EF7] transition-colors">{initial}</span>
                      </div>
                      <span className="badge badge-blue text-[10px] uppercase tracking-wider">Premium</span>
                    </div>

                    <div className="space-y-1.5 mb-5 flex-1">
                      <h3 className="text-base font-semibold text-text-primary group-hover:text-[#4F8EF7] transition-colors line-clamp-2">{job.title}</h3>
                      <p className="text-xs text-text-muted flex items-center gap-1.5">
                        {companyName}
                        <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                        <MapPin className="w-3 h-3" /> {job.location}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-text-muted border border-border-subtle bg-[var(--color-bg-surface)]">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                      <span className="text-[10px] text-text-muted">Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      <button 
                        onClick={() => navigate(job._id.startsWith('dummy') ? '/jobs' : `/jobs/${job._id}`)}
                        className="flex items-center gap-1 text-xs font-medium text-text-secondary group-hover:text-[#4F8EF7] transition-colors"
                      >
                        Apply <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Landing;

