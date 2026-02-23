import { useState, useRef, useEffect, useCallback } from "react";
import { InterviewMessage } from "./InterviewMessage";
import { FoundationSummary } from "./FoundationSummary";
import { TypingIndicator } from "./TypingIndicator";
import { InlineOptionChips } from "@/components/chat/InlineOptionChips";
import { StepDivider } from "@/components/chat/StepDivider";
import { useAppState, VoiceProfile, Positioning } from "@/hooks/use-app-state";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type TurnType = "text" | "chips" | "summary";

interface Turn {
  id: number;
  prompt: string | ((ctx: Record<string, string>) => string);
  type: TurnType;
  options?: string[] | ((ctx: Record<string, string>) => string[]);
  allowCustom?: boolean;
}

const TURNS: Turn[] = [
  {
    id: 1,
    prompt: "Welcome to Customer Engine OS! Let's build your brand foundation. First — what does your business do? Tell me in a sentence or two.",
    type: "text",
  },
  {
    id: 2,
    prompt: (ctx) =>
      `Got it — ${ctx.business || "your business"} sounds interesting. Let's find your hook. Which of these angles resonates most?`,
    type: "chips",
    options: (ctx) => {
      const biz = ctx.business || "your business";
      return [
        `The contrarian: "Everything you know about ${biz.split(" ").slice(0, 3).join(" ")} is wrong"`,
        `The transformation: "Go from struggling to thriving with ${biz.split(" ").slice(0, 3).join(" ")}"`,
        `The shortcut: "The fastest path to results with ${biz.split(" ").slice(0, 3).join(" ")}"`,
      ];
    },
    allowCustom: true,
  },
  {
    id: 3,
    prompt: (ctx) =>
      `Great choice! Now let's refine your messaging angle. Based on "${ctx.hook?.slice(0, 40) || "your hook"}…", which direction fits best?`,
    type: "chips",
    options: [
      "Bold & Direct — Cut through the noise",
      "Warm & Conversational — Build trust first",
      "Expert & Authoritative — Lead with proof",
    ],
  },
  {
    id: 4,
    prompt: (ctx) =>
      `"${ctx.tone || "Bold & Direct"}" — solid choice. Now, who's your ideal customer? Be specific — job title, situation, frustration.`,
    type: "text",
  },
  {
    id: 5,
    prompt: (ctx) =>
      `Here's your positioning angle: You help ${ctx.audience || "your audience"} achieve results through ${ctx.business?.split(" ").slice(0, 4).join(" ") || "your approach"}, using a ${ctx.tone?.split("—")[0]?.trim().toLowerCase() || "direct"} voice. What makes you different from others in your space?`,
    type: "text",
  },
  {
    id: 6,
    prompt: "Here's your complete Brand Foundation. Review it below — does this feel right?",
    type: "summary",
  },
];

