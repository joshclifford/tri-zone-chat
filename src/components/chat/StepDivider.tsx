import { motion } from "framer-motion";

interface StepDividerProps {
  current: number;
  total: number;
}

export function StepDivider({ current, total }: StepDividerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3 my-6"
    >
      <div className="flex-1 h-px bg-border" />
      <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase px-2">
        Step {current} of {total}
      </span>
      <div className="flex-1 h-px bg-border" />
    </motion.div>
  );
}
