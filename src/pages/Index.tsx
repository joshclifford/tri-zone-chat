import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DiscoveryGrid } from "@/components/discovery/DiscoveryGrid";
import { WorkflowCardData } from "@/components/discovery/WorkflowCard";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowCardData | null>(null);

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        {!activeWorkflow ? (
          <motion.div
            key="discovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <DiscoveryGrid onSelectWorkflow={setActiveWorkflow} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Step progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setActiveWorkflow(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Workflows
              </button>
              <span className="text-border">·</span>
              <span className="text-xs text-muted-foreground">
                Step 1 of {activeWorkflow.stepCount}: {activeWorkflow.steps[0]}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{activeWorkflow.emoji}</span>
              <div>
                <h2 className="text-base font-semibold text-foreground">{activeWorkflow.title}</h2>
                <p className="text-xs text-muted-foreground">{activeWorkflow.description}</p>
              </div>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1 mb-8">
              {activeWorkflow.steps.map((step, i) => (
                <div key={step} className="flex-1 flex flex-col gap-1">
                  <div className={`h-1 rounded-full ${i === 0 ? "bg-primary" : "bg-muted"}`} />
                  <span className="text-[10px] text-muted-foreground text-center">{step}</span>
                </div>
              ))}
            </div>

            {/* Placeholder chat bubble */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm text-foreground leading-relaxed">
                Let's build your <strong>{activeWorkflow.title.toLowerCase()}</strong>. Tell me about your business — who do you serve and what's the main problem you solve?
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
