import { useState, useRef, useEffect, useCallback } from "react";
import { InterviewMessage } from "../interview/InterviewMessage";
import { OptionChips } from "../interview/OptionChips";
import { TypingIndicator } from "../interview/TypingIndicator";
import { ArtifactPreviewCard } from "./ArtifactPreviewCard";
import { StepProgress } from "./StepProgress";
import { useAppState, Asset } from "@/hooks/use-app-state";
import { useLayout } from "@/hooks/use-layout";
import { Send } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "artifact";
  artifact?: Asset;
}

const STEP_CONFIG = [
  {
    name: "Lead Magnet",
    skill: "lead-magnet",
    questions: [
      { prompt: "What topic should the lead magnet cover? What's the #1 problem your audience faces?", type: "text" as const },
      { prompt: "What format works best?", type: "chips" as const, options: ["Checklist", "Guide", "Cheat Sheet", "Quiz"] },
    ],
  },
  {
    name: "Landing Page",
    skill: "landing-page",
    questions: [
      { prompt: (ctx: Record<string, unknown>) => `Your "${(ctx["lead-magnet"] as Record<string, string>)?.title || "lead magnet"}" is ready. Now let's build the landing page. Any specific audience segment you want to target?`, type: "text" as const },
    ],
  },
  {
    name: "Email Sequence",
    skill: "email-sequences",
    questions: [
      { prompt: "Almost done! How many follow-up emails should the nurture sequence have?", type: "chips" as const, options: ["3 emails", "5 emails", "7 emails"] },
    ],
  },
];

function generateMockAsset(step: number, context: Record<string, unknown>, answers: string[]): Asset {
  const topic = answers[0] || "growth strategies";
  const format = answers[1] || "Guide";

  if (step === 1) {
    return {
      id: crypto.randomUUID(),
      stepNumber: 1,
      skillName: "lead-magnet",
      title: `The Ultimate ${format}: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
      assetType: "lead-magnet",
      content: {
        title: `The Ultimate ${format}: ${topic.charAt(0).toUpperCase() + topic.slice(1)}`,
        format,
        sections: [
          { heading: "Introduction", body: `Why ${topic} matters more than ever for your business growth.` },
          { heading: "The Core Framework", body: `The 3-step approach to mastering ${topic} that separates amateurs from pros.` },
          { heading: "Quick Wins", body: "5 actions you can take today to see immediate results." },
          { heading: "Common Mistakes", body: "The pitfalls most people fall into — and how to avoid them." },
          { heading: "Next Steps", body: "Your roadmap from here, plus an exclusive bonus for subscribers." },
        ],
      },
    };
  }

  if (step === 2) {
    const magnetTitle = (context["lead-magnet"] as Record<string, string>)?.title || "lead magnet";
    const audience = answers[0] || "business owners";
    return {
      id: crypto.randomUUID(),
      stepNumber: 2,
      skillName: "landing-page",
      title: `Landing Page: ${magnetTitle}`,
      assetType: "landing-page",
      content: {
        headline: `Get Your Free ${magnetTitle}`,
        subhead: `The exact framework ${audience} are using to transform their results.`,
        bullets: [
          "Discover the #1 mistake killing your growth",
          "Get the proven 3-step framework",
          "Actionable tips you can implement today",
          "Bonus resources included free",
        ],
        cta: "Download Now — It's Free",
        socialProof: "Join 2,000+ professionals who've already downloaded this resource.",
      },
    };
  }

  const emailCount = parseInt(answers[0]) || 5;
  const magnetTitle = (context["lead-magnet"] as Record<string, string>)?.title || "lead magnet";
  const emails = Array.from({ length: emailCount }, (_, i) => ({
    subject: i === 0
      ? `Here's your ${magnetTitle}`
      : i === 1
        ? "Did you get a chance to read it?"
        : i === emailCount - 1
          ? "Last chance: Special offer inside"
          : `Tip #${i}: Quick win for you`,
    preview: i === 0
      ? "Welcome! Here's the download link and a quick overview of what's inside."
      : i === 1
        ? "Just checking in — the most important section is #2. Here's why…"
        : i === emailCount - 1
          ? "I wanted to share an exclusive opportunity before it closes."
          : `Here's a quick actionable tip from the ${magnetTitle} you can implement right now.`,
  }));

  return {
    id: crypto.randomUUID(),
    stepNumber: 3,
    skillName: "email-sequences",
    title: `Email Sequence: ${emailCount} Nurture Emails`,
    assetType: "email-sequence",
    content: { emails, magnetTitle },
  };
}

