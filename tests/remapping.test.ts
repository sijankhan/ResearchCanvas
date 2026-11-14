import { describe, it, expect } from 'vitest';
import { remapElements } from '../src/store/useCanvasStore';
import { CanvasElement } from '../src/types/canvas';

describe('Element and Connector Remapping', () => {
  it('remaps connector endpoints when both source and target shapes are duplicated together', () => {
    const n1: CanvasElement = {
      id: 'node_1',
      type: 'rectangle',
      x: 100,
      y: 100,
      width: 150,
      height: 60,
      rotation: 0,
      zIndex: 1,
      style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const n2: CanvasElement = {
      id: 'node_2',
      type: 'diamond',
      x: 350,
      y: 100,
      width: 100,
      height: 80,
      rotation: 0,
      zIndex: 2,
      style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const conn: CanvasElement = {
      id: 'conn_1',
      type: 'connector',
      fromElementId: 'node_1',
      toElementId: 'node_2',
      fromAnchor: 'right',
      toAnchor: 'left',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      zIndex: 3,
      style: { strokeColor: '#38bdf8', fillColor: 'transparent', strokeWidth: 2, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const duplicated = remapElements([n1, n2, conn], 30);

    expect(duplicated.length).toBe(3);

    const dupN1 = duplicated[0];
    const dupN2 = duplicated[1];
    const dupConn = duplicated[2];

    // IDs must be newly generated and distinct
    expect(dupN1.id).not.toBe('node_1');
    expect(dupN2.id).not.toBe('node_2');
    expect(dupConn.id).not.toBe('conn_1');

    // Positions shifted by offset
    expect(dupN1.x).toBe(130);
    expect(dupN1.y).toBe(130);
    expect(dupN2.x).toBe(380);
    expect(dupN2.y).toBe(130);

    // Connector endpoints must now point to the new shape IDs
    if (dupConn.type === 'connector') {
      expect(dupConn.fromElementId).toBe(dupN1.id);
      expect(dupConn.toElementId).toBe(dupN2.id);
    } else {
      throw new Error('dupConn is not a connector');
    }
  });

  it('preserves original endpoints if a connector is duplicated alone', () => {
    const connAlone: CanvasElement = {
      id: 'conn_alone',
      type: 'connector',
      fromElementId: 'external_n1',
      toElementId: 'external_n2',
      fromAnchor: 'top',
      toAnchor: 'bottom',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
      zIndex: 1,
      style: { strokeColor: '#38bdf8', fillColor: 'transparent', strokeWidth: 2, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
    };

    const duplicated = remapElements([connAlone], 10);
    expect(duplicated.length).toBe(1);

    const dupConn = duplicated[0];
    expect(dupConn.id).not.toBe('conn_alone');

    if (dupConn.type === 'connector') {
      // Must retain original endpoints since external shapes were not duplicated
      expect(dupConn.fromElementId).toBe('external_n1');
      expect(dupConn.toElementId).toBe('external_n2');
    } else {
      throw new Error('dupConn is not a connector');
    }
  });
});
