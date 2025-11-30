import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-space-darker p-4">
          <div className="holo-panel p-8 max-w-lg text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-holo-red/20 flex items-center justify-center border border-holo-red/50">
              <span className="text-holo-red text-4xl font-display">!</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-holo-red mb-4 uppercase tracking-wider">
              System Malfunction
            </h2>
            <p className="text-holo-cyan/70 mb-6 font-system">
              A critical error has occurred in the command interface.
            </p>
            <div className="bg-space-darker/50 rounded p-4 mb-6 text-left border border-holo-red/20">
              <pre className="text-xs text-holo-red/80 font-mono overflow-auto max-h-32">
                {this.state.error?.message || 'Unknown system error'}
              </pre>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="holo-button w-full"
              >
                Reinitialize Systems
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="holo-button holo-button-success w-full"
              >
                Attempt Recovery
              </button>
            </div>
            <p className="text-holo-blue/40 text-xs mt-6 font-mono">
              ERROR CODE: SYS-{Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
