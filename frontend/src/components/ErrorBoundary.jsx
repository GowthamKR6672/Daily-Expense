import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h1>
            <p className="text-gray-700 mb-4">The application crashed while rendering.</p>
            <div className="bg-gray-100 p-4 rounded-xl overflow-auto text-sm text-red-800 font-mono mb-4 whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
            </div>
            <details className="bg-gray-100 p-4 rounded-xl overflow-auto text-xs text-gray-600 font-mono whitespace-pre-wrap cursor-pointer">
              <summary className="font-bold mb-2 text-gray-800">Component Stack</summary>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
