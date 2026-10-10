import { useState } from "react";
import { useAiStore } from "../store/useAiStore";
import { Sparkles, Check, X, Loader2, ArrowRight } from "lucide-react";

const tones = [
  { id: "professional", label: "Professional", desc: "Workplace & interview appropriate" },
  { id: "casual", label: "Casual", desc: "Friendly & relaxed phrasing" },
  { id: "grammar", label: "Fix Grammar", desc: "Correct spelling & punctuation" },
  { id: "concise", label: "Concise", desc: "Direct & to the point" },
  { id: "friendly", label: "Warm & Friendly", desc: "Enthusiastic and welcoming" },
];

const AiPolishModal = ({ isOpen, onClose, currentDraft, onApplyPolished }) => {
  const { polishDraft, isPolishing } = useAiStore();
  const [selectedTone, setSelectedTone] = useState("professional");
  const [polishedResult, setPolishedResult] = useState("");

  if (!isOpen) return null;

  const handlePolish = async (tone) => {
    setSelectedTone(tone);
    const result = await polishDraft(currentDraft, tone);
    setPolishedResult(result);
  };

  const handleApply = () => {
    if (polishedResult) {
      onApplyPolished(polishedResult);
    }
    onClose();
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
              <h3 className="font-semibold text-lg leading-tight">AI Message Polish</h3>
              <p className="text-xs text-base-content/60">Rewrite and enhance your draft instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Original Draft Preview */}
        <div className="bg-base-200/60 p-3 rounded-xl border border-base-300">
          <span className="text-[11px] font-semibold text-base-content/60 uppercase">Original Draft</span>
          <p className="text-sm text-base-content/90 mt-1 italic">
            {currentDraft || "(Draft is empty - type in chat first)"}
          </p>
        </div>

        {/* Tone Selector */}
        <div>
          <span className="text-xs font-medium text-base-content/70 mb-2 block">Select Style / Tone:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePolish(t.id)}
                disabled={!currentDraft?.trim() || isPolishing}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedTone === t.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-base-300 hover:bg-base-200 text-base-content/80"
                }`}
              >
                <div className="text-xs font-semibold">{t.label}</div>
                <div className="text-[10px] text-base-content/50 truncate">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Polished Result */}
        {isPolishing ? (
          <div className="flex flex-col items-center justify-center p-6 bg-base-200/40 rounded-xl border border-base-300">
            <Loader2 className="size-6 text-primary animate-spin mb-2" />
            <span className="text-xs text-base-content/70">Polishing your message with AI...</span>
          </div>
        ) : polishedResult ? (
          <div className="p-3.5 bg-success/10 border border-success/30 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-success">
              <Check className="size-4" />
              <span>Polished Result ({selectedTone})</span>
            </div>
            <p className="text-sm text-base-content font-medium">{polishedResult}</p>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-base-300">
          <button type="button" onClick={onClose} className="btn btn-sm btn-ghost">
            Cancel
          </button>
          <button
            type="button"
            disabled={!polishedResult}
            onClick={handleApply}
            className="btn btn-sm btn-primary flex items-center gap-1.5"
          >
            <span>Replace In Chat</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiPolishModal;
