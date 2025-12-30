// Main App Component with React Router
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import HomePage from './components/HomePage';
import WasteClassifier from './components/WasteClassifier';
import StreetAnalyzer from './components/StreetAnalyzer';
import Heatmap from './components/Heatmap';
import History from './components/History';
import Navigation from './components/Navigation';

import { getReports } from './services/superbaseConfig';
import AuthGuard from './components/AuthGuard';
import { auth } from './services/firebaseAuth';

// Main Layout Component
function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Determine current page from URL
  const currentPage =
    location.pathname === '/' ? 'home' : location.pathname.slice(1);

  // ✅ loadStats wrapped with useCallback (ESLint-safe)
  const loadStats = useCallback(async () => {
    if (statsLoading) return;

    setStatsLoading(true);
    try {
      const reports = await getReports(100);

      const wasteReports = reports.filter(
        (r) => r.type === 'waste'
      ).length;

      const streetReports = reports.filter(
        (r) => r.type === 'street'
      ).length;

      setStats({
        totalReports: reports.length,
        wasteReports,
        streetReports,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [statsLoading]);

  // ✅ Proper dependency list
  useEffect(() => {
    loadStats();
  }, [location.pathname, loadStats]);

  // Debug logging (runs once)
  useEffect(() => {
    if (auth.currentUser) {
      console.log('USER ID:', auth.currentUser.uid);
      console.log('USER NAME:', auth.currentUser.displayName);
    }
  }, []);

  const handleNavigate = (page) => {
    const path = page === 'home' ? '/' : `/${page}`;
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="app-container">
        <Navigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        <main className="py-4">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onNavigate={handleNavigate}
                  stats={stats}
                />
              }
            />
            <Route path="/classifier" element={<WasteClassifier />} />
            <Route path="/street" element={<StreetAnalyzer />} />
            <Route path="/heatmap" element={<Heatmap />} />
            <Route path="/history" element={<History />} />

            {/* Fallback route */}
            <Route
              path="*"
              element={
                <HomePage
                  onNavigate={handleNavigate}
                  stats={stats}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
