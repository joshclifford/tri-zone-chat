import { AppLayout } from "@/components/layout/AppLayout";
import { InterviewChat } from "@/components/interview/InterviewChat";
import { DiscoveryGrid } from "@/components/discovery/DiscoveryGrid";
import { FunnelChat } from "@/components/funnel/FunnelChat";
import { useAppState } from "@/hooks/use-app-state";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const { phase, startFunnel } = useAppState();

  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        {phase === "interview" && (
          <motion.div
            key="interview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <InterviewChat />
          </motion.div>
        )}

        {phase === "grid" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <DiscoveryGrid
              onSelectWorkflow={(wf) => {
                if (wf.title === "Lead Magnet Funnel") {
                  startFunnel("lead-magnet-funnel", 3);
                }
              }}
            />
          </motion.div>
        )}

        {phase === "funnel" && (
          <motion.div
            key="funnel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            <FunnelChat />
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Index;
