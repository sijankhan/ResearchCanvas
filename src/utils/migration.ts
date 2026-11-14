import { Project } from '../types/canvas';

export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Validates and upgrades any loaded Project object to CURRENT_SCHEMA_VERSION (v2).
 * Ensures camera separation, clean history, and robust board structures.
 */
export function migrateProjectSchema(projectData: any): Project {
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Invalid project structure: root must be an object.');
  }

  const project: any = { ...projectData };

  // If no schemaVersion or version 1:
  if (!project.schemaVersion || project.schemaVersion < CURRENT_SCHEMA_VERSION) {
    project.schemaVersion = CURRENT_SCHEMA_VERSION;
  }

  // Ensure boards exist and are valid
  if (!Array.isArray(project.boards) || project.boards.length === 0) {
    const singleBoardElements = Array.isArray(project.elements) ? project.elements : [];
    project.boards = [
      {
        id: 'board_default',
        title: project.projectName || project.title || 'Main Canvas',
        elements: singleBoardElements,
        camera: { x: 80, y: 80, zoom: 1 },
        gridType: 'dots',
        history: { past: [], future: [] },
      },
    ];
    project.activeBoardId = 'board_default';
  } else {
    // Sanitize each board
    project.boards = project.boards.map((b: any, idx: number) => ({
      ...b,
      id: b.id || `board_${idx + 1}`,
      title: b.title || `Board ${idx + 1}`,
      elements: Array.isArray(b.elements) ? b.elements : [],
      camera: b.camera || { x: 80, y: 80, zoom: 1 },
      gridType: b.gridType || 'dots',
      history: { past: [], future: [] },
    }));

    if (!project.activeBoardId || !project.boards.some((b: any) => b.id === project.activeBoardId)) {
      project.activeBoardId = project.boards[0].id;
    }
  }

  // Ensure metadata exists
  if (!project.id) project.id = `proj_${Date.now()}`;
  if (!project.title) project.title = 'Untitled Research Project';
  if (!project.createdAt) project.createdAt = new Date().toISOString();
  if (!project.updatedAt) project.updatedAt = new Date().toISOString();

  return project as Project;
}
