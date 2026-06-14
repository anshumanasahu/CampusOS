import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/use-auth.js';
import Button from '../components/shared/button.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const features = [
  { icon: '📄', title: 'AI Documents', desc: 'Extract deadlines from PDFs' },
  { icon: '📊', title: 'Attendance', desc: 'Track safe skips automatically' },
  { icon: '💳', title: 'Expenses', desc: 'AI-powered budget tracking' },
  { icon: '🧠', title: 'Wellness', desc: 'Burnout detection & insights' },
  { icon: '📚', title: 'Knowledge', desc: 'Notes, PYQs & reviews' },
  { icon: '✨', title: 'AI Assistant', desc: 'Your campus mentor' },
];

export default function LandingPage() {
  const { loginWithGoogle, loginAsDemo, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setError('');
    try { await loginAsDemo(); navigate('/dashboard'); }
    catch (err) { setError(err.message || 'Demo login failed'); }
  };

  const handleGoogleSuccess = async (res) => {
    setError('');
    try { await loginWithGoogle(res.credential); navigate('/dashboard'); }
    catch (err) { setError(err.message || 'Google login failed'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-soft">
            <span className="text-white text-sm font-bold">C</span>
          </div>
          <span className="text-lg font-bold text-slate-900">CampusOS</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="max-w-2xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-xs text-brand-700 font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            AI-Powered Student Operating System
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
            Your complete <span className="text-gradient">campus life</span> in one place
          </h1>
          <p className="text-lg text-slate-500 mb-10 max-w-lg mx-auto leading-relaxed">
            Academics, finances, wellness, and placements — managed by AI that understands your student journey.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10 max-w-lg mx-auto stagger-children">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-xl border border-slate-100 shadow-soft text-left">
                <span className="text-lg">{f.icon}</span>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{f.title}</p>
                  <p className="text-[10px] text-slate-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-xl mb-4 border border-red-100 animate-scale-in">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 max-w-xs mx-auto">
            <Button variant="brand" size="lg" onClick={handleDemoLogin} loading={loading} className="w-full">
              Explore Demo →
            </Button>

            {GOOGLE_CLIENT_ID ? (
              <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                <div className="w-full flex justify-center">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} width="320" text="signin_with" shape="rectangular" theme="outline" />
                </div>
              </GoogleOAuthProvider>
            ) : (
              <p className="text-xs text-slate-400">Google Sign-In available with configuration</p>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-6">
            Text-first AI • No image upload needed • Hackathon-ready
          </p>
        </div>
      </main>
    </div>
  );
}
