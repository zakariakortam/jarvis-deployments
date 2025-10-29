import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Cpu,
  TrendingUp,
  BarChart3,
  Waves,
  Zap,
  BookOpen,
  Trophy,
  FileText,
  ArrowRight,
  BookMarked,
  Target,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Cpu,
    title: 'Circuit Topology',
    description: 'Learn RLC filters, Sallen-Key filters, and voltage follower circuits',
    path: '/circuits',
    color: 'bg-blue-500',
  },
  {
    icon: TrendingUp,
    title: 'Transfer Functions',
    description: 'Derive closed-loop gain using A(s) = G\'/s',
    path: '/transfer-functions',
    color: 'bg-purple-500',
  },
  {
    icon: BarChart3,
    title: 'Bode Plots',
    description: 'Master hand-drawn Bode plots and interpretation',
    path: '/bode-plots',
    color: 'bg-green-500',
  },
  {
    icon: Waves,
    title: 'Second-Order Systems',
    description: 'Analyze damping coefficient ζ and system response',
    path: '/second-order',
    color: 'bg-orange-500',
  },
  {
    icon: Zap,
    title: 'Capacitive Load',
    description: 'Study effects on voltage follower performance',
    path: '/capacitive-load',
    color: 'bg-red-500',
  },
  {
    icon: BookOpen,
    title: 'Practice Problems',
    description: 'Step-by-step solutions to master concepts',
    path: '/practice',
    color: 'bg-indigo-500',
  },
  {
    icon: Trophy,
    title: 'Quiz Mode',
    description: 'Test your knowledge with timed quizzes',
    path: '/quiz',
    color: 'bg-yellow-500',
  },
  {
    icon: FileText,
    title: 'Formula Sheet',
    description: 'Quick reference for all important equations',
    path: '/formulas',
    color: 'bg-pink-500',
  },
]

const HomePage = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-full text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          UCSD ECE 100 Study Guide
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          Master Circuit Analysis
          <br />& Filter Design
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Comprehensive interactive guide covering transfer functions, Bode plots,
          second-order systems, and more
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link to="/circuits" className="btn-primary flex items-center gap-2">
            Start Learning
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/quiz" className="btn-secondary flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Take a Quiz
          </Link>
        </div>
      </motion.div>

      {/* Key Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
        {[
          {
            icon: BookMarked,
            title: 'Comprehensive Coverage',
            description: 'All topics from the ECE 100 syllabus',
          },
          {
            icon: Target,
            title: 'Interactive Learning',
            description: 'Hands-on calculators and visualizations',
          },
          {
            icon: Sparkles,
            title: 'Progress Tracking',
            description: 'Monitor your learning journey',
          },
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="card hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Topics Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Explore Topics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
              >
                <Link
                  to={feature.path}
                  className="card hover:shadow-xl transition-all duration-200 hover:-translate-y-1 h-full flex flex-col"
                >
                  <div className={`p-3 ${feature.color} rounded-lg w-fit mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium mt-4">
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Course Coverage */}
      <div className="card bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          What You'll Master
        </h2>
        <ul className="space-y-3">
          {[
            'Derive closed-loop gain (transfer functions) for RLC filters, Sallen-Key filters, and voltage followers',
            'Analyze capacitive load effects on voltage follower circuit performance',
            'Compare transfer functions with second-order system equations and interpret ζ values',
            'Derive peak frequency and peak gain magnitude equations',
            'Draw accurate Bode plots by hand using straight-line approximations',
            'Interpret Bode plots for gain peaking, slopes, and system order',
          ].map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * index }}
              className="flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-primary-600 dark:bg-primary-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">{index + 1}</span>
              </div>
              <span className="text-gray-700 dark:text-gray-300">{item}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default HomePage
