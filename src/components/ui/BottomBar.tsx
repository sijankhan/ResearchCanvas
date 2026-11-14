import React, { useState } from 'react';
import {
  Plus,
  LayoutGrid,
  MoreVertical,
  Trash2,
  Copy,
  Edit2,
  Compass,
  Maximize2,
  Activity,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToastStore } from '../../store/useToastStore';

interface Props {
  isMiniMapOpen: boolean;
  onToggleMiniMap: () => void;
}

export const BottomBar: React.FC<Props> = ({ isMiniMapOpen, onToggleMiniMap }) => {
  const {
    project,
    activeBoardId,
    setActiveBoard,
    addBoard,
    deleteBoard,
    renameBoard,
    duplicateBoard,
    getCamera,
    zoomToFit,
    getElements,
  } = useCanvasStore();

  const [activeMenuBoardId, setActiveMenuBoardId] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showOverview, setShowOverview] = useState(false);

  const camera = getCamera();
  const elements = getElements();

  const handleStartRename = (id: string, currentTitle: string) => {
    setEditingBoardId(id);
    setEditTitle(currentTitle);
    setActiveMenuBoardId(null);
  };

  const handleFinishRename = (id: string) => {
    if (editTitle.trim()) {
      renameBoard(id, editTitle.trim());
    }
    setEditingBoardId(null);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#181a20]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-40 flex items-center justify-between px-4 select-none transition-colors duration-200">
      {/* Left: Board / Page Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-[65vw] py-1">
        {/* Page Overview Toggle */}
        <button
          onClick={() => setShowOverview(!showOverview)}
          title="Board / Page Overview"
          className={`p-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 mr-1 ${
            showOverview ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[11px] font-medium hidden md:inline">Boards ({project.boards.length})</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-200 dark:bg-white/10 mr-1" />

        {/* Board Tabs */}
        {project.boards.map((b) => {
          const isActive = b.id === activeBoardId;
          const isEditing = editingBoardId === b.id;

          return (
            <div
              key={b.id}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40 shadow-glow'
                  : 'bg-slate-100/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleFinishRename(b.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFinishRename(b.id);
                    if (e.key === 'Escape') setEditingBoardId(null);
                  }}
                  autoFocus
                  className="bg-white dark:bg-black/40 border border-sky-500/60 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white outline-none w-28"
                />
              ) : (
                <button
                  onClick={() => setActiveBoard(b.id)}
                  className="truncate max-w-[140px] text-left"
                >
                  {b.title}
                </button>
              )}

              {/* Context Menu Trigger */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuBoardId(activeMenuBoardId === b.id ? null : b.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-slate-950 dark:hover:text-white transition-opacity p-0.5 rounded"
              >
                <MoreVertical className="w-3 h-3" />
              </button>

              {/* Dropdown Menu */}
              {activeMenuBoardId === b.id && (
                <div className="absolute bottom-10 left-0 w-36 bg-white dark:bg-[#1b1d22] border border-slate-200 dark:border-white/10 rounded-xl shadow-floating p-1 flex flex-col gap-0.5 z-50">
                  <button
                    onClick={() => handleStartRename(b.id, b.title)}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-left"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      duplicateBoard(b.id);
                      setActiveMenuBoardId(null);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-left"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Duplicate</span>
                  </button>
                  {project.boards.length > 1 && (
                    <button
                      onClick={() => {
                        setActiveMenuBoardId(null);
                        useToastStore.getState().showConfirm({
                          title: 'Delete Board',
                          message: `Are you sure you want to delete "${b.title}"? All elements on this board will be removed.`,
                          confirmLabel: 'Delete Board',
                          isDestructive: true,
                          onConfirm: () => deleteBoard(b.id),
                        });
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 rounded-lg text-left"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Board button */}
        <button
          onClick={() => addBoard()}
          title="Add New Board (+)"
          className="p-1.5 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Radar Toggle & Status Indicators */}
      <div className="flex items-center gap-3">
        {/* Coordinates */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100/80 dark:bg-white/[0.03] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
          <Activity className="w-3 h-3 text-sky-500 dark:text-sky-400" />
          <span>X: {Math.round(-camera.x)}</span>
          <span className="text-slate-300 dark:text-white/20">|</span>
          <span>Y: {Math.round(-camera.y)}</span>
          <span className="text-slate-300 dark:text-white/20">|</span>
          <span className="text-slate-800 dark:text-slate-300">{elements.length} items</span>
        </div>

        {/* Fit to screen */}
        <button
          onClick={() => zoomToFit(window.innerWidth, window.innerHeight)}
          title="Zoom to Fit Elements"
          className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* MiniMap Radar Toggle */}
        <button
          onClick={onToggleMiniMap}
          title={isMiniMapOpen ? 'Hide MiniMap' : 'Show MiniMap'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors border ${
            isMiniMapOpen
              ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-sky-500/40 shadow-glow'
              : 'bg-slate-100/80 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-white/5'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span className="text-[11px] font-medium hidden sm:inline">Radar</span>
        </button>

        {/* Zoom percent indicator */}
        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 px-2">
          {Math.round(camera.zoom * 100)}%
        </span>
      </div>

      {/* Page Overview Modal Overlay */}
      {showOverview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#1b1d22] border border-slate-200 dark:border-white/10 rounded-3xl shadow-floating p-6 text-slate-800 dark:text-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white">Board & Slide Overview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All boards and study modules in this research project</p>
              </div>
              <button
                onClick={() => setShowOverview(false)}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {project.boards.map((b, idx) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setActiveBoard(b.id);
                    setShowOverview(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    b.id === activeBoardId
                      ? 'bg-sky-500/10 border-sky-500/50 shadow-glow'
                      : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400 mb-1">
                    <span>Board #{idx + 1}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{b.elements.length} items</span>
                  </div>
                  <h4 className="text-xs font-medium text-slate-900 dark:text-white truncate">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {b.description || 'Interactive whiteboard board'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
