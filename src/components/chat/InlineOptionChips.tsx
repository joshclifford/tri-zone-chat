import { motion } from "framer-motion";
import { useState } from "react";
import { Send } from "lucide-react";

interface InlineOptionChipsProps {
  options: string[];
  onSelect: (option: string) => void;
  allowCustom?: boolean;
}

export function InlineOptionChips({ options, onSelect, allowCustom }: InlineOptionChipsProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleCustomSubmit = () => {
    const trimmed = customValue.trim();
    if (trimmed) {
      onSelect(trimmed);
      setCustomValue("");
      setShowCustomInput(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex flex-wrap gap-2 mb-5 ml-0"
    >
      {options.map((opt, i) => (
        <motion.button
          key={opt}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          onClick={() => onSelect(opt)}
          className="px-3.5 py-1.5 rounded-full border border-border bg-background text-sm text-foreground hover:border-primary/40 hover:bg-accent transition-colors duration-200"
        >
          {opt}
        </motion.button>
      ))}
      {allowCustom && !showCustomInput && (
        <motion.button
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: options.length * 0.05 }}
          onClick={() => setShowCustomInput(true)}
          className="px-3.5 py-1.5 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors duration-200"
        >
          Write my own…
        </motion.button>
      )}
      {showCustomInput && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "auto" }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background pl-3.5 pr-1.5 py-1"
        >
          <input
            autoFocus
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleCustomSubmit(); }
              if (e.key === "Escape") setShowCustomInput(false);
            }}
            placeholder="Type your own…"
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none w-40"
          />
          <button
            onClick={handleCustomSubmit}
            disabled={!customValue.trim()}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors"
          >
            <Send className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
