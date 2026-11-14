import { describe, it, expect } from 'vitest';
import { migrateProjectSchema, CURRENT_SCHEMA_VERSION } from '../src/utils/migration';

describe('Project Schema Migration', () => {
  it('upgrades unversioned single-board legacy project to Schema v2', () => {
    const legacyProject = {
      id: 'legacy_1',
      title: 'Old Research Canvas',
      elements: [
        {
          id: 'item_1',
          type: 'rectangle',
          x: 10,
          y: 20,
          width: 100,
          height: 80,
          rotation: 0,
          zIndex: 1,
          style: { strokeColor: '#000', fillColor: '#fff', strokeWidth: 1, strokeStyle: 'solid', opacity: 1, fontSize: 14, fontFamily: 'Inter' },
        },
      ],
    };

    const migrated = migrateProjectSchema(legacyProject);

    expect(migrated.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(migrated.boards).toBeDefined();
    expect(migrated.boards.length).toBe(1);
    expect(migrated.boards[0].elements.length).toBe(1);
    expect(migrated.boards[0].elements[0].id).toBe('item_1');
    expect(migrated.boards[0].camera).toEqual({ x: 80, y: 80, zoom: 1 });
    expect(migrated.activeBoardId).toBe(migrated.boards[0].id);
  });

  it('preserves existing multi-board projects while stamping schema version 2', () => {
    const v1Project = {
      schemaVersion: 1,
      id: 'proj_v1',
      title: 'V1 Project',
      boards: [
        {
          id: 'b1',
          title: 'Hypothesis Board',
          elements: [],
          camera: { x: 100, y: 200, zoom: 1.5 },
          gridType: 'grid',
        },
        {
          id: 'b2',
          title: 'Evidence Board',
          elements: [],
          camera: { x: 0, y: 0, zoom: 1 },
          gridType: 'dots',
        },
      ],
      activeBoardId: 'b2',
    };

    const migrated = migrateProjectSchema(v1Project);

    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.boards.length).toBe(2);
    expect(migrated.activeBoardId).toBe('b2');
    expect(migrated.boards[0].camera).toEqual({ x: 100, y: 200, zoom: 1.5 });
    expect(migrated.boards[0].gridType).toBe('grid');
  });
});
