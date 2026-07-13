import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Briefcase, User, LogOut, Menu, X, ShieldCheck, Bell, CheckCircle2, Clock, Sun, Moon } from 'lucide-react';
import api from '../services/api';
import Button from './ui/Button';
import Logo from '../assets/brand-logo.png';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = React.useRef(null);

  // 🛡️ ADMIN ISOLATION: Hide Navbar completely on all /admin routes
  if (location.pathname.startsWith('/admin')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notification panel on outside click
  useEffect(() => {
    if (!isNotificationsOpen) return;
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

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
    // Recruiter Pricing — only show when logged in as RECRUITER
    ...(user?.role === 'RECRUITER' ? [{ name: 'Pricing', path: '/pricing' }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-bg-surface/95 backdrop-blur-[12px] border-b border-[rgba(0,0,0,0.08)] shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
          : 'bg-bg-surface/70 backdrop-blur-[8px] border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <Link to="/" className="group" onClick={() => setIsMobileMenuOpen(false)}>
          <img src={Logo} alt="AK Job Services" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-200" />
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-all duration-200 relative py-1 ${
                location.pathname === link.path
                  ? 'text-[#4F8EF7]'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {link.name}
              {/* Active underline accent */}
              {location.pathname === link.path && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#4F8EF7] rounded-full" />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* 🌙 Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-text-secondary hover:text-text-primary transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 text-text-secondary hover:text-[#4F8EF7] transition-colors relative rounded-lg hover:bg-white/[0.04]"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F05674] rounded-full border border-[#050B18] animate-pulse" />
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 glass-modal rounded-2xl overflow-hidden z-[100] shadow-2xl border border-[rgba(255,255,255,0.08)]">
                      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                        <h4 className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Notifications</h4>
                        <span className="badge badge-blue text-[10px]">{unreadCount} New</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto no-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-4 border-b border-[rgba(255,255,255,0.05)] hover:bg-white/[0.03] transition-colors cursor-pointer ${!notif.isRead ? 'bg-[#4F8EF7]/[0.04]' : ''}`}
                              onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${!notif.isRead ? 'bg-[#4F8EF7]/15 border-[#4F8EF7]/20 text-[#4F8EF7]' : 'bg-white/[0.04] border-[rgba(255,255,255,0.06)] text-text-muted'}`}>
                                  {notif.type === 'APPLICATION_STATUS' ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <p className="text-xs font-semibold text-text-primary leading-tight">{notif.title}</p>
                                  <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">{notif.message}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-text-muted pt-0.5">
                                    <Clock className="w-3 h-3" /> Recently
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-10 text-center space-y-2">
                            <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center mx-auto border border-[rgba(255,255,255,0.07)]">
                              <Bell className="w-5 h-5 text-text-muted" />
                            </div>
                            <p className="text-xs font-medium text-text-muted">No new notifications</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                 <Link
                  to={user.role === 'ADMIN' ? '/admin' : user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard'}
                  className="text-sm font-medium text-text-secondary hover:text-[#4F8EF7] transition-colors"
                >
                  Dashboard
                </Link>

                <div className="w-px h-4 bg-[rgba(255,255,255,0.08)]" />

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#4F8EF7]/15 border border-[#4F8EF7]/25 flex items-center justify-center overflow-hidden">
                    {user.profilePhoto || user.companyLogo ? (
                      <img src={user.profilePhoto || user.companyLogo} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-[#4F8EF7]" />
                    )}
                  </div>
                  <Link
                    to={user.role === 'ADMIN' ? '/admin' : user.role === 'RECRUITER' ? '/recruiter-profile' : '/profile'}
                    className="text-sm text-text-primary hover:text-[#4F8EF7] font-medium hidden sm:inline transition-colors"
                  >
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-text-muted hover:text-[#F05674] transition-colors rounded-lg hover:bg-[#F05674]/[0.08]"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                  Sign in
                </Link>
                <Button size="sm" variant="primary" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-white/[0.05]"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-[rgba(255,255,255,0.06)] bg-bg-main/98 backdrop-blur-xl">
          <div className="flex flex-col px-6 py-6 space-y-6">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'text-[#4F8EF7] bg-[#4F8EF7]/[0.08]'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-px bg-[rgba(255,255,255,0.06)]" />

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-9 h-9 rounded-full bg-[#4F8EF7]/15 border border-[#4F8EF7]/25 flex items-center justify-center">
                    <User className="w-4 h-4 text-[#4F8EF7]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-text-primary">{user.name}</span>
                    <span className="text-xs text-text-muted">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link
                    to={user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                  >
                    <Briefcase className="w-4 h-4" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#F05674] hover:bg-[#F05674]/[0.08] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-medium text-text-secondary border border-[rgba(255,255,255,0.10)] rounded-[10px] hover:border-[rgba(79,142,247,0.3)] transition-colors"
                >
                  Sign in
                </Link>
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Get Started
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

