import { createBrowserRouter } from 'react-router';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import DashboardLayout from './layouts/DashboardLayout';
import StudentDashboard from './pages/StudentDashboard';
import QuizGeneratorPage from './pages/QuizGeneratorPage';
import ProgressPage from './pages/ProgressPage';
import MessagingPage from './pages/MessagingPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminModeration from './pages/AdminModeration';
import AdminProfile from './pages/AdminProfile';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/login/:role',
    element: <LoginPage />
  },
  {
    path: '/signup/:role',
    element: <SignupPage />
  },
  {
    path: '/oauth/callback',
    element: <OAuthCallbackPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requireStudent>
            <StudentDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'quiz-generator',
        element: (
          <ProtectedRoute requireStudent>
            <QuizGeneratorPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'progress',
        element: (
          <ProtectedRoute requireStudent>
            <ProgressPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <MessagingPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'resources',
        element: (
          <ProtectedRoute requireStudent>
            <ResourcesPage />
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/students',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminStudents />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/moderation',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminModeration />
          </ProtectedRoute>
        )
      },
      {
        path: 'admin/profile',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminProfile />
          </ProtectedRoute>
        )
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);