export function InterviewChat() {
  const { lockFoundation } = useAppState();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [context, setContext] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  // Deliver next AI message
  const deliverTurn = useCallback(
    (turnIndex: number, ctx: Record<string, string>) => {
      if (turnIndex >= TURNS.length) return;
      setIsTyping(true);
      setShowInput(false);
      setShowSummary(false);

      const turn = TURNS[turnIndex];
      const delay = 800 + Math.random() * 600;

      setTimeout(() => {
        const content = typeof turn.prompt === "function" ? turn.prompt(ctx) : turn.prompt;
        setMessages((prev) => [...prev, { id: `ai-${turn.id}`, role: "assistant", content }]);
        setIsTyping(false);

        if (turn.type === "summary") {
          setShowSummary(true);
        } else if (turn.type === "text") {
          setShowInput(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
        // chips are shown via current turn state
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom]
  );

  // Start first turn
  useEffect(() => {
    deliverTurn(0, context);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processUserInput = useCallback(
    (text: string) => {
      const turn = TURNS[currentTurn];
      setMessages((prev) => [...prev, { id: `user-${turn.id}`, role: "user", content: text }]);

      // Update context based on turn
      const newCtx = { ...context };
      if (turn.id === 1) newCtx.business = text;
      if (turn.id === 2) newCtx.hook = text;
      if (turn.id === 3) newCtx.tone = text.split("—")[0]?.trim() || text;
      if (turn.id === 4) newCtx.audience = text;
      if (turn.id === 5) newCtx.differentiator = text;
      setContext(newCtx);

      const nextTurn = currentTurn + 1;
      setCurrentTurn(nextTurn);
      setShowInput(false);
      scrollToBottom();

      deliverTurn(nextTurn, newCtx);
    },
    [currentTurn, context, deliverTurn, scrollToBottom]
  );

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    processUserInput(text);
  };

  const handleChipSelect = (option: string) => {
    if (option === "__custom__") {
      setShowInput(true);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }
    processUserInput(option);
  };

  const handleLock = () => {
    const voice: VoiceProfile = {
      businessDescription: context.business || "",
      hook: context.hook || "",
      tone: context.tone || "Bold & Direct",
      angle: context.differentiator || "",
    };
    const pos: Positioning = {
      angle: `Help ${context.audience || "your audience"} through ${context.business?.split(" ").slice(0, 4).join(" ") || "your approach"}`,
      audience: context.audience || "",
      differentiator: context.differentiator || "",
    };
    lockFoundation(voice, pos);
  };

  const handleRefine = () => {
    // Reset to turn 2 (hook selection)
    setMessages((prev) => prev.slice(0, 1));
    setCurrentTurn(1);
    setShowSummary(false);
    deliverTurn(1, context);
  };

  const currentTurnData = TURNS[currentTurn];
  const showChips = !isTyping && currentTurnData?.type === "chips" && !showInput;
  const chipOptions = showChips
    ? typeof currentTurnData.options === "function"
      ? currentTurnData.options(context)
      : currentTurnData.options || []
    : [];

  const summaryVoice: VoiceProfile = {
    businessDescription: context.business || "",
    hook: context.hook || "",
    tone: context.tone || "Bold & Direct",
    angle: context.differentiator || "",
  };
  const summaryPositioning: Positioning = {
    angle: `Help ${context.audience || "your audience"} through ${context.business?.split(" ").slice(0, 4).join(" ") || "your approach"}`,
    audience: context.audience || "",
    differentiator: context.differentiator || "",
  };

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-lg font-semibold text-foreground mb-1">Let's build your Customer Engine OS foundation</h1>
            <p className="text-sm text-muted-foreground">A quick 5-question interview to capture your brand voice & positioning.</p>
          </div>

          {messages.map((msg, i) => {
            // Show step divider before each AI message at key turns
            const showDivider = msg.role === "assistant" && i > 0;
            const turnIndex = messages.filter((m, j) => j <= i && m.role === "assistant").length;
            return (
              <div key={msg.id}>
                {showDivider && turnIndex > 1 && (
                  <StepDivider current={turnIndex} total={TURNS.length} />
                )}
                <InterviewMessage role={msg.role} content={msg.content} index={i} />
              </div>
            );
          })}

          {isTyping && <TypingIndicator statusText={
            currentTurn === 0 ? undefined :
            currentTurn === 1 ? "Analyzing your business…" :
            currentTurn === 2 ? "Finding your hook angle…" :
            currentTurn === 3 ? "Refining your voice…" :
            currentTurn === 4 ? "Mapping your audience…" :
            "Building your foundation…"
          } />}

          {showChips && (
            <InlineOptionChips
              options={chipOptions}
              onSelect={handleChipSelect}
              allowCustom={currentTurnData?.allowCustom}
            />
          )}

          {showSummary && (
            <FoundationSummary
              voice={summaryVoice}
              positioning={summaryPositioning}
              onLock={handleLock}
              onRefine={handleRefine}
            />
          )}
        </div>
      </div>

      {/* Input bar — only show for text turns */}
      {showInput && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-3">
            <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-4 py-3 focus-within:border-primary/40 transition-colors">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your answer…"
                rows={1}
                className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none leading-relaxed"
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={handleSend}
                className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
