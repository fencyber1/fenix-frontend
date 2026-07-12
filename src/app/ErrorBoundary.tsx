import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    console.error('[ErrorBoundary]', error);
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full items-center justify-center p-8">
          <div className="max-w-md rounded-2xl border border-danger-500/20 bg-surface p-6 text-center">
            <h2 className="font-heading text-lg font-bold text-danger-500">Something went wrong</h2>
            <p className="mt-2 text-sm text-content-muted">{this.state.error.message}</p>
            <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-surface-3 p-3 text-left text-xs text-content-muted">
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
