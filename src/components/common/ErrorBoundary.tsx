import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, Download, RefreshCw, RotateCcw } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { exportProjectToJson } from '../../utils/export';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleExportBackup = async () => {
    try {
      const project = useCanvasStore.getState().project;
      await exportProjectToJson(project);
    } catch (err) {
      console.error('Failed to export backup JSON', err);
      // Fallback: try raw localStorage backup
      const activeProj = localStorage.getItem('research_canvas_active_project_id_v2');
      if (activeProj) {
        const raw = localStorage.getItem(`research_proj_${activeProj}`);
        if (raw) {
          const blob = new Blob([raw], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `emergency_backup_${Date.now()}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
    }
  };

  private handleResetWorkspace = () => {
    if (window.confirm('Resetting workspace will clear local cached session. Ensure you have exported a backup. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0f1115] text-slate-200 select-none">
          <div className="w-full max-w-xl p-8 bg-[#181a20] border border-rose-500/30 rounded-3xl shadow-floating space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400">
                <AlertOctagon className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Application Encountered an Unexpected Error
                </h2>
                <p className="text-xs text-slate-400">
                  ResearchCanvas has safely isolated the failure to protect your project data.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/5 font-mono text-[11px] text-rose-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-sky-500/5 border border-sky-500/20 text-xs text-slate-300 space-y-2">
              <span className="font-semibold text-sky-400 block">Recovery Recommendations:</span>
              <p>
                1. Click <strong>Export Emergency Backup</strong> below to save your in-memory boards and elements as a JSON file.
              </p>
              <p>
                2. Reload the page to resume work. If the error persists, use <strong>Reset Workspace</strong> and re-import your backup.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                onClick={this.handleExportBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Emergency Backup</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={this.handleResetWorkspace}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-rose-400 text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Workspace</span>
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload App</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
