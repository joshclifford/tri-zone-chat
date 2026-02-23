import { motion } from "framer-motion";

interface OptionChipsProps {
  options: string[];
  onSelect: (option: string) => void;
  allowCustom?: boolean;
}

export function OptionChips({ options, onSelect, allowCustom }: OptionChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-wrap gap-2 mb-4"
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary/40 hover:bg-accent transition-colors"
        >
          {opt}
        </button>
      ))}
      {allowCustom && (
        <button
          onClick={() => onSelect("__custom__")}
          className="px-3 py-1.5 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
        >
          Write my own…
        </button>
      )}
    </motion.div>
  );
}
