import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatInterface } from "@/components/shared/ChatInterface";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SkillChat() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();

  const { data: skill, isLoading } = useQuery({
    queryKey: ["skill", skillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("id", skillId!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!skillId,
  });

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {skill && (
            <div className="flex items-center gap-2">
              <span className="text-lg">{skill.emoji}</span>
              <span className="font-medium text-foreground">{skill.name}</span>
            </div>
          )}
        </div>

        {/* Chat */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Loading skill...</p>
          </div>
        ) : skill ? (
          <ChatInterface systemPrompt={skill.system_prompt} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Skill not found.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
