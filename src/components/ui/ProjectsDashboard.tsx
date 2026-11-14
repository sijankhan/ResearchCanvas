import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  X,
  Search,
  Copy,
  Trash2,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToastStore } from '../../store/useToastStore';

export const ProjectsDashboard: React.FC = () => {
  const {
    isProjectsDashboardOpen,
    setProjectsDashboardOpen,
    projectsList,
    project,
    switchProject,
    createBlankProject,
    deleteProject,
    duplicateCurrentProject,
  } = useCanvasStore();

  const [searchQuery, setSearchQuery] = useState('');

  if (!isProjectsDashboardOpen) return null;

  const filtered = projectsList.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl bg-[#181a20] border border-white/10 rounded-3xl shadow-floating p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-glow">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Research Projects & Modules</h3>
              <p className="text-xs text-slate-400">Open recent visual research canvases or start a new study</p>
            </div>
          </div>
          <button
            onClick={() => setProjectsDashboardOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search + Create */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={createBlankProject}
            className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Blank Canvas</span>
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filtered.map((item) => {
            const isCurrent = item.id === project.id;
            return (
              <div
                key={item.id}
                onClick={() => switchProject(item.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-sky-500/10 border-sky-500/40 shadow-glow'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider flex items-center gap-1">
                      {isCurrent && <Sparkles className="w-3 h-3" />}
                      {isCurrent ? 'Active Project' : 'Project'}
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {isCurrent && (
                        <button
                          onClick={duplicateCurrentProject}
                          title="Clone Project"
                          className="p-1 rounded text-slate-400 hover:text-white"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {projectsList.length > 1 && (
                        <button
                          onClick={() => {
                            useToastStore.getState().showConfirm({
                              title: 'Delete Project',
                              message: `Are you sure you want to permanently delete "${item.title}"? This cannot be undone.`,
                              confirmLabel: 'Delete Project',
                              isDestructive: true,
                              onConfirm: () => deleteProject(item.id),
                            });
                          }}
                          title="Delete Project"
                          aria-label={`Delete project ${item.title}`}
                          className="p-1 rounded text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-semibold text-sm text-white mb-1 truncate">{item.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {item.description || 'Visual research workspace with multiple interactive boards.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {item.boardsCount} {item.boardsCount === 1 ? 'board' : 'boards'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
