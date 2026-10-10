import { useAiStore } from "../store/useAiStore";
import { Sparkles } from "lucide-react";

const SmartReplies = ({ onSelectReply }) => {
  const { smartReplies, isGeneratingReplies } = useAiStore();

  if (isGeneratingReplies) {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-base-content/60 animate-pulse">
        <Sparkles className="size-3.5 text-primary animate-spin" />
        <span>Generating AI smart replies...</span>
      </div>
    );
  }

  if (!smartReplies || smartReplies.length === 0) return null;

  return (
    <div className="px-4 pb-2 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-[11px] font-semibold text-primary/80 uppercase tracking-wider mr-1">
        <Sparkles className="size-3 text-primary" />
        <span>Smart Reply</span>
      </div>
      {smartReplies.map((reply, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectReply(reply)}
          className="text-xs bg-base-200 hover:bg-primary hover:text-primary-content text-base-content/90 border border-base-300 rounded-full px-3 py-1 transition-all duration-200 active:scale-95 shadow-sm text-left truncate max-w-[260px]"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default SmartReplies;
