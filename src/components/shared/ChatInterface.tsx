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
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFiredGreeting = useRef(false);

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
            messages: currentMessages.map((m) => ({ role: m.role, content: m.content })),
            systemPrompt,
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
              setMessages((prev) => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: assistantContent };
                return copy;
              });
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      // After streaming, parse for artifacts and replace the last message
      if (assistantContent) {
        const parsed = parseArtifacts(assistantContent);
        if (parsed.length > 1 || parsed[0]?.type === "artifact") {
          setMessages((prev) => [...prev.slice(0, -1), ...parsed]);
        }

        // DEMO: inject a mock artifact card after the first AI response
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
                    title: "The Cold Email Checklist",
                    preview: "A 10-point framework for writing high-converting cold emails that get replies, not spam reports.",
                    assetType: "lead-magnet",
                    content: {
                      title: "The Cold Email Checklist",
                      format: "PDF Checklist",
                      sections: [
                        { heading: "1. Subject Line Formula", body: "Use the 3-word curiosity gap: hint at value without revealing it. Example: 'Quick question about [prospect's company]'" },
                        { heading: "2. Opening Line", body: "Reference something specific about the recipient — a recent post, company news, or mutual connection. Never start with 'I hope this finds you well.'" },
                        { heading: "3. Value Proposition", body: "One sentence: what you do + who you help + the result. Example: 'We help B2B SaaS companies cut churn by 30% in 90 days.'" },
                        { heading: "4. Social Proof", body: "Name-drop one recognizable client or cite one specific metric. Keep it to one line." },
                        { heading: "5. Call to Action", body: "Ask one simple yes/no question. 'Would it make sense to chat for 15 minutes this week?'" },
                      ],
                    },
                  },
                },
              },
              {
                role: "assistant" as const,
                content: "Here's a sample lead magnet I generated. Click the card above to see the full document in the side panel. Does this direction look right?",
                type: "options" as const,
                metadata: {
                  options: ["Looks good — Continue", "Make changes"],
                },
              },
            ];
          }
          return prev;
        });

        const toSave = [...currentMessages, { role: "assistant" as const, content: assistantContent }];
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
  }, [systemPrompt, saveConversation, parseArtifacts]);

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
