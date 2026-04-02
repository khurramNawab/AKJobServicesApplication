import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, IndianRupee, Filter, SlidersHorizontal, ChevronRight, Bookmark, Clock, X, Zap, Star, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Operations', 'Finance', 'Marketing', 'Sales', 'Customer Success', 'Technology', 'Healthcare', 'Engineering'];

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        setJobs(res.data.data);
        setFilteredJobs(res.data.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  useEffect(() => {
    let result = jobs;

    if (searchQuery) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        job.recruiterId?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (locationQuery) {
      result = result.filter(job => 
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(job => job.category === selectedCategory);
    }

    setFilteredJobs(result);
  }, [searchQuery, locationQuery, selectedCategory, jobs]);

  return (
    <div className="min-h-screen bg-[#020617] pt-40 pb-32 px-6 relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">Explore <span className="gradient-text">Opportunities</span></h1>
            <p className="text-text-secondary text-xl max-w-xl font-medium opacity-80 leading-relaxed">
              Browse through the latest openings across 5,000+ top-tier corporate companies in India.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="glass-island px-6 py-4 flex items-center gap-3 border-white/5 shadow-2xl">
                <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span className="text-white font-black text-2xl tracking-tight">{filteredJobs.length}</span>
                <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Jobs Active</span>
             </div>
          </div>
        </div>

        {/* Search & Filter Bar - Refined Elite Style */}
        <div className="glass-island p-3 rounded-[2.5rem] flex flex-col lg:flex-row items-center gap-3 transition-all hover:border-white/10 group shadow-2xl">
          <div className="flex-[1.5] w-full relative flex items-center">
            <Search className="absolute left-8 w-6 h-6 text-[#2563EB]" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-muted pl-20 pr-6 py-8 text-xl font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="hidden lg:block w-[1px] h-14 bg-white/10" />
          
          <div className="flex-1 w-full relative flex items-center">
            <MapPin className="absolute left-8 w-6 h-6 text-[#EF4444]" />
            <input
              type="text"
              placeholder="City, state, or remote"
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-muted pl-20 pr-6 py-8 text-xl font-bold"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>

          <div className="hidden lg:block w-[1px] h-14 bg-white/10" />
          
          <div className="w-full lg:w-auto px-10 py-8 flex items-center bg-white/5 rounded-2xl group-hover:bg-white/10 transition-all border border-transparent group-hover:border-white/5">
            <select
              className="bg-transparent border-none outline-none text-white font-black text-xs uppercase tracking-widest cursor-pointer w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat} className="bg-[#020617]">{cat}</option>)}
            </select>
          </div>
          
          <button className="btn-power w-full lg:w-48 !py-8 !rounded-[1.8rem] !shadow-none hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            Search Jobs
          </button>
        </div>

        {/* Content Area - Elite Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Enhanced Skeleton Loading
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card h-[400px] border-white/5 p-10 animate-pulse">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl mb-8" />
                  <div className="h-8 bg-white/5 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-white/5 rounded-lg w-1/2 mb-10" />
                  <div className="flex gap-3 mb-10">
                    <div className="h-8 bg-white/5 rounded-lg w-24" />
                    <div className="h-8 bg-white/5 rounded-lg w-24" />
                  </div>
                  <div className="h-10 bg-white/5 rounded-xl w-full mt-auto" />
                </div>
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  className="glass-card p-10 group relative flex flex-col h-full border-white/5 hover:border-[#2563EB]/30 transition-all shadow-xl"
                >
                  {/* Featured Badge */}
                  <div className="absolute top-10 right-10 flex items-center gap-1.5 px-3 py-1 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-full text-[9px] font-black text-[#2563EB] uppercase tracking-widest">
                    <Zap className="w-2.5 h-2.5" />
                    Featured
                  </div>
                  
                  <div className="flex items-start gap-6 mb-10">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/40 transition-all shadow-inner overflow-hidden">
                      {job.recruiterId?.companyLogo ? (
                        <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-white/40 group-hover:text-white transition-colors">
                          {job.recruiterId?.companyName?.charAt(0) || 'J'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-[#2563EB] transition-colors leading-snug line-clamp-2">{job.title}</h3>
                    <p className="text-text-secondary font-bold text-sm opacity-60 flex items-center gap-2">
                       {job.recruiterId?.companyName}
                       <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                       <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/50 border border-white/5 group-hover:border-white/20 transition-all uppercase tracking-tighter">{job.jobType}</span>
                      <span className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black text-white/50 border border-white/5 group-hover:border-white/20 transition-all uppercase tracking-tighter">{job.category}</span>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                       <Clock className="w-4 h-4" /> 
                       Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <Link to={`/jobs/${job._id}`} className="flex items-center gap-2 text-sm font-black text-white group/btn hover:text-[#2563EB] transition-colors">
                      View Details <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Decorative Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/0 to-[#2563EB]/0 group-hover:from-[#2563EB]/5 group-hover:to-transparent pointer-events-none transition-all duration-500 rounded-[2.5rem]" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center space-y-8">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                  <Search className="w-10 h-10 text-text-muted opacity-40" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-3xl font-black text-white tracking-tight">No Opportunities Found</h3>
                  <p className="text-text-secondary text-lg font-medium opacity-60">Try adjusting your filters or searching for something broader.</p>
                </div>
                <Button variant="secondary" className="px-10 py-5 rounded-2xl" onClick={() => { setSearchQuery(''); setLocationQuery(''); setSelectedCategory('All'); }}>
                  Clear All Search Filters
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default JobsList;

