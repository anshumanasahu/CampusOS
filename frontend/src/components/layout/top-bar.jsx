import { useAuth } from '../../hooks/use-auth.js';
import { useNotifications } from '../../hooks/use-notifications.js';
import { useTheme } from '../../hooks/use-theme.js';

export default function TopBar({ onToggleSidebar, onToggleNotifications }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-100 dark:border-slate-800/60 px-4 md:px-6 h-14 flex items-center justify-between">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="md:hidden p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-slate-800 transition-colors" aria-label="Menu">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:block">
          <p className="text-body text-slate-800 dark:text-slate-200 font-medium">{greeting()}, {user?.name?.split(' ')[0] || 'Student'}</p>
        </div>
        <div className="md:hidden flex items-center gap-1.5">
          <img src="/logo.svg" alt="CampusOS" className="w-5 h-5 rounded-md" />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <span className="hidden lg:block text-caption text-slate-400 dark:text-slate-500 mr-2">
          {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
          )}
        </button>

        {/* Notifications */}
        <button onClick={onToggleNotifications} className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all" aria-label="Notifications">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-scale-in ring-2 ring-white dark:ring-[#1a1d2e]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div className="hidden sm:flex items-center gap-2 ml-1 pl-2 border-l border-slate-100 dark:border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-[#1a1d2e] shadow-xs">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </div>
      </div>
    </header>
  );
}
