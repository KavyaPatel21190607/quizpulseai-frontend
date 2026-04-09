import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '../../services/api';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const decodeJwtPayload = (token: string) => {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(normalized));
      return decoded;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const completeOAuth = async () => {
      try {
        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
        const params = new URLSearchParams(hash);

        const token = params.get('token');
        const redirect = params.get('redirect') || '/dashboard';

        if (!token) {
          throw new Error('Missing OAuth token');
        }

        const safeRedirect = redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/dashboard';

        apiClient.setToken(token);
        localStorage.setItem('quizpulse_token', token);

        try {
          const profileResponse = await apiClient.getProfile();
          const backendUser = profileResponse?.data?.user;
          if (backendUser) {
            const userData = {
              ...backendUser,
              id: backendUser.id || backendUser._id,
            };
            localStorage.setItem('quizpulse_user', JSON.stringify(userData));
          } else {
            const decoded = decodeJwtPayload(token);
            if (decoded) {
              const fallbackUser = {
                id: decoded.id,
                role: decoded.role || 'student',
                name: 'Google User',
                email: '',
              };
              localStorage.setItem('quizpulse_user', JSON.stringify(fallbackUser));
            }
          }
        } catch {
          const decoded = decodeJwtPayload(token);
          if (decoded) {
            const fallbackUser = {
              id: decoded.id,
              role: decoded.role || 'student',
              name: 'Google User',
              email: '',
            };
            localStorage.setItem('quizpulse_user', JSON.stringify(fallbackUser));
          }
        }

        window.location.replace(safeRedirect);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Google OAuth login failed');
      }
    };

    completeOAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">Completing Google Sign-in</h1>
        {!error ? (
          <p className="text-muted-foreground">Please wait while we securely sign you in.</p>
        ) : (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login/student')}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
