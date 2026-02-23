import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface VoiceProfile {
  businessDescription: string;
  hook: string;
  tone: string;
  angle: string;
}

export interface Positioning {
  angle: string;
  audience: string;
  differentiator: string;
}

export interface Asset {
  id: string;
  stepNumber: number;
  skillName: string;
  title: string;
  content: Record<string, unknown>;
  assetType: string;
}

export interface Campaign {
  id: string;
  workflowType: string;
  currentStep: number;
  totalSteps: number;
  status: "active" | "complete";
  assets: Asset[];
  context: Record<string, unknown>;
}

type Phase = "interview" | "grid" | "mode-select" | "funnel";
type WorkflowMode = "collaborate" | "get-it-done" | null;

interface PendingWorkflow {
  type: string;
  steps: number;
}

interface AppState {
  phase: Phase;
  foundationLocked: boolean;
  voiceProfile: VoiceProfile | null;
  positioning: Positioning | null;
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  workflowMode: WorkflowMode;
  pendingWorkflow: PendingWorkflow | null;
  lockFoundation: (voice: VoiceProfile, pos: Positioning) => void;
  resetFoundation: () => void;
  startFunnel: (workflowType: string, totalSteps: number) => void;
  selectMode: (mode: "collaborate" | "get-it-done") => void;
  advanceStep: () => void;
  addAsset: (asset: Asset) => void;
  completeFunnel: () => void;
  returnToGrid: () => void;
}

const STORAGE_KEY = "growth-os-state";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(data: Partial<AppState>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        foundationLocked: data.foundationLocked,
        voiceProfile: data.voiceProfile,
        positioning: data.positioning,
        campaigns: data.campaigns,
      })
    );
  } catch {}
}

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const saved = loadState();

  const [foundationLocked, setFoundationLocked] = useState<boolean>(saved?.foundationLocked ?? false);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(saved?.voiceProfile ?? null);
  const [positioning, setPositioning] = useState<Positioning | null>(saved?.positioning ?? null);
  const [campaigns, setCampaigns] = useState<Campaign[]>(saved?.campaigns ?? []);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>(null);
  const [pendingWorkflow, setPendingWorkflow] = useState<PendingWorkflow | null>(null);
  const [phase, setPhase] = useState<Phase>(saved?.foundationLocked ? "grid" : "interview");

  useEffect(() => {
    saveState({ foundationLocked, voiceProfile, positioning, campaigns });
  }, [foundationLocked, voiceProfile, positioning, campaigns]);

  const lockFoundation = useCallback((voice: VoiceProfile, pos: Positioning) => {
    setVoiceProfile(voice);
    setPositioning(pos);
    setFoundationLocked(true);
    setPhase("grid");
  }, []);

  const resetFoundation = useCallback(() => {
    setFoundationLocked(false);
    setVoiceProfile(null);
    setPositioning(null);
    setWorkflowMode(null);
    setPendingWorkflow(null);
    setPhase("interview");
    setCampaigns([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const startFunnel = useCallback((workflowType: string, totalSteps: number) => {
    setPendingWorkflow({ type: workflowType, steps: totalSteps });
    setPhase("mode-select");
  }, []);

  const selectMode = useCallback((mode: "collaborate" | "get-it-done") => {
    setWorkflowMode(mode);
    if (pendingWorkflow) {
      const campaign: Campaign = {
        id: crypto.randomUUID(),
        workflowType: pendingWorkflow.type,
        currentStep: 1,
        totalSteps: pendingWorkflow.steps,
        status: "active",
        assets: [],
        context: {},
      };
      setActiveCampaign(campaign);
      setPendingWorkflow(null);
    }
    setPhase("funnel");
  }, [pendingWorkflow]);

  const advanceStep = useCallback(() => {
    setActiveCampaign((c) => c ? { ...c, currentStep: c.currentStep + 1 } : c);
  }, []);

  const addAsset = useCallback((asset: Asset) => {
    setActiveCampaign((c) => c ? { ...c, assets: [...c.assets, asset], context: { ...c.context, [asset.skillName]: asset.content } } : c);
  }, []);

  const completeFunnel = useCallback(() => {
    setActiveCampaign((c) => {
      if (!c) return c;
      const completed = { ...c, status: "complete" as const };
      setCampaigns((prev) => [...prev, completed]);
      return null;
    });
    setPhase("grid");
  }, []);

  const returnToGrid = useCallback(() => {
    setActiveCampaign(null);
    setWorkflowMode(null);
    setPendingWorkflow(null);
    setPhase("grid");
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        phase, foundationLocked, voiceProfile, positioning, activeCampaign, campaigns,
        workflowMode, pendingWorkflow,
        lockFoundation, resetFoundation, startFunnel, selectMode, advanceStep, addAsset, completeFunnel, returnToGrid,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
