import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const ENGINES = [
  {
    emoji: "💎",
    title: "Offer Engine",
    subtitle: "Foundation / Strategy",
    steps: ["Message", "Roadmap", "Model"],
    enabled: true,
  },
  {
    emoji: "✏️",
    title: "Content Engine",
    subtitle: "Execution",
    steps: ["Lead Magnet", "Workshop", "Nurture Sequence"],
    enabled: false,
  },
  {
    emoji: "🚀",
    title: "Traffic Engine",
    subtitle: "Distribution",
    steps: ["Social", "Paid Ads", "Email"],
    enabled: false,
  },
];

export default function UserHome() {
  const navigate = useNavigate();

  const { data: offerSkill } = useQuery({
    queryKey: ["offer-engine-skill"],
    queryFn: async () => {
      const { data } = await supabase
        .from("skills")
        .select("id")
        .eq("name", "Million Dollar Message")
        .single();
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ENGINES.map((engine, index) => (
              <motion.button
                key={engine.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => {
                  if (engine.enabled && offerSkill?.id) {
                    navigate(`/chat/${offerSkill.id}`);
                  }
                }}
                className={`group w-full text-left rounded-lg border border-border bg-card p-6 aspect-square flex flex-col transition-all duration-200 relative ${
                  engine.enabled
                    ? "hover:border-primary/30 hover:shadow-sm cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {!engine.enabled && (
                  <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                    Coming Soon
                  </span>
                )}
                <div className="text-4xl mb-3">{engine.emoji}</div>
                <h3 className="text-base font-semibold text-foreground mb-0.5">{engine.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{engine.subtitle}</p>
                <div className="flex items-center gap-1 flex-wrap">
                  {engine.steps.map((step, i) => (
                    <span key={step} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {step}
                      {i < engine.steps.length - 1 && <span className="text-border">→</span>}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
