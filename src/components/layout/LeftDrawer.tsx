import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "@/hooks/use-layout";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronRight, Settings, Home } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function LeftDrawer() {
  const { leftDrawerOpen, toggleLeftDrawer } = useLayout();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Skills", path: "/" },
    { icon: Settings, label: "Admin", path: "/admin" },
  ];

  return (
    <>
      {/* Collapsed icon strip */}
      {!isMobile && !leftDrawerOpen && (
        <div className="flex flex-col items-center w-12 border-r border-border bg-card py-4 gap-3 shrink-0">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`p-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? "text-primary bg-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
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
            <div className="flex items-center justify-between px-4 h-12 border-b border-border">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Navigation</span>
              <button
                onClick={toggleLeftDrawer}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) toggleLeftDrawer();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                    location.pathname === item.path
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
