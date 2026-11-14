import React, { useEffect, useRef, useState } from 'react';
import {
  Sparkles,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
  Share2,
  Play,
  Sun,
  Moon,
  FolderKanban,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  FileCode,
  Upload,
  AlertTriangle,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useToastStore } from '../../store/useToastStore';
import { exportProjectToJson, exportToPng } from '../../utils/export';

interface Props {
  onOpenShortcuts: () => void;
}

export const TopBar: React.FC<Props> = ({ onOpenShortcuts }) => {
  const {
    project,
    renameProject,
    theme,
    toggleTheme,
    getCamera,
    zoomIn,
    zoomOut,
    zoomTo100,
    zoomToFit,
    undo,
    redo,
    canUndo,
    canRedo,
    getElements,
    setPresentationOpen,
    setShareModalOpen,
    toggleAiStudio,
    isAiStudioOpen,
    setProjectsDashboardOpen,
    loadProjectData,
    clearCanvas,
    saveStatus,
    saveError,
  } = useCanvasStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project.title);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(project.title);
    setIsEditingTitle(false);
  }, [project.id, project.title]);

  const camera = getCamera();
  const elements = getElements();

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      renameProject(titleInput.trim());
    } else {
      setTitleInput(project.title);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.boards && Array.isArray(parsed.boards)) {
          loadProjectData(parsed);
          useToastStore.getState().showToast('Project loaded successfully', 'success');
        } else if (parsed.elements && Array.isArray(parsed.elements)) {
          // single board import
          const upgraded = {
            ...project,
            boards: [
              {
                id: 'imported_board',
                title: parsed.projectName || 'Imported Board',
                elements: parsed.elements,
                camera: { x: 80, y: 80, zoom: 1 },
                gridType: 'dots' as const,
                history: { past: [], future: [] },
              },
            ],
            activeBoardId: 'imported_board',
          };
          loadProjectData(upgraded);
          useToastStore.getState().showToast('Board loaded successfully', 'success');
        } else {
          useToastStore.getState().showToast('Invalid canvas file format.', 'error');
        }
      } catch {
        useToastStore.getState().showToast('Failed to parse file.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowExportMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#181a20]/95 backdrop-blur-xl border-b border-white/10 z-40 flex items-center justify-between px-4 select-none">
      {/* Left: Brand, Projects Manager & Title */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-600 flex items-center justify-center shadow-glow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block leading-none">
              ResearchCanvas
            </span>
            <span className="text-[10px] text-sky-400 font-mono tracking-wider">
              STUDIO 2.0
            </span>
          </div>
        </div>

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Projects Dashboard Button */}
        <button
          onClick={() => setProjectsDashboardOpen(true)}
          title="Open Projects Dashboard"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-colors text-xs"
        >
          <FolderKanban className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline font-medium">Projects</span>
        </button>

        {/* Editable Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setTitleInput(project.title);
                setIsEditingTitle(false);
              }
            }}
            autoFocus
            className="bg-black/40 border border-sky-500/60 rounded-lg px-2.5 py-1 text-xs text-white outline-none w-48 sm:w-72 font-medium"
          />
        ) : (
          <button
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename project"
            className="text-xs font-semibold text-slate-200 hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors truncate max-w-[140px] sm:max-w-[260px]"
          >
            {project.title}
          </button>
        )}

        {/* Autosave status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] pl-1">
          {saveStatus === 'error' && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 font-medium"
              title={saveError}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Save failed, storage full. Export your project</span>
            </div>
          )}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-sky-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo & Zoom Controls */}
      <div className="flex items-center gap-1.5">
        {/* Undo / Redo */}
        <div className="flex items-center bg-white/[0.03] border border-white/5 p-1 rounded-xl">
          <button
            onClick={undo}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center bg-white/[0.03] border border-white/5 p-1 rounded-xl text-xs">
          <button
            onClick={zoomOut}
            title="Zoom Out (-)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={zoomTo100}
            title="Reset Zoom to 100%"
            className="px-2 py-0.5 font-mono text-[11px] text-slate-300 hover:text-sky-400"
          >
            {Math.round(camera.zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            title="Zoom In (+)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => zoomToFit(window.innerWidth, window.innerHeight)}
            title="Zoom to Fit Elements"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right: Theme, Presentation, Share, AI Studio, Export */}
      <div className="flex items-center gap-2">
        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Presentation Mode Button */}
        <button
          onClick={() => setPresentationOpen(true)}
          title="Enter Presentation Mode (F5)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors text-xs font-medium"
        >
          <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span className="hidden md:inline">Present</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => setShareModalOpen(true)}
          title="Share Project / Access Permissions"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors text-xs font-medium"
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Share</span>
        </button>

        {/* AI Studio Trigger Button */}
        <button
          onClick={toggleAiStudio}
          title="Toggle AI Studio Assistant"
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-glow ${
            isAiStudioOpen
              ? 'bg-sky-500 text-slate-950 font-semibold'
              : 'bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI Studio</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            title="Export Canvas / Project"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition-colors text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-11 w-52 bg-[#1b1d22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-floating p-1.5 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  exportToPng(elements, project.title);
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
              >
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span>Export as PNG</span>
              </button>
              <button
                onClick={() => {
                  exportProjectToJson(project);
                  setShowExportMenu(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Export Project JSON</span>
              </button>
              <div className="h-[1px] bg-white/10 my-0.5" />
              <button
                onClick={async () => {
                  setShowExportMenu(false);
                  if (typeof window !== 'undefined' && window.electronAPI?.isElectron && window.electronAPI?.openProjectDialog) {
                    try {
                      const res = await window.electronAPI.openProjectDialog();
                      if (res?.success && res.content) {
                        const parsed = JSON.parse(res.content);
                        if (parsed.boards && Array.isArray(parsed.boards)) {
                          loadProjectData(parsed);
                        } else if (parsed.elements && Array.isArray(parsed.elements)) {
                          const upgraded = {
                            ...project,
                            boards: [
                              {
                                id: 'imported_board',
                                title: parsed.projectName || 'Imported Board',
                                elements: parsed.elements,
                                camera: { x: 80, y: 80, zoom: 1 },
                                gridType: 'dots' as const,
                                history: { past: [], future: [] },
                              },
                            ],
                            activeBoardId: 'imported_board',
                          };
                          loadProjectData(upgraded);
                        }
                      }
                    } catch (err) {
                      console.error('Failed to open project file via Electron dialog', err);
                    }
                  } else {
                    fileInputRef.current?.click();
                  }
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
              >
                <Upload className="w-4 h-4 text-purple-400" />
                <span>Import JSON Project</span>
              </button>
              <div className="h-[1px] bg-white/10 my-0.5" />
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  useToastStore.getState().showConfirm({
                    title: 'Clear Active Board',
                    message: 'Are you sure you want to remove all elements on this board? You can undo this action with Ctrl+Z.',
                    confirmLabel: 'Clear Board',
                    isDestructive: true,
                    onConfirm: () => clearCanvas(),
                  });
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Active Board</span>
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Shortcuts / Help modal button */}
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (?)"
          className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/10 text-slate-400 hover:text-sky-400 border border-white/5 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
