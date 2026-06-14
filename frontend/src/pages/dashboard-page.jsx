import { useDashboard } from '../hooks/use-dashboard.js';
import Card from '../components/shared/card.jsx';
import Badge from '../components/shared/badge.jsx';
import StatusTag from '../components/shared/status-tag.jsx';
import LoadingSpinner from '../components/shared/loading-spinner.jsx';
import ErrorMessage from '../components/shared/error-message.jsx';
import EmptyState from '../components/shared/empty-state.jsx';
import { formatDate, formatCurrency, formatPercentage } from '../utils/formatters.js';
import { getRelativeTime } from '../utils/date-helpers.js';

export default function DashboardPage() {
  const { dashboard, loading, error, refreshDashboard } = useDashboard();

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={refreshDashboard} />;
  if (!dashboard) return <EmptyState title="Welcome to CampusOS" description="Set up your subjects to get started." />;

  const { todayClasses, upcomingDeadlines, attendanceSummary, budgetSummary, burnoutSummary, recentUploads, goodSeniorPoints, importantNotifications, quickActions } = dashboard;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-slate-500 mb-1">Attendance</p>
          <p className="text-2xl font-bold text-indigo-600">{formatPercentage(attendanceSummary?.overall?.percentage)}</p>
          <p className="text-xs text-slate-400">{attendanceSummary?.overall?.totalSubjects || 0} subjects</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Deadlines</p>
          <p className="text-2xl font-bold text-amber-600">{upcomingDeadlines?.length || 0}</p>
          <p className="text-xs text-slate-400">this week</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Spent This Month</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetSummary?.totalSpent)}</p>
          <p className="text-xs text-slate-400">{budgetSummary?.alerts?.length || 0} alerts</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500 mb-1">Wellness</p>
          <p className="text-2xl font-bold">{burnoutSummary?.hasData ? <StatusTag status={burnoutSummary.level} /> : 'N/A'}</p>
          <p className="text-xs text-slate-400">{burnoutSummary?.hasData ? `Score: ${burnoutSummary.score}` : 'No data yet'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <Card title="Today's Classes">
          {todayClasses?.length > 0 ? (
            <div className="space-y-2">
              {todayClasses.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.room || 'No room'}</p>
                  </div>
                  <span className="text-sm text-slate-600">{c.startTime}–{c.endTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No classes today</p>
          )}
        </Card>

        {/* Upcoming Deadlines */}
        <Card title="Upcoming Deadlines">
          {upcomingDeadlines?.length > 0 ? (
            <div className="space-y-2">
              {upcomingDeadlines.map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.title}</p>
                    <p className="text-xs text-slate-500">{d.label}</p>
                  </div>
                  <Badge text={getRelativeTime(d.date)} variant={getRelativeTime(d.date).includes('overdue') ? 'danger' : 'warning'} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No deadlines this week</p>
          )}
        </Card>

        {/* Important Notifications */}
        <Card title="Notifications">
          {importantNotifications?.length > 0 ? (
            <div className="space-y-2">
              {importantNotifications.map((n, i) => (
                <div key={i} className="flex items-center gap-2 py-1">
                  <StatusTag status={n.priority} />
                  <span className="text-sm text-slate-700 truncate">{n.title}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">All caught up!</p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-2">
            {quickActions?.map((action) => (
              <a
                key={action.id}
                href={action.path || '#'}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 transition-colors text-sm text-slate-700"
              >
                {action.label}
              </a>
            ))}
          </div>
        </Card>
      </div>

      {/* Senior Points */}
      {goodSeniorPoints?.totalPoints > 0 && (
        <Card title="Good Senior Points">
          <p className="text-lg font-bold text-indigo-600">{goodSeniorPoints.totalPoints} points</p>
        </Card>
      )}
    </div>
  );
}
