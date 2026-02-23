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

type Phase = "interview" | "grid" | "funnel";

interface AppState {
  phase: Phase;
  foundationLocked: boolean;
  voiceProfile: VoiceProfile | null;
  positioning: Positioning | null;
  activeCampaign: Campaign | null;
  campaigns: Campaign[];
  lockFoundation: (voice: VoiceProfile, pos: Positioning) => void;
  resetFoundation: () => void;
  startFunnel: (workflowType: string, totalSteps: number) => void;
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
    setPhase("interview");
    setCampaigns([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const startFunnel = useCallback((workflowType: string, totalSteps: number) => {
    const campaign: Campaign = {
      id: crypto.randomUUID(),
      workflowType,
      currentStep: 1,
      totalSteps,
      status: "active",
      assets: [],
      context: {},
    };
    setActiveCampaign(campaign);
    setPhase("funnel");
  }, []);

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
    setPhase("grid");
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        phase, foundationLocked, voiceProfile, positioning, activeCampaign, campaigns,
        lockFoundation, resetFoundation, startFunnel, advanceStep, addAsset, completeFunnel, returnToGrid,
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
