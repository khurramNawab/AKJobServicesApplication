import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useContext(AuthContext);
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      navigate(user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard');
    } catch (err) {
      if (err.needsVerification) {
        navigate('/check-email', { state: { email: err.email } });
      } else {
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-28 pb-20 bg-bg-main relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-orb top-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div
          className="p-8 rounded-2xl space-y-6"
          style={theme === 'light'
            ? { background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.10)', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }
            : { background: 'rgba(13,21,38,0.90)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }
          }
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p className="text-text-secondary text-sm">Log in to your account to continue</p>
          </div>

          {location.state?.message && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-sm"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {location.state.message}
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F05674]/10 border border-[#F05674]/20 text-[#F05674] text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="label-caps">Email Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                    className="input-field py-3 pl-11 pr-4 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="label-caps">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-[#4F8EF7] hover:text-[#6BA3FF] transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    required
                    className="input-field py-3 pl-11 pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={isLoading}
              className="py-3"
            >
              Sign In <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
            <div className="flex-1 h-px" style={{ background: theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)' }} />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setError('');
                setIsLoading(true);
                try {
                  const data = await googleLogin(credentialResponse.credential);
                  const user = data.user || data.data || data;
                  // Auto-verified for Google users as well
                  navigate(user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard');
                } catch (err) {
                  setError(err.message || 'Google Login failed');
                } finally {
                  setIsLoading(false);
                }
              }}
              onError={() => setError('Google Login Failed')}
              theme={theme === 'light' ? 'outline' : 'filled_black'}
              shape="circle"
              size="large"
              text="continue_with"
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#4F8EF7] hover:text-[#6BA3FF] font-semibold transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex justify-center gap-8 opacity-25 pointer-events-none">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" /> 256-bit AES
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]" /> Real-time Sync
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

