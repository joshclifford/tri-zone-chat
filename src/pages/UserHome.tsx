import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { motion } from "framer-motion";

const SKILL_STEPS: Record<string, string[]> = {
  "Million Dollar Message": ["Avatar", "Currency", "Metric", "Timeline", "Obstacles", "Mechanism"],
};

export default function UserHome() {
  const navigate = useNavigate();

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("id, name, description, emoji")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Skills</h1>

          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading skills...</p>
          ) : skills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active skills available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {skills.map((skill, index) => {
                const steps = SKILL_STEPS[skill.name];
                return (
                  <motion.button
                    key={skill.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                    onClick={() => navigate(`/chat/${skill.id}`)}
                    className="group w-full text-left rounded-lg border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-sm cursor-pointer"
                  >
                    <div className="text-4xl mb-3">{skill.emoji}</div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{skill.description}</p>
                    {steps && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {steps.map((step, i) => (
                          <span key={step} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-[10px] font-medium">
                              {i + 1}
                            </span>
                            {step}
                            {i < steps.length - 1 && <span className="text-border ml-1">→</span>}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
