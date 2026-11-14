import { describe, it, expect, beforeEach } from 'vitest';
import { useCanvasStore } from '../src/store/useCanvasStore';
import { CanvasElement } from '../src/types/canvas';

describe('History Undo / Redo Engine', () => {
  beforeEach(() => {
    // Reset canvas elements
    const store = useCanvasStore.getState();
    store.commitElements([]);
  });

  it('records history entries and enables undo/redo correctly', () => {
    const store = useCanvasStore.getState();

    const el1: CanvasElement = {
      id: 'e1',
      type: 'rectangle',
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      rotation: 0,
      zIndex: 1,
      style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const el2: CanvasElement = {
      id: 'e2',
      type: 'circle',
      x: 150,
      y: 150,
      width: 80,
      height: 80,
      radiusX: 40,
      radiusY: 40,
      rotation: 0,
      zIndex: 2,
      style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    // Commit 1
    store.commitElements([el1]);
    expect(useCanvasStore.getState().getElements().length).toBe(1);
    expect(useCanvasStore.getState().canUndo()).toBe(true);

    // Commit 2
    store.commitElements([el1, el2]);
    expect(useCanvasStore.getState().getElements().length).toBe(2);

    // Undo commit 2 -> should have 1 element
    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().getElements().length).toBe(1);
    expect(useCanvasStore.getState().canRedo()).toBe(true);

    // Redo -> should restore 2 elements
    useCanvasStore.getState().redo();
    expect(useCanvasStore.getState().getElements().length).toBe(2);
  });

  it('enforces maximum history depth limit of 50', () => {
    const store = useCanvasStore.getState();
    const boardId = store.getActiveBoard().id;

    for (let i = 0; i < 60; i++) {
      const el: CanvasElement = {
        id: `el_${i}`,
        type: 'rectangle',
        x: i * 5,
        y: i * 5,
        width: 50,
        height: 50,
        rotation: 0,
        zIndex: i,
        style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
      };
      useCanvasStore.getState().commitElements([el]);
    }

    const history = useCanvasStore.getState().historyMap[boardId];
    expect(history).toBeDefined();
    expect(history.past.length).toBeLessThanOrEqual(50);
  });
});
