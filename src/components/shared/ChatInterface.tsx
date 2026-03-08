import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { InterviewMessage } from "@/components/interview/InterviewMessage";
import { TypingIndicator } from "@/components/interview/TypingIndicator";
import { InlineOptionChips } from "@/components/chat/InlineOptionChips";
import { ThinkingState } from "@/components/chat/ThinkingState";
import { ArtifactCard } from "@/components/chat/ArtifactCard";
import { StepDivider } from "@/components/chat/StepDivider";
import { useLayout } from "@/hooks/use-layout";
import { supabase } from "@/integrations/supabase/client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "options" | "artifact" | "thinking" | "divider";
  metadata?: {
    options?: string[];
    allowCustom?: boolean;
    artifact?: {
      id: string;
      title: string;
      preview: string;
      assetType: string;
      content: Record<string, unknown>;
    };
    thinkingStatus?: string;
    thinkingSteps?: Array<{ label: string; done: boolean }>;
    stepInfo?: { current: number; total: number };
  };
}

interface RoadmapData {
  programName: string;
  description: string;
  phases: Array<{
    label: string;
    name: string;
    steps: Array<{ name: string; description: string }>;
  }>;
}

const DEFAULT_ROADMAP: RoadmapData = {
  programName: "GrowthOS",
  description: "A 90-day system: craft your offer, validate with a workshop, then automate with a funnel.",
  phases: [
    {
      label: "Phase 1",
      name: "Offer",
      steps: [
        { name: "Million Dollar Message", description: "Clarify who you help and why you." },
        { name: "Offer Architecture", description: "Design a premium, transformation-driven offer." },
        { name: "Pricing & Packaging", description: "Position pricing to attract committed buyers." },
      ],
    },
    {
      label: "Phase 2",
      name: "Workshop",
      steps: [
        { name: "Workshop Content", description: "Build a live session that educates and converts." },
        { name: "Delivery System", description: "Set up registration, reminders, and replay." },
        { name: "Close Sequence", description: "Convert attendees into paying clients." },
      ],
    },
    {
      label: "Phase 3",
      name: "Funnel",
      steps: [
        { name: "Landing Pages", description: "High-converting pages for each step." },
        { name: "Email Sequences", description: "Automate nurture and follow-up flows." },
        { name: "Traffic Strategy", description: "Drive qualified leads into the funnel." },
      ],
    },
  ],
};

interface ChatInterfaceProps {
  systemPrompt: string;
  skillId: string;
  conversationId?: string;
  initialMessages?: ChatMessage[];
}

