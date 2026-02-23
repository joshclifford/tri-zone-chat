import { motion } from "framer-motion";
import { VoiceProfile, Positioning } from "@/hooks/use-app-state";
import { Lock, RefreshCw } from "lucide-react";

interface FoundationSummaryProps {
  voice: VoiceProfile;
  positioning: Positioning;
  onLock: () => void;
  onRefine: () => void;
}

export function FoundationSummary({ voice, positioning, onLock, onRefine }: FoundationSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-border bg-card p-5 mb-4"
    >
      <h3 className="text-sm font-semibold text-foreground mb-4">🎯 Your Brand Foundation</h3>

      <div className="space-y-3 mb-5">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Voice Tone</span>
          <p className="text-sm text-foreground mt-0.5">{voice.tone}</p>
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Hook</span>
          <p className="text-sm text-foreground mt-0.5">"{voice.hook}"</p>
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Positioning Angle</span>
          <p className="text-sm text-foreground mt-0.5">{positioning.angle}</p>
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Target Audience</span>
          <p className="text-sm text-foreground mt-0.5">{positioning.audience}</p>
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Differentiator</span>
          <p className="text-sm text-foreground mt-0.5">{positioning.differentiator}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onLock}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Lock className="h-3.5 w-3.5" />
          Lock It In
        </button>
        <button
          onClick={onRefine}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Keep Refining
        </button>
      </div>
    </motion.div>
  );
}
