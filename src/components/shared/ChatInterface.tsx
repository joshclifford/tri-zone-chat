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
                    title: "Cold Emails",
                    preview: "Two high-converting cold email examples ready to customize and send.",
                    assetType: "email-sequence",
                    content: {
                      emails: [
                        {
                          subject: "Quick question about {{company}}'s growth",
                          preview: "Hi {{firstName}},\n\nI noticed {{company}} just expanded into {{market}} — congrats on the momentum.\n\nWe recently helped a similar company in your space cut their customer acquisition cost by 40% in 90 days using a repositioned offer strategy.\n\nWould it make sense to chat for 15 minutes this week to see if we could do something similar for you?\n\nEither way, excited to watch {{company}} grow.\n\nBest,\n{{yourName}}"
                        },
                        {
                          subject: "Idea for {{company}} (took 2 min to put together)",
                          preview: "Hi {{firstName}},\n\nI spent a couple minutes looking at {{company}}'s positioning and had an idea that could help you stand out in {{market}}.\n\nMost companies in your space lead with features — but your customers are buying a transformation. A small messaging shift could make a big difference in conversion.\n\nI put together a quick breakdown. Want me to send it over?\n\nNo pressure either way.\n\nCheers,\n{{yourName}}"
                        }
                      ],
                    },
                  },
                },
              },
              {
                role: "assistant" as const,
                content: "Here are two cold email examples I generated. Click the card above to preview them in the side panel. Does this direction look right?",
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
