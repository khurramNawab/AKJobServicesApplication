import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ShieldCheck, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, RefreshCw, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    otp: ['', '', '', '', '', ''],
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (step === 2 && timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...formData.otp];
    newOtp[index] = element.value;
    setFormData({ ...formData, otp: newOtp });
    
    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password/send-otp', { email: formData.email });
      setStep(2);
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Check your email or phone number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    const otpValue = formData.otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password/verify', {
        email: formData.email,
        otp: otpValue,
        newPassword: formData.newPassword
      });
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
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
          className="p-8 rounded-2xl"
          style={{ background: 'rgba(13,21,38,0.90)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        >
          
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center border border-[#4F8EF7]/15">
                    <Lock className="w-7 h-7 text-[#4F8EF7]" />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">Forgot <span className="gradient-text">Password?</span></h1>
                    <p className="text-text-secondary text-sm">Don't worry, it happens to the best of us.</p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F05674]/10 border border-[#F05674]/20 text-[#F05674] text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="label-caps">Registered Email</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors">
                        <Mail size={15} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                        className="input-field py-3 pl-11 pr-4 text-sm"
                      />
                    </div>
                  </div>

                  <Button type="submit" size="lg" variant="primary" loading={isLoading} className="py-3">
                    Send Reset Code <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </form>

                <div className="text-center">
                  <Link to="/login" className="flex items-center justify-center gap-1.5 text-text-muted hover:text-text-secondary transition-colors text-xs">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </Link>
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
                <div className="text-center space-y-4">
                  <div className="mx-auto w-14 h-14 rounded-xl bg-[#34D399]/10 flex items-center justify-center border border-[#34D399]/15">
                    <ShieldCheck className="w-7 h-7 text-[#34D399]" />
                  </div>
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">Set <span className="gradient-text">New Password</span></h1>
                    <p className="text-text-secondary text-sm">Enter the code sent to {formData.email}</p>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F05674]/10 border border-[#F05674]/20 text-[#F05674] text-sm"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </motion.div>
                )}

                <form onSubmit={handleVerifyAndReset} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="label-caps text-center block">6-Digit Code</label>
                      <div className="flex justify-between gap-2">
                        {formData.otp.map((data, index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            className="w-full aspect-square input-field text-center text-xl font-bold"
                            value={data}
                            onChange={(e) => handleOtpChange(e.target, index)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="label-caps">New Password</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-[#4F8EF7] transition-colors" />
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder="Min. 8 characters"
                          required
                          className="input-field py-3 pl-11 pr-4 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" size="lg" variant="primary" loading={isLoading} className="py-3">
                    Reset Password <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={!canResend || isLoading}
                      className={`text-xs flex items-center justify-center gap-1.5 mx-auto font-medium transition-colors ${
                        canResend ? 'text-[#4F8EF7] hover:text-[#6BA3FF]' : 'text-text-muted cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isLoading && 'animate-spin'}`} />
                      {canResend ? 'Resend Verification Code' : `Resend in ${timer}s`}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;

