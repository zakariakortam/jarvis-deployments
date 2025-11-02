import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                <svg
                  className="h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Application Error
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Something went wrong. Please try refreshing the page.
                </p>
              </div>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Error Details:
                </h2>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 font-mono text-sm text-red-800 dark:text-red-200 overflow-auto">
                  <p className="font-bold mb-2">{this.state.error.toString()}</p>
                  {this.state.errorInfo && (
                    <pre className="text-xs whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.handleReset}
                className="btn-primary flex-1"
              >
                Reload Application
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="btn-secondary flex-1"
              >
                Go to Dashboard
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              <p>
                If this problem persists, please contact your system administrator
                or technical support.
              </p>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
