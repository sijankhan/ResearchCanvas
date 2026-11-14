import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const toolShortcuts = [
    { key: 'V', desc: 'Select & Move' },
    { key: 'H', desc: 'Hand / Pan Canvas' },
    { key: 'R', desc: 'Rectangle Shape' },
    { key: 'O', desc: 'Circle / Ellipse' },
    { key: 'D', desc: 'Diamond Decision' },
    { key: 'A', desc: 'Arrow Connector' },
    { key: 'L', desc: 'Straight Line' },
    { key: 'P', desc: 'Freehand Pencil' },
    { key: 'T', desc: 'Text Block' },
    { key: 'S', desc: 'Research Sticky Note' },
  ];

  const navigationShortcuts = [
    { key: 'Space + Drag', desc: 'Quick Pan Canvas' },
    { key: 'Mouse Wheel', desc: 'Smooth Zoom In / Out' },
    { key: 'Middle Click + Drag', desc: 'Pan Canvas' },
    { key: 'Esc', desc: 'Cancel / Deselect' },
  ];

  const actionShortcuts = [
    { key: 'Ctrl + Z', desc: 'Undo Action' },
    { key: 'Ctrl + Y', desc: 'Redo Action' },
    { key: 'Ctrl + C', desc: 'Copy Selected Elements' },
    { key: 'Ctrl + X', desc: 'Cut Selected Elements' },
    { key: 'Ctrl + V', desc: 'Paste Elements / Figure' },
    { key: 'Ctrl + A', desc: 'Select All Elements' },
    { key: 'Ctrl + D', desc: 'Duplicate Selected' },
    { key: 'Del / Backspace', desc: 'Delete Selected' },
    { key: 'Arrow Keys', desc: 'Nudge 1px' },
    { key: 'Shift + Arrows', desc: 'Nudge 10px' },
    { key: 'Shift + Click', desc: 'Multi-select' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1b1d22] border border-slate-200 dark:border-white/10 rounded-3xl shadow-floating p-6 text-slate-800 dark:text-slate-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900 dark:text-white">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quickly navigate and draft on the canvas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Tools */}
          <div>
            <h4 className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-2">
              Primary Tools
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {toolShortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.03]">
                  <span className="text-slate-700 dark:text-slate-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-[11px] text-sky-600 dark:text-sky-400">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
              Navigation & Viewport
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {navigationShortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.03]">
                  <span className="text-slate-700 dark:text-slate-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">
              Actions & Editing
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {actionShortcuts.map((s) => (
                <div key={s.key} className="flex items-center justify-between p-2 rounded-xl bg-slate-100/80 dark:bg-white/[0.03]">
                  <span className="text-slate-700 dark:text-slate-300">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-[11px] text-purple-600 dark:text-purple-400">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-200 dark:border-white/10 text-center">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-700 dark:text-slate-300">Esc</kbd> anytime to close
          </span>
        </div>
      </div>
    </div>
  );
};
