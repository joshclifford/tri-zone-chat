import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";

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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Skills</h1>

          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading skills...</p>
          ) : skills.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active skills available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => (
                <Card
                  key={skill.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/chat/${skill.id}`)}
                >
                  <CardContent className="pt-6">
                    <span className="text-3xl mb-3 block">{skill.emoji}</span>
                    <h3 className="font-semibold text-foreground mb-1">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground">{skill.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
