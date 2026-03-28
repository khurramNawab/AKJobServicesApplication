import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, IndianRupee, Filter, SlidersHorizontal, ChevronRight, Bookmark, Clock, X } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const JobsList = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = ['All', 'Technology', 'Design', 'Marketing', 'Sales', 'Finance', 'Healthcare', 'Engineering'];

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Explore <span className="gradient-text">Opportunities</span></h1>
            <p className="text-slate-400 text-lg max-w-xl font-medium">
              Browse through the latest job openings from top-tier companies across the globe.
            </p>
          </div>
          <div className="flex gap-3">
             <div className="glass-card px-4 py-2 rounded-xl border-white/5 flex items-center gap-2">
                <span className="text-primary-light font-bold">{filteredJobs.length}</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Jobs Found</span>
             </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-card p-2 rounded-[2rem] border-white/5 flex flex-col lg:flex-row gap-2 shadow-2xl">
          <div className="flex-[1.5] relative flex items-center">
            <Search className="absolute left-6 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Job title, keywords, or company..."
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-5 text-lg font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden lg:block w-[1px] h-10 self-center bg-white/10" />
          <div className="flex-1 relative flex items-center">
            <MapPin className="absolute left-6 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="City, state, or remote"
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-5 text-lg font-medium"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <div className="hidden lg:block w-[1px] h-10 self-center bg-white/10" />
          <div className="flex items-center px-4">
            <select
              className="bg-transparent border-none outline-none text-slate-300 font-bold text-sm cursor-pointer hover:text-white transition-colors py-5"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat} className="bg-[#0f172a]">{cat}</option>)}
            </select>
          </div>
          <Button variant="cta" className="lg:w-48 rounded-[1.5rem] py-5">
            Search Jobs
          </Button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              // Skeletong Loading
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="glass-card h-80 rounded-[2.5rem] border-white/5 p-8 animate-pulse">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl mb-6" />
                  <div className="h-6 bg-white/5 rounded-lg w-3/4 mb-4" />
                  <div className="h-4 bg-white/5 rounded-lg w-1/2 mb-8" />
                  <div className="flex gap-2 mb-8">
                    <div className="h-6 bg-white/5 rounded-lg w-16" />
                    <div className="h-6 bg-white/5 rounded-lg w-16" />
                  </div>
                  <div className="h-10 bg-white/5 rounded-xl w-full" />
                </div>
              ))
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <motion.div
                  key={job._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                  className="glass-card p-8 rounded-[2.5rem] border-white/5 hover:border-white/10 group relative flex flex-col h-full shadow-xl transition-all duration-500 hover:shadow-primary/5 hover:-translate-y-1"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none rounded-full" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:border-primary/40 transition-colors overflow-hidden">
                      {job.recruiterId?.companyLogo ? (
                        <img src={job.recruiterId.companyLogo} alt={job.recruiterId.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-black text-white/50 group-hover:text-primary-light">
                          {job.recruiterId?.companyName?.charAt(0) || <Briefcase />}
                        </span>
                      )}
                    </div>
                    <button className="p-3 bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-white transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-3">
                    <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary-light transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-slate-400 font-bold text-sm flex items-center gap-2">
                      {job.recruiterId?.companyName}
                      <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-2 pt-4">
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-slate-300 border border-white/5 group-hover:border-white/10 transition-colors uppercase tracking-wider">{job.jobType}</span>
                      <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-bold text-slate-300 border border-white/5 group-hover:border-white/10 transition-colors uppercase tracking-wider">{job.experienceLevel}</span>
                      <span className="px-3 py-1 bg-primary/10 rounded-lg text-xs font-bold text-primary-light border border-primary/20">
                        {job.salaryRange ? `${job.salaryRange.min || 0}-${job.salaryRange.max || 0} ${job.salaryRange.currency || 'USD'}` : 'Not Specified'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                       <Clock className="w-4 h-4" /> 
                       {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <Link to={`/jobs/${job._id}`} className="flex items-center gap-2 text-sm font-black text-white group/btn">
                      View Details <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">No jobs found</h3>
                  <p className="text-slate-500 font-medium">Try adjusting your filters or search terms.</p>
                </div>
                <Button variant="outline" className="w-auto px-8" onClick={() => { setSearchQuery(''); setLocationQuery(''); setSelectedCategory('All'); }}>
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
