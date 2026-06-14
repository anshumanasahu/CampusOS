import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/use-auth.js';
import Button from '../components/shared/button.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LandingPage() {
  const { loginWithGoogle, loginAsDemo, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setError('');
    try {
      await loginAsDemo();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Google login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again or use Demo login.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <h1 className="text-xl font-bold text-indigo-600">CampusOS</h1>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Your AI-Powered Student Operating System
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Organize academics, track expenses, manage attendance, and stay on top of deadlines — all from one dashboard.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>📄</span> AI Document Intelligence
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>✅</span> Attendance Tracking
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>💰</span> Expense Management
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>🧠</span> Burnout Detection
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>📚</span> Knowledge Hub
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>🤖</span> AI Chatbot
            </div>
          </div>

          {/* Login actions */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 items-center">
            <Button
              variant="primary"
              onClick={handleDemoLogin}
              loading={loading}
              className="w-full py-3 text-base"
            >
              Explore Demo
            </Button>

            {/* Google Sign-In */}
            {GOOGLE_CLIENT_ID ? (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="w-full flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    width="400"
                    text="signin_with"
                    shape="rectangular"
                    theme="outline"
                  />
                </div>
              </GoogleOAuthProvider>
            ) : (
              <p className="text-xs text-slate-400">
                Google Sign-In not configured. Use Demo login.
              </p>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-4">
            Text-first inputs. No image upload required.
          </p>
        </div>
      </main>
    </div>
  );
}
