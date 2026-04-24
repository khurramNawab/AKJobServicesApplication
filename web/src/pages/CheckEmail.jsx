import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import api from '../services/api';

const CheckEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;

    setResendStatus('loading');
    setErrorMsg('');

    try {
      await api.post('/auth/resend-verification', { email });
      setResendStatus('sent');

      // 60 second cooldown before allowing another resend
      let timer = 60;
      setCooldown(timer);
      const interval = setInterval(() => {
        timer -= 1;
        setCooldown(timer);
        if (timer <= 0) {
          clearInterval(interval);
          setResendStatus('idle');
        }
      }, 1000);
    } catch (err) {
      setResendStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to resend. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#020617] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[70%] h-[70%] bg-[#2563EB]/8 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] bg-[#1e40af]/6 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-2xl text-center space-y-8">

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.7, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mx-auto w-24 h-24 rounded-3xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center"
          >
            <Mail className="w-12 h-12 text-[#2563EB]" />
          </motion.div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Check Your <span className="gradient-text">Inbox</span>
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              We've sent a verification link to:
            </p>
            <div className="inline-block bg-white/5 border border-white/10 rounded-2xl px-5 py-2.5">
              <span className="text-white font-bold text-sm">{email || 'your email address'}</span>
            </div>
            <p className="text-slate-500 text-sm font-medium pt-1">
              Click the link in the email to activate your account.
              <br />
              <span className="text-amber-400/80">The link expires in <strong>15 minutes</strong>.</span>
            </p>
          </div>

          {/* Steps */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-left space-y-3">
            {[
              { step: '1', text: 'Open your email app' },
              { step: '2', text: 'Find the email from AK Job Services' },
              { step: '3', text: 'Click "Verify My Account" button' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#60a5fa] font-black text-xs">{step}</span>
                </div>
                <span className="text-slate-300 font-medium text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Feedback messages */}
          {resendStatus === 'sent' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              New verification email sent! Check your inbox.
            </motion.div>
          )}

          {resendStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMsg}
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              variant="outline"
              onClick={handleResend}
              loading={resendStatus === 'loading'}
              disabled={cooldown > 0 || resendStatus === 'loading'}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${resendStatus === 'loading' ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Didn't receive it? Resend"}
            </Button>

            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-white font-bold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>

          {/* Spam tip */}
          <p className="text-slate-600 text-xs font-medium">
            💡 Can't find it? Check your <strong className="text-slate-500">Spam</strong> or <strong className="text-slate-500">Promotions</strong> folder.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckEmail;
