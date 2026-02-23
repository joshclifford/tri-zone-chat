import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "@/hooks/use-layout";
import { useAppState } from "@/hooks/use-app-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Maximize2 } from "lucide-react";

export function RightPanel() {
  const { rightPanelOpen, rightPanelContent, closeRightPanel } = useLayout();
  const { activeCampaign, campaigns } = useAppState();
  const isMobile = useIsMobile();

  // Find latest asset to display
  const allAssets = activeCampaign?.assets || campaigns.flatMap((c) => c.assets);
  const latestAsset = allAssets[allAssets.length - 1];

  const renderContent = () => {
    // If opened via artifact card, render artifact data
    const artifactData = rightPanelContent?.artifactData;
    if (artifactData) {
      const content = artifactData.content;

      if (artifactData.assetType === "lead-magnet") {
        const sections = (content.sections as Array<{ heading: string; body: string }>) || [];
        return (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">{content.title as string}</h2>
            <p className="text-xs text-muted-foreground mb-6">Format: {content.format as string}</p>
            {sections.map((s, i) => (
              <div key={i} className="mb-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">{s.heading}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        );
      }

      if (artifactData.assetType === "landing-page") {
        const bullets = (content.bullets as string[]) || [];
        return (
          <div>
            <div className="rounded-lg border border-border bg-muted/30 p-6 mb-6 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">{content.headline as string}</h2>
              <p className="text-sm text-muted-foreground mb-4">{content.subhead as string}</p>
              <ul className="text-left space-y-2 mb-4 max-w-sm mx-auto">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="text-primary mt-0.5">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                {content.cta as string}
              </button>
              <p className="text-xs text-muted-foreground mt-3">{content.socialProof as string}</p>
            </div>
          </div>
        );
      }

      if (artifactData.assetType === "email-sequence") {
        const emails = (content.emails as Array<{ subject: string; preview: string }>) || [];
        return (
          <div>
            <h2 className="text-base font-semibold text-foreground mb-4">
              Email Sequence ({emails.length} emails)
            </h2>
            <div className="space-y-3">
              {emails.map((email, i) => (
                <div key={i} className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-muted-foreground">Email {i + 1}</span>
                  </div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{email.subject}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{email.preview}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (artifactData.assetType === "roadmap") {
        const programName = content.programName as string;
        const description = content.description as string;
        const phases = (content.phases as Array<{
          label: string;
          name: string;
          steps: Array<{ name: string; description: string }>;
        }>) || [];
        return (
          <div>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-2">{programName}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>

            {/* Phases Grid */}
            <div className="grid grid-cols-3 gap-3">
              {phases.map((phase, pi) => (
                <div key={pi} className="flex flex-col">
                  {/* Phase Header */}
                  <div className="rounded-t-lg bg-foreground px-3 py-2.5 mb-0">
                    <span className="text-[10px] uppercase tracking-wider text-background/60 block">Phase {pi + 1}</span>
                    <h3 className="text-sm font-bold text-background">{phase.name}</h3>
                  </div>

                  {/* Steps */}
                  <div className="border border-border border-t-0 rounded-b-lg divide-y divide-border">
                    {phase.steps.map((step, si) => (
                      <div key={si} className="px-3 py-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded border border-border flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[9px] font-bold text-muted-foreground">{pi * 3 + si + 1}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-0.5">{step.name}</h4>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">{step.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Generic artifact: render content as formatted text
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {artifactData.preview}
          </p>
          {Object.entries(content).map(([key, val]) => (
            <div key={key} className="mb-4">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{key}</h4>
              <p className="text-sm text-foreground">{typeof val === "string" ? val : JSON.stringify(val, null, 2)}</p>
            </div>
          ))}
        </div>
      );
    }

    // Fallback: existing asset-based rendering
    if (!latestAsset) {
      return (
        <div className="text-sm text-muted-foreground text-center py-12">
          Artifact workbench — content will appear here
        </div>
      );
    }

    const assetContent = latestAsset.content as Record<string, unknown>;

    if (latestAsset.assetType === "lead-magnet") {
      const sections = (assetContent.sections as Array<{ heading: string; body: string }>) || [];
      return (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">{assetContent.title as string}</h2>
          <p className="text-xs text-muted-foreground mb-6">Format: {assetContent.format as string}</p>
          {sections.map((s, i) => (
            <div key={i} className="mb-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">{s.heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      );
    }

    if (latestAsset.assetType === "landing-page") {
      const bullets = (assetContent.bullets as string[]) || [];
      return (
        <div>
          <div className="rounded-lg border border-border bg-muted/30 p-6 mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">{assetContent.headline as string}</h2>
            <p className="text-sm text-muted-foreground mb-4">{assetContent.subhead as string}</p>
            <ul className="text-left space-y-2 mb-4 max-w-sm mx-auto">
              {bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>
            <button className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
              {assetContent.cta as string}
            </button>
            <p className="text-xs text-muted-foreground mt-3">{assetContent.socialProof as string}</p>
          </div>
        </div>
      );
    }

    if (latestAsset.assetType === "email-sequence") {
      const emails = (assetContent.emails as Array<{ subject: string; preview: string }>) || [];
      return (
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">
            Email Sequence ({emails.length} emails)
          </h2>
          <div className="space-y-3">
            {emails.map((email, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-medium text-muted-foreground">Email {i + 1}</span>
                </div>
                <h4 className="text-sm font-medium text-foreground mb-1">{email.subject}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{email.preview}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
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

            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
