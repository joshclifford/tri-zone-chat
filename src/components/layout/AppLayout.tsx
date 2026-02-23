import { ReactNode } from "react";
import { LayoutProvider, useLayout } from "@/hooks/use-layout";
import { AppStateProvider } from "@/hooks/use-app-state";
import { LeftDrawer } from "./LeftDrawer";
import { RightPanel } from "./RightPanel";
import { Menu } from "lucide-react";

function LayoutInner({ children }: { children: ReactNode }) {
  const { toggleLeftDrawer } = useLayout();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <LeftDrawer />
      <div className="flex flex-col flex-1 min-w-0">
        {/* Minimal top bar */}
        <header className="flex items-center h-12 px-3 border-b border-border bg-card/50 shrink-0">
          <button
            onClick={toggleLeftDrawer}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Menu className="h-4 w-4" />
          </button>
          <span className="ml-3 text-sm font-semibold text-foreground tracking-tight">Growth OS</span>
        </header>
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {children}
          </div>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppStateProvider>
      <LayoutProvider>
        <LayoutInner>{children}</LayoutInner>
      </LayoutProvider>
    </AppStateProvider>
  );
}
