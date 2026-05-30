import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VesselPerformance from './pages/VesselPerformance';
import Aggregated from './pages/Aggregated';
import DataEntry from './pages/DataEntry';
import Manage from './pages/Manage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/vessel-performance" element={<PrivateRoute><VesselPerformance /></PrivateRoute>} />
          <Route path="/aggregated" element={<PrivateRoute><Aggregated /></PrivateRoute>} />
          <Route path="/data-entry" element={<PrivateRoute><DataEntry /></PrivateRoute>} />
          <Route path="/manage" element={<PrivateRoute><Manage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
