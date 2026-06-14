import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth.js';
import { LayoutDashboard, FileText, CalendarCheck, Wallet, BookOpen, User, Sparkles, Bell, LogOut } from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    ],
  },
  {
    label: 'Academics',
    items: [
      { path: '/documents', label: 'Documents', Icon: FileText },
      { path: '/attendance', label: 'Attendance', Icon: CalendarCheck },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/expenses', label: 'Expenses', Icon: Wallet },
    ],
  },
  {
    label: 'Community',
    items: [
      { path: '/knowledge', label: 'Knowledge Hub', Icon: BookOpen },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/profile', label: 'Profile', Icon: User },
    ],
  },
];

export default function Sidebar({ isOpen, onClose, onOpenChatbot, onOpenNotifications }) {
  const { logout, user } = useAuth();

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-[2px] z-40 md:hidden animate-fade-in" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full w-[240px] z-50
        bg-white dark:bg-[#0c0e16] border-r border-slate-100 dark:border-white/[0.06]
        flex flex-col
        transform transition-transform duration-200 ease-out
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <img src="/logo.svg" alt="CampusOS" className="w-7 h-7 rounded-lg" />
          <span className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">CampusOS</span>
        </div>

        {/* AI button */}
        <div className="px-3 mb-3">
          <button
            onClick={() => { onOpenChatbot?.(); onClose?.(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-caption font-medium
              bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/50 dark:to-violet-950/50
              border border-brand-100/60 dark:border-brand-800/30
              text-brand-700 dark:text-brand-300
              hover:from-brand-100 hover:to-violet-100 dark:hover:from-brand-900/40 dark:hover:to-violet-900/40
              transition-all duration-150"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Assistant</span>
            <span className="ml-auto text-[9px] bg-brand-500 text-white px-1.5 py-px rounded-full font-semibold">AI</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto space-y-5 no-scrollbar">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 group ${
                        isActive
                          ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-slate-200'
                      }`
                    }
                  >
                    <item.Icon className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {/* Mobile notifications */}
          <div className="md:hidden">
            <button
              onClick={() => { onOpenNotifications?.(); onClose?.(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-slate-600 dark:text-slate-400 hover:bg-surface-100 dark:hover:bg-white/[0.03] transition-all"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
          </div>
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white dark:ring-[#0c0e16] shadow-xs">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-caption font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-micro text-slate-400 dark:text-slate-600 truncate">{user?.college || 'Student'}</p>
            </div>
            <button onClick={logout} className="p-1.5 text-slate-400 dark:text-slate-600 hover:text-danger-500 dark:hover:text-danger-400 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-all" title="Sign out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
