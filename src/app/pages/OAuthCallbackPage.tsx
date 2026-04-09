import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { apiClient } from '../../services/api';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

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

        const profileResponse = await apiClient.getProfile();
        const backendUser = profileResponse?.data?.user;

        if (!backendUser) {
          throw new Error('Failed to fetch user profile after OAuth login');
        }

        const userData = {
          ...backendUser,
          id: backendUser.id || backendUser._id,
        };

        localStorage.setItem('quizpulse_user', JSON.stringify(userData));
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