export function ChatInterface({ systemPrompt, skillId, conversationId: existingConvId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [convId, setConvId] = useState<string | null>(existingConvId ?? null);
  const [roadmap, setRoadmap] = useState<RoadmapData>(DEFAULT_ROADMAP);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFiredGreeting = useRef(false);
  const { openRightPanel, updateRightPanelContent, rightPanelOpen, rightPanelContent } = useLayout();

  // Helper to build roadmap artifact content object
  const buildRoadmapContent = useCallback((rm: RoadmapData) => ({
    programName: rm.programName,
    description: rm.description,
    phases: rm.phases,
  }), []);

  // Update the right panel if it's showing the roadmap
  const syncRightPanel = useCallback((rm: RoadmapData) => {
    if (rightPanelOpen && rightPanelContent?.type === "roadmap") {
      updateRightPanelContent({
        title: "Program Roadmap",
        type: "roadmap",
        artifactData: {
          preview: "Your 3-phase transformation roadmap.",
          content: buildRoadmapContent(rm),
          assetType: "roadmap",
        },
      });
    }
  }, [rightPanelOpen, rightPanelContent, updateRightPanelContent, buildRoadmapContent]);

  // Update roadmap artifact message in the chat
  const updateRoadmapInMessages = useCallback((rm: RoadmapData) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.type === "artifact" && m.metadata?.artifact?.assetType === "roadmap") {
          return {
            ...m,
            metadata: {
              ...m.metadata,
              artifact: {
                ...m.metadata!.artifact!,
                content: buildRoadmapContent(rm),
              },
            },
          };
        }
        return m;
      })
    );
  }, [buildRoadmapContent]);

  // Parse roadmap update markers from content
  const extractRoadmapUpdates = useCallback((content: string): { cleanContent: string; updatedRoadmap: RoadmapData | null } => {
    const regex = /\[ROADMAP_UPDATE:(\{[\s\S]*?\})\]/g;
    let updatedRoadmap: RoadmapData | null = null;
    const cleanContent = content.replace(regex, (_, json) => {
      try {
        const parsed = JSON.parse(json);
        // Merge partial updates into current roadmap
        updatedRoadmap = { ...roadmap };
        if (parsed.programName) updatedRoadmap.programName = parsed.programName;
        if (parsed.description) updatedRoadmap.description = parsed.description;
        if (parsed.phases) updatedRoadmap.phases = parsed.phases;
      } catch (e) {
        console.error("Failed to parse roadmap update:", e);
      }
      return "";
    }).trim();
    return { cleanContent, updatedRoadmap };
  }, [roadmap]);

  // Auto-save conversation after each assistant response
  const saveConversation = useCallback(async (msgs: ChatMessage[]) => {
    try {
      if (convId) {
        await supabase
          .from("conversations")
          .update({ messages: msgs as any })
          .eq("id", convId);
      } else {
        const { data, error } = await supabase
          .from("conversations")
          .insert({ skill_id: skillId, messages: msgs as any })
          .select("id")
          .single();
        if (!error && data) setConvId(data.id);
      }
    } catch (e) {
      console.error("Save conversation error:", e);
    }
  }, [convId, skillId]);

  // Parse artifact markers from assistant content
  const parseArtifacts = useCallback((content: string): ChatMessage[] => {
    const artifactRegex = /\[ARTIFACT:(\{.*?\})\]/gs;
    const parts: ChatMessage[] = [];
    let lastIndex = 0;
    let match;

    while ((match = artifactRegex.exec(content)) !== null) {
      const before = content.slice(lastIndex, match.index).trim();
      if (before) {
        parts.push({ role: "assistant", content: before, type: "text" });
      }
      try {
        const artifactData = JSON.parse(match[1]);
        parts.push({
          role: "assistant",
          content: "",
          type: "artifact",
          metadata: { artifact: artifactData },
        });
      } catch {
        parts.push({ role: "assistant", content: match[0], type: "text" });
      }
      lastIndex = match.index + match[0].length;
    }

    const remaining = content.slice(lastIndex).trim();
    if (remaining || parts.length === 0) {
      parts.push({ role: "assistant", content: remaining || content, type: "text" });
    }

    return parts;
  }, []);

  // Build the augmented system prompt with roadmap context
  const buildSystemPrompt = useCallback(() => {
    const roadmapContext = `

CURRENT ROADMAP STATE (this is the user's current program roadmap — you can update it):
${JSON.stringify(roadmap, null, 2)}

ROADMAP UPDATE INSTRUCTIONS:
When the user asks to change the roadmap (rename phases, rename steps, change descriptions, add/remove steps, rename the program, etc.), output a [ROADMAP_UPDATE:{...}] marker with the FULL updated roadmap JSON. The format must be:
[ROADMAP_UPDATE:{"programName":"...","description":"...","phases":[{"label":"Phase 1","name":"...","steps":[{"name":"...","description":"..."},...]},{"label":"Phase 2","name":"...","steps":[...]},{"label":"Phase 3","name":"...","steps":[...]}]}]

Rules:
- Keep step descriptions SHORT — max 12 words each
- Keep all phases with the same number of steps (3 each) unless the user asks otherwise
- Always output the COMPLETE roadmap in the update, not just changed parts
- Include the marker inline in your response, then continue talking normally
- Only output ROADMAP_UPDATE when the user actually wants to change the roadmap content
`;
    return systemPrompt + roadmapContext;
  }, [systemPrompt, roadmap]);

  // Stream a response from the AI
  const streamResponse = useCallback(async (currentMessages: ChatMessage[]) => {
    setIsStreaming(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: currentMessages
              .filter((m) => m.content && m.content.trim() !== "")
              .map((m) => ({ role: m.role, content: m.content })),
            systemPrompt: buildSystemPrompt(),
          }),
        }
      );

      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant" as const, content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              // Show content without roadmap markers during streaming
              const displayContent = assistantContent.replace(/\[ROADMAP_UPDATE:[\s\S]*?\]/g, "").trim();
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: displayContent };
                return copy;
              });
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      // After streaming complete, extract roadmap updates
      if (assistantContent) {
        const { cleanContent, updatedRoadmap } = extractRoadmapUpdates(assistantContent);

        if (updatedRoadmap) {
          setRoadmap(updatedRoadmap);
          updateRoadmapInMessages(updatedRoadmap);
          syncRightPanel(updatedRoadmap);
        }

        // Parse for other artifacts
        const parsed = parseArtifacts(cleanContent);
        if (parsed.length > 1 || parsed[0]?.type === "artifact") {
          setMessages((prev) => [...prev.slice(0, -1), ...parsed]);
        } else {
          // Update the last message with clean content
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: cleanContent };
            return copy;
          });
        }

        // DEMO: inject mock artifact cards after the first AI response
        setMessages((prev) => {
          const hasArtifact = prev.some((m) => m.type === "artifact");
          if (!hasArtifact && prev.filter((m) => m.role === "assistant").length === 1) {
            return [
              ...prev,
              {
                role: "assistant" as const,
                content: "",
                type: "artifact" as const,
                metadata: {
                  artifact: {
                    id: "demo-1",
                    title: "Brand Profile",
                    preview: "Your brand voice, ideal avatar, and positioning at a glance.",
                    assetType: "brand-profile",
                    content: {
                      brandName: "ServicesThatScale",
                      voice: {
                        tone: "Direct, confident, no-fluff",
                        personality: "Experienced operator who's been in the trenches",
                        vocabulary: ["ROI-driven", "scalable", "proven", "high-ticket"],
                      },
                      avatar: {
                        title: "Growth-Stage Service Provider",
                        description: "B2B consultants and agency owners doing $10K–$50K/mo who want to break past a revenue ceiling",
                        painPoints: ["Inconsistent lead flow", "Underpriced offers", "Trading time for money"],
                        desires: ["Predictable pipeline", "Premium positioning", "Scalable delivery"],
                      },
                      positioning: "We help B2B service providers package and sell high-ticket offers using proven messaging frameworks.",
                    },
                  },
                },
              },
              {
                role: "assistant" as const,
                content: "Here's your brand profile — click to see your voice, avatar, and positioning. Now let's look at your messaging toolkit:",
                type: "text" as const,
              },
              {
                role: "assistant" as const,
                content: "",
                type: "artifact" as const,
                metadata: {
                  artifact: {
                    id: "demo-2",
                    title: "Messaging Reference",
                    preview: "Common hooks, frameworks, and angle examples for your content.",
                    assetType: "messaging-guide",
                    content: {
                      hooks: [
                        { type: "Contrarian", example: "Stop creating content. Start creating conversions." },
                        { type: "Question", example: "What if your offer is the reason clients ghost you?" },
                        { type: "Stat-led", example: "83% of service businesses are undercharging. Here's the fix." },
                        { type: "Story", example: "I lost a $20K client because of one sentence in my pitch." },
                      ],
                      frameworks: [
                        { name: "PAS", description: "Problem → Agitate → Solution", example: "Struggling to close high-ticket? Most consultants pitch features instead of outcomes. Lead with the transformation and watch close rates climb." },
                        { name: "AIDA", description: "Attention → Interest → Desire → Action", example: "What if you could 3x your revenue without 3x-ing your workload? Our clients do it by repositioning their offer. Book a strategy call." },
                        { name: "BAB", description: "Before → After → Bridge", example: "Before: chasing leads on LinkedIn for hours. After: inbound inquiries from ideal clients. Bridge: a messaging overhaul that takes 48 hours." },
                      ],
                    },
                  },
                },
              },
              {
                role: "assistant" as const,
                content: "Here's your messaging reference with hooks and frameworks. What do you think?",
                type: "options" as const,
                metadata: {
                  options: ["Looks good — save it", "Make changes"],
                },
              },
            ];
          }
          return prev;
        });

        const toSave = [...currentMessages, { role: "assistant" as const, content: cleanContent }];
        await saveConversation(toSave);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant" as const, content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setIsStreaming(false);
    }
  }, [buildSystemPrompt, saveConversation, parseArtifacts, extractRoadmapUpdates, updateRoadmapInMessages, syncRightPanel, buildRoadmapContent, roadmap]);

  // Fire initial greeting on mount
  useEffect(() => {
    if (!hasFiredGreeting.current && messages.length === 0) {
      hasFiredGreeting.current = true;
      streamResponse([]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");

    await streamResponse(updated);
  }, [input, isStreaming, messages, streamResponse]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChipSelect = (option: string) => {
    sendMessage(option);
  };

  const renderMessage = (msg: ChatMessage, i: number) => {
    const type = msg.type || "text";

    switch (type) {
      case "options":
        return (
          <div key={i}>
            <InterviewMessage role={msg.role} content={msg.content} index={i} />
            {msg.metadata?.options && (
              <InlineOptionChips
                options={msg.metadata.options}
                onSelect={handleChipSelect}
                allowCustom={msg.metadata.allowCustom}
              />
            )}
          </div>
        );

      case "artifact":
        return msg.metadata?.artifact ? (
          <ArtifactCard key={i} artifact={msg.metadata.artifact} />
        ) : null;

      case "thinking":
        return (
          <ThinkingState
            key={i}
            statusText={msg.metadata?.thinkingStatus}
            steps={msg.metadata?.thinkingSteps}
          />
        );

      case "divider":
        return msg.metadata?.stepInfo ? (
          <StepDivider key={i} current={msg.metadata.stepInfo.current} total={msg.metadata.stepInfo.total} />
        ) : null;

      case "text":
      default:
        return <InterviewMessage key={i} role={msg.role} content={msg.content} index={i} />;
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => renderMessage(msg, i))}
          {isStreaming && messages[messages.length - 1]?.content === "" && <TypingIndicator />}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-border bg-background shadow-sm focus-within:border-primary/40 transition-colors">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 160) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anything..."
              rows={1}
              className="w-full resize-none bg-transparent px-4 pt-3 pb-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
              disabled={isStreaming}
            />
            <div className="flex items-center justify-end px-3 pb-2">
              <button
                onClick={() => sendMessage()}
                disabled={isStreaming || !input.trim()}
                className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:hover:bg-muted disabled:hover:text-muted-foreground transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
