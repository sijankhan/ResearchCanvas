import { describe, it, expect } from 'vitest';
import {
  screenToWorld,
  worldToScreen,
  getElementBoundingBox,
  getElementsBoundingBox,
  rectsIntersect,
  clamp,
} from '../src/utils/geometry';
import { simplifyRDP } from '../src/utils/strokeSimplifier';
import { CanvasElement, Camera } from '../src/types/canvas';

describe('Geometry Utils', () => {
  const camera: Camera = { x: 100, y: 50, zoom: 2 };

  it('correctly maps coordinates between screen and world space', () => {
    const screenPt = { x: 300, y: 250 };
    const worldPt = screenToWorld(screenPt, camera);

    expect(worldPt.x).toBe((300 - 100) / 2); // 100
    expect(worldPt.y).toBe((250 - 50) / 2); // 100

    const mappedBack = worldToScreen(worldPt, camera);
    expect(mappedBack.x).toBe(300);
    expect(mappedBack.y).toBe(250);
  });

  it('calculates bounding box for standard rectangles', () => {
    const rect: CanvasElement = {
      id: 'r1',
      type: 'rectangle',
      x: 50,
      y: 80,
      width: 200,
      height: 100,
      rotation: 0,
      zIndex: 1,
      style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const bbox = getElementBoundingBox(rect);
    expect(bbox.minX).toBe(50);
    expect(bbox.minY).toBe(80);
    expect(bbox.maxX).toBe(250);
    expect(bbox.maxY).toBe(180);
    expect(bbox.width).toBe(200);
    expect(bbox.height).toBe(100);
  });

  it('calculates bounding box for circles centered at (x, y)', () => {
    const circle: CanvasElement = {
      id: 'c1',
      type: 'circle',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      radiusX: 50,
      radiusY: 50,
      rotation: 0,
      zIndex: 1,
      style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const bbox = getElementBoundingBox(circle);
    expect(bbox.minX).toBe(50);
    expect(bbox.minY).toBe(50);
    expect(bbox.maxX).toBe(150);
    expect(bbox.maxY).toBe(150);
  });

  it('calculates aggregate bounding box for multiple elements', () => {
    const elements: CanvasElement[] = [
      {
        id: 'r1',
        type: 'rectangle',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
        zIndex: 1,
        style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
      },
      {
        id: 'r2',
        type: 'rectangle',
        x: 200,
        y: 150,
        width: 50,
        height: 50,
        rotation: 0,
        zIndex: 2,
        style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
      },
    ];

    const agg = getElementsBoundingBox(elements);
    expect(agg).not.toBeNull();
    expect(agg!.minX).toBe(0);
    expect(agg!.minY).toBe(0);
    expect(agg!.maxX).toBe(250);
    expect(agg!.maxY).toBe(200);
    expect(agg!.width).toBe(250);
    expect(agg!.height).toBe(200);
  });

  it('correctly determines rectangle intersection', () => {
    const r1 = { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
    const r2 = { minX: 50, minY: 50, maxX: 150, maxY: 150, width: 100, height: 100 };
    const r3 = { minX: 200, minY: 200, maxX: 300, maxY: 300, width: 100, height: 100 };

    expect(rectsIntersect(r1, r2)).toBe(true);
    expect(rectsIntersect(r1, r3)).toBe(false);
  });

  it('clamps numerical values', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('simplifies colinear stroke points via RDP algorithm', () => {
    // 5 perfectly colinear points along y = 0
    const points = [0, 0, 10, 0, 20, 0, 30, 0, 40, 0];
    const simplified = simplifyRDP(points, 1.0);

    // Should collapse to first and last points only: [0, 0, 40, 0]
    expect(simplified.length).toBe(4);
    expect(simplified).toEqual([0, 0, 40, 0]);
  });
});
