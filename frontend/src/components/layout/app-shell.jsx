import { useState } from 'react';
import Sidebar from './sidebar.jsx';
import TopBar from './top-bar.jsx';
import NotificationDrawer from './notification-drawer.jsx';
import ChatbotDrawer from './chatbot-drawer.jsx';

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-[#0f1117]">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onToggleNotifications={() => setIsNotificationDrawerOpen(!isNotificationDrawerOpen)}
        />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Notification Drawer (right side) */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
      />

      {/* Chatbot Drawer (right side) */}
      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}
