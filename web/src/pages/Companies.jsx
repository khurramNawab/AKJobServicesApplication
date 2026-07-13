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
    <div className="min-h-screen bg-bg-main pt-6 pb-32 px-6 relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#4F8EF7]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#F05674]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise.png')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary leading-tight text-left">Company <span className="gradient-text">Directory</span></h1>
            <p className="text-text-secondary text-xl max-w-xl font-medium opacity-80 leading-relaxed text-left">
              Explore top-tier corporate organizations and find your next workplace culture that fits yours.
            </p>
          </div>
          <div className="glass-island px-8 py-5 flex items-center gap-4 border-white/5 shadow-2xl">
            <Activity className="w-5 h-5 text-[#F05674] animate-pulse" />
            <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Active Hiring: <span className="text-[#4F8EF7] text-xl ml-2">{companies.length}</span> Companies</span>
          </div>
        </div>

        {/* Search Bar - Glass Island */}
        <div className="glass-island p-3 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-3 transition-all hover:border-white/10 group shadow-2xl">
          <div className="flex-[1.5] w-full relative flex items-center">
            <Search className="absolute left-8 w-6 h-6 text-[#4F8EF7]" />
            <input
              type="text"
              placeholder="Search company name..."
              className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-20 pr-6 py-8 text-xl font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="hidden md:block w-[1px] h-14 bg-white/10" />
          <div className="flex-1 w-full relative flex items-center">
            <MapPin className="absolute left-8 w-6 h-6 text-[#F05674]" />
            <input
              type="text"
              placeholder="Headquarters / Remote"
              className="w-full bg-transparent border-none outline-none text-text-primary placeholder:text-text-muted pl-20 pr-6 py-8 text-xl font-bold"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
            />
          </div>
          <button className="btn-power w-full md:w-56 !py-8 !rounded-[1.8rem] !shadow-none hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] text-lg">
            Scan Network
          </button>
        </div>

        {/* Content Area - Elite Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
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
                  whileHover={{ y: -10 }}
                  className="glass-card p-10 group transition-all duration-500 shadow-xl overflow-hidden relative flex flex-col border-white/5 hover:border-[#4F8EF7]/30"
                >
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl border border-white/10 p-4 group-hover:bg-[#4F8EF7]/10 group-hover:border-[#4F8EF7]/40 transition-all flex items-center justify-center relative shadow-inner overflow-hidden">
                      {company.companyLogo ? (
                        <img src={company.companyLogo} alt={company.companyName} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-4xl font-black text-text-primary/30 group-hover:text-text-primary transition-all">{company.companyName?.charAt(0) || 'C'}</span>
                      )}
                    </div>
                    <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {[1, 2, 3, 4, 5].map(v => <Star key={v} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />)}
                    </div>
                  </div>

                  <div className="flex-1 space-y-5">
                    <h3 className="text-2xl font-black text-text-primary tracking-tight group-hover:text-[#4F8EF7] transition-colors">{company.companyName}</h3>
                    <p className="text-text-secondary font-medium text-sm leading-relaxed opacity-60 line-clamp-3">
                      Leading {company.industry || 'Business Solutions'} organization pioneering excellence through innovation and dedicated corporate culture.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4 border-t border-border-subtle">
                      <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <MapPin className="w-4 h-4 text-[#F05674]" /> {company.location || 'India'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest">
                        <Users className="w-4 h-4 text-[#4F8EF7]" /> 500+ Active
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <Link to={`/companies/${company._id}`} className="text-sm font-black text-white hover:text-[#4F8EF7] transition-colors flex items-center gap-3 group/btn">
                      Explore Opportunities <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-[#4F8EF7]/30 transition-all text-text-muted hover:text-white">
                      <Globe className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Decorative Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#4F8EF7]/0 to-[#4F8EF7]/0 group-hover:from-[#4F8EF7]/5 group-hover:to-transparent pointer-events-none transition-all duration-500 rounded-[3.5rem]" />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center space-y-8">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-inner">
                  <Search className="w-10 h-10 text-text-muted opacity-40" />
                </div>
                <h3 className="text-3xl font-black text-text-primary tracking-tight">Organization Not Found</h3>
                <Button variant="secondary" className="px-10 py-5 rounded-2xl" onClick={() => { setSearchQuery(''); setLocationQuery(''); }}>Reset Search</Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Companies;

