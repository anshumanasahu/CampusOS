import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth.js';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/documents', label: 'Upload Documents', icon: '📄' },
  { path: '/attendance', label: 'Attendance', icon: '✅' },
  { path: '/expenses', label: 'Expenses', icon: '💰' },
  { path: '/knowledge', label: 'Knowledge Hub', icon: '📚' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar({ isOpen, onClose, onOpenChatbot, onOpenNotifications }) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-slate-900 z-50
          transform transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700">
          <h1 className="text-lg font-bold text-white">CampusOS</h1>
          <p className="text-xs text-slate-400">Student Operating System</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Chatbot trigger */}
          <button
            onClick={() => { onOpenChatbot?.(); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span className="text-base">🤖</span>
            <span>AI Chatbot</span>
          </button>

          {/* Notifications trigger */}
          <button
            onClick={() => { onOpenNotifications?.(); onClose?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors md:hidden"
          >
            <span className="text-base">🔔</span>
            <span>Notifications</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <span className="text-base">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
