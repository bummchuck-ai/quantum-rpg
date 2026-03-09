'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: string; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Game Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-mono">
          <div className="border border-red-500/50 bg-red-500/5 rounded-xl p-8 max-w-md text-center space-y-4">
            <div className="text-red-500 text-xs font-black uppercase tracking-widest">SYSTEM_ERROR</div>
            <p className="text-zinc-400 text-sm">{this.state.error}</p>
            <button onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
              className="bg-amber-500 text-black font-black px-6 py-3 rounded-lg uppercase text-xs tracking-widest">
              REBOOT_SYSTEM
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
