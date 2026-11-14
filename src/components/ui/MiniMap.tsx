import React, { useRef } from 'react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { getElementsBoundingBox, clamp } from '../../utils/geometry';

export const MiniMap: React.FC = () => {
  const { getElements, getCamera, setCamera } = useCanvasStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const elements = getElements();
  const camera = getCamera();

  const MAP_WIDTH = 190;
  const MAP_HEIGHT = 125;

  // Calculate world bounding box encompassing all elements + current viewport
  const elementsBbox = getElementsBoundingBox(elements) || {
    minX: 0,
    minY: 0,
    maxX: 1200,
    maxY: 800,
    width: 1200,
    height: 800,
  };

  // Current screen viewport in world coordinates
  const viewW = (window.innerWidth - 320) / camera.zoom;
  const viewH = (window.innerHeight - 120) / camera.zoom;
  const viewWorldX = -camera.x / camera.zoom;
  const viewWorldY = -camera.y / camera.zoom;

  // Total bounds
  const minX = Math.min(elementsBbox.minX - 150, viewWorldX - 80);
  const minY = Math.min(elementsBbox.minY - 150, viewWorldY - 80);
  const maxX = Math.max(elementsBbox.maxX + 150, viewWorldX + viewW + 80);
  const maxY = Math.max(elementsBbox.maxY + 150, viewWorldY + viewH + 80);

  const totalW = Math.max(100, maxX - minX);
  const totalH = Math.max(100, maxY - minY);

  const scale = Math.min(MAP_WIDTH / totalW, MAP_HEIGHT / totalH);

  // Position of element in minimap
  const toMapX = (wx: number) => (wx - minX) * scale;
  const toMapY = (wy: number) => (wy - minY) * scale;

  // Viewport rect on minimap
  const viewMapX = toMapX(viewWorldX);
  const viewMapY = toMapY(viewWorldY);
  const viewMapW = viewW * scale;
  const viewMapH = viewH * scale;

  const handleMiniMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert map coords to world coords
    const targetWorldX = clickX / scale + minX;
    const targetWorldY = clickY / scale + minY;

    // Center camera at target world point
    const newCameraX = (window.innerWidth - 320) / 2 - targetWorldX * camera.zoom;
    const newCameraY = (window.innerHeight - 120) / 2 - targetWorldY * camera.zoom;

    setCamera({
      x: newCameraX,
      y: newCameraY,
    });
  };

  return (
    <div
      ref={containerRef}
      onClick={handleMiniMapClick}
      className="relative w-[190px] h-[125px] bg-[#181a20]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating overflow-hidden cursor-crosshair select-none animate-in fade-in duration-150"
    >
      <div className="absolute top-2 left-2.5 z-10 text-[9px] font-mono uppercase tracking-wider text-slate-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5 pointer-events-none">
        Radar
      </div>

      {/* Elements preview */}
      {elements.map((el) => {
        const mx = toMapX(el.x);
        const my = toMapY(el.y);
        const mw = Math.max(3, (el.width || 20) * scale);
        const mh = Math.max(3, (el.height || 20) * scale);

        return (
          <div
            key={el.id}
            className="absolute rounded-sm pointer-events-none"
            style={{
              left: `${clamp(mx, 0, MAP_WIDTH)}px`,
              top: `${clamp(my, 0, MAP_HEIGHT)}px`,
              width: `${clamp(mw, 3, MAP_WIDTH)}px`,
              height: `${clamp(mh, 3, MAP_HEIGHT)}px`,
              backgroundColor: el.style.strokeColor || '#38bdf8',
              opacity: 0.65,
            }}
          />
        );
      })}

      {/* Viewport radar rect */}
      <div
        className="absolute border-2 border-sky-400 bg-sky-500/15 rounded pointer-events-none transition-all duration-75"
        style={{
          left: `${clamp(viewMapX, 0, MAP_WIDTH)}px`,
          top: `${clamp(viewMapY, 0, MAP_HEIGHT)}px`,
          width: `${clamp(viewMapW, 10, MAP_WIDTH)}px`,
          height: `${clamp(viewMapH, 10, MAP_HEIGHT)}px`,
        }}
      />
    </div>
  );
};
