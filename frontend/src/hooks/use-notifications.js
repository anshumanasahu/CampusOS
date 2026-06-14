import { useContext, useCallback } from 'react';
import { NotificationContext } from '../context/notification-context.jsx';

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
