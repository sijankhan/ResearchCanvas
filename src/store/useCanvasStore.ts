import { create } from 'zustand';
import {
  CanvasElement,
  ToolType,
  ElementStyle,
  Camera,
  GridType,
  Board,
  Project,
  ProjectMetadata,
  ThemeType,
  BrushType,
  EraserMode,
} from '../types/canvas';
import { sampleProject } from '../data/sampleProject';
import { generateId } from '../utils/id';
import { clamp, getElementsBoundingBox, getElementBoundingBox } from '../utils/geometry';
import { putImage } from '../services/imageStore';
import { useToastStore } from './useToastStore';
import { migrateProjectSchema } from '../utils/migration';

export interface BoardHistory {
  past: CanvasElement[][];
  future: CanvasElement[][];
}

export interface CanvasState {
  // Current active project & theme
  project: Project;
  theme: ThemeType;
  projectsList: ProjectMetadata[];

  // Active board ID
  activeBoardId: string;

  // Camera slice: separate from project.boards so zooming/panning does not trigger project rebuild
  camera: Camera;
  cameras: Record<string, Camera>;

  // History slice: separate from project.boards so undo/redo history is kept in memory only
  historyMap: Record<string, BoardHistory>;

  // Save status & error visibility
  saveStatus: 'saved' | 'saving' | 'error';
  saveError?: string;

  // Active Tool & Mode
  tool: ToolType;
  brushType: BrushType;
  eraserMode: EraserMode;
  selectedIds: string[];
  editingTextId: string | null;

  // Active Style defaults for new / selected elements
  activeStyle: ElementStyle;

  // UI Panels state
  isAiStudioOpen: boolean;
  isPresentationOpen: boolean;
  currentSlideIndex: number;
  isProjectsDashboardOpen: boolean;
  isShareModalOpen: boolean;

  // Getters
  getActiveBoard: () => Board;
  getElements: () => CanvasElement[];
  getCamera: () => Camera;
  getGridType: () => GridType;

  // Theme & App Actions
  toggleTheme: () => void;
  setTool: (tool: ToolType) => void;
  setBrushType: (brush: BrushType) => void;
  setEraserMode: (mode: EraserMode) => void;
  toggleAiStudio: () => void;
  setAiStudioOpen: (open: boolean) => void;
  setPresentationOpen: (open: boolean) => void;
  setSlideIndex: (index: number) => void;
  setProjectsDashboardOpen: (open: boolean) => void;
  setShareModalOpen: (open: boolean) => void;

  // Board Actions
  setActiveBoard: (boardId: string) => void;
  addBoard: (title?: string) => void;
  deleteBoard: (boardId: string) => void;
  renameBoard: (boardId: string, title: string) => void;
  duplicateBoard: (boardId: string) => void;

  // Project Actions
  createBlankProject: () => void;
  switchProject: (projectId: string) => void;
  renameProject: (title: string) => void;
  duplicateCurrentProject: () => void;
  deleteProject: (projectId: string) => void;
  loadProjectData: (proj: Project) => void;
  flushSave: () => void;

