import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/use-auth.js';
import AppShell from './components/layout/app-shell.jsx';
import LoadingSpinner from './components/shared/loading-spinner.jsx';

// Pages
import LandingPage from './pages/landing-page.jsx';
import DashboardPage from './pages/dashboard-page.jsx';
import DocumentsPage from './pages/documents-page.jsx';
import AttendancePage from './pages/attendance-page.jsx';
import ExpensesPage from './pages/expenses-page.jsx';
import KnowledgeHubPage from './pages/knowledge-hub-page.jsx';
import ProfilePage from './pages/profile-page.jsx';
import NotFoundPage from './pages/not-found-page.jsx';

/**
 * Protected route wrapper.
 * Redirects unauthenticated users to landing page.
 * Shows spinner while auth state is loading.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <AppShell>{children}</AppShell>;
}

/**
 * Public route wrapper.
 * Redirects authenticated users to dashboard.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullscreen text="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
      <Routes>
        {/* Public route */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/knowledge"
          element={
            <ProtectedRoute>
              <KnowledgeHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* 404 — no layout */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
}
