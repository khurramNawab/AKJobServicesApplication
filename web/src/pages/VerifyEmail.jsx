import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, PartyPopper } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Button from '../components/ui/Button';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { verifyEmailByToken } = useContext(AuthContext);
    
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'expired'
    const [message, setMessage] = useState('Verifying your account...');
    const [userEmail, setUserEmail] = useState('');

    const hasRun = React.useRef(false);

    useEffect(() => {
        const verify = async () => {
            if (hasRun.current || !token) return;
            hasRun.current = true;

            // 1. Instant URL Cleanup: Hide token from address bar immediately
            // This replaces "/verify-email/xyz..." with "/verify-account" in the browser bar
            window.history.replaceState({}, document.title, '/verify-account');

            try {
                const data = await verifyEmailByToken(token);
                
                if (data.success) {
                    setStatus('success');
                    setMessage('Your account has been verified 🎉');
                    
                    setTimeout(() => {
                        const userRole = data.user?.role;
                        navigate(userRole === 'RECRUITER' ? '/recruiter-dashboard' : '/dashboard');
                    }, 2500);
                }
            } catch (error) {
                const errorData = error.response?.data;
                if (errorData?.expired) {
                    setStatus('expired');
                    setUserEmail(errorData.email || '');
                    setMessage(errorData.message || 'Verification link expired.');
                } else {
                    setStatus('error');
                    setMessage(errorData?.message || 'Verification failed. The link may be invalid or already used.');
                }
            }
        };

        if (token) {
            verify();
        }
    }, [token, navigate, verifyEmailByToken]);

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-bg-main relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full opacity-50" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass-card p-10 rounded-[2.5rem] border-white/5 shadow-2xl text-center space-y-8">
                    {status === 'loading' && (
                        <div className="space-y-6 py-4">
                            <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Loader2 className="w-10 h-10 text-primary-light animate-spin" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight text-white">Verifying...</h1>
                                <p className="text-slate-400 font-medium">Securing your access to the portal.</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6 py-4">
                            <motion.div 
                                initial={{ scale: 0.5, rotate: -10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="mx-auto w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </motion.div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <h1 className="text-2xl font-black tracking-tight text-white">Account Verified!</h1>
                                    <PartyPopper className="w-6 h-6 text-yellow-400" />
                                </div>
                                <p className="text-emerald-400/80 font-bold">{message}</p>
                                <p className="text-slate-400 text-sm">Redirecting to your command center...</p>
                            </div>
                        </div>
                    )}

                    {(status === 'error' || status === 'expired') && (
                        <div className="space-y-6">
                            <div className="mx-auto w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                                <AlertCircle className="w-10 h-10 text-secondary-soft" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight text-white">
                                    {status === 'expired' ? 'Link Expired' : 'Verification Failed'}
                                </h1>
                                <p className="text-secondary-soft font-bold">{message}</p>
                            </div>
                            <div className="pt-4 flex flex-col gap-3">
                                <Button 
                                    variant="cta" 
                                    onClick={() => navigate('/check-email', { state: { email: userEmail } })}
                                >
                                    Resend Verification Link
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => navigate('/login')}
                                >
                                    Back to Login
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyEmail;
