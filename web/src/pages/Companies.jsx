import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, Briefcase, ExternalLink, Globe, Users, Star, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        // Filter out recruiters without company names (could be newly registered)
        setCompanies(res.data.data.filter(c => c.companyName));
      } catch (err) {
        console.error('Failed to fetch companies from /api/v1/companies:', err);
        if (err.response) {
            console.error('Backend responded with:', err.response.status, err.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (c.location || '').toLowerCase().includes(locationQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Company <span className="gradient-text">Directory</span></h1>
             <p className="text-slate-400 text-lg max-w-xl font-medium">
               Explore top-tier organizations and find your next workplace culture that fits yours.
             </p>
          </div>
          <div className="glass-card px-5 py-3 rounded-2xl border-white/5 flex items-center gap-3">
             <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Hiring: <span className="text-white">{companies.length}</span> Companies</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-2 rounded-[2rem] border-white/5 flex flex-col md:flex-row gap-2 shadow-2xl">
          <div className="flex-[1.5] relative flex items-center">
            <Search className="absolute left-6 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search company name..."
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-5 font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden md:block w-[1px] h-10 self-center bg-white/10" />
          <div className="flex-1 relative flex items-center">
            <MapPin className="absolute left-6 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Global Headquarters / Remote"
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-600 pl-16 pr-4 py-5 font-bold"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <Button variant="cta" className="md:w-48 rounded-[1.5rem] py-5">
             Explore
          </Button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
              {loading ? (
                [1,2,3,4,5,6].map(i => (
                  <div key={i} className="glass-card h-80 rounded-[3rem] border-white/5 p-10 animate-pulse">
                     <div className="w-16 h-16 bg-white/5 rounded-2xl mb-6" />
                     <div className="h-6 bg-white/5 rounded-lg w-3/4 mb-4" />
                     <div className="h-4 bg-white/5 rounded-lg w-1/2 mb-8" />
                     <div className="h-10 bg-white/5 rounded-xl w-full" />
                  </div>
                ))
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((company, i) => (
                  <motion.div
                    key={company._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-10 rounded-[3rem] border-white/5 hover:border-white/10 group transition-all duration-500 shadow-xl overflow-hidden relative flex flex-col"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none rounded-full" />
                    
                    <div className="flex justify-between items-start mb-8">
                       <div className="w-20 h-20 bg-white/5 rounded-2xl border border-white/10 p-4 group-hover:border-primary/20 transition-all flex items-center justify-center relative shadow-inner overflow-hidden">
                          {company.companyLogo ? (
                             <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain" />
                          ) : (
                             <Building2 className="w-10 h-10 text-slate-700" />
                          )}
                       </div>
                       <div className="flex gap-1">
                          {[1,2,3,4,5].map(v => <Star key={v} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                       </div>
                    </div>

                    <div className="flex-1 space-y-4">
                       <h3 className="text-2xl font-black group-hover:text-primary-light transition-colors">{company.companyName}</h3>
                       <p className="text-slate-400 font-medium text-sm line-clamp-2 italic">"{company.industry || 'Leading Industry Solutions'} — Pioneering the future through innovation and dedicated excellence in every field."</p>
                       
                       <div className="flex flex-wrap gap-4 pt-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                             <MapPin className="w-4 h-4 text-primary-light" /> {company.location || 'Remote'}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                             <Users className="w-4 h-4 text-primary-light" /> 500-1000 Crew
                          </div>
                       </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                       <Link to={`/companies/${company._id}`} className="text-sm font-black text-white hover:text-primary-light transition-colors flex items-center gap-2">
                          View Profile <ArrowRight className="w-4 h-4" />
                       </Link>
                       <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:text-primary-light transition-all">
                          <Globe className="w-5 h-5" />
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-6">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <Search className="w-10 h-10 text-slate-600" />
                   </div>
                   <h3 className="text-2xl font-bold">No companies matching your search</h3>
                   <Button variant="outline" className="w-auto px-8" onClick={() => { setSearchQuery(''); setLocationQuery(''); }}>Reset Search</Button>
                </div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Companies;
