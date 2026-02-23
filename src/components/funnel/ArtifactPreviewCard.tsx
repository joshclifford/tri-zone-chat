import { motion } from "framer-motion";
import { FileText, Eye } from "lucide-react";

interface ArtifactPreviewCardProps {
  title: string;
  type: string;
  onClick: () => void;
}

export function ArtifactPreviewCard({ title, type, onClick }: ArtifactPreviewCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all text-left mb-4"
    >
      <div className="p-2 rounded-md bg-primary/10">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{type}</div>
      </div>
      <div className="flex items-center gap-1 text-xs text-primary">
        <Eye className="h-3.5 w-3.5" />
        <span>View</span>
      </div>
    </motion.button>
  );
}
