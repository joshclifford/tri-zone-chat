import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";

interface ThinkingStep {
  label: string;
  done: boolean;
}

interface ThinkingStateProps {
  statusText?: string;
  steps?: ThinkingStep[];
}

export function ThinkingState({ statusText, steps }: ThinkingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mb-5"
    >
      {/* Animated dots with status text */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        {statusText && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground"
          >
            {statusText}
          </motion.span>
        )}
      </div>

      {/* Progress checklist */}
      {steps && steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-3 ml-1 space-y-1.5"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="flex items-center gap-2"
            >
              {step.done ? (
                <Check className="h-3 w-3 text-primary shrink-0" />
              ) : (
                <Circle className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
              <span className={`text-xs ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
