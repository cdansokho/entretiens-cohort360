import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="min-h-screen bg-surface flex items-center justify-center p-6"
          role="alert"
        >
          <div className="max-w-md w-full rounded-2xl border border-border bg-card shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-danger/10 text-danger mb-4" aria-hidden>
              <AlertTriangle size={28} strokeWidth={2} />
            </div>
            <h1 className="text-xl font-bold text-text mb-2">
              Une erreur est survenue
            </h1>
            <p className="text-sm text-text-secondary mb-6">
              L’application a rencontré un problème. Vous pouvez réessayer ou
              recharger la page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-light transition cursor-pointer"
              >
                <RefreshCw size={18} />
                Réessayer
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-border px-4 py-2.5 text-sm font-semibold text-text hover:bg-surface-hover transition cursor-pointer"
              >
                Recharger la page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
