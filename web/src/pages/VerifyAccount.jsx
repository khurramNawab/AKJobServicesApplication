import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';
import api from '../services/api';

const VerifyAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyAccount, user } = useContext(AuthContext);
  
  const [phoneNumber, setPhoneNumber] = useState(location.state?.phoneNumber || user?.phoneNumber || '');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password/send-otp', { phoneNumber });
      setSuccess('Verification code resent successfully!');
      setTimer(60);
      setCanResend(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await verifyAccount(phoneNumber, otpValue);
      setSuccess('Verification successful! Redirecting...');
      setTimeout(() => {
        navigate(user?.role === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-32 pb-20 bg-bg-main relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full opacity-50" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl space-y-10">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-10 h-10 text-primary-light" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Verify <span className="gradient-text">Account</span></h1>
              <p className="text-slate-400 font-medium">
                Enter the 6-digit code sent to <br />
                <span className="text-white font-bold">{phoneNumber}</span>
              </p>
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-16 bg-white/5 border border-white/10 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all transition-duration-300"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                />
              ))}
            </div>

            <div className="space-y-6">
              <Button
                type="submit"
                size="lg"
                variant="cta"
                loading={isLoading}
                className="py-5 shadow-2xl shadow-primary/20"
              >
                Verify Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isLoading}
                  className={`text-sm flex items-center justify-center gap-2 mx-auto font-bold transition-colors ${
                    canResend ? 'text-primary-light hover:text-white' : 'text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading && 'animate-spin'}`} />
                  {canResend ? 'Resend Verification Code' : `Resend in ${timer}s`}
                </button>
              </div>
            </div>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white font-bold transition-colors text-sm"
            >
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyAccount;
