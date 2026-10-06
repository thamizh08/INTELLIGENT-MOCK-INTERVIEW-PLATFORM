// src/routes/AppRoutes.jsx
// Maps every URL path to its page component. ProtectedRoute redirects to
// /login if there's no logged-in user, so individual pages don't each have
// to repeat that check themselves.

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import RoleSelection from '../pages/RoleSelection';
import InterviewSession from '../pages/InterviewSession';
import Report from '../pages/Report';
import Dashboard from '../pages/Dashboard';
import Roadmap from '../pages/Roadmap';
import Loader from '../components/common/Loader';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader message="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
      <Route path="/interview/:sessionId" element={<ProtectedRoute><InterviewSession /></ProtectedRoute>} />
      <Route path="/report/:sessionId" element={<ProtectedRoute><Report /></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
