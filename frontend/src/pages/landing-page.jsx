import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/use-auth.js';
import Button from '../components/shared/button.jsx';
import Grainient from '../components/shared/grainient.jsx';
import { Sparkles, ArrowRight, Check, Shield, Zap, Brain, FileText, CalendarCheck, Wallet, ShoppingCart, Briefcase, BookOpen, MessageSquare, Music, Heart } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const orbitModules = [
  { icon: CalendarCheck, label: 'Attendance', angle: 0 },
  { icon: Wallet, label: 'Expenses', angle: 40 },
  { icon: FileText, label: 'Documents', angle: 80 },
  { icon: ShoppingCart, label: 'Shopping', angle: 120 },
  { icon: Briefcase, label: 'Placement', angle: 160 },
  { icon: Heart, label: 'Wellness', angle: 200 },
  { icon: BookOpen, label: 'Knowledge', angle: 240 },
  { icon: MessageSquare, label: 'Chatbot', angle: 280 },
  { icon: Music, label: 'Focus', angle: 320 },
];

const floatingCards = [
  { text: '⚠️ OS Exam in 3 days', pos: 'top-[18%] left-[4%]', delay: '0s' },
  { text: '📊 Attendance: 82%', pos: 'top-[35%] right-[3%]', delay: '1s' },
  { text: '🛒 Lab Coat needed', pos: 'bottom-[30%] left-[2%]', delay: '2s' },
  { text: '💳 Budget: ₹1.8k left', pos: 'bottom-[15%] right-[5%]', delay: '0.5s' },
  { text: '🎧 Deep Focus: 90min', pos: 'top-[8%] right-[15%]', delay: '1.5s' },
];

