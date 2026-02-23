import { motion } from "framer-motion";
import { FileText, Maximize2, Copy, Download } from "lucide-react";
import { useLayout } from "@/hooks/use-layout";
import { useState } from "react";

interface ArtifactData {
  id: string;
  title: string;
  preview: string;
  assetType: string;
  content: Record<string, unknown>;
}

interface ArtifactCardProps {
  artifact: ArtifactData;
}

const ICON_MAP: Record<string, typeof FileText> = {
  "lead-magnet": FileText,
  "landing-page": FileText,
  "email-sequence": FileText,
};

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const { openRightPanel } = useLayout();
  const [copied, setCopied] = useState(false);

  const Icon = ICON_MAP[artifact.assetType] || FileText;

  const handleClick = () => {
    openRightPanel({
      title: artifact.title,
      type: artifact.assetType,
      artifactData: {
        preview: artifact.preview,
        content: artifact.content,
        assetType: artifact.assetType,
      },
    });
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(artifact.preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(artifact.content, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.title.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, boxShadow: "0 0 0 0 hsl(var(--primary) / 0)" }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0)",
          "0 0 0 4px hsl(var(--primary) / 0.15)",
          "0 0 0 0 hsl(var(--primary) / 0)",
        ],
      }}
      transition={{
        opacity: { duration: 0.3 },
        y: { duration: 0.3 },
        boxShadow: { duration: 1.2, repeat: 1, ease: "easeInOut" },
      }}
      onClick={handleClick}
      className="mb-5 rounded-lg border border-border border-l-2 border-l-primary bg-muted/5 p-4 cursor-pointer hover:bg-accent/50 transition-colors duration-200 group"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground mb-0.5 truncate">{artifact.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{artifact.preview}</p>
          <span className="text-[10px] text-muted-foreground/60 mt-1.5 block">Generated just now</span>
        </div>
      </div>

      {/* Inline actions */}
      <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-border/50">
        <button
          onClick={handleClick}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Maximize2 className="h-3 w-3" />
          View Full
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Copy className="h-3 w-3" />
          {copied ? "Copied" : "Copy"}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Download className="h-3 w-3" />
          Download
        </button>
      </div>
    </motion.div>
  );
}
