import { useAiStore } from "../store/useAiStore";
import { Sparkles, X, Copy, Check, FileText } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const AiSummaryModal = () => {
  const { isSummaryModalOpen, setSummaryModalOpen, isSummarizing, summaryData } = useAiStore();
  const [copied, setCopied] = useState(false);

  if (!isSummaryModalOpen) return null;

  const handleCopy = () => {
    if (!summaryData) return;
    const textToCopy = summaryData.bullets
      ? summaryData.bullets.map((b) => `• ${b}`).join("\n")
      : summaryData.summary;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-300 w-full max-w-lg p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-base-300 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg leading-tight">AI Conversation Summary</h3>
              <p className="text-xs text-base-content/60">Executive TL;DR of recent messages</p>
            </div>
          </div>
          <button
            onClick={() => setSummaryModalOpen(false)}
            className="btn btn-ghost btn-sm btn-circle"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {isSummarizing ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="loading loading-spinner text-primary loading-lg" />
            <span className="text-sm text-base-content/70">Analyzing conversation highlights...</span>
          </div>
        ) : summaryData ? (
          <div className="flex flex-col gap-3">
            <div className="bg-base-200/50 p-4 rounded-xl border border-base-300">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <FileText className="size-3.5" />
                <span>Key Takeaways & Action Items</span>
              </div>
              <ul className="space-y-2">
                {summaryData.bullets?.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-base-content/90">
                    <span className="text-primary font-bold leading-5">•</span>
                    <span className="leading-5">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-base-content/60">
            No summary data available.
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-base-300">
          <span className="text-[11px] text-base-content/50">🔒 Privacy preserved: decrypted locally</span>
          <div className="flex items-center gap-2">
            {summaryData && (
              <button
                type="button"
                onClick={handleCopy}
                className="btn btn-sm btn-outline gap-1.5"
              >
                {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSummaryModalOpen(false)}
              className="btn btn-sm btn-primary"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSummaryModal;
