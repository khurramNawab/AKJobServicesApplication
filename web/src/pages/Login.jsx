import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
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
      const user = await login(formData.phoneNumber, formData.password);
      if (user.isVerified) {
        navigate(user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard');
      } else {
        navigate('/verify-account', { state: { phoneNumber: formData.phoneNumber } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-24 bg-[#020617] relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Grid Pattern with Fade */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl space-y-8 bg-white/[0.02] backdrop-blur-2xl">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-white">Welcome <span className="gradient-text">Back</span></h1>
            <p className="text-text-secondary font-medium opacity-80">Log in to your account to continue</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary-soft text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary-light hover:text-white transition-colors uppercase tracking-widest">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-14 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              variant="cta"
              loading={isLoading}
              className="py-5 shadow-2xl shadow-primary/20"
            >
              Sign In <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="text-center pt-2">
            <p className="text-slate-400 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:text-primary-light font-bold transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom decorative stats */}
        <div className="mt-8 flex justify-center gap-8 grayscale opacity-30 pointer-events-none">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Secure 256-bit AES
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Real-time Sync
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
