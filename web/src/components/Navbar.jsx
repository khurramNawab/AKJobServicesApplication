import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Briefcase, User, LogOut, Menu, X, ShieldCheck, Bell, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 🛡️ ADMIN ISOLATION: Hide Navbar completely on all /admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          setNotifications(res.data.data || []);
          setUnreadCount(res.data.data?.filter(n => !n.isRead).length || 0);
        } catch (err) {
          console.error('Failed to fetch notifications:', err);
        }
      };
      fetchNotifications();
      // Optional: Poll for notifications every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Browse Jobs', path: '/jobs' },
    { name: 'Companies', path: '/companies' },
    { name: 'Salaries', path: '/salaries' },
    { name: 'About Us', path: '/about' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 ${
      isHomePage
        ? (isScrolled || isMobileMenuOpen ? 'bg-[#020617] shadow-lg py-0' : 'bg-[#020617] py-0')
        : (isScrolled || isMobileMenuOpen ? 'glass py-0' : 'bg-transparent py-0')
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="group" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/logo.png" alt="AK Job Services" className="w-24 h-24 object-contain group-hover:scale-110 transition-transform" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-text-secondary hover:text-primary'
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
                {/* Notification Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-text-secondary hover:text-primary transition-colors relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-[#020617] animate-pulse" />
                    )}
                  </button>
                  
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-4 w-80 glass border-white/5 shadow-2xl rounded-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Security Alerts</h4>
                        <span className="text-[9px] font-bold text-text-muted">{unreadCount} New</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              className={`p-4 border-b border-white/5 hover:bg-white/[0.05] transition-colors cursor-pointer group ${!notif.isRead ? 'bg-[#2563EB]/5' : ''}`}
                              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/5 ${!notif.isRead ? 'bg-[#2563EB]/20 text-[#2563EB]' : 'bg-white/5 text-text-muted'}`}>
                                  {notif.type === 'APPLICATION_STATUS' ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[11px] font-black text-white leading-tight">{notif.title}</p>
                                  <p className="text-[10px] font-medium text-text-secondary leading-snug opacity-80">{notif.message}</p>
                                  <div className="flex items-center gap-1.5 text-[8px] font-black text-text-muted uppercase tracking-widest pt-1">
                                    <Clock className="w-2.5 h-2.5" /> {new Date(notif.createdAt).toLocaleLowerCase().includes('pm') || new Date(notif.createdAt).toLocaleLowerCase().includes('am') ? 'Recently' : 'Sync Active'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center space-y-3">
                             <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto border border-white/10 opacity-30">
                               <Bell className="w-6 h-6 text-text-muted" />
                             </div>
                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Zero Signal Alerts</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard'}
                  className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <div className="h-4 w-[1px] bg-border-subtle" />
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
                    className="text-sm text-text-primary hover:text-primary font-medium hidden sm:inline transition-colors"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-text-secondary hover:text-secondary transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-primary transition-colors">
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
            className="md:hidden p-2 text-text-primary hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-border-subtle animate-in slide-in-from-top duration-300 overflow-hidden bg-bg-card/95">
          <div className="flex flex-col p-6 space-y-6">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-lg font-medium transition-colors ${location.pathname === link.path ? 'text-primary' : 'text-text-secondary'
                    }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-[1px] bg-border-subtle w-full" />

            {user ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-light" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-text-primary">{user.name}</span>
                    <span className="text-xs text-text-secondary">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <Link
                    to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-text-secondary font-medium"
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
                  className="w-full py-4 text-center font-bold text-text-secondary border border-border-subtle rounded-2xl"
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
