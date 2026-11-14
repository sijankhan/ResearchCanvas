import { useEffect } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';

interface Props {
  onToggleShortcuts: () => void;
}

export function useKeyboardShortcuts({ onToggleShortcuts }: Props) {
  const {
    setTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    clearSelection,
    editingTextId,
    copySelected,
    cutSelected,
    pasteClipboard,
    selectAll,
    nudgeSelected,
  } = useCanvasStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        editingTextId !== null
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();

        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
          return;
        }

        if (key === 'y') {
          e.preventDefault();
          redo();
          return;
        }

        if (key === 'd') {
          e.preventDefault();
          duplicateSelected();
          return;
        }

        if (key === 'c') {
          e.preventDefault();
          copySelected();
          return;
        }

        if (key === 'x') {
          e.preventDefault();
          cutSelected();
          return;
        }

        if (key === 'v') {
          // If the user pastes with Ctrl+V and there is internal canvas clipboard, paste it
          const { internalClipboard } = useCanvasStore.getState();
          if (internalClipboard && internalClipboard.length > 0) {
            e.preventDefault();
            pasteClipboard();
            return;
          }
        }

        if (key === 'a') {
          e.preventDefault();
          selectAll();
          return;
        }
      }

      // Arrow key nudges (1px normal, 10px with Shift)
      const lowerKey = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(lowerKey)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        switch (lowerKey) {
          case 'arrowup':
            dy = -step;
            break;
          case 'arrowdown':
            dy = step;
            break;
          case 'arrowleft':
            dx = -step;
            break;
          case 'arrowright':
            dx = step;
            break;
        }
        nudgeSelected(dx, dy);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }

      if (e.key === 'Escape') {
        clearSelection();
        setTool('select');
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      // Single-key tool triggers
      if (!isCtrlOrCmd && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setTool('select');
            break;
          case 'h':
            setTool('hand');
            break;
          case 'r':
            setTool('rectangle');
            break;
          case 'o':
            setTool('circle');
            break;
          case 'd':
            setTool('diamond');
            break;
          case 'a':
            setTool('arrow');
            break;
          case 'l':
            setTool('line');
            break;
          case 'p':
            setTool('pencil');
            break;
          case 't':
            setTool('text');
            break;
          case 's':
            setTool('sticky');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setTool,
    undo,
    redo,
    deleteSelected,
    duplicateSelected,
    clearSelection,
    editingTextId,
    copySelected,
    cutSelected,
    pasteClipboard,
    selectAll,
    nudgeSelected,
    onToggleShortcuts,
  ]);
}
