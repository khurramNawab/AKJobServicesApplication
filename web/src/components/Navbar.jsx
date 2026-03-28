import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, User, LogOut, Menu, X } from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Browse Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Salaries', path: '/salaries' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 ${isScrolled || isMobileMenuOpen ? 'glass py-0' : 'bg-transparent py-0'
      }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="group" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/logo.png" alt="AK Job Services" className="w-20 h-20 object-contain group-hover:scale-110 transition-transform" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary-light' : 'text-slate-400 hover:text-white'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-5">
                <Link
                  to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard'}
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
                    {user.profilePhoto || user.companyLogo ? (
                      <img src={user.profilePhoto || user.companyLogo} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-primary-light" />
                    )}
                  </div>
                  <Link 
                    to={user.role === 'RECRUITER' ? '/recruiter-profile' : '/profile'} 
                    className="text-sm text-slate-200 hover:text-white font-medium hidden sm:inline transition-colors"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-secondary transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Button size="sm" variant="cta" onClick={() => navigate('/register')}>
                  Sign up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-200 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-in slide-in-from-top duration-300 overflow-hidden">
          <div className="flex flex-col p-6 space-y-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium transition-colors ${location.pathname === link.path ? 'text-primary-light' : 'text-slate-400'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-[1px] bg-white/5 w-full" />

            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Link
                    to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-slate-300 font-medium"
                  >
                    <Briefcase className="w-5 h-5" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-secondary font-medium"
                  >
                    <LogOut className="w-5 h-5" /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-4 text-center font-bold text-slate-300 border border-white/5 rounded-2xl"
                >
                  Sign in
                </Link>
                <Button
                  size="lg"
                  variant="cta"
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Create Account
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
