import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import React from "react";
import { Gem, Settings, Radio } from "lucide-react";

const ENGINES = [
  {
    title: "Offer Engine",
    subtitle: "Foundation / Strategy",
    steps: ["Message", "Roadmap", "Model"],
    enabled: true,
    icon: Gem,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
  },
  {
    title: "Funnel Engine",
    subtitle: "Automation / Conversion",
    steps: ["Pages", "Sequences", "Traffic"],
    enabled: false,
    icon: Settings,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-400/10",
  },
  {
    title: "Attention Engine",
    subtitle: "Visibility / Growth",
    steps: ["Content", "Distribution", "Amplify"],
    enabled: false,
    icon: Radio,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/10",
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
        .eq("name", "Messaging Reference")
        .single();
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 pt-24 sm:pt-32">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl sm:text-5xl font-bold text-center text-foreground mb-12 sm:mb-16"
          >
            What Are We Building Today?
          </motion.h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                className={`group w-full text-left rounded-lg border border-border bg-card p-6 flex flex-col transition-all duration-200 relative ${
                  engine.enabled
                    ? "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                {!engine.enabled && (
                  <span className="absolute top-3 right-3 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                    Coming Soon
                  </span>
                )}
                <div className="w-14 h-14 rounded-xl bg-muted/50 flex items-center justify-center text-3xl mb-4">
                  {engine.emoji}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-0.5">{engine.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{engine.subtitle}</p>
                <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-4">
                  {engine.steps.map((step, i) => (
                    <React.Fragment key={step}>
                      <span className="px-2 py-0.5 rounded-md bg-muted/50 text-[11px] text-muted-foreground">
                        {step}
                      </span>
                      {i < engine.steps.length - 1 && (
                        <span className="text-muted-foreground/40 text-xs">→</span>
                      )}
                    </React.Fragment>
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
