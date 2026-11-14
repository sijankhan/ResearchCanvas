import React, { useEffect, useRef, useState } from 'react';
import { CanvasElement, Camera } from '../../types/canvas';

interface Props {
  element: CanvasElement;
  camera: Camera;
  onSave: (id: string, text: string) => void;
  onCancel: () => void;
}

export const InlineTextEditor: React.FC<Props> = ({
  element,
  camera,
  onSave,
  onCancel,
}) => {
  const isSticky = element.type === 'sticky';
  const initialText = (element as any).text || '';
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Compute screen coordinates
  const screenX = element.x * camera.zoom + camera.x;
  const screenY = element.y * camera.zoom + camera.y;

  const width = Math.max(120, (element.width || 180) * camera.zoom);
  const height = Math.max(60, (element.height || 100) * camera.zoom);
  const fontSize = (element.style.fontSize || 16) * camera.zoom;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && !isSticky && !e.shiftKey) {
      e.preventDefault();
      onSave(element.id, text);
    }
  };

  const handleBlur = () => {
    onSave(element.id, text);
  };

  return (
    <div
      className="absolute z-50 pointer-events-auto"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
        width: `${width}px`,
        minHeight: `${height}px`,
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className={`w-full h-full p-3 resize-none border-2 rounded-lg outline-none shadow-2xl transition-all ${
          isSticky
            ? 'bg-[#fef9c3] text-slate-900 border-amber-400 font-sans'
            : 'bg-white/95 text-slate-900 dark:bg-[#18191e]/95 dark:text-slate-100 border-sky-500 font-sans'
        }`}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: 1.4,
          minHeight: `${height}px`,
        }}
        placeholder="Type note or text here..."
      />
      <div className="absolute -bottom-6 left-0 text-[10px] text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-transparent px-2 py-0.5 rounded backdrop-blur">
        Press <span className="font-mono text-sky-600 dark:text-sky-400">Esc</span> or click outside to finish
      </div>
    </div>
  );
};