export default function LandingPage() {
  const { loginWithGoogle, loginAsDemo, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleDemoLogin = async () => {
    setError('');
    try { await loginAsDemo(); navigate('/dashboard'); }
    catch (err) { setError(err.message || 'Failed'); }
  };

  const handleGoogleSuccess = async (res) => {
    setError('');
    try { await loginWithGoogle(res.credential); navigate('/dashboard'); }
    catch (err) { setError(err.message || 'Failed'); }
  };

  return (
    <div className="relative min-h-screen text-white font-sans">

      {/* ═══ FULL-PAGE GRAINIENT BACKGROUND ═══ */}
      <div className="fixed inset-0 z-0">
        <Grainient
          color1="#4338ca"
          color2="#6d28d9"
          color3="#020617"
          timeSpeed={0.12}
          colorBalance={-0.2}
          warpStrength={0.6}
          warpFrequency={2.5}
          warpSpeed={1}
          warpAmplitude={70}
          blendAngle={-15}
          blendSoftness={0.15}
          rotationAmount={200}
          noiseScale={1.2}
          grainAmount={0.04}
          grainScale={2.5}
          grainAnimated={false}
          contrast={1.3}
          gamma={0.95}
          saturation={0.85}
          centerX={0}
          centerY={0}
          zoom={1.1}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-[#08090e]/60" />
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <div className="relative z-10">

        {/* ═══ NAV ═══ */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.04]" style={{ background: 'rgba(8,9,14,0.7)', backdropFilter: 'blur(16px)' }}>
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="CampusOS" className="w-7 h-7" />
              <span className="text-[15px] font-bold tracking-tight text-white">CampusOS</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-[13px] text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how" className="hover:text-white transition-colors">How It Works</a>
              <a href="#ecosystem" className="hover:text-white transition-colors">Ecosystem</a>
            </div>
            <Button variant="brand" size="sm" onClick={handleDemoLogin} loading={loading}>Try Demo</Button>
          </div>
        </nav>

        {/* ═══ HERO ═══ */}
        <section className="relative min-h-screen flex items-center justify-center pt-14">
          {/* Floating cards */}
          {floatingCards.map((card, i) => (
            <div key={i} className={`absolute ${card.pos} hidden lg:block`} style={{ animation: `float 4s ease-in-out infinite`, animationDelay: card.delay }}>
              <div className="px-3 py-2 rounded-xl text-[11px] font-medium text-slate-300 border border-white/[0.06] backdrop-blur-md" style={{ background: 'rgba(17,19,30,0.6)' }}>
                {card.text}
              </div>
            </div>
          ))}

          <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-white/[0.08] text-[11px] font-medium text-brand-300" style={{ background: 'rgba(99,102,241,0.08)' }}>
                <Sparkles className="w-3 h-3" /> AI-Powered Student Operating System
              </div>

              <h1 className="text-4xl md:text-[3.5rem] font-bold leading-[1.08] tracking-tight mb-5">
                <span className="text-white">The AI Operating System</span><br />
                <span className="text-white">for </span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400">Student Life</span>
              </h1>

              <p className="text-[16px] text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
                Attendance, finances, documents, placements, wellness — scattered across 10+ channels.
                CampusOS connects them through one AI that understands your complete journey.
              </p>

              {error && <div className="text-red-300 text-[13px] mb-4 px-3 py-2 rounded-lg border border-red-800/30 bg-red-950/20 inline-block">{error}</div>}

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 mb-6">
                <Button variant="brand" size="lg" onClick={handleDemoLogin} loading={loading}>
                  <Sparkles className="w-4 h-4" /> Explore Demo
                </Button>
                <a href="#features">
                  <Button variant="ghost" size="lg" className="text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03]">
                    See Features <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>

              {GOOGLE_CLIENT_ID && (
                <div className="flex justify-center lg:justify-start">
                  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google login failed')} width="260" text="signin_with" shape="rectangular" theme="filled_black" />
                  </GoogleOAuthProvider>
                </div>
              )}
            </div>

            {/* Right — Orbital */}
            <div className="relative flex items-center justify-center h-[400px] lg:h-[500px]">
              <div className="absolute w-[280px] h-[280px] rounded-full border border-white/[0.04]" style={{ animation: 'spin 40s linear infinite' }} />
              <div className="absolute w-[380px] h-[380px] rounded-full border border-white/[0.03]" style={{ animation: 'spin 60s linear infinite reverse' }} />
              <div className="absolute w-[460px] h-[460px] rounded-full border border-dashed border-white/[0.02]" />

              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center z-10" style={{ boxShadow: '0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1)' }}>
                <Brain className="w-8 h-8 text-white" />
              </div>
              <p className="absolute top-1/2 left-1/2 -translate-x-1/2 mt-12 text-[10px] text-brand-300 font-semibold tracking-wider uppercase z-10">CampusOS AI</p>

              {orbitModules.map((mod, i) => {
                const r = 180, a = (mod.angle * Math.PI) / 180;
                return (
                  <div key={mod.label} className="absolute flex flex-col items-center gap-1 z-10" style={{ left: `calc(50% + ${Math.cos(a) * r}px - 18px)`, top: `calc(50% + ${Math.sin(a) * r}px - 18px)`, animation: `float 3s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
                    <div className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center backdrop-blur-md" style={{ background: 'rgba(17,19,30,0.7)' }}>
                      <mod.icon className="w-4 h-4 text-brand-400" />
                    </div>
                    <span className="text-[9px] text-slate-500 font-medium">{mod.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trust bar */}
          <div className="absolute bottom-8 inset-x-0">
            <div className="max-w-4xl mx-auto px-6 flex items-center justify-center gap-6 flex-wrap">
              {['AI Powered', 'Document Intelligence', 'Budget Aware', 'Context Engine', 'Placement Ready'].map((t) => (
                <span key={t} className="text-[11px] text-slate-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-brand-500" />{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PROBLEM ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] text-brand-400 font-semibold uppercase tracking-widest mb-3">The Problem</p>
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">Information exists everywhere.<br/><span className="text-slate-500">Except where you need it.</span></h2>
            <p className="text-[15px] text-slate-400 max-w-lg mx-auto mb-14">A student's critical data is scattered across PDFs, WhatsApp, emails, portals, and memory. Nothing talks to each other.</p>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {['📋 Registers', '📧 Emails', '💬 WhatsApp', '📄 PDFs', '💰 Budgets', '🏠 Notices', '💼 Portals', '😴 Burnout', '📅 Deadlines', '🛒 Lists', '📚 Notes', '⏰ Missed'].map((item) => (
                <div key={item} className="px-3 py-2.5 rounded-xl text-[11px] text-slate-400 border border-white/[0.05] hover:border-red-500/20 hover:text-red-300 transition-all duration-300 backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-14 flex items-center justify-center gap-3">
              <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-white/10" />
              <span className="text-[11px] text-slate-600">then</span>
              <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <div className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-brand-500/20 backdrop-blur-sm" style={{ background: 'rgba(99,102,241,0.06)' }}>
              <Brain className="w-5 h-5 text-brand-400" />
              <span className="text-[14px] font-medium text-white">CampusOS connects everything</span>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES ═══ */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11px] text-brand-400 font-semibold uppercase tracking-widest mb-3">Modules</p>
              <h2 className="text-2xl md:text-4xl font-bold text-white">Nine systems. One intelligence.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { Icon: CalendarCheck, title: 'Smart Attendance', desc: 'Safe skips, threshold tracking, 5 states. Know exactly when you can skip.', color: 'from-blue-500 to-cyan-500' },
                { Icon: FileText, title: 'Document Intelligence', desc: 'Upload PDF → AI extracts deadlines, subjects, requirements automatically.', color: 'from-violet-500 to-purple-500' },
                { Icon: Wallet, title: 'Expense Tracker', desc: 'Manual + bank statement AI categorization. Budget alerts at 80% and 100%.', color: 'from-emerald-500 to-teal-500' },
                { Icon: Heart, title: 'Burnout Detection', desc: 'Mood, sleep, workload analysis. Adapts notifications when stressed.', color: 'from-orange-500 to-amber-500' },
                { Icon: ShoppingCart, title: 'Purchase Planner', desc: 'AI detects needs from documents. Tracks purchases. Amazon links.', color: 'from-pink-500 to-rose-500' },
                { Icon: Briefcase, title: 'Placement Hub', desc: 'Deadline tracking, prep roadmaps, career mentoring by AI.', color: 'from-indigo-500 to-blue-500' },
                { Icon: BookOpen, title: 'Knowledge Exchange', desc: 'Notes, PYQs, reviews. Earn Senior Points for contributing.', color: 'from-cyan-500 to-blue-500' },
                { Icon: MessageSquare, title: 'AI Chatbot', desc: 'Multi-session memory. Cross-module reasoning. Rich responses.', color: 'from-brand-500 to-violet-500' },
                { Icon: Music, title: 'Focus Sessions', desc: 'AI study playlist recommendations based on burnout and deadlines.', color: 'from-green-500 to-emerald-500' },
              ].map((f) => (
                <div key={f.title} className="group relative p-5 rounded-2xl border border-white/[0.05] hover:border-white/[0.12] transition-all duration-300 backdrop-blur-sm" style={{ background: 'rgba(13,15,25,0.5)' }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
                  <div className={`relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    <f.Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="relative z-10 text-[14px] font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="relative z-10 text-[12px] text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ AI WORKFLOW ═══ */}
        <section id="how" className="py-28 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[11px] text-brand-400 font-semibold uppercase tracking-widest mb-3">AI Workflow</p>
              <h2 className="text-2xl md:text-4xl font-bold text-white">One upload. A cascade of intelligence.</h2>
            </div>

            <div className="relative p-8 rounded-3xl border border-white/[0.05] backdrop-blur-sm" style={{ background: 'rgba(13,15,25,0.4)' }}>
              <div className="absolute left-12 top-8 bottom-8 w-px bg-gradient-to-b from-brand-500/50 via-violet-500/30 to-transparent" />
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Upload', desc: 'Student uploads Semester V Syllabus', icon: '📄' },
                  { step: '02', title: 'Extract', desc: 'AI identifies required items: Calculator, Lab Coat, Textbook', icon: '🤖' },
                  { step: '03', title: 'Shop', desc: 'Purchase planner updated with Amazon links', icon: '🛒' },
                  { step: '04', title: 'Budget', desc: 'Cost compared against remaining monthly budget', icon: '💳' },
                  { step: '05', title: 'Alert', desc: '"Lab Coat required for next practical" — Urgent', icon: '🔔' },
                  { step: '06', title: 'Remember', desc: 'Chatbot can now answer: "What do I need to buy?"', icon: '✨' },
                ].map((s) => (
                  <div key={s.step} className="flex items-start gap-4 pl-2">
                    <div className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-base shrink-0 relative z-10 backdrop-blur-sm" style={{ background: 'rgba(13,15,25,0.8)' }}>
                      {s.icon}
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] text-brand-400 font-mono">{s.step}</span>
                        <p className="text-[14px] font-semibold text-white">{s.title}</p>
                      </div>
                      <p className="text-[12px] text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ECOSYSTEM ═══ */}
        <section id="ecosystem" className="py-28 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[11px] text-brand-400 font-semibold uppercase tracking-widest mb-3">Ecosystem</p>
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">The more you use, the smarter it gets.</h2>
            <p className="text-[14px] text-slate-400 max-w-lg mx-auto mb-14">Every module feeds the AI layer. Cross-module reasoning creates insights no single app can provide.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[{ e: '📊', l: 'Attendance' }, { e: '💳', l: 'Finance' }, { e: '📄', l: 'Documents' }, { e: '🧠', l: 'Wellness' }, { e: '🛒', l: 'Shopping' }, { e: '💼', l: 'Placement' }, { e: '📚', l: 'Knowledge' }, { e: '🎧', l: 'Focus' }].map((m) => (
                <div key={m.l} className="p-4 rounded-xl border border-white/[0.05] hover:border-brand-500/20 transition-all duration-300 text-center backdrop-blur-sm" style={{ background: 'rgba(13,15,25,0.5)' }}>
                  <span className="text-xl mb-2 block">{m.e}</span>
                  <p className="text-[12px] font-medium text-slate-300">{m.l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ COMPARISON ═══ */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-[11px] text-brand-400 font-semibold uppercase tracking-widest mb-3">Why Different</p>
              <h2 className="text-2xl md:text-4xl font-bold text-white">Not another student app.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 rounded-2xl border border-white/[0.05] backdrop-blur-sm" style={{ background: 'rgba(13,15,25,0.5)' }}>
                <p className="text-[14px] font-semibold text-slate-300 mb-4">Traditional Apps</p>
                {['One feature, one purpose', 'No cross-feature context', 'Generic advice', 'Reactive — after failure', 'Data sits unused'].map((t) => (
                  <p key={t} className="text-[12px] text-slate-500 flex items-center gap-2 mb-2"><span className="text-red-400">✕</span>{t}</p>
                ))}
              </div>
              <div className="p-6 rounded-2xl border border-brand-500/20 backdrop-blur-sm" style={{ background: 'rgba(99,102,241,0.04)' }}>
                <p className="text-[14px] font-semibold text-white mb-4">CampusOS</p>
                {['Connected ecosystem', 'AI reasons across modules', 'Personalized to your data', 'Proactive — before failure', 'Adapts to your state'].map((t) => (
                  <p key={t} className="text-[12px] text-slate-300 flex items-center gap-2 mb-2"><Check className="w-3 h-3 text-brand-400" />{t}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-32 px-6 relative">
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
              Your college gives you information.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-cyan-400">CampusOS gives you intelligence.</span>
            </h2>
            <p className="text-[15px] text-slate-400 mb-8 max-w-md mx-auto">Stop surviving semesters. Start owning them.</p>
            <Button variant="brand" size="xl" onClick={handleDemoLogin} loading={loading}>
              <Sparkles className="w-4 h-4" /> Try CampusOS Free
            </Button>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="py-8 px-6 border-t border-white/[0.04]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="CampusOS" className="w-5 h-5" />
              <span className="text-[12px] text-slate-500">CampusOS — AI for Campus, Community, and Everyday Life</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Secure</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Fast</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Float animation */}
      <style>{`@keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }`}</style>
    </div>
  );
}
