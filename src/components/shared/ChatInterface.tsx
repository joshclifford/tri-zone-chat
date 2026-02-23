import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InterviewMessage } from "@/components/interview/InterviewMessage";
import { TypingIndicator } from "@/components/interview/TypingIndicator";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  systemPrompt: string;
  skillId: string;
  conversationId?: string;
  initialMessages?: Message[];
}

export function ChatInterface({ systemPrompt, skillId, conversationId: existingConvId, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages ?? []);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [convId, setConvId] = useState<string | null>(existingConvId ?? null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasFiredGreeting = useRef(false);

  // Auto-save conversation after each assistant response
  const saveConversation = useCallback(async (msgs: Message[]) => {
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

  // Stream a response from the AI
  const streamResponse = useCallback(async (currentMessages: Message[]) => {
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
      let finalMessages: Message[] = [];

      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, content: "" }];
        return next;
      });

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
                finalMessages = copy;
                return copy;
              });
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      // Auto-save after streaming completes
      if (assistantContent) {
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
  }, [systemPrompt, saveConversation]);

  // Fire initial greeting on mount (sends empty history so AI opens the conversation)
  useEffect(() => {
    if (!hasFiredGreeting.current && messages.length === 0) {
      hasFiredGreeting.current = true;
      streamResponse([]);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isStreaming]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Message = { role: "user", content: trimmed };
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

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <InterviewMessage key={i} role={msg.role} content={msg.content} index={i} />
          ))}
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
                onClick={sendMessage}
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
