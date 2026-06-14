import { useEffect } from 'react';
import { useNotifications } from '../../hooks/use-notifications.js';
import Drawer from '../shared/drawer.jsx';
import Button from '../shared/button.jsx';
import StatusTag from '../shared/status-tag.jsx';
import LoadingSpinner from '../shared/loading-spinner.jsx';
import EmptyState from '../shared/empty-state.jsx';
import { formatDateTime } from '../../utils/formatters.js';

export default function NotificationDrawer({ isOpen, onClose }) {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    dismissNotification,
    dismissAll,
    clearViewedNotifications,
  } = useNotifications();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  return (
    <Drawer isOpen={isOpen} title="Notifications" onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 flex gap-2">
            <Button variant="secondary" onClick={dismissAll} className="text-xs px-2 py-1">
              Mark all read
            </Button>
            <Button variant="secondary" onClick={clearViewedNotifications} className="text-xs px-2 py-1">
              Clear read
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading && <LoadingSpinner text="Loading notifications..." />}

          {!loading && notifications.length === 0 && (
            <EmptyState
              title="All caught up"
              description="No notifications right now."
            />
          )}

          {!loading && notifications.length > 0 && (
            <div className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 ${!n.isRead ? 'bg-indigo-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusTag status={n.priority} />
                        <span className="text-xs text-slate-400">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-800 truncate">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <button
                        onClick={() => dismissNotification(n._id)}
                        className="text-slate-400 hover:text-slate-600 text-xs shrink-0"
                        aria-label="Dismiss"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center py-4">{error}</p>
          )}
        </div>
      </div>
    </Drawer>
  );
}
