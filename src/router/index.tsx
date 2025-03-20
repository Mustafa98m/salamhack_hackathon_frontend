// File: src/router/index.jsx

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import Dashboard from '../pages/Dashboard';
import PodcastsPage from '../pages/PodcastsPage';
import ProgressPage from '../pages/ProgressPage';
import QuizPage from '../pages/QuizPage';
import NotFound from '../pages/NotFound';
import AppLayout from '../layouts/AppLayout';

// Protected route wrapper
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to='/login' replace />;
  }

  // Render children routes
  return <Outlet />;
};

// Public route wrapper (redirects if already authenticated)
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to='/dashboard' replace />;
  }

  // Render children routes
  return <Outlet />;
};

const Router = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes (accessible when not logged in) */}
          <Route element={<PublicRoute />}>
            <Route path='/login' element={<LoginPage />} />
          </Route>

          {/* Protected routes (require authentication) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/podcasts' element={<PodcastsPage />} />
              <Route path='/progress' element={<ProgressPage />} />
              <Route path='/quiz/:podcastId' element={<QuizPage />} />
              <Route path='/profile' element={<div>Profile Page</div>} />
            </Route>
          </Route>

          {/* Redirect root to dashboard or login based on auth status */}
          <Route path='/' element={<Navigate to='/dashboard' replace />} />

          {/* 404 route */}
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default Router;
