import { motion } from "framer-motion";

export interface WorkflowCardData {
  emoji: string;
  title: string;
  steps: string[];
  description: string;
  stepCount: number;
}

interface WorkflowCardProps {
  workflow: WorkflowCardData;
  index: number;
  onSelect: (workflow: WorkflowCardData) => void;
  disabled?: boolean;
}

export function WorkflowCard({ workflow, index, onSelect, disabled }: WorkflowCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={() => !disabled && onSelect(workflow)}
      className={`group w-full text-left rounded-lg border border-border bg-card p-5 transition-all duration-200 relative ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-primary/30 hover:shadow-sm cursor-pointer"
      }`}
    >
      {disabled && (
        <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
          V2
        </span>
      )}
      <div className="text-2xl mb-3">{workflow.emoji}</div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{workflow.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{workflow.description}</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {workflow.steps.map((step, i) => (
          <span key={step} className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-[10px] font-medium">
              {i + 1}
            </span>
            {step}
            {i < workflow.steps.length - 1 && <span className="text-border ml-1">→</span>}
          </span>
        ))}
      </div>
    </motion.button>
  );
}
