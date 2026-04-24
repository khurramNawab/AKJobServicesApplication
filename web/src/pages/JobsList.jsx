import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, IndianRupee, Filter, SlidersHorizontal, ChevronRight, Bookmark, Clock, X, Zap, Star, TrendingUp, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const JobsList = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Operations', 'Finance', 'Marketing', 'Sales', 'Customer Success', 'Technology', 'Healthcare', 'Engineering'];

  // Debouncing logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocation(locationQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs'),
          user && user.role === 'CANDIDATE' ? api.get('/applications/me') : Promise.resolve({ data: { data: [] } })
        ]);
        
        setJobs(jobsRes.data.data);
        const apps = appsRes.data.data || [];
        setUserApplications(apps);
        console.log('User applications loaded:', apps.length);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (debouncedSearch) {
      result = result.filter(job => 
        job.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
        job.recruiterId?.companyName?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (debouncedLocation) {
      result = result.filter(job => 
        job.location.toLowerCase().includes(debouncedLocation.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(job => job.category === selectedCategory);
    }

    return result;
  }, [debouncedSearch, debouncedLocation, selectedCategory, jobs]);

  return (
    <div className="min-h-[60vh] bg-[#020617] pt-24 pb-6 px-6 relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">Explore <span className="gradient-text">Opportunities</span></h1>
            <p className="text-text-secondary text-base max-w-xl font-medium opacity-80 leading-relaxed">
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
                <div key={i} className="glass-card h-[300px] border-white/5 p-6 rounded-xl animate-pulse">
                  <div className="w-12 h-12 bg-white/5 rounded-xl mb-6" />
                  <div className="h-6 bg-white/5 rounded-lg w-3/4 mb-3" />
                  <div className="h-3 bg-white/5 rounded-lg w-1/2 mb-6" />
                  <div className="flex gap-2 mb-6">
                    <div className="h-6 bg-white/5 rounded-lg w-16" />
                    <div className="h-6 bg-white/5 rounded-lg w-16" />
                  </div>
                  <div className="h-8 bg-white/5 rounded-lg w-full mt-auto" />
                </div>
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -10 }}
                  className="glass-card p-6 group relative flex flex-col h-full border-white/5 hover:border-[#2563EB]/30 transition-all shadow-xl rounded-xl"
                >
                  {/* Featured Badge */}
                  <div className="absolute top-10 right-10 flex items-center gap-1.5 px-3 py-1 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-full text-[9px] font-black text-[#2563EB] uppercase tracking-widest">
                    <Zap className="w-2.5 h-2.5" />
                    Featured
                  </div>
                  
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#2563EB]/10 group-hover:border-[#2563EB]/40 transition-all shadow-inner overflow-hidden">
                      {job.recruiterId?.companyLogo ? (
                        <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-xl font-black text-white/40 group-hover:text-white transition-colors">
                          {job.recruiterId?.companyName?.charAt(0) || 'J'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-black text-white tracking-tight group-hover:text-[#2563EB] transition-colors leading-tight line-clamp-2">{job.title}</h3>
                    <p className="text-text-secondary font-bold text-xs opacity-80 flex items-center gap-1.5">
                       {job.recruiterId?.companyName}
                       <span className="w-1 h-1 bg-white/20 rounded-full" />
                       <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#EF4444]" /> {job.location}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-black text-white/50 border border-white/5 group-hover:border-white/20 transition-all uppercase tracking-tighter">{job.jobType}</span>
                      <span className="px-3 py-1 bg-white/5 rounded-md text-[9px] font-black text-white/50 border border-white/5 group-hover:border-white/20 transition-all uppercase tracking-tighter">{job.category}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[9px] font-black text-text-muted uppercase tracking-widest">
                       <Clock className="w-3 h-3" /> 
                       Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-4">
                      {user && user.role === 'CANDIDATE' && userApplications.some(app => {
                        const appJobId = app.jobId?._id || app.jobId;
                        return appJobId?.toString() === job._id?.toString();
                      }) && (
                        <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Applied
                        </span>
                      )}
                      <Link to={`/jobs/${job._id}`} className="flex items-center gap-1 text-xs font-black text-white group/btn hover:text-[#2563EB] transition-colors">
                        View <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
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

