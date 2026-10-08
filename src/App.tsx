import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { Login } from './pages/Login';
import { AdminPanel } from './pages/AdminPanel';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Contacts } from './pages/Contacts';
import { Companies } from './pages/Companies';
import { Deals } from './pages/Deals';
import { Tasks } from './pages/Tasks';
import { Activities } from './pages/Activities';
import { Reports } from './pages/Reports';
import { AiAssistant } from './pages/AiAssistant';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Standalone Full-screen Authentication Routes */}
                <Route path="/login" element={<Login />} />

                {/* Authenticated CRM Application Shell */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/companies" element={<Companies />} />
                  <Route path="/deals" element={<Deals />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/ai-assistant" element={<AiAssistant />} />
                  <Route path="/ai" element={<Navigate to="/ai-assistant" replace />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
