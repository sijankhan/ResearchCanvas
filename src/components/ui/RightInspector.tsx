import React from 'react';
import {
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Lock,
  Unlock,
  Copy,
  Trash2,
  BringToFront,
  SendToBack,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

const COLOR_SWATCHES = [
  'transparent',
  '#ffffff',
  '#f87171',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#38bdf8',
  '#818cf8',
  '#c084fc',
  '#1e293b',
];

export const RightInspector: React.FC = () => {
  const {
    selectedIds,
    getElements,
    getActiveBoard,
    activeStyle,
    updateSelectedStyle,
    toggleLockSelected,
    deleteSelected,
    duplicateSelected,
    bringForward,
    sendBackward,
    alignSelected,
    distributeSelected,
    toggleAiStudio,
    isAiStudioOpen,
  } = useCanvasStore();

  const elements = getElements();
  const selectedElements = elements.filter((el) => selectedIds.includes(el.id));
  const isSelected = selectedElements.length > 0;
  const primary = selectedElements[0];
  const isLocked = primary?.isLocked;
  const currentStyle = isSelected ? primary.style : activeStyle;

  return (
    <aside className="fixed right-0 top-16 bottom-14 w-80 bg-white/95 dark:bg-[#181a20]/95 backdrop-blur-xl border-l border-slate-200 dark:border-white/10 z-30 flex flex-col shadow-floating overflow-hidden select-none transition-colors duration-200">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-sky-500 dark:text-sky-400" />
          <span className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
            {isSelected ? (selectedElements.length > 1 ? `${selectedElements.length} Items Selected` : primary.type.toUpperCase()) : 'Board Inspector'}
          </span>
        </div>

        {/* AI Studio Shortcut button */}
        <button
          onClick={toggleAiStudio}
          title="Open AI Studio"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors ${
            isAiStudioOpen
              ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
          <span className="text-[11px] font-medium">AI Studio</span>
        </button>
      </div>

      {/* Main Inspector Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {isSelected ? (
          <>
            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5">
              <button
                onClick={toggleLockSelected}
                title={isLocked ? 'Unlock Element' : 'Lock Element'}
                aria-label={isLocked ? 'Unlock Element' : 'Lock Element'}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLocked ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10'
                }`}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <button
                onClick={duplicateSelected}
                title="Duplicate (Ctrl+D)"
                aria-label="Duplicate Selected"
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={bringForward}
                title="Bring Forward"
                aria-label="Bring Forward"
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
              >
                <BringToFront className="w-4 h-4" />
              </button>
              <button
                onClick={sendBackward}
                title="Send Backward"
                aria-label="Send Backward"
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
              >
                <SendToBack className="w-4 h-4" />
              </button>
              <button
                onClick={deleteSelected}
                title="Delete (Del)"
                aria-label="Delete Selected"
                className="p-1.5 rounded-lg text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Multi-element Alignments */}
            {selectedElements.length > 1 && (
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Alignment & Distribution
                </span>
                <div className="grid grid-cols-6 gap-1 p-1 bg-slate-100/80 dark:bg-white/[0.03] rounded-xl border border-slate-200 dark:border-white/5">
                  <button onClick={() => alignSelected('left')} title="Align Left" aria-label="Align Left" className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex justify-center">
                    <AlignLeft className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => alignSelected('center')} title="Align Horizontal Center" aria-label="Align Center" className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex justify-center">
                    <AlignCenter className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => alignSelected('right')} title="Align Right" aria-label="Align Right" className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex justify-center">
                    <AlignRight className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => alignSelected('top')} title="Align Top" aria-label="Align Top" className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex justify-center">
                    <AlignStartVertical className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => alignSelected('middle')} title="Align Vertical Center" aria-label="Align Middle" className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex justify-center">
                    <AlignCenterVertical className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => alignSelected('bottom')} title="Align Bottom" aria-label="Align Bottom" className="p-1.5 rounded hover:bg-slate-200/70 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex justify-center">
                    <AlignEndVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => distributeSelected('horizontal')}
                    className="flex-1 py-1 rounded bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/10 text-[10px] text-slate-700 dark:text-slate-300"
                  >
                    Distribute Horiz
                  </button>
                  <button
                    onClick={() => distributeSelected('vertical')}
                    className="flex-1 py-1 rounded bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/10 text-[10px] text-slate-700 dark:text-slate-300"
                  >
                    Distribute Vert
                  </button>
                </div>
              </div>
            )}

            {/* Transform / Coordinates */}
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Transform & Geometry
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-300 font-semibold">X</span>
                  <span>{Math.round(primary.x)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-300 font-semibold">Y</span>
                  <span>{Math.round(primary.y)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-300 font-semibold">W</span>
                  <span>{Math.round(primary.width)}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-300 font-semibold">H</span>
                  <span>{Math.round(primary.height)}</span>
                </div>
              </div>
            </div>

            {/* Stroke Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Stroke Color
                </span>
                <input
                  type="color"
                  value={currentStyle.strokeColor.startsWith('#') ? currentStyle.strokeColor : '#38bdf8'}
                  onChange={(e) => updateSelectedStyle({ strokeColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSelectedStyle({ strokeColor: color })}
                    className={`h-6 rounded-md border transition-transform ${
                      currentStyle.strokeColor === color ? 'border-sky-500 dark:border-white scale-110 shadow-sm' : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/40'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Fill Color */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Fill Color
                </span>
                <input
                  type="color"
                  value={currentStyle.fillColor.startsWith('#') ? currentStyle.fillColor : '#ffffff'}
                  onChange={(e) => updateSelectedStyle({ fillColor: e.target.value })}
                  className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSelectedStyle({ fillColor: color })}
                    className={`h-6 rounded-md border transition-transform relative overflow-hidden ${
                      currentStyle.fillColor === color ? 'border-sky-500 dark:border-white scale-110 shadow-sm' : 'border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/40'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    {color === 'transparent' && (
                      <div className="absolute w-[1px] h-8 bg-red-400 rotate-45 top-0 left-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Stroke Width & Style */}
            <div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Border Stroke & Style
              </span>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 4, 8].map((w) => (
                  <button
                    key={w}
                    onClick={() => updateSelectedStyle({ strokeWidth: w })}
                    className={`flex-1 py-1 rounded-lg text-center font-mono text-[11px] transition-colors ${
                      currentStyle.strokeWidth === w
                        ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40'
                        : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {w}px
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateSelectedStyle({ strokeStyle: 'solid' })}
                  className={`flex-1 py-1 rounded-lg text-center text-[11px] transition-colors ${
                    currentStyle.strokeStyle === 'solid'
                      ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40'
                      : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Solid
                </button>
                <button
                  onClick={() => updateSelectedStyle({ strokeStyle: 'dashed' })}
                  className={`flex-1 py-1 rounded-lg text-center text-[11px] transition-colors ${
                    currentStyle.strokeStyle === 'dashed'
                      ? 'bg-sky-500/15 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/40'
                      : 'bg-slate-100 dark:bg-white/[0.03] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Dashed
                </button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Opacity
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{Math.round((currentStyle.opacity ?? 1) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={currentStyle.opacity ?? 1}
                onChange={(e) => updateSelectedStyle({ opacity: parseFloat(e.target.value) })}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </>
        ) : (
          /* Empty Selection: Board Details */
          <div className="space-y-4 text-slate-600 dark:text-slate-400">
            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <Layers className="w-4 h-4 text-sky-500 dark:text-sky-400" />
                <span>{getActiveBoard().title}</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {getActiveBoard().description || 'Interactive multi-modal research whiteboard'}
              </p>
              <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-white/10 font-medium">
                <span>Total Items: {elements.length}</span>
                <span>•</span>
                <span>Grid: {getActiveBoard().gridType}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/20 text-[11px] space-y-2">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
                <Info className="w-4 h-4" />
                <span>Contextual Controls</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300">
                Select any diagram node, sticky note, table, or arrow on the canvas to inspect its geometry, styling, connections, and layer hierarchy.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
