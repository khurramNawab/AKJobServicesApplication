import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// 🏗️ Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// 👤 Website Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CandidateDashboard from './pages/CandidateDashboard';
import JobsList from './pages/JobsList';
import JobDetails from './pages/JobDetails';
import RecruiterDashboard from './pages/RecruiterDashboard';
import PostJob from './pages/PostJob';
import JobApplications from './pages/JobApplications';
import VerifyAccount from './pages/VerifyAccount';
import Companies from './pages/Companies';
import Salaries from './pages/Salaries';
import Profile from './pages/Profile';
import RecruiterProfile from './pages/RecruiterProfile';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Security from './pages/Security';
import AboutUs from './pages/AboutUs';
import CompanyProfile from './pages/CompanyProfile';

// 🛡️ Admin Matrix Pages (Isolated)
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import DashboardView from './pages/admin/views/DashboardView';
import UserView from './pages/admin/views/UserView';
import JobModerator from './pages/admin/views/JobModerator';
import BroadcastCenter from './pages/admin/views/BroadcastCenter';
import SubscriptionView from './pages/admin/views/SubscriptionView';
import PaymentsView from './pages/admin/views/PaymentsView';
import ApplicationsView from './pages/admin/views/ApplicationsView';
import ReportsView from './pages/admin/views/ReportsView';
import SettingsView from './pages/admin/views/SettingsView';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return null;
  if (!user) return <Navigate to={role === 'ADMIN' ? '/admin/login' : '/login'} />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* 🏙️ WEBSITE CLUSTER (Candidate, Recruiter, Guest) */}
          <Route element={<MainLayout />}>
            {/* ✅ PUBLIC ROUTES */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-account" element={<VerifyAccount />} />
            <Route path="/jobs" element={<JobsList />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyProfile />} />
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/security" element={<Security />} />
            <Route path="/about" element={<AboutUs />} />

            {/* 🔒 PROTECTED: Candidate Routes */}
            <Route path="/dashboard" element={<ProtectedRoute role="CANDIDATE"><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* 🔒 PROTECTED: Recruiter Routes */}
            <Route path="/recruiter-dashboard" element={<ProtectedRoute role="RECRUITER"><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="/post-job" element={<ProtectedRoute role="RECRUITER"><PostJob /></ProtectedRoute>} />
            <Route path="/jobs/:jobId/applications" element={<ProtectedRoute role="RECRUITER"><JobApplications /></ProtectedRoute>} />
            <Route path="/recruiter-profile" element={<ProtectedRoute role="RECRUITER"><RecruiterProfile /></ProtectedRoute>} />
          </Route>

          {/* 🛡️ ADMIN MATRIX CLUSTER (Isolated Sector) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route element={<AdminDashboard />}>
              <Route index element={<DashboardView />} />
              <Route path="users" element={<UserView />} />
              <Route path="jobs" element={<JobModerator />} />
              <Route path="applications" element={<ApplicationsView />} />
              <Route path="subscriptions" element={<SubscriptionView />} />
              <Route path="payments" element={<PaymentsView />} />
              <Route path="reports" element={<ReportsView />} />
              <Route path="broadcast" element={<BroadcastCenter />} />
              <Route path="settings" element={<SettingsView />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
