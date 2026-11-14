import React, { useRef, useState } from 'react';
import { CanvasStage } from './components/canvas/CanvasStage';
import { TopBar } from './components/ui/TopBar';
import { LeftToolbar } from './components/ui/LeftToolbar';
import { RightInspector } from './components/ui/RightInspector';
import { BottomBar } from './components/ui/BottomBar';
import { MiniMap } from './components/ui/MiniMap';
import { AiStudioPanel } from './components/ui/AiStudioPanel';
import { PresentationModal } from './components/ui/PresentationModal';
import { ShareModal } from './components/ui/ShareModal';
import { ProjectsDashboard } from './components/ui/ProjectsDashboard';
import { KeyboardShortcutsModal } from './components/ui/KeyboardShortcutsModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);

  useKeyboardShortcuts({
    onToggleShortcuts: () => setIsShortcutsOpen((prev) => !prev),
  });

  return (
    <ErrorBoundary>
      <div className="relative w-screen h-screen overflow-hidden bg-[#121316] text-slate-100 font-sans select-none">
        {/* 1. Top Command Bar */}
        <TopBar onOpenShortcuts={() => setIsShortcutsOpen(true)} />

        {/* 2. Left Professional Vertical Toolbar */}
        <LeftToolbar />

        {/* 3. Central Huge Infinite Canvas */}
        <main ref={containerRef} className="w-full h-full pt-16 pb-14 pr-80">
          <CanvasStage containerRef={containerRef} />
        </main>

        {/* 4. Contextual Right Inspector Panel */}
        <RightInspector />

        {/* 5. Bottom Navigation & Board Tabs Bar */}
        <BottomBar
          isMiniMapOpen={isMiniMapOpen}
          onToggleMiniMap={() => setIsMiniMapOpen(!isMiniMapOpen)}
        />

        {/* 6. MiniMap Spatial Radar (Positioned above bottom bar) */}
        {isMiniMapOpen && (
          <div className="fixed bottom-16 right-[336px] z-30">
            <MiniMap />
          </div>
        )}

        {/* 7. AI Studio Assistant Panel (Drawer) */}
        <AiStudioPanel />

        {/* 8. Fullscreen Presentation Mode Walkthrough */}
        <PresentationModal />

        {/* 9. Share & Permissions Modal */}
        <ShareModal />

        {/* 10. Projects Manager Dashboard */}
        <ProjectsDashboard />

        {/* 11. Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsOpen}
          onClose={() => setIsShortcutsOpen(false)}
        />

        {/* 12. Toast Notifications & Confirmation Dialogs */}
        <ToastContainer />
        <ConfirmModal />
      </div>
    </ErrorBoundary>
  );
};

export default App;
