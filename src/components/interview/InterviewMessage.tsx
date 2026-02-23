import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

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
      className={`mb-5 ${isUser ? "text-right" : "text-left"}`}
    >
      {isUser ? (
        <span className="text-base leading-relaxed text-muted-foreground">{content}</span>
      ) : (
        <ReactMarkdown className="prose prose-base dark:prose-invert max-w-none">
          {content}
        </ReactMarkdown>
      )}
    </motion.div>
  );
}
