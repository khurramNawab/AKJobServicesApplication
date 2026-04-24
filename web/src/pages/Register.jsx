import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, Lock, UserCheck, Briefcase, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';

const Register = () => {
  const navigate = useNavigate();
  const { register, googleLogin } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '', // CANDIDATE or RECRUITER
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.role) {
      setError('Please select a role first.');
      setStep(1);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      // Redirect to "check your email" page — NOT login
      navigate('/check-email', { state: { email: formData.email } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-24 bg-[#020617] relative overflow-hidden">
      {/* 🌌 Advanced Background System */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2563EB]/10 blur-[120px] rounded-full animate-glow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#EF4444]/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '-5s' }} />
      </div>

      {/* Background layer simplified - removed dead noise.svg URL */}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl z-10"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-2xl">

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-10"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-4xl font-black tracking-tight text-white">Create <span className="gradient-text">Account</span></h1>
                  <p className="text-text-secondary font-medium opacity-80">To get started, please tell us who you are</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button
                    onClick={() => handleRoleSelect('CANDIDATE')}
                    className={`group p-8 rounded-3xl border transition-all duration-300 text-left space-y-4 hover:scale-[1.02] active:scale-95 ${formData.role === 'CANDIDATE'
                        ? 'bg-[#2563EB]/10 border-[#2563EB] shadow-lg shadow-[#2563EB]/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.role === 'CANDIDATE' ? 'bg-[#2563EB] text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'
                      }`}>
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">I'm a Job Seeker</h3>
                      <p className="text-sm text-text-secondary font-medium opacity-60">Discover opportunities and grow your career</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('RECRUITER')}
                    className={`group p-8 rounded-3xl border transition-all duration-300 text-left space-y-4 hover:scale-[1.02] active:scale-95 ${formData.role === 'RECRUITER'
                        ? 'bg-[#EF4444]/10 border-[#EF4444] shadow-lg shadow-[#EF4444]/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${formData.role === 'RECRUITER' ? 'bg-[#EF4444] text-white' : 'bg-white/5 text-slate-400 group-hover:text-white'
                      }`}>
                      <Briefcase className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">I'm a Recruiter</h3>
                      <p className="text-sm text-text-secondary font-medium opacity-60">Post jobs and find the best talent</p>
                    </div>
                  </button>
                </div>

                <div className="text-center pt-4 border-t border-white/5">
                  <p className="text-slate-400 font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white hover:text-primary-light font-bold transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="p-2 -ml-2 text-slate-500 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-primary-light uppercase tracking-[0.2em]">Step 02/02</span>
                    <h2 className="text-xl font-bold text-white">Personal Details</h2>
                  </div>
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

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="What should we call you?"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Your email address"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      size="lg"
                      variant="cta"
                      loading={isLoading}
                      className="py-5 shadow-2xl shadow-primary/20"
                    >
                      Complete Registration <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 py-1">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>
                  
                  <div className="flex justify-center pb-2">
                    <GoogleLogin 
                      onSuccess={async (credentialResponse) => {
                        setError('');
                        setIsLoading(true);
                        try {
                          const data = await googleLogin(credentialResponse.credential);
                          const user = data.user || data.data || data;
                          navigate(user.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard');
                        } catch (err) {
                          setError(err.message || 'Google Registration failed');
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      onError={() => setError('Google Signup Failed')}
                      theme="filled_black"
                      shape="circle"
                      size="large"
                      text="signup_with"
                    />
                  </div>

                  <p className="text-[11px] text-center text-slate-500 leading-relaxed max-w-xs mx-auto">
                    By clicking register, you agree to our <Link to="/terms" className="text-slate-300 hover:text-white transition-colors">Terms of Service</Link> and <Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</Link>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
