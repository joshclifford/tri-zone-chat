import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "@/hooks/use-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Maximize2 } from "lucide-react";

export function RightPanel() {
  const { rightPanelOpen, rightPanelContent, closeRightPanel } = useLayout();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Scrim for mobile */}
      <AnimatePresence>
        {rightPanelOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/10 z-40"
            onClick={closeRightPanel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rightPanelOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${isMobile ? "fixed right-0 top-0 h-full z-50 w-[85%]" : "relative w-[45%]"} border-l border-border bg-card flex flex-col shrink-0`}
            style={{ boxShadow: "var(--shadow-panel)" }}
          >
            {/* Floating header */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-border">
              <span className="text-sm font-medium text-foreground truncate">
                {rightPanelContent?.title || "Artifact"}
              </span>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={closeRightPanel}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="text-sm text-muted-foreground text-center py-12">
                Artifact workbench — content will appear here
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
