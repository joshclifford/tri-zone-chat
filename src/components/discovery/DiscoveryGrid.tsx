import { WorkflowCard, WorkflowCardData } from "./WorkflowCard";
import { useAppState } from "@/hooks/use-app-state";
import { motion } from "framer-motion";

const workflows: WorkflowCardData[] = [
  {
    emoji: "💎",
    title: "Lead Magnet Funnel",
    steps: ["Magnet", "Landing Page", "Emails"],
    description: "Create a complete lead magnet with landing page and nurture email sequence.",
    stepCount: 3,
  },
  {
    emoji: "🚀",
    title: "Product Launch",
    steps: ["Positioning", "Copy", "Sequence", "Creative"],
    description: "Build your launch from positioning to copy, email sequence, and creative assets.",
    stepCount: 4,
  },
  {
    emoji: "✍️",
    title: "Content Strategy",
    steps: ["Keywords", "Blog", "Distribution"],
    description: "Research keywords, produce SEO content, and plan distribution.",
    stepCount: 3,
  },
  {
    emoji: "📧",
    title: "Email Sequence",
    steps: ["Sequence"],
    description: "Standalone email sequence builder for any campaign or use case.",
    stepCount: 1,
  },
];

interface DiscoveryGridProps {
  onSelectWorkflow: (workflow: WorkflowCardData) => void;
}

export function DiscoveryGrid({ onSelectWorkflow }: DiscoveryGridProps) {
  const { campaigns } = useAppState();

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-1">Your foundation is locked 🎯</h1>
        <p className="text-sm text-muted-foreground">Choose a workflow to start building.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {workflows.map((wf, i) => (
          <WorkflowCard
            key={wf.title}
            workflow={wf}
            index={i}
            onSelect={onSelectWorkflow}
            disabled={wf.title !== "Lead Magnet Funnel"}
          />
        ))}
      </div>

      {/* Completed campaigns */}
      {campaigns.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 w-full max-w-lg"
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Completed Campaigns</h3>
          {campaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card mb-2">
              <span className="text-lg">💎</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{c.workflowType}</div>
                <div className="text-xs text-muted-foreground">{c.assets.length} assets generated</div>
              </div>
              <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Complete</span>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
