import React from 'react';
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  MoveRight,
  Minus,
  Pencil,
  Type,
  StickyNote,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ToolType } from '../../types/canvas';

interface ToolItem {
  id: ToolType;
  label: string;
  hotkey: string;
  icon: React.ReactNode;
}

export const ToolDock: React.FC = () => {
  const { tool, setTool } = useCanvasStore();

  const tools: ToolItem[] = [
    { id: 'select', label: 'Select', hotkey: 'V', icon: <MousePointer2 className="w-5 h-5" /> },
    { id: 'hand', label: 'Pan / Hand', hotkey: 'H', icon: <Hand className="w-5 h-5" /> },
    { id: 'rectangle', label: 'Rectangle', hotkey: 'R', icon: <Square className="w-5 h-5" /> },
    { id: 'circle', label: 'Circle', hotkey: 'O', icon: <Circle className="w-5 h-5" /> },
    { id: 'diamond', label: 'Diamond / Decision', hotkey: 'D', icon: <Diamond className="w-5 h-5" /> },
    { id: 'arrow', label: 'Arrow Connector', hotkey: 'A', icon: <MoveRight className="w-5 h-5" /> },
    { id: 'line', label: 'Line', hotkey: 'L', icon: <Minus className="w-5 h-5" /> },
    { id: 'pencil', label: 'Freehand Pencil', hotkey: 'P', icon: <Pencil className="w-5 h-5" /> },
    { id: 'text', label: 'Text Block', hotkey: 'T', icon: <Type className="w-5 h-5" /> },
    { id: 'sticky', label: 'Research Sticky Note', hotkey: 'S', icon: <StickyNote className="w-5 h-5" /> },
  ];

  return (
    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1.5 p-1.5 bg-[#1b1d22]/90 backdrop-blur-md border border-white/10 rounded-2xl shadow-floating">
        {tools.map((item) => {
          const isActive = tool === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTool(item.id)}
              title={`${item.label} (${item.hotkey})`}
              className={`relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-150 ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 active:scale-95'
              }`}
            >
              {item.icon}
              <span className="absolute -bottom-8 px-2 py-0.5 text-[10px] font-medium bg-slate-900/90 text-slate-200 rounded border border-white/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                {item.label} <span className="font-mono text-slate-400">[{item.hotkey}]</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
