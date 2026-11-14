import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Arrow, Line, Ellipse } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../../store/useCanvasStore';
import { InfiniteGrid } from './InfiniteGrid';
import { ElementRenderer } from './ElementRenderer';
import { SelectionTransformer } from './SelectionTransformer';
import { InlineTextEditor } from './InlineTextEditor';
import { CanvasElement, Point, BoundingBox } from '../../types/canvas';
import { screenToWorld, getElementBoundingBox, rectsIntersect } from '../../utils/geometry';
import { generateId } from '../../utils/id';
import { simplifyRDP } from '../../utils/strokeSimplifier';
import { Zap } from 'lucide-react';

interface Props {
  containerRef: React.RefObject<HTMLDivElement>;
}

export const CanvasStage: React.FC<Props> = ({ containerRef }) => {
  const stageRef = useRef<Konva.Stage>(null);

  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });

  // Marquee selection state
  const [marqueeBox, setMarqueeBox] = useState<{ startX: number; startY: number; currentX: number; currentY: number } | null>(null);

  // Active drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartWorld, setDrawStartWorld] = useState<Point>({ x: 0, y: 0 });
  const [drawingElement, setDrawingElement] = useState<CanvasElement | null>(null);

  // Connector creation state
  const [connectorSourceId, setConnectorSourceId] = useState<string | null>(null);

  // Store slices
  const elements = useCanvasStore((s) => s.getElements());
  const camera = useCanvasStore((s) => s.camera);
  const gridType = useCanvasStore((s) => s.getGridType());
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const tool = useCanvasStore((s) => s.tool);
  const brushType = useCanvasStore((s) => s.brushType);
  const activeStyle = useCanvasStore((s) => s.activeStyle);
  const editingTextId = useCanvasStore((s) => s.editingTextId);

  const setTool = useCanvasStore((s) => s.setTool);
  const panBy = useCanvasStore((s) => s.panBy);
  const zoomAtPoint = useCanvasStore((s) => s.zoomAtPoint);
  const addElement = useCanvasStore((s) => s.addElement);
  const addElementsBatch = useCanvasStore((s) => s.addElementsBatch);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const selectSingle = useCanvasStore((s) => s.selectSingle);
  const clearSelection = useCanvasStore((s) => s.clearSelection);
  const setEditingTextId = useCanvasStore((s) => s.setEditingTextId);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const addImageElement = useCanvasStore((s) => s.addImageElement);

  // Resize observer to track viewport dimensions accurately
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }
    return () => ro.disconnect();
  }, [containerRef]);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      let hasImage = false;

      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            hasImage = true;
            const blob = items[i].getAsFile();
            if (blob) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const dataUrl = event.target?.result as string;
                const img = new Image();
                img.src = dataUrl;
                img.onload = () => {
                  const maxWidth = 550;
                  const scale = img.width > maxWidth ? maxWidth / img.width : 1;
                  const w = Math.round(img.width * scale);
                  const h = Math.round(img.height * scale);
                  addImageElement(dataUrl, w, h, 'Pasted Figure');
                };
              };
              reader.readAsDataURL(blob);
            }
            break;
          }
        }
      }

      if (!hasImage) {
        const { internalClipboard, pasteClipboard } = useCanvasStore.getState();
        if (internalClipboard && internalClipboard.length > 0) {
          pasteClipboard();
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addImageElement]);

  // Viewport Culling (PHASE 3)
  const visibleElements = useMemo(() => {
    const margin = 200;
    const visibleWorldBox: BoundingBox = {
      minX: -camera.x / camera.zoom - margin,
      minY: -camera.y / camera.zoom - margin,
      maxX: (dimensions.width - camera.x) / camera.zoom + margin,
      maxY: (dimensions.height - camera.y) / camera.zoom + margin,
      width: dimensions.width / camera.zoom + margin * 2,
      height: dimensions.height / camera.zoom + margin * 2,
    };

    const selectedSet = new Set(selectedIds);

    // Collect connector endpoints so lines are never broken
    const connectorEndpoints = new Set<string>();
    for (const el of elements) {
      if (el.type === 'connector') {
        connectorEndpoints.add(el.fromElementId);
        connectorEndpoints.add(el.toElementId);
      }
    }

    return elements.filter((el) => {
      if (selectedSet.has(el.id)) return true;
      if (connectorEndpoints.has(el.id)) return true;
      const bbox = getElementBoundingBox(el);
      return rectsIntersect(visibleWorldBox, bbox);
    });
  }, [elements, camera.x, camera.y, camera.zoom, dimensions.width, dimensions.height, selectedIds]);

  // Wheel zoom handler
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    zoomAtPoint(e.evt.deltaY, pointer.x, pointer.y);
  }, [zoomAtPoint]);

  // Pointer Down handler
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const isMiddleClick = (e.evt as MouseEvent).button === 1;
    const isHandMode = tool === 'hand' || isSpacePressed || isMiddleClick;

    if (isHandMode) {
      setIsPanning(true);
      setPanStart({ x: pointer.x, y: pointer.y });
      return;
    }

    const clickedOnEmpty = e.target === stage;
    const worldPos = screenToWorld(pointer, camera);

    if (tool === 'select') {
      if (clickedOnEmpty) {
        clearSelection();
        setMarqueeBox({
          startX: pointer.x,
          startY: pointer.y,
          currentX: pointer.x,
          currentY: pointer.y,
        });
      }
      return;
    }

    if (tool === 'eraser') {
      if (!clickedOnEmpty) {
        const targetNode = e.target;
        const elemId = targetNode.id() || targetNode.parent?.id();
        if (elemId) {
          selectSingle(elemId);
          deleteSelected();
        }
      }
      return;
    }

    // Direct click placement tools
    if (tool === 'text') {
      const id = generateId('text');
      const newText: CanvasElement = {
        id,
        type: 'text',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 180,
        height: 40,
        rotation: 0,
        zIndex: elements.length + 1,
        style: { ...activeStyle, fillColor: activeStyle.fillColor === 'transparent' ? '#ffffff' : activeStyle.fillColor },
        text: 'New Research Note',
      };
      addElement(newText);
      setEditingTextId(id);
      setTool('select');
      return;
    }

    if (tool === 'sticky') {
      const id = generateId('sticky');
      const stickyColors = ['#fef08a', '#bbf7d0', '#bae6fd', '#fed7aa', '#fbcfe8'];
      const chosenColor = stickyColors[Math.floor(Math.random() * stickyColors.length)];
      const newSticky: CanvasElement = {
        id,
        type: 'sticky',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 240,
        height: 180,
        rotation: 0,
        zIndex: elements.length + 1,
        style: {
          ...activeStyle,
          fillColor: chosenColor,
          strokeColor: 'rgba(0,0,0,0.15)',
          strokeWidth: 1,
          fontSize: 15,
        },
        text: 'Double click to edit research sticky note...',
        color: chosenColor,
      };
      addElement(newSticky);
      selectSingle(id);
      setTool('select');
      return;
    }

    if (tool === 'callout') {
      const id = generateId('callout');
      const newCallout: CanvasElement = {
        id,
        type: 'callout',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 240,
        height: 100,
        rotation: 0,
        zIndex: elements.length + 1,
        pointerOffsetX: -30,
        pointerOffsetY: 25,
        style: { ...activeStyle, fillColor: 'rgba(234, 179, 8, 0.15)', strokeColor: '#eab308' },
        text: 'Research observation or hypothesis callout...',
      };
      addElement(newCallout);
      selectSingle(id);
      setTool('select');
      return;
    }

    if (tool === 'connector') {
      if (!clickedOnEmpty) {
        const targetNode = e.target;
        const elemId = targetNode.id() || targetNode.parent?.id();
        if (elemId) {
          if (!connectorSourceId) {
            setConnectorSourceId(elemId);
          } else if (connectorSourceId !== elemId) {
            const newConn: CanvasElement = {
              id: generateId('conn'),
              type: 'connector',
              fromElementId: connectorSourceId,
              toElementId: elemId,
              fromAnchor: 'right',
              toAnchor: 'left',
              x: 0, y: 0, width: 0, height: 0, rotation: 0,
              zIndex: elements.length + 1,
              style: { ...activeStyle, strokeColor: '#38bdf8', strokeWidth: 2 },
            };
            addElement(newConn);
            setConnectorSourceId(null);
            setTool('select');
          }
          return;
        }
      }
      setConnectorSourceId(null);
      return;
    }

    // Drag-to-draw tools
    setIsDrawing(true);
    setDrawStartWorld(worldPos);

    const id = generateId(tool);
    let preview: CanvasElement;

    if (tool === 'rectangle') {
      preview = {
        id,
        type: 'rectangle',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: elements.length + 1,
        style: { ...activeStyle },
      };
    } else if (tool === 'circle') {
      preview = {
        id,
        type: 'circle',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        radiusX: 0,
        radiusY: 0,
        rotation: 0,
        zIndex: elements.length + 1,
        style: { ...activeStyle },
      };
    } else if (tool === 'diamond') {
      preview = {
        id,
        type: 'diamond',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: elements.length + 1,
        style: { ...activeStyle },
      };
    } else if (tool === 'polygon') {
      preview = {
        id,
        type: 'polygon',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        sides: 5,
        rotation: 0,
        zIndex: elements.length + 1,
        style: { ...activeStyle },
      };
    } else if (tool === 'arrow') {
      preview = {
        id,
        type: 'arrow',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: elements.length + 1,
        points: [0, 0, 0, 0],
        style: { ...activeStyle },
      };
    } else if (tool === 'line') {
      preview = {
        id,
        type: 'line',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: elements.length + 1,
        points: [0, 0, 0, 0],
        style: { ...activeStyle },
      };
    } else {
      // Freehand Pencil / Brush
      let strokeW = 2;
      let strokeOp = 1;
      let strokeCol = activeStyle.strokeColor;

      if (brushType === 'pencil') {
        strokeW = 1.5;
        strokeOp = 0.8;
      } else if (brushType === 'marker') {
        strokeW = 6;
      } else if (brushType === 'highlighter') {
        strokeW = 18;
        strokeOp = 0.35;
        strokeCol = '#facc15';
      }

      preview = {
        id,
        type: 'pencil',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 0,
        height: 0,
        rotation: 0,
        zIndex: elements.length + 1,
        points: [0, 0],
        brushType,
        style: {
          ...activeStyle,
          strokeColor: strokeCol,
          strokeWidth: strokeW,
          opacity: strokeOp,
        },
      };
    }

    setDrawingElement(preview);
  };

  // Pointer Move handler
  const handleMouseMove = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    if (isPanning) {
      const dx = pointer.x - panStart.x;
      const dy = pointer.y - panStart.y;
      panBy(dx, dy);
      setPanStart({ x: pointer.x, y: pointer.y });
      return;
    }

    if (marqueeBox) {
      setMarqueeBox({
        ...marqueeBox,
        currentX: pointer.x,
        currentY: pointer.y,
      });
      return;
    }

    if (isDrawing && drawingElement) {
      const currentWorld = screenToWorld(pointer, camera);
      const deltaX = currentWorld.x - drawStartWorld.x;
      const deltaY = currentWorld.y - drawStartWorld.y;

      if (drawingElement.type === 'rectangle' || drawingElement.type === 'diamond' || drawingElement.type === 'polygon') {
        const x = deltaX >= 0 ? drawStartWorld.x : currentWorld.x;
        const y = deltaY >= 0 ? drawStartWorld.y : currentWorld.y;
        setDrawingElement({
          ...drawingElement,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(Math.abs(deltaX)),
          height: Math.round(Math.abs(deltaY)),
        });
      } else if (drawingElement.type === 'circle') {
        const radiusX = Math.round(Math.abs(deltaX) / 2);
        const radiusY = Math.round(Math.abs(deltaY) / 2);
        const centerX = Math.round(drawStartWorld.x + deltaX / 2);
        const centerY = Math.round(drawStartWorld.y + deltaY / 2);
        setDrawingElement({
          ...drawingElement,
          x: centerX,
          y: centerY,
          radiusX,
          radiusY,
          width: radiusX * 2,
          height: radiusY * 2,
        });
      } else if (drawingElement.type === 'arrow' || drawingElement.type === 'line') {
        setDrawingElement({
          ...drawingElement,
          points: [0, 0, Math.round(deltaX), Math.round(deltaY)],
          width: Math.round(Math.abs(deltaX)),
          height: Math.round(Math.abs(deltaY)),
        });
      } else if (drawingElement.type === 'pencil') {
        // Freehand point throttling (skip points < 1.5 px in world space)
        const points = drawingElement.points || [0, 0];
        const lastX = points[points.length - 2];
        const lastY = points[points.length - 1];
        const currentX = Math.round(deltaX);
        const currentY = Math.round(deltaY);

        const dist = Math.hypot(currentX - lastX, currentY - lastY);
        if (dist >= 1.5) {
          setDrawingElement({
            ...drawingElement,
            points: [...points, currentX, currentY],
          });
        }
      }
    }
  };

  // Pointer Up handler
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (marqueeBox) {
      const x1 = Math.min(marqueeBox.startX, marqueeBox.currentX);
      const y1 = Math.min(marqueeBox.startY, marqueeBox.currentY);
      const x2 = Math.max(marqueeBox.startX, marqueeBox.currentX);
      const y2 = Math.max(marqueeBox.startY, marqueeBox.currentY);

      const p1 = screenToWorld({ x: x1, y: y1 }, camera);
      const p2 = screenToWorld({ x: x2, y: y2 }, camera);

      const marqueeWorldBox = {
        minX: p1.x,
        minY: p1.y,
        maxX: p2.x,
        maxY: p2.y,
        width: p2.x - p1.x,
        height: p2.y - p1.y,
      };

      if (marqueeWorldBox.width > 5 || marqueeWorldBox.height > 5) {
        const intersectedIds: string[] = [];
        for (const el of elements) {
          const elBbox = getElementBoundingBox(el);
          if (rectsIntersect(marqueeWorldBox, elBbox)) {
            intersectedIds.push(el.id);
          }
        }
        setSelectedIds(intersectedIds);
      }
      setMarqueeBox(null);
      return;
    }

    if (isDrawing && drawingElement) {
      setIsDrawing(false);
      let isValid = false;

      if (drawingElement.type === 'rectangle' || drawingElement.type === 'circle' || drawingElement.type === 'diamond' || drawingElement.type === 'polygon') {
        isValid = (drawingElement.width || 0) > 8 && (drawingElement.height || 0) > 8;
      } else if (drawingElement.type === 'arrow' || drawingElement.type === 'line') {
        const pts = drawingElement.points || [];
        isValid = pts.length >= 4 && (Math.abs(pts[2]) > 5 || Math.abs(pts[3]) > 5);
      } else if (drawingElement.type === 'pencil') {
        const pts = drawingElement.points || [];
        if (pts.length >= 4) {
          // RDP simplification on mouse up!
          const simplified = simplifyRDP(pts, 1.5);
          drawingElement.points = simplified;
          isValid = simplified.length >= 4;
        }
      }

      if (isValid) {
        addElement(drawingElement);
        selectSingle(drawingElement.id);
      }

      setDrawingElement(null);
      setTool('select');
    }
  };

  // Stable callbacks for React.memo
  const handleElementSelect = useCallback((id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    const state = useCanvasStore.getState();
    if (state.tool === 'eraser') {
      state.selectSingle(id);
      state.deleteSelected();
      return;
    }

    if (state.tool !== 'select') return;
    e.cancelBubble = true;

    if (e.evt.shiftKey) {
      state.toggleSelectId(id);
    } else {
      if (!state.selectedIds.includes(id)) {
        state.selectSingle(id);
      }
    }
  }, []);

  const handleElementDoubleClick = useCallback((id: string) => {
    const state = useCanvasStore.getState();
    const el = state.getElements().find((e) => e.id === id);
    if (el && (el.type === 'text' || el.type === 'sticky')) {
      state.setEditingTextId(id);
    }
  }, []);

  const handleElementChange = useCallback((id: string, updates: Partial<CanvasElement>, commit?: boolean) => {
    useCanvasStore.getState().updateElement(id, updates, commit);
  }, []);

  // Drag and drop image files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const img = new Image();
          img.src = dataUrl;
          img.onload = () => {
            const maxWidth = 550;
            const scale = img.width > maxWidth ? maxWidth / img.width : 1;
            const w = Math.round(img.width * scale);
            const h = Math.round(img.height * scale);
            addImageElement(dataUrl, w, h, file.name.replace(/\.[^/.]+$/, ''));
          };
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Dev-only stress test: adds 2,000 shapes to test 60fps pan/zoom performance (PHASE 3)
  const handleStressTest = () => {
    const count = 2000;
    const stressElements: CanvasElement[] = [];
    const colors = ['#38bdf8', '#4ade80', '#fb923c', '#c084fc', '#facc15'];

    for (let i = 0; i < count; i++) {
      const rx = (Math.random() - 0.5) * 12000;
      const ry = (Math.random() - 0.5) * 12000;
      const size = 60 + Math.random() * 80;
      const type = i % 3 === 0 ? 'rectangle' : i % 3 === 1 ? 'circle' : 'diamond';
      const color = colors[i % colors.length];

      stressElements.push({
        id: generateId('stress'),
        type: type as any,
        x: Math.round(rx),
        y: Math.round(ry),
        width: Math.round(size),
        height: Math.round(size),
        radiusX: Math.round(size / 2),
        radiusY: Math.round(size / 2),
        rotation: 0,
        zIndex: elements.length + i + 1,
        style: {
          ...activeStyle,
          strokeColor: color,
          fillColor: `${color}20`,
          strokeWidth: 2,
        },
      } as CanvasElement);
    }

    addElementsBatch(stressElements);
  };

  // Cursor style calculation
  const getCursor = () => {
    if (tool === 'hand' || isSpacePressed || isPanning) {
      return isPanning ? 'grabbing' : 'grab';
    }
    if (tool === 'select') return 'default';
    if (tool === 'eraser') return 'not-allowed';
    if (tool === 'text') return 'text';
    return 'crosshair';
  };

  const editingElement = elements.find((el) => el.id === editingTextId);

  return (
    <div
      className="relative w-full h-full overflow-hidden select-none bg-[#121316]"
      style={{ cursor: getCursor() }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Dev Stress Test Button (PHASE 3) */}
      <button
        onClick={handleStressTest}
        title="Add 2,000 vector shapes to stress test viewport culling and rendering performance"
        className="fixed top-20 right-[340px] z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-mono shadow-sm transition-colors"
      >
        <Zap className="w-3.5 h-3.5" />
        <span>Stress Test (2,000 Shapes)</span>
      </button>

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Layer 1: Background dynamic infinite grid */}
        <Layer listening={false}>
          <InfiniteGrid
            width={dimensions.width}
            height={dimensions.height}
            camera={camera}
            gridType={gridType}
          />
        </Layer>

        {/* Layer 2: Viewport-Culled Canvas Elements (PHASE 3) */}
        <Layer
          x={camera.x}
          y={camera.y}
          scaleX={camera.zoom}
          scaleY={camera.zoom}
        >
          {visibleElements.map((element) => (
            <ElementRenderer
              key={element.id}
              element={element}
              allElements={elements}
              isSelected={selectedIds.includes(element.id)}
              isDraggable={tool === 'select' && !isSpacePressed && !element.isLocked}
              onSelect={handleElementSelect}
              onDoubleClick={handleElementDoubleClick}
              onChange={handleElementChange}
            />
          ))}

          {/* Active drawing shape preview */}
          {isDrawing && drawingElement && (
            <>
              {drawingElement.type === 'rectangle' && (
                <Rect
                  x={drawingElement.x}
                  y={drawingElement.y}
                  width={drawingElement.width}
                  height={drawingElement.height}
                  fill={drawingElement.style.fillColor}
                  stroke={drawingElement.style.strokeColor}
                  strokeWidth={drawingElement.style.strokeWidth}
                  dash={drawingElement.style.strokeStyle === 'dashed' ? [6, 4] : undefined}
                  cornerRadius={drawingElement.style.cornerRadius ?? 8}
                  opacity={0.8}
                />
              )}
              {drawingElement.type === 'circle' && (
                <Ellipse
                  x={drawingElement.x}
                  y={drawingElement.y}
                  radiusX={Math.abs(drawingElement.radiusX || 1)}
                  radiusY={Math.abs(drawingElement.radiusY || 1)}
                  fill={drawingElement.style.fillColor}
                  stroke={drawingElement.style.strokeColor}
                  strokeWidth={drawingElement.style.strokeWidth}
                  opacity={0.8}
                />
              )}
              {drawingElement.type === 'diamond' && (
                <Line
                  x={drawingElement.x}
                  y={drawingElement.y}
                  points={[
                    drawingElement.width / 2, 0,
                    drawingElement.width, drawingElement.height / 2,
                    drawingElement.width / 2, drawingElement.height,
                    0, drawingElement.height / 2,
                  ]}
                  closed={true}
                  fill={drawingElement.style.fillColor}
                  stroke={drawingElement.style.strokeColor}
                  strokeWidth={drawingElement.style.strokeWidth}
                  opacity={0.8}
                />
              )}
              {drawingElement.type === 'arrow' && (
                <Arrow
                  x={drawingElement.x}
                  y={drawingElement.y}
                  points={drawingElement.points || [0, 0, 0, 0]}
                  pointerLength={10}
                  pointerWidth={10}
                  fill={drawingElement.style.strokeColor}
                  stroke={drawingElement.style.strokeColor}
                  strokeWidth={drawingElement.style.strokeWidth}
                  opacity={0.8}
                />
              )}
              {drawingElement.type === 'line' && (
                <Line
                  x={drawingElement.x}
                  y={drawingElement.y}
                  points={drawingElement.points || [0, 0, 0, 0]}
                  stroke={drawingElement.style.strokeColor}
                  strokeWidth={drawingElement.style.strokeWidth}
                  opacity={0.8}
                />
              )}
              {drawingElement.type === 'pencil' && (
                <Line
                  x={drawingElement.x}
                  y={drawingElement.y}
                  points={drawingElement.points || [0, 0]}
                  stroke={drawingElement.style.strokeColor}
                  strokeWidth={drawingElement.style.strokeWidth}
                  tension={0.4}
                  lineCap="round"
                  lineJoin="round"
                  opacity={drawingElement.style.opacity || 0.8}
                />
              )}
            </>
          )}

          {/* Interactive Transform bounding box */}
          {tool === 'select' && (
            <SelectionTransformer
              selectedIds={selectedIds}
              elements={elements}
              stageRef={stageRef}
              onTransformEnd={(id, updates) => {
                useCanvasStore.getState().updateElement(id, updates, true);
              }}
            />
          )}
        </Layer>

        {/* Layer 3: Screen space overlays (Marquee selection box) */}
        {marqueeBox && (
          <Layer listening={false}>
            <Rect
              x={Math.min(marqueeBox.startX, marqueeBox.currentX)}
              y={Math.min(marqueeBox.startY, marqueeBox.currentY)}
              width={Math.abs(marqueeBox.currentX - marqueeBox.startX)}
              height={Math.abs(marqueeBox.currentY - marqueeBox.startY)}
              fill="rgba(56, 189, 248, 0.12)"
              stroke="#38bdf8"
              strokeWidth={1}
              dash={[4, 3]}
            />
          </Layer>
        )}
      </Stage>

      {/* HTML overlay for inline text / sticky note editing */}
      {editingElement && (
        <InlineTextEditor
          element={editingElement}
          camera={camera}
          onSave={(id, text) => {
            useCanvasStore.getState().updateElement(id, { text } as any, true);
            setEditingTextId(null);
          }}
          onCancel={() => {
            setEditingTextId(null);
          }}
        />
      )}
    </div>
  );
};
