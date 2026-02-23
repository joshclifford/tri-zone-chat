import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

interface ArtifactPanelData {
  preview: string;
  content: Record<string, unknown>;
  assetType: string;
}

interface RightPanelContent {
  title: string;
  type: string;
  artifactData?: ArtifactPanelData;
}

interface LayoutState {
  leftDrawerOpen: boolean;
  rightPanelOpen: boolean;
  rightPanelContent: RightPanelContent | null;
  toggleLeftDrawer: () => void;
  toggleRightPanel: () => void;
  openRightPanel: (content: RightPanelContent) => void;
  closeRightPanel: () => void;
  closeAll: () => void;
}

const LayoutContext = createContext<LayoutState | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelContent, setRightPanelContent] = useState<RightPanelContent | null>(null);

  const toggleLeftDrawer = useCallback(() => setLeftDrawerOpen((o) => !o), []);
  const toggleRightPanel = useCallback(() => setRightPanelOpen((o) => !o), []);
  const openRightPanel = useCallback((content: RightPanelContent) => {
    setRightPanelContent(content);
    setRightPanelOpen(true);
  }, []);
  const closeRightPanel = useCallback(() => {
    setRightPanelOpen(false);
    setRightPanelContent(null);
  }, []);
  const closeAll = useCallback(() => {
    setLeftDrawerOpen(false);
    setRightPanelOpen(false);
    setRightPanelContent(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "[") { e.preventDefault(); toggleLeftDrawer(); }
      if (e.key === "]") { e.preventDefault(); toggleRightPanel(); }
      if (e.key === "Escape") { closeAll(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleLeftDrawer, toggleRightPanel, closeAll]);

  return (
    <LayoutContext.Provider
      value={{ leftDrawerOpen, rightPanelOpen, rightPanelContent, toggleLeftDrawer, toggleRightPanel, openRightPanel, closeRightPanel, closeAll }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}
