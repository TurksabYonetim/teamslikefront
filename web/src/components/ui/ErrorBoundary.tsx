import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("ErrorBoundary:", error, info);
  }

  handleReset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-12 px-6">
            <h3 className="text-base font-semibold text-ink">
              Bir şeyler ters gitti
            </h3>
            <p className="text-sm text-muted max-w-sm">
              Bu bölüm yüklenirken bir hata oluştu.
            </p>
            <button
              onClick={this.handleReset}
              className="text-sm font-medium text-brand hover:underline"
            >
              Tekrar dene
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
