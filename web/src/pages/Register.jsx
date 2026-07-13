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
        className="w-full max-w-xl z-10"
      >
        <div
          className="p-8 rounded-2xl glass-card"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-text-primary">
                    Create <span className="gradient-text">Account</span>
                  </h1>
                  <p className="text-text-secondary text-sm">Tell us who you are to get started</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Candidate Card */}
                  <button
                    onClick={() => handleRoleSelect('CANDIDATE')}
                    className={`group p-6 rounded-xl border transition-all duration-200 text-left space-y-3 hover:scale-[1.02] active:scale-[0.98] ${
                      formData.role === 'CANDIDATE'
                        ? 'bg-[#4F8EF7]/10 border-[#4F8EF7]/40'
                        : 'glass-card !border-border-subtle hover:!border-[rgba(79,142,247,0.3)] !transform-none hover:!transform-none'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      formData.role === 'CANDIDATE'
                        ? 'bg-[#4F8EF7] text-white'
                        : 'bg-[rgba(0,0,0,0.05)] text-text-muted group-hover:bg-[#4F8EF7]/10 group-hover:text-[#4F8EF7]'
                    }`}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">I'm a Job Seeker</h3>
                      <p className="text-xs text-text-secondary leading-relaxed mt-0.5">Discover opportunities and grow your career</p>
                    </div>
                  </button>

                  {/* Recruiter Card */}
                  <button
                    onClick={() => handleRoleSelect('RECRUITER')}
                    className={`group p-6 rounded-xl border transition-all duration-200 text-left space-y-3 hover:scale-[1.02] active:scale-[0.98] ${
                      formData.role === 'RECRUITER'
                        ? 'bg-[#38BDF8]/10 border-[#38BDF8]/40'
                        : 'glass-card !border-border-subtle hover:!border-[rgba(56,189,248,0.3)] !transform-none hover:!transform-none'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      formData.role === 'RECRUITER'
                        ? 'bg-[#38BDF8] text-white'
                        : 'bg-[rgba(0,0,0,0.05)] text-text-muted group-hover:bg-[#38BDF8]/10 group-hover:text-[#38BDF8]'
                    }`}>
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">I'm a Recruiter</h3>
                      <p className="text-xs text-text-secondary leading-relaxed mt-0.5">Post jobs and find the best talent</p>
                    </div>
                  </button>
                </div>

                <div className="text-center pt-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
                  <p className="text-sm text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="text-[#4F8EF7] hover:text-[#6BA3FF] font-semibold transition-colors">
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
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="p-1.5 -ml-1 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-white/[0.04]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="text-right">
                    <span className="label-caps text-[#4F8EF7]">Step 2 of 2</span>
                    <h2 className="text-lg font-semibold text-text-primary mt-0.5">Personal Details</h2>
                  </div>
                </div>

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

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="label-caps">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="What should we call you?"
                          required
                          className="input-field py-3 pl-11 pr-4 text-sm"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="label-caps">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors" />
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
                      <label className="label-caps">Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors" />
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a strong password"
                          required
                          className="input-field py-3 pl-11 pr-4 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      variant="primary"
                      loading={isLoading}
                      className="py-3"
                    >
                      Complete Registration <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                    <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                  </div>

                  <div className="flex justify-center">
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

                  <p className="text-xs text-center text-text-muted leading-relaxed max-w-xs mx-auto">
                    By registering, you agree to our{' '}
                    <Link to="/terms" className="text-text-secondary hover:text-text-primary transition-colors">Terms</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">Privacy Policy</Link>
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

