import React, { useEffect, Suspense, lazy } from 'react';
import { useCityStore } from '../../store/cityStore';
import { motion } from 'framer-motion';
import KPIGrid from '../KPIGrid';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';

const SystemMap = lazy(() => import('../SystemMap'));
const TrendCharts = lazy(() => import('../TrendCharts'));
const DataTable = lazy(() => import('../DataTable'));
const AlertPanel = lazy(() => import('../AlertPanel'));

const Dashboard = () => {
  const {
    activeSystem,
    darkMode,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    lastUpdated
  } = useCityStore();

  useEffect(() => {
    // Initial data load
    refreshData();
    startAutoRefresh(2000);

    return () => {
      stopAutoRefresh();
    };
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-[1920px] mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Smart City Control System
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Real-time monitoring of 10,000+ sensors across all city systems
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Loading...'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">Live</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <ErrorBoundary>
            <KPIGrid />
          </ErrorBoundary>

          {/* Alert Panel */}
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <AlertPanel />
            </Suspense>
          </ErrorBoundary>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Map View - Takes 2 columns on XL screens */}
            <div className="xl:col-span-2">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <SystemMap />
                </Suspense>
              </ErrorBoundary>
            </div>

            {/* Trend Charts */}
            <div className="xl:col-span-1">
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner />}>
                  <TrendCharts />
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>

          {/* Data Table */}
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <DataTable />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
