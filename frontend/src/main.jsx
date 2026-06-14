import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth-context.jsx';
import { NotificationProvider } from './context/notification-context.jsx';
import App from './app.jsx';
import './index.css';

// Initialize theme before render to prevent flash
const storedTheme = localStorage.getItem('campusos_theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