export function FunnelChat() {
  const { activeCampaign, advanceStep, addAsset, completeFunnel, returnToGrid } = useAppState();
  const { openRightPanel } = useLayout();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stepAnswers, setStepAnswers] = useState<string[]>([]);
  const [assetGenerated, setAssetGenerated] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const step = activeCampaign?.currentStep || 1;
  const stepConfig = STEP_CONFIG[step - 1];
  const steps = STEP_CONFIG.map((s) => s.name);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  // Deliver current question
  useEffect(() => {
    setIsTyping(true);
    setShowInput(false);
    setAssetGenerated(false);
    setQuestionIndex(0);
    setStepAnswers([]);

    const q = stepConfig.questions[0];
    const delay = 600 + Math.random() * 400;
    setTimeout(() => {
      const content = typeof q.prompt === "function" ? q.prompt(activeCampaign?.context || {}) : q.prompt;
      setMessages((prev) => [...prev, { id: `ai-step${step}-q0`, role: "assistant", content }]);
      setIsTyping(false);
      if (q.type === "text") {
        setShowInput(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      scrollToBottom();
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const processAnswer = useCallback(
    (text: string) => {
      setMessages((prev) => [...prev, { id: `user-step${step}-q${questionIndex}`, role: "user", content: text }]);
      const newAnswers = [...stepAnswers, text];
      setStepAnswers(newAnswers);
      setShowInput(false);
      scrollToBottom();

      const nextQ = questionIndex + 1;
      if (nextQ < stepConfig.questions.length) {
        // More questions in this step
        setQuestionIndex(nextQ);
        setIsTyping(true);
        const q = stepConfig.questions[nextQ];
        setTimeout(() => {
          const content = typeof q.prompt === "function" ? q.prompt(activeCampaign?.context || {}) : q.prompt;
          setMessages((prev) => [...prev, { id: `ai-step${step}-q${nextQ}`, role: "assistant", content }]);
          setIsTyping(false);
          if (q.type === "text") {
            setShowInput(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }
          scrollToBottom();
        }, 700);
      } else {
        // Generate asset
        setIsTyping(true);
        setTimeout(() => {
          const asset = generateMockAsset(step, activeCampaign?.context || {}, newAnswers);
          addAsset(asset);

          setMessages((prev) => [
            ...prev,
            { id: `ai-step${step}-done`, role: "assistant", content: `Done! Here's your ${stepConfig.name}:` },
            { id: `artifact-${asset.id}`, role: "assistant", content: "", type: "artifact", artifact: asset },
          ]);
          setIsTyping(false);
          setAssetGenerated(true);

          openRightPanel({ title: asset.title, type: asset.assetType });
          scrollToBottom();
        }, 1200);
      }
    },
    [step, questionIndex, stepAnswers, stepConfig, activeCampaign, addAsset, openRightPanel, scrollToBottom]
  );

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    processAnswer(text);
  };

  const handleChipSelect = (option: string) => processAnswer(option);

  const handleContinue = () => {
    if (step >= 3) {
      completeFunnel();
    } else {
      advanceStep();
    }
  };

  const currentQ = stepConfig.questions[questionIndex];
  const showChips = !isTyping && currentQ?.type === "chips" && !assetGenerated;

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-[700px]">
          <StepProgress
            currentStep={step}
            totalSteps={3}
            steps={steps}
            onBack={returnToGrid}
          />

          {messages.map((msg, i) => {
            if (msg.type === "artifact" && msg.artifact) {
              return (
                <ArtifactPreviewCard
                  key={msg.id}
                  title={msg.artifact.title}
                  type={msg.artifact.assetType}
                  onClick={() => openRightPanel({ title: msg.artifact!.title, type: msg.artifact!.assetType })}
                />
              );
            }
            return <InterviewMessage key={msg.id} role={msg.role} content={msg.content} index={i} />;
          })}

          {isTyping && <TypingIndicator />}

          {showChips && (
            <OptionChips options={currentQ.options || []} onSelect={handleChipSelect} />
          )}

          {assetGenerated && (
            <button
              onClick={handleContinue}
              className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {step >= 3 ? "Complete Funnel ✓" : `Continue to Step ${step + 1} →`}
            </button>
          )}
        </div>
      </div>

      {showInput && (
        <div className="border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-[700px] px-4 py-3">
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
