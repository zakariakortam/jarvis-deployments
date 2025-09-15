import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';

// Components
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import EquipmentDetail from './pages/EquipmentDetail';
import Maintenance from './pages/Maintenance';
import Issues from './pages/Issues';
import QRScanner from './pages/QRScanner';
import Profile from './pages/Profile';

// Styles
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfflineProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/equipment" element={
                  <ProtectedRoute>
                    <Layout>
                      <Equipment />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/equipment/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <EquipmentDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/maintenance" element={
                  <ProtectedRoute>
                    <Layout>
                      <Maintenance />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/issues" element={
                  <ProtectedRoute>
                    <Layout>
                      <Issues />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/scan" element={
                  <ProtectedRoute>
                    <Layout>
                      <QRScanner />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </Router>
        </OfflineProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;