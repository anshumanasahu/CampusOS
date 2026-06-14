import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth.js';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '◻️' },
  { path: '/documents', label: 'Documents', icon: '📄' },
  { path: '/attendance', label: 'Attendance', icon: '📊' },
  { path: '/expenses', label: 'Expenses', icon: '💳' },
  { path: '/knowledge', label: 'Knowledge', icon: '📚' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar({ isOpen, onClose, onOpenChatbot, onOpenNotifications }) {
  const { logout, user } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 md:hidden transition-opacity" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-[260px] z-50
        bg-slate-900 flex flex-col
        transform transition-transform duration-200 ease-out
        md:translate-x-0 md:static md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-glow">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">CampusOS</h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">AI Student Assistant</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
          <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <p className="px-3 py-2 mt-4 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Tools</p>

          <button
            onClick={() => { onOpenChatbot?.(); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150"
          >
            <span className="text-sm">✨</span>
            <span>AI Assistant</span>
            <span className="ml-auto text-[9px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded-full">AI</span>
          </button>

          <button
            onClick={() => { onOpenNotifications?.(); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150 md:hidden"
          >
            <span className="text-sm">🔔</span>
            <span>Notifications</span>
          </button>
        </nav>

        {/* User & Logout */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.branch || 'Student'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150"
          >
            <span className="text-sm">↗️</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
