import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { Outlet, useLocation } from 'react-router-dom';

const AdminDashboard = () => {
    const { user: adminUser } = useContext(AuthContext);
    const location = useLocation();
    
    // Core Data States
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [activity, setActivity] = useState([]);
    
    // UI/UX States
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, jobsRes, activityRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/jobs'),
                api.get('/admin/activity')
            ]);
            setStats(statsRes.data.data);
            setUsers(usersRes.data.data);
            setJobs(jobsRes.data.data);
            setActivity(activityRes.data.data);
        } catch (err) {
            console.error('Failed to fetch admin matrix data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // 🛡️ Admin Command Handlers (Passed via Context or Props)
    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const res = await api.put(`/admin/users/${userId}`, { role: newRole });
            if (res.data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            }
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleToggleVerification = async (userId, currentStatus) => {
        try {
            const res = await api.put(`/admin/users/${userId}`, { isVerified: !currentStatus });
            if (res.data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, isVerified: !currentStatus } : u));
            }
        } catch (err) {
            alert('Failed to toggle verification');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('CRITICAL: Permanently delete this terminal access?')) return;
        setActionLoading(true);
        try {
            const res = await api.delete(`/admin/users/${userId}`);
            if (res.data.success) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (err) {
            alert('Deletion failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('MODERATION: Takedown this posting?')) return;
        setActionLoading(true);
        try {
            const res = await api.delete(`/admin/jobs/${jobId}`);
            if (res.data.success) {
                setJobs(jobs.filter(j => j._id !== jobId));
            }
        } catch (err) {
            alert('Job takedown failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleBroadcast = async (formData) => {
        setActionLoading(true);
        try {
            const res = await api.post('/admin/broadcast', formData);
            if (res.data.success) {
                alert(`SUCCESS: Signal transmitted globally.`);
            }
        } catch (err) {
            alert('Transmission failed.');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
                <div className="w-16 h-16 border-t-4 border-blue-600 border-r-4 border-r-blue-600/20 rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]" />
                <div className="text-center space-y-2">
                    <p className="text-white font-black text-xs uppercase tracking-[0.4em] animate-pulse">Syncing Matrix Data</p>
                </div>
            </div>
        );
    }

    // Prepare context for child views
    const contextValue = {
        stats,
        users,
        jobs,
        activity,
        handleRoleUpdate,
        handleToggleVerification,
        handleDeleteUser,
        handleDeleteJob,
        handleBroadcast,
        actionLoading
    };

    return (
        <section className="w-full">
            <AnimatePresence mode="wait">
                <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet context={contextValue} />
                </motion.div>
            </AnimatePresence>
        </section>
    );
};

export default AdminDashboard;
