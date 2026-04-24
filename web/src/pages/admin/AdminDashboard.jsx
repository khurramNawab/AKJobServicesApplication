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
    
    // Pagination Metadata
    const [pagination, setPagination] = useState({
        users: { total: 0, pages: 1, current: 1 },
        jobs: { total: 0, pages: 1, current: 1 }
    });
    
    // UI/UX States
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchAdminData = async (userPage = 1, jobPage = 1) => {
        setLoading(true);
        try {
            const [statsRes, usersRes, jobsRes, activityRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get(`/admin/users?page=${userPage}&limit=10`),
                api.get(`/admin/jobs?page=${jobPage}&limit=10`),
                api.get('/admin/activity')
            ]);
            
            // Backend returns { success, data: [], pagination: {} }
            setStats(statsRes.data.data);
            setUsers(usersRes.data.data || []);
            setJobs(jobsRes.data.data || []);
            setActivity(activityRes.data.data || []);
            
            setPagination({
                users: usersRes.data.pagination || { total: usersRes.data.data?.length, pages: 1, current: 1 },
                jobs: jobsRes.data.pagination || { total: jobsRes.data.data?.length, pages: 1, current: 1 }
            });
        } catch (err) {
            console.error('Failed to fetch admin matrix data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // 🛡️ Admin Command Handlers (Contextual Sudo Protection)
    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const res = await api.put(`/admin/users/${userId}`, { role: newRole });
            if (res.data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            }
        } catch (err) {
            console.error('Role update failed');
        }
    };

    const handleToggleVerification = async (userId, currentStatus) => {
        try {
            const res = await api.put(`/admin/users/${userId}`, { isVerified: !currentStatus });
            if (res.data.success) {
                setUsers(users.map(u => u._id === userId ? { ...u, isVerified: !currentStatus } : u));
            }
        } catch (err) {
            console.error('Verification toggle failed');
        }
    };

    const handleDeleteUser = async (userId) => {
        const password = window.prompt('CRITICAL ACTION: Enter Admin Password to confirm user deletion:');
        if (!password) return;

        setActionLoading(true);
        try {
            // Send sudoPassword as required by backend reauthMiddleware
            const res = await api.delete(`/admin/users/${userId}`, { data: { sudoPassword: password } });
            if (res.data.success) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Deletion failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteJob = async (jobId) => {
        const password = window.prompt('MODERATION ACTION: Enter Admin Password to confirm job takedown:');
        if (!password) return;

        setActionLoading(true);
        try {
            const res = await api.delete(`/admin/jobs/${jobId}`, { data: { sudoPassword: password } });
            if (res.data.success) {
                setJobs(jobs.filter(j => j._id !== jobId));
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Job takedown failed');
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

    // Only show full-screen spinner on initial cold start (no stats yet)
    if (loading && !stats) {
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
        pagination,
        fetchAdminData,
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
