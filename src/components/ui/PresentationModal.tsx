import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Radio,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const PresentationModal: React.FC = () => {
  const {
    isPresentationOpen,
    setPresentationOpen,
    project,
    activeBoardId,
    setActiveBoard,
  } = useCanvasStore();

  const [laserPointer, setLaserPointer] = useState<{ x: number; y: number } | null>(null);
  const [isLaserActive, setIsLaserActive] = useState(false);

  const boards = project.boards;
  const currentIndex = boards.findIndex((b) => b.id === activeBoardId);
  const activeBoard = boards[currentIndex] || boards[0];

  useEffect(() => {
    if (!isPresentationOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPresentationOpen(false);
      } else if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        if (currentIndex < boards.length - 1) {
          setActiveBoard(boards[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          setActiveBoard(boards[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationOpen, currentIndex, boards, setActiveBoard, setPresentationOpen]);

  if (!isPresentationOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0c0d0f] flex flex-col justify-between select-none animate-in fade-in duration-200 transition-colors"
      onMouseMove={(e) => {
        if (isLaserActive) {
          setLaserPointer({ x: e.clientX, y: e.clientY });
        }
      }}
    >
      {/* Top Presenter Bar */}
      <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-slate-200 dark:border-white/10 z-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            <span className="font-semibold text-sm text-slate-900 dark:text-white">
              {project.title}
            </span>
          </div>
          <span className="text-slate-300 dark:text-white/20">|</span>
          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
            Slide {currentIndex + 1} of {boards.length}: <span className="text-sky-600 dark:text-sky-300 font-semibold">{activeBoard.title}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Laser Pointer Toggle */}
          <button
            onClick={() => {
              setIsLaserActive(!isLaserActive);
              if (isLaserActive) setLaserPointer(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              isLaserActive
                ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Laser Pointer</span>
          </button>

          {/* Close / Exit Button */}
          <button
            onClick={() => setPresentationOpen(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors text-xs font-medium"
          >
            <X className="w-4 h-4" />
            <span>Exit (Esc)</span>
          </button>
        </div>
      </div>

      {/* Central Viewport Note Indicator */}
      <div className="flex-1 relative flex items-center justify-center pointer-events-none p-12">
        <div className="text-center space-y-2 max-w-xl p-8 rounded-3xl bg-white/80 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none backdrop-blur-md">
          <div className="flex items-center justify-center gap-2 text-sky-600 dark:text-sky-400 font-medium text-xs">
            <Layers className="w-4 h-4" />
            <span>Presenting Board {currentIndex + 1}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{activeBoard.title}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {activeBoard.description || 'Focus on the interconnected diagrams and evidence.'}
          </p>
          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            {activeBoard.elements.length} interactive canvas elements active in view
          </div>
        </div>
      </div>

      {/* Laser Pointer Dot */}
      {isLaserActive && laserPointer && (
        <div
          className="fixed pointer-events-none z-50 w-5 h-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_15px_5px_rgba(239,68,68,0.7)] animate-pulse"
          style={{ left: `${laserPointer.x}px`, top: `${laserPointer.y}px` }}
        />
      )}

      {/* Bottom Navigation Controls */}
      <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-black/40 backdrop-blur-md border-t border-slate-200 dark:border-white/10 z-50">
        <button
          onClick={() => {
            if (currentIndex > 0) setActiveBoard(boards[currentIndex - 1].id);
          }}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors text-xs font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Slide</span>
        </button>

        {/* Slide Dots */}
        <div className="flex items-center gap-2">
          {boards.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => setActiveBoard(b.id)}
              className={`h-2.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-8 bg-sky-500 dark:bg-sky-400' : 'w-2.5 bg-slate-300 dark:bg-white/20 hover:bg-slate-400 dark:hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (currentIndex < boards.length - 1) setActiveBoard(boards[currentIndex + 1].id);
          }}
          disabled={currentIndex === boards.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 font-semibold disabled:opacity-20 disabled:pointer-events-none transition-colors text-xs"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
