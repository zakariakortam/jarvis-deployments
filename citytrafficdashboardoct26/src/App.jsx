import { Suspense, lazy, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from './components/Header'
import Layout from './components/Layout'
import useSimulation from './hooks/useSimulation'
import useTrafficStore from './store/trafficStore'

// Lazy load components for code splitting
const TrafficMap = lazy(() => import('./components/Map'))
const TrafficGauges = lazy(() => import('./components/Gauges'))
const TrafficCharts = lazy(() => import('./components/Charts'))
const EventTable = lazy(() => import('./components/EventTable'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"
    />
  </div>
)

function App() {
  const { setDarkMode } = useTrafficStore()

  // Initialize dark mode based on system preference
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setDarkMode(e.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [setDarkMode])

  // Initialize simulation
  useSimulation()

  return (
    <Layout>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 p-6 space-y-6">
          {/* Map Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-[500px] lg:h-[600px]"
            aria-label="Traffic map view"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <TrafficMap />
            </Suspense>
          </motion.section>

          {/* Gauges Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            aria-label="Traffic metrics gauges"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <TrafficGauges />
            </Suspense>
          </motion.section>

          {/* Charts Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            aria-label="Traffic trend charts"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <TrafficCharts />
            </Suspense>
          </motion.section>

          {/* Events Table Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            aria-label="Active events table"
          >
            <Suspense fallback={<LoadingSpinner />}>
              <EventTable />
            </Suspense>
          </motion.section>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
          <div className="px-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                &copy; 2025 City Traffic Management Dashboard. All rights reserved.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Production v1.0.0</span>
                <span>&bull;</span>
                <span>Real-time simulation</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  )
}

export default App
