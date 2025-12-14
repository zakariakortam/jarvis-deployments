import { Component } from 'react';
import Game from './components/Game';
import './styles/index.css';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebCraft Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <div className="error-content">
            <div className="error-icon">!</div>
            <h2>Something went wrong</h2>
            <p>An unexpected error occurred in WebCraft.</p>
            <pre className="error-details">
              {this.state.error?.message || 'Unknown error'}
            </pre>
            <button
              className="menu-btn primary"
              onClick={() => window.location.reload()}
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
}

export default App;
