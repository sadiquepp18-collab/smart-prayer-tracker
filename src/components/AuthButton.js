import { useAuth } from '@/contexts/AuthContext';

export const AuthButton = () => {
  const { user, loading, signInWithGoogle, signOut, error } = useAuth();

  if (loading) {
    return (
      <button 
        className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed"
        disabled
        data-testid="auth-loading-button"
      >
        Loading...
      </button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4" data-testid="auth-user-section">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'User'} 
              className="w-10 h-10 rounded-full"
              data-testid="user-avatar"
            />
          )}
          <div>
            <p className="font-semibold text-white" data-testid="user-display-name">
              {user.displayName || 'User'}
            </p>
            <p className="text-sm text-gray-300" data-testid="user-email">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          data-testid="sign-out-button"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div data-testid="auth-sign-in-section">
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
        data-testid="google-sign-in-button"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2" data-testid="auth-error">
          {error}
        </p>
      )}
    </div>
  );
};
