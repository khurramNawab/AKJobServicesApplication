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
    <div className="min-h-[60vh] bg-bg-main pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-orb top-[-10%] left-[-5%] w-[42%] h-[42%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-5s' }} />
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
              Explore <span className="gradient-text">Opportunities</span>
            </h1>
            <p className="text-text-secondary text-sm max-w-xl leading-relaxed">
              Browse through the latest openings across 5,000+ top-tier companies in India.
            </p>
          </div>
          <div
            className="inline-flex items-center gap-3 px-5 py-3 rounded-xl glass-card"
          >
            <div className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-text-primary font-bold text-xl">{filteredJobs.length}</span>
            <span className="label-caps">Jobs Active</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-island p-2 rounded-2xl flex flex-col lg:flex-row items-center gap-2 transition-all shadow-2xl">
          <div className="flex-[1.5] w-full relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-[#4F8EF7]" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-14 pr-4 py-4 text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="hidden lg:block w-px h-8 bg-border-subtle" />

          <div className="flex-1 w-full relative flex items-center">
            <MapPin className="absolute left-5 w-5 h-5 text-[#F05674]" />
            <input
              type="text"
              placeholder="City, state, or remote"
              className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-14 pr-4 py-4 text-sm font-medium"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>

          <div className="hidden lg:block w-px h-8 bg-border-subtle" />

          <div className="w-full lg:w-auto px-5 py-4 flex items-center rounded-xl bg-bg-surface border border-border-subtle shadow-sm">
            <select
              className="bg-transparent border-none outline-none text-text-secondary text-xs font-medium cursor-pointer w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <button className="btn-power w-full lg:w-auto px-8 py-3.5 rounded-xl">
            Search
          </button>
        </div>

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card h-[280px] p-6 animate-pulse">
                  <div className="w-11 h-11 bg-white/[0.05] rounded-xl mb-5" />
                  <div className="h-5 bg-white/[0.05] rounded-lg w-3/4 mb-2.5" />
                  <div className="h-3 bg-white/[0.05] rounded-lg w-1/2 mb-5" />
                  <div className="flex gap-2 mb-5">
                    <div className="h-5 bg-white/[0.05] rounded-lg w-16" />
                    <div className="h-5 bg-white/[0.05] rounded-lg w-16" />
                  </div>
                  <div className="h-8 bg-white/[0.05] rounded-lg w-full mt-auto" />
                </div>
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card p-6 group relative flex flex-col h-full"
                >
                  {/* Featured Badge */}
                  <div className="absolute top-5 right-5">
                    <span className="badge badge-blue text-[10px] uppercase tracking-wider">
                      <Zap className="w-3 h-3 mr-1" /> Live
                    </span>
                  </div>

                  {/* Company logo */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center border border-[rgba(255,255,255,0.07)] group-hover:bg-[#4F8EF7]/10 group-hover:border-[#4F8EF7]/20 transition-all overflow-hidden flex-shrink-0">
                      {job.recruiterId?.companyLogo ? (
                        <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-base font-bold text-text-muted group-hover:text-[#4F8EF7] transition-colors">
                          {job.recruiterId?.companyName?.charAt(0) || 'J'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-text-primary group-hover:text-[#4F8EF7] transition-colors leading-snug line-clamp-2">{job.title}</h3>
                    <p className="text-xs text-text-muted flex items-center gap-1.5 flex-wrap">
                      {job.recruiterId?.companyName}
                      <span className="w-1 h-1 rounded-full bg-text-muted/40" />
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#F05674]" /> {job.location}</span>
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-text-muted border border-[rgba(255,255,255,0.06)] bg-white/[0.03]">{job.jobType}</span>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-text-muted border border-[rgba(255,255,255,0.06)] bg-white/[0.03]">{job.category}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                      <Clock className="w-3 h-3" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-3">
                      {user && user.role === 'CANDIDATE' && userApplications.some(app => {
                        const appJobId = app.jobId?._id || app.jobId;
                        return appJobId?.toString() === job._id?.toString();
                      }) && (
                        <span className="badge badge-green text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Applied
                        </span>
                      )}
                      <Link to={`/jobs/${job._id}`} className="flex items-center gap-1 text-xs font-medium text-text-secondary group-hover:text-[#4F8EF7] transition-colors">
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center space-y-6">
                <div className="w-20 h-20 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto border border-[rgba(255,255,255,0.07)]">
                  <Search className="w-8 h-8 text-text-muted" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-text-primary">No Opportunities Found</h3>
                  <p className="text-text-secondary text-sm">Try adjusting your filters or searching for something broader.</p>
                </div>
                <Button variant="secondary" onClick={() => { setSearchQuery(''); setLocationQuery(''); setSelectedCategory('All'); }}>
                  Clear All Filters
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

