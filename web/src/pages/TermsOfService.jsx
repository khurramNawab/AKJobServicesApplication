import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-20 w-full relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#4F8EF7]/5 blur-[100px] rounded-full -z-10" />
      
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-5 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 rounded-[2.5rem]"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7 text-[#4F8EF7]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Terms of <span className="text-[#4F8EF7]">Service</span></h1>
            <p className="text-text-muted text-sm font-medium">Last updated: June 2026</p>
          </div>
        </div>

        <div className="max-w-none text-text-secondary leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using this job portal, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials on our portal for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-[#4F8EF7]">
              <li>Modify or copy the materials.</li>
              <li>Use the materials for any commercial purpose or public display.</li>
              <li>Attempt to decompile or reverse engineer any software contained on the portal.</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">3. User Accounts</h2>
            <p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">4. Job Postings and Applications</h2>
            <p>We do not guarantee the validity of any job posting or the suitability of any candidate. Users are responsible for their own due diligence before entering into any employment relationship.</p>
          </section>

          <section className="p-6 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)]">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#4F8EF7]" />
              5. Governing Law
            </h2>
            <p className="text-text-secondary italic">These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
