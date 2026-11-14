import { CanvasElement, Project } from '../types/canvas';
import { getElementsBoundingBox } from './geometry';
import { getImage } from '../services/imageStore';

export interface ExportData {
  version: string;
  project: Project;
  timestamp: string;
}

/**
 * Prepares project for JSON export by embedding all IndexedDB images as base64
 * so the exported file is completely self-contained.
 */
export async function prepareProjectForExport(project: Project): Promise<Project> {
  const clonedBoards = await Promise.all(
    project.boards.map(async (board) => {
      const clonedElements = await Promise.all(
        board.elements.map(async (el) => {
          if (el.type === 'image') {
            let dataUrl = el.src;
            if (el.imageId) {
              const fromDb = await getImage(el.imageId);
              if (fromDb) dataUrl = fromDb;
            }
            return {
              ...el,
              src: dataUrl,
            };
          }
          return el;
        })
      );
      return {
        ...board,
        elements: clonedElements,
        history: { past: [], future: [] },
      };
    })
  );

  return {
    ...project,
    boards: clonedBoards,
  };
}

export async function exportProjectToJson(project: Project) {
  const exportable = await prepareProjectForExport(project);
  const data: ExportData = {
    version: '2.0.0',
    project: exportable,
    timestamp: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(data, null, 2);

  // If in Electron desktop environment, use native save dialog if available
  if (typeof window !== 'undefined' && (window as any).electronAPI?.saveProjectDialog) {
    const defaultName = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.researchcanvas.json`;
    const res = await (window as any).electronAPI.saveProjectDialog(jsonString, defaultName);
    if (res?.success) return;
  }

  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.researchcanvas.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Backward-compatible alias
export async function exportToJson(elements: CanvasElement[], projectName: string) {
  // Try resolving image elements
  const resolvedElements = await Promise.all(
    elements.map(async (el) => {
      if (el.type === 'image' && el.imageId) {
        const dataUrl = await getImage(el.imageId);
        if (dataUrl) return { ...el, src: dataUrl };
      }
      return el;
    })
  );

  const data = {
    version: '2.0.0',
    projectName,
    timestamp: new Date().toISOString(),
    elements: resolvedElements,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.researchcanvas.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function exportToPng(elements: CanvasElement[], projectName: string): Promise<boolean> {
  const bbox = getElementsBoundingBox(elements);
  if (!bbox || bbox.width === 0 || bbox.height === 0) {
    return false;
  }

  // Preload any image elements
  const loadedImages = new Map<string, HTMLImageElement>();
  for (const el of elements) {
    if (el.type === 'image') {
      let src = el.src;
      if (el.imageId) {
        const fromDb = await getImage(el.imageId);
        if (fromDb) src = fromDb;
      }
      if (src) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.src = src;
          img.onload = () => {
            loadedImages.set(el.id, img);
            resolve();
          };
          img.onerror = () => resolve();
        });
      }
    }
  }

  // Create temporary offscreen canvas
  const padding = 60;
  const canvasWidth = Math.ceil(bbox.width + padding * 2);
  const canvasHeight = Math.ceil(bbox.height + padding * 2);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth * 2; // 2x retina scale
  canvas.height = canvasHeight * 2;

  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = '#121316';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle grid dots in background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let x = 0; x < canvasWidth; x += 32) {
    for (let y = 0; y < canvasHeight; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Render elements transformed by bbox offset
  ctx.save();
  ctx.translate(-bbox.minX + padding, -bbox.minY + padding);

  for (const el of elements) {
    ctx.save();
    ctx.globalAlpha = el.style.opacity ?? 1;

    if (el.type === 'rectangle') {
      ctx.beginPath();
      ctx.rect(el.x, el.y, el.width, el.height);
      if (el.style.fillColor && el.style.fillColor !== 'transparent') {
        ctx.fillStyle = el.style.fillColor;
        ctx.fill();
      }
      ctx.strokeStyle = el.style.strokeColor;
      ctx.lineWidth = el.style.strokeWidth;
      if (el.style.strokeStyle === 'dashed') ctx.setLineDash([8, 6]);
      ctx.stroke();
    } else if (el.type === 'circle') {
      ctx.beginPath();
      ctx.ellipse(
        el.x,
        el.y,
        Math.abs(el.radiusX),
        Math.abs(el.radiusY),
        0,
        0,
        Math.PI * 2
      );
      if (el.style.fillColor && el.style.fillColor !== 'transparent') {
        ctx.fillStyle = el.style.fillColor;
        ctx.fill();
      }
      ctx.strokeStyle = el.style.strokeColor;
      ctx.lineWidth = el.style.strokeWidth;
      ctx.stroke();
    } else if (el.type === 'diamond') {
      const halfW = el.width / 2;
      const halfH = el.height / 2;
      ctx.beginPath();
      ctx.moveTo(el.x + halfW, el.y);
      ctx.lineTo(el.x + el.width, el.y + halfH);
      ctx.lineTo(el.x + halfW, el.y + el.height);
      ctx.lineTo(el.x, el.y + halfH);
      ctx.closePath();
      if (el.style.fillColor && el.style.fillColor !== 'transparent') {
        ctx.fillStyle = el.style.fillColor;
        ctx.fill();
      }
      ctx.strokeStyle = el.style.strokeColor;
      ctx.lineWidth = el.style.strokeWidth;
      ctx.stroke();
    } else if (el.type === 'arrow' || el.type === 'line') {
      const pts = el.points || [0, 0, el.width, el.height];
      ctx.beginPath();
      ctx.moveTo(el.x + pts[0], el.y + pts[1]);
      ctx.lineTo(el.x + pts[2], el.y + pts[3]);
      ctx.strokeStyle = el.style.strokeColor;
      ctx.lineWidth = el.style.strokeWidth;
      ctx.stroke();
      if (el.type === 'arrow') {
        const angle = Math.atan2(pts[3] - pts[1], pts[2] - pts[0]);
        const headLen = 12;
        ctx.beginPath();
        ctx.moveTo(el.x + pts[2], el.y + pts[3]);
        ctx.lineTo(
          el.x + pts[2] - headLen * Math.cos(angle - Math.PI / 6),
          el.y + pts[3] - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          el.x + pts[2] - headLen * Math.cos(angle + Math.PI / 6),
          el.y + pts[3] - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = el.style.strokeColor;
        ctx.fill();
      }
    } else if (el.type === 'pencil') {
      const pts = el.points || [];
      if (pts.length >= 4) {
        ctx.beginPath();
        ctx.moveTo(el.x + pts[0], el.y + pts[1]);
        for (let i = 2; i < pts.length; i += 2) {
          ctx.lineTo(el.x + pts[i], el.y + pts[i + 1]);
        }
        ctx.strokeStyle = el.style.strokeColor;
        ctx.lineWidth = el.style.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
    } else if (el.type === 'sticky') {
      ctx.fillStyle = el.style.fillColor || el.color || '#fef08a';
      ctx.beginPath();
      (ctx as any).roundRect ? (ctx as any).roundRect(el.x, el.y, el.width, el.height, 8) : ctx.rect(el.x, el.y, el.width, el.height);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = `${el.style.fontSize || 16}px Inter, sans-serif`;
      const lines = (el.text || '').split('\n');
      let textY = el.y + 24;
      for (const line of lines) {
        ctx.fillText(line, el.x + 14, textY);
        textY += (el.style.fontSize || 16) * 1.4;
      }
    } else if (el.type === 'text') {
      ctx.fillStyle = el.style.fillColor === 'transparent' ? '#ffffff' : el.style.fillColor;
      ctx.font = `${el.style.fontSize || 18}px Inter, sans-serif`;
      ctx.fillText(el.text || '', el.x, el.y + (el.style.fontSize || 18));
    } else if (el.type === 'image') {
      const img = loadedImages.get(el.id);
      if (img) {
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      }
    }

    ctx.restore();
  }

  ctx.restore();

  // Branding watermark in export corner
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.font = '11px Inter, sans-serif';
  ctx.fillText('ResearchCanvas', padding, canvasHeight - 20);

  // Trigger download
  const link = document.createElement('a');
  link.download = `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
