import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardHome from "./pages/admin/DashboardHome";
import UsersList from "./pages/admin/UsersList";
import InvestorsList from "./pages/admin/InvestorsList";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import Logo from "./components/Logo";
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";

import AppLayout from "./pages/app/AppLayout";
import Discover from "./pages/app/Discover";
import Network from "./pages/app/Network";
import Messages from "./pages/app/Messages";
import AIAdvisor from "./pages/app/AIAdvisor";
import Events from "./pages/app/Events";
import Profile from "./pages/app/Profile";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-white">
        <Logo size="lg" className="mb-8 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="discover" replace />} />
              <Route path="discover" element={<Discover />} />
              <Route path="network" element={<Network />} />
              <Route path="messages" element={<Messages />} />
              <Route path="ai-advisor" element={<AIAdvisor />} />
              <Route path="events" element={<Events />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Fallback old dashboard route just in case */}
            <Route
              path="/dashboard"
              element={<Navigate to="/app/discover" replace />}
            />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="users" element={<UsersList />} />
              <Route path="investors" element={<InvestorsList />} />
              <Route path="emails" element={<AdminEmails />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}
