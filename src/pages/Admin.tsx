import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Skill {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  emoji: string;
  is_active: boolean;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", system_prompt: "", emoji: "🔧" });

  const { data: skills = [], isLoading } = useQuery({
    queryKey: ["skills-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Skill[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from("skills").update(form).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("skills").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills-admin"] });
      resetForm();
      toast({ title: editingId ? "Skill updated" : "Skill created" });
    },
    onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("skills").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills-admin"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills-admin"] });
      toast({ title: "Skill deleted" });
    },
  });

  const resetForm = () => {
    setEditingId(null);
    setForm({ name: "", description: "", system_prompt: "", emoji: "🔧" });
  };

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      description: skill.description,
      system_prompt: skill.system_prompt,
      emoji: skill.emoji,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          <h1 className="text-2xl font-bold text-foreground">Skill Manager</h1>

          {/* Form */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-[60px_1fr] gap-4">
                <div>
                  <Label>Emoji</Label>
                  <Input
                    value={form.emoji}
                    onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
                    className="text-center text-lg"
                  />
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Skill name"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Short description"
                />
              </div>
              <div>
                <Label>System Prompt</Label>
                <Textarea
                  value={form.system_prompt}
                  onChange={(e) => setForm((f) => ({ ...f, system_prompt: e.target.value }))}
                  placeholder="AI instructions for this skill..."
                  rows={6}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => saveMutation.mutate()} disabled={!form.name || saveMutation.isPending}>
                  {editingId ? "Update Skill" : "Create Skill"}
                </Button>
                {editingId && (
                  <Button variant="ghost" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Skills List */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">All Skills</h2>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : skills.length === 0 ? (
              <p className="text-muted-foreground text-sm">No skills yet. Create one above.</p>
            ) : (
              skills.map((skill) => (
                <Card key={skill.id}>
                  <CardContent className="py-4 flex items-center gap-4">
                    <span className="text-2xl">{skill.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{skill.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{skill.description}</p>
                    </div>
                    <Switch
                      checked={skill.is_active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: skill.id, is_active: checked })
                      }
                    />
                    <Button variant="ghost" size="icon" onClick={() => startEdit(skill)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this skill?")) deleteMutation.mutate(skill.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
