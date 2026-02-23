import { motion } from "framer-motion";

interface InterviewMessageProps {
  role: "user" | "assistant";
  content: string;
  index: number;
}

export function InterviewMessage({ role, content, index }: InterviewMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}
