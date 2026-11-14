import React, { useRef, useState } from 'react';
import {
  MousePointer2,
  Hand,
  PenTool,
  Pencil,
  Highlighter,
  Eraser,
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Diamond,
  Hexagon,
  MessageSquare,
  MoveRight,
  GitCommit,
  StickyNote,
  Table as TableIcon,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { ToolType, BrushType } from '../../types/canvas';

export const LeftToolbar: React.FC = () => {
  const {
    tool,
    setTool,
    brushType,
    setBrushType,
    addImageElement,
    addTableElement,
  } = useCanvasStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBrushFlyout, setShowBrushFlyout] = useState(false);
  const [showShapesFlyout, setShowShapesFlyout] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const maxWidth = 500;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        addImageElement(dataUrl, w, h, file.name.replace(/\.[^/.]+$/, ''));
      };
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTool('select');
  };

  const handleBrushSelect = (brush: BrushType) => {
    setBrushType(brush);
    setTool('pencil');
    setShowBrushFlyout(false);
  };

  const handleShapeSelect = (shapeTool: ToolType) => {
    setTool(shapeTool);
    setShowShapesFlyout(false);
  };

  const isDrawingTool = tool === 'pencil';
  const isShapeTool = ['rectangle', 'circle', 'diamond', 'polygon', 'callout'].includes(tool);

  return (
    <aside className="fixed left-4 top-20 z-40 flex flex-col items-center gap-1.5 p-2 bg-[#181a20]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating select-none">
      {/* 1. Select */}
      <button
        onClick={() => setTool('select')}
        title="Select & Move (V)"
        aria-label="Select & Move tool (V)"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'select' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <MousePointer2 className="w-5 h-5" />
      </button>

      {/* 2. Hand / Pan */}
      <button
        onClick={() => setTool('hand')}
        title="Pan Canvas (H / Space+Drag)"
        aria-label="Pan Canvas tool (H)"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'hand' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Hand className="w-5 h-5" />
      </button>

      <div className="w-6 h-[1px] bg-white/10 my-0.5" />

      {/* 3. Drawing Brushes with Flyout */}
      <div className="relative">
        <button
          onClick={() => {
            if (tool === 'pencil') {
              setShowBrushFlyout(!showBrushFlyout);
            } else {
              setTool('pencil');
            }
          }}
          title={`Brush: ${brushType.toUpperCase()} (Click to toggle flyout)`}
          aria-label={`Drawing brush tool (${brushType})`}
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isDrawingTool ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {brushType === 'pen' && <PenTool className="w-5 h-5" />}
          {brushType === 'pencil' && <Pencil className="w-5 h-5" />}
          {brushType === 'marker' && <PenTool className="w-5 h-5 stroke-[2.5]" />}
          {brushType === 'highlighter' && <Highlighter className="w-5 h-5 text-amber-400" />}
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-sky-400 rounded-full" />
        </button>

        {showBrushFlyout && (
          <div className="absolute left-12 top-0 w-36 bg-[#1b1d22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => handleBrushSelect('pen')}
              aria-label="Select Vector Pen brush"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                brushType === 'pen' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>Vector Pen</span>
            </button>
            <button
              onClick={() => handleBrushSelect('pencil')}
              aria-label="Select Pencil brush"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                brushType === 'pencil' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Pencil className="w-4 h-4" />
              <span>Pencil</span>
            </button>
            <button
              onClick={() => handleBrushSelect('highlighter')}
              aria-label="Select Highlighter brush"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                brushType === 'highlighter' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Highlighter className="w-4 h-4 text-amber-400" />
              <span>Highlighter</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Eraser */}
      <button
        onClick={() => setTool('eraser')}
        title="Eraser (E) - Click objects to erase"
        aria-label="Eraser tool (E)"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'eraser' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Eraser className="w-5 h-5" />
      </button>

      <div className="w-6 h-[1px] bg-white/10 my-0.5" />

      {/* 5. Text */}
      <button
        onClick={() => setTool('text')}
        title="Text Block (T)"
        aria-label="Text tool (T)"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'text' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <Type className="w-5 h-5" />
      </button>

      {/* 6. Image Upload */}
      <button
        onClick={() => fileInputRef.current?.click()}
        title="Insert Image (Upload or Paste Ctrl+V)"
        aria-label="Upload or paste image"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <ImageIcon className="w-5 h-5" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 7. Shapes with Flyout */}
      <div className="relative">
        <button
          onClick={() => {
            if (isShapeTool) {
              setShowShapesFlyout(!showShapesFlyout);
            } else {
              setTool('rectangle');
            }
          }}
          title="Shapes (Click to choose shape)"
          aria-label="Shapes selection menu"
          className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            isShapeTool ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {tool === 'circle' && <Circle className="w-5 h-5" />}
          {tool === 'diamond' && <Diamond className="w-5 h-5" />}
          {tool === 'polygon' && <Hexagon className="w-5 h-5" />}
          {tool === 'callout' && <MessageSquare className="w-5 h-5" />}
          {(!isShapeTool || tool === 'rectangle') && <Square className="w-5 h-5" />}
          <span className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-sky-400 rounded-full" />
        </button>

        {showShapesFlyout && (
          <div className="absolute left-12 top-0 w-36 bg-[#1b1d22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-100">
            <button
              onClick={() => handleShapeSelect('rectangle')}
              aria-label="Rectangle shape"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                tool === 'rectangle' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Square className="w-4 h-4" />
              <span>Rectangle</span>
            </button>
            <button
              onClick={() => handleShapeSelect('circle')}
              aria-label="Circle shape"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                tool === 'circle' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Circle className="w-4 h-4" />
              <span>Circle</span>
            </button>
            <button
              onClick={() => handleShapeSelect('diamond')}
              aria-label="Diamond shape"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                tool === 'diamond' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Diamond className="w-4 h-4" />
              <span>Diamond</span>
            </button>
            <button
              onClick={() => handleShapeSelect('polygon')}
              aria-label="Polygon shape"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                tool === 'polygon' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Hexagon className="w-4 h-4" />
              <span>Polygon</span>
            </button>
            <button
              onClick={() => handleShapeSelect('callout')}
              aria-label="Callout shape"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                tool === 'callout' ? 'bg-sky-500/20 text-sky-400' : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Callout</span>
            </button>
          </div>
        )}
      </div>

      {/* 8. Arrow */}
      <button
        onClick={() => setTool('arrow')}
        title="Arrow Connector (A)"
        aria-label="Arrow Connector (A)"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'arrow' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <MoveRight className="w-5 h-5" />
      </button>

      {/* 9. Smart Connector */}
      <button
        onClick={() => setTool('connector')}
        title="Smart Magnetic Connector (Snaps between shapes)"
        aria-label="Smart Magnetic Connector"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'connector' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <GitCommit className="w-5 h-5" />
      </button>

      {/* 10. Sticky Note */}
      <button
        onClick={() => setTool('sticky')}
        title="Research Sticky Note (S)"
        aria-label="Sticky Note (S)"
        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
          tool === 'sticky' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
      >
        <StickyNote className="w-5 h-5" />
      </button>

      {/* 11. Table */}
      <button
        onClick={() => addTableElement(3, 4)}
        title="Insert Research Matrix Table"
        aria-label="Insert Research Matrix Table"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <TableIcon className="w-5 h-5" />
      </button>
    </aside>
  );
};
