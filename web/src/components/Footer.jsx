import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Logo from '../assets/brand-logo.png';

const Footer = () => {
  const location = useLocation();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState({ type: '', message: '' });

  // 🛡️ ADMIN ISOLATION: Hide Footer on all /admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const handleSubscribe = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
        setStatus({ type: 'error', message: 'Please enter a valid email' });
        return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
        const res = await api.post('/newsletter/subscribe', { email });
        setStatus({ type: 'success', message: res.data.message });
        setEmail('');
    } catch (err) {
        setStatus({
            type: 'error',
            message: err.response?.data?.message || 'Failed to join. Try again later.'
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <footer className="bg-bg-main mt-10 border-t border-[rgba(255,255,255,0.06)] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-1 space-y-4">
            <Link to="/" className="group inline-block">
              <img src={Logo} alt="AK Job Services" className="w-20 h-20 object-contain group-hover:scale-105 transition-transform duration-200" />
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              The premium job board connecting India's top talent with the world's most innovative companies.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="label-caps mb-6">Navigation</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link to="/jobs" className="hover:text-[#4F8EF7] transition-colors">Browse Jobs</Link></li>
              <li><Link to="/companies" className="hover:text-[#4F8EF7] transition-colors">Companies</Link></li>
              <li><Link to="/salaries" className="hover:text-[#4F8EF7] transition-colors">Salaries</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#4F8EF7] transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* Corporate */}
          <div>
            <h3 className="label-caps mb-6">Company</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link to="/about" className="hover:text-[#4F8EF7] transition-colors">About Us</Link></li>
              <li><Link to="/jobs" className="hover:text-[#4F8EF7] transition-colors">Careers</Link></li>
              <li><Link to="/about" className="hover:text-[#4F8EF7] transition-colors">Press</Link></li>
              <li><Link to="/privacy" className="hover:text-[#4F8EF7] transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div
            className="rounded-2xl p-5 space-y-4 glass-card"
          >
            <h3 className="text-sm font-semibold text-text-primary">Newsletter</h3>
            <p className="text-text-secondary text-xs leading-relaxed">
              Get hand-picked jobs delivered to your inbox every morning.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  className="w-full input-field px-4 py-2.5 text-sm pr-16 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#4F8EF7] text-white text-xs font-semibold rounded-lg hover:bg-[#6BA3FF] transition-colors disabled:bg-[#475569]"
                >
                  {loading ? '...' : 'Join'}
                </button>
              </div>
              {status.message && (
                <p className={`text-xs font-medium ${status.type === 'success' ? 'text-[#34D399]' : 'text-[#F05674]'}`}>
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-muted">© {new Date().getFullYear()} AK Job Services. All rights reserved.</p>
          <div className="flex gap-6 text-xs text-text-muted">
            <Link to="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
            <Link to="/security" className="hover:text-text-secondary transition-colors">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