  // Camera Actions (smooth, lightweight, updates camera slice only)
  setCamera: (camera: Partial<Camera> | ((prev: Camera) => Camera)) => void;
  panBy: (dx: number, dy: number) => void;
  zoomAtPoint: (delta: number, clientX: number, clientY: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo100: () => void;
  zoomToFit: (viewportWidth: number, viewportHeight: number) => void;
  setGridType: (type: GridType) => void;

  // Unified Element & History Commit Engine
  commitElements: (nextElements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  addElementsBatch: (elements: CanvasElement[]) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>, commit?: boolean) => void;
  updateSelectedStyle: (updates: Partial<ElementStyle>) => void;
  setActiveStyle: (updates: Partial<ElementStyle>) => void;

  // Selection Actions
  setSelectedIds: (ids: string[]) => void;
  selectSingle: (id: string) => void;
  toggleSelectId: (id: string) => void;
  clearSelection: () => void;

  // Object Operations
  deleteSelected: () => void;
  duplicateSelected: () => void;
  toggleLockSelected: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  alignSelected: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (direction: 'horizontal' | 'vertical') => void;

  // Clipboard & Selection Shortcuts (Phase 5)
  internalClipboard: CanvasElement[];
  copySelected: () => void;
  cutSelected: () => void;
  pasteClipboard: (offset?: number) => void;
  selectAll: () => void;
  nudgeSelected: (dx: number, dy: number) => void;

  // Specific Element Builders
  addImageElement: (src: string, width?: number, height?: number, caption?: string) => Promise<void>;
  addTableElement: (rows?: number, cols?: number) => void;

  // Inline editing
  setEditingTextId: (id: string | null) => void;

  // History (per active board, memory-only)
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearCanvas: () => void;
}

const STORAGE_ACTIVE_PROJECT_ID = 'research_canvas_active_project_id_v2';
const STORAGE_PROJECTS_LIST = 'research_canvas_projects_index_v2';
const PROJECT_PREFIX = 'research_proj_';

const defaultStyle: ElementStyle = {
  strokeColor: '#38bdf8',
  fillColor: 'transparent',
  strokeWidth: 2,
  strokeStyle: 'solid',
  opacity: 1,
  fontSize: 16,
  fontFamily: 'Inter',
  cornerRadius: 8,
};

// -----------------------------------------------------------------
// Helper: Connector remapping during duplication
// -----------------------------------------------------------------
export function remapElements(elements: CanvasElement[], offset = 0): CanvasElement[] {
  const idMap = new Map<string, string>();
  elements.forEach((el) => {
    idMap.set(el.id, generateId(el.type));
  });

  return elements.map((el) => {
    const newId = idMap.get(el.id)!;
    const cloned = {
      ...el,
      id: newId,
      x: el.x + offset,
      y: el.y + offset,
    };

    if (cloned.type === 'connector') {
      // If endpoint is in copied set, remap to newId. If duplicated alone, keep original endpoint!
      cloned.fromElementId = idMap.get(cloned.fromElementId) || cloned.fromElementId;
      cloned.toElementId = idMap.get(cloned.toElementId) || cloned.toElementId;
    }
    return cloned as CanvasElement;
  });
}

// -----------------------------------------------------------------
// Persistence & Debounce Engine
// -----------------------------------------------------------------
let saveTimer: ReturnType<typeof setTimeout> | null = null;

function saveCurrentProjectNow() {
  const state = useCanvasStore.getState();
  const proj = state.project;
  const cameras = state.cameras;

  // Clean project without history, updating camera lazily
  const projectToSave: Project = {
    ...proj,
    boards: proj.boards.map((b) => ({
      ...b,
      camera: cameras[b.id] || b.camera || { x: 80, y: 80, zoom: 1 },
      history: { past: [], future: [] },
    })),
  };

  try {
    localStorage.setItem(`${PROJECT_PREFIX}${proj.id}`, JSON.stringify(projectToSave));
    localStorage.setItem(STORAGE_ACTIVE_PROJECT_ID, proj.id);

    // Sync project metadata index
    const list = state.projectsList;
    const meta: ProjectMetadata = {
      id: proj.id,
      title: proj.title,
      description: proj.description,
      createdAt: proj.createdAt,
      updatedAt: proj.updatedAt,
      boardsCount: proj.boards.length,
      elementsCount: proj.boards.reduce((acc, b) => acc + b.elements.length, 0),
      theme: proj.theme,
    };
    const nextList = list.some((p) => p.id === proj.id)
      ? list.map((p) => (p.id === proj.id ? meta : p))
      : [meta, ...list];

    localStorage.setItem(STORAGE_PROJECTS_LIST, JSON.stringify(nextList));

    useCanvasStore.setState({
      saveStatus: 'saved',
      saveError: undefined,
      projectsList: nextList,
    });
  } catch (err: any) {
    console.error('Failed to save project to localStorage:', err);
    useCanvasStore.setState({
      saveStatus: 'error',
      saveError: 'Save failed, storage full. Export your project',
    });
  }
}

function scheduleSave() {
  useCanvasStore.setState({ saveStatus: 'saving', saveError: undefined });
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveCurrentProjectNow();
  }, 400);
}

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  saveCurrentProjectNow();
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    flushSave();
  });
}

// -----------------------------------------------------------------
// Initial Store Hydration & Migration
// -----------------------------------------------------------------
function initProjects(): {
  project: Project;
  projectsList: ProjectMetadata[];
  activeBoardId: string;
  cameras: Record<string, Camera>;
  camera: Camera;
} {
  // Ensure sample project is saved once under its own key if never saved
  const sampleKey = `${PROJECT_PREFIX}${sampleProject.id}`;
  if (!localStorage.getItem(sampleKey)) {
    try {
      const cleanSample = {
        ...sampleProject,
        boards: sampleProject.boards.map((b) => ({ ...b, history: { past: [], future: [] } })),
      };
      localStorage.setItem(sampleKey, JSON.stringify(cleanSample));
    } catch {
      // ignore
    }
  }

  // Determine active project ID
  let activeId = localStorage.getItem(STORAGE_ACTIVE_PROJECT_ID);
  if (!activeId) {
    activeId = sampleProject.id;
  }

  let project: Project | null = null;
  try {
    const raw = localStorage.getItem(`${PROJECT_PREFIX}${activeId}`);
    if (raw) {
      project = JSON.parse(raw);
    }
  } catch {
    project = null;
  }

  if (!project || !Array.isArray(project.boards) || project.boards.length === 0) {
    // Try sample project from storage or static
    try {
      const rawSample = localStorage.getItem(sampleKey);
      project = rawSample ? JSON.parse(rawSample) : sampleProject;
    } catch {
      project = sampleProject;
    }
  }

  // Schema validation & migration (Phase 5)
  project = migrateProjectSchema(project);

  const activeBoardId = project!.activeBoardId || project!.boards[0]?.id || 'board_overview';

  // Build initial cameras
  const cameras: Record<string, Camera> = {};
  project!.boards.forEach((b) => {
    cameras[b.id] = b.camera || { x: 80, y: 80, zoom: 1 };
  });
  const camera = cameras[activeBoardId] || { x: 80, y: 80, zoom: 1 };

  // Load or build projects index
  let projectsList: ProjectMetadata[] = [];
  try {
    const rawList = localStorage.getItem(STORAGE_PROJECTS_LIST);
    if (rawList) {
      projectsList = JSON.parse(rawList);
    }
  } catch {
    // ignore
  }

  if (!projectsList || projectsList.length === 0) {
    projectsList = [
      {
        id: project!.id,
        title: project!.title,
        description: project!.description,
        createdAt: project!.createdAt,
        updatedAt: project!.updatedAt,
        boardsCount: project!.boards.length,
        elementsCount: project!.boards.reduce((acc, b) => acc + b.elements.length, 0),
        theme: project!.theme,
      },
    ];
    if (project!.id !== sampleProject.id) {
      projectsList.push({
        id: sampleProject.id,
        title: sampleProject.title,
        description: sampleProject.description,
        createdAt: sampleProject.createdAt,
        updatedAt: sampleProject.updatedAt,
        boardsCount: sampleProject.boards.length,
        elementsCount: sampleProject.boards.reduce((acc, b) => acc + b.elements.length, 0),
        theme: sampleProject.theme,
      });
    }
  }

  return {
    project: project!,
    projectsList,
    activeBoardId,
    cameras,
    camera,
  };
}

