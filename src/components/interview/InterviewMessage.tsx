import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface InterviewMessageProps {
  role: "user" | "assistant";
  content: string;
  index: number;
}

export function InterviewMessage({ role, content, index }: InterviewMessageProps) {
  const isUser = role === "user";

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="mb-5 flex justify-end"
      >
        <span className="inline-block rounded-2xl bg-muted px-4 py-2.5 text-sm leading-relaxed text-foreground">
          {content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="mb-5 flex items-start pl-3"
    >
      <div className="min-w-0 flex-1">
        <ReactMarkdown className="prose prose-base dark:prose-invert max-w-none">
          {content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}
