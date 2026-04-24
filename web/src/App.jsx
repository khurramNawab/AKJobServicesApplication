import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';

// 🏗️ Layouts
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// 👤 Website Pages (Lazy Loaded)
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const JobsList = lazy(() => import('./pages/JobsList'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const PostJob = lazy(() => import('./pages/PostJob'));
const JobApplications = lazy(() => import('./pages/JobApplications'));
const EditJob = lazy(() => import('./pages/EditJob'));
const VerifyAccount = lazy(() => import('./pages/VerifyAccount'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const CheckEmail = lazy(() => import('./pages/CheckEmail'));
const Companies = lazy(() => import('./pages/Companies'));
const Salaries = lazy(() => import('./pages/Salaries'));
const Profile = lazy(() => import('./pages/Profile'));
const RecruiterProfile = lazy(() => import('./pages/RecruiterProfile'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Security = lazy(() => import('./pages/Security'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

// 🛡️ Admin Matrix Pages (Lazy Loaded)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const DashboardView = lazy(() => import('./pages/admin/views/DashboardView'));
const UserView = lazy(() => import('./pages/admin/views/UserView'));
const JobModerator = lazy(() => import('./pages/admin/views/JobModerator'));
const BroadcastCenter = lazy(() => import('./pages/admin/views/BroadcastCenter'));
const SubscriptionView = lazy(() => import('./pages/admin/views/SubscriptionView'));
const PaymentsView = lazy(() => import('./pages/admin/views/PaymentsView'));
const ApplicationsView = lazy(() => import('./pages/admin/views/ApplicationsView'));
const ReportsView = lazy(() => import('./pages/admin/views/ReportsView'));
const SettingsView = lazy(() => import('./pages/admin/views/SettingsView'));

const PageLoader = () => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
    <div className="w-12 h-12 border-4 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
    <p className="text-[#2563EB] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Secure Sector...</p>
  </div>
);

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
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            
            {/* 🏙️ WEBSITE CLUSTER (Candidate, Recruiter, Guest) */}
            <Route element={<MainLayout />}>
              {/* ✅ PUBLIC ROUTES */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-account" element={<VerifyAccount />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/check-email" element={<CheckEmail />} />
              <Route path="/jobs" element={<JobsList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />
              <Route path="/salaries" element={<Salaries />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/security" element={<Security />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/pricing" element={<PricingPage />} />

              {/* 🔒 PROTECTED: Candidate Routes */}
              <Route path="/dashboard" element={<ProtectedRoute role="CANDIDATE"><CandidateDashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* 🔒 PROTECTED: Recruiter Routes */}
              <Route path="/recruiter-dashboard" element={<ProtectedRoute role="RECRUITER"><RecruiterDashboard /></ProtectedRoute>} />
              <Route path="/post-job" element={<ProtectedRoute role="RECRUITER"><PostJob /></ProtectedRoute>} />
              <Route path="/jobs/:jobId/edit" element={<ProtectedRoute role="RECRUITER"><EditJob /></ProtectedRoute>} />
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
