import { ReactNode } from "react";
import { Send } from "lucide-react";

interface CenterStreamProps {
  children: ReactNode;
}

export function CenterStream({ children }: CenterStreamProps) {
  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[700px] px-4 py-8">
          {children}
        </div>
      </div>

      {/* Sticky input bar */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[700px] px-4 py-3">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary/40 transition-colors">
            <textarea
              placeholder="Describe what you want to create…"
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 160) + "px";
              }}
            />
            <button className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0">
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-center mt-2">
            <span className="text-[10px] text-muted-foreground">
              Press <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">[</kbd> drawer · <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">]</kbd> panel · <kbd className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">esc</kbd> close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
