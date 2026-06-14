import { useState } from 'react';
import { useDashboard } from '../hooks/use-dashboard.js';
import Card, { MetricCard } from '../components/shared/card.jsx';
import Badge from '../components/shared/badge.jsx';
import StatusTag from '../components/shared/status-tag.jsx';
import Button from '../components/shared/button.jsx';
import { PageSkeleton } from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import EmptyState from '../components/shared/empty-state.jsx';
import ShoppingWidget from '../components/shared/shopping-widget.jsx';
import FocusWidget from '../components/shared/focus-widget.jsx';
import { formatCurrency, formatPercentage } from '../utils/formatters.js';
import { getRelativeTime } from '../utils/date-helpers.js';
import { useAuth } from '../hooks/use-auth.js';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'academics', label: 'Academics' },
  { id: 'finance', label: 'Finance' },
  { id: 'wellness', label: 'Wellness' },
];

export default function DashboardPage() {
  const { dashboard, loading, error, refreshDashboard } = useDashboard();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) return <PageSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={refreshDashboard} />;
  if (!dashboard) return <EmptyState title="Welcome to CampusOS" description="Your AI-powered campus operating system." actionLabel="Get Started" />;

  const { todayClasses, upcomingDeadlines, attendanceSummary, budgetSummary, burnoutSummary, recentUploads, goodSeniorPoints, importantNotifications, quickActions } = dashboard;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="widget p-6 bg-gradient-to-br from-brand-600 via-violet-600 to-brand-700 dark:from-brand-900 dark:via-violet-900 dark:to-brand-950 border-none text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative">
          <p className="text-caption text-white/60 mb-0.5">Welcome back</p>
          <h1 className="text-heading text-white">{user?.name || 'Student'}</h1>
          <p className="text-body text-white/70 mt-1">
            {importantNotifications?.length > 0 ? `${importantNotifications.length} alerts need your attention` : 'All clear today ✨'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 dark:bg-slate-800/50 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-caption font-medium rounded-lg transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
        {activeTab === 'overview' && (
          <div className="space-y-5 stagger">
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard icon="📊" label="Attendance" value={formatPercentage(attendanceSummary?.overall?.percentage)} color="brand" />
              <MetricCard icon="⏰" label="Deadlines" value={upcomingDeadlines?.length || 0} color="warning" />
              <MetricCard icon="💳" label="Spent" value={formatCurrency(budgetSummary?.totalSpent)} color="success" />
              <MetricCard icon="🧠" label="Wellness" value={burnoutSummary?.hasData ? burnoutSummary.level : 'N/A'} color={burnoutSummary?.level === 'high' ? 'danger' : 'success'} />
            </div>

            {/* Schedule + Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Today's Schedule" subtitle={`${todayClasses?.length || 0} classes`}>
                {todayClasses?.length > 0 ? (
                  <div className="space-y-2">
                    {todayClasses.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-50 dark:bg-slate-800/50">
                        <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-caption font-bold shrink-0">{c.startTime}</div>
                        <div className="min-w-0">
                          <p className="text-body font-medium text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                          <p className="text-caption text-slate-500">{c.room || 'TBD'} · until {c.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-body text-slate-500 text-center py-6">No classes today 🎉</p>}
              </Card>

              <Card title="Deadlines" subtitle="Next 7 days">
                {upcomingDeadlines?.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingDeadlines.map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-2 h-2 rounded-full bg-warning-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-body font-medium text-slate-800 dark:text-slate-200 truncate">{d.title}</p>
                            <p className="text-caption text-slate-500">{d.label}</p>
                          </div>
                        </div>
                        <Badge text={getRelativeTime(d.date)} variant="warning" size="xs" />
                      </div>
                    ))}
                  </div>
                ) : <p className="text-body text-slate-500 text-center py-6">Nothing due ✅</p>}
              </Card>
            </div>

            {/* Notifications + Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card title="Notifications" action={importantNotifications?.length > 0 && <Badge text={`${importantNotifications.length}`} variant="danger" dot />}>
                {importantNotifications?.length > 0 ? (
                  <div className="space-y-2">
                    {importantNotifications.map((n, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-50 dark:bg-slate-800/30">
                        <StatusTag status={n.priority} />
                        <p className="text-caption text-slate-700 dark:text-slate-300">{n.title}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-caption text-slate-500 text-center py-4">All clear 🎉</p>}
              </Card>

              <Card title="Quick Actions">
                <div className="grid grid-cols-2 gap-2">
                  {quickActions?.map((a) => (
                    <a key={a.id} href={a.path || '#'} className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-slate-800/30 border border-transparent hover:border-brand-100 dark:hover:border-brand-800 transition-all text-caption text-slate-700 dark:text-slate-300 font-medium">
                      {a.label}
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'academics' && (
          <div className="space-y-5 stagger">
            <Card title="Attendance Summary">
              {attendanceSummary?.subjects?.length > 0 ? (
                <div className="space-y-3">
                  {attendanceSummary.subjects.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-slate-800/30">
                      <div>
                        <p className="text-body font-medium text-slate-800 dark:text-slate-200">{s.name}</p>
                        <p className="text-caption text-slate-500">Safe skips: {s.safeSkips} · Need: {s.classesNeeded}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-subheading font-bold ${s.percentage >= 75 ? 'text-success-600' : 'text-danger-600'}`}>{s.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No subjects" description="Add subjects in the Attendance module" />}
            </Card>

            <Card title="Recent Documents">
              {recentUploads?.length > 0 ? (
                <div className="space-y-2">
                  {recentUploads.map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50 dark:hover:bg-slate-800/30">
                      <p className="text-body text-slate-700 dark:text-slate-300 truncate">{d.fileName}</p>
                      <StatusTag status={d.status} />
                    </div>
                  ))}
                </div>
              ) : <p className="text-caption text-slate-500 text-center py-4">No uploads yet</p>}
            </Card>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-5 stagger">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard icon="💳" label="Total Spent" value={formatCurrency(budgetSummary?.totalSpent)} color="brand" />
              <MetricCard icon="🎯" label="Budget Set" value={budgetSummary?.budgetsSet || 0} color="success" />
              <MetricCard icon="⚠️" label="Alerts" value={budgetSummary?.alerts?.length || 0} color={budgetSummary?.alerts?.length > 0 ? 'warning' : 'success'} />
            </div>
            <ShoppingWidget />
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="space-y-5 stagger">
            {burnoutSummary?.hasData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard icon="🧠" label="Burnout Level" value={burnoutSummary.level} color={burnoutSummary.level === 'high' ? 'danger' : burnoutSummary.level === 'medium' ? 'warning' : 'success'} />
                <MetricCard icon="😊" label="Latest Mood" value={`${burnoutSummary.mood}/5`} color="brand" />
                <MetricCard icon="🔢" label="Score" value={burnoutSummary.score} color="brand" />
              </div>
            ) : (
              <Card><EmptyState title="No wellness data" description="Complete a daily check-in to start tracking" /></Card>
            )}
            <FocusWidget />
          </div>
        )}
      </div>

      {/* Senior Points (always visible) */}
      {goodSeniorPoints?.totalPoints > 0 && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center text-lg border border-amber-100 dark:border-amber-800/30">⭐</div>
            <div>
              <p className="text-subheading text-slate-900 dark:text-white">{goodSeniorPoints.totalPoints}</p>
              <p className="text-caption text-slate-500">Good Senior Points</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
