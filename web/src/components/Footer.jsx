import React from 'react';
import { Briefcase, Mail, Globe, Layout, Share2, Compass } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  
  // 🛡️ ADMIN ISOLATION: Hide Footer on all /admin routes
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-bg-main mt-32 border-t border-border-subtle pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="lg:col-span-1 space-y-6">
            <Link to="/" className="group inline-block">
              <img src="/logo.png" alt="AK Job Services" className="w-20 h-20 object-contain group-hover:scale-110 transition-transform" />
            </Link>
            <p className="text-text-secondary text-sm font-medium leading-relaxed max-w-xs">
              The world's first premium job board for the next generation of builders. We connect pioneers of progress.
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Layout, label: 'Source', href: 'https://github.com' },
                { Icon: Share2, label: 'Social', href: 'https://twitter.com' },
                { Icon: Globe, label: 'Website', href: 'https://akjobservices.com' }
              ].map(({ Icon, label, href }, i) => (
                <a 
                  key={i} 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-bg-secondary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-text-primary text-xs font-black uppercase tracking-[0.2em] mb-8">Navigation</h3>
            <ul className="space-y-4 text-sm font-bold text-text-secondary">
              <li><Link to="/jobs" className="hover:text-primary-light transition-colors">Browse Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-primary-light transition-colors">Companies</Link></li>
              <li><Link to="/salaries" className="hover:text-primary-light transition-colors">Salaries</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary-light transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-text-primary text-xs font-black uppercase tracking-[0.2em] mb-8">Corporate</h3>
            <ul className="space-y-4 text-sm font-bold text-text-secondary">
              <li><Link to="/about" className="hover:text-primary-light transition-colors">About Us</Link></li>
              <li><Link to="/jobs" className="hover:text-primary-light transition-colors">Careers</Link></li>
              <li><Link to="/about" className="hover:text-primary-light transition-colors">Press</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-light transition-colors">Privacy Hub</Link></li>
            </ul>
          </div>
          
          <div className="glass shadow-2xl p-6 rounded-2xl border-border-subtle space-y-4 bg-white">
            <h3 className="text-text-primary text-sm font-black">Join our newsletter</h3>
            <p className="text-text-secondary text-xs font-medium">Get hand-picked jobs in your inbox every morning.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-xs text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary/50 transition-colors"
              />
              <button className="absolute right-2 top-2 bottom-2 px-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary-dark transition-colors">Join</button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border-subtle pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] font-black text-text-secondary/60 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} AK Job Services Inc. Crafted for Pioneers.</p>
          <div className="flex gap-8">
            <Link to="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/security" className="hover:text-slate-400">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
