import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import useStore from './store/useStore'

// Layout
import Layout from './components/Layout'

// Pages
import HomePage from './pages/HomePage'
import CircuitTopologyPage from './pages/CircuitTopologyPage'
import ACAnalysisPage from './pages/ACAnalysisPage'
import TransientAnalysisPage from './pages/TransientAnalysisPage'
import FlashcardsPage from './pages/FlashcardsPage'
import PracticeProblemsPage from './pages/PracticeProblemsPage'
import QuizPage from './pages/QuizPage'
import FormulaSheetPage from './pages/FormulaSheetPage'

function App() {
  const darkMode = useStore(state => state.darkMode)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/circuits" element={<CircuitTopologyPage />} />
            <Route path="/ac-analysis" element={<ACAnalysisPage />} />
            <Route path="/transient" element={<TransientAnalysisPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/practice" element={<PracticeProblemsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/formulas" element={<FormulaSheetPage />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  )
}

export default App
