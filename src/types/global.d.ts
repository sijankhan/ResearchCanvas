export interface ElectronAPI {
  isElectron: boolean;
  platform: string;
  saveProjectDialog: (data: string, defaultName?: string) => Promise<{ success: boolean; filePath?: string }>;
  openProjectDialog: () => Promise<{ success: boolean; content?: string; filePath?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
