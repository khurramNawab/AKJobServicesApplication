import React, { useState } from 'react';
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
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-28 pb-20 bg-bg-main relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="glow-orb top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#4F8EF7]" style={{ animationName: 'pulse-glow', animationDuration: '10s', animationIterationCount: 'infinite' }} />
        <div className="glow-orb bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#38BDF8]" style={{ animationName: 'pulse-glow', animationDuration: '12s', animationIterationCount: 'infinite', animationDelay: '-5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <div
          className="p-8 rounded-2xl text-center space-y-6"
          style={{ background: 'rgba(13,21,38,0.90)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
            className="mx-auto w-20 h-20 rounded-2xl bg-[#4F8EF7]/10 border border-[#4F8EF7]/20 flex items-center justify-center"
          >
            <Mail className="w-10 h-10 text-[#4F8EF7]" />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Check Your <span className="gradient-text">Inbox</span>
            </h1>
            <p className="text-text-secondary text-sm leading-relaxed">
              We've sent a verification link to:
            </p>
            <div className="inline-block bg-white/[0.05] border border-[rgba(255,255,255,0.08)] rounded-xl px-4 py-2">
              <span className="text-text-primary font-semibold text-sm">{email || 'your email address'}</span>
            </div>
            <p className="text-text-muted text-xs leading-relaxed pt-1">
              Click the link in the email to activate your account.{' '}
              <span className="text-[#FBBF24]">Link expires in <strong>15 minutes</strong>.</span>
            </p>
          </div>

          <div className="bg-white/[0.03] border border-[rgba(255,255,255,0.06)] rounded-xl p-4 text-left space-y-3">
            {[
              { step: '1', text: 'Open your email app' },
              { step: '2', text: 'Find the email from AK Job Services' },
              { step: '3', text: 'Click "Verify My Account" button' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-[#4F8EF7]/15 border border-[#4F8EF7]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4F8EF7] font-semibold text-xs">{step}</span>
                </div>
                <span className="text-text-secondary text-sm">{text}</span>
              </div>
            ))}
          </div>

          {resendStatus === 'sent' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-sm"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              New verification email sent! Check your inbox.
            </motion.div>
          )}

          {resendStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F05674]/10 border border-[#F05674]/20 text-[#F05674] text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {errorMsg}
            </motion.div>
          )}

          <div className="space-y-3 pt-1">
            <Button
              variant="secondary"
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
              className="flex items-center justify-center gap-1.5 w-full text-text-muted hover:text-text-secondary font-medium text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>

          <p className="text-text-muted text-xs">
            💡 Can't find it? Check your <strong className="text-text-secondary">Spam</strong> or <strong className="text-text-secondary">Promotions</strong> folder.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckEmail;

