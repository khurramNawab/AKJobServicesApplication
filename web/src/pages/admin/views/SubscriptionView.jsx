import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
   Zap, CreditCard, TrendingUp, Users, Clock,
   CheckCircle, AlertCircle, Plus, ArrowRight,
   Crown, Shield, Star, RefreshCw, Download,
   Settings, ToggleLeft, ToggleRight, Save, Calendar,
   IndianRupee, Lock, Unlock, AlertTriangle
} from 'lucide-react';
import api from '../../../services/api';

const plans = [
   {
      name: 'Basic',
      price: 'Free',
      color: 'slate',
      icon: Shield,
      features: ['5 Job Applications/mo', 'Basic Profile', 'Email Support'],
   },
   {
      name: 'Pro',
      price: '₹999/mo',
      color: 'blue',
      icon: Star,
      features: ['Unlimited Applications', 'Priority Listing', 'Resume Builder', 'Chat Support'],
   },
   {
      name: 'Elite',
      price: '₹2,499/mo',
      color: 'indigo',
      icon: Crown,
      features: ['Everything in Pro', 'Dedicated Manager', 'Analytics Dashboard', 'API Access'],
   },
];

const SubscriptionView = () => {
   const { stats } = useOutletContext();
   const [subscriptions, setSubscriptions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [activeFilter, setActiveFilter] = useState('ALL');

   useEffect(() => {
      const fetchSubs = async () => {
         try {
            const res = await api.get('/admin/subscriptions');
            if (res.data.success) setSubscriptions(res.data.data);
         } catch {
            // Use mock data if endpoint not available
            setSubscriptions([
               { _id: '1', user: { name: 'Rahul Sharma', phoneNumber: '9876543210' }, plan: 'PRO', status: 'ACTIVE', startDate: '2026-03-01', endDate: '2026-04-01', amount: 999 },
               { _id: '2', user: { name: 'Digital Solutions', phoneNumber: '9123456789' }, plan: 'ELITE', status: 'ACTIVE', startDate: '2026-03-15', endDate: '2026-04-15', amount: 2499 },
               { _id: '3', user: { name: 'Tech Corp', phoneNumber: '9988776655' }, plan: 'PRO', status: 'EXPIRED', startDate: '2026-02-01', endDate: '2026-03-01', amount: 999 },
               { _id: '4', user: { name: 'Ananya Iyer', phoneNumber: '9871234560' }, plan: 'BASIC', status: 'ACTIVE', startDate: '2026-03-20', endDate: null, amount: 0 },
            ]);
         } finally {
            setLoading(false);
         }
      };
      fetchSubs();
   }, []);

   // ---- Platform Plan Config ----
   const [config, setConfig] = useState({
      platformMode: 'FREEMIUM',
      freeTierEnabled: true,
      freeTierExpiryDate: '',
      freeTierJobApplicationLimit: 5,
      freeTierJobPostLimit: 2,
      proEnabled: true,
      proMonthlyPrice: 999,
      proYearlyPrice: 8999,
      eliteEnabled: true,
      eliteMonthlyPrice: 2499,
      eliteYearlyPrice: 22999,
   });
   const [configLoading, setConfigLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [saveMsg, setSaveMsg] = useState('');

   useEffect(() => {
      const fetchConfig = async () => {
         try {
            const res = await api.get('/admin/platform-plan');
            if (res.data.success) {
               const d = res.data.data;
               setConfig({
                  platformMode: d.platformMode || 'FREEMIUM',
                  freeTierEnabled: d.freeTierEnabled ?? true,
                  freeTierExpiryDate: d.freeTierExpiryDate ? d.freeTierExpiryDate.split('T')[0] : '',
                  freeTierJobApplicationLimit: d.freeTierJobApplicationLimit ?? 5,
                  freeTierJobPostLimit: d.freeTierJobPostLimit ?? 2,
                  proEnabled: d.proEnabled ?? true,
                  proMonthlyPrice: d.proMonthlyPrice ?? 999,
                  proYearlyPrice: d.proYearlyPrice ?? 8999,
                  eliteEnabled: d.eliteEnabled ?? true,
                  eliteMonthlyPrice: d.eliteMonthlyPrice ?? 2499,
                  eliteYearlyPrice: d.eliteYearlyPrice ?? 22999,
               });
            }
         } catch { /* use defaults */ } finally {
            setConfigLoading(false);
         }
      };
      fetchConfig();
   }, []);

   const handleSaveConfig = async () => {
      setSaving(true);
      setSaveMsg('');
      try {
         const payload = {
            ...config,
            freeTierExpiryDate: config.freeTierExpiryDate || null,
         };
         await api.put('/admin/platform-plan', payload);
         setSaveMsg('✅ Configuration saved successfully!');
      } catch {
         setSaveMsg('❌ Failed to save. Please try again.');
      } finally {
         setSaving(false);
         setTimeout(() => setSaveMsg(''), 4000);
      }
   };

   const planCounts = {
      BASIC: subscriptions.filter(s => s.plan === 'BASIC').length,
      PRO: subscriptions.filter(s => s.plan === 'PRO').length,
      ELITE: subscriptions.filter(s => s.plan === 'ELITE').length,
   };

   const filtered = activeFilter === 'ALL'
      ? subscriptions
      : subscriptions.filter(s => s.status === activeFilter);

   return (
      <div className="space-y-10 text-left">

         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-1">
               <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
                  Subscription <span className="text-blue-500">Matrix</span>.
               </h2>
               <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">
                  Manage premium tiers and monetization nodes.
               </p>
            </div>
            <div className="flex gap-3">
               <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                  <Download size={13} /> Export
               </button>
               <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-all flex items-center gap-2">
                  <Plus size={13} /> New Plan
               </button>
            </div>
         </div>

         {/* Plan Overview Cards */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
               const count = planCounts[plan.name.toUpperCase()] || 0;
               const total = subscriptions.length || 1;
               const PlanIcon = plan.icon;
               return (
                  <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: i * 0.1 }}
                     className="p-8 rounded-[2.5rem] bg-[#1E293B] border border-white/5 space-y-6 group hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden"
                  >
                     <div className="absolute top-4 right-4 opacity-[0.06]">
                        <PlanIcon size={80} className="text-white" />
                     </div>

                     <div className="flex items-center justify-between">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-${plan.color}-500/10 text-${plan.color}-400 border border-${plan.color}-500/20`}>
                           <PlanIcon size={11} /> {plan.name} Tier
                        </div>
                        <span className="text-2xl font-black text-white">{count}</span>
                     </div>

                     <div>
                        <p className="text-3xl font-black text-white tracking-tighter">{plan.price}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{count} active users</p>
                     </div>

                     <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black text-gray-600 uppercase tracking-widest">
                           <span>Platform Share</span>
                           <span className="text-gray-400">{Math.round((count / total) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round((count / total) * 100)}%` }}
                              transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                              className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                           />
                        </div>
                     </div>

                     <ul className="space-y-2">
                        {plan.features.map((f, fi) => (
                           <li key={fi} className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                              <CheckCircle size={11} className="text-emerald-500 flex-shrink-0" /> {f}
                           </li>
                        ))}
                     </ul>
                  </motion.div>
               );
            })}
         </div>

         {/* ⚙️ Platform Plan Configuration Panel */}
         <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                     <Settings size={20} />
                  </div>
                  <div>
                     <h3 className="text-base font-black text-white uppercase tracking-widest">Platform Plan Configuration</h3>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Admin controls for pricing and access</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  {saveMsg && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{saveMsg}</span>}
                  <button onClick={handleSaveConfig} disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:scale-105 transition-all disabled:opacity-50">
                     {saving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                     {saving ? 'Saving...' : 'Save Config'}
                  </button>
               </div>
            </div>
            <div className="p-8 space-y-8">
               {/* Platform Mode */}
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Platform Mode</label>
                  <div className="grid grid-cols-3 gap-4">
                     {[
                        { value: 'ALL_FREE', label: 'All Free', icon: Unlock, desc: 'Everything free', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
                        { value: 'FREEMIUM', label: 'Freemium', icon: Zap, desc: 'Free + Paid tiers', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
                        { value: 'ALL_PAID', label: 'All Paid', icon: Lock, desc: 'No free access', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
                     ].map(m => (
                        <button key={m.value} onClick={() => setConfig(c => ({ ...c, platformMode: m.value }))}
                           className={`p-5 rounded-2xl border text-left flex flex-col gap-2 transition-all ${config.platformMode === m.value ? m.color : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'}`}>
                           <m.icon size={18} />
                           <span className="text-[11px] font-black uppercase tracking-widest">{m.label}</span>
                           <span className="text-[9px] font-bold opacity-60">{m.desc}</span>
                        </button>
                     ))}
                  </div>
               </div>
               <div className="h-px bg-white/5" />
               {/* Free Tier */}
               <div className="space-y-5">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3"><Shield size={16} className="text-slate-400" /><label className="text-[11px] font-black text-white uppercase tracking-widest">Free Tier Settings</label></div>
                     <button onClick={() => setConfig(c => ({ ...c, freeTierEnabled: !c.freeTierEnabled }))}>
                        {config.freeTierEnabled ? <ToggleRight size={28} className="text-emerald-400" /> : <ToggleLeft size={28} className="text-gray-600" />}
                     </button>
                  </div>
                  {config.freeTierEnabled && (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} /> Free Until Date</label>
                           <input type="date" value={config.freeTierExpiryDate} onChange={e => setConfig(c => ({ ...c, freeTierExpiryDate: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-all" />
                           <p className="text-[9px] text-gray-600 font-bold">Empty = always free</p>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Application Limit</label>
                           <input type="number" value={config.freeTierJobApplicationLimit} onChange={e => setConfig(c => ({ ...c, freeTierJobApplicationLimit: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Job Post Limit</label>
                           <input type="number" value={config.freeTierJobPostLimit} onChange={e => setConfig(c => ({ ...c, freeTierJobPostLimit: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                     </div>
                  )}
               </div>
               <div className="h-px bg-white/5" />
               {/* Paid Plans */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                     { key: 'pro', label: 'Pro Plan', icon: Star, color: 'text-blue-400', monthlyKey: 'proMonthlyPrice', yearlyKey: 'proYearlyPrice', enabledKey: 'proEnabled' },
                     { key: 'elite', label: 'Elite Plan', icon: Crown, color: 'text-indigo-400', monthlyKey: 'eliteMonthlyPrice', yearlyKey: 'eliteYearlyPrice', enabledKey: 'eliteEnabled' },
                  ].map(plan => (
                     <div key={plan.key} className="space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3"><plan.icon size={16} className={plan.color} /><label className="text-[11px] font-black text-white uppercase tracking-widest">{plan.label}</label></div>
                           <button onClick={() => setConfig(c => ({ ...c, [plan.enabledKey]: !c[plan.enabledKey] }))}>
                              {config[plan.enabledKey] ? <ToggleRight size={28} className={plan.color} /> : <ToggleLeft size={28} className="text-gray-600" />}
                           </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Monthly (₹)</label>
                              <input type="number" value={config[plan.monthlyKey]} onChange={e => setConfig(c => ({ ...c, [plan.monthlyKey]: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Yearly (₹)</label>
                              <input type="number" value={config[plan.yearlyKey]} onChange={e => setConfig(c => ({ ...c, [plan.yearlyKey]: Number(e.target.value) }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:outline-none focus:border-blue-500 transition-all" />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Subscriber Table */}
         <div className="bg-[#1E293B] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
            {/* Filter Bar */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5">
               <h3 className="text-sm font-black text-white uppercase tracking-widest">All Subscribers</h3>
               <div className="flex gap-2">
                  {['ALL', 'ACTIVE', 'EXPIRED'].map(f => (
                     <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${activeFilter === f
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'
                           }`}
                     >
                        {f}
                     </button>
                  ))}
               </div>
            </div>

            {loading ? (
               <div className="flex items-center justify-center py-20">
                  <RefreshCw size={24} className="text-blue-500 animate-spin" />
               </div>
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                     <thead>
                        <tr className="bg-white/[0.02]">
                           <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">User</th>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Plan</th>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</th>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                           <th className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Renewal</th>
                        </tr>
                     </thead>
                     <tbody>
                        {filtered.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="px-8 py-16 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
                                 No subscribers found
                              </td>
                           </tr>
                        ) : filtered.map((sub, i) => (
                           <motion.tr
                              key={sub._id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04 }}
                              className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group"
                           >
                              <td className="px-8 py-5">
                                 <p className="text-white font-black text-sm">{sub.user?.name || 'Unknown'}</p>
                                 <p className="text-[10px] text-gray-500 font-bold mt-0.5">{sub.user?.phoneNumber}</p>
                              </td>
                              <td className="px-8 py-5">
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sub.plan === 'ELITE' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                                       sub.plan === 'PRO' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                          'bg-slate-500/10 border-slate-500/20 text-slate-400'
                                    }`}>
                                    {sub.plan === 'ELITE' ? <Crown size={10} /> : sub.plan === 'PRO' ? <Star size={10} /> : <Shield size={10} />}
                                    {sub.plan}
                                 </span>
                              </td>
                              <td className="px-8 py-5 text-white font-black text-sm">
                                 ₹{sub.amount?.toLocaleString() || 0}
                              </td>
                              <td className="px-8 py-5">
                                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${sub.status === 'ACTIVE'
                                       ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                       : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    }`}>
                                    {sub.status === 'ACTIVE' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                    {sub.status}
                                 </span>
                              </td>
                              <td className="px-8 py-5 text-gray-500 font-bold text-xs">
                                 {sub.endDate ? new Date(sub.endDate).toLocaleDateString('en-IN') : '—'}
                              </td>
                           </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>
      </div>
   );
};

export default SubscriptionView;
