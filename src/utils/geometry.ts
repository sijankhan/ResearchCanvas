import { CanvasElement, Point, BoundingBox, Camera } from '../types/canvas';

export function screenToWorld(screenPoint: Point, camera: Camera): Point {
  return {
    x: (screenPoint.x - camera.x) / camera.zoom,
    y: (screenPoint.y - camera.y) / camera.zoom,
  };
}

export function worldToScreen(worldPoint: Point, camera: Camera): Point {
  return {
    x: worldPoint.x * camera.zoom + camera.x,
    y: worldPoint.y * camera.zoom + camera.y,
  };
}

export function getElementBoundingBox(element: CanvasElement): BoundingBox {
  let minX = element.x;
  let minY = element.y;
  let maxX = element.x + element.width;
  let maxY = element.y + element.height;

  if (element.type === 'circle') {
    const rx = Math.abs(element.radiusX);
    const ry = Math.abs(element.radiusY);
    minX = element.x - rx;
    minY = element.y - ry;
    maxX = element.x + rx;
    maxY = element.y + ry;
  } else if (element.type === 'arrow' || element.type === 'line' || element.type === 'pencil') {
    if (element.points && element.points.length >= 2) {
      let pMinX = Infinity;
      let pMinY = Infinity;
      let pMaxX = -Infinity;
      let pMaxY = -Infinity;
      for (let i = 0; i < element.points.length; i += 2) {
        const px = element.x + element.points[i];
        const py = element.y + element.points[i + 1];
        if (px < pMinX) pMinX = px;
        if (px > pMaxX) pMaxX = px;
        if (py < pMinY) pMinY = py;
        if (py > pMaxY) pMaxY = py;
      }
      minX = pMinX;
      minY = pMinY;
      maxX = pMaxX;
      maxY = pMaxY;
    }
  }

  // Normalize if negative width/height
  if (minX > maxX) [minX, maxX] = [maxX, minX];
  if (minY > maxY) [minY, maxY] = [maxY, minY];

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function getElementsBoundingBox(elements: CanvasElement[]): BoundingBox | null {
  if (elements.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of elements) {
    const bbox = getElementBoundingBox(element);
    if (bbox.minX < minX) minX = bbox.minX;
    if (bbox.minY < minY) minY = bbox.minY;
    if (bbox.maxX > maxX) maxX = bbox.maxX;
    if (bbox.maxY > maxY) maxY = bbox.maxY;
  }

  if (minX === Infinity) return null;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function rectsIntersect(r1: BoundingBox, r2: BoundingBox): boolean {
  return !(
    r2.minX > r1.maxX ||
    r2.maxX < r1.minX ||
    r2.minY > r1.maxY ||
    r2.maxY < r1.minY
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
