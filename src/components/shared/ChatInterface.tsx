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
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/chat`,
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
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {messages.map((msg, i) => (
            <InterviewMessage key={i} role={msg.role} content={msg.content} index={i} />
          ))}
          {isStreaming && messages[messages.length - 1]?.content === "" && <TypingIndicator />}
        </div>
      </div>

      <div className="border-t border-border bg-card/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isStreaming}
          />
          <Button size="icon" onClick={sendMessage} disabled={isStreaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
