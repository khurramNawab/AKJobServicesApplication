import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyInfo = () => {
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
          <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Privacy <span className="text-indigo-400">Policy</span></h1>
            <p className="text-text-muted text-sm font-medium">Last updated: June 2026</p>
          </div>
        </div>

        <div className="max-w-none text-text-secondary leading-relaxed space-y-8">
          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" />
              1. Information We Collect
            </h2>
            <p>We collect personal information that you voluntarily provide to us when you register on the portal, express an interest in obtaining information about us or our products and services, when you participate in activities on the portal or otherwise when you contact us.</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-indigo-400">
              <li>Personal Data: Name, email address, phone number.</li>
              <li>Professional Data: Resume, work experience, education history.</li>
              <li>Usage Data: IP address, browser type, and interaction with our services.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              2. How We Use Your Information
            </h2>
            <p>We use personal information collected via our portal for a variety of business purposes described below:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-indigo-400">
              <li>To facilitate account creation and logon process.</li>
              <li>To post testimonials.</li>
              <li>To deliver and facilitate delivery of services to the user.</li>
              <li>To respond to user inquiries/offer support to users.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">3. Sharing Your Information</h2>
            <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We share recruiter information with candidates and vice versa during the job application process.</p>
          </section>

          <section className="p-6 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border-subtle)]">
            <h2 className="text-xl font-bold text-text-primary mb-4">4. Data Security</h2>
            <p className="text-text-secondary italic font-medium leading-relaxed">
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-text-primary mb-4">5. Contact Us</h2>
            <p>If you have questions or comments about this policy, you may email us at akjobservices7@gmail.com</p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyInfo;
