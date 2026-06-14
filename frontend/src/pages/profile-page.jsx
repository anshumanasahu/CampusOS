import { useState } from 'react';
import { useProfile } from '../hooks/use-profile.js';
import { useAuth } from '../hooks/use-auth.js';
import Card from '../components/shared/card.jsx';
import Button from '../components/shared/button.jsx';
import StatusTag from '../components/shared/status-tag.jsx';
import LoadingSpinner from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';

export default function ProfilePage() {
  const { profile, loading, error, updatePreferences, resetDemo, refreshProfile } = useProfile();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const handleEdit = () => {
    setForm({ name: profile?.user?.name || '', college: profile?.user?.college || '', semester: profile?.user?.semester || '', branch: profile?.user?.branch || '' });
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences(form);
      setEditing(false);
    } catch {}
    setSaving(false);
  };

  const handleReset = async () => {
    if (window.confirm('Reset all demo data? This cannot be undone.')) {
      await resetDemo();
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={refreshProfile} />;

  const { academics, wellness, finances, contributions } = profile || {};

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      {/* User Info */}
      <Card>
        {!editing ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold">
                {profile?.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">{profile?.user?.name}</p>
                <p className="text-sm text-slate-500">{profile?.user?.email}</p>
                <p className="text-xs text-slate-400">{[profile?.user?.branch, profile?.user?.college, profile?.user?.semester && `Sem ${profile.user.semester}`].filter(Boolean).join(' • ')}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={handleEdit}>Edit</Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-3">
            <input type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input type="text" placeholder="College" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input type="text" placeholder="Branch" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input type="number" placeholder="Semester" min="1" max="12" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={saving}>Save</Button>
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academics */}
        <Card title="Academics & Progress">
          {academics ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Overall Attendance</span><span className="font-medium">{formatPercentage(academics.overallAttendance)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Subjects</span><span className="font-medium">{academics.totalSubjects}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Upcoming Deadlines</span><span className="font-medium">{academics.upcomingDeadlines}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Confirmed Documents</span><span className="font-medium">{academics.confirmedDocuments}</span></div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No academic data yet</p>
          )}
        </Card>

        {/* Wellness */}
        <Card title="Wellness & Burnout">
          {wellness?.hasData ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Burnout Level</span><StatusTag status={wellness.currentLevel} /></div>
              <div className="flex justify-between"><span className="text-slate-500">Score</span><span className="font-medium">{wellness.currentScore}/100</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Check-ins</span><span className="font-medium">{wellness.totalCheckins}</span></div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No wellness data yet. Try a daily check-in.</p>
          )}
        </Card>

        {/* Finances */}
        <Card title="Finances">
          {finances ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">This Month</span><span className="font-medium">{formatCurrency(finances.totalSpent)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Budget</span><span className="font-medium">{formatCurrency(finances.totalBudget)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Remaining</span><span className="font-medium text-green-600">{formatCurrency(finances.remaining)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Transactions</span><span className="font-medium">{finances.transactionCount}</span></div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No finance data yet</p>
          )}
        </Card>

        {/* Contributions */}
        <Card title="Contributions">
          {contributions ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Good Senior Points</span><span className="font-bold text-indigo-600">{contributions.totalPoints}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Resources Shared</span><span className="font-medium">{contributions.totalContributions}</span></div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No contributions yet</p>
          )}
        </Card>
      </div>

      {/* Account Actions */}
      {user?.isDemo && (
        <Card title="Demo Account">
          <p className="text-sm text-slate-500 mb-3">Reset demo data to restore the original seeded state.</p>
          <Button variant="danger" onClick={handleReset}>Reset Demo Data</Button>
        </Card>
      )}
    </div>
  );
}
