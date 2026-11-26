import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let displayMessage = error.message || 'Đã xảy ra lỗi không mong muốn.';
    try {
      const parsed = JSON.parse(error.message) as { error?: string; operationType?: string };
      if (parsed && parsed.error) {
        displayMessage = `Lỗi đồng bộ dữ liệu (${parsed.operationType || 'firestore'}): ${parsed.error}`;
      }
    } catch {
      // Keep raw error message
    }
    return { hasError: true, message: displayMessage };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught application error:', error, info);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070B14] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#0E1525] border border-rose-500/40 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-300">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="font-heading text-xl font-bold text-slate-50">
                Đã xảy ra sự cố kết nối dữ liệu
              </h2>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed break-words">
              {this.state.message}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-400 text-slate-950 text-sm font-semibold hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-[#131C31] border border-slate-700 text-slate-200 text-sm font-medium hover:border-cyan-400/50 transition-colors cursor-pointer"
              >
                Tải lại trang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