function applyThemeClass(theme: ThemeType) {
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

const initialData = initProjects();
applyThemeClass(initialData.project.theme || 'dark');

export const useCanvasStore = create<CanvasState>((set, get) => ({
  project: initialData.project,
  theme: initialData.project.theme || 'dark',
  projectsList: initialData.projectsList,
  activeBoardId: initialData.activeBoardId,

  camera: initialData.camera,
  cameras: initialData.cameras,
  historyMap: {},

  saveStatus: 'saved',
  saveError: undefined,

  tool: 'select',
  brushType: 'pen',
  eraserMode: 'object',
  selectedIds: [],
  internalClipboard: [],
  editingTextId: null,
  activeStyle: defaultStyle,

  isAiStudioOpen: false,
  isPresentationOpen: false,
  currentSlideIndex: 0,
  isProjectsDashboardOpen: false,
  isShareModalOpen: false,

  getActiveBoard: () => {
    const { project, activeBoardId } = get();
    return project.boards.find((b) => b.id === activeBoardId) || project.boards[0];
  },

  getElements: () => {
    return get().getActiveBoard().elements;
  },

  getCamera: () => {
    return get().camera;
  },

  getGridType: () => {
    return get().getActiveBoard().gridType;
  },

  toggleTheme: () => {
    const nextTheme: ThemeType = get().theme === 'dark' ? 'light' : 'dark';
    applyThemeClass(nextTheme);
    const updated = { ...get().project, theme: nextTheme };
    set({ theme: nextTheme, project: updated });
    scheduleSave();
  },

  setTool: (tool) => {
    set({ tool });
    if (tool !== 'select' && tool !== 'eraser') {
      set({ selectedIds: [] });
    }
  },

  setBrushType: (brushType) => set({ brushType }),
  setEraserMode: (eraserMode) => set({ eraserMode }),

  toggleAiStudio: () => set((state) => ({ isAiStudioOpen: !state.isAiStudioOpen })),
  setAiStudioOpen: (open) => set({ isAiStudioOpen: open }),

  setPresentationOpen: (open) => set({ isPresentationOpen: open }),
  setSlideIndex: (currentSlideIndex) => set({ currentSlideIndex }),

  setProjectsDashboardOpen: (open) => set({ isProjectsDashboardOpen: open }),
  setShareModalOpen: (open) => set({ isShareModalOpen: open }),
  flushSave: () => flushSave(),

  // -----------------------------------------------------------------
  // Board Operations
  // -----------------------------------------------------------------
  setActiveBoard: (boardId) => {
    const { project, cameras, activeBoardId, camera } = get();
    if (activeBoardId === boardId) return;

    // Save previous board camera
    const nextCameras = { ...cameras, [activeBoardId]: camera };

    if (project.boards.some((b) => b.id === boardId)) {
      const nextBoard = project.boards.find((b) => b.id === boardId)!;
      const targetCamera = nextCameras[boardId] || nextBoard.camera || { x: 80, y: 80, zoom: 1 };
      const updated = { ...project, activeBoardId: boardId };

      set({
        project: updated,
        activeBoardId: boardId,
        selectedIds: [],
        cameras: nextCameras,
        camera: targetCamera,
      });

      flushSave();
    }
  },

  addBoard: (title) => {
    const { project, cameras } = get();
    const newBoardId = generateId('board');
    const newBoardCamera: Camera = { x: 80, y: 80, zoom: 1 };

    const newBoard: Board = {
      id: newBoardId,
      title: title || `Board ${project.boards.length + 1}`,
      elements: [],
      camera: newBoardCamera,
      gridType: 'dots',
      history: { past: [], future: [] },
    };

    const nextBoards = [...project.boards, newBoard];
    const updatedProject = {
      ...project,
      boards: nextBoards,
      activeBoardId: newBoardId,
      updatedAt: new Date().toISOString(),
    };

    set({
      project: updatedProject,
      activeBoardId: newBoardId,
      selectedIds: [],
      cameras: { ...cameras, [newBoardId]: newBoardCamera },
      camera: newBoardCamera,
    });

    scheduleSave();
  },

  deleteBoard: (boardId) => {
    const { project } = get();
    if (project.boards.length <= 1) {
      useToastStore.getState().showToast('A project must contain at least one board.', 'warning');
      return;
    }

    const nextBoards = project.boards.filter((b) => b.id !== boardId);
    const nextActiveId = project.activeBoardId === boardId ? nextBoards[0].id : project.activeBoardId;

    const updated = {
      ...project,
      boards: nextBoards,
      activeBoardId: nextActiveId,
      updatedAt: new Date().toISOString(),
    };

    set({ project: updated, activeBoardId: nextActiveId, selectedIds: [] });
    scheduleSave();
  },

  renameBoard: (boardId, title) => {
    const { project } = get();
    const nextBoards = project.boards.map((b) => (b.id === boardId ? { ...b, title } : b));
    const updated = { ...project, boards: nextBoards, updatedAt: new Date().toISOString() };
    set({ project: updated });
    scheduleSave();
  },

  duplicateBoard: (boardId) => {
    const { project, cameras } = get();
    const target = project.boards.find((b) => b.id === boardId);
    if (!target) return;

    const newId = generateId('board');
    // Remap connectors cleanly
    const remappedElements = remapElements(target.elements, 0);

    const newBoard: Board = {
      ...target,
      id: newId,
      title: `${target.title} (Copy)`,
      elements: remappedElements,
      history: { past: [], future: [] },
    };

    const nextBoards = [...project.boards, newBoard];
    const updated = { ...project, boards: nextBoards, activeBoardId: newId, updatedAt: new Date().toISOString() };
    const nextCameras = { ...cameras, [newId]: { ...(cameras[boardId] || target.camera) } };

    set({
      project: updated,
      activeBoardId: newId,
      cameras: nextCameras,
      camera: nextCameras[newId],
    });

    scheduleSave();
  },

  // -----------------------------------------------------------------
  // Project Operations (Per-project persistence)
  // -----------------------------------------------------------------
  createBlankProject: () => {
    flushSave(); // Save current project first!

    const newId = generateId('proj');
    const newBoardId = generateId('board');
    const initCam: Camera = { x: 80, y: 80, zoom: 1 };

    const newProject: Project = {
      id: newId,
      title: 'Untitled Research Project',
      description: 'Blank research investigation workspace',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: get().theme,
      boards: [
        {
          id: newBoardId,
          title: 'Board 1',
          elements: [],
          camera: initCam,
          gridType: 'dots',
          history: { past: [], future: [] },
        },
      ],
      activeBoardId: newBoardId,
    };

    const nextList: ProjectMetadata[] = [
      {
        id: newProject.id,
        title: newProject.title,
        description: newProject.description,
        createdAt: newProject.createdAt,
        updatedAt: newProject.updatedAt,
        boardsCount: 1,
        elementsCount: 0,
        theme: newProject.theme,
      },
      ...get().projectsList,
    ];

    set({
      project: newProject,
      activeBoardId: newBoardId,
      projectsList: nextList,
      selectedIds: [],
      camera: initCam,
      cameras: { [newBoardId]: initCam },
      historyMap: {},
      isProjectsDashboardOpen: false,
    });

    saveCurrentProjectNow();
  },

  switchProject: (projectId) => {
    if (get().project.id === projectId) {
      set({ isProjectsDashboardOpen: false });
      return;
    }

    // 1. Flush save of current project first!
    flushSave();

    // 2. Read target project from its own key
    let loaded: Project | null = null;
    try {
      const raw = localStorage.getItem(`${PROJECT_PREFIX}${projectId}`);
      if (raw) {
        loaded = JSON.parse(raw);
      }
    } catch {
      loaded = null;
    }

    if (!loaded && projectId === sampleProject.id) {
      loaded = sampleProject;
    }

    if (!loaded) {
      useToastStore.getState().showToast('Selected project data could not be found.', 'error');
      return;
    }

    const nextActiveBoardId = loaded.activeBoardId || loaded.boards[0]?.id || 'board_overview';
    const nextCameras: Record<string, Camera> = {};
    loaded.boards.forEach((b) => {
      nextCameras[b.id] = b.camera || { x: 80, y: 80, zoom: 1 };
    });
    const nextCamera = nextCameras[nextActiveBoardId] || { x: 80, y: 80, zoom: 1 };

    const nextTheme = loaded.theme || 'dark';
    applyThemeClass(nextTheme);

    set({
      project: loaded,
      theme: nextTheme,
      activeBoardId: nextActiveBoardId,
      selectedIds: [],
      camera: nextCamera,
      cameras: nextCameras,
      historyMap: {},
      isProjectsDashboardOpen: false,
    });

    localStorage.setItem(STORAGE_ACTIVE_PROJECT_ID, loaded.id);
  },

  renameProject: (title) => {
    const { project, projectsList } = get();
    const updated = { ...project, title, updatedAt: new Date().toISOString() };
    const nextList = projectsList.map((p) => (p.id === project.id ? { ...p, title, updatedAt: updated.updatedAt } : p));
    set({ project: updated, projectsList: nextList });
    scheduleSave();
  },

  duplicateCurrentProject: () => {
    flushSave();

    const { project, projectsList, cameras } = get();
    const newId = generateId('proj');

    const nextCameras: Record<string, Camera> = {};
    const clonedBoards = project.boards.map((b) => {
      const newBoardId = generateId('board');
      nextCameras[newBoardId] = cameras[b.id] || b.camera || { x: 80, y: 80, zoom: 1 };
      return {
        ...b,
        id: newBoardId,
        elements: remapElements(b.elements, 0),
        history: { past: [], future: [] },
      };
    });

    const duplicatedProject: Project = {
      ...project,
      id: newId,
      title: `${project.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      boards: clonedBoards,
      activeBoardId: clonedBoards[0].id,
    };

    const nextList: ProjectMetadata[] = [
      {
        id: duplicatedProject.id,
        title: duplicatedProject.title,
        description: duplicatedProject.description,
        createdAt: duplicatedProject.createdAt,
        updatedAt: duplicatedProject.updatedAt,
        boardsCount: duplicatedProject.boards.length,
        elementsCount: duplicatedProject.boards.reduce((acc, b) => acc + b.elements.length, 0),
        theme: duplicatedProject.theme,
      },
      ...projectsList,
    ];

    set({
      project: duplicatedProject,
      activeBoardId: duplicatedProject.activeBoardId,
      projectsList: nextList,
      cameras: nextCameras,
      camera: nextCameras[duplicatedProject.activeBoardId],
      historyMap: {},
    });

    saveCurrentProjectNow();
  },

  deleteProject: (projectId) => {
    const { projectsList, project } = get();
    if (projectsList.length <= 1) {
      useToastStore.getState().showToast('You must have at least one project.', 'warning');
      return;
    }

    // Remove stored data for deleted project
    try {
      localStorage.removeItem(`${PROJECT_PREFIX}${projectId}`);
    } catch {
      // ignore
    }

    const nextList = projectsList.filter((p) => p.id !== projectId);
    set({ projectsList: nextList });
    try {
      localStorage.setItem(STORAGE_PROJECTS_LIST, JSON.stringify(nextList));
    } catch {
      // ignore
    }

    if (project.id === projectId) {
      get().switchProject(nextList[0].id);
    }
  },

  loadProjectData: (unmigratedProject) => {
    const loadedProject = migrateProjectSchema(unmigratedProject);
    const nextActiveBoardId = loadedProject.activeBoardId || loadedProject.boards[0]?.id;
    const nextCameras: Record<string, Camera> = {};
    loadedProject.boards.forEach((b) => {
      nextCameras[b.id] = b.camera || { x: 80, y: 80, zoom: 1 };
    });

    const nextTheme = loadedProject.theme || 'dark';
    applyThemeClass(nextTheme);

    set({
      project: loadedProject,
      theme: nextTheme,
      activeBoardId: nextActiveBoardId,
      selectedIds: [],
      cameras: nextCameras,
      camera: nextCameras[nextActiveBoardId] || { x: 80, y: 80, zoom: 1 },
      historyMap: {},
    });

    saveCurrentProjectNow();
  },

  // -----------------------------------------------------------------
  // Camera Actions (Fast 60fps slice, zero project clones)
  // -----------------------------------------------------------------
  setCamera: (updater) => {
    set((state) => {
      const nextCamera = typeof updater === 'function' ? updater(state.camera) : { ...state.camera, ...updater };
      return {
        camera: nextCamera,
        cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
      };
    });
  },

  panBy: (dx, dy) => {
    set((state) => {
      const nextCamera = {
        ...state.camera,
        x: state.camera.x + dx,
        y: state.camera.y + dy,
      };
      return {
        camera: nextCamera,
        cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
      };
    });
  },

  zoomAtPoint: (delta, clientX, clientY) => {
    set((state) => {
      const oldZoom = state.camera.zoom;
      const factor = delta < 0 ? 1.15 : 0.85;
      const newZoom = clamp(Math.round(oldZoom * factor * 100) / 100, 0.1, 5.0);

      if (newZoom === oldZoom) return state;

      const worldX = (clientX - state.camera.x) / oldZoom;
      const worldY = (clientY - state.camera.y) / oldZoom;

      const newX = clientX - worldX * newZoom;
      const newY = clientY - worldY * newZoom;

      const nextCamera = { x: newX, y: newY, zoom: newZoom };
      return {
        camera: nextCamera,
        cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
      };
    });
  },

  zoomIn: () => {
    set((state) => {
      const newZoom = clamp(Math.round((state.camera.zoom + 0.15) * 100) / 100, 0.1, 5.0);
      const nextCamera = { ...state.camera, zoom: newZoom };
      return {
        camera: nextCamera,
        cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
      };
    });
  },

  zoomOut: () => {
    set((state) => {
      const newZoom = clamp(Math.round((state.camera.zoom - 0.15) * 100) / 100, 0.1, 5.0);
      const nextCamera = { ...state.camera, zoom: newZoom };
      return {
        camera: nextCamera,
        cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
      };
    });
  },

  zoomTo100: () => {
    set((state) => {
      const nextCamera = { ...state.camera, zoom: 1 };
      return {
        camera: nextCamera,
        cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
      };
    });
  },

  zoomToFit: (viewportWidth, viewportHeight) => {
    const { getActiveBoard } = get();
    const activeBoard = getActiveBoard();
    const bbox = getElementsBoundingBox(activeBoard.elements);

    let nextCamera: Camera;
    if (!bbox || bbox.width === 0 || bbox.height === 0) {
      nextCamera = { x: viewportWidth / 2, y: viewportHeight / 2, zoom: 1 };
    } else {
      const padding = 100;
      const availableW = Math.max(100, viewportWidth - padding * 2);
      const availableH = Math.max(100, viewportHeight - padding * 2);

      const scaleX = availableW / bbox.width;
      const scaleY = availableH / bbox.height;
      const targetZoom = clamp(Math.min(scaleX, scaleY, 1.5), 0.2, 2.5);

      const centerX = bbox.minX + bbox.width / 2;
      const centerY = bbox.minY + bbox.height / 2;

      nextCamera = {
        x: viewportWidth / 2 - centerX * targetZoom,
        y: viewportHeight / 2 - centerY * targetZoom,
        zoom: targetZoom,
      };
    }

    set((state) => ({
      camera: nextCamera,
      cameras: { ...state.cameras, [state.activeBoardId]: nextCamera },
    }));
  },

  setGridType: (type) => {
    const { getActiveBoard, project } = get();
    const activeBoard = getActiveBoard();
    const nextBoards = project.boards.map((b) => (b.id === activeBoard.id ? { ...b, gridType: type } : b));
    set({ project: { ...project, boards: nextBoards } });
    scheduleSave();
  },

  // -----------------------------------------------------------------
  // Unified Element & History Commit Engine (PHASE 2)
  // -----------------------------------------------------------------
  commitElements: (nextElements) => {
    const { project, activeBoardId, historyMap } = get();
    const activeBoard = project.boards.find((b) => b.id === activeBoardId) || project.boards[0];
    if (!activeBoard) return;

    const currentHistory = historyMap[activeBoard.id] || { past: [], future: [] };
    const nextPast = [...currentHistory.past.slice(-49), activeBoard.elements];

    const nextBoards = project.boards.map((b) =>
      b.id === activeBoard.id ? { ...b, elements: nextElements } : b
    );

    const updatedProject = {
      ...project,
      boards: nextBoards,
      updatedAt: new Date().toISOString(),
    };

    set({
      project: updatedProject,
      historyMap: {
        ...historyMap,
        [activeBoard.id]: {
          past: nextPast,
          future: [],
        },
      },
    });

    scheduleSave();
  },

  addElement: (element) => {
    const { getElements, commitElements } = get();
    commitElements([...getElements(), element]);
    set({ selectedIds: [element.id] });
  },

  addElementsBatch: (newElems) => {
    const { getElements, commitElements } = get();
    commitElements([...getElements(), ...newElems]);
    set({ selectedIds: newElems.map((e) => e.id) });
  },

  updateElement: (id, updates, commit = false) => {
    const { getActiveBoard, project, commitElements } = get();
    const activeBoard = getActiveBoard();
    const nextElements = activeBoard.elements.map((el) => (el.id === id ? { ...el, ...updates } : el)) as CanvasElement[];

    if (commit) {
      commitElements(nextElements);
    } else {
      // In-flight drag/transform: update element without creating history snapshot
      const nextBoards = project.boards.map((b) => (b.id === activeBoard.id ? { ...b, elements: nextElements } : b));
      set({ project: { ...project, boards: nextBoards } });
    }
  },

  updateSelectedStyle: (updates) => {
    const { getActiveBoard, selectedIds, activeStyle, commitElements } = get();
    const activeBoard = getActiveBoard();
    const newStyle = { ...activeStyle, ...updates };

    if (selectedIds.length === 0) {
      set({ activeStyle: newStyle });
      return;
    }

    const nextElements = activeBoard.elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        return { ...el, style: { ...el.style, ...updates } };
      }
      return el;
    }) as CanvasElement[];

    set({ activeStyle: newStyle });
    commitElements(nextElements);
  },

  setActiveStyle: (updates) => {
    set((state) => ({ activeStyle: { ...state.activeStyle, ...updates } }));
  },

  setSelectedIds: (selectedIds) => set({ selectedIds }),
  selectSingle: (id) => set({ selectedIds: [id] }),
  toggleSelectId: (id) => {
    set((state) => {
      const exists = state.selectedIds.includes(id);
      return {
        selectedIds: exists ? state.selectedIds.filter((x) => x !== id) : [...state.selectedIds, id],
      };
    });
  },
  clearSelection: () => set({ selectedIds: [] }),

  deleteSelected: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;

    const activeBoard = getActiveBoard();
    const nextElements = activeBoard.elements.filter((el) => !selectedIds.includes(el.id));
    set({ selectedIds: [] });
    commitElements(nextElements);
  },

  duplicateSelected: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;

    const activeBoard = getActiveBoard();
    const selectedElements = activeBoard.elements.filter((el) => selectedIds.includes(el.id));

    // Remap connectors cleanly
    const offset = 35;
    const duplicated = remapElements(selectedElements, offset);
    const newSelectedIds = duplicated.map((d) => d.id);

    commitElements([...activeBoard.elements, ...duplicated]);
    set({ selectedIds: newSelectedIds });
  },

  copySelected: () => {
    const { getActiveBoard, selectedIds } = get();
    if (selectedIds.length === 0) return;
    const activeBoard = getActiveBoard();
    const selectedElements = activeBoard.elements.filter((el) => selectedIds.includes(el.id));
    const cloned: CanvasElement[] = JSON.parse(JSON.stringify(selectedElements));
    set({ internalClipboard: cloned });
    useToastStore.getState().showToast(
      `Copied ${cloned.length} item${cloned.length > 1 ? 's' : ''}`,
      'info',
      1500
    );
  },

  cutSelected: () => {
    const { copySelected, deleteSelected } = get();
    copySelected();
    deleteSelected();
  },

  pasteClipboard: (offset = 30) => {
    const { internalClipboard, getActiveBoard, commitElements } = get();
    if (!internalClipboard || internalClipboard.length === 0) return;

    const activeBoard = getActiveBoard();
    const duplicated = remapElements(internalClipboard, offset);
    const newSelectedIds = duplicated.map((d) => d.id);

    commitElements([...activeBoard.elements, ...duplicated]);
    set({
      selectedIds: newSelectedIds,
      internalClipboard: duplicated,
    });
  },

  selectAll: () => {
    const { getActiveBoard } = get();
    const activeBoard = getActiveBoard();
    set({ selectedIds: activeBoard.elements.map((el) => el.id) });
  },

  nudgeSelected: (dx: number, dy: number) => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;

    const activeBoard = getActiveBoard();
    const nextElements = activeBoard.elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        return {
          ...el,
          x: Math.round(el.x + dx),
          y: Math.round(el.y + dy),
        };
      }
      return el;
    });

    commitElements(nextElements);
  },

  toggleLockSelected: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;

    const activeBoard = getActiveBoard();
    const nextElements = activeBoard.elements.map((el) => {
      if (selectedIds.includes(el.id)) {
        return { ...el, isLocked: !el.isLocked };
      }
      return el;
    });

    commitElements(nextElements);
  },

  bringToFront: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;
    const activeBoard = getActiveBoard();

    const unselected = activeBoard.elements.filter((el) => !selectedIds.includes(el.id));
    const selected = activeBoard.elements.filter((el) => selectedIds.includes(el.id));
    const nextElements = [...unselected, ...selected].map((el, i) => ({ ...el, zIndex: i + 1 }));

    commitElements(nextElements);
  },

  sendToBack: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;
    const activeBoard = getActiveBoard();

    const unselected = activeBoard.elements.filter((el) => !selectedIds.includes(el.id));
    const selected = activeBoard.elements.filter((el) => selectedIds.includes(el.id));
    const nextElements = [...selected, ...unselected].map((el, i) => ({ ...el, zIndex: i + 1 }));

    commitElements(nextElements);
  },

  bringForward: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;
    const activeBoard = getActiveBoard();

    const list = [...activeBoard.elements];
    for (let i = list.length - 2; i >= 0; i--) {
      if (selectedIds.includes(list[i].id) && !selectedIds.includes(list[i + 1].id)) {
        const temp = list[i];
        list[i] = list[i + 1];
        list[i + 1] = temp;
      }
    }
    const nextElements = list.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
    commitElements(nextElements);
  },

  sendBackward: () => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length === 0) return;
    const activeBoard = getActiveBoard();

    const list = [...activeBoard.elements];
    for (let i = 1; i < list.length; i++) {
      if (selectedIds.includes(list[i].id) && !selectedIds.includes(list[i - 1].id)) {
        const temp = list[i];
        list[i] = list[i - 1];
        list[i - 1] = temp;
      }
    }
    const nextElements = list.map((el, idx) => ({ ...el, zIndex: idx + 1 }));
    commitElements(nextElements);
  },

  alignSelected: (alignment) => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length < 2) return;
    const activeBoard = getActiveBoard();

    const selectedElements = activeBoard.elements.filter((el) => selectedIds.includes(el.id));
    const bboxes = selectedElements.map(getElementBoundingBox);

    const minX = Math.min(...bboxes.map((b) => b.minX));
    const maxX = Math.max(...bboxes.map((b) => b.maxX));
    const minY = Math.min(...bboxes.map((b) => b.minY));
    const maxY = Math.max(...bboxes.map((b) => b.maxY));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const nextElements: CanvasElement[] = activeBoard.elements.map((el) => {
      if (!selectedIds.includes(el.id)) return el;
      const updates: Partial<CanvasElement> = {};

      switch (alignment) {
        case 'left':
          updates.x = minX;
          break;
        case 'right':
          updates.x = maxX - el.width;
          break;
        case 'center':
          updates.x = centerX - el.width / 2;
          break;
        case 'top':
          updates.y = minY;
          break;
        case 'bottom':
          updates.y = maxY - el.height;
          break;
        case 'middle':
          updates.y = centerY - el.height / 2;
          break;
      }
      return { ...el, ...updates } as CanvasElement;
    });

    commitElements(nextElements);
  },

  distributeSelected: (direction) => {
    const { getActiveBoard, selectedIds, commitElements } = get();
    if (selectedIds.length < 3) return;
    const activeBoard = getActiveBoard();

    const selected = activeBoard.elements.filter((el) => selectedIds.includes(el.id));

    if (direction === 'horizontal') {
      const sorted = [...selected].sort((a, b) => a.x - b.x);
      const minX = sorted[0].x;
      const last = sorted[sorted.length - 1];
      const maxX = last.x;
      const totalSpacing = maxX - minX;
      const step = totalSpacing / (sorted.length - 1);

      const posMap = new Map<string, number>();
      sorted.forEach((el, idx) => {
        posMap.set(el.id, Math.round(minX + idx * step));
      });

      const nextElements: CanvasElement[] = activeBoard.elements.map((el) => {
        if (posMap.has(el.id)) {
          return { ...el, x: posMap.get(el.id)! };
        }
        return el;
      });
      commitElements(nextElements);
    } else {
      const sorted = [...selected].sort((a, b) => a.y - b.y);
      const minY = sorted[0].y;
      const last = sorted[sorted.length - 1];
      const maxY = last.y;
      const totalSpacing = maxY - minY;
      const step = totalSpacing / (sorted.length - 1);

      const posMap = new Map<string, number>();
      sorted.forEach((el, idx) => {
        posMap.set(el.id, Math.round(minY + idx * step));
      });

      const nextElements: CanvasElement[] = activeBoard.elements.map((el) => {
        if (posMap.has(el.id)) {
          return { ...el, y: posMap.get(el.id)! };
        }
        return el;
      });
      commitElements(nextElements);
    }
  },

  addImageElement: async (src, width = 450, height = 300, caption) => {
    const { getCamera, addElement, activeStyle } = get();
    const camera = getCamera();
    const worldX = Math.round((window.innerWidth / 2 - camera.x) / camera.zoom - width / 2);
    const worldY = Math.round((window.innerHeight / 2 - camera.y) / camera.zoom - height / 2);

    // Save image to IndexedDB and obtain imageId
    let imageId: string | undefined;
    try {
      imageId = await putImage(src);
    } catch {
      // fallback
    }

    const newImg: CanvasElement = {
      id: generateId('img'),
      type: 'image',
      x: worldX,
      y: worldY,
      width,
      height,
      rotation: 0,
      zIndex: get().getElements().length + 1,
      src: imageId ? undefined : src,
      imageId,
      caption: caption || 'Research Figure',
      naturalWidth: width,
      naturalHeight: height,
      style: { ...activeStyle, strokeColor: '#38bdf8', strokeWidth: 1.5, cornerRadius: 8 },
    };
    addElement(newImg);
  },

  addTableElement: (rows = 3, cols = 3) => {
    const { getCamera, addElement, activeStyle } = get();
    const camera = getCamera();
    const width = 640;
    const height = (rows + 1) * 44;
    const worldX = Math.round((window.innerWidth / 2 - camera.x) / camera.zoom - width / 2);
    const worldY = Math.round((window.innerHeight / 2 - camera.y) / camera.zoom - height / 2);

    const headers = Array.from({ length: cols }, (_, i) => `Column ${i + 1}`);
    const data = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 'Data cell'));

    const newTable: CanvasElement = {
      id: generateId('tbl'),
      type: 'table',
      x: worldX,
      y: worldY,
      width,
      height,
      rotation: 0,
      zIndex: get().getElements().length + 1,
      rows,
      cols,
      headers,
      data,
      colWidths: Array(cols).fill(Math.round(width / cols)),
      rowHeight: 44,
      style: { ...activeStyle, strokeColor: '#38bdf8', strokeWidth: 1.5, fillColor: '#1e2025' },
    };
    addElement(newTable);
  },

  setEditingTextId: (editingTextId) => set({ editingTextId }),

  // -----------------------------------------------------------------
  // History Undo / Redo (Per Active Board, In-Memory Only)
  // -----------------------------------------------------------------
  commitHistory: () => {
    const { getActiveBoard } = get();
    get().commitElements(getActiveBoard().elements);
  },

  undo: () => {
    const { getActiveBoard, project, historyMap } = get();
    const activeBoard = getActiveBoard();
    const currentHistory = historyMap[activeBoard.id];
    if (!currentHistory || currentHistory.past.length === 0) return;

    const previous = currentHistory.past[currentHistory.past.length - 1];
    const newPast = currentHistory.past.slice(0, currentHistory.past.length - 1);

    const nextBoards = project.boards.map((b) =>
      b.id === activeBoard.id ? { ...b, elements: previous } : b
    );

    set({
      project: { ...project, boards: nextBoards },
      selectedIds: [],
      historyMap: {
        ...historyMap,
        [activeBoard.id]: {
          past: newPast,
          future: [activeBoard.elements, ...currentHistory.future.slice(0, 49)],
        },
      },
    });

    scheduleSave();
  },

  redo: () => {
    const { getActiveBoard, project, historyMap } = get();
    const activeBoard = getActiveBoard();
    const currentHistory = historyMap[activeBoard.id];
    if (!currentHistory || currentHistory.future.length === 0) return;

    const next = currentHistory.future[0];
    const newFuture = currentHistory.future.slice(1);

    const nextBoards = project.boards.map((b) =>
      b.id === activeBoard.id ? { ...b, elements: next } : b
    );

    set({
      project: { ...project, boards: nextBoards },
      selectedIds: [],
      historyMap: {
        ...historyMap,
        [activeBoard.id]: {
          past: [...currentHistory.past, activeBoard.elements],
          future: newFuture,
        },
      },
    });

    scheduleSave();
  },

  canUndo: () => {
    const { activeBoardId, historyMap } = get();
    const hist = historyMap[activeBoardId];
    return !!hist && hist.past.length > 0;
  },

  canRedo: () => {
    const { activeBoardId, historyMap } = get();
    const hist = historyMap[activeBoardId];
    return !!hist && hist.future.length > 0;
  },

  clearCanvas: () => {
    get().commitElements([]);
    set({ selectedIds: [] });
  },
}));
