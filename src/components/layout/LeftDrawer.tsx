import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "@/hooks/use-layout";
import { useAppState } from "@/hooks/use-app-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { Folder, Palette, FileText, Sparkles, Search, PenTool, Mail, BookOpen, ChevronRight, CheckCircle2, Circle } from "lucide-react";

const iconItems = [
  { icon: Folder, label: "Projects" },
  { icon: Palette, label: "Brand" },
  { icon: FileText, label: "Assets" },
];

const skills = [
  { icon: Sparkles, label: "Brand Voice", desc: "Extract & build voice profile" },
  { icon: Search, label: "Keyword Research", desc: "Strategy & clustering" },
  { icon: BookOpen, label: "SEO Content", desc: "Article production" },
  { icon: PenTool, label: "Direct Response Copy", desc: "High-conversion copy" },
  { icon: Mail, label: "Email Sequences", desc: "Automation sequences" },
];

export function LeftDrawer() {
  const { leftDrawerOpen, toggleLeftDrawer } = useLayout();
  const { foundationLocked, voiceProfile, positioning, phase, campaigns } = useAppState();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Collapsed icon strip */}
      {!isMobile && !leftDrawerOpen && (
        <div className="flex flex-col items-center w-12 border-r border-border bg-card py-4 gap-3 shrink-0">
          {iconItems.map((item) => (
            <button
              key={item.label}
              onClick={toggleLeftDrawer}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title={item.label}
            >
              <item.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      {/* Scrim */}
      <AnimatePresence>
        {leftDrawerOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-foreground/10 z-40"
            onClick={toggleLeftDrawer}
          />
        )}
      </AnimatePresence>

      {/* Drawer panel */}
      <AnimatePresence>
        {leftDrawerOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className={`${isMobile ? "fixed left-0 top-0 h-full z-50" : "relative"} w-[260px] border-r border-border bg-card flex flex-col shrink-0`}
            style={{ boxShadow: "var(--shadow-drawer)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 h-12 border-b border-border">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Memory Bank</span>
              <button
                onClick={toggleLeftDrawer}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {/* Brand Foundation section */}
              <div className="px-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  {foundationLocked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Brand Foundation
                  </span>
                  {!foundationLocked && (
                    <span className="text-[9px] text-muted-foreground/60 italic">In Progress</span>
                  )}
                </div>

                {foundationLocked && voiceProfile && positioning && (
                  <div className="ml-5 space-y-1.5">
                    <div>
                      <span className="text-[10px] text-muted-foreground">Voice:</span>
                      <p className="text-[11px] text-foreground leading-snug">{voiceProfile.tone}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Hook:</span>
                      <p className="text-[11px] text-foreground leading-snug truncate">"{voiceProfile.hook.slice(0, 50)}"</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground">Audience:</span>
                      <p className="text-[11px] text-foreground leading-snug truncate">{positioning.audience}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Campaigns */}
              {phase !== "interview" && (
                <div className="px-4 mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Campaigns</span>
                  {campaigns.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground/60 mt-1">No campaigns yet</p>
                  ) : (
                    <div className="mt-1 space-y-1">
                      {campaigns.map((c) => (
                        <div key={c.id} className="text-[11px] text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          {c.workflowType}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Skills */}
              <div className="px-4 mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Skills</span>
              </div>
              {skills.map((skill) => (
                <div
                  key={skill.label}
                  className="w-full flex items-center gap-3 px-4 py-2 opacity-40 cursor-not-allowed"
                >
                  <skill.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-foreground leading-tight">{skill.label}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug truncate">{skill.desc}</div>
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 shrink-0">Soon</span>
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
