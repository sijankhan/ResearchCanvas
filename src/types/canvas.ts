export type ToolType =
  | 'select'
  | 'hand'
  | 'pen'
  | 'pencil'
  | 'marker'
  | 'highlighter'
  | 'eraser'
  | 'text'
  | 'image'
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'polygon'
  | 'callout'
  | 'arrow'
  | 'line'
  | 'connector'
  | 'sticky'
  | 'table';

export type GridType = 'dots' | 'lines' | 'none';
export type ThemeType = 'dark' | 'light';
export type StrokeStyle = 'solid' | 'dashed';
export type BrushType = 'pen' | 'pencil' | 'marker' | 'highlighter';
export type EraserMode = 'object' | 'stroke';
export type AnchorPosition = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface ElementStyle {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  cornerRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  shadowBlur?: number;
}

export type ElementType =
  | 'rectangle'
  | 'circle'
  | 'diamond'
  | 'polygon'
  | 'callout'
  | 'arrow'
  | 'line'
  | 'connector'
  | 'pencil' // Represents freehand strokes (pen, pencil, marker, highlighter)
  | 'text'
  | 'sticky'
  | 'image'
  | 'table';

export interface BaseCanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  style: ElementStyle;
  zIndex: number;
  isLocked?: boolean;
  isHidden?: boolean;
  groupId?: string;
}

export interface RectCanvasElement extends BaseCanvasElement {
  type: 'rectangle';
}

export interface CircleCanvasElement extends BaseCanvasElement {
  type: 'circle';
  radiusX: number;
  radiusY: number;
}

export interface DiamondCanvasElement extends BaseCanvasElement {
  type: 'diamond';
}

export interface PolygonCanvasElement extends BaseCanvasElement {
  type: 'polygon';
  sides: number;
}

export interface CalloutCanvasElement extends BaseCanvasElement {
  type: 'callout';
  text: string;
  pointerOffsetX: number;
  pointerOffsetY: number;
}

export interface ArrowCanvasElement extends BaseCanvasElement {
  type: 'arrow';
  points: number[];
}

export interface LineCanvasElement extends BaseCanvasElement {
  type: 'line';
  points: number[];
}

export interface ConnectorCanvasElement extends BaseCanvasElement {
  type: 'connector';
  fromElementId: string;
  toElementId: string;
  fromAnchor: AnchorPosition;
  toAnchor: AnchorPosition;
  points?: number[];
  label?: string;
}

export interface PencilCanvasElement extends BaseCanvasElement {
  type: 'pencil';
  points: number[];
  brushType: BrushType;
}

export interface TextCanvasElement extends BaseCanvasElement {
  type: 'text';
  text: string;
}

export interface StickyCanvasElement extends BaseCanvasElement {
  type: 'sticky';
  text: string;
  color: string;
}

export interface ImageAnnotation {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

export interface ImageCanvasElement extends BaseCanvasElement {
  type: 'image';
  src?: string;
  imageId?: string;
  caption?: string;
  naturalWidth: number;
  naturalHeight: number;
  annotations?: ImageAnnotation[];
}

export interface TableCanvasElement extends BaseCanvasElement {
  type: 'table';
  rows: number;
  cols: number;
  headers: string[];
  data: string[][];
  colWidths: number[];
  rowHeight: number;
}

export type CanvasElement =
  | RectCanvasElement
  | CircleCanvasElement
  | DiamondCanvasElement
  | PolygonCanvasElement
  | CalloutCanvasElement
  | ArrowCanvasElement
  | LineCanvasElement
  | ConnectorCanvasElement
  | PencilCanvasElement
  | TextCanvasElement
  | StickyCanvasElement
  | ImageCanvasElement
  | TableCanvasElement;

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  elements: CanvasElement[];
  camera: Camera;
  gridType: GridType;
  history: {
    past: CanvasElement[][];
    future: CanvasElement[][];
  };
}

export interface ProjectMetadata {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  boardsCount: number;
  elementsCount: number;
  theme: ThemeType;
}

export interface Project {
  schemaVersion?: number;
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  theme: ThemeType;
  boards: Board[];
  activeBoardId: string;
}
