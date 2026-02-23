import { WorkflowCard, WorkflowCardData } from "./WorkflowCard";

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
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold text-foreground mb-1">What are we building?</h1>
        <p className="text-sm text-muted-foreground">Choose a workflow to get started.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {workflows.map((wf, i) => (
          <WorkflowCard key={wf.title} workflow={wf} index={i} onSelect={onSelectWorkflow} />
        ))}
      </div>
    </div>
  );
}
