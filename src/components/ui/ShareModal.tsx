import React from 'react';
import {
  Share2,
  X,
  FileCode,
  ImageIcon,
  Globe,
  Lock,
  Users,
  Clock,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { exportProjectToJson, exportToPng } from '../../utils/export';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, setShareModalOpen, project, getElements } = useCanvasStore();

  if (!isShareModalOpen) return null;

  const elements = getElements();
  const shareUrl = `${window.location.origin}/canvas/${project.id}`;

  const handleExportJson = () => {
    exportProjectToJson(project);
  };

  const handleExportPng = () => {
    exportToPng(elements, project.title);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#181a20] border border-slate-200 dark:border-white/10 rounded-3xl shadow-floating p-6 text-slate-800 dark:text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">Export & Share Project</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{project.title}</p>
            </div>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Immediate Export Actions */}
          <div>
            <label className="block text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
              Immediate Export & Offline Sharing
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-left transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-medium text-xs text-slate-900 dark:text-white block">Download JSON</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Full project backup</span>
                </div>
              </button>

              <button
                onClick={handleExportPng}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-left transition-all group"
              >
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:bg-sky-500/20 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-medium text-xs text-slate-900 dark:text-white block">Download PNG</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">High-res canvas render</span>
                </div>
              </button>
            </div>
          </div>

          <div className="h-[1px] bg-slate-200 dark:bg-white/10" />

          {/* Cloud Link Sharing (Disabled - Coming Soon) */}
          <div className="opacity-70">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Shareable Web Link
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                <Clock className="w-2.5 h-2.5" />
                Coming soon
              </span>
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl cursor-not-allowed">
              <input
                type="text"
                disabled
                value={shareUrl}
                className="flex-1 bg-transparent px-2 text-xs text-slate-500 outline-none truncate font-mono cursor-not-allowed"
              />
              <button
                disabled
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-500 text-xs font-medium cursor-not-allowed"
              >
                Copy Link
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Cloud link hosting will be available with team cloud synchronization.
            </p>
          </div>

          {/* Collaborator invitations (Disabled - Coming Soon) */}
          <div className="opacity-70">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Collaborator Invitations & Permissions
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                <Clock className="w-2.5 h-2.5" />
                Coming soon
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col items-center gap-1 text-center text-slate-500 cursor-not-allowed">
                <Lock className="w-4 h-4" />
                <span className="font-medium text-[11px]">Private</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col items-center gap-1 text-center text-slate-500 cursor-not-allowed">
                <Globe className="w-4 h-4" />
                <span className="font-medium text-[11px]">Can View</span>
              </div>
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] flex flex-col items-center gap-1 text-center text-slate-500 cursor-not-allowed">
                <Users className="w-4 h-4" />
                <span className="font-medium text-[11px]">Can Edit</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                disabled
                placeholder="colleague@institution.edu"
                className="flex-1 bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-500 outline-none cursor-not-allowed"
              />
              <button
                disabled
                className="px-3 py-1.5 bg-slate-200 dark:bg-white/5 text-slate-500 text-xs rounded-xl cursor-not-allowed"
              >
                Invite
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            onClick={() => setShareModalOpen(false)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 font-semibold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
